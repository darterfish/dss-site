import * as THREE from 'three/webgpu';
import {Fn,instancedArray,instanceIndex,uniform,uint,vec3,float,hash,mx_noise_vec3,time,length,normalize,max,mix,color,smoothstep,uv} from 'three/tsl';

const el=document.getElementById('blog-field');
if(el){
const cap=el.querySelector('.blog-field-cap');
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const SHAPES=[
  {w:'Field notes',k:null,t:'Field notes and legacy writing'},
  {w:'Objections',k:'objection-handling',t:'Objection Handling'},
  {w:'Velocity',k:'how-fast-are-you-closing-deals',t:'How Fast Are You Closing Deals?'},
  {w:'Titles',k:'whats-a-title-worth-to-you',t:'What’s A Title Worth To You?'},
  {w:'Pillars',k:'three-pillars-of-lead-generation',t:'Three Pillars of Lead Generation'}];
const N=reduce?24000:60000,M=SHAPES.length,WW=10;
await document.fonts.load('italic 600 120px "Spectral"');
const tgt=new Float32Array(N*M*3);
SHAPES.forEach((s,si)=>{
  const cv=document.createElement('canvas');cv.width=1400;cv.height=420;const x=cv.getContext('2d',{willReadFrequently:true});
  x.font='italic 600 260px "Spectral", Georgia, serif';x.textAlign='center';x.textBaseline='middle';
  const mw=x.measureText(s.w).width;const fs=Math.min(260,260*1300/mw);x.font=`italic 600 ${fs}px "Spectral", Georgia, serif`;x.fillText(s.w,700,215);
  const d=x.getImageData(0,0,1400,420).data,px=[];for(let y=0;y<420;y+=2)for(let X=0;X<1400;X+=2)if(d[(y*1400+X)*4+3]>140)px.push(X,y);
  const n=px.length/2,sc=WW/1400;
  for(let i=0;i<N;i++){const j=Math.floor(Math.random()*n)*2,o=(si*N+i)*3;
    tgt[o]=(px[j]-700+Math.random()*2)*sc;tgt[o+1]=-(px[j+1]-210+Math.random()*2)*sc;tgt[o+2]=(Math.random()-.5)*.5}
  // ~6% of particles drift as ambient dust instead of forming letters
  for(let i=0;i<N;i+=17){const o=(si*N+i)*3;tgt[o]=(Math.random()-.5)*WW*1.3;tgt[o+1]=(Math.random()-.5)*5;tgt[o+2]=(Math.random()-.5)*3}
});
const renderer=new THREE.WebGPURenderer({antialias:true,alpha:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0x000000,0);
el.prepend(renderer.domElement);
await renderer.init();
el.dataset.backend=renderer.backend.isWebGPUBackend?'webgpu':'webgl2';
const scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(32,1,.1,100);cam.position.z=12;
const pos=instancedArray(N,'vec3'),vel=instancedArray(N,'vec3'),targets=instancedArray(tgt,'vec3');
const uShape=uniform(0,'uint'),uPtr=uniform(new THREE.Vector3(99,99,0)),uDt=uniform(1/60),uPull=uniform(9);
const init=Fn(()=>{const p=pos.element(instanceIndex);
  p.assign(vec3(hash(instanceIndex).sub(.5).mul(16),hash(instanceIndex.add(7)).sub(.5).mul(8),hash(instanceIndex.add(13)).sub(.5).mul(4)))})().compute(N);
const update=Fn(()=>{
  const p=pos.element(instanceIndex),v=vel.element(instanceIndex),T=targets.element(instanceIndex.add(uShape.mul(uint(N))));
  const gap=length(T.sub(p));
  const noise=mx_noise_vec3(p.mul(.55).add(vec3(0,0,time.mul(.12)))).mul(gap.min(1.5).mul(1.4).add(.06));
  const d=p.sub(uPtr),dl=length(d.xy).add(.001);
  const push=normalize(vec3(d.xy,d.z.mul(.2).add(.4))).mul(max(float(0),float(1.3).sub(dl)).mul(18));
  const pull=T.sub(p).mul(uPull).mul(hash(instanceIndex.add(3)).mul(.6).add(.7));
  v.assign(v.add(pull.add(noise).add(push).mul(uDt)).mul(.86));
  p.assign(p.add(v.mul(uDt)))})().compute(N);
const mat=new THREE.SpriteNodeMaterial({transparent:true,depthWrite:false});
mat.positionNode=pos.toAttribute();
const r=hash(instanceIndex.add(21));
mat.scaleNode=r.mul(.028).add(.014);
const spd=length(vel.toAttribute());
mat.colorNode=mix(mix(color(0x452668),color(0x5d3a86),r),color(0xc8a85a),smoothstep(.35,2.2,spd).max(smoothstep(.93,1.,r)));
mat.opacityNode=smoothstep(.5,.2,length(uv().sub(.5))).mul(.85);
const sprites=new THREE.Sprite(mat);sprites.count=N;sprites.frustumCulled=false;scene.add(sprites);
await renderer.computeAsync(init);

let acc=0,cur=0,hoverIdx=-1,lastSwitch=0,vis=true,last=performance.now();
const setShape=i=>{if(i===cur)return;cur=i;uShape.value=i;const s=SHAPES[i];
  if(cap){cap.innerHTML=i===0?'<span>Hover a post to reshape the field</span>':`<span>Now forming</span>${s.t} →`;cap.href=i===0?'#archive':`blog/${document.querySelector(`.blog-card a[href*="${s.k}"]`)?.getAttribute('href')?.split('/').pop()||''}`}};
setShape(0);cap&&(cap.innerHTML='<span>Hover a post to reshape the field</span>');
document.querySelectorAll('.blog-card').forEach(card=>{const h=card.querySelector('a')?.getAttribute('href')||'';const i=SHAPES.findIndex(s=>s.k&&h.includes(s.k));if(i<0)return;
  const on=()=>{hoverIdx=i;setShape(i)},off=()=>{hoverIdx=-1;lastSwitch=performance.now()};
  card.addEventListener('pointerenter',on);card.addEventListener('focusin',on);card.addEventListener('pointerleave',off);card.addEventListener('focusout',off)});
const ray=new THREE.Raycaster(),plane=new THREE.Plane(new THREE.Vector3(0,0,1),0),hit=new THREE.Vector3(),ndc=new THREE.Vector2();
el.addEventListener('pointermove',e=>{const b=el.getBoundingClientRect();ndc.set((e.clientX-b.left)/b.width*2-1,-((e.clientY-b.top)/b.height*2-1));ray.setFromCamera(ndc,cam);if(ray.ray.intersectPlane(plane,hit))uPtr.value.copy(hit)});
el.addEventListener('pointerleave',()=>uPtr.value.set(99,99,0));
const resize=()=>{const w=el.clientWidth,h=el.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);cam.aspect=w/h;
  const tn=Math.tan(THREE.MathUtils.degToRad(cam.fov/2));cam.position.z=Math.max((WW*.55)/(tn*cam.aspect),3.4/tn);cam.updateProjectionMatrix()};
new ResizeObserver(resize).observe(el);resize();
new IntersectionObserver(([e])=>vis=e.isIntersecting).observe(el);
el.__fx={step(n=1){uDt.value=1/60;for(let i=0;i<n;i++)renderer.compute(update);renderer.render(scene,cam)},setShape};
renderer.setAnimationLoop(now=>{const dt=Math.min((now-last)/1000,.1);last=now;if(!vis)return;
  if(hoverIdx<0&&!reduce&&now-lastSwitch>4200){lastSwitch=now;setShape((cur+1)%M)}
  sprites.rotation.y=Math.sin(now*.00015)*.12;
  const h=1/60;uDt.value=h*(reduce?.4:1);acc+=dt;let n=0;while(acc>=h&&n<5){renderer.compute(update);acc-=h;n++}if(n===5)acc=0;renderer.render(scene,cam)});
}
