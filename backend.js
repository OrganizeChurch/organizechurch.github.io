import{mountStudio,FONT_CSS}from'./studio.js';
import{renderFlyer,SIZES as FLSIZES,THEMES as FLTHEMES,DEFAULTS as FLDEF}from'./flyer-design.js';
// OrganizeChurch backend layer, milestone 1: Google/Facebook sign-in, shared churches, private church data.
import{initializeApp}from'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import{getAuth,GoogleAuthProvider,FacebookAuthProvider,signInWithPopup,signInWithRedirect,getRedirectResult,onAuthStateChanged,signOut}from'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import{getFirestore,collection,doc,getDocs,getDoc,setDoc,addDoc,deleteDoc,query,where,increment}from'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import{firebaseConfig,aiUrl}from'./firebase-config.js';

const app=initializeApp(firebaseConfig),auth=getAuth(app),db=getFirestore(app);
let user=null,timer=null,msg='';
const LOCAL=['photos','pics','welcome','uploads'];
const CELSYNC={};
 // church id -> {docId: json} last synced celebrants
const CELSEEN=new Set();
const blank=()=>({members:[],att:[],ann:[],lib:[],photos:[],pics:[],welcome:[],uploads:[],prayer:[],chat:[],inbox:[],cel:[]});

const pubOf=c=>({id:c.id,name:c.name||'',city:c.city||'',about:c.about||'',mission:c.mission||'',times:c.times||'',contact:c.contact||'',give:c.give||'',listed:!!c.listed,ownerUid:user.uid,wa:String(c.wa||'').slice(0,40),waShow:!!c.waShow,
  welcome:(c.welcome||[]).filter(x=>x.type==='embed'),ann:(c.ann||[]).filter(x=>x.pub),lib:(c.lib||[]).filter(x=>x.vis==='public')});
const privOf=c=>({ownerUid:user.uid,members:c.members||[],att:c.att||[],ann:c.ann||[],lib:c.lib||[],prayer:c.prayer||[],chat:c.chat||[],
  uploads:(c.uploads||[]).filter(x=>x.vis!=='public'&&isOurs(x.data))}); // members-only files: link kept private

async function loadAll(){
  const old=Object.fromEntries(S.churches.map(c=>[c.id,c]));
  const s=await getDocs(collection(db,'churches'));
  S.churches=s.docs.map(d=>{const o={...blank(),...d.data()};LOCAL.forEach(k=>{o[k]=(old[d.id]&&old[d.id][k])||[]});o.cel=(old[d.id]&&old[d.id].cel)||[];o.welcome=[...(d.data().welcome||[]),...(((old[d.id]&&old[d.id].welcome)||[]).filter(x=>x.type!=='embed'))];return o});
}
// ---------- Photos and files: stored on Cloudflare (MEDIA), listed in the church's "celebrants" folder ----------
// Each kind of list gets its own label, so one Firebase rule covers them all.
const MK={welcome:['wel','w_'],photos:['photo','ph_'],pics:['pic','pi_'],uploads:['up','up_']};
const MSYNC={}; // church id -> {field: {docId: signature}}
const URLSEEN={}; // church id -> Set of stored file links (to clean up removed files)
const bodyOf=x=>x.src||x.data||'';
const sig=x=>{const{src,data,_s,...r}=x;const b=bodyOf(x);return JSON.stringify(r)+'|'+b.length+'|'+b.slice(-40)};
const isPublicItem=(f,x)=>f!=='uploads'||x.vis==='public';
const celJson=x=>{const{_s,...r}=x;return JSON.stringify(r)};
async function loadCel(id){
  const g=await getDocs(collection(db,'churches',id,'celebrants'));
  const c=ch(id);if(!c)return;
  const all=g.docs.map(d=>({id:d.id,...d.data()}));
  // _s marks an item that has been saved online before; a saved item missing online was deleted on another phone
  const srvCel=all.filter(x=>!x.kind).map(x=>({...x,_s:1})),cids=new Set(srvCel.map(x=>x.id));
  c.cel=[...srvCel,...(S.session===id?(c.cel||[]).filter(x=>!cids.has(x.id)&&!x._s):[])];
  CELSYNC[id]=Object.fromEntries(srvCel.map(x=>[x.id,celJson(x)]));
  const M=MSYNC[id]={};
  for(const f in MK){const[k,pre]=MK[f];
    const got=all.filter(x=>x.kind===k).sort((a,b)=>(a.o||0)-(b.o||0)).map(x=>{const{kind,o,id:did,...r}=x;const it={...r,id:did.slice(pre.length),_s:1};if(f==='welcome'&&!it.type)it.type='image';return it});
    M[f]=Object.fromEntries(got.map(x=>[x.id,sig(x)]));
    const ids=new Set(got.map(x=>x.id)),mine=S.session===id;
    const old=c[f]||[];
    const keepLocal=old.filter(x=>(f==='welcome'&&x.type==='embed')||(mine&&!ids.has(x.id)&&!x._s));
    if(f==='welcome')c.welcome=[...keepLocal.filter(x=>x.type==='embed'),...got,...keepLocal.filter(x=>x.type!=='embed')];
    else c[f]=[...got,...keepLocal.filter(x=>!(f==='uploads'&&ids.has(x.id)))];
  }
}
async function pushCel(c){
  const prev=CELSYNC[c.id]||{}; // if never loaded, only add/update (never delete blindly)
  const now=Object.fromEntries((c.cel||[]).map(x=>[x.id,celJson(x)]));
  for(const x of (c.cel||[])){const k=x.id;if(prev[k]===now[k]){x._s=1;continue}const{id,...rest}=JSON.parse(now[k]);try{await setDoc(doc(db,'churches',c.id,'celebrants',k),rest);x._s=1}catch(e){delete now[k];console.error(e)}}
  for(const k in prev)if(!(k in now))try{await deleteDoc(doc(db,'churches',c.id,'celebrants',k))}catch(e){console.error(e)}
  CELSYNC[c.id]=now;
}
async function pushMedia(c){
  const M=MSYNC[c.id]; // not loaded yet: only add, never delete
  for(const f in MK){const[k,pre]=MK[f],prev=M&&M[f];
    const list=(c[f]||[]).filter(x=>bodyOf(x)&&!(f==='welcome'&&x.type==='embed')&&isPublicItem(f,x));
    const now={};list.forEach(x=>now[x.id]=sig(x));
    for(let i=0;i<list.length;i++){const x=list[i];if(prev&&prev[x.id]===now[x.id]){x._s=1;continue}
      const{id,_s,...r}=x,rec={...r,kind:k,o:i};
      if(JSON.stringify(rec).length>900000){delete now[x.id];continue} // too big for the database: stays on this phone until photo storage is on
      try{await setDoc(doc(db,'churches',c.id,'celebrants',pre+id),rec);x._s=1}catch(e){delete now[x.id];console.error(e)}}
    if(prev)for(const id in prev)if(!(id in now))try{await deleteDoc(doc(db,'churches',c.id,'celebrants',pre+id))}catch(e){console.error(e)}
    if(M)M[f]=now;
  }
}
// ---------- Upload to Cloudflare photo storage (falls back to the old way if it is not switched on) ----------
const MEDIA={on:null};
fetch(aiUrl,{cache:'no-store'}).then(r=>r.json()).then(d=>{MEDIA.on=!!d.media}).catch(()=>{MEDIA.on=false});
const isOurs=u=>typeof u==='string'&&u.startsWith(aiUrl.replace(/\/$/,'')+'/m/');
async function putMedia(blobOrDataUrl){
  if(!user||MEDIA.on===false)return null;
  let blob=blobOrDataUrl;
  if(typeof blob==='string'){if(!blob.startsWith('data:'))return null;blob=await (await fetch(blob)).blob()}
  try{
    const tok=await auth.currentUser.getIdToken();
    const r=await fetch(aiUrl.replace(/\/$/,'')+'/media',{method:'POST',headers:{'Content-Type':blob.type||'application/octet-stream','Authorization':'Bearer '+tok},body:blob});
    const d=await r.json().catch(()=>({}));
    if(d.nomedia){MEDIA.on=false;return null}
    if(r.ok&&d.url){MEDIA.on=true;return d.url}
  }catch(e){console.error(e)}
  return null;
}
window.ocMedia={put:putMedia,ready:()=>MEDIA.on};
function allUrls(c){const u=new Set(),add=v=>{if(isOurs(v))u.add(v)};
  ['welcome','photos','pics'].forEach(f=>(c[f]||[]).forEach(x=>add(x.src)));(c.uploads||[]).forEach(x=>add(x.data));
  (c.cel||[]).forEach(x=>{add(x.src);(x.pics||[]).forEach(p=>add(p.src))});return u}
async function cleanMedia(c){
  const now=allUrls(c),before=URLSEEN[c.id];URLSEEN[c.id]=now;if(!before||!user)return;
  const gone=[...before].filter(u=>!now.has(u));if(!gone.length)return;
  try{const tok=await auth.currentUser.getIdToken();await fetch(aiUrl.replace(/\/$/,'')+'/media/delete',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+tok},body:JSON.stringify({urls:gone})})}catch(e){console.error(e)}
}
// Move photos saved the old way (inside the database) to photo storage, a few at a time.
async function migrate(c){
  if(MEDIA.on!==true)return false;let n=0,changed=false;const cap=25;
  const fix=async(o,key)=>{if(n>=cap||typeof o[key]!=='string'||!o[key].startsWith('data:'))return;n++;const u=await putMedia(o[key]);if(u){o[key]=u;changed=true}};
  for(const f of ['welcome','photos','pics'])for(const x of (c[f]||[]))await fix(x,'src');
  for(const x of (c.uploads||[]))await fix(x,'data');
  for(const x of (c.cel||[])){for(const p of (x.pics||[]))await fix(p,'src');if(x.pics&&x.pics.length)x.src=x.pics[0].src;else await fix(x,'src')}
  return changed;
}
// ---------- Love counts for welcome and celebrant photos (shared by everyone) ----------
const LOVESEEN=new Set();
async function loadLoves(id){
  const g=await getDocs(collection(db,'churches',id,'loves'));
  window.LOVES[id]=Object.fromEntries(g.docs.map(d=>[d.id,d.data().n||0]));
}
document.addEventListener('click',async e=>{
  const b=e.target.closest&&e.target.closest('[data-love]');if(!b)return;
  e.preventDefault();e.stopPropagation();
  const cid=b.dataset.cid,pid=b.dataset.love,key=cid+'/'+pid;
  let set;try{set=new Set(JSON.parse(localStorage.getItem('oc_loved')||'[]'))}catch(x){set=new Set()}
  const on=!set.has(key),L=(window.LOVES[cid]=window.LOVES[cid]||{});
  const show=()=>document.querySelectorAll(`[data-love="${pid}"][data-cid="${cid}"]`).forEach(x=>{x.classList.toggle('on',set.has(key));x.setAttribute('aria-pressed',set.has(key));x.innerHTML=(set.has(key)?'\u2764\ufe0f':'\ud83e\udd0d')+' <span>'+(L[pid]||0)+'</span>'});
  if(on)set.add(key);else set.delete(key);
  L[pid]=Math.max(0,(L[pid]||0)+(on?1:-1));show();
  try{localStorage.setItem('oc_loved',JSON.stringify([...set].slice(-3000)))}catch(x){}
  try{await setDoc(doc(db,'churches',cid,'loves',pid),{n:increment(on?1:-1)},{merge:true})}
  catch(x){ // undo if the server refused
    if(on)set.delete(key);else set.add(key);L[pid]=Math.max(0,(L[pid]||0)+(on?-1:1));show();
    try{localStorage.setItem('oc_loved',JSON.stringify([...set]))}catch(y){}
    console.error(x)}
},true);
async function loadMine(){
  S.session=null;if(!user)return;
  const q=await getDocs(query(collection(db,'churches'),where('ownerUid','==',user.uid)));
  if(q.empty)return;
  const id=q.docs[0].id;S.session=id;const c=ch(id);
  const p=await getDoc(doc(db,'churches',id,'private','data'));
  if(p.exists()){const pd=p.data(),pubUp=(c.uploads||[]).filter(x=>x.vis==='public'||!isOurs(x.data));Object.assign(c,pd);c.uploads=[...pubUp,...((pd.uploads||[]).filter(x=>!pubUp.some(y=>y.id===x.id)))]}
  const ib=await getDocs(collection(db,'churches',id,'inbox'));
  c.inbox=ib.docs.map(d=>({id:d.id,...d.data()}));
  try{await loadCel(id);CELSEEN.add(id)}catch(e){console.error(e)}
  URLSEEN[id]=allUrls(c);
  // wait briefly for the photo-storage check, then tidy up old-style photos and save
  for(let t=0;t<20&&MEDIA.on===null;t++)await new Promise(r=>setTimeout(r,150));
  try{if(await migrate(c))_save()}catch(e){console.error(e)}
  push();
  try{await loadLoves(id);LOVESEEN.add(id)}catch(e){console.error(e)}
}
async function push(){
  const c=user&&me();if(!c)return;
  try{
    await setDoc(doc(db,'churches',c.id),pubOf(c));
    await setDoc(doc(db,'churches',c.id,'private','data'),privOf(c));
    await pushCel(c);
    await pushMedia(c);
    cleanMedia(c);
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
  :`<div class="row"><button data-b="google">Continue with Google</button></div>`}
<p class="note" role="status">${esc(msg||'Sign in to register or manage your church.')}</p></div>`;

// Normal download link now that the page is on its own hosting.
window.dlUp=async(cid,id)=>{const x=((ch(cid)||{}).uploads||[]).find(u=>u.id===id);if(!x)return;let href=x.data,tmp=false;
  if(/^https?:/.test(href)){try{href=URL.createObjectURL(await (await fetch(href)).blob());tmp=true}catch(e){window.open(x.data,'_blank','noopener');return}}
  const a=document.createElement('a');a.href=href;a.download=x.name;document.body.appendChild(a);a.click();a.remove();if(tmp)setTimeout(()=>URL.revokeObjectURL(href),30000)};

document.addEventListener('click',async e=>{
  const b=e.target.closest('[data-b],[data-a]');if(!b)return;
  if(b.dataset.b){
    const prov=b.dataset.b==='google'?new GoogleAuthProvider():new FacebookAuthProvider();
    try{await signInWithPopup(auth,prov);msg=''}
    catch(x){
      // Popup blocked or not supported on this phone/browser: switch to full-page sign-in instead
      if(['auth/popup-blocked','auth/operation-not-supported-in-this-environment','auth/web-storage-unsupported'].includes(x.code)){
        try{msg='Opening Google sign-in…';route();await signInWithRedirect(auth,prov);return}catch(y){x=y}
      }
      const n=nice(x.code);msg=x.code==='auth/popup-closed-by-user'?'':(n!==undefined?n:'Sign-in failed')+(n===''?'':' ['+x.code+']');route()}
  }else if(b.dataset.a==='out'){signOut(auth)}
  else if(b.dataset.a==='delmsg'&&user&&S.session){deleteDoc(doc(db,'churches',S.session,'inbox',b.dataset.id)).catch(()=>{})}
},true);

getRedirectResult(auth).catch(x=>{if(x&&x.code){msg=(nice(x.code)||'Sign-in failed')+' ['+x.code+']';try{route()}catch(e){}}});

// Visitor messages and support requests go to Firebase instead of this browser.
document.addEventListener('submit',async e=>{
  const f=e.target,t=f.dataset.f;
  if(t==='reg'&&!user){e.preventDefault();e.stopImmediatePropagation();msg='Please sign in first, then register your church.';location.hash='#/login';route();return}
  if(t!=='msg'&&t!=='sup')return;
  e.preventDefault();e.stopImmediatePropagation();
  const d=new FormData(f),pr=t==='msg'&&d.get('k')==='prayer',body={n:(String(d.get('n')||'').trim()||(pr?'Anonymous':'A visitor')).slice(0,190),m:((pr?'\ud83d\ude4f Prayer request\n':'')+String(d.get('m')||'')).slice(0,1900),d:today()};
  try{
    await addDoc(t==='msg'?collection(db,'churches',d.get('cid'),'inbox'):collection(db,'support'),body);
    f.outerHTML=pr?'<p class="note">\ud83d\ude4f Thank you. Your prayer request was sent to your pastors. We are standing with you in prayer.</p>':'<p class="note">Thank you! Your message was sent to the church.</p>';
  }catch(x){f.insertAdjacentHTML('beforeend','<p class="note">Sorry, it could not be sent. Please try again.</p>')}
},true);

onAuthStateChanged(auth,async u=>{
  user=u;window.OC_ADMIN=false;
  // app-owner tools: only for the OrganizeChurch owner account (email compared by fingerprint, not stored here)
  try{if(u&&u.email){const h=[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(u.email.toLowerCase())))].map(b=>b.toString(16).padStart(2,'0')).join('');window.OC_ADMIN=h==='1ce112a3c11164d1b4e878623e5050382f964817f6d92b51afccd44168fbfc70'}}catch(e){}
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
  const t0=Date.now();let first=0;
  const ac=new AbortController();const tick=setInterval(()=>{if(first)return;const sec=Math.round((Date.now()-t0)/1000);if(sec>=40){ac.abort();return}o.textContent='Thinking\u2026 \u2728 '+sec+'s'},1000);
  o.textContent='Thinking\u2026 \u2728';
  const info=h=>{let n=document.getElementById('ao-info');if(!n){n=document.createElement('div');n.id='ao-info';n.style.cssText='font-size:.75rem;opacity:.6;margin-top:.5rem';o.insertAdjacentElement('afterend',n)}
    const s=Math.round((Date.now()-t0)/100)/10,f=first?Math.round((first-t0)/100)/10:s;n.textContent='\u23f1 first words '+f+'s \u00b7 total '+s+'s \u00b7 '+(h?(h.get('X-OC-Mode')||'old worker')+' '+(h.get('X-OC-Model')||''):'')};
  try{
    const tok=await auth.currentUser.getIdToken();
    const r=await fetch(aiUrl,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+tok},body:JSON.stringify({q,stream:true}),signal:ac.signal});
    const clean=t=>t.replace(/\*\*/g,'').replace(/^#+\s*/gm,'');
    if((r.headers.get('content-type')||'').includes('text/plain')&&r.body){
      const rd=r.body.getReader(),dc=new TextDecoder();let raw='';
      for(;;){const{done,value}=await rd.read();if(done)break;if(!first)first=Date.now();raw+=dc.decode(value,{stream:true});o.textContent=clean(raw)}
      clearInterval(tick);
      raw=clean(raw).trim();
      if(!raw){o.textContent='Sorry, no answer came back. Please try again.';return}
      const a=hGet();a.unshift({q,a:raw,t:new Date().toLocaleString()});hSet(a);histRender();info(r.headers);
      return;
    }
    const d=await r.json();
    clearInterval(tick);
    const ans=clean(d.text||d.error||'Sorry, no answer came back.');
    o.textContent=ans;
    if(d.text){const a=hGet();a.unshift({q,a:ans,t:new Date().toLocaleString()});hSet(a);histRender()}
    info(r.headers);
  }catch(e){clearInterval(tick);o.textContent=ac.signal.aborted&&!first?'The assistant is very busy right now because many people are using it. Please wait 2 minutes and tap Ask again. \ud83d\ude4f':(first?o.textContent+'\n\n(The answer was cut off. Please tap Ask again.)':'Could not reach the assistant. Please check your internet and try again.')}
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
const after=()=>{const m=location.hash.match(/^#\/c\/([^/]+)/);if(m&&!CELSEEN.has(m[1])&&S.churches.length){CELSEEN.add(m[1]);LOVESEEN.add(m[1]);Promise.all([loadCel(m[1]),loadLoves(m[1]).catch(e=>console.error(e))]).then(()=>{if(location.hash.startsWith('#/c/'+m[1]))_rt()}).catch(e=>console.error(e))}if(location.hash.startsWith('#/flyer'))flyerPage();else if(location.hash.startsWith('#/ai'))aiExtras()};
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
