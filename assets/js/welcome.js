/* ==========================================================================
   Aman Sohail — Portfolio
   assets/js/welcome.js
   --------------------------------------------------------------------------
   Module 01 behaviour: loader sequence, entrance reveal, theme selection,
   confirmation dock, persistence hand-off and entry navigation.
   ========================================================================== */

(function (window, document) {
  'use strict';

  var Theme = window.PortfolioTheme;
  if (!Theme) {
    /* Theme system missing — do not trap the visitor behind the loader. */
    var stuck = document.getElementById('loader');
    if (stuck) { stuck.parentNode.removeChild(stuck); }
    return;
  }

  /* ---------------------------------------------------------------------- */
  /* Environment                                                            */
  /* ---------------------------------------------------------------------- */

  var reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  var prefersReduced = reduceQuery.matches;

  var gsapLib = window.gsap;
  var motionOK = !prefersReduced &&
                 !!gsapLib &&
                 typeof gsapLib.timeline === 'function';

  var ENTRY_URL = 'about.html';   /* first inner page; point at home.html once it exists */

  var dom = {};
  var state = {
    selected: null,
    dockVisible: false,
    entered: false
  };

  /* ---------------------------------------------------------------------- */
  /* Helpers                                                                */
  /* ---------------------------------------------------------------------- */

  function $(selector, context) {
    return (context || document).querySelector(selector);
  }

  function $$(selector, context) {
    return Array.prototype.slice.call(
      (context || document).querySelectorAll(selector)
    );
  }

  function pad(value) {
    return (value < 10 ? '0' : '') + value;
  }

  function cardFor(name) {
    for (var i = 0; i < dom.cards.length; i += 1) {
      if (dom.cards[i].getAttribute('data-theme-value') === name) {
        return dom.cards[i];
      }
    }
    return null;
  }

  /* ---------------------------------------------------------------------- */
  /* DOM cache                                                              */
  /* ---------------------------------------------------------------------- */

  function cacheDom() {
    dom.loader = $('#loader');
    dom.loaderFill = $('.loader__fill');
    dom.loaderPct = $('.loader__pct span');
    dom.page = $('#page');
    dom.cardsWrap = $('#cards');
    dom.cards = $$('.card');
    dom.status = $('#status');
    dom.dock = $('#dock');
    dom.dockTitle = $('#dockTitle');
    dom.dockSub = $('#dockSub');
    dom.enterBtn = $('#enterBtn');
    dom.changeBtn = $('#changeBtn');
    dom.flash = $('#flash');
    dom.orbs = $$('.bg__orb');
  }

  /* ---------------------------------------------------------------------- */
  /* 1. Loader                                                              */
  /* ---------------------------------------------------------------------- */

  function runLoader() {
    return new Promise(function (resolve) {
      var loader = dom.loader;

      if (!loader) { resolve(); return; }

      var settled = false;

      function finish() {
        if (settled) { return; }
        settled = true;

        loader.classList.add('is-done');
        loader.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('is-loading');

        /* Remove from the layout once the fade has completed. */
        window.setTimeout(function () {
          if (loader.parentNode) {
            loader.parentNode.removeChild(loader);
          }
        }, 700);

        resolve();
      }

      /* Failsafe: never hold the visitor hostage. */
      window.setTimeout(finish, 3000);

      /* The full loader plays once per browser session. */
      var seen = false;
      try {
        seen = window.sessionStorage.getItem('amanSohail:loaded') === '1';
        window.sessionStorage.setItem('amanSohail:loaded', '1');
      } catch (error) { /* storage unavailable */ }

      if (!motionOK || seen) {
        if (dom.loaderPct) { dom.loaderPct.textContent = '100'; }
        window.setTimeout(finish, seen ? 140 : 280);
        return;
      }

      var counter = { value: 0 };

      var timeline = gsapLib.timeline({ onComplete: finish });

      timeline
        .from('.loader__mark', {
          y: 14, opacity: 0, duration: 0.7, ease: 'power3.out'
        }, 0.05)
        .from('.loader__track', {
          opacity: 0, scaleX: 0.45, duration: 0.7, ease: 'power3.out'
        }, 0.12)
        .to(dom.loaderFill, {
          scaleX: 1, duration: 0.8, ease: 'power2.inOut'
        }, 0.15)
        .to(counter, {
          value: 100,
          duration: 0.8,
          ease: 'power2.inOut',
          onUpdate: function () {
            if (dom.loaderPct) {
              dom.loaderPct.textContent = pad(Math.round(counter.value));
            }
          }
        }, 0.15)
        .to('.loader__inner', {
          opacity: 0, y: -10, duration: 0.36, ease: 'power2.in'
        }, '+=0.05')
        .to(loader, {
          opacity: 0, duration: 0.5, ease: 'power2.inOut'
        }, '-=0.2');
    });
  }

  /* ---------------------------------------------------------------------- */
  /* 2. Entrance reveal                                                     */
  /* ---------------------------------------------------------------------- */

  function reveal() {
    return new Promise(function (resolve) {
      if (!motionOK) {
        document.body.classList.remove('is-booting');
        resolve();
        return;
      }
      runReveal(resolve);
    });
  }

  function runReveal(done) {
    var timeline = gsapLib.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: function () {
        document.body.classList.remove('is-booting');
        gsapLib.set('.topbar, .intro [data-anim], .card, .footnote', {
          clearProps: 'opacity,transform,willChange'
        });
        done();
      }
    });

    timeline
      .from('.topbar', { y: -14, opacity: 0, duration: 0.8 }, 0)
      .from('.intro [data-anim]', {
        y: 26, opacity: 0, duration: 0.9, stagger: 0.08
      }, 0.1)
      .from('.card', {
        y: 36, opacity: 0, duration: 0.85, stagger: 0.08
      }, 0.36)
      .from('.footnote', { opacity: 0, duration: 0.8 }, 0.78);
  }

  /* ---------------------------------------------------------------------- */
  /* 3. Theme selection                                                     */
  /* ---------------------------------------------------------------------- */

  function selectTheme(name, options) {
    options = options || {};

    var meta = Theme.info(name);
    if (!meta) { return; }

    if (state.selected === name && !options.force) {
      showDock(name, options);
      return;
    }

    state.selected = name;

    dom.cards.forEach(function (card) {
      var active = card.getAttribute('data-theme-value') === name;
      card.classList.toggle('is-selected', active);
      card.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    if (dom.cardsWrap) {
      dom.cardsWrap.classList.add('has-selection');
    }

    /* Applies the theme, persists it and dispatches 'themechange'. */
    Theme.set(name);

    updateStatus(name, options.returning);

    if (!options.silent) {
      bloom(name);
    }

    showDock(name, { animate: !options.silent, returning: options.returning });
  }

  function bloom(name) {
    if (!motionOK) { return; }

    var card = cardFor(name);
    if (!card) { return; }

    if (dom.flash) {
      var rect = card.getBoundingClientRect();
      var fx = ((rect.left + rect.width / 2) / window.innerWidth) * 100;
      var fy = ((rect.top + rect.height / 2) / window.innerHeight) * 100;

      dom.flash.style.setProperty('--fx', fx.toFixed(2) + '%');
      dom.flash.style.setProperty('--fy', fy.toFixed(2) + '%');

      gsapLib.fromTo(dom.flash, { opacity: 0 }, {
        opacity: 0.26,
        duration: 0.32,
        ease: 'power2.out',
        onComplete: function () {
          gsapLib.to(dom.flash, {
            opacity: 0, duration: 0.9, ease: 'power2.in'
          });
        }
      });
    }

    /* CSS `scale` composes with the card's own transform, so there is no
       snap when the animation ends. */
    card.classList.remove('is-blooming');
    void card.offsetWidth;
    card.classList.add('is-blooming');
    window.setTimeout(function () { card.classList.remove('is-blooming'); }, 700);
  }

  function updateStatus(name, returning) {
    if (!dom.status) { return; }

    if (!name) {
      dom.status.textContent = '';
      dom.status.classList.remove('is-visible');
      return;
    }

    var label = Theme.label(name);

    dom.status.textContent = returning
      ? label + ' experience restored from your last visit'
      : 'Selected: ' + label;

    dom.status.classList.add('is-visible');
  }

  /* ---------------------------------------------------------------------- */
  /* 4. Confirmation dock                                                   */
  /* ---------------------------------------------------------------------- */

  function showDock(name, options) {
    options = options || {};
    if (!dom.dock) { return; }

    var meta = Theme.info(name);

    dom.dock.hidden = false;
    document.body.classList.add('dock-open');
    state.dockVisible = true;

    if (dom.dockTitle) {
      dom.dockTitle.textContent = meta.label + ' experience selected';
    }
    if (dom.dockSub) {
      dom.dockSub.textContent = options.returning
        ? 'Restored from your last visit · change it anytime'
        : 'Saved to this device · change it anytime';
    }

    if (options.animate && motionOK) {
      gsapLib.fromTo(dom.dock, { y: 34, opacity: 0 }, {
        y: 0,
        opacity: 1,
        duration: 0.85,
        ease: 'power3.out',
        onComplete: function () {
          gsapLib.set(dom.dock, { clearProps: 'transform,opacity' });
        }
      });
    }
  }

  function hideDock(onDone) {
    if (!dom.dock || dom.dock.hidden) {
      if (typeof onDone === 'function') { onDone(); }
      return;
    }

    state.dockVisible = false;
    document.body.classList.remove('dock-open');

    function complete() {
      dom.dock.hidden = true;
      if (typeof onDone === 'function') { onDone(); }
    }

    if (!motionOK) {
      complete();
      return;
    }

    gsapLib.to(dom.dock, {
      y: 26,
      opacity: 0,
      duration: 0.4,
      ease: 'power2.in',
      onComplete: function () {
        gsapLib.set(dom.dock, { clearProps: 'transform,opacity' });
        complete();
      }
    });
  }

  /* ---------------------------------------------------------------------- */
  /* 5. Actions                                                             */
  /* ---------------------------------------------------------------------- */

  function onChangeTheme() {
    hideDock(function () {
      if (dom.cardsWrap) {
        dom.cardsWrap.classList.remove('has-selection');
      }

      updateStatus(null);

      if (motionOK && dom.cardsWrap) {
        dom.cards.forEach(function (card, i) { card.style.setProperty('--i', i); });
        dom.cardsWrap.classList.remove('is-nudging');
        void dom.cardsWrap.offsetWidth;
        dom.cardsWrap.classList.add('is-nudging');
        window.setTimeout(function () {
          dom.cardsWrap.classList.remove('is-nudging');
        }, 1000);
      }

      var focused = null;
      for (var i = 0; i < dom.cards.length; i += 1) {
        if (dom.cards[i].classList.contains('is-selected')) {
          focused = dom.cards[i];
          break;
        }
      }
      if (!focused) { focused = dom.cards[0]; }
      if (focused && typeof focused.focus === 'function') {
        focused.focus({ preventScroll: true });
      }
    });
  }

  function onEnter() {
    if (state.entered) { return; }
    state.entered = true;

    if (!motionOK) {
      window.location.href = ENTRY_URL;
      return;
    }

    var timeline = gsapLib.timeline({
      onComplete: function () {
        window.location.href = ENTRY_URL;
      }
    });

    timeline
      .to(['.page', '.dock', '.footnote'], {
        opacity: 0, y: -16, duration: 0.55, ease: 'power2.inOut'
      }, 0)
      .to('.bg', {
        opacity: 0, duration: 0.7, ease: 'power2.inOut'
      }, 0.08);
  }

  /* ---------------------------------------------------------------------- */
  /* 6. Pointer parallax                                                    */
  /* ---------------------------------------------------------------------- */

  function initParallax() {
    if (!motionOK || !dom.orbs.length) { return; }
    if (window.matchMedia('(pointer: coarse)').matches) { return; }

    var setters = dom.orbs.map(function (orb, index) {
      return {
        x: gsapLib.quickTo(orb, 'x', { duration: 1.4, ease: 'power3.out' }),
        y: gsapLib.quickTo(orb, 'y', { duration: 1.4, ease: 'power3.out' }),
        depth: 16 + index * 12
      };
    });

    var frame = null;
    var pointerX = 0;
    var pointerY = 0;

    window.addEventListener('pointermove', function (event) {
      pointerX = (event.clientX / window.innerWidth - 0.5) * 2;
      pointerY = (event.clientY / window.innerHeight - 0.5) * 2;

      if (frame) { return; }

      frame = window.requestAnimationFrame(function () {
        frame = null;
        for (var i = 0; i < setters.length; i += 1) {
          setters[i].x(pointerX * setters[i].depth);
          setters[i].y(pointerY * setters[i].depth);
        }
      });
    }, { passive: true });
  }

  /* ---------------------------------------------------------------------- */
  /* 7. Events                                                              */
  /* ---------------------------------------------------------------------- */

  function bindEvents() {
    dom.cards.forEach(function (card) {
      card.addEventListener('click', function () {
        selectTheme(card.getAttribute('data-theme-value'), {});
      });
    });

    if (dom.changeBtn) {
      dom.changeBtn.addEventListener('click', onChangeTheme);
    }

    if (dom.enterBtn) {
      dom.enterBtn.addEventListener('click', onEnter);
    }
  }

  /* ---------------------------------------------------------------------- */
  /* 8. Boot                                                                */
  /* ---------------------------------------------------------------------- */

  function init() {
    cacheDom();

    document.body.classList.add('is-loading');
    document.body.classList.add('is-booting');

    bindEvents();
    initParallax();

    var saved = Theme.get();
    var isReturning = !!saved;

    runLoader().then(reveal).then(function () {
      if (isReturning) {
        /* Restore the previous choice without re-prompting the visitor. */
        selectTheme(saved, {
          silent: true,
          force: true,
          returning: true
        });
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window, document);
