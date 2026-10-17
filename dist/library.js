'use strict';
/* Library sidebar, segmented settings, seeking and small interface details. */
(function(){
  const $=id=>document.getElementById(id),ui=window.SonographUI,body=document.body;
  const list=$('library-list'),search=$('library-search'),toggle=$('open-library'),drawer=matchMedia('(max-width:1023px)');
  const items=new Map();

  // Grouped pattern list, in collection order.
  for(const group of Sonograph.groups){
    const entries=Sonograph.catalog.filter(p=>p.group===group);if(!entries.length)continue;
    const section=document.createElement('section'),heading=document.createElement('h3'),count=document.createElement('span'),ul=document.createElement('ul');
    section.className='library-group';heading.textContent=group;count.textContent=entries.length;heading.append(count);
    for(const entry of entries){
      const li=document.createElement('li'),button=document.createElement('button');
      button.type='button';button.className='library-item';button.textContent=entry.name;button.title=entry.name;
      button.addEventListener('click',()=>{ui.choosePattern(entry.id);if(drawer.matches)setOpen(false)});
      li.append(button);ul.append(li);items.set(entry.id,{button,li,text:[entry.name,entry.group,entry.id].join(' ').toLowerCase()});
    }
    section.append(heading,ul);list.append(section);
  }
  $('library-count').textContent=Sonograph.catalog.length+' patterns';

  function filter(){
    const query=search.value.trim().toLowerCase();let shown=0;
    for(const {li,text}of items.values()){const match=!query||text.includes(query);li.hidden=!match;if(match)shown++}
    for(const section of list.children)section.hidden=![...section.querySelectorAll('li')].some(li=>!li.hidden);
    $('library-empty').hidden=shown>0;
  }
  search.addEventListener('input',filter);
  search.addEventListener('keydown',e=>{if(e.key==='Enter'){const first=[...items.values()].find(item=>!item.li.hidden);if(first){e.preventDefault();first.button.click()}}if(e.key==='Escape'&&search.value){e.stopPropagation();search.value='';filter()}});

  // Drawer on narrow screens.
  function setOpen(open){
    body.classList.toggle('library-open',open);$('scrim').hidden=!open;toggle.setAttribute('aria-expanded',String(open));
    if(open){ui.pause();list.querySelector('[aria-current="true"]')?.scrollIntoView({block:'center'});search.focus({preventScroll:true})}else if(drawer.matches&&$('library').contains(document.activeElement))toggle.focus();
  }
  toggle.addEventListener('click',()=>setOpen(true));
  $('close-library').addEventListener('click',()=>setOpen(false));
  $('scrim').addEventListener('click',()=>{setOpen(false);setDetails(false)});

  // Details sheet on phones: definitions, reference and playback settings.
  const sheet=matchMedia('(max-width:819px)'),detailsButton=$('open-details');
  function setDetails(open){
    body.classList.toggle('details-open',open);detailsButton.setAttribute('aria-expanded',String(open));
    if(!body.classList.contains('library-open'))$('scrim').hidden=!open;
    if(open)$('close-details').focus();else if($('details').contains(document.activeElement))detailsButton.focus();
  }
  detailsButton.addEventListener('click',()=>setDetails(true));
  $('close-details').addEventListener('click',()=>setDetails(false));
  sheet.addEventListener('change',()=>{if(!sheet.matches)setDetails(false)});
  drawer.addEventListener('change',()=>{if(!drawer.matches)setOpen(false)});
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&body.classList.contains('library-open')){setOpen(false);return}
    if(e.key==='Escape'&&body.classList.contains('details-open')){setDetails(false);return}
    if(e.key==='/'&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!e.target.matches('input,textarea,select')){e.preventDefault();if(drawer.matches)setOpen(true);search.focus();search.select()}
  });

  // Current pattern: heading and highlighted list item.
  function sync(){
    const pattern=ui.getPattern(),mini=$('equation-mini'),equation=$('equation');$('pattern-group').textContent=pattern.group||'Pattern';
    mini.innerHTML=equation.innerHTML;mini.className=equation.className;mini.scrollTop=0;
    for(const [id,{button}]of items)button.setAttribute('aria-current',String(id===pattern.type));
    const current=items.get(pattern.type);
    if(current&&!current.li.hidden){const box=list.getBoundingClientRect(),row=current.button.getBoundingClientRect();if(row.top<box.top+36||row.bottom>box.bottom)current.button.scrollIntoView({block:'center'})}
  }
  window.addEventListener('sonograph:pattern',sync);sync();

  // Description stays collapsed until asked for; the choice carries across patterns.
  const describe=$('toggle-description');
  describe.addEventListener('click',()=>{const open=describe.getAttribute('aria-expanded')!=='true';describe.setAttribute('aria-expanded',String(open));describe.firstElementChild.textContent=open?'Hide description':'Show description';$('pattern-info').classList.toggle('expanded',open)});
  const syncDescription=()=>{describe.hidden=!ui.getPattern().definitions};
  window.addEventListener('sonograph:pattern',syncDescription);syncDescription();

  // Segmented controls drive the original selects, which keep their listeners.
  const segmented=[...document.querySelectorAll('select[data-segmented]')];
  function syncSegments(){for(const select of segmented)for(const button of select.previousElementSibling.children)button.setAttribute('aria-pressed',String(button.dataset.value===select.value))}
  for(const select of segmented){
    const group=document.createElement('div');group.className='segmented';group.setAttribute('role','group');group.setAttribute('aria-label',select.labels[0]?.textContent||'');
    for(const option of select.options){
      const button=document.createElement('button');button.type='button';button.textContent=option.textContent;button.dataset.value=option.value;
      button.addEventListener('click',()=>{if(select.value===option.value)return;select.value=option.value;select.dispatchEvent(new Event('change'));syncSegments()});
      group.append(button);
    }
    select.before(group);select.classList.add('enhanced');select.labels[0]?.addEventListener('click',e=>{e.preventDefault();group.querySelector('[aria-pressed="true"]')?.focus()});
  }
  syncSegments();

  // Seeking on the progress bar.
  const track=$('progress-track');
  const seekTo=clientX=>{const box=track.getBoundingClientRect();ui.seek((clientX-box.left)/box.width)};
  track.addEventListener('pointerdown',e=>{seekTo(e.clientX);track.setPointerCapture(e.pointerId)});
  track.addEventListener('pointermove',e=>{if(track.hasPointerCapture(e.pointerId))seekTo(e.clientX)});
  track.addEventListener('keydown',e=>{const step={ArrowLeft:-.05,ArrowRight:.05,Home:-1,End:1}[e.key];if(step===undefined)return;e.preventDefault();ui.seek(Math.max(0,Math.min(1,ui.getProgress()+step)))});
  (function tick(){track.setAttribute('aria-valuenow',String(Math.round(ui.getProgress()*100)));setTimeout(tick,500)})();

  // Status messages appear as a toast; confirmations dismiss themselves.
  const status=$('status');let toastTimer;
  new MutationObserver(()=>{clearTimeout(toastTimer);if(!status.hidden)toastTimer=setTimeout(()=>{status.hidden=true},status.classList.contains('error')?6000:2600)}).observe(status,{attributes:true,childList:true,characterData:true,subtree:true});

  // Volume fill.
  const volume=$('volume'),paintVolume=()=>volume.style.setProperty('--fill',volume.value+'%');
  volume.addEventListener('input',paintVolume);paintVolume();
})();
