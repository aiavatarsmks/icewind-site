/* ICE WIND — primary navigation component.
   Adds the desktop "Services" dropdown and the mobile full-screen menu to any page
   that has the standard header (.nav with a .btn link to /start-a-project/).
   To use on a new page, add one line before </body>:
     <script src="/assets/nav.js" defer></script>
   Styles live in /assets/nav.css and are loaded by this file. */
(function () {
  var SERVICES = [
    ['/web-development/', 'Web Development'],
    ['/web-design/', 'Web Design'],
    ['/website-redesign/', 'Website Redesign'],
    ['/seo/', 'SEO'],
    ['/ai-search-optimisation/', 'AI Search Optimisation'],
    ['/web-app-development/', 'Web App Development'],
    ['/game-development/', 'Game Development'],
    ['/ai-automation/', 'AI Automation']
  ];
  var COMPANY = [
    ['/work/lamar-academy/', 'Work'],
    ['/#consulting', 'Consulting'],
    ['/#why', 'Why us'],
    ['/#process', 'Process'],
    ['/blog/', 'Blog'],
    ['/trust/', 'Trust & Compliance']
  ];

  var bar = document.querySelector('header .nav');
  if (!bar || document.querySelector('.nav-toggle')) return;
  var cta = bar.querySelector('a.btn[href="/start-a-project/"]');
  if (!cta) return;

  if (!document.querySelector('link[href="/assets/nav.css"]')) {
    var css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = '/assets/nav.css';
    document.head.appendChild(css);
  }

  var here = location.pathname.replace(/\/+$/, '/') || '/';

  function link(href, text, cls) {
    var a = document.createElement('a');
    a.href = href;
    a.textContent = text;
    if (cls) a.className = cls;
    if (href === here) a.setAttribute('aria-current', 'page');
    return a;
  }

  /* ---------- desktop: turn "Services" into a dropdown ---------- */
  var svcLink = bar.querySelector('nav.links a[href$="#services"]');
  if (svcLink) {
    var wrap = document.createElement('div');
    wrap.className = 'has-drop';
    svcLink.parentNode.insertBefore(wrap, svcLink);
    wrap.appendChild(svcLink);
    var drop = document.createElement('div');
    drop.className = 'drop';
    SERVICES.forEach(function (s) { drop.appendChild(link(s[0], s[1])); });
    wrap.appendChild(drop);
  }

  /* ---------- burger button ---------- */
  var btn = document.createElement('button');
  btn.className = 'nav-toggle';
  btn.type = 'button';
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-controls', 'mobile-menu');
  btn.setAttribute('aria-label', 'Open menu');
  btn.innerHTML = '<span></span><span></span>';
  cta.parentNode.insertBefore(btn, cta.nextSibling);

  /* ---------- mobile menu ---------- */
  var menu = document.createElement('div');
  menu.className = 'mobile-menu';
  menu.id = 'mobile-menu';
  menu.setAttribute('data-open', 'false');

  function group(label, items, cls) {
    var g = document.createElement('div');
    g.className = 'mm-group' + (cls ? ' ' + cls : '');
    var p = document.createElement('p');
    p.className = 'mm-label';
    p.textContent = label;
    g.appendChild(p);
    items.forEach(function (i) { g.appendChild(link(i[0], i[1])); });
    return g;
  }

  menu.appendChild(group('Services', SERVICES));
  menu.appendChild(group('Company', COMPANY, 'mm-secondary'));

  var ctaWrap = document.createElement('div');
  ctaWrap.className = 'mm-cta';
  ctaWrap.appendChild(link('/start-a-project/', 'Start a project'));
  menu.appendChild(ctaWrap);

  var meta = document.createElement('p');
  meta.className = 'mm-meta';
  meta.innerHTML = 'London, England &middot; ' +
    '<a href="mailto:manager@icewinddaleconsulting.com">manager@icewinddaleconsulting.com</a>';
  menu.appendChild(meta);

  /* the header uses backdrop-filter, which would trap position:fixed children,
     so the menu is appended to <body> rather than inside the header */
  document.body.appendChild(menu);

  /* ---------- behaviour ---------- */
  function isOpen() { return btn.getAttribute('aria-expanded') === 'true'; }

  function open() {
    menu.setAttribute('data-open', 'true');
    btn.setAttribute('aria-expanded', 'true');
    btn.setAttribute('aria-label', 'Close menu');
    document.body.classList.add('menu-open');
    var first = menu.querySelector('a');
    if (first) first.focus({ preventScroll: true });
  }

  function close(returnFocus) {
    menu.setAttribute('data-open', 'false');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Open menu');
    document.body.classList.remove('menu-open');
    if (returnFocus) btn.focus({ preventScroll: true });
  }

  btn.addEventListener('click', function () { isOpen() ? close(false) : open(); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) close(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen()) close(true);
  });
  document.addEventListener('focusin', function (e) {
    if (!isOpen() || menu.contains(e.target) || btn.contains(e.target)) return;
    var first = menu.querySelector('a');
    if (first) first.focus({ preventScroll: true });
  });
  var mq = window.matchMedia('(min-width:821px)');
  var onChange = function (e) { if (e.matches && isOpen()) close(false); };
  mq.addEventListener ? mq.addEventListener('change', onChange) : mq.addListener(onChange);
})();
