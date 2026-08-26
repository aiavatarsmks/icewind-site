(function () {
  "use strict";

  var theme = "dark";

  try {
    if (window.localStorage.getItem("icewind-theme") === "light") {
      theme = "light";
    }
  } catch (error) {
    /* Storage may be unavailable in private browsing. Dark remains the default. */
  }

  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;

  var colour = theme === "light" ? "#edf3f7" : "#050b16";
  var meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", colour);
})();
