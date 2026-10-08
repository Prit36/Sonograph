/* Unbroken pitch functions with continuous amplitude and timbre controls. */
(function(root){
  'use strict';
  const api=root.Sonograph,previousGenerate=api.generate,{mod,clamp}=api,TAU=2*Math.PI;
  const entries=[
    {id:'marshmallow_motor',name:'Marshmallow motor',formula:'y = [−2.5+9.5A+3sin(3θ)(1−A²)]/11.4<br>A = (sinθ+a sin(3θ))/√(1+a²+2a cos(2θ))'},
    {id:'ribbon_racer',name:'Ribbon racer',formula:'y = [(1−S)Mₙ+SMₙ₊₁+3sin(2πr)sin²(πr)]/11.4<br>S = 6v⁵−15v⁴+10v³; v = clamp((r−0.55)/0.45,0,1)'},
    {id:'taffy_tornado',name:'Taffy tornado',formula:'y = [2+8sin(φ+βsin(2φ))+4sin(5φ)/(2+cosφ)]/11.4<br>φ = 2π[6t+0.16sin(4πt)]'}
  ].map(e=>({...e,group:'New compositions',description:'',discoveryWeight:6,reference:'listening-notes.html#'+e.id}));
  const byId=new Map(entries.map(e=>[e.id,e]));
  function hash(seed){let h=2166136261;for(const c of seed)h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0}
  const ease=v=>v*v*v*(10+v*(-15+6*v));
  api.generate=function(seed,options={}){
    const e=byId.get(/^sg2-([a-z_]+)--/.exec(seed)?.[1]);if(!e)return previousGenerate(seed,options);
    const h=hash(seed),hz=[146.8324,164.8138,174.6141][h%3];let f,envelope,voice,fm,pure=false,definitions,plotYLimit;
    if(e.id==='marshmallow_motor'){
      const a0=.42+(h%7)*.025,theta=x=>{const u=(x+8)/2;return TAU*u+.28*Math.sin(2*TAU*u)},A=x=>{const p=theta(x),a=a0+.12*Math.sin(TAU*(x+8)/16);return (Math.sin(p)+a*Math.sin(3*p))/Math.sqrt(1+a*a+2*a*Math.cos(2*p))};
      f=x=>{const a=A(x);return (-2.5+9.5*a+3*Math.sin(3*theta(x))*(1-a*a))/11.4};
      envelope=x=>.4+.6*((1+Math.cos(2*theta(x)))/2)**3;
      voice='Reed';fm={ratio:1,index:x=>.3+.8*(1-A(x)**2)};plotYLimit=1.45;
      definitions=`t=(x+8)/16; u=(x+8)/2; θ=2πu+0.28sin(4πu); a=${a0.toFixed(3)}+0.12sin(2πt). A is the imaginary component of the normalized vector sum exp(iθ)+a exp(3iθ). Its rotating harmonics fold each arch into rounded shoulders; changing a gently reshapes those shoulders across the scan. Because a is below 0.7, the normalizing denominator stays above 0.3 and cannot create a break. The large arch reaches pitch anchors −12 and +7 semitones, separated by an octave and a fifth; an additional third-harmonic curl opens between them. Eight cycles cross the graph. Loudness E=0.4+0.6[(1+cos(2θ))/2]³ creates rounded accents and never reaches silence. Harmonic FM ratio 1 uses index 0.3+0.8(1−A²), opening the reed-like sound during bends. All pitch and timbre functions are smooth, with no clipped plateaus or step boundaries.`;
    }else if(e.id==='ribbon_racer'){
      const M=[-12,-5,0,7,4,2,0,-5,-8,-3,4,9,7,4,2,-12],state=x=>{const u=2*(x+8);return {n:Math.floor(u),r:mod(u,1)}};
      f=x=>{const {n,r}=state(x),s=ease(clamp((r-.55)/.45,0,1));return ((1-s)*M[mod(n,16)]+s*M[mod(n+1,16)]+3*Math.sin(TAU*r)*Math.sin(Math.PI*r)**2)/11.4};
      envelope=x=>{const {r}=state(x);return .3+.7*((1+Math.cos(TAU*r))/2)**3};
      voice='Sine';pure=true;plotYLimit=1.4;
      definitions=`u=2(x+8); n=⌊u⌋; r=frac(u); M=(${M.join(', ')}), indexed modulo 16. A major-pentatonic phrase runs twice across the graph. Each cell holds its starting note through r=0.55, then slides into the next using a quintic interpolant. S has zero first and second derivatives at both ends; the additional pitch curl and its first two derivatives also vanish at the cell boundaries. Consequently y, y′ and y″ match across every join, including the motif repeat. The line has no jumps or missing intervals. Loudness E=0.3+0.7[(1+cos(2πr))/2]³ stays positive and smooth across cell joins. A pure sine gives the connected scoops a slide-whistle character. The final point returns to the opening tonic.`;
    }else{
      const beta=.25+(h%7)*.025,phase=x=>{const t=(x+8)/16;return TAU*(6*t+.16*Math.sin(2*TAU*t))},B=x=>beta+.12*Math.sin(TAU*(x+8)/16);
      f=x=>{const p=phase(x);return (2+8*Math.sin(p+B(x)*Math.sin(2*p))+4*Math.sin(5*p)/(2+Math.cos(p)))/11.4};
      envelope=x=>.38+.62*((1+Math.cos(2*phase(x)+Math.PI/3))/2)**2;
      voice='Hollow';plotYLimit=1.6;
      definitions=`t=(x+8)/16; β=${beta.toFixed(3)}+0.12sin(2πt). Six broad waves carry nested phase bends and a fivefold rational ripple. The denominator 2+cosφ is at least 1, so the ripple cannot create poles, breaks or clipped asymptotes. The phase clock remains increasing: d[6t+0.16sin(4πt)]/dt≥6−0.64π>0. The slowly changing phase depth reshapes the middle of the scan before returning home. Loudness E=0.38+0.62[(1+cos(2φ+π/3))/2]² adds rounded, offset accents without silence. The hollow harmonic voice keeps the lower swoops warm and the smaller ripples audible. The pitch is one analytic function, with no note gates or discrete pitch table.`;
    }
    const layer={f,envelope,voice,pure,fm,baseFrequency:hz/1.22};
    return {seed,version:2,type:e.id,name:e.name,group:e.group,family:'NEW COMPOSITIONS',description:'',reference:e.reference,minX:-8,maxX:8,duration:14,plotYLimit,baseFrequency:hz/1.22,voice,musical:true,continuous:true,layers:[layer],f,formula:e.formula,definitions:definitions+` Root=${hz.toFixed(4)} Hz. Vivid uses pitch f=root·2^(11.4y/12), so the entire unbroken graph, including every ripple, drives the audible pitch. The amplitude stays positive throughout the interior; only the transport's short start and end fades reach silence. There is one voice and no backing drum track. Seed selects the key and the stated shape parameter where applicable. Both scan speeds traverse the same curve. Original keeps its existing pitch mapping and voice synthesis.`};
  };
  api.catalog=[...entries,...api.catalog];api.groups=[...new Set(api.catalog.map(e=>e.group))];api.curation.added.push(...entries.map(e=>e.id));
  if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
