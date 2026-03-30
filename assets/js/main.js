/* ============================================================
   assets/js/main.js — Grenston George Personal Blog
   ============================================================ */

// ── Bottom tab bar — highlight active tab ────────────────────
(function () {
  const path = window.location.pathname;
  document.querySelectorAll('.bottom-tab').forEach(tab => {
    const page = tab.dataset.page;
    const isActive =
      (page === 'home'   && (path === '/' || path === '/index.html')) ||
      (page === 'diary'  && path.startsWith('/diary')) ||
      (page === 'shorts' && path.startsWith('/shorts')) ||
      (page === 'photos' && path.startsWith('/photos'));
    if (isActive) tab.classList.add('active');
  });
}());

// ── Navbar scroll effect ──────────────────────────────────────
const navbar = document.getElementById('navbar');
if (navbar) {
  const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 40);
  onScroll(); // run once on load (for inner pages)
  window.addEventListener('scroll', onScroll, { passive: true });
}

// ── Bio popup (logo click) ───────────────────────────────────
(function () {
  const bioTrigger = document.getElementById('bioTrigger');
  const bioPopup   = document.getElementById('bioPopup');
  if (!bioTrigger || !bioPopup) return;

  function positionPopup() {
    const rect = bioTrigger.getBoundingClientRect();
    bioPopup.style.top  = (rect.bottom + 8) + 'px';
    bioPopup.style.left = rect.left + 'px';
  }

  function openBio() {
    positionPopup();
    bioPopup.hidden = false;
    bioTrigger.setAttribute('aria-expanded', 'true');
  }
  function closeBio() {
    bioPopup.hidden = true;
    bioTrigger.setAttribute('aria-expanded', 'false');
  }

  bioTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    bioPopup.hidden ? openBio() : closeBio();
  });
  document.addEventListener('click', (e) => {
    if (!bioPopup.contains(e.target) && e.target !== bioTrigger) closeBio();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeBio();
  });
}());

// ── Say Hello dropdown ───────────────────────────────────────
(function () {
  const trigger = document.getElementById('helloTrigger');
  const menu    = document.getElementById('helloMenu');
  if (!trigger || !menu) return;

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = menu.hidden === false;
    menu.hidden = isOpen;
    trigger.setAttribute('aria-expanded', String(!isOpen));
  });

  document.addEventListener('click', () => {
    menu.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      menu.hidden = true;
      trigger.setAttribute('aria-expanded', 'false');
    }
  });
}());

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

/* ── HORIZONTAL SCROLL TRACKS (entries + shorts on homepage) ─ */
(function () {
  function initTrack(trackId) {
    const track = document.getElementById(trackId);
    if (!track) return;
    const outer   = track.closest('.h-scroll-outer');
    const prevBtn = outer && outer.querySelector('.h-scroll-prev');
    const nextBtn = outer && outer.querySelector('.h-scroll-next');

    function scrollAmount() {
      const item = track.querySelector('.h-scroll-item');
      return item ? item.offsetWidth + 20 : 280;
    }

    function syncBtns() {
      if (prevBtn) prevBtn.disabled = track.scrollLeft <= 1;
      if (nextBtn) nextBtn.disabled = track.scrollLeft + track.offsetWidth >= track.scrollWidth - 2;
    }

    if (prevBtn) prevBtn.addEventListener('click', () => track.scrollBy({ left: -scrollAmount(), behavior: 'smooth' }));
    if (nextBtn) nextBtn.addEventListener('click', () => track.scrollBy({ left:  scrollAmount(), behavior: 'smooth' }));
    track.addEventListener('scroll', syncBtns, { passive: true });
    syncBtns();
  }

  initTrack('entriesTrack');
  initTrack('shortsTrack');
}());

/* ── PHOTOS: tabs + filter + lightbox ────────────────────── */
(function () {
  const diaryGrid    = document.getElementById('diaryGrid');
  const landscapeGrid = document.getElementById('landscapeGrid');
  const portraitGrid  = document.getElementById('portraitGrid');
  if (!diaryGrid && !landscapeGrid && !portraitGrid) return;

  // ─ Tab switching ─────────────────────────────────────────
  document.querySelectorAll('.photos-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.photos-tab').forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      document.querySelectorAll('.photos-panel').forEach(p => {
        p.classList.remove('active');
        p.hidden = true;
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      const panel = document.getElementById('tab-' + tab.dataset.tab);
      if (panel) { panel.classList.add('active'); panel.hidden = false; }
    });
  });

  // ─ Per-grid filter buttons (diary tab only) ───────────────
  document.querySelectorAll('.photo-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      const grid     = document.getElementById(targetId);
      if (!grid) return;
      grid.closest('.photos-panel').querySelectorAll('.photo-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      Array.from(grid.querySelectorAll('.photo-item')).forEach(item => {
        const tags    = item.dataset.tag ? item.dataset.tag.split(',').map(t => t.trim()) : [];
        const isKnown = tags.includes('Travel') || tags.includes('Fitness');
        const show    = f === 'all' || tags.includes(f) || (f === 'other' && !isKnown);
        item.classList.toggle('hidden', !show);
      });
    });
  });

  // ─ Lightbox ───────────────────────────────────────────────
  const lightbox  = document.getElementById('lightbox');
  const backdrop  = document.getElementById('lightboxBackdrop');
  const lbImg     = document.getElementById('lightboxImg');
  const lbCaption = document.getElementById('lightboxCaption');
  const closeBtn  = document.getElementById('lightboxClose');
  const prevBtn   = document.getElementById('lightboxPrev');
  const nextBtn   = document.getElementById('lightboxNext');
  if (!lightbox) return;

  let pool = [];
  let currentIdx = 0;

  function openLightbox(items, idx) {
    pool       = items;
    currentIdx = idx;
    showSlide(currentIdx);
    lightbox.classList.add('active');
    backdrop.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    backdrop.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    lbImg.src = '';
  }

  function showSlide(idx) {
    const item = pool[idx];
    if (!item) return;
    lbImg.src  = item.dataset.src || '';
    lbImg.alt  = item.dataset.title || '';
    const loc  = item.dataset.location ? ' · ' + item.dataset.location : '';
    const date = item.dataset.date || '';
    lbCaption.textContent = (item.dataset.title || '') + (date ? ' · ' + date : '') + loc;
    prevBtn.style.visibility = idx > 0               ? 'visible' : 'hidden';
    nextBtn.style.visibility = idx < pool.length - 1 ? 'visible' : 'hidden';
  }

  // Delegate clicks to all three grids
  [diaryGrid, landscapeGrid, portraitGrid].forEach(grid => {
    if (!grid) return;
    grid.addEventListener('click', e => {
      const btn  = e.target.closest('.photo-thumb-link');
      if (!btn) return;
      const item    = btn.closest('.photo-item');
      const visible = Array.from(grid.querySelectorAll('.photo-item')).filter(i => !i.classList.contains('hidden'));
      const idx     = visible.indexOf(item);
      if (idx !== -1) openLightbox(visible, idx);
    });
  });

  closeBtn.addEventListener('click', closeLightbox);
  backdrop.addEventListener('click', closeLightbox);
  prevBtn.addEventListener('click',  () => { currentIdx = Math.max(0, currentIdx - 1); showSlide(currentIdx); });
  nextBtn.addEventListener('click',  () => { currentIdx = Math.min(pool.length - 1, currentIdx + 1); showSlide(currentIdx); });

  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  { currentIdx = Math.max(0, currentIdx - 1); showSlide(currentIdx); }
    if (e.key === 'ArrowRight') { currentIdx = Math.min(pool.length - 1, currentIdx + 1); showSlide(currentIdx); }
  });
}());

/* ── REELS: filter + play ─────────────────────────────────────
   Runs only on the /shorts/ page                              */
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
        const isKnown = tags.includes('Travel') || tags.includes('Fitness') || tags.includes('Editing');
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

// ── Avatar lightbox (homepage about section) ─────────────────
(function () {
  const avatar   = document.getElementById('aboutAvatar');
  const title    = document.getElementById('aboutTitle');
  const backdrop = document.getElementById('avatarBackdrop');
  const lb       = document.getElementById('avatarLightbox');
  const lbImg    = document.getElementById('avatarLightboxImg');
  const closeBtn = document.getElementById('avatarClose');
  if (!avatar || !lb) return;

  function openAvatarLb() {
    lbImg.src = avatar.dataset.fullsrc;
    backdrop.classList.add('active');
    lb.classList.add('active');
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function closeAvatarLb() {
    backdrop.classList.remove('active');
    lb.classList.remove('active');
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  avatar.addEventListener('click', openAvatarLb);
  if (title) { title.addEventListener('click', openAvatarLb); title.style.cursor = 'pointer'; }
  closeBtn.addEventListener('click', closeAvatarLb);
  backdrop.addEventListener('click', closeAvatarLb);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeAvatarLb();
  });
}());

// ── Avatar lightbox (about page) ─────────────────────────────
(function () {
  const avatar   = document.getElementById('aboutAvatar');
  const title    = document.getElementById('aboutTitle');
  const backdrop = document.getElementById('avatarBackdrop');
  const lb       = document.getElementById('avatarLightbox');
  const lbImg    = document.getElementById('avatarLightboxImg');
  const closeBtn = document.getElementById('avatarClose');
  if (!avatar || !lb) return;

  function openAvatarLb() {
    lbImg.src = avatar.dataset.fullsrc;
    backdrop.classList.add('active');
    lb.classList.add('active');
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function closeAvatarLb() {
    backdrop.classList.remove('active');
    lb.classList.remove('active');
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  avatar.addEventListener('click', openAvatarLb);
  if (title) title.addEventListener('click', openAvatarLb);
  if (title) title.style.cursor = 'pointer';
  closeBtn.addEventListener('click', closeAvatarLb);
  backdrop.addEventListener('click', closeAvatarLb);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeAvatarLb();
  });
}());
