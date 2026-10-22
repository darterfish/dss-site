import * as THREE from 'three/webgpu';
import {Fn,instanceIndex,uniform,vec3,float,mx_noise_float,time,positionLocal,varying,mix,color,exp,smoothstep,max} from 'three/tsl';

const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
for(const el of document.querySelectorAll('.bk-fx'))mount(el).catch(e=>console.error('bk-fx',e));

async function mount(el){
const host=el.closest('section')||el;
const COLS=reduce?40:72,ROWS=reduce?24:40,SP=.34,N=COLS*ROWS;
const renderer=new THREE.WebGPURenderer({antialias:true,alpha:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0x000000,0);
await renderer.init();el.appendChild(renderer.domElement);
const scene=new THREE.Scene();scene.fog=new THREE.Fog(0x1f1233,9,22);
const cam=new THREE.PerspectiveCamera(38,1,.1,60);cam.position.set(0,5.2,10.5);cam.lookAt(0,.4,-2);
scene.add(new THREE.HemisphereLight(0xe6d8ff,0x2a1745,2.2));
const key=new THREE.DirectionalLight(0xffe2a8,3.6);key.position.set(-4,8,3);scene.add(key);
const rim=new THREE.DirectionalLight(0x8a5cd0,1.6);rim.position.set(5,3,-6);scene.add(rim);

const uLens=uniform(new THREE.Vector3(-1.5,0,2)),uPow=uniform(1),uT=reduce?float(0):time;
const ix=float(instanceIndex.mod(COLS)),iz=float(instanceIndex.div(COLS));
const gx=ix.sub(COLS/2-.5).mul(SP),gz=iz.sub(ROWS/2-.5).mul(SP);
const d2=gx.sub(uLens.x).pow(2).add(gz.sub(uLens.z).pow(2));
const n=mx_noise_float(vec3(gx.mul(.32),gz.mul(.32),uT.mul(.12))).mul(.5).add(.5);
const wave=mx_noise_float(vec3(gx.mul(.9),gz.mul(.9),uT.mul(.35))).mul(.18);
const bump=exp(d2.mul(-.55)).mul(2.6).mul(uPow);
const h=max(float(.05),n.mul(n).mul(1.6).add(wave).add(bump));
const hv=varying(h);
const mat=new THREE.MeshStandardNodeMaterial({roughness:.38,metalness:.55});
mat.positionNode=Fn(()=>{const p=positionLocal.toVar();return vec3(p.x.mul(SP*.78).add(gx),p.y.add(.5).mul(h),p.z.mul(SP*.78).add(gz))})();
const t=smoothstep(.2,2.4,hv);
mat.colorNode=mix(mix(color(0x4a2a78),color(0x9a6fd6),smoothstep(0,.6,t)),color(0xe8c56a),smoothstep(.55,1,t));
mat.emissiveNode=color(0xc8a85a).mul(smoothstep(1.4,3,hv).mul(.85));
const bars=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),mat,N);bars.frustumCulled=false;scene.add(bars);

const lens=new THREE.Group();
const ringM=new THREE.MeshBasicNodeMaterial({color:0xf0d083});
const ring=new THREE.Mesh(new THREE.TorusGeometry(.95,.05,16,96),ringM);ring.rotation.x=-Math.PI/2;lens.add(ring);
const ring2=new THREE.Mesh(new THREE.TorusGeometry(1.25,.012,8,128),new THREE.MeshBasicNodeMaterial({color:0xc8a85a,transparent:true,opacity:.6}));ring2.rotation.x=-Math.PI/2;lens.add(ring2);
const handle=new THREE.Mesh(new THREE.CylinderGeometry(.07,.09,.8,16),new THREE.MeshStandardNodeMaterial({color:0xc8a85a,metalness:.8,roughness:.3}));
handle.rotation.z=Math.PI/2;handle.rotation.y=-Math.PI/4;handle.position.set(1.05,0,1.05);lens.add(handle);
const glass=new THREE.Mesh(new THREE.CircleGeometry(.92,64),new THREE.MeshBasicNodeMaterial({color:0xfff1c9,transparent:true,opacity:.08,depthWrite:false}));glass.rotation.x=-Math.PI/2;lens.add(glass);
scene.add(lens);
const VN=reduce?40:160,vis_=[];const vGeo=new THREE.CapsuleGeometry(.05,.1,4,8),hGeo=new THREE.SphereGeometry(.055,12,8);
const vMat=new THREE.MeshStandardNodeMaterial({color:0xfff1c9,emissive:0xc8a85a,emissiveIntensity:.6,roughness:.4});
const vBody=new THREE.InstancedMesh(vGeo,vMat,VN),vHead=new THREE.InstancedMesh(hGeo,vMat,VN);scene.add(vBody,vHead);
const trailM=new THREE.MeshBasicNodeMaterial({color:0xe8c56a,transparent:true,opacity:.35,depthWrite:false});
const spawn=v=>{const a=Math.random()*Math.PI*2,r=7+Math.random()*4;v.x=Math.cos(a)*r;v.z=Math.sin(a)*r*.6-1;v.y=0;v.sp=.6+Math.random()*.9;v.ph=Math.random()*6.28;v.s=1};
for(let i=0;i<VN;i++){const v={};spawn(v);v.x*=Math.random();v.z*=Math.random();vis_.push(v)}
const mtx=new THREE.Matrix4(),q=new THREE.Quaternion(),sc=new THREE.Vector3(),pos=new THREE.Vector3();
let rush=0;addEventListener('bk-rank',()=>{rush=1;pulse=1});
const stepVisitors=(dt,T)=>{rush=Math.max(0,rush-dt*.5);for(let i=0;i<VN;i++){const v=vis_[i],dx=uLens.value.x-v.x,dz=uLens.value.z-v.z,d=Math.hypot(dx,dz);
 const sp=v.sp*(1+rush*2.2)*dt;v.x+=dx/d*sp;v.z+=dz/d*sp;v.y=1.5+Math.max(0,1-d/9)*1.1+Math.abs(Math.sin(T*6*v.sp+v.ph))*.06;
 if(d<.6){v.s-=dt*3;if(v.s<=0)spawn(v)}const s=Math.max(0,v.s);
 sc.set(s,s,s);pos.set(v.x,v.y,v.z);mtx.compose(pos,q,sc);vBody.setMatrixAt(i,mtx);pos.y+=.16*s;mtx.compose(pos,q,sc);vHead.setMatrixAt(i,mtx)}
 vBody.instanceMatrix.needsUpdate=vHead.instanceMatrix.needsUpdate=true};

const target=new THREE.Vector3(-1.5,0,2),ray=new THREE.Raycaster(),plane=new THREE.Plane(new THREE.Vector3(0,1,0),0),m=new THREE.Vector2(),hit=new THREE.Vector3();
let active=false,idle=0,pulse=0;
host.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect();m.set((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height)*2+1);ray.setFromCamera(m,cam);if(ray.ray.intersectPlane(plane,hit)){target.set(THREE.MathUtils.clamp(hit.x,el.clientWidth>900?-.8:-COLS*SP/2,COLS*SP/2),0,THREE.MathUtils.clamp(hit.z,-ROWS*SP/2,ROWS*SP/2));active=true;idle=0}});
host.addEventListener('pointerleave',()=>active=false);
host.addEventListener('pointerdown',()=>pulse=1);

const size=()=>{const w=el.clientWidth,h=el.clientHeight;renderer.setSize(w,h,false);renderer.domElement.style.cssText='width:100%;height:100%;display:block';cam.aspect=w/h;cam.fov=w<700?52:38;cam.updateProjectionMatrix()};
size();new ResizeObserver(size).observe(el);
let vis=true;new IntersectionObserver(([en])=>vis=en.isIntersecting).observe(el);
const clock=new THREE.Timer?new THREE.Timer():new THREE.Clock();
renderer.setAnimationLoop(()=>{if(!vis)return;if(clock.update)clock.update();const dt=Math.min(clock.getDelta(),.05),T=clock.getElapsed?clock.getElapsed():clock.elapsedTime;
  if(!active){idle+=dt;if(idle>1.2&&!reduce)target.set(1.4+Math.sin(T*.23)*2.6,0,Math.cos(T*.31)*1.2+1.8)}
  uLens.value.lerp(target,1-Math.pow(.004,dt));
  pulse=Math.max(0,pulse-dt*1.6);uPow.value=1+pulse*1.2;
  lens.position.set(uLens.value.x,2.6+Math.sin(T*1.4)*.12,uLens.value.z);
  lens.rotation.y=reduce?0:T*.25;ring.scale.setScalar(1+pulse*.25);
  scene.rotation.y=reduce?0:Math.sin(T*.07)*.08;
  stepVisitors(dt,T);renderer.render(scene,cam)});
}
