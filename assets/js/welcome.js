
(function (window, document) {
  'use strict';
  var Theme = window.PortfolioTheme;
  if (!Theme) return;

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var gsapLib = window.gsap;
  var motionOK = !prefersReduced && !!gsapLib;
  var dom = {};

  function $(sel) { return document.querySelector(sel); }

  function cacheDom() {
    dom.loader = $('#loader');
    dom.loaderFill = $('.loader__fill');
    dom.loaderPct = $('.loader__pct span');
  }

  function runLoader() {
    return new Promise(function (resolve) {
      var loader = dom.loader;
      if (!loader) { resolve(); return; }
      
      var settled = false;
      function finish() {
        if (settled) return;
        settled = true;
        loader.classList.add('is-done');
        document.body.classList.remove('is-loading');
        window.setTimeout(function() {
          if (loader.parentNode) loader.parentNode.removeChild(loader);
        }, 700);
        resolve();
      }
      
      window.setTimeout(finish, 3000);
      
      if (!motionOK) {
        window.setTimeout(finish, 280);
        return;
      }
      
      var counter = { value: 0 };
      var timeline = gsapLib.timeline({ onComplete: finish });
      timeline
        .from('.loader__mark', { y: 14, opacity: 0, duration: 0.7 }, 0.05)
        .from('.loader__track', { opacity: 0, scaleX: 0.45, duration: 0.7 }, 0.12)
        .to(dom.loaderFill, { scaleX: 1, duration: 0.8 }, 0.15)
        .to(counter, { value: 100, duration: 0.8, onUpdate: function() {
          if (dom.loaderPct) dom.loaderPct.textContent = Math.round(counter.value);
        }}, 0.15)
        .to('.loader__inner', { opacity: 0, y: -10, duration: 0.36 }, '+=0.05')
        .to(loader, { opacity: 0, duration: 0.5 }, '-=0.2');
    });
  }

  function reveal() {
    if (!motionOK) {
      document.body.classList.remove('is-booting');
      return;
    }
    var timeline = gsapLib.timeline({
      onComplete: function() {
        document.body.classList.remove('is-booting');
      }
    });
    timeline
      .from('.topbar', { y: -14, opacity: 0, duration: 0.8 }, 0)
      .from('.intro [data-anim]', { y: 26, opacity: 0, duration: 0.9, stagger: 0.08 }, 0.1)
      .from('.card', { y: 36, opacity: 0, duration: 0.85, stagger: 0.08 }, 0.36)
      .from('.footnote', { opacity: 0, duration: 0.8 }, 0.78);
  }

  function init() {
    cacheDom();
    document.body.classList.add('is-loading');
    document.body.classList.add('is-booting');
    runLoader().then(reveal);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window, document);
