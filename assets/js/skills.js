/* ==========================================================================
   P. Aman — Portfolio
   assets/js/skills.js
   --------------------------------------------------------------------------
   Skills page: expandable cards, category filters, live counts.
   Loaded after site.js.
   ========================================================================== */

(function (window, document) {
  'use strict';

  var reduced = document.documentElement.classList.contains('no-motion');
  var cards = Array.prototype.slice.call(document.querySelectorAll('#skillsGrid .skill'));
  var filters = Array.prototype.slice.call(document.querySelectorAll('.filter'));

  if (!cards.length) { return; }

  /* ---- Expand / collapse ---- */
  cards.forEach(function (card) {
    var btn = card.querySelector('.skill__toggle');
    if (!btn) { return; }
    btn.addEventListener('click', function () {
      var open = card.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  /* ---- Counts come from the DOM so they can never drift ---- */
  filters.forEach(function (btn) {
    var key = btn.getAttribute('data-filter');
    var count = btn.querySelector('.filter__count');
    if (!count) { return; }
    count.textContent = key === 'all'
      ? cards.length
      : cards.filter(function (c) { return c.getAttribute('data-category') === key; }).length;
  });

  /* ---- Filtering ---- */
  function applyFilter(key) {
    var shown = 0;

    cards.forEach(function (card) {
      var match = key === 'all' || card.getAttribute('data-category') === key;

      card.classList.remove('is-open', 'is-entering');
      var t = card.querySelector('.skill__toggle');
      if (t) { t.setAttribute('aria-expanded', 'false'); }

      card.classList.toggle('is-filtered-out', !match);
      if (!match) { return; }

      /* Skip the scroll-reveal for cards the visitor is already looking at. */
      if (window.__revealNow) { window.__revealNow(card); }

      if (!reduced) {
        card.style.setProperty('--i', shown);
        /* Restart the animation even if the class was already present. */
        void card.offsetWidth;
        card.classList.add('is-entering');
      }
      shown += 1;
    });
  }

  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filters.forEach(function (b) {
        var active = b === btn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
      applyFilter(btn.getAttribute('data-filter'));
    });
  });

  /* Clean up the entry animation so it doesn't fight :hover transforms. */
  document.addEventListener('animationend', function (event) {
    if (event.animationName === 'cardIn' && event.target.classList) {
      event.target.classList.remove('is-entering');
    }
  });
})(window, document);
