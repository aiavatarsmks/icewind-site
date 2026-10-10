/* Select the visitor's preferred language before the page is painted. */
(function () {
  var supported = { en: true, ru: true, es: true, uk: true };
  function code(value) {
    var base = String(value || '').toLowerCase().split('-')[0];
    return supported[base] ? base : null;
  }
  var saved = null;
  try { saved = code(localStorage.getItem('iw-language')); } catch (e) {}
  var languages = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language];
  var automatic = null;
  for (var i = 0; i < languages.length; i++) {
    automatic = code(languages[i]);
    if (automatic) break;
  }
  var selected = saved || automatic || 'en';
  window.IW_LANGUAGE = selected;
  document.documentElement.lang = selected;
  if (selected !== 'en') {
    document.documentElement.classList.add('i18n-pending');
    var style = document.createElement('style');
    style.textContent = 'html.i18n-pending body{visibility:hidden}';
    document.head.appendChild(style);
    setTimeout(function () { document.documentElement.classList.remove('i18n-pending'); }, 4000);
  }
})();
