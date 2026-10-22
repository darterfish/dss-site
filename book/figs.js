// Sketch-style academic figures for the SEO book. Each figure: viewBox 600 x H.
(function(){
const INK='#24304a',PL='#452668',GD='#b3903f',SOFT='#efe7da';
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
const T=(x,y,s,o={})=>{const lines=String(s).split('\n'),fs=o.fs||15,lh=fs*1.2,y0=y-(lines.length-1)*lh/2+fs*.35;
  return `<text x="${x}" y="${y0}" text-anchor="${o.a||'middle'}" font-size="${fs}" fill="${o.c||INK}" font-family="${o.f||'Kalam, cursive'}" font-weight="${o.w||400}"${o.it?' font-style="italic"':''}>${lines.map((l,i)=>`<tspan x="${x}" dy="${i?lh:0}">${esc(l)}</tspan>`).join('')}</text>`};
const B=(x,y,w,h,s,o={})=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.r??8}" fill="${o.fill||'#fffdf8'}" stroke="${o.c||INK}" stroke-width="${o.sw||1.8}" filter="url(#rough)"${o.dash?' stroke-dasharray="6 5"':''}/>`+(s?T(x+w/2,y+h/2,s,o.t||{}):'');
const C=(x,y,r,o={})=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${o.fill||'none'}" stroke="${o.c||INK}" stroke-width="${o.sw||1.8}" filter="url(#rough)"${o.op?` fill-opacity="${o.op}"`:''}/>`;
const A=(x1,y1,x2,y2,o={})=>{const bend=o.bend||0,mx=(x1+x2)/2-(y2-y1)*bend,my=(y1+y2)/2+(x2-x1)*bend;
  return `<path d="M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}" fill="none" stroke="${o.c||INK}" stroke-width="${o.sw||1.6}" marker-end="url(#ah${o.c===GD?'g':o.c===PL?'p':''})"${o.both?` marker-start="url(#as)"`:''}${o.dash?' stroke-dasharray="5 5"':''} filter="url(#rough)"/>`};
const L=(x1,y1,x2,y2,o={})=>`<path d="M${x1} ${y1} L${x2} ${y2}" stroke="${o.c||INK}" stroke-width="${o.sw||1.4}" fill="none"${o.dash?' stroke-dasharray="4 5"':''} filter="url(#rough)"/>`;
const H=(x,y,w,h,c=GD)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#hatch${c===PL?'p':''})" stroke="${c}" stroke-width="1.6" filter="url(#rough)"/>`;
const defs=`<defs><filter id="rough" filterUnits="userSpaceOnUse" x="-20" y="-20" width="640" height="420"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="4"/><feDisplacementMap in="SourceGraphic" scale="2.6"/></filter>
<pattern id="hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(40)"><line x1="0" y1="0" x2="0" y2="7" stroke="${GD}" stroke-width="1.6" opacity=".7"/></pattern>
<pattern id="hatchp" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(-40)"><line x1="0" y1="0" x2="0" y2="7" stroke="${PL}" stroke-width="1.4" opacity=".55"/></pattern>
${[['ah',INK],['ahg',GD],['ahp',PL]].map(([id,c])=>`<marker id="${id}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M1 1 L9 5 L1 9" fill="none" stroke="${c}" stroke-width="1.6"/></marker>`).join('')}
<marker id="as" viewBox="0 0 10 10" refX="2" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M1 1 L9 5 L1 9" fill="none" stroke="${INK}" stroke-width="1.6"/></marker></defs>`;
const note=(x,y,s,o={})=>T(x,y,s,{fs:13,c:o.c||PL,a:o.a||'middle',it:true});

const F={
search:()=>[300,`${C(70,95,26)}${L(70,121,70,180,{sw:1.8})}${L(70,140,45,165)}${L(70,140,95,165)}${L(70,180,50,220)}${L(70,180,90,220)}${T(70,245,'the searcher',{fs:14})}
${B(118,40,170,46,'“dog water bottle\nfor hiking”',{r:22,t:{fs:14}})}${A(290,63,330,110)}
${B(300,110,130,80,'',{fill:SOFT})}${T(365,132,'search engine',{fs:15,w:700})}${T(365,160,'crawl → index →\nrank',{fs:13})}
${A(430,150,465,150)}
${B(470,40,115,230,'')}${[0,1,2,3].map(i=>`${i?B(482,62+i*50,92,36,'',{r:4}):H(482,62,92,36)}${L(490,72+i*50,560,72+i*50)}${L(490,84+i*50,540,84+i*50,{sw:1})}`).join('')}
${note(527,52,'results')}${T(527,262,'BDWB #1',{fs:13,c:GD,w:700})}
${note(200,215,'intent: “I want to buy\nthe right bottle”',{})}${A(200,195,140,100,{c:PL,dash:1,bend:.2})}`],
eeat:()=>[340,`${C(300,92,78,{fill:'#f3ecf9',op:.55})}${C(212,232,78,{fill:'#f3ecf9',op:.55})}${C(388,232,78,{fill:'#f3ecf9',op:.55})}
${T(300,50,'Experience',{fs:17,w:700})}${note(300,72,'first-hand use')}
${T(172,262,'Expertise',{fs:17,w:700})}${note(172,284,'skill & knowledge')}
${T(430,262,'Authoritative-\nness',{fs:16,w:700})}${note(430,296,'reputation')}
<path d="M300 142 L340 156 L337 196 Q323 224 300 236 Q277 224 263 196 L260 156 Z" fill="url(#hatch)" stroke="${GD}" stroke-width="2.2" filter="url(#rough)"/><rect x="266" y="174" width="68" height="28" rx="6" fill="#fffdf8"/>${T(300,188,'TRUST',{fs:18,w:700,c:PL})}
${note(510,90,'Google calls Trust\nthe most important\nmember of the family')}${A(470,110,345,170,{c:PL,dash:1,bend:-.2})}`],
prob:()=>[300,`${L(80,250,560,250,{sw:1.8})}${L(80,250,80,30,{sw:1.8})}${T(40,140,'chance\nof\nranking',{fs:13})}
${[[150,'Basic',30],[290,'Intermediate',50],[430,'Expert',70]].map(([x,n,p])=>`${H(x,250-p*2.8,90,p*2.8,p>60?GD:PL)}${T(x+45,250-p*2.8-18,p+'%',{fs:20,w:700,c:p>60?GD:PL})}${T(x+45,272,n,{fs:15})}`).join('')}
${L(80,250-100*2.8+0,560,250-100*2.8,{dash:1,c:'#9a90a6'})}${note(100,40,'no level guarantees #1',{a:'start'})}
${A(200,140,330,95,{c:INK,dash:1,bend:-.15})}${A(345,85,455,62,{c:INK,dash:1,bend:-.15})}${note(330,60,'each level stacks on the last',{})}`],
kwflow:()=>[210,`${[['1','Brainstorm','seed terms,\nPeople Also Ask'],['2','Analyze metrics','volume · difficulty\n· CPC'],['3','Understand intent','why are they\nsearching?'],['4','Study competitors','what already\nranks?']].map(([n,a,b],i)=>{const x=18+i*146;return `${B(x,50,124,110,'')}${C(x+20,50,15,{fill:'#fffdf8',c:GD,sw:2})}${T(x+20,51,n,{fs:15,w:700,c:GD})}${T(x+62,84,a,{fs:15,w:700})}${T(x+62,124,b,{fs:12.5,c:PL})}${i<3?A(x+126,105,x+144,105):''}`}).join('')}
${A(540,165,80,170,{c:GD,dash:1,bend:-.12})}${note(310,198,'repeat as the market and the algorithm change',{c:GD})}`],
kwscatter:()=>[320,`${L(70,270,570,270,{sw:1.8})}${L(70,270,70,25,{sw:1.8})}${T(320,300,'keyword difficulty →',{fs:14})}${T(34,148,'search\nvolume\n↑',{fs:13})}
${H(85,90,190,170)}${T(180,110,'sweet spot',{fs:16,w:700,c:GD})}${note(180,132,'real demand,\nwinnable')}
${[[150,180,'dog water bottle for small dogs',1],[110,240,'dog water fountain review'],[235,205,'collapsible dog bowls'],[470,60,'dog water bottle'],[420,120,'dog water bowls'],[500,180,'travel water bottles'],[330,230,'dog water bowl']].map(([x,y,s,k])=>`${C(x,y,k?7:5,{fill:k?PL:INK})}${T(x+(x>400?-10:12),y-12,s,{fs:12.5,a:x>400?'end':'start',c:k?PL:INK,w:k?700:400})}`).join('')}
${note(470,250,'high difficulty for\na new site',{c:INK})}`],
intent:()=>[330,`${B(40,30,255,135,'',{fill:'#f6f1fb'})}${B(305,30,255,135,'')}${B(40,175,255,135,'')}${B(305,175,255,135,'',{fill:'#fbf5e7'})}
${T(167,56,'Informational',{fs:17,w:700})}${note(167,84,'“How much water does a dog need?”')}${T(167,130,'→ blog posts & guides',{fs:13})}
${T(432,56,'Navigational',{fs:17,w:700})}${note(432,84,'“Best Dog Water Bottle small dogs”')}${T(432,130,'→ branded pages',{fs:13})}
${T(167,201,'Commercial investigation',{fs:16,w:700})}${note(167,229,'“Dog water fountain vs. bowl”')}${T(167,275,'→ comparisons & reviews',{fs:13})}
${T(432,201,'Transactional',{fs:17,w:700,c:GD})}${note(432,229,'“Buy dog water bottles for hiking”')}${T(432,275,'→ product & category pages',{fs:13})}`],
tree:()=>[360,`${B(230,20,140,44,'Homepage',{t:{fs:16,w:700}})}
${[['Home',95,['Water\nFountains','Stainless\nBowls']],['Travel',300,['Squeeze\nBottles','Collapsible\nBowls']],['Crate',505,['Crate-\nMount','Lock-On\nBowls']]].map(([n,x,k])=>`${A(300,64,x,112)}${B(x-70,112,140,42,n,{fill:'#f6f1fb',t:{fs:14,w:700}})}${k.map((s,j)=>{const cx=x-40+j*80;return `${A(x,154,cx,196,{both:1})}${B(cx-36,196,72,52,s,{t:{fs:12.5}})}`}).join('')}`).join('')}

${B(150,290,300,52,'',{dash:1,c:GD})}${T(300,305,'Monetization pages',{fs:14,w:700,c:GD})}${note(300,327,'“Best of 2026” · “PupFlask Review”',{c:GD})}
${A(55,248,160,300,{c:GD,dash:1})}${A(300,248,300,288,{c:GD,dash:1})}${A(545,248,440,300,{c:GD,dash:1})}`],
silo:()=>[320,`<rect x="120" y="14" width="360" height="292" rx="18" fill="none" stroke="${PL}" stroke-width="1.4" stroke-dasharray="7 6" filter="url(#rough)"/>${T(300,34,'the Travel Bottles silo',{fs:14,c:PL,it:true})}
${B(200,52,200,54,'Travel Bottles\n(foundational)',{fill:'#f6f1fb',t:{fs:15,w:700}})}
${B(140,150,140,54,'Squeeze\nBottles',{t:{fs:14}})}${B(320,150,140,54,'Collapsible\nBowls',{t:{fs:14}})}
${H(200,240,200,50)}<rect x="212" y="248" width="176" height="34" rx="6" fill="#fffdf8"/>${T(300,265,'“Best Bottles for Large Dogs”',{fs:13,w:700})}
${A(260,106,215,150,{both:1})}${A(340,106,385,150,{both:1})}${A(280,177,320,177,{both:1})}${A(210,204,255,240)}${A(390,204,345,240)}
${note(545,120,'pages link\nwithin the silo\n— not across it',{c:INK})}${B(500,220,90,40,'Crate\nsilo',{dash:1,c:'#9a90a6',t:{fs:12,c:'#9a90a6'}})}${L(470,240,500,240,{dash:1,c:'#b0a7bb'})}${T(485,232,'×',{fs:18,c:'#b33'})}`],
page:()=>[360,`${B(150,14,300,334,'',{r:12})}${L(150,44,450,44)}${C(170,29,5)}${C(186,29,5)}${C(202,29,5)}${B(220,20,210,18,'',{r:9})}${T(232,30,'bestdogwaterbottle.com/travel',{fs:11,a:'start'})}
${H(172,62,256,34)}<rect x="180" y="68" width="240" height="22" rx="4" fill="#fffdf8"/>${T(300,80,'Dog Water Bottles for Hiking: Hydration on Every Trail',{fs:12,w:700})}
${B(172,112,180,22,'Why Your Dog Needs Water on the Trail',{r:4,t:{fs:12}})}${[0,1,2].map(i=>L(172,148+i*12,428-i*30,148+i*12,{sw:1})).join('')}
${B(172,192,170,22,'Best Dog Water Bottles for Hiking',{r:4,t:{fs:12}})}${[0,1].map(i=>L(172,228+i*12,428-i*50,228+i*12,{sw:1})).join('')}
${B(172,262,110,66,'',{r:4,fill:SOFT})}${L(176,322,278,266,{sw:1})}${L(176,266,278,322,{sw:1})}${[0,1,2,3].map(i=>L(296,270+i*14,428-i*20,270+i*14,{sw:1})).join('')}
${note(68,30,'URL with\nkeyword',{})}${A(100,40,218,30,{c:PL,dash:1})}
${note(70,92,'H1 — the\nmain keyword')}${A(110,90,170,80,{c:PL,dash:1})}
${note(70,170,'H2 / H3 —\nlogical sections')}${A(110,168,170,125,{c:PL,dash:1})}${A(110,175,170,203,{c:PL,dash:1})}
${note(530,160,'body: answers\nthe intent, uses\nkeywords\nnaturally')}${A(490,160,430,160,{c:PL,dash:1})}
${note(530,300,'image with\ndescriptive\nalt text')}${A(490,300,284,300,{c:PL,dash:1,bend:.1})}`],
snippet:()=>[300,`${B(90,14,420,272,'',{r:12})}${B(110,30,380,28,'',{r:14})}${T(128,45,'how much water does a dog need',{fs:13,a:'start'})}${C(470,44,7)}
${H(110,72,380,108)}<rect x="120" y="80" width="360" height="92" rx="6" fill="#fffdf8"/>${T(132,98,'How much water does a dog need per day?',{fs:13.5,w:700,a:'start'})}${[0,1,2].map(i=>L(132,118+i*13,460-i*40,118+i*13,{sw:1})).join('')}${T(132,162,'bestdogwaterbottle.com',{fs:11.5,a:'start',c:GD})}
${[0,1].map(i=>`${L(120,200+i*40,330,200+i*40)}${L(120,214+i*40,450,214+i*40,{sw:1})}`).join('')}
${note(555,100,'“position\nzero”',{c:GD})}${A(540,120,494,128,{c:GD})}${note(555,230,'regular\nresults',{c:INK})}`],
matrix:()=>[340,`${L(70,300,570,300,{sw:1.8})}${L(70,300,70,20,{sw:1.8})}${T(320,328,'effort / difficulty →',{fs:14})}${T(32,160,'value\n(volume ×\nintent)\n↑',{fs:13})}
${H(80,30,235,130)}${T(197,70,'Quick wins',{fs:18,w:700,c:GD})}${note(197,98,'do these first')}
${B(325,30,235,130,'',{fill:'#f6f1fb'})}${T(442,70,'Big bets',{fs:18,w:700,c:PL})}${note(442,98,'plan & resource')}
${B(80,170,235,120,'')}${T(197,215,'Fill-ins',{fs:17,w:700})}${note(197,243,'when time allows')}
${B(325,170,235,120,'',{dash:1})}${T(442,215,'Skip (for now)',{fs:17,w:700,c:'#8a8296'})}${note(442,243,'revisit later',{c:'#8a8296'})}`],
speed:()=>[300,`${L(70,250,560,250,{sw:1.8})}${L(70,250,70,30,{sw:1.8})}${T(315,280,'page load time →',{fs:14})}${T(34,140,'visitors\nwho\nleave\n↑',{fs:13})}
<path d="M80 230 C 200 220, 280 180, 360 120 S 500 50, 555 42" fill="none" stroke="${PL}" stroke-width="2.6" filter="url(#rough)"/>
${H(80,40,130,210)}<rect x="90" y="120" width="110" height="50" rx="6" fill="#fffdf8"/>${T(145,145,'aim\nhere',{fs:15,w:700,c:GD})}
${note(420,190,'compress images · cache & CDN\n· minify code',{c:INK})}${A(370,175,300,175,{c:INK,dash:1})}`],
links:()=>[300,`${[[75,'Bidirectional'],[225,'Related'],[375,'Contextual'],[525,'Golden page']].map(([x,n])=>T(x,280,n,{fs:15,w:700})).join('')}
${B(45,40,60,34,'F',{t:{fs:14,w:700}})}${B(20,170,46,30,'S',{t:{fs:12}})}${B(84,170,46,30,'S',{t:{fs:12}})}${A(65,74,43,168,{both:1})}${A(85,74,107,168,{both:1})}
${[0,1,2].map(i=>B(190+(i%2)*40,50+i*65,58,40,'',{r:6})).join('')}${A(248,80,232,115,{bend:.2})}${A(232,155,248,180,{bend:-.2})}${note(225,235,'within the silo')}
${B(330,40,90,190,'',{r:6})}${[0,1,2,3,4,5,6].map(i=>L(342,62+i*22,408-(i%3)*14,62+i*22,{sw:1})).join('')}<path d="M352 128 L390 128" stroke="${GD}" stroke-width="3"/>${A(392,128,440,90,{c:GD})}${note(375,250,'in the sentence',{})}
${H(495,110,60,50)}${T(525,135,'★',{fs:22,c:PL})}${[[465,40],[580,40],[465,220],[580,220],[522,22]].map(([x,y])=>`${C(x,y,12)}${A(x+(x<525?8:x>525?-8:0),y+(y<100?10:-10),x<525?497:x>525?553:525,y<100?110:160,{c:GD})}`).join('')}`],
nav:()=>[330,`${B(110,14,380,302,'',{r:12})}${H(110,14,380,40)}<rect x="130" y="24" width="340" height="20" rx="4" fill="#fffdf8"/>${['By size','Travel','Home','Crate','Guides'].map((s,i)=>T(160+i*70,34,s,{fs:12.5})).join('')}
${T(130,76,'Home  ›  Travel Water Bottles  ›  Squeeze Bottles',{fs:13,a:'start',c:PL})}
${B(130,94,340,140,'',{r:6,fill:SOFT})}${note(300,165,'page content')}
${B(110,250,380,66,'',{r:12,fill:'#f6f1fb'})}${[0,1,2].map(i=>[0,1,2].map(j=>L(140+i*120,270+j*14,210+i*120,270+j*14,{sw:1})).join('')).join('')}
${note(560,34,'navigation\nbar')}${A(530,34,494,34,{c:PL,dash:1})}${note(40,76,'bread-\ncrumbs')}${A(68,78,126,76,{c:PL,dash:1})}${note(560,283,'footer\nlinks')}${A(530,283,494,283,{c:PL,dash:1})}`],
footprint:()=>[340,`${C(300,170,62,{fill:'#f6f1fb',op:1,sw:2.4})}${T(300,162,'Best Dog Water Bottle',{fs:18,w:700})}${note(300,186,'website')}
${[['Profiles','LinkedIn · Crunchbase',300,40],['Press & media','launch news',510,105],['Reviews','verified buyers',510,245],['Podcasts & PR','expert guest',300,305],['Local listings','directories',90,245],['Social media','awareness',90,105]].map(([a,b,x,y])=>`${B(x-75,y-26,150,52,'')}${T(x,y-8,a,{fs:14,w:700})}${note(x,y+12,b)}${A(x+(300-x)*.38,y+(170-y)*.38,300+(x-300)*.5,170+(y-170)*.5,{c:GD,both:0,bend:0})}`).join('')}`],
flywheel:()=>[340,`<circle cx="300" cy="170" r="118" fill="none" stroke="${GD}" stroke-width="2" stroke-dasharray="3 7" filter="url(#rough)"/>
${[['Paid ads',300,40],['Traffic &\nengagement data',470,120],['Audience\ninsight',440,280],['Better organic\ncontent',160,280],['Brand recognition\n& branded search',130,120]].map(([s,x,y],i,a)=>{const n=a[(i+1)%a.length];return `${B(x-70,y-28,140,56,s,{fill:i?'#fffdf8':'#fbf5e7',t:{fs:13.5,w:i?400:700}})}${A(x+(n[1]-x)*.45,y+(n[2]-y)*.45,x+(n[1]-x)*.6,y+(n[2]-y)*.6,{c:GD,sw:2.2})}`}).join('')}
${T(300,172,'paid + organic',{fs:16,w:700,c:PL})}${note(300,194,'reinforce each other')}`],
retarget:()=>[250,`${[['Visits a\nproduct page',75],['Leaves without\nbuying',225],['Sees a\nretargeting ad',375],['Returns &\nbuys',525]].map(([s,x],i)=>`${B(x-62,70,124,64,s,{fill:i===3?'#fbf5e7':'#fffdf8',t:{fs:13.5,w:i===3?700:400}})}${i<3?A(x+64,102,x+86,102):''}`).join('')}
${A(240,150,360,150,{c:PL,dash:1,bend:.3})}${note(300,222,'reminds the visitor what they were considering',{})}`],
backlinks:()=>[300,`${[[100,'Domain authority'],[300,'Relevance'],[500,'Anchor text']].map(([x,s])=>T(x,265,s,{fs:16,w:700})).join('')}
<path d="M40 190 A60 60 0 0 1 160 190" fill="none" stroke="${INK}" stroke-width="2" filter="url(#rough)"/>${[0,1,2,3,4].map(i=>{const a=Math.PI*(1-i/4);return L(100+Math.cos(a)*60,190-Math.sin(a)*60,100+Math.cos(a)*50,190-Math.sin(a)*50)}).join('')}${A(100,190,140,150,{c:GD,sw:2.6})}${C(100,190,5,{fill:INK})}${note(100,225,'who is linking?')}
${C(300,165,58)}${C(300,165,38,{fill:'url(#hatchp)'})}${C(300,165,16,{fill:PL})}${A(390,95,312,158,{c:GD,sw:2})}${note(300,245,'same topic, same audience')}
${B(420,110,160,34,'',{r:6})}${T(500,127,'best dog water bottles for hiking',{fs:11.5,c:GD,w:700})}<path d="M430 136 L570 136" stroke="${GD}" stroke-width="1.5"/>${T(570,104,'✓',{fs:18,c:'#2e7d4f'})}
${B(420,170,160,34,'',{r:6,dash:1})}${T(500,187,'click here',{fs:12.5,c:'#8a8296'})}${T(570,164,'×',{fs:20,c:'#b33'})}${note(500,245,'tells Google what the page is')}`],
ai:()=>[340,`<circle cx="300" cy="170" r="122" fill="none" stroke="${PL}" stroke-width="1.6" stroke-dasharray="4 7" filter="url(#rough)"/>
${[['Research','keywords · intent',300,40],['Create','drafts · outlines',480,170],['Optimize','on-page · UX',300,300],['Analyze','reports · trends',120,170]].map(([a,b,x,y],i,arr)=>{const n=arr[(i+1)%4];return `${B(x-68,y-28,136,56,'')}${T(x,y-8,a,{fs:15,w:700})}${note(x,y+13,b)}${A(x+(n[2]-x)*.42,y+(n[3]-y)*.42,x+(n[2]-x)*.58,y+(n[3]-y)*.58,{c:PL,sw:2})}`}).join('')}
${H(240,140,120,60)}<rect x="250" y="150" width="100" height="40" rx="6" fill="#fffdf8"/>${T(300,170,'human review',{fs:14,w:700,c:GD})}`],
road:()=>[260,`<path d="M30 220 C 150 220, 140 90, 260 110 S 420 210, 570 50" fill="none" stroke="${INK}" stroke-width="16" stroke-linecap="round" opacity=".12"/><path d="M30 220 C 150 220, 140 90, 260 110 S 420 210, 570 50" fill="none" stroke="${GD}" stroke-width="2" stroke-dasharray="10 9" filter="url(#rough)"/>
${[[40,218,'Foundations'],[150,150,'Keywords'],[260,110,'On-page'],[370,150,'Content & UX'],[470,140,'Authority'],[560,56,'AI & beyond']].map(([x,y,s],i)=>`${C(x,y,9,{fill:i===5?GD:'#fffdf8',sw:2})}${T(x,y+(i%2?-24:30),s,{fs:13.5,w:700})}`).join('')}
${note(470,230,'measure · adapt · persist',{c:PL})}`]
};
document.querySelectorAll('figure[data-fig]').forEach(fig=>{const f=F[fig.dataset.fig];if(!f)return;const [h,body]=f();
  fig.insertAdjacentHTML('afterbegin',`<svg viewBox="0 0 600 ${h}" role="img" aria-label="${esc(fig.querySelector('figcaption')?.textContent||'')}">${defs}${body}</svg>`)});
})();
