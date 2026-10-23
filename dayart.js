/* Picture of the Day: 14 original illustrated scenes, drawn in code (square 1080 x 1080). No downloads, works offline. */
(function(){
const W=1080;
const PIC=[
 ['THE LORD IS YOUR SHEPHERD. YOU SHALL NOT WANT.','Psalm 23:1'],
 ['RISE UP IN STRENGTH. YOU CAN DO ALL THINGS THROUGH CHRIST.','Philippians 4:13'],
 ['TRUST HIM FULLY. EVERY STEP YOU TAKE IS ORDERED.','Proverbs 3:5'],
 ['RELEASE EVERY BURDEN TO HIM. HE CARES FOR YOU.','1 Peter 5:7'],
 ['RECEIVE FRESH LOVE FROM HEAVEN. IT FLOWS THROUGH YOU TODAY.','Mark 12:31'],
 ['RECEIVE UNSHAKEABLE JOY. IT IS YOUR STRENGTH.','Philippians 4:4'],
 ['BE BOLD AND COURAGEOUS. THE LORD GOES WITH YOU.','Joshua 1:9'],
 ['FEAR HAS NO PLACE HERE. GOD HOLDS YOU UP.','Isaiah 41:10'],
 ['RECEIVE A BRIGHT FUTURE. IT IS YOUR PORTION.','Jeremiah 29:11'],
 ['EVERYTHING IS TURNING AROUND FOR YOUR GOOD. THIS IS YOUR SEASON.','Romans 8:28'],
 ['RUN TO HIM TODAY. HE IS YOUR STRONG REFUGE.','Psalm 46:1'],
 ['RECEIVE ABUNDANT PROVISION. EVERY NEED IS MET.','Philippians 4:19'],
 ['EVERY WEAPON AGAINST YOU IS DISARMED. YOU SHALL PROSPER.','Isaiah 54:17'],
 ['WALK IN HIS LIGHT. FEAR HAS NO POWER OVER YOU.','Psalm 27:1'],
 ['RECEIVE DIVINE REST. YOUR SOUL IS RESTORED.', 'Psalm 23:2'],
 ['RECEIVE FRESH STRENGTH. YOU SHALL SOAR LIKE EAGLES.', 'Isaiah 40:31'],
 ['RECEIVE NEW MERCIES TODAY. HIS FAITHFULNESS IS YOURS.', 'Lamentations 3:22-23'],
 ['SEEK HIM FIRST. EVERYTHING ELSE IS ADDED TO YOU.', 'Matthew 6:33'],
 ['LIFT YOUR EYES. HELP IS ON THE WAY.', 'Psalm 121:1-2'],
 ['YOU ARE HIDDEN IN HIS SHADOW. NO EVIL SHALL TOUCH YOU.', 'Psalm 91:1'],
 ['RECEIVE LOVE WITHOUT LIMIT. YOU ARE CHOSEN AND LOVED.', 'John 3:16'],
 ['COME AS YOU ARE. RECEIVE HIS REST TODAY.', 'Matthew 11:28'],
 ['YOUR HOUSE IS BLESSED. PEACE REIGNS IN YOUR HOME.', 'Joshua 24:15'],
 ['YOUR CHILDREN ARE A HERITAGE. THEIR FUTURE IS BRIGHT.', 'Psalm 127:3'],
 ['YOU SHALL BEAR FRUIT. WHATEVER YOU DO SHALL PROSPER.', 'Psalm 1:3'],
 ['RECEIVE YOUR HEALING NOW. HEALTH IS YOUR PORTION.', 'Jeremiah 30:17'],
 ['RECEIVE HIS PEACE. IT IS YOUR PORTION.', 'John 14:27'],
 ['SPEAK TO THE MOUNTAIN. IT MUST MOVE.', 'Hebrews 11:1'],
 ['RECEIVE EXTRAORDINARY WISDOM FROM GOD. IT IS YOUR PORTION.', 'James 1:5'],
 ['CALL ON HIM TODAY. HE WILL SHOW YOU GREAT THINGS.', 'Jeremiah 33:3'],
 ['A NEW THING IS SPRINGING UP. HE MAKES A WAY FOR YOU.', 'Isaiah 43:19'],
 ['THE DOOR IS OPEN. NO ONE CAN SHUT IT.', 'Revelation 3:8'],
 ['RECEIVE EXTRAORDINARY FAVOUR. IT SURROUNDS YOU LIKE A SHIELD.', 'Psalm 5:12'],
 ['VICTORY IS YOURS. THE BATTLE IS ALREADY WON.', '1 Corinthians 15:57'],
 ['YOUR NIGHT IS OVER. JOY COMES IN THE MORNING.', 'Psalm 30:5'],
 ['BE FILLED WITH HOPE. JOY AND PEACE OVERFLOW IN YOU.', 'Romans 15:13'],
 ['HIS GRACE IS ENOUGH. HIS POWER RESTS ON YOU.', '2 Corinthians 12:9'],
 ['YOU WERE CREATED ON PURPOSE. RISE INTO YOUR DESTINY.', 'Ephesians 2:10'],
 ['HOLD ON TO HOPE. IT ANCHORS YOUR SOUL.', 'Hebrews 6:19'],
 ['SHINE BRIGHT TODAY. SOMEONE IS FOLLOWING YOUR LIGHT.', 'Matthew 5:16']
];
const rng=seed=>{let s=(seed*9301+49297)%233280;return()=>{s=(s*9301+49297)%233280;return s/233280}};
const lg=(x,stops,y0,y1)=>{const g=x.createLinearGradient(0,y0==null?0:y0,0,y1==null?W:y1);stops.forEach(s=>g.addColorStop(s[0],s[1]));return g};
const sky=(x,stops)=>{x.fillStyle=lg(x,stops);x.fillRect(0,0,W,W)};
const glow=(x,cx,cy,r,rgb,a)=>{const g=x.createRadialGradient(cx,cy,0,cx,cy,r);g.addColorStop(0,`rgba(${rgb},${a})`);g.addColorStop(1,`rgba(${rgb},0)`);x.fillStyle=g;x.fillRect(cx-r,cy-r,2*r,2*r)};
const disc=(x,cx,cy,r,c)=>{x.fillStyle=c;x.beginPath();x.arc(cx,cy,r,0,7);x.fill()};
function rays(x,cx,cy,n,len,rgb,a,spread){x.save();x.translate(cx,cy);for(let i=0;i<n;i++){const t=(i/n)*Math.PI*2+(spread||0),w=Math.PI/n*.55;const g=x.createLinearGradient(0,0,Math.cos(t)*len,Math.sin(t)*len);g.addColorStop(0,`rgba(${rgb},${a})`);g.addColorStop(1,`rgba(${rgb},0)`);x.fillStyle=g;x.beginPath();x.moveTo(0,0);x.lineTo(Math.cos(t-w)*len,Math.sin(t-w)*len);x.lineTo(Math.cos(t+w)*len,Math.sin(t+w)*len);x.closePath();x.fill()}x.restore()}
function ridge(x,y0,amp,col,seed,f){const r=rng(seed),p1=r()*9,p2=r()*9,p3=r()*9;x.fillStyle=col;x.beginPath();x.moveTo(0,W);for(let i=0;i<=W;i+=8){const y=y0-amp*(Math.sin(i*f+p1)*.5+Math.sin(i*f*2.3+p2)*.3+Math.sin(i*f*5.1+p3)*.12);x.lineTo(i,y)}x.lineTo(W,W);x.closePath();x.fill()}
function peak(x,cx,top,base,hw,col,snow){x.fillStyle=col;x.beginPath();x.moveTo(cx-hw,base);x.lineTo(cx-hw*.12,top+(base-top)*.08);x.lineTo(cx,top);x.lineTo(cx+hw*.18,top+(base-top)*.1);x.lineTo(cx+hw,base);x.closePath();x.fill();if(snow){x.fillStyle=snow;x.beginPath();x.moveTo(cx,top);x.lineTo(cx-hw*.2,top+(base-top)*.25);x.lineTo(cx-hw*.08,top+(base-top)*.2);x.lineTo(cx,top+(base-top)*.3);x.lineTo(cx+hw*.1,top+(base-top)*.2);x.lineTo(cx+hw*.22,top+(base-top)*.26);x.closePath();x.fill()}}
function stars(x,n,seed,ymax,a){const r=rng(seed);for(let i=0;i<n;i++){const s=r()*2.6+.6;x.fillStyle=`rgba(255,255,255,${(a||1)*(.4+r()*.6)})`;x.beginPath();x.arc(r()*W,r()*ymax,s,0,7);x.fill()}}
function cloud(x,cx,cy,s,rgb,a){x.fillStyle=`rgba(${rgb},${a})`;[[0,0,60],[55,-18,48],[-58,-8,42],[105,6,38],[-105,10,34]].forEach(c=>{x.beginPath();x.ellipse(cx+c[0]*s,cy+c[1]*s,c[2]*s,c[2]*s*.62,0,0,7);x.fill()})}
function bird(x,cx,cy,s,col){x.strokeStyle=col;x.lineWidth=3.2*s;x.lineCap='round';x.beginPath();x.moveTo(cx-16*s,cy-4*s);x.quadraticCurveTo(cx-8*s,cy-14*s,cx,cy);x.quadraticCurveTo(cx+8*s,cy-14*s,cx+16*s,cy-4*s);x.stroke()}
function sheep(x,cx,cy,s,body,dark){x.fillStyle=dark;[-22,22].forEach(dx=>{x.fillRect(cx+dx*s-3*s,cy,6*s,20*s)});x.fillStyle=body;[[-26,-8,18],[0,-14,22],[26,-8,18],[-12,2,16],[14,2,16]].forEach(c=>{x.beginPath();x.arc(cx+c[0]*s,cy+c[1]*s,c[2]*s,0,7);x.fill()});x.fillStyle=dark;x.beginPath();x.ellipse(cx+40*s,cy-6*s,11*s,14*s,.3,0,7);x.fill();x.fillRect(cx+46*s,cy-18*s,4*s,8*s)}
// ---- human silhouettes: person(ctx, centreX, feetY, height, colour, pose, opts) ----
// poses: stand, raise, reach, pray, kneel, walk, read, wave ; opts.f = woman (dress+hair), opts.kid = child, opts.glow = rgb string, opts.flip = mirror
function person(x,cx,fy,h,col,pose,o){o=o||{};const H=h,fl=o.flip?-1:1,P=(u,v)=>[cx+fl*u*H,fy-v*H];
 const seg=(p,q,w1,w2)=>{const A=P(p[0],p[1]),B=P(q[0],q[1]),dx=B[0]-A[0],dy=B[1]-A[1],L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L,r1=w1*H/2,r2=w2*H/2;
  x.beginPath();x.moveTo(A[0]+nx*r1,A[1]+ny*r1);x.lineTo(B[0]+nx*r2,B[1]+ny*r2);x.lineTo(B[0]-nx*r2,B[1]-ny*r2);x.lineTo(A[0]-nx*r1,A[1]-ny*r1);x.closePath();x.fill();
  x.beginPath();x.arc(A[0],A[1],r1,0,7);x.fill();x.beginPath();x.arc(B[0],B[1],r2,0,7);x.fill()};
 const arm=(s0,e,hd,w)=>{seg(s0,e,w,w*.82);seg(e,hd,w*.82,w*.6);const q=P(hd[0],hd[1]);x.beginPath();x.arc(q[0],q[1],w*H*.5,0,7);x.fill()};
 const leg=(hp,kn,an,w)=>{seg(hp,kn,w,w*.72);seg(kn,an,w*.72,w*.5);const q=P(an[0]+.025,an[1]);x.beginPath();x.ellipse(q[0],q[1],.04*H,.017*H,0,0,7);x.fill()};
 x.save();x.fillStyle=col;x.strokeStyle=col;
 if(o.glow){const g=x.createRadialGradient(cx,fy-H*.6,0,cx,fy-H*.6,H*1.0);g.addColorStop(0,`rgba(${o.glow},.42)`);g.addColorStop(1,`rgba(${o.glow},0)`);x.fillStyle=g;x.fillRect(cx-H*1.1,fy-H*1.7,2.2*H,2.2*H);x.fillStyle=col}
 const kn=pose==='kneel',fem=!!o.f;
 const shY=kn?.66:.84,hipY=kn?.30:.51,sw=fem?.078:.095;
 // legs
 if(!fem||kn){
  if(kn){leg([-.03,hipY],[.14,.06],[-.06,.012],.075);leg([.03,hipY],[.2,.05],[-.0,.012],.07)}
  else if(pose==='walk'){leg([-.025,hipY],[-.09,.27],[-.16,.02],.08);leg([.025,hipY],[.08,.26],[.15,.025],.08)}
  else{leg([-.03,hipY],[-.05,.27],[-.055,.02],.08);leg([.03,hipY],[.05,.27],[.055,.02],.08)}
 }
 // torso
 x.beginPath();
 x.moveTo(...P(-.02,shY+.035));x.quadraticCurveTo(...P(-sw*.7,shY+.03),...P(-sw,shY-.015));
 x.quadraticCurveTo(...P(-sw*1.02,shY-.1),...P(-(sw-.012),shY-.19));
 x.quadraticCurveTo(...P(-(fem?.05:.075),shY-.27),...P(-(fem?.06:.085),hipY));
 if(fem&&!kn){x.quadraticCurveTo(...P(-.12,.28),...P(-.185,.04));x.quadraticCurveTo(...P(-.1,.015),...P(0,.03));x.quadraticCurveTo(...P(.1,.015),...P(.185,.04));x.quadraticCurveTo(...P(.12,.28),...P(.06,hipY))}
 else{x.lineTo(...P(.085,hipY))}
 x.quadraticCurveTo(...P((fem?.05:.075),shY-.27),...P((sw-.012),shY-.19));
 x.quadraticCurveTo(...P(sw*1.02,shY-.1),...P(sw,shY-.015));
 x.quadraticCurveTo(...P(sw*.7,shY+.03),...P(.02,shY+.035));
 x.closePath();x.fill();
 if(fem&&kn){x.beginPath();x.moveTo(...P(-.08,hipY));x.quadraticCurveTo(...P(.1,hipY+.04),...P(.24,.04));x.lineTo(...P(-.12,.0));x.closePath();x.fill()}
 // neck + head
 const bow=!!o.bow||kn||pose==='pray',hr=o.kid?.062:.05,hy=shY+.07+(bow?-.005:0),hx=bow?.012:0;
 seg([0,shY+.01],[hx*.5,shY+.065],.036,.032);
 const hp=P(hx,hy);x.beginPath();x.ellipse(hp[0],hp[1],hr*H,hr*H*1.15,0,0,7);x.fill();
 if(fem){x.beginPath();x.ellipse(hp[0]-fl*.012*H,hp[1]-.004*H,hr*H*1.18,hr*H*1.3,0,0,7);x.fill();x.beginPath();x.moveTo(...P(hx-.035,hy));x.quadraticCurveTo(...P(hx-.115,hy-.08),...P(hx-.07,hy-.19));x.quadraticCurveTo(...P(hx-.03,hy-.13),...P(hx+.01,hy-.06));x.fill()}
 // arms
 const L=[-sw+.005,shY-.03],R=[sw-.005,shY-.03],aw=.05;
 if(pose==='raise'){arm(L,[-.17,shY+.07],[-.21,shY+.2],aw);arm(R,[.17,shY+.07],[.21,shY+.2],aw)}
 else if(pose==='reach'){arm(L,[-.13,shY-.14],[-.14,shY-.28],aw);arm(R,[.15,shY+.03],[.21,shY+.17],aw)}
 else if(pose==='pray'||pose==='kneel'){arm(L,[-.09,shY-.14],[.008,shY-.06],aw);arm(R,[.09,shY-.14],[.008,shY-.06],aw)}
 else if(pose==='read'){arm(L,[-.1,shY-.15],[-.012,shY-.16],aw);arm(R,[.1,shY-.15],[.012,shY-.16],aw);x.fillStyle=o.book||'#f5e6b8';x.save();x.translate(...P(0,shY-.17));x.rotate(-.1*fl);x.fillRect(-.07*H,-.045*H,.14*H,.09*H);x.restore();x.fillStyle=col}
 else if(pose==='walk'){arm(L,[-.13,shY-.15],[-.09,shY-.27],aw);arm(R,[.11,shY-.15],[.14,shY-.27],aw)}
 else if(pose==='wave'){arm(L,[-.12,shY-.15],[-.13,shY-.29],aw);arm(R,[.15,shY+.0],[.17,shY+.15],aw)}
 else{arm(L,[-.12,shY-.15],[-.13,shY-.29],aw);arm(R,[.12,shY-.15],[.13,shY-.29],aw)}
 if(o.staff){x.lineWidth=.017*H;x.lineCap='round';const t=P(.15,.02),u=P(.15,1.04);x.beginPath();x.moveTo(t[0],t[1]);x.lineTo(u[0],u[1]);x.stroke();const c=P(.105,1.04);x.beginPath();x.arc(c[0],c[1],.045*H,fl>0?0:Math.PI,fl>0?Math.PI*1.15:Math.PI*(-.15),fl<0);x.stroke()}
 if(o.lantern){const q=P(.14,.5);x.fillStyle='#ffe3a0';x.shadowColor='rgba(255,220,140,.9)';x.shadowBlur=.08*H;x.fillRect(q[0]-.025*H,q[1],.05*H,.07*H);x.shadowBlur=0}
 x.restore();
}
// old scenes call man(): now they get the same smooth human silhouettes
function man(x,cx,cy,s,col,o){o=o||{};person(x,cx,cy,190*s,col,o.arms?'raise':'stand',{f:o.f,kid:o.kid,staff:o.staff,lantern:o.lantern,glow:o.glow})}

function cross(x,cx,cy,s,col){x.fillStyle=col;x.fillRect(cx-6*s,cy-48*s,12*s,96*s);x.fillRect(cx-28*s,cy-26*s,56*s,12*s)}
function tree(x,cx,cy,s,col){x.fillStyle=col;x.fillRect(cx-6*s,cy-60*s,12*s,60*s);[[0,-100,46],[-30,-74,34],[32,-76,36],[0,-60,36]].forEach(c=>{x.beginPath();x.arc(cx+c[0]*s,cy+c[1]*s,c[2]*s,0,7);x.fill()})}
function wheat(x,cx,cy,s,col){x.strokeStyle=col;x.fillStyle=col;x.lineWidth=2.5*s;x.beginPath();x.moveTo(cx,cy);x.quadraticCurveTo(cx+4*s,cy-45*s,cx+6*s,cy-80*s);x.stroke();for(let i=0;i<6;i++){x.beginPath();x.ellipse(cx+(i%2?5:-1)*s+6*s*(i/6),cy-(80-i*7)*s,3.6*s,8*s,i%2?.6:-.6,0,7);x.fill()}}
function water(x,y0,top,bot){x.fillStyle=lg(x,[[0,top],[1,bot]],y0,W);x.fillRect(0,y0,W,W-y0)}
function shimmer(x,cx,y0,w,rgb,a,seed){const r=rng(seed);for(let i=0;i<26;i++){const y=y0+i*i*.9+4,ww=w*(1-i/34)*(.6+r()*.5);x.fillStyle=`rgba(${rgb},${a*(1-i/30)})`;x.fillRect(cx-ww/2+(r()-.5)*30,y,ww,4+i*.18)}}

const SH=[-280,0,-230,-150,-300,-150,-100,-260,-200,-60,-100,-220,-120,-170];
const SC=[
// 0 shepherd at sunrise
x=>{sky(x,[[0,'#2b3a7a'],[.35,'#e0708a'],[.58,'#ffb067'],[.72,'#ffe2a0']]);glow(x,540,610,520,'255,236,170',.85);rays(x,540,610,18,900,'255,236,180',.28,.2);disc(x,540,610,70,'#fff3c4');cloud(x,200,250,1,'255,220,200',.45);cloud(x,860,330,.8,'255,210,200',.4);ridge(x,670,70,'#b46a6a',3,.006);ridge(x,720,60,'#7e4f62',5,.008);ridge(x,790,45,'#46344f',8,.011);sheep(x,300,830,1.1,'#f6efe6','#2a2230');sheep(x,440,880,.9,'#efe6da','#2a2230');sheep(x,700,850,1,'#f6efe6','#2a2230');sheep(x,840,900,.8,'#efe6da','#2a2230');man(x,560,880,1.25,'#1c1626',{staff:1})},
// 1 strength: climber on peak, arms raised
x=>{sky(x,[[0,'#1d2f6f'],[.4,'#4f6fd0'],[.62,'#ffc27a'],[.8,'#ffe9b0']]);glow(x,540,520,500,'255,230,160',.7);rays(x,540,520,16,950,'255,235,180',.22);disc(x,540,520,60,'#fff4cc');peak(x,300,420,900,520,'#2d3a63','#dfe8ff');peak(x,780,380,900,560,'#232d52','#dfe8ff');peak(x,540,300,950,520,'#161e3c','#f3f6ff');man(x,540,360,.95,'#0b1024',{arms:1});cloud(x,180,200,1,'255,255,255',.35);cloud(x,880,170,.9,'255,255,255',.3)},
// 2 trust: winding path toward light
x=>{sky(x,[[0,'#27386f'],[.45,'#6a7fd0'],[.62,'#ffc98a'],[.78,'#fff0c4']]);glow(x,540,560,460,'255,240,190',.9);disc(x,540,560,54,'#fffbe6');rays(x,540,560,14,900,'255,244,200',.2);ridge(x,590,60,'#4c5a96',2,.007);ridge(x,640,50,'#33417a',4,.009);ridge(x,700,40,'#1f2a5a',6,.012);x.fillStyle='#10163a';x.fillRect(0,720,W,W);x.fillStyle='#f6dca0';x.beginPath();x.moveTo(520,640);x.bezierCurveTo(470,700,640,740,590,800);x.bezierCurveTo(540,860,300,880,230,1080);x.lineTo(880,1080);x.bezierCurveTo(780,900,800,860,640,790);x.bezierCurveTo(590,730,570,690,545,640);x.closePath();x.fill();x.fillStyle='rgba(16,22,58,.35)';x.fillRect(0,640,W,0);man(x,560,860,.9,'#0a0e28',{staff:1});tree(x,150,760,1.5,'#0e1536');tree(x,930,740,1.4,'#0e1536')},
// 3 cast cares: calm lake, moon, boat
x=>{sky(x,[[0,'#0c1a45'],[.5,'#2c4a96'],[.66,'#f0b6a0'],[.74,'#ffe0c0']]);stars(x,70,3,430,.8);glow(x,700,300,380,'255,246,220',.55);disc(x,700,300,72,'#fff8e6');disc(x,682,290,66,'rgba(255,248,230,.0)');ridge(x,640,50,'#25356e',4,.006);ridge(x,680,34,'#16224f',9,.01);water(x,690,'#27407f','#0a1233');shimmer(x,700,700,170,'255,246,220',.55,5);x.fillStyle='#06091f';x.beginPath();x.moveTo(330,860);x.lineTo(610,860);x.lineTo(560,905);x.lineTo(380,905);x.closePath();x.fill();x.fillRect(466,700,6,160);x.beginPath();x.moveTo(472,706);x.lineTo(560,850);x.lineTo(472,850);x.closePath();x.fill();man(x,420,862,.38,'#06091f')},
// 4 love: village with glowing heart
x=>{sky(x,[[0,'#2a1f5c'],[.45,'#b04a8a'],[.7,'#ff9a7a'],[.85,'#ffd29a']]);stars(x,40,4,300,.6);glow(x,540,470,460,'255,170,190',.7);x.save();x.translate(540,470);x.scale(1.6,1.6);x.fillStyle='#ffe6ee';x.beginPath();x.moveTo(0,40);x.bezierCurveTo(-90,-20,-50,-80,0,-34);x.bezierCurveTo(50,-80,90,-20,0,40);x.fill();x.restore();ridge(x,780,60,'#4a2a62',2,.007);x.fillStyle='#1d1235';const hs=[[80,830,120,100],[210,800,100,130],[330,840,130,90],[470,810,110,120],[600,830,140,100],[740,800,110,130],[860,835,120,95],[970,810,100,125]];hs.forEach(h=>{x.fillRect(h[0],h[1],h[2],h[3]+60);x.beginPath();x.moveTo(h[0]-8,h[1]);x.lineTo(h[0]+h[2]/2,h[1]-52);x.lineTo(h[0]+h[2]+8,h[1]);x.closePath();x.fill()});x.fillStyle='#ffd27a';hs.forEach(h=>{x.fillRect(h[0]+h[2]*.3,h[1]+30,16,22);x.fillRect(h[0]+h[2]*.62,h[1]+60,16,22)});x.fillStyle='#1d1235';x.fillRect(0,960,W,W)},
// 5 rejoice: sunburst, birds
x=>{sky(x,[[0,'#3a52c8'],[.4,'#6aa6f0'],[.65,'#ffd479'],[.85,'#fff1b8']]);glow(x,540,640,620,'255,244,190',.95);rays(x,540,640,26,1100,'255,248,214',.34,.05);disc(x,540,640,92,'#fffbe8');cloud(x,170,260,1.1,'255,255,255',.55);cloud(x,880,200,.9,'255,255,255',.5);cloud(x,860,520,.7,'255,240,220',.4);ridge(x,760,60,'#3f7a6a',3,.006);ridge(x,820,50,'#2f5f5a',5,.009);ridge(x,890,40,'#1e4248',7,.012);const r=rng(9);for(let i=0;i<9;i++)bird(x,220+i*70+r()*40,360+Math.sin(i*1.3)*80+r()*50,1.3+r()*.8,'#1b2552')},
// 6 courage: figure on cliff facing breaking storm
x=>{sky(x,[[0,'#121a38'],[.35,'#2a3a6e'],[.55,'#7a6a9a'],[.7,'#ffb46a']]);cloud(x,200,200,1.6,'18,24,50',.8);cloud(x,860,150,1.5,'18,24,50',.8);cloud(x,520,120,1.2,'30,40,80',.7);glow(x,540,560,520,'255,206,130',.85);rays(x,540,560,18,1000,'255,222,160',.26);disc(x,540,560,64,'#fff0c2');x.fillStyle='#0b0f26';x.beginPath();x.moveTo(0,1080);x.lineTo(0,700);x.lineTo(240,680);x.lineTo(380,720);x.lineTo(520,700);x.lineTo(640,760);x.lineTo(760,720);x.lineTo(900,740);x.lineTo(1080,700);x.lineTo(1080,1080);x.closePath();x.fill();man(x,420,704,1.0,'#05071a',{arms:1});x.strokeStyle='#05071a';x.lineWidth=5;x.beginPath();x.moveTo(430,500);x.lineTo(430,430);x.stroke();x.fillStyle='#e6edff';x.beginPath();x.moveTo(430,430);x.lineTo(500,448);x.lineTo(430,470);x.closePath();x.fill()},
// 7 fear not: night, lantern, stars
x=>{sky(x,[[0,'#060b22'],[.5,'#14235a'],[.8,'#2a3f86']]);stars(x,170,7,700,1);glow(x,540,330,420,'140,170,255',.28);x.fillStyle='rgba(180,200,255,.1)';x.beginPath();x.moveTo(0,420);x.bezierCurveTo(300,300,700,520,1080,320);x.lineTo(1080,470);x.bezierCurveTo(700,640,300,440,0,540);x.closePath();x.fill();ridge(x,800,60,'#0f1a45',3,.007);ridge(x,860,40,'#080f2a',6,.01);x.fillStyle='#05081c';x.fillRect(0,900,W,W);glow(x,600,780,200,'255,224,150',.55);man(x,540,900,1.15,'#030515',{lantern:1});bird(x,820,260,1.6,'rgba(255,255,255,.7)')},
// 8 plans: road to horizon with sun, golden dawn
x=>{sky(x,[[0,'#4a3b8a'],[.42,'#ee7f93'],[.62,'#ffc27a'],[.75,'#fff0c0']]);glow(x,540,640,540,'255,232,170',.9);rays(x,540,640,20,1000,'255,236,180',.26);disc(x,540,640,80,'#fffbe4');ridge(x,690,40,'#b9647a',2,.008);ridge(x,720,34,'#7a4468',4,.01);x.fillStyle='#2a1c40';x.fillRect(0,740,W,W);x.fillStyle='#ffe3a6';x.beginPath();x.moveTo(525,700);x.lineTo(555,700);x.lineTo(920,1080);x.lineTo(160,1080);x.closePath();x.fill();x.fillStyle='#2a1c40';for(let i=0;i<6;i++){const y=740+Math.pow(i/6,1.7)*300,wd=6+i*8;x.fillRect(540-wd/2,y,wd,10+i*7)}x.fillStyle='#1a1030';tree(x,170,790,1.2,'#1a1030');tree(x,900,780,1.1,'#1a1030')},
// 9 all things work together: forest light beams
x=>{sky(x,[[0,'#10361f'],[.5,'#3f8a4a'],[.8,'#d8e68a']]);glow(x,700,260,520,'255,246,190',.9);rays(x,700,260,16,1000,'255,250,210',.22,.9);disc(x,700,260,46,'#fffdf0');x.fillStyle=lg(x,[[0,'rgba(10,40,20,0)'],[.35,'#0e2e19'],[1,'#07170d']],480,W);x.fillRect(0,480,W,W);for(let i=0;i<9;i++){const px=60+i*125,h=520+((i*53)%140);x.fillStyle=i%2?'#0f2a18':'#143820';x.fillRect(px,1080-h,38,h);x.beginPath();x.moveTo(px-95,1080-h+240);x.lineTo(px+19,1080-h-70);x.lineTo(px+133,1080-h+240);x.closePath();x.fill()}x.fillStyle='#0a1d11';x.fillRect(0,930,W,W);x.fillStyle='rgba(255,250,200,.35)';x.beginPath();x.moveTo(440,1080);x.lineTo(520,700);x.lineTo(580,700);x.lineTo(680,1080);x.closePath();x.fill()},
// 10 refuge: fortress rock in storm with light
x=>{sky(x,[[0,'#10162f'],[.4,'#2e3d70'],[.7,'#8a8ab0'],[.82,'#ffd9a0']]);cloud(x,180,190,1.6,'20,26,54',.75);cloud(x,860,230,1.6,'20,26,54',.75);glow(x,540,520,520,'255,230,170',.7);rays(x,540,520,14,950,'255,235,185',.22);x.fillStyle='#0a0e22';x.beginPath();x.moveTo(0,1080);x.lineTo(0,820);x.lineTo(200,780);x.lineTo(300,640);x.lineTo(420,600);x.lineTo(660,600);x.lineTo(780,650);x.lineTo(880,780);x.lineTo(1080,820);x.lineTo(1080,1080);x.closePath();x.fill();x.fillRect(430,440,220,170);x.fillRect(420,410,40,40);x.fillRect(500,410,40,40);x.fillRect(580,410,40,40);x.fillRect(630,410,24,40);x.fillStyle='#ffd98a';x.fillRect(520,500,40,70);x.beginPath();x.arc(540,500,20,Math.PI,0);x.fill();x.fillStyle='#0a0e22';x.fillRect(530,300,6,110);x.fillStyle='#e6edff';x.beginPath();x.moveTo(536,300);x.lineTo(610,318);x.lineTo(536,340);x.closePath();x.fill();x.fillStyle='rgba(120,140,200,.18)';x.fillRect(0,900,W,W)},
// 11 supply: golden wheat field at sunrise
x=>{sky(x,[[0,'#3b4a9a'],[.4,'#f08a7a'],[.62,'#ffc968'],[.78,'#fff0b0']]);glow(x,540,600,520,'255,236,170',.85);rays(x,540,600,18,950,'255,240,190',.26);disc(x,540,600,76,'#fffbe6');ridge(x,680,40,'#b87a52',2,.007);x.fillStyle=lg(x,[[0,'#c88a2a'],[1,'#4a2e10']],700,W);x.fillRect(0,700,W,W);const r=rng(11);for(let i=0;i<150;i++){const px=r()*W,py=720+r()*360,s=.55+(py-700)/420;wheat(x,px,py,s,py<860?'#e0a63a':py<960?'#b97d22':'#7a4c12')}x.fillStyle='rgba(0,0,0,.0)';cloud(x,200,250,1,'255,235,210',.4);cloud(x,850,300,.8,'255,230,200',.35)},
// 12 shield of light with cross
x=>{sky(x,[[0,'#101b4a'],[.5,'#27409a'],[.85,'#5a78d8']]);stars(x,70,12,500,.7);glow(x,540,500,560,'160,200,255',.55);rays(x,540,500,22,900,'200,225,255',.22,.1);x.save();x.translate(540,500);x.fillStyle='#e8f1ff';x.shadowColor='rgba(150,200,255,.9)';x.shadowBlur=60;x.beginPath();x.moveTo(-210,-250);x.lineTo(210,-250);x.lineTo(210,-30);x.bezierCurveTo(210,120,80,230,0,290);x.bezierCurveTo(-80,230,-210,120,-210,-30);x.closePath();x.fill();x.shadowBlur=0;x.fillStyle='#2d5ad6';x.beginPath();x.moveTo(-180,-222);x.lineTo(180,-222);x.lineTo(180,-34);x.bezierCurveTo(180,100,70,196,0,246);x.bezierCurveTo(-70,196,-180,100,-180,-34);x.closePath();x.fill();x.fillStyle='#fff';x.fillRect(-18,-150,36,260);x.fillRect(-92,-90,184,36);x.restore();ridge(x,950,40,'#0a1238',3,.008)},
// 13 light: lighthouse beam at night
x=>{sky(x,[[0,'#050a1f'],[.55,'#112050'],[.8,'#1f3a7c']]);stars(x,120,13,520,1);const g=x.createLinearGradient(520,360,1080,300);g.addColorStop(0,'rgba(255,244,190,.75)');g.addColorStop(1,'rgba(255,244,190,0)');x.fillStyle=g;x.beginPath();x.moveTo(520,372);x.lineTo(1080,120);x.lineTo(1080,560);x.closePath();x.fill();const g2=x.createLinearGradient(520,360,0,420);g2.addColorStop(0,'rgba(255,244,190,.5)');g2.addColorStop(1,'rgba(255,244,190,0)');x.fillStyle=g2;x.beginPath();x.moveTo(520,372);x.lineTo(0,260);x.lineTo(0,560);x.closePath();x.fill();glow(x,520,372,200,'255,240,180',.8);water(x,820,'#16306a','#050c26');shimmer(x,520,830,160,'255,240,190',.35,8);x.fillStyle='#06091f';x.beginPath();x.moveTo(0,1080);x.lineTo(0,900);x.lineTo(240,860);x.lineTo(420,820);x.lineTo(640,830);x.lineTo(820,880);x.lineTo(1080,900);x.lineTo(1080,1080);x.closePath();x.fill();x.fillStyle='#f4f1ea';x.beginPath();x.moveTo(470,830);x.lineTo(570,830);x.lineTo(552,430);x.lineTo(488,430);x.closePath();x.fill();x.fillStyle='#c0322e';[500,620,730].forEach(y=>x.fillRect(470+(y-500)*.02-4,y-40,110,36));x.fillStyle='#10163a';x.fillRect(478,396,84,36);x.fillStyle='#ffe9a0';x.fillRect(486,402,68,24);x.fillStyle='#10163a';x.beginPath();x.moveTo(472,396);x.lineTo(520,350);x.lineTo(568,396);x.closePath();x.fill()}
];

function house(x,cx,cy,s,col,lit){x.fillStyle=col;x.fillRect(cx-60*s,cy-90*s,120*s,90*s);x.beginPath();x.moveTo(cx-78*s,cy-86*s);x.lineTo(cx,cy-150*s);x.lineTo(cx+78*s,cy-86*s);x.closePath();x.fill();x.fillRect(cx+30*s,cy-138*s,16*s,38*s);if(lit){x.fillStyle=lit;x.fillRect(cx-42*s,cy-68*s,26*s,30*s);x.fillRect(cx+16*s,cy-68*s,26*s,30*s);x.fillRect(cx-9*s,cy-42*s,18*s,42*s)}}
function dove(x,cx,cy,s,col){x.fillStyle=col;x.beginPath();x.ellipse(cx,cy,44*s,22*s,-.15,0,7);x.fill();x.beginPath();x.arc(cx+44*s,cy-12*s,14*s,0,7);x.fill();x.beginPath();x.moveTo(cx+56*s,cy-14*s);x.lineTo(cx+74*s,cy-9*s);x.lineTo(cx+56*s,cy-6*s);x.closePath();x.fill();x.beginPath();x.moveTo(cx-10*s,cy-8*s);x.bezierCurveTo(cx-30*s,cy-80*s,cx-90*s,cy-110*s,cx-120*s,cy-96*s);x.bezierCurveTo(cx-90*s,cy-72*s,cx-60*s,cy-30*s,cx-40*s,cy+6*s);x.closePath();x.fill();x.beginPath();x.moveTo(cx-38*s,cy+4*s);x.lineTo(cx-92*s,cy+22*s);x.lineTo(cx-84*s,cy+4*s);x.lineTo(cx-96*s,cy-6*s);x.closePath();x.fill();x.strokeStyle='#6fa86a';x.lineWidth=4*s;x.beginPath();x.moveTo(cx+70*s,cy-7*s);x.quadraticCurveTo(cx+90*s,cy+8*s,cx+112*s,cy+4*s);x.stroke();x.fillStyle='#6fa86a';[[84,4],[96,8],[106,2]].forEach(l=>{x.beginPath();x.ellipse(cx+l[0]*s,cy+l[1]*s,8*s,4*s,.5,0,7);x.fill()})}
function eagle(x,cx,cy,s,col){x.fillStyle=col;[-1,1].forEach(d=>{x.beginPath();x.moveTo(cx,cy-12*s);x.bezierCurveTo(cx+d*60*s,cy-76*s,cx+d*170*s,cy-66*s,cx+d*270*s,cy-6*s);x.bezierCurveTo(cx+d*220*s,cy-14*s,cx+d*170*s,cy+14*s,cx+d*128*s,cy+30*s);x.bezierCurveTo(cx+d*96*s,cy+14*s,cx+d*60*s,cy+22*s,cx+d*40*s,cy+34*s);x.lineTo(cx,cy+30*s);x.closePath();x.fill()});x.beginPath();x.ellipse(cx,cy+8*s,22*s,40*s,0,0,7);x.fill();x.beginPath();x.arc(cx,cy-36*s,15*s,0,7);x.fill();x.beginPath();x.moveTo(cx-4*s,cy-36*s);x.lineTo(cx+6*s,cy-24*s);x.lineTo(cx+10*s,cy-38*s);x.closePath();x.fill();x.beginPath();x.moveTo(cx-18*s,cy+40*s);x.lineTo(cx+18*s,cy+40*s);x.lineTo(cx+26*s,cy+84*s);x.lineTo(cx-26*s,cy+84*s);x.closePath();x.fill()}
function rainbow(x,cx,cy,r,w){['#ff6b6b','#ffa94d','#ffe066','#69db7c','#4dabf7','#9775fa'].forEach((c,i)=>{x.strokeStyle=c;x.globalAlpha=.78;x.lineWidth=w;x.beginPath();x.arc(cx,cy,r-i*w,Math.PI,0);x.stroke()});x.globalAlpha=1}
function anchor(x,cx,cy,s,col){x.strokeStyle=col;x.fillStyle=col;x.lineWidth=16*s;x.lineCap='round';x.beginPath();x.arc(cx,cy-110*s,16*s,0,7);x.stroke();x.beginPath();x.moveTo(cx,cy-94*s);x.lineTo(cx,cy+100*s);x.stroke();x.beginPath();x.moveTo(cx-44*s,cy-58*s);x.lineTo(cx+44*s,cy-58*s);x.stroke();x.beginPath();x.arc(cx,cy+30*s,96*s,Math.PI*.12,Math.PI*.88);x.stroke();x.beginPath();x.moveTo(cx-95*s,cy+54*s);x.lineTo(cx-86*s,cy+22*s);x.lineTo(cx-62*s,cy+52*s);x.closePath();x.fill();x.beginPath();x.moveTo(cx+95*s,cy+54*s);x.lineTo(cx+86*s,cy+22*s);x.lineTo(cx+62*s,cy+52*s);x.closePath();x.fill()}
function door(x,cx,cy,w,h,rgb){glow(x,cx,cy-h*.5,h*.9,rgb,.7);x.fillStyle='#1b1030';x.beginPath();x.moveTo(cx-w/2-14,cy);x.lineTo(cx-w/2-14,cy-h+w/2);x.arc(cx,cy-h+w/2,w/2+14,Math.PI,0);x.lineTo(cx+w/2+14,cy);x.closePath();x.fill();const g=x.createLinearGradient(0,cy-h,0,cy);g.addColorStop(0,'#fffbe6');g.addColorStop(1,'#ffd98a');x.fillStyle=g;x.beginPath();x.moveTo(cx-w/2,cy);x.lineTo(cx-w/2,cy-h+w/2);x.arc(cx,cy-h+w/2,w/2,Math.PI,0);x.lineTo(cx+w/2,cy);x.closePath();x.fill()}
function book(x,cx,cy,s){x.fillStyle='#f6f0e0';x.beginPath();x.moveTo(cx,cy);x.lineTo(cx-150*s,cy-26*s);x.lineTo(cx-150*s,cy-120*s);x.lineTo(cx,cy-92*s);x.closePath();x.fill();x.fillStyle='#e8dfc6';x.beginPath();x.moveTo(cx,cy);x.lineTo(cx+150*s,cy-26*s);x.lineTo(cx+150*s,cy-120*s);x.lineTo(cx,cy-92*s);x.closePath();x.fill();x.strokeStyle='rgba(120,100,70,.5)';x.lineWidth=2.5*s;for(let i=0;i<5;i++){x.beginPath();x.moveTo(cx-135*s,cy-(40+i*14)*s);x.lineTo(cx-18*s,cy-(24+i*14)*s);x.moveTo(cx+18*s,cy-(24+i*14)*s);x.lineTo(cx+135*s,cy-(40+i*14)*s);x.stroke()}x.fillStyle='#4a2f1a';x.fillRect(cx-170*s,cy-8*s,340*s,16*s)}
function kite(x,cx,cy,s,c1,c2,tx,ty){x.strokeStyle='rgba(30,30,50,.7)';x.lineWidth=2;x.beginPath();x.moveTo(cx,cy+60*s);x.quadraticCurveTo((cx+tx)/2-40,(cy+ty)/2+60,tx,ty);x.stroke();x.fillStyle=c1;x.beginPath();x.moveTo(cx,cy-70*s);x.lineTo(cx+46*s,cy);x.lineTo(cx,cy+60*s);x.closePath();x.fill();x.fillStyle=c2;x.beginPath();x.moveTo(cx,cy-70*s);x.lineTo(cx-46*s,cy);x.lineTo(cx,cy+60*s);x.closePath();x.fill();for(let i=1;i<=4;i++){x.fillStyle=i%2?c1:c2;x.beginPath();x.arc(cx+Math.sin(i)*14*s,cy+60*s+i*22*s,7*s,0,7);x.fill()}}
function dunes(x,y0,cols,seed){cols.forEach((c,i)=>ridge(x,y0+i*60,50-i*8,c,seed+i,.005+i*.002))}
const SC2=[
// 14 rest: green pastures and still waters
x=>{sky(x,[[0,'#6a5fb0'],[.4,'#f08f9a'],[.62,'#ffcf86'],[.75,'#ffeab0']]);glow(x,540,620,500,'255,226,160',.85);disc(x,540,610,66,'#fff2c4');ridge(x,650,50,'#6c8a70',3,.007);water(x,690,'#e8b28a','#6a5a8a');shimmer(x,540,700,200,'255,236,190',.6,2);ridge(x,820,44,'#3f7a4a',5,.008);ridge(x,880,36,'#2b5a38',8,.01);sheep(x,260,860,1.1,'#f6efe6','#2a2230');sheep(x,420,900,.9,'#efe6da','#2a2230');sheep(x,780,870,1.0,'#f6efe6','#2a2230');tree(x,900,840,1.4,'#1f3f2a')},
// 15 renewal: eagle soaring
x=>{sky(x,[[0,'#2d62c8'],[.45,'#78b4f0'],[.68,'#ffe3a0'],[.82,'#fff4cc']]);glow(x,700,420,420,'255,246,200',.9);rays(x,700,420,18,900,'255,248,215',.22);disc(x,700,420,56,'#fffbe8');cloud(x,200,330,1.3,'255,255,255',.7);cloud(x,860,640,1.1,'255,255,255',.6);cloud(x,330,700,.9,'255,255,255',.55);peak(x,300,640,1100,500,'#4a5f9a','#eef3ff');peak(x,820,700,1100,500,'#37487c');eagle(x,470,330,1.55,'#16162e')},
// 16 new mercies each morning: sea sunrise
x=>{sky(x,[[0,'#40508e'],[.35,'#f08c8a'],[.55,'#ffc27a'],[.66,'#ffe8b4']]);glow(x,540,650,560,'255,232,170',.9);rays(x,540,650,20,1000,'255,236,180',.25,.1);disc(x,540,650,84,'#fffbe6');water(x,650,'#f6c27a','#2a3a72');shimmer(x,540,660,260,'255,244,200',.7,3);x.fillStyle='#2a1f40';x.beginPath();x.moveTo(250,790);x.lineTo(430,790);x.lineTo(400,826);x.lineTo(280,826);x.closePath();x.fill();x.fillRect(336,704,5,86);x.beginPath();x.moveTo(341,708);x.lineTo(406,782);x.lineTo(341,782);x.closePath();x.fill();for(let i=0;i<5;i++)bird(x,640+i*60,420+Math.sin(i*2)*60,1.4,'#2a2450')},
// 17 seek first the kingdom: path to golden city
x=>{sky(x,[[0,'#2f3f8f'],[.4,'#7a7ad0'],[.58,'#ffc98a'],[.72,'#fff1c4']]);glow(x,540,560,520,'255,238,180',.9);rays(x,540,560,18,950,'255,242,200',.24);ridge(x,640,40,'#6b72b8',2,.008);x.fillStyle='#fff0c0';x.beginPath();x.moveTo(380,640);[[380,560],[400,560],[400,520],[430,520],[430,470],[450,430],[470,470],[470,520],[510,520],[510,420],[525,380],[540,330],[555,380],[570,420],[570,520],[610,520],[610,470],[630,430],[650,470],[650,520],[680,520],[680,560],[700,560],[700,640]].forEach(p=>x.lineTo(p[0],p[1]));x.closePath();x.fill();glow(x,540,500,300,'255,244,190',.7);x.fillStyle='#1c1a48';x.fillRect(0,640,W,W);x.fillStyle='#ffe6a0';x.beginPath();x.moveTo(520,640);x.bezierCurveTo(450,720,660,770,560,850);x.bezierCurveTo(500,900,300,930,200,1080);x.lineTo(800,1080);x.bezierCurveTo(740,940,860,900,640,850);x.bezierCurveTo(600,780,580,700,560,640);x.closePath();x.fill();man(x,520,900,.85,'#0c0c2a',{staff:1})},
// 18 help from the hills: figure gazing up at mountains at dawn
x=>{sky(x,[[0,'#10206a'],[.4,'#4a60c0'],[.62,'#ff9a7a'],[.78,'#ffd6a0']]);stars(x,60,18,380,.8);glow(x,640,600,520,'255,214,150',.85);rays(x,640,600,16,950,'255,226,170',.2);peak(x,300,380,820,460,'#3a4a8a','#dbe6ff');peak(x,640,300,820,500,'#2a3670','#eaf0ff');peak(x,940,420,820,420,'#222c5e');ridge(x,860,40,'#161f4a',3,.008);x.fillStyle='#0c1238';x.fillRect(0,880,W,W);man(x,230,880,.9,'#080c28',{arms:1})},
// 19 secret place: huge tree sheltering house, stars
x=>{sky(x,[[0,'#060a24'],[.5,'#14246a'],[.85,'#2b3f88']]);stars(x,130,19,600,1);glow(x,860,200,260,'200,215,255',.35);disc(x,860,200,48,'#f4f4ff');x.fillStyle='#0a1238';x.beginPath();x.moveTo(0,1080);x.lineTo(0,860);x.quadraticCurveTo(540,780,1080,860);x.lineTo(1080,1080);x.closePath();x.fill();tree(x,470,850,3.4,'#060b22');house(x,700,850,.8,'#0a0f2c','#ffd98a');glow(x,700,800,160,'255,214,130',.4);const r=rng(5);for(let i=0;i<22;i++){x.fillStyle='rgba(255,236,150,.85)';x.beginPath();x.arc(380+r()*420,640+r()*220,2.6,0,7);x.fill()}},
// 20 John 3:16: cross on hill at sunrise
x=>{sky(x,[[0,'#3a2a7a'],[.4,'#e0607a'],[.62,'#ffb066'],[.75,'#ffe6a8']]);glow(x,540,520,600,'255,226,160',.95);rays(x,540,520,26,1100,'255,236,180',.34,.1);disc(x,540,520,90,'#fff6d4');cloud(x,180,260,1.1,'255,214,200',.45);cloud(x,880,330,.9,'255,214,200',.4);x.fillStyle='#1a0f30';x.beginPath();x.moveTo(0,1080);x.lineTo(0,760);x.quadraticCurveTo(540,610,1080,760);x.lineTo(1080,1080);x.closePath();x.fill();cross(x,540,500,3.6,'#150a28');for(let i=0;i<4;i++)bird(x,160+i*70,330+i*10,1.3,'#2a1b4a')},
// 21 come unto me: bench under tree by lake at dusk
x=>{sky(x,[[0,'#3a2a78'],[.4,'#b4509a'],[.62,'#ffa27a'],[.76,'#ffd9a0']]);stars(x,30,21,300,.5);glow(x,640,600,420,'255,210,150',.7);disc(x,640,600,56,'#ffeab8');water(x,680,'#d89a8a','#2a2058');shimmer(x,640,690,180,'255,226,170',.5,6);x.fillStyle='#160f34';x.beginPath();x.moveTo(0,1080);x.lineTo(0,820);x.quadraticCurveTo(300,760,560,830);x.lineTo(1080,860);x.lineTo(1080,1080);x.closePath();x.fill();tree(x,230,820,2.4,'#160f34');x.fillRect(380,780,220,12);x.fillRect(390,792,10,38);x.fillRect(580,792,10,38);x.fillRect(380,740,10,52);x.fillRect(380,742,220,8);x.beginPath();x.arc(500,720,16,0,7);x.fill();x.beginPath();x.moveTo(482,740);x.lineTo(520,740);x.lineTo(530,780);x.lineTo(476,780);x.closePath();x.fill()},
// 22 my house will serve the Lord: house on hill with family
x=>{sky(x,[[0,'#2f3f8f'],[.4,'#d86a8a'],[.62,'#ffb274'],[.78,'#ffe1a0']]);glow(x,300,620,520,'255,226,160',.8);disc(x,300,620,66,'#fff0bc');cloud(x,760,250,1,'255,214,200',.4);x.fillStyle='#24173f';x.beginPath();x.moveTo(0,1080);x.lineTo(0,800);x.quadraticCurveTo(300,720,640,780);x.quadraticCurveTo(900,820,1080,760);x.lineTo(1080,1080);x.closePath();x.fill();house(x,780,790,1.5,'#150c2c','#ffd98a');glow(x,780,730,200,'255,214,130',.35);man(x,360,840,.8,'#150c2c');man(x,440,840,.78,'#150c2c');man(x,500,846,.42,'#150c2c');man(x,540,846,.38,'#150c2c');tree(x,160,800,1.3,'#150c2c')},
// 23 children: kids with kite
x=>{sky(x,[[0,'#3a7ae0'],[.5,'#8cc4f4'],[.75,'#ffeab8']]);cloud(x,200,200,1.3,'255,255,255',.8);cloud(x,860,320,1.1,'255,255,255',.75);cloud(x,520,120,.9,'255,255,255',.6);glow(x,880,160,260,'255,250,210',.7);disc(x,880,160,48,'#fffbe0');ridge(x,760,40,'#7ac27a',2,.006);x.fillStyle='#3f9a52';x.beginPath();x.moveTo(0,1080);x.lineTo(0,830);x.quadraticCurveTo(540,730,1080,840);x.lineTo(1080,1080);x.closePath();x.fill();kite(x,720,360,1.8,'#ff5a5a','#ffd23f',410,800);man(x,410,810,.5,'#1c2f4a');man(x,350,820,.4,'#1c2f4a');tree(x,930,800,1.2,'#1f5a32')},
// 24 tree by rivers of water
x=>{sky(x,[[0,'#3a5ac8'],[.45,'#8ac8f0'],[.7,'#fff0b8']]);glow(x,820,380,420,'255,246,200',.9);rays(x,820,380,16,900,'255,250,214',.2);disc(x,820,380,50,'#fffbe8');cloud(x,240,260,1.1,'255,255,255',.6);ridge(x,700,40,'#6aa87a',2,.007);x.fillStyle='#2f7a44';x.beginPath();x.moveTo(0,1080);x.lineTo(0,770);x.quadraticCurveTo(540,700,1080,790);x.lineTo(1080,1080);x.closePath();x.fill();x.fillStyle=lg(x,[[0,'#bfe8ff'],[1,'#2a6ab0']],780,1080);x.beginPath();x.moveTo(560,780);x.bezierCurveTo(520,850,780,880,700,960);x.bezierCurveTo(640,1010,300,1020,200,1080);x.lineTo(760,1080);x.bezierCurveTo(900,990,860,940,780,900);x.bezierCurveTo(690,850,640,820,600,780);x.closePath();x.fill();tree(x,300,830,3.6,'#143a22');x.fillStyle='#e8a04a';[[220,620],[300,560],[380,640],[260,700],[340,700]].forEach(p=>{x.beginPath();x.arc(p[0],p[1],9,0,7);x.fill()})},
// 25 healing: dove over calm water at sunrise
x=>{sky(x,[[0,'#4a5aa0'],[.4,'#f0a0a0'],[.6,'#ffd89a'],[.72,'#fff3d0']]);glow(x,540,600,560,'255,240,190',.95);rays(x,540,600,24,1000,'255,246,210',.3,.1);disc(x,540,600,80,'#fffdf0');water(x,640,'#f8dca8','#4a6aa8');shimmer(x,540,650,240,'255,248,214',.6,4);dove(x,500,340,2.0,'#ffffff');for(let i=0;i<14;i++){const r=rng(i+3);x.fillStyle='rgba(255,255,255,.7)';x.beginPath();x.arc(240+r()*600,200+r()*400,2.5,0,7);x.fill()}},
// 26 peace: misty lake at dawn
x=>{sky(x,[[0,'#6a82c0'],[.4,'#b8c8ec'],[.62,'#f6dcc8'],[.74,'#fff0dc']]);glow(x,540,560,500,'255,246,224',.9);disc(x,540,560,58,'#fffaf0');peak(x,200,420,720,420,'#8a9acc');peak(x,880,380,720,460,'#7a8abe');peak(x,540,520,720,360,'#9aa8d4');x.fillStyle='rgba(255,246,230,.35)';x.fillRect(0,640,W,60);x.fillRect(0,590,W,24);water(x,720,'#c8d4f0','#5a6ea8');shimmer(x,540,730,160,'255,246,224',.5,9);x.fillStyle='#34406e';x.beginPath();x.moveTo(620,830);x.lineTo(800,830);x.lineTo(770,860);x.lineTo(650,860);x.closePath();x.fill();bird(x,320,420,1.4,'#4a5a90');bird(x,380,450,1.1,'#4a5a90')},
// 27 faith: seedling with mountain and sunrise
x=>{sky(x,[[0,'#2f4aa8'],[.4,'#7aa0e8'],[.62,'#ffd48a'],[.78,'#fff0c0']]);glow(x,540,520,500,'255,236,180',.9);rays(x,540,520,16,900,'255,244,200',.22);disc(x,540,520,56,'#fffbe6');peak(x,540,300,860,640,'#26346c','#eef3ff');x.fillStyle='#3a2414';x.fillRect(0,840,W,W);ridge(x,860,20,'#2a1a0e',4,.01);glow(x,540,800,220,'200,255,170',.55);x.strokeStyle='#58b84a';x.lineWidth=12;x.lineCap='round';x.beginPath();x.moveTo(540,860);x.quadraticCurveTo(536,810,540,770);x.stroke();x.fillStyle='#6ed05a';[[-1,770],[1,780]].forEach(d=>{x.beginPath();x.moveTo(540,775);x.bezierCurveTo(540+d[0]*40,730,540+d[0]*100,740,540+d[0]*110,775);x.bezierCurveTo(540+d[0]*80,805,540+d[0]*30,800,540,775);x.fill()})},
// 28 wisdom: open book with rays
x=>{sky(x,[[0,'#0a1240'],[.5,'#1c3484'],[.85,'#3a56b0']]);stars(x,110,28,520,1);glow(x,540,700,520,'255,236,170',.85);rays(x,540,700,22,900,'255,240,190',.3,.4);book(x,540,780,1.35);x.fillStyle='#10163a';x.fillRect(0,790,W,W);x.fillStyle='#2a2a58';x.fillRect(140,780,800,26);for(let i=0;i<10;i++){const r=rng(i+1);x.fillStyle='rgba(255,240,170,.8)';x.beginPath();x.arc(360+r()*360,440+r()*280,2+r()*3,0,7);x.fill()}},
// 29 prayer: kneeling at dawn
x=>{sky(x,[[0,'#2a2a78'],[.4,'#c0508a'],[.6,'#ff9e74'],[.74,'#ffe0a0']]);glow(x,640,600,540,'255,226,160',.9);rays(x,640,600,22,1000,'255,236,180',.3);disc(x,640,600,80,'#fff6d0');ridge(x,720,40,'#6a3a7a',2,.007);x.fillStyle='#140a2c';x.beginPath();x.moveTo(0,1080);x.lineTo(0,830);x.quadraticCurveTo(300,780,560,840);x.lineTo(1080,860);x.lineTo(1080,1080);x.closePath();x.fill();man(x,360,840,.62,'#0a0620',{arms:1})},
// 30 a way in the wilderness: desert with river
x=>{sky(x,[[0,'#4a3a88'],[.4,'#f08a7a'],[.6,'#ffcf88'],[.74,'#fff0c0']]);glow(x,540,580,520,'255,236,180',.9);rays(x,540,580,18,950,'255,240,190',.26);disc(x,540,580,70,'#fffbe6');dunes(x,650,['#c88a5a','#a86a48','#7a4a38'],3);x.fillStyle=lg(x,[[0,'#d8f0ff'],[1,'#3a8ad0']],700,1080);x.beginPath();x.moveTo(530,690);x.bezierCurveTo(500,780,640,820,590,900);x.bezierCurveTo(540,970,360,1000,280,1080);x.lineTo(820,1080);x.bezierCurveTo(780,1000,760,960,690,900);x.bezierCurveTo(640,850,590,790,560,690);x.closePath();x.fill();x.strokeStyle='#4aa85a';x.lineWidth=5;[[340,900],[250,940],[860,930],[950,900],[780,860]].forEach(p=>{x.beginPath();x.moveTo(p[0],p[1]);x.lineTo(p[0],p[1]-40);x.stroke();x.beginPath();x.moveTo(p[0],p[1]-20);x.lineTo(p[0]+14,p[1]-36);x.moveTo(p[0],p[1]-26);x.lineTo(p[0]-14,p[1]-40);x.stroke()})},
// 31 open door
x=>{sky(x,[[0,'#2a2a78'],[.4,'#8a60b8'],[.62,'#ffb48a'],[.78,'#ffe6b0']]);glow(x,540,620,540,'255,230,170',.8);ridge(x,720,40,'#5a3a7a',2,.007);x.fillStyle='#160c2e';x.beginPath();x.moveTo(0,1080);x.lineTo(0,800);x.quadraticCurveTo(540,700,1080,800);x.lineTo(1080,1080);x.closePath();x.fill();rays(x,540,600,16,900,'255,244,200',.25,.2);door(x,540,760,190,340,'255,240,180');x.fillStyle='rgba(255,240,180,.55)';x.beginPath();x.moveTo(440,760);x.lineTo(640,760);x.lineTo(900,1080);x.lineTo(180,1080);x.closePath();x.fill();man(x,540,980,.7,'#0a0620')},
// 32 favour like a shield: halo of light
x=>{sky(x,[[0,'#20308a'],[.5,'#4a68d0'],[.85,'#8aa8f0']]);glow(x,540,520,520,'200,225,255',.8);x.strokeStyle='rgba(255,255,255,.8)';x.lineWidth=14;x.beginPath();x.arc(540,520,230,0,7);x.stroke();x.strokeStyle='rgba(190,220,255,.45)';x.lineWidth=40;x.beginPath();x.arc(540,520,260,0,7);x.stroke();rays(x,540,520,28,860,'210,230,255',.22,.1);const r=rng(32);for(let i=0;i<40;i++){const a=r()*7,d=250+r()*220;x.fillStyle='rgba(255,255,255,.85)';x.beginPath();x.arc(540+Math.cos(a)*d,520+Math.sin(a)*d,2+r()*4,0,7);x.fill()}ridge(x,800,40,'#1a2a6a',3,.008);x.fillStyle='#10205a';x.fillRect(0,860,W,W);man(x,540,760,1.25,'#0a1238',{arms:1})},
// 33 victory: summit flag
x=>{sky(x,[[0,'#7a2a6a'],[.35,'#f06a5a'],[.58,'#ffc060'],[.75,'#ffeaa8']]);glow(x,540,560,560,'255,230,150',.95);rays(x,540,560,24,1100,'255,236,170',.34);disc(x,540,560,84,'#fff4c8');peak(x,300,520,900,520,'#5a2a62');peak(x,800,500,900,540,'#4a2058');peak(x,540,420,900,520,'#241038','#ffeccc');x.fillStyle='#241038';x.fillRect(0,880,W,W);x.strokeStyle='#1a0a2a';x.lineWidth=7;x.beginPath();x.moveTo(600,420);x.lineTo(600,250);x.stroke();x.fillStyle='#ffe23a';x.beginPath();x.moveTo(600,252);x.lineTo(720,282);x.lineTo(600,320);x.closePath();x.fill();man(x,500,430,.6,'#10061e',{arms:1})},
// 34 joy in the morning: night to sunrise
x=>{sky(x,[[0,'#0a0f3a'],[.35,'#3a3a98'],[.58,'#f08a8a'],[.72,'#ffd890']]);stars(x,90,34,380,.9);glow(x,760,620,520,'255,226,160',.95);rays(x,760,620,22,1000,'255,236,180',.3);disc(x,760,620,70,'#fff6d0');ridge(x,700,40,'#5a3a78',2,.007);ridge(x,770,44,'#2a1a50',4,.009);x.fillStyle='#120a30';x.fillRect(0,860,W,W);ridge(x,860,30,'#120a30',7,.01);for(let i=0;i<8;i++)bird(x,160+i*70,300+Math.sin(i)*50,1.3,'#1a1450')},
// 35 hope: rainbow over hills
x=>{sky(x,[[0,'#3a4a98'],[.45,'#8aa0d8'],[.7,'#f8e4b8']]);cloud(x,160,200,1.5,'80,90,150',.6);cloud(x,880,180,1.5,'80,90,150',.6);glow(x,540,620,520,'255,244,200',.7);rainbow(x,540,700,380,26);ridge(x,720,50,'#4a9a6a',2,.007);ridge(x,790,44,'#2f7a4a',5,.009);ridge(x,860,36,'#1f5a38',7,.011);rays(x,540,520,14,900,'255,250,214',.15);tree(x,170,790,1.2,'#124028');tree(x,920,800,1.1,'#124028')},
// 36 grace sufficient: lone tree under beam of light
x=>{sky(x,[[0,'#08103a'],[.5,'#1a2c76'],[.85,'#34489a']]);stars(x,120,36,520,1);const g=x.createLinearGradient(0,0,0,860);g.addColorStop(0,'rgba(255,244,200,.0)');g.addColorStop(1,'rgba(255,244,200,.55)');x.fillStyle=g;x.beginPath();x.moveTo(500,0);x.lineTo(580,0);x.lineTo(780,860);x.lineTo(300,860);x.closePath();x.fill();glow(x,540,840,300,'255,240,180',.5);x.fillStyle='#050824';x.beginPath();x.moveTo(0,1080);x.lineTo(0,870);x.quadraticCurveTo(540,810,1080,880);x.lineTo(1080,1080);x.closePath();x.fill();tree(x,540,850,3.0,'#04061c');man(x,720,880,.5,'#04061c')},
// 37 purpose: star guiding through desert
x=>{sky(x,[[0,'#060a28'],[.5,'#1c2a7a'],[.78,'#4a4aa0']]);stars(x,110,37,500,.9);glow(x,540,260,320,'255,246,200',.8);x.fillStyle='#fffbe0';x.beginPath();for(let i=0;i<8;i++){const a=i*Math.PI/4,rr=i%2?16:70;x.lineTo(540+Math.cos(a)*rr,260+Math.sin(a)*rr)}x.closePath();x.fill();dunes(x,740,['#2a2860','#1a1a48','#0e0e30'],5);x.fillStyle='#0a0a28';x.fillRect(0,900,W,W);man(x,500,900,.95,'#05051a',{staff:1})},
// 38 anchor of hope: stormy sea with anchor
x=>{sky(x,[[0,'#10163a'],[.45,'#2c3c78'],[.7,'#8a9acc']]);cloud(x,200,160,1.7,'20,26,60',.8);cloud(x,860,200,1.7,'20,26,60',.8);glow(x,540,430,420,'255,240,190',.8);rays(x,540,430,18,900,'255,244,200',.24);water(x,720,'#2a3e84','#0a1030');x.strokeStyle='rgba(220,235,255,.5)';x.lineWidth=4;for(let i=0;i<10;i++){const y=740+i*26,o=(i%3)*50;x.beginPath();for(let k=-1;k<14;k++){x.quadraticCurveTo(o+k*90+22,y-14,o+k*90+45,y);x.quadraticCurveTo(o+k*90+67,y+14,o+k*90+90,y)}x.stroke()}anchor(x,540,500,2.5,'#f2f6ff')},
// 39 shine your light: city at night
x=>{sky(x,[[0,'#060a28'],[.5,'#142068'],[.85,'#2a3c90']]);stars(x,100,39,420,.9);x.fillStyle='#0a1038';x.beginPath();x.moveTo(0,1080);x.lineTo(0,760);x.quadraticCurveTo(540,560,1080,760);x.lineTo(1080,1080);x.closePath();x.fill();const r=rng(39);for(let i=0;i<26;i++){const px=180+r()*720,h=60+r()*110,w=40+r()*40,base=700+Math.abs(px-540)*.42;x.fillStyle='#070c2c';x.fillRect(px-w/2,base-h,w,h+80);x.fillStyle='#ffd98a';for(let k=0;k<5;k++)if(r()>.35)x.fillRect(px-w/2+6+(k%2)*(w/2-4),base-h+10+Math.floor(k/2)*26,10,12)}glow(x,540,620,420,'255,236,170',.6);x.fillStyle='#070c2c';x.fillRect(520,540,40,160);x.beginPath();x.moveTo(510,540);x.lineTo(540,480);x.lineTo(570,540);x.closePath();x.fill();x.fillStyle='#ffe9a0';x.beginPath();x.arc(540,520,12,0,7);x.fill();rays(x,540,520,16,420,'255,240,190',.3)}
];
SC2.forEach(f=>SC.push(f));
const SH2=[-240,0,-100,-120,-200,-240,-80,-200,-180,-160,-150,-100,-100,-200,-170,-210,-160,-100,-140,-80,-120,-140,-200,-210,-80,-100];
SH2.forEach(v=>SH.push(v));

function wrap(x,t,maxW){const out=[];let cur='';t.split(/\s+/).forEach(w=>{const s=cur?cur+' '+w:w;if(x.measureText(s).width>maxW&&cur){out.push(cur);cur=w}else cur=s});out.push(cur);return out}
function bwrap(x,t,m){const g=wrap(x,t,m),n=g.length;if(n<2)return g;let lo=m*.45,hi=m;for(let k=0;k<14;k++){const mid=(lo+hi)/2;if(wrap(x,t,mid).length<=n)hi=mid;else lo=mid}return wrap(x,t,hi)}
let logoImg=null,logoReady=false;
function loadLogo(){
  if(logoImg||typeof LOGO==='undefined')return;
  logoImg=new Image();
  logoImg.onload=()=>{logoReady=true;Object.keys(cache).forEach(k=>delete cache[k]);window.dispatchEvent(new Event('dayart-ready'))};
  logoImg.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(LOGO.replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" ').replace('width="34" height="34"','width="200" height="200"'));
}
let tplImg=null,tplReady=false,tplFail=false;
function loadTpl(){if(tplImg)return;tplImg=new Image();tplImg.onload=()=>{tplReady=true;Object.keys(cache).forEach(k=>delete cache[k]);window.dispatchEvent(new Event('dayart-ready'))};tplImg.onerror=()=>{tplFail=true;Object.keys(cache).forEach(k=>delete cache[k]);window.dispatchEvent(new Event('dayart-ready'))};tplImg.src='prophetic-template.jpg?v=2'}
const cache={};
// extra people drawn large in front of each scene: [pose, x, feetY, height, options]
const N='#050a24',D='#12072a',G='160,190,255',Wm='255,226,170';
const FIG={
 2:[['stand',820,660,270,{col:D,glow:Wm}]],
 3:[['pray',280,665,300,{col:N,glow:G}]],
 6:[['raise',800,660,300,{col:D,glow:Wm}]],
 4:[['stand',470,660,250,{col:D,glow:Wm}],['stand',565,660,235,{col:D,f:1,glow:Wm}],['stand',640,660,150,{col:D,kid:1}]],
 5:[['raise',540,660,330,{col:D,glow:Wm}]],
 8:[['walk',540,700,210,{col:D,glow:Wm}]],
 9:[['reach',540,720,250,{col:'#02140c',glow:'255,240,180'}]],
 10:[['pray',250,650,260,{col:N,glow:G}]],
 11:[['raise',330,670,320,{col:'#1d0f06',f:1,glow:Wm}]],
 13:[['stand',800,670,270,{col:N,glow:G,lantern:1}]],
 14:[['pray',290,660,290,{col:'#0a1a1c',f:1,glow:Wm}]],
 17:[['walk',540,700,220,{col:D,glow:Wm}]],
 18:[['raise',290,700,290,{col:N,glow:G}]],
 19:[['pray',250,700,260,{col:D,f:1,glow:Wm}]],
 15:[['raise',540,655,200,{col:N,glow:G}]],
 16:[['raise',800,665,300,{col:D,f:1,glow:Wm}]],
 20:[['reach',330,700,300,{col:N,glow:'255,226,170'}]],
 22:[['stand',330,700,250,{col:D,glow:Wm}],['stand',420,700,235,{col:D,f:1,glow:Wm}],['stand',490,700,150,{col:D,kid:1}]],
 23:[['wave',300,700,270,{col:'#07200f',f:1}],['raise',390,700,190,{col:'#07200f',kid:1}]],
 24:[['reach',800,715,250,{col:'#02140c',f:1,glow:'255,240,180'}]],
 25:[['raise',290,700,290,{col:D,glow:Wm}]],
 26:[['pray',290,650,270,{col:N,f:1,glow:G}]],
 27:[['reach',290,700,260,{col:'#08120c',glow:'200,255,200'}]],
 28:[['read',820,700,290,{col:N,glow:'255,240,190'}]],
 29:[['raise',290,700,290,{col:D,glow:Wm}]],
 30:[['walk',300,720,250,{col:D,glow:Wm}]],
 31:[['stand',540,725,250,{col:'#0b0620',glow:'255,236,190'}]],
 34:[['raise',300,700,300,{col:D,glow:Wm}]],
 36:[['pray',820,700,260,{col:N,glow:G}]],
 37:[['raise',540,700,260,{col:N,glow:'255,240,200'}]],
 38:[['pray',840,700,250,{col:N,f:1,glow:G}]],
 35:[['raise',470,700,270,{col:'#052010',f:1}],['raise',570,700,170,{col:'#052010',kid:1}]],
 39:[['raise',300,700,270,{col:N,glow:'255,226,150',f:1}]]
};
const FIGSKIP={};
function spark(x,cx,cy,r,a){x.save();x.globalAlpha=a;x.fillStyle='#fff';x.shadowColor='rgba(255,255,255,.9)';x.shadowBlur=r*1.2;x.beginPath();x.moveTo(cx,cy-r);x.quadraticCurveTo(cx,cy,cx+r*.62,cy);x.quadraticCurveTo(cx,cy,cx,cy+r);x.quadraticCurveTo(cx,cy,cx-r*.62,cy);x.quadraticCurveTo(cx,cy,cx,cy-r);x.fill();x.restore()}
function rr(x,X,Y,w,h,r){x.beginPath();x.moveTo(X+r,Y);x.arcTo(X+w,Y,X+w,Y+h,r);x.arcTo(X+w,Y+h,X,Y+h,r);x.arcTo(X,Y+h,X,Y,r);x.arcTo(X,Y,X+w,Y,r);x.closePath()}
let grain=null;
function grainPat(x){if(grain)return grain;const g=document.createElement('canvas');g.width=g.height=180;const gx=g.getContext('2d'),im=gx.createImageData(180,180),r=rng(7);for(let i=0;i<im.data.length;i+=4){const v=r()*255;im.data[i]=im.data[i+1]=im.data[i+2]=v;im.data[i+3]=255}gx.putImageData(im,0,0);grain=x.createPattern(g,'repeat');return grain}
// Gen-Z finish: aura colour wash, glow bloom, sparkles, film grain, vignette
function finish(x,i){
  x.save();
  x.globalCompositeOperation='soft-light';let g=x.createLinearGradient(0,0,W,W);g.addColorStop(0,'rgba(0,225,255,.55)');g.addColorStop(.5,'rgba(150,80,255,.25)');g.addColorStop(1,'rgba(255,60,170,.6)');x.fillStyle=g;x.fillRect(0,0,W,W);
  x.globalCompositeOperation='screen';[[170,170,420,'255,90,180',.26],[930,260,420,'80,210,255',.24]].forEach(c=>glow(x,c[0],c[1],c[2],c[3],c[4]));
  x.globalCompositeOperation='source-over';
  const r=rng(i*13+5);for(let k=0;k<16;k++){spark(x,40+r()*(W-80),60+r()*480,7+r()*17,.35+r()*.6)}
  x.globalCompositeOperation='overlay';x.globalAlpha=.1;x.fillStyle=grainPat(x);x.fillRect(0,0,W,W);x.globalAlpha=1;
  x.globalCompositeOperation='source-over';
  g=x.createRadialGradient(W/2,W*.45,W*.35,W/2,W*.45,W*.8);g.addColorStop(0,'rgba(8,4,40,0)');g.addColorStop(1,'rgba(8,4,40,.4)');x.fillStyle=g;x.fillRect(0,0,W,W);
  x.restore();
}
function dayArt(i){
  const n=PIC.length;i=((i%n)+n)%n;loadLogo();loadTpl();
  const useT=!tplFail,key=i+(logoReady?'L':'')+(tplReady?'T':'')+(tplFail?'F':'');if(cache[key])return cache[key];
  const c=document.createElement('canvas');c.width=W;c.height=W;const x=c.getContext('2d');
  if(useT){x.fillStyle=lg(x,[[0,'#7b45c4'],[.6,'#3a1c78'],[1,'#140a38']]);x.fillRect(0,0,W,W);if(tplReady){x.drawImage(tplImg,0,0,W,504);x.drawImage(tplImg,0,tplImg.height-2,tplImg.width,2,0,503,W,90)}}
  else{x.save();x.translate(0,SH[i]);try{SC[i](x)}catch(e){x.fillStyle='#1d3a8a';x.fillRect(0,0,W,W)}x.restore();if(SH[i]<0)x.drawImage(c,0,W+SH[i]-2,W,1,0,W+SH[i]-1,W,-SH[i]+2)}
  // layout first, so people can stand on top of the card
  const [line,ref]=PIC[i],cut=line.indexOf('. '),A=cut>0?line.slice(0,cut+1):line,B=cut>0?line.slice(cut+2):'';
  let fs=useT?100:74,la,lb,lh;const MW=W-190;
  for(;fs>=40;fs-=2){x.font='900 '+fs+'px Arial Black, Arial, Helvetica, sans-serif';la=bwrap(x,A,MW);x.font='italic 700 '+Math.round(fs*1.02)+'px Georgia, "Times New Roman", serif';lb=B?bwrap(x,B,MW):[];lh=fs*1.16;if(la.length+lb.length<=5&&(la.length+lb.length)*lh<=(useT?400:330))break}
  const tot=(la.length+lb.length)*lh,cardH=Math.max(tot+104,useT?425:0),cardB=useT?915:905,cardT=cardB-cardH,cx0=48,cw=W-96,padT=(cardH-tot-104)/2;
  if(!useT)(FIG[i]||[]).forEach(f=>{const o=f[4],hh=Math.min(f[3]*(f[0]==='kneel'?1.15:1.12),cardT-150);person(x,f[1],cardT+10,hh,o.col||N,f[0],o)});
  if(!useT){finish(x,i);
  x.fillStyle=lg(x,[[0,'rgba(6,4,40,.55)'],[1,'rgba(6,4,40,0)']],0,210);x.fillRect(0,0,W,210);
  x.fillStyle=lg(x,[[0,'rgba(6,4,40,0)'],[1,'rgba(6,4,40,.85)']],560,W);x.fillRect(0,560,W,W-560)}
  else{x.fillStyle=lg(x,[[0,'rgba(20,10,56,0)'],[.55,'rgba(20,10,56,.55)'],[1,'#140a38']],380,560);x.fillRect(0,380,W,180);x.fillStyle='#140a38';x.fillRect(0,560,W,W-560)}
  x.textAlign='center';x.textBaseline='alphabetic';
  // top pill (already part of the template picture)
  if(!(useT&&tplReady)){const tl='PROPHETIC WORD OF THE DAY';x.font='800 25px Arial, Helvetica, sans-serif';if('letterSpacing' in x)x.letterSpacing='5px';
  const tw0=x.measureText(tl).width,pw=tw0+130,px=(W-pw)/2;
  rr(x,px,40,pw,60,30);x.fillStyle='rgba(255,255,255,.16)';x.fill();x.lineWidth=2.5;x.strokeStyle='rgba(255,255,255,.6)';x.stroke();
  x.fillStyle='#fff';x.fillText(tl,W/2+2,78);if('letterSpacing' in x)x.letterSpacing='0px';
  spark(x,px+34,70,11,1);spark(x,px+pw-34,70,11,1)}
  // glass card
  x.save();x.shadowColor='rgba(0,0,0,.45)';x.shadowBlur=40;x.shadowOffsetY=14;rr(x,cx0,cardT,cw,cardH,44);x.fillStyle=useT?'rgba(14,8,52,.66)':'rgba(14,8,52,.52)';x.fill();x.restore();
  let g=x.createLinearGradient(cx0,cardT,cx0+cw,cardT+cardH);g.addColorStop(0,'rgba(255,255,255,.2)');g.addColorStop(.5,'rgba(255,255,255,.04)');g.addColorStop(1,'rgba(255,255,255,.14)');rr(x,cx0,cardT,cw,cardH,44);x.fillStyle=g;x.fill();
  g=x.createLinearGradient(cx0,cardT,cx0+cw,cardT+cardH);g.addColorStop(0,'#5ef0ff');g.addColorStop(.5,'#c07bff');g.addColorStop(1,'#ff7ac8');rr(x,cx0,cardT,cw,cardH,44);x.lineWidth=3.5;x.strokeStyle=g;x.stroke();
  let y=cardT+52+padT+fs*.8;
  x.shadowColor='rgba(0,0,0,.5)';x.shadowBlur=12;x.shadowOffsetY=3;
  x.font='900 '+fs+'px Arial Black, Arial, Helvetica, sans-serif';x.fillStyle='#fff';la.forEach(t=>{x.fillText(t,W/2,y);y+=lh});
  x.font='italic 700 '+Math.round(fs*1.02)+'px Georgia, "Times New Roman", serif';
  lb.forEach(t=>{const w=x.measureText(t).width,gg=x.createLinearGradient(W/2-w/2,0,W/2+w/2,0);gg.addColorStop(0,'#ffe27a');gg.addColorStop(.55,'#ffb27a');gg.addColorStop(1,'#ff7ac8');x.fillStyle=gg;x.fillText(t,W/2,y);y+=lh});
  x.shadowColor='transparent';x.shadowBlur=0;x.shadowOffsetY=0;
  // reference pill
  const rt=ref.toUpperCase()+'  ·  KJV';x.font='800 28px Arial, Helvetica, sans-serif';if('letterSpacing' in x)x.letterSpacing='3px';
  const rw=x.measureText(rt).width+80,rx=(W-rw)/2,ry=cardB-30;
  g=x.createLinearGradient(rx,0,rx+rw,0);g.addColorStop(0,'#ffd86b');g.addColorStop(1,'#ff7ac8');
  x.save();x.shadowColor='rgba(255,122,200,.55)';x.shadowBlur=24;rr(x,rx,ry,rw,60,30);x.fillStyle=g;x.fill();x.restore();
  x.fillStyle='#2a0a3a';x.fillText(rt,W/2+2,ry+40);if('letterSpacing' in x)x.letterSpacing='0px';
  // footer: site address
  const txt='organizechurch.github.io';x.font='800 31px Arial, Helvetica, sans-serif';x.fillStyle='#fff';
  const tw=x.measureText(txt).width,lx=(W-tw-(logoReady?66:0))/2;
  if(logoReady)x.drawImage(logoImg,lx,W-88,54,54);
  x.textAlign='left';x.fillText(txt,lx+(logoReady?68:0),W-49);x.textAlign='center';
  cache[key]=c;return c;
}

// Verse / Declaration share pictures in the same Gen-Z style (portrait 1080 x 1350)
function dayCardArt(kind,v){
  loadLogo();const H=1350,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');
  const isV=kind==='verse';
  let g=x.createLinearGradient(0,0,W,H);
  if(isV){g.addColorStop(0,'#1b2a8f');g.addColorStop(.5,'#6a3fd0');g.addColorStop(1,'#d8478f')}else{g.addColorStop(0,'#3b1670');g.addColorStop(.45,'#d8478f');g.addColorStop(1,'#ff9a5a')}
  x.fillStyle=g;x.fillRect(0,0,W,H);
  x.globalCompositeOperation='screen';[[180,200,520,isV?'80,210,255':'255,200,120',.4],[920,1000,560,isV?'255,100,190':'120,200,255',.35],[900,160,360,'255,255,255',.14]].forEach(q=>{const gg=x.createRadialGradient(q[0],q[1],0,q[0],q[1],q[2]);gg.addColorStop(0,`rgba(${q[3]},${q[4]})`);gg.addColorStop(1,`rgba(${q[3]},0)`);x.fillStyle=gg;x.fillRect(0,0,W,H)});
  x.globalCompositeOperation='source-over';
  const r=rng(isV?21:34);for(let k=0;k<22;k++)spark(x,40+r()*(W-80),50+r()*(H-100),6+r()*16,.3+r()*.6);
  x.globalCompositeOperation='overlay';x.globalAlpha=.1;x.fillStyle=grainPat(x);x.fillRect(0,0,W,H);x.globalAlpha=1;x.globalCompositeOperation='source-over';
  x.textAlign='center';x.textBaseline='alphabetic';
  // title pill
  const tl=isV?'VERSE OF THE DAY':'DECLARATION OF THE DAY';x.font='800 30px Arial, Helvetica, sans-serif';if('letterSpacing' in x)x.letterSpacing='6px';
  const tw0=x.measureText(tl).width,pw=tw0+140,px=(W-pw)/2;
  rr(x,px,70,pw,72,36);x.fillStyle='rgba(255,255,255,.18)';x.fill();x.lineWidth=3;x.strokeStyle='rgba(255,255,255,.65)';x.stroke();x.fillStyle='#fff';x.fillText(tl,W/2+3,119);if('letterSpacing' in x)x.letterSpacing='0px';
  spark(x,px+40,106,13,1);spark(x,px+pw-40,106,13,1);
  // body
  const body=isV?['“'+v[0]+'”']:v[2].slice(0,-1),amen=isV?null:v[2][v[2].length-1];
  const cx0=60,cw=W-120,cT=200,cB=1130,mw=cw-120;let fs=isV?76:50,lines,lh,tot;
  for(;fs>=26;fs-=2){x.font=(isV?'italic 700 ':'700 ')+fs+'px '+(isV?'Georgia, "Times New Roman", serif':'Arial, Helvetica, sans-serif');lines=[];body.forEach(p=>bwrap(x,p,mw).forEach(l=>lines.push(l)));lh=fs*(isV?1.28:1.3);tot=lines.length*lh+(isV?0:lh*1.5);if(tot<=cB-cT-260)break}
  const ch=tot+190,top=cT+((cB-cT)-ch)/2+20;
  x.save();x.shadowColor='rgba(0,0,0,.4)';x.shadowBlur=44;x.shadowOffsetY=16;rr(x,cx0,top,cw,ch,56);x.fillStyle='rgba(14,6,56,.5)';x.fill();x.restore();
  g=x.createLinearGradient(cx0,top,cx0+cw,top+ch);g.addColorStop(0,'rgba(255,255,255,.2)');g.addColorStop(.5,'rgba(255,255,255,.04)');g.addColorStop(1,'rgba(255,255,255,.14)');rr(x,cx0,top,cw,ch,56);x.fillStyle=g;x.fill();
  g=x.createLinearGradient(cx0,top,cx0+cw,top+ch);g.addColorStop(0,'#5ef0ff');g.addColorStop(.5,'#c07bff');g.addColorStop(1,'#ff7ac8');rr(x,cx0,top,cw,ch,56);x.lineWidth=4;x.strokeStyle=g;x.stroke();
  let y=top+80+fs*.8;x.shadowColor='rgba(0,0,0,.5)';x.shadowBlur=14;x.shadowOffsetY=3;x.fillStyle='#fff';
  x.font=(isV?'italic 700 ':'700 ')+fs+'px '+(isV?'Georgia, "Times New Roman", serif':'Arial, Helvetica, sans-serif');
  lines.forEach(t=>{x.fillText(t,W/2,y);y+=lh});
  if(amen){y+=lh*.2;x.font='italic 700 '+Math.round(fs*1.1)+'px Georgia, "Times New Roman", serif';const w=x.measureText(amen).width,gg=x.createLinearGradient(W/2-w/2,0,W/2+w/2,0);gg.addColorStop(0,'#ffe27a');gg.addColorStop(.55,'#ffb27a');gg.addColorStop(1,'#ff7ac8');x.fillStyle=gg;x.fillText(amen,W/2,y)}
  x.shadowColor='transparent';x.shadowBlur=0;x.shadowOffsetY=0;
  // reference pill
  const rt=(isV?v[1].toUpperCase()+'  ·  KJV':'BASED ON '+v[1].toUpperCase());x.font='800 32px Arial, Helvetica, sans-serif';if('letterSpacing' in x)x.letterSpacing='3px';
  const rw=x.measureText(rt).width+96,rx=(W-rw)/2,ry=top+ch-34;
  g=x.createLinearGradient(rx,0,rx+rw,0);g.addColorStop(0,'#ffd86b');g.addColorStop(1,'#ff7ac8');
  x.save();x.shadowColor='rgba(255,122,200,.55)';x.shadowBlur=26;rr(x,rx,ry,rw,68,34);x.fillStyle=g;x.fill();x.restore();x.fillStyle='#2a0a3a';x.fillText(rt,W/2+2,ry+46);if('letterSpacing' in x)x.letterSpacing='0px';
  // footer
  x.fillStyle='#fff';x.font='800 31px Arial, Helvetica, sans-serif';x.fillText('Church management + creative inspiration',W/2,H-132);
  const txt='Get the free app  ·  organizechurch.github.io';x.font='700 30px Arial, Helvetica, sans-serif';x.fillStyle='#ffe9a8';x.fillText(txt,W/2,H-80);
  if(logoReady){x.drawImage(logoImg,70,H-200,92,92);x.drawImage(logoImg,W-162,H-200,92,92)}
  return c;
}
window.dayCardArt=dayCardArt;window.dayArtReadyLogo=()=>{loadLogo();return logoReady};
window.dayArt=dayArt;window.dayArtCount=PIC.length;window.dayArtLine=i=>PIC[((i%PIC.length)+PIC.length)%PIC.length];
// fill any <canvas data-dayart> that appears on the page
function fill(){document.querySelectorAll('canvas[data-dayart]').forEach(cv=>{const i=+cv.dataset.dayart;const dk=String(i)+(logoReady?'L':'')+(tplReady?'T':'')+(tplFail?'F':'');if(cv.dataset.done===dk)return;cv.width=W;cv.height=W;cv.getContext('2d').drawImage(dayArt(i),0,0);cv.dataset.done=dk})}
window.dayArtFill=fill;
window.addEventListener('dayart-ready',fill);
new MutationObserver(fill).observe(document.documentElement,{childList:true,subtree:true});
document.addEventListener('DOMContentLoaded',fill);
})();
