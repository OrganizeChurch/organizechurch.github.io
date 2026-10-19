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

// ---------- Flyer maker: your own photo and logo, or AI artwork; saved at 2160 x 2700 ----------
const FL={t:'Sunday Service',d:'Sunday \u2022 9:00 AM',p:'',m:'You are welcome! Come as you are.',s:'Blue',a:'',o:'40'};
let FLIMG=null,FLLOGO=null;
const THEMES={Blue:['#1D4ED8','#38BDF8','#FFFFFF','#FDE68A'],Gold:['#92400E','#F59E0B','#FFFFFF','#FEF3C7'],Green:['#065F46','#10B981','#FFFFFF','#D1FAE5'],Purple:['#5B21B6','#A78BFA','#FFFFFF','#EDE9FE']};
function flWrap(x,t,px,py,maxW,lh){
  const words=String(t).split(/\s+/);let line='';
  for(const w of words){const test=line+w+' ';if(x.measureText(test).width>maxW&&line){x.fillText(line.trim(),px,py);line=w+' ';py+=lh}else line=test}
  x.fillText(line.trim(),px,py);return py+lh;
}
function flDraw(){
  const c=document.getElementById('fl-c');if(!c)return;
  const x=c.getContext('2d'),W=1080,H=1350,T=THEMES[FL.s]||THEMES.Blue;
  x.setTransform(2,0,0,2,0,0);x.imageSmoothingEnabled=true;x.imageSmoothingQuality='high';x.shadowBlur=0;
  const g=x.createLinearGradient(0,0,W,H);g.addColorStop(0,T[0]);g.addColorStop(1,T[1]);x.fillStyle=g;x.fillRect(0,0,W,H);
  if(FLIMG){
    const k=Math.max(W/FLIMG.width,H/FLIMG.height),w=FLIMG.width*k,h=FLIMG.height*k;
    x.drawImage(FLIMG,(W-w)/2,(H-h)/2,w,h);x.fillStyle='rgba(0,0,0,'+(Number(FL.o)/100)+')';x.fillRect(0,0,W,H);
  }else{
    x.fillStyle='rgba(255,255,255,.12)';x.beginPath();x.arc(W-120,160,220,0,7);x.fill();x.beginPath();x.arc(90,H-140,260,0,7);x.fill();
  }
  let cy=120;
  if(FLLOGO){const mw=Math.min(520,FLLOGO.width*170/FLLOGO.height),hh=mw*FLLOGO.height/FLLOGO.width;x.drawImage(FLLOGO,(W-mw)/2,50,mw,hh);cy=50+hh+70}
  x.textAlign='center';x.shadowColor='rgba(0,0,0,.4)';x.shadowBlur=14;
  let church='';try{church=(me()&&me().name)||''}catch(e){}
  x.fillStyle=T[3];x.font='700 44px system-ui,sans-serif';x.fillText((church||'YOUR CHURCH').toUpperCase(),W/2,cy);
  x.fillStyle=T[2];x.font='900 112px system-ui,sans-serif';
  let y=flWrap(x,FL.t||'Your event',W/2,Math.max(430,cy+250),W-160,130);
  x.fillStyle=T[3];x.font='700 58px system-ui,sans-serif';y=flWrap(x,FL.d||'',W/2,y+40,W-160,72);
  if(FL.p){x.fillStyle=T[2];x.font='600 50px system-ui,sans-serif';y=flWrap(x,'\ud83d\udccd '+FL.p,W/2,y+10,W-160,64)}
  if(FL.m){x.fillStyle=T[2];x.font='italic 500 46px system-ui,sans-serif';flWrap(x,FL.m,W/2,Math.max(y+50,1000),W-200,60)}
  x.shadowBlur=0;x.fillStyle='rgba(255,255,255,.8)';x.font='500 30px system-ui,sans-serif';x.fillText('Made with OrganizeChurch',W/2,H-50);
}
function flyerPage(){
  const app=document.getElementById('app');if(!app)return;
  app.innerHTML=`<div class="card"><h1>\ud83c\udfa8 Flyer maker</h1><p class="mut">Add your own photo or logo, type your details, then download a high-quality flyer.</p>
<label for="fl-t">Event title</label><input id="fl-t"><label for="fl-d">Date and time</label><input id="fl-d"><label for="fl-p">Place</label><input id="fl-p"><label for="fl-m">Short message</label><textarea id="fl-m" rows="2"></textarea>
<label for="fl-s">Colour style</label><select id="fl-s">${Object.keys(THEMES).map(k=>`<option>${k}</option>`).join('')}</select>
<label for="fl-bg">Your photo (background)</label><input id="fl-bg" type="file" accept="image/*">
<label for="fl-logo">Your logo (optional)</label><input id="fl-logo" type="file" accept="image/*">
<label for="fl-o">Darken the photo so words are easy to read</label><input id="fl-o" type="range" min="0" max="70">
<label for="fl-a">Or describe AI artwork (optional)</label><input id="fl-a" placeholder="e.g. golden sunrise over hills, joyful worship">
<p class="row"><button id="fl-art">\u2728 Make AI artwork</button><button class="sec sm" id="fl-clr">Remove photo</button><button class="sec sm" id="fl-clrl">Remove logo</button></p>
<p class="row"><button id="fl-dl">\u2b07\ufe0f Download flyer (PNG)</button></p>
<p id="fl-note" class="mut" role="status">Your flyer is saved at 2160 \u00d7 2700 pixels, good for printing and sharing.</p>
<canvas id="fl-c" width="2160" height="2700" style="width:100%;border-radius:14px;box-shadow:0 4px 14px rgba(0,0,0,.25)"></canvas></div>`;
  for(const k of ['t','d','p','m','s','a','o']){const e=document.getElementById('fl-'+k);if(e)e.value=FL[k]}
  flDraw();
}
function flLoad(file,cb){const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>cb(im);im.src=r.result};r.readAsDataURL(file)}
document.addEventListener('input',e=>{const id=e.target&&e.target.id;if(id&&id.startsWith('fl-')&&id.length===4){FL[id.slice(3)]=e.target.value;flDraw()}});
document.addEventListener('change',e=>{
  const id=e.target&&e.target.id;
  if((id==='fl-bg'||id==='fl-logo')&&e.target.files&&e.target.files[0])flLoad(e.target.files[0],im=>{if(id==='fl-bg')FLIMG=im;else FLLOGO=im;flDraw()});
});
document.addEventListener('click',async e=>{
  const id=e.target&&e.target.id,note=document.getElementById('fl-note');
  if(id==='fl-clr'){FLIMG=null;flDraw()}
  else if(id==='fl-clrl'){FLLOGO=null;flDraw()}
  else if(id==='fl-dl'){
    document.getElementById('fl-c').toBlob(bl=>{const a=document.createElement('a');a.href=URL.createObjectURL(bl);a.download='flyer.png';a.click()},'image/png');
  }else if(id==='fl-art'){
    if(!user){note.textContent='Please sign in with Google first (tap Sign in at the top) to make AI artwork.';return}
    note.textContent='Painting your artwork\u2026 this can take about 15 seconds \u2728';
    try{
      const tok=await auth.currentUser.getIdToken();
      const r=await fetch(aiUrl+'/image',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+tok},body:JSON.stringify({prompt:FL.a||FL.t})});
      const d=await r.json();
      if(!d.image){note.textContent=d.error||'The artwork maker could not draw right now.';return}
      const im=new Image();im.onload=()=>{FLIMG=im;flDraw();note.textContent='Artwork added! Change the text or tap Download.'};im.src=d.image;
    }catch(x){note.textContent='Could not reach the artwork maker. Check your internet and try again.'}
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
