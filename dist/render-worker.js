'use strict';
/* Renders a pattern's audio off the main thread, so switching patterns never stalls the interface. */
importScripts('engine.js','catalog.js','equations.js','playground.js','cartoon.js','shapes.js','machines.js','songs.js','performances.js','kinetic-scores.js','curve-play.js','continuous-curves.js','tunes.js?v=20261017b','sound.js?v=20261017-bytebeat');
self.onmessage=({data})=>{
  try{
    const pattern=Sonograph.generate(data.seed);
    const samples=Sonograph.renderAudio({...pattern,duration:data.duration},48000,data.mode);
    self.postMessage({id:data.id,samples},[samples.buffer]);
  }catch(error){
    self.postMessage({id:data.id,error:error.message||'Render failed.'});
  }
};
