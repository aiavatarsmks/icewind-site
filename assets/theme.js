(function () {
  "use strict";

  var STORAGE_KEY = "icewind-theme";

  function getTheme() {
    return document.documentElement.dataset.theme === "light" ? "light" : "dark";
  }

  function updateMeta(theme) {
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "light" ? "#edf3f7" : "#050b16");
  }

  function updateButtons(theme) {
    document.querySelectorAll(".theme-toggle").forEach(function (button) {
      var isLight = theme === "light";
      button.dataset.currentTheme = theme;
      button.setAttribute("aria-pressed", String(isLight));
      button.setAttribute("aria-label", isLight ? "Switch to dark theme" : "Switch to light theme");
      button.setAttribute("title", isLight ? "Switch to dark theme" : "Switch to light theme");
    });
  }

  function applyTheme(theme, persist) {
    var next = theme === "light" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    document.documentElement.style.colorScheme = next;
    updateMeta(next);
    updateButtons(next);

    if (persist) {
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch (error) {
        /* The theme still works for the current page when storage is unavailable. */
      }
    }
  }

  function makeToggle(compact) {
    var button = document.createElement("button");
    button.type = "button";
    button.className = "theme-toggle" + (compact ? " theme-toggle--compact" : "");
    button.innerHTML =
      '<span class="theme-toggle__icon theme-toggle__sun" aria-hidden="true">&#9728;&#xfe0e;</span>' +
      '<span class="theme-toggle__icon theme-toggle__moon" aria-hidden="true">&#9790;</span>';
    button.addEventListener("click", function () {
      applyTheme(getTheme() === "light" ? "dark" : "light", true);
    });
    return button;
  }

  function addHeaderToggle() {
    var header = document.querySelector("header");
    var nav = header && header.querySelector(".nav");

    if (!header || !nav) {
      var floating = makeToggle(true);
      floating.classList.add("theme-toggle--floating");
      document.body.appendChild(floating);
      return;
    }

    var standardNavigation = nav.querySelector("nav.links") || nav.querySelector(".nav-toggle");

    if (standardNavigation) {
      var headerToggle = makeToggle(false);
      headerToggle.classList.add("theme-toggle--header");
      var primaryCta = nav.querySelector(":scope > .btn");
      if (primaryCta) nav.insertBefore(headerToggle, primaryCta);
      else nav.appendChild(headerToggle);

      var mobileMenu = document.querySelector(".mobile-menu");
      if (mobileMenu) {
        var row = document.createElement("div");
        row.className = "mm-theme";
        row.innerHTML = '<span class="mm-label">Appearance</span>';
        row.appendChild(makeToggle(false));
        mobileMenu.insertBefore(row, mobileMenu.firstChild);
      }
      return;
    }

    var compactToggle = makeToggle(true);
    compactToggle.classList.add("theme-toggle--simple");
    var back = nav.querySelector(".back");
    if (back) nav.insertBefore(compactToggle, back);
    else nav.appendChild(compactToggle);
  }

  function random(seed) {
    var value = Math.sin(seed) * 10000;
    return value - Math.floor(value);
  }

  function addStableSnow() {
    document.querySelectorAll("#wind").forEach(function (canvas, canvasIndex) {
      var host = canvas.parentElement;
      if (!host || host.querySelector(":scope > .theme-snow")) return;

      var layer = document.createElement("div");
      layer.className = "theme-snow";
      layer.setAttribute("aria-hidden", "true");

      for (var index = 0; index < 34; index += 1) {
        var seed = 271828 + canvasIndex * 1000 + index * 19;
        var flake = document.createElement("span");
        flake.textContent = "❄\ufe0e";
        flake.style.left = (2 + random(seed) * 96).toFixed(2) + "%";
        flake.style.fontSize = (7 + random(seed + 1) * 5).toFixed(1) + "px";
        flake.style.opacity = (0.12 + random(seed + 2) * 0.16).toFixed(2);
        flake.style.animationDuration = (18 + random(seed + 3) * 14).toFixed(1) + "s";
        flake.style.animationDelay = (-random(seed + 4) * 32).toFixed(1) + "s";
        flake.style.setProperty("--snow-drift", (-18 + random(seed + 5) * 36).toFixed(1) + "px");
        layer.appendChild(flake);
      }

      host.insertBefore(layer, canvas.nextSibling);
    });
  }

  function initialise() {
    addHeaderToggle();
    addStableSnow();
    updateButtons(getTheme());

    window.addEventListener("storage", function (event) {
      if (event.key === STORAGE_KEY) applyTheme(event.newValue === "light" ? "light" : "dark", false);
    });
  }

  if (document.readyState !== "complete") {
    document.addEventListener("DOMContentLoaded", initialise, { once: true });
  } else {
    initialise();
  }
})();
