document.addEventListener("DOMContentLoaded", function() {
  'use strict';

  var body = document.querySelector('body'),
    globalWrap = document.querySelector('.global-wrap'),
    header = document.getElementById('header'),
    hamburger = document.getElementById('hamburger'),
    mobileMenu = document.getElementById('mobile-menu'),
    search = document.querySelector(".search"),
    searchOpenButton = document.querySelector(".nav-search-button"),
    searchCloseIcon = document.querySelector(".search__button__close"),
    searchOverlay = document.querySelector(".search__overlay"),
    searchInput = document.querySelector(".search__text"),
    btnScrollToTop = document.querySelector(".top");


  /* =======================
  // Header Scroll Effect
  ======================= */
  function updateHeader() {
    if (window.scrollY > 60) {
      header.classList.add('header--scrolled');
    } else {
      header.classList.remove('header--scrolled');
    }
  }

  // Use passive listener for scroll performance
  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader(); // Check on load


  /* =======================
  // Mobile Menu
  ======================= */
  if (hamburger && mobileMenu) {
    hamburger.addEventListener("click", function() {
      var isOpen = hamburger.classList.toggle("is-open");
      mobileMenu.classList.toggle("is-open");
      hamburger.setAttribute('aria-expanded', isOpen);
      mobileMenu.setAttribute('aria-hidden', !isOpen);
      body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close mobile menu on link click
    var mobileLinks = mobileMenu.querySelectorAll('.mobile-menu__link, .mobile-menu__cta');
    mobileLinks.forEach(function(link) {
      link.addEventListener('click', function() {
        closeMobileMenu();
      });
    });

    // Close on backdrop click
    var backdrop = mobileMenu.querySelector('.mobile-menu__backdrop');
    if (backdrop) {
      backdrop.addEventListener('click', closeMobileMenu);
    }
  }

  function closeMobileMenu() {
    if (hamburger && mobileMenu) {
      hamburger.classList.remove("is-open");
      mobileMenu.classList.remove("is-open");
      hamburger.setAttribute('aria-expanded', 'false');
      mobileMenu.setAttribute('aria-hidden', 'true');
      body.style.overflow = '';
    }
  }


  /* =======================
  // Search (if button exists)
  ======================= */
  if (searchOpenButton) {
    searchOpenButton.addEventListener("click", function() {
      searchOpen();
    });
  }

  if (searchCloseIcon) {
    searchCloseIcon.addEventListener("click", function() {
      searchClose();
    });
  }

  if (searchOverlay) {
    searchOverlay.addEventListener("click", function() {
      searchClose();
    });
  }

  function searchOpen() {
    if (!search) return;
    search.classList.add("is-visible");
    body.classList.add("search-is-visible");
    globalWrap.classList.add("is-active");
    closeMobileMenu();
    setTimeout(function() {
      if (searchInput) searchInput.focus();
    }, 250);
  }

  function searchClose() {
    if (!search) return;
    search.classList.remove("is-visible");
    body.classList.remove("search-is-visible");
    globalWrap.classList.remove("is-active");
  }

  document.addEventListener('keydown', function(e) {
    if (e.key == 'Escape') {
      searchClose();
      closeMobileMenu();
    }
  });


  /* =============================================
  // Stop Animations During Window Resizing
  ============================================= */
  var disableTransition;

  window.addEventListener("resize", function() {
    document.body.classList.add("disable-animation");
    clearTimeout(disableTransition);
    disableTransition = setTimeout(function() {
      document.body.classList.remove("disable-animation");
    }, 100);

    // Close mobile menu on resize past breakpoint
    if (window.innerWidth > 1024) {
      closeMobileMenu();
    }
  });


  /* =======================
  // Simple Jekyll Search
  ======================= */
  if (typeof SimpleJekyllSearch !== 'undefined') {
    SimpleJekyllSearch({
      searchInput: document.getElementById("js-search-input"),
      resultsContainer: document.getElementById("js-results-container"),
      json: "/search.json",
      searchResultTemplate: '<a href="{url}" class="search-results__link"><time class="search-results-date" datetime="{date}">{date}</time><div class="search-results-title">{title}</div></a>',
      noResultsText: '<div class="no-results">No results found...</div>'
    });
  }


  /* =======================
  // Responsive Videos
  ======================= */
  if (typeof reframe !== 'undefined') {
    reframe(".post__content iframe:not(.reframe-off), .page__content iframe:not(.reframe-off), .project-content iframe:not(.reframe-off)");
  }


  /* =======================
  // LazyLoad Images
  ======================= */
  if (typeof LazyLoad !== 'undefined') {
    new LazyLoad({
      elements_selector: ".lazy"
    });
  }


  /* =======================
  // Zoom Image
  ======================= */
  var lightense = document.querySelector(".page__content img, .post__content img, .project-content img"),
    imageLink = document.querySelectorAll(".page__content a img, .post__content a img, .project-content a img");

  if (imageLink) {
    for (var i = 0; i < imageLink.length; i++) imageLink[i].parentNode.classList.add("image-link");
    for (var i = 0; i < imageLink.length; i++) imageLink[i].classList.add("no-lightense");
  }

  if (lightense && typeof Lightense !== 'undefined') {
    Lightense(".page__content img:not(.no-lightense), .post__content img:not(.no-lightense), .project-content img:not(.no-lightense)", {
      padding: 60,
      offset: 30
    });
  }


  /* =======================
  // Shuffle Letters
  ======================= */
  var shuffle = document.querySelectorAll(".shuffle");

  if (shuffle.length && typeof shuffleLetters !== 'undefined') {
    shuffle.forEach(function(element) {
      shuffleLetters(element, {
        iterations: 2,
        fps: 20
      });
    });
  }


  /* =====================
  // Load More Posts
  ===================== */
  var load_posts_button = document.querySelector('.load-more-posts');

  if (load_posts_button) {
    load_posts_button.addEventListener("click", function(e) {
      e.preventDefault();
      var o = document.querySelector(".pagination"),
        url = pagination_next_url.split("/page")[0] + "/page/" + pagination_next_page_number + "/";
      fetch(url).then(function(e) {
        if (e.ok) return e.text();
      }).then(function(e) {
        var n = document.createElement("div");
        n.innerHTML = e;
        var t = document.querySelector(".grid"),
          a = n.querySelectorAll(".grid__article");
        for (var i = 0; i < a.length; i++) t.appendChild(a.item(i));
        pagination_next_page_number++;
        if (pagination_next_page_number > pagination_available_pages_number) {
          o.style.display = "none";
        }
      });
    });
  }


  /* =======================
  // Scroll Top Button
  ======================= */
  if (btnScrollToTop) {
    btnScrollToTop.addEventListener("click", function() {
      if (window.scrollY != 0) {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: "smooth"
        });
      }
    });
  }


  /* =======================
  // Scroll Reveal
  ======================= */
  var revealElements = document.querySelectorAll('.reveal');

  if (revealElements.length && 'IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(function(el) {
      revealObserver.observe(el);
    });
  }

});
