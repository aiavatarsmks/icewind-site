/* ICE WIND — mirror enquiry forms into Zoho CRM via the site Worker.

   The browser posts the actual enquiry to the Worker's durable email outbox
   and lands on ?sent=true. This file adds a separate CRM copy to the same
   Worker before the browser submits the actual form.

   How it hangs together:
     - the page's inline script validates and, on failure, calls preventDefault;
       this file runs after it and skips whenever defaultPrevented is set;
     - the Worker POST is accepted after durable storage; a failed CRM request
       must never cost the visitor their email enquiry, so we wait at most
       ZOHO_TIMEOUT and then submit the real form regardless.

   Everything the visitor typed is folded into Description, because contact
   details on this site are free text and may be a Telegram handle rather
   than an email.

   To use on a page, add one line before </body>:
     <script src="/assets/zoho-lead.js?v=20260929d" defer></script> */
(function () {
  'use strict';

  var ENDPOINT = 'https://icewind-quiz-proxy.icewinddale.workers.dev/crm-lead';
  var ZOHO_TIMEOUT = 2500;      /* ms we are willing to make the visitor wait */
  var FALLBACK_NAME = 'Website enquiry';
  var COMPANY = 'Website visitor';

  /* One entry per plain form. The guided quiz submits its CRM copy separately. */
  var FORMS = {
    '/start-a-project/': {
      form: 'project-form',
      label: 'Start a Project',
      fields: [
        ['Contact details', 'Contact'],
        ['Project type', 'Project type'],
        ['Project description', 'Project description'],
        ['Reference/link', 'Reference']
      ]
    },
    '/request-an-audit/': {
      form: 'project-form',
      label: 'Request an Audit',
      fields: [
        ['Contact details', 'Contact'],
        ['Website', 'Website'],
        ['Audit type', 'Audit type'],
        ['What the client wants to understand', 'What they want to know']
      ]
    },
    '/contact/': {
      form: 'contact-form',
      label: 'Contact Enquiry',
      fields: [
        ['Preferred reply channel', 'Contact'],
        ['Enquiry', 'Message']
      ]
    },
    '/demo/order-quiz/': {
      form: 'project-form',
      label: 'Demo Plain Project Form',
      fields: [
        ['Contact details', 'Contact'],
        ['Project type', 'Project type'],
        ['Project description', 'Project description'],
        ['Reference/link', 'Reference']
      ]
    }
  };

  var here = location.pathname.replace(/\/+$/, '') + '/';
  var config = FORMS[here];
  if (!config) return;

  var form = document.getElementById(config.form);
  if (!form) return;

  function value(name) {
    var data = new FormData(form);
    var v = data.get(name);
    return typeof v === 'string' ? v.trim() : '';
  }

  function looksLikeEmail(s) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s);
  }

  function looksLikePhone(s) {
    return /^[+\d][\d\s().-]{6,}$/.test(s) && (s.replace(/\D/g, '').length >= 7);
  }

  function describe(data) {
    var lines = ['Source: Website', 'Form: ' + config.label];
    config.fields.forEach(function (pair) {
      var v = data.get(pair[1]);
      lines.push(pair[0] + ': ' + (typeof v === 'string' && v.trim() ? v.trim() : 'empty'));
    });
    return lines.join('\n');
  }

  function payload() {
    var data = new FormData(form);
    var name = value('Name') || FALLBACK_NAME;
    var contact = value('Contact');
    var summary = describe(data).slice(0, 16000);
    var pageLine = '\nPage: ' + location.origin + location.pathname;
    var body = {
      _honey: value('_honey'),
      'Company': COMPANY,
      'Last Name': name.slice(0, 80),
      'Description': summary + pageLine
    };
    if (looksLikeEmail(contact)) body.Email = contact.slice(0, 100);
    else if (looksLikePhone(contact)) body.Phone = contact.slice(0, 30);
    var parts = [];
    Object.keys(body).forEach(function (k) {
      parts.push(encodeURIComponent(k) + '=' + encodeURIComponent(body[k]));
    });
    while (parts.join('&').length > 38000 && summary.length > 500) {
      summary = summary.slice(0, Math.floor(summary.length / 2));
      body.Description = summary + pageLine;
      parts = [];
      Object.keys(body).forEach(function (k) {
        parts.push(encodeURIComponent(k) + '=' + encodeURIComponent(body[k]));
      });
    }
    return parts.join('&');
  }

  var sending = false;

  form.addEventListener('submit', function (event) {
    if (event.defaultPrevented) return;   /* the page's own validation failed */
    if (sending) return;                  /* our own re-submit, let it through */
    if (!window.fetch || !window.FormData) return;

    event.preventDefault();
    sending = true;

    var done = false;
    var go = function () {
      if (done) return;
      done = true;
      form.submit();
    };

    try {
      fetch(ENDPOINT, {
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
        keepalive: true,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        body: payload()
      }).then(function (response) {
        if (!response.ok) console.error('[iw-crm] Lead delivery was not accepted:', response.status);
        go();
      }, go);
    } catch (e) {
      go();
      return;
    }
    setTimeout(go, ZOHO_TIMEOUT);
  });
})();
