/* The tune collection: integer sequences, rhythm rules, acoustic illusions and
   bytebeat one-liners, each turned into a short piece of music. The earlier
   collection is kept alongside. x counts beats: 0 ≤ x ≤ 16. */
(function(root){
  'use strict';
  const api=root.Sonograph,previousGenerate=api.generate,{mod,clamp}=api,TAU=2*Math.PI,PHI=(1+Math.sqrt(5))/2;
  const BEATS=16,STEP=.25,SEMI=11.4;
  const scales={major:[0,2,4,5,7,9,11],minor:[0,2,3,5,7,8,10],dorian:[0,2,3,5,7,9,10],penta:[0,2,4,7,9],minpenta:[0,3,5,7,10],lydian:[0,2,4,6,7,9,11]};
  const deg=(scale,n)=>scale[mod(n,scale.length)]+12*Math.floor(n/scale.length);
  const digits={
    'π':'14159265358979323846264338327950288419716939937510582097494459230781640628',
    'e':'71828182845904523536028747135266249775724709369995957496696762772407663035',
    'φ':'61803398874989484820458683436563811772030917980576286213544862270526046281',
    '√2':'41421356237309504880168872420969807856967187537694807317667973799073247846'
  };
  const popcount=n=>{let c=0;while(n){c+=n&1;n>>=1}return c};
  const drumRow={kick:-2.6,snare:-2.25,clap:-2.25,brush:-2.25,rim:-1.9,hat:-1.9};
  const oeis=id=>'https://oeis.org/'+id,wiki=page=>'https://en.wikipedia.org/wiki/'+page;
  const bytebeatPost='http://countercomplex.blogspot.com/2011/10/algorithmic-symphonies-from-one-line-of.html';

  function rng(seed){let h=2166136261;for(const c of seed)h=Math.imul(h^c.charCodeAt(0),16777619);return()=>{h+=0x6D2B79F5;let t=Math.imul(h^(h>>>15),h|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296}}
  function lookup(events,x,reach){
    let lo=0,hi=events.length-1,found=-1;
    while(lo<=hi){const m=(lo+hi)>>1;if(events[m].x<=x){found=m;lo=m+1}else hi=m-1}
    for(let i=found;i>=0&&i>found-4;i--){const e=events[i];if(x<e.x+Math.min(e.span,reach))return e}
    return null;
  }
  // Event layers: one note per scored step. Their graphs show the notes as a staircase.
  function put(layer,step,length,note,tone,gain=1,bend=0){
    const x=step*STEP,span=Math.min(length*STEP,BEATS-.002-x);
    if(x>=0&&span>0)layer.events.push({x,span,note,tone:tone||layer.tone,gain,bend});
  }
  function finish(layer){
    if(!layer.events)return layer;
    layer.events.sort((a,b)=>a.x-b.x);
    if(layer.plot===false){layer.f=()=>NaN;return layer}
    layer.f=layer.instrument==='drums'
      ?x=>{const e=lookup(layer.events,x,.16);return e?drumRow[e.tone]??-2:NaN}
      :x=>{const e=lookup(layer.events,x,Infinity);return e?e.note/SEMI:NaN};
    return layer;
  }

  const entries=[];
  const add=(id,name,group,reference,build)=>entries.push({id,name,group,description:'',reference,build,discoveryWeight:6});

  // === Number tunes ===
  add('recaman','Recamán\'s leaps','Number tunes',oeis('A005132'),c=>{
    const start=c.pick([0,16,32,48]),a=[0],seen=new Set([0]);
    for(let n=1;n<start+40;n++){const back=a[n-1]-n,v=back>0&&!seen.has(back)?back:a[n-1]+n;a.push(v);seen.add(v)}
    const lead=c.layer('Pluck','pluck',.95),echo=c.layer('Echo','pluck',.4,{plot:false}),bass=c.layer('Bass','toy',.6,{tone:'bass'}),kit=c.layer('Kit','drums',.35);
    for(let i=0;i<32;i++){const note=deg(scales.penta,a[start+i]%11);put(lead,2*i,2,note);put(echo,2*i+3,2,note+12,null,.75)}
    for(let bar=0;bar<4;bar++){put(bass,16*bar,7,-12);put(bass,16*bar+8,7,-5,null,.8);put(kit,16*bar,2,0,'kick');put(kit,16*bar+10,2,0,'kick',.7);for(let k=2;k<16;k+=4)put(kit,16*bar+k,1,0,'hat',.4)}
    return {formula:'a(n) = a(n−1) − n, if positive and not yet used<br>a(n) = a(n−1) + n, otherwise<br>note(n) = P[a(n) mod 11]',
      definitions:`a(0) = 0. P is the major pentatonic scale over two octaves. Eighth notes play a(${start}) to a(${start+31}); an echo repeats each note an octave higher three sixteenths later.`};
  });
  add('norgard','Nørgård\'s infinity series','Number tunes',oeis('A004718'),c=>{
    const a=[0];for(let n=1;n<64;n++)a.push(n%2?a[(n-1)/2]+1:-a[n/2]);
    const scale=c.pick([scales.dorian,scales.minor,scales.lydian]);
    const lead=c.layer('Marimba','toy',.9,{song:true,tone:'marimba'}),slow=c.layer('Organ','toy',.5,{song:true,tone:'organ'});
    for(let n=0;n<64;n++)put(lead,n,1.4,12+deg(scale,a[n]),null,n%4?.8:1);
    for(let n=0;n<16;n++)put(slow,4*n,3.9,deg(scale,a[n]));
    return {formula:'a(2n) = −a(n)<br>a(2n+1) = a(n) + 1<br>note(n) = S[a(n)]',
      definitions:'a(0) = 0. Sixteenth notes play a(0) to a(63) as degrees of the scale S. Because a(4n) = a(n), the organ plays the same series four times slower and lands on every fourth marimba note.'};
  });
  add('stern','Stern\'s diatomic harp','Number tunes',oeis('A002487'),c=>{
    const s=[0,1];for(let n=2;n<=80;n++)s.push(n%2?s[(n-1)/2]+s[(n+1)/2]:s[n/2]);
    const harp=c.layer('Crystal','spectral',.9,{tone:'crystal'}),bass=c.layer('Bass','toy',.55,{tone:'bass'});
    for(let i=0;i<64;i++)put(harp,i,2.5,deg(scales.major,s[i+16]),null,.85);
    for(let k=0;k<16;k++)put(bass,4*k,3.6,deg(scales.major,s[k+16]%7)-12);
    return {formula:'s(2n) = s(n)<br>s(2n+1) = s(n) + s(n+1)<br>note(n) = M[s(n + 16)]',
      definitions:'s(0) = 0, s(1) = 1. M is the major scale. Between powers of two the values rise and fall as a palindrome, so each phrase is an arch. The bass plays s(k + 16) mod 7 on each beat.'};
  });
  add('hailstone_run','Hailstone run','Number tunes',wiki('Collatz_conjecture'),c=>{
    const path=n=>{const p=[n];while(n>1){n=n%2?3*n+1:n/2;p.push(n)}return p};
    const starts=[];for(let n=20;n<400&&starts.length<12;n++){const l=path(n).length;if(l>=40&&l<=64)starts.push(n)}
    const start=c.pick(starts),p=path(start),step=64/p.length,peak=Math.max(...p);
    const lead=c.layer('Toy','toy',.9,{tone:'wood'}),kit=c.layer('Kit','drums',.4);
    p.forEach((v,i)=>{const note=deg(scales.minpenta,Math.round(12*Math.log2(v)/Math.log2(peak)));put(lead,i*step,step*.95,note,v%2&&v>1?'boing':'wood',v%2?1:.8,v%2&&v>1?5:0);if(v%2)put(kit,i*step,1,0,'rim',.7)});
    for(let k=0;k<16;k++)put(kit,4*k,2,0,k%2?'snare':'kick',.75);
    return {formula:'v<sub>k+1</sub> = 3v<sub>k</sub> + 1, if v<sub>k</sub> is odd<br>v<sub>k+1</sub> = v<sub>k</sub> / 2, if v<sub>k</sub> is even<br>note(k) = P[round(12 log<sub>2</sub> v<sub>k</sub> / log<sub>2</sub> v<sub>max</sub>)]',
      definitions:`v₀ = ${start}; the path reaches 1 after ${p.length-1} steps and peaks at v_max = ${peak}. P is the minor pentatonic scale. Odd values bounce upward with a rim click.`};
  });
  add('constant_digits','Digits of a constant','Number tunes',oeis('A000796'),c=>{
    const name=c.pick(Object.keys(digits)),d=digits[name];
    const lead=c.layer('Marimba','toy',.95,{song:true,tone:'marimba'}),bass=c.layer('Bass','toy',.55,{tone:'bass'}),kit=c.layer('Kit','drums',.3);
    for(let i=0;i<32;i++){const v=+d[i];if(v)put(lead,2*i,1.8,12+deg(scales.minor,v-1),null,i%2?.8:1)}
    for(let k=0;k<16;k++){put(bass,4*k,3.5,deg(scales.minor,(+d[2*k]||1)-1)-12);put(kit,4*k,1,0,k%2?'rim':'kick',.7);put(kit,4*k+2,1,0,'hat',.35)}
    return {formula:`${name} = ${name==='π'?3:name==='e'?2:1}.${d.slice(0,12)}…<br>note(i) = A[d<sub>i</sub> − 1], rest when d<sub>i</sub> = 0`,
      definitions:`d_i is the i-th decimal digit of ${name}. A is the natural minor scale. Eighth notes play the first 32 digits; the bass plays every other digit on the beat.`};
  });
  add('hanoi','Tower of Hanoi','Number tunes',wiki('Tower_of_Hanoi'),c=>{
    const discs=6,lead=c.layer('Pluck','pluck',.9),bass=c.layer('Bass','toy',.6,{tone:'bass'}),kit=c.layer('Kit','drums',.3);
    for(let m=1;m<64;m++){
      const disc=Math.log2(m&-m),to=((m|(m-1))+1)%3;
      put(lead,m-1,1.6,deg(scales.major,2*(discs-1-disc)),null,disc?1:.75);
      if(disc)put(bass,m-1,disc>1?4:2,[0,5,7][to]-12,null,.6+.08*disc);
      if(disc>2)put(kit,m-1,2,0,'kick',.7);
    }
    put(lead,63,1,deg(scales.major,10));
    return {formula:'d(m) = v<sub>2</sub>(m)<br>peg(m) = ((m | (m − 1)) + 1) mod 3<br>note(m) = M[2(5 − d(m))]',
      definitions:'Move m of the optimal six-disc solution moves disc d(m), the number of trailing zeros of m. Small discs sound high, so the melody follows the ruler sequence. The bass plays the destination peg as I, IV or V.'};
  });
  add('fifths','Circle of fifths','Number tunes',wiki('Circle_of_fifths'),c=>{
    const dir=c.pick([7,5]),arp=c.layer('Harp','pluck',.9),bass=c.layer('Bass','toy',.6,{tone:'bass'}),kit=c.layer('Kit','drums',.25);
    for(let k=0;k<16;k++){
      let root=mod(dir*k,12);if(root>6)root-=12;
      [0,4,7,12].forEach((n,i)=>put(arp,4*k+i,1.5,root+n+12,null,i?.8:1));
      put(bass,4*k,3.8,root-12);put(kit,4*k+2,1,0,'hat',.4);
    }
    return {formula:`r<sub>k</sub> = ${dir}k mod 12<br>arpeggio(k) = r<sub>k</sub> + (0, 4, 7, 12)`,
      definitions:`Each beat k is a major chord on root r_k. Steps of ${dir} semitones visit all twelve keys before returning home on beat 12.`};
  });
  add('overtones','Overtone bugle','Number tunes',wiki('Harmonic_series_(music)'),c=>{
    const phrase=[4,5,6,8,6,8,10,8, 6,7,8,9,10,11,12,13, 16,15,14,13,12,11,10,9, 8,7,6,5,4,3,2,1];
    const horn=c.layer('Reed','toy',.95,{song:true,tone:'reed'}),drone=c.layer('Organ','toy',.45,{song:true,tone:'organ'});
    phrase.forEach((n,i)=>put(horn,2*i,1.9,12*Math.log2(n)-12,null,i%8?.85:1));
    for(let k=0;k<4;k++)put(drone,16*k,15.5,-12);
    return {formula:'f<sub>n</sub> = n f<sub>1</sub><br>note(n) = 12 log<sub>2</sub> n − 12',
      definitions:'Notes are whole-number multiples of one fundamental, the only notes a natural horn can play. Harmonics 7, 11 and 13 sit between the piano keys and sound bent. The organ holds f₁.'};
  });

  add('gray_chorale','Gray code chorale','Number tunes',oeis('A003188'),c=>{
    const pairs=[[0,1],[2,3],[4,5],[6,7]],organ=c.layer('Organ','toy',.5,{song:true,tone:'organ'}),harp=c.layer('Harp','pluck',.8),bass=c.layer('Bass','toy',.6,{tone:'bass'});
    for(let k=0;k<16;k++){
      const g=k^(k>>1),chord=pairs.map(([low,high],i)=>deg(scales.major,g>>i&1?high:low));
      chord.forEach(n=>put(organ,4*k,3.9,n,null,.7));put(bass,4*k,3.6,chord[0]-12);
      chord.forEach((n,i)=>put(harp,4*k+i,1.6,n+12,null,i?.75:1));
    }
    return {formula:'g(k) = k XOR ⌊k/2⌋<br>voice<sub>i</sub>(k) = M[2i + bit<sub>i</sub>(g(k))]',
      definitions:'Consecutive Gray codes differ in exactly one bit, so each new chord moves a single voice by one scale step. Sixteen beats visit all sixteen four-bit codes: every chord between Cmaj7 and Dm7, with perfectly smooth voice leading.'};
  });
  add('sieve_groove','Sieve groove','Number tunes',wiki('Sieve_of_Eratosthenes'),c=>{
    const kit=c.layer('Kit','drums',.6),bell=c.layer('Bells','spectral',.75,{tone:'crystal'}),bass=c.layer('Bass','toy',.6,{tone:'bass'});
    const isPrime=n=>{for(let d=2;d*d<=n;d++)if(n%d===0)return false;return n>1};
    for(let i=0;i<64;i++){
      const n=i+2;
      if(n%2===0)put(kit,i,1,0,'hat',.35);
      if(n%3===0)put(kit,i,2,0,'kick',.85);
      if(n%5===0)put(kit,i,1.5,0,'clap',.6);
      if(n%7===0)put(bass,i,3,[-12,-2][(n/7)%2]);
      if(n>7&&isPrime(n))put(bell,i,3,n%12-1+12,null,.9);
    }
    return {formula:'n = 2, 3, …, 65<br>voice p plays when p | n, for p = 2, 3, 5, 7<br>bell(n) = (n mod 12) − 1, when n > 7 is prime',
      definitions:'Hi-hat, kick, clap and bass are the sieves of 2, 3, 5 and 7, so composite numbers sound as their prime factors together. The bells ring only on primes. Every prime above 3 is 1, 5, 7 or 11 mod 12, so the bells use just four pitches.'};
  });
  add('look_and_say','Look and say','Number tunes',oeis('A005150'),c=>{
    const terms=['1'];while(terms.join('').length+terms.length<64){terms.push(terms.at(-1).replace(/(\d)\1*/g,run=>run.length+run[0]))}
    const lead=c.layer('Chip','toy',.85,{song:true,tone:'chip'}),bass=c.layer('Bass','toy',.6,{tone:'bass'}),kit=c.layer('Kit','drums',.35);
    let step=0;terms.forEach((term,t)=>{
      put(bass,step,Math.min(term.length+1,8),[0,-3,-7,-5][t%4]-12);if(step%4===0)put(kit,step,1,0,'kick',.7);
      for(const [i,d]of [...term].entries()){if(step>=64)break;put(lead,step,.9,deg(scales.major,2*(+d-1))+12,null,i?.75:1);if(i%2)put(kit,step,1,0,'hat',.3);step++}
      step++;
    });
    return {formula:'1, 11, 21, 1211, 111221, 312211, …<br>each term reads the previous one aloud<br>note = M[2(d − 1)] for each digit d',
      definitions:'"1211" is one 1, one 2, two 1s, so the next term is 111221. Only the digits 1, 2 and 3 ever appear, so the melody stays on one major triad while the phrases grow by about 30% each time. The bass changes chord with every term.'};
  });
  add('koch_melody','Koch curve melody','Number tunes',wiki('Koch_snowflake'),c=>{
    let dirs=[0];for(let level=0;level<3;level++){const next=[];for(const d of dirs)next.push(d,d+1,d-1,d);dirs=next}
    let y=0;const heights=dirs.map(d=>y+=Math.sin(d*Math.PI/3));
    const lead=c.layer('Marimba','toy',.9,{song:true,tone:'marimba'}),bass=c.layer('Bass','toy',.55,{tone:'bass'});
    heights.forEach((h,i)=>{const n=Math.round(1.5*h);put(lead,i,1.3,deg(scales.major,n),null,dirs[i]===0?1:.75);if(i%4===0)put(bass,i,3.8,deg(scales.major,n-7))});
    return {formula:'F → F + F − F + F, turns of ±60°<br>y<sub>i</sub> = Σ<sub>j≤i</sub> sin(60° d<sub>j</sub>)<br>note(i) = M[round(1.5 y<sub>i</sub>)]',
      definitions:'Three rewriting steps give the 64 segments of the Koch curve. The melody follows the height of the curve after each segment, so the graph of the notes traces the familiar snowflake edge: bumps on bumps on bumps.'};
  });
  add('hilbert_walk','Hilbert curve counterpoint','Number tunes',wiki('Hilbert_curve'),c=>{
    const point=d=>{let x=0,y=0,t=d;for(let s=1;s<8;s*=2){const rx=1&(t>>1),ry=1&(t^rx);if(!ry){if(rx){x=s-1-x;y=s-1-y}[x,y]=[y,x]}x+=s*rx;y+=s*ry;t>>=2}return [x,y]};
    const upper=c.layer('Pluck','pluck',.85),lower=c.layer('Marimba','toy',.7,{song:true,tone:'marimba'});
    for(let d=0;d<64;d++){const [x,y]=point(d);put(upper,d,1.4,deg(scales.dorian,x+y),null,d%4?.8:1);if(d%2===0)put(lower,d,2,deg(scales.dorian,x-y)-12)}
    return {formula:'(x<sub>d</sub>, y<sub>d</sub>) = Hilbert curve on an 8 × 8 grid<br>upper(d) = D[x + y]<br>lower(d) = D[x − y]',
      definitions:'The Hilbert curve visits all 64 cells, always moving to a neighbouring cell. Each move changes x + y and x − y by exactly one, so both voices only ever move by step, often in contrary motion.'};
  });
  add('julia_orbits','Julia set orbits','Number tunes',wiki('Julia_set'),c=>{
    const cs=[[-1,0],[-.1226,.7449],[-1.3107,0],[-.5,.56]],roots=[0,-4,-2,-5];
    const lead=c.layer('Crystal','spectral',.85,{tone:'crystal'}),bass=c.layer('Bass','toy',.6,{tone:'bass'}),kit=c.layer('Kit','drums',.4);
    cs.forEach(([a,b],bar)=>{
      let x=0,y=0;
      for(let n=0;n<16;n++){[x,y]=[x*x-y*y+a,2*x*y+b];put(lead,16*bar+n,1.2,deg(scales.minpenta,Math.round(4*x+3*y))+12,null,n%4?.8:1)}
      put(bass,16*bar,7.5,roots[bar]-12);put(bass,16*bar+8,7.5,roots[bar]-5,null,.8);
      for(let k=0;k<4;k++){put(kit,16*bar+4*k,1.5,0,'kick',.7);put(kit,16*bar+4*k+2,1,0,'hat',.35)}
    });
    return {formula:'z<sub>n+1</sub> = z<sub>n</sub>² + c, z<sub>0</sub> = 0<br>note(n) = P[round(4 Re z<sub>n</sub> + 3 Im z<sub>n</sub>)]<br>c = −1, −0.12 + 0.74i, −1.31, −0.5 + 0.56i',
      definitions:'Each bar uses a different c. After a short approach, the orbit of 0 falls into a cycle of length 2, 3 (the Douady rabbit), 4 and then 5, so each bar settles into a riff one note longer than the last. P is the minor pentatonic scale.'};
  });
  add('random_walk','Random walk','Number tunes',wiki('Random_walk'),c=>{
    const lead=c.layer('Chip','toy',.85,{song:true,tone:'chip'}),bass=c.layer('Bass','toy',.6,{tone:'bass'}),kit=c.layer('Kit','drums',.45);
    let w=5;
    for(let i=0;i<64;i++){
      const r=c.rand(),size=r<.35?-1:r<.7?1:r<.85?-2:2;w+=size;if(w<0)w=-w;if(w>12)w=24-w;
      if(c.rand()>.15||i%4===0)put(lead,i,1.2,deg(scales.minpenta,w),null,i%4?.75:1);
    }
    for(let bar=0;bar<4;bar++){
      const root=[0,-4,3,-2][bar];
      [0,6,8,14].forEach((k,j)=>put(bass,16*bar+k,j%2?1.5:4,root-12,null,j%2?.7:1));
      [0,8].forEach(k=>put(kit,16*bar+k,2,0,'kick'));[4,12].forEach(k=>put(kit,16*bar+k,1.5,0,'snare',.7));for(let k=2;k<16;k+=4)put(kit,16*bar+k,1,0,'hat',.3);
    }
    return {formula:'w<sub>n+1</sub> = w<sub>n</sub> + s<sub>n</sub>, reflected inside 0 ≤ w ≤ 12<br>s<sub>n</sub> ∈ {±1 (70%), ±2 (30%)}<br>note(n) = P[w<sub>n</sub>]',
      definitions:'Every seed rolls a different walk: mostly single steps with occasional leaps, bouncing off the edges of a two-and-a-half-octave minor pentatonic range. About one note in seven is a rest.'};
  });

  // === Rhythm rules ===
  const euclid=(k,n,i,rot=0)=>mod((i+rot)*k,n)<k;
  add('euclid','Euclid\'s dance floor','Rhythm rules','http://cgm.cs.mcgill.ca/~godfried/publications/banff.pdf',c=>{
    const [hatK,bassK,stabK]=c.pick([[7,5,3],[9,5,3],[7,7,5],[11,5,3]]);
    const kit=c.layer('Kit','drums',.75),bass=c.layer('Bass','toy',.7,{tone:'bass'}),stab=c.layer('Stabs','toy',.45,{song:true,tone:'organ'});
    const roots=[0,0,-4,-2],line=[0,7,10,12,3,7];
    for(let i=0;i<64;i++){
      const bar=i>>4,s=i%16,root=roots[bar];
      if(euclid(3,8,s%8))put(kit,i,2,0,'kick');
      if(euclid(2,16,s,4))put(kit,i,2,0,'clap',.75);
      else if(euclid(hatK,16,s))put(kit,i,1,0,'hat',.4);
      if(euclid(bassK,16,s,2))put(bass,i,1.6,root+line[i%line.length]-12,null,.9);
      if(euclid(stabK,8,s%8,1)&&bar%2)[0,3,7].forEach(n=>put(stab,i,1.2,root+n+12,null,.6));
    }
    return {formula:`E(k, n)(i) = 1 when (k·i mod n) < k<br>kick E(3, 8), clap E(2, 16), hat E(${hatK}, 16), bass E(${bassK}, 16)`,
      definitions:'Each part spreads k hits as evenly as possible over n steps. E(3, 8) is the tresillo. Rotations shift the clap to the backbeat and the bass off the kick. The bass walks a minor arpeggio over i, VI, VII.'};
  });
  add('clapping','Phase clapping','Rhythm rules',wiki('Clapping_Music'),c=>{
    const P=[1,1,1,0,1,1,0,1,0,1,1,0],cell=64/96;
    const a=c.layer('High block','toy',.8,{tone:'wood'}),b=c.layer('Low block','toy',.8,{tone:'wood'});
    for(let i=0;i<96;i++){const bar=Math.floor(i/12);if(P[i%12])put(a,i*cell,cell*.9,19,null,i%12?.8:1);if(P[(i+bar)%12])put(b,i*cell,cell*.9,7,null,(i+bar)%12?.8:1)}
    return {formula:'A(i) = P[i mod 12]<br>B(i) = P[(i + ⌊i/12⌋) mod 12]<br>P = (1,1,1,0,1,1,0,1,0,1,1,0)',
      definitions:'Both blocks play the same twelve-step pattern. B shifts by one step every bar, so the pair drifts through eight different interlocking rhythms.'};
  });
  add('golden_groove','Golden ratio groove','Rhythm rules',oeis('A003849'),c=>{
    let w='0';while(w.length<64)w=w.replace(/./g,ch=>ch==='0'?'01':'0');
    const lead=c.layer('Chip','toy',.85,{song:true,tone:'chip'}),bass=c.layer('Bass','toy',.65,{tone:'bass'}),kit=c.layer('Kit','drums',.5);
    const fib=[0,1];for(let k=2;k<16;k++)fib.push((fib[k-1]+fib[k-2])%7);
    for(let n=0;n<64;n++){if(w[n]==='0')put(lead,n,1.2,12+deg(scales.dorian,Math.floor((n+1)*PHI)%9),null,.85);else put(kit,n,1,0,'hat',.45)}
    for(let k=0;k<16;k++){put(bass,4*k,2.5,deg(scales.dorian,fib[k])-12);put(kit,4*k,1,0,k%2?'snare':'kick',.8)}
    return {formula:'w = 0100101001001… (0 → 01, 1 → 0)<br>note(n) = D[⌊(n+1)φ⌋ mod 9], when w<sub>n</sub> = 0<br>bass(k) = D[F<sub>k</sub> mod 7]',
      definitions:'The Fibonacci word never repeats, yet 0 occurs with density 1/φ. Its zeros carry the melody and its ones the hi-hat. Fibonacci numbers mod 7 repeat every 16 terms, exactly once across the 16 beats.'};
  });
  add('thue_morse','Thue-Morse march','Rhythm rules',oeis('A010060'),c=>{
    const lead=c.layer('Kazoo','toy',.85,{song:true,tone:'kazoo'}),kit=c.layer('Kit','drums',.6);
    for(let n=0;n<64;n++){if(n%2===0||popcount(n)%2)put(lead,n,1.3,deg(scales.major,2*popcount(n)),null,n%4?.8:1)}
    for(let k=0;k<32;k++){put(kit,2*k,1.5,0,popcount(k)%2?'snare':'kick',.8);put(kit,2*k+1,1,0,'hat',.3)}
    return {formula:'s(n) = number of 1s in n written in binary<br>t(n) = s(n) mod 2<br>note(n) = M[2 s(n)]',
      definitions:'The melody climbs chord tones as binary counting adds ones. Each eighth note k plays a kick when t(k) = 0 and a snare when t(k) = 1. Odd sixteenths only sound when t(n) = 1.'};
  });
  add('chaos_acid','Logistic acid','Rhythm rules',wiki('Logistic_map'),c=>{
    let v=c.pick([.5,.31,.67,.42]);const acid=c.layer('Acid','spectral',.9,{tone:'acid'}),kit=c.layer('Kit','drums',.6);
    for(let n=0;n<64;n++){const r=2.9+1.1*n/63;v=r*v*(1-v);put(acid,n,.85,deg(scales.minor,Math.round(10*v))-12,null,v>.75?1:.7,v>.85?3:0)}
    for(let k=0;k<16;k++){put(kit,4*k,2,0,'kick');put(kit,4*k+2,1,0,'hat',.45);if(k%2)put(kit,4*k,1.5,0,'clap',.6)}
    return {formula:'v<sub>n+1</sub> = r<sub>n</sub> v<sub>n</sub> (1 − v<sub>n</sub>)<br>r<sub>n</sub> = 2.9 + 1.1 n / 63<br>note(n) = A[round(10 v<sub>n</sub>)]',
      definitions:'As r rises, the orbit settles on one note, then alternates between two, then four, and becomes chaotic near r = 3.57. A is the natural minor scale.'};
  });

  add('game_of_life','Game of Life sequencer','Rhythm rules',wiki('Conway%27s_Game_of_Life'),c=>{
    const starts={'a glider and a blinker':[[0,1],[1,2],[2,0],[2,1],[2,2],[5,4],[5,5],[5,6]],'the R-pentomino':[[3,4],[3,5],[4,3],[4,4],[5,4]],'a glider and a beacon':[[0,1],[1,2],[2,0],[2,1],[2,2],[4,4],[4,5],[5,4],[6,7],[7,6],[7,7],[6,6]]};
    const name=c.pick(Object.keys(starts));let grid=Array.from({length:8},()=>Array(8).fill(0));for(const [r,col]of starts[name])grid[r][col]=1;
    const mallet=c.layer('Marimba','toy',.85,{song:true,tone:'marimba'}),bass=c.layer('Bass','toy',.55,{tone:'bass'}),kit=c.layer('Kit','drums',.4);
    for(let g=0;g<8;g++){
      let alive=0;
      for(let col=0;col<8;col++){const rows=[];for(let r=0;r<8;r++)if(grid[r][col])rows.push(r);alive+=rows.length;rows.forEach(r=>put(mallet,8*g+col,1.4,deg(scales.penta,7-r)+12,null,rows.length>2?.6:.85))}
      put(bass,8*g,7.5,deg(scales.penta,alive%5)-12);put(kit,8*g,2,0,'kick',.8);put(kit,8*g+4,1,0,'hat',.4);
      grid=grid.map((row,r)=>row.map((v,col)=>{let n=0;for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++)if(dr||dc)n+=grid[mod(r+dr,8)][mod(col+dc,8)];return n===3||v&&n===2?1:0}));
    }
    return {formula:'cell<sub>g+1</sub> = 1 with 3 live neighbours, or alive with 2<br>column j of generation g plays at step 8g + j<br>row r sounds P[7 − r]',
      definitions:`An 8 × 8 wrap-around Game of Life starts from ${name}. Each generation is one bar of eight sixteenths, read left to right like a step sequencer, so the moving shapes become changing chords and riffs. The bass counts the live cells.`};
  });
  add('tempo_canon','Tempo canon 2:3:4','Rhythm rules',wiki('Conlon_Nancarrow'),c=>{
    const M=c.pick([[0,2,4,3,5,4,2,1],[0,4,2,5,4,7,5,2],[4,3,2,0,1,2,4,6]]);
    const voices=[[2,'Bass','toy',{tone:'bass'},-12,.7],[3,'Marimba','toy',{song:true,tone:'marimba'},0,.8],[4,'Pluck','pluck',{},12,.75]];
    for(const [r,name,instrument,extra,octave,weight]of voices){
      const layer=c.layer(name,instrument,weight,extra),length=8/r;
      for(let i=0;i<8*r;i++)put(layer,i*length,length*.92,deg(scales.penta,M[i%8])+octave,null,i%8?.8:1);
    }
    return {formula:`voice<sub>r</sub>(x) = P[M<sub>⌊r x / 2⌋ mod 8</sub>], r = 2, 3, 4<br>M = (${M.join(', ')})`,
      definitions:'The same eight-note melody plays at three speeds in the ratio 2:3:4: two, three and four times through. The voices drift apart, meet again where the ratios line up, and all finish together at x = 16. Conlon Nancarrow built whole pieces from tempo canons like this.'};
  });

  // === Illusions ===
  const octaves=o=>o/.95;
  add('shepard_glide','Endless glissando','Illusions',wiki('Shepard_tone'),c=>{
    const dir=c.pick([1,-1]),N=4;
    for(let k=0;k<N;k++){
      const u=x=>mod(dir*x/16+k/N,1);
      c.layer('Sine','',1,{f:x=>octaves(4*u(x)-2),voice:'Sine',pure:true,envelope:x=>Math.exp(-(((u(x)-.5)/.21)**2))});
    }
    return {formula:`y<sub>k</sub> = 4 frac(${dir<0?'−':''}x/16 + k/4) − 2 octaves<br>loudness<sub>k</sub> = e<sup>−((y<sub>k</sub>/4)/0.21)²</sup>`,
      definitions:`Four sine voices an octave apart glide ${dir>0?'up':'down'} together. Each fades in at one edge and out at the other, so the pitch seems to move forever without arriving.`,rootHz:330};
  });
  add('shepard_steps','Endless staircase','Illusions',wiki('Shepard_tone'),c=>{
    const dir=c.pick([1,-1]),N=4;
    for(let k=0;k<N;k++){
      const u=x=>mod(dir*Math.floor(2*x)/48+k/N,1);
      c.layer('Glass','',1,{f:x=>octaves(4*u(x)-2),voice:'Glass',envelope:x=>Math.exp(-(((u(x)-.5)/.21)**2))*(.35+.65*Math.exp(-4*mod(2*x,1)))});
    }
    return {formula:`y<sub>k</sub> = 4 frac(${dir<0?'−':''}⌊2x⌋/48 + k/4) − 2 octaves<br>loudness<sub>k</sub> = e<sup>−((y<sub>k</sub>/4)/0.21)²</sup>`,
      definitions:`Each eighth note moves every voice one semitone ${dir>0?'up':'down'}. Voices fade at the edges of the four-octave range, so the scale keeps ${dir>0?'rising':'falling'} without ever getting higher or lower.`,rootHz:330};
  });
  add('bouncing_ball','Bouncing ball','Illusions',wiki('Coefficient_of_restitution'),c=>{
    const e=c.pick([.78,.72,.82]),T=1.1,drops=[];
    for(const begin of [0,8]){let t=begin+T;const hits=[t];for(let i=1;2*T*e**i>.06;i++){t+=2*T*e**i;hits.push(t)}drops.push({begin,hits})}
    const height=x=>{
      const d=x<8?drops[0]:drops[1],t=x-d.begin;if(t<T)return 1-(t/T)**2;
      for(let i=1;i<d.hits.length;i++)if(x<d.hits[i]){const span=d.hits[i]-d.hits[i-1],u=(x-d.hits[i-1])/span;return e**(2*i)*4*u*(1-u)}
      return 0;
    };
    const rest=x=>{const d=x<8?drops[0]:drops[1];return clamp(1-(x-d.hits.at(-1))/.4,0,1)};
    c.layer('Sine','',1,{f:x=>(-10+26*height(x))/SEMI,voice:'Sine',pure:true,envelope:rest});
    const tok=c.layer('Wood','toy',.7,{tone:'wood'});
    drops.forEach(d=>d.hits.forEach((x,i)=>put(tok,x/STEP,.6,Math.min(2*i+5,24),null,Math.max(.35,1-.07*i))));
    return {formula:`h(t) = e<sup>2i</sup> · 4u(1 − u), during bounce i<br>T<sub>i</sub> = 2T e<sup>i</sup>, e = ${e}<br>pitch = −10 + 26h semitones`,
      definitions:`A slide whistle follows the ball's height. Each bounce keeps a fraction e of the speed, so heights shrink by e² and bounce times by e, and the knocks speed up into a roll. The ball is dropped twice.`,rootHz:330};
  });
  add('siren_drive_by','Siren drive-by','Illusions',wiki('Doppler_effect'),c=>{
    const beta=c.pick([.2,.25,.3]),d=1.6,D=x=>1/(1+beta*(x-8)/Math.hypot(x-8,d));
    const tone=x=>5*(.5+.5*Math.tanh(8*Math.sin(Math.PI*x/1)));
    c.layer('Pulse','',1,{f:x=>(12*Math.log2(D(x))+tone(x))/SEMI,voice:'Pulse',envelope:x=>.12+.88/(1+((x-8)/d)**2)});
    return {formula:`f(x) = f<sub>s</sub>(x) / (1 + ${beta} cos θ)<br>cos θ = (x − 8) / √((x − 8)² + ${d}²)`,
      definitions:`A two-tone siren passes at x = 8 at ${beta} times the speed of sound. Approaching sources sound higher and receding ones lower; loudness follows the inverse-square law of the distance.`,rootHz:560};
  });
  add('wobble','Wobble bass','Illusions',wiki('Frequency_modulation_synthesis'),c=>{
    const notes=c.pick([[0,0,3,-2,0,0,5,3],[0,3,0,-4,0,3,7,5]]),rates=[.5,1,2,1.5];
    const note=x=>notes[clamp(Math.floor(x/2),0,7)];
    c.layer('FM bass','',1,{f:x=>note(x)/SEMI,voice:'Reed',fm:{ratio:1,index:x=>.4+3.6*Math.sin(Math.PI*rates[clamp(Math.floor(x/4),0,3)]*x)**2},envelope:x=>.55+.45*Math.cos(Math.PI*mod(x,2)/2)**2});
    const kit=c.layer('Kit','drums',.55);
    for(let bar=0;bar<4;bar++){put(kit,16*bar,2,0,'kick');put(kit,16*bar+10,2,0,'kick',.7);put(kit,16*bar+8,2,0,'clap',.85);for(let k=2;k<16;k+=4)put(kit,16*bar+k,1,0,'hat',.3)}
    return {formula:'y(x) = sin(φ + I(x) sin φ)<br>I(x) = 0.4 + 3.6 sin²(π w<sub>b</sub> x)<br>w = (½, 1, 2, 1½) per bar',
      definitions:'A single FM operator plays the bass line. The modulation index I(x) opens and closes the brightness; its rate w changes each bar, so the wobble speeds up, doubles and turns into triplets.',rootHz:98};
  });

  add('risset_rhythm','Endless accelerando','Illusions',wiki('Risset_rhythm'),c=>{
    const T=8,N=3,wood=c.layer('Wood','toy',1,{tone:'wood'}),Phi=x=>T*(2**(x/T)-1)/Math.LN2;
    for(let j=-2;j<=3;j++){
      let last=null;
      for(let x=0;x<16;x+=.002){
        const p=j+x/T;if(p<0||p>=N){last=null;continue}
        const count=Math.floor(2**j*Phi(x));
        if(last!==null&&count>last)put(wood,x/STEP,.5,12,null,Math.exp(-(((p-N/2)/.75)**2)));
        last=count;
      }
    }
    return {formula:'Φ(x) = T (2<sup>x/T</sup> − 1) / ln 2, T = 8<br>layer j hits when ⌊2<sup>j</sup> Φ(x)⌋ increases<br>loudness = e<sup>−((j + x/T − 1.5)/0.75)²</sup>',
      definitions:'Pulse layers an octave of tempo apart all speed up together, doubling every eight beats. Fast layers fade out as slow ones fade in, so the beat seems to accelerate forever without ever getting faster. It is the rhythmic twin of the Shepard tone.'};
  });
  add('missing_fundamental','Missing fundamental','Illusions',wiki('Missing_fundamental'),c=>{
    const tune=c.pick([[0,2,4,5,7,5,4,2,0,4,7,9,7,4,2,0],[0,4,7,4,5,9,7,4,2,5,4,2,0,2,-1,0]]);
    const note=x=>deg(scales.major,tune[clamp(Math.floor(x),0,15)]),art=x=>.2+.8*Math.exp(-3.5*mod(x,1));
    [1,2,3,4].forEach(k=>c.layer('Sine','',[1,.75,.6,.5][k-1],{f:x=>(note(x)+12*Math.log2(k))/SEMI,voice:'Sine',pure:true,envelope:k===1?x=>art(x)*clamp((8.2-x)/.4,0,1):art}));
    return {formula:'y(t) = Σ<sub>k = k₀…4</sub> sin(2π k f(t) t)<br>k₀ = 1 for x < 8, k₀ = 2 for x ≥ 8',
      definitions:'The same tune plays twice as a stack of four harmonics. Halfway through, the fundamental is removed, yet the melody is still heard at the same low pitch, reconstructed by the ear from the spacing of the upper harmonics. Small speakers rely on this effect for bass.',rootHz:130.81};
  });

  // === Bytebeat: a raw 8-bit sample stream from one integer expression ===
  const bytebeat=(id,name,expression,code,credit)=>add('bb_'+id,name,'Bytebeat',bytebeatPost,c=>{
    const offset=c.pick([0,1<<16,1<<17,3<<16]);
    return {sampler:t=>expression(t+offset),formula:code,
      definitions:`t counts samples at 8000 per second, starting at t = ${offset}; each value is kept to 8 bits (mod 256) and played directly as the waveform. The graph shows the mean size of the jump between neighbouring samples, a rough brightness trace. ${credit}`};
  });
  bytebeat('first','The first one-liner',t=>t*(((t>>12)|(t>>8))&(63&(t>>4))),'t · ((t ≫ 12 | t ≫ 8) & 63 & t ≫ 4)','Posted by viznut in 2011.');
  bytebeat('five_three','Five and three',t=>(t*5&t>>7)|(t*3&t>>10),'(5t & t ≫ 7) | (3t & t ≫ 10)','Posted by viznut in 2011.');
  bytebeat('forty_two','The 42 melody',t=>t*(42&t>>10),'t · (42 & t ≫ 10)','A widely shared bytebeat from 2011.');
  bytebeat('primes','Mod 24, mod 19',t=>(t>>13|t%24)&(t>>7|t%19),'(t ≫ 13 | t mod 24) & (t ≫ 7 | t mod 19)','Posted in the comments of viznut\'s 2011 article.');
  bytebeat('eighty_two','Eighty-two',t=>t*((t>>3|t>>9)&82&t>>9),'t · ((t ≫ 3 | t ≫ 9) & 82 & t ≫ 9)','Posted anonymously in the comments of viznut\'s 2011 article.');
  bytebeat('niklas','Thirteen sixteen',t=>t*(t>>9|t>>13)&16,'t · (t ≫ 9 | t ≫ 13) & 16','Posted by Niklas Roy in the comments of viznut\'s 2011 article.');
  bytebeat('tangent','Tangent shuffle',t=>t*(((t>>9)&10)|((t>>11)&24)^((t>>10)&15&(t>>15))),'t · ((t ≫ 9 & 10) | (t ≫ 11 & 24) ^ (t ≫ 10 & 15 & t ≫ 15))','Posted by tangent128 in the comments of viznut\'s 2011 article.');
  bytebeat('sierpinski','Sierpinski harmony',t=>t&t>>8,'t & t ≫ 8','Posted by viznut in 2011; its bit pattern draws a Sierpinski triangle.');

  const byId=new Map(entries.map(e=>[e.id,e]));
  function hash(seed){let h=2166136261;for(const c of seed)h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0}
  api.generate=function(seed,options={}){
    const entry=byId.get(/^sg2-([a-z_]+)--/.exec(seed)?.[1]);if(!entry)return previousGenerate(seed,options);
    const preview=/--preview$/.test(seed),random=rng('sonograph-tunes:'+seed),layers=[];
    const c={rand:random,pick:list=>preview?list[0]:list[Math.floor(random()*list.length)],
      layer:(name,instrument,weight,extra={})=>{const layer={voice:name,weight,...(instrument?{instrument,events:[]}:{}),...extra};layers.push(layer);return layer}};
    const built=entry.build(c),transpose=preview?0:hash(seed)%5,base={seed,version:2,type:entry.id,name:entry.name,group:entry.group,family:entry.group.toUpperCase(),description:'',reference:entry.reference,definitions:built.definitions,formula:built.formula};
    if(built.sampler){
      // Raw samples would fill the plot solid; a sliding mean step size shows the motion.
      const motion=x=>{const t=Math.floor(x*8000);let previous=built.sampler(t)&255,total=0;for(let k=1;k<=96;k++){const v=built.sampler(t+k)&255;total+=Math.abs(v-previous);previous=v}return total};
      let low=Infinity,high=-Infinity;for(let i=0;i<=400;i++){const v=motion(7*i/400);low=Math.min(low,v);high=Math.max(high,v)}
      const f=x=>3*(motion(x)-low)/Math.max(1,high-low)-1.5;
      return {...base,f,sampler:built.sampler,minX:0,maxX:7,duration:7,baseFrequency:110,voice:'8-bit',plotYLimit:2};
    }
    const rootHz=(built.rootHz||196)*2**(transpose/12);
    layers.forEach(finish);
    let top=2.4;for(const layer of layers)for(let i=0;i<=320;i++){const y=layer.f(BEATS*i/320);if(Number.isFinite(y))top=Math.max(top,Math.abs(y))}
    return {...base,f:layers[0].f,layers,minX:0,maxX:BEATS,duration:7,baseFrequency:rootHz/1.22,voice:layers[0].voice,musical:true,plotYLimit:Math.ceil(top*1.1*2)/2};
  };
  // New tunes come first; the earlier collection stays browsable after them.
  api.catalog=[...entries,...api.catalog];api.groups=[...new Set(api.catalog.map(e=>e.group))];
  if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
