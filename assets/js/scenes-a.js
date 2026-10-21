import {THREE,C,clamp,ss,ease,rng,studioEnv} from './core.js';

/* 01 — Revenue pipeline: leads stream through a narrowing funnel; drop-outs peel away, closed deals exit as gold */
export function pipeline({scene,cam,ptr,el}){
  const N=7000,g=new THREE.BufferGeometry(),A=k=>new Float32Array(N*k);
  const seed=A(1),ang=A(1),spd=A(1),drop=A(1),r=Math.random;
  for(let i=0;i<N;i++){seed[i]=r();ang[i]=r()*6.283;spd[i]=.03+r()*.025;drop[i]=r()<.58?.12+r()*.5:2}
  g.setAttribute('position',new THREE.BufferAttribute(A(3),3));
  [['aSeed',seed],['aAng',ang],['aSpd',spd],['aDrop',drop]].forEach(([n,a])=>g.setAttribute(n,new THREE.BufferAttribute(a,1)));
  const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
    uniforms:{uTime:{value:0},uPx:{value:Math.min(devicePixelRatio,2)}},
    vertexShader:`attribute float aSeed,aAng,aSpd,aDrop;uniform float uTime,uPx;varying vec3 vCol;varying float vA;
    void main(){float u=fract(aSeed+uTime*aSpd);float x=mix(-10.,10.,u);
    float r=mix(3.4,.16,smoothstep(0.,.64,u))*(.3+.7*sqrt(fract(aSeed*91.7)));
    float dir=fract(aSeed*13.1)>.5?1.:-1.;float a=aAng+uTime*(.25+u*1.8)*dir;
    vec3 p=vec3(x,cos(a)*r,sin(a)*r);
    float d=aDrop<1.?smoothstep(aDrop,aDrop+.18,u):0.;
    p.yz+=vec2(cos(a),sin(a))*d*3.5;p.y-=d*d*2.5;p.x-=d*1.5;
    vA=(1.-d*.9)*smoothstep(0.,.06,u)*smoothstep(1.,.92,u);
    vec3 c1=vec3(.42,.27,.62),c2=vec3(.2,.62,.66),c3=vec3(1.,.78,.38);
    vCol=u<.45?mix(c1,c2,u/.45):mix(c2,c3,smoothstep(.45,.7,u));
    vCol=mix(vCol,vec3(.38,.28,.5),d);
    vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;
    gl_PointSize=uPx*(1.4+smoothstep(.6,.7,u)*1.6)*(26./-mv.z);}`,
    fragmentShader:`varying vec3 vCol;varying float vA;void main(){float d=length(gl_PointCoord-.5);float a=smoothstep(.5,0.,d)*vA*.6;gl_FragColor=vec4(vCol*a,a);}`});
  const pts=new THREE.Points(g,m);pts.frustumCulled=false;
  const grp=new THREE.Group();grp.add(pts);scene.add(grp);
  [.1,.28,.46,.64].forEach(u=>{const R=3.4+(.16-3.4)*ss(0,.64,u);
    const ring=new THREE.Mesh(new THREE.TorusGeometry(R,.006,6,160),new THREE.MeshBasicMaterial({color:C.gold2,transparent:true,opacity:.45}));
    ring.rotation.y=Math.PI/2;ring.position.x=-10+20*u;grp.add(ring)});
  const off=+el.dataset.offset||0;
  cam.position.set(0,1.4,14);cam.lookAt(0,0,0);
  return{update(t){m.uniforms.uTime.value=t;grp.position.x=off;grp.rotation.y=-.42+ptr.x*.18;grp.rotation.x=.1-ptr.y*.1}};
}

/* 02 — Spreadsheet → terrain: a compute scanline sweeps flat cells; values rise into a 3D bar landscape */
export function terrain({scene,cam,ptr,renderer}){
  scene.environment=studioEnv(renderer);
  const W=26,H=14,n=W*H,geo=new THREE.BoxGeometry(.86,1,.86);geo.translate(0,.5,0);
  const mesh=new THREE.InstancedMesh(geo,new THREE.MeshStandardMaterial({roughness:.5,metalness:.05}),n);mesh.frustumCulled=false;scene.add(mesh);
  const R=rng(7),vals=[];
  for(let i=0;i<W;i++)for(let j=0;j<H;j++){let v=.5+.5*Math.sin(i*.32+j*.18)*Math.cos(j*.45-i*.12);v=.08+.82*v*v*(.7+.3*Math.sin(i*.9));v+=i/W*.35;if(R()<.03)v+=.6;vals.push(Math.min(v,1.35))}
  const grid=new THREE.GridHelper(30,30,C.line,C.line);grid.position.y=-.01;scene.add(grid);
  const scan=new THREE.Mesh(new THREE.BoxGeometry(.08,.04,H+1),new THREE.MeshBasicMaterial({color:C.teal}));scene.add(scan);
  const glow=new THREE.Mesh(new THREE.PlaneGeometry(1.4,H+1),new THREE.MeshBasicMaterial({color:C.teal,transparent:true,opacity:.18,depthWrite:false}));glow.rotation.x=-Math.PI/2;glow.position.y=.02;scene.add(glow);
  scene.add(new THREE.HemisphereLight(0xffffff,0xe6ddcf,.9));const dl=new THREE.DirectionalLight(0xfff4e0,1.8);dl.position.set(-8,16,10);scene.add(dl);
  const d=new THREE.Object3D(),col=new THREE.Color(),cP=new THREE.Color(C.paper),cA=new THREE.Color(C.aub),cT=new THREE.Color(C.teal),cG=new THREE.Color(C.gold2);
  cam.fov=30;cam.updateProjectionMatrix();
  return{update(t){
    const cyc=t%10,s=cyc<6.5?cyc/6.5*1.3:1.3,fall=ease((cyc-8.6)/1.2);
    const sx=s*W-W/2-2;scan.position.set(sx,.02,0);glow.position.x=sx-.4;scan.visible=glow.visible=cyc<6.5;
    let k=0;for(let i=0;i<W;i++)for(let j=0;j<H;j++,k++){
      const p=ease(clamp((s*W-i-j*.15)/2.5)),v=vals[k],h=.05+v*4.2*p*(1-fall);
      d.position.set(i-W/2+.5,0,j-H/2+.5);d.scale.set(1,h,1);d.updateMatrix();mesh.setMatrixAt(k,d.matrix);
      if(v>1.1)col.copy(cP).lerp(cG,p*(1-fall));else{col.lerpColors(cA,cT,clamp(v));col.lerp(cG,ss(.75,1.05,v));col.lerpColors(cP,col,p*(1-fall))}
      mesh.setColorAt(k,col)}
    mesh.instanceMatrix.needsUpdate=true;mesh.instanceColor.needsUpdate=true;
    cam.position.set(15+ptr.x*4,15-ptr.y*3,18);cam.lookAt(0,.8,0)}};
}

/* 03 — Scripts that write themselves: floating editor cards typing real Workflow Labs artifacts */
const DOCS=[
  {t:'cold_call.script',l:['OPEN › Hi {first}, it\'s Mark —','       got 27 seconds?','PAIN › {firm} filed 14 cases','       in Q3. Who\'s defending?','ASK  › Worth 15 min Thursday?']},
  {t:'pacer_parse.py',l:['for case in courtlistener.search(q):','  p = case.parties["plaintiff"]','  d = match(case.attorneys)','  if d.seniority >= "partner":','    yield score(p, d)']},
  {t:'followup.email',l:['Subject Re: Thursday','{first} — circling back on the','matching list for {practice}.','Three names cleared conflicts.','Want the shortlist?']},
  {t:'match_criteria.json',l:['{ "geo": "NJ, NY, PA",','  "practice": "mass tort",','  "seniority": "partner+",','  "filings": ">= 10 / yr",','  "pool": 200418 }']},
  {t:'reconcile.gs',l:['const paid = ledger','  .filter(r => r.status === "PAID")','sheet.getRange("F2")','  .setValue(sum(paid))','return "reconciled ✓"']}];
const TOK=/("[^"]*"?|'[^']*'?|\{[a-z]+\}|›|\b(?:for|in|if|const|return|yield|Subject)\b|\d[\d,]*)/g;
function rr(x,a,b,w,h,r){x.beginPath();x.roundRect(a,b,w,h,r)}
function drawCard(c,n,blink){
  const x=c.ctx,W=640,H=400;x.clearRect(0,0,W,H);rr(x,3,3,W-6,H-6,22);x.fillStyle='rgba(24,13,40,.97)';x.fill();x.lineWidth=3;x.strokeStyle=c.hot?'rgba(232,200,120,.95)':'rgba(200,168,90,.55)';x.stroke();
  ['#b3903f','#5d3a86','#277f89'].forEach((f,i)=>{x.beginPath();x.arc(36+i*22,40,6,0,7);x.fillStyle=f;x.fill()});
  x.font='600 21px "Public Sans", sans-serif';x.fillStyle='#c9bdd9';x.textBaseline='middle';x.fillText(c.t,110,41);
  x.fillStyle='rgba(201,189,217,.15)';x.fillRect(24,70,W-48,1.5);
  x.font='500 22px ui-monospace, "SF Mono", Menlo, monospace';let rem=n,cx=0,cy=0;
  c.l.forEach((ln,k)=>{const y=112+k*54;x.fillStyle='rgba(201,189,217,.35)';x.fillText(String(k+1).padStart(2,' '),26,y);if(rem<=0)return;
    let px=72;const parts=ln.split(TOK);for(const s of parts){if(!s||rem<=0)continue;const q=s.slice(0,rem);rem-=s.length;
      x.fillStyle=/^["']/.test(s)?'#7fd0d6':/^\{/.test(s)?'#d6b56a':/^(›|for|in|if|const|return|yield|Subject)$/.test(s)?'#e0c27a':/^\d/.test(s)?'#c7a6f0':'#f1eaf7';
      x.fillText(q,px,y);px+=x.measureText(q).width}
    cx=px;cy=y;rem-=0});
  if(blink&&cy){x.fillStyle='#c8a85a';x.fillRect(cx+3,cy-13,11,26)}
  c.tex.needsUpdate=true}
export function scripts({scene,cam,ptr}){
  const grp=new THREE.Group();scene.add(grp);
  const cards=DOCS.map((d,i)=>{const cv=document.createElement('canvas');cv.width=640;cv.height=400;
    const tex=new THREE.CanvasTexture(cv);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=8;
    const mesh=new THREE.Mesh(new THREE.PlaneGeometry(3.2,2),new THREE.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false}));
    const o=i-2;mesh.position.set(o*2.3,(i%2?1.05:-.85),-Math.abs(o)*1.6);mesh.rotation.y=-o*.32;mesh.renderOrder=2;grp.add(mesh);
    const glow=new THREE.Mesh(new THREE.PlaneGeometry(4.6,3.4),new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{uI:{value:0}},vertexShader:'varying vec2 vU;void main(){vU=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 vU;uniform float uI;void main(){vec2 d=abs(vU-.5)*2.;float r=length(max(d-vec2(.62,.52),0.))*3.2;float a=exp(-r*r*2.)*uI;gl_FragColor=vec4(vec3(.78,.6,.25)*a,a);}'}));glow.position.z=-.05;glow.renderOrder=1;mesh.add(glow);mesh.userData.glow=glow;
    return{...d,ctx:cv.getContext('2d'),tex,mesh,total:d.l.join('').length,off:[0,2.2,1.1,3.3,.5][i],base:mesh.position.y,last:-1}});
  cam.position.set(0,0,8.4);
  return{update(t){
    cards.forEach((c,i)=>{const P=c.total/26+3.2,lt=(t+c.off)%P,n=Math.floor(lt*26),bl=Math.floor(t*2.2)%2===0,key=n*2+(bl?1:0);
      const typing=n<c.total;if(typing!==c.hot){c.hot=typing;c.last=-1}
      if(key!==c.last){drawCard(c,n,bl);c.last=key}
      const hot=ss(0,.4,lt)*(1-ss(c.total/26,c.total/26+1,lt));c.mesh.userData.glow.material.uniforms.uI.value=.25+.9*hot;c.mesh.scale.setScalar(1+.07*hot);
      c.mesh.position.y=c.base+Math.sin(t*.7+i*1.3)*.1;c.mesh.material.opacity=.35+.65*ss(0,.4,lt)*(1-ss(P-.5,P,lt)*.6)});
    grp.rotation.y=ptr.x*.22;grp.rotation.x=-ptr.y*.1}};
}

/* 04 — Coins to columns: payments drop and stack into a rising revenue chart */
export function coins({scene,cam,ptr,renderer}){
  scene.environment=studioEnv(renderer,0x4a3018);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  const hs=[3,5,4,7,6,9,8,12,14],S=hs.length,list=[];
  for(let l=0;l<14;l++)hs.forEach((h,k)=>{if(l<h)list.push({k,l})});
  const n=list.length,TH=.2,geo=new THREE.CylinderGeometry(.4,.4,TH*.9,56);
  const face=new THREE.MeshStandardMaterial({color:0xe0a93a,metalness:.55,roughness:.28,emissive:0x6a4200,emissiveIntensity:.5}),rim=new THREE.MeshStandardMaterial({color:0x8a5a14,metalness:.7,roughness:.35,emissive:0x3a2000,emissiveIntensity:.4});
  const mesh=new THREE.InstancedMesh(geo,[rim,face,face],n);mesh.castShadow=true;mesh.frustumCulled=false;scene.add(mesh);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(40,40),new THREE.ShadowMaterial({opacity:.45}));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;scene.add(floor);
  const dl=new THREE.DirectionalLight(0xffffff,2.2);dl.position.set(-4,10,6);dl.castShadow=true;dl.shadow.mapSize.set(1024,1024);Object.assign(dl.shadow.camera,{left:-8,right:8,top:8,bottom:-8});dl.shadow.radius=6;scene.add(dl);
  scene.add(new THREE.HemisphereLight(0xffffff,0xe6ddcf,.6));
  const X=k=>(k-(S-1)/2)*1.02;
  const trendG=new THREE.BufferGeometry().setFromPoints(hs.map((_,k)=>new THREE.Vector3(X(k),0,0)));
  const trend=new THREE.Line(trendG,new THREE.LineBasicMaterial({color:0xc9bdd9}));scene.add(trend);
  const dots=new THREE.Points(trendG,new THREE.PointsMaterial({color:0xc9bdd9,size:.14}));scene.add(dots);
  const d=new THREE.Object3D(),G=26,DROP=7,tf=Math.sqrt(2*DROP/G),IV=.075,cyc=n*IV+tf+3;
  cam.position.set(0,2.2,8.6);
  return{update(t){
    const c=t%cyc,out=ease((c-(cyc-1.1))/1);const tops=new Array(S).fill(0);
    list.forEach((o,i)=>{const lt=c-i*IV,land=o.l*TH+TH/2;
      if(lt<0){d.scale.setScalar(0)}else{const fall=Math.max(0,DROP-.5*G*lt*lt);d.position.set(X(o.k),land+fall-out*(o.l*TH+.3),0);
        d.rotation.set(Math.max(0,tf-lt)*7,0,Math.max(0,tf-lt)*2.5);d.scale.setScalar(1-out);if(fall===0)tops[o.k]=Math.max(tops[o.k],(o.l+1)*TH*(1-out))}
      d.updateMatrix();mesh.setMatrixAt(i,d.matrix)});
    mesh.instanceMatrix.needsUpdate=true;
    const p=trendG.attributes.position;tops.forEach((y,k)=>p.setY(k,y+.25+(y>0?0:-.3)));p.needsUpdate=true;
    cam.position.x=ptr.x*2.5;cam.position.y=2.2-ptr.y*1.2;cam.lookAt(0,1.35,0)}};
}
