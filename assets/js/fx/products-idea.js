const el=document.getElementById('pp-idea');
if(el){
const q=s=>el.querySelector(s),kb=q('.pp-kb'),thinker=q('.pp-thinker'),idea=q('.pp-idea-l'),machine=q('.pp-machine'),glow=q('.pp-glow');
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const S=reduce?1.4:1,K=[1200,2200,1000,3200,4600,1600].map(v=>v*S); // in, bubble, beat, machine, hold, out
const cyc=K.reduce((a,b)=>a+b);
const io=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2,cl=v=>Math.max(0,Math.min(1,v));
let vis=true,t0=performance.now(),pausedAt=0;
new IntersectionObserver(([x])=>vis=x.isIntersecting).observe(el);
const set=(n,o,f,tr)=>{n.style.opacity=o.toFixed(3);n.style.filter=f;if(tr!==undefined)n.style.transform=tr};
const frame=now=>{requestAnimationFrame(frame);
  if(!vis){pausedAt||=now;return}if(pausedAt){t0+=now-pausedAt;pausedAt=0}
  let t=(now-t0)%cyc;const seg=[];let a=0;for(const d of K){seg.push(cl((t-a)/d));a+=d}
  const [sIn0,sB,,sM,sH,sOut]=seg,out=io(sOut),sIn=(now-t0)<cyc?sIn0:1;
  set(thinker,io(sIn),`blur(${((1-io(sIn))*6).toFixed(1)}px)`);
  const b=io(sB)*(1-out);
  set(idea,b,`blur(${((1-io(sB))*10).toFixed(1)}px)`,`scale(${(.35+.65*io(sB)).toFixed(4)})`);
  const m=io(sM),pulse=sM>=1&&sOut===0?Math.sin(sH*Math.PI*3)*.06:0;
  machine.style.setProperty('--r',(m*135).toFixed(2)+'%');
  set(machine,1-out,`blur(${((1-m)*14).toFixed(1)}px) brightness(${(1+(1-m)*m*1.6+pulse).toFixed(3)})`);
  glow.style.opacity=(Math.sin(cl(sB*1.4-.4)*Math.PI)*.7+(sM>0&&sM<1?Math.sin(sM*Math.PI)*.8:0)).toFixed(3);
  kb.style.transform=`scale(${(1.015+.035*((now-t0)%(cyc*2))/(cyc*2)).toFixed(4)})`};
requestAnimationFrame(frame);
}
