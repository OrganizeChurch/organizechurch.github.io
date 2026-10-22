const ALLOWED='https://organizechurch.github.io';
const cors={'Access-Control-Allow-Origin':ALLOWED,'Access-Control-Allow-Headers':'Content-Type,Authorization','Access-Control-Allow-Methods':'POST,OPTIONS','Vary':'Origin','Access-Control-Expose-Headers':'X-OC-Worker,X-OC-Mode,X-OC-Model'};
const SYS='You are the OrganizeChurch assistant: warm, joyful, bold and full of life, a Spirit-filled friend who loves the Word. You are Christ-centred and fully able to write sermons, messages, devotionals, outlines, prayers, announcements and Bible studies. NEVER say you cannot write a sermon or message: always write it. Style: open with a bold, attention-grabbing line; tell vivid stories and everyday pictures; use short lively paragraphs; add a few fitting emojis (like \ud83d\ude4f \u2728 \ud83d\udcd6 \ud83d\udd25) in chat answers; finish chat answers with a gentle follow-up question. Use plain text only: no asterisks, no markdown symbols, no # headings; for lists use numbers or lines starting with a dash. For a sermon or message, write it complete and ready to preach (about 700 to 1000 words): a title, key Scripture, a strong introduction, three clear points each with a Scripture, an illustration and a practical application, a conclusion, a prayer, and an invitation. For normal questions keep answers under about 200 words. Scripture: quote only the King James Version or the World English Bible, in short quotes with the reference, never NIV, ESV, NLT or other copyrighted versions. Introduce quotes with "Scripture:" and your own explanation with "My thoughts:". Never present answers as divine revelation or prophecy. Be humble about uncertainty and never invent verses. For sensitive matters such as abuse, self-harm, crisis, health or legal problems, respond with compassion and encourage the person to speak with a trusted pastor, a qualified professional or emergency services.';
const G='https://generativelanguage.googleapis.com/v1beta/';
async function list(env){
const r=await fetch(G+'models?pageSize=100',{headers:{'x-goog-api-key':env.GEMINI_API_KEY}});
if(!r.ok)return[];
const d=await r.json();
const ok=(d.models||[]).filter(m=>(m.supportedGenerationMethods||[]).includes('generateContent')).map(m=>m.name.replace('models/','')).filter(n=>/gemini/.test(n)&&!/(image|tts|live|audio|embed|robotics|computer|pro)/.test(n));
const f=ok.filter(n=>/flash/.test(n)&&!/lite/.test(n)).sort().reverse();
const l=ok.filter(n=>/lite/.test(n)).sort().reverse();
return f.concat(l);
}
async function gen(env,model,q,stream){
const body=th=>JSON.stringify({systemInstruction:{parts:[{text:SYS}]},contents:[{role:'user',parts:[{text:q}]}],generationConfig:Object.assign({maxOutputTokens:4096,temperature:1.0},th||{})});
const go=th=>fetch(G+'models/'+model+(stream?':streamGenerateContent?alt=sse':':generateContent'),{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':env.GEMINI_API_KEY},body:body(th)});
// thinking off = much faster answers. Older models use a budget, newer ones a level; if both are rejected, retry normally
let r=await go({thinkingConfig:{thinkingBudget:0}});
if(r.status===400)r=await go({thinkingConfig:{thinkingLevel:'minimal'}});
if(r.status===400)r=await go();
return r;
}
export default{
async fetch(req,env){
const j=(o,s=200)=>new Response(JSON.stringify(o),{status:s,headers:{...cors,'Content-Type':'application/json'}});
if(req.method==='OPTIONS')return new Response(null,{headers:cors});
if(req.method!=='POST')return j({error:'Not found'},404);
const tok=(req.headers.get('Authorization')||'').replace('Bearer ','');
if(!tok)return j({error:'Please sign in to use the assistant.'},401);
const v=await fetch('https://identitytoolkit.googleapis.com/v1/accounts:lookup?key='+env.FIREBASE_API_KEY,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({idToken:tok})});
if(!v.ok)return j({error:'Please sign in again.'},401);
if(new URL(req.url).pathname==='/image'){
if(!env.AI)return j({error:'The artwork maker is not switched on yet. In Cloudflare, add a Workers AI binding named AI.'},503);
let b={};
try{b=await req.json()}catch(e){}
const idea=String(b.prompt||'').trim().slice(0,300);
const prompt='Beautiful uplifting church flyer background artwork, soft glowing light, rich colours, no text, no letters, no words. '+idea;
try{
const out=await env.AI.run('@cf/black-forest-labs/flux-1-schnell',{prompt:prompt,steps:4});
if(out&&out.image)return j({image:'data:image/jpeg;base64,'+out.image});
return j({error:'The artwork maker returned nothing. Please try again.'},502);
}catch(e){return j({error:'The artwork maker could not draw right now. '+String((e&&e.message)||e).slice(0,160)},502)}
}
let q='',wantStream=false;
try{const bj=await req.json();q=String(bj.q||'').trim().slice(0,1500);wantStream=!!bj.stream}catch(e){return j({error:'Bad request.'},400)}
if(!q)return j({error:'Please type a question.'},400);
const first=env.MODEL||'gemini-2.5-flash';
if(wantStream){
try{
const sr=await gen(env,first,q,true);
if(sr.ok&&sr.body){
const dec=new TextDecoder(),enc=new TextEncoder();let buf='';
const ts=new TransformStream({transform(chunk,ctl){
buf+=dec.decode(chunk,{stream:true});
const lines=buf.split('\n');buf=lines.pop();
for(const ln of lines){if(!ln.startsWith('data:'))continue;
try{const d=JSON.parse(ln.slice(5));const p=(d.candidates&&d.candidates[0]&&d.candidates[0].content&&d.candidates[0].content.parts)||[];
const t=p.filter(x=>!x.thought).map(x=>x.text||'').join('');if(t)ctl.enqueue(enc.encode(t))}catch(e){}}
}});
return new Response(sr.body.pipeThrough(ts),{headers:{...cors,'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store','X-OC-Worker':'v3','X-OC-Mode':'stream','X-OC-Model':first}});
}
}catch(e){}
}
let names=[first],t='',last='',st=502;
for(let i=0;i<names.length&&i<4;i++){
const r=await gen(env,names[i],q);
if(r.ok){
const d=await r.json();
const c=d.candidates&&d.candidates[0];
const p=(c&&c.content&&c.content.parts)||[];
t=p.filter(x=>!x.thought).map(x=>x.text||'').join('').trim();
if(t)break;
last='['+names[i]+'] empty ('+((c&&c.finishReason)||(d.promptFeedback&&d.promptFeedback.blockReason)||'unknown')+')';
st=502;
}else{
let m='';
try{m=((await r.json()).error||{}).message||''}catch(e){}
last='['+r.status+'] '+names[i]+': '+m;
st=r.status;
}
if(i===0){const l=await list(env);names=names.concat(l.filter(n=>n!==first))}
}
if(!t)return j({error:(st===429?'The assistant is busy right now (free limit reached). ':'The assistant could not answer right now. ')+last.slice(0,260)},st===429?429:502);
return new Response(JSON.stringify({text:t}),{headers:{...cors,'Content-Type':'application/json','X-OC-Worker':'v3','X-OC-Mode':'fallback','X-OC-Model':names[Math.min(names.length-1,3)]||first}});
}
};
