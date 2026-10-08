/* Original four-bar songs. One deterministic event score drives sound and view. */
(function(root){
  'use strict';
  const api=root.Sonograph,previousGenerate=api.generate,{mod}=api;
  const major=[0,2,4,5,7,9,11],minor=[0,2,3,5,7,8,10],dorian=[0,2,3,5,7,9,10],harmonic=[0,2,3,5,7,8,11];
  // Melodies contain scale degrees, with dots for rests; every slot is an eighth note.
  const specs=[
    {id:'duck_funk',name:'Rubber duck funk',style:'Funk',scale:dorian,a:'0 . 2 4 . 2 6 4',b:'7 6 . 4 2 . 1 0',tone:'kazoo',prog:[0,3,4,0],bass:[[0,0],[3,0],[6,4],[10,7],[14,4]],chord:[2,7,10,14],kick:[0,6,10],snare:[4,12],hat:[0,2,4,6,8,10,12,14],bend:1.8},
    {id:'kazoo_heist',name:'The kazoo heist',style:'Spy theme',scale:harmonic,a:'0 . 0 1 2 . 4 3',b:'6 . 5 4 2 1 . 0',tone:'kazoo',prog:[0,5,4,0],bass:[[0,0],[4,1],[8,2],[12,1]],chord:[0,6,12],kick:[0,8],snare:[6,14],hat:[2,6,10,14],chromatic:true},
    {id:'pixel_picnic',name:'Pixel picnic',style:'Chiptune',scale:major,a:'0 4 7 6 4 . 2 4',b:'5 4 2 1 2 4 7 .',tone:'chip',prog:[0,5,3,0],bass:[[0,0],[4,7],[8,4],[12,7]],chord:[0,4,8,12],kick:[0,8,11],snare:[4,12],hat:[0,2,4,6,8,10,12,14],arp:true},
    {id:'moonwalk_mambo',name:'Moonwalk mambo',style:'Mambo',scale:major,a:'4 . 2 0 . 4 5 4',b:'7 6 . 4 . 2 1 2',tone:'marimba',prog:[0,1,4,0],bass:[[0,0],[6,4],[10,0],[14,4]],chord:[0,3,6,10,12],kick:[0,7,10],snare:[],hat:[2,6,10,14],clave:[0,3,6,10,12]},
    {id:'penguin_waltz',name:'Penguin in a tuxedo',style:'Waltz',scale:major,meter:12,a:'0 2 4 . 3 2',b:'1 3 5 4 . 1',tone:'reed',prog:[0,3,4,0],bass:[[0,0],[8,4]],chord:[4,8],kick:[0],snare:[4,8],hat:[2,6,10],legato:true},
    {id:'toaster_ska',name:'Toaster ska',style:'Ska',scale:major,a:'. 0 . 2 4 . 2 1',b:'. 5 4 2 . 1 2 4',tone:'reed',prog:[0,3,4,0],bass:[[0,0],[4,2],[8,4],[12,5]],chord:[2,6,10,14],kick:[0,8],snare:[4,12],hat:[2,6,10,14],chordTone:'guitar'},
    {id:'noodle_disco',name:'Disco noodles',style:'Disco',scale:dorian,a:'0 . 4 6 7 6 . 4',b:'2 4 . 6 5 4 2 .',tone:'chip',prog:[0,3,5,0],bass:[[0,0],[2,7],[4,0],[6,7],[8,0],[10,7],[12,4],[14,7]],chord:[0,6,10],kick:[0,4,8,12],snare:[4,12],hat:[2,6,10,14],clap:true},
    {id:'sneaky_swing',name:'Sneaky socks',style:'Swing',scale:dorian,a:'0 2 . 4 3 2 0 .',b:'4 6 5 . 3 2 1 0',tone:'marimba',prog:[0,3,4,0],bass:[[0,0],[4,2],[8,4],[12,6]],chord:[0,6,12],kick:[0,8],snare:[4,12],hat:[0,2,4,6,8,10,12,14],swing:2/3,brush:true},
    {id:'seven_legged',name:'Seven-legged tap dancer',style:'7/8 dance',scale:minor,meter:14,a:'0 2 4 3 1 4 2',b:'7 6 4 2 3 1 0',tone:'wood',prog:[0,5,4,0],bass:[[0,0],[4,4],[8,0]],chord:[0,4,8],kick:[0,8],snare:[4,10],hat:[0,2,4,6,8,10,12],bend:.8},
    {id:'baroque_banana',name:'Baroque banana chase',style:'Counterpoint',scale:harmonic,a:'0 1 2 4 3 2 1 0',b:'4 3 2 1 2 4 6 7',tone:'organ',prog:[0,3,4,0],bass:[[0,0],[2,-1],[4,-2],[6,0],[8,2],[10,1],[12,0],[14,-1]],chord:[0,8],kick:[0,8],snare:[],hat:[4,12],counter:true},
    {id:'jellybean_drop',name:'Jellybean drop',style:'Half-time bass',scale:minor,a:'0 . . 4 2 . 1 .',b:'7 . 6 4 . 2 . 1',tone:'boing',prog:[0,5,3,0],bass:[[0,0],[3,0],[7,4],[10,0],[14,-1]],chord:[0,10],kick:[0,7,10],snare:[8],hat:[0,2,4,6,10,12,14,15],bend:5},
    {id:'circus_bicycle',name:'Circus on a bicycle',style:'6/8 jig',scale:major,meter:12,a:'0 2 4 7 5 4',b:'2 4 5 4 2 1',tone:'whistle',prog:[0,3,4,0],bass:[[0,0],[6,4]],chord:[2,4,8,10],kick:[0,6],snare:[3,9],hat:[0,2,4,6,8,10],jig:true,bend:1}
  ];
  const entries=specs.map(s=>({...s,group:'Pocket songs',description:'',reference:'pocket-songs.html#'+s.id,discoveryWeight:5})),byId=new Map(entries.map(e=>[e.id,e]));
  function hash(seed){let h=2166136261;for(const c of seed)h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0}
  api.generate=function(seed,options={}){
    const s=byId.get(/^sg2-([a-z_]+)--/.exec(seed)?.[1]);if(!s)return previousGenerate(seed,options);
    const steps=s.meter||16,total=4*steps,transpose=hash(seed)%5,rootHz=130.81278265*2**(transpose/12),end=.96;
    const degree=n=>s.scale[mod(n,7)]+12*Math.floor(n/7),time=step=>{
      // Swing delays the second eighth within each quarter, preserving bar boundaries.
      const pair=Math.floor(step/4)*4,within=step-pair,split=4*(s.swing||.5);
      return end*(pair+(within<=2?within*split/2:split+(within-2)*(4-split)/2))/total;
    };
    const legacyVoice={kazoo:'Reed',chip:'Pulse',reed:'Reed',marimba:'Bell',organ:'Organ',wood:'Triangle',whistle:'Sine',boing:'Hollow'};
    const layers=[{name:'Melody',voice:legacyVoice[s.tone],instrument:'toy',weight:.86,events:[]},{name:'Bass',voice:'Hollow',instrument:'toy',weight:.7,events:[]},{name:'Chords',voice:'Organ',instrument:'toy',weight:.4,events:[]},{name:'Drums',voice:'Pulse',instrument:'drums',weight:.56,events:[]}];
    function note(track,step,len,pitch,tone,gain=1,bend=0){const x=time(step),span=Math.min(time(step+len)-x,.998-x);if(span>0)layers[track].events.push({x,span,note:pitch,tone,gain,bend})}
    for(let bar=0;bar<4;bar++){
      const start=bar*steps,chord=s.prog[bar],motif=(bar===1?s.b:s.a).split(' ');
      motif.forEach((v,i)=>{
        if(v==='.'||bar===3&&i>=motif.length-2)return;
        const n=Number(v)+(bar===1?chord:0),length=s.legato?1.9:1.42;
        note(0,start+i*2,length,12+degree(n),s.tone,.84+(i%3===0?.14:0),s.bend||0);
        if(s.counter&&bar===2)note(2,start+i*2+1,1.35,degree(7-n),s.tone,.45);
      });
      for(const [step,offset]of s.bass){
        if(bar===3&&step>=steps-4)continue;
        const pitch=s.chromatic?degree(chord)-12+offset:degree(chord+offset)-12;
        note(1,start+step,s.style==='Half-time bass'?2.8:2.1,pitch,'bass',step===0?1:.8,s.style==='Half-time bass'?4:0);
      }
      for(const step of s.chord){
        if(bar===3&&step>=steps-4)continue;
        [0,2,4].forEach((offset,j)=>note(2,start+step+(s.arp?j*.47:0),s.arp?.85:s.style==='Ska'?.65:2.3,degree(chord+offset),s.chordTone||'organ',.7));
      }
      const drum=(positions,tone,length,gain)=>positions.forEach((step,i)=>{
        if(bar===3&&step>=steps-4)return;
        note(3,start+step,length,tone==='kick'?-24:tone==='hat'?24:0,tone,gain*(i%2?.8:1));
      });
      drum(s.kick,'kick',2.2,1);drum(s.snare,s.brush?'brush':s.clap?'clap':'snare',1.5,.68);drum(s.hat,'hat',.55,.23);drum(s.clave||[],'rim',.65,.58);
      if(bar===1||bar===2){note(3,start+steps-1,.7,0,'rim',.35);if(s.jig)note(0,start+steps-1,.65,12+degree(4),s.tone,.65)}
    }
    // A common tonic destination, voiced in each song's own instruments. No abrupt cutoff.
    note(0,total-4,3.8,12,s.tone,1,s.bend?-.5:0);note(1,total-4,3.6,-12,'bass',1);
    [0,2,4].forEach(n=>note(2,total-4,3.7,degree(n),s.chordTone||'organ',.7));note(3,total-4,2,0,'kick',.8);
    layers.forEach(layer=>{
      layer.events.sort((a,b)=>a.x-b.x);
      layer.f=t=>{const e=layer.events.findLast(e=>e.x<=t&&e.x+e.span>t);return e?e.note/11.4:NaN};layer.gaps=true;
    });
    const rhythm=s.swing?'2:1 swing':s.jig?'6/8':steps===14?'7/8':steps===12?'3/4':'4/4';
    return {seed,version:2,type:s.id,name:s.name,group:s.group,family:'POCKET SONGS',description:'',reference:s.reference,minX:0,maxX:1,duration:14,baseFrequency:rootHz/1.22,voice:legacyVoice[s.tone],musical:true,layers,f:layers[0].f,song:{steps,bars:4,rhythm,style:s.style},formula:'tⱼ = 0.96·g(j)/'+total+'<br>fⱼ = f₀·2^(nⱼ/12)',definitions:`Original four-bar ${s.style.toLowerCase()} composition in ${rhythm}. Independent melody, bass, triad and synthesized drum parts share this event score. Semitone n is measured from root f₀=${rootHz.toFixed(2)} Hz. Scale intervals: ${s.scale.join(', ')}; bar chord roots are scale degrees ${s.prog.join(', ')}. Melody slots are eighth notes: A=[${s.a}], B=[${s.b}], then A and a tonic ending; dot means rest. ${s.swing?'g delays each second eighth to two thirds of its quarter note.':'g(j)=j, a straight subdivision grid.'} Pitch in the legacy curve view is y=n/11.4. Vivid plays the arranged instruments; Original plays the legacy pitch voices. Seed changes the key while preserving the composition. Last notes finish by t=0.96, leaving a release margin.`};
  };
  api.paintSong=function(c,p,w,h,progress=null,thumbnail=false){
    const left=thumbnail?7:Math.min(65,w*.16),right=w-(thumbnail?7:18),top=thumbnail?5:20,bottom=h-(thumbnail?5:22),lane=(bottom-top)/4,colors=['#6355df','#cf8c18','#168b7c','#c75383'];
    c.clearRect(0,0,w,h);
    for(let b=0;b<=4;b++){const x=left+(right-left)*.96*b/4;c.strokeStyle='#e5e6ef';c.lineWidth=1;c.beginPath();c.moveTo(x,top);c.lineTo(x,bottom);c.stroke();if(!thumbnail&&b<4){c.fillStyle='#828799';c.font='10px system-ui';c.fillText(String(b+1),x+4,bottom+15)}}
    p.layers.forEach((layer,i)=>{
      const y=top+i*lane;if(!thumbnail){c.fillStyle='#73798b';c.font='10px system-ui';c.textAlign='right';c.fillText(layer.name,left-9,y+lane/2+3);c.textAlign='left'}
      const notes=layer.events.map(e=>e.note),lo=Math.min(...notes)-2,hi=Math.max(...notes)+2;
      layer.events.forEach(e=>{const x=left+e.x*(right-left),ny=y+lane-7-(e.note-lo)/(hi-lo)*(lane-14),active=progress!==null&&progress>=e.x&&progress<e.x+e.span;
        c.globalAlpha=progress===null||active?1:progress>e.x?.8:.32;c.fillStyle=colors[i];c.fillRect(x,ny,Math.max(2,e.span*(right-left)-1),thumbnail?2:active?5:3);
      });c.globalAlpha=1;
    });
    if(progress!==null){const x=left+progress*(right-left);c.strokeStyle='#5046df';c.lineWidth=1.5;c.beginPath();c.moveTo(x,top-5);c.lineTo(x,bottom);c.stroke()}
  };
  api.catalog=[...entries,...api.catalog];api.groups=[...new Set(api.catalog.map(e=>e.group))];api.curation.added.push(...entries.map(e=>e.id));
  if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
