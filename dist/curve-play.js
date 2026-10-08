/* Original pitch curves. The displayed functions also drive synthesis. */
(function(root){
  'use strict';
  const api=root.Sonograph,previousGenerate=api.generate,{mod,clamp}=api,TAU=2*Math.PI;
  const entries=[
    {id:'jelly_gears',name:'Jelly gears',formula:'y = [Mₙ + 7Bₐ(r)sin(πr)]/11.4<br>Bₐ(r) = (1−a²)sin(2πr)/(1+a²−2a cos(2πr))'},
    {id:'modulo_mischief',name:'Modulo mischief',formula:'ρₙ = (n+1)² mod 17; Pₙ = Q<sub>⌊8ρₙ/17⌋</sub>−12+12⌊n/17⌋<br>y₁ = [Pₙ+9sin(3πr)e^(−4r)]/11.4'},
    {id:'divisor_dance',name:'Divisor dance',formula:'Hₙ(r) = [Σ<sub>d∣n, d≤6</sub> sin(2πdr)/d]/[Σ<sub>d∣n, d≤6</sub> 1/d]<br>y₁ = [Pₙ+4Hₙ(r)]/11.4'}
  ].map(e=>({...e,group:'New compositions',description:'',discoveryWeight:6,reference:'listening-notes.html#'+e.id}));
  const byId=new Map(entries.map(e=>[e.id,e]));
  function hash(seed){let h=2166136261;for(const c of seed)h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0}
  function cells(rate,notes,{offset=0,gate=.82,decay=1.8,bend=()=>0,weight=1,voice='Triangle',fm,pure=false,gain=()=>1}={}){
    const state=x=>{const u=(x+8-offset)*rate,n=Math.floor(u),r=mod(u,1),note=u>=0&&x<7.9?notes(n):null;return {n,r,note,on:note!==null&&r<gate}};
    return {voice,weight,pure,fm,gaps:true,
      f:x=>{const s=state(x);return s.on?(s.note+bend(s.n,s.r))/11.4:NaN},
      envelope:x=>{const s=state(x);return s.on?clamp((7.9-x)/.12,0,1)*gain(s.n)*Math.min(1,s.r/.055)*Math.exp(-decay*s.r)*clamp((gate-s.r)/.09,0,1):0},
      curveClock:{rate,offset,gate,decay},state};
  }
  api.generate=function(seed,options={}){
    const e=byId.get(/^sg2-([a-z_]+)--/.exec(seed)?.[1]);if(!e)return previousGenerate(seed,options);
    const h=hash(seed),hz=[146.8324,164.8138,196][h%3],layers=[],major=[0,2,4,7,9],minor=[0,3,5,7,10];let definitions;
    if(e.id==='jelly_gears'){
      const a=.48+(h%9)*.015,motif=[-12,-5,0,-3,-8,-5,2,-12],B=r=>(1-a*a)*Math.sin(TAU*r)/(1+a*a-2*a*Math.cos(TAU*r));
      layers.push(cells(1.5,n=>motif[n%8]+(n>=16&&n<20?12:0),{gate:.91,decay:1.1,voice:'Reed',bend:(n,r)=>7*B(r)*Math.sin(Math.PI*r),fm:{ratio:1,index:x=>.35+1.15*Math.sin(Math.PI*mod((x+8)*1.5,1))**2}}));
      layers.push(cells(1.5,n=>n>=8&&n%4===3?motif[n%8]+7:null,{offset:.22,gate:.6,decay:2.5,voice:'Glass',weight:.38,bend:(n,r)=>-3*Math.sin(Math.PI*r)}));
      definitions=`n=⌊1.5(x+8)⌋; r=frac(1.5(x+8)); a=${a.toFixed(3)}; M=(${motif.join(', ')}), repeated every eight cells. Cells 16…19 raise M by 12 semitones. B is the sine component of the unit-circle map (z−a)/(1−az), z=exp(2πir); its nonuniform phase creates an asymmetric elastic curve. The lead uses gate 0.91, decay 1.1 and harmonic FM ratio 1 with index 0.35+1.15sin²(πr). A glass reply enters after eight cells on n mod 4=3: clock offset 0.22 graph units, pitch Mₙ+7−3sin(πr), gate 0.6, decay 2.5, weight 0.38. The shifted reply uses its own n and r. No percussion layer.`;
    }else if(e.id==='modulo_mischief'){
      const Q=[0,2,4,7,9,12,14,16],residue=n=>mod((n+1)**2,17),P=n=>Q[Math.floor(8*residue(n)/17)]-12+12*Math.floor(n/17);
      layers.push(cells(2.125,n=>P(n),{gate:.74,decay:2,voice:'Pulse',bend:(n,r)=>9*Math.sin(3*Math.PI*r)*Math.exp(-4*r),gain:n=>n%4===0?1:.78}));
      layers.push(cells(2.125,n=>residue(n)<=4?P(n)+12:null,{offset:.16,gate:.47,decay:3,voice:'Bell',weight:.4,bend:(n,r)=>-2*r}));
      definitions=`u=2.125(x+8); n=⌊u⌋; r=frac(u); Q=(${Q.join(', ')}), indexed from zero. The 17-cell quadratic-residue cycle plays twice in the scan, with the second cycle one octave higher. A decaying three-half-wave pitch curl rounds each chip-like attack; gate 0.74 and decay 2 leave real rests. Every fourth lead attack has full gain, others 0.78. Voice 2 is a bell reply only where ρₙ≤4: clock offset 0.16 graph units; y₂=(Pₙ+12−2r)/11.4, gate 0.47, decay 3 and weight 0.4. The reply uses its own shifted n and r. The note table constrains the arithmetic to a major-pentatonic register rather than raw modulo frequencies.`;
    }else{
      const divisors=Array.from({length:34},(_,j)=>{const n=j+1;return Array.from({length:6},(_,i)=>i+1).filter(d=>n%d===0)}),tau=n=>{let k=0;for(let d=1;d<=n;d++)if(n%d===0)k++;return k},P=j=>minor[(tau(j+1)-1)%5]+12*(Math.floor(j/8)%2)-12;
      const H=(j,r)=>{const ds=divisors[j];return ds.reduce((v,d)=>v+Math.sin(TAU*d*r)/d,0)/ds.reduce((v,d)=>v+1/d,0)};
      layers.push(cells(2,j=>P(j),{gate:.88,decay:1.3,voice:'Hollow',bend:(j,r)=>4*H(j,r),gain:j=>(j+1)%4===0?1:.82}));
      layers.push(cells(2,j=>(j+1)%4===0?minor[(tau(j+1)-1)%5]-24:null,{gate:.62,decay:3,voice:'Triangle',weight:.46,bend:(j,r)=>3*Math.exp(-16*r)}));
      definitions=`n=⌊2(x+8)⌋+1; r=frac(2(x+8)); τ(n) counts all positive divisors of n; S=(${minor.join(', ')}). Pₙ=S[(τ(n)−1) mod 5]+12(⌊(n−1)/8⌋ mod 2)−12. Each cell adds a normalized sum of only those harmonics 1…6 that divide n, giving primes a smooth shape and composites finer internal ripples. The normalization keeps |H|≤1. Lead gate 0.88, decay 1.3; multiples of four have gain 1, other cells 0.82. On n mod 4=0, a low triangular voice answers at y₂=[S[(τ(n)−1) mod 5]−24+3exp(−16r)]/11.4; gate 0.62, decay 3, weight 0.46. Eight-cell blocks alternate register, while divisor structure changes the internal wiggle.`;
    }
    for(const l of layers)l.baseFrequency=hz/1.22;
    return {seed,version:2,type:e.id,name:e.name,group:e.group,family:'NEW COMPOSITIONS',description:'',reference:e.reference,minX:-8,maxX:8,plotYLimit:e.id==='jelly_gears'?1.6:2.4,duration:14,baseFrequency:hz/1.22,voice:layers[0].voice,musical:true,layers,f:layers[0].f,formula:e.formula,definitions:definitions+` Root=${hz.toFixed(4)} Hz. In Vivid, pitch f=root·2^(11.4y/12); the displayed curve directly controls pitch, including every bend. Each active cell has envelope min(1,r/0.055)exp(−decay·r)clamp((gate−r)/0.09,0,1), multiplied by its stated gain. Undefined intervals are silent rests. A final amplitude fade starts at x=7.78 and all voices stop at x=7.9. Seed changes select key; Jelly gears also varies a. Both scan speeds traverse the same functions. Original uses the existing legacy pitch mapping.`};
  };
  api.catalog=[...entries,...api.catalog];api.groups=[...new Set(api.catalog.map(e=>e.group))];api.curation.added.push(...entries.map(e=>e.id));
  if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
