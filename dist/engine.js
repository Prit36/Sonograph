/* Versioned, deterministic equations. No eval, dependencies, or network access. */
(function(root){
  'use strict';
  const mod=(x,n)=>((x%n)+n)%n;
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  function random(seed){let h=2166136261;for(let i=0;i<seed.length;i++){h=Math.imul(h^seed.charCodeAt(i),16777619)}return()=>{h+=0x6D2B79F5;let t=h;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296}}
  function generate(seed){
    const r=random('sonograph-v1:'+seed),pick=a=>a[Math.floor(r()*a.length)],decimal=(lo,hi)=>Math.round((lo+(hi-lo)*r())*10)/10;
    const type=pick(['nested','pulse','chirp','fold','steps','ripple','tangent']);
    const a=decimal(2.1,3.2),b=decimal(1.2,3.8),c=decimal(2.1,4.8),d=decimal(2.2,4.6),p=pick([2,3,4,5]);
    let f,formula,name,family;
    if(type==='nested'){f=x=>a*Math.sin(d*Math.sin(c*Math.sin(b*x)));formula=`${a} sin(${d} sin(${c} sin(${b}x)))`;name='Nested oscillation';family='SINE COMPOSITION'}
    if(type==='pulse'){f=x=>a*2*Math.exp(-b*mod(x,p))*(1-(2*mod(x,1)-1)**2)-1.7;formula=`${a*2} e<sup>−${b}(x mod ${p})</sup> (1 − (2(x mod 1) − 1)<sup>2</sup>) − 1.7`;name='Decaying pulses';family='EXPONENTIAL × PARABOLA'}
    if(type==='chirp'){f=x=>a*Math.sin(x*x/b);formula=`${a} sin(x<sup>2</sup> / ${b})`;name='Quadratic chirp';family='SINE × QUADRATIC'}
    if(type==='fold'){f=x=>a*(1-4*Math.abs(mod(b*x,1)-.5))+.4*Math.sin(c*x);formula=`${a}(1 − 4|(${b}x mod 1) − ½|) + 0.4 sin(${c}x)`;name='Folded harmonics';family='TRIANGLE + SINE'}
    if(type==='steps'){f=x=>mod(x,p)<p*.4?a*Math.sin(b*x):a*(2*mod(c*x,1)-1);formula=`${a} sin(${b}x), if x mod ${p} < ${p*.4}<br>${a}(2(${c}x mod 1) − 1), otherwise`;name='Switched rhythms';family='PIECEWISE FUNCTION'}
    if(type==='ripple'){f=x=>a*2*Math.exp(-b*mod(x,p))-2+.4*Math.sin(8*c*x);formula=`${a*2} e<sup>−${b}(x mod ${p})</sup> − 2 + 0.4 sin(${Math.round(8*c*10)/10}x)`;name='Rippling decay';family='EXPONENTIAL + SINE'}
    if(type==='tangent'){f=x=>Math.tan(x*x/(b+1));formula=`tan(x<sup>2</sup> / ${Math.round((b+1)*10)/10})`;name='Tangent fields';family='TANGENT × QUADRATIC'}
    // Format computed decimal coefficients without binary floating-point artifacts.
    formula=formula.replace(/\d+\.\d{6,}/g,s=>String(Math.round(Number(s)*10)/10));
    return {seed,type,name,family,formula,f,minX:-8,maxX:8,duration:14,baseFrequency:pick([110,130.8128,146.8324,164.8138])};
  }
  // The trace controls pitch; a fixed sample rate makes the sequence repeatable.
  function synthesize(pattern,sampleRate=48000){
    const length=Math.round(pattern.duration*sampleRate),data=new Float32Array(length);let phase=0,smoothed=0;
    for(let i=0;i<length;i++){
      const t=i/sampleRate,x=pattern.minX+(pattern.maxX-pattern.minX)*t/pattern.duration;
      const raw=pattern.f(x),y=Number.isFinite(raw)?clamp(raw,-4,4):0;
      smoothed+=(y-smoothed)*.025;
      const frequency=pattern.baseFrequency*Math.pow(2,smoothed*.52);
      phase=mod(phase+2*Math.PI*frequency/sampleRate,2*Math.PI);
      const fade=Math.min(1,t/.025,(pattern.duration-t)/.04);
      data[i]=(Math.sin(phase)+.17*Math.sin(2*phase)+.055*Math.sin(3*phase))*.65*Math.max(0,fade);
    }return data;
  }
  root.Sonograph={generate,synthesize,clamp,mod};
  if(typeof module!=='undefined')module.exports=root.Sonograph;
})(typeof window==='undefined'?globalThis:window);
