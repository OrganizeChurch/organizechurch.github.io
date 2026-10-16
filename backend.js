// OrganizeChurch backend layer, milestone 1: Google/Facebook sign-in, shared churches, private church data.
import{initializeApp}from'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import{getAuth,GoogleAuthProvider,FacebookAuthProvider,signInWithPopup,onAuthStateChanged,signOut}from'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import{getFirestore,collection,doc,getDocs,getDoc,setDoc,addDoc,deleteDoc,query,where}from'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import{firebaseConfig,aiUrl}from'./firebase-config.js';

const app=initializeApp(firebaseConfig),auth=getAuth(app),db=getFirestore(app);
let user=null,timer=null,msg='';
const LOCAL=['photos','pics','welcome','uploads']; // media stays on this device until milestone 2 (Firebase Storage)
const blank=()=>({members:[],att:[],ann:[],lib:[],photos:[],pics:[],welcome:[],uploads:[],prayer:[],chat:[],inbox:[]});

const pubOf=c=>({id:c.id,name:c.name||'',city:c.city||'',about:c.about||'',mission:c.mission||'',times:c.times||'',contact:c.contact||'',give:c.give||'',listed:!!c.listed,ownerUid:user.uid,
  ann:(c.ann||[]).filter(x=>x.pub),lib:(c.lib||[]).filter(x=>x.vis==='public')});
const privOf=c=>({ownerUid:user.uid,members:c.members||[],att:c.att||[],ann:c.ann||[],lib:c.lib||[],prayer:c.prayer||[],chat:c.chat||[]});

async function loadAll(){
  const old=Object.fromEntries(S.churches.map(c=>[c.id,c]));
  const s=await getDocs(collection(db,'churches'));
  S.churches=s.docs.map(d=>{const o={...blank(),...d.data()};LOCAL.forEach(k=>{o[k]=(old[d.id]&&old[d.id][k])||[]});return o});
}
async function loadMine(){
  S.session=null;if(!user)return;
  const q=await getDocs(query(collection(db,'churches'),where('ownerUid','==',user.uid)));
  if(q.empty)return;
  const id=q.docs[0].id;S.session=id;const c=ch(id);
  const p=await getDoc(doc(db,'churches',id,'private','data'));
  if(p.exists())Object.assign(c,p.data());
  const ib=await getDocs(collection(db,'churches',id,'inbox'));
  c.inbox=ib.docs.map(d=>({id:d.id,...d.data()}));
}
async function push(){
  const c=user&&me();if(!c)return;
  try{
    await setDoc(doc(db,'churches',c.id),pubOf(c));
    await setDoc(doc(db,'churches',c.id,'private','data'),privOf(c));
  }catch(e){msg='Could not save: '+e.code;console.error(e)}
}

// Save to Firebase after every local save (debounced).
const _save=window.save;
window.save=function(){_save();clearTimeout(timer);timer=setTimeout(push,700)};

// Real sign-in page replaces the demo one.
window.login=()=>`<div class="card"><h1>Sign in</h1>${user
  ?`<p>Signed in as <b>${esc(user.displayName||user.email||'you')}</b>.</p>${S.session?'<a class="btn" href="#/admin/home">Open my church</a>':'<a class="btn" href="#/register">Register your church</a>'}`
  :`<div class="row"><button data-b="google">Continue with Google</button><button class="sec" data-b="facebook">Continue with Facebook</button></div>`}
<p class="note" role="status">${esc(msg||'Sign in to register or manage your church.')}</p></div>`;

// Normal download link now that the page is on its own hosting.
window.dlUp=async(cid,id)=>{const x=((ch(cid)||{}).uploads||[]).find(u=>u.id===id);if(!x)return;const a=document.createElement('a');a.href=x.data;a.download=x.name;a.click()};

document.addEventListener('click',async e=>{
  const b=e.target.closest('[data-b],[data-a]');if(!b)return;
  if(b.dataset.b){
    try{await signInWithPopup(auth,b.dataset.b==='google'?new GoogleAuthProvider():new FacebookAuthProvider());msg=''}
    catch(x){msg=x.code==='auth/popup-closed-by-user'?'':'Sign-in failed ('+x.code+')';route()}
  }else if(b.dataset.a==='out'){signOut(auth)}
  else if(b.dataset.a==='delmsg'&&user&&S.session){deleteDoc(doc(db,'churches',S.session,'inbox',b.dataset.id)).catch(()=>{})}
},true);

// Visitor messages and support requests go to Firebase instead of this browser.
document.addEventListener('submit',async e=>{
  const f=e.target,t=f.dataset.f;
  if(t==='reg'&&!user){e.preventDefault();e.stopImmediatePropagation();msg='Please sign in first, then register your church.';location.hash='#/login';route();return}
  if(t!=='msg'&&t!=='sup')return;
  e.preventDefault();e.stopImmediatePropagation();
  const d=new FormData(f),body={n:String(d.get('n')||'').slice(0,190),m:String(d.get('m')||'').slice(0,1900),d:today()};
  try{
    await addDoc(t==='msg'?collection(db,'churches',d.get('cid'),'inbox'):collection(db,'support'),body);
    f.outerHTML='<p class="note">Thank you! Your message was sent.</p>';
  }catch(x){f.insertAdjacentHTML('beforeend','<p class="note">Sorry, it could not be sent. Please try again.</p>')}
},true);

onAuthStateChanged(auth,async u=>{
  user=u;
  try{await loadAll();await loadMine()}catch(e){msg='Could not load data ('+(e.code||e.message)+')';console.error(e)}
  route();
});

// Christ-centred AI: asks the Cloudflare Worker (signed-in users only).
window.askAI=async()=>{
  const qEl=document.getElementById('aq'),o=document.getElementById('ao'),q=qEl?qEl.value.trim():'';
  if(!q)return;
  if(!user){o.textContent='Please sign in with Google first (tap Sign in at the top), then ask again.';return}
  o.textContent='Thinking\u2026';
  try{
    const tok=await auth.currentUser.getIdToken();
    const r=await fetch(aiUrl,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+tok},body:JSON.stringify({q})});
    const d=await r.json();
    o.textContent=d.text||d.error||'Sorry, no answer came back.';
  }catch(e){o.textContent='Could not reach the assistant. Please check your internet and try again.'}
};

// Make the website installable like an app.
if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
let dip=null;
addEventListener('beforeinstallprompt',e=>{
  e.preventDefault();dip=e;
  const b=document.createElement('button');
  b.textContent='\ud83d\udcf2 Install app';
  b.style.cssText='position:fixed;bottom:calc(14px + env(safe-area-inset-bottom,0px));right:14px;z-index:9;box-shadow:0 4px 14px rgba(0,0,0,.3)';
  b.onclick=async()=>{dip.prompt();await dip.userChoice;b.remove()};
  document.body.appendChild(b);
});
