import {THREE,C,clamp,ss,ease,studioEnv,textTex} from './core.js';

/* 09 — Cold-call spectrogram: a live voice terrain; rep (gold) and prospect (teal) trade turns; HUD tracks talk:listen */
export function voice({scene,cam,ptr,hud}){
  const R=64,B=180,W=6.4,lines=[],hist=[];
  const cRep=new THREE.Color(C.gold2),cPro=new THREE.Color(0x4fb3bc),cSil=new THREE.Color(0x6a5488),bg=new THREE.Color(C.dark2);
  for(let r=0;r<R;r++){const p=new Float32Array(B*3);for(let b=0;b<B;b++){p[b*3]=(b/(B-1)*2-1)*W;p[b*3+2]=-r*.17}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(p,3));
    const l=new THREE.Line(g,new THREE.LineBasicMaterial({color:C.gold2,transparent:true}));scene.add(l);lines.push(l);hist.push({a:new Float32Array(B),s:0})}
  const gauss=(x,m,s)=>Math.exp(-((x-m)*(x-m))/(2*s*s));
  let acc=0,seg=0,segEnd=0,spk=1,talk=0,listen=0,tt=0;
  cam.position.set(0,3.4,7.2);
  return{update(t,dt){
    acc+=dt;tt+=dt;
    while(acc>1/40){acc-=1/40;
      if(tt>segEnd){seg++;spk=spk===1?2:1;if(seg%2===0)spk=0;segEnd=tt+(spk===0?.35+Math.random()*.4:spk===1?1.4+Math.random()*1.6:1.8+Math.random()*2.2)}
      const row=hist.pop();row.s=spk;
      const syl=Math.max(0,Math.sin(tt*9.1)*.6+Math.sin(tt*4.3+1)*.5+.25),env=spk?Math.pow(clamp(syl),1.4):0;
      const f1=spk===1?.16:.22,f2=spk===1?.44:.5;
      for(let b=0;b<B;b++){const f=Math.abs(b/(B-1)*2-1);
        const v=env*(gauss(f,f1+.04*Math.sin(tt*3.1),.05)*1.1+gauss(f,f2+.07*Math.sin(tt*2.2),.06)*.7+gauss(f,.74,.07)*.35)+Math.random()*.03*(spk?1:.3);
        row.a[b]=v*(1-ss(.85,1,f))}
      hist.unshift(row);if(spk===1)talk+=1/40;else if(spk===2)listen+=1/40}
    for(let r=0;r<R;r++){const h=hist[r],p=lines[r].geometry.attributes.position;for(let b=0;b<B;b++)p.array[b*3+1]=h.a[b]*2;p.needsUpdate=true;
      const m=lines[r].material,k=r/R;m.color.copy(h.s===1?cRep:h.s===2?cPro:cSil).lerp(bg,k*.75);m.opacity=(1-k)*(r===0?1:.85)}
    if(hud){const tot=talk+listen||1;hud.innerHTML=`<span class="k">talk</span><b>${Math.round(talk/tot*100)}%</b><span class="k">listen</span><b class="t">${Math.round(listen/tot*100)}%</b><span class="now ${spk===1?'rep':spk===2?'pro':''}">${spk===1?'Rep speaking':spk===2?'Prospect speaking':'·  ·  ·'}</span>`}
    cam.position.x=ptr.x*2;cam.position.y=3.4-ptr.y*1;cam.lookAt(0,.2,-4.5)}};
}

/* 10 — Exit trajectories: the operating résumé drawn as growth ribbons racing to their milestones */
function labelTex(a,b,color){const cv=document.createElement('canvas');cv.width=640;cv.height=160;const x=cv.getContext('2d');
  x.font='600 46px "Spectral", Georgia, serif';x.fillStyle='#241b2e';x.textBaseline='middle';x.fillText(a,8,52);
  x.font='600 26px "Public Sans", sans-serif';x.fillStyle=color;x.fillText(b.toUpperCase(),10,112);
  const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t}
export function growth({scene,cam,ptr,renderer}){
  scene.environment=studioEnv(renderer);
  scene.add(new THREE.HemisphereLight(0xffffff,0xe6ddcf,.6));const dl=new THREE.DirectionalLight(0xfff4e0,1.4);dl.position.set(-4,8,6);scene.add(dl);
  const CO=[
    {n:'JoVE',s:'early sales team',c:C.teal,h:'#277f89',z:-1.8,p:[[-4,.05],[-2.6,.35],[-1.2,.7],[.3,1.15],[1.8,1.55],[3.2,1.95]]},
    {n:'Duo Security',s:'$2.35B · Cisco',c:C.gold,h:'#8a6b26',z:-.6,p:[[-4,.05],[-2.9,.2],[-1.6,.55],[-.2,1.2],[1.4,2.2],[3.2,3.4]]},
    {n:'FatStax',s:'acquired · BigTinCan',c:C.aub,h:'#452668',z:.6,p:[[-4,.05],[-2.7,.3],[-1.3,.6],[.2,1.05],[1.6,1.7],[3.2,2.5]]},
    {n:'TRUiC',s:'RevOps at scale',c:C.aub2,h:'#5d3a86',z:1.8,p:[[-4,.05],[-2.5,.25],[-1,.5],[.4,.95],[1.9,1.35],[3.2,1.8]]}];
  const grid=new THREE.GridHelper(10,20,C.line,C.line);scene.add(grid);
  const TS=180,RS=12,items=CO.map(o=>{const curve=new THREE.CatmullRomCurve3(o.p.map(([x,y])=>new THREE.Vector3(x,y,o.z)));
    const mat=new THREE.MeshStandardMaterial({color:o.c,metalness:.25,roughness:.35});
    const tube=new THREE.Mesh(new THREE.TubeGeometry(curve,TS,.055,RS,false),mat);scene.add(tube);
    const bead=new THREE.Mesh(new THREE.SphereGeometry(.13,32,16),mat);scene.add(bead);
    const stem=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3()]),new THREE.LineDashedMaterial({color:o.c,dashSize:.08,gapSize:.06,transparent:true,opacity:.6}));scene.add(stem);
    const lab=new THREE.Sprite(new THREE.SpriteMaterial({map:labelTex(o.n,o.s,o.h),transparent:true,depthWrite:false}));lab.scale.set(2.4,.6,1);lab.center.set(0,.5);scene.add(lab);
    const shadow=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(o.p.map(([x])=>new THREE.Vector3(x,.002,o.z))),TS,.04,4,false),new THREE.MeshBasicMaterial({color:o.c,transparent:true,opacity:.12}));scene.add(shadow);
    return{curve,tube,bead,stem,lab,shadow}});
  cam.position.set(5,3.4,8);
  return{update(t){
    const c=t%11;
    items.forEach((o,i)=>{const p=ease((c-.4-i*.45)/4.2)*(1-ease((c-10)/.8)),n=Math.max(0,Math.floor(p*TS));
      o.tube.geometry.setDrawRange(0,n*RS*6);o.shadow.geometry.setDrawRange(0,n*4*6);
      const e=o.curve.getPointAt(Math.max(p,.001));o.bead.position.copy(e);o.bead.visible=p>.01;
      const sp=o.stem.geometry.attributes.position;sp.setXYZ(0,e.x,e.y,e.z);sp.setXYZ(1,e.x,0,e.z);sp.needsUpdate=true;o.stem.computeLineDistances();o.stem.visible=p>.01;
      o.lab.position.set(e.x+.22,e.y+.12,e.z);o.lab.material.opacity=ss(.93,1,p)});
    cam.position.set(5+ptr.x*2.5,3.4-ptr.y*1.4,8);cam.lookAt(.2,1.3,0)}};
}

/* 11 — Sandbag toss: projectile physics over the photo — impulse, gravity, live velocity vector and equations */
function arrow(color,r=.035){const g=new THREE.Group(),mat=new THREE.MeshBasicMaterial({color,transparent:true,depthTest:false});
  const sh=new THREE.Mesh(new THREE.CylinderGeometry(r,r,1,12),mat);sh.geometry.translate(0,.5,0);const hd=new THREE.Mesh(new THREE.ConeGeometry(r*3.2,r*8,16),mat);
  g.add(sh,hd);g.renderOrder=5;const up=new THREE.Vector3(0,1,0);
  g.set=(o,d,len)=>{g.position.copy(o);g.quaternion.setFromUnitVectors(up,d.clone().normalize());const L=Math.max(len-r*8,.001);sh.scale.y=L;hd.position.y=L+r*4};
  g.op=a=>{mat.opacity=a;g.visible=a>.01};return g}
function label(txt,color,s=.42){const t=textTex(txt,{w:512,h:96,font:'italic 600 54px "Spectral", Georgia, serif',color,align:'left'});const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthTest:false}));sp.scale.set(s*512/96,s,1);sp.center.set(0,.5);sp.renderOrder=6;return sp}
export function sandbag({scene,cam,el,hud}){
  const m=13.6,g=9.81,v0=6.2,th=70*Math.PI/180,h0=1.9,VX=v0*Math.cos(th),VY=v0*Math.sin(th),T=(VY+Math.sqrt(VY*VY+2*g*h0))/g,hmax=h0+VY*VY/(2*g);
  const rx=+el.dataset.rx||.585,ry=+el.dataset.ry||.235,fx=+el.dataset.fx2||.6,fy=+el.dataset.fy2||.9,K=.12;
  let hw=1,hh=1,S=1,P0=new THREE.Vector3();
  const toW=(nx,ny)=>new THREE.Vector3((nx*2-1)*hw,(1-ny*2)*hh,0),pos=t=>new THREE.Vector3(P0.x+VX*t*S,P0.y+(VY*t-.5*g*t*t)*S,0);
  const NP=90,pathG=new THREE.BufferGeometry().setFromPoints([...Array(NP)].map(()=>new THREE.Vector3()));
  const path=new THREE.Line(pathG,new THREE.LineDashedMaterial({color:0xf3e2b0,dashSize:.1,gapSize:.08,transparent:true,depthTest:false}));scene.add(path);
  const trailG=new THREE.BufferGeometry().setFromPoints([...Array(NP)].map(()=>new THREE.Vector3()));
  const trail=new THREE.Line(trailG,new THREE.LineBasicMaterial({color:C.gold2,transparent:true,depthTest:false}));scene.add(trail);
  const bag=new THREE.Group();const ring=new THREE.Mesh(new THREE.RingGeometry(.2,.24,48),new THREE.MeshBasicMaterial({color:C.gold2,transparent:true,depthTest:false}));
  const dot=new THREE.Mesh(new THREE.CircleGeometry(.06,24),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,depthTest:false}));
  const cross=new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-.34,0,0),new THREE.Vector3(.34,0,0),new THREE.Vector3(0,-.34,0),new THREE.Vector3(0,.34,0)]),new THREE.LineBasicMaterial({color:C.gold2,transparent:true,opacity:.7,depthTest:false}));
  bag.add(ring,dot,cross);[ring,dot,cross].forEach(o=>o.renderOrder=6);scene.add(bag);
  const aV=arrow(0x7fd0d6),aX=arrow(0x7fd0d6,.018),aY=arrow(0x7fd0d6,.018),aG=arrow(0xc7a6f0),aF=arrow(C.gold2,.05),aR=arrow(0xf3e2b0,.045);[aV,aX,aY,aG,aF,aR].forEach(a=>scene.add(a));
  const lV=label('v','#9fe0e5'),lG=label('mg = 133 N','#d9c4f5'),lF=label('F̄ = 241 N','#e8cf8a'),lR=label('F_GRF','#f3e2b0'),lH=label('h_max = '+hmax.toFixed(2)+' m','#f3e2b0',.36);[lV,lG,lF,lR,lH].forEach(l=>scene.add(l));
  const tick=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-.35,0,0),new THREE.Vector3(.35,0,0)]),new THREE.LineBasicMaterial({color:0xf3e2b0,transparent:true,depthTest:false}));scene.add(tick);
  const W=1.1,SLO=1.7,H=1.3,CY=W+T*SLO+H;
  return{resize(w,h){hh=10*Math.tan(THREE.MathUtils.degToRad(cam.fov/2));hw=hh*w/h;S=K*2*hh;P0=toW(rx,ry);
      for(let i=0;i<NP;i++){const p=pos(i/(NP-1)*T);pathG.attributes.position.setXYZ(i,p.x,p.y,0)}pathG.attributes.position.needsUpdate=true;path.computeLineDistances()},
    update(t){
      const c=t%CY,wu=clamp(c/W),ft=clamp((c-W)/SLO,0,T),fly=c>W,fade=1-ss(CY-.5,CY,c);
      const p=fly?pos(ft):P0.clone().add(new THREE.Vector3(-.12,-.1,0).multiplyScalar(1-ease(wu)));bag.position.copy(p);
      const vyt=VY-g*ft,sp=Math.hypot(VX,vyt);ring.scale.setScalar(1+.06*Math.sin(t*8));ring.material.opacity=dot.material.opacity=fade;cross.material.opacity=.7*fade;
      path.material.opacity=.5*fade*ss(0,.3,c);
      const n=Math.max(1,Math.floor(clamp(ft/T)*(NP-1))+1),ta=trailG.attributes.position;for(let i=0;i<n;i++){const q=pos(i/(NP-1)*T);ta.setXYZ(i,q.x,q.y,0)}ta.setXYZ(n-1,p.x,p.y,0);ta.needsUpdate=true;trailG.setDrawRange(0,fly?n:0);trail.material.opacity=fade;
      const tp=VY/g,pk=pos(tp);tick.position.copy(pk);tick.material.opacity=ss(tp-.05,tp,ft)*fade;lH.position.set(pk.x+.45,pk.y-.02,0);lH.material.opacity=tick.material.opacity;
      const dir=new THREE.Vector3(VX,VY,0).normalize(),fe=ease(ss(.2,1,wu))*(1-ss(0,.25,ft));
      aF.set(p,dir,2.2*fe+.01);aF.op(fe*fade);lF.position.copy(p).addScaledVector(dir,2.2*fe+.15).add(new THREE.Vector3(.1,0,0));lF.material.opacity=fe*fade;
      const feet=toW(fx,fy),gr=Math.sin(Math.PI*clamp(wu*1.05));aR.set(feet,new THREE.Vector3(0,1,0),1.6*gr+.01);aR.op(gr*fade);lR.position.set(feet.x+.18,feet.y+1.3*gr,0);lR.material.opacity=gr*fade;
      const on=fly?ss(0,.15,ft)*fade:0,vS=.28;
      aV.set(p,new THREE.Vector3(VX,vyt,0),sp*vS);aV.op(on);lV.position.copy(p).add(new THREE.Vector3(VX,vyt,0).multiplyScalar(vS)).add(new THREE.Vector3(.12,.1,0));lV.material.opacity=on;
      aX.set(p,new THREE.Vector3(1,0,0),VX*vS);aX.op(on*.55);aY.set(p,new THREE.Vector3(0,Math.sign(vyt)||1,0),Math.abs(vyt)*vS+.01);aY.op(on*.55*ss(.05,.6,Math.abs(vyt)));
      aG.set(p,new THREE.Vector3(0,-1,0),1.1);aG.op(on);lG.position.set(p.x-1.9,p.y-1.0,0);lG.material.opacity=on;
      if(hud){const y=h0+VY*ft-.5*g*ft*ft,vv=fly?sp:v0*ease(wu);
        hud.innerHTML='<div class="eq"><i>ΣF = m·a</i><span>m = 13.6 kg (30 lb) · g = 9.81 m/s²</span></div>'
        +'<div class="eq"><i>F̄ = m·v₀ / Δt</i><span>13.6 × 6.2 / 0.35 s = <b>241 N</b></span></div>'
        +'<div class="eq"><i>y(t) = h₀ + v₀ sinθ·t − ½gt²</i><span>θ = 70° · h₀ = 1.9 m</span></div>'
        +'<div class="live"><span>t<b>'+ft.toFixed(2)+'</b>s</span><span>y<b>'+(fly?y:h0).toFixed(2)+'</b>m</span><span>|v|<b>'+vv.toFixed(1)+'</b>m/s</span><span>KE<b>'+Math.round(.5*m*vv*vv)+'</b>J</span></div>'}
    }};
}
