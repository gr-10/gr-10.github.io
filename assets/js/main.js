/* ============================================================
   assets/js/main.js — Grenston George Personal Blog
   ============================================================ */

// ── Navbar scroll effect ──────────────────────────────────────
const navbar = document.getElementById('navbar');
if (navbar) {
  const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 40);
  onScroll(); // run once on load (for inner pages)
  window.addEventListener('scroll', onScroll, { passive: true });
}

// ── Mobile nav toggle ─────────────────────────────────────────
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  document.addEventListener('click', e => {
    if (!navbar.contains(e.target)) {
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
}

// ── Scroll-triggered fade-up animations ──────────────────────
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.fade-up').forEach((el, i) => {
  el.style.transitionDelay = `${i * 0.06}s`;
  observer.observe(el);
});

// ── Active nav link on scroll (homepage) ─────────────────────
const sections  = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a[href*="#"]');

if (sections.length && navAnchors.length) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navAnchors.forEach(a => a.classList.remove('active'));
        const id = entry.target.id;
        const active = document.querySelector(`.nav-links a[href$="#${id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { threshold: 0.4 });
  sections.forEach(s => sectionObserver.observe(s));
}

// ── Photo gallery ─────────────────────────────────────────────
(function () {
  const track = document.getElementById('galleryTrack');
  if (!track) return;

  const slides  = Array.from(track.querySelectorAll('.post-gallery-slide'));
  const dots    = Array.from(document.querySelectorAll('[data-gallery-index]'));
  const prevBtn = document.querySelector('[data-gallery-prev]');
  const nextBtn = document.querySelector('[data-gallery-next]');
  let current   = 0;

  function getSlideWidth() {
    const s     = slides[0];
    const style = window.getComputedStyle(s);
    return s.offsetWidth + parseFloat(style.marginRight || 0);
  }

  function goTo(index) {
    const count = slides.length;
    current     = ((index % count) + count) % count;
    track.scrollTo({ left: current * getSlideWidth(), behavior: 'smooth' });
    syncDots();
  }

  function syncDots() {
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));

  dots.forEach(dot => {
    dot.addEventListener('click', () => goTo(parseInt(dot.dataset.galleryIndex, 10)));
  });

  // Sync dots when user swipes manually
  let scrollTimer;
  track.addEventListener('scroll', () => {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      const sw  = getSlideWidth();
      const idx = Math.round(track.scrollLeft / sw);
      if (idx !== current) { current = idx; syncDots(); }
    }, 80);
  }, { passive: true });
}());

/* ── REELS: filter + play ─────────────────────────────────────
   Runs only on the /videos/ page                              */
(function () {
  const filterBtns = document.querySelectorAll('.reel-filter-btn');
  const reelCards  = document.querySelectorAll('.reel-card');

  if (!filterBtns.length) return; // not on videos page

  // Filter
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      reelCards.forEach(card => {
        const tags = card.dataset.tag.split(',').map(t => t.trim());
        const isKnown = tags.includes('Travel') || tags.includes('Fitness');
        const show =
          filter === 'all' ||
          tags.includes(filter) ||
          (filter === 'other' && !isKnown);
        card.classList.toggle('hidden', !show);
      });
    });
  });

  // Play — swap thumbnail for iframe, pause others
  reelCards.forEach(card => {
    const playBtn    = card.querySelector('.reel-play-btn');
    const thumbWrap  = card.querySelector('.reel-thumbnail');
    const iframeWrap = card.querySelector('.reel-iframe-wrap');
    const iframe     = card.querySelector('.reel-iframe');
    if (!playBtn) return;

    playBtn.addEventListener('click', () => {
      // Stop all other videos
      document.querySelectorAll('.reel-iframe-wrap').forEach(w => {
        if (w === iframeWrap) return;
        w.style.display = 'none';
        const f = w.querySelector('.reel-iframe');
        if (f) f.src = '';
        const t = w.closest('.reel-player-wrap').querySelector('.reel-thumbnail');
        if (t) t.style.display = 'block';
      });
      // Show this video
      iframe.src = iframe.dataset.src;
      iframeWrap.style.display = 'block';
      thumbWrap.style.display  = 'none';
    });
  });
}());
