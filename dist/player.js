'use strict';
const $=id=>document.getElementById(id),canvas=$('plot'),ctx=canvas.getContext('2d');
let pattern,position=0,playing=false,audioContext,master,analyser,signal,source,sourceGain,buffer,startTime=0,requestId=0,starting=false,graphSamples;
const settings=new URLSearchParams(location.search);
let soundMode=settings.get('sound')==='original'?'original':'vivid',scanDuration=settings.get('scan')==='14'||(!settings.has('scan')&&soundMode==='original')?14:7;
$('sound-mode').value=soundMode;$('scan-duration').value=String(scanDuration);
const timeText=value=>'0:'+String(Math.floor(value)).padStart(2,'0');
function saveUrl(){try{const url=new URL(location.href);url.searchParams.set('seed',pattern.seed);url.searchParams.set('sound',soundMode);url.searchParams.set('scan',scanDuration);history.replaceState(null,'',url)}catch{}}
function updateVoiceLabel(){$('pattern-voice').textContent=(pattern.layers?pattern.layers.map(layer=>layer.voice).join(' + ')+' voices':(pattern.voice||'Original')+' voice')+' · '+(soundMode==='vivid'?'Vivid':'Original');}
const recentTypes=[];
const randomSeed=(type)=>{const a=new Uint32Array(3);crypto.getRandomValues(a);const pool=Sonograph.catalog.filter(p=>!recentTypes.includes(p.id));let id=type;if(!id){let draw=a[0]/4294967296*pool.reduce((sum,p)=>sum+(p.discoveryWeight||1),0);id=pool[pool.length-1].id;for(const entry of pool){draw-=entry.discoveryWeight||1;if(draw<0){id=entry.id;break}}}return 'sg2-'+id+'--'+Array.from(a.slice(1),n=>n.toString(36).padStart(7,'0')).join('-')};
function status(text,error=false){$('status').textContent=text;$('status').hidden=!text;$('status').classList.toggle('error',error)}
function updateTransport(){
  $('play-label').textContent=playing?'Pause':'Play sound';$('play').setAttribute('aria-label',playing?'Pause sound':'Play sound');
  $('play-icon').innerHTML=playing?'<path d="M6 5h4v14H6zM14 5h4v14h-4z"/>':'<path d="m9 5 11 7-11 7Z"/>';
  $('time').innerHTML=timeText(position)+' <span>/ '+timeText(scanDuration)+'</span>';
  $('progress').style.width=(position/scanDuration*100)+'%';
}
function currentPosition(){return playing&&audioContext?Sonograph.clamp(audioContext.currentTime-startTime,0,scanDuration):position}
function stop(){requestId++;starting=false;position=currentPosition();playing=false;if(source){const oldSource=source,oldGain=sourceGain,now=audioContext.currentTime;oldSource.onended=()=>{oldSource.disconnect();oldGain.disconnect()};oldGain.gain.cancelScheduledValues(now);oldGain.gain.setTargetAtTime(0,now,.003);try{oldSource.stop(now+.018)}catch{oldSource.disconnect();oldGain.disconnect()}source=null;sourceGain=null}updateTransport()}
function load(seed,continuePlayback=false){
  if(typeof seed!=='string'||!seed.trim()||seed.trim().length>128)throw new Error('Use a seed with 1-128 characters.');
  seed=seed.trim();const generated=Sonograph.generate(seed);stop();pattern=generated;buffer=null;position=0;
  recentTypes.push(pattern.type);if(recentTypes.length>16)recentTypes.shift();
  graphSamples=(pattern.layers||[{f:pattern.f}]).map(layer=>Float64Array.from({length:2561},(_,i)=>layer.f(pattern.minX+(pattern.maxX-pattern.minX)*i/2560)));
  $('seed').value=seed;$('pattern-name').textContent=pattern.name;
  $('equation').innerHTML=pattern.layers?'<span class="cases">'+pattern.formula+'</span>':'<span class="variable">y</span><span>=</span>'+ (pattern.formula.includes('<br>')?'<span class="brace">{</span><span class="cases">'+pattern.formula+'</span>':'<span>'+pattern.formula+'</span>');
  $('domain-label').hidden=!!pattern.machine;
  $('domain-label').textContent=pattern.parametric||pattern.song||pattern.performance?'0 ≤ t ≤ 1':`${String(pattern.minX).replace('-','−')} ≤ x ≤ ${pattern.maxX}`;
  $('equation').classList.toggle('long-equation',pattern.formula.replace(/<[^>]+>/g,'').length>75);
  const equationText=pattern.formula.replace(/<sup>(.*?)<\/sup>/g,'^($1)').replace(/<sub>(.*?)<\/sub>/g,'_($1)').replace(/<br>/g,'; ');
  $('pattern-definitions').textContent=pattern.definitions||'';$('pattern-definitions').hidden=!pattern.definitions;
  updateVoiceLabel();
  $('pattern-reference').href=pattern.reference;$('pattern-info').open=false;
  canvas.setAttribute('aria-label',pattern.name+(pattern.performance?'; geometric musical animation: ':pattern.machine?'; animated music machine: ':pattern.song?'; arranged score: ':pattern.parametric?'; parametric shape: ':pattern.layers?'; equations: ':'; equation y = ')+equationText);
  canvas.style.touchAction=pattern.machine&&['magnets','puzzle'].includes(pattern.machine.kind)?'none':'auto';
  updateTransport();draw();status('');
  saveUrl();
  window.dispatchEvent(new CustomEvent('sonograph:pattern'));
  if(continuePlayback)void play();
  return {seed:pattern.seed,name:pattern.name,group:pattern.group,equation:equationText};
}
async function play(){
  if(playing){stop();draw();status('');return}
  if(starting){stop();status('');return}
  const Audio=window.AudioContext||window.webkitAudioContext;
  if(!Audio){status('Audio is unavailable in this browser.',true);return}
  const id=++requestId;starting=true;
  try{
    if(!audioContext){audioContext=new Audio();master=audioContext.createGain();master.gain.value=Number($('volume').value)/100;analyser=audioContext.createAnalyser();analyser.fftSize=1024;signal=new Float32Array(analyser.fftSize);master.connect(analyser);analyser.connect(audioContext.destination);
      audioContext.addEventListener('statechange',()=>{if(playing&&audioContext.state==='suspended'){stop();draw();status('')}});
    }
    await audioContext.resume();if(id!==requestId)return;
    if(!buffer){const scan={...pattern,duration:scanDuration},data=Sonograph.renderAudio(scan,48000,soundMode);buffer=audioContext.createBuffer(1,data.length,48000);buffer.copyToChannel(data,0)}
    if(position>=scanDuration-.01)position=0;
    source=audioContext.createBufferSource();source.buffer=buffer;sourceGain=audioContext.createGain();source.connect(sourceGain);sourceGain.connect(master);
    sourceGain.gain.setValueAtTime(0,audioContext.currentTime);sourceGain.gain.linearRampToValueAtTime(1,audioContext.currentTime+.008);
    startTime=audioContext.currentTime-position;playing=true;starting=false;
    source.onended=()=>{if(id!==requestId)return;playing=false;position=scanDuration;source.disconnect();sourceGain.disconnect();source=null;sourceGain=null;updateTransport();draw();status('')};
    source.start(0,position);updateTransport();status('');
  }catch(error){starting=false;playing=false;updateTransport();status('Could not start audio. Press Play to try again.',true)}
}
function draw(){
  const bounds=canvas.getBoundingClientRect(),ratio=Math.min(devicePixelRatio||1,2),w=bounds.width,h=bounds.height;
  if(canvas.width!==Math.round(w*ratio)||canvas.height!==Math.round(h*ratio)){canvas.width=Math.round(w*ratio);canvas.height=Math.round(h*ratio)}
  ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,w,h);
  if(pattern.machine){Sonograph.paintMachine(ctx,pattern,w,h,currentPosition()/scanDuration);return}
  if(pattern.performance){const elapsed=currentPosition();Sonograph.paintPerformance(ctx,pattern,w,h,elapsed>0||playing?elapsed/scanDuration:null);return}
  if(pattern.song){const elapsed=currentPosition();Sonograph.paintSong(ctx,pattern,w,h,elapsed>0||playing?elapsed/scanDuration:null);return}
  if(pattern.parametric){const elapsed=currentPosition();Sonograph.paintShape(ctx,pattern,w,h,elapsed>0||playing?elapsed/scanDuration:null);return}
  const pad=24,top=29,bottom=h-43,mid=(top+bottom)/2,yLimit=pattern.plotYLimit||4,scale=(bottom-top)/(2*yLimit),mapX=x=>pad+(x-pattern.minX)/(pattern.maxX-pattern.minX)*(w-pad*2),mapY=y=>mid-y*scale;
  ctx.strokeStyle='#f0f1f5';ctx.lineWidth=1;
  for(let x=Math.ceil(pattern.minX/2)*2;x<=pattern.maxX;x+=2){ctx.beginPath();ctx.moveTo(mapX(x),top);ctx.lineTo(mapX(x),bottom);ctx.stroke()}
  for(let y=Math.floor(-yLimit)+1;y<yLimit;y++){ctx.beginPath();ctx.moveTo(pad,mapY(y));ctx.lineTo(w-pad,mapY(y));ctx.stroke()}
  ctx.strokeStyle='#adb2be';ctx.beginPath();ctx.moveTo(pad,mid);ctx.lineTo(w-pad+5,mid);ctx.moveTo(mapX(0),bottom);ctx.lineTo(mapX(0),top-5);ctx.stroke();
  ctx.fillStyle='#7d8490';ctx.font='italic 14px Georgia';ctx.fillText('x',w-pad+10,mid+5);ctx.fillText('y',mapX(0)+8,top-6);
  ctx.font='12px Segoe UI';ctx.fillStyle='#8b929e';for(let x=Math.ceil(pattern.minX/4)*4;x<=pattern.maxX;x+=4)if(x!==0)ctx.fillText(String(x).replace('-','−'),mapX(x)-5,mid+18);[-yLimit/2,yLimit/2].forEach(y=>ctx.fillText(String(y).replace('-','−'),mapX(0)+9,mapY(y)+4));
  const elapsed=currentPosition(),hasTrace=elapsed>0||playing,cursorX=pattern.minX+(pattern.maxX-pattern.minX)*elapsed/scanDuration;
  ctx.save();ctx.beginPath();ctx.rect(pad,top,w-pad*2,bottom-top);ctx.clip();
  function curve(values,end,color,width){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineJoin='round';ctx.beginPath();let previous=null;const samples=values.length-1;for(let i=0;i<=samples;i++){const x=pattern.minX+(pattern.maxX-pattern.minX)*i/samples;if(x>end)break;const y=values[i],px=mapX(x),py=mapY(y);if(!Number.isFinite(y)||Math.abs(y)>10){previous=null;continue}if(previous===null||Math.abs(py-previous)>scale*1.5)ctx.moveTo(px,py);else ctx.lineTo(px,py);previous=py}ctx.stroke()}
  const colors=['#5046df','#cf8c18','#168b7c','#c75383'];
  graphSamples.forEach((values,index)=>curve(values,pattern.maxX,hasTrace?'#e0e1eb':index?colors[index]:'#363a48',1.6));
  if(hasTrace){const x=mapX(cursorX);ctx.strokeStyle='#5046df24';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,top);ctx.lineTo(x,bottom);ctx.stroke();graphSamples.forEach((values,index)=>{curve(values,cursorX,colors[index],1.8);const raw=(pattern.layers?.[index]||pattern).f(cursorX);if(!Number.isFinite(raw))return;const py=mapY(Sonograph.clamp(raw,-yLimit*.96,yLimit*.96));ctx.fillStyle=colors[index]+'17';ctx.beginPath();ctx.arc(x,py,9,0,Math.PI*2);ctx.fill();ctx.fillStyle=colors[index];ctx.beginPath();ctx.arc(x,py,3.5,0,Math.PI*2);ctx.fill()})}
  ctx.restore();
}
$('play').addEventListener('click',()=>void play());
$('restart').addEventListener('click',()=>{const resume=playing;stop();position=0;updateTransport();draw();if(resume)void play();else status('')});
$('next').addEventListener('click',()=>load(randomSeed(),playing));
$('seed-form').addEventListener('submit',e=>{e.preventDefault();try{load($('seed').value,playing)}catch(error){status(error.message,true);$('seed').focus()}});
$('copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(pattern.seed);status('Seed copied.')}catch{$('seed').value=pattern.seed;$('seed').focus();$('seed').select();status('Seed selected. Press Ctrl+C (⌘C on Mac) to copy.')}});
$('volume').addEventListener('input',()=>{$('volume-value').value=$('volume').value+'%';if(master){master.gain.cancelScheduledValues(audioContext.currentTime);master.gain.setTargetAtTime(Number($('volume').value)/100,audioContext.currentTime,.015)}});
function changeSound(){const resume=playing;stop();soundMode=$('sound-mode').value;scanDuration=Number($('scan-duration').value);buffer=null;position=0;updateVoiceLabel();updateTransport();draw();saveUrl();status('');if(resume)void play()}
$('sound-mode').addEventListener('change',()=>{$('scan-duration').value=$('sound-mode').value==='original'?'14':'7';changeSound()});
$('scan-duration').addEventListener('change',changeSound);
document.addEventListener('keydown',e=>{if($('collection-dialog').open||e.target.matches('input,textarea,select,button,a,summary')||e.ctrlKey||e.metaKey||e.altKey||e.repeat)return;if(e.code==='Space'){e.preventDefault();void play()}if(e.key.toLowerCase()==='n'){e.preventDefault();load(randomSeed(),playing)}});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&(playing||starting)){stop();draw();status('')}});
new ResizeObserver(()=>{if(pattern)draw()}).observe(canvas);
function tick(){if(playing){position=currentPosition();updateTransport();draw();analyser.getFloatTimeDomainData(signal);let power=0;for(const sample of signal)power+=sample*sample;canvas.dataset.audioState=audioContext.state;canvas.dataset.signalRms=String(Math.sqrt(power/signal.length))}requestAnimationFrame(tick)}
function choosePattern(type){if(!Sonograph.catalog.some(p=>p.id===type))throw new Error('Unknown pattern family.');return load(randomSeed(type),playing)}
window.SonographUI={choosePattern,loadPattern:load,getPattern:()=>pattern,getProgress:()=>currentPosition()/scanDuration,isPlaying:()=>playing,redraw:draw,editMachine:(patch,autoplay=playing)=>{if(pattern.machine)try{load(Sonograph.machineSeed(pattern,patch),autoplay)}catch(error){status(error.message,true)}},pause:()=>{stop();draw()}};
try{load(new URLSearchParams(location.search).get('seed')?.slice(0,128).trim()||'sg2-phase_marimbas--resonance')}catch(error){load('sg2-phase_marimbas--resonance');status(error.message,true)}requestAnimationFrame(tick);
if(document.modelContext?.registerTool){
  const lifecycle=new AbortController();
  try{const registration=document.modelContext.registerTool({name:'load_pattern_seed',title:'Load a mathematical pattern',description:'Load a seed to reproduce its equation, graph, and sound. Does not start audio.',inputSchema:{type:'object',properties:{seed:{type:'string',minLength:1,maxLength:128}},required:['seed'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:input=>{if(!input||typeof input.seed!=='string'||Object.keys(input).some(k=>k!=='seed'))throw new Error('Provide only a seed string.');return load(input.seed)}},{signal:lifecycle.signal});Promise.resolve(registration).catch(()=>{});}catch{}
  window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
}
