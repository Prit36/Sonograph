/* Seeded music machines. Simulation events are the audio score. */
(function(root){
  'use strict';
  const api=root.Sonograph,previousGenerate=api.generate,{clamp,mod}=api,TAU=2*Math.PI,entries=[];
  const colors=['#6355df','#d76887','#229d8d','#dda642','#7c83cf','#b576b8'];
  function random(seed){let h=2166136261;for(const c of seed)h=Math.imul(h^c.charCodeAt(0),16777619);return()=>{h+=0x6D2B79F5;let t=Math.imul(h^(h>>>15),h|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296}}
  const shuffle=(a,r)=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
  const add=(id,name,formula,details,build)=>entries.push({id,name,formula,details,build,group:'Music machines',description:'',reference:'music-machines.html#'+id,discoveryWeight:5});
  function score(seed){const r=random(seed),scale=r()<.5?[0,2,4,7,9]:[0,3,5,7,10],rootHz=[130.8128,146.8324,164.8138][Math.floor(r()*3)];return {r,scale,rootHz,events:[],cues:[],note:n=>scale[mod(n,5)]+12*Math.floor(n/5)}}
  function emit(q,t,n,tone='wood',gain=.75,span=.035,location=null,bend=0){
    if(t<0||t>.88)return;
    q.events.push({x:t,span:Math.min(span,.99-t),note:q.note(n),tone,gain,bend});
    if(location)q.cues.push({t,x:location.x,y:location.y,color:colors[mod(n,colors.length)]});
  }
  function finish(q){
    // A short tonic answer after the machine's busiest section, with breathing room.
    [0,4,5].forEach((n,i)=>q.events.push({x:.9+i*.026,span:.075-i*.012,note:q.note(n),tone:'bell',gain:.65,bend:0}));
    q.events.sort((a,b)=>a.x-b.x);q.cues.sort((a,b)=>a.t-b.t);
  }
  function frameAt(frames,t){let lo=0,hi=frames.length-1;while(lo<hi){const mid=Math.ceil((lo+hi)/2);if(frames[mid].t<=t)lo=mid;else hi=mid-1}return frames[lo]}
  function pinball(q,c){
    const bumpers=Array.from({length:5},(_,i)=>({x:.35+(i%3)*.43+(q.r()-.5)*.08,y:.27+Math.floor(i/3)*.29,r:.085}));
    let x=.8,y=.86,angle=c.a*Math.PI/180,vx=Math.sin(angle)*.85,vy=-Math.cos(angle)*.85,last=-1;const frames=[];
    for(let i=0;i<=560;i++){
      const t=i/560*.86,dt=.01;vy+=.12*dt;x+=vx*dt;y+=vy*dt;
      let hit=-1;if(x<.04){x=.04;vx=Math.abs(vx);hit=5}if(x>1.56){x=1.56;vx=-Math.abs(vx);hit=6}if(y<.04){y=.04;vy=Math.abs(vy);hit=7}if(y>.94){y=.94;vy=-Math.abs(vy);hit=8}
      bumpers.forEach((b,k)=>{const dx=x-b.x,dy=y-b.y,d=Math.hypot(dx,dy),radius=b.r+.027;if(d<radius){const nx=dx/(d||1),ny=dy/(d||1),dot=vx*nx+vy*ny;if(dot<0){vx-=2*dot*nx;vy-=2*dot*ny;hit=k}x=b.x+nx*radius;y=b.y+ny*radius}});
      if(hit>=0&&t-last>.018){const speed=Math.hypot(vx,vy);emit(q,t,hit<5?hit+2:mod(i,5)-5,hit<5?'boing':'bass',hit<5?.65+.2*Math.min(1,speed):.4,hit<5?.045:.028,{x,y},hit<5?8:-5);q.events.at(-1).brightness=clamp(speed/.7,.6,1.6);if(hit<5)emit(q,t+.027,hit+7,'bell',.35,.035,{x,y});last=t}
      frames.push({t,x,y});
    }
    return {kind:'pinball',bumpers,frames};
  }
  function sorting(q,c){
    const a=shuffle(Array.from({length:12},(_,i)=>i+1),q.r),steps=[{a:[...a],pair:[],action:'start'}];
    const record=(i,j,action)=>steps.push({a:[...a],pair:[i,j],action});
    if(c.s===1){for(let i=1;i<a.length;i++)for(let j=i;j>0;j--){record(j-1,j,'compare');if(a[j-1]<=a[j])break;[a[j-1],a[j]]=[a[j],a[j-1]];record(j-1,j,'swap')}}
    else if(c.s===2){for(let i=0;i<a.length-1;i++){let m=i;for(let j=i+1;j<a.length;j++){record(m,j,'compare');if(a[j]<a[m])m=j}if(m!==i){[a[i],a[m]]=[a[m],a[i]];record(i,m,'swap')}}}
    else {for(let end=a.length-1;end>0;end--){let changed=false;for(let j=0;j<end;j++){record(j,j+1,'compare');if(a[j]>a[j+1]){[a[j],a[j+1]]=[a[j+1],a[j]];record(j,j+1,'swap');changed=true}}if(!changed)break}}
    const frames=steps.map((s,i)=>({...s,t:i/Math.max(1,steps.length-1)*.84}));
    frames.forEach((f,i)=>{if(f.action==='swap'){const v=f.a[f.pair[0]];emit(q,f.t,Math.floor(v/2),'wood',.8,.026,{x:.13+f.pair[0]*.115,y:.87-v*.055});emit(q,f.t+.008,Math.floor(f.a[f.pair[1]]/2)-5,'bell',.35,.025)}else if(i%5===0&&f.pair.length)emit(q,f.t,mod(f.a[f.pair[0]],5)+5,'click',.24,.012)});
    return {kind:'sorting',frames};
  }
  function ant(q,c){
    const cols=19,rows=11,grid=Array(cols*rows).fill(0);let x=9,y=5,d=0;const frames=[];
    for(let i=0;i<=c.n;i++){
      const t=i/c.n*.84,idx=y*cols+x,old=grid[idx];frames.push({t,grid:[...grid],x,y,d});
      if(i===c.n)break;
      d=mod(d+(old?-1:1),4);grid[idx]=1-old;
      if(i%2===0||old)emit(q,t,mod(x+2*y,10),old?'boing':'wood',old?.7:.5,.023,{x:.1+(x+.5)*1.4/cols,y:.1+(y+.5)*.8/rows},old?-6:0);
      x=mod(x+[0,1,0,-1][d],cols);y=mod(y+[-1,0,1,0][d],rows);
    }
    return {kind:'ant',cols,rows,frames};
  }
  function domino(q,c){
    const nodes=[];for(let i=0;i<7;i++)nodes.push({x:.15+i*.11,y:.5,parent:i-1,depth:i});
    for(let branch=0;branch<2;branch++)for(let i=0;i<5;i++)nodes.push({x:.86+i*.12,y:.5+(branch?1:-1)*(.09+i*.065),parent:i===0?6:7+branch*5+i-1,depth:7+i,branch});
    nodes.forEach((node,i)=>{node.t=node.parent<0?.04:nodes[node.parent].t===Infinity?Infinity:nodes[node.parent].t+.067;if(c.b&&i===9)node.t=Infinity;if(Number.isFinite(node.t))emit(q,node.t,node.branch===0?11-node.depth:node.depth,'wood',.75,.031,node,i===6?8:0)});
    return {kind:'domino',nodes,broken:!!c.b};
  }
  function maze(q){
    const cols=9,rows=6,cells=Array.from({length:cols*rows},()=>({walls:[1,1,1,1]})),visited=new Set([0]),stack=[0];
    const neighbors=id=>{const x=id%cols,y=Math.floor(id/cols);return [[0,y>0?id-cols:-1],[1,x<cols-1?id+1:-1],[2,y<rows-1?id+cols:-1],[3,x>0?id-1:-1]].filter(v=>v[1]>=0)};
    while(stack.length){const current=stack.at(-1),next=neighbors(current).filter(v=>!visited.has(v[1]));if(!next.length){stack.pop();continue}const [d,id]=next[Math.floor(q.r()*next.length)];cells[current].walls[d]=0;cells[id].walls[(d+2)%4]=0;visited.add(id);stack.push(id)}
    const path=[0],seen=new Set([0]),walk=[{id:0,back:false}],goal=cells.length-1;let done=false;
    function search(id){if(id===goal){done=true;return}for(const [d,next]of neighbors(id)){if(done)break;if(cells[id].walls[d]||seen.has(next))continue;seen.add(next);path.push(next);walk.push({id:next,back:false,d});search(next);if(!done){path.pop();walk.push({id,back:true,d:(d+2)%4})}}}
    search(0);
    const frames=walk.map((step,i)=>({...step,t:i/Math.max(1,walk.length-1)*.84}));
    frames.forEach((f,i)=>{if(i%2===0||f.back)emit(q,f.t,(f.back?-2:2)+mod(f.id%cols+Math.floor(f.id/cols),5),f.back?'whistle':'wood',f.back?.45:.65,.025,{x:.12+(f.id%cols+.5)*1.36/cols,y:.09+(Math.floor(f.id/cols)+.5)*.82/rows},f.back?-9:0)});
    return {kind:'maze',cols,rows,cells,frames,solution:[...path]};
  }
  function magnets(q,c){
    const magnets=[{x:.1+c.x1*.014,y:.15+c.y1*.007,sign:1},{x:.1+c.x2*.014,y:.15+c.y2*.007,sign:-1}],particles=Array.from({length:4},(_,i)=>({x:.25+i*.32,y:.36+(i%2)*.27,vx:(q.r()-.5)*.5,vy:(q.r()-.5)*.5})),frames=[],last=Array(4).fill(-1),near=Array(4).fill(false);
    for(let i=0;i<=480;i++){
      const t=i/480*.84;frames.push({t,particles:particles.map(p=>({...p}))});
      particles.forEach((p,j)=>{let ax=0,ay=0;for(const m of magnets){const dx=m.x-p.x,dy=m.y-p.y,den=(dx*dx+dy*dy+.014)**1.5;ax+=m.sign*.055*dx/den;ay+=m.sign*.055*dy/den}const oldAngle=Math.atan2(p.vy,p.vx);p.vx=clamp((p.vx+ax*.012)*.996,-1,1);p.vy=clamp((p.vy+ay*.012)*.996,-1,1);p.x+=p.vx*.012;p.y+=p.vy*.012;
        let wall=false;if(p.x<.04||p.x>1.56){p.x=clamp(p.x,.04,1.56);p.vx*=-1;wall=true}if(p.y<.04||p.y>.96){p.y=clamp(p.y,.04,.96);p.vy*=-1;wall=true}
        const close=Math.hypot(p.x-magnets[0].x,p.y-magnets[0].y)<.2,turn=Math.abs(Math.atan2(p.vy,p.vx)-oldAngle)>.3;
        if(t-last[j]>.045&&(wall||close&&(!near[j]||i%24===0)||turn&&i%4===0)){emit(q,t,j+Math.floor(p.y*5),'boing',.6,.035,p,close?5:-5);last[j]=t}near[j]=close;
      });
      for(let a=0;a<4;a++)for(let b=a+1;b<4;b++)if(Math.hypot(particles[a].x-particles[b].x,particles[a].y-particles[b].y)<.1&&t-last[a]>.06){emit(q,t,a+b+3,'bell',.65,.035,particles[a]);last[a]=t}
    }
    return {kind:'magnets',magnets,frames};
  }
  function crossings(points){const result=[];for(let i=0;i<points.length-1;i++)for(let j=i+2;j<points.length-1;j++){const a=points[i],b=points[i+1],c=points[j],d=points[j+1],den=(b.x-a.x)*(d.y-c.y)-(b.y-a.y)*(d.x-c.x);if(Math.abs(den)<1e-8)continue;const u=((c.x-a.x)*(d.y-c.y)-(c.y-a.y)*(d.x-c.x))/den,v=((c.x-a.x)*(b.y-a.y)-(c.y-a.y)*(b.x-a.x))/den;if(u>.001&&u<.999&&v>.001&&v<.999)result.push({x:a.x+u*(b.x-a.x),y:a.y+u*(b.y-a.y),key:i+':'+j})}return result}
  function knot(q,c){
    const frames=[];let previous=[];
    for(let i=0;i<=96;i++){const t=i/96*.84,pull=1-(1-i/96)**c.k,points=Array.from({length:41},(_,j)=>{const u=j/40,a=TAU*u;return {x:(1-pull)*(.8+.5*Math.sin(3*a)+.15*Math.sin(7*a))+pull*(.12+1.36*u),y:.5+(1-pull)*(.3*Math.cos(2*a)+.06*Math.sin(5*a))}}),cross=crossings(points),keys=new Set(cross.map(v=>v.key));
      const released=previous.filter(v=>!keys.has(v.key));if(released.length&&i%2===0){const p=released[0];emit(q,t,mod(released.length+i,10),'boing',.8,.045,p,10)}previous=cross;frames.push({t,points,cross});
    }
    emit(q,.84,0,'wood',.65,.05,frames.at(-1).points[0]);emit(q,.872,4,'bell',.5,.04,frames.at(-1).points.at(-1));return {kind:'knot',frames};
  }
  function puzzle(q,c){
    const homes=Array.from({length:6},(_,i)=>({x:.55+(i%3)*.24,y:.35+Math.floor(i/3)*.26})),starts=[{x:.16,y:.2},{x:1.34,y:.18},{x:.16,y:.5},{x:1.36,y:.5},{x:.2,y:.83},{x:1.3,y:.83}],order=shuffle(Array.from({length:6},(_,i)=>i),q.r),arrivals=Array(6).fill(0);let remaining=0;
    order.forEach(id=>{arrivals[id]=c.p&(1<<id)?0:.1+remaining++*.115});
    for(let i=0;i<48;i++){const t=i/56,count=arrivals.filter(v=>v<=t).length;for(let piece=0;piece<6;piece++){if(arrivals[piece]>t||mod(i+piece*2,6)>=2)continue;emit(q,t,mod(i+piece,5)+(piece%2?5:0),piece%3===0?'bell':piece%3===1?'wood':'whistle',.35+.045*count,.027,homes[piece])}}
    arrivals.forEach((t,i)=>{if(t>0)emit(q,t,i+3,'boing',.75,.05,homes[i],6)});
    return {kind:'puzzle',homes,starts,arrivals,order,connected:c.p};
  }
  add('musical_pinball','Musical pinball','v′ = v−2(v·n)n<br>f = f₀·2^(s/12)', 'A seeded ball reflects off five bumpers and the table walls. Collision time triggers the note and its visual flash; bumper identity chooses a pentatonic degree and a short bell reply. Ball speed controls the boing brightness. Launch angle changes the actual trajectory. Wall hits are softer bass taps.',pinball);
  add('sorting_orchestra','Sorting orchestra','swap(aᵢ,aⱼ) → two notes<br>s = scale(⌊aᵢ/2⌋)', 'Actual bubble, insertion or selection sort on twelve seeded distinct values. Comparisons are occasional quiet ticks; swaps play paired plucks. The final ordered state gets a tonic answer.',sorting);
  add('ant_composer','Ant composer','white → turn right; black → turn left<br>cell′ = 1−cell', 'Langton-style ant on a wrapping 19 by 11 grid. It turns, toggles the cell, then moves. Cell visits choose scale degrees; revisited black cells add bent accents. The step count changes the generated score.',ant);
  add('domino_reactions','Domino reactions','t_child = t_parent+0.067<br>no link → no propagation', 'A falling trunk branches into two chains. Only reached dominoes trigger notes; the broken-link control leaves one branch standing. Falls take a short animated interval after their musical onset.',domino);
  add('sound_maze','Sound maze','DFS: visit → explore → backtrack<br>turn direction → pitch gesture', 'A seeded perfect maze is carved by depth-first search, then explored by a separate depth-first walk until the exit is reached. Forward steps pluck; backtracking whistles downward. The successful route is highlighted at the end.',maze);
  add('magnetic_dancers','Magnetic dancers','a = Σ σ·0.055(m−p)/(|m−p|²+0.014)^(3/2)', 'Four particles move under one attracting and one repelling magnet, with damping and reflecting boundaries. Close encounters, direction reversals and wall contacts trigger notes. Drag either magnet or use the position controls; release recalculates the score from the new field.',magnets);
  add('knot_untying','Knot untying','P(u,t) = (1−λ)K(u)+λL(u)<br>λ = 1−(1−t/0.84)^k', 'A planar forty-segment tangle morphs into a straight line. Segment intersections are computed at each frame; disappearing crossing pairs release boing notes. This is a planar untangling illustration, not a physical three-dimensional knot solver. Tension changes the release timing.',knot);
  add('puzzle_harmony','Puzzle-piece harmony','connected pieces → interlocking phrases<br>pieceᵢ → voiceᵢ', 'Six matching pieces assemble into a two-row picture. Each connection activates another interlocking musical part; the default replay assembles the remaining pieces automatically. Drag a piece onto its matching numbered home, or use Connect next. Initial connections are saved in the seed.',puzzle);
  const byId=new Map(entries.map(e=>[e.id,e]));
  const defaults={a:-24,s:0,n:96,b:0,x1:32,y1:42,x2:74,y2:55,k:2,p:0};
  api.machineConfig=function(seed){const c={...defaults},tail=seed.split('~')[1]||'';for(const pair of tail.split('_')){const [key,value]=pair.split('=');if(Object.hasOwn(c,key)&&Number.isFinite(Number(value)))c[key]=Number(value)}c.a=clamp(c.a,-65,65);c.s=clamp(Math.round(c.s),0,2);c.n=clamp(Math.round(c.n),32,160);c.b=c.b?1:0;for(const key of ['x1','y1','x2','y2'])c[key]=clamp(Math.round(c[key]),0,100);c.k=clamp(c.k,1,4);c.p=clamp(Math.round(c.p),0,63);return c};
  api.machineSeed=function(pattern,patch){const c={...pattern.machineConfig,...patch},tail=Object.keys(defaults).filter(k=>c[k]!==defaults[k]).map(k=>k+'='+c[k]).join('_');return pattern.seed.split('~')[0]+(tail?'~'+tail:'')};
  api.generate=function(seed,options={}){
    const entry=byId.get(/^sg2-([a-z_]+)--/.exec(seed)?.[1]);if(!entry)return previousGenerate(seed,options);
    const q=score(seed.split('~')[0]),config=api.machineConfig(seed),machine=entry.build(q,config);finish(q);machine.cues=q.cues;
    const events=q.events,at=t=>{let lo=0,hi=events.length-1,index=-1;while(lo<=hi){const mid=(lo+hi)>>1;if(events[mid].x<=t){index=mid;lo=mid+1}else hi=mid-1}const e=events[index];return e&&t<e.x+e.span?e:null},f=t=>{const e=at(t);return e?e.note/11.4:NaN};
    return {seed,version:2,type:entry.id,name:entry.name,group:entry.group,family:'MUSIC MACHINES',description:'',reference:entry.reference,minX:0,maxX:1,duration:14,baseFrequency:q.rootHz/1.22,voice:'Bell',musical:true,machine,machineConfig:config,events,layers:[{f,instrument:'toy',events,voice:'Bell'}],f,formula:entry.formula,definitions:entry.details+` Scan progress is t=0…1; machine events occupy t≤0.88 and the closing answer t=0.9…0.952. Each event has a smooth attack, an exponential body and a release. Pitch is an equal-tempered pentatonic degree over root ${q.rootHz} Hz. The simulation and score are fixed by the seed, including control settings after ~. Vivid plays the event instruments; Original uses the legacy pitch-curve voice.`};
  };
  // Rendering follows below. These helpers are also shared by pointer controls.
  api.machineViewport=function(w,h,thumbnail=false){const unit=Math.min((w-(thumbnail?8:24))/1.6,h-(thumbnail?8:34));return {unit,left:(w-unit*1.6)/2,top:(h-unit)/2,width:unit*1.6,height:unit}};
  api.machineFrame=frameAt;
  api.catalog=[...entries,...api.catalog];api.groups=[...new Set(api.catalog.map(e=>e.group))];api.curation.added.push(...entries.map(e=>e.id));
  if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
