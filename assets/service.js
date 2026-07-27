/* ICE WIND — shared behaviour for service specialisation pages.
   1) Preview-host link rewrite (matches the existing start-a-project page).
   2) Snow canvas for the hero, disabled under prefers-reduced-motion. */
(function () {
  if (location.hostname === 'aiavatarsmks.github.io') {
    document.querySelectorAll('a[href^="/"]').forEach(function (link) {
      link.href = '/icewind-site-preview' + link.getAttribute('href');
    });
  }
})();

(function () {
  var c = document.getElementById('wind');
  if (!c || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var ctx = c.getContext('2d');
  var W, H, parts = [];
  function size() { W = c.width = c.offsetWidth * devicePixelRatio; H = c.height = c.offsetHeight * devicePixelRatio; }
  size();
  addEventListener('resize', size);
  var N = Math.min(90, Math.floor(innerWidth / 14));
  function spawn(anywhere) {
    var depth = Math.random();
    return {
      x: Math.random() * W,
      y: anywhere ? Math.random() * H : -10 * devicePixelRatio,
      r: (depth * 1.5 + 0.55) * devicePixelRatio,
      vy: (depth * 0.75 + 0.3) * devicePixelRatio,
      sway: Math.random() * Math.PI * 2,
      ss: Math.random() * 0.014 + 0.004,
      amp: (Math.random() * 0.4 + 0.18) * devicePixelRatio,
      o: depth * 0.5 + 0.15
    };
  }
  for (var i = 0; i < N; i++) parts.push(spawn(true));
  (function tick() {
    ctx.clearRect(0, 0, W, H);
    for (var k = 0; k < parts.length; k++) {
      var p = parts[k];
      p.sway += p.ss;
      p.y += p.vy;
      p.x += Math.sin(p.sway) * p.amp;
      if (p.y > H + 10) Object.assign(p, spawn(false));
      if (p.x > W + 10) p.x = -10;
      if (p.x < -10) p.x = W + 10;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(224,242,254,' + p.o + ')';
      ctx.fill();
    }
    requestAnimationFrame(tick);
  })();
})();
