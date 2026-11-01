/* ICE WIND homepage and About navigation and snow. */
(function(){
'use strict';
var oldSections={'#consulting':'consulting','#why':'approach','#process':'process'};
function legacySection(){if(location.pathname==='/'&&oldSections[location.hash])location.replace('/about/#'+oldSections[location.hash]);}
legacySection();window.addEventListener('hashchange',legacySection);
function t(s){return window.IW_I18N?window.IW_I18N.t(s):s;}
var menu=document.getElementById('preview-menu'),toggle=document.querySelector('.nav-toggle');
function close(){menu.hidden=true;toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Open menu');}
toggle.addEventListener('click',function(){var open=toggle.getAttribute('aria-expanded')==='true';menu.hidden=open;toggle.setAttribute('aria-expanded',String(!open));toggle.setAttribute('aria-label',open?'Open menu':'Close menu');});
menu.addEventListener('click',function(e){if(e.target.closest('a'))close();});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!menu.hidden){close();toggle.focus();}});
window.matchMedia('(min-width:1101px)').addEventListener('change',function(e){if(e.matches)close();});

})();
(function(){
  const c=document.getElementById('wind');
  if(!c||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const ctx=c.getContext('2d');
  let W,H,parts=[];
  function size(){W=c.width=c.offsetWidth*devicePixelRatio;H=c.height=c.offsetHeight*devicePixelRatio}
  size();addEventListener('resize',size);
  const N=Math.min(160,Math.floor(innerWidth/9));
  for(let i=0;i<N;i++)parts.push(spawn(true));
  function spawn(anywhere){
    const depth=Math.random(); // 0 = far, 1 = near
    return{
      x:Math.random()*W,
      y:anywhere?Math.random()*H:-10*devicePixelRatio,
      r:(depth*1.8+0.6)*devicePixelRatio,
      vy:(depth*0.9+0.35)*devicePixelRatio,   // fall speed by depth
      sway:Math.random()*Math.PI*2,
      ss:Math.random()*0.015+0.004,           // sway speed
      amp:(Math.random()*0.5+0.2)*devicePixelRatio, // sway amplitude
      o:depth*0.55+0.15
    };
  }
  (function tick(){
    ctx.clearRect(0,0,W,H);
    for(const p of parts){
      p.sway+=p.ss;
      p.y+=p.vy;
      p.x+=Math.sin(p.sway)*p.amp;   // gentle side-to-side drift
      if(p.y>H+10)Object.assign(p,spawn(false));
      if(p.x>W+10)p.x=-10; if(p.x<-10)p.x=W+10;
      ctx.beginPath();
      ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle='rgba(224,242,254,'+p.o+')';
      ctx.fill();
    }
    requestAnimationFrame(tick);
  })();
})();
