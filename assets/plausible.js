/* ICE WIND — cookieless aggregate statistics (Plausible Analytics).

   Independent of the consent banner in analytics.js: Plausible stores nothing on the
   visitor's device (no cookies, no localStorage), keeps no persistent identifier and
   discards query strings such as gclid before storing a pageview. It therefore runs
   whether the visitor accepted, rejected or ignored the analytics banner.

   What it must never receive: names, emails, phone numbers, message text, form values
   or any URL that carries personal data. Only event names and, on the Business plan,
   a button position.

   Opt-out: the visitor sets localStorage 'plausible_ignore' = 'true' from the Cookie
   Policy page (data-plausible-optout). The Plausible script honours that key itself,
   and this file additionally never loads the script when it is set.

   The only other thing this file writes to the browser is a sessionStorage marker
   ('iw-lead-pending', a timestamp) set when the /limitedoffer/ form is actually
   submitted, read and deleted on the thank-you page so one enquiry counts once.

   Production only (same rule as analytics.js), so previews never pollute the stats. */
(function () {
  'use strict';

  var DOMAIN = 'icewind.uk';
  /* Site-specific script issued by Plausible for icewind.uk (Settings > Site installation). */
  var SCRIPT_SRC = 'https://plausible.io/js/pa-c1I2cCX-MDVVkLxkss49N.js';
  var PROD_HOSTS = ['icewind.uk', 'www.icewind.uk'];
  var OPTOUT_KEY = 'plausible_ignore';
  /* Custom properties are a Plausible Business-plan feature. On Starter/Growth we
     send separate event names instead ("CTA Click Hero" etc.). Flip to true only
     after the plan is upgraded; the goal names in the dashboard change with it. */
  var USE_PROPS = false;

  function isProd() { return PROD_HOSTS.indexOf(location.hostname) !== -1; }
  function optedOut() { try { return localStorage.getItem(OPTOUT_KEY) === 'true'; } catch (e) { return false; } }
  function setOptOut(on) {
    try { if (on) localStorage.setItem(OPTOUT_KEY, 'true'); else localStorage.removeItem(OPTOUT_KEY); } catch (e) {}
  }

  /* ---- opt-out control on the Cookie Policy page (works on every page, loads nothing) ---- */
  function renderOptOut() {
    var links = document.querySelectorAll('[data-plausible-optout]');
    for (var i = 0; i < links.length; i++) {
      links[i].textContent = optedOut()
        ? 'Statistics are switched off for this browser. Switch them back on'
        : 'Exclude this browser from our visit statistics';
    }
    var status = document.querySelectorAll('[data-plausible-status]');
    for (var j = 0; j < status.length; j++) {
      status[j].textContent = optedOut()
        ? 'Current state: excluded. Your visits are not counted in our statistics.'
        : 'Current state: counted (no cookies, no personal data).';
    }
  }
  document.addEventListener('click', function (e) {
    var t = e.target && e.target.closest ? e.target.closest('[data-plausible-optout]') : null;
    if (!t) return;
    e.preventDefault();
    setOptOut(!optedOut());
    renderOptOut();
  });
  function onReady(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }
  onReady(renderOptOut);

  if (!isProd() || optedOut()) return;

  /* ---- Plausible's own snippet, split into: queue stub + init + script tag ---- */
  window.plausible = window.plausible || function () {
    (window.plausible.q = window.plausible.q || []).push(arguments);
  };
  window.plausible.init = window.plausible.init || function (i) { window.plausible.o = i || {}; };
  window.plausible.init({ autoCapturePageviews: true, outboundLinks: false, fileDownloads: false, formSubmissions: false });

  /* ---- load the script exactly once ---- */
  if (!document.querySelector('script[src="' + SCRIPT_SRC + '"]')) {
    var s = document.createElement('script');
    s.async = true;
    s.setAttribute('data-plausible', DOMAIN);
    s.src = SCRIPT_SRC;
    document.head.appendChild(s);
  }

  function track(name, opts) {
    try { window.plausible(name, opts || {}); } catch (e) {}
  }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  /* ---- /limitedoffer/ goals ---- */
  if (!/^\/limitedoffer\/?$/.test(location.pathname)) return;

  onReady(function () {
    var fired = {};
    function once(name, opts) {
      if (fired[name]) return;
      fired[name] = true;
      track(name, opts);
    }

    /* Section reached: one event per page load, not counted as interaction so the
       bounce rate still reflects clicks and form use only. */
    function watch(selector, name) {
      var el = document.querySelector(selector);
      if (!el || !('IntersectionObserver' in window)) return;
      var io = new IntersectionObserver(function (entries) {
        for (var i = 0; i < entries.length; i++) {
          if (entries[i].isIntersecting) { once(name, { interactive: false }); io.disconnect(); return; }
        }
      }, { threshold: 0.25 });
      io.observe(el);
    }
    watch('#included', 'Offer Details Viewed');
    watch('#work', 'Case Studies Viewed');
    watch('#offer-form', 'Contact Form Viewed');

    /* Clicks: every click counts (a visitor may press the CTA twice on purpose). */
    function ctaClick(position) {
      if (USE_PROPS) track('CTA Click', { props: { position: position } });
      else track('CTA Click ' + cap(position));
    }
    document.addEventListener('click', function (e) {
      var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
      if (!a) return;
      var href = a.getAttribute('href') || '';
      if (href === '#enquiry') {
        var position = a.closest('header') ? 'header'
          : a.closest('.hero') ? 'hero'
          : a.closest('#included') ? 'package'
          : a.closest('footer') ? 'footer'
          : 'other';
        ctaClick(position);
      } else if (/^tel:/i.test(href)) {
        track('Phone Click');
      } else if (/wa\.me|api\.whatsapp\.com|whatsapp:/i.test(href)) {
        track('WhatsApp Click');
      }
    }, true);

    /* First interaction with the form, once per page load. Only the fact, never a value. */
    var form = document.getElementById('offer-form');
    if (form) {
      var onFirst = function (e) {
        var t = e.target;
        if (!t || !t.name || t.name === '_honey') return;
        if (t.tagName !== 'INPUT' && t.tagName !== 'TEXTAREA' && t.tagName !== 'SELECT') return;
        once('Contact Form Started');
        form.removeEventListener('focusin', onFirst);
        form.removeEventListener('input', onFirst);
      };
      form.addEventListener('focusin', onFirst);
      form.addEventListener('input', onFirst);
    }

    /* Lead: the Worker accepts the enquiry and redirects the browser to ?sent=true.
       Opening that URL by hand, reloading it or going back to it must not count.
       So the event needs all three: (1) a real submit of #offer-form in this tab,
       marked by a short-lived sessionStorage flag that holds only a timestamp,
       (2) a fresh navigation (not reload / back-forward), (3) the ?sent flag.
       The marker is removed as soon as it is read. */
    var LEAD_KEY = 'iw-lead-pending';
    var LEAD_TTL = 10 * 60 * 1000;
    if (form) {
      form.addEventListener('submit', function () {
        try { sessionStorage.setItem(LEAD_KEY, String(Date.now())); } catch (e) {}
      }, true);
    }
    try {
      if (new URLSearchParams(location.search).has('sent')) {
        var nav = performance.getEntriesByType ? performance.getEntriesByType('navigation')[0] : null;
        var type = nav ? nav.type : 'navigate';
        var pending = 0;
        try { pending = parseInt(sessionStorage.getItem(LEAD_KEY) || '0', 10); sessionStorage.removeItem(LEAD_KEY); } catch (e) {}
        if (type === 'navigate' && pending && Date.now() - pending < LEAD_TTL) once('Lead Submitted');
      }
    } catch (e) {}
  });
})();
