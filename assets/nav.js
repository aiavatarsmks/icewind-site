/* ICE WIND — primary navigation component.
   Adds the "Get in touch" contact strip to any page with a header, and — on pages
   carrying the full primary nav (.nav with a .btn link to /start-a-project/) — the
   desktop "Services" dropdown, the "Contact" link and the mobile full-screen menu.
   To use on a new page, add one line before </body>:
     <script src="/assets/nav.js?v=20260908c" defer></script>
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
    ['/ai-automation/', 'AI Automation'],
    ['/request-an-audit/', 'Request an audit']
  ];
  var COMPANY = [
    ['/work/', 'Work'],
    ['/#consulting', 'Consulting'],
    ['/#why', 'Why us'],
    ['/#process', 'Process'],
    ['/blog/', 'Blog'],
    ['/contact/', 'Contact'],
    ['/trust/', 'Trust & Compliance']
  ];

  /* Single source of truth for the contact strip under the primary nav.
     Change the number here and it updates on every page that loads this file. */
  var CONTACT = {
    email: 'hello@icewind.uk',
    phoneDisplay: '+44 7345 058863',
    phoneLink: 'https://wa.me/447345058863'
  };

  var bar = document.querySelector('header .nav');
  if (!bar) return;

  if (!document.querySelector('link[href="/assets/nav.css?v=20260908c"]')) {
    var css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = '/assets/nav.css?v=20260908c';
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

  /* ---------- contact strip under the nav ----------
     Runs on every page that has a header, including the pages with the
     stripped-down header (start a project, audit, trust, legal, demo). */
  var header = bar.closest('header');
  if (header && !header.querySelector('.nav-contact')) {
    var strip = document.createElement('div');
    strip.className = 'nav-contact';
    var inner = document.createElement('div');
    inner.className = 'wrap nav-contact-inner';

    var label = document.createElement('span');
    label.className = 'nav-contact-label';
    label.textContent = 'Get in touch:';

    var mail = document.createElement('a');
    mail.href = 'mailto:' + CONTACT.email;
    mail.textContent = CONTACT.email;
    mail.setAttribute('aria-label', 'Email ' + CONTACT.email);

    var sep = document.createElement('span');
    sep.className = 'nav-contact-sep';
    sep.setAttribute('aria-hidden', 'true');
    sep.textContent = '|';

    var wa = document.createElement('a');
    wa.href = CONTACT.phoneLink;
    wa.target = '_blank';
    wa.rel = 'noopener noreferrer';
    /* the word is dropped on narrow screens so the strip stays one line;
       the accessible name below keeps it for screen readers */
    var waWord = document.createElement('span');
    waWord.className = 'nav-contact-app';
    waWord.textContent = 'WhatsApp ';
    wa.appendChild(waWord);
    wa.appendChild(document.createTextNode(CONTACT.phoneDisplay));
    wa.setAttribute('aria-label', 'Message ICE WIND on WhatsApp, ' + CONTACT.phoneDisplay);

    inner.appendChild(label);
    inner.appendChild(mail);
    inner.appendChild(sep);
    inner.appendChild(wa);
    strip.appendChild(inner);
    header.appendChild(strip);

    /* The mobile menu is positioned from the bottom of the header, so --nav-h has to
       match the real header height now that it is two rows tall.

       Pages whose header is position:fixed take it out of the flow, and their top
       offsets were written for a single-row header, so the strip's own height has to
       be given back to the page. Pages with a sticky header need no compensation —
       there the strip already occupies flow space. */
    var fixedHeader = getComputedStyle(header).position === 'fixed';
    var basePadding = parseFloat(getComputedStyle(document.body).paddingTop) || 0;
    var syncHeight = function () {
      document.documentElement.style.setProperty('--nav-h', header.offsetHeight + 'px');
      if (fixedHeader) {
        document.body.style.paddingTop = (basePadding + strip.offsetHeight) + 'px';
      }
    };
    syncHeight();
    window.addEventListener('resize', syncHeight);
    window.addEventListener('load', syncHeight);
  }

  /* ---------- everything below needs the full primary nav ---------- */
  var cta = bar.querySelector('a.btn[href="/start-a-project/"]');
  if (!cta || document.querySelector('.nav-toggle')) return;

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

  /* ---------- desktop: add "Contact" to the primary links ---------- */
  var linkList = bar.querySelector('nav.links');
  if (linkList && !linkList.querySelector('a[href="/contact/"]')) {
    linkList.appendChild(link('/contact/', 'Contact'));
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
    '<a href="mailto:' + CONTACT.email + '">' + CONTACT.email + '</a>';
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
