const el=document.getElementById('pp-idea');
if(el){
const sharp=el.querySelector('.pp-sharp'),glow=el.querySelector('.pp-glow'),stage=el.querySelector('.pp-kb');
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const T={ghost:2400,reveal:reduce?1200:4200,hold:5200,fade:1400};
const cyc=T.ghost+T.reveal+T.hold+T.fade;
const e=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
let vis=true,t0=performance.now(),paused=0;
new IntersectionObserver(([x])=>vis=x.isIntersecting).observe(el);
const frame=now=>{requestAnimationFrame(frame);if(!vis){paused=now;return}
  if(paused){t0+=now-paused;paused=0}
  const t=(now-t0)%cyc;let r,g;
  if(t<T.ghost){r=0;g=Math.sin(t/T.ghost*Math.PI)}
  else if(t<T.ghost+T.reveal){const k=(t-T.ghost)/T.reveal;r=e(k)*130;g=Math.max(0,1-k*2)*.6}
  else if(t<T.ghost+T.reveal+T.hold){r=130;g=0}
  else{const k=(t-T.ghost-T.reveal-T.hold)/T.fade;r=130*(1-e(k));g=0}
  sharp.style.setProperty('--r',r.toFixed(2)+'%');glow.style.opacity=g.toFixed(3);
  stage.style.transform=`scale(${(1.02+.03*((now-t0)%(cyc*2))/(cyc*2)).toFixed(4)})`};
requestAnimationFrame(frame);
}
