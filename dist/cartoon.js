/* Original cartoon gestures. No existing catalog entries are removed. */
(function(root){
  'use strict';
  const api=root.Sonograph,previousGenerate=api.generate,{mod,clamp}=api,TAU=2*Math.PI;
  const entries=[];
  const add=(id,name,formula,definitions,build)=>entries.push({id,name,formula,definitions,build,group:'Cartoon sounds',description:'',discoveryWeight:4,reference:'funny-sounds.html#'+id});
  // Each cell has its own attack and release. Null pitches are genuine rests.
  function cells(rate,notes,options={}){
    const {offset=0,gate=.8,decay=1,rootFrequency=196,voice='Sine',bend=()=>0,shape=()=>1}=options;
    const state=x=>{const u=(x+8-offset)*rate,n=Math.floor(u),r=mod(u,1),v=notes(n,r);return {n,r,v,active:u>=0&&v!==null&&r<gate}};
    return {voice,baseFrequency:rootFrequency/1.22,...options,
      f:x=>{const s=state(x);return s.active?(s.v+bend(s.n,s.r))/11.4:NaN},
      envelope:x=>{const s=state(x);return s.active?clamp(Math.min(1,s.r/.035)*Math.exp(-decay*s.r)*clamp((gate-s.r)/.055,0,1)*shape(s.n,s.r),0,1):0},
      notation:`rate=${rate}; offset=${offset}; gate=${gate}; decay=${decay}; root=${rootFrequency} Hz; voice=${voice}.`};
  }
  const loop=a=>n=>a[mod(n,a.length)];
  const phase=(x,rate,offset=0)=>mod((x+8-offset)*rate,1);
  add('spring_loaded','Spring loaded','y = [Pₙ + 15e^(−3r)sin(6πr)]/11.4',
    'P=(0,7,0,12,3,7,−5,rest), rate=1.5. A damped spring oscillates around each landing pitch.',q=>[
      cells(1.5,loop([0,7,0,12,3,7,-5,null]),{rootFrequency:q.root,voice:'Hollow',bend:(n,r)=>15*Math.exp(-3*r)*Math.sin(3*TAU*r),decay:2})]);
  add('duck_debate','Duck debate','yᵢ = [Dᵢ(n) + 9sin(πr)e^(−2r)]/11.4',
    'D₁=(0,0,rest,3,rest,0,rest,rest); D₂=(rest,rest,7,rest,10,rest,7,7). Rate=2.4; offsets=(0,0.09). Vivid FM ratios=(1,1.5); index=0.4+3sin²(πr). Synthetic duck-like calls, not recordings.',q=>[0,1].map(i=>cells(2.4,loop(i?[null,null,7,null,10,null,7,7]:[0,0,null,3,null,0,null,null]),{offset:i*.09,rootFrequency:q.root,voice:'Reed',gate:.67,decay:2.2,bend:(n,r)=>9*Math.sin(Math.PI*r)*Math.exp(-2*r),fm:{ratio:i?1.5:1,index:x=>.4+3*Math.sin(Math.PI*phase(x,2.4,i*.09))**2}})));
  add('ufo_parking','UFO parking','y = [6sin(πu/4) + (1+7r)sin(2π(2r+5r²))]/11.4',
    'u=0.75(x+8), r=frac(u), rate=0.75. The vibrato grows wider and faster in each cell, then stops. A pure sine creates the whistle.',q=>[
      cells(.75,(n,r)=>6*Math.sin(Math.PI*(n+r)/4),{rootFrequency:q.root*2,pure:true,gate:.91,decay:.1,bend:(n,r)=>(1+7*r)*Math.sin(TAU*(2*r+5*r*r))})]);
  add('laser_pingpong','Laser ping-pong','y₁ = [24−36r²]/11.4<br>y₂ = [−12+40√r]/11.4',
    'Rate=2; offsets=(0,0.25). Voice 1 fires on even cells; voice 2 replies on odd cells. Gates=(0.52,0.65). Opposing curved pitch sweeps cross the register.',q=>[
      cells(2,n=>mod(n,2)===0?24:null,{rootFrequency:q.root,voice:'Glass',gate:.52,decay:4,bend:(n,r)=>-36*r*r}),
      cells(2,n=>mod(n,2)===1?-12:null,{offset:.25,rootFrequency:q.root,voice:'Pulse',gate:.65,decay:3,bend:(n,r)=>40*Math.sqrt(r),weight:.7})]);
  add('squeaky_sneakers','Squeaky sneakers','y = [Sₙ + 18sin²(πr/g)]/11.4',
    'S=(0,−3,0,−3,7,−3,rest,−3), g=0.58. Clock u=1.7(x+8)+0.1sin(π(x+8)); r=frac(u). The warped clock gives uneven steps. FM ratio=2; index=1.8.',q=>{
      const layer=cells(1.7,loop([0,-3,0,-3,7,-3,null,-3]),{rootFrequency:q.root,voice:'Reed',gate:.58,decay:1.2,bend:(n,r)=>18*Math.sin(Math.PI*r/.58)**2,fm:{ratio:2,index:1.8}}),f=layer.f,e=layer.envelope;
      const warp=x=>x+.1/1.7*Math.sin(Math.PI*(x+8));layer.f=x=>f(warp(x));layer.envelope=x=>e(warp(x));return [layer];
    });
  add('hiccup_bass','Hiccup bass','y = [Hₙ + 12e^(−(r−0.28)²/0.0015)]/11.4',
    'H=(0,0,7,rest,3,0,rest,−5), rate=2, root=65.4064 Hz. A narrow octave hiccup interrupts each bass note. Amplitude has two lobes: 0.3+0.7sin²(2πr).',q=>[
      cells(2,loop([0,0,7,null,3,0,null,-5]),{rootFrequency:65.4064,voice:'Hollow',gate:.79,decay:1.1,bend:(n,r)=>12*Math.exp(-((r-.28)**2)/.0015),shape:(n,r)=>.3+.7*Math.sin(TAU*r)**2})]);
  add('slippery_whistle','Slippery whistle','y = [Wₙ + (−1)ⁿ(28r−35r³) + 0.6sin(12πr)]/11.4',
    'W=(0,7,3,12), rate=1.1, gate=0.92. Alternating cubic glides overshoot their destinations and quiver. Pure sine, root doubled.',q=>[
      cells(1.1,loop([0,7,3,12]),{rootFrequency:q.root*2,pure:true,gate:.92,decay:.1,bend:(n,r)=>(mod(n,2)?-1:1)*(28*r-35*r**3)+.6*Math.sin(6*TAU*r)})]);
  add('wrong_number','Wrong number','y₁ = Tₙ/11.4<br>y₂ = (Tₙ+7)/11.4',
    'T=(0,0,rest,rest,4,4,rest,7,rest,rest,rest,rest), rate=3.5. Two sine voices ring in paired bursts. On cells n mod 12 >= 7, ring modulation multiplies them by 173 Hz and 227 Hz sine waves. This is a toy telephone gesture, not a DTMF encoder.',q=>[0,1].map(i=>cells(3.5,n=>{const v=[0,0,null,null,4,4,null,7,null,null,null,null][mod(n,12)];return v===null?null:v+7*i},{rootFrequency:392,pure:true,gate:.72,decay:.3,ring:{frequency:i?227:173,depth:x=>mod(Math.floor(3.5*(x+8)),12)>=7?.85:0},weight:i?.65:1})));
  add('popcorn_panic','Popcorn panic','yⱼ = [Pⱼ−22r]/11.4; r=(x−tⱼ)/dⱼ',
    'Event gaps start at 1.1 and multiply by 0.88 down to 0.11; each four-unit section restarts the acceleration. Durations are 0.08 to 0.16 units. Seeded pentatonic pitches and gains; overlapping sin²-windowed chirplets.',q=>{
      const events=[];for(let block=0;block<4;block++){let u=.15,gap=1.1;while(u<3.85){events.push({x:-8+block*4+u,span:.08+.08*q.random(),note:[0,3,7,12,19][Math.floor(q.random()*5)],bend:-22,gain:.55+.45*q.random()});u+=gap;gap=Math.max(.11,gap*.88)}}
      const active=x=>events.findLast(e=>x>=e.x&&x<e.x+e.span);return [{voice:'Sine',baseFrequency:q.root/1.22,instrument:'grain',events,f:x=>{const e=active(x);return e?(e.note+e.bend*(x-e.x)/e.span)/11.4:NaN}}];
    });
  add('tiny_tuba','Tiny tuba','y = [Bₙ−5e^(−12r)+2r²sin(10πr)]/11.4',
    'B=(0,7,0,3,5,7,−5,rest), rate=1.8, root=82.4069 Hz. Scooped low notes become unstable near the end. Vivid FM ratio=1; index=0.6+2.3sin²(πr/0.85). This is a synthetic brass caricature.',q=>[
      cells(1.8,loop([0,7,0,3,5,7,-5,null]),{rootFrequency:82.4069,voice:'Reed',gate:.85,decay:.5,bend:(n,r)=>-5*Math.exp(-12*r)+2*r*r*Math.sin(5*TAU*r),fm:{ratio:1,index:x=>.6+2.3*Math.sin(Math.PI*phase(x,1.8)/.85)**2}})]);
  add('windup_wobble','Wind-up wobble','y = [Mₙ + 2r sin(16πr)]/11.4',
    'Warped clock u=8(1−exp(−v/3)), v=(x+8) mod 8. It slows toward a stop, then rewinds. M=(0,7,12,10,7,3,5,−5). Gate=0.88; decay=2.5.',q=>{
      const layer=cells(1,loop([0,7,12,10,7,3,5,-5]),{rootFrequency:q.root,voice:'Bell',gate:.88,decay:2.5,bend:(n,r)=>2*r*Math.sin(8*TAU*r)}),f=layer.f,e=layer.envelope;
      const warp=x=>-8+8*(1-Math.exp(-mod(x+8,8)/3));layer.f=x=>f(warp(x));layer.envelope=x=>e(warp(x));return [layer];
    });
  add('sneeze_machine','Sneeze machine','y = [Aₙ+24r²−32e^(−(r−0.7)²/0.004)]/11.4',
    'A=(0,3,0,7), rate=0.65, gate=0.94. A slow inhaling rise collapses into a short pitch plunge. Amplitude=0.15+0.85exp(−(r−0.72)²/0.016). FM ratio=1.73; index=0.3+4exp(−(r−0.7)²/0.012).',q=>[
      cells(.65,loop([0,3,0,7]),{rootFrequency:q.root,voice:'Reed',gate:.94,decay:0,bend:(n,r)=>24*r*r-32*Math.exp(-((r-.7)**2)/.004),shape:(n,r)=>.15+.85*Math.exp(-((r-.72)**2)/.016),fm:{ratio:1.73,index:x=>.3+4*Math.exp(-((phase(x,.65)-.7)**2)/.012)}})]);
  add('alien_gargle','Alien gargle','y = [Gₙ+4sin(2π(3r+6r²))]/11.4',
    'G=(0,rest,3,7,rest,−5), rate=1.35, gate=0.83. Audio is ring-modulated by a sine at 37+140r² Hz with depth 0.95. FM ratio=0.5; index=1.4. Vibrato and ring-modulator speed accelerate together.',q=>[
      cells(1.35,loop([0,null,3,7,null,-5]),{rootFrequency:q.root,gate:.83,decay:.5,bend:(n,r)=>4*Math.sin(TAU*(3*r+6*r*r)),fm:{ratio:.5,index:1.4},ring:{frequency:x=>37+140*phase(x,1.35)**2,depth:.95}})]);
  add('typewriter_tapdance','Typewriter tapdance','y₁ = Kₙ/11.4<br>y₂ = [20−45r]/11.4',
    'K=(0,7,3,12,7,rest,5,10,0,rest,rest,rest), rate=4. Voice 1 is a short FM click (ratio=3.7, index=3.2, gate=0.3). Voice 2 plays a carriage-return sweep only when n mod 12=10, gate=0.82.',q=>[
      cells(4,loop([0,7,3,12,7,null,5,10,0,null,null,null]),{rootFrequency:q.root,gate:.3,decay:7,fm:{ratio:3.7,index:3.2}}),
      cells(4,n=>mod(n,12)===10?20:null,{rootFrequency:q.root,voice:'Glass',gate:.82,decay:2,bend:(n,r)=>-45*r,weight:.7})]);
  const byId=new Map(entries.map(e=>[e.id,e]));
  api.generate=function(seed,options={}){
    const entry=byId.get(/^sg2-([a-z_]+)--/.exec(seed)?.[1]);if(!entry)return previousGenerate(seed,options);
    let h=2166136261;for(const c of seed)h=Math.imul(h^c.charCodeAt(0),16777619);
    const q={root:[146.8324,164.8138,196,220][(h>>>0)%4],random:()=>{h+=0x6D2B79F5;let t=Math.imul(h^(h>>>15),h|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296}};
    const layers=entry.build(q);
    return {seed,version:2,type:entry.id,name:entry.name,group:entry.group,family:entry.group.toUpperCase(),description:'',reference:entry.reference,minX:-8,maxX:8,duration:14,baseFrequency:q.root/1.22,voice:'Sine',amplitude:3,musical:true,layers,f:layers[0].f,formula:entry.formula,
      definitions:entry.definitions+' Unless specified otherwise, u=rate(x+8−offset), n=floor(u), r=frac(u); notes repeat modulo list length. Each active cell has a smooth attack and release, with exp(−decay*r) loudness. Pitch is in semitones divided by 11.4. '+layers.map((l,i)=>`Voice ${i+1}: ${l.notation||'seeded events'}`).join(' ')};
  };
  api.catalog=[...entries,...api.catalog];api.groups=[...new Set(api.catalog.map(e=>e.group))];
  api.curation.added.push(...entries.map(e=>e.id));
  if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
