/* ICE WIND — privacy-first analytics with UK/PECR cookie consent.
   Google Analytics 4 loads ONLY after the visitor explicitly accepts.
   Microsoft Clarity is driven by its Consent API v2 (consentv2):
     - before any choice, after "Reject" and after withdrawal both
       ad_Storage and analytics_Storage are "denied" (no Clarity cookies);
     - after "Accept analytics" only analytics_Storage becomes "granted";
       ad_Storage stays "denied" (we never ask for advertising consent).
   Whether Clarity loads BEFORE consent (no-consent mode, no cookies) is a
   single switch, CLARITY_BEFORE_CONSENT, off by default. Flip it only after
   the owner's decision; see the comment next to it.
   Real analytics scripts load on the production domain only, so preview
   and local testing never pollute the statistics.
   Owner dashboards: GA4 (G-W2PWZGRFQH) and Clarity (xt2y7vssz3). */
(function () {
  'use strict';

  var GA_ID = 'G-W2PWZGRFQH';
  var CLARITY_ID = 'xt2y7vssz3';
  var STORAGE_KEY = 'iw-consent';            // 'granted' | 'denied'
  var PROD_HOSTS = ['icewind.uk', 'www.icewind.uk'];
  /* Load Clarity on page open in no-consent mode (no cookies, per-pageview
     sessions, recordings not linked across pages)? Requires the Clarity
     project setting "Cookies" to be OFF, and the owner's explicit decision,
     because Clarity still records the visit (clicks, scrolls, page render)
     before consent. false = Clarity loads only after "Accept analytics". */
  var CLARITY_BEFORE_CONSENT = false;

  function isProd() { return PROD_HOSTS.indexOf(location.hostname) !== -1; }
  function getConsent() { try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; } }
  function setConsent(v) { try { localStorage.setItem(STORAGE_KEY, v); } catch (e) {} }

  /* ---- Consent Mode v2: default everything denied until the visitor opts in ---- */
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;
  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied'
  });

  /* ---- Microsoft Clarity: consent signal + loader ---- */
  function clarityStub() {
    window.clarity = window.clarity || function () {
      (window.clarity.q = window.clarity.q || []).push(arguments);
    };
  }
  /* The only two states we ever send. ad_Storage is never granted. */
  function clarityConsent(granted) {
    clarityStub();
    try {
      window.clarity('consentv2', {
        ad_Storage: 'denied',
        analytics_Storage: granted ? 'granted' : 'denied'
      });
    } catch (e) {}
  }
  var clarityLoaded = false;
  function loadClarity(granted) {
    clarityConsent(granted);          // queued before the tag, applied on start
    if (clarityLoaded) return;
    clarityLoaded = true;
    if (!isProd()) return;
    if (document.querySelector('script[src^="https://www.clarity.ms/tag/"]')) return;
    var t = document.createElement('script');
    t.async = true;
    t.src = 'https://www.clarity.ms/tag/' + CLARITY_ID;
    document.head.appendChild(t);
  }

  /* ---- Google Analytics 4: unchanged rule, loads after consent only ---- */
  var loaded = false;
  function loadAnalytics() {
    if (loaded) return;
    loaded = true;
    gtag('consent', 'update', { analytics_storage: 'granted' });
    if (!isProd()) return; // only fire real network scripts on production

    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    gtag('js', new Date());
    gtag('config', GA_ID, { anonymize_ip: true });
  }

  function denyAnalytics() {
    gtag('consent', 'update', { analytics_storage: 'denied' });
  }

  /* ---- what each consent state means for both tools ---- */
  function applyGranted() {
    loadAnalytics();
    loadClarity(true);                // loads if not yet loaded, else just the signal
    startEvents();
  }
  function applyDenied() {
    denyAnalytics();
    if (clarityLoaded) {
      clarityConsent(false);          // Clarity deletes its cookies and restarts in no-consent mode
      try { sessionStorage.removeItem('_cltk'); } catch (e) {}   // tab-scoped key Clarity leaves behind
      /* Consent-only mode: a withdrawal must end the recording on this page too,
         not just switch it to no-consent mode. */
      if (!CLARITY_BEFORE_CONSENT) { try { window.clarity('stop'); } catch (e) {} }
    }
    else if (CLARITY_BEFORE_CONSENT) loadClarity(false);
    if (clarityLoaded) startEvents();
  }

  /* ---- key events: names only, never form values ---- */
  function ev(name, params) {
    try { window.gtag('event', name, params || {}); } catch (e) {}
    try { if (window.clarity) window.clarity('event', name); } catch (e) {}
  }
  var eventsStarted = false;
  function startEvents() {
    if (eventsStarted) return;
    eventsStarted = true;
    bindEvents();
    fireLeadIfThankYou();
  }
  function bindEvents() {
    document.addEventListener('click', function (e) {
      var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
      if (!a) return;
      var href = a.getAttribute('href') || '';
      if (/^tel:/i.test(href)) ev('contact_click', { method: 'phone' });
      else if (/t\.me|telegram/i.test(href)) ev('contact_click', { method: 'telegram' });
      else if (/instagram\.com/i.test(href)) ev('contact_click', { method: 'instagram' });
      else if (/^mailto:/i.test(href)) ev('contact_click', { method: 'email' });
      else if (/\/start-a-project\/?($|[#?])/.test(href)) ev('start_project_click', {});
    }, true);
  }
  function fireLeadIfThankYou() {
    try {
      if (/\/(?:start-a-project|request-an-audit|contact|limitedoffer)\/?$/.test(location.pathname) &&
          new URLSearchParams(location.search).has('sent')) {
        ev('generate_lead', {});
      }
    } catch (e) {}
  }

  /* ---- consent banner UI (matches the ICE WIND design system) ---- */
  var STYLE_ID = 'iw-consent-style';
  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var css =
      '.iw-consent{position:fixed;left:16px;right:16px;bottom:16px;z-index:9999;max-width:560px;margin:0 auto;' +
      'border:1px solid rgba(125,211,252,.3);border-radius:16px;padding:20px 22px;color:#dbe7f4;' +
      'background:linear-gradient(160deg,#0a1830,#060e1e);box-shadow:0 18px 50px rgba(3,10,22,.6);' +
      'font-family:Inter,system-ui,sans-serif;font-size:.92rem;line-height:1.55}' +
      '.iw-consent h2{font-family:"Space Grotesk",sans-serif;font-size:1.05rem;color:#e0f2fe;margin:0 0 8px}' +
      '.iw-consent p{margin:0 0 14px;color:#9fb0c4}' +
      '.iw-consent a{color:#7dd3fc;text-decoration:underline;text-underline-offset:3px}' +
      '.iw-consent-actions{display:flex;gap:10px;flex-wrap:wrap}' +
      '.iw-consent button{flex:1 1 auto;min-width:140px;padding:11px 20px;border-radius:999px;font:600 .9rem Inter,sans-serif;cursor:pointer;border:1px solid transparent;transition:transform .2s ease,box-shadow .2s ease,border-color .2s ease}' +
      '.iw-consent .iw-accept{background:linear-gradient(120deg,#38bdf8,#7dd3fc);color:#04101e;box-shadow:0 0 22px rgba(56,189,248,.3)}' +
      '.iw-consent .iw-accept:hover{transform:translateY(-1px);box-shadow:0 0 32px rgba(56,189,248,.5)}' +
      '.iw-consent .iw-reject{background:transparent;color:#e0f2fe;border-color:rgba(125,211,252,.3)}' +
      '.iw-consent .iw-reject:hover{border-color:#7dd3fc}' +
      '.iw-consent button:focus-visible,.iw-consent a:focus-visible{outline:3px solid rgba(125,211,252,.55);outline-offset:3px}' +
      '@media(max-width:480px){.iw-consent{left:10px;right:10px;bottom:10px;padding:18px}.iw-consent button{flex:1 1 100%}}' +
      '@media(prefers-reduced-motion:reduce){.iw-consent .iw-accept{transition:none}}';
    var st = document.createElement('style');
    st.id = STYLE_ID;
    st.textContent = css;
    document.head.appendChild(st);
  }

  var bannerEl = null;
  function hideBanner() {
    if (bannerEl && bannerEl.parentNode) bannerEl.parentNode.removeChild(bannerEl);
    bannerEl = null;
  }
  function showBanner() {
    injectStyles();
    hideBanner();
    var b = document.createElement('section');
    b.className = 'iw-consent';
    b.setAttribute('role', 'region');
    b.setAttribute('aria-label', 'Cookie consent');
    b.innerHTML =
      '<h2>We value your privacy</h2>' +
      '<p>We’d like to use analytics cookies (Google Analytics and Microsoft Clarity) ' +
      'to understand how visitors use the site and improve it. These are optional. ' +
      'Separately, we keep cookieless, aggregate visit statistics (Plausible) that store ' +
      'nothing on your device and hold no personal data; you can exclude your browser on the ' +
      '<a href="/cookies/">Cookie Policy</a> page.</p>' +
      '<div class="iw-consent-actions">' +
      '<button type="button" class="iw-accept">Accept analytics</button>' +
      '<button type="button" class="iw-reject">Reject</button>' +
      '</div>';
    b.querySelector('.iw-accept').addEventListener('click', function () {
      setConsent('granted'); hideBanner(); applyGranted();
    });
    b.querySelector('.iw-reject').addEventListener('click', function () {
      setConsent('denied'); hideBanner(); applyDenied();
    });
    document.body.appendChild(b);
    bannerEl = b;
    var f = b.querySelector('.iw-accept');
    if (f) f.focus();
  }

  // Public hook + re-open control (used from the Cookie Policy page)
  window.iwOpenConsent = showBanner;
  document.addEventListener('click', function (e) {
    var t = e.target && e.target.closest
      ? e.target.closest('[data-cookie-settings],a[href="#cookie-settings"]') : null;
    if (t) { e.preventDefault(); showBanner(); }
  });

  function onReady(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  /* ---- init ---- */
  var consent = getConsent();
  if (consent === 'granted') applyGranted();
  else {
    applyDenied();                     // stored "denied" or no decision yet: both signals denied
    if (consent !== 'denied') onReady(showBanner);
  }
})();
