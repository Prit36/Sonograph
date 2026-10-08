/* Additions are separate so the original 160-family seed mapping stays stable. */
(function(root){
  'use strict';
  const api=root.Sonograph,previousGenerate=api.generate,{mod,clamp}=api,PI=Math.PI,TAU=2*PI;
  const extra=[],fmt=x=>String(Math.round(x*1000)/1000),fract=x=>mod(x,1);
  const floorValue=x=>Math.floor(Math.abs(x-Math.round(x))<1e-12?Math.round(x):x);
  const block=x=>clamp(Math.floor(x/4)+1,0,3);
  // The video does not disclose c. This is an explicitly documented replacement.
  const melody=[0,3,7,5,3,0,3,5,7,10,8,7,5,3,0,-2,0,3,7,5,3,0,-2,0,3,5,7,5,3,0,-2,0];
  const lead=x=>2+melody[mod(Math.floor(4*x),32)]/12;
  function roll(x){const u=mod(x,4),p=u<2?1:u<3?.5:.25,k=7/p;return -1.6+5*Math.exp(-k*mod(x,p))}
  const video=(id,name,description,build)=>extra.push({id:'video_'+id,name,group:'Video reference',description,build,reference:'video-formulas.html#'+id});
  const composed=(id,name,description,build)=>extra.push({id,name,group:'New compositions',description,build,reference:'video-formulas.html#compositions'});
  const videoOptions={baseFrequency:110,voice:'Reed',amplitude:3.4};
  const indexed={...videoOptions,minX:-4,maxX:12};
  video('kick_roll','The kick roll','Video #1: exponential kicks accelerate from quarter to eighth to sixteenth spacing.',()=>[
    roll,'−1.6 + 5 e<sup>−k(x mod p)</sup>',
    '(k,p) = (7,1) when x mod 4 < 2; (14,0.5) when 2 ≤ x mod 4 < 3; (28,0.25) otherwise. The video leaves equality at 3 unspecified; this app uses the final branch.',videoOptions]);
  video('cowbell','The cowbell','Video #2: a repeating low decay and an independent stepped melody. Melody list reconstructed.',()=>[
    x=>-1.6+[0,0,-4,-2][block(x)]/12+3.6*Math.exp(-14*mod(x,2)),
    'y₁ = −1.6 + m<sub>b</sub>/12 + 3.6 e<sup>−14(x mod 2)</sup><br>y₂ = 2 + c<sub>s</sub>/12',
    'm = (0,0,−4,−2); b = ⌊x/4⌋ + 2; s = ⌊4x⌋ mod 32. The video omits c; this app substitutes the original 32-step melody listed in the reference notes. Index s is interpreted from zero. Both curves play together.',{...indexed,secondary:lead,reconstructed:true}]);
  video('quantized_sine','The quantized sine','Video #3: a two-frequency melody with quantized time and height.',()=>[
    x=>{const q=Math.floor(4*x)/4,u=1.8*Math.sin(PI*q/2)+1.2*Math.sin(3*PI*q/4)-.75;return 2+7/12*floorValue(u)},
    '2 + (7/12) ⌊u⌋','q = ⌊4x⌋/4; u = 1.8 sin(πq/2) + 1.2 sin(3πq/4) − 0.75.',videoOptions]);
  video('shapeshifter','The shapeshifter','Video #4: sawtooth ramps turn into triangles, then exponential kicks.',()=>[
    x=>{const r=fract(2*x),u=mod(x,8);return u<2?2.8*r-1.2:u<4?2.8*(1-Math.abs(2*r-1))-1.2:4.6*Math.exp(-10*r)-1.6},
    '2.8r − 1.2, u < 2<br>2.8(1 − |2r − 1|) − 1.2, 2 ≤ u < 4<br>4.6 e<sup>−10r</sup> − 1.6, u ≥ 4',
    'r = 2x − ⌊2x⌋; u = x mod 8.',videoOptions]);
  video('drum_beat','A whole drum beat','Video #5: alternating kick/snare drops and short high ticks, with genuine silent rests.',()=>[
    x=>{const r=Math.round(mod(x,1)*1e12)/1e12,j=mod(Math.floor(x),2);return r<.45?(j===0?-1.6+5*Math.exp(-9*r):.6+3*Math.exp(-25*r)):r>=.5&&r<.56?2.6:NaN},
    '−1.6 + 5 e<sup>−9r</sup>, r < 0.45 and j = 0<br>0.6 + 3 e<sup>−25r</sup>, r < 0.45 and j = 1<br>2.6, 0.5 ≤ r < 0.56',
    'r = x mod 1; j = ⌊x⌋ mod 2. The expression is undefined outside these branches: gaps are silent, not a zero-height tone.',{...videoOptions,gaps:true}]);
  video('staircase','The staircase','Video #6: quantized triangular arpeggios move through four offsets.',()=>[
    x=>1+5/12*(Math.abs(Math.floor(8*fract(x/2))-4)+[0,-1,-2,-1][block(x)]),
    '1 + (5/12)(|⌊8(x/2 − ⌊x/2⌋)⌋ − 4| + c<sub>b</sub>)',
    'c = (0,−1,−2,−1); b = ⌊x/4⌋ + 2. Lists use one-based b. The right endpoint holds the fourth block.',indexed]);
  video('saturation','Saturation','Video #7: an arctangent sine grows progressively more square through four stages.',()=>[
    x=>{const s=[.5,2,8,40][block(x)];return -.5+1.5*Math.atan(s*Math.sin(4*PI*x))/Math.atan(s)},
    '−0.5 + 1.5 arctan(s<sub>b</sub> sin(4πx)) / arctan(s<sub>b</sub>)',
    's = (0.5,2,8,40); b = ⌊x/4⌋ + 2. Lists use one-based b. The right endpoint holds the fourth block.',indexed]);
  video('fractal','The fractal','Video #8: each block adds a finer scale to a finite Weierstrass-type texture.',()=>[
    x=>{let y=0;for(let k=0;k<=[1,2,3,4][block(x)];k++)y+=.55**k*Math.cos(3**k*PI*x/2);return 1+.75*y},
    '1 + 0.75 Σ<sub>k=0…Nᵦ</sub> 0.55<sup>k</sup> cos(3<sup>k</sup>πx/2)',
    'N = (1,2,3,4); b = ⌊x/4⌋ + 2. The upper summation limit is inclusive. This finite series is not an infinite fractal.',indexed]);
  video('chirp','The chirp','Video #9: a quantized quadratic chirp grows in density and step range.',()=>[
    x=>{const p=x+8;return 1+5/12*(floorValue((1+p/8)*Math.sin(PI*p*p/4))+1)},
    '1 + (5/12)(⌊(1 + p/8) sin(πp²/4)⌋ + 1)','p = x + 8.',videoOptions]);
  video('final_boss','The final boss','Video #10: accelerating kicks and the cowbell melody run as two simultaneous voices. Melody reconstructed.',()=>[
    x=>roll(x)+[0,0,-4,-2][block(x)]/12,
    'y₁ = −1.6 + m<sub>b</sub>/12 + 5 e<sup>−k(x mod p)</sup><br>y₂ = 2 + c<sub>s</sub>/12',
    'k and p follow The kick roll; m, b, c, and s follow The cowbell. The missing c list uses our disclosed replacement. Both curves play together.',{...indexed,secondary:lead,reconstructed:true}]);

  composed('swing_kicks','Swing kick pair','Long-short pairs of exponential drops give the curve a swinging pulse.',q=>[
    x=>{const r=mod(x,q.p),t=r<.65*q.p?r:r-.65*q.p;return -1.5+q.a*1.5*Math.exp(-8*t)},
    `−1.5 + ${fmt(q.a*1.5)} e<sup>−8t</sup>`,`r = x mod ${fmt(q.p)}; t = r for r < ${fmt(.65*q.p)}, otherwise t = r − ${fmt(.65*q.p)}.`]);
  composed('ratchet_bursts','Ratchet bursts','One, two, four, then eight short pulses repeat within successive blocks.',q=>[
    x=>{const n=2**mod(Math.floor((x+8)/2),4),r=mod(x+8,2/n);return -1.5+q.a*1.5*Math.exp(-5*n*r)},
    `−1.5 + ${fmt(q.a*1.5)} e<sup>−5nr</sup>`,'n = 2^(⌊(x+8)/2⌋ mod 4); r = (x+8) mod (2/n).']);
  composed('polymeter','Three against five','Pulse trains with three and five hits interfere in a repeating polyrhythm.',q=>[
    x=>-1.5+q.a*(Math.exp(-9*mod(3*(x+8)/4,1))+.7*Math.exp(-9*mod(5*(x+8)/4,1))),
    `−1.5 + ${fmt(q.a)}(e<sup>−9(3(x+8)/4 mod 1)</sup> + 0.7 e<sup>−9(5(x+8)/4 mod 1)</sup>)`,'Two exponential pulse trains are added; neither changes the other’s period.']);
  composed('log_ripple','Log-periodic ripple','Oscillations bunch around a movable center on a logarithmic scale.',q=>[
    x=>q.a*Math.sin(q.b*7*Math.log(1+Math.abs(x-q.h))),
    `${fmt(q.a)} sin(${fmt(q.b*7)} ln(1 + |x − ${fmt(q.h)}|))`,'The added 1 keeps the logarithm finite at the center.']);
  composed('bezier_ribbon','Bézier ribbon','Repeated cubic Bézier segments rise and dip with asymmetric control heights.',q=>{
    const p1=q.a,p2=-q.a*q.w;return[x=>{const u=fract((x+8)/q.p);return 3*(1-u)**2*u*p1+3*(1-u)*u*u*p2},
      `3(1−u)²u(${fmt(p1)}) + 3(1−u)u²(${fmt(p2)})`,`u = frac((x+8)/${fmt(q.p)}). Endpoint heights are both zero; the two interior control heights are ${fmt(p1)} and ${fmt(p2)}.`]});
  composed('hermite_glide','Hermite glide steps','Cubic smoothstep joins a repeating four-note contour without pitch jumps.',q=>{
    const notes=[-q.a,0,q.a,q.a/3];return[x=>{const u=(x+8)/q.p,n=Math.floor(u),s=fract(u),h=s*s*(3-2*s);return notes[mod(n,4)]*(1-h)+notes[mod(n+1,4)]*h},
      '(1−h) v<sub>n mod 4</sub> + h v<sub>(n+1) mod 4</sub>',`v = (${notes.map(fmt).join(', ')}); u = (x+8)/${fmt(q.p)}; n = ⌊u⌋; s = frac(u); h = s²(3−2s).` ]});
  composed('raised_gate','Raised-cosine packets','Separated sine packets open and close with rounded cosine edges.',q=>[
    x=>{const u=fract((x+8)/q.p);return u<.6?q.a*(1-Math.cos(TAU*u/.6))/2*Math.sin(q.b*6*x):0},
    `${fmt(q.a)}(1−cos(2πu/0.6)) sin(${fmt(q.b*6)}x)/2, u < 0.6<br>0, otherwise`,`u = frac((x+8)/${fmt(q.p)}). Zero is a defined height here, not a silent rest.`]);
  composed('rational_fm','Rational phase bend','A bounded rational phase warp alternately squeezes and relaxes a sine.',q=>[
    x=>q.a*Math.sin(q.b*x+q.c*x/(1+x*x)),`${fmt(q.a)} sin(${fmt(q.b)}x + ${fmt(q.c)}x/(1+x²))`,'The rational warp is finite for every real x.']);
  composed('reset_gliss','Resetting glissando','Each repeated cell sweeps faster before starting over.',q=>[
    x=>{const r=mod(x+8,q.p);return q.a*Math.sin(q.b*r+q.c*r*r)},
    `${fmt(q.a)} sin(${fmt(q.b)}r + ${fmt(q.c)}r²)`,`r = (x+8) mod ${fmt(q.p)}.`]);
  composed('crossfade_morph','Sine-to-triangle morph','A slow crossfade reshapes rounded lobes into angular triangles.',q=>[
    x=>{const m=(1+Math.sin(q.d*x/2))/2,u=q.b*x/TAU,t=1-4*Math.abs(fract(u)-.5);return q.a*((1-m)*Math.sin(q.b*x)+m*t)},
    `${fmt(q.a)}((1−m) sin(${fmt(q.b)}x) + m tri(${fmt(q.b)}x/2π))`,`m = (1+sin(${fmt(q.d/2)}x))/2; tri(u) = 1−4|frac(u)−½|.`]);
  composed('palindrome_pulses','Palindrome pulse code','A mirrored eight-cell rhythm alternates high and low decay shapes.',q=>{
    const code=[1,0,1,1,1,1,0,1];return[x=>{const u=(x+8)*2,n=mod(Math.floor(u),8),r=fract(u);return -1.4+(code[n]?q.a*1.5:q.a*.45)*Math.exp(-q.c*2*r)},
      `−1.4 + ${fmt(q.a)}(0.45 + 1.05 c<sub>n</sub>) e<sup>−${fmt(q.c*2)}r</sup>`,'u = 2(x+8); n = ⌊u⌋ mod 8; r = frac(u); c = (1,0,1,1,1,1,0,1), indexed from zero.']});
  composed('pendulum_phase','Pendulum phase warp','A bounded arctangent phase modulation creates alternating tight and broad curls.',q=>[
    x=>q.a*Math.sin(q.b*x+2*Math.atan(q.c*Math.sin(q.d*x))),
    `${fmt(q.a)} sin(${fmt(q.b)}x + 2 arctan(${fmt(q.c)} sin(${fmt(q.d)}x)))`,'This is an original phase composition, not a numerical solution of a physical pendulum.']);

  const byId=new Map(extra.map(entry=>[entry.id,entry]));
  function random(seed){let h=2166136261;for(const char of seed)h=Math.imul(h^char.charCodeAt(0),16777619);return()=>{h+=0x6D2B79F5;let t=Math.imul(h^(h>>>15),h|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296}}
  api.generate=function(seed,options={}){
    const id=/^sg2-([a-z_]+)--/.exec(seed)?.[1],entry=byId.get(id);
    if(!entry)return previousGenerate(seed,options);
    const r=random('sonograph-additions:'+seed),q={a:2.1+r(),b:.8+2.4*r(),c:2+3.5*r(),d:.4+2.1*r(),h:.1+r(),w:.25+.45*r(),p:[2,2.5,3,4][Math.floor(r()*4)]};
    // Use the displayed coefficients exactly for these original compositions.
    for(const key of Object.keys(q))q[key]=Number(fmt(q[key]));
    const [f,formula,definitions='',settings={}]=entry.build(q);
    const pattern={seed,version:2,type:entry.id,name:entry.name,group:entry.group,family:entry.group.toUpperCase(),description:entry.description,reference:entry.reference,definitions,formula,f,minX:-8,maxX:8,duration:14,baseFrequency:110,voice:'Reed',amplitude:q.a,...settings};
    if(settings.secondary)pattern.layers=[{f,voice:'Pulse',baseFrequency:110},{f:settings.secondary,voice:'Bell',baseFrequency:110}];
    return pattern;
  };
  api.catalog=[...api.catalog,...extra];api.groups=[...api.groups,'Video reference','New compositions'];
  if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
