/* Curve-driven synthesis. The original renderer remains available for old seeds. */
(function(root){
  'use strict';
  const api=root.Sonograph,{clamp}=api,TAU=2*Math.PI;
  // A solid fundamental keeps bass readable; upper partials give each voice a body.
  const voices={
    Sine:[[1,1],[2,.18],[3,.06]],
    Hollow:[[1,1],[3,.36],[5,.14],[7,.055]],
    Reed:[[1,1],[2,.58],[3,.25],[4,.12],[5,.06]],
    Organ:[[1,1],[2,.8],[4,.25],[6,.1]],
    Bell:[[1,1],[2,.7],[2.76,.24],[4,.16],[5.4,.08]],
    Glass:[[1,1],[2,.32],[2.41,.23],[4.7,.1]],
    Triangle:[[1,1],[3,-1/9],[5,1/25],[7,-1/49]],
    Pulse:[[1,1],[2,.48],[3,.32],[5,.14],[7,.06]]
  };
  function synthesizeVivid(pattern,sampleRate=48000){
    if(!Number.isFinite(sampleRate)||sampleRate<8000)throw new RangeError('Use a sample rate of at least 8000 Hz.');
    if(!Number.isFinite(pattern.duration)||pattern.duration<=0)throw new RangeError('Use a positive duration.');
    const length=Math.round(pattern.duration*sampleRate),data=new Float32Array(length);
    const partials=pattern.pure?[[1,1]]:voices[pattern.voice]||voices.Reed,phases=new Float64Array(partials.length);
    const size=16384,values=Float64Array.from({length:size+1},(_,i)=>{
      const y=pattern.f(pattern.minX+(pattern.maxX-pattern.minX)*i/size);
      return Number.isFinite(y)?clamp(y,-4,4):0;
    });
    const glide=1-Math.exp(-1/(sampleRate*.0007)),motionSmoothing=1-Math.exp(-1/(sampleRate*.012));
    const release=Math.exp(-1/(sampleRate*.045)),dcSmoothing=1-Math.exp(-TAU*12/sampleRate),nyquist=sampleRate*.5;
    let height=values[0],previous=height,motion=0,accent=0,dc=0,power=0,peak=0,modPhase=0,fmTone=0,fmRatio=1,fmIndex=0,ringPhase=0,ringFrequency=0,ringDepth=0;
    for(let i=0;i<length;i++){
      const t=i/sampleRate,u=i/Math.max(1,length-1)*size,j=Math.min(size-1,Math.floor(u));
      const y=values[j]+(values[j+1]-values[j])*(u-j);
      height+=(y-height)*glide;
      motion+=(Math.abs(height-previous)*sampleRate-motion)*motionSmoothing;previous=height;
      accent=Math.max(accent*release,clamp(motion/70,0,1));
      // Almost an octave per graph unit: low valleys thump and peaks chirp.
      const frequency=clamp(pattern.baseFrequency*1.22*Math.pow(2,height*.95),32,Math.min(3200,sampleRate*.18));
      const cutoff=1900+2600*accent+900*clamp((height+4)/8,0,1);
      let wave=0;
      if(pattern.fm){
        if(i%32===0){const x=pattern.minX+(pattern.maxX-pattern.minX)*i/Math.max(1,length-1);fmRatio=clamp(typeof pattern.fm.ratio==='function'?pattern.fm.ratio(x):pattern.fm.ratio,.25,4);fmIndex=clamp(typeof pattern.fm.index==='function'?pattern.fm.index(x):pattern.fm.index,0,6)}
        phases[0]=(phases[0]+TAU*frequency/sampleRate)%TAU;
        modPhase=(modPhase+TAU*frequency*fmRatio/sampleRate)%TAU;
        const index=Math.min(fmIndex,Math.max(0,nyquist*.7/(frequency*fmRatio)-1));
        fmTone+=(Math.sin(phases[0]+index*Math.sin(modPhase))-fmTone)*(1-Math.exp(-TAU*Math.min(5500,sampleRate*.2)/sampleRate));
        wave=fmTone;
      }else for(let k=0;k<partials.length;k++){
        const [ratio,weight]=partials[k],hz=frequency*ratio;
        phases[k]=(phases[k]+TAU*hz/sampleRate)%TAU;
        // Fade out partials before Nyquist instead of folding them into harsh aliases.
        const band=clamp((nyquist*.92-hz)/(nyquist*.2),0,1),rolloff=1/Math.sqrt(1+(hz/cutoff)**4);
        wave+=weight*band*rolloff*Math.sin(phases[k]);
      }
      if(pattern.ring){
        if(i%32===0){const x=pattern.minX+(pattern.maxX-pattern.minX)*i/Math.max(1,length-1);ringFrequency=clamp(typeof pattern.ring.frequency==='function'?pattern.ring.frequency(x):pattern.ring.frequency,0,Math.min(1800,sampleRate*.04));ringDepth=clamp(typeof pattern.ring.depth==='function'?pattern.ring.depth(x):pattern.ring.depth,0,1)}
        ringPhase=(ringPhase+TAU*ringFrequency/sampleRate)%TAU;
        wave*=1-ringDepth+ringDepth*Math.sin(ringPhase);
      }
      const body=.68+.16*clamp(Math.abs(height)/3,0,1)+.16*accent;
      const fade=Math.max(0,Math.min(1,t/.008,(pattern.duration-t)/.035));
      // Gentle saturation adds body to low notes without a hard clipping edge.
      const shaped=Math.tanh(wave*.92)*body;
      dc+=(shaped-dc)*dcSmoothing;
      const sample=(shaped-dc)*fade;data[i]=sample;power+=sample*sample;peak=Math.max(peak,Math.abs(sample));
    }
    // Consistent perceived level across voices, with headroom for every pattern.
    const gain=Math.min(.29/Math.max(1e-9,Math.sqrt(power/length)),.86/Math.max(1e-9,peak),2.5);
    for(let i=0;i<length;i++)data[i]*=gain;
    return data;
  }
  api.synthesizeVivid=synthesizeVivid;
  function eventRandom(seed){let h=2166136261;for(let i=0;i<seed.length;i++)h=Math.imul(h^seed.charCodeAt(i),16777619);return()=>{h^=h<<13;h^=h>>>17;h^=h<<5;return(h>>>0)/4294967296}}
  const songTones={kazoo:[[1,1],[2,.25],[3,.42],[5,.15],[7,.06]],chip:[[1,1],[3,.3],[5,.12],[7,.05]],reed:[[1,1],[2,.4],[3,.2],[4,.08]],marimba:[[1,1],[4,.15],[7,.04]],organ:[[1,1],[2,.45],[4,.13]],guitar:[[1,1],[2,.3],[3,.17],[4,.06]]};
  function renderEvents(part,sampleRate){
    const length=Math.round(part.duration*sampleRate),data=new Float32Array(length),unitsToSeconds=part.duration/(part.maxX-part.minX);
    for(const event of part.events){
      const start=Math.round((event.x-part.minX)*unitsToSeconds*sampleRate),seconds=event.span*unitsToSeconds,count=Math.min(Math.round(seconds*sampleRate),length-start);
      if(start<0||count<=0)continue;
      const frequency=clamp(part.baseFrequency*1.22*2**(event.note/12),32,sampleRate*.18),strength=event.gain??1;
      if(part.instrument==='drums'){
        const noise=eventRandom(part.seed+':drum:'+event.x+':'+event.tone);let phase=0,low=0;
        for(let i=0;i<count;i++){
          const t=i/sampleRate,r=i/Math.max(1,count-1),white=noise()*2-1;
          low+=(white-low)*(1-Math.exp(-TAU*1800/sampleRate));
          let wave,envelope;const tone=event.tone;
          if(tone==='kick'){phase+=TAU*(48+115*Math.exp(-t/.018))/sampleRate;wave=Math.sin(phase)+.12*(white-low)*Math.exp(-t/.006);envelope=Math.exp(-t/.075)}
          else if(tone==='hat'){wave=white-low;envelope=Math.exp(-t/.019)}
          else if(tone==='rim'){phase+=TAU*1250/sampleRate;wave=.7*Math.sin(phase)+.3*Math.sin(phase*1.43);envelope=Math.exp(-t/.016)}
          else if(tone==='clap'){wave=white-low*.55;envelope=Math.exp(-t/.05)*(t<.028?.55+.45*Math.cos(TAU*t/.01):.6)}
          else {phase+=TAU*185/sampleRate;wave=(tone==='brush'?.9:.7)*low+.3*Math.sin(phase)*Math.exp(-t/.025);envelope=Math.exp(-t/(tone==='brush'?.075:.045))}
          data[start+i]+=wave*envelope*Math.min(1,t/.001)*Math.min(1,(1-r)*count/(sampleRate*.012))*strength;
        }
      }else if(part.instrument==='spectral'){
        const tone=event.tone||'crystal',ratio=tone==='pluck'?2:tone==='acid'?1:2.76;let phase=0,filtered=0;
        for(let i=0;i<count;i++){
          const t=i/sampleRate,r=i/Math.max(1,count-1),hz=frequency*2**(((event.bend||0)*Math.exp(-t/.025))/12);phase+=TAU*hz/sampleRate;
          const brightness=tone==='acid'?1.2+clamp(event.note/18,0,2):tone==='pluck'?2.1:.45;
          const index=Math.min(brightness*Math.exp(-(tone==='acid'?5:8)*r),Math.max(0,sampleRate*.28/(hz*ratio)-1));
          let wave=Math.sin(phase+index*Math.sin(phase*ratio));
          if(tone==='crystal'&&hz*2.76<sampleRate*.4)wave+=.32*Math.sin(phase*2.76)*Math.exp(-4*r);
          if(tone==='velvet'&&hz*3<sampleRate*.4)wave+=.24*Math.sin(phase*2)+.1*Math.sin(phase*3);
          if(tone==='shimmer'&&hz*2.01<sampleRate*.4)wave=.65*Math.sin(phase)+.22*Math.sin(phase*2.01)+.14*Math.sin(phase*.997);
          const cutoff=Math.min(sampleRate*.2,(tone==='acid'?850+3800*Math.exp(-6*r):tone==='velvet'?2200:5400));filtered+=(wave-filtered)*(1-Math.exp(-TAU*cutoff/sampleRate));
          const attack=tone==='shimmer'?.025:.003,decay=tone==='shimmer'?1.2:tone==='velvet'?2.1:4;
          data[start+i]+=filtered*Math.min(1,t/attack)*Math.min(1,(count-i)/(sampleRate*.018))*Math.exp(-decay*r)*strength;
        }
      }else if(part.song&&part.instrument==='toy'&&songTones[event.tone]){
        const tone=event.tone,partials=songTones[tone];let phase=0;
        for(let i=0;i<count;i++){
          const t=i/sampleRate,r=i/Math.max(1,count-1),vibrato=tone==='kazoo'?.08*Math.sin(TAU*6*t)*Math.min(1,t/.05):tone==='reed'?.045*Math.sin(TAU*5*t):0;
          const hz=frequency*2**(((event.bend||0)*Math.exp(-t/.035)+vibrato)/12);phase+=TAU*hz/sampleRate;
          let wave=0;for(const [ratio,level]of partials){const band=clamp((sampleRate*.46-hz*ratio)/(sampleRate*.1),0,1);wave+=Math.sin(phase*ratio)*level*band*(tone==='marimba'?Math.exp(-t*ratio*3):1)}
          const decay=tone==='guitar'?4:tone==='marimba'?3:1.3,attack=tone==='organ'?.009:.004;
          data[start+i]+=wave*Math.min(1,t/attack)*Math.min(1,(count-i)/(sampleRate*.018))*Math.exp(-decay*r)*strength;
        }
      }else if(part.instrument==='pluck'){
        const delay=sampleRate/frequency-.5,n=Math.max(2,Math.floor(delay)),fraction=delay-n,noise=eventRandom(part.seed+':'+event.x+':'+event.note),line=new Float32Array(count);
        const loss=Math.exp(-1/(frequency*Math.max(.04,seconds)*.85));
        for(let i=0;i<count;i++){
          line[i]=i<n+2?(noise()*2-1)*.7:loss*.5*((1-fraction)*(line[i-n]+line[i-n-1])+fraction*(line[i-n-1]+line[i-n-2]));
          const fade=Math.max(0,Math.min(1,i/(sampleRate*.002),(count-i)/(sampleRate*.01)));
          data[start+i]+=line[i]*strength*fade;
        }
      }else if(part.instrument==='toy'){
        let phase=0,modPhase=0;
        const tone=event.tone||'wood',ratio=tone==='boing'?1.5:tone==='click'?3.7:1;
        const initialIndex=(tone==='boing'?2.6:tone==='click'?3.2:tone==='bass'?1.2:0)*(event.brightness??1);
        for(let i=0;i<count;i++){
          const r=i/Math.max(1,count-1),secondsElapsed=i/sampleRate;
          const bend=(event.bend||0)*(tone==='boing'?Math.exp(-5*r)*Math.cos(TAU*2*r):Math.exp(-7*r));
          const hz=clamp(frequency*2**(bend/12),32,sampleRate*.16);
          phase+=TAU*hz/sampleRate;modPhase+=TAU*hz*ratio/sampleRate;
          const index=Math.min(initialIndex*Math.exp(-4*r),Math.max(0,sampleRate*.28/(hz*ratio)-1));
          let wave=Math.sin(phase+index*Math.sin(modPhase));
          if(tone==='wood'&&hz*3<sampleRate*.4)wave+=.28*Math.sin(phase*3)*Math.exp(-10*r);
          if(tone==='bell'&&hz*2.76<sampleRate*.4)wave+=.35*Math.sin(phase*2)+.17*Math.sin(phase*2.76)*Math.exp(-3*r);
          const attack=Math.min(1,secondsElapsed/.004),release=Math.min(1,(count-i)/(sampleRate*.018));
          const envelope=attack*release*Math.exp(-(tone==='whistle'?1.4:tone==='click'?6:3.2)*r);
          data[start+i]+=wave*envelope*strength;
        }
      }else{
        let phase=0;for(let i=0;i<count;i++){const r=i/Math.max(1,count-1);phase+=TAU*frequency*2**((event.bend||0)*r/12)/sampleRate;data[start+i]+=Math.sin(phase)*Math.sin(Math.PI*r)**2*strength}
      }
    }
    if(part.performance&&part.echo){const delay=Math.round(part.duration*.04065*sampleRate);for(let i=delay;i<length;i++)data[i]+=data[i-delay]*part.echo}
    if(part.performance)for(let i=Math.max(0,length-Math.ceil(sampleRate*.025));i<length;i++)data[i]*=(length-1-i)/(sampleRate*.025);
    let peak=0,power=0;for(const sample of data){peak=Math.max(peak,Math.abs(sample));power+=sample*sample}
    const gain=Math.min(.26/Math.max(1e-9,Math.sqrt(power/length)),.82/Math.max(1e-9,peak));
    for(let i=0;i<length;i++)data[i]*=gain;
    return data;
  }
  // Layered video examples keep independent pitch traces. Undefined branches rest.
  api.renderAudio=function(pattern,sampleRate=48000,mode='vivid'){
    const tracks=pattern.layers||[{}],length=Math.round(pattern.duration*sampleRate);
    const result=new Float32Array(length);
    for(const track of tracks){
      const part={...pattern,...track},originalF=part.f;
      // The original catalog renderer scans −8…8 internally; adapt new domains.
      const adapted=mode==='original'&&part.version===2&&(part.minX!==-8||part.maxX!==8)?{...part,f:x=>originalF(part.minX+(x+8)/16*(part.maxX-part.minX))}:part;
      const events=mode==='vivid'&&part.instrument&&part.events;
      const data=events?renderEvents(part,sampleRate):mode==='original'?api.synthesize(adapted,sampleRate):synthesizeVivid(part,sampleRate);
      let gate=Number.isFinite(originalF(part.minX))?1:0;
      const smoothing=1-Math.exp(-1/(sampleRate*.0008));
      for(let i=0;i<length;i++){
        if(part.gaps){const x=part.minX+(part.maxX-part.minX)*i/Math.max(1,length-1);gate+=((Number.isFinite(originalF(x))?1:0)-gate)*smoothing}
        const x=part.minX+(part.maxX-part.minX)*i/Math.max(1,length-1),envelope=!events&&part.envelope?clamp(part.envelope(x),0,1):1;
        result[i]+=data[i]*(part.gaps?gate:1)*envelope*(part.weight??1)/Math.sqrt(tracks.length);
      }
    }
    // Song ensembles have coincident drum/chord attacks. A soft knee controls those
    // transients before level matching, keeping the melody audible between beats.
    if((pattern.song||pattern.performance)&&mode==='vivid'){let power=0;for(const v of result)power+=v*v;const gain=.23/Math.max(1e-9,Math.sqrt(power/length));for(let i=0;i<length;i++)result[i]=.75*Math.tanh(result[i]*gain/.75)}
    if(pattern.musical){let peak=0,power=0;for(const sample of result){peak=Math.max(peak,Math.abs(sample));power+=sample*sample}const gain=Math.min(.26/Math.max(1e-9,Math.sqrt(power/length)),.82/Math.max(1e-9,peak));for(let i=0;i<length;i++)result[i]*=gain}
    else if(tracks.length>1){let peak=0;for(const sample of result)peak=Math.max(peak,Math.abs(sample));if(peak>.86)for(let i=0;i<length;i++)result[i]*=.86/peak}
    if(pattern.continuous){
      const fade=Math.min(Math.ceil(sampleRate*.008),Math.floor(length/2));
      for(let i=0;i<fade;i++){const gain=.5-.5*Math.cos(Math.PI*i/fade);result[i]*=gain;result[length-1-i]*=gain}
    }
    return result;
  };
  if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
