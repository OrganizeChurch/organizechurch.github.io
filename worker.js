const ALLOWED='https://organizechurch.github.io';
const cors={'Access-Control-Allow-Origin':ALLOWED,'Access-Control-Allow-Headers':'Content-Type,Authorization','Access-Control-Allow-Methods':'POST,OPTIONS','Vary':'Origin','Access-Control-Expose-Headers':'X-OC-Worker,X-OC-Mode,X-OC-Model'};
const SYS='You are the OrganizeChurch assistant: warm, joyful, bold and full of life, a Spirit-filled friend who loves the Word. You are Christ-centred and fully able to write sermons, messages, devotionals, outlines, prayers, announcements and Bible studies. NEVER say you cannot write a sermon or message: always write it. Style: open with a bold, attention-grabbing line; tell vivid stories and everyday pictures; use short lively paragraphs; add a few fitting emojis (like \ud83d\ude4f \u2728 \ud83d\udcd6 \ud83d\udd25) in chat answers; finish chat answers with a gentle follow-up question. Use plain text only: no asterisks, no markdown symbols, no # headings; for lists use numbers or lines starting with a dash. For a sermon or message, write it complete and ready to preach (about 700 to 1000 words): a title, key Scripture, a strong introduction, three clear points each with a Scripture, an illustration and a practical application, a conclusion, a prayer, and an invitation. For normal questions keep answers under about 200 words. Scripture: quote only the King James Version or the World English Bible, in short quotes with the reference, never NIV, ESV, NLT or other copyrighted versions. Introduce quotes with "Scripture:" and your own explanation with "My thoughts:". Never present answers as divine revelation or prophecy. Be humble about uncertainty and never invent verses. For sensitive matters such as abuse, self-harm, crisis, health or legal problems, respond with compassion and encourage the person to speak with a trusted pastor, a qualified professional or emergency services.';
// ===== OrganizeChurch AI worker v6 (strong mode) =====
// Order: Gemini (fast model) -> another Gemini -> Cloudflare AI (big) -> Cloudflare AI (small).
// Busy models are skipped for 2 minutes, so later users go straight to one that works.
// When you move to Gemini's paid plan: in Cloudflare > Settings > Variables, add FIRST_MODEL = gemini-2.5-flash (optional).
const G='https://generativelanguage.googleapis.com/v1beta/';
const HOT={};            // model -> time until which it is considered busy
const TOK=new Map();     // sign-in token -> {uid, until}
const USE=new Map();     // uid -> list of recent question times
let MODELS=null,MODELS_AT=0;
const now=()=>Date.now();
const busy=m=>(HOT[m]||0)>now();
const cool=(m,ms)=>{HOT[m]=now()+ms};
async function timed(url,opt,ms){const ac=new AbortController(),t=setTimeout(()=>ac.abort(),ms);try{return await fetch(url,{...opt,signal:ac.signal})}catch(e){return new Response('{}',{status:504})}finally{clearTimeout(t)}}
async function list(env){
  if(MODELS&&now()-MODELS_AT<3600e3)return MODELS;
  const r=await timed(G+'models?pageSize=100',{headers:{'x-goog-api-key':env.GEMINI_API_KEY}},5000);
  if(!r.ok)return MODELS||[];
  const d=await r.json();
  const ok=(d.models||[]).filter(m=>(m.supportedGenerationMethods||[]).includes('generateContent')).map(m=>m.name.replace('models/','')).filter(n=>/gemini/.test(n)&&/flash/.test(n)&&!/(image|tts|live|audio|embed|robotics|computer|pro|exp|preview)/.test(n));
  MODELS=ok.filter(n=>/lite/.test(n)).sort().reverse().concat(ok.filter(n=>!/lite/.test(n)).sort().reverse());MODELS_AT=now();
  return MODELS;
}
async function gemini(env,model,q){
  const body=th=>JSON.stringify({systemInstruction:{parts:[{text:SYS}]},contents:[{role:'user',parts:[{text:q}]}],generationConfig:Object.assign({maxOutputTokens:4096,temperature:1.0},th||{})});
  const go=th=>timed(G+'models/'+model+':streamGenerateContent?alt=sse',{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':env.GEMINI_API_KEY},body:body(th)},7000);
  let r=await go({thinkingConfig:{thinkingBudget:0}});
  if(r.status===400)r=await go({thinkingConfig:{thinkingLevel:'minimal'}});
  if(r.status===400)r=await go();
  if(r.ok&&r.body)return r;
  if(r.status===429)cool(model,120e3);else if(r.status>=500)cool(model,90e3);else if(r.status===404)cool(model,3600e3);
  return null;
}
function geminiText(body){
  const dec=new TextDecoder(),enc=new TextEncoder();let buf='';
  return body.pipeThrough(new TransformStream({transform(chunk,ctl){
    buf+=dec.decode(chunk,{stream:true});const lines=buf.split('\n');buf=lines.pop();
    for(const ln of lines){if(!ln.startsWith('data:'))continue;
      try{const d=JSON.parse(ln.slice(5));const p=(d.candidates&&d.candidates[0]&&d.candidates[0].content&&d.candidates[0].content.parts)||[];
        const t=p.filter(x=>!x.thought).map(x=>x.text||'').join('');if(t)ctl.enqueue(enc.encode(t))}catch(e){}}
  }}));
}
async function cfAI(env,q){
  const msgs=[{role:'system',content:SYS},{role:'user',content:q}];
  for(const m of ['@cf/meta/llama-3.3-70b-instruct-fp8-fast','@cf/meta/llama-3.1-8b-instruct-fast']){
    if(busy(m))continue;
    try{
      const st=await Promise.race([env.AI.run(m,{messages:msgs,stream:true,max_tokens:1800}),new Promise((_,no)=>setTimeout(()=>no(new Error('slow')),15000))]);
      const dec=new TextDecoder(),enc=new TextEncoder();let buf='';
      const out=st.pipeThrough(new TransformStream({transform(chunk,ctl){
        buf+=dec.decode(chunk,{stream:true});const lines=buf.split('\n');buf=lines.pop();
        for(const ln of lines){if(!ln.startsWith('data:'))continue;const v=ln.slice(5).trim();if(v==='[DONE]')continue;try{const t=JSON.parse(v).response;if(t)ctl.enqueue(enc.encode(t))}catch(e){}}
      }}));
      return{body:out,model:m.split('/').pop()};
    }catch(e){cool(m,/limit|quota|429|neuron/i.test(String(e&&e.message))?3600e3:60e3)}
  }
  return null;
}
async function whoIs(env,tok){
  const c=TOK.get(tok);if(c&&c.until>now())return c.uid;
  const v=await timed('https://identitytoolkit.googleapis.com/v1/accounts:lookup?key='+env.FIREBASE_API_KEY,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({idToken:tok})},6000);
  if(!v.ok)return null;
  let uid='user';try{const d=await v.json();uid=(d.users&&d.users[0]&&d.users[0].localId)||'user'}catch(e){}
  if(TOK.size>2000)TOK.clear();TOK.set(tok,{uid,until:now()+10*60e3});
  return uid;
}
function tooMany(uid,limit){
  const t=now(),a=(USE.get(uid)||[]).filter(x=>t-x<3600e3);
  if(a.length>=limit){USE.set(uid,a);return true}
  a.push(t);USE.set(uid,a);if(USE.size>5000)USE.clear();return false;
}
export default{
async fetch(req,env){
  const j=(o,s=200)=>new Response(JSON.stringify(o),{status:s,headers:{...cors,'Content-Type':'application/json'}});
  if(req.method==='OPTIONS')return new Response(null,{headers:cors});
  if(req.method!=='POST')return j({ok:true,worker:'v6 strong',backup:!!env.AI,busyNow:Object.keys(HOT).filter(busy)});
  const tok=(req.headers.get('Authorization')||'').replace('Bearer ','');
  if(!tok)return j({error:'Please sign in to use the assistant.'},401);
  const uid=await whoIs(env,tok);
  if(!uid)return j({error:'Please sign in again.'},401);
  if(new URL(req.url).pathname==='/image'){
    if(!env.AI)return j({error:'The artwork maker is not switched on yet. In Cloudflare, add a Workers AI binding named AI.'},503);
    let b={};try{b=await req.json()}catch(e){}
    const prompt='Beautiful uplifting church flyer background artwork, soft glowing light, rich colours, no text, no letters, no words. '+String(b.prompt||'').trim().slice(0,300);
    try{const out=await env.AI.run('@cf/black-forest-labs/flux-1-schnell',{prompt,steps:4});
      if(out&&out.image)return j({image:'data:image/jpeg;base64,'+out.image});
      return j({error:'The artwork maker returned nothing. Please try again.'},502);
    }catch(e){return j({error:'The artwork maker is busy right now. Please try again in a few minutes.'},502)}
  }
  let q='';
  try{const bj=await req.json();q=String(bj.q||'').trim().slice(0,1500)}catch(e){return j({error:'Bad request.'},400)}
  if(!q)return j({error:'Please type a question.'},400);
  if(tooMany(uid,Number(env.HOURLY_LIMIT)||30))return j({error:'You have asked many questions this hour. Please rest a little and try again later. 🙏',busy:true},429);
  const head=(model,backup)=>({...cors,'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store','X-OC-Worker':'v6','X-OC-Mode':backup?'backup':'stream','X-OC-Model':model});
  const start=now();
  // 1. Gemini: preferred model, then up to one more that is not busy
  const first=env.FIRST_MODEL||'gemini-2.5-flash-lite';
  let tries=[first];
  try{tries=tries.concat((await list(env)).filter(n=>n!==first))}catch(e){}
  tries=tries.filter(m=>!busy(m)).slice(0,2);
  for(const m of tries){
    if(now()-start>16000)break;
    const r=await gemini(env,m,q);
    if(r)return new Response(geminiText(r.body),{headers:head(m,false)});
  }
  // 2. Backup: Cloudflare's own AI
  if(env.AI){const c=await cfAI(env,q);if(c)return new Response(c.body,{headers:head(c.model,true)})}
  return j({error:'The assistant is very busy right now because many people are using it. Please wait 2 minutes and tap Ask again. 🙏',busy:true},503);
}
};
