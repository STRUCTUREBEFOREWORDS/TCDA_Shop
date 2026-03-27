(function () {
  'use strict';

  // Block right-click on protected area
  document.addEventListener('contextmenu', function (e) {
    if (e.target.closest('[data-protect]')) e.preventDefault();
  }, false);

  // Block drag on protected area
  document.addEventListener('dragstart', function (e) {
    if (e.target.closest('[data-protect]')) e.preventDefault();
  }, false);

  // Block touch long-press save on iOS
  document.addEventListener('touchstart', function (e) {
    if (e.target.closest('[data-protect]')) {
      var el = e.target.closest('[data-protect]');
      el.style.webkitTouchCallout = 'none';
    }
  }, { passive: true });

  // Replace <img> with <canvas> inside protected areas
  function renderCanvas(img) {
    try {
      var w = img.naturalWidth || 600;
      var h = img.naturalHeight || 600;
      var sz = Math.min(w, h);
      var canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 600;
      canvas.setAttribute('aria-label', img.getAttribute('alt') || '');
      canvas.style.cssText = 'width:100%;height:100%;display:block;';
      var ctx = canvas.getContext('2d');
      var sx = (w - sz) / 2;
      var sy = (h - sz) / 2;
      ctx.drawImage(img, sx, sy, sz, sz, 0, 0, 600, 600);
      if (img.parentNode) img.parentNode.replaceChild(canvas, img);
    } catch (err) {}
  }

  function protectImages() {
    document.querySelectorAll('[data-protect] img').forEach(function (img) {
      img.style.pointerEvents = 'none';
      img.style.userSelect = 'none';
      img.setAttribute('draggable', 'false');
      if (img.complete && img.naturalWidth > 0) {
        renderCanvas(img);
      } else {
        img.addEventListener('load', function () { renderCanvas(img); }, { once: true });
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', protectImages);
  } else {
    protectImages();
  }

  // Block keyboard save shortcuts while over protected area
  document.addEventListener('keydown', function (e) {
    if (!document.querySelector('[data-protect]:hover')) return;
    var k = e.key.toLowerCase();
    if ((e.ctrlKey || e.metaKey) && (k === 's' || k === 'u' || k === 'p')) {
      e.preventDefault();
    }
  });
})();
