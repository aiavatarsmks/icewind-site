/* Client-side translations for the selected commercial pages. English HTML stays canonical. */
(function () {
  'use strict';
  var current = window.IW_LANGUAGE || 'en';
  var dictionaries = { en: {} };
  var textState = new WeakMap();
  var attrState = new WeakMap();
  var attrs = ['alt', 'aria-label', 'title', 'placeholder'];
  var ignored = 'script,style,noscript,svg,code,pre';
  var originalTitle = document.title;
  var translatedPath = /^\/(?:$|start-a-project\/?$|request-an-audit\/?$|work\/?$|work\/[^/]+\/?$|contact\/?$|trust\/?$|small-business-web-design\/?$)/;
  var englishOnly = {
    ru: 'Страница на английском языке',
    es: 'Página disponible en inglés',
    uk: 'Сторінка англійською мовою'
  };
  var languageNames = { ru: 'Русский', en: 'English', es: 'Español', uk: 'Українська' };
  var observer;

  function key(value) { return String(value || '').replace(/\s+/g, ' ').trim(); }
  function translated(source) { return current === 'en' ? source : (dictionaries[current] || {})[source] || source; }
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
    var elements = root.querySelectorAll('*');
    elements.forEach(attributes);
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) textNode(walker.currentNode);
  }
  function render() {
    if (observer) observer.disconnect();
    scan(document.body);
    document.querySelectorAll('a[href]').forEach(function (link) {
      var badge = link.querySelector(':scope > .iw-english-only');
      var url;
      try { url = new URL(link.href); } catch (e) { return; }
      var needsBadge = current !== 'en' && url.origin === location.origin &&
        !translatedPath.test(url.pathname) && !link.href.startsWith('#');
      if (!needsBadge && badge) badge.remove();
      if (needsBadge && !badge) {
        badge = document.createElement('small');
        badge.className = 'iw-english-only';
        badge.textContent = ' EN';
        link.appendChild(badge);
      }
      if (needsBadge) { badge.title = englishOnly[current]; badge.setAttribute('aria-label', englishOnly[current]); }
    });
    document.title = translated(originalTitle);
    document.documentElement.lang = current;
    document.documentElement.classList.remove('i18n-pending');
    var select = document.getElementById('iw-language-select');
    if (select) { select.value = current; select.title = languageNames[current]; }
    observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: attrs });
  }
  function load(language) {
    if (dictionaries[language]) return Promise.resolve();
    return fetch('/assets/i18n/' + language + '.json?v=20261012g')
      .then(function (response) { if (!response.ok) throw new Error('Translations unavailable'); return response.json(); })
      .then(function (dictionary) { dictionaries[language] = dictionary; });
  }
  function setLanguage(language, manual) {
    return load(language).then(function () {
      current = language;
      window.IW_LANGUAGE = language;
      if (manual) { try { localStorage.setItem('iw-language', language); } catch (e) {} }
      render();
    }).catch(function (error) {
      console.error('ICE WIND translations could not be loaded:', error);
      current = 'en'; window.IW_LANGUAGE = 'en'; render();
    });
  }
  function switcher() {
    var nav = document.querySelector('header .nav');
    if (!nav) return;
    var label = document.createElement('label');
    label.className = 'iw-language';
    var hidden = document.createElement('span');
    hidden.className = 'iw-language-label';
    hidden.textContent = 'Website language';
    var select = document.createElement('select');
    select.id = 'iw-language-select';
    select.setAttribute('aria-label', 'Website language');
    [['ru', 'ru'], ['en', 'en'], ['es', 'es'], ['uk', 'ua']].forEach(function (item) {
      var option = document.createElement('option'); option.value = item[0]; option.textContent = item[1];
      option.setAttribute('aria-label', languageNames[item[0]]);
      option.title = languageNames[item[0]];
      select.appendChild(option);
    });
    select.value = current;
    select.addEventListener('change', function () { setLanguage(select.value, true); });
    label.appendChild(hidden); label.appendChild(select);
    nav.insertBefore(label, nav.firstChild);
  }
  observer = new MutationObserver(function (mutations) {
    observer.disconnect();
    mutations.forEach(function (mutation) {
      if (mutation.type === 'characterData') textNode(mutation.target);
      else if (mutation.type === 'attributes') attributes(mutation.target);
      else mutation.addedNodes.forEach(scan);
    });
    observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: attrs });
  });
  switcher();
  setLanguage(current, false);
  var desktop = window.matchMedia('(min-width:1480px)');
  var closeWideMenu = function (event) {
    if (!event.matches) return;
    var button = document.querySelector('.nav-toggle[aria-expanded="true"]');
    if (button) button.click();
  };
  if (desktop.addEventListener) desktop.addEventListener('change', closeWideMenu);
  else desktop.addListener(closeWideMenu);
  window.IW_I18N = { get language() { return current; }, setLanguage: setLanguage, t: translated };
})();
