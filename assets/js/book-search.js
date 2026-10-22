(function(){
const root=document.querySelector('.bk-search');if(!root)return;
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const Q=[
 {q:'best dog water bottle',site:'bestdogwaterbottle.com',title:'Best Dog Water Bottles & Bowls of 2026 (By Size)',desc:'Size-matched picks for small, medium, and large dogs — travel, home, and crate.'},
 {q:'seo probability playbook',site:'datasalesscience.com',title:'The SEO Probability Playbook — Mark Shalinsky, PhD',desc:'A practical, step-by-step guide to getting found in search — and staying found.'},
 {q:'how much water does a dog need',site:'bestdogwaterbottle.com',title:'How Much Water Does a Dog Need? A Simple Guide',desc:'About 1 oz per pound per day — plus signs of dehydration and easy fixes.'},
 {q:'seo help for startups',site:'datasalesscience.com',title:'SEO & Revenue Systems for Startups | Data Sales Science',desc:'Keyword research, site structure, and content that turns searches into pipeline.'}];
const OTHERS=[['bigpetstore.com','Shop Dog Bowls & Water Bottles'],['example-reviews.net','10 Products We Tried This Year'],['generic-guide.org','Everything You Need to Know'],['forum.example.com','Question thread · 42 replies']];
const $=s=>root.querySelector(s),input=$('.bks-q'),list=$('.bks-res'),cnt=$('.bks-count'),cur=$('.bks-cursor');
let visitors=1284;const fmt=n=>n.toLocaleString('en-US');cnt.textContent=fmt(visitors);
const wait=ms=>new Promise(r=>setTimeout(r,reduce?Math.min(ms,400):ms));
const row=(site,title,desc,me)=>`<li class="bks-r${me?' me':''}"><span class="u">${site}</span><b>${title}</b><span class="d">${desc}</span>${me?'<span class="bks-badge">#1</span>':''}</li>`;
async function type(t){input.textContent='';for(const ch of t){input.textContent+=ch;await wait(55+Math.random()*50)}}
async function cycle(i){const it=Q[i%Q.length];
 root.classList.remove('done');list.innerHTML='';await type(it.q);await wait(350);root.classList.add('searching');await wait(500);root.classList.remove('searching');
 const o=OTHERS.slice().sort(()=>Math.random()-.5).slice(0,3);
 list.innerHTML=o.map(x=>row(x[0],x[1],'')).join('')+row(it.site,it.title,it.desc,true);
 const lis=[...list.children];lis.forEach((li,k)=>{li.style.animationDelay=k*90+'ms'});
 await wait(900);
 const me=list.querySelector('.me'),first=me.getBoundingClientRect().top;list.prepend(me);const last=me.getBoundingClientRect().top;
 me.animate([{transform:`translateY(${first-last}px)`},{transform:'none'}],{duration:reduce?1:900,easing:'cubic-bezier(.2,.8,.2,1)'});
 lis.filter(x=>x!==me).forEach(x=>{const r=x.getBoundingClientRect().top;x.animate([{transform:`translateY(-${me.offsetHeight}px)`},{transform:'none'}],{duration:reduce?1:900,easing:'cubic-bezier(.2,.8,.2,1)'})});
 await wait(950);root.classList.add('done');window.dispatchEvent(new CustomEvent('bk-rank'));
 cur.classList.add('click');setTimeout(()=>cur.classList.remove('click'),500);
 const add=40+(Math.random()*60|0),t0=performance.now();
 await new Promise(r=>{const f=t=>{const p=Math.min(1,(t-t0)/1600);cnt.textContent=fmt(visitors+Math.round(add*p));p<1?requestAnimationFrame(f):r()};requestAnimationFrame(f)});
 visitors+=add;await wait(2200);cycle(i+1)}
let started=false;new IntersectionObserver(([e])=>{if(e.isIntersecting&&!started){started=true;cycle(0)}}).observe(root);
})();
