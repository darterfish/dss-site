(()=>{const rot=document.querySelector('.hx-rot');if(!rot)return;const w=[...rot.children],chips=document.querySelectorAll('.hx-chip');let i=0;
const sync=()=>{const k=w[i].dataset.chip;chips.forEach(c=>c.classList.toggle('hot',c.dataset.chip===k))};sync();
if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
setInterval(()=>{const p=w[i];p.classList.remove('on');p.classList.add('off');setTimeout(()=>p.classList.remove('off'),700);i=(i+1)%w.length;w[i].classList.add('on');sync()},2100)})();
(()=>{const b=document.querySelector('.hx-badge');if(!b)return;const it=[...b.querySelectorAll('.hx-badge-c>span')],tp=null;let i=0;
const theme=()=>{const t=it[i].dataset.t;b.classList.toggle('blue',t==='b');};
it.forEach(s=>{const l=s.querySelector('b').textContent.length;if(l>8)s.classList.add('long');if(l>13)s.classList.add('xl')});theme();
if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
setTimeout(()=>setInterval(()=>{const p=it[i];p.classList.remove('on');p.classList.add('off');setTimeout(()=>p.classList.remove('off'),600);i=(i+1)%it.length;it[i].classList.add('on');theme()},2100),1050)})();
