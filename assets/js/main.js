(function () {
  'use strict';

  /* =========================================================
     MOBILE NAV OVERLAY
     ========================================================= */
  var toggle = document.querySelector('.nav-toggle');
  var overlay = document.getElementById('mobile-nav');
  var closeBtn = overlay && overlay.querySelector('.mobile-nav-close');
  var mobileLinks = overlay && overlay.querySelectorAll('.mobile-nav-links a, .mobile-nav-header a, .mobile-nav-close');

  function openNav() {
    if (!overlay) return;
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    mobileLinks && mobileLinks.forEach(function(el) { el.removeAttribute('tabindex'); });
    closeBtn && closeBtn.focus();
  }

  function closeNav() {
    if (!overlay) return;
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    toggle && toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    mobileLinks && mobileLinks.forEach(function(el) { el.setAttribute('tabindex', '-1'); });
    toggle && toggle.focus();
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      var isOpen = overlay.classList.contains('open');
      isOpen ? closeNav() : openNav();
    });
  }
  if (closeBtn) closeBtn.addEventListener('click', closeNav);

  if (overlay) {
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay || e.target === overlay.querySelector('.mobile-nav-overlay::before')) {
        closeNav();
      }
    });
    overlay.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNav();
    });
  }

  /* =========================================================
     HEADER SCROLL SHADOW
     ========================================================= */
  var header = document.getElementById('site-header');
  if (header) {
    var lastScroll = 0;
    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      if (y > 10) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
      lastScroll = y;
    }, { passive: true });
  }

  /* =========================================================
     SCROLL REVEAL
     ========================================================= */
  var revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length && 'IntersectionObserver' in window) {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(function (el, i) {
      el.style.transitionDelay = (i % 4) * 0.07 + 's';
      revealObs.observe(el);
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
      var title = group.getAttribute('data-group-title') || ('Group ' + (i + 1));
      var btn = document.createElement('button');
      btn.className = 'hub-filter-btn';
      btn.textContent = title;
      btn.setAttribute('data-group', String(i));
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', 'false');
      filterBar.appendChild(btn);
    });

    filterBar.addEventListener('click', function (e) {
      var btn = e.target.closest('.hub-filter-btn');
      if (!btn) return;

      filterBar.querySelectorAll('.hub-filter-btn').forEach(function (b) {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      var target = btn.getAttribute('data-group');
      hubGroups.forEach(function (group, i) {
        if (target === 'all' || target === String(i)) {
          group.classList.remove('hidden');
        } else {
          group.classList.add('hidden');
        }
      });
    });
  }

})();
