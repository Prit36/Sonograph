/* Geometric scores: visible events and musical events use the same clock. */
(function(root){
  'use strict';
  const api=root.Sonograph,previousGenerate=api.generate,{mod,clamp}=api,TAU=2*Math.PI;
  const specs=[
    {id:'orbit_rave',name:'Orbit rave',kind:'orbit',scale:[0,2,3,5,7,9,10],root:110,formula:'P(u) = ((1.8+0.58cos5u)cos3u,<br>(1.8+0.58cos5u)sin3u, 0.58sin5u)',detail:'A 3:5 torus braid rotates in perspective. Two heads traverse it at different rates. Their vertical coordinates select Dorian scale degrees; every audible lead attack lights its exact braid position. The slower voice answers the faster voice. A sparse opening grows into interlocking arpeggios and a syncopated bass groove.'},
    {id:'cymatic_bloom',name:'Cymatic bloom',kind:'bloom',scale:[0,2,4,7,9],root:130.8128,formula:'F = cos(nπx)cos(mπy)−cos(mπx)cos(nπy)<br>F(x,y) = 0',detail:'Four symmetric standing-wave fields use mode pairs (2,3), (3,5), (4,7), (2,5). Zero contours form the visible pattern. Each lead event is placed at a sampled near-node; its coordinates select a pentatonic degree. Glass attacks, sustained spectral chords and a delayed breakbeat enter in stages. This is an analytic nodal-field artwork, not a physical sand or plate simulation.'},
    {id:'prism_break',name:'Prism break',kind:'prism',scale:[0,3,5,7,10],root:146.8324,formula:'Tᵢ(P) = ½(P+Vᵢ), i ∈ {0,1,2}<br>Pₖ = R(kπ/3)SₖP, k=0…5',detail:'A triangular iterated-function construction is reflected into six sectors. A base-three address identifies each illuminated cell and its pitch; more address digits reveal smaller triangles. Six mirrored copies flash together on the same note. A clipped FM pluck answers a glass voice over a broken bass rhythm; the third section adds a faster high-register run.'},
    {id:'fractal_drop',name:'Fractal drop',kind:'tree',scale:[0,2,4,7,9],root:98,formula:'P_child = P+ℓ(cosθ,sinθ)<br>ℓ_child = 0.72ℓ; θ_child = θ±α',detail:'A seven-level binary tree is generated recursively. Branch depth and left/right address choose notes. Internal branches grow first; leaf notes cascade after the midpoint as the bass and half-time drums arrive. A note travels along its own branch and rings at its tip. The final tree remains visible. Branch angle is seeded. This is a recursive geometric score, not a biological growth model.'},
    {id:'moire_motor',name:'Moiré motor',kind:'moire',scale:[0,2,3,5,7,9,10],root:123.4708,formula:'G₁ = cos(18x+φ); G₂ = cos(18(xcosα+ysinα)−φ)<br>I = (1+G₁)(1+G₂)/4',detail:'Two moving line gratings create a large-scale interference envelope. Angle α follows a slow sweep; phase φ follows the musical clock. Alternating voices use three- and four-step accent cycles, with their overlap emphasizing the bass. Each note marks its phase position; note height also controls the FM brightness. Four sections build from muted pulses to a stronger dance beat and then resolve.'}
  ];
  const entries=specs.map(s=>({...s,group:'Visual scores',description:'',reference:'visual-scores.html#'+s.id,discoveryWeight:6})),byId=new Map(entries.map(e=>[e.id,e]));
  function hash(seed){let h=2166136261;for(const c of seed)h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0}
  api.orbitPoint=function(u,offset=0){const a=TAU*u,r=1.8+.58*Math.cos(5*a+offset);return {x:r*Math.cos(3*a),y:r*Math.sin(3*a),z:.58*Math.sin(5*a+offset)}};
  function tree(angle){const nodes=[];function branch(parent,x,y,len,theta,depth,address){const node={parent,x,y,px:x+len*Math.cos(theta),py:y+len*Math.sin(theta),depth,address};nodes.push(node);const index=nodes.length-1;if(depth<6){branch(index,node.px,node.py,len*.72,theta-angle,depth+1,address*2);branch(index,node.px,node.py,len*.72,theta+angle,depth+1,address*2+1)}}branch(-1,0,-1.25,.73,Math.PI/2,0,0);return nodes}
  api.generate=function(seed,options={}){
    const s=byId.get(/^sg2-([a-z_]+)--/.exec(seed)?.[1]);if(!s)return previousGenerate(seed,options);
    const h=hash(seed),rootHz=s.root*2**((h%4)/12),degree=n=>s.scale[mod(n,s.scale.length)]+12*Math.floor(n/s.scale.length);
    const layers=[{voice:'Glass',instrument:'spectral',tone:'crystal',weight:.76,echo:.22,events:[]},{voice:'Bell',instrument:'spectral',tone:'velvet',weight:.46,echo:.14,events:[]},{voice:'Hollow',instrument:'toy',weight:.69,events:[]},{voice:'Pulse',instrument:'drums',weight:.48,events:[]}];
    const performance={kind:s.kind,angle:.42+(h%101)/500,modes:[[2,3],[3,5],[4,7],[2,5]]};
    function emit(track,t,n,span=.035,gain=.8,visual={},tone=null){if(t<0||t>.91)return;const e={x:t,span:Math.min(span,.985-t),note:n,gain,tone:tone||layers[track].tone||'bass',visual};layers[track].events.push(e);return e}
    if(s.kind==='orbit'){
      for(let i=0;i<40;i++){const t=.02+i*.0217,u=i/40,pt=api.orbitPoint(u);emit(0,t,12+degree(Math.round((pt.z/.58+1)*2.5)),.037,.73,{u,head:0},'pluck');if(i%5===3&&i>12)emit(0,t+.009,24+degree(mod(i,5)),.022,.38,{u:u+.01,head:0},'crystal')}
      for(let i=0;i<24;i++){const t=.035+i*.0355,u=i/24,pt=api.orbitPoint(u,Math.PI);emit(1,t,degree(Math.round((pt.z/.58+1)*2.5)),.048,.68,{u,head:1},'velvet')}
    }else if(s.kind==='bloom'){
      performance.nodes=performance.modes.map(([n,m])=>{const nodes=[];for(let iy=1;iy<42;iy++)for(let ix=1;ix<42;ix++){const x=ix/21-1,y=iy/21-1,F=Math.cos(n*Math.PI*x)*Math.cos(m*Math.PI*y)-Math.cos(m*Math.PI*x)*Math.cos(n*Math.PI*y);if(Math.abs(F)<.065)nodes.push({px:x,py:y})}return nodes});
      for(let stage=0;stage<4;stage++){
        const nodes=performance.nodes[stage],count=[7,11,17,9][stage];
        for(let j=0;j<count;j++){const target=[0,2,4,1,3,4,2,0][j%8],choices=nodes.filter(pos=>mod(Math.round((pos.px+1)*2+(pos.py+1)*3),5)===target),pos=choices[mod(j*37+h,choices.length)],n=mod(Math.round((pos.px+1)*2+(pos.py+1)*3),5);emit(0,.025+stage*.217+j*.193/count,12+degree(n)+(stage===2?12:0),.05,.66,{...pos,stage},'crystal')}
        [0,2,4].forEach(n=>emit(1,.016+stage*.217,degree(n+[0,3,1,0][stage]),.21,.5,{stage},'shimmer'));
      }
    }else if(s.kind==='prism'){
      for(let i=0;i<48;i++){if(i%8===6)continue;const stage=Math.floor(i/12),digits=2+stage,target=[0,2,4,3,2,1,4,2][i%8];let address=mod(i*7+h,3**digits),sum=0;
        for(let attempt=0;attempt<3**digits;attempt++){let a=address;sum=0;for(let j=0;j<digits;j++){sum+=a%3;a=Math.floor(a/3)}if(mod(sum,5)===target)break;address=mod(address+1,3**digits)}
        const n=degree(mod(sum,5))+12+(stage===2?12:0);emit(i%3===2?1:0,.02+i*.0181,n,.04,.67,{address,digits},i%3===2?'crystal':'pluck')}
    }else if(s.kind==='tree'){
      performance.nodes=tree(performance.angle);
      const ordered=performance.nodes.map((node,index)=>({...node,index})).sort((a,b)=>a.depth-b.depth||a.address-b.address);
      ordered.forEach((node,i)=>{const t=i<31?.02+i*.0124:.45+(i-31)*.0045;node.at=t;performance.nodes[node.index].at=t;emit(node.depth<3?1:0,t,degree(node.depth+mod(node.address,3))+(node.depth>4?12:0),node.depth<3?.09:.034,node.depth>4?.43:.68,{node:node.index},node.depth>4?'crystal':'pluck')});
      layers[0].instrument='pluck';layers[0].weight=.85;
    }else{
      for(let i=0;i<60;i++){const stage=Math.floor(i/15);if(i%4===3&&stage===0||i>55)continue;const phase=TAU*i/15,n=degree([0,2,4,2,1,3,4,6][i%8])+12;emit(0,.02+i*.0146,n,.028,i%4===0?.8:.48,{phase,cycle:4},'acid');if(i%3===0)emit(1,.025+i*.0146,degree([4,2,1,0][Math.floor(i/3)%4])+12,.048,.53,{phase,cycle:3},'velvet');if(i%12===0)emit(2,.02+i*.0146,-12,.045,.9,{phase})}
    }
    // Distinct rhythm sections; every drum onset is also a visible pulse.
    const rhythms={orbit:{kick:[0,6,10],snare:[4,12],bass:[0,3,6,10,14]},bloom:{kick:[0,7,10],snare:[4,12],bass:[0,6,10]},prism:{kick:[0,3,10],snare:[4,12],bass:[0,3,7,10,15]},tree:{kick:[0,7,10],snare:[8],bass:[0,7,10]},moire:{kick:[0,4,8,12],snare:[4,12],bass:[0,2,6,8,10,14]}};
    const r=rhythms[s.kind],roots=s.kind==='prism'?[0,3,2,0]:[0,3,4,0];
    for(let bar=0;bar<4;bar++){
      const offset=.014+bar*.217;
      if(s.kind==='tree'&&bar<2)continue;
      for(const [i,step]of r.bass.entries())emit(2,offset+step*.01355,degree(roots[bar]+(i%3===1?4:0))-12,.043,.8,{bar,step});
      for(const step of r.kick)emit(3,offset+step*.01355,-24,.03,.9,{bar,step},'kick');
      if(bar>0||s.kind==='moire')for(const step of r.snare)emit(3,offset+step*.01355,0,.025,.65,{bar,step},s.kind==='moire'?'clap':'snare');
      if(s.kind!=='bloom'||bar>0)for(let step=2;step<16;step+=bar===2?2:4)emit(3,offset+step*.01355,24,.011,.2,{bar,step},'hat');
    }
    emit(2,.905,-12,.07,.75);[0,2,4].forEach(n=>emit(1,.905,degree(n),.073,.5,{},'shimmer'));
    layers.forEach(l=>{l.events.sort((a,b)=>a.x-b.x);l.gaps=true;l.f=t=>{const e=l.events.findLast(e=>e.x<=t&&t<e.x+e.span);return e?e.note/11.4:NaN}});
    const coordinates={orbit:'Formula u is in radians; event positions store u/(2π).',prism:'Vertices Vᵢ are (0,0), (0.94,−0.53), (0.94,0.53). Sₖ reflects y for odd k and is the identity for even k.',moire:'Angle α=0.035+0.18sin(πt); phase φ=24πt.',bloom:'Coordinates x,y lie in [−1,1]. Modes are interpolated briefly at section boundaries.',tree:`Seeded branch angle α=${performance.angle.toFixed(3)} radians; initial length 0.73.`};
    const p={seed,version:2,type:s.id,name:s.name,group:s.group,family:'VISUAL SCORES',description:'',reference:s.reference,minX:0,maxX:1,duration:14,baseFrequency:rootHz/1.22,voice:'Glass',musical:true,performance,layers,f:layers[0].f,formula:s.formula,definitions:s.detail+` ${coordinates[s.kind]} Scan progress t runs from 0 to 1. The seed fixes geometry and transposition. Every visible note flash uses the corresponding event onset and position. Four independently weighted layers supply lead, answer, bass and percussion. Pitch f=${rootHz.toFixed(2)}·2^(n/12), with scale intervals (${s.scale.join(', ')}). Vivid uses the event instruments, short beat-related echoes and a soft mix knee; Original keeps the legacy pitch-curve voice. All dry notes end before t=0.985. The artwork follows the score clock, so pausing and restarting preserve alignment.`};
    return p;
  };
  api.catalog=[...entries,...api.catalog];api.groups=[...new Set(api.catalog.map(e=>e.group))];api.curation.added.push(...entries.map(e=>e.id));
  if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
