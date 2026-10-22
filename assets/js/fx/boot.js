import {mount} from './core.js';
const where={pipeline:'a',terrain:'a',scripts:'a',coins:'a',network:'b',barbell:'b',calendar:'b',sparks:'b',voice:'c',growth:'c',sandbag:'c'};
const huds={network:'hud-net',barbell:'hud-bar',calendar:'hud-cal',voice:'hud-voice',sandbag:'hud-toss'};
const load={a:()=>import('./scenes-a.js'),b:()=>import('./scenes-b.js'),c:()=>import('./scenes-c.js')};
const els=[...document.querySelectorAll('[data-fx]')];
if(els.length){await document.fonts.ready;
for(const el of els){const n=el.dataset.fx;if(!where[n])continue;
  if(huds[n]&&!el.querySelector('.hud')){const h=document.createElement('div');h.className='hud '+huds[n];el.appendChild(h)}
  try{const m=await load[where[n]]();mount(el,m[n])}catch(e){console.error('fx',n,e)}}}
