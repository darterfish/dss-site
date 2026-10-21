import * as THREE from 'three';
export {THREE};
export const C={aub:0x452668,aub2:0x5d3a86,gold:0xb3903f,gold2:0xc8a85a,teal:0x277f89,dark:0x271640,dark2:0x1f1233,cream:0xf5f0e7,paper:0xfffdf9,ink:0x241b2e,line:0xe6ddcf};
export const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
export const ss=(a,b,v)=>{const t=clamp((v-a)/(b-a));return t*t*(3-2*t)};
export const ease=t=>{t=clamp(t);return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2};
export const rng=s=>()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
export function studioEnv(renderer,tone=0xf5f0e7){
  const pm=new THREE.PMREMGenerator(renderer),s=new THREE.Scene();
  s.add(new THREE.Mesh(new THREE.BoxGeometry(20,20,20),new THREE.MeshBasicMaterial({color:tone,side:THREE.BackSide})));
  const panel=(w,h,x,y,z,c)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:c,side:THREE.DoubleSide}));m.position.set(x,y,z);m.lookAt(0,0,0);s.add(m)};
  panel(8,3,0,9,0,0xffffff);panel(4,6,-9,2,3,0xfff1d6);panel(4,6,9,1,-3,0xd9cdf0);panel(10,2,0,-2,9,0x8a7aa0);
  const t=pm.fromScene(s,.04).texture;pm.dispose();return t;
}
export function textTex(lines,{w=256,h=64,font='600 28px "Public Sans"',color='#5f5667',align='center'}={}){
  const cv=document.createElement('canvas');cv.width=w;cv.height=h;const x=cv.getContext('2d');
  x.font=font;x.fillStyle=color;x.textAlign=align;x.textBaseline='middle';
  [].concat(lines).forEach((l,i,a)=>x.fillText(l,align==='center'?w/2:8,h/2+(i-(a.length-1)/2)*h/a.length));
  const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t;
}
const live=new Set(),MAXLIVE=6;
function disposeScene(s){s.traverse(o=>{o.geometry&&o.geometry.dispose();[].concat(o.material||[]).forEach(m=>{for(const k in m){const v=m[k];if(v&&v.isTexture)v.dispose()}m.dispose()})});s.environment&&s.environment.dispose()}
export function mount(el,build,{fov=40}={}){
  const ptr={x:0,y:0,tx:0,ty:0,inside:false,nx:.5,ny:.5};
  el.addEventListener('pointermove',e=>{const b=el.getBoundingClientRect();ptr.nx=(e.clientX-b.left)/b.width;ptr.ny=(e.clientY-b.top)/b.height;ptr.tx=ptr.nx*2-1;ptr.ty=-(ptr.ny*2-1);ptr.inside=true});
  el.addEventListener('pointerleave',()=>{ptr.tx=0;ptr.ty=0;ptr.inside=false});
  const hud=el.querySelector('.hud');
  let R=null,t=0,last=0;
  const resize=()=>{if(!R)return;const w=el.clientWidth,h=el.clientHeight;if(!w||!h)return;R.renderer.setSize(w,h,false);R.cam.aspect=w/h;R.cam.updateProjectionMatrix();R.api.resize&&R.api.resize(w,h)};
  const stop=()=>{if(!R)return;const r=R;R=null;live.delete(stopper);r.renderer.setAnimationLoop(null);disposeScene(r.scene);r.renderer.dispose();r.renderer.forceContextLoss();r.renderer.domElement.remove()};
  const stopper={stop,el};
  const start=()=>{if(R)return;
    if(live.size>=MAXLIVE){let far=null,fd=-1;for(const s of live){const b=s.el.getBoundingClientRect(),d=Math.min(Math.abs(b.bottom),Math.abs(b.top-innerHeight));if(d>fd){fd=d;far=s}}far&&far.stop()}
    const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
    renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;
    el.prepend(renderer.domElement);
    renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();if(R&&R.renderer===renderer){stop();if(onScreen)setTimeout(start,300)}});
    const scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(fov,1,.1,200);cam.position.set(0,0,10);
    const api=build({THREE,scene,cam,renderer,ptr,el,hud});
    R={renderer,scene,cam,api};live.add(stopper);resize();last=performance.now();
    renderer.setAnimationLoop(now=>{const dt=Math.min((now-last)/1000,.05);last=now;t+=dt*(reduce?.25:1);ptr.x+=(ptr.tx-ptr.x)*.06;ptr.y+=(ptr.ty-ptr.y)*.06;api.update(t,dt);renderer.render(scene,cam)})};
  new ResizeObserver(resize).observe(el);
  let onScreen=false;
  new IntersectionObserver(([e])=>{onScreen=e.isIntersecting;onScreen?start():stop()},{rootMargin:'150px'}).observe(el);
}
