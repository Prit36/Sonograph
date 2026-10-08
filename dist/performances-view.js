(function(root){
  'use strict';
  const api=root.Sonograph,{clamp}=api,TAU=2*Math.PI,cache=new WeakMap(),C=['#117d88','#5845c5','#b42b70','#9b620b'];
  function recent(events,t,decay=.025){return events.filter(e=>e.x<=t&&t-e.x<decay*4).map(e=>({e,pulse:Math.exp(-(t-e.x)/decay)*(e.gain||1)}))}
  api.paintPerformance=function(c,p,w,h,progress=null,thumbnail=false){
    const m=p.performance,t=progress===null?(m.kind==='tree'?.81:.54):clamp(progress,0,1),kickEvents=p.layers[3].events.filter(e=>e.tone==='kick'),kick=recent(kickEvents,t,.018).reduce((sum,v)=>sum+v.pulse,0),unit=Math.min(w*.45,h*.43),cx=w/2,cy=h/2;
    c.save();c.beginPath();c.roundRect(0,0,w,h,thumbnail?8:12);c.clip();
    c.fillStyle='#ffffff';c.fillRect(0,0,w,h);
    const dot=(x,y,r,color,alpha=1)=>{c.globalAlpha=alpha;c.fillStyle=color;c.beginPath();c.arc(x,y,r,0,TAU);c.fill();c.globalAlpha=1};
    const glow=(x,y,energy,color)=>{if(energy<.08)return;const r=(thumbnail?1.6:3)+energy*(thumbnail?.7:1.5);dot(x,y,r+(thumbnail?1:2),'#ffffff');dot(x,y,r,color,.65+.35*energy)};
    if(m.kind==='orbit'){
      const scale=unit*.38,angle=.35+t*TAU*.45,tilt=.7+.2*Math.sin(TAU*t);
      const project=pt=>{const x=pt.x*Math.cos(angle)+pt.z*Math.sin(angle),z=-pt.x*Math.sin(angle)+pt.z*Math.cos(angle),y=pt.y*Math.cos(tilt)-z*Math.sin(tilt),depth=pt.y*Math.sin(tilt)+z*Math.cos(tilt),perspective=5/(5+depth);return {x:cx+x*scale*perspective,y:cy-y*scale*perspective,depth}};
      for(let strand=0;strand<2;strand++){
        c.strokeStyle=C[strand];c.globalAlpha=1;c.lineWidth=thumbnail?1.3:2;c.beginPath();
        for(let j=0;j<=320;j++){const pt=project(api.orbitPoint(j/320,strand?Math.PI:0));if(j)c.lineTo(pt.x,pt.y);else c.moveTo(pt.x,pt.y)}c.stroke();
      }c.globalAlpha=1;
      p.layers.slice(0,2).forEach((layer,k)=>{
        const u=clamp((t-(k?.035:.02))/(k?.852:.868),0,1);
        for(let j=16;j>=0;j--){const pt=project(api.orbitPoint(u-j*.0025,k?Math.PI:0));dot(pt.x,pt.y,(thumbnail?1.2:2.3)*(1-j/22),C[k],.85*(1-j/18))}
        recent(layer.events,t,.036).forEach(({e,pulse})=>{if(e.visual.u===undefined)return;const pt=project(api.orbitPoint(e.visual.u,k?Math.PI:0));glow(pt.x,pt.y,pulse,C[k])});
      });
    }else if(m.kind==='bloom'){
      const N=thumbnail?42:86,stage=clamp(Math.floor((t-.016)/.217),0,3),blend=stage?clamp((t-(.016+stage*.217))/.035,0,1):1;
      let fields=cache.get(m);if(!fields||fields.N!==N){fields={N,values:m.modes.map(([n,v])=>Float32Array.from({length:N*N},(_,i)=>{const x=(i%N)/(N-1)*2-1,y=Math.floor(i/N)/(N-1)*2-1;return Math.cos(n*Math.PI*x)*Math.cos(v*Math.PI*y)-Math.cos(v*Math.PI*x)*Math.cos(n*Math.PI*y)}))};cache.set(m,fields)}
      const size=unit*1.9,left=cx-size/2,top=cy-size/2,now=fields.values[stage],before=fields.values[Math.max(0,stage-1)];
      // Draw only the analytic zero contours, without a competing dot texture.
      c.beginPath();const field=i=>before[i]*(1-blend)+now[i]*blend,cell=size/(N-1);
      for(let iy=0;iy<N-1;iy++)for(let ix=0;ix<N-1;ix++){
        const index=iy*N+ix,v=[field(index),field(index+1),field(index+N+1),field(index+N)],corners=[[ix,iy],[ix+1,iy],[ix+1,iy+1],[ix,iy+1]],cross=[];
        for(let edge=0;edge<4;edge++){const next=(edge+1)%4;if((v[edge]<=0)===(v[next]<=0))continue;const u=v[edge]/(v[edge]-v[next]);cross.push([left+(corners[edge][0]+u*(corners[next][0]-corners[edge][0]))*cell,top+(corners[edge][1]+u*(corners[next][1]-corners[edge][1]))*cell])}
        for(let j=0;j+1<cross.length;j+=2){c.moveTo(...cross[j]);c.lineTo(...cross[j+1])}
      }
      c.strokeStyle=C[0];c.lineWidth=thumbnail?1:1.7;c.stroke();
      recent(p.layers[0].events,t,.032).forEach(({e,pulse})=>{if(e.visual.stage!==stage)return;glow(cx+e.visual.px*size/2,cy+e.visual.py*size/2,pulse,C[2])});
    }else if(m.kind==='prism'){
      c.save();c.translate(cx,cy);c.rotate(t*1.2);c.scale(unit*.93*(1+.025*kick),unit*.93*(1+.025*kick));
      const V=[[0,0],[.94,-.53],[.94,.53]],triangle=points=>{points.forEach((v,i)=>i?c.lineTo(v[0],v[1]):c.moveTo(v[0],v[1]));c.closePath()},subdivide=(points,depth)=>{if(!depth){triangle(points);return}for(const v of points)subdivide(points.map(pt=>[(pt[0]+v[0])/2,(pt[1]+v[1])/2]),depth-1)};
      const depth=thumbnail?3:3+Math.min(2,Math.floor(t/.3));
      for(let k=0;k<6;k++){c.save();c.rotate(k*TAU/6);if(k%2)c.scale(1,-1);c.lineWidth=(thumbnail?1:1.2)/unit;c.strokeStyle=C[k%3];c.beginPath();subdivide(V,depth);c.stroke();
        for(const layer of p.layers.slice(0,2))for(const {e,pulse}of recent(layer.events,t,.033)){
          if(e.visual.address===undefined)continue;let address=e.visual.address,points=V.map(v=>[...v]);
          for(let d=0;d<e.visual.digits;d++){const v=points[address%3];points=points.map(pt=>[(pt[0]+v[0])/2,(pt[1]+v[1])/2]);address=Math.floor(address/3)}
          c.fillStyle=C[k%3];c.globalAlpha=pulse;c.beginPath();points.forEach((pt,i)=>i?c.lineTo(...pt):c.moveTo(...pt));c.closePath();c.fill();c.globalAlpha=1;
        }c.restore();
      }c.restore();
    }else if(m.kind==='tree'){
      const scale=unit*.7,map=pt=>({x:cx+pt.px*scale,y:cy-pt.py*scale+unit*.17}),base=pt=>({x:cx+pt.x*scale,y:cy-pt.y*scale+unit*.17});
      const beat=kickEvents.findLast(e=>e.x<=t),wave=beat?(t-beat.x)*65:-100;
      for(const node of m.nodes){const a=base(node),b=map(node),grow=clamp((t-node.at)/.014,0,1);if(!grow)continue;const pulse=Math.exp(-Math.abs(wave-node.depth)*1.7)*grow;c.strokeStyle=C[node.depth%3];c.lineWidth=Math.max(1.1,(6-node.depth)*.45)*(thumbnail?.8:1);c.beginPath();c.moveTo(a.x,a.y);c.lineTo(a.x+(b.x-a.x)*grow,a.y+(b.y-a.y)*grow);c.stroke();if(node.depth===6)dot(b.x,b.y,(thumbnail?.8:1.4)+pulse*1.8,C[3],.8+.2*pulse)}
      c.globalAlpha=1;for(const layer of p.layers.slice(0,2))for(const {e,pulse}of recent(layer.events,t,.025)){const node=m.nodes[e.visual.node];if(!node)continue;const b=map(node);glow(b.x,b.y,pulse,C[node.depth%3])}
    }else{
      const N=thumbnail?100:300,rows=N,size=unit*1.9,alpha=.035+.18*Math.sin(Math.PI*t),phase=TAU*12*t,cs=Math.cos(alpha),sn=Math.sin(alpha);
      let image=cache.get(m);if(!image||image.N!==N||image.rows!==rows){const surface=typeof OffscreenCanvas!=='undefined'?new OffscreenCanvas(N,rows):Object.assign(document.createElement('canvas'),{width:N,height:rows}),context=surface.getContext('2d');image={N,rows,surface,context,pixels:context.createImageData(N,rows)};cache.set(m,image)}
      const pixels=image.pixels.data;
      for(let iy=0;iy<rows;iy++)for(let ix=0;ix<N;ix++){
        const x=(ix/N-.5)*5,y=(iy/rows-.5)*5,a=Math.cos(18*x+phase),b=Math.cos(18*(x*cs+y*sn)-phase),I=(1+a)*(1+b)/4;
        const fringe=(1+Math.cos(18*(x-x*cs-y*sn)+2*phase))/2,index=4*(iy*N+ix),ink=.95*I;pixels[index]=255+(25+55*fringe-255)*ink;pixels[index+1]=255+(112-43*fringe-255)*ink;pixels[index+2]=255+(135+50*fringe-255)*ink;pixels[index+3]=255;
      }image.context.putImageData(image.pixels,0,0);c.imageSmoothingEnabled=true;c.drawImage(image.surface,cx-size/2,cy-size/2,size,size);
      recent(p.layers[0].events,t,.025).forEach(({e,pulse})=>{const a=e.visual.phase;if(a===undefined)return;glow(cx+Math.cos(a)*unit*.76,cy+Math.sin(a)*unit*.76,pulse,C[2])});
    }
    c.restore();
  };
})(typeof window==='undefined'?globalThis:window);
