
(function () {
  'use strict';

  // 1. Handle Loader (Vanilla JS - cannot get stuck)
  var loader = document.getElementById('loader');
  var pct = document.querySelector('.loader__pct span');
  var fill = document.querySelector('.loader__fill');
  
  document.body.classList.add('is-loading');
  
  if (loader) {
    var progress = 0;
    var interval = setInterval(function() {
      progress += Math.floor(Math.random() * 10) + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        setTimeout(function() {
          loader.style.opacity = '0';
          loader.style.visibility = 'hidden';
          document.body.classList.remove('is-loading');
          document.body.classList.remove('is-booting');
          
          // Trigger entrance animations
          var elements = document.querySelectorAll('.topbar, .intro [data-anim], .card, .footnote');
          elements.forEach(function(el, index) {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            setTimeout(function() {
              el.style.opacity = '1';
              el.style.transform = 'translateY(0)';
            }, index * 100);
          });
        }, 400);
      }
      
      if (pct) pct.textContent = progress < 10 ? '0' + progress : progress;
      if (fill) fill.style.transform = 'scaleX(' + (progress / 100) + ')';
    }, 50);
  }
})();
