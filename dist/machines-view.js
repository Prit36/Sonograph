(function(root){
  'use strict';
  const api=root.Sonograph,TAU=2*Math.PI,C=['#6355df','#d76887','#229d8d','#dda642','#7c83cf','#b576b8'];
  api.paintMachine=function(ctx,p,w,h,progress=0,thumbnail=false){
    const v=api.machineViewport(w,h,thumbnail),m=p.machine,t=progress===null?0:progress,f=m.frames?api.machineFrame(m.frames,t):null;
    ctx.save();ctx.translate(v.left,v.top);ctx.scale(v.unit,v.unit);ctx.lineCap='round';ctx.lineJoin='round';ctx.lineWidth=.004;
    const line=(x1,y1,x2,y2,color='#e5e5ef',width=.004)=>{ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke()};
    const dot=(x,y,r,color)=>{ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill()};
    const rect=(x,y,w,h,color,stroke=null,r=.012)=>{ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=color;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=.003;ctx.stroke()}};
    const text=(value,x,y,color='#676779',size=.035)=>{ctx.font=`500 ${size}px Segoe UI`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=color;ctx.fillText(value,x,y)};
    rect(.008,.008,1.584,.984,'#fafafe','#eeeeF5',.035);
    if(m.kind==='pinball'){
      rect(.035,.035,1.53,.93,'#f4f2fc','#ded9f4',.06);
      m.bumpers.forEach((b,i)=>{dot(b.x,b.y,b.r+.018,'#ffffff');dot(b.x,b.y,b.r,C[i]);dot(b.x-.018,b.y-.02,b.r*.28,'#ffffff55')});
      const index=m.frames.indexOf(f);for(let i=Math.max(0,index-24);i<=index;i+=3){const a=m.frames[i];dot(a.x,a.y,.012,'#6355df22')}
      dot(f.x,f.y,.026,'#343047');dot(f.x-.006,f.y-.008,.007,'#ffffff');
    }else if(m.kind==='sorting'){
      const idx=m.frames.indexOf(f),prev=m.frames[Math.max(0,idx-1)],next=m.frames[Math.min(m.frames.length-1,idx+1)],blend=Math.min(1,(t-f.t)/Math.max(.0001,next.t-f.t)*2.5);
      f.a.forEach((value,i)=>{const val=prev.a[i]+(value-prev.a[i])*blend,height=.06+val*.055,color=t>=.84?'#229d8d':f.pair.includes(i)?C[1]:C[0];rect(.11+i*.115,.87-height,.08,height,color,null,.008);if(!thumbnail)text(value,.15+i*.115,.925)});
      line(.08,.875,1.5,.875,'#d8d5e8');
    }else if(m.kind==='ant'){
      const cw=1.4/m.cols,ch=.8/m.rows;f.grid.forEach((value,i)=>rect(.1+(i%m.cols)*cw,.1+Math.floor(i/m.cols)*ch,cw-.004,ch-.004,value?'#dcd6fa':'#ffffff','#e9e6f3',.004));
      const x=.1+(f.x+.5)*cw,y=.1+(f.y+.5)*ch;dot(x,y,.028,C[1]);const a=f.d*Math.PI/2-Math.PI/2;line(x,y,x+.045*Math.cos(a),y+.045*Math.sin(a),C[1],.007);
    }else if(m.kind==='domino'){
      m.nodes.forEach((n,i)=>{if(n.parent<0)return;const a=m.nodes[n.parent];if(m.broken&&i===9)ctx.setLineDash([.012,.016]);line(a.x,a.y,n.x,n.y,m.broken&&i===9?'#d7688755':'#e0dced');ctx.setLineDash([])});
      m.nodes.forEach((n,i)=>{const falling=Math.max(0,Math.min(1,(t-n.t)/.04));ctx.save();ctx.translate(n.x,n.y);ctx.rotate(falling*Math.PI*.44*(n.branch===0?-1:1));rect(-.019,-.077,.038,.095,falling?C[2]:C[i%4]);dot(0,-.05,.004,'#ffffff');dot(0,-.023,.004,'#ffffff');ctx.restore()});
    }else if(m.kind==='maze'){
      const cw=1.36/m.cols,ch=.82/m.rows,point=id=>({x:.12+(id%m.cols+.5)*cw,y:.09+(Math.floor(id/m.cols)+.5)*ch});
      const idx=m.frames.indexOf(f);for(let i=1;i<=idx;i++){const a=point(m.frames[i-1].id),b=point(m.frames[i].id);line(a.x,a.y,b.x,b.y,'#ddd7f4',.015)}
      if(t>=.84)for(let i=1;i<m.solution.length;i++){const a=point(m.solution[i-1]),b=point(m.solution[i]);line(a.x,a.y,b.x,b.y,C[2],.012)}
      m.cells.forEach((cell,i)=>{const x=.12+i%m.cols*cw,y=.09+Math.floor(i/m.cols)*ch;if(cell.walls[0])line(x,y,x+cw,y,'#9e99b4',.006);if(cell.walls[1])line(x+cw,y,x+cw,y+ch,'#9e99b4',.006);if(cell.walls[2])line(x,y+ch,x+cw,y+ch,'#9e99b4',.006);if(cell.walls[3])line(x,y,x,y+ch,'#9e99b4',.006)});
      const end=point(m.cells.length-1);dot(end.x,end.y,.024,C[2]);const a=point(f.id);dot(a.x,a.y,.026,C[0]);
    }else if(m.kind==='magnets'){
      m.magnets.forEach((mag,i)=>{const a=m.dragGhost?.kind==='magnet'&&m.dragGhost.id===i?m.dragGhost:mag;ctx.strokeStyle=C[i]+'25';ctx.lineWidth=.002;for(const r of [.12,.21,.3]){ctx.beginPath();ctx.arc(a.x,a.y,r,0,TAU);ctx.stroke()}dot(a.x,a.y,.063,C[i]);line(a.x-.022,a.y,a.x+.022,a.y,'#ffffff',.009);if(i===0)line(a.x,a.y-.022,a.x,a.y+.022,'#ffffff',.009)});
      const index=m.frames.indexOf(f);f.particles.forEach((a,j)=>{for(let i=Math.max(0,index-30);i<index;i+=5){const b=m.frames[i].particles[j];dot(b.x,b.y,.008,C[j]+'35')}dot(a.x,a.y,.021,C[(j+2)%6])});
    }else if(m.kind==='knot'){
      for(let i=1;i<f.points.length;i++){const a=f.points[i-1],b=f.points[i];line(a.x,a.y,b.x,b.y,t>=.84?C[2]:C[Math.floor(i/8)%6],.013)}
      f.cross.forEach(a=>{dot(a.x,a.y,.018,'#fafafe');dot(a.x,a.y,.009,C[1])});dot(f.points[0].x,f.points[0].y,.024,C[0]);dot(f.points.at(-1).x,f.points.at(-1).y,.024,C[2]);
    }else if(m.kind==='puzzle'){
      m.homes.forEach((home,i)=>{ctx.setLineDash([.008,.01]);rect(home.x-.12,home.y-.13,.24,.26,'#f2effb','#d7d0ed',.01);ctx.setLineDash([]);text(i+1,home.x,home.y,'#a8a0be')});
      const poses=api.puzzlePositions(p,t);
      // Lift the dragged piece above its neighbors.
      [...Array(6).keys()].sort((a,b)=>(m.dragGhost?.id===a?1:0)-(m.dragGhost?.id===b?1:0)).forEach(i=>{
        const home=m.homes[i],a=m.dragGhost?.kind==='piece'&&m.dragGhost.id===i?m.dragGhost:poses[i],col=i%3,row=Math.floor(i/3),halfW=.12,halfH=.13;
        ctx.save();ctx.translate(a.x,a.y);ctx.beginPath();ctx.moveTo(-halfW,-halfH);
        function edge(ax,ay,bx,by,tab){const dx=bx-ax,dy=by-ay,len=Math.hypot(dx,dy),nx=dy/len,ny=-dx/len;ctx.lineTo(ax+dx*.35,ay+dy*.35);if(tab){ctx.bezierCurveTo(ax+dx*.35+nx*.035*tab,ay+dy*.35+ny*.035*tab,ax+dx*.65+nx*.035*tab,ay+dy*.65+ny*.035*tab,ax+dx*.65,ay+dy*.65)}ctx.lineTo(bx,by)}
        edge(-halfW,-halfH,halfW,-halfH,row?-1:0);edge(halfW,-halfH,halfW,halfH,col<2?1:0);edge(halfW,halfH,-halfW,halfH,row===0?1:0);edge(-halfW,halfH,-halfW,-halfH,col?-1:0);ctx.closePath();ctx.fillStyle=C[i]+'dd';ctx.fill();ctx.strokeStyle='#ffffff';ctx.lineWidth=.004;ctx.stroke();ctx.save();ctx.clip();
        // Fragments of one circle align only when the matching pieces connect.
        ctx.strokeStyle='#ffffff99';ctx.lineWidth=.025;ctx.beginPath();ctx.arc(.79-home.x,.48-home.y,.22,0,TAU);ctx.stroke();ctx.restore();if(!thumbnail)text(i+1,0,0,'#ffffff',.042);ctx.restore();
      });
    }
    if(!thumbnail)m.cues.forEach(cue=>{const age=t-cue.t;if(age<0||age>.045)return;ctx.strokeStyle=cue.color+Math.round((1-age/.045)*180).toString(16).padStart(2,'0');ctx.lineWidth=.006;ctx.beginPath();ctx.arc(cue.x,cue.y,.025+age*1.3,0,TAU);ctx.stroke()});
    ctx.restore();
  };
  api.puzzlePositions=function(p,t){const m=p.machine;return m.homes.map((home,i)=>{const u=m.arrivals[i]===0?1:Math.max(0,Math.min(1,(t-m.arrivals[i]+.045)/.045)),r=u*u*(3-2*u),start=m.starts[i];return {x:start.x+(home.x-start.x)*r,y:start.y+(home.y-start.y)*r}})};
})(typeof window==='undefined'?globalThis:window);
