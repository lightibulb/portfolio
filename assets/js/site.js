/* ==========================================================================
   Aman Sohail — Portfolio
   assets/js/site.js
   --------------------------------------------------------------------------
   Shared behaviour for inner pages (about, skills, 404). No dependencies.

     - theme switcher in the nav
     - mobile menu
     - nav background + scroll progress (one rAF-throttled handler)
     - scroll reveals via IntersectionObserver (compositor-driven CSS
       transitions; no GSAP, no leftover inline transforms)
     - orb parallax (CSS variables, eased in a single rAF loop)
   ========================================================================== */

(function (window, document) {
  'use strict';

  var root = document.documentElement;
  var reduced = root.classList.contains('no-motion');

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  /* ---------------------------------------------------------------- Theme */

  function initThemeSwitcher() {
    var Theme = window.PortfolioTheme;
    var buttons = $$('.nav__theme-btn');
    if (!Theme || !buttons.length) { return; }

    function sync(active) {
      buttons.forEach(function (btn) {
        btn.setAttribute('aria-pressed',
          btn.getAttribute('data-theme-value') === active ? 'true' : 'false');
      });
    }

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var name = btn.getAttribute('data-theme-value');
        if (Theme.isSupported(name)) { Theme.set(name); }
      });
    });

    sync(Theme.current() || 'dark');

    document.addEventListener('themechange', function (event) {
      sync((event.detail && event.detail.theme) || 'dark');
    });
  }

  /* ---------------------------------------------------------- Mobile menu */

  function initMobileMenu() {
    var nav = $('#nav');
    var toggle = $('#navToggle');
    var links = $('#navLinks');
    if (!nav || !toggle || !links) { return; }

    function setOpen(open) {
      nav.classList.toggle('is-open', open);
      document.body.classList.toggle('menu-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }

    toggle.addEventListener('click', function () {
      setOpen(!nav.classList.contains('is-open'));
    });

    $$('a', links).forEach(function (a) {
      a.addEventListener('click', function () { setOpen(false); });
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) {
        setOpen(false);
        toggle.focus();
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 780) { setOpen(false); }
    });
  }

  /* ------------------------------------------------- Nav + progress bar */

  function initScrollState() {
    var nav = $('#nav');
    var bar = $('#progressBar');
    if (!nav) { return; }

    var ticking = false;
    var scrolled = false;

    function update() {
      ticking = false;
      var y = window.pageYOffset || root.scrollTop || 0;
      var max = Math.max(1, root.scrollHeight - window.innerHeight);

      var next = y > 12;
      if (next !== scrolled) {
        scrolled = next;
        nav.classList.toggle('is-scrolled', next);
      }
      if (bar) {
        bar.style.transform = 'scaleX(' + Math.min(1, y / max).toFixed(4) + ')';
      }
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    }, { passive: true });

    window.addEventListener('resize', update, { passive: true });
    update();
  }

  /* --------------------------------------------------------------- Reveal */

  function finishReveal(el, delay) {
    window.setTimeout(function () {
      el.classList.add('reveal-done');
      el.style.removeProperty('--reveal-delay');
    }, (delay + 0.95) * 1000);
  }

  function initReveal() {
    var items = $$('[data-reveal], [data-reveal-group] > *');
    if (!items.length) { return; }

    if (reduced || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-revealed', 'reveal-done'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      var n = 0;
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) { return; }
        var el = entry.target;
        io.unobserve(el);

        /* Stagger only items that arrive in the same frame. */
        var delay = Math.min(n * 0.07, 0.5);
        n += 1;

        el.style.setProperty('--reveal-delay', delay + 's');
        /* Force a style flush so the delay is in place before the class flips. */
        void el.offsetWidth;
        el.classList.add('is-revealed');
        finishReveal(el, delay);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.01 });

    items.forEach(function (el) { io.observe(el); });

    /* Exposed for filters: mark an element as already revealed. */
    window.__revealNow = function (el) {
      io.unobserve(el);
      el.classList.add('is-revealed', 'reveal-done');
    };
  }

  /* ------------------------------------------------------------- Parallax */

  function initParallax() {
    if (reduced) { return; }
    var orbs = $$('[data-orb]');
    if (!orbs.length) { return; }
    if (!window.matchMedia('(min-width: 780px)').matches ||
        window.matchMedia('(pointer: coarse)').matches) { return; }

    var depths = [22, 30, 14];
    var targetX = 0, targetY = 0, curX = 0, curY = 0;
    var running = false;

    function frame() {
      curX += (targetX - curX) * 0.06;
      curY += (targetY - curY) * 0.06;

      orbs.forEach(function (orb, i) {
        var d = depths[i] || 18;
        orb.style.setProperty('--px', (curX * d).toFixed(2) + 'px');
        orb.style.setProperty('--py', (curY * d).toFixed(2) + 'px');
      });

      if (Math.abs(targetX - curX) > 0.001 || Math.abs(targetY - curY) > 0.001) {
        window.requestAnimationFrame(frame);
      } else {
        running = false;
      }
    }

    window.addEventListener('pointermove', function (event) {
      targetX = (event.clientX / window.innerWidth - 0.5) * 2;
      targetY = (event.clientY / window.innerHeight - 0.5) * 2;
      if (!running) {
        running = true;
        window.requestAnimationFrame(frame);
      }
    }, { passive: true });
  }

  /* ----------------------------------------------------------------- Boot */

  function boot() {
    initThemeSwitcher();
    initMobileMenu();
    initScrollState();
    initReveal();
    initParallax();
    root.classList.add('site-ready');
  }

  /* Never leave content hidden if something above throws. */
  function safeBoot() {
    try { boot(); }
    catch (error) {
      root.classList.add('no-motion');
      if (window.console) { window.console.error(error); }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', safeBoot);
  } else {
    safeBoot();
  }
})(window, document);
