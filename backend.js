import{mountStudio,FONT_CSS}from'./studio.js';
import{renderFlyer,SIZES as FLSIZES,THEMES as FLTHEMES,DEFAULTS as FLDEF}from'./flyer-design.js';
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
  welcome:(c.welcome||[]).filter(x=>x.type==='embed'),ann:(c.ann||[]).filter(x=>x.pub),lib:(c.lib||[]).filter(x=>x.vis==='public')});
const privOf=c=>({ownerUid:user.uid,members:c.members||[],att:c.att||[],ann:c.ann||[],lib:c.lib||[],prayer:c.prayer||[],chat:c.chat||[]});

async function loadAll(){
  const old=Object.fromEntries(S.churches.map(c=>[c.id,c]));
  const s=await getDocs(collection(db,'churches'));
  S.churches=s.docs.map(d=>{const o={...blank(),...d.data()};LOCAL.forEach(k=>{o[k]=(old[d.id]&&old[d.id][k])||[]});o.welcome=[...(d.data().welcome||[]),...(((old[d.id]&&old[d.id].welcome)||[]).filter(x=>x.type!=='embed'))];return o});
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
const IN_APP=/FBAN|FBAV|FB_IAB|Instagram|WhatsApp|MicroMessenger|Snapchat|TikTok|BytedanceWebview|Line\/|; wv\)/i.test(navigator.userAgent);
const nice=c=>({
  'auth/popup-blocked':'Your browser blocked the sign-in window. Allow pop-ups for this site, then try again.',
  'auth/network-request-failed':'The internet is weak or off. Please check your connection and try again.',
  'auth/unauthorized-domain':'This web address is not allowed yet. The church owner needs to add it in Firebase.',
  'auth/operation-not-supported-in-this-environment':'This browser cannot sign in here. Please open the link in Chrome (or Safari on iPhone).',
  'auth/web-storage-unsupported':'Please turn on cookies and site data for this browser, or open the link in Chrome.',
  'auth/cancelled-popup-request':'',
  'permission-denied':'The server refused the request. Please sign out, sign in again, and try once more.',
  'unavailable':'Could not reach the server. Please check your internet and try again.'
}[c]);
window.login=()=>`<div class="card"><h1>Sign in</h1>${IN_APP&&!user?'<p class="note" role="alert"><b>Important:</b> you opened this inside another app (such as WhatsApp or Facebook). Google does not allow sign-in there. Tap the <b>\u22ee</b> or <b>Share</b> button at the top and choose <b>Open in Chrome</b> (or Safari), then sign in.</p>':''}${user
  ?`<p>Signed in as <b>${esc(user.displayName||user.email||'you')}</b>.</p>${S.session?'<a class="btn" href="#/admin/home">Open my church</a>':'<a class="btn" href="#/register">Register your church</a>'}`
  :`<div class="row"><button data-b="google">Continue with Google</button><button class="sec" data-b="facebook">Continue with Facebook</button></div>`}
<p class="note" role="status">${esc(msg||'Sign in to register or manage your church.')}</p></div>`;

// Normal download link now that the page is on its own hosting.
window.dlUp=async(cid,id)=>{const x=((ch(cid)||{}).uploads||[]).find(u=>u.id===id);if(!x)return;const a=document.createElement('a');a.href=x.data;a.download=x.name;a.click()};

document.addEventListener('click',async e=>{
  const b=e.target.closest('[data-b],[data-a]');if(!b)return;
  if(b.dataset.b){
    try{await signInWithPopup(auth,b.dataset.b==='google'?new GoogleAuthProvider():new FacebookAuthProvider());msg=''}
    catch(x){const n=nice(x.code);msg=x.code==='auth/popup-closed-by-user'?'':(n!==undefined?n:'Sign-in failed')+(n===''?'':' ['+x.code+']');route()}
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
  try{await loadAll();await loadMine()}catch(e){msg=(nice(e.code)||'Could not load data')+' ['+(e.code||e.message)+']';console.error(e)}
  route();
});

// ---------- Christ-centred AI (signed-in users), with saved history ----------
const hKey=()=>'oc_hist_'+(user?user.uid:'guest');
const hGet=()=>{try{return JSON.parse(localStorage.getItem(hKey())||'[]')}catch(e){return[]}};
const hSet=a=>{try{localStorage.setItem(hKey(),JSON.stringify(a.slice(0,30)))}catch(e){}};
const esc2=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const IDEAS=[['\ud83c\udfa4 Full sermon','Write a full, powerful sermon on: '],['\ud83d\udcdd Sermon outline','Give me a clear sermon outline with three points on: '],['\u2600\ufe0f Devotional','Write a short morning devotional on: '],['\ud83d\ude4f Prayer','Write a heartfelt prayer for: '],['\ud83d\udce3 Announcement','Write a lively church announcement for: '],['\ud83e\uddd2 Kids story','Tell a fun Bible story for children about: ']];
function histRender(){
  const h=document.getElementById('ai-h');if(!h)return;
  const a=hGet();
  h.innerHTML='<h2>\ud83d\udd58 Your recent questions</h2>'+(a.length
    ?a.map((x,i)=>`<div class="item"><button class="sec sm" data-hi="${i}">\u21a9\ufe0f Open</button> <b>${esc2(x.q.slice(0,80))}</b><div class="mut">${esc2(x.t)}</div></div>`).join('')+'<p><button class="sec sm" id="ai-hc">Clear history</button></p>'
    :'<p class="mut">Your questions and answers are saved here on this phone, so you can come back to them any time.</p>');
}
function aiExtras(){
  const q=document.getElementById('aq'),o=document.getElementById('ao');
  if(!q||!o||document.getElementById('ai-h'))return;
  const lab=q.previousElementSibling,card=o.closest('.card');
  if(lab)lab.insertAdjacentHTML('beforebegin','<p class="row" id="ai-ideas">'+IDEAS.map((x,i)=>`<button class="sec sm" data-idea="${i}">${x[0]}</button>`).join('')+'</p>');
  card.insertAdjacentHTML('afterend','<div class="card" id="ai-h"></div>');
  histRender();
}
document.addEventListener('click',e=>{
  const b=e.target.closest&&e.target.closest('[data-idea],[data-hi],#ai-hc');if(!b)return;
  const q=document.getElementById('aq'),o=document.getElementById('ao');
  if(b.dataset.idea!==undefined){q.value=IDEAS[+b.dataset.idea][1];q.focus();q.setSelectionRange(q.value.length,q.value.length)}
  else if(b.dataset.hi!==undefined){const x=hGet()[+b.dataset.hi];if(x){q.value=x.q;o.textContent=x.a;window.scrollTo({top:0,behavior:'smooth'})}}
  else if(b.id==='ai-hc'){hSet([]);histRender()}
});
window.askAI=async()=>{
  const qEl=document.getElementById('aq'),o=document.getElementById('ao'),q=qEl?qEl.value.trim():'';
  if(!q)return;
  if(!user){o.textContent='Please sign in with Google first (tap Sign in at the top), then ask again.';return}
  o.textContent='Thinking\u2026 \u2728';
  try{
    const tok=await auth.currentUser.getIdToken();
    const r=await fetch(aiUrl,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+tok},body:JSON.stringify({q})});
    const d=await r.json();
    const ans=(d.text||d.error||'Sorry, no answer came back.').replace(/\*\*/g,'').replace(/^#+\s*/gm,'');
    o.textContent=ans;
    if(d.text){const a=hGet();a.unshift({q,a:ans,t:new Date().toLocaleString()});hSet(a);histRender()}
  }catch(e){o.textContent='Could not reach the assistant. Please check your internet and try again.'}
};

// ---------- Flyer designer: professional church flyers, saved at 2x resolution ----------
const FLK=['size','theme','photoShape','org','invite','title','sub','theme_','scripture','date','venue','time','guest','role','closing','contact'];
let FL={...FLDEF};
try{const sv=JSON.parse(localStorage.getItem('oc_fl')||'null');if(sv)FL={...FL,...sv}}catch(e){}
const FLI={photo:null,logo1:null,logo2:null,bg:null};
(function(){
  if(document.getElementById('fl-fonts'))return;
  const l=document.createElement('link');l.id='fl-fonts';l.rel='stylesheet';
  l.href=FONT_CSS;
  document.head.appendChild(l);
})();
function flFonts(){
  if(!document.fonts||!document.fonts.load)return Promise.resolve();
  return Promise.all(['900 40px Cinzel','700 40px Cinzel','40px "Great Vibes"','700 20px Montserrat','800 20px Montserrat'].map(f=>document.fonts.load(f,'ABC abc 123'))).catch(()=>{});
}
function flDraw(){
  const c=document.getElementById('fl-c');if(!c)return;
  const dims=FLSIZES[FL.size]||FLSIZES.Portrait;
  if(c.width!==dims[0]*2||c.height!==dims[1]*2){c.width=dims[0]*2;c.height=dims[1]*2}
  const x=c.getContext('2d');x.setTransform(2,0,0,2,0,0);x.imageSmoothingEnabled=true;x.imageSmoothingQuality='high';
  try{renderFlyer(x,FL,FLI)}catch(e){console.error(e)}
  try{const o={};FLK.forEach(k=>o[k]=FL[k]);localStorage.setItem('oc_fl',JSON.stringify(o))}catch(e){}
}
function classicPage(){
  const app=document.getElementById('fl-body');if(!app)return;
  const fld=(k,lab,ph,area)=>`<label for="fl-${k}">${lab}</label>`+(area?`<textarea id="fl-${k}" rows="${area}" placeholder="${ph||''}"></textarea>`:`<input id="fl-${k}" placeholder="${ph||''}">`);
  const sel=(k,lab,opts)=>`<label for="fl-${k}">${lab}</label><select id="fl-${k}">${opts.map(o=>`<option>${o}</option>`).join('')}</select>`;
  app.innerHTML=`<div class="card"><h1>📜 Formal invitation</h1><p class="mut">Type your details and the flyer designs itself. Add your photo and logos, pick a colour style, then download.</p>
<details open><summary><b>1. Style</b></summary>${sel('size','Shape',Object.keys(FLSIZES))}${sel('theme','Colour style',Object.keys(FLTHEMES))}${sel('photoShape','Photo frame',['Arch','Rounded','Circle','None'])}</details>
<details open><summary><b>2. Top of flyer</b></summary>${fld('org','Organisation lines (one per line)','',4)}${fld('invite','Invitation line (script)','e.g. Joyfully Invites You to')}</details>
<details open><summary><b>3. Main title</b></summary>${fld('title','Big title','e.g. 10th Annual Conference')}${fld('sub','Small word under title (optional)','e.g. CONFERENCE')}${fld('theme_','Theme (optional)','')}${fld('scripture','Bible reference (optional)','e.g. Genesis 6:22')}</details>
<details open><summary><b>4. Date, venue and time</b></summary>${fld('date','Date','')}${fld('venue','Venue','')}${fld('time','Time','')}${fld('contact','Phone or contact (optional)','')}</details>
<details open><summary><b>5. Guest or speaker</b></summary>${fld('guest','Name','')}${fld('role','Title lines (one per line)','',2)}${fld('closing','Closing line (script)','')}</details>
<details open><summary><b>6. Pictures</b></summary>
<label for="fl-pf">Photo of guest or speaker</label><input id="fl-pf" type="file" accept="image/*">
<label for="fl-l1">Logo (left)</label><input id="fl-l1" type="file" accept="image/*">
<label for="fl-l2">Logo (right, optional)</label><input id="fl-l2" type="file" accept="image/*">
<label for="fl-bf">Background picture (optional)</label><input id="fl-bf" type="file" accept="image/*">
<label for="fl-ai">Or describe AI background art</label><input id="fl-ai" placeholder="e.g. soft golden light over a church, peaceful">
<p class="row"><button id="fl-art">✨ Make AI background</button><button class="sec sm" id="fl-clr">Remove pictures</button><button class="sec sm" id="fl-blank">Clear all text</button></p></details>
<p class="row"><button id="fl-dl">⬇️ Download flyer (PNG)</button><button class="sec" id="fl-sh">📤 Share</button></p>
<p id="fl-note" class="mut" role="status">Saved at double size, sharp for WhatsApp, social media and printing.</p>
<canvas id="fl-c" style="width:100%;height:auto;border-radius:12px;box-shadow:0 4px 14px rgba(0,0,0,.25)"></canvas></div>`;
  FLK.forEach(k=>{const e=document.getElementById('fl-'+k);if(e)e.value=FL[k]||''});
  flDraw();flFonts().then(flDraw);
}
let FLTAB='studio';
async function makeArt(prompt){
  if(!auth.currentUser)throw new Error('Please sign in with Google first (tap Sign in at the top) to make AI art.');
  const tok=await auth.currentUser.getIdToken();
  const r=await fetch(aiUrl+'/image',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+tok},body:JSON.stringify({prompt})});
  const d=await r.json();
  if(!d.image)throw new Error(d.error||'The art maker could not draw right now.');
  return d.image;
}
function flyerPage(){
  const app=document.getElementById('app');if(!app)return;
  app.innerHTML=`<div class="row" style="margin-bottom:8px"><button id="fl-tab-s" class="${FLTAB==='studio'?'':'sec'}">\ud83c\udfa8 Creative Studio</button><button id="fl-tab-c" class="${FLTAB==='classic'?'':'sec'}">\ud83d\udcdc Formal invitation</button></div><div id="fl-body"></div>`;
  if(FLTAB==='studio')mountStudio(document.getElementById('fl-body'),{makeImage:makeArt});else classicPage();
}
document.addEventListener('click',e=>{
  const id=e.target&&e.target.id;
  if(id==='fl-tab-s'||id==='fl-tab-c'){FLTAB=id==='fl-tab-s'?'studio':'classic';flyerPage()}
});
function flLoad(file,cb){const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>cb(im);im.src=r.result};r.readAsDataURL(file)}
document.addEventListener('input',e=>{const id=e.target&&e.target.id;if(id&&id.startsWith('fl-')&&FLK.includes(id.slice(3))){FL[id.slice(3)]=e.target.value;flDraw()}});
document.addEventListener('change',e=>{
  const id=e.target&&e.target.id;
  if(id&&id.startsWith('fl-')&&FLK.includes(id.slice(3))){FL[id.slice(3)]=e.target.value;flDraw();return}
  const map={'fl-pf':'photo','fl-l1':'logo1','fl-l2':'logo2','fl-bf':'bg'};
  if(map[id]&&e.target.files&&e.target.files[0])flLoad(e.target.files[0],im=>{FLI[map[id]]=im;flDraw()});
});
document.addEventListener('click',async e=>{
  const id=e.target&&e.target.id,note=document.getElementById('fl-note');
  if(id==='fl-clr'){FLI.photo=FLI.logo1=FLI.logo2=FLI.bg=null;flDraw()}
  else if(id==='fl-blank'){FLK.forEach(k=>{if(k!=='size'&&k!=='theme'&&k!=='photoShape'){FL[k]='';const el=document.getElementById('fl-'+k);if(el)el.value=''}});flDraw()}
  else if(id==='fl-dl'){
    document.getElementById('fl-c').toBlob(bl=>{const a=document.createElement('a');a.href=URL.createObjectURL(bl);a.download='flyer.png';a.click();if(note)note.textContent='Saved to your Downloads ✅'},'image/png');
  }else if(id==='fl-sh'){
    document.getElementById('fl-c').toBlob(async bl=>{
      const f=new File([bl],'flyer.png',{type:'image/png'});
      try{if(navigator.canShare&&navigator.canShare({files:[f]}))await navigator.share({files:[f],title:'Flyer'});else if(note)note.textContent='Sharing is not available here. Use Download instead.'}catch(x){}
    },'image/png');
  }else if(id==='fl-art'){
    if(!auth.currentUser){note.textContent='Please sign in with Google first (tap Sign in at the top) to make AI art.';return}
    note.textContent='Painting your background… this can take about 15 seconds ✨';
    try{
      const tok=await auth.currentUser.getIdToken();
      const r=await fetch(aiUrl+'/image',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+tok},body:JSON.stringify({prompt:(document.getElementById('fl-ai').value||FL.title||'church worship light')+', soft, elegant, no text'})});
      const d=await r.json();
      if(!d.image){note.textContent=d.error||'The art maker could not draw right now.';return}
      const im=new Image();im.onload=()=>{FLI.bg=im;flDraw();note.textContent='Background added!'};im.src=d.image;
    }catch(x){note.textContent='Could not reach the art maker. Check your internet and try again.'}
  }
});
const _hdr=window.header;
window.header=function(){_hdr();const h=document.getElementById('hd');if(h&&!h.querySelector('[data-fl]'))h.insertAdjacentHTML('beforeend','<a class="btn sec sm" data-fl href="#/flyer">\ud83c\udfa8 Flyer</a>')};
const _rt=window.route;
const after=()=>{if(location.hash.startsWith('#/flyer'))flyerPage();else if(location.hash.startsWith('#/ai'))aiExtras()};
window.route=function(){_rt();after()};
addEventListener('hashchange',()=>setTimeout(after,0));

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
