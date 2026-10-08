'use strict';
(function(){
  const dialog=document.getElementById('collection-dialog'),search=document.getElementById('collection-search'),category=document.getElementById('collection-category'),grid=document.getElementById('collection-grid');
  let renderVersion=0;
  const previews=new Map();
  const totalCount=Sonograph.catalog.length,countEl=document.querySelector('.collection-count');
  if(countEl)countEl.textContent=totalCount;
  for(const group of Sonograph.groups){const count=Sonograph.catalog.filter(p=>p.group===group).length;const option=document.createElement('option');option.value=group;option.textContent=`${group} · ${count}`;category.append(option)}
  function thumbnail(canvas,p){const c=canvas.getContext('2d'),w=320,h=100;c.clearRect(0,0,w,h);if(p.performance){Sonograph.paintPerformance(c,p,w,h,null,true);return}if(p.song){Sonograph.paintSong(c,p,w,h,null,true);return}if(p.machine){Sonograph.paintMachine(c,p,w,h,.45,true);return}if(p.parametric){Sonograph.paintShape(c,p,w,h,null,true);return}c.strokeStyle='#e7e9f0';c.lineWidth=1;c.beginPath();c.moveTo(8,h/2);c.lineTo(w-8,h/2);c.stroke();(p.layers||[p]).forEach((layer,index)=>{c.strokeStyle=index?'#cf8c18':'#6156dc';c.lineWidth=1.5;c.lineJoin='round';c.beginPath();let previous=null;for(let i=0;i<=480;i++){const y=layer.f(p.minX+(p.maxX-p.minX)*i/480),px=8+(w-16)*i/480,py=h/2-y*(p.plotYLimit?40/p.plotYLimit:11);if(!Number.isFinite(y)||Math.abs(y)>8){previous=null;continue}if(previous===null||Math.abs(py-previous)>(p.plotYLimit?60/p.plotYLimit:16.5))c.moveTo(px,py);else c.lineTo(px,py);previous=py}c.stroke()})}
  function render(){
    const version=++renderVersion,query=search.value.trim().toLowerCase(),matches=Sonograph.catalog.filter(p=>(category.value==='all'||p.group===category.value)&&[p.name,p.group,p.description,p.id].some(s=>s.toLowerCase().includes(query)));
    grid.replaceChildren();document.getElementById('collection-results-count').textContent=matches.length+' '+(matches.length===1?'pattern':'patterns');document.getElementById('collection-empty').hidden=matches.length>0;
    const visible=[];
    for(const entry of matches){const button=document.createElement('button');button.type='button';button.className='pattern-card';button.dataset.family=entry.id;button.setAttribute('aria-label','Explore '+entry.name);const canvas=document.createElement('canvas');canvas.width=320;canvas.height=100;canvas.setAttribute('aria-hidden','true');const group=document.createElement('span');group.className='card-group';group.textContent=entry.group;const title=document.createElement('span');title.className='card-title';title.textContent=entry.name;button.append(canvas,group,title);button.addEventListener('click',()=>{dialog.close();window.SonographUI.choosePattern(entry.id);document.getElementById('play').focus()});grid.append(button);visible.push([canvas,entry])}
    // Small batches keep the collection responsive while complex previews evaluate.
    let index=0;
    function paint(){if(version!==renderVersion||!dialog.open)return;const end=Math.min(index+8,visible.length);for(;index<end;index++){const [canvas,entry]=visible[index];if(!previews.has(entry.id))previews.set(entry.id,Sonograph.generate('sg2-'+entry.id+'--preview',{preview:true}));thumbnail(canvas,previews.get(entry.id))}if(index<visible.length)requestAnimationFrame(paint)}
    requestAnimationFrame(paint);
  }
  document.getElementById('open-collection').addEventListener('click',()=>{window.SonographUI.pause();dialog.showModal();render();search.focus()});
  document.getElementById('close-collection').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const box=dialog.getBoundingClientRect();if(e.clientX<box.left||e.clientX>box.right||e.clientY<box.top||e.clientY>box.bottom)dialog.close()});
  dialog.addEventListener('close',()=>{renderVersion++;document.getElementById('open-collection').focus()});
  search.addEventListener('input',render);category.addEventListener('change',render);
})();
