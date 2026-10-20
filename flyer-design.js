// OrganizeChurch flyer designer: draws a professional church flyer on a canvas.
// Exports: SIZES, THEMES, DEFAULTS, renderFlyer(ctx, data, imgs, makeCanvas)
export const SIZES={Portrait:[1080,1350],Landscape:[1500,1000]};
// theme: [bg dark, bg mid, panel dark, cream, ink (text on cream), light text, glow]
export const THEMES={
'Green and Gold':{bg:['#06281d','#0f5a3f'],panel:'#0a3a29',cream:'#fbf3dc',ink:'#0a3a29',txt:'#ffffff',gold:['#8a5a12','#f6e27a','#c8921f','#fff3b0','#9a6a14']},
'Royal Blue and Gold':{bg:['#081a4d','#1a49b8'],panel:'#0a2266',cream:'#fbf6e6',ink:'#0a2266',txt:'#ffffff',gold:['#8a5a12','#f6e27a','#c8921f','#fff3b0','#9a6a14']},
'Purple and Gold':{bg:['#2a0a4a','#6b2fb8'],panel:'#3a1068',cream:'#fbf3e6',ink:'#3a1068',txt:'#ffffff',gold:['#8a5a12','#f6e27a','#c8921f','#fff3b0','#9a6a14']},
'Burgundy and Gold':{bg:['#3a0713','#8a1c33'],panel:'#561020',cream:'#fcf1e0',ink:'#561020',txt:'#ffffff',gold:['#8a5a12','#f6e27a','#c8921f','#fff3b0','#9a6a14']},
'Black and Gold':{bg:['#0b0b0d','#2a2a30'],panel:'#141418',cream:'#f8f1dc',ink:'#141418',txt:'#ffffff',gold:['#8a5a12','#f6e27a','#c8921f','#fff3b0','#9a6a14']},
'Sky Blue and White':{bg:['#0b5fb0','#5cc2f2'],panel:'#0a4d96',cream:'#ffffff',ink:'#0a4d96',txt:'#ffffff',gold:['#b8860b','#ffe27a','#f2b632','#fff6c4','#c08a1a']}
};
export const DEFAULTS={
size:'Portrait',theme:'Green and Gold',photoShape:'Arch',
org:'CHURCH OF NIGERIA\n(Anglican Communion)\nDIOCESE OF YOUR DIOCESE\nWOMEN\'S GUILD',
invite:'Joyfully Invites You to Our',
title:'10TH ANNUAL THANKSGIVING',sub:'CONFERENCE',
theme_:'BUILDING FAITH IN A CHALLENGING WORLD',scripture:'Genesis 6:22',
date:'Saturday, 25th October, 2026',venue:'St. Peter\'s Cathedral, Isiokpo',time:'9:00 AM Prompt',
guest:'Mrs. Grace Adeyemi',role:'Guest Speaker\nDiocesan Women President',
closing:'Come and be strengthened, inspired and established in faith!',
contact:''
};
const FS='Cinzel,"Playfair Display",Georgia,"Times New Roman",serif',SC='"Great Vibes","Brush Script MT",cursive',SA='Montserrat,"Segoe UI",Roboto,Arial,sans-serif';

function goldFill(c,T,y0,y1){const g=c.createLinearGradient(0,y0,0,y1),s=T.gold;s.forEach((col,i)=>g.addColorStop(i/(s.length-1),col));return g}
function rr(c,x,y,w,h,r){r=Math.min(r,w/2,h/2);c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
function wrap(c,t,maxW){
  const out=[];String(t||'').split('\n').forEach(p=>{let l='';p.split(/\s+/).filter(Boolean).forEach(w=>{const s=l?l+' '+w:w;if(c.measureText(s).width>maxW&&l){out.push(l);l=w}else l=s});if(l)out.push(l)});return out;
}
// shrink font until text fits in maxLines lines
function fit(c,t,fontFn,maxW,start,min,maxLines){
  let s=start,lines;
  for(;s>=min;s-=2){c.font=fontFn(s);lines=wrap(c,t,maxW);if(lines.length<=maxLines&&lines.every(l=>c.measureText(l).width<=maxW))return{s,lines}}
  c.font=fontFn(min);return{s:min,lines:wrap(c,t,maxW).slice(0,maxLines)};
}
function spaced(c,t,cx,y,sp,fill){
  const ch=[...t];let w=0;ch.forEach(k=>w+=c.measureText(k).width+sp);w-=sp;
  let x=cx-w/2;c.textAlign='left';if(fill)c.fillStyle=fill;
  ch.forEach(k=>{c.fillText(k,x,y);x+=c.measureText(k).width+sp});c.textAlign='center';return w;
}
function spacedWidth(c,t,sp){let w=0;[...t].forEach(k=>w+=c.measureText(k).width+sp);return w-sp}
function diamond(c,x,y,r,fill){c.fillStyle=fill;c.beginPath();c.moveTo(x,y-r);c.lineTo(x+r,y);c.lineTo(x,y+r);c.lineTo(x-r,y);c.closePath();c.fill()}
function divider(c,T,cx,y,w){
  const g=c.createLinearGradient(cx-w/2,0,cx+w/2,0);g.addColorStop(0,'rgba(246,226,122,0)');g.addColorStop(.5,T.gold[1]);g.addColorStop(1,'rgba(246,226,122,0)');
  c.fillStyle=g;c.fillRect(cx-w/2,y-1.5,w,3);diamond(c,cx,y,7,T.gold[1]);
}
function goldBorder(c,T,x,y,w,h,r,lw){
  const g=c.createLinearGradient(x,y,x+w,y+h);T.gold.forEach((col,i)=>g.addColorStop(i/(T.gold.length-1),col));
  c.strokeStyle=g;c.lineWidth=lw;rr(c,x,y,w,h,r);c.stroke();
}
function shadow(c,col,b,oy){c.shadowColor=col;c.shadowBlur=b;c.shadowOffsetY=oy||0}
function noShadow(c){c.shadowColor='transparent';c.shadowBlur=0;c.shadowOffsetY=0;c.shadowOffsetX=0}

// icons drawn as vectors (r = radius of the gold disc)
function icon(c,T,kind,cx,cy,r){
  c.save();c.fillStyle=goldFill(c,T,cy-r,cy+r);c.beginPath();c.arc(cx,cy,r,0,Math.PI*2);c.fill();
  c.strokeStyle=T.panel;c.fillStyle=T.panel;c.lineWidth=r*.12;c.lineCap='round';c.lineJoin='round';
  const u=r/10;
  if(kind==='date'){rr(c,cx-6*u,cy-5*u,12*u,11*u,1.5*u);c.stroke();c.fillRect(cx-6*u,cy-5*u,12*u,3.2*u);c.fillRect(cx-3.5*u,cy-7*u,1.6*u,3*u);c.fillRect(cx+2*u,cy-7*u,1.6*u,3*u);for(let i=0;i<3;i++)for(let j=0;j<2;j++)c.fillRect(cx-4.2*u+i*3.4*u,cy+0.3*u+j*3*u,2*u,1.8*u)}
  else if(kind==='venue'){c.beginPath();c.moveTo(cx,cy+7*u);c.bezierCurveTo(cx-7*u,cy-1*u,cx-6*u,cy-7*u,cx,cy-7*u);c.bezierCurveTo(cx+6*u,cy-7*u,cx+7*u,cy-1*u,cx,cy+7*u);c.fill();c.fillStyle=goldFill(c,T,cy-r,cy+r);c.beginPath();c.arc(cx,cy-2.4*u,2.3*u,0,Math.PI*2);c.fill()}
  else if(kind==='time'){c.beginPath();c.arc(cx,cy,6.8*u,0,Math.PI*2);c.stroke();c.beginPath();c.moveTo(cx,cy-4*u);c.lineTo(cx,cy);c.lineTo(cx+3.5*u,cy+2*u);c.stroke()}
  else {c.beginPath();c.moveTo(cx-6*u,cy-3*u);c.lineTo(cx+6*u,cy-3*u);c.lineTo(cx+6*u,cy+5*u);c.lineTo(cx-6*u,cy+5*u);c.closePath();c.stroke();c.beginPath();c.moveTo(cx-6*u,cy-3*u);c.lineTo(cx,cy+2*u);c.lineTo(cx+6*u,cy-3*u);c.stroke()}
  c.restore();
}
function cross(c,x,y,s,col){c.fillStyle=col;c.fillRect(x-s*.09,y-s*.5,s*.18,s);c.fillRect(x-s*.32,y-s*.24,s*.64,s*.16)}

// cover-fit an image into a box; ax/ay choose which part is kept (0..1)
function cover(c,im,x,y,w,h,ax,ay){
  const k=Math.max(w/im.width,h/im.height),sw=w/k,sh=h/k;
  c.drawImage(im,(im.width-sw)*ax,(im.height-sh)*ay,sw,sh,x,y,w,h);
}

function background(c,T,W,H,bg){
  const g=c.createLinearGradient(0,0,W*.3,H);g.addColorStop(0,T.bg[1]);g.addColorStop(.55,T.bg[0]);g.addColorStop(1,T.bg[0]);c.fillStyle=g;c.fillRect(0,0,W,H);
  if(bg){
    // soft blurred background picture (shrink + stretch gives a blur everywhere)
    const t=document_makeCanvas(Math.max(8,Math.round(W/22)),Math.max(8,Math.round(H/22)));
    const tc=t.getContext('2d');tc.imageSmoothingQuality='high';cover(tc,bg,0,0,t.width,t.height,.5,.5);
    c.globalAlpha=.55;c.imageSmoothingEnabled=true;c.drawImage(t,0,0,t.width,t.height,-20,-20,W+40,H+40);c.globalAlpha=1;
    const o=c.createLinearGradient(0,0,0,H);o.addColorStop(0,T.bg[0]+'cc');o.addColorStop(.5,T.bg[0]+'88');o.addColorStop(1,T.bg[0]+'dd');c.fillStyle=o;c.fillRect(0,0,W,H);
  }else{
    // glow and bokeh
    const r=c.createRadialGradient(W*.7,H*.25,10,W*.7,H*.25,W*.8);r.addColorStop(0,'rgba(255,255,255,.16)');r.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=r;c.fillRect(0,0,W,H);
    let s=7;const rnd=()=>{s=(s*9301+49297)%233280;return s/233280};
    for(let i=0;i<26;i++){const x=rnd()*W,y=rnd()*H,rad=14+rnd()*52;c.fillStyle='rgba(255,236,160,'+(0.04+rnd()*0.07)+')';c.beginPath();c.arc(x,y,rad,0,Math.PI*2);c.fill()}
    c.globalAlpha=.05;cross(c,W/2,H*.52,Math.min(W,H)*.9,'#ffffff');c.globalAlpha=1;
  }
  // frame
  goldBorder(c,T,14,14,W-28,H-28,20,5);goldBorder(c,T,26,26,W-52,H-52,14,1.5);
}
let document_makeCanvas=(w,h)=>{const e=document.createElement('canvas');e.width=w;e.height=h;return e};

function logoBox(c,T,im,cx,cy,s){
  if(!im)return;
  c.save();shadow(c,'rgba(0,0,0,.35)',14,4);
  const k=Math.min(s/im.width,s/im.height),w=im.width*k,h=im.height*k;
  c.drawImage(im,cx-w/2,cy-h/2,w,h);c.restore();noShadow(c);
}

// ---- blocks: each returns its height and draws only when dry is false ----
function orgBlock(c,T,d,cx,y,w,dry,big){
  const lines=String(d.org||'').split('\n').map(s=>s.trim()).filter(Boolean);
  if(!lines.length)return 0;
  let yy=y;
  lines.forEach((ln,i)=>{
    const first=i===0,sz0=first?(big?36:30):(big?24:21);
    const f=s=>'700 '+s+'px '+SA;
    let s=sz0;c.font=f(s);while(spacedWidth(c,ln.toUpperCase(),first?3:2)>w&&s>13){s-=1;c.font=f(s)}
    yy+=s*1.0;
    if(!dry){shadow(c,'rgba(0,0,0,.5)',6,2);c.fillStyle=first?T.txt:'#e9e3c8';c.textAlign='center';const txt=/^\(.*\)$/.test(ln)?ln:ln.toUpperCase();
      if(/^\(.*\)$/.test(ln)){c.font='italic 600 '+s+'px '+SA;c.fillText(ln,cx,yy)}else spaced(c,txt,cx,yy,first?3:2,first?T.txt:'#e9e3c8');noShadow(c)}
    yy+=s*.5;
  });
  return yy-y;
}
function inviteBlock(c,T,d,cx,y,w,dry,size){
  if(!d.invite)return 0;
  const r=fit(c,d.invite,s=>s+'px '+SC,w,size,34,2);
  const lh=r.s*1.05;
  if(!dry){c.textAlign='center';c.fillStyle=goldFill(c,T,y,y+lh*r.lines.length);shadow(c,'rgba(0,0,0,.5)',8,2);r.lines.forEach((l,i)=>c.fillText(l,cx,y+r.s*.85+i*lh));noShadow(c)}
  return lh*r.lines.length+6;
}
function bannerBlock(c,T,d,cx,y,w,dry,size){
  const pad=34,inner=w-pad*2-40;
  const tr=fit(c,(d.title||'').toUpperCase(),s=>'900 '+s+'px '+FS,inner,size,40,3);
  const lh=tr.s*1.1;
  const subH=d.sub?size*.36+18:0;
  const h=pad*1.2+tr.lines.length*lh+subH+pad*.5;
  if(dry)return h+10;
  const x=cx-w/2;
  // banner body with notched ends
  c.save();shadow(c,'rgba(0,0,0,.55)',22,8);
  c.fillStyle=T.panel;c.beginPath();const n=22;
  c.moveTo(x+n,y);c.lineTo(x+w-n,y);c.lineTo(x+w,y+h/2);c.lineTo(x+w-n,y+h);c.lineTo(x+n,y+h);c.lineTo(x,y+h/2);c.closePath();c.fill();c.restore();noShadow(c);
  c.save();c.beginPath();c.moveTo(x+n,y);c.lineTo(x+w-n,y);c.lineTo(x+w,y+h/2);c.lineTo(x+w-n,y+h);c.lineTo(x+n,y+h);c.lineTo(x,y+h/2);c.closePath();
  const sh=c.createLinearGradient(0,y,0,y+h);sh.addColorStop(0,'rgba(255,255,255,.14)');sh.addColorStop(.5,'rgba(255,255,255,0)');sh.addColorStop(1,'rgba(0,0,0,.25)');c.fillStyle=sh;c.fill();
  const gg=c.createLinearGradient(x,y,x+w,y+h);T.gold.forEach((col,i)=>gg.addColorStop(i/(T.gold.length-1),col));
  c.strokeStyle=gg;c.lineWidth=6;c.stroke();c.restore();
  c.save();c.beginPath();const m=11;c.moveTo(x+n+m*.6,y+m);c.lineTo(x+w-n-m*.6,y+m);c.lineTo(x+w-m,y+h/2);c.lineTo(x+w-n-m*.6,y+h-m);c.lineTo(x+n+m*.6,y+h-m);c.lineTo(x+m,y+h/2);c.closePath();c.strokeStyle='rgba(246,226,122,.7)';c.lineWidth=1.6;c.stroke();c.restore();
  diamond(c,x+26,y+h/2,6,T.gold[1]);diamond(c,x+w-26,y+h/2,6,T.gold[1]);
  // title
  c.textAlign='center';c.font='900 '+tr.s+'px '+FS;
  let yy=y+pad*.9+tr.s*.85;
  tr.lines.forEach(l=>{
    shadow(c,'rgba(0,0,0,.6)',8,4);c.fillStyle=goldFill(c,T,yy-tr.s*.8,yy+tr.s*.2);c.fillText(l,cx,yy);noShadow(c);
    yy+=lh;
  });
  if(d.sub){
    const ss=Math.round(size*.36);c.font='700 '+ss+'px '+SA;
    const lw=Math.min(spacedWidth(c,d.sub.toUpperCase(),ss*.35),inner);
    const ly=yy-lh+ss*1.15+10;
    c.fillStyle=T.gold[1];c.fillRect(cx-inner/2,ly-ss*.35,(inner-lw)/2-22,2.5);c.fillRect(cx+lw/2+22,ly-ss*.35,(inner-lw)/2-22,2.5);
    spaced(c,d.sub.toUpperCase(),cx,ly,ss*.35,T.txt);
  }
  return h+10;
}
function themeBlock(c,T,d,cx,y,w,dry,ts){
  if(!d.theme_&&!d.scripture)return 0;
  const pad=22,inner=w-pad*2-16;
  let th=null;
  if(d.theme_)th=fit(c,d.theme_.toUpperCase(),s=>'800 '+s+'px '+SA,inner,ts||34,17,2);
  const lh=th?th.s*1.28:0;
  const h=pad*1.6+(d.theme_?30+lh*th.lines.length:0)+(d.scripture?(d.theme_?62:40):0);
  if(dry)return h+8;
  const x=cx-w/2;
  c.save();shadow(c,'rgba(0,0,0,.4)',16,6);c.fillStyle=T.cream;rr(c,x,y,w,h,16);c.fill();c.restore();noShadow(c);
  goldBorder(c,T,x+5,y+5,w-10,h-10,12,3.5);
  let yy=y+pad+8;c.textAlign='center';
  if(d.theme_){
    c.font='italic 700 24px '+FS;c.fillStyle=T.ink;c.fillText('Theme:',cx,yy+14);yy+=30;
    c.font='800 '+th.s+'px '+SA;c.fillStyle=T.ink;
    th.lines.forEach((l,i)=>c.fillText(l,cx,yy+th.s*.85+i*lh));
    yy+=lh*th.lines.length;
  }
  if(d.scripture){
    if(d.theme_)divider(c,T,cx,yy+12,Math.min(w*.45,300));
    c.font='700 26px '+FS;c.fillStyle=T.ink;c.fillText(d.scripture.toUpperCase(),cx,yy+(d.theme_?46:30));
  }
  return h+8;
}
function detailsBlock(c,T,d,cx,y,w,dry,rowH){
  const rows=[['date','DATE',d.date],['venue','VENUE',d.venue],['time','TIME',d.time]];
  if(d.contact)rows.push(['contact','CONTACT',d.contact]);
  const rs=rows.filter(r=>r[2]&&String(r[2]).trim());
  if(!rs.length)return 0;
  const pad=22,vx=pad+rowH*.46*2+22,tw=w-vx-pad-10;
  // measure
  const meas=rs.map(r=>{const f=fit(c,r[2],s=>'700 '+s+'px '+SA,tw,rowH*.4,17,2);return f});
  const lbl=Math.round(rowH*.22);
  const hs=meas.map(m=>Math.max(rowH,lbl*1.5+m.lines.length*m.s*1.25+rowH*.35));
  const h=pad*1.3+hs.reduce((a,b)=>a+b,0);
  if(dry)return h+6;
  const x=cx-w/2;
  c.save();shadow(c,'rgba(0,0,0,.45)',16,6);c.fillStyle=T.panel;rr(c,x,y,w,h,18);c.fill();c.restore();noShadow(c);
  const sh=c.createLinearGradient(0,y,0,y+h);sh.addColorStop(0,'rgba(255,255,255,.1)');sh.addColorStop(1,'rgba(0,0,0,.18)');c.fillStyle=sh;rr(c,x,y,w,h,18);c.fill();
  goldBorder(c,T,x+4,y+4,w-8,h-8,15,3);
  let yy=y+pad*.65;
  rs.forEach((r,i)=>{
    const m=meas[i],rh=hs[i],ic=rowH*.46,cy=yy+rh/2+pad*.15;
    icon(c,T,r[0],x+pad+ic+8,cy,ic);
    const bh=lbl*1.5+m.lines.length*m.s*1.25,top=cy-bh/2;
    c.textAlign='left';c.font='800 '+lbl+'px '+SA;c.fillStyle=T.gold[1];
    c.fillText(r[1]+':',x+vx,top+lbl);
    c.font='700 '+m.s+'px '+SA;c.fillStyle=T.txt;
    m.lines.forEach((l,k)=>c.fillText(l,x+vx,top+lbl*1.5+m.s*1.0+k*m.s*1.25));
    if(i<rs.length-1){c.fillStyle='rgba(246,226,122,.28)';c.fillRect(x+pad,yy+rh,w-pad*2,1.5)}
    yy+=rh;
  });
  c.textAlign='center';
  return h+6;
}
function plateBlock(c,T,d,cx,y,w,dry,small){
  if(!d.guest&&!d.role)return 0;
  const pad=16,inner=w-pad*2-40;
  const gs=d.guest?fit(c,d.guest.toUpperCase(),s=>'900 '+s+'px '+FS,inner,small?30:36,16,2):null;
  const roles=String(d.role||'').split('\n').map(s=>s.trim()).filter(Boolean);
  const rsz=small?17:20;
  const h=pad*1.7+(gs?gs.lines.length*gs.s*1.15:0)+roles.length*rsz*1.45;
  if(dry)return h+8;
  const x=cx-w/2;
  c.save();shadow(c,'rgba(0,0,0,.4)',14,5);c.fillStyle=T.cream;rr(c,x,y,w,h,14);c.fill();c.restore();noShadow(c);
  goldBorder(c,T,x+5,y+5,w-10,h-10,10,3);
  let yy=y+pad+4;c.textAlign='center';
  if(gs){c.font='900 '+gs.s+'px '+FS;c.fillStyle=T.ink;gs.lines.forEach(l=>{yy+=gs.s*1.0;c.fillText(l,cx,yy);yy+=gs.s*.15})}
  c.font='700 '+rsz+'px '+SA;
  roles.forEach((r,i)=>{yy+=rsz*1.35;c.fillStyle=i===0&&gs?T.ink:T.ink;c.globalAlpha=i===0?1:.82;c.fillText(r.toUpperCase(),cx,yy)});c.globalAlpha=1;
  return h+8;
}
function closingBlock(c,T,d,cx,y,w,dry,size){
  if(!d.closing)return 0;
  const r=fit(c,d.closing,s=>s+'px '+SC,w,size,30,2),lh=r.s*1.08;
  if(!dry){c.textAlign='center';c.fillStyle=goldFill(c,T,y,y+lh*r.lines.length);shadow(c,'rgba(0,0,0,.55)',8,2);r.lines.forEach((l,i)=>c.fillText(l,cx,y+r.s*.85+i*lh));noShadow(c)}
  return lh*r.lines.length+6;
}
function photoBlock(c,T,im,shape,x,y,w,h){
  if(!im||w<80||h<80)return;
  c.save();shadow(c,'rgba(0,0,0,.6)',26,10);
  const path=()=>{
    if(shape==='Circle'){const r=Math.min(w,h)/2;c.beginPath();c.arc(x+w/2,y+h/2,r,0,Math.PI*2)}
    else if(shape==='Arch'){const r=w/2;c.beginPath();c.moveTo(x,y+h);c.lineTo(x,y+r);c.arc(x+r,y+r,r,Math.PI,0);c.lineTo(x+w,y+h);c.closePath()}
    else rr(c,x,y,w,h,22);
  };
  path();c.fillStyle=T.panel;c.fill();c.restore();noShadow(c);
  c.save();path();c.clip();
  if(shape==='Circle'){const r=Math.min(w,h);cover(c,im,x+w/2-r/2,y+h/2-r/2,r,r,.5,.25)}else cover(c,im,x,y,w,h,.5,.2);
  // soft vignette at the bottom
  const vg=c.createLinearGradient(0,y+h*.7,0,y+h);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.35)');c.fillStyle=vg;c.fillRect(x,y,w,h);
  c.restore();
  c.save();path();const g=c.createLinearGradient(x,y,x+w,y+h);T.gold.forEach((col,i)=>g.addColorStop(i/(T.gold.length-1),col));c.strokeStyle=g;c.lineWidth=7;c.stroke();c.restore();
}

export function renderFlyer(c,d,imgs,mk){
  if(mk)document_makeCanvas=mk;
  const dims=SIZES[d.size]||SIZES.Portrait,W=dims[0],H=dims[1],T=THEMES[d.theme]||THEMES['Green and Gold'];
  imgs=imgs||{};
  c.save();c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,c.canvas.width,c.canvas.height);c.restore();
  c.textBaseline='alphabetic';c.textAlign='center';noShadow(c);
  background(c,T,W,H,imgs.bg);
  if(d.size==='Landscape')landscape(c,T,d,imgs,W,H);else portrait(c,T,d,imgs,W,H);
  return{W,H};
}

function portrait(c,T,d,imgs,W,H){
  const cx=W/2,top=52,cw=W-120;
  const hasPh=!!imgs.photo&&d.photoShape!=='None';
  const wl=hasPh?Math.round(cw*.6):cw-60,wd=hasPh?wl:cw-30,g=10;
  const CF=[{inv:56,ban:92,ts:34,det:64,clo:50,lg:118},{inv:50,ban:78,ts:28,det:54,clo:44,lg:104},{inv:44,ban:66,ts:24,det:46,clo:40,lg:92},{inv:40,ban:56,ts:22,det:40,clo:36,lg:84}];
  const measure=cf=>{
    const lg=cf.lg,orgW=imgs.logo1||imgs.logo2?W-2*(lg+70):W-200;
    const oh=orgBlock(c,T,d,cx,0,orgW,true,true);
    const headH=Math.max(oh,imgs.logo1||imgs.logo2?lg:0);
    const o={lg,orgW,oh,headH,
      inv:inviteBlock(c,T,d,cx,0,cw,true,cf.inv),ban:bannerBlock(c,T,d,cx,0,cw,true,cf.ban),
      thm:themeBlock(c,T,d,cx,0,wl,true,cf.ts),det:detailsBlock(c,T,d,cx,0,wd,true,cf.det),
      pla:plateBlock(c,T,d,cx,0,cw-120,true),clo:closingBlock(c,T,d,cx,0,cw,true,cf.clo)};
    o.mid=hasPh?Math.max(o.thm+g+o.det,380):o.thm+g+o.det;
    o.fixed=o.inv+o.ban+o.mid+o.pla+o.clo+g*5;
    o.avail=H-52-(top+headH+16)-o.fixed;
    return o;
  };
  let k=0,m=measure(CF[0]);
  if(hasPh)for(k=0;k<CF.length;k++){m=measure(CF[k]);if(m.avail>=0)break}
  if(k>=CF.length){k=CF.length-1;m=measure(CF[k])}
  const cf=CF[k];
  logoBox(c,T,imgs.logo1,70+m.lg/2,top+m.headH/2,m.lg);
  logoBox(c,T,imgs.logo2,W-70-m.lg/2,top+m.headH/2,m.lg);
  orgBlock(c,T,d,cx,top+(m.headH-m.oh)/2,m.orgW,false,true);
  let y=top+m.headH+16;
  const sp=Math.max(0,Math.min(m.avail,hasPh?30:140))/6;
  inviteBlock(c,T,d,cx,y+sp*.5,cw,false,cf.inv);y+=m.inv+g+sp;
  bannerBlock(c,T,d,cx,y,cw,false,cf.ban);y+=m.ban+g+sp;
  if(hasPh){
    const lx=60,lcx=lx+wl/2,px=lx+wl+18,pw=W-60-px;
    themeBlock(c,T,d,lcx,y,wl,false,cf.ts);
    detailsBlock(c,T,d,lcx,y+m.thm+g+(m.mid-m.thm-g-m.det),wd,false,cf.det);
    const ph=m.mid;let w=pw,h=ph;
    if(d.photoShape==='Circle'){w=h=Math.min(pw,ph)}
    photoBlock(c,T,imgs.photo,d.photoShape,px+(pw-w)/2,y+(ph-h)/2,w,h);
    y+=m.mid+g+sp;
  }else{
    themeBlock(c,T,d,cx,y,wl,false,cf.ts);y+=m.thm+g;
    detailsBlock(c,T,d,cx,y,wd,false,cf.det);y+=m.det+g+sp;
  }
  plateBlock(c,T,d,cx,y,cw-120,false);y+=m.pla+g+sp;
  closingBlock(c,T,d,cx,y,cw,false,cf.clo);
}

function landscape(c,T,d,imgs,W,H){
  const hasPh=!!imgs.photo&&d.photoShape!=='None';
  const lx=44,colW=hasPh?W*.6:W-88,cx=lx+colW/2,cw=colW-30;
  const CF=[{inv:46,ban:70,ts:30,det:50,clo:40,lg:96},{inv:40,ban:58,ts:24,det:42,clo:34,lg:84},{inv:36,ban:50,ts:22,det:36,clo:30,lg:74},{inv:32,ban:44,ts:20,det:32,clo:28,lg:66}];
  let m,cf;
  for(let k=0;k<CF.length;k++){
    cf=CF[k];const lg=cf.lg;
    const orgW=colW-(imgs.logo1?lg+20:0)-(imgs.logo2?lg+20:0)-20;
    const oh=orgBlock(c,T,d,cx,0,orgW,true,false),headH=Math.max(oh,imgs.logo1||imgs.logo2?lg:0);
    m={lg,orgW,oh,headH,inv:inviteBlock(c,T,d,cx,0,cw,true,cf.inv),ban:bannerBlock(c,T,d,cx,0,cw,true,cf.ban),thm:themeBlock(c,T,d,cx,0,cw-30,true,cf.ts),
      det:detailsBlock(c,T,d,cx,0,hasPh?cw-10:cw*.8,true,cf.det),pla:plateBlock(c,T,d,cx,0,Math.min(cw-60,520),true,true),clo:closingBlock(c,T,d,cx,0,cw,true,cf.clo)};
    m.total=m.inv+m.ban+m.thm+m.det+m.pla+m.clo;
    if(46+headH+8+m.total+5*5<=H-44)break;
  }
  let y=46;
  logoBox(c,T,imgs.logo1,lx+10+m.lg/2,y+m.headH/2,m.lg);
  logoBox(c,T,imgs.logo2,lx+colW-10-m.lg/2,y+m.headH/2,m.lg);
  orgBlock(c,T,d,cx,y+(m.headH-m.oh)/2,m.orgW,false,false);
  y+=m.headH+8;
  if(hasPh){
    const px=lx+colW+16,pw=W-px-44,ph=H-96;
    const sz=d.photoShape==='Circle'?Math.min(pw,ph):0,w=sz||pw,h=sz||ph;
    photoBlock(c,T,imgs.photo,d.photoShape,px+(pw-w)/2,48+(ph-h)/2,w,h);
  }
  const gap=Math.max(4,Math.min(16,(H-44-y-m.total)/5));
  inviteBlock(c,T,d,cx,y,cw,false,cf.inv);y+=m.inv+gap;
  bannerBlock(c,T,d,cx,y,cw,false,cf.ban);y+=m.ban+gap;
  themeBlock(c,T,d,cx,y,cw-30,false,cf.ts);y+=m.thm+gap;
  detailsBlock(c,T,d,cx,y,hasPh?cw-10:cw*.8,false,cf.det);y+=m.det+gap;
  plateBlock(c,T,d,cx,y,Math.min(cw-60,520),false,true);y+=m.pla+gap;
  closingBlock(c,T,d,cx,y,cw,false,cf.clo);
}
