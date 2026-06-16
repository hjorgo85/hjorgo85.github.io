(function () {
  'use strict';

  /* =========================================================
     MOBILE NAV OVERLAY
     ========================================================= */
  var toggle  = document.querySelector('.nav-toggle');
  var overlay = document.getElementById('mobile-nav');
  var closeBtn = overlay && overlay.querySelector('.mobile-nav-close');
  var mobileLinks = overlay && overlay.querySelectorAll('a, button');

  function openNav() {
    if (!overlay) return;
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    mobileLinks && mobileLinks.forEach(function (el) { el.removeAttribute('tabindex'); });
    closeBtn && closeBtn.focus();
  }
  function closeNav() {
    if (!overlay) return;
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    toggle && toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    mobileLinks && mobileLinks.forEach(function (el) { el.setAttribute('tabindex', '-1'); });
    toggle && toggle.focus();
  }
  if (toggle)   toggle.addEventListener('click', function () { overlay.classList.contains('open') ? closeNav() : openNav(); });
  if (closeBtn) closeBtn.addEventListener('click', closeNav);
  if (overlay) {
    overlay.addEventListener('click', function (e) { if (e.target === overlay) closeNav(); });
    overlay.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeNav(); });
  }

  /* =========================================================
     HEADER SCROLL SHADOW
     ========================================================= */
  var header = document.getElementById('site-header');
  if (header) {
    window.addEventListener('scroll', function () {
      header.classList.toggle('scrolled', window.scrollY > 10);
    }, { passive: true });
  }

  /* =========================================================
     SCROLL REVEAL
     ========================================================= */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -36px 0px' });
    revealEls.forEach(function (el, i) {
      el.style.transitionDelay = (i % 4) * 0.07 + 's';
      obs.observe(el);
    });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  /* =========================================================
     HUB PAGE FILTER TABS
     ========================================================= */
  var filterBar = document.getElementById('hub-filters');
  var hubGroups = document.querySelectorAll('.hub-group');
  if (filterBar && hubGroups.length > 1) {
    filterBar.style.display = 'flex';
    var allBtn = document.createElement('button');
    allBtn.className = 'hub-filter-btn active';
    allBtn.textContent = 'All Articles';
    allBtn.setAttribute('data-group', 'all');
    allBtn.setAttribute('role', 'tab');
    allBtn.setAttribute('aria-selected', 'true');
    filterBar.appendChild(allBtn);
    hubGroups.forEach(function (group, i) {
      var btn = document.createElement('button');
      btn.className = 'hub-filter-btn';
      btn.textContent = group.getAttribute('data-group-title') || 'Group ' + (i + 1);
      btn.setAttribute('data-group', String(i));
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', 'false');
      filterBar.appendChild(btn);
    });
    filterBar.addEventListener('click', function (e) {
      var btn = e.target.closest('.hub-filter-btn');
      if (!btn) return;
      filterBar.querySelectorAll('.hub-filter-btn').forEach(function (b) {
        b.classList.remove('active'); b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active'); btn.setAttribute('aria-selected', 'true');
      var target = btn.getAttribute('data-group');
      hubGroups.forEach(function (g, i) {
        g.classList.toggle('hidden', target !== 'all' && target !== String(i));
      });
    });
  }

  /* =========================================================
     FUN FACTS CAROUSEL
     ========================================================= */
  var slides   = Array.from(document.querySelectorAll('.fact-slide'));
  var dotsWrap = document.getElementById('factDots');
  var prevBtn  = document.getElementById('factPrev');
  var nextBtn  = document.getElementById('factNext');

  if (slides.length && dotsWrap) {
    var current = 0;
    var autoTimer;

    /* Build dots */
    slides.forEach(function (_, i) {
      var d = document.createElement('button');
      d.className = 'fact-dot' + (i === 0 ? ' active' : '');
      d.setAttribute('aria-label', 'Fact ' + (i + 1));
      d.addEventListener('click', function () { goTo(i); resetAuto(); });
      dotsWrap.appendChild(d);
    });
    var dots = Array.from(dotsWrap.querySelectorAll('.fact-dot'));

    function goTo(n) {
      slides[current].classList.remove('active');
      dots[current].classList.remove('active');
      current = (n + slides.length) % slides.length;
      slides[current].classList.add('active');
      dots[current].classList.add('active');
    }
    function resetAuto() {
      clearInterval(autoTimer);
      autoTimer = setInterval(function () { goTo(current + 1); }, 5000);
    }

    if (prevBtn) prevBtn.addEventListener('click', function () { goTo(current - 1); resetAuto(); });
    if (nextBtn) nextBtn.addEventListener('click', function () { goTo(current + 1); resetAuto(); });

    resetAuto();

    /* Pause on hover */
    var factsInner = document.querySelector('.facts-inner');
    if (factsInner) {
      factsInner.addEventListener('mouseenter', function () { clearInterval(autoTimer); });
      factsInner.addEventListener('mouseleave', resetAuto);
    }
  }

  /* =========================================================
     FISH TANK — INTERACTIVE FISH & TURTLE
     ========================================================= */
  function spawnRipple(x, y) {
    var el = document.createElement('div');
    el.className = 'ripple';
    el.style.left = x + 'px';
    el.style.top  = y + 'px';
    document.body.appendChild(el);
    el.addEventListener('animationend', function () { el.remove(); });
  }

  function spawnSpeech(x, y, species, fact) {
    /* Remove any existing bubbles first */
    document.querySelectorAll('.fish-speech').forEach(function (b) { b.remove(); });
    var el = document.createElement('div');
    el.className = 'fish-speech';
    el.innerHTML = '<strong>' + species + '</strong>' + fact;
    el.style.left = x + 'px';
    el.style.top  = y + 'px';
    document.body.appendChild(el);
    el.addEventListener('animationend', function () { el.remove(); });
  }

  /* Fish click handler */
  document.querySelectorAll('.tank-fish').forEach(function (fish) {
    fish.addEventListener('click', function (e) {
      /* Jump */
      fish.classList.remove('jump');
      void fish.offsetWidth; /* force reflow */
      fish.classList.add('jump');
      fish.addEventListener('animationend', function handler() {
        fish.classList.remove('jump');
        fish.removeEventListener('animationend', handler);
      });
      /* Ripple + speech */
      spawnRipple(e.clientX, e.clientY);
      spawnSpeech(e.clientX, e.clientY, fish.dataset.species || 'Fish', fish.dataset.fact || '');
    });
  });

  /* Turtle click handler */
  var turtle = document.querySelector('.tank-turtle');
  if (turtle) {
    turtle.addEventListener('click', function (e) {
      turtle.classList.remove('spin');
      void turtle.offsetWidth;
      turtle.classList.add('spin');
      turtle.addEventListener('animationend', function handler() {
        turtle.classList.remove('spin');
        turtle.removeEventListener('animationend', handler);
      });
      spawnRipple(e.clientX, e.clientY);
      spawnSpeech(e.clientX, e.clientY, turtle.dataset.species || 'Sea Turtle', turtle.dataset.fact || '');
    });
  }

})();
