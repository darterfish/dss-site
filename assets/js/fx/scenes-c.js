import {THREE,C,clamp,ss,ease,studioEnv} from './core.js';

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
