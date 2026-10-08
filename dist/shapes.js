/* Parametric shape sonification. Geometry drives pitch and timbre. */
(function(root){
  'use strict';
  const api=root.Sonograph,previousGenerate=api.generate,{mod,clamp}=api,TAU=2*Math.PI,entries=[];
  const point=(x,y)=>({x,y});
  function polygon(vertices,u){const v=mod(u,1)*vertices.length,i=Math.floor(v),r=v-i,a=vertices[i],b=vertices[(i+1)%vertices.length];return point(a[0]+r*(b[0]-a[0]),a[1]+r*(b[1]-a[1]))}
  function strokes(paths,u){const v=mod(u,1)*paths.length,i=Math.floor(v),r=v-i;return r>.96?null:paths[i](r/.96)}
  const circle=(cx,cy,r,start=0,end=TAU)=>u=>point(cx+r*Math.cos(start+(end-start)*u),cy+r*Math.sin(start+(end-start)*u));
  function add(id,name,geometry,equation,details,sound){entries.push({id,name,geometry,equation,details,sound,group:'Shape sounds',description:'',discoveryWeight:4,reference:'shape-equations.html#'+id})}
  add('heart_hiccups','Heart hiccups',u=>{const a=TAU*u;return point(3*Math.sin(a)**3,(13*Math.cos(a)-5*Math.cos(2*a)-2*Math.cos(3*a)-Math.cos(4*a))/5.8+.35)},
    'x = 3sin³θ<br>y = (13cosθ−5cos2θ−2cos3θ−cos4θ)/5.8+0.35',
    'A trigonometric heart outline. Four laps, paired heartbeat attacks and a shorter high chirp. Pitch follows the vertical outline; this is not an ECG model.',
    {laps:4,cells:6,hits:[1,.75,0,1,.55,0],gate:.74,decay:3,voice:'Hollow',root:110,fm:{ratio:1,index:t=>.5+2.8*Math.sin(Math.PI*mod(t*24,1))**2}});
  const star=Array.from({length:10},(_,i)=>{const a=Math.PI/2+TAU*i/10,r=i%2?1.25:3;return [r*Math.cos(a),r*Math.sin(a)]});
  add('star_cartwheel','Star cartwheel',u=>polygon(star,u),'Pᵢ = rᵢ(cosαᵢ,sinαᵢ)<br>rᵢ = 3 (i even), 1.25 (i odd)',
    'αᵢ=π/2+2πi/10, i=0…9. Linearly interpolate consecutive vertices and close the polygon. Five laps; each point gets a bright attack and each valley a softer reply.',
    {laps:5,cells:10,hits:[1,.35],gate:.8,decay:2.8,voice:'Glass',root:164.8138});
  const smilePaths=[circle(0,0,2.8),circle(-.95,.85,.23),circle(.95,.85,.23),circle(0,.1,1.65,Math.PI*1.15,Math.PI*1.85)];
  add('smiley_giggles','Smiley giggles',u=>strokes(smilePaths,u),'Face: x=2.8cosθ, y=2.8sinθ<br>Eyes: radius 0.23; smile: radius 1.65',
    'Four strokes: face circle; circles centered at (−0.95,0.85) and (0.95,0.85); smile arc centered at (0,0.1), angles 1.15π…1.85π. Equal stroke time, with the last 4% of each interval lifting the pen. Three laps, short laughing pulses.',
    {laps:3,cells:16,hits:[1,.65,.8,0],gate:.62,decay:3.5,voice:'Reed',root:130.8128,fm:{ratio:1.5,index:2.1}});
  add('flower_fizz','Flower fizz',u=>{const a=TAU*u,r=2.9*Math.cos(5*a);return point(r*Math.cos(a),r*Math.sin(a))},
    'r = 2.9cos5θ<br>x = r cosθ; y = r sinθ',
    'Five-petal polar rose. Three full angular laps (each traces every petal twice). Ten fizzy attacks per lap; FM brightness follows sideways distance.',
    {laps:3,cells:10,hits:[1,.5,1,.7,0],gate:.77,decay:2.4,voice:'Bell',root:146.8324,fm:{ratio:2,index:(t,p)=>.4+Math.abs(p.x)}});
  add('butterfly_blips','Butterfly blips',u=>{const a=TAU*u,r=(Math.exp(Math.cos(a))-2*Math.cos(4*a)+Math.sin(a/12)**5)*.85;return point(r*Math.sin(a),r*Math.cos(a)-.5)},
    'r = 0.85[e^(cosθ)−2cos4θ+sin⁵(θ/12)]<br>x = r sinθ; y = r cosθ−0.5',
    'One-turn segment of the Fay butterfly curve, repeated four times. The classical full curve uses a longer parameter interval; this one-turn segment emphasizes the wing silhouette. Fluttering amplitude alternates rapid paired notes and rests.',
    {laps:4,cells:12,hits:[1,.6,0,1,.6,0],gate:.65,decay:2,voice:'Sine',root:196,fm:{ratio:2.5,index:(t,p)=>.3+.7*Math.abs(p.x)}});
  const moonPaths=[u=>{const a=Math.PI/3+(TAU-2*Math.PI/3)*u;return point(2.9*Math.cos(a),2.9*Math.sin(a))},u=>{const y=-2.9*Math.sin(Math.PI/3)+2*2.9*Math.sin(Math.PI/3)*u;return point(2.7-Math.sqrt(Math.max(0,(1.25**2+(2.9*Math.sin(Math.PI/3))**2)-y*y)),y)}];
  add('moon_mischief','Moon mischief',u=>strokes(moonPaths,u),'Outer: x=2.9cosθ, y=2.9sinθ<br>Inner: x=2.7−√(R²−y²)',
    'Outer arc: θ=π/3…5π/3. Inner arc goes bottom to top, y=−2.9sin(π/3)…2.9sin(π/3); R=sqrt(1.25²+(2.9sin(π/3))²). Two strokes with 4% pen lifts. Three laps. Low scoops alternate with silvery chirps; ring frequency follows horizontal position.',
    {laps:3,cells:8,hits:[1,0,.7,.4,1,0,.5,0],gate:.86,decay:1.7,voice:'Hollow',root:98,ring:{frequency:(t,p)=>45+70*Math.abs(p.x),depth:.7}});
  const bolt=[[-.15,3],[-2.1,-.3],[-.45,-.3],[-1.05,-3],[2.1,.65],[.45,.65]];
  add('lightning_zaps','Lightning zaps',u=>polygon(bolt,u),'P = ((−0.15,3),(−2.1,−0.3),(−0.45,−0.3),<br>(−1.05,−3),(2.1,0.65),(0.45,0.65))',
    'Linear interpolation around a closed six-vertex lightning bolt. Six laps; three fast zaps then a rest. FM index rises as the cursor descends.',
    {laps:6,cells:6,hits:[1,.5,.8,0,1,0],gate:.55,decay:4,voice:'Pulse',root:146.8324,fm:{ratio:1.73,index:(t,p)=>.5+(3-p.y)*.5}});
  add('infinity_wiggle','Infinity wiggle',u=>{const a=TAU*u;return point(3*Math.cos(a),1.8*Math.sin(2*a))},
    'x = 3cosθ<br>y = 1.8sin2θ',
    'A Gerono-style figure eight. Five laps. Uneven groups of three, two and three attacks make the crossover skip. Ring modulation accelerates toward the center.',
    {laps:5,cells:8,hits:[1,.6,.8,0,1,.55,0,.8],gate:.79,decay:2,voice:'Triangle',root:130.8128,ring:{frequency:(t,p)=>35+160*(1-Math.abs(p.x)/3),depth:.65}});
  const fishPaths=[u=>point(2.2*Math.cos(TAU*u),1.35*Math.sin(TAU*u)),u=>polygon([[1.85,.65],[3.2,1.6],[3.2,-1.6],[1.85,-.65]],u),circle(-1.15,.35,.18)];
  add('fish_bubbles','Fish bubbles',u=>strokes(fishPaths,u),'Body: x=2.2cosθ, y=1.35sinθ<br>Tail: polygon; eye: radius 0.18',
    'Three strokes: body ellipse; tail vertices (1.85,0.65),(3.2,1.6),(3.2,−1.6),(1.85,−0.65); eye circle centered at (−1.15,0.35). Four laps, alternating gurgles and stuttering bubbles.',
    {laps:4,cells:12,hits:[1,0,.6,.4,1,0],gate:.68,decay:3,voice:'Reed',root:110,fm:{ratio:.5,index:(t,p)=>1.2+.7*Math.abs(p.x)}});
  add('spiral_slinky','Spiral slinky',u=>{const v=u<.5?2*u:2-2*u,a=6*Math.PI*v,r=.25+2.65*v;return point(r*Math.cos(a),r*Math.sin(a))},
    'r = 0.25+2.65v; θ=6πv<br>x = r cosθ; y = r sinθ',
    'v runs from 0 to 1 and back within each lap. Three laps. Each outward journey builds a chirping register; the return collapses it. Amplitude pulses accelerate outward with clock c=12v+12v² and reverse inward.',
    {laps:3,cells:24,hits:[1,.65,1,0],gate:.78,decay:2.4,voice:'Glass',root:164.8138,clock:t=>{const u=mod(t*3,1),v=u<.5?2*u:2-2*u;return 12*v+12*v*v},fm:{ratio:1.25,index:1.1}});
  const byId=new Map(entries.map(e=>[e.id,e]));
  api.generate=function(seed,options={}){
    const entry=byId.get(/^sg2-([a-z_]+)--/.exec(seed)?.[1]);if(!entry)return previousGenerate(seed,options);
    const s=entry.sound,path=t=>entry.geometry(mod(t*s.laps,1));
    const f=t=>{const p=path(t);return p?.y*.65??NaN};
    let hash=0;for(const c of seed)hash=(Math.imul(hash,31)+c.charCodeAt(0))|0;
    const transpose=[0,2,5][(hash>>>0)%3],base=s.root*2**(transpose/12)/1.22;
    const layer={f,voice:s.voice,baseFrequency:base,envelope:t=>{const p=path(t);if(!p)return 0;const clock=s.clock?s.clock(t):t*s.laps*s.cells,n=Math.floor(clock),r=mod(clock,1),gain=s.hits[mod(n,s.hits.length)];return r<s.gate?gain*Math.min(1,r/.045)*Math.exp(-s.decay*r)*clamp((s.gate-r)/.055,0,1):0}};
    for(const key of ['fm','ring'])if(s[key]){layer[key]={};for(const [k,v]of Object.entries(s[key]))layer[key][k]=typeof v==='function'?t=>{const p=path(t);return p?v(t,p):0}:v}
    const pattern={seed,version:2,type:entry.id,name:entry.name,group:entry.group,family:'SHAPE SOUNDS',description:'',reference:entry.reference,minX:0,maxX:1,duration:14,baseFrequency:base,voice:s.voice,amplitude:3,musical:true,parametric:true,path,layers:[layer],f,formula:entry.equation,
      definitions:entry.details+` For scan progress t=0…1, θ=2π frac(${s.laps}t), unless the shape uses explicit strokes. Sound pitch height=0.65y(t); horizontal position controls the stated timbre. Root=${(base*1.22).toFixed(3)} Hz. Amplitude clock=${s.clock?'12v+12v²':s.laps*s.cells+'t'}, r=frac(clock); gains=(${s.hits.join(',')}), gate=${s.gate}, decay=${s.decay}. Envelope=gain*min(1,r/0.045)*exp(−decay*r)*clamp((gate−r)/0.055,0,1); pen lifts are silent. Vivid uses the stated synthesis; Original retains its legacy voice mapping.`};
    pattern.pathSamples=Array.from({length:3073},(_,i)=>path(i/3072));return pattern;
  };
  // Equal x/y scale preserves recognizable silhouettes at every viewport size.
  api.paintShape=function(ctx,p,w,h,progress=null,thumbnail=false){
    const top=thumbnail?4:29,bottom=thumbnail?h-4:h-43,unit=Math.min(w-(thumbnail?12:48),bottom-top)/8,cx=w/2,cy=(top+bottom)/2;
    const mx=x=>cx+x*unit,my=y=>cy-y*unit,colors=['#5046df','#c75383'];
    if(!thumbnail){ctx.strokeStyle='#f0f1f5';ctx.lineWidth=1;for(let n=-3;n<=3;n++){ctx.beginPath();ctx.moveTo(mx(n),my(3.5));ctx.lineTo(mx(n),my(-3.5));ctx.moveTo(mx(-3.5),my(n));ctx.lineTo(mx(3.5),my(n));ctx.stroke()}ctx.fillStyle='#8b929e';ctx.font='italic 12px Georgia';ctx.fillText('x',mx(3.6),my(0));ctx.fillText('y',mx(0)+7,my(3.5))}
    function trace(end,color,width){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineJoin='round';ctx.lineCap='round';ctx.beginPath();let previous=null;for(let i=0;i<p.pathSamples.length;i++){if(i/(p.pathSamples.length-1)>end)break;const pt=p.pathSamples[i];if(!pt){previous=null;continue}if(!previous||Math.hypot(pt.x-previous.x,pt.y-previous.y)>1)ctx.moveTo(mx(pt.x),my(pt.y));else ctx.lineTo(mx(pt.x),my(pt.y));previous=pt}ctx.stroke()}
    trace(1,progress===null?colors[0]:'#dedee9',thumbnail?1.4:2);
    if(progress!==null){trace(progress,colors[0],2.2);const pt=p.path(progress);if(pt){ctx.fillStyle=colors[1];ctx.beginPath();ctx.arc(mx(pt.x),my(pt.y),4,0,TAU);ctx.fill()}}
  };
  api.catalog=[...entries,...api.catalog];api.groups=[...new Set(api.catalog.map(e=>e.group))];api.curation.added.push(...entries.map(e=>e.id));
  if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
