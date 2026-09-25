/* Clutch badge behaviour.

   The third-party widget has occasionally rendered a white canvas while keeping
   its dark-background text white, so theme.css hides it in both themes and the
   local .clutch-fallback link is what people actually see. This file only marks
   the badge once the iframe has loaded, which the stylesheet uses.

   It used to also relocate .clutch-badge into the footer at runtime, because on
   a few pages the badge was authored in the body. That move left the Google
   badge behind in the body while Clutch jumped to the footer, so the two trust
   signals ended up in different places. Both are now authored together inside
   the footer in .trust-badges, and the move is gone. */
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
