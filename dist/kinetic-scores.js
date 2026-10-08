/* Four geometric performances with different score and motion rules. */
(function(root){
  'use strict';
  const api=root.Sonograph,previousGenerate=api.generate,previousPaint=api.paintPerformance,{clamp,mod}=api,TAU=2*Math.PI;
  const specs=[
    {id:'euclid_carousel',name:'Euclid’s carousel',kind:'carousel',scale:[0,2,3,5,7,9,10],root:110,formula:'E(k,n,j) = 1 if (k(j−ρ) mod n) < k<br>(k,n) = (3,8), (5,12), (7,16)',details:'Three rhythm wheels distribute 3, 5 and 7 attacks across 8, 12 and 16 subdivisions of the same bar. The outer wheel carries a recurring melody; the middle answers in wood tones; the inner plays bass. The sweep crosses exactly the node that triggers each note. Filled nodes and their polygon show the attack pattern. Rotation offsets ρ and key are seeded. The final tonic is an extra cadence attack. The bass wheel enters after the opening bar.'},
    {id:'spiro_shuffle',name:'Spirograph shuffle',kind:'spiro',scale:[0,2,4,7,9],root:123.4708,formula:'x = 3cosu+d cos(3u/2)<br>y = 3sinu−d sin(3u/2)',details:'Two closed hypotrochoids use R=5, r=2 and different pen distances d. Each pen traverses u=0…4π per lap. Vertical position selects a major-pentatonic degree. A soft whistle melody and glass replies follow a 5:3 swung subdivision clock, with walking bass and brush accents. The second half changes register before a short tonic answer.'},
    {id:'dragon_groove',name:'Paper dragon groove',kind:'dragon',scale:[0,3,5,7,10],root:130.8128,formula:'D₀ = []; Dₙ₊₁ = Dₙ ⊕ [1] ⊕ (−reverse Dₙ)<br>Pⱼ₊₁ = Pⱼ+(cosθⱼ,sinθⱼ)',details:'Ten recursive paperfolding expansions produce 1023 quarter turns and a 1024-segment dragon curve. Here ⊕ concatenates turn lists and θ advances by ±π/2. A moving cursor unfolds the curve. Local fold direction offsets a recurring minor-pentatonic hook; alternate segments trade FM plucks and crystal replies. A broken beat becomes denser in the third bar, then leaves room for the ending.'},
    {id:'string_ballet',name:'Rubber-band ballet',kind:'strings',scale:[0,2,4,7,9],root:146.8324,formula:'yᵢ(s,t) = Σₙ₌₁⁵ Aᵢₙ(t)sin(nπs)<br>Aᵢₙ = Σₑ gₑ sin(nπaₑ)sin(28πnτₑ)e^(−τₑ/0.055)/n',details:'Five fixed-end strings form a pentagram and are tuned to a major-pentatonic scale. Each lead event plucks its selected string at position a, and the visual displacement perpendicular to each string sums five damped sine modes. τ is normalized time since that event. Each string joins vertex i to vertex i+2 of a regular pentagon; the display scales normalized displacement by 0.17 times the vertex radius. The displayed wave motion is slowed for readability, not an audio-frequency oscilloscope. The sound uses fractional-delay plucked-string synthesis, an interlocking high reply, syncopated bass and dry rim taps. A repeating hook gains a second voice after the first bar.'}
  ];
  const entries=specs.map(s=>({...s,group:'Visual scores',description:'',reference:'visual-scores.html#'+s.id,discoveryWeight:6})),byId=new Map(entries.map(e=>[e.id,e]));
  function hash(seed){let h=2166136261;for(const c of seed)h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0}
  const spiro=(u,d)=>({x:3*Math.cos(u)+d*Math.cos(1.5*u),y:3*Math.sin(u)-d*Math.sin(1.5*u)});
  function dragon(){let turns=[];for(let i=0;i<10;i++)turns=[...turns,1,...[...turns].reverse().map(v=>-v)];const points=[{x:0,y:0}];let x=1,y=0,angle=0;points.push({x,y});for(const turn of turns){angle+=turn*Math.PI/2;x+=Math.round(Math.cos(angle));y+=Math.round(Math.sin(angle));points.push({x,y})}const xs=points.map(p=>p.x),ys=points.map(p=>p.y),minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys),size=Math.max(maxX-minX,maxY-minY)/2;return {turns,points:points.map(p=>({x:(p.x-(minX+maxX)/2)/size,y:(p.y-(minY+maxY)/2)/size}))}}
  api.generate=function(seed,options={}){
    const s=byId.get(/^sg2-([a-z_]+)--/.exec(seed)?.[1]);if(!s)return previousGenerate(seed,options);
    const h=hash(seed),hz=s.root*2**((h%4)/12),degree=n=>s.scale[mod(n,s.scale.length)]+12*Math.floor(n/s.scale.length),m={kind:s.kind};
    const layers=[{voice:'Glass',instrument:'spectral',weight:.83,echo:.12,events:[]},{voice:'Bell',instrument:'spectral',weight:.5,echo:.09,events:[]},{voice:'Hollow',instrument:'toy',weight:.68,events:[]},{voice:'Pulse',instrument:'drums',weight:.43,events:[]}];
    const straight=step=>.018+step*.014,swing=step=>{const pair=Math.floor(step/4)*4,u=step-pair;return straight(pair+(u<=2?u*1.25:2.5+(u-2)*.75))},clock=s.kind==='spiro'?swing:straight;
    function emit(track,t,n,span,gain,visual={},tone='crystal'){if(t>.92)return;const e={x:t,span:Math.min(span,.985-t),note:n,gain,visual,tone};layers[track].events.push(e);return e}
    function slot(track,step,n,len=1.5,gain=.7,visual={},tone='crystal'){return emit(track,clock(step),n,clock(step+len)-clock(step),gain,visual,tone)}
    if(s.kind==='carousel'){
      m.rings=[{k:3,n:8,rotation:h%8,r:.94},{k:5,n:12,rotation:(h>>>4)%12,r:.67},{k:7,n:16,rotation:(h>>>8)%16,r:.4}];layers[1].instrument='toy';
      m.rings.forEach((ring,track)=>{ring.hits=Array.from({length:ring.n},(_,j)=>mod(mod(j-ring.rotation,ring.n)*ring.k,ring.n)<ring.k);for(let bar=0;bar<4;bar++){if(track===2&&bar===0)continue;let count=0;for(let j=0;j<ring.n;j++){if(!ring.hits[j])continue;const step=bar*16+j*16/ring.n;if(step>=60)continue;const n=track===2?degree([0,3,4,0][bar]+(count%2?4:0))-12:degree([0,2,4,3,2,1][mod(count+bar,6)])+(track===0?12:0);slot(track,step,n,track===2?2:1.7,track===0?.8:.65,{ring:track,node:j},track===0?'velvet':track===1?'wood':'bass');count++}}});
    }else if(s.kind==='spiro'){
      m.distances=[2.35+(h%7)*.03,3.1];layers[0].instrument='toy';layers[0].voice='Sine';
      for(let i=0;i<30;i++){const u=i/16*4*Math.PI,pt=spiro(u,m.distances[0]),n=degree(clamp(Math.round((pt.y/6+1)*2),0,4))+12+(i>=16&&i<24?12:0),e=slot(0,i*2,n,1.7,.78,{pen:0,u},'whistle');e.bend=i%4===3?-1.5:.6}
      for(let i=0;i<15;i++){const step=i*4+1.5,u=step/32*4*Math.PI,pt=spiro(u,m.distances[1]);slot(1,step,12+degree(clamp(Math.round((pt.y/6+1)*2),0,4)),1.6,.6,{pen:1,u},'crystal')}
    }else if(s.kind==='dragon'){
      Object.assign(m,dragon());const hook=[0,2,4,3,2,0,1,4];
      for(let step=0;step<60;step++){if(step%8===6||step%2===1&&step<16)continue;const index=Math.round(step/64*(m.points.length-1)),turn=m.turns[Math.min(index,m.turns.length-1)],n=degree(mod(hook[Math.floor(step/2)%8]+(step%2?turn:0),5))+12+(step>=32&&step<48?12:0);slot(step%4===3?1:0,step,n,1.45,step%2?.49:.76,{index},step%4===3?'crystal':'pluck')}
    }else{
      layers[0].instrument='pluck';layers[1].instrument='pluck';layers[0].echo=.08;layers[1].echo=.06;m.pluck=.28+(h%41)/100;
      const hook=[0,null,2,4,null,3,2,null,1,0,null,2,3,null,1,null];
      for(let step=0;step<60;step++){const string=hook[step%16];if(string===null)continue;slot(0,step,12+s.scale[string],1.85,.83,{string,a:m.pluck},'pluck');if(step>=16&&step%4===2){const answer=mod(string+2,5);slot(1,step+.75,24+s.scale[answer],1.65,.48,{string:answer,a:1-m.pluck},'pluck')}}
    }
    // Different supporting grooves preserve each lead's space and accents.
    const rhythms={carousel:{kick:[0,8],snare:[4,12],bass:[]},spiro:{kick:[0,8],snare:[4,12],bass:[0,4,8,12]},dragon:{kick:[0,3,10],snare:[4,12],bass:[0,3,7,10]},strings:{kick:[0,6,10],snare:[4,12],bass:[0,3,6,10,14]}};
    const r=rhythms[s.kind];
    for(let bar=0;bar<4;bar++){
      r.bass.forEach((step,i)=>{if(bar*16+step>=60)return;slot(2,bar*16+step,degree([0,3,4,0][bar]+(i%2?4:0))-12,2.2,.8,{},'bass')});
      r.kick.forEach(step=>{if(bar*16+step<60)slot(3,bar*16+step,-24,2,.85,{},'kick')});
      r.snare.forEach(step=>{if(bar*16+step<60)slot(3,bar*16+step,0,1.5,.57,{},s.kind==='spiro'?'brush':s.kind==='strings'?'rim':'snare')});
      for(let step=2;step<16;step+=bar===2&&s.kind==='dragon'?2:4)if(bar*16+step<60)slot(3,bar*16+step,24,.6,.16,{},'hat');
    }
    const last=s.kind==='strings'?{string:0,a:m.pluck}:s.kind==='spiro'?{pen:0,u:8*Math.PI}:s.kind==='dragon'?{index:Math.round(62/64*(m.points.length-1))}:{ring:0,node:7};
    slot(0,62,12,1.8,.85,last,s.kind==='spiro'?'whistle':s.kind==='carousel'?'velvet':'crystal');
    emit(2,.916,-12,.065,.75,{},'bass');[0,2,4].forEach(n=>emit(1,.916,degree(n),.068,.4,{},s.kind==='carousel'?'bell':'shimmer'));
    layers.forEach(l=>{l.events.sort((a,b)=>a.x-b.x);l.gaps=true;l.f=t=>{const e=l.events.findLast(e=>e.x<=t&&t<e.x+e.span);return e?e.note/11.4:NaN}});
    return {seed,version:2,type:s.id,name:s.name,group:s.group,family:'VISUAL SCORES',description:'',reference:s.reference,minX:0,maxX:1,duration:14,baseFrequency:hz/1.22,voice:'Glass',musical:true,performance:m,layers,f:layers[0].f,formula:s.formula,definitions:s.details+` Root=${hz.toFixed(3)} Hz; equal-tempered pitch f=root·2^(n/12), scale intervals=(${s.scale.join(', ')}). The straight score clock is t=0.018+0.014j. Spirograph shuffle delays every second eighth to 5/8 of its quarter. Geometry, key and event score are deterministic from the seed. Vivid plays the event instruments and Original uses the legacy pitch voices. Both scan speeds scale the same normalized timeline. All dry notes finish by t=0.985.`};
  };
  const colors=['#117d88','#5845c5','#b42b70','#9b620b'];
  api.paintPerformance=function(c,p,w,h,progress=null,thumbnail=false){
    const m=p.performance;if(!['carousel','spiro','dragon','strings'].includes(m.kind))return previousPaint(c,p,w,h,progress,thumbnail);
    const t=progress===null?.61:clamp(progress,0,1),unit=Math.min(w*.43,h*.44),cx=w/2,cy=h/2,recent=track=>p.layers[track].events.filter(e=>t>=e.x&&t-e.x<.065);
    c.save();c.fillStyle='#ffffff';c.fillRect(0,0,w,h);c.lineCap='round';c.lineJoin='round';
    const dot=(x,y,r,color)=>{c.fillStyle=color;c.beginPath();c.arc(x,y,r,0,TAU);c.fill()},mark=(x,y,color,r=3)=>{dot(x,y,r+1.5,'#ffffff');dot(x,y,r,color)};
    if(m.kind==='carousel'){
      const phase=mod((t-.018)/.224,1),spin=t*.32;
      m.rings.forEach((ring,k)=>{const pos=j=>({x:cx+unit*ring.r*Math.cos(-Math.PI/2+TAU*j/ring.n+spin),y:cy+unit*ring.r*Math.sin(-Math.PI/2+TAU*j/ring.n+spin)}),hits=ring.hits.flatMap((hit,j)=>hit?[j]:[]);
        c.strokeStyle=colors[k];c.lineWidth=thumbnail?1:1.5;c.beginPath();hits.forEach((j,i)=>{const v=pos(j);i?c.lineTo(v.x,v.y):c.moveTo(v.x,v.y)});c.closePath();c.stroke();
        ring.hits.forEach((hit,j)=>{const v=pos(j);if(hit)dot(v.x,v.y,thumbnail?1.9:3,colors[k]);else{c.strokeStyle='#b9bdc8';c.lineWidth=1;c.beginPath();c.arc(v.x,v.y,thumbnail?1.2:2,0,TAU);c.stroke()}});
        for(const e of recent(k)){if(e.visual.node===undefined)continue;const v=pos(e.visual.node);mark(v.x,v.y,colors[k],(thumbnail?2.1:4.2)*(1+.25*Math.exp(-(t-e.x)/.015)))}
      });
      const a=-Math.PI/2+TAU*phase+spin;c.strokeStyle='#4c5162';c.lineWidth=thumbnail?.8:1.2;c.beginPath();c.moveTo(cx,cy);c.lineTo(cx+unit*.99*Math.cos(a),cy+unit*.99*Math.sin(a));c.stroke();dot(cx,cy,thumbnail?1.5:2.5,'#4c5162');
    }else if(m.kind==='spiro'){
      const scale=unit/6.25;
      m.distances.forEach((d,k)=>{c.strokeStyle=colors[k];c.lineWidth=thumbnail?1:1.65;c.beginPath();for(let j=0;j<=720;j++){const v=spiro(j/720*4*Math.PI,d),x=cx+v.x*scale,y=cy-v.y*scale;j?c.lineTo(x,y):c.moveTo(x,y)}c.stroke();for(const e of recent(k)){if(e.visual.pen===undefined)continue;const v=spiro(e.visual.u,d);mark(cx+v.x*scale,cy-v.y*scale,colors[k],thumbnail?2:3.8)}});
    }else if(m.kind==='dragon'){
      const end=progress===null?m.points.length-1:Math.floor(clamp((t-.018)/.896,0,1)*(m.points.length-1));
      for(let start=0;start<end;start+=16){c.strokeStyle=colors[Math.floor(start/16)%2];c.lineWidth=thumbnail?.9:1.4;c.beginPath();for(let j=start;j<=Math.min(start+16,end);j++){const v=m.points[j],x=cx+v.x*unit,y=cy-v.y*unit;j===start?c.moveTo(x,y):c.lineTo(x,y)}c.stroke()}
      if(end>=0){const v=m.points[end];mark(cx+v.x*unit,cy-v.y*unit,colors[2],thumbnail?2:3.5)}
      for(let k=0;k<2;k++)for(const e of recent(k)){if(e.visual.index===undefined)continue;const v=m.points[e.visual.index];if(e.visual.index<=end)mark(cx+v.x*unit,cy-v.y*unit,colors[k],thumbnail?1.7:3)}
    }else{
      const radius=unit*.94,vertices=Array.from({length:5},(_,i)=>({x:cx+radius*Math.cos(-Math.PI/2+TAU*i/5),y:cy+radius*Math.sin(-Math.PI/2+TAU*i/5)}));
      for(let string=0;string<5;string++){
        const from=vertices[string],to=vertices[(string+2)%5],dx=to.x-from.x,dy=to.y-from.y,length=Math.hypot(dx,dy),events=p.layers.slice(0,2).flatMap(l=>l.events).filter(e=>e.visual.string===string&&t>=e.x&&t-e.x<.22),amps=Array.from({length:5},(_,i)=>events.reduce((sum,e)=>{const age=t-e.x,n=i+1;return sum+e.gain*Math.sin(n*Math.PI*e.visual.a)*Math.sin(28*Math.PI*n*age)*Math.exp(-age/.055)/n},0)),wave=s=>amps.reduce((sum,a,i)=>sum+a*Math.sin((i+1)*Math.PI*s),0)*radius*.17,point=s=>{const v=wave(s);return {x:from.x+dx*s-dy/length*v,y:from.y+dy*s+dx/length*v}};
        c.strokeStyle=colors[string%4];c.lineWidth=thumbnail?1:1.8;c.beginPath();for(let j=0;j<=180;j++){const v=point(j/180);j?c.lineTo(v.x,v.y):c.moveTo(v.x,v.y)}c.stroke();dot(from.x,from.y,thumbnail?1.5:2.5,colors[string%4]);dot(to.x,to.y,thumbnail?1.5:2.5,colors[string%4]);
        events.filter(e=>t-e.x<.035).forEach(e=>{const v=point(e.visual.a);mark(v.x,v.y,colors[string%4],thumbnail?2:3.5)});
      }
    }
    c.restore();
  };
  api.catalog=[...entries,...api.catalog];api.groups=[...new Set(api.catalog.map(e=>e.group))];api.curation.added.push(...entries.map(e=>e.id));
  if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
