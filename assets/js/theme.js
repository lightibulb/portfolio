/* ==========================================================================
   Aman Sohail — Portfolio
   assets/js/theme.js
   --------------------------------------------------------------------------
   Shared theme system. Loaded in <head> on every page so the persisted
   theme is applied to <html data-theme="..."> before first paint.

   Also performs the two tiny <html> class updates every page needs before
   first paint, so pages don't need an inline script:
     - no-js  → js          (CSS can hide [data-reveal] only when JS runs)
     - adds    no-motion    when the visitor prefers reduced motion

   Public API (window.PortfolioTheme):
     .KEY                 storage key used for persistence
     .ATTRIBUTE           attribute applied to <html>
     .list                ['dark', 'rich', 'cyberpunk']
     .isSupported(name)   boolean
     .info(name)          { label, color, description } | null
     .label(name)         string
     .get()               persisted theme or null
     .set(name)           persist + apply, returns applied theme
     .apply(name)         apply only (no persistence)
     .clear()             remove preference and reset
     .current()           theme currently applied to <html>
   ========================================================================== */

(function (window, document) {
  'use strict';

  /* Pre-paint <html> flags. */
  (function () {
    var root = document.documentElement;
    root.className = root.className.replace(/\bno-js\b/, 'js');
    if (!/\bjs\b/.test(root.className)) { root.className += ' js'; }
    try {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        root.className += ' no-motion';
      }
    } catch (error) { /* matchMedia unavailable */ }
  })();

  var STORAGE_KEY = 'amanSohail:theme';
  var ATTRIBUTE = 'data-theme';

  var THEMES = {
    dark: {
      label: 'Dark',
      color: '#0a0a0c',
      description: 'Minimal, focused and professional.'
    },
    rich: {
      label: 'Rich',
      color: '#12072b',
      description: 'Royal purple and polished gold. Regal and authoritative.'
    },
    cyberpunk: {
      label: 'Cyberpunk',
      color: '#07040f',
      description: 'Neon-noir. Acid yellow, hot magenta and electric cyan.'
    }
  };

  var ORDER = ['dark', 'rich', 'cyberpunk'];

  /* ---------------------------------------------------------------------- */

  function isSupported(value) {
    return typeof value === 'string' &&
           Object.prototype.hasOwnProperty.call(THEMES, value);
  }

  function readPreference() {
    try {
      var stored = window.localStorage.getItem(STORAGE_KEY);
      return isSupported(stored) ? stored : null;
    } catch (error) {
      return null; /* private mode / storage disabled */
    }
  }

  function writePreference(value) {
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
      return true;
    } catch (error) {
      return false;
    }
  }

  function removePreference() {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      /* ignore */
    }
  }

  function updateMetaColor(theme) {
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta && theme) {
      meta.setAttribute('content', THEMES[theme].color);
    }
  }

  function emit(theme) {
    var event;
    try {
      event = new CustomEvent('themechange', {
        detail: {
          theme: theme,
          label: theme ? THEMES[theme].label : null
        }
      });
    } catch (error) {
      /* CustomEvent constructor unavailable — degrade silently */
      return;
    }
    document.dispatchEvent(event);
  }

  /* ---------------------------------------------------------------------- */

  function apply(value) {
    var theme = isSupported(value) ? value : null;
    var root = document.documentElement;

    if (theme) {
      root.setAttribute(ATTRIBUTE, theme);
      root.classList.add('has-theme');
    } else {
      root.removeAttribute(ATTRIBUTE);
      root.classList.remove('has-theme');
    }

    updateMetaColor(theme);
    emit(theme);

    return theme;
  }

  function set(value) {
    var theme = apply(value);
    if (theme) {
      writePreference(theme);
    } else {
      removePreference();
    }
    return theme;
  }

  function current() {
    var applied = document.documentElement.getAttribute(ATTRIBUTE);
    return isSupported(applied) ? applied : null;
  }

  /* ---------------------------------------------------------------------- */

  /* Apply the stored preference immediately — before the first paint. */
  var initial = readPreference();
  if (initial) {
    apply(initial);
  }

  window.PortfolioTheme = {
    KEY: STORAGE_KEY,
    ATTRIBUTE: ATTRIBUTE,
    list: ORDER.slice(),
    isSupported: isSupported,
    info: function (name) {
      return isSupported(name) ? THEMES[name] : null;
    },
    label: function (name) {
      return isSupported(name) ? THEMES[name].label : '';
    },
    get: readPreference,
    set: set,
    apply: apply,
    clear: function () {
      removePreference();
      return apply(null);
    },
    current: current
  };
})(window, document);
