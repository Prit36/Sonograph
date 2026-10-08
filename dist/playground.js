/* Musical constructions: pitch curves plus explicit note articulation.
   Research and curation decisions: listening-notes.html. */
(function(root){
  'use strict';
  const api=root.Sonograph,previousGenerate=api.generate,{mod,clamp}=api,TAU=2*Math.PI;
  const pitch=note=>note/11.4,fract=x=>mod(x,1),fmt=x=>String(Math.round(x*1000)/1000);
  function random(seed){let h=2166136261;for(let i=0;i<seed.length;i++)h=Math.imul(h^seed.charCodeAt(i),16777619);return()=>{h+=0x6D2B79F5;let t=Math.imul(h^(h>>>15),h|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296}}
  function seq(notes,rate,options={}){
    const {offset=0,gate=.8,decay=2,voice='Bell',rootFrequency=164.8138}=options;
    const state=x=>{const u=(x+8-offset)*rate,n=Math.floor(u),r=fract(u),note=typeof notes==='function'?notes(n):notes[mod(n,notes.length)];return {n,r,note,active:u>=0&&note!==null&&r<gate}};
    return {voice,baseFrequency:rootFrequency/1.22,...options,
      f:x=>{const s=state(x);return s.active?pitch(s.note):NaN},
      envelope:x=>{const s=state(x);return s.active?Math.min(1,s.r/.045)*Math.exp(-decay*s.r)*clamp((gate-s.r)/.055,0,1):0},
      notation:`n = ⌊${fmt(rate)}(x+8−${fmt(offset)})⌋; r = frac(${fmt(rate)}(x+8−${fmt(offset)})); gate = ${fmt(gate)}; decay = ${fmt(decay)}; notes = ${Array.isArray(notes)?'('+notes.map(v=>v===null?'rest':fmt(v)).join(', ')+')':'the stated rule'}`};
  }
  function eventTrack(events,options={}){
    const at=x=>{let lo=0,hi=events.length-1,found=-1;while(lo<=hi){const mid=(lo+hi)>>1;if(events[mid].x<=x){found=mid;lo=mid+1}else hi=mid-1}const e=events[found];return e&&x<e.x+e.span?e:null};
    return {voice:'Glass',baseFrequency:164.8138/1.22,events,...options,
      f:x=>{const e=at(x);return e?pitch(e.note+(e.bend||0)*(x-e.x)/e.span):NaN},
      envelope:x=>{const e=at(x);if(!e)return 0;const r=(x-e.x)/e.span;return (e.gain??1)*Math.min(1,r/.06)*Math.exp(-3*r)*clamp((1-r)/.08,0,1)}};
  }
  const entries=[];
  function add(id,name,group,description,build){entries.push({id,name,group,description,build,reference:'listening-notes.html#'+id,discoveryWeight:4})}
  const notesText=layers=>layers.map((layer,i)=>`Voice ${i+1}: ${layer.notation||'event positions and pitches are deterministic from the seed.'}`).join(' ');
  const make=(layers,rule,details='')=>({layers,f:layers[0].f,formula:rule,definitions:details+' '+notesText(layers)});

  add('phase_marimbas','Phase marimbas','Melody games','Two bright pentatonic phrases drift apart, creating new accents as they meet again.',q=>{
    const motif=[q.scale[0],q.scale[2],q.scale[4],q.scale[1]+12,q.scale[3],q.scale[2]];
    return make([seq(motif,2.4,{rootFrequency:q.root,gate:.72,decay:3.4}),seq(motif,2.52,{rootFrequency:q.root,voice:'Glass',gate:.72,decay:3.4,weight:.8})],
      'y₁ = M<sub>⌊2.4(x+8)⌋ mod 6</sub>/11.4<br>y₂ = M<sub>⌊2.52(x+8)⌋ mod 6</sub>/11.4',
      'An original six-note motif uses two clocks, 5% apart. Inspired by phase processes, not a transcription of Piano Phase.');
  });
  add('hocket_hop','Hocket hop','Melody games','Low and high voices trade alternate notes; together they form one skipping melody.',q=>{
    const motif=[0,7,3,10,5,12,7,15],notes=motif.map(n=>n+q.transpose);
    return make([seq(n=>mod(n,2)===0?notes[mod(n,8)]:null,3.2,{rootFrequency:q.root,voice:'Hollow',gate:.7}),seq(n=>mod(n,2)===1?notes[mod(n,8)]:null,3.2,{rootFrequency:q.root,voice:'Glass',gate:.7})],
      'y₁ = H<sub>n mod 8</sub>/11.4, n even<br>y₂ = H<sub>n mod 8</sub>/11.4, n odd',`n = ⌊3.2(x+8)⌋; H = (${notes.join(', ')}). Each voice rests while the other plays.`);
  });
  add('pendulum_bells','Pendulum bells','Sound toys','Three ringing notes swing on independent clocks, occasionally landing together.',q=>{
    const layers=[0,7,12].map((note,i)=>seq([note,note+q.scale[2]],1.05+i*.31,{offset:i*.13,rootFrequency:q.root,gate:.94,decay:1.9,voice:i===1?'Glass':'Bell',weight:i===0?1:.7}));
    return make(layers,'yᵢ = (Bᵢ + A<sub>nᵢ mod 2</sub>)/11.4',`B = (0,7,12); A = (0,${q.scale[2]}); clock rates = (1.05,1.36,1.67). The independent periods create coincidences without a drum loop.`);
  });
  add('bouncing_notes','Bouncing notes','Sound toys','A bright ball drops, rebounds faster and softer, then starts a new bounce sequence.',q=>{
    const events=[];for(let cycle=0;cycle<2;cycle++)for(let k=0;k<12;k++){const time=8*(1-.78**k)/(1-.78**12),next=8*(1-.78**(k+1))/(1-.78**12);events.push({x:-8+cycle*8+time,span:(next-time)*.85,note:q.scale[k%5]+12-2*Math.floor(k/5),gain:.91**k})}
    return make([eventTrack(events,{rootFrequency:q.root,baseFrequency:q.root/1.22})],
      'tₖ = 8(1−0.78ᵏ)/(1−0.78¹²)<br>y = P<sub>k</sub>/11.4, tₖ ≤ u < tₖ₊₁',`u = (x+8) mod 8; k = 0…11; Pₖ = scale[k mod 5] + 12 − 2⌊k/5⌋; scale = (${q.scale.join(', ')}). Attack strength is 0.91ᵏ; each note occupies 85% of its bounce interval.`);
  });
  add('string_waterfall','String waterfall','Melody games','Real plucked-string echoes cascade up and down a pentatonic staircase.',q=>{
    const melody=[0,3,7,10,12,15,19,22,19,15,12,10,7,3,0,-5].map(n=>n+q.transpose);
    const layers=[0,1].map(voice=>{const events=Array.from({length:40},(_,i)=>({x:-8+i*.4+voice*.17,span:.72,note:melody[mod(voice?15-i:i,16)]-(voice?12:0),gain:voice?.62:1})).filter(e=>e.x<8);return eventTrack(events,{instrument:'pluck',voice:'Triangle',baseFrequency:q.root/1.22,weight:voice?.7:1})});
    return make(layers,'y₁ = W<sub>n mod 16</sub>/11.4<br>y₂ = (W<sub>(15−n) mod 16</sub>−12)/11.4',`W = (${melody.join(', ')}); attacks are 0.4 graph units apart; voice 2 enters 0.17 units later. Vivid uses a seeded noise excitation and filtered feedback delay for each pluck, rather than applying a string label to a sine tone.`);
  });
  add('robot_vowels','Robot vowels','Sound toys','A low melody opens into bright, vowel-like FM squawks and closes again.',q=>{
    const layer=seq([0,0,7,3,10,7,3,-2],2,{rootFrequency:q.root/2,voice:'Reed',gate:.88,decay:1.4,fm:{ratio:x=>1+.5*(1+Math.sin((x+8)*Math.PI/2)),index:x=>1+3*fract((x+8)/2)}});
    return make([layer],'y = R<sub>⌊2(x+8)⌋ mod 8</sub>/11.4',
      'FM waveform = sin(φ + I(x) sin(ψ)); ψ′/φ′ = 1 + 0.5(1+sin(π(x+8)/2)); I = 1 + 3 frac((x+8)/2). This is a vowel-like synthetic effect, not a vocal-tract model.');
  });
  add('bitwise_arcade','Bitwise arcade','Melody games','Bit shifts and XOR turn a little integer counter into a jagged chip melody.',q=>{
    const scale=[0,3,5,7,10,12,15,19],rule=n=>scale[(n^(n>>1)^(n>>3))&7];
    return make([seq(rule,4,{rootFrequency:q.root,voice:'Pulse',gate:.65,decay:.7}),seq(n=>mod(n,4)===0?-12+scale[((n>>2)^(n>>4))&3]:null,4,{rootFrequency:q.root,voice:'Triangle',gate:.9,weight:.5})],
      'y₁ = C<sub>(n ⊕ (n≫1) ⊕ (n≫3)) & 7</sub>/11.4<br>y₂ = (C<sub>((n≫2) ⊕ (n≫4)) & 3</sub>−12)/11.4, n mod 4 = 0',
      `n = ⌊4(x+8)⌋; C = (${scale.join(', ')}), indexed from zero. This original bitwise note selector is inspired by algorithmic chip music; it is not raw 8-bit bytebeat playback.`);
  });
  add('firefly_cloud','Firefly cloud','Sound toys','Tiny tuned grains gather into bright clouds, scatter, then leave space between them.',q=>{
    const events=[];for(let i=0;i<150;i++){const u=q.random()*16;if(q.random()>.3+.65*(.5+.5*Math.sin(TAU*u/5)))continue;events.push({x:-8+u,span:.04+.035*q.random(),note:q.scale[i%5]+12*Math.floor(q.random()*3),bend:(q.random()-.5)*5,gain:.5+.5*q.random()})}events.sort((a,b)=>a.x-b.x);
    return make([eventTrack(events,{instrument:'grain',baseFrequency:q.root/1.22})],
      'y = (Pⱼ + bⱼr)/11.4, r = (x−tⱼ)/dⱼ',
      'Seeded event starts tⱼ lie across the scan; dⱼ = 0.04…0.075 graph units, approximately 18-33 ms at the 7-second scan. Vivid sums overlapping sine chirplets with a sin²(πr) window. The plot shows the latest active grain; overlapping grains remain audible.');
  });
  add('bubble_zipper','Bubble zipper','Sound toys','Rounded little pitch bubbles tumble down, with short gaps and a changing upper sparkle.',q=>{
    const layer=seq(n=>[12,19,15,22,10,17,14,24][mod(n,8)],3.3,{rootFrequency:q.root,voice:'Glass',gate:.68,decay:3});
    const original=layer.f;layer.f=x=>{const y=original(x);return Number.isFinite(y)?y-1.7*Math.sqrt(fract((x+8)*3.3)):NaN};
    return make([layer],'y = B<sub>n mod 8</sub>/11.4 − 1.7√r',`n = ⌊3.3(x+8)⌋; r = frac(3.3(x+8)); B = (12,19,15,22,10,17,14,24). Each bubble ends before the next attack.`);
  });
  add('mirror_duet','Mirror duet','Melody games','A short tune is answered upside down by a warmer voice, then both overlap.',q=>{
    const motif=[0,3,7,10,5,12,7,3].map(n=>n+q.transpose);
    return make([seq(motif,2.5,{rootFrequency:q.root,voice:'Bell',gate:.75}),seq(motif.map(n=>7-n).reverse(),2.5,{offset:.6,rootFrequency:q.root,voice:'Hollow',gate:.82,weight:.8})],
      'y₁ = M<sub>n mod 8</sub>/11.4<br>y₂ = (7−M<sub>(7−m) mod 8</sub>)/11.4',`M = (${motif.join(', ')}); n = ⌊2.5(x+8)⌋; m = ⌊2.5(x+7.4)⌋. The response reverses both the note order and the interval direction.`);
  });
  add('growing_music_box','Growing music box','Melody games','A sparse bell phrase fills in note by note until the whole tune rings out.',q=>{
    const motif=[0,7,12,3,10,15,7,5].map(n=>n+q.transpose),rule=n=>mod(n,8)<[2,4,6,8][mod(Math.floor(n/8),4)]?motif[mod(n,8)]:null;
    return make([seq(rule,2,{rootFrequency:q.root,voice:'Bell',gate:.83,decay:2.4})],
      'y = M<sub>n mod 8</sub>/11.4, n mod 8 < L<sub>⌊n/8⌋ mod 4</sub>',`n = ⌊2(x+8)⌋; L = (2,4,6,8); M = (${motif.join(', ')}). Missing cells are rests, progressively replaced with notes.`);
  });
  add('chord_carousel','Chord carousel','Melody games','Four changing harmonies unfold as a three-part arpeggio, then circle home.',q=>{
    const chords=[[0,5,7],[0,3,7],[0,4,7],[2,5,9]],layers=[0,1,2].map(i=>seq(n=>chords[mod(Math.floor(n/(4*(i+1))),4)][i]+(i===2?12:0),i+1,{rootFrequency:q.root,voice:['Triangle','Bell','Glass'][i],offset:i*.12,gate:.88,decay:1.3,weight:[1,.75,.6][i]}));
    return make(layers,'yᵢ = (C<sub>bᵢ,i</sub> + Oᵢ)/11.4',
      'C = ((0,5,7),(0,3,7),(0,4,7),(2,5,9)); O = (0,0,12). For voice i indexed from zero: nᵢ = ⌊(i+1)(x+8−0.12i)⌋; bᵢ = ⌊nᵢ/(4(i+1))⌋ mod 4.');
  });
  add('endless_stairs','Endless stairs','Sound toys','Four octave layers hand notes to each other to suggest a staircase that keeps rising.',q=>{
    const layers=Array.from({length:4},(_,i)=>{const layer=seq(n=>mod(n,12)+12*(i-1),3,{rootFrequency:110,voice:'Sine',gate:.97,decay:0,pure:true});const envelope=layer.envelope;layer.envelope=x=>{const z=mod(Math.floor((x+8)*3),12)/12+i;return envelope(x)*Math.exp(-((z-1.8)**2)/.8)};return layer});
    return make(layers,'yᵢ = ((n mod 12) + 12(i−1))/11.4',
      'n = ⌊3(x+8)⌋; i = 0…3. Each pure sine octave has weight exp(−(z−1.8)²/0.8), where z = (n mod 12)/12 + i. The spectral weighting, not just a repeating sawtooth, creates the Shepard-style handoff.');
  });
  add('echo_garden','Echo garden','Melody games','A few rounded notes answer themselves in softer fifths and octaves.',q=>{
    const motif=[0,null,7,null,3,10,null,5],layers=[0,1,2].map(i=>seq(n=>{const v=motif[mod(n,8)];return v===null?null:v+[0,7,12][i]},2,{offset:i*.7,rootFrequency:q.root,voice:['Triangle','Glass','Bell'][i],gate:.68,decay:2.8,weight:[1,.55,.3][i]}));
    return make(layers,'yᵢ = (E<sub>nᵢ mod 8</sub> + Tᵢ)/11.4',
      'E = (0,rest,7,rest,3,10,rest,5); T = (0,7,12); nᵢ = ⌊2(x+8−0.7i)⌋. These are delayed pitch traces with declining gains (1,0.55,0.3), so the echoes are visible as well as audible.');
  });
  add('chaos_conversation','Chaos conversation','Melody games','A constrained chaotic phrase asks a question; its reversed, lower reply answers.',q=>{
    let z=.21+.3*q.random();const motif=Array.from({length:8},()=>{z=3.83*z*(1-z);return q.scale[Math.min(4,Math.floor(z*5))]+(z>.75?12:0)});
    return make([seq(n=>mod(Math.floor(n/8),2)===0?motif[mod(n,8)]:null,2,{rootFrequency:q.root,voice:'Glass',gate:.77}),seq(n=>mod(Math.floor(n/8),2)===1?motif[7-mod(n,8)]-5:null,2,{rootFrequency:q.root,voice:'Hollow',gate:.86})],
      'zₖ₊₁ = 3.83zₖ(1−zₖ)<br>y₁ = Q<sub>n mod 8</sub>/11.4; y₂ = (Q<sub>(7−n) mod 8</sub>−5)/11.4',
      `Q = (${motif.join(', ')}), obtained by mapping the seeded logistic orbit to scale (${q.scale.join(', ')}). n = ⌊2(x+8)⌋. Voice 1 plays even eight-cell phrases; voice 2 answers on odd phrases.`);
  });
  add('talking_drums','Talking drums','Sound toys','Two tuned FM drums trade short bent notes, with a higher reply instead of a constant backing beat.',q=>{
    const layers=[0,1].map(i=>{const motif=i?[null,7,null,10,null,5,12,null]:[0,null,3,null,-2,null,null,5];const layer=seq(motif,2.6,{rootFrequency:q.root/(i?1:2),voice:'Sine',gate:.64,decay:4,fm:{ratio:i?1.41:1.67,index:2.5},weight:i?.75:1});const f=layer.f;layer.f=x=>{const y=f(x);return Number.isFinite(y)?y+.85*Math.exp(-12*fract((x+8)*2.6)):NaN};return layer});
    return make(layers,'yᵢ = Dᵢ(n)/11.4 + 0.85 e<sup>−12r</sup>',
      'n = ⌊2.6(x+8)⌋; r = frac(2.6(x+8)); D₁ = (0,rest,3,rest,−2,rest,rest,5); D₂ = (rest,7,rest,10,rest,5,12,rest). Inharmonic FM ratios (1.67,1.41) add a membrane-like clang; this is an original synthetic percussion voice.');
  });

  const byId=new Map(entries.map(entry=>[entry.id,entry]));
  api.generate=function(seed,options={}){
    const entry=byId.get(/^sg2-([a-z_]+)--/.exec(seed)?.[1]);if(!entry)return previousGenerate(seed,options);
    const r=random('sonograph-music:'+seed),q={random:r,root:[130.8128,146.8324,164.8138,196][Math.floor(r()*4)],scale:r()<.5?[0,3,5,7,10]:[0,2,4,7,9],transpose:[0,2,5][Math.floor(r()*3)]};
    const built=entry.build(q);
    return {seed,version:2,type:entry.id,name:entry.name,group:entry.group,family:entry.group.toUpperCase(),description:entry.description,reference:entry.reference,minX:-8,maxX:8,duration:14,baseFrequency:q.root/1.22,voice:'Bell',amplitude:3,musical:true,...built,
      definitions:built.definitions+' Pitch heights divide semitones by 11.4 to match Vivid’s 0.95-octave-per-unit mapping. Pitches use the stated root; note windows control loudness independently. The same seed fixes notes, key and event timing.'};
  };
  // Remove low-motion contours, redundant timbral studies and clipped plateaus
  // from discovery. Their saved seeds still resolve through previousGenerate.
  const retired=new Set(('square duty trapezoid scallops tanh_square parabolic_tri odd even beats fourier_triangle dirichlet fejer ramanujan damped gaussian mexican sinc blackman tukey hyperbola tanh superellipse rational_dipole log_potential root_cusps mandelbrot minkowski cantor tent sine_map circle cheb_map bifurcation chirikov gingerbread chebyshev legendre hermite laguerre erf fresnel airy stairs thue_morse sample_hold fibonacci_word rudin_shapiro gammatone shepard formant karplus morlet cochlea_wave gabor kdv_soliton kdv_two_soliton sine_gordon_kink sine_gordon_breather akhmediev cnoidal kuramoto lotka_volterra pendulum quantum_harmonic double_slit poschl_teller planck_radiation cornu_spiral catenary_arch agnesi folium semicubical cassini clothoid cissoid kampyle superformula prime_counting hofstadter_q totient_sum gauss_map divisor_sum van_der_corput log_ripple bezier_ribbon hermite_glide raised_gate rational_fm pendulum_phase').split(' '));
  const lively=new Set(['polymeter','swing_kicks','ratchet_bursts','palindrome_pulses','euclidean','ratchet','polyrhythm','switch','nested','fm','weierstrass','tan_field','ecg']);
  const retained=api.catalog.filter(entry=>!retired.has(entry.id)).map(entry=>({...entry,discoveryWeight:entry.group==='Video reference'||lively.has(entry.id)?3:1}));
  api.catalog=[...entries,...retained];api.groups=[...new Set(api.catalog.map(entry=>entry.group))];
  api.curation={retired:[...retired],added:entries.map(entry=>entry.id)};
  if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
