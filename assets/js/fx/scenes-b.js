import {THREE,C,clamp,ss,ease,rng,studioEnv,textTex} from './core.js';

/* 05 — Attorney intelligence: 200k-node sphere; each query arcs to its matched counsel */
const QUERIES=[['mass tort','NJ','partner+'],['securities','NY','10+ yrs'],['employment','PA','partner+'],['IP litigation','CA','of counsel'],['product liability','TX','partner+'],['insurance defense','FL','senior assoc.']];
export function network({scene,cam,ptr,hud}){
  const N=2400,R=3,pos=new Float32Array(N*3),col=new Float32Array(N*3),hi=new Float32Array(N),grpId=new Uint8Array(N),V=[];
  const pal=[new THREE.Color(0x8a6bb8),new THREE.Color(0x3d9aa4),new THREE.Color(0x6a4a94),new THREE.Color(0xa58fc4)];
  for(let i=0;i<N;i++){const y=1-(i+.5)/N*2,r=Math.sqrt(1-y*y),a=i*2.39996;const v=new THREE.Vector3(Math.cos(a)*r,y,Math.sin(a)*r).multiplyScalar(R*(.97+Math.random()*.06));
    V.push(v);v.toArray(pos,i*3);const gI=(Math.floor((a%6.283)/1.5708)+(y>0?1:0))%4;grpId[i]=gI;pal[gI].toArray(col,i*3)}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('aCol',new THREE.BufferAttribute(col,3));const hiA=new THREE.BufferAttribute(hi,1);g.setAttribute('aHi',hiA);
  const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{uPx:{value:Math.min(devicePixelRatio,2)}},
    vertexShader:`attribute vec3 aCol;attribute float aHi;uniform float uPx;varying vec3 vC;varying float vA;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);vec3 n=normalize(normalMatrix*position);vA=.35+.65*smoothstep(-.4,.6,n.z);vC=mix(aCol,vec3(1.,.82,.45),aHi);gl_Position=projectionMatrix*mv;gl_PointSize=uPx*(2.2+aHi*7.)*(10./-mv.z);}`,
    fragmentShader:`varying vec3 vC;varying float vA;void main(){float d=length(gl_PointCoord-.5);float a=smoothstep(.5,.1,d)*vA;gl_FragColor=vec4(vC*a,a);}`});
  const grp=new THREE.Group();scene.add(grp);const pts=new THREE.Points(g,m);grp.add(pts);
  const seg=[];for(let i=0;i<N;i+=3){let b=-1,bd=1e9;for(let j=0;j<N;j+=2){if(j===i)continue;const dd=V[i].distanceToSquared(V[j]);if(dd<bd){bd=dd;b=j}}seg.push(V[i],V[b])}
  grp.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(seg),new THREE.LineBasicMaterial({color:0x8a6bb8,transparent:true,opacity:.18})));
  const SEGS=56,arcs=[...Array(8)].map(()=>{const l=new THREE.Line(new THREE.BufferGeometry().setFromPoints([...Array(SEGS)].map(()=>new THREE.Vector3())),new THREE.LineBasicMaterial({color:C.gold2,transparent:true,blending:THREE.AdditiveBlending}));grp.add(l);return{l,dst:0}});
  let qi=-1,src=0;const QT=3.2;
  cam.position.set(0,0,9.6);
  return{update(t){
    const q=Math.floor(t/QT),lt=t%QT;
    if(q!==qi){qi=q;hi.fill(0);const r=rng(q*31+5);
      const view=new THREE.Vector3(0,0,1).applyQuaternion(grp.quaternion.clone().invert());
      do{src=Math.floor(r()*N)}while(V[src].clone().normalize().dot(view)<.55);
      const cand=[];for(let j=0;j<N;j++)if(grpId[j]===grpId[src]&&j!==src){const dd=V[j].distanceTo(V[src]);if(dd>1.2&&dd<4.4)cand.push(j)}
      arcs.forEach(a=>{a.dst=cand[Math.floor(r()*cand.length)];const A=V[src],B=V[a.dst],M=A.clone().add(B).multiplyScalar(.5);M.setLength(R+A.distanceTo(B)*.55);
        new THREE.QuadraticBezierCurve3(A,M,B).getPoints(SEGS-1).forEach((p,k)=>a.l.geometry.attributes.position.setXYZ(k,p.x,p.y,p.z));a.l.geometry.attributes.position.needsUpdate=true});
      const Q=QUERIES[q%QUERIES.length];if(hud)hud.innerHTML=`<b>query</b> ${Q[0]} · ${Q[1]} · ${Q[2]}<span>→ 8 matched of 200,418</span>`}
    const fade=1-ss(QT-.7,QT,lt);hi[src]=fade;
    arcs.forEach((a,j)=>{const p=ease((lt-.15-j*.08)/.9);a.l.geometry.setDrawRange(0,Math.floor(p*SEGS));a.l.material.opacity=.9*fade;hi[a.dst]=ss(.85,1,p)*fade});
    hiA.needsUpdate=true;grp.rotation.y=t*.05+ptr.x*.5;grp.rotation.x=.25-ptr.y*.3}};
}

/* 06 — Bar-path tracker: an Olympic lift with a live velocity trace, like a coach's tracking app */
export function barbell({scene,cam,ptr,renderer,hud}){
  scene.environment=studioEnv(renderer,0x2a1a40);
  const M=(c,r,m)=>new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m});
  const steel=M(0xc9c6cf,.25,1),aub=M(C.aub,.75,0),teal=M(C.teal,.7,0),gold=M(C.gold2,.3,1),rub=M(0x1a1024,.9,0);
  const bar=new THREE.Group(),cyl=(r,l,mat,z)=>{const c=new THREE.Mesh(new THREE.CylinderGeometry(r,r,l,64),mat);c.rotation.x=Math.PI/2;c.position.z=z;bar.add(c);return c};
  cyl(.014,1.31,steel,0);[-1,1].forEach(s=>{cyl(.025,.45,steel,s*.88);cyl(.04,.03,steel,s*.64);cyl(.225,.075,aub,s*.7);cyl(.2,.055,teal,s*.77);cyl(.13,.04,rub,s*.815);cyl(.045,.04,gold,s*.85);
    const ring=new THREE.Mesh(new THREE.TorusGeometry(.17,.006,8,96),gold);ring.position.z=s*.739;bar.add(ring)});
  bar.scale.setScalar(1.6);scene.add(bar);
  const plat=new THREE.Mesh(new THREE.BoxGeometry(1.4,.04,3.6),M(0x1c1030,.9,0));plat.position.y=-.025;scene.add(plat);
  const edge=new THREE.LineSegments(new THREE.EdgesGeometry(plat.geometry),new THREE.LineBasicMaterial({color:C.gold,transparent:true,opacity:.5}));edge.position.copy(plat.position);scene.add(edge);
  scene.add(new THREE.HemisphereLight(0xd9cdf0,0x1f1233,.6));const dl=new THREE.DirectionalLight(0xfff1d6,2.4);dl.position.set(2,4,5);scene.add(dl);
  const TN=180,tp=new Float32Array(TN*3),tc=new Float32Array(TN*3),tg=new THREE.BufferGeometry();tg.setAttribute('position',new THREE.BufferAttribute(tp,3));tg.setAttribute('color',new THREE.BufferAttribute(tc,3));
  scene.add(new THREE.Line(tg,new THREE.LineBasicMaterial({vertexColors:true,transparent:true,blending:THREE.AdditiveBlending})));
  const tpts=new THREE.Points(tg,new THREE.PointsMaterial({size:.06,vertexColors:true,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));scene.add(tpts);
  const trail=[],CY=4.6,FLOOR=.36;let py=FLOOR,vs=0,peak=0,rep=0,lastRep=-1;
  const path=u=>{let y=FLOOR,x=0,spin=0;
    if(u<.1){}else if(u<.38){const k=ease((u-.1)/.28);y=FLOOR+(1.42-FLOOR)*k;x=-.07*Math.sin(Math.PI*k)+.03*k;spin=k*2.2}
    else if(u<.5){y=1.42;x=.03;spin=2.2}else if(u<.58){const k=Math.sin(Math.PI*(u-.5)/.08);y=1.42-.12*k;x=.03}
    else if(u<.68){const k=ease((u-.58)/.1);y=1.42+(2.12-1.42)*k;x=.03-.05*k;spin=2.2+k}
    else if(u<.84){y=2.12;x=-.02;spin=3.2}else{const k=(u-.84)/.16;y=2.12-(2.12-FLOOR)*k*k;x=-.02*(1-k);spin=3.2*(1-k)}
    return{x,y,spin}};
  cam.position.set(1.7,1.3,4.6);cam.fov=45;cam.updateProjectionMatrix();
  return{update(t,dt){
    const u=(t%CY)/CY,p=path(u);bar.position.set(p.x,p.y,0);bar.rotation.z=-p.spin;
    const v=(p.y-py)/Math.max(dt,1e-3);py=p.y;vs+=(v-vs)*.25;if(vs>peak)peak=vs;
    const r=Math.floor(t/CY);if(r!==lastRep){lastRep=r;rep=r%5+1;peak=0;trail.length=0}
    trail.push([p.x,p.y,1.4]);if(trail.length>TN)trail.shift();
    for(let i=0;i<TN;i++){const q=trail[Math.min(i,trail.length-1)]||[0,FLOOR,1.4];tp.set(q,i*3);const f=i/TN,hot=clamp(Math.abs(i<trail.length?vs:0));tc.set([f,.75*f,.35*f],i*3)}
    tg.attributes.position.needsUpdate=tg.attributes.color.needsUpdate=true;tg.setDrawRange(0,trail.length);
    if(hud)hud.innerHTML=`<div><small>rep</small><b>${rep}/5</b></div><div><small>bar speed</small><b>${Math.abs(vs).toFixed(2)}<i>m/s</i></b></div><div><small>peak</small><b>${peak.toFixed(2)}<i>m/s</i></b></div>`;
    cam.position.set(1.9+ptr.x*.8,1.45-ptr.y*.3,5.8);cam.lookAt(.1,1.3,.6)}};
}

/* 07 — Availability, generated: the week flips to reveal open slots; three are picked and sent */
const DAYS=['MON','TUE','WED','THU','FRI'],TIMES=['9:00','10:00','11:00','12:30','1:30','2:30','3:30','4:30'];
export function calendar({scene,cam,ptr,hud}){
  const D=5,S=8,tw=.92,th=.42,g=new THREE.BoxGeometry(tw,th,.07),side=new THREE.MeshBasicMaterial({color:0xe6ddcf});
  const front=new THREE.MeshBasicMaterial({color:C.paper}),busy=new THREE.MeshBasicMaterial({color:0xe2d8ea}),open=new THREE.MeshBasicMaterial({color:C.gold2}),pick=new THREE.MeshBasicMaterial({color:C.teal});
  const tiles=[],grp=new THREE.Group();scene.add(grp);
  for(let d=0;d<D;d++)for(let s=0;s<S;s++){const m=new THREE.Mesh(g,[side,side,side,side,front,busy]);const home=new THREE.Vector3((d-2)*1.04-1.1,(3.5-s)*.52,0);m.position.copy(home);grp.add(m);
    const e=new THREE.LineSegments(new THREE.EdgesGeometry(g),new THREE.LineBasicMaterial({color:0xd6cab8}));m.add(e);tiles.push({m,d,s,home,open:false,pick:-1})}
  DAYS.forEach((n,d)=>{const p=new THREE.Mesh(new THREE.PlaneGeometry(.9,.22),new THREE.MeshBasicMaterial({map:textTex(n,{color:'#5f5667'}),transparent:true}));p.position.set((d-2)*1.04-1.1,2.35,0);grp.add(p)});
  const sent=new THREE.Mesh(new THREE.PlaneGeometry(1.6,.28),new THREE.MeshBasicMaterial({map:textTex('SENT ↗',{w:384,color:'#277f89',font:'700 30px "Public Sans"'}),transparent:true}));sent.position.set(3.3,1.55,0);grp.add(sent);
  let ci=-1,picks=[];const CY=8.5;
  cam.position.set(0,0,8.6);
  return{update(t){
    const c=t%CY,q=Math.floor(t/CY);
    if(q!==ci){ci=q;const r=rng(q*17+3);tiles.forEach(o=>{o.open=r()<.38;o.pick=-1;o.m.material[5]=o.open?open:busy});
      picks=[];[1,2,3].forEach((d,j)=>{const opts=tiles.filter(o=>o.d===d&&o.open);const o=opts.length?opts[Math.floor(r()*opts.length)]:tiles.find(o=>o.d===d&&o.s===j*2);o.open=true;o.pick=j;picks.push(o)});
      if(hud)hud.innerHTML='&nbsp;'}
    tiles.forEach(o=>{const del=(o.d*S+o.s)*.03,back=ease((c-7.6-del*.4)/.5),fl=ease((c-.2-del)/.5)*(1-back);
      o.m.rotation.y=Math.PI*fl;o.m.position.copy(o.home);o.m.scale.setScalar(1);
      if(o.pick>=0){o.m.material[5]=c>3.4&&c<7.9?pick:open;const lift=ease((c-3.3-o.pick*.12)/.45),fly=ease((c-4.4-o.pick*.2)/.9)*(1-ease((c-7.4)/.6));
        o.m.position.z+=lift*.5*(1-fly)+fly*.2;o.m.position.lerp(new THREE.Vector3(3.3,1-o.pick*.6,.2),fly);o.m.scale.setScalar(1+lift*.12+fly*.5);o.m.rotation.x=Math.sin(Math.PI*fly)*.35}
      else o.m.material[5]=o.open?open:busy});
    sent.material.opacity=ss(5,5.4,c)*(1-ss(7.3,7.7,c));
    if(hud){const on=c>5.2&&c<7.6;hud.classList.toggle('on',on);if(on&&hud.dataset.q!=q){hud.dataset.q=q;hud.innerHTML='“Here are three times that work: '+picks.map(o=>`<b>${['Mon','Tue','Wed','Thu','Fri'][o.d]} ${TIMES[o.s]}</b>`).join(' · ')+'.”'}}
    grp.rotation.y=ptr.x*.25-.08;grp.rotation.x=-ptr.y*.15}};
}

/* 08 — Weld sparks: physical spark streaks over the welding photo; the arc follows the cursor */
export function sparks({scene,cam,ptr,el}){
  const MAX=1400,P=new Float32Array(MAX*3),Vv=new Float32Array(MAX*3),L=new Float32Array(MAX),LM=new Float32Array(MAX);
  const pos=new Float32Array(MAX*6),col=new Float32Array(MAX*6),g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));
  scene.add(new THREE.LineSegments(g,new THREE.LineBasicMaterial({vertexColors:true,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false})));
  const gl=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{uI:{value:1}},
    vertexShader:'varying vec2 vU;void main(){vU=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:'varying vec2 vU;uniform float uI;void main(){float d=length(vU-.5)*2.;float a=(exp(-d*d*14.)*1.2+exp(-d*3.5)*.35)*uI;gl_FragColor=vec4(vec3(.75,.85,1.)*a+vec3(.4,.25,.1)*a*a,a);}'}));scene.add(gl);
  const fx=+el.dataset.sx||.54,fy=+el.dataset.sy||.566,tableY=+el.dataset.ty||.585;let hw=1,hh=1,next=0;
  const toW=(nx,ny)=>[(nx*2-1)*hw,(1-ny*2)*hh];
  cam.position.set(0,0,10);
  return{resize(w,h){hh=10*Math.tan(THREE.MathUtils.degToRad(cam.fov/2));hw=hh*w/h},
    update(t,dt){
      const tx=ptr.inside?ptr.nx:fx,ty=ptr.inside?ptr.ny:fy,[ex,ey]=toW(tx,ty),floor=toW(0,ptr.inside?Math.min(1,ty+.03):tableY)[1];
      const flick=.7+.3*Math.sin(t*61)*Math.sin(t*23.7);gl.position.set(ex,ey,.1);gl.scale.setScalar(1.6+flick*.6);gl.material.uniforms.uI.value=flick;
      const burst=Math.random()<.08?40:6+Math.floor(Math.random()*8);
      for(let k=0;k<burst;k++){const i=next;next=(next+1)%MAX;const a=Math.random()*Math.PI*.95+.03,sp=1.5+Math.random()*Math.random()*7;
        P.set([ex,ey,0],i*3);Vv.set([Math.cos(a)*sp*(Math.random()<.5?1:-1)*.9,Math.sin(a)*sp*.85,(Math.random()-.5)*2],i*3);LM[i]=L[i]=.5+Math.random()*1.1}
      for(let i=0;i<MAX;i++){const j=i*3;if(L[i]<=0){pos.fill(0,i*6,i*6+6);continue}
        L[i]-=dt;Vv[j+1]-=9.8*dt;Vv[j]*=.995;P[j]+=Vv[j]*dt;P[j+1]+=Vv[j+1]*dt;P[j+2]+=Vv[j+2]*dt;
        if(P[j+1]<floor&&Vv[j+1]<0){P[j+1]=floor;Vv[j+1]*=-.32;Vv[j]*=.6;L[i]*=.8}
        const f=clamp(L[i]/LM[i]),st=.028;pos.set([P[j],P[j+1],P[j+2],P[j]-Vv[j]*st,P[j+1]-Vv[j+1]*st,P[j+2]-Vv[j+2]*st],i*6);
        const r=1,gg=.45+.55*f,b=.15+.75*f*f,a=f;col.set([r*a,gg*a,b*a,r*a*.3,gg*a*.2,b*a*.1],i*6)}
      g.attributes.position.needsUpdate=g.attributes.color.needsUpdate=true}};
}
