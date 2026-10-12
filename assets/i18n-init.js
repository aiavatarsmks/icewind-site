/* Language of this page comes from its URL: /ru/, /es/, /uk/ or English at the root.
   English pages send a visitor to their saved or browser language once, before paint.
   Translated pages are static HTML, so search engines index every language. */
(function () {
  var match = location.pathname.match(/^\/(ru|es|uk)(?=\/)/);
  var language = match ? match[1] : 'en';
  window.IW_LANGUAGE = language;
  if (language !== 'en') {
    /* Remember the language a visitor arrived in, unless they already chose one,
       so English-only URLs (such as a form's thank-you return) bring them back. */
    try { if (!localStorage.getItem('iw-language')) localStorage.setItem('iw-language', language); } catch (e) {}
    return;
  }

  var supported = { en: true, ru: true, es: true, uk: true };
  function code(value) {
    var base = String(value || '').toLowerCase().split('-')[0];
    return supported[base] ? base : null;
  }
  var saved = null;
  try { saved = code(localStorage.getItem('iw-language')); } catch (e) {}
  var preferred = saved;
  if (!preferred) {
    var languages = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language];
    for (var i = 0; i < languages.length && !preferred; i++) preferred = code(languages[i]);
  }
  /* Retired URLs redirect on their own; never translate them. */
  var untranslated = /^\/(?:project|book-online|websites-for-small-shops)\/?$|\.html$/;
  if (preferred && preferred !== 'en' && !untranslated.test(location.pathname) &&
      !/[?&]lang=en\b/.test(location.search)) {
    location.replace('/' + preferred + location.pathname + location.search + location.hash);
  }
})();
