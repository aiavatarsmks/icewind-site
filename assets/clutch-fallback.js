(() => {
  document.querySelectorAll('.clutch-badge').forEach((badge) => {
    const widget = badge.querySelector('.clutch-widget');
    if (!widget) return;

    const watchFrame = () => {
      const frame = widget.querySelector('iframe');
      if (!frame || frame.dataset.clutchFallbackWatched) return;
      frame.dataset.clutchFallbackWatched = 'true';
      frame.addEventListener('load', () => badge.classList.add('clutch-ready'), { once: true });
    };

    new MutationObserver(watchFrame).observe(widget, { childList: true });
    watchFrame();
  });
})();
