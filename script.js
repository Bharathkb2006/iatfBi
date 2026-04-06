(function () {
  'use strict';

  var menuToggle = document.getElementById('menuToggle');
  var sideMenu = document.getElementById('sideMenu');
  var menuOverlay = document.getElementById('menuOverlay');
  var menuLinks = document.querySelectorAll('.menu-link');

  function openMenu() {
    sideMenu.classList.add('is-open');
    sideMenu.setAttribute('aria-hidden', 'false');
    if (menuToggle) menuToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    sideMenu.classList.remove('is-open');
    sideMenu.setAttribute('aria-hidden', 'true');
    if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  function toggleMenu() {
    if (sideMenu.classList.contains('is-open')) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', toggleMenu);
  }

  if (menuOverlay) {
    menuOverlay.addEventListener('click', closeMenu);
  }

  menuLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      closeMenu();
    });
  });

  // Close on Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && sideMenu.classList.contains('is-open')) {
      closeMenu();
    }
  });

  // Video fallback: if no video or error, show gradient background
  var bgVideo = document.getElementById('bgVideo');
  if (bgVideo) {
    bgVideo.addEventListener('error', function () {
      var backdrop = bgVideo.closest('.video-backdrop');
      if (backdrop) {
        backdrop.classList.add('video-fallback');
      }
    });
  }
})();

