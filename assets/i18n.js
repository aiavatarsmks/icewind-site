/* Language switcher and runtime translation of script-inserted text.
   Page copy is already translated in the static /ru/, /es/ and /uk/ HTML;
   this file only translates strings that scripts add later (form messages,
   cookie banner, mobile menu labels) and moves between language versions. */
(function () {
  'use strict';
  var current = window.IW_LANGUAGE || 'en';
  var dictionary = {};
  var textState = new WeakMap();
  var attrState = new WeakMap();
  var attrs = ['alt', 'aria-label', 'title', 'placeholder'];
  var ignored = 'script,style,noscript,svg,code,pre';
  var languageNames = { ru: 'Русский', en: 'English', es: 'Español', uk: 'Українська' };
  var observer;

  function key(value) { return String(value || '').replace(/\s+/g, ' ').trim(); }
  function translated(source) { return current === 'en' ? source : dictionary[source] || source; }
  function textNode(node) {
    if (!node.parentElement || node.parentElement.closest(ignored)) return;
    var value = node.nodeValue;
    var state = textState.get(node);
    if (!state || value !== state.last) {
      state = { source: key(value), prefix: (value.match(/^\s*/) || [''])[0], suffix: (value.match(/\s*$/) || [''])[0], last: value };
      textState.set(node, state);
    }
    if (!state.source) return;
    var output = state.prefix + translated(state.source) + state.suffix;
    if (output !== value) { state.last = output; node.nodeValue = output; }
  }
  function attributes(element) {
    if (element.closest(ignored)) return;
    var state = attrState.get(element) || {};
    attrs.forEach(function (name) {
      if (!element.hasAttribute(name)) return;
      var value = element.getAttribute(name);
      if (!state[name] || value !== state[name].last) state[name] = { source: key(value), last: value };
      var output = translated(state[name].source);
      if (output !== value) { state[name].last = output; element.setAttribute(name, output); }
    });
    attrState.set(element, state);
  }
  function scan(root) {
    if (root.nodeType === Node.TEXT_NODE) { textNode(root); return; }
    if (root.nodeType !== Node.ELEMENT_NODE || root.closest(ignored)) return;
    attributes(root);
    root.querySelectorAll('*').forEach(attributes);
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) textNode(walker.currentNode);
  }
  function watch() {
    observer = new MutationObserver(function (mutations) {
      observer.disconnect();
      mutations.forEach(function (mutation) {
        if (mutation.type === 'characterData') textNode(mutation.target);
        else if (mutation.type === 'attributes') attributes(mutation.target);
        else mutation.addedNodes.forEach(scan);
      });
      observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: attrs });
    });
    scan(document.body);
    observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: attrs });
  }

  function basePath() {
    return location.pathname.replace(/^\/(ru|es|uk)(?=\/)/, '') || '/';
  }
  function urlFor(language) {
    var path = basePath();
    var search = location.search.replace(/([?&])lang=en(&|$)/, '$1').replace(/[?&]$/, '');
    if (language === 'en') search += (search ? '&' : '?') + 'lang=en';
    return (language === 'en' ? '' : '/' + language) + path + search + location.hash;
  }
  function switcher() {
    var bar = document.querySelector('header .nav, header .header-row, header .header-inner');
    if (!bar || document.getElementById('iw-language-select')) return;
    var label = document.createElement('label');
    label.className = 'iw-language';
    var hidden = document.createElement('span');
    hidden.className = 'iw-language-label';
    hidden.textContent = translated('Website language');
    var select = document.createElement('select');
    select.id = 'iw-language-select';
    select.setAttribute('aria-label', translated('Website language'));
    [['ru', 'ru'], ['en', 'en'], ['es', 'es'], ['uk', 'ua']].forEach(function (item) {
      var option = document.createElement('option');
      option.value = item[0];
      option.textContent = item[1];
      option.setAttribute('aria-label', languageNames[item[0]]);
      option.title = languageNames[item[0]];
      select.appendChild(option);
    });
    select.value = current;
    select.title = languageNames[current];
    select.addEventListener('change', function () {
      try { localStorage.setItem('iw-language', select.value); } catch (e) {}
      location.href = urlFor(select.value);
    });
    label.appendChild(hidden);
    label.appendChild(select);
    var anchor = bar.querySelector(':scope > .button-small');
    bar.insertBefore(label, anchor || bar.firstChild);
  }

  /* Visitors who arrived with ?lang=en chose English explicitly; drop the marker. */
  if (current === 'en' && /[?&]lang=en\b/.test(location.search) && history.replaceState) {
    var cleaned = location.search.replace(/([?&])lang=en(&|$)/, '$1').replace(/[?&]$/, '');
    history.replaceState(null, '', location.pathname + cleaned + location.hash);
  }

  if (current === 'en') {
    switcher();
  } else {
    fetch('/assets/i18n/' + current + '.json?v=20261012b')
      .then(function (response) { if (!response.ok) throw new Error('Translations unavailable'); return response.json(); })
      .then(function (values) { dictionary = values; })
      .catch(function (error) { console.error('ICE WIND translations could not be loaded:', error); })
      .then(function () { switcher(); watch(); });
  }

  var desktop = window.matchMedia('(min-width:1480px)');
  var closeWideMenu = function (event) {
    if (!event.matches) return;
    var button = document.querySelector('.nav-toggle[aria-expanded="true"]');
    if (button) button.click();
  };
  if (desktop.addEventListener) desktop.addEventListener('change', closeWideMenu);
  else desktop.addListener(closeWideMenu);
  window.IW_I18N = { get language() { return current; }, t: translated, url: urlFor };
})();
