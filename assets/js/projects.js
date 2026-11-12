/* ==========================================================================
   Aman Sohail — Portfolio
   assets/js/projects.js
   --------------------------------------------------------------------------
   Adds two enhancements on top of site.js:
     1. Count-up metric numbers
     2. SVG line-draw trigger for the EcoFac chart

   Both are progressive — the numbers render statically and the line renders
   fully drawn when JS is off or reduced motion is requested. No dependencies.
   ========================================================================== */

(function (window, document) {
  'use strict';

  var root = document.documentElement;
  var reduced = root.classList.contains('no-motion') ||
                window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------- Countups */

  function formatNumber(value, decimals) {
    var factor = Math.pow(10, decimals);
    var rounded = Math.round(value * factor) / factor;
    var parts = rounded.toFixed(decimals).split('.');
    /* group thousands on the integer part only */
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  }

  function animateCountUp(el) {
    var target = parseFloat(el.getAttribute('data-countup'));
    var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    if (isNaN(target)) { return; }

    if (reduced) {
      el.textContent = formatNumber(target, decimals);
      return;
    }

    var duration = 1200;
    var start = null;

    function step(timestamp) {
      if (start === null) { start = timestamp; }
      var progress = Math.min(1, (timestamp - start) / duration);
      /* ease-out cubic */
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = target * eased;
      el.textContent = formatNumber(current, decimals);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        el.textContent = formatNumber(target, decimals);
      }
    }

    window.requestAnimationFrame(step);
  }

  function initCountups() {
    var els = Array.prototype.slice.call(
      document.querySelectorAll('[data-countup]')
    );
    if (!els.length) { return; }

    if (reduced || !('IntersectionObserver' in window)) {
      els.forEach(function (el) {
        var target = parseFloat(el.getAttribute('data-countup'));
        var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
        if (!isNaN(target)) { el.textContent = formatNumber(target, decimals); }
      });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) { return; }
        io.unobserve(entry.target);
        animateCountUp(entry.target);
      });
    }, { rootMargin: '0px 0px -15% 0px', threshold: 0.15 });

    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------------------------------------------------------------- Chart draw */

  function initChartDraw() {
    var charts = Array.prototype.slice.call(document.querySelectorAll('.eco__chart'));
    if (!charts.length) { return; }

    if (reduced || !('IntersectionObserver' in window)) {
      charts.forEach(function (chart) { chart.classList.add('is-revealed'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) { return; }
        io.unobserve(entry.target);
        /* brief delay so the section reveal lands before the draw starts */
        window.setTimeout(function () {
          entry.target.classList.add('is-revealed');
        }, 200);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

    charts.forEach(function (chart) { io.observe(chart); });
  }

  /* ---------------------------------------------------------------- Boot */

  function boot() {
    initCountups();
    initChartDraw();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})(window, document);
