(function(){
  'use strict';
  const api=Sonograph,ui=SonographUI,host=document.getElementById('machine-controls'),canvas=document.getElementById('plot');let selectedMagnet=0,drag=null;
  function label(name){const node=document.createElement('label'),span=document.createElement('span');span.textContent=name;node.append(span);host.append(node);return node}
  function slider(name,key,min,max,step=1){const p=ui.getPattern(),wrap=label(name),input=document.createElement('input'),output=document.createElement('output');input.id='machine-'+key;input.type='range';input.min=min;input.max=max;input.step=step;input.value=p.machineConfig[key];output.textContent=input.value;input.addEventListener('input',()=>output.textContent=input.value);input.addEventListener('change',()=>ui.editMachine({[key]:Number(input.value)}));wrap.append(input,output)}
  function button(name,action){const node=document.createElement('button');node.type='button';node.textContent=name;node.addEventListener('click',action);host.append(node)}
  function select(name,id,items,value,action){const wrap=label(name),node=document.createElement('select');node.id=id;items.forEach((name,i)=>{const option=document.createElement('option');option.value=i;option.textContent=name;node.append(option)});node.value=value;node.addEventListener('change',()=>action(Number(node.value)));wrap.append(node)}
  function render(){const focused=document.activeElement?.id,p=ui.getPattern();drag=null;host.replaceChildren();host.hidden=!p.machine;if(!p.machine)return;const c=p.machineConfig;
    if(p.machine.kind==='pinball')slider('Launch angle','a',-65,65);
    if(p.machine.kind==='sorting')select('Sort','machine-sort',['Bubble','Insertion','Selection'],c.s,value=>ui.editMachine({s:value}));
    if(p.machine.kind==='ant')slider('Steps','n',32,160,8);
    if(p.machine.kind==='domino')button(c.b?'Restore link':'Break link',()=>ui.editMachine({b:c.b?0:1}));
    if(p.machine.kind==='maze')button('New maze',()=>ui.choosePattern(p.type));
    if(p.machine.kind==='magnets'){select('Magnet','machine-magnet',['Attract','Repel'],selectedMagnet,value=>{selectedMagnet=value;render()});slider('X','x'+(selectedMagnet+1),0,100);slider('Y','y'+(selectedMagnet+1),0,100)}
    if(p.machine.kind==='knot')slider('Tension','k',1,4,.25);
    if(p.machine.kind==='puzzle'){button('Connect next',()=>{const next=p.machine.order.find(id=>!(c.p&(1<<id)));if(next!==undefined)ui.editMachine({p:c.p|(1<<next)},true)});button('Scatter',()=>ui.editMachine({p:0}));host.querySelector('button').disabled=c.p===63}
    if(focused)document.getElementById(focused)?.focus({preventScroll:true});
  }
  const world=e=>{const box=canvas.getBoundingClientRect(),v=api.machineViewport(box.width,box.height);return {x:(e.clientX-box.left-v.left)/v.unit,y:(e.clientY-box.top-v.top)/v.unit}};
  canvas.addEventListener('pointerdown',e=>{const p=ui.getPattern();if(!p.machine||!['magnets','puzzle'].includes(p.machine.kind))return;const pt=world(e),m=p.machine;let id=-1,kind;
    if(m.kind==='magnets'){id=m.magnets.findIndex(a=>Math.hypot(a.x-pt.x,a.y-pt.y)<.1);kind='magnet'}else{const poses=api.puzzlePositions(p,ui.getProgress());id=poses.findLastIndex(a=>Math.abs(a.x-pt.x)<.14&&Math.abs(a.y-pt.y)<.15);kind='piece'}
    if(id<0)return;e.preventDefault();drag={id,kind,wasPlaying:ui.isPlaying(),seed:p.seed};ui.pause();m.dragGhost={...pt,id,kind};canvas.setPointerCapture(e.pointerId);ui.redraw();
  });
  canvas.addEventListener('pointermove',e=>{if(!drag)return;const p=ui.getPattern();if(p.seed!==drag.seed){drag=null;return}const pt=world(e);p.machine.dragGhost={id:drag.id,kind:drag.kind,x:api.clamp(pt.x,.08,1.52),y:api.clamp(pt.y,.08,.92)};ui.redraw()});
  function end(e,cancel=false){if(!drag)return;const d=drag;drag=null;const p=ui.getPattern(),ghost=p.machine?.dragGhost;if(p.seed!==d.seed||!ghost)return;delete p.machine.dragGhost;try{canvas.releasePointerCapture(e.pointerId)}catch{}
    if(cancel){ui.redraw();if(d.wasPlaying)document.getElementById('play').click();return}
    if(d.kind==='magnet'){const index=d.id+1;selectedMagnet=d.id;ui.editMachine({['x'+index]:Math.round(api.clamp((ghost.x-.1)/1.4,0,1)*100),['y'+index]:Math.round(api.clamp((ghost.y-.15)/.7,0,1)*100)},d.wasPlaying)}
    else {const home=p.machine.homes[d.id];if(Math.hypot(home.x-ghost.x,home.y-ghost.y)<.16)ui.editMachine({p:p.machineConfig.p|(1<<d.id)},true);else {ui.redraw();if(d.wasPlaying)document.getElementById('play').click()}}
  }
  canvas.addEventListener('pointerup',e=>end(e));canvas.addEventListener('pointercancel',e=>end(e,true));window.addEventListener('sonograph:pattern',render);render();
})();
