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
