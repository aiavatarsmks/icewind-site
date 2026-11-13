(function(){
  'use strict';
  document.querySelectorAll('.work-carousel').forEach(function(carousel){
    var track=carousel.querySelector('.case-grid');
    var cards=Array.prototype.slice.call(track ? track.querySelectorAll('.case-card') : []);
    var prev=carousel.querySelector('[data-work-prev]');
    var next=carousel.querySelector('[data-work-next]');
    var count=carousel.querySelector('.work-count');
    if(!track||!cards.length||!prev||!next||!count)return;
    function current(){
      var left=track.scrollLeft;
      var closest=0, distance=Infinity;
      cards.forEach(function(card,i){var d=Math.abs(card.offsetLeft-cards[0].offsetLeft-left);if(d<distance){distance=d;closest=i;}});
      return closest;
    }
    function update(){var i=current();count.textContent=String(i+1).padStart(2,'0')+' / '+String(cards.length).padStart(2,'0');prev.disabled=i===0;next.disabled=i===cards.length-1||track.scrollLeft+track.clientWidth>=track.scrollWidth-2;}
    function move(delta){var i=Math.min(cards.length-1,Math.max(0,current()+delta));track.scrollTo({left:cards[i].offsetLeft-cards[0].offsetLeft,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
    prev.addEventListener('click',function(){move(-1)});
    next.addEventListener('click',function(){move(1)});
    track.addEventListener('scroll',update,{passive:true});
    window.addEventListener('resize',update,{passive:true});
    update();
  });
})();
