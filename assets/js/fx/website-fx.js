import * as THREE from 'three/webgpu';
import {Fn,instancedArray,instanceIndex,uniform,uint,vec3,float,hash,mx_noise_vec3,time,length,normalize,max,mix,smoothstep,uv,cos} from 'three/tsl';

const els=[...document.querySelectorAll('.ws-fx')];
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
await document.fonts.load('italic 600 120px "Spectral"').catch(()=>{});
for(const el of els)mountWS(el).catch(e=>console.error('ws-fx',e));

async function mountWS(el){
const big=el.dataset.size!=='tile';
const N=reduce?20000:(big?70000:26000),WW=10,R=Math.random;
const words=(el.dataset.words||'Bright|Vibrant|Insane.').split('|');
const SH=['browser','galaxy',...words,'burst'],M=SH.length;
const tgt=new Float32Array(N*M*3);
const text=(w,si)=>{const cv=document.createElement('canvas');cv.width=1400;cv.height=420;const x=cv.getContext('2d',{willReadFrequently:true});
  x.font='italic 600 260px "Spectral", Georgia, serif';const mw=x.measureText(w).width,fs=Math.min(260,260*1250/mw);
  x.font=`italic 600 ${fs}px "Spectral", Georgia, serif`;x.textAlign='center';x.textBaseline='middle';x.fillText(w,700,215);
  const d=x.getImageData(0,0,1400,420).data,px=[];for(let y=0;y<420;y+=2)for(let X=0;X<1400;X+=2)if(d[(y*1400+X)*4+3]>140)px.push(X,y);
  const n=px.length/2,sc=WW/1400;for(let i=0;i<N;i++){const j=(R()*n|0)*2,o=(si*N+i)*3;tgt[o]=(px[j]-700)*sc;tgt[o+1]=-(px[j+1]-210)*sc;tgt[o+2]=(R()-.5)*.6}};
const W=4.4,H=2.8,rr=.25;
const rect=(x0,y0,x1,y1)=>{const per=2*(x1-x0+y1-y0),t=R()*per;if(t<x1-x0)return[x0+t,y1];if(t<2*(x1-x0))return[x0+t-(x1-x0),y0];const u=t-2*(x1-x0);return u<y1-y0?[x0,y0+u]:[x1,y0+u-(y1-y0)]};
SH.forEach((s,si)=>{
  if(s==='browser'){for(let i=0;i<N;i++){const o=(si*N+i)*3,k=i%20;let p;
    if(k<6)p=rect(-W,-H,W,H);else if(k<8)p=[-W+R()*2*W,H-.55];else if(k<9){const c=i%3,a=R()*6.283,r=Math.sqrt(R())*.13;p=[-W+.4+c*.38+Math.cos(a)*r,H-.28+Math.sin(a)*r]}
    else if(k<13)p=[-W+.5+R()*4.6,.25+R()*1.6];else if(k<14)p=[.6+R()*3.2,(R()<.5?1.6:1.15)+(R()-.5)*.12];else{const c=i%3,x0=-W+.5+c*2.85;p=k<17?rect(x0,-H+.4,x0+2.5,-.1):[x0+.25+R()*2,-.6+(i%4)*-.35+(R()-.5)*.05]}
    tgt[o]=p[0];tgt[o+1]=p[1];tgt[o+2]=(R()-.5)*.15}}
  else if(s==='galaxy'){for(let i=0;i<N;i++){const o=(si*N+i)*3,arm=i%4,r=Math.pow(R(),.6)*4.6,a=arm/4*6.283+r*1.25+(R()-.5)*.5/(r+.3);
    tgt[o]=Math.cos(a)*r*1.15;tgt[o+1]=Math.sin(a)*r*.62;tgt[o+2]=(R()-.5)*.6*(1-r/5)}}
  else if(s==='burst'){for(let i=0;i<N;i++){const o=(si*N+i)*3;let x,y,z;do{x=R()*2-1;y=R()*2-1;z=R()*2-1}while(x*x+y*y+z*z>1);const l=Math.hypot(x,y,z)||1,r=2.2+R()*.25;tgt[o]=x/l*r*1.6;tgt[o+1]=y/l*r;tgt[o+2]=z/l*r}}
  else text(s,si);
  for(let i=0;i<N;i+=19){const o=(si*N+i)*3;tgt[o]=(R()-.5)*WW*1.5;tgt[o+1]=(R()-.5)*7;tgt[o+2]=(R()-.5)*4}
});
const renderer=new THREE.WebGPURenderer({antialias:true,alpha:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,big?2:1.5));renderer.setClearColor(0x000000,0);
el.prepend(renderer.domElement);await renderer.init();
el.dataset.backend=renderer.backend.isWebGPUBackend?'webgpu':'webgl2';
const scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(32,1,.1,100);cam.position.z=14;
const pos=instancedArray(N,'vec3'),vel=instancedArray(N,'vec3'),targets=instancedArray(tgt,'vec3');
const uShape=uniform(0,'uint'),uPtr=uniform(new THREE.Vector3(99,99,0)),uDt=uniform(1/60),uKick=uniform(0);
const init=Fn(()=>{pos.element(instanceIndex).assign(vec3(hash(instanceIndex).sub(.5).mul(20),hash(instanceIndex.add(7)).sub(.5).mul(10),hash(instanceIndex.add(13)).sub(.5).mul(6)))})().compute(N);
const update=Fn(()=>{
  const p=pos.element(instanceIndex),v=vel.element(instanceIndex),T=targets.element(instanceIndex.add(uShape.mul(uint(N))));
  const gap=length(T.sub(p));
  const noise=mx_noise_vec3(p.mul(.5).add(vec3(0,0,time.mul(.3)))).mul(gap.min(2).mul(1.3).add(.06));
  const swirl=vec3(p.y.negate(),p.x,0).mul(gap.min(2).mul(.6));
  const d=p.sub(uPtr),dl=length(d.xy).add(.001);
  const push=normalize(vec3(d.xy,d.z.mul(.2).add(.5))).mul(max(float(0),float(1.5).sub(dl)).mul(26));
  const kick=normalize(p.add(vec3(.001))).mul(uKick).mul(hash(instanceIndex.add(11)).add(.5));
  const pull=T.sub(p).mul(hash(instanceIndex.add(3)).mul(6).add(10));
  v.assign(v.add(pull.add(noise).add(swirl).add(push).add(kick).mul(uDt)).mul(.87));
  p.assign(p.add(v.mul(uDt)))})().compute(N);
const mat=new THREE.SpriteNodeMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});
mat.positionNode=pos.toAttribute();
const r=hash(instanceIndex.add(21)),spd=length(vel.toAttribute());
mat.scaleNode=r.mul(.03).add(big?.016:.022);
const P=mx_noise_vec3(pos.toAttribute().mul(.18)).x.mul(.35).add(r.mul(.25)).add(time.mul(.06));
const pal=vec3(.5).add(vec3(.5).mul(cos(vec3(P).add(vec3(0,.33,.67)).mul(6.283))));
mat.colorNode=mix(pal.mul(1.15),vec3(1,.97,.9),smoothstep(3,7,spd).mul(.7));
mat.opacityNode=smoothstep(.5,.15,length(uv().sub(.5))).mul(.75);
const sprites=new THREE.Sprite(mat);sprites.count=N;sprites.frustumCulled=false;scene.add(sprites);
await renderer.computeAsync(init);
let last0=performance.now(),cur=0,last=performance.now(),sim=0,lastSwitch=0,vis=true,kick=0;
const DUR=reduce?5200:3400;
const setShape=i=>{cur=i;uShape.value=i;kick=SH[i]==='burst'||SH[i]==='galaxy'?22:9};
const ray=new THREE.Raycaster(),plane=new THREE.Plane(new THREE.Vector3(0,0,1),0),hit=new THREE.Vector3(),ndc=new THREE.Vector2();
const host=el.closest('[data-ws-host]')||el;
host.addEventListener('pointermove',e=>{const b=el.getBoundingClientRect();ndc.set((e.clientX-b.left)/b.width*2-1,-((e.clientY-b.top)/b.height*2-1));ray.setFromCamera(ndc,cam);if(ray.ray.intersectPlane(plane,hit))uPtr.value.copy(hit)});
host.addEventListener('pointerleave',()=>uPtr.value.set(99,99,0));
host.addEventListener('pointerdown',()=>{kick=30});
const resize=()=>{const w=el.clientWidth,h=el.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);cam.aspect=w/h;
  const tn=Math.tan(THREE.MathUtils.degToRad(cam.fov/2));cam.position.z=Math.max((WW*.56)/(tn*cam.aspect),3.3/tn);cam.updateProjectionMatrix()};
new ResizeObserver(resize).observe(el);resize();
el.__ws={hold:false,set(i){setShape(i);this.hold=true},step(n=1){uDt.value=1/60;for(let i=0;i<n;i++)renderer.compute(update);renderer.render(scene,cam)}};
new IntersectionObserver(([e])=>vis=e.isIntersecting,{rootMargin:'100px'}).observe(el);
let acc=0;
renderer.setAnimationLoop(now=>{const dt=Math.min((now-last)/1000,.1);last=now;if(!vis)return;
  sim+=dt*1000;if(!el.__ws.hold&&sim-lastSwitch>DUR*(SH[cur]==='galaxy'||SH[cur]==='burst'?.6:1)){lastSwitch=sim;setShape((cur+1)%M)}
  kick*=Math.exp(-dt*6);uKick.value=reduce?0:kick;
  sprites.rotation.y=Math.sin(now*.0003)*.22;sprites.rotation.x=Math.sin(now*.00021)*.08;
  const h=1/60;uDt.value=h*(reduce?.5:1);acc+=dt;let n=0;while(acc>=h&&n<5){renderer.compute(update);acc-=h;n++}if(n===5)acc=0;
  renderer.render(scene,cam)});
}
