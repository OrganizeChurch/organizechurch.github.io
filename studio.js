// OrganizeChurch Creative Studio: layer-based flyer editor (photos, text, shapes, templates).
export const SIZES={'Portrait 4:5':[1080,1350],'Square':[1080,1080],'Story 9:16':[1080,1920]};
export const FONT_CSS='https://fonts.googleapis.com/css2?family=Anton&family=Archivo+Black&family=Bebas+Neue&family=Cinzel:wght@700;900&family=Dancing+Script:wght@700&family=Great+Vibes&family=Montserrat:wght@500;700;800;900&family=Oswald:wght@500;700&family=Pacifico&family=Permanent+Marker&family=Playfair+Display:wght@700;900&family=Poppins:wght@500;700;800&display=swap';
export const FONTS=['Anton','Bebas Neue','Oswald','Archivo Black','Montserrat','Poppins','Playfair Display','Cinzel','Great Vibes','Dancing Script','Pacifico','Permanent Marker'];
const GOLD=['#8a5a12','#f6e27a','#c8921f','#fff3b0','#9a6a14'];
let uidn=0;const nid=()=>'l'+(++uidn)+Math.random().toString(36).slice(2,6);
const fontStr=l=>(l.italic?'italic ':'')+(l.weight||700)+' '+Math.round(l.size)+'px "'+(l.font||'Montserrat')+'",sans-serif';
const rng=s=>()=>{s=(s*9301+49297)%233280;return s/233280};

function rr(c,x,y,w,h,r){r=Math.max(0,Math.min(r,w/2,h/2));c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
function jag(c,w,h,seed,smooth,n,am){
  const r=rng(seed||1),p=[],m=Math.max(3,Math.round(h/60));
  for(let i=0;i<=n;i++)p.push([-w/2+w*i/n,-h/2+(r()-.5)*2*am]);
  for(let i=1;i<=m;i++)p.push([w/2+(r()-.5)*am*(smooth?1.4:.3),-h/2+h*i/m]);
  for(let i=n-1;i>=0;i--)p.push([-w/2+w*i/n,h/2+(r()-.5)*2*am]);
  for(let i=m-1;i>=1;i--)p.push([-w/2+(r()-.5)*am*(smooth?1.4:.3),-h/2+h*i/m]);
  c.beginPath();
  if(smooth){const L=p.length,mid=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2];let s=mid(p[L-1],p[0]);c.moveTo(s[0],s[1]);for(let i=0;i<L;i++){const e=mid(p[i],p[(i+1)%L]);c.quadraticCurveTo(p[i][0],p[i][1],e[0],e[1])}}
  else{c.moveTo(p[0][0],p[0][1]);for(let i=1;i<p.length;i++)c.lineTo(p[i][0],p[i][1])}
  c.closePath();
}
function shapePath(c,kind,w,h,l){
  if(kind==='rect')rr(c,-w/2,-h/2,w,h,l.radius||0);
  else if(kind==='pill')rr(c,-w/2,-h/2,w,h,h/2);
  else if(kind==='circle'){c.beginPath();c.ellipse(0,0,w/2,h/2,0,0,Math.PI*2)}
  else if(kind==='arch'){const r=w/2;c.beginPath();c.moveTo(-w/2,h/2);c.lineTo(-w/2,-h/2+r);c.arc(0,-h/2+r,r,Math.PI,0);c.lineTo(w/2,h/2);c.closePath()}
  else if(kind==='brush')jag(c,w,h,l.seed,true,10,h*.08);
  else if(kind==='torn')jag(c,w,h,l.seed,false,46,h*.035);
  else rr(c,-w/2,-h/2,w,h,0);
}
function cover(c,im,x,y,w,h,o){
  if(o.fit==='contain'){
    const z0=o.zoom||1,fx0=o.fx==null?.5:o.fx,fy0=o.fy==null?.5:o.fy,k0=Math.min(w/im.width,h/im.height)*z0,dw=im.width*k0,dh=im.height*k0;
    c.drawImage(im,x+(dw>w?(w-dw)*fx0:(w-dw)/2),y+(dh>h?(h-dh)*fy0:(h-dh)/2),dw,dh);return;
  }
  const z=o.zoom||1,k=Math.max(w/im.width,h/im.height)*z,sw=w/k,sh=h/k,fx=o.fx==null?.5:o.fx,fy=o.fy==null?.25:o.fy;
  c.drawImage(im,(im.width-sw)*fx,(im.height-sh)*fy,sw,sh,x,y,w,h);
}
function fadeMask(c,w,h,mode){
  c.globalCompositeOperation='destination-in';
  const side=(x0,y0,x1,y1)=>{const g=c.createLinearGradient(x0,y0,x1,y1);g.addColorStop(0,'rgba(0,0,0,1)');g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(0,0,w,h)};
  if(mode==='bottom'||mode==='all')side(0,h*.55,0,h);
  if(mode==='top'||mode==='all')side(0,h*.45,0,0);
  if(mode==='sides'||mode==='all'){side(w*.55,0,w,0);side(w*.45,0,0,0)}
  c.globalCompositeOperation='source-over';
}
function tw(c,t,ls){if(!ls)return c.measureText(t).width;let w=-ls;for(const k of t)w+=c.measureText(k).width+ls;return w}
function layoutText(c,l){
  const txt=l.upper?String(l.text||'').toUpperCase():String(l.text||'');
  c.font=fontStr(l);
  const ls=l.ls||0,lines=[];
  txt.split('\n').forEach(par=>{
    let cur='';
    par.split(/\s+/).filter(Boolean).forEach(wd=>{const t=cur?cur+' '+wd:wd;if(tw(c,t,ls)>l.w&&cur){lines.push(cur);cur=wd}else cur=t});
    lines.push(cur);
  });
  const lh=l.size*(l.lh||1.1);
  return{lines,lh,h:Math.max(lh,lines.length*lh)};
}
function fitSize(c,l){
  if(!l.fit)return l;
  c.font=fontStr(l);let m=0;const ls=l.ls||0;
  String(l.upper?String(l.text||'').toUpperCase():String(l.text||'')).split(/\s+/).forEach(w=>{m=Math.max(m,tw(c,w,ls))});
  if(m<=l.w||!m)return l;
  return Object.assign({},l,{size:l.size*l.w/m*0.98});
}
function drawText(c,l0){
  const l=fitSize(c,l0);
  const L=layoutText(c,l);l0._h=L.h;
  c.font=fontStr(l);c.textBaseline='middle';
  const ax=l.align==='left'?-l.w/2:l.align==='right'?l.w/2:0;
  const paint=(dx,dy,mode)=>{
    L.lines.forEach((ln,i)=>{
      const y=-L.h/2+i*L.lh+L.lh/2+dy;let x=ax+dx;
      const draw=(t,px)=>{if(mode==='stroke')c.strokeText(t,px,y);else c.fillText(t,px,y)};
      if(l.ls){
        const w=tw(c,ln,l.ls);let sx=l.align==='left'?x:l.align==='right'?x-w:x-w/2;c.textAlign='left';
        for(const k of ln){draw(k,sx);sx+=c.measureText(k).width+l.ls}
      }else{c.textAlign=l.align||'center';draw(ln,x)}
    });
  };
  c.lineJoin='round';
  if(l.extrude>0){
    c.fillStyle=l.extrudeColor||'#5a3300';
    for(let i=l.extrude;i>=1;i--)paint(i*.6,i,'fill');
  }
  if(l.shadow){c.shadowColor='rgba(0,0,0,.55)';c.shadowBlur=Math.max(6,l.size*.08);c.shadowOffsetY=Math.max(2,l.size*.03)}
  if(l.grad){const g=c.createLinearGradient(0,-L.h/2,0,L.h/2);GOLD.forEach((k,i)=>g.addColorStop(i/(GOLD.length-1),k));c.fillStyle=g}else c.fillStyle=l.color||'#fff';
  paint(0,0,'fill');
  c.shadowColor='transparent';c.shadowBlur=0;c.shadowOffsetY=0;
  if(l.sw>0){c.strokeStyle=l.sc||'#000';c.lineWidth=l.sw;paint(0,0,'stroke')}
}
function drawShape(c,l){
  shapePath(c,l.kind,l.w,l.h,l);
  if(l.shadow){c.shadowColor='rgba(0,0,0,.45)';c.shadowBlur=24;c.shadowOffsetY=8}
  if(l.grad){const g=c.createLinearGradient(0,-l.h/2,0,l.h/2);g.addColorStop(0,l.c1);g.addColorStop(1,l.c2);c.fillStyle=g}else c.fillStyle=l.c1;
  c.fill();c.shadowColor='transparent';c.shadowBlur=0;c.shadowOffsetY=0;
  if(l.sw>0){c.strokeStyle=l.sc;c.lineWidth=l.sw;c.stroke()}
}
// ---- photo adjustments (brightness, contrast, colour, smoothness, mirror) ----
function hasAdj(l){return !!(l.br||l.ct||l.sat||l.warm||l.smooth||(l.tone&&l.tone!=='none')||l.flip)}
function adjusted(l,im,A){
  if(!hasAdj(l))return im;
  A.pc=A.pc||{};
  const key=[l.src,l.br|0,l.ct|0,l.sat|0,l.warm|0,l.tone||'',l.smooth|0,l.flip?1:0].join('|'),h=A.pc[l.id];
  if(h&&h.key===key)return h.cv;
  const M=1400,s=Math.min(1,M/Math.max(im.width,im.height)),w=Math.max(1,Math.round(im.width*s)),hh=Math.max(1,Math.round(im.height*s));
  const cv=A.mk(w,hh),x=cv.getContext('2d',{willReadFrequently:true});
  x.imageSmoothingQuality='high';
  if(l.flip){x.translate(w,0);x.scale(-1,1)}
  x.drawImage(im,0,0,w,hh);
  if(l.flip)x.setTransform(1,0,0,1,0,0);
  const id=x.getImageData(0,0,w,hh),d=id.data;
  const sm=Math.max(0,Math.min(100,l.smooth||0))/100;
  let bl=null;
  if(sm>0){
    const f=3+sm*9,sc=A.mk(Math.max(1,Math.ceil(w/f)),Math.max(1,Math.ceil(hh/f))),sx=sc.getContext('2d');
    sx.imageSmoothingQuality='high';sx.drawImage(cv,0,0,sc.width,sc.height);
    const bc=A.mk(w,hh),bx=bc.getContext('2d',{willReadFrequently:true});bx.imageSmoothingQuality='high';bx.drawImage(sc,0,0,w,hh);
    bl=bx.getImageData(0,0,w,hh).data;
  }
  const B=(l.br||0)*1.6,ct=l.ct||0,cf=ct>=0?1+ct/40:Math.max(.08,1+ct/110),sf=1+(l.sat||0)/100,W=(l.warm||0)*.45,tone=l.tone||'none';
  for(let i=0;i<d.length;i+=4){
    let r=d[i],g=d[i+1],b=d[i+2];
    if(bl){
      const L=.299*r+.587*g+.114*b,Lb=.299*bl[i]+.587*bl[i+1]+.114*bl[i+2],t=sm*.9*(1-Math.min(1,Math.abs(L-Lb)/34));
      r+=(bl[i]-r)*t;g+=(bl[i+1]-g)*t;b+=(bl[i+2]-b)*t;
    }
    r+=B;g+=B;b+=B;
    if(cf!==1){r=(r-128)*cf+128;g=(g-128)*cf+128;b=(b-128)*cf+128}
    if(sf!==1){const y=.299*r+.587*g+.114*b;r=y+(r-y)*sf;g=y+(g-y)*sf;b=y+(b-y)*sf}
    if(W){r+=W;g+=W*.12;b-=W}
    if(tone==='bw'){const y=.299*r+.587*g+.114*b;r=g=b=y}
    else if(tone==='sepia'){const y=.299*r+.587*g+.114*b;r=y*1.07+14;g=y*.92+6;b=y*.7}
    else if(tone==='vivid'){const y=.299*r+.587*g+.114*b;r=y+(r-y)*1.35;g=y+(g-y)*1.35;b=y+(b-y)*1.35;r=(r-128)*1.1+128;g=(g-128)*1.1+128;b=(b-128)*1.1+128}
    d[i]=r;d[i+1]=g;d[i+2]=b;
  }
  x.putImageData(id,0,0);
  A.pc[l.id]={key,cv};
  return cv;
}
function drawImg(c,l,A){
  const w=l.w,h=l.h,im=l.src&&A.img(l.src),shp=l.shape||'rounded';
  const kind=shp==='rounded'?'rect':shp==='free'?'rect':shp;
  const meta={radius:shp==='rounded'?(l.radius==null?26:l.radius):0};
  if(!im){
    if(A.editor){
      c.save();shapePath(c,kind,w,h,meta);c.fillStyle='rgba(255,255,255,.14)';c.fill();c.setLineDash([14,10]);c.strokeStyle='rgba(255,255,255,.75)';c.lineWidth=3;c.stroke();c.setLineDash([]);
      c.fillStyle='rgba(255,255,255,.95)';c.font='700 '+Math.max(16,Math.min(w,h)*.11)+'px Montserrat,sans-serif';c.textAlign='center';c.textBaseline='middle';
      c.fillText(l.logo?'+ Logo':'+ Photo',0,0);c.restore();
    }
    return;
  }
  const fade=l.fade&&l.fade!=='none',im0=im;
  const imA=adjusted(l,im0,A);
  let t=null;
  if(fade){const S=2;t=A.mk(Math.ceil(w*S),Math.ceil(h*S));const tc=t.getContext('2d');cover(tc,imA,0,0,t.width,t.height,l);fadeMask(tc,t.width,t.height,l.fade)}
  if(l.shadow&&!fade&&shp!=='free'){c.save();shapePath(c,kind,w,h,meta);c.shadowColor='rgba(0,0,0,.55)';c.shadowBlur=26;c.shadowOffsetY=10;c.fillStyle='#000';c.fill();c.restore()}
  if(shp==='free'&&l.shadow&&!fade){c.save();c.shadowColor='rgba(0,0,0,.55)';c.shadowBlur=26;c.shadowOffsetY=10;cover(c,imA,-w/2,-h/2,w,h,l);c.restore();return}
  c.save();shapePath(c,kind,w,h,meta);c.clip();
  if(t)c.drawImage(t,-w/2,-h/2,w,h);else cover(c,imA,-w/2,-h/2,w,h,l);
  c.restore();
  if(l.bw>0&&shp!=='free'){shapePath(c,kind,w,h,meta);c.strokeStyle=l.bc||'#f6e27a';c.lineWidth=l.bw;c.stroke()}
}
function drawGlow(c,l){
  const r=l.w/2,g=c.createRadialGradient(0,0,0,0,0,r);g.addColorStop(0,l.color);g.addColorStop(1,'rgba(0,0,0,0)');
  c.globalCompositeOperation='lighter';c.fillStyle=g;c.fillRect(-r,-r,2*r,2*r);c.globalCompositeOperation='source-over';
}
function drawDots(c,l){
  const r=rng(l.seed||7);c.fillStyle=l.color;
  for(let i=0;i<(l.count||30);i++){const rad=4+r()*r()*34;c.globalAlpha=(l.opacity==null?1:l.opacity)*(.4+r()*.6);c.beginPath();c.arc((r()-.5)*l.w,(r()-.5)*l.h,rad,0,Math.PI*2);c.fill()}
}
function drawBg(c,d,A){
  const W=d.w,H=d.h,b=d.bg||{};
  if(b.mode==='solid'){c.fillStyle=b.c1;c.fillRect(0,0,W,H)}
  else{
    const a=(b.angle==null?160:b.angle)*Math.PI/180,dx=Math.sin(a),dy=-Math.cos(a),cx=W/2,cy=H/2,len=Math.abs(W*dx)+Math.abs(H*dy);
    const g=c.createLinearGradient(cx-dx*len/2,cy-dy*len/2,cx+dx*len/2,cy+dy*len/2);g.addColorStop(0,b.c1);g.addColorStop(1,b.c2);c.fillStyle=g;c.fillRect(0,0,W,H);
  }
  const im=d.bgImg&&A.img(d.bgImg);
  if(im){
    if(d.bgBlur){const t=A.mk(Math.round(W/24),Math.round(H/24));const tc=t.getContext('2d');cover(tc,im,0,0,t.width,t.height,{fy:.4});c.imageSmoothingEnabled=true;c.drawImage(t,0,0,t.width,t.height,-30,-30,W+60,H+60)}
    else cover(c,im,0,0,W,H,{fy:d.bgFy==null?.4:d.bgFy});
    if(d.bgDim>0){c.fillStyle='rgba(0,0,0,'+d.bgDim+')';c.fillRect(0,0,W,H)}
  }
}
export function drawDesign(c,d,A){
  c.save();c.setTransform.apply(c,A.base||[1,0,0,1,0,0]);
  c.clearRect(0,0,d.w,d.h);drawBg(c,d,A);
  for(const l of d.layers){
    if(l.hidden)continue;
    c.save();c.translate(l.x,l.y);c.rotate((l.rot||0)*Math.PI/180);c.globalAlpha=l.opacity==null?1:l.opacity;
    if(l.type==='text')drawText(c,l);
    else if(l.type==='image')drawImg(c,l,A);
    else if(l.type==='shape')drawShape(c,l);
    else if(l.type==='glow')drawGlow(c,l);
    else if(l.type==='dots')drawDots(c,l);
    c.restore();
  }
  c.restore();
}

// ---------- layer factories and templates ----------
const F={
  text:(text,x,y,w,size,o)=>Object.assign({id:nid(),type:'text',text,x,y,w,size,font:'Montserrat',weight:700,color:'#ffffff',align:'center',lh:1.1,ls:0,rot:0,opacity:1},o),
  img:(x,y,w,h,o)=>Object.assign({id:nid(),type:'image',src:null,x,y,w,h,shape:'rounded',radius:26,zoom:1,fx:.5,fy:.25,fade:'none',bw:0,bc:'#f6e27a',shadow:true,rot:0,opacity:1},o),
  shape:(kind,x,y,w,h,o)=>Object.assign({id:nid(),type:'shape',kind,x,y,w,h,c1:'#ffffff',grad:false,c2:'#000000',radius:20,sw:0,sc:'#ffffff',shadow:false,rot:0,opacity:1,seed:Math.floor(Math.random()*900)+1},o),
  glow:(x,y,w,color,op)=>({id:nid(),type:'glow',x,y,w,h:w,color,rot:0,opacity:op,lock:true}),
  dots:(x,y,w,h,color,count,op,seed)=>({id:nid(),type:'dots',x,y,w,h,color,count,rot:0,opacity:op,seed:seed||7,lock:true})
};
const DS=(layers,c1,c2,angle,extra)=>Object.assign({w:1080,h:1350,bg:{mode:'grad',c1,c2,angle},bgImg:null,bgDim:0,layers},extra);
const col=(cx,n,w,gap)=>{const t=n*w+(n-1)*gap,s=cx-t/2+w/2;return Array.from({length:n},(_,i)=>s+i*(w+gap))};

export const TEMPLATES=[
{name:'Fire Revival (dark and gold)',build(){
  const xs=col(540,4,235,22),L=[
  F.glow(540,260,1400,'rgba(255,120,20,.38)'),F.glow(930,110,700,'rgba(255,210,110,.5)'),F.glow(120,950,800,'rgba(255,50,20,.35)'),
  F.dots(540,520,1080,1000,'#ffd9a0',40,.4,11),
  F.img(120,125,130,130,{shape:'circle',bw:4,logo:true,shadow:false}),
  F.text('YOUR MINISTRY\nNAME',365,125,320,32,{weight:800,align:'left',lh:1.2}),
  F.text('PRESENTS :',640,150,300,26,{weight:800,color:'#ffc247',ls:9}),
  F.shape('torn',905,150,290,115,{c1:'#ffffff',seed:5}),
  F.text('PROPHETIC\nPRAISE',905,152,250,40,{font:'Oswald',color:'#3a1500',lh:1.05}),
  F.shape('rect',540,318,730,3,{c1:'#ffc247'}),F.shape('rect',540,398,730,3,{c1:'#ffc247'}),
  F.text('AN ATMOSPHERE OF PROPHETIC\nTHROUGH WORSHIP AND PRAISE',540,358,720,30,{lh:1.2}),
  F.text('UNQUENCHABLE',540,515,1040,165,{fit:true,font:'Anton',weight:400,grad:true,extrude:10,extrudeColor:'#4a2100',shadow:true,lh:1}),
  F.text('FIRE',540,700,900,250,{fit:true,font:'Anton',weight:400,grad:true,extrude:12,extrudeColor:'#4a2100',shadow:true,lh:1}),
  F.text('(INATIKIKU)',800,835,360,40,{weight:800,color:'#ffc247',ls:6})];
  xs.forEach((x,i)=>{L.push(F.img(x,995,235,250,{bw:4,radius:22}));L.push(F.text('MINISTER\nNAME HERE',x,1160,235,26,{weight:800,lh:1.1}))});
  L.push(F.shape('rect',540,1288,1080,124,{c1:'#ffffff',radius:0,shadow:false}));
  L.push(F.text('DATE\nFRI. 13TH NOVEMBER, 2026',255,1288,420,28,{weight:800,color:'#5a1a00',lh:1.25}));
  L.push(F.text('TIME\n10:00PM PROMPT',620,1288,300,28,{weight:800,color:'#5a1a00',lh:1.25}));
  L.push(F.text('VENUE\nYour church name and address',900,1288,330,24,{weight:800,color:'#5a1a00',lh:1.25}));
  return DS(L,'#2b0603','#85190a',160)}},
{name:'Birthday Glam (purple and yellow)',build(){return DS([
  F.glow(300,300,1000,'rgba(255,60,200,.5)'),F.glow(850,250,900,'rgba(80,140,255,.5)'),F.glow(540,1200,900,'rgba(255,170,40,.4)'),
  F.dots(540,600,1080,1100,'#ffd84a',26,.55,3),
  F.img(540,470,780,800,{shape:'free',fade:'bottom',shadow:false}),
  F.img(300,860,290,290,{shape:'circle',bw:6,bc:'#ffd84a'}),F.img(780,860,290,290,{shape:'circle',bw:6,bc:'#ffd84a'}),
  F.text('HAPPY GLORIOUS BIRTHDAY',540,1030,900,24,{weight:700,ls:9}),
  F.text('GLORIOUS',540,1125,1000,180,{fit:true,font:'Bebas Neue',weight:400,color:'#ffe11a',lh:1,shadow:true}),
  F.text('TWINS',540,1255,1000,190,{fit:true,font:'Playfair Display',weight:900,color:'#ffffff',lh:1,shadow:true,upper:true}),
  F.shape('pill',960,700,130,310,{c1:'rgba(0,0,0,.35)',sw:4,sc:'#ffffff'}),
  F.text('19\n10\n26',960,700,120,86,{font:'Bebas Neue',weight:400,lh:.95}),
  F.text('HAPPY\nGLORIOUS\nBIRTHDAY',170,700,220,50,{font:'Bebas Neue',weight:400,color:'#ffe11a',lh:.95,align:'left'})
 ],'#14002e','#5a0f9a',170)}},
{name:'Soft Anniversary (pastel and script)',build(){return DS([
  F.glow(250,200,900,'rgba(255,120,190,.5)'),F.glow(900,300,900,'rgba(150,170,255,.5)'),F.glow(540,1150,1200,'rgba(255,200,170,.55)'),
  F.dots(540,600,1080,1100,'#ffffff',30,.5,9),
  F.img(330,560,620,800,{shape:'free',fade:'bottom',shadow:false,fy:.15}),F.img(760,520,620,760,{shape:'free',fade:'bottom',shadow:false,fy:.15}),
  F.shape('rect',150,185,150,150,{c1:'rgba(255,255,255,.2)',sw:3,sc:'#8a2a3a',radius:18}),
  F.text('18TH\nOCT.\n2026',150,185,130,34,{font:'Poppins',weight:700,color:'#7a1830',lh:1.1}),
  F.text('Happy Wedding',540,930,1000,150,{fit:true,font:'Great Vibes',weight:400,color:'#ffffff',shadow:true,lh:1}),
  F.text('ANNIVERSARY',540,1025,800,32,{font:'Cinzel',weight:700,color:'#ffffff',shadow:true,ls:10}),
  F.text('DR. AROME &\nREV. (MR) DINNA',540,1120,900,56,{font:'Cinzel',weight:700,color:'#2a1030',lh:1.1}),
  F.text('OSAYI',540,1233,700,84,{font:'Cinzel',weight:900,color:'#b23a3a',lh:1}),
  F.text('Happy wedding anniversary. May your love grow stronger, your joy never end, and God’s blessings remain upon your union.',540,1313,820,19,{font:'Poppins',weight:500,color:'#3a1030',lh:1.25})
 ],'#ffe3f0','#d8e4ff',160)}},
{name:'Bold Sermon (big two-tone title)',build(){return DS([
  F.img(540,470,1080,940,{shape:'free',fade:'bottom',shadow:false,fy:.3}),
  F.glow(540,1200,1200,'rgba(190,20,20,.55)'),
  F.shape('rect',540,1300,1080,200,{c1:'rgba(120,0,0,.6)',radius:0}),
  F.img(120,455,60,60,{shape:'rect',radius:10,logo:true,shadow:false}),
  F.text('YOUR CHURCH\nNAME',335,455,300,30,{weight:800,align:'left',lh:1.1}),
  F.text('Hidden',540,660,1040,250,{fit:true,font:'Archivo Black',weight:400,color:'#ffa400',lh:1,shadow:true}),
  F.text('Fangs',540,880,1040,290,{fit:true,font:'Archivo Black',weight:400,color:'#ffffff',lh:1,shadow:true}),
  F.shape('rect',190,1105,250,270,{c1:'rgba(120,0,0,.55)',sw:5,sc:'#e02020',radius:0}),
  F.text('SUNDAY\n25TH\nOCT.\n2026',190,1110,220,48,{font:'Anton',weight:400,color:'#ffd21a',lh:1.05}),
  F.text('Service Time:',455,1040,300,26,{ls:3}),F.text('8AM',445,1115,280,100,{font:'Anton',weight:400}),
  F.text('YOUR CHURCH ARENA\n8 Street Name, City',350,1270,480,28,{weight:700,align:'left',lh:1.25}),
  F.img(880,1085,340,300,{shape:'rounded',radius:30,bw:0}),
  F.text('REV. CHRIS ABRAHAM\n(Senior Pastor)',880,1295,380,28,{weight:800,lh:1.15})
 ],'#120707','#3a0b0b',180)}},
{name:'Speakers Grid (many photos)',build(){
  const xs=col(540,4,235,18),L=[
  F.glow(900,250,900,'rgba(60,220,230,.35)'),F.glow(100,1100,800,'rgba(30,150,170,.4)'),
  F.img(920,330,420,540,{shape:'free',fade:'bottom',shadow:false}),
  F.img(110,110,100,100,{shape:'rounded',radius:20,logo:true,shadow:false}),
  F.text('YOUR GROUP\nNAME HERE',350,110,320,30,{weight:800,align:'left',lh:1.15}),
  F.text('PRESENTS',280,235,420,24,{weight:800,ls:8,align:'left'}),
  F.text('SKILL UP',390,320,640,130,{font:'Anton',weight:400,color:'#ff3d5a',align:'left',lh:1}),
  F.text('EXPERIENCE',390,450,640,120,{font:'Anton',weight:400,color:'#ffffff',align:'left',lh:1})];
  [630,880].forEach((y,ri)=>xs.forEach(x=>{L.push(F.img(x,y-8,235,200,{radius:20,bc:'#31e1f0',bw:4,fy:.2}));L.push(F.text('Speaker Name',x,y+132,235,24,{weight:700}))}));
  L.push(F.text('TRAINING AREAS',420,1085,700,24,{weight:800,align:'left',ls:5}));
  L.push(F.text('• Public Speaking   • Leadership\n• Writing and Storytelling   • Worship and Music\n• Digital Creativity   • Video Editing',420,1180,700,26,{weight:500,align:'left',lh:1.35}));
  L.push(F.shape('rect',900,1170,230,130,{c1:'#ffffff',radius:20}));
  L.push(F.text('ACCESS IS\nFREE',900,1170,210,42,{font:'Anton',weight:400,color:'#0b2a30',lh:1}));
  L.push(F.text('Date • Time • Venue or online link goes here',540,1300,980,28,{weight:700}));
  return DS(L,'#061a1e','#0c4048',170)}},
{name:'Clean Invite (sky and white)',build(){return DS([
  F.glow(200,150,900,'rgba(120,200,255,.55)'),F.glow(950,1250,900,'rgba(120,200,255,.5)'),
  F.img(540,290,720,430,{shape:'free',fade:'all',shadow:false,fy:.4}),
  F.shape('pill',540,640,520,92,{c1:'#ff7a00',grad:true,c2:'#f5c518'}),
  F.text('A SPECIAL INVITE TO THE',540,640,500,28,{weight:800,ls:3}),
  F.text('NAMING',540,790,1000,230,{fit:true,font:'Archivo Black',weight:400,color:'#3f8fc4',lh:1}),
  F.text('CEREMONY',540,965,1000,170,{fit:true,font:'Archivo Black',weight:400,color:'#3f8fc4',lh:1}),
  F.shape('pill',540,1110,700,130,{c1:'#14587f',grad:true,c2:'#3b7da6'}),
  F.text('OF MR. AND MRS. NAME’S DAUGHTER',540,1110,640,32,{weight:700,lh:1.2}),
  F.shape('pill',215,1215,130,60,{c1:'#ff7a00',grad:true,c2:'#f5c518'}),F.text('ON THE',215,1215,120,22,{weight:800}),
  F.shape('circle',345,1215,100,100,{c1:'#3a6f8f'}),F.text('17',345,1215,100,44,{font:'Poppins',weight:800}),
  F.shape('circle',455,1215,100,100,{c1:'#3a6f8f'}),F.text('10',455,1215,100,44,{font:'Poppins',weight:800}),
  F.shape('circle',565,1215,100,100,{c1:'#3a6f8f'}),F.text('26',565,1215,100,44,{font:'Poppins',weight:800}),
  F.shape('pill',740,1215,200,90,{c1:'rgba(255,255,255,.7)',sw:4,sc:'#555555'}),F.text('@9AM',740,1215,200,42,{font:'Poppins',weight:800,color:'#2a2a2a'}),
  F.text('YOUR CHURCH NAME, LOCATION',540,1300,860,32,{weight:700,color:'#14587f'})
 ],'#bfe6ff','#ffffff',180)}},
{name:'Quote / Inspiration (blue and yellow)',build(){return DS([
  F.glow(250,300,1000,'rgba(255,255,255,.35)'),F.glow(900,1200,900,'rgba(255,190,40,.45)'),
  F.img(290,720,620,1300,{shape:'free',fade:'sides',shadow:false,fy:.2}),
  F.text('THE',810,155,420,70,{font:'Anton',weight:400,lh:1}),
  F.text('GREATEST',770,265,520,115,{font:'Anton',weight:400,color:'#ffd21a',lh:1}),
  F.shape('brush',770,375,500,100,{c1:'#e02020',seed:12}),
  F.text('DANGER',770,375,480,90,{font:'Anton',weight:400,lh:1}),
  F.text('IS NOT REJECTING',770,490,500,52,{font:'Anton',weight:400,lh:1}),
  F.text('GOD,',770,590,500,110,{font:'Anton',weight:400,color:'#ffd21a',lh:1}),
  F.text('BUT BECOMING COMFORTABLE WITH LOVING HIM',770,740,480,46,{font:'Anton',weight:400,lh:1.1}),
  F.text('HALFWAY..',770,860,500,95,{font:'Anton',weight:400,color:'#ffd21a',lh:1}),
  F.shape('brush',780,1040,520,230,{c1:'#ffd21a',seed:33,rot:-3}),
  F.text('MAY GOD\nHELP US!',780,1040,420,70,{font:'Permanent Marker',weight:400,color:'#0a2a66',lh:1,rot:-3}),
  F.text('YOUR CHURCH NAME',560,1300,900,30,{weight:800,ls:5})
 ],'#06225a','#1f6fd1',170)}},
{name:'Blank (start from nothing)',build(){return DS([
  F.glow(540,300,1200,'rgba(120,170,255,.35)'),
  F.text('YOUR TITLE HERE',540,600,900,130,{font:'Anton',weight:400,grad:true,extrude:8,extrudeColor:'#4a2100',shadow:true,lh:1}),
  F.text('Add photos, text and shapes with the buttons below.',540,760,800,34,{weight:600})
 ],'#0a1a45','#1d4ed8',170)}}
];


export const THEMES=[
{name:'Fire',c1:'#2b0603',c2:'#85190a',accent:'#ffc247',accent2:'#e8571a'},
{name:'Royal Blue',c1:'#06225a',c2:'#1f6fd1',accent:'#ffd21a',accent2:'#e02020'},
{name:'Purple Glam',c1:'#14002e',c2:'#5a0f9a',accent:'#ffe11a',accent2:'#ff3dbb'},
{name:'Green',c1:'#052b1c',c2:'#0f6a45',accent:'#f6e27a',accent2:'#c8921f'},
{name:'Black and Gold',c1:'#0b0b0d',c2:'#2a2a30',accent:'#f6c744',accent2:'#c8921f'},
{name:'Burgundy',c1:'#3a0713',c2:'#8a1c33',accent:'#ffd9a0',accent2:'#e0a040'},
{name:'Teal',c1:'#061a1e',c2:'#0c4048',accent:'#31e1f0',accent2:'#ff3d5a'},
{name:'Sky (light)',c1:'#bfe6ff',c2:'#ffffff',accent:'#ff7a00',accent2:'#3f8fc4',ink:'#14587f',light:true},
{name:'Rose (light)',c1:'#ffe3f0',c2:'#d8e4ff',accent:'#b23a3a',accent2:'#e0709a',ink:'#2a1030',light:true}
];
export const FONTPACKS=[
{name:'Bold Impact',title:'Anton',tw:400,body:'Montserrat',script:'Permanent Marker'},
{name:'Tall Modern',title:'Bebas Neue',tw:400,body:'Poppins',script:'Dancing Script'},
{name:'Elegant Serif',title:'Playfair Display',tw:900,body:'Montserrat',script:'Great Vibes'},
{name:'Royal Classic',title:'Cinzel',tw:900,body:'Poppins',script:'Great Vibes'},
{name:'Heavy Block',title:'Archivo Black',tw:400,body:'Montserrat',script:'Pacifico'},
{name:'Sporty',title:'Oswald',tw:700,body:'Poppins',script:'Permanent Marker'}
];
const hx=c=>{const m=/^#([0-9a-f]{6})$/i.exec(String(c||''));return m?[parseInt(m[1].slice(0,2),16),parseInt(m[1].slice(2,4),16),parseInt(m[1].slice(4,6),16)]:null};
const lum=c=>{const r=hx(c);return r?(0.299*r[0]+0.587*r[1]+0.114*r[2])/255:null};
export function applyTheme(D,t){
  D.bg={mode:'grad',c1:t.c1,c2:t.c2,angle:D.bg&&D.bg.angle!=null?D.bg.angle:165};
  const rgb=hx(t.accent),rgb2=hx(t.accent2);let gi=0;
  D.layers.forEach(l=>{
    if(l.type==='text'){
      if(l.grad)return;
      const v=lum(l.color);if(v==null)return;
      if(v>.85)l.color=t.light?(t.ink||'#222222'):'#ffffff';
      else if(v>=.3)l.color=t.accent;
    }else if(l.type==='shape'){
      if(String(l.c1).startsWith('rgba'))return;
      const v=lum(l.c1);if(v==null||v>.9)return;
      if(v<.3){if(t.light){l.c1=t.accent2;if(l.grad)l.c2=t.accent2}}
      else{l.c1=t.accent2;if(l.grad)l.c2=t.accent}
      if(l.sw>0&&lum(l.sc)!=null&&lum(l.sc)<.9)l.sc=t.accent;
    }else if(l.type==='image'){if(l.bw>0)l.bc=t.accent}
    else if(l.type==='glow'){const m=/rgba\(\d+,\d+,\d+,([\d.]+)\)/.exec(l.color),a=m?m[1]:'.4',r=(gi++%2)?rgb2:rgb;l.color='rgba('+r[0]+','+r[1]+','+r[2]+','+a+')'}
    else if(l.type==='dots')l.color=t.accent;
  });
}
const DISPLAY=['Anton','Bebas Neue','Oswald','Archivo Black','Playfair Display','Cinzel'],SCRIPTF=['Great Vibes','Dancing Script','Pacifico','Permanent Marker'];
export function applyFontPack(D,p){
  D.layers.forEach(l=>{
    if(l.type!=='text')return;
    if(DISPLAY.includes(l.font)){l.font=p.title;l.weight=p.tw;l.fit=true;l.upper=['Anton','Bebas Neue','Oswald','Cinzel'].includes(p.title)}
    else if(SCRIPTF.includes(l.font)){l.font=p.script;l.weight=p.script==='Dancing Script'?700:400;l.fit=true}
    else{l.font=p.body;if(![500,700,800,900].includes(l.weight))l.weight=700}
  });
}

// ---------- the editor ----------
export function mountStudio(root,opts){
  opts=opts||{};
  const IMS={},tray=[];let trayN=0;
  let D=null,sel=null,hist=[],drag=null,pickFor=null,PAN=false;
  try{const s=JSON.parse(localStorage.getItem('oc_studio')||'null');if(s&&s.layers&&s.w)D=s}catch(e){}
  if(!D)D=TEMPLATES[0].build();
  const mk=(w,h)=>{const e=document.createElement('canvas');e.width=w;e.height=h;return e};
  const A={img:id=>IMS[id]||null,mk,editor:true};
  const get=id=>D.layers.find(l=>l.id===id);
  const q=s=>root.querySelector(s);
  const opt=(arr,cur)=>arr.map(a=>{const v=Array.isArray(a)?a[0]:a,t=Array.isArray(a)?a[1]:a;return`<option value="${v}"${String(v)===String(cur)?' selected':''}>${t}</option>`}).join('');
  root.innerHTML=`<div class="card"><h1>🎨 Creative Studio</h1><p class="mut">Build any flyer: use many photos, move and resize everything, change fonts and colours. Start from a design or from blank.</p>
<label for="st-tpl">Start from a design</label><div class="row"><select id="st-tpl">${TEMPLATES.map((t,i)=>`<option value="${i}">${t.name}</option>`).join('')}</select><button id="st-apply">Use this design</button></div>
<div class="row"><select id="st-size">${opt(Object.keys(SIZES),'Portrait 4:5')}</select><button class="sec sm" id="st-undo">↩ Undo</button><button class="sec sm" id="st-desel">Deselect</button></div>
<div id="st-stage" style="position:relative;line-height:0;margin-top:8px"><canvas id="st-c" style="width:100%;height:auto;border-radius:10px;box-shadow:0 4px 14px rgba(0,0,0,.25)"></canvas><canvas id="st-o" style="position:absolute;left:0;top:0;width:100%;height:100%;touch-action:none;border-radius:10px"></canvas></div>
<p class="mut" id="st-hint">Tap an item to edit it. Drag to move. Pull the blue dot to resize and the orange dot to turn it. Tap an empty photo box to add a photo.</p>
<div id="st-quick" style="background:rgba(255,255,255,.06);border-radius:12px;padding:8px 10px"><p class="mut">Tap something on the flyer to edit it here.</p></div>
<div class="row" id="st-acts" style="display:none;margin-top:6px"><button class="sec sm" id="st-up">⬆ Bring forward</button><button class="sec sm" id="st-down">⬇ Send back</button><button class="sec sm" id="st-dup">Copy</button><button class="sec sm" id="st-del">Delete</button></div>
<details open><summary><b>✨ Quick restyle (whole flyer)</b></summary><label>Colour theme</label><div id="st-themes" class="row" style="gap:6px"></div><label>Font style</label><div id="st-fonts" class="row" style="gap:6px"></div></details>
<div class="row"><button id="st-addt">+ Text</button><button id="st-addp">+ Photo</button><button id="st-adds">+ Shape</button><button id="st-addb">+ Brush stripe</button></div>
<label for="st-files">Your photos (add as many as you like)</label><input id="st-files" type="file" accept="image/*" multiple>
<div id="st-tray" class="row" style="gap:6px"></div>
<details><summary><b>More options for the selected item</b></summary><div id="st-props"><p class="mut">Nothing selected. Tap something on the flyer.</p></div></details>
<details><summary><b>All items on the flyer</b></summary><div id="st-layers" class="row" style="gap:6px"></div></details>
<details><summary><b>Background</b></summary><div id="st-bg"></div></details>
<p class="row"><button id="st-dl">⬇️ Download flyer (PNG)</button><button class="sec" id="st-sh">📤 Share</button></p>
<p id="st-note" class="mut" role="status">Saved at double size, sharp for WhatsApp, social media and printing.</p></div>`;
  const cv=q('#st-c'),ov=q('#st-o'),note=q('#st-note');
  const ctx=cv.getContext('2d'),octx=ov.getContext('2d');

  function hOf(l){return l.type==='text'?(l._h||l.size*1.2):l.h}
  function draw(){
    if(cv.width!==D.w||cv.height!==D.h){cv.width=D.w;cv.height=D.h;ov.width=D.w;ov.height=D.h}
    drawDesign(ctx,D,A);drawOverlay();
  }
  function k(){const r=ov.getBoundingClientRect();return r.width?D.w/r.width:1}
  function drawOverlay(){
    octx.clearRect(0,0,ov.width,ov.height);
    const l=get(sel);if(!l)return;
    const s=k(),w=l.w,h=hOf(l);
    octx.save();octx.translate(l.x,l.y);octx.rotate((l.rot||0)*Math.PI/180);
    octx.lineWidth=2.5*s;octx.strokeStyle='#38bdf8';octx.setLineDash([8*s,6*s]);octx.strokeRect(-w/2,-h/2,w,h);octx.setLineDash([]);
    octx.beginPath();octx.moveTo(0,-h/2);octx.lineTo(0,-h/2-38*s);octx.stroke();
    const dot=(x,y,c)=>{octx.beginPath();octx.arc(x,y,13*s,0,7);octx.fillStyle=c;octx.fill();octx.lineWidth=3*s;octx.strokeStyle='#fff';octx.stroke()};
    dot(0,-h/2-38*s,'#f59e0b');dot(w/2,h/2,'#2563eb');
    octx.restore();
    if(drag&&drag.guide){octx.strokeStyle='rgba(255,255,0,.9)';octx.lineWidth=2*s;octx.beginPath();octx.moveTo(D.w/2,0);octx.lineTo(D.w/2,D.h);octx.stroke()}
  }
  const pt=e=>{const r=ov.getBoundingClientRect(),s=D.w/r.width;return{x:(e.clientX-r.left)*s,y:(e.clientY-r.top)*s}};
  const loc=(l,p)=>{const a=-(l.rot||0)*Math.PI/180,dx=p.x-l.x,dy=p.y-l.y;return{x:dx*Math.cos(a)-dy*Math.sin(a),y:dx*Math.sin(a)+dy*Math.cos(a)}};
  function hitLayer(p){
    for(const bg of [false,true])for(let i=D.layers.length-1;i>=0;i--){
      const l=D.layers[i];if(l.hidden||l.lock)continue;
      const lo=loc(l,p);if(Math.abs(lo.x)<=l.w/2&&Math.abs(lo.y)<=hOf(l)/2)return l;
    }
    return null;
  }
  function snapshot(){return JSON.stringify(D)}
  function commit(before){
    if(before!=null&&before!==snapshot()){hist.push(before);if(hist.length>40)hist.shift()}
    try{localStorage.setItem('oc_studio',snapshot())}catch(e){}
  }
  ov.addEventListener('pointerdown',e=>{
    e.preventDefault();ov.setPointerCapture(e.pointerId);const p=pt(e),s=k(),before=snapshot();
    const l=get(sel);
    if(l){
      const lo=loc(l,p),h=hOf(l);
      if(Math.hypot(lo.x,lo.y+h/2+38*s)<22*s){drag={mode:'rot',l,a0:Math.atan2(p.y-l.y,p.x-l.x),r0:l.rot||0,before};return}
      if(Math.hypot(lo.x-l.w/2,lo.y-h/2)<22*s){drag={mode:'res',l,d0:Math.hypot(p.x-l.x,p.y-l.y)||1,i:{size:l.size,w:l.w,h:l.h},before};return}
    }
    const hit=hitLayer(p);
    if(PAN&&hit&&hit.type==='image'&&hit.src&&IMS[hit.src]&&hit.id===sel){drag={mode:'pan',l:hit,p0:p,fx0:hit.fx==null?.5:hit.fx,fy0:hit.fy==null?.25:hit.fy,before};return}
    if(hit){sel=hit.id;drag={mode:'move',l:hit,dx:p.x-hit.x,dy:p.y-hit.y,moved:false,p0:p,before}}
    else{sel=null;drag=null}
    refresh();
  });
  ov.addEventListener('pointermove',e=>{
    if(!drag)return;const p=pt(e),l=drag.l;
    if(drag.mode==='pan'){
      const im=IMS[l.src],c0=Math.cos(-(l.rot||0)*Math.PI/180),s0=Math.sin(-(l.rot||0)*Math.PI/180),dx0=p.x-drag.p0.x,dy0=p.y-drag.p0.y,dx=dx0*c0-dy0*s0,dy=dx0*s0+dy0*c0;
      const z=l.zoom||1,kk=(l.fit==='contain'?Math.min(l.w/im.width,l.h/im.height):Math.max(l.w/im.width,l.h/im.height))*z,rx=im.width*kk-l.w,ry=im.height*kk-l.h;
      {if(rx>0)l.fx=Math.max(0,Math.min(1,drag.fx0-dx/rx));if(ry>0)l.fy=Math.max(0,Math.min(1,drag.fy0-dy/ry))}
      draw();return;
    }
    if(drag.mode==='move'){
      if(Math.hypot(p.x-drag.p0.x,p.y-drag.p0.y)>6*k())drag.moved=true;
      if(!drag.moved)return;
      l.x=p.x-drag.dx;l.y=p.y-drag.dy;drag.guide=false;
      if(Math.abs(l.x-D.w/2)<10){l.x=D.w/2;drag.guide=true}
    }else if(drag.mode==='rot'){
      let r=drag.r0+(Math.atan2(p.y-l.y,p.x-l.x)-drag.a0)*180/Math.PI;
      r=((r+180)%360+360)%360-180;if(Math.abs(r)<4)r=0;l.rot=Math.round(r);
    }else if(drag.mode==='res'){
      const f=Math.max(.1,Math.hypot(p.x-l.x,p.y-l.y)/drag.d0);
      if(l.type==='text'){l.size=Math.max(8,drag.i.size*f);l.w=Math.max(40,drag.i.w*f)}
      else{l.w=Math.max(20,drag.i.w*f);l.h=Math.max(10,drag.i.h*f)}
    }
    draw();
  });
  const end=()=>{
    if(!drag)return;const d=drag;drag=null;
    if(d.mode==='move'&&!d.moved&&d.l.type==='image'&&!d.l.src){openPicker(d.l)}
    commit(d.before);draw();refresh();
  };
  ov.addEventListener('pointerup',end);ov.addEventListener('pointercancel',end);

  // ---- photos ----
  function loadFile(file){
    return new Promise(res=>{
      const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{
        const M=2200,s=Math.min(1,M/Math.max(im.width,im.height));
        let out=im;if(s<1){const c=mk(Math.round(im.width*s),Math.round(im.height*s));const x=c.getContext('2d');x.imageSmoothingQuality='high';x.drawImage(im,0,0,c.width,c.height);out=c}
        const id='p'+(++trayN);IMS[id]=out;res(id)};im.src=r.result};r.readAsDataURL(file);
    });
  }
  const fileIn=q('#st-files');
  const pickIn=document.createElement('input');pickIn.type='file';pickIn.accept='image/*';pickIn.style.display='none';root.appendChild(pickIn);

  // ---- remove background (tap colour, brushes, auto for people) ----
  let SEG=null;
  function openCutout(l){
    const baseId=l.orig||l.src,im=IMS[baseId];if(!im)return;
    const M=1100,sc0=Math.min(1,M/Math.max(im.width,im.height)),W=Math.max(1,Math.round(im.width*sc0)),H=Math.max(1,Math.round(im.height*sc0));
    const bc=mk(W,H),bx=bc.getContext('2d',{willReadFrequently:true});bx.drawImage(im,0,0,W,H);
    const sd=bx.getImageData(0,0,W,H).data;
    let mask=new Uint8Array(W*H).fill(255);const undo=[];let mode='pick';
    const wrap=document.createElement('div');
    wrap.style.cssText='position:fixed;left:0;top:0;right:0;bottom:0;z-index:9999;background:#0b1224;overflow:auto;padding:10px;-webkit-overflow-scrolling:touch';
    wrap.innerHTML=`<div style="max-width:460px;margin:0 auto;color:#fff">
<h3 style="margin:6px 0">✂️ Remove background</h3>
<p style="font-size:.92rem;margin:4px 0 8px">Tap the background colour to wipe it, or try Auto. Fix leftovers with the brushes, then tap Done.</p>
<div class="row" id="cu-modes" style="gap:6px"><button class="sm" data-m="pick">👆 Tap background</button><button class="sec sm" data-m="erase">🧽 Rub out</button><button class="sec sm" data-m="restore">🖌 Bring back</button></div>
<div style="margin:8px 0;line-height:0"><canvas id="cu-c" width="${W}" height="${H}" style="width:100%;height:auto;touch-action:none;border-radius:10px;background:conic-gradient(#bbb 25%,#fff 0 50%,#bbb 0 75%,#fff 0) 0 0/20px 20px"></canvas></div>
<label style="color:#fff">How similar colours to remove <span id="cu-tv">30</span></label><input type="range" id="cu-tol" min="4" max="90" value="30">
<label style="color:#fff"><input type="checkbox" id="cu-glob"> Also remove the same colour elsewhere (gaps, between arms)</label>
<label style="color:#fff">Brush size <span id="cu-bv">26</span></label><input type="range" id="cu-bs" min="6" max="70" value="26">
<label style="color:#fff">Soft edges <span id="cu-fv">1</span></label><input type="range" id="cu-ft" min="0" max="4" value="1">
<p class="row"><button class="sec sm" id="cu-auto">✨ Auto (best for people)</button><button class="sec sm" id="cu-undo">↩ Undo</button><button class="sec sm" id="cu-reset">Start again</button></p>
<p id="cu-note" style="font-size:.9rem;min-height:1.3em">Tap the background of your photo.</p>
<p class="row"><button id="cu-ok">✅ Done</button><button class="sec" id="cu-x">Cancel</button></p></div>`;
    document.body.appendChild(wrap);
    const $=s=>wrap.querySelector(s),cvs=$('#cu-c'),cx=cvs.getContext('2d',{willReadFrequently:true}),od=cx.createImageData(W,H),dd=od.data;
    for(let i=0,p=0;i<W*H;i++,p+=4){dd[p]=sd[p];dd[p+1]=sd[p+1];dd[p+2]=sd[p+2];dd[p+3]=255}
    const cn=t=>{$('#cu-note').textContent=t};
    const render=()=>{for(let i=0,p=3;i<mask.length;i++,p+=4)dd[p]=mask[i];cx.putImageData(od,0,0)};
    const push=()=>{undo.push(mask.slice());if(undo.length>20)undo.shift()};
    render();
    const setMode=m=>{mode=m;wrap.querySelectorAll('#cu-modes button').forEach(b=>{b.className=(b.dataset.m===m?'':'sec ')+'sm'});cn(m==='pick'?'Tap the background colour.':m==='erase'?'Rub over what should disappear.':'Rub over what should come back.')};
    wrap.querySelectorAll('#cu-modes button').forEach(b=>b.onclick=()=>setMode(b.dataset.m));
    [['cu-tol','cu-tv'],['cu-bs','cu-bv'],['cu-ft','cu-fv']].forEach(([a,b])=>{$('#'+a).oninput=()=>{$('#'+b).textContent=$('#'+a).value}});
    const xy=e=>{const r=cvs.getBoundingClientRect();return{x:Math.max(0,Math.min(W-1,Math.round((e.clientX-r.left)*W/r.width))),y:Math.max(0,Math.min(H-1,Math.round((e.clientY-r.top)*H/r.height))),k:W/r.width}};
    function pickAt(px,py){
      let r=0,g=0,b=0,n=0;
      for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){const x=px+dx,y=py+dy;if(x<0||y<0||x>=W||y>=H)continue;const p=(y*W+x)*4;r+=sd[p];g+=sd[p+1];b+=sd[p+2];n++}
      r/=n;g/=n;b/=n;
      const th=+$('#cu-tol').value*2.4,t2=th*th,near=i=>{const p=i*4,a=sd[p]-r,c=sd[p+1]-g,d=sd[p+2]-b;return a*a+c*c+d*d<=t2};
      push();let cnt=0;
      if($('#cu-glob').checked){for(let i=0;i<mask.length;i++)if(near(i)&&mask[i]){mask[i]=0;cnt++}}
      else{
        const seen=new Uint8Array(W*H),st=new Int32Array(W*H);let sp=0;const s0=py*W+px;
        if(near(s0)){st[sp++]=s0;seen[s0]=1}
        while(sp){const i=st[--sp];if(mask[i]){mask[i]=0;cnt++}const x=i%W,y=(i/W)|0;
          if(x>0&&!seen[i-1]&&near(i-1)){seen[i-1]=1;st[sp++]=i-1}
          if(x<W-1&&!seen[i+1]&&near(i+1)){seen[i+1]=1;st[sp++]=i+1}
          if(y>0&&!seen[i-W]&&near(i-W)){seen[i-W]=1;st[sp++]=i-W}
          if(y<H-1&&!seen[i+W]&&near(i+W)){seen[i+W]=1;st[sp++]=i+W}}
      }
      render();cn(cnt?'Removed. Tap again to remove more, or raise "how similar" if bits are left.':'Nothing matched there. Raise "how similar" or tap a different spot.');
    }
    function brushAt(px,py,k,val){
      const r=Math.max(2,(+$('#cu-bs').value/2)*k),r2=r*r,x0=Math.max(0,Math.floor(px-r)),x1=Math.min(W-1,Math.ceil(px+r)),y0=Math.max(0,Math.floor(py-r)),y1=Math.min(H-1,Math.ceil(py+r));
      for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const a=x-px,b=y-py;if(a*a+b*b<=r2)mask[y*W+x]=val}
    }
    let down=null;
    cvs.addEventListener('pointerdown',e=>{
      e.preventDefault();cvs.setPointerCapture(e.pointerId);const p=xy(e);
      if(mode==='pick'){pickAt(p.x,p.y);return}
      push();down=p;brushAt(p.x,p.y,p.k,mode==='erase'?0:255);render();
    });
    cvs.addEventListener('pointermove',e=>{
      if(!down)return;const p=xy(e),dx=p.x-down.x,dy=p.y-down.y,n=Math.max(1,Math.ceil(Math.hypot(dx,dy)/Math.max(2,+$('#cu-bs').value*p.k/4)));
      for(let i=1;i<=n;i++)brushAt(down.x+dx*i/n,down.y+dy*i/n,p.k,mode==='erase'?0:255);
      down=p;render();
    });
    const up=()=>{down=null};cvs.addEventListener('pointerup',up);cvs.addEventListener('pointercancel',up);
    $('#cu-undo').onclick=()=>{if(undo.length){mask=undo.pop();render();cn('Undone.')}else cn('Nothing to undo.')};
    $('#cu-reset').onclick=()=>{push();mask.fill(255);render();cn('Started again. Tap the background.')};
    $('#cu-x').onclick=()=>wrap.remove();
    $('#cu-auto').onclick=async()=>{
      const btn=$('#cu-auto');btn.disabled=true;
      try{
        cn('Loading the auto tool. The first time needs internet and can take a minute…');
        const V='https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14';
        const mod=await import(V+'/vision_bundle.mjs');
        if(!SEG){
          const fs=await mod.FilesetResolver.forVisionTasks(V+'/wasm');
          SEG=await mod.ImageSegmenter.createFromOptions(fs,{baseOptions:{modelAssetPath:'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite',delegate:'CPU'},runningMode:'IMAGE',outputConfidenceMasks:true,outputCategoryMask:false});
        }
        cn('Finding the person…');
        const res=SEG.segment(bc),ms=res.confidenceMasks,m=ms[ms.length>1?1:0],f=m.getAsFloat32Array(),mw=m.width,mh=m.height;
        const sm=mk(mw,mh),sx=sm.getContext('2d',{willReadFrequently:true}),sid=sx.createImageData(mw,mh);
        for(let i=0;i<mw*mh;i++){const p=i*4;sid.data[p]=sid.data[p+1]=sid.data[p+2]=0;sid.data[p+3]=Math.max(0,Math.min(255,f[i]*255))}
        sx.putImageData(sid,0,0);
        const bg=mk(W,H),bgx=bg.getContext('2d',{willReadFrequently:true});bgx.imageSmoothingQuality='high';bgx.drawImage(sm,0,0,W,H);
        const A2=bgx.getImageData(0,0,W,H).data,pr=new Float32Array(W*H);
        for(let i=0;i<W*H;i++)pr[i]=A2[i*4+3]/255;
        let bs=0,bn=0;for(let x=0;x<W;x++){bs+=pr[x]+pr[(H-1)*W+x];bn+=2}for(let y=0;y<H;y++){bs+=pr[y*W]+pr[y*W+W-1];bn+=2}
        const inv=bs/bn>.5;
        push();
        for(let i=0;i<W*H;i++){let v=inv?1-pr[i]:pr[i];v=Math.max(0,Math.min(1,(v-.35)/.3));v=v*v*(3-2*v);mask[i]=Math.round(v*255)}
        try{res.close&&res.close()}catch(e){}
        render();cn('Done. Fix any leftovers with the brushes, then tap Done.');
      }catch(err){
        console.error(err);cn('The auto tool could not load (it needs a good internet connection). Use "Tap background" instead.');
      }
      btn.disabled=false;
    };
    $('#cu-ok').onclick=()=>{
      let m=mask;const r=+$('#cu-ft').value;
      if(r>0){
        const t=new Float32Array(W*H),o=new Uint8Array(W*H),n=2*r+1;
        for(let y=0;y<H;y++){let a=0;for(let x=-r;x<=r;x++)a+=m[y*W+Math.max(0,Math.min(W-1,x))];for(let x=0;x<W;x++){t[y*W+x]=a/n;a+=m[y*W+Math.min(W-1,x+r+1)]-m[y*W+Math.max(0,x-r)]}}
        for(let x=0;x<W;x++){let a=0;for(let y=-r;y<=r;y++)a+=t[Math.max(0,Math.min(H-1,y))*W+x];for(let y=0;y<H;y++){o[y*W+x]=Math.round(a/n);a+=t[Math.min(H-1,y+r+1)*W+x]-t[Math.max(0,y-r)*W+x]}}
        m=o;
      }
      const fc=mk(W,H),fx=fc.getContext('2d'),fi=fx.createImageData(W,H);
      for(let i=0,p=0;i<W*H;i++,p+=4){fi.data[p]=sd[p];fi.data[p+1]=sd[p+1];fi.data[p+2]=sd[p+2];fi.data[p+3]=m[i]}
      fx.putImageData(fi,0,0);
      const id='p'+(++trayN);IMS[id]=fc;
      const b=snapshot();l.orig=baseId;l.src=id;l.shape='free';l.fade='none';l.bw=0;commit(b);
      wrap.remove();note.textContent='Background removed ✅ Tap “Bring back background” if you change your mind.';
      refresh();draw();
    };
  }
  function openPicker(l){pickFor=l.id;pickIn.value='';pickIn.click()}
  pickIn.addEventListener('change',async()=>{
    const f=pickIn.files&&pickIn.files[0];if(!f||!pickFor)return;
    const id=await loadFile(f);tray.push(id);const l=get(pickFor);pickFor=null;
    if(l){const b=snapshot();if(l.type==='image'){l.src=id;l.orig=null}commit(b)}
    refresh();draw();
  });
  fileIn.addEventListener('change',async()=>{
    const files=[...fileIn.files];if(!files.length)return;
    note.textContent='Loading photos…';
    const b=snapshot();
    for(const f of files){const id=await loadFile(f);tray.push(id)}
    autofill();commit(b);fileIn.value='';note.textContent=files.length+' photo(s) added. Tap a photo below to place it, or tap an empty photo box on the flyer.';
    refresh();draw();
  });
  function autofill(){
    const empties=D.layers.filter(l=>l.type==='image'&&!l.src&&!l.logo);
    const used=new Set(D.layers.filter(l=>l.type==='image'&&l.src).map(l=>l.src));
    const free=tray.filter(id=>!used.has(id));
    empties.forEach((l,i)=>{if(free[i])l.src=free[i]});
  }
  function renderTray(){
    const t=q('#st-tray');t.innerHTML='';
    tray.forEach(id=>{
      const im=IMS[id],c=mk(54,54),x=c.getContext('2d');const z=Math.max(54/im.width,54/im.height);x.drawImage(im,(54-im.width*z)/2,(54-im.height*z)/2,im.width*z,im.height*z);
      const b=document.createElement('button');b.className='sec sm';b.style.cssText='padding:0;width:54px;height:54px;border-radius:10px;overflow:hidden;line-height:0';b.title='Tap: put this photo on the selected photo box, or add it as a new photo';
      c.style.cssText='width:54px;height:54px';b.appendChild(c);
      b.onclick=()=>{
        const l=get(sel),bf=snapshot();
        if(l&&l.type==='image'){l.src=id;l.orig=null}
        else{const n=F.img(D.w/2,D.h/2,420,520,{src:id});D.layers.push(n);sel=n.id}
        commit(bf);refresh();draw();
      };
      t.appendChild(b);
    });
  }

  // ---- panels ----
  const OPEN={};
  function fields(l){
    const o=[];
    const add=(key,label,type,x)=>o.push(Object.assign({key,label,type},x));
    if(l.type==='text'){
      add('text','Words','area');add('font','Font','sel',{opts:FONTS});add('size','Size','range',{min:10,max:420,step:1});add('w','Line width','range',{min:60,max:1080,step:1});
      add('color','Colour','color');add('grad','Gold shine instead of colour','chk');
      add('weight','Boldness','sel',{opts:[[400,'Normal'],[500,'Medium'],[700,'Bold'],[800,'Extra bold'],[900,'Black']]});
      add('align','Alignment','sel',{opts:[['left','Left'],['center','Centre'],['right','Right']]});
      add('italic','Slanted','chk');add('upper','ALL CAPITALS','chk');add('lh','Line spacing','range',{min:.7,max:2,step:.05});add('ls','Letter spacing','range',{min:0,max:30,step:1});
      add('fit','Shrink to fit the line width','chk');add('shadow','Soft shadow','chk');add('extrude','3D depth','range',{min:0,max:30,step:1});add('extrudeColor','3D colour','color');
      add('sw','Outline thickness','range',{min:0,max:20,step:1});add('sc','Outline colour','color');
    }else if(l.type==='image'){
      add('shape','Photo shape','sel',{opts:[['rounded','Rounded box'],['rect','Square corners'],['circle','Circle / oval'],['arch','Arch'],['free','Free (no frame, blends)']]});
      add('w','Width','range',{min:40,max:1500,step:1});add('h','Height','range',{min:40,max:2000,step:1});
      add('zoom','Zoom in the photo','range',{min:1,max:4,step:.05});add('fx','Move photo left / right','range',{min:0,max:1,step:.01});add('fy','Move photo up / down','range',{min:0,max:1,step:.01});
      add('fit','How the photo fits the box','sel',{opts:[['cover','Fill the box (crops edges)'],['contain','Show the whole photo']]});
      add('flip','Mirror the photo (flip left / right)','chk');
      add('br','Brightness','range',{min:-100,max:100,step:1,def:0});add('ct','Contrast','range',{min:-100,max:100,step:1,def:0});
      add('sat','Colour strength','range',{min:-100,max:100,step:1,def:0});add('warm','Warm (+) or cool (-)','range',{min:-100,max:100,step:1,def:0});
      add('smooth','Smoothness (soften skin)','range',{min:0,max:100,step:1,def:0});
      add('tone','Colour look','sel',{opts:[['none','Original'],['bw','Black and white'],['sepia','Old photo (sepia)'],['vivid','Vivid']]});
      add('fade','Fade the edges (blend)','sel',{opts:[['none','No fade'],['bottom','Bottom'],['top','Top'],['sides','Left and right'],['all','All edges']]});
      add('radius','Corner roundness','range',{min:0,max:200,step:1});add('bw','Border thickness','range',{min:0,max:24,step:1});add('bc','Border colour','color');add('shadow','Shadow','chk');
    }else if(l.type==='shape'){
      add('kind','Shape','sel',{opts:[['rect','Box'],['pill','Pill'],['circle','Circle'],['brush','Brush stripe'],['torn','Torn paper']]});
      add('w','Width','range',{min:10,max:1500,step:1});add('h','Height','range',{min:2,max:1200,step:1});
      add('c1','Colour','color');add('grad','Gradient','chk');add('c2','Second colour','color');add('radius','Corner roundness','range',{min:0,max:200,step:1});
      add('sw','Outline thickness','range',{min:0,max:20,step:1});add('sc','Outline colour','color');add('shadow','Shadow','chk');
    }else if(l.type==='glow'){add('color','Colour','color');add('w','Size','range',{min:100,max:2000,step:10})}
    else if(l.type==='dots'){add('color','Colour','color');add('count','How many','range',{min:5,max:120,step:1});add('seed','Shuffle','range',{min:1,max:99,step:1})}
    add('rot','Turn','range',{min:-180,max:180,step:1});add('opacity','See-through (opacity)','range',{min:.05,max:1,step:.05});add('lock','Lock (cannot be dragged)','chk');
    return o;
  }
  const hex=v=>/^#[0-9a-f]{6}$/i.test(v)?v:'#ffffff';
  function renderFields(cont,l,list,prefix){
    let h='';
    list.forEach(f=>{
      const v=l[f.key],id=prefix+f.key;
      h+=`<div style="margin:6px 0"></div>`.slice(0,-6)+`<label style="display:block" for="${id}">${f.label}${f.type==='range'?` <span class="mut" id="${id}-v">${v==null?(f.def==null?'':f.def):Math.round(v*100)/100}</span>`:''}</label>`;
      if(f.type==='area')h+=`<textarea id="${id}" data-k="${f.key}" rows="3">${String(v||'').replace(/&/g,'&amp;').replace(/</g,'&lt;')}</textarea>`;
      else if(f.type==='sel')h+=`<select id="${id}" data-k="${f.key}">${opt(f.opts,v)}</select>`;
      else if(f.type==='color')h+=`<input type="color" id="${id}" data-k="${f.key}" value="${hex(v)}">`;
      else if(f.type==='chk')h+=`<input type="checkbox" id="${id}" data-k="${f.key}"${v?' checked':''}>`;
      else h+=`<input type="range" id="${id}" data-k="${f.key}" min="${f.min}" max="${f.max}" step="${f.step}" value="${v==null?(f.def==null?f.min:f.def):v}">`;
      h+='</div>';
    });
    cont.innerHTML=h;
  }
  const QUICK={text:['text','font','size','color','grad'],image:['shape','zoom','fit','br','ct','sat','warm','smooth','tone','fade'],shape:['kind','c1'],glow:['color'],dots:['color']};
  function refreshProps(){
    const p=q('#st-props'),qk=q('#st-quick'),l=get(sel),a=q('#st-acts');
    if(!l){p.innerHTML='<p class="mut">Nothing selected. Tap something on the flyer.</p>';qk.innerHTML='<p class="mut">Tap something on the flyer to edit it here.</p>';a.style.display='none';return}
    a.style.display='';
    const all=fields(l);
    renderFields(qk,l,all.filter(f=>QUICK[l.type].includes(f.key)),'st-q-');
    if(l.type==='image')qk.insertAdjacentHTML('afterbegin','<p class="row"><button class="sec sm" data-pick="1">📷 Choose photo</button>'+(l.src?'<button class="sec sm" data-cut="1">✂️ Remove background</button><button class="'+(PAN?'':'sec ')+'sm" data-pan="1">✋ Move photo inside box: '+(PAN?'ON':'OFF')+'</button>':'')+'</p><p class="row">'+(l.src?'<button class="sec sm" data-resetadj="1">↺ Reset colours</button>':'')+(l.orig?'<button class="sec sm" data-restore="1">Bring back background</button>':'')+'<button class="sec sm" data-clearimg="1">Empty this box</button></p>');
    renderFields(p,l,all,'st-f-');
  }
  function onProp(e){
    const el=e.target,key=el.dataset&&el.dataset.k,l=get(sel);if(!key||!l)return;
    if(!OPEN.b)OPEN.b=snapshot();
    let v=el.type==='checkbox'?el.checked:el.type==='range'?parseFloat(el.value):el.value;
    if(key==='weight'||key==='extrude'||key==='size')v=parseFloat(v);
    l[key]=v;
    const sp=q('#'+el.id+'-v');if(sp)sp.textContent=Math.round(v*100)/100;
    draw();
  }
  function onPropDone(){if(OPEN.b){commit(OPEN.b);OPEN.b=null}refreshProps()}
  function onPropClick(e){
    const l=get(sel);if(!l)return;
    if(e.target.dataset.pick)openPicker(l);
    if(e.target.dataset.clearimg){const b=snapshot();l.src=null;l.orig=null;commit(b);draw();refreshProps()}
    if(e.target.dataset.cut)openCutout(l);
    if(e.target.dataset.pan){PAN=!PAN;refreshProps();note.textContent=PAN?'Now drag on the photo to move it inside its box. Tap the button again to move the box instead.':'Dragging moves the whole box again.'}
    if(e.target.dataset.resetadj){const b=snapshot();['br','ct','sat','warm','smooth'].forEach(k=>{l[k]=0});l.tone='none';l.flip=false;commit(b);draw();refreshProps()}
    if(e.target.dataset.restore&&l.orig){const b=snapshot();l.src=l.orig;l.orig=null;l.shape='rounded';commit(b);draw();refreshProps()}
  }
  ['#st-props','#st-quick'].forEach(id=>{const el=q(id);el.addEventListener('input',onProp);el.addEventListener('change',onPropDone);el.addEventListener('click',onPropClick)});
  function layerName(l,i){
    if(l.type==='text')return'Aa '+String(l.text||'').replace(/\n/g,' ').slice(0,14);
    if(l.type==='image')return(l.logo?'Logo ':'Photo ')+(i+1);
    if(l.type==='shape')return'Shape '+(i+1);
    return l.type==='glow'?'Glow '+(i+1):'Sparkles '+(i+1);
  }
  function refreshLayers(){
    const t=q('#st-layers');t.innerHTML='';
    for(let i=D.layers.length-1;i>=0;i--){
      const l=D.layers[i],b=document.createElement('button');b.className=l.id===sel?'sm':'sec sm';b.textContent=layerName(l,i)+(l.hidden?' (hidden)':'');
      b.onclick=()=>{sel=l.id;refresh();draw()};t.appendChild(b);
    }
  }
  function refreshBg(){
    const b=D.bg,bgp=q('#st-bg');
    bgp.innerHTML=`<label>Background type</label><select id="st-bgm">${opt([['grad','Two colours (gradient)'],['solid','One colour']],b.mode)}</select>
<label>Colour 1</label><input type="color" id="st-bg1" value="${hex(b.c1)}"><label>Colour 2</label><input type="color" id="st-bg2" value="${hex(b.c2)}">
<label>Direction</label><input type="range" id="st-bga" min="0" max="360" value="${b.angle==null?160:b.angle}">
<label>Background picture</label><select id="st-bgi"><option value="">None</option>${tray.map((id,i)=>`<option value="${id}"${D.bgImg===id?' selected':''}>Photo ${i+1}</option>`).join('')}</select>
<label>Darken the picture</label><input type="range" id="st-bgd" min="0" max="0.9" step="0.05" value="${D.bgDim||0}">
<label>Blur the picture</label><input type="checkbox" id="st-bgb"${D.bgBlur?' checked':''}>
<p class="row"><input id="st-ai" placeholder="Describe AI background art, e.g. golden light over hills"><button class="sec sm" id="st-aib">✨ Make AI background</button></p>`;
  }
  q('#st-bg').addEventListener('input',e=>{
    const id=e.target.id;if(!OPEN.b)OPEN.b=snapshot();
    if(id==='st-bgm')D.bg.mode=e.target.value;else if(id==='st-bg1')D.bg.c1=e.target.value;else if(id==='st-bg2')D.bg.c2=e.target.value;
    else if(id==='st-bga')D.bg.angle=parseFloat(e.target.value);else if(id==='st-bgi')D.bgImg=e.target.value||null;
    else if(id==='st-bgd')D.bgDim=parseFloat(e.target.value);else if(id==='st-bgb')D.bgBlur=e.target.checked;
    draw();
  });
  q('#st-bg').addEventListener('change',()=>{if(OPEN.b){commit(OPEN.b);OPEN.b=null}});
  q('#st-bg').addEventListener('click',async e=>{
    if(e.target.id!=='st-aib')return;
    if(!opts.makeImage){note.textContent='AI art is not available here.';return}
    const pr=(q('#st-ai').value||'soft golden light over a church, peaceful')+', elegant, no text';
    note.textContent='Painting your background… about 15 seconds ✨';
    try{
      const url=await opts.makeImage(pr);
      const im=new Image();im.onload=()=>{const id='p'+(++trayN);IMS[id]=im;tray.push(id);const b=snapshot();D.bgImg=id;commit(b);refresh();draw();note.textContent='Background added!'};im.src=url;
    }catch(err){note.textContent=String(err&&err.message||err)}
  });
  function renderRestyle(){
    const t=q('#st-themes');t.innerHTML='';
    THEMES.forEach(th=>{const b=document.createElement('button');b.className='sec sm';b.textContent=th.name;b.style.cssText='background:linear-gradient(135deg,'+th.c1+','+th.c2+');color:'+(th.light?th.ink:'#fff')+';border:2px solid '+th.accent+';text-shadow:'+(th.light?'none':'0 1px 3px rgba(0,0,0,.7)');b.onclick=act(()=>applyTheme(D,th));t.appendChild(b)});
    const f=q('#st-fonts');f.innerHTML='';
    FONTPACKS.forEach(p=>{const b=document.createElement('button');b.className='sec sm';b.textContent=p.name;b.style.fontFamily='"'+p.title+'",sans-serif';b.onclick=act(()=>applyFontPack(D,p));f.appendChild(b)});
  }
  function refresh(){refreshProps();refreshLayers();renderTray();refreshBg();drawOverlay()}

  // ---- toolbar ----
  const act=fn=>()=>{const b=snapshot();fn();commit(b);refresh();draw()};
  q('#st-apply').onclick=act(()=>{D=TEMPLATES[parseInt(q('#st-tpl').value,10)||0].build();sel=null;q('#st-size').value='Portrait 4:5';autofill()});
  q('#st-size').onchange=act(()=>{
    const s=SIZES[q('#st-size').value];if(!s)return;const r=s[1]/D.h;
    D.layers.forEach(l=>{l.y*=r;if(l.type==='dots'||l.type==='shape'&&l.w>=1000||l.type==='image'&&l.w>=1000)l.h*=r});
    D.w=s[0];D.h=s[1];
  });
  q('#st-undo').onclick=()=>{const s=hist.pop();if(!s){note.textContent='Nothing to undo.';return}D=JSON.parse(s);if(!get(sel))sel=null;try{localStorage.setItem('oc_studio',snapshot())}catch(e){}refresh();draw()};
  q('#st-desel').onclick=()=>{sel=null;refresh();draw()};
  q('#st-addt').onclick=act(()=>{const n=F.text('Your words',D.w/2,D.h/2,700,90,{font:'Anton',weight:400,lh:1.05,shadow:true});D.layers.push(n);sel=n.id});
  q('#st-addp').onclick=act(()=>{const n=F.img(D.w/2,D.h/2,420,520,{});D.layers.push(n);sel=n.id;autofill()});
  q('#st-adds').onclick=act(()=>{const n=F.shape('pill',D.w/2,D.h/2,500,110,{c1:'#ffd21a'});D.layers.push(n);sel=n.id});
  q('#st-addb').onclick=act(()=>{const n=F.shape('brush',D.w/2,D.h/2,560,170,{c1:'#e02020',seed:Math.floor(Math.random()*900)+1});D.layers.push(n);sel=n.id});
  q('#st-up').onclick=act(()=>{const i=D.layers.findIndex(l=>l.id===sel);if(i>=0&&i<D.layers.length-1){const t=D.layers[i];D.layers[i]=D.layers[i+1];D.layers[i+1]=t}});
  q('#st-down').onclick=act(()=>{const i=D.layers.findIndex(l=>l.id===sel);if(i>0){const t=D.layers[i];D.layers[i]=D.layers[i-1];D.layers[i-1]=t}});
  q('#st-dup').onclick=act(()=>{const l=get(sel);if(!l)return;const c=JSON.parse(JSON.stringify(l));c.id=nid();c.x+=30;c.y+=30;c.lock=false;D.layers.push(c);sel=c.id});
  q('#st-del').onclick=act(()=>{const i=D.layers.findIndex(l=>l.id===sel);if(i>=0)D.layers.splice(i,1);sel=null});

  // ---- export ----
  function exportBlob(cb){
    const S=2,c=mk(D.w*S,D.h*S),x=c.getContext('2d');x.imageSmoothingQuality='high';
    drawDesign(x,D,{img:A.img,mk,editor:false,base:[S,0,0,S,0,0]});
    c.toBlob(cb,'image/png');
  }
  q('#st-dl').onclick=()=>exportBlob(bl=>{const a=document.createElement('a');a.href=URL.createObjectURL(bl);a.download='flyer.png';document.body.appendChild(a);a.click();a.remove();note.textContent='Saved to your Downloads ✅'});
  q('#st-sh').onclick=()=>exportBlob(async bl=>{
    const f=new File([bl],'flyer.png',{type:'image/png'});
    try{if(navigator.canShare&&navigator.canShare({files:[f]}))await navigator.share({files:[f],title:'Flyer'});else note.textContent='Sharing is not available here. Use Download instead.'}catch(e){}
  });
  renderRestyle();
  q('#st-size').value=(Object.keys(SIZES).find(n=>SIZES[n][1]===D.h&&SIZES[n][0]===D.w))||'Portrait 4:5';
  refresh();draw();
  if(document.fonts&&document.fonts.load){
    Promise.all(FONTS.map(f=>document.fonts.load('700 40px "'+f+'"','ABC abc 123').catch(()=>{}))).then(()=>draw());
  }
  addEventListener('resize',drawOverlay);
  return{redraw:draw,design:()=>D,select:id=>{sel=id;refresh();draw()},addImages:async files=>{for(const f of files){tray.push(await loadFile(f))}autofill();refresh();draw()},exportBlob};
}
