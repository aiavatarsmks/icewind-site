/* ICE WIND — mirror enquiry forms into Zoho CRM (Web-to-Lead).

   The site's own submission is unchanged: the browser still posts the form to
   formsubmit.co and still lands on ?sent=true. This file only adds a second,
   silent POST to Zoho's Web-to-Lead endpoint so the same enquiry also appears
   in Leads ("Предварительные контакты").

   How it hangs together:
     - the page's inline script validates and, on failure, calls preventDefault;
       this file runs after it and skips whenever defaultPrevented is set;
     - the Zoho POST is sent with mode:'no-cors', so nothing can be read back —
       success or failure is invisible by design. A failed Zoho POST must never
       cost the visitor their enquiry, so we wait at most ZOHO_TIMEOUT for it
       and then submit the real form regardless.

   Zoho ignores any field that is not defined in the web form itself, so the
   five names below (Company, Last Name, Email, Phone, Description) must exist
   in each form in Setup → Web Forms. Everything the visitor typed is folded
   into Description, because contact details on this site are free text and may
   be a Telegram handle rather than an email.

   To use on a page, add one line before </body>:
     <script src="/assets/zoho-lead.js?v=20260916" defer></script> */
(function () {
  'use strict';

  var ENDPOINT = 'https://crm.zoho.eu/crm/WebToLeadForm';
  var ZOHO_TIMEOUT = 2500;      /* ms we are willing to make the visitor wait */
  var FALLBACK_NAME = 'Website enquiry';
  var COMPANY = 'Website visitor';

  /* One entry per page. The two long tokens are per-form and are NOT
     interchangeable — each comes from that form's own "Исходный код".

     `ready` stays false until the matching Zoho form actually carries the
     Email, Phone and Description fields. Zoho silently drops any field the
     form does not define, so sending to a form that only has Company and
     Last Name would create Leads reading "Website visitor / <name>" with the
     whole enquiry lost — worse than not sending at all. */
  var FORMS = {
    '/start-a-project/': {
      form: 'project-form',
      label: 'Start a Project',
      ready: true,
      xnQsjsdp: 'fbd34dde5766d081d54c5297a71ea3dfcc060c4ddf0f4588b194bd83d8a3f41b',
      xmIwtLD: '075fba2c808065e6f41563795c4fa89aacd210b8b8be93e7947f10305f6e71e10d7e8d8d229bd3294a708768c2db75f4',
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
      ready: true,
      xnQsjsdp: 'b35c911961a92001eae9659781a635a1cb09c76e61eaf4776ebab48189cf98f7',
      xmIwtLD: '59651176d50e5f88934ea3eaa844d6a2508d3095a88241218d7209b00d2d198c28210fb427bc0c31ed70efa40d0e7687',
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
      ready: true,
      xnQsjsdp: '00c4204785229c313d697b44c13b7f96e3f3495189ac66fc28404d867b8746bb',
      xmIwtLD: 'a6861123261bdf52dfd1766a19e980d4a52784a1874bc6fb08ede40bafc9ba6ee80b596d8d506c51a783e2de387a6dc7',
      fields: [
        ['Preferred reply channel', 'Contact'],
        ['Enquiry', 'Message']
      ]
    }
  };

  var here = location.pathname.replace(/\/+$/, '') + '/';
  var config = FORMS[here];
  if (!config || !config.ready || !config.xnQsjsdp || !config.xmIwtLD) return;

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
    lines.push('Page: ' + location.origin + location.pathname);
    return lines.join('\n');
  }

  function payload() {
    var data = new FormData(form);
    var name = value('Name') || FALLBACK_NAME;
    var contact = value('Contact');
    var body = {
      xnQsjsdp: config.xnQsjsdp,
      xmIwtLD: config.xmIwtLD,
      actionType: 'TGVhZHM=',   /* base64 "Leads" — same for every Leads form */
      returnURL: 'null',
      zc_gad: '',
      aG9uZXlwb3Q: '',          /* Zoho's own honeypot; must be sent empty */
      'Company': COMPANY,
      'Last Name': name.slice(0, 80),
      'Description': describe(data).slice(0, 30000)
    };
    if (looksLikeEmail(contact)) body.Email = contact.slice(0, 100);
    else if (looksLikePhone(contact)) body.Phone = contact.slice(0, 30);
    var parts = [];
    Object.keys(body).forEach(function (k) {
      parts.push(encodeURIComponent(k) + '=' + encodeURIComponent(body[k]));
    });
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
        mode: 'no-cors',
        credentials: 'omit',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        body: payload()
      }).then(go, go);
    } catch (e) {
      go();
      return;
    }
    setTimeout(go, ZOHO_TIMEOUT);
  });
})();
