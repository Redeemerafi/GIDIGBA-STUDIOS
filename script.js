/* ============================================================
   GIDIGBA STUDIOS — SCRIPT
   Multi-page site: shared chrome + booking flows
   ============================================================ */

// ---- Config ----
// NOTE: key already public in the original repo — restrict it to your domain
// in the imgbb dashboard, or move uploads server-side.
const IMGBB_KEY = 'dbc0dad2f83bf9f24d8abad5e0afd3d1';
const WA_NUMBER = '233534317611';

/* ============================================================
   GROWTH CONFIG
   ------------------------------------------------------------
   PAY_URL: paste a Paystack / Flutterwave / hosted-MoMo payment
   link to switch ON the "Pay online" button at checkout.
   Leave '' to keep the WhatsApp + MoMo-details flow.
   SEASONAL: e.g. { tag: 'GRADUATION SEASON', line: 'Book your graduation look before the season ends.' }
   Leave null for the default hero copy.
   ============================================================ */
const PAY_URL = '';
const SEASONAL = null;
const REFERRAL_REWARD = 'GH₵10';

function esc(v) {
  return String(v ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

/* ============================================================
   SHARED CHROME (injected on every page)
   ============================================================ */
const NAV_LINKS = [
  { href: 'index.html', label: 'Home', key: 'home' },
  { href: 'about.html', label: 'About', key: 'about' },
  { href: 'services.html', label: 'Services', key: 'services' },
  { href: 'work.html', label: 'Work', key: 'work' },
  { href: 'brands.html', label: 'Brands', key: 'brands' },
  { href: 'reviews.html', label: 'Reviews', key: 'reviews' },
];

const CHROME_TOP = `
<header class="nav" id="nav">
  <div class="container nav-inner">
    <a href="index.html" class="logo">
      <img class="logo-mark" src="images/logo-mark.png" alt="" />
      <span class="logo-text">
        GIDIGBA STUDIOS
        <small>Developed specially for businesses.</small>
      </span>
    </a>
    <nav class="nav-links-wrap">
      <ul class="nav-links">
        ${NAV_LINKS.map(l => `<li><a href="${l.href}" class="nav-link" data-nav="${l.key}">${l.label}</a></li>`).join('')}
      </ul>
    </nav>
    <div class="nav-cta">
      <a href="#" class="btn btn-ghost btn-sm hide-mobile" onclick="openBookingChoice('photo'); return false;">Book Photography</a>
      <a href="#" class="btn btn-primary btn-sm hide-mobile" onclick="openBookingChoice('business'); return false;">Start a Project</a>
      <a href="#" class="btn btn-primary btn-sm only-mobile" onclick="openBookingChoice(); return false;">Book</a>
      <button class="burger" id="burger" aria-label="Open menu" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
    </div>
  </div>
</header>

<div class="mobile-menu" id="mobileMenu">
  <ul>
    <li><a href="index.html">Home</a></li>
    <li><a href="about.html">About</a></li>
    <li><a href="services.html">Services</a></li>
    <li><a href="photoshoots.html">Photoshoots</a></li>
    <li><a href="work.html">Work</a></li>
    <li><a href="brands.html">Brands</a></li>
    <li><a href="reviews.html">Reviews</a></li>
    <li><a href="#" onclick="closeMenu(); openBookingChoice('photo'); return false;">Book Photography</a></li>
    <li><a href="#" onclick="closeMenu(); openBookingChoice('business'); return false;">Start a Project</a></li>
  </ul>
  <div class="mm-foot">Developed specially for businesses. · Accra, Ghana · 100% online photoshoots</div>
</div>`;

const CHROME_BOTTOM = `
<div class="toast" id="toast"></div>

<a href="https://wa.me/${WA_NUMBER}" class="float-wa" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">
  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
</a>

<!-- Booking choice -->
<div class="modal-overlay" id="bookingChoiceModal">
  <div class="modal modal-choice">
    <button class="modal-close" onclick="closeModal('bookingChoiceModal')">&times;</button>
    <h3>What are you booking?</h3>
    <p class="modal-sub">Choose the option that fits — we'll take it from there.</p>
    <div class="choice-cards">
      <div class="choice-card" onclick="closeModal('bookingChoiceModal'); openModal('projectModal');">
        <div class="choice-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
        </div>
        <h4>A Business Project</h4>
        <p>Branding, design, marketing, websites, video, campaigns and commercial visuals.</p>
        <span class="choice-cta">Start With This Service →</span>
      </div>
      <div class="choice-card" onclick="closeModal('bookingChoiceModal'); openPhotoBooking();">
        <div class="choice-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
        </div>
        <h4>A Personal Photography Session</h4>
        <p>Birthdays, graduations, portraits, headshots and personal-brand photoshoots — 100% online, delivered via WhatsApp.</p>
        <span class="choice-cta">Book Your Session →</span>
      </div>
    </div>
  </div>
</div>

<!-- Business project -->
<div class="modal-overlay" id="projectModal">
  <div class="modal modal-form">
    <button class="modal-close" onclick="closeModal('projectModal')">&times;</button>
    <span class="modal-label">Business Project Brief</span>
    <h3>Start a Business Project</h3>
    <p class="modal-sub">Tell us about your project. We'll review and reply on WhatsApp within 24 hours.</p>
    <form id="projectForm" class="form">
      <div class="form-row">
        <div class="form-group"><label>Full name *</label><input type="text" name="name" required /></div>
        <div class="form-group"><label>Company / Brand</label><input type="text" name="company" /></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Email *</label><input type="email" name="email" required /></div>
        <div class="form-group"><label>Phone / WhatsApp *</label><input type="tel" name="phone" required /></div>
      </div>
      <div class="form-group">
        <label>What service are you interested in?</label>
        <select name="service">
          <option>Brand Identity</option><option>Graphic Design</option><option>Social Media Management</option>
          <option>Digital Marketing</option><option>Commercial Photography</option><option>Video Production</option>
          <option>Content Creation</option><option>Website Design</option><option>Campaign Production</option>
          <option>Not sure yet — help me decide</option>
        </select>
      </div>
      <div class="form-group">
        <label>Project brief *</label>
        <textarea name="brief" rows="4" placeholder="Tell us about your business, goals, timeline and budget range." required></textarea>
      </div>
      <button type="submit" class="btn btn-primary btn-full">
        Send Project Brief
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
      </button>
    </form>
  </div>
</div>

<!-- Online photoshoot booking -->
<div class="modal-overlay" id="photoModal">
  <div class="modal modal-photo">
    <button class="modal-close" onclick="closeModal('photoModal')">&times;</button>
    <div class="booking-head">
      <span class="modal-label">Online Photoshoot Booking · 100% remote</span>
      <p class="booking-head-note">No in-person session. Photos uploaded here are delivered to our team securely and deleted 20 minutes after your order is delivered.</p>
    </div>
    <div class="booking-steps" id="bookingSteps">
      <div class="step active" data-step="1"><span>1</span><em>Pick</em></div>
      <div class="step" data-step="2"><span>2</span><em>Details</em></div>
      <div class="step" data-step="3"><span>3</span><em>Review</em></div>
    </div>
    <div class="photo-booking-container" id="photoBookingContainer"></div>
    <div class="booking-nav" id="bookingNav">
      <button class="btn btn-ghost" id="prevStepBtn" onclick="photoPrevStep()">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Back
      </button>
      <button class="btn btn-primary" id="nextStepBtn" onclick="photoNextStep()">
        Continue
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </button>
    </div>
  </div>
</div>

<!-- Footer -->
<footer class="footer">
  <div class="container">
    <div class="footer-top">
      <div class="footer-brand">
        <a href="index.html" class="logo">
          <img class="logo-mark" src="images/logo-mark.png" alt="" />
          <span class="logo-text">
            GIDIGBA STUDIOS
            <small>Developed specially for businesses.</small>
          </span>
        </a>
        <p>Creative production, digital growth and 100% online photoshoots. Based in Accra, Ghana. Working worldwide.</p>
      </div>
      <div class="footer-cols">
        <div class="footer-col">
          <h5>Studio</h5>
          <ul>
            <li><a href="about.html">About</a></li>
            <li><a href="services.html">Services</a></li>
            <li><a href="photoshoots.html">Photoshoots</a></li>
            <li><a href="work.html">Work</a></li>
            <li><a href="journal.html">Journal</a></li>
            <li><a href="track.html">Track Order</a></li>
            <li><a href="brands.html">Brands</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h5>Book</h5>
          <ul>
            <li><a href="#" onclick="openBookingChoice('business'); return false;">Start a Project</a></li>
            <li><a href="#" onclick="openBookingChoice('photo'); return false;">Book Photography</a></li>
            <li><a href="reviews.html">Reviews</a></li>
            <li><a href="reviews.html#faq">FAQ</a></li>
            <li><a href="voucher.html">Gift Voucher</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h5>Contact</h5>
          <ul>
            <li><a href="https://wa.me/${WA_NUMBER}" target="_blank" rel="noopener">WhatsApp: +233 53 431 7611</a></li>
            <li><span style="font-size:.9rem;color:var(--grey);font-weight:300;">Accra, Ghana · Online worldwide</span></li>
            <li><span style="font-size:.9rem;color:var(--grey);font-weight:300;">100% online photoshoots</span></li>
          </ul>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <span class="brandline">Developed <b>specially</b> for businesses.</span>
      <span>© <span id="year"></span> GIDIGBA STUDIOS. All rights reserved.</span>
    </div>
  </div>
</footer>

<div class="sticky-bar" id="stickyBar">
  <div class="sticky-info"><strong>From GH₵15</strong><span>1 image · all-in</span></div>
  <button class="btn btn-primary btn-sm" onclick="openBookingChoice('photo')">Book Session</button>
  <a href="https://wa.me/${WA_NUMBER}" class="sticky-wa" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
  </a>
</div>

<div class="install-bar" id="installBar">
  <span id="installText">📸 Install GIDIGBA for instant access</span>
  <button id="installBtn">Install</button>
</div>`;

const chromeTop = document.getElementById('chrome-top');
if (chromeTop) chromeTop.innerHTML = CHROME_TOP;
const chromeBottom = document.getElementById('chrome-bottom');
if (chromeBottom) chromeBottom.innerHTML = CHROME_BOTTOM;

// ---- Year ----
const yearEl = document.getElementById('year');

/* ============================================================
   GROWTH FEATURES — init (runs after chrome injection)
   ============================================================ */
function initGrowth() {
  // Seasonal hero override (home page only)
  try {
    if (SEASONAL) {
      const eb = document.querySelector('.hero .eyebrow');
      if (eb && SEASONAL.tag) eb.textContent = SEASONAL.tag;
      const sub = document.querySelector('.hero-sub');
      if (sub && SEASONAL.line) sub.textContent = SEASONAL.line;
    }
  } catch (e) {}

  // Referral capture — ?ref=CODE sticks to this device
  try {
    const ref = new URLSearchParams(location.search).get('ref');
    if (ref && /^[A-Za-z0-9-]{3,16}$/.test(ref)) localStorage.setItem('gidigba_referral', ref.toUpperCase());
  } catch (e) {}

  // Resume-booking banner when an unfinished draft exists
  try {
    const raw = localStorage.getItem('gidigba_photo_draft');
    if (raw && !document.getElementById('resumeBanner')) {
      const dr = JSON.parse(raw);
      if (dr && dr.step > 1) {
        const b = document.createElement('div');
        b.className = 'resume-banner';
        b.id = 'resumeBanner';
        b.innerHTML = `<span><strong>Unfinished booking</strong> — you stopped at step ${dr.step} of 3.</span>
          <button class="rb-resume" onclick="openPhotoBooking()">Resume booking</button>
          <button class="rb-x" onclick="document.getElementById('resumeBanner').remove()" aria-label="Dismiss">✕</button>`;
        document.body.appendChild(b);
      }
    }
  } catch (e) {}

  // iOS: no install prompt — teach Share → Add to Home Screen
  try {
    const isIOS = /iP(hone|ad|od)/.test(navigator.userAgent) && !(window.MSStream instanceof ActiveXObject);
    const standalone = window.navigator.standalone === true ||
      window.matchMedia('(display-mode: standalone)').matches;
    if (isIOS && !standalone) {
      const bar = document.getElementById('installBar');
      const txt = document.getElementById('installText');
      const btn = document.getElementById('installBtn');
      if (bar && txt && !bar.classList.contains('show')) {
        txt.textContent = '📲 Tap Share → “Add to Home Screen” to install';
        if (btn) btn.style.display = 'none';
        setTimeout(() => bar.classList.add('show'), 5000);
      }
    }
  } catch (e) {}
}
initGrowth();
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ---- Toast ----
let toastTimer;
function toast(msg, ok = true) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.toggle('error', !ok);
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}

// ---- Active nav by page ----
const currentPage = document.body.dataset.page || '';
document.querySelectorAll(`.nav-link[data-nav="${currentPage}"]`).forEach(l => l.classList.add('active'));

// ---- Header scroll state ----
const navEl = document.getElementById('nav');
const onScrollState = () => navEl && navEl.classList.toggle('scrolled', window.scrollY > 24);
window.addEventListener('scroll', onScrollState, { passive: true });
onScrollState();

// ---- Fullscreen mobile menu ----
const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobileMenu');
function toggleMenu(force) {
  if (!mobileMenu) return;
  const open = typeof force === 'boolean' ? force : !mobileMenu.classList.contains('open');
  mobileMenu.classList.toggle('open', open);
  burger.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', String(open));
  document.body.style.overflow = open ? 'hidden' : '';
}
function closeMenu() { toggleMenu(false); }
window.closeMenu = closeMenu;
if (burger) burger.addEventListener('click', () => toggleMenu());
if (mobileMenu) mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => toggleMenu(false)));
document.addEventListener('keydown', e => { if (e.key === 'Escape') toggleMenu(false); });

// ---- Reveal on scroll ----
function observeReveals(root = document) {
  const els = root.querySelectorAll('.reveal:not(.in)');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          const delay = Math.min(i * 60, 240);
          setTimeout(() => entry.target.classList.add('in'), delay);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    els.forEach(el => io.observe(el));
  } else {
    els.forEach(el => el.classList.add('in'));
  }
}
observeReveals();

// ---- Hero glow parallax (home only) ----
const heroGlow = document.getElementById('heroGlow');
if (heroGlow && window.matchMedia('(pointer:fine)').matches) {
  window.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 40;
    const y = (e.clientY / window.innerHeight - 0.5) * 40;
    heroGlow.style.transform = `translate(${x}px, ${y}px)`;
  }, { passive: true });
}

/* ============================================================
   SERVICES
   ============================================================ */
const services = [
  {
    num: '01', title: 'Brand Identity',
    desc: 'We help businesses establish a recognizable visual identity.',
    tags: ['Logo Design', 'Brand Guidelines', 'Visual Systems', 'Stationery', 'Brand Assets'],
    cta: 'Start With This Service', action: () => openBookingChoice('business')
  },
  {
    num: '02', title: 'Graphic Design',
    desc: 'Marketing graphics, social designs and promotional materials.',
    tags: ['Social Graphics', 'Flyers & Posters', 'Packaging', 'Digital Ads', 'Campaign Designs'],
    cta: 'Start With This Service', action: () => openBookingChoice('business')
  },
  {
    num: '03', title: 'Social Media Management',
    desc: 'We plan, create and manage your social presence so it stays consistent.',
    tags: ['Content Planning', 'Content Calendar', 'Posting & Scheduling', 'Community', 'Reporting'],
    cta: 'Start With This Service', action: () => openBookingChoice('business')
  },
  {
    num: '04', title: 'Digital Marketing',
    desc: 'Strategy, campaigns and honest digital advice for businesses that want growth.',
    tags: ['Paid Ads', 'SEO', 'Email', 'Content Marketing', 'Growth Consulting'],
    cta: 'Start With This Service', action: () => openBookingChoice('business')
  },
  {
    num: '05', title: 'Commercial Photography',
    desc: 'Product, brand and business visuals — produced fully online with software-assisted recreation. No studio hire required.',
    tags: ['Product Visuals', 'Brand Imagery', 'E-commerce Images', 'Creative Scenes', '100% Online'],
    cta: 'Start With This Service', action: () => openBookingChoice('business')
  },
  {
    num: '06', title: 'Video Production',
    desc: 'Visual content businesses can use to promote what they sell.',
    tags: ['Brand Videos', 'Product Videos', 'Advertisements', 'Social Video', 'Explainers'],
    cta: 'Start With This Service', action: () => openBookingChoice('business')
  },
  {
    num: '07', title: 'Content Creation',
    desc: 'Photos, reels, copy and creative content built for the feeds and funnels that grow your brand.',
    tags: ['Photos', 'Reels', 'Copywriting', 'Campaign Assets', 'Content Systems'],
    cta: 'Start With This Service', action: () => openBookingChoice('business')
  },
  {
    num: '08', title: 'Website Design',
    desc: 'Modern, fast, conversion-focused websites and landing pages — designed, built and launched.',
    tags: ['Landing Pages', 'Business Sites', 'E-commerce', 'UI Design', 'Launch'],
    cta: 'Start With This Service', action: () => openBookingChoice('business')
  },
  {
    num: '09', title: 'Campaign Production',
    desc: 'End-to-end campaign creative — from concept and art direction to launch assets.',
    tags: ['Concept', 'Art Direction', 'Launch Assets', 'Rollouts', 'Multi-channel'],
    cta: 'Start With This Service', action: () => openBookingChoice('business')
  },
  {
    num: '10', title: 'Personal Photography',
    desc: '100% online photoshoots: birthdays, graduations, portraits, headshots, couples and personal-brand looks. One image from GH₵15 — upload photos, get images on WhatsApp within 24 business hours.',
    tags: ['Birthdays', 'Graduations', 'Headshots', 'Couples', 'Fully Online'],
    cta: 'Book Your Session', action: () => openBookingChoice('photo'), featured: true
  }
];

const servicesGrid = document.getElementById('servicesGrid');
if (servicesGrid) {
  const limit = Number(servicesGrid.dataset.limit || 0);
  let list = services;
  if (limit > 0 && limit < services.length) {
    const featured = services.find(s => s.featured);
    list = services.filter(s => !s.featured).slice(0, limit - 1);
    if (featured) list.push(featured);
  }
  list.forEach(s => {
    const card = document.createElement('article');
    card.className = 'svc-card reveal' + (s.featured ? ' featured' : '');
    card.innerHTML = `
      <span class="svc-num">${s.num}</span>
      <h3>${esc(s.title)}</h3>
      <p>${esc(s.desc)}</p>
      <div class="svc-tags">${s.tags.map(t => `<span>${esc(t)}</span>`).join('')}</div>
      <button class="service-cta">${esc(s.cta)}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </button>`;
    card.querySelector('.service-cta').addEventListener('click', e => { e.stopPropagation(); s.action(); });
    card.addEventListener('click', s.action);
    servicesGrid.appendChild(card);
  });
  observeReveals(servicesGrid);
}

/* ============================================================
   WORK
   ============================================================ */
const works = [
  { title: 'Social Media Management', caption: 'Ongoing content & growth', cat: 'business', wi: 1, img: 'images/work-social.webp' },
  { title: 'Brand Film Rollout', caption: 'Campaign series', cat: 'business', wi: 2, img: 'images/work-film.webp' },
  { title: 'Engagement System', caption: 'Digital marketing sprint', cat: 'business', wi: 3, img: 'images/work-engagement.webp' },
  { title: 'Product Photography', caption: 'Online commercial visuals', cat: 'business', wi: 4, img: 'images/work-product.webp' },
  { title: 'Digital Marketing Sprint', caption: 'Paid acquisition', cat: 'business', wi: 5, img: 'images/work-digital.webp' },
  { title: 'Fashion Brand Visuals', caption: 'Lookbook & campaign', cat: 'business', wi: 6, img: 'images/work-fashion.webp' },
  { title: 'Food Brand Content', caption: 'Library + launch', cat: 'business', wi: 7, img: 'images/work-food.webp' },
  { title: 'Graduation Portrait', caption: 'Online photoshoot look', cat: 'personal', wi: 8, img: 'images/work-grad.webp' },
  { title: 'Birthday Session', caption: 'Studio-style recreation', cat: 'personal', wi: 9, img: 'images/work-birthday.webp' },
  { title: 'Professional Headshot', caption: 'Remote headshot set', cat: 'personal', wi: 10, img: 'images/work-headshot.webp' },
  { title: 'Personal Brand Portrait', caption: 'Founder look', cat: 'personal', wi: 11, img: 'images/work-brand.webp' },
  { title: 'Outdoor Lifestyle Session', caption: 'Outdoor-style scene', cat: 'personal', wi: 12, img: 'images/work-couple.webp' },
  { title: 'Studio Fashion Portrait', caption: 'Creative recreation', cat: 'personal', wi: 13, img: 'images/work-studio-fashion.webp' },
];

const LOOK_MAP = {
  'Graduation Portrait': 'graduation',
  'Birthday Session': 'birthday',
  'Professional Headshot': 'headshot',
  'Personal Brand Portrait': 'personal-brand',
  'Outdoor Lifestyle Session': 'outdoor',
  'Studio Fashion Portrait': 'fashion',
};
const workGrid = document.getElementById('workGrid');
function renderWorks(filter = 'all') {
  if (!workGrid) return;
  workGrid.innerHTML = '';
  (filter === 'all' ? works : works.filter(w => w.cat === filter)).forEach(w => {
    const item = document.createElement('div');
    item.className = 'work-item reveal';
    const media = w.img
      ? `<img src="${w.img}" alt="${esc(w.title)}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\\'work-image-inner wi-${w.wi}\\'>${esc(w.title.split(' ')[0].toUpperCase())}</div>'" />`
      : `<div class="work-image-inner wi-${w.wi}"><span>${esc(w.title.split(' ')[0].toUpperCase())}</span></div>`;
    item.innerHTML = `
      <div class="work-image">
        ${media}
        <span class="sample-badge">Sample</span>
        <span class="work-category">${w.cat === 'business' ? 'Business' : 'Personal'}</span>
      </div>
      <div class="work-info"><h4>${esc(w.title)}</h4><p>${esc(w.caption)}</p>
        ${LOOK_MAP[w.title] ? `<button class="look-btn" onclick="bookLook('${LOOK_MAP[w.title]}', '${esc(w.title)}')">Get this look →</button>` : ''}
      </div>`;
    workGrid.appendChild(item);
  });
  observeReveals(workGrid);
}
renderWorks();
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderWorks(btn.dataset.filter);
  });
});

// ---- Needs → booking shortcuts ----
document.querySelectorAll('.need[data-book]').forEach(card => {
  card.addEventListener('click', () => openBookingChoice(card.dataset.book));
});

// ---- FAQ ----
document.querySelectorAll('.faq-item').forEach(item => {
  const q = item.querySelector('.faq-question');
  if (q) q.addEventListener('click', () => {
    const wasOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!wasOpen) item.classList.add('open');
  });
});

/* ============================================================
   PACKAGES
   ============================================================ */
const INCLUSIONS = 'Makeup · Retouch · Hair · Outfit · Background';
const PACKAGES = [
  { name: 'SINGLE IMAGE', price: 15, type: 'individual', images: 1, features: ['1 all-in image', INCLUSIONS, 'Delivery in 24 business hours'] },
  { name: 'LITE', price: 35, type: 'individual', images: 3, features: ['3 all-in images', INCLUSIONS + ' per image', 'Delivery in 24 business hours'] },
  { name: 'MEDIUM', price: 55, type: 'individual', images: 5, features: ['5 all-in images', INCLUSIONS + ' per image', 'Delivery in 24 business hours'] },
  { name: 'SUPERIOR', price: 105, type: 'individual', images: 10, features: ['10 all-in images', INCLUSIONS + ' per image', 'Delivery in 24 business hours'] },
  { name: 'COUPLE SILVER', price: 120, type: 'couple', images: 3, features: ['3 images', '1 outfit each', 'Studio layout', 'Delivery in 24 business hours'] },
  { name: 'COUPLE GOLD', price: 230, type: 'couple', images: 4, features: ['4 images', '2 outfits each', 'Creative scene', 'Delivery in 24 business hours'] },
  { name: 'COUPLE PLATINUM', price: 350, type: 'couple', images: 6, features: ['6 images', '3 outfits each', 'Premium concepts', 'Delivery in 24 business hours'] },
];
const SERVICES_EDIT = [
  { name: 'Earring / Accessories Change', price: 10, icon: '💍' },
  { name: 'Hairstyle Change', price: 10, icon: '💇' },
  { name: 'Outfit Change', price: 10, icon: '👗' },
  { name: 'Makeup Application', price: 10, icon: '💄' },
  { name: 'Basic Retouch', price: 10, icon: '✨' },
  { name: 'Advanced Retouch', price: 10, icon: '🌟' },
  { name: 'Pose Adjustment', price: 10, icon: '🧍' },
  { name: 'Background Choice', price: 10, icon: '🎨' },
  { name: 'Object Removal', price: 10, icon: '🧹' },
  { name: 'Two People Combined', price: 10, icon: '👥' },
  { name: 'Full Scene Replacement', price: 10, icon: '🏞️' },
  { name: 'Cartoon / Anime Style', price: 10, icon: '🎭' },
  { name: 'Glasses On / Off', price: 10, icon: '👓' },
  { name: 'Teeth Whitening', price: 10, icon: '😁' },
  { name: 'Hair Color Change', price: 10, icon: '🌈' },
  { name: 'Body / Weight Adjustment', price: 10, icon: '⚖️' },
  { name: 'Wrinkle & Age Removal', price: 10, icon: '⏳' },
  { name: 'Photo Restoration & Colorization', price: 10, icon: '🖼️' },
  { name: 'Watermark / Text Removal', price: 10, icon: '🚫' },
  { name: 'Photo Upscale / Sharpen', price: 10, icon: '🔍' },
];

let pkgTab = 'individual';
function renderPkgGrid() {
  const grid = document.getElementById('pkgGrid');
  if (!grid) return;
  if (pkgTab === 'editing') {
    grid.innerHTML = SERVICES_EDIT.map((s, i) => `
      <div class="pkg-card reveal" onclick="bookEdit(${i})">
        <span class="pkg-badge">Standalone</span>
        <div class="pkg-name">${s.icon} ${esc(s.name)}</div>
        <div class="pkg-price">GH₵ ${s.price} <small>each</small></div>
        <ul><li>Upload the photo you already have</li><li>Delivered within 24 business hours</li></ul>
        <span class="pkg-book">Book this edit →</span>
      </div>`).join('');
  } else {
    grid.innerHTML = PACKAGES.filter(p => p.type === pkgTab).map(p => `
      <div class="pkg-card reveal" onclick="openPhotoBooking('${p.name}')">
        ${p.name === 'SUPERIOR' ? '<span class="pkg-badge">Best value</span>' : ''}
        ${p.name === 'SINGLE IMAGE' ? '<span class="pkg-badge">Most popular</span>' : ''}
        ${p.name === 'COUPLE PLATINUM' ? '<span class="pkg-badge">Most images</span>' : ''}
        <div class="pkg-name">${p.name}</div>
        <div class="pkg-price">GH₵ ${p.price} <small>one-time</small></div>
        <ul>${p.features.map(f => `<li>${esc(f)}</li>`).join('')}</ul>
        <span class="pkg-book">Book ${p.name} →</span>
        <button class="pkg-share" onclick="event.stopPropagation(); sharePkg('${p.name}')">↗ Share this package</button>
      </div>`).join('');
  }
  observeReveals(grid);
}
if (document.getElementById('pkgGrid')) {
  document.querySelectorAll('#pkgTabs .tab').forEach(t => {
    t.addEventListener('click', () => {
      document.querySelectorAll('#pkgTabs .tab').forEach(x => x.classList.remove('active'));
      t.classList.add('active');
      pkgTab = t.dataset.pkgtype;
      renderPkgGrid();
    });
  });
  renderPkgGrid();
}

window.bookEdit = function (i) {
  openPhotoBooking(null, 'custom');
  if (!booking.data.selectedServices.includes(i)) booking.data.selectedServices.push(i);
  renderPhotoStep();
  toast(`${SERVICES_EDIT[i].name} added — GH₵10`);
};

/* ============================================================
   MODALS
   ============================================================ */
function openModal(id) {
  const m = document.getElementById(id);
  if (!m) return;
  m.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal(id) {
  const m = document.getElementById(id);
  if (!m) return;
  m.classList.remove('open');
  document.body.style.overflow = '';
}
document.querySelectorAll('.modal-overlay').forEach(o => {
  o.addEventListener('click', e => { if (e.target === o) closeModal(o.id); });
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') document.querySelectorAll('.modal-overlay.open').forEach(m => closeModal(m.id));
});

function openBookingChoice(which) {
  if (which === 'business') {
    closeModal('bookingChoiceModal');
    setTimeout(() => openModal('projectModal'), 120);
  } else if (which === 'photo') {
    closeModal('bookingChoiceModal');
    setTimeout(() => openPhotoBooking(), 120);
  } else {
    openModal('bookingChoiceModal');
  }
}

// ---- Business project form → WhatsApp ----
const projectForm = document.getElementById('projectForm');
if (projectForm) {
  projectForm.addEventListener('submit', e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const msg = `*New Business Project Brief — GIDIGBA STUDIOS*\n\n` +
      `*Name:* ${fd.get('name')}\n` +
      `*Company/Brand:* ${fd.get('company') || '—'}\n` +
      `*Email:* ${fd.get('email')}\n` +
      `*Phone/WhatsApp:* ${fd.get('phone')}\n` +
      `*Service:* ${fd.get('service')}\n\n` +
      `*Brief:*\n${fd.get('brief')}\n\n` +
      `_Sent via GIDIGBA STUDIOS website — DEVELOPED SPECIALLY FOR BUSINESSES._`;
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
    e.target.reset();
    closeModal('projectModal');
    toast('Brief ready in WhatsApp!');
  });
}

/* ============================================================
   ONLINE PHOTOSHOOT BOOKING (7 STEPS)
   ============================================================ */
const PHOTO_TYPES = [
  { id: 'birthday', label: 'Birthday', emoji: '🎂' },
  { id: 'graduation', label: 'Graduation', emoji: '🎓' },
  { id: 'portrait', label: 'Portrait', emoji: '🧑' },
  { id: 'headshot', label: 'Headshot', emoji: '💼' },
  { id: 'fashion', label: 'Fashion', emoji: '👗' },
  { id: 'couple', label: 'Couple', emoji: '💞' },
  { id: 'family', label: 'Family', emoji: '👨‍👩‍👧' },
  { id: 'event', label: 'Event', emoji: '🎉' },
  { id: 'outdoor', label: 'Outdoor', emoji: '🌳' },
  { id: 'studio', label: 'Studio', emoji: '📸' },
  { id: 'personal-brand', label: 'Personal Brand', emoji: '✨' },
  { id: 'social-media', label: 'Social Media Content', emoji: '📱' },
];

const LOOK_PREFS = [
  { id: 'studio-look', label: 'Studio-style look', emoji: '🏢' },
  { id: 'outdoor-look', label: 'Outdoor-style look', emoji: '🌿' },
  { id: 'custom-bg', label: 'Custom background', emoji: '🎨' },
  { id: 'occasion-scene', label: 'Occasion / event scene', emoji: '🎪' },
  { id: 'not-sure', label: 'Not sure yet', emoji: '🤔' },
];

function freshBookingData() {
  return {
    orderType: 'photoshoot',
    pkgType: 'individual',
    selectedPackage: null,
    selectedServices: [],
    photoType: null,
    look: null,
    prefDate: '', altDate: '', prefTime: '',
    turnaround: '',
    fullName: '', phone: '', email: '',
    peopleCount: '', outfitDesc: '',
    hairstyle1: '', hairstyle2: '',
    makeup1: false, makeup2: false,
    vision: '', mood: '', intendedUse: '', notes: '',
    disclaimerOk: false,
    hurry: false,
    pose: '',
    photoAbout: '',
    styleMe: false,
    makeup: false,
    inspiration: []
  };
}
let booking = { step: 1, data: freshBookingData() };
let bookTab = 'individual';
let sourceFiles = {};

function getSelectedPackage() {
  return PACKAGES.find(p => p.name === booking.data.selectedPackage) || null;
}
function getCustomTotal() {
  return booking.data.selectedServices.reduce((s, i) => s + SERVICES_EDIT[i].price, 0);
}
function getOutfitCount() {
  if (booking.data.orderType === 'photoshoot') return 1;
  return 0;
}
function isCouplePkg() {
  return booking.data.orderType === 'photoshoot' && getSelectedPackage()?.type === 'couple';
}

function saveDraft() {
  try {
    const { inspiration, ...rest } = booking.data;
    localStorage.setItem('gidigba_photo_draft', JSON.stringify({ step: booking.step, data: rest }));
  } catch (e) { /* quota */ }
}
function loadDraft() {
  try {
    const raw = localStorage.getItem('gidigba_photo_draft');
    if (!raw) return null;
    const d = JSON.parse(raw);
    let step = d.step || 1;
    if (step > 3) step = 3;
    return { step, data: { ...freshBookingData(), ...d.data, inspiration: [], disclaimerOk: false } };
  } catch (e) { return null; }
}
function clearDraft() { try { localStorage.removeItem('gidigba_photo_draft'); } catch (e) {} }

function openPhotoBooking(packageName, mode) {
  const draft = loadDraft();
  booking = draft || { step: 1, data: freshBookingData() };
  sourceFiles = {};
  booking.data.inspiration = [];
  if (mode === 'custom') {
    booking.data.orderType = 'custom';
    booking.data.selectedPackage = null;
    booking.step = 1;
    bookTab = 'editing';
  } else if (packageName) {
    const pkg = PACKAGES.find(p => p.name === packageName);
    if (pkg) {
      booking.data = { ...freshBookingData(), orderType: 'photoshoot', selectedPackage: pkg.name };
      if (pkg.type === 'couple') booking.data.photoType = 'couple';
      bookTab = pkg.type;
      const same = draft && draft.data && draft.data.selectedPackage === pkg.name && draft.data.orderType === 'photoshoot';
      booking.step = same && draft.step > 1 ? draft.step : 2;
    }
  } else {
    if (!draft) booking = { step: 1, data: freshBookingData() };
    bookTab = booking.data.orderType === 'custom'
      ? 'editing'
      : (PACKAGES.find(p => p.name === booking.data.selectedPackage)?.type === 'couple' ? 'couple' : 'individual');
  }
  renderPhotoStep();
  updateBookingSteps();
  openModal('photoModal');
  if (draft && !packageName && mode !== 'custom' && booking.step > 1) toast('Draft restored — continue where you left off');
}

function updateBookingSteps() {
  document.querySelectorAll('#bookingSteps .step').forEach(s => {
    const n = parseInt(s.dataset.step);
    s.classList.remove('active', 'done');
    if (n < booking.step) s.classList.add('done');
    else if (n === booking.step) s.classList.add('active');
  });
  const prev = document.getElementById('prevStepBtn');
  const next = document.getElementById('nextStepBtn');
  if (!prev || !next) return;
  prev.style.visibility = booking.step === 1 ? 'hidden' : 'visible';
  if (booking.step === 3) {
    next.innerHTML = `Send Booking Request
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`;
    next.className = 'btn btn-wa';
  } else {
    next.innerHTML = `Continue
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`;
    next.className = 'btn btn-primary';
  }
}

function photoNextStep() {
  if (!validateStep(booking.step)) return;
  if (booking.step === 3) {
    submitPhotoOrder();
    return;
  }
  booking.step++;
  saveDraft();
  renderPhotoStep();
  updateBookingSteps();
}
function photoPrevStep() {
  if (booking.step > 1) {
    booking.step--;
    renderPhotoStep();
    updateBookingSteps();
  }
}

function validateStep(step) {
  const d = booking.data;
  if (step === 1) {
    if (d.orderType === 'custom') {
      if (d.selectedServices.length === 0) { toast('Select at least one editing service', false); return false; }
    } else {
      const pkg = getSelectedPackage();
      if (!pkg) { toast('Choose a package to continue', false); return false; }
      const wantCouple = bookTab === 'couple';
      if ((pkg.type === 'couple') !== wantCouple) { toast('Choose a package from this tab', false); return false; }
    }
  }
  if (step === 2) {
    if (d.orderType === 'photoshoot') {
      if (!d.photoAbout || !d.photoAbout.trim()) { toast('Tell us what the photoshoot is about', false); return false; }
      if (!sourceFiles.selfie) { toast('Upload your selfie (required)', false); return false; }
      if (!sourceFiles.fullbody) { toast('Upload a full-body photo (required)', false); return false; }
      if (!d.styleMe && !d.hairstyle1.trim() && !sourceFiles.hairstyleImg) { toast('Describe or upload your hairstyle — or pick “Let us style you”', false); return false; }
      if (isCouplePkg()) {
        if (!sourceFiles.partnerSelfie) { toast("Upload partner's selfie", false); return false; }
        if (!sourceFiles.partnerFull) { toast("Upload partner's full-body photo", false); return false; }
        if (!d.styleMe && !d.hairstyle2.trim()) { toast("Describe partner's hairstyle — or pick “Let us style you”", false); return false; }
      }
    } else {
      if (!sourceFiles.editImage) { toast('Upload the photo you want edited (required)', false); return false; }
      const names = d.selectedServices.map(i => SERVICES_EDIT[i].name);
      if (names.includes('Background Choice') || names.includes('Full Scene Replacement')) {
        if (!d.vision.trim()) { toast('Describe the background/scene', false); return false; }
      }
      if (names.includes('Hairstyle Change') && !d.hairstyle1.trim()) { toast('Describe the hairstyle change', false); return false; }
    }
    if (!d.disclaimerOk) { toast('Please acknowledge the software-assistance notice', false); return false; }
  }
  return true;
}

function renderPhotoStep() {
  const c = document.getElementById('photoBookingContainer');
  if (!c) return;
  const d = booking.data;
  let html = '';

  if (booking.step === 1) {
    const tabsHtml = `
      <div class="tabs" style="margin-bottom:16px; display:flex; gap:8px; flex-wrap:wrap;">
        <button class="tab ${bookTab === 'individual' ? 'active' : ''}" onclick="setBookingTab('individual')">Individual</button>
        <button class="tab ${bookTab === 'couple' ? 'active' : ''}" onclick="setBookingTab('couple')">Couple</button>
        <button class="tab ${bookTab === 'editing' ? 'active' : ''}" onclick="setBookingTab('editing')">Editing · GH₵10</button>
      </div>`;

    if (bookTab === 'editing') {
      html = `
      <div class="step-pane active">
        <span class="modal-label">Step 1 of 3 · Simple image editing</span>
        <h4>Change just one thing — GH₵10 each</h4>
        <p class="step-hint">No photoshoot needed. Upload the photo you already have and pick any changes — flat 10 cedis per change.</p>
        ${tabsHtml}
        <div class="svc-scroll">
          ${SERVICES_EDIT.map((s, i) => `
            <div class="svc-chip ${d.selectedServices.includes(i) ? 'selected' : ''}" onclick="toggleEditService(${i})">
              <div class="svc-price">GH₵ ${s.price}</div>
              <h5>${s.icon} ${esc(s.name)}</h5>
              <div class="svc-check">${d.selectedServices.includes(i) ? '✓ Selected' : 'Tap to add'}</div>
            </div>`).join('')}
        </div>
        <div class="total-bar"><span>Total</span><strong>GH₵ ${getCustomTotal()}</strong></div>
      </div>`;
    } else {
      const list = PACKAGES.filter(p => p.type === (bookTab === 'couple' ? 'couple' : 'individual'));
      html = `
      <div class="step-pane active">
        <span class="modal-label">Step 1 of 3</span>
        <h4>${bookTab === 'couple' ? 'Couple package' : 'Individual package'}</h4>
        <p class="step-hint">One price, everything included. Delivered within 24 business hours. Prices in Ghana Cedis.</p>
        ${tabsHtml}
        <div class="pkg-mini-grid" style="grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));">
          ${list.map(p => `
            <div class="pkg-mini ${d.selectedPackage === p.name ? 'selected' : ''}" onclick="selectBookingPackage('${p.name}')">
              <div class="pm-name">${p.name}</div>
              <div class="pm-price">GH₵ ${p.price}</div>
              <div class="pm-feats">${p.features.join(' · ')}</div>
            </div>`).join('')}
        </div>
      </div>`;
    }
  }

  else if (booking.step === 2) {
    const isSession = d.orderType === 'photoshoot';
    const pkg = getSelectedPackage();
    const couple = isCouplePkg();
    const biggest = isSession && (pkg?.name === 'SUPERIOR' || pkg?.name === 'COUPLE PLATINUM');
    const svcNames = d.selectedServices.map(i => SERVICES_EDIT[i].name);
    const needVision = !isSession && (svcNames.includes('Background Choice') || svcNames.includes('Full Scene Replacement'));
    const needHair = !isSession && svcNames.includes('Hairstyle Change');
    const sb = d.styleMe ? ' hidden' : '';

    const upBox = (key, label, sub) => `
      <label class="upload-box ${sourceFiles[key] ? 'filled' : ''}" data-key="${key}">
        <input type="file" accept="image/*" capture="environment" />
        <div class="ub-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg></div>
        <p>${label}</p><small>${sub}</small>
        <div class="ub-check">✓ Ready</div>
        <img class="ub-preview" alt="preview" />
      </label>`;

    html = `
      <div class="step-pane active">
        <span class="modal-label">Step 2 of 3</span>
        <h4>${isSession ? 'Your photos & look' : 'Your edit & photo'}</h4>
        <p class="step-hint">${isSession
          ? 'Selfie + full-body required. Outfit & hairstyle: upload a pic or describe it — or let us style you. Delivered within 24 business hours.'
          : `Send the photo to change — ${d.selectedServices.length} edit${d.selectedServices.length > 1 ? 's' : ''} · GH₵ ${getCustomTotal()}. Delivered within 24 business hours.`}</p>

        ${isSession ? `
        <div class="form-group" style="margin-top:14px;">
          <label>What is the photoshoot about? *</label>
          <textarea id="photoAbout" rows="2" placeholder="e.g. Graduation shoot in kente, birthday with gold theme, LinkedIn headshot...">${esc(d.photoAbout)}</textarea>
        </div>

        <div class="upload-grid" style="margin-top:16px;">
          ${upBox('selfie', 'Selfie (required)', 'Face clearly visible')}
          ${upBox('fullbody', 'Full body (required)', 'Head to toe')}
          ${couple ? upBox('partnerSelfie', 'Partner selfie (required)', "Partner's face") : ''}
          ${couple ? upBox('partnerFull', 'Partner full body (required)', 'Partner head to toe') : ''}
        </div>

        <div class="attr-block style-block"${sb}>
          <div class="attr-head">👗 Outfit</div>
          <div class="upload-grid" style="grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));">
            ${upBox('outfitImg', 'Outfit photo (optional)', 'Snap your outfit — or describe below')}
          </div>
          <div class="form-group">
            <label>Describe your outfit(s)</label>
            <textarea id="outfitDesc" rows="2" placeholder="e.g. Gold kente cloth, white sundress, navy suit — leave empty if you uploaded a photo">${esc(d.outfitDesc)}</textarea>
          </div>
        </div>

        <div class="attr-block style-block"${sb}>
          <div class="attr-head">💇 Hairstyle</div>
          <div class="upload-grid" style="grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));">
            ${upBox('hairstyleImg', 'Hairstyle photo (optional)', 'Snap the hair — or describe below')}
          </div>
          <div class="form-group">
            <label>Describe your desired hairstyle *</label>
            <textarea id="hairstyle1" rows="2" placeholder="e.g. long braids with gold cuffs, low cut fade... — leave empty if you uploaded a photo">${esc(d.hairstyle1)}</textarea>
          </div>
        </div>

        ${couple ? `
        <div class="attr-block style-block"${sb}>
          <div class="attr-head">💞 Partner hairstyle</div>
          <div class="form-group">
            <label>Partner's desired hairstyle *</label>
            <textarea id="hairstyle2" rows="2" placeholder="Describe partner's hairstyle... — leave empty if styled by us">${esc(d.hairstyle2)}</textarea>
          </div>
        </div>` : ''}

        <div class="toggle-row" id="styleMeRow" onclick="toggleStyleMe()" style="margin-top:16px;">
          <span>👗 Let us style you — skip the outfit &amp; hairstyle process</span>
          <div class="toggle-switch ${d.styleMe ? 'active' : ''}"></div>
        </div>
        <p class="opt-warn" id="styleWarn"${d.styleMe ? '' : ' hidden'}>⚠️ <strong>No free style changes after work begins.</strong> Once production starts, outfit &amp; hairstyle can no longer be changed for free.</p>

        <div class="toggle-row" id="makeupRow" onclick="toggleMakeup()" style="margin-top:12px;">
          <span>💄 Add makeup</span>
          <div class="toggle-switch ${d.makeup ? 'active' : ''}"></div>
        </div>
        <p class="opt-warn" id="makeupWarn"${d.makeup ? '' : ' hidden'}>⚠️ Adding makeup will cause changes to your face — as it would in normal life.</p>

        ${biggest ? `
        <div class="form-group" style="margin-top:14px;">
          <label>POSE — biggest package: describe the pose / expression you want <span style="color:var(--grey); font-weight:400;">(optional)</span></label>
          <textarea id="poseDesc" rows="2" placeholder="e.g. seated on a stool, arms folded, looking away...">${esc(d.pose)}</textarea>
        </div>` : ''}

        <div class="form-group" style="margin-top:14px;">
          <label>Additional notes</label>
          <textarea id="notes" rows="3" placeholder="Anything else we should know?">${esc(d.notes)}</textarea>
        </div>` : `
        <div style="margin-top:16px;">
          <div class="upload-grid">${upBox('editImage', 'Photo to edit (required)', 'The picture you want changed')}</div>
          ${needVision ? `
          <div class="form-group" style="margin-top:12px;">
            <label>Describe the background / scene *</label>
            <textarea id="vision" rows="2" placeholder="e.g. sunset beach, black studio backdrop, Accra skyline...">${esc(d.vision)}</textarea>
          </div>` : ''}
          ${needHair ? `
          <div class="form-group" style="margin-top:10px;">
            <label>Describe the hairstyle change *</label>
            <textarea id="hairstyle1" rows="2" placeholder="e.g. change to short afro, add braids...">${esc(d.hairstyle1)}</textarea>
          </div>` : ''}
          <div class="form-group" style="margin-top:12px;">
            <label>Additional notes</label>
            <textarea id="notes" rows="3" placeholder="Anything else we should know?">${esc(d.notes)}</textarea>
          </div>
        </div>`}

        <div class="toggle-row hurry-row" onclick="toggleHurry()" style="margin-top:16px;">
          <span>⚡ I'm in a hurry — I need my images ASAP</span>
          <div class="toggle-switch ${d.hurry ? 'active' : ''}"></div>
        </div>

        <label class="disclaimer-check" style="margin-top:16px;">
          <input type="checkbox" id="disclaimerOk" ${d.disclaimerOk ? 'checked' : ''} />
          <span><strong>I understand:</strong> these are software-assisted generated images. Minor changes may occur and details may not be 100% real-life accurate. 100% online service — no in-person session. Source images are deleted 20 minutes after delivery.</span>
        </label>
      </div>`;
  }

  else if (booking.step === 3) {
    const isSession = d.orderType === 'photoshoot';
    const pkg = getSelectedPackage();
    const offerLine = isSession
      ? `${pkg?.name || '—'} · GH₵ ${pkg?.price || 0}`
      : `Single-change edits · GH₵ ${getCustomTotal()}`;
    const includesLine = !isSession
      ? d.selectedServices.map(i => `${SERVICES_EDIT[i].name} (GH₵10)`).join(', ')
      : (pkg?.type === 'couple' ? pkg.features.filter(f => !f.startsWith('Delivery')).join(' · ') : 'Makeup · Retouch · Hair · Outfit · Background choice');
    const outfitVal = d.outfitDesc || (sourceFiles.outfitImg ? 'Photo attached' : '—');
    const hairVal = d.hairstyle1 || (sourceFiles.hairstyleImg ? 'Photo attached' : '—');
    const srcCount = Object.keys(sourceFiles).length;
    const biggest = isSession && (pkg?.name === 'SUPERIOR' || pkg?.name === 'COUPLE PLATINUM');

    html = `
      <div class="step-pane active">
        <span class="modal-label">Step 3 of 3 — Review</span>
        <h4>Review &amp; send</h4>
        <p class="step-hint">Check everything below. Use Back to edit — then send your request to us on WhatsApp.</p>

        <div class="review-block">
          <h5>Order</h5>
          <div class="review-row"><span class="rv-label">Offer</span><span class="rv-value">${esc(offerLine)}</span></div>
          <div class="review-row"><span class="rv-label">Includes</span><span class="rv-value">${esc(includesLine)}</span></div>
          ${isSession ? `<div class="review-row"><span class="rv-label">Images</span><span class="rv-value">${pkg?.images || 1}</span></div>
          <div class="review-row"><span class="rv-label">Photoshoot</span><span class="rv-value">${esc(d.photoAbout || '—')}</span></div>` : ''}
          <div class="review-row"><span class="rv-label">Delivery</span><span class="rv-value">Within 24 business hours</span></div>
          <div class="review-row"><span class="rv-label">Hurry</span><span class="rv-value">${d.hurry ? '⚡ YES — ASAP' : 'Standard'}</span></div>
        </div>

        <div class="review-block">
          <h5>Creative</h5>
          ${isSession ? `
          <div class="review-row"><span class="rv-label">Outfit</span><span class="rv-value">${esc(d.styleMe ? 'Styled by GIDIGBA' : outfitVal)}</span></div>
          <div class="review-row"><span class="rv-label">Hairstyle</span><span class="rv-value">${esc(d.styleMe ? 'Styled by GIDIGBA' : hairVal)}</span></div>
          ${coupleHasPartner(d) ? `<div class="review-row"><span class="rv-label">Partner hair</span><span class="rv-value">${esc(d.styleMe ? 'Styled by GIDIGBA' : (d.hairstyle2 || '—'))}</span></div>` : ''}
          <div class="review-row"><span class="rv-label">Style me</span><span class="rv-value">${d.styleMe ? 'Yes — no free style changes after work begins' : 'No'}</span></div>
          <div class="review-row"><span class="rv-label">Makeup</span><span class="rv-value">${d.makeup ? 'Yes — face changes as in normal life' : 'No'}</span></div>
          ${biggest && d.pose ? `<div class="review-row"><span class="rv-label">Pose</span><span class="rv-value">${esc(d.pose)}</span></div>` : ''}` : `
          <div class="review-row"><span class="rv-label">Services</span><span class="rv-value">${esc(includesLine)}</span></div>
          ${d.hairstyle1 ? `<div class="review-row"><span class="rv-label">Hairstyle change</span><span class="rv-value">${esc(d.hairstyle1)}</span></div>` : ''}
          ${d.vision ? `<div class="review-row"><span class="rv-label">Background</span><span class="rv-value">${esc(d.vision)}</span></div>` : ''}`}
          <div class="review-row"><span class="rv-label">Notes</span><span class="rv-value">${esc(d.notes || '—')}</span></div>
          <div class="review-row"><span class="rv-label">Photos attached</span><span class="rv-value">${srcCount}</span></div>
        </div>

        ${PAY_URL ? `<a class="btn btn-primary btn-full pay-online" href="${PAY_URL}" target="_blank" rel="noopener">Pay online now — MoMo / Card · ${esc(offerLine)}</a>` : ''}
        <p class="pay-hint">${PAY_URL ? 'Paying now locks your slot instantly — then send your request below.' : 'Payment: Mobile Money details are shared on WhatsApp after you send your request. Your slot is confirmed once payment completes.'}</p>

        <div class="review-note">
          <strong>Note:</strong> Submitting sends a booking request via WhatsApp to GIDIGBA STUDIOS. Your order begins after availability is confirmed and payment (Mobile Money) is completed. This is a 100% online service — software-assisted images, delivered to your WhatsApp within 24 business hours.
        </div>
      </div>`;
  }

  c.innerHTML = html;
  attachStepListeners();
}

function coupleHasPartner(d) {
  return d.orderType === 'photoshoot' && getSelectedPackage()?.type === 'couple';
}

window.setBookingTab = function (t) {
  bookTab = t;
  if (t === 'editing') {
    booking.data.orderType = 'custom';
    booking.data.selectedPackage = null;
  } else {
    booking.data.orderType = 'photoshoot';
    booking.data.selectedPackage = null;
    booking.data.photoType = null;
  }
  renderPhotoStep();
};
window.selectBookingPackage = function (name) {
  const pkg = PACKAGES.find(p => p.name === name);
  if (!pkg) return;
  booking.data.selectedPackage = name;
  booking.data.orderType = 'photoshoot';
  bookTab = pkg.type;
  if (pkg.type === 'couple') booking.data.photoType = 'couple';
  booking.step = 2;
  saveDraft();
  renderPhotoStep();
  updateBookingSteps();
  toast(`Selected ${name} — GH₵ ${pkg.price}`);
};
window.toggleEditService = function (i) {
  const arr = booking.data.selectedServices;
  const idx = arr.indexOf(i);
  if (idx >= 0) arr.splice(idx, 1); else arr.push(i);
  renderPhotoStep();
};
window.toggleHurry = function () {
  booking.data.hurry = !booking.data.hurry;
  const row = document.querySelector('.hurry-row');
  if (row) {
    const sw = row.querySelector('.toggle-switch');
    if (sw) sw.classList.toggle('active', booking.data.hurry);
  }
};
window.toggleStyleMe = function () {
  booking.data.styleMe = !booking.data.styleMe;
  const on = booking.data.styleMe;
  const sw = document.getElementById('styleMeRow');
  if (sw) { const s = sw.querySelector('.toggle-switch'); if (s) s.classList.toggle('active', on); }
  const w = document.getElementById('styleWarn');
  if (w) w.hidden = !on;
  document.querySelectorAll('.style-block').forEach(el => { el.hidden = on; });
};
window.toggleMakeup = function () {
  booking.data.makeup = !booking.data.makeup;
  const on = booking.data.makeup;
  const row = document.getElementById('makeupRow');
  if (row) { const s = row.querySelector('.toggle-switch'); if (s) s.classList.toggle('active', on); }
  const w = document.getElementById('makeupWarn');
  if (w) w.hidden = !on;
};

function attachStepListeners() {
  const typeGrid = document.getElementById('photoTypeGrid');
  if (typeGrid) {
    typeGrid.querySelectorAll('.option-card').forEach(card => {
      card.addEventListener('click', () => {
        booking.data.photoType = card.dataset.type;
        typeGrid.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
      });
    });
  }
  if (document.getElementById('photoTypeGrid')) {
    const noop = true;
  }
  {
    const bind = (id, key) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('input', e => booking.data[key] = e.target.value);
    };
    ['photoAbout|photoAbout', 'outfitDesc|outfitDesc', 'hairstyle1|hairstyle1', 'hairstyle2|hairstyle2',
     'poseDesc|pose', 'notes|notes', 'vision|vision']
      .forEach(pair => { const [id, key] = pair.split('|'); bind(id, key); });
  }
  document.querySelectorAll('.upload-box[data-key]').forEach(box => {
    const key = box.dataset.key;
    const input = box.querySelector('input[type="file"]');
    if (sourceFiles[key]) {
      const r = new FileReader();
      r.onload = ev => { const img = box.querySelector('.ub-preview'); if (img) img.src = ev.target.result; };
      r.readAsDataURL(sourceFiles[key]);
    }
    input.addEventListener('change', e => {
      const f = e.target.files[0];
      if (!f) return;
      sourceFiles[key] = f;
      box.classList.add('filled');
      const r = new FileReader();
      r.onload = ev => { box.querySelector('.ub-preview').src = ev.target.result; };
      r.readAsDataURL(f);
    });
  });
  const disc = document.getElementById('disclaimerOk');
  if (disc) disc.addEventListener('change', e => booking.data.disclaimerOk = e.target.checked);
}

async function submitPhotoOrder() {
  if (!navigator.onLine) {
    saveDraft();
    toast("You're offline — order saved as draft. Reconnect to send.", false);
    return;
  }
  const btn = document.getElementById('nextStepBtn');
  const originalHtml = btn.innerHTML;
  btn.disabled = true;
  btn.textContent = 'Uploading…';

  try {
    const urls = {};
    const uploads = [];
    for (const [k, f] of Object.entries(sourceFiles)) uploads.push([k, f]);

    for (const [k, f] of uploads) {
      const fd = new FormData();
      fd.append('image', f);
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, { method: 'POST', body: fd });
      const data = await res.json();
      if (!data.success) throw new Error('Upload failed');
      urls[k] = data.data.url;
    }

    const d = booking.data;
    const pkg = getSelectedPackage();
    const isSession = d.orderType === 'photoshoot';

    let msg = `Hello GIDIGBA STUDIOS! 📸\n*New Online Order — simple pricing*\n\n*ORDER*\n`;
    if (isSession && pkg) {
      msg += `Offer: ${pkg.name} (GH₵ ${pkg.price})\n`;
      if (pkg.type === 'couple') {
        msg += `Includes: ${pkg.features.filter(f => !f.startsWith('Delivery')).join(' · ')}\n`;
      } else {
        msg += `Includes: makeup, retouch, hair, outfit & background choice\n`;
      }
      msg += `Images: ${pkg.images} · Delivery: within 24 business hours\n`;
      msg += `Photoshoot: ${d.photoAbout || 'N/A'}\n`;
    } else {
      msg += `Single-change edits — GH₵10 each:\n`;
      d.selectedServices.forEach(i => { msg += `  • ${SERVICES_EDIT[i].name} — GH₵10\n`; });
      msg += `Total: GH₵ ${getCustomTotal()} · Delivery: within 24 business hours\n`;
    }
    msg += `Hurry: ${d.hurry ? 'YES — customer needs images ASAP' : 'Standard'}\n`;
    if (isSession) {
      msg += `Style: ${d.styleMe ? 'YES — GIDIGBA styles them (no free style changes after work begins)' : 'No — client provides outfit & hairstyle'}\n`;
      msg += `Makeup: ${d.makeup ? 'YES — client informed makeup changes face as in normal life' : 'No'}\n`;
    }
    msg += `\n*CREATIVE*\n`;
    if (isSession) {
      msg += `Outfit: ${d.styleMe ? 'Skipped — styled by GIDIGBA' : (d.outfitDesc || (urls.outfitImg ? 'Photo attached' : 'N/A'))}\n`;
      msg += `Hairstyle: ${d.styleMe ? 'Skipped — styled by GIDIGBA' : (d.hairstyle1 || (urls.hairstyleImg ? 'Photo attached' : 'N/A'))}\n`;
      if (d.hairstyle2) msg += `Partner hairstyle: ${d.styleMe ? 'Skipped — styled by GIDIGBA' : d.hairstyle2}\n`;
      if (d.pose) msg += `Pose: ${d.pose}\n`;
    } else {
      if (d.hairstyle1) msg += `Hairstyle change: ${d.hairstyle1}\n`;
      if (d.vision) msg += `Background/scene: ${d.vision}\n`;
    }
    msg += `Notes: ${d.notes || 'N/A'}\n\n`;
    msg += `*PHOTOS*\n`;
    Object.entries(urls).forEach(([k, u]) => { msg += `${k}: ${u}\n`; });
    msg += `\n✅ I understand these are software-assisted generated images (minor variations may occur).\n✅ 100% online — no in-person session.\n✅ Delivery within 24 business hours.\n✅ I've reviewed this request and will complete Mobile Money payment.`;
    const refBy = localStorage.getItem('gidigba_referral');
    if (refBy) msg += `\n\n*Referred by:* ${refBy}`;

    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
    toast('Booking request ready in WhatsApp!');
    clearDraft();
    try {
      localStorage.setItem('gidigba_last_order', JSON.stringify({
        ts: Date.now(),
        pkg: isSession && pkg ? pkg.name : 'Single-change edits',
        price: isSession && pkg ? pkg.price : getCustomTotal()
      }));
    } catch (e) {}
    booking = { step: 1, data: freshBookingData() };
    sourceFiles = {};
    closeModal('photoModal');
  } catch (e) {
    toast('Upload failed — please try again', false);
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalHtml;
    updateBookingSteps();
  }
}

/* ============================================================
   GROWTH FUNCTIONS — look preselect, share cards, quiz,
   referral, order tracking, gift vouchers
   ============================================================ */

// ---- "Get this look" on work items ----
function bookLook(typeId, title) {
  const t = PHOTO_TYPES.find(x => x.id === typeId);
  openPhotoBooking();
  booking.data.photoAbout = t ? t.label : 'Portrait';
  if (booking.step > 1) renderPhotoStep();
  if (typeof saveDraft === 'function') saveDraft();
  toast(`Photoshoot question filled as “${t ? t.label : 'Portrait'}” from “${title}” — choose Single Image or a Package`);
}

// ---- Shareable package card (canvas → PNG) ----
function sharePkg(name) {
  const p = PACKAGES.find(x => x.name === name);
  if (!p) return;
  const W = 1080, H = 1080;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const x = c.getContext('2d');
  x.fillStyle = '#000'; x.fillRect(0, 0, W, H);
  x.strokeStyle = 'rgba(255,255,255,.06)'; x.lineWidth = 1;
  for (let i = 0; i <= W; i += 70) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, H); x.stroke(); }
  for (let i = 0; i <= H; i += 70) { x.beginPath(); x.moveTo(0, i); x.lineTo(W, i); x.stroke(); }
  x.fillStyle = '#C0F500'; x.fillRect(0, 0, W, 14);
  x.fillStyle = '#8f8f8f'; x.font = '700 30px Inter, Arial, sans-serif';
  x.fillText('ONLINE PHOTOSHOOT · 100% REMOTE', 70, 120);
  x.fillStyle = '#fff'; x.font = '800 84px Poppins, Inter, Arial, sans-serif';
  x.fillText(p.name, 70, 280);
  x.fillStyle = '#C0F500'; x.font = '900 150px Poppins, Inter, Arial, sans-serif';
  x.fillText('GH₵ ' + p.price, 70, 450);
  x.fillStyle = '#bdbdbd'; x.font = '400 34px Inter, Arial, sans-serif';
  x.fillText(p.features.join('  ·  '), 70, 530);
  x.fillStyle = '#8f8f8f'; x.font = '400 30px Inter, Arial, sans-serif';
  x.fillText('Photos delivered to your WhatsApp within 24 business hours.', 70, 590);
  x.strokeStyle = 'rgba(255,255,255,.14)';
  x.beginPath(); x.moveTo(70, 760); x.lineTo(W - 70, 760); x.stroke();
  x.fillStyle = '#fff'; x.font = '800 46px Poppins, Inter, Arial, sans-serif';
  x.fillText('GIDIGBA STUDIOS', 70, 850);
  x.fillStyle = '#C0F500'; x.font = '700 27px Inter, Arial, sans-serif';
  x.fillText('DEVELOPED SPECIALLY FOR BUSINESSES.', 70, 900);
  x.fillStyle = '#5c5c5c'; x.font = '400 26px Inter, Arial, sans-serif';
  x.fillText('Book on WhatsApp · +233 53 431 7611 · Accra, Ghana', 70, 960);
  try {
    const a = document.createElement('a');
    a.download = 'gidigba-' + p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '.png';
    a.href = c.toDataURL('image/png');
    a.click();
    toast('Card saved — share it on your WhatsApp status ✨');
  } catch (e) { toast('Could not generate card on this device', false); }
}

// ---- Style quiz (photoshoots page) ----
const QUIZ = { who: null, occasion: null, budget: null, speed: null };
const QUIZ_OCCASION_TYPE = { birthday: 'birthday', grad: 'graduation', pro: 'headshot', everyday: 'portrait' };

function quizPick(q, val, btn) {
  QUIZ[q] = val;
  const group = btn.parentElement;
  group.querySelectorAll('.quiz-opt').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  const res = document.getElementById('quizResult');
  if (res) res.innerHTML = '';
}

function quizReset() {
  Object.keys(QUIZ).forEach(k => QUIZ[k] = null);
  document.querySelectorAll('.quiz-opt').forEach(b => b.classList.remove('selected'));
  const res = document.getElementById('quizResult');
  if (res) res.innerHTML = '';
}

function quizResult() {
  const res = document.getElementById('quizResult');
  if (!res) return;
  const { who, occasion, budget, speed } = QUIZ;
  if (!who || !occasion || !budget || !speed) { toast('Answer all four questions first', false); return; }

  if (who === 'group') {
    res.innerHTML = `
      <div class="quiz-card quiz-win">
        <span class="quiz-kicker">Your match</span>
        <h4>Custom Edit</h4>
        <p>Groups and families get a custom multi-select build — pick exactly the edits you need (from GH₵10).</p>
        <div class="quiz-actions">
          <button class="btn btn-primary btn-sm" onclick="openPhotoBooking('', 'custom')">Build My Custom Edit</button>
          <button class="btn btn-ghost btn-sm" onclick="quizReset()">Retake</button>
        </div>
      </div>`;
    return;
  }

  let pkgName;
  if (who === 'couple') {
    pkgName = budget === 'low' ? 'COUPLE SILVER' : budget === 'high' ? 'COUPLE PLATINUM' : 'COUPLE GOLD';
  } else {
    pkgName = budget === 'low' ? 'SINGLE IMAGE' : budget === 'high' ? 'MEDIUM' : 'LITE';
  }
  const p = PACKAGES.find(x => x.name === pkgName) || PACKAGES[0];
  const tLabel = PHOTO_TYPES.find(t => t.id === QUIZ_OCCASION_TYPE[occasion])?.label || 'Portrait';
  res.innerHTML = `
    <div class="quiz-card quiz-win">
      <span class="quiz-kicker">Your match</span>
      <h4>${p.name} · GH₵ ${p.price}</h4>
      <p>${p.features.join(' · ')} — matched for a ${tLabel.toLowerCase()} shoot. Delivered to your WhatsApp within 24 business hours. We've pre-filled the photoshoot question for you too.</p>
      <div class="quiz-actions">
        <button class="btn btn-primary btn-sm" onclick="bookQuizPkg('${p.name}', '${QUIZ_OCCASION_TYPE[occasion]}')">Book ${p.name} →</button>
        <button class="btn btn-ghost btn-sm" onclick="sharePkg('${p.name}')">↗ Share</button>
        <button class="btn btn-ghost btn-sm" onclick="quizReset()">Retake</button>
      </div>
    </div>`;
}

function bookQuizPkg(pkgName, typeId) {
  openPhotoBooking(pkgName);
  if (typeId) {
    const t = PHOTO_TYPES.find(x => x.id === typeId);
    booking.data.photoAbout = t ? t.label : '';
    renderPhotoStep();
    if (typeof saveDraft === 'function') saveDraft();
    if (t) toast(`Photoshoot question filled: ${t.label}`);
  }
}

// ---- Referral (reviews page) ----
function getRefCode() {
  let code = null;
  try { code = localStorage.getItem('gidigba_ref_code'); } catch (e) {}
  if (!code) {
    code = 'GID-' + Math.random().toString(36).slice(2, 6).toUpperCase();
    try { localStorage.setItem('gidigba_ref_code', code); } catch (e) {}
  }
  return code;
}

function initReferral() {
  const codeEl = document.getElementById('refCode');
  if (!codeEl) return;
  const code = getRefCode();
  codeEl.textContent = code;
  const byEl = document.getElementById('refBy');
  try {
    const by = localStorage.getItem('gidigba_referral');
    if (by && byEl) { byEl.textContent = `Referred by: ${by}`; byEl.style.display = 'block'; }
  } catch (e) {}
}
initReferral();

// ---- Before/after proof slider ----
function initBA() {
  const r = document.getElementById('baRange');
  if (!r) return;
  const img = document.getElementById('baBefore');
  const handle = document.getElementById('baHandle');
  const upd = () => {
    const v = r.value;
    if (img) img.style.clipPath = `inset(0 ${100 - v}% 0 0)`;
    if (handle) handle.style.left = v + '%';
  };
  r.addEventListener('input', upd);
  upd();
}
initBA();

function shareReferral() {
  const code = getRefCode();
  const link = (location.origin && location.origin !== 'null' ? location.origin : location.href.split('?')[0]) + (location.pathname.endsWith('.html') || location.pathname === '/' || location.pathname === '' ? '' : '') + '?ref=' + code;
  const base = location.href.split('?')[0].split('#')[0];
  const url = base + '?ref=' + code;
  const text = `✨ I'm getting an online photoshoot with GIDIGBA STUDIOS — no studio, photos on WhatsApp within 24 business hours, one image from GH₵15. Use my code ${code} and we both get ${REFERRAL_REWARD} off 👉 ${url}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}

// ---- Order tracking (track.html) ----
function initTrack() {
  const el = document.getElementById('trackResult');
  if (!el) return;
  let last = null, draft = null;
  try { last = JSON.parse(localStorage.getItem('gidigba_last_order') || 'null'); } catch (e) {}
  try { draft = JSON.parse(localStorage.getItem('gidigba_photo_draft') || 'null'); } catch (e) {}

  const ago = ts => {
    const mins = Math.round((Date.now() - ts) / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins} min ago`;
    const hrs = Math.round(mins / 60);
    if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
    return `${Math.round(hrs / 24)} day${Math.round(hrs / 24) > 1 ? 's' : ''} ago`;
  };

  if (last) {
    el.innerHTML = `
      <div class="track-card">
        <span class="track-kicker">Order found</span>
        <h4>${esc(last.pkg)} · GH₵ ${last.price}</h4>
        <p class="track-sub">Submitted ${ago(last.ts)} from this device.</p>
        <ol class="track-steps">
          <li class="done">Request sent on WhatsApp</li>
          <li class="active">Awaiting confirmation &amp; MoMo payment</li>
          <li>Editing in progress</li>
          <li>Delivered to your WhatsApp</li>
        </ol>
        <p class="track-note">Status is confirmed manually by our team on WhatsApp — tap below to ask for a live update.</p>
        <div class="quiz-actions">
          <a class="btn btn-primary btn-sm" href="https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('Hello GIDIGBA STUDIOS! Status check for my ' + last.pkg + ' order (submitted ' + ago(last.ts) + ').')}" target="_blank" rel="noopener">Ask for status</a>
        </div>
      </div>`;
  } else if (draft && draft.step > 1) {
    el.innerHTML = `
      <div class="track-card">
        <span class="track-kicker">Draft in progress</span>
        <h4>Not submitted yet</h4>
        <p class="track-sub">You stopped at step ${draft.step} of 3${draft.data && draft.data.selectedPackage ? ' with ' + esc(draft.data.selectedPackage) : ''}.</p>
        <ol class="track-steps">
          <li class="done">Started booking</li>
          <li class="active">Draft saved on this device</li>
          <li>Request sent on WhatsApp</li>
          <li>Delivered to your WhatsApp</li>
        </ol>
        <div class="quiz-actions">
          <button class="btn btn-primary btn-sm" onclick="openPhotoBooking()">Resume booking</button>
        </div>
      </div>`;
  } else {
    el.innerHTML = `
      <div class="track-card">
        <span class="track-kicker">Nothing here yet</span>
        <h4>No booking found on this device</h4>
        <p class="track-sub">Start a booking and your progress will appear here automatically — this tracker reads your device, so use the same phone/browser you booked with.</p>
        <div class="quiz-actions">
          <button class="btn btn-primary btn-sm" onclick="openBookingChoice('photo')">Start a Booking</button>
        </div>
      </div>`;
  }
}
initTrack();

// ---- Gift voucher (voucher.html) ----
function voucherGen() {
  const get = id => (document.getElementById(id) || {}).value || '';
  const recipient = get('vRecipient').trim();
  const sender = get('vSender').trim();
  const occasion = get('vOccasion');
  const pkgName = get('vPkg');
  if (!recipient || !sender) { toast('Fill in who it\u2019s for and who it\u2019s from', false); return; }
  const p = PACKAGES.find(x => x.name === pkgName) || PACKAGES[1];
  const code = 'VG-' + Math.random().toString(36).slice(2, 8).toUpperCase();

  const W = 1080, H = 1080;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const x = c.getContext('2d');
  x.fillStyle = '#000'; x.fillRect(0, 0, W, H);
  x.strokeStyle = 'rgba(255,255,255,.07)';
  for (let i = 0; i <= W; i += 70) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, H); x.stroke(); }
  for (let i = 0; i <= H; i += 70) { x.beginPath(); x.moveTo(0, i); x.lineTo(W, i); x.stroke(); }
  x.strokeStyle = '#C0F500'; x.lineWidth = 6;
  x.strokeRect(30, 30, W - 60, H - 60);
  x.fillStyle = '#C0F500'; x.font = '700 30px Inter, Arial, sans-serif';
  x.fillText('GIFT VOUCHER · GIDIGBA STUDIOS', 80, 130);
  x.fillStyle = '#fff'; x.font = '800 64px Poppins, Inter, Arial, sans-serif';
  x.fillText(p.name + ' photoshoot', 80, 300);
  x.fillText('is coming your way,', 80, 380);
  x.fillStyle = '#C0F500';
  x.fillText(recipient.toUpperCase() + '.', 80, 470);
  x.fillStyle = '#bdbdbd'; x.font = '400 34px Inter, Arial, sans-serif';
  x.fillText('Occasion: ' + occasion, 80, 560);
  x.fillText('Value: GH₵ ' + p.price + ' · ' + p.features.join(', '), 80, 610);
  x.fillStyle = '#8f8f8f'; x.font = '400 30px Inter, Arial, sans-serif';
  x.fillText('From: ' + sender, 80, 670);
  x.fillStyle = 'rgba(192,245,45,.12)';
  x.fillRect(80, 730, W - 160, 110);
  x.fillStyle = '#C0F500'; x.font = '800 44px Poppins, Inter, Arial, sans-serif';
  x.fillText(code, 110, 800);
  x.fillStyle = '#fff'; x.font = '400 28px Inter, Arial, sans-serif';
  x.fillText('Redeem on WhatsApp · +233 53 431 7611', 80, 930);
  x.fillStyle = '#5c5c5c'; x.font = '400 24px Inter, Arial, sans-serif';
  x.fillText('100% online photoshoot · Accra, Ghana · Valid 6 months', 80, 975);

  try {
    const a = document.createElement('a');
    a.download = 'gidigba-voucher-' + code.toLowerCase() + '.png';
    a.href = c.toDataURL('image/png');
    a.click();
  } catch (e) {}
  const out = document.getElementById('voucherOut');
  if (out) {
    out.innerHTML = `
      <div class="voucher-code">
        <span>Voucher code</span>
        <strong>${code}</strong>
        <p>${esc(recipient)} · ${esc(p.name)} · GH₵ ${p.price}</p>
        <div class="quiz-actions">
          <a class="btn btn-primary btn-sm" href="https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('Hello GIDIGBA STUDIOS! 🎁 I\u2019m redeeming a gift voucher.\nCode: ' + code + '\nPackage: ' + p.name + ' (GH₵ ' + p.price + ')\nFor: ' + recipient + '\nFrom: ' + sender + '\nOccasion: ' + occasion)}" target="_blank" rel="noopener">Redeem on WhatsApp</a>
        </div>
      </div>`;
  }
  toast('Voucher downloaded — send it to ' + recipient + ' 🎁');
}

/* ============================================================
   PWA
   ============================================================ */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}

let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const bar = document.getElementById('installBar');
  if (bar) bar.classList.add('show');
});
const installBtn = document.getElementById('installBtn');
if (installBtn) {
  installBtn.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') document.getElementById('installBar')?.classList.remove('show');
      deferredPrompt = null;
    }
  });
}
window.addEventListener('appinstalled', () => {
  document.getElementById('installBar')?.classList.remove('show');
});
