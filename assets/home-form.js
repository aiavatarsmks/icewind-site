
(function () {
  var form = document.getElementById('home-contact-form');
  if (!form) return;
  var status = document.getElementById('qc-status');
  var submit = document.getElementById('qc-submit');
  function setError(id, message) {
    document.getElementById(id + '-field').classList.add('invalid');
    document.getElementById(id + '-error').textContent = message;
  }
  form.addEventListener('input', function (event) {
    var field = event.target.closest('.field');
    if (field && field.classList.contains('invalid')) {
      field.classList.remove('invalid');
      var error = field.querySelector('.error'); if (error) error.textContent = '';
    }
  });
  form.addEventListener('submit', function (event) {
    form.querySelectorAll('.field.invalid').forEach(function (field) {
      field.classList.remove('invalid');
      var error = field.querySelector('.error'); if (error) error.textContent = '';
    });
    status.classList.remove('show');
    var name = document.getElementById('qc-name');
    var contact = document.getElementById('qc-contact');
    var message = document.getElementById('qc-message');
    var first = null;
    if (!name.value.trim()) { setError('qc-name', 'Please enter your name.'); first = name; }
    if (!contact.value.trim()) { setError('qc-contact', 'Please tell us how to reply.'); first = first || contact; }
    if (!message.value.trim()) { setError('qc-message', 'Please tell us what your enquiry is about.'); first = first || message; }
    if (first) {
      event.preventDefault();
      status.textContent = 'Please review the highlighted fields and try again.';
      status.classList.add('show');
      first.focus();
      return;
    }
    /* The form posts into the hidden frame. On success the Worker redirects it to
       /contact/?sent=true on our own origin, which we can read; an error leaves the
       frame on the Worker's origin, so reading it throws and we report a failure. */
    var label = submit.textContent;
    var settled = false;
    function finish(ok) {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      frame.removeEventListener('load', onLoad);
      submit.disabled = false; submit.textContent = label; form.removeAttribute('aria-busy');
      status.classList.add('show');
      status.classList.toggle('ok', ok);
      status.textContent = ok
        ? 'Thank you — your enquiry has been sent. We will reply within one business day.'
        : 'Sorry, we could not send your enquiry. Please email hello@icewind.uk or call +44 7782 222054.';
      if (ok) form.reset();
    }
    function onLoad() {
      var ok = false;
      try { ok = frame.contentWindow.location.pathname === '/contact/' && frame.contentWindow.location.search === '?sent=true'; } catch (e) {}
      finish(ok);
    }
    var frame = document.getElementById('qc-target');
    frame.addEventListener('load', onLoad);
    var timer = setTimeout(function () { finish(false); }, 30000);
    status.classList.remove('show', 'ok');
    submit.disabled = true; submit.textContent = 'Sending…'; form.setAttribute('aria-busy', 'true');
  });
})();
