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

// ── Blog filter (listing page) ───────────────────────────────
const filterBtns = document.querySelectorAll('.filter-btn');
const blogPosts  = document.querySelectorAll('#blogGrid .blog-post');

if (filterBtns.length) {
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      blogPosts.forEach(post => {
        const show = filter === 'all' || post.dataset.category === filter;
        post.style.display = show ? '' : 'none';
      });
    });
  });
}

// ── Contact form feedback ─────────────────────────────────────
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', e => {
    // Let Formspree handle real submissions; show feedback for demo
    const action = contactForm.getAttribute('action') || '';
    if (action.includes('YOUR_FORM_ID')) {
      e.preventDefault();
      const btn = contactForm.querySelector('button[type="submit"]');
      const original = btn.textContent;
      btn.textContent = '✅ Message sent! (Configure Formspree to enable real email)';
      btn.disabled = true;
      btn.style.background = '#00b894';
      setTimeout(() => {
        btn.textContent = original;
        btn.disabled = false;
        btn.style.background = '';
        contactForm.reset();
      }, 5000);
    }
  });
}
