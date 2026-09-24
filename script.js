/* ============================================================
   GIDIGBA STUDIOS — SCRIPT
   Multi-page site: shared chrome + booking flows
   ============================================================ */

// ---- Config ----
// NOTE: key already public in the original repo — restrict it to your domain
// in the imgbb dashboard, or move uploads server-side.
const IMGBB_KEY = 'dbc0dad2f83bf9f24d8abad5e0afd3d1';
const WA_NUMBER = '233534317611';

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
      <span class="logo-mark">G</span>
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
      <div class="step active" data-step="1"><span>1</span><em>Package</em></div>
      <div class="step" data-step="2"><span>2</span><em>Type</em></div>
      <div class="step" data-step="3"><span>3</span><em>Look</em></div>
      <div class="step" data-step="4"><span>4</span><em>Date</em></div>
      <div class="step" data-step="5"><span>5</span><em>Details</em></div>
      <div class="step" data-step="6"><span>6</span><em>Photos</em></div>
      <div class="step" data-step="7"><span>7</span><em>Review</em></div>
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
          <span class="logo-mark">G</span>
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

<div class="install-bar" id="installBar">
  <span>📸 Install GIDIGBA for instant access</span>
  <button id="installBtn">Install</button>
</div>`;

const chromeTop = document.getElementById('chrome-top');
if (chromeTop) chromeTop.innerHTML = CHROME_TOP;
const chromeBottom = document.getElementById('chrome-bottom');
if (chromeBottom) chromeBottom.innerHTML = CHROME_BOTTOM;

// ---- Year ----
const yearEl = document.getElementById('year');
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
    desc: '100% online photoshoots: birthdays, graduations, portraits, headshots, couples and personal-brand looks. Upload photos, get images on WhatsApp in 4 hours.',
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
  { title: 'Social Media Management', caption: 'Ongoing content & growth', cat: 'business', wi: 1, img: 'images/work-social.jpg' },
  { title: 'Brand Film Rollout', caption: 'Campaign series', cat: 'business', wi: 2, img: 'images/work-film.jpg' },
  { title: 'Engagement System', caption: 'Digital marketing sprint', cat: 'business', wi: 3, img: 'images/work-engagement.jpg' },
  { title: 'Product Photography', caption: 'Online commercial visuals', cat: 'business', wi: 4, img: 'images/work-product.jpg' },
  { title: 'Digital Marketing Sprint', caption: 'Paid acquisition', cat: 'business', wi: 5, img: 'images/work-digital.jpg' },
  { title: 'Fashion Brand Visuals', caption: 'Lookbook & campaign', cat: 'business', wi: 6, img: 'images/work-fashion.jpg' },
  { title: 'Food Brand Content', caption: 'Library + launch', cat: 'business', wi: 7, img: 'images/work-food.jpg' },
  { title: 'Graduation Portrait', caption: 'Online photoshoot look', cat: 'personal', wi: 8, img: 'images/work-grad.jpg' },
  { title: 'Birthday Session', caption: 'Studio-style recreation', cat: 'personal', wi: 9, img: 'images/work-birthday.jpg' },
  { title: 'Professional Headshot', caption: 'Remote headshot set', cat: 'personal', wi: 10, img: 'images/work-headshot.jpg' },
  { title: 'Personal Brand Portrait', caption: 'Founder look', cat: 'personal', wi: 11, img: 'images/work-brand.jpg' },
  { title: 'Outdoor Lifestyle Session', caption: 'Outdoor-style scene', cat: 'personal', wi: 12, img: 'images/work-couple.jpg' },
  { title: 'Studio Fashion Portrait', caption: 'Creative recreation', cat: 'personal', wi: 13, img: 'images/work-studio-fashion.jpg' },
];

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
      <div class="work-info"><h4>${esc(w.title)}</h4><p>${esc(w.caption)}</p></div>`;
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
const PACKAGES = [
  { name: 'SILVER', price: 55, outfits: 1, type: 'individual', features: ['3 Photos', '1 Outfit', 'Basic editing'] },
  { name: 'GOLD', price: 100, outfits: 2, type: 'individual', features: ['6 Photos', '2 Outfits', 'Premium editing'] },
  { name: 'PLATINUM', price: 150, outfits: 3, type: 'individual', features: ['9 Photos', '3 Outfits', 'Custom Background', 'Priority 2h delivery'] },
  { name: 'COUPLE SILVER', price: 120, outfits: 1, type: 'couple', features: ['3 images', '1 outfit each', 'Studio layout'] },
  { name: 'COUPLE GOLD', price: 230, outfits: 2, type: 'couple', features: ['4 images', '2 outfits each', 'Creative scene'] },
  { name: 'COUPLE PLATINUM', price: 350, outfits: 3, type: 'couple', features: ['6 images', '3 outfits each', 'Premium concepts'] },
];
const SERVICES_EDIT = [
  { name: 'Basic Retouch', price: 30 }, { name: 'Advanced Retouch', price: 50 }, { name: 'Outfit Change', price: 15 },
  { name: 'Hairstyle Change', price: 15 }, { name: 'Makeup Application', price: 20 }, { name: 'Pose Adjustment', price: 10 },
  { name: 'Background Change', price: 10 }, { name: 'Two People Combined', price: 50 }, { name: 'Object Removal', price: 20 },
  { name: 'Full Scene Replacement', price: 50 }, { name: 'Cartoon Style', price: 40 }, { name: 'Sky Enhancement', price: 30 },
];

let pkgTab = 'individual';
function renderPkgGrid() {
  const grid = document.getElementById('pkgGrid');
  if (!grid) return;
  grid.innerHTML = PACKAGES.filter(p => p.type === pkgTab).map(p => `
    <div class="pkg-card reveal" onclick="openPhotoBooking('${p.name}')">
      ${p.name.includes('PLATINUM') ? '<span class="pkg-badge">Priority</span>' : ''}
      <div class="pkg-name">${p.name}</div>
      <div class="pkg-price">GH₵ ${p.price} <small>one-time</small></div>
      <ul>${p.features.map(f => `<li>${esc(f)}</li>`).join('')}</ul>
      <span class="pkg-book">Book ${p.name} →</span>
    </div>`).join('');
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
    inspiration: []
  };
}
let booking = { step: 1, data: freshBookingData() };
let sourceFiles = {};

function getSelectedPackage() {
  return PACKAGES.find(p => p.name === booking.data.selectedPackage) || null;
}
function getCustomTotal() {
  return booking.data.selectedServices.reduce((s, i) => s + SERVICES_EDIT[i].price, 0);
}
function getOutfitCount() {
  const pkg = getSelectedPackage();
  if (booking.data.orderType === 'photoshoot') return pkg ? pkg.outfits : 1;
  return booking.data.selectedServices.some(i => SERVICES_EDIT[i].name === 'Outfit Change') ? 1 : 0;
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
    if (step > 5) step = 5;
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
    booking.step = 1;
  }
  if (packageName) {
    const pkg = PACKAGES.find(p => p.name === packageName);
    if (pkg) {
      booking.data = { ...freshBookingData(), fullName: booking.data.fullName, phone: booking.data.phone, email: booking.data.email };
      booking.data.selectedPackage = pkg.name;
      booking.data.pkgType = pkg.type;
      booking.data.orderType = 'photoshoot';
      if (pkg.type === 'couple') booking.data.photoType = 'couple';
      booking.data.turnaround = pkg.name.includes('PLATINUM') ? 'priority' : 'standard';
      booking.step = draft && draft.step > 1 && draft.data.selectedPackage === pkg.name ? draft.step : 2;
    }
  }
  renderPhotoStep();
  updateBookingSteps();
  openModal('photoModal');
  if (draft && !packageName && booking.step > 1) toast('Draft restored — continue where you left off');
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
  if (booking.step === 7) {
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
  if (booking.step === 7) {
    if (!validateStep(6)) { booking.step = 6; renderPhotoStep(); updateBookingSteps(); return; }
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
    if (d.orderType === 'photoshoot' && !d.selectedPackage) { toast('Select a package to continue', false); return false; }
    if (d.orderType === 'custom' && d.selectedServices.length === 0) { toast('Select at least one service', false); return false; }
  }
  if (step === 2 && !d.photoType) { toast('Select a photoshoot type', false); return false; }
  if (step === 3 && !d.look) { toast('Select your preferred look', false); return false; }
  if (step === 4) {
    if (!d.prefDate) { toast('Choose your preferred delivery date', false); return false; }
    if (!d.prefTime) { toast('Choose a preferred time', false); return false; }
    if (!d.turnaround) { toast('Choose a turnaround', false); return false; }
  }
  if (step === 5) {
    if (!d.fullName || !d.phone || !d.email) { toast('Fill in your name, phone and email', false); return false; }
  }
  if (step === 6) {
    const d6 = booking.data;
    if (d6.orderType === 'photoshoot') {
      if (!sourceFiles.selfie) { toast('Upload your selfie (required)', false); return false; }
      if (!sourceFiles.fullbody) { toast('Upload a full-body photo (required)', false); return false; }
      if (!d6.hairstyle1.trim()) { toast('Describe your desired hairstyle', false); return false; }
      if (isCouplePkg()) {
        if (!sourceFiles.partnerSelfie) { toast("Upload partner's selfie", false); return false; }
        if (!sourceFiles.partnerFull) { toast("Upload partner's full-body photo", false); return false; }
        if (!d6.hairstyle2.trim()) { toast("Describe partner's hairstyle", false); return false; }
      }
      const needVision = getSelectedPackage()?.name.includes('PLATINUM');
      if (needVision && !d6.vision.trim()) { toast('Describe your custom background (Platinum)', false); return false; }
    } else {
      if (!sourceFiles.editImage) { toast('Upload the image to edit (required)', false); return false; }
      const names = d6.selectedServices.map(i => SERVICES_EDIT[i].name);
      if (names.includes('Background Change') || names.includes('Full Scene Replacement')) {
        if (!d6.vision.trim()) { toast('Describe the background/scene', false); return false; }
      }
      if (names.includes('Hairstyle Change') && !d6.hairstyle1.trim()) { toast('Describe the hairstyle change', false); return false; }
    }
    if (!d6.disclaimerOk) { toast('Please acknowledge the software-assistance notice', false); return false; }
  }
  return true;
}

function renderPhotoStep() {
  const c = document.getElementById('photoBookingContainer');
  if (!c) return;
  const d = booking.data;
  let html = '';

  if (booking.step === 1) {
    if (d.orderType === 'photoshoot') {
      html = `
      <div class="step-pane active">
        <span class="modal-label">Step 1 of 7</span>
        <h4>Choose your package</h4>
        <p class="step-hint">All packages are delivered fully online — upload photos, receive images on WhatsApp. Prices in Ghana Cedis.</p>
        <div class="tabs" style="margin-bottom:16px;">
          <button class="tab ${d.pkgType === 'individual' ? 'active' : ''}" onclick="setBookingPkgType('individual')">Individual</button>
          <button class="tab ${d.pkgType === 'couple' ? 'active' : ''}" onclick="setBookingPkgType('couple')">Couple</button>
        </div>
        <div class="pkg-mini-grid">
          ${PACKAGES.filter(p => p.type === d.pkgType).map(p => `
            <div class="pkg-mini ${d.selectedPackage === p.name ? 'selected' : ''}" onclick="selectBookingPackage('${p.name}')">
              <div class="pm-name">${p.name}</div>
              <div class="pm-price">GH₵ ${p.price}</div>
              <div class="pm-feats">${p.features.join(' · ')}</div>
            </div>`).join('')}
        </div>
        <div style="margin-top:14px; text-align:center;">
          <button class="btn btn-ghost btn-sm" onclick="switchToCustomEdit()">✨ Or build a Custom Edit instead →</button>
        </div>
      </div>`;
    } else {
      html = `
      <div class="step-pane active">
        <span class="modal-label">Step 1 of 7 · Custom Edit</span>
        <h4>Select your services</h4>
        <p class="step-hint">Pay for what you need. Swipe to browse — everything runs fully online.</p>
        <div class="svc-scroll">
          ${SERVICES_EDIT.map((s, i) => `
            <div class="svc-chip ${d.selectedServices.includes(i) ? 'selected' : ''}" onclick="toggleEditService(${i})">
              <div class="svc-price">GH₵ ${s.price}</div>
              <h5>${esc(s.name)}</h5>
              <div class="svc-check">${d.selectedServices.includes(i) ? '✓ Selected' : 'Tap to add'}</div>
            </div>`).join('')}
        </div>
        <div class="total-bar"><span>Total</span><strong>GH₵ ${getCustomTotal()}</strong></div>
        <div style="margin-top:14px; text-align:center;">
          <button class="btn btn-ghost btn-sm" onclick="switchToPackageEdit()">📦 Or choose a Package instead →</button>
        </div>
      </div>`;
    }
  }

  else if (booking.step === 2) {
    html = `
      <div class="step-pane active">
        <span class="modal-label">Step 2 of 7</span>
        <h4>What kind of photoshoot?</h4>
        <p class="step-hint">Pick the occasion or look. We recreate the scene from your uploaded photos — fully online.</p>
        <div class="option-grid" id="photoTypeGrid">
          ${PHOTO_TYPES.map(t => `
            <div class="option-card ${d.photoType === t.id ? 'selected' : ''}" data-type="${t.id}">
              <span class="opt-emoji">${t.emoji}</span><span>${t.label}</span>
            </div>`).join('')}
        </div>
      </div>`;
  }

  else if (booking.step === 3) {
    html = `
      <div class="step-pane active">
        <span class="modal-label">Step 3 of 7</span>
        <h4>What setting should we create?</h4>
        <p class="step-hint">These are virtual looks built into your images — not physical locations. There are no in-person sessions.</p>
        <div class="option-grid" id="lookGrid" style="grid-template-columns: repeat(auto-fill, minmax(175px, 1fr));">
          ${LOOK_PREFS.map(s => `
            <div class="option-card ${d.look === s.id ? 'selected' : ''}" data-look="${s.id}">
              <span class="opt-emoji">${s.emoji}</span><span>${s.label}</span>
            </div>`).join('')}
        </div>
      </div>`;
  }

  else if (booking.step === 4) {
    const pkg = getSelectedPackage();
    const isPriority = pkg?.name.includes('PLATINUM');
    html = `
      <div class="step-pane active">
        <span class="modal-label">Step 4 of 7</span>
        <h4>When do you need your images?</h4>
        <p class="step-hint">Standard delivery is within 4 hours of order confirmation (2h priority on Platinum). Delivery slots are confirmed by GIDIGBA STUDIOS once your order is submitted.</p>
        <div class="form" style="gap:16px;">
          <div class="form-row">
            <div class="form-group"><label>Preferred date *</label><input type="date" id="prefDate" value="${esc(d.prefDate)}" /></div>
            <div class="form-group"><label>Alternative date</label><input type="date" id="altDate" value="${esc(d.altDate)}" /></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Preferred time *</label><input type="time" id="prefTime" value="${esc(d.prefTime)}" /></div>
            <div class="form-group">
              <label>Turnaround *</label>
              <select id="turnaround">
                <option value="">Select</option>
                <option value="standard" ${d.turnaround === 'standard' ? 'selected' : ''}>Standard — within 4 hours</option>
                <option value="priority" ${d.turnaround === 'priority' ? 'selected' : ''}>Priority — within 2 hours (Platinum)</option>
                <option value="flexible" ${d.turnaround === 'flexible' ? 'selected' : ''}>Flexible — no rush</option>
              </select>
              ${isPriority && d.turnaround !== 'priority' ? '<span class="form-hint">Platinum includes priority 2h — recommended.</span>' : ''}
            </div>
          </div>
        </div>
      </div>`;
  }

  else if (booking.step === 5) {
    const typeLabel = PHOTO_TYPES.find(t => t.id === d.photoType)?.label || '';
    html = `
      <div class="step-pane active">
        <span class="modal-label">Step 5 of 7</span>
        <h4>Tell us about the shoot</h4>
        <p class="step-hint">A few details so we can build the right look for you. No address needed — this service is 100% online.</p>
        <div class="form" style="gap:16px;">
          <div class="form-row">
            <div class="form-group"><label>Full name *</label><input type="text" id="fullName" value="${esc(d.fullName)}" placeholder="Your name" /></div>
            <div class="form-group"><label>Phone number *</label><input type="tel" id="phone" value="${esc(d.phone)}" placeholder="+233 ..." /></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Email address *</label><input type="email" id="email" value="${esc(d.email)}" placeholder="you@email.com" /></div>
            <div class="form-group"><label>Type of photography</label><input type="text" value="${esc(typeLabel)}" readonly /></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Number of people</label><input type="number" id="peopleCount" value="${esc(d.peopleCount)}" min="1" placeholder="${isCouplePkg() ? '2' : '1'}" /></div>
            <div class="form-group">
              <label>Intended use of photos</label>
              <select id="intendedUse">
                <option value="">Select</option>
                ${['Personal keepsake', 'Social media', 'Professional / LinkedIn', 'Personal branding', 'Portfolio', 'Family album', 'Anniversary / gift', 'Other']
                  .map(o => `<option ${d.intendedUse === o ? 'selected' : ''}>${o}</option>`).join('')}
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>Describe your outfit(s) ${getOutfitCount() > 0 ? `· ${getOutfitCount()} outfit${getOutfitCount() > 1 ? 's' : ''}` : ''}</label>
            <textarea id="outfitDesc" rows="2" placeholder="e.g. Gold kente cloth, white sundress, navy suit...">${esc(d.outfitDesc)}</textarea>
          </div>
          <div class="form-group">
            <label>Desired mood or visual style</label>
            <input type="text" id="mood" value="${esc(d.mood)}" placeholder="e.g. warm & candid, editorial, moody, bright & minimal" />
          </div>
          <div class="form-group">
            <label>Additional notes</label>
            <textarea id="notes" rows="3" placeholder="Anything else we should know?">${esc(d.notes)}</textarea>
          </div>
        </div>
      </div>`;
  }

  else if (booking.step === 6) {
    const isPhotoshoot = d.orderType === 'photoshoot';
    const couple = isCouplePkg();
    const needVision = isPhotoshoot
      ? getSelectedPackage()?.name.includes('PLATINUM')
      : d.selectedServices.some(i => ['Background Change', 'Full Scene Replacement'].includes(SERVICES_EDIT[i].name));
    const needMakeup = !isPhotoshoot
      ? d.selectedServices.some(i => SERVICES_EDIT[i].name === 'Makeup Application')
      : true;

    const upBox = (key, label, sub) => `
      <label class="upload-box ${sourceFiles[key] ? 'filled' : ''}" data-key="${key}">
        <input type="file" accept="image/*" capture="environment" />
        <div class="ub-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg></div>
        <p>${label}</p><small>${sub}</small>
        <div class="ub-check">✓ Ready</div>
        <img class="ub-preview" alt="preview" />
      </label>`;

    const inspSlots = Array.from({ length: 4 }).map((_, i) => {
      const img = d.inspiration[i];
      if (img) {
        return `<div class="insp-slot"><span class="remove-insp" data-idx="${i}">&times;</span><img src="${img.dataUrl}" alt="ref ${i + 1}" /></div>`;
      }
      return `<label class="insp-slot" data-insp="${i}">+ Ref ${i + 1}</label>`;
    }).join('');

    html = `
      <div class="step-pane active">
        <span class="modal-label">Step 6 of 7</span>
        <h4>Upload your photos</h4>
        <p class="step-hint">Clear selfies and full-body photos give the best results. Add up to 4 inspiration refs. ${isPhotoshoot ? '' : 'This is the image we will edit.'}</p>

        <div class="upload-grid">
          ${isPhotoshoot ? `
            ${upBox('selfie', 'Selfie (required)', 'Face clearly visible')}
            ${upBox('fullbody', 'Full body (required)', 'Head to toe')}
            ${couple ? upBox('partnerSelfie', 'Partner selfie (required)', "Partner's face") : ''}
            ${couple ? upBox('partnerFull', 'Partner full body (required)', "Partner head to toe") : ''}
          ` : `
            ${upBox('editImage', 'Image to edit (required)', 'The photo you want changed')}
          `}
        </div>

        <div style="margin-top:16px;">
          <div class="form-group">
            <label>${isPhotoshoot ? 'Describe your desired hairstyle *' : 'Hairstyle change description'}</label>
            <textarea id="hairstyle1" rows="2" placeholder="e.g. long braids with gold cuffs, low cut fade...">${esc(d.hairstyle1)}</textarea>
          </div>
          ${couple ? `
            <div class="form-group" style="margin-top:10px;">
              <label>Partner's desired hairstyle *</label>
              <textarea id="hairstyle2" rows="2" placeholder="Describe partner's hairstyle...">${esc(d.hairstyle2)}</textarea>
            </div>` : ''}
          ${needMakeup ? `
            <div class="toggle-row" onclick="toggleMakeup(1)">
              <span>💄 Light makeup touch-up</span>
              <div class="toggle-switch ${d.makeup1 ? 'active' : ''}"></div>
            </div>
            ${couple ? `
            <div class="toggle-row" onclick="toggleMakeup(2)">
              <span>💄 Light makeup — partner</span>
              <div class="toggle-switch ${d.makeup2 ? 'active' : ''}"></div>
            </div>` : ''}` : ''}
          ${needVision ? `
            <div class="form-group" style="margin-top:10px;">
              <label>${isPhotoshoot ? 'Custom background / concept *' : 'Describe background / scene *'}</label>
              <textarea id="vision" rows="2" placeholder="e.g. sunset beach, black studio backdrop, Accra skyline...">${esc(d.vision)}</textarea>
            </div>` : ''}
          ${!isPhotoshoot ? `
            <div class="form-group" style="margin-top:10px;">
              <label>Any additional instructions</label>
              <textarea id="instructions" rows="2" placeholder="Optional extra notes for the editor...">${esc(d.notes)}</textarea>
            </div>` : ''}
        </div>

        <div style="margin-top:18px;">
          <p style="font-size:13px; font-weight:600; margin-bottom:4px;">Inspiration images <span style="color:var(--grey); font-weight:400;">(optional — up to 4)</span></p>
          <p class="step-hint" style="margin-bottom:8px;">Poses, outfits, colour ideas, lighting or editing references.</p>
          <input type="file" id="inspInput" accept="image/*" multiple hidden />
          <div class="inspiration-row">${inspSlots}</div>
        </div>

        <label class="disclaimer-check">
          <input type="checkbox" id="disclaimerOk" ${d.disclaimerOk ? 'checked' : ''} />
          <span><strong>I understand:</strong> these are software-assisted generated images. Minor changes may occur and details may not be 100% real-life accurate. 100% online service — no in-person session. Source images are deleted 20 minutes after delivery.</span>
        </label>
      </div>`;
  }

  else if (booking.step === 7) {
    const d7 = booking.data;
    const pkg = getSelectedPackage();
    const typeLabel = PHOTO_TYPES.find(t => t.id === d7.photoType)?.label || '—';
    const lookLabel = LOOK_PREFS.find(l => l.id === d7.look)?.label || '—';
    const turnaroundLabel = { standard: 'Standard (4h)', priority: 'Priority (2h)', flexible: 'Flexible' }[d7.turnaround] || '—';
    const pkgLine = d7.orderType === 'photoshoot'
      ? `${pkg?.name || '—'} · GH₵ ${pkg?.price || 0}`
      : `Custom Edit · GH₵ ${getCustomTotal()}`;
    const svcLine = d7.orderType === 'custom'
      ? d7.selectedServices.map(i => SERVICES_EDIT[i].name).join(', ')
      : null;
    const srcCount = Object.keys(sourceFiles).length;

    html = `
      <div class="step-pane active">
        <span class="modal-label">Step 7 of 7 — Review</span>
        <h4>Review your booking request</h4>
        <p class="step-hint">Check everything below. Use Back to edit — then send your request to us on WhatsApp.</p>

        <div class="review-block">
          <h5>Order</h5>
          <div class="review-row"><span class="rv-label">Package</span><span class="rv-value">${esc(pkgLine)}</span></div>
          ${svcLine ? `<div class="review-row"><span class="rv-label">Services</span><span class="rv-value">${esc(svcLine)}</span></div>` : ''}
          <div class="review-row"><span class="rv-label">Photoshoot type</span><span class="rv-value">${esc(typeLabel)}</span></div>
          <div class="review-row"><span class="rv-label">Setting</span><span class="rv-value">${esc(lookLabel)}</span></div>
        </div>

        <div class="review-block">
          <h5>Schedule</h5>
          <div class="review-row"><span class="rv-label">Preferred date</span><span class="rv-value">${esc(d7.prefDate || '—')}</span></div>
          <div class="review-row"><span class="rv-label">Alternative date</span><span class="rv-value">${esc(d7.altDate || '—')}</span></div>
          <div class="review-row"><span class="rv-label">Preferred time</span><span class="rv-value">${esc(d7.prefTime || '—')}</span></div>
          <div class="review-row"><span class="rv-label">Turnaround</span><span class="rv-value">${esc(turnaroundLabel)}</span></div>
        </div>

        <div class="review-block">
          <h5>Client &amp; creative</h5>
          <div class="review-row"><span class="rv-label">Name</span><span class="rv-value">${esc(d7.fullName)}</span></div>
          <div class="review-row"><span class="rv-label">Phone</span><span class="rv-value">${esc(d7.phone)}</span></div>
          <div class="review-row"><span class="rv-label">Email</span><span class="rv-value">${esc(d7.email)}</span></div>
          <div class="review-row"><span class="rv-label">People</span><span class="rv-value">${esc(d7.peopleCount || (isCouplePkg() ? '2' : '1'))}</span></div>
          <div class="review-row"><span class="rv-label">Outfits</span><span class="rv-value">${esc(d7.outfitDesc || '—')}</span></div>
          <div class="review-row"><span class="rv-label">Hairstyle</span><span class="rv-value">${esc(d7.hairstyle1 || '—')}${d7.hairstyle2 ? ' / ' + esc(d7.hairstyle2) : ''}</span></div>
          <div class="review-row"><span class="rv-label">Makeup</span><span class="rv-value">${d7.makeup1 ? 'Light' : 'None'}${d7.makeup2 ? ' (partner: Light)' : ''}</span></div>
          ${d7.vision ? `<div class="review-row"><span class="rv-label">Background</span><span class="rv-value">${esc(d7.vision)}</span></div>` : ''}
          <div class="review-row"><span class="rv-label">Mood / style</span><span class="rv-value">${esc(d7.mood || '—')}</span></div>
          <div class="review-row"><span class="rv-label">Intended use</span><span class="rv-value">${esc(d7.intendedUse || '—')}</span></div>
          <div class="review-row"><span class="rv-label">Notes</span><span class="rv-value">${esc(d7.notes || '—')}</span></div>
          <div class="review-row"><span class="rv-label">Photos attached</span><span class="rv-value">${srcCount} source + ${d7.inspiration.length} inspiration</span></div>
        </div>

        <div class="review-note">
          <strong>Note:</strong> Submitting sends a booking request via WhatsApp to GIDIGBA STUDIOS. Your order begins after availability is confirmed and payment (Mobile Money) is completed. This is a 100% online service — software-assisted images, delivered to your WhatsApp.
        </div>
      </div>`;
  }

  c.innerHTML = html;
  attachStepListeners();
}

window.setBookingPkgType = function (type) {
  booking.data.pkgType = type;
  booking.data.selectedPackage = null;
  renderPhotoStep();
};
window.selectBookingPackage = function (name) {
  booking.data.selectedPackage = name;
  const pkg = PACKAGES.find(p => p.name === name);
  if (pkg?.type === 'couple') booking.data.photoType = 'couple';
  if (pkg?.name.includes('PLATINUM') && !booking.data.turnaround) booking.data.turnaround = 'priority';
  renderPhotoStep();
  toast(`Selected ${name}`);
};
window.switchToCustomEdit = function () {
  booking.data.orderType = 'custom';
  renderPhotoStep();
};
window.switchToPackageEdit = function () {
  booking.data.orderType = 'photoshoot';
  renderPhotoStep();
};
window.toggleEditService = function (i) {
  const arr = booking.data.selectedServices;
  const idx = arr.indexOf(i);
  if (idx >= 0) arr.splice(idx, 1); else arr.push(i);
  renderPhotoStep();
};
window.toggleMakeup = function (person) {
  const key = person === 1 ? 'makeup1' : 'makeup2';
  booking.data[key] = !booking.data[key];
  renderPhotoStep();
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
  const lookGrid = document.getElementById('lookGrid');
  if (lookGrid) {
    lookGrid.querySelectorAll('.option-card').forEach(card => {
      card.addEventListener('click', () => {
        booking.data.look = card.dataset.look;
        lookGrid.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
      });
    });
  }
  if (document.getElementById('prefDate')) {
    document.getElementById('prefDate').addEventListener('change', e => booking.data.prefDate = e.target.value);
    document.getElementById('altDate').addEventListener('change', e => booking.data.altDate = e.target.value);
    document.getElementById('prefTime').addEventListener('change', e => booking.data.prefTime = e.target.value);
    document.getElementById('turnaround').addEventListener('change', e => booking.data.turnaround = e.target.value);
  }
  if (document.getElementById('fullName')) {
    const bind = (id, key) => {
      const el = document.getElementById(id);
      if (!el) return;
      const ev = el.tagName === 'SELECT' ? 'change' : 'input';
      el.addEventListener(ev, e => booking.data[key] = e.target.value);
    };
    ['fullName|fullName', 'phone|phone', 'email|email', 'peopleCount|peopleCount',
     'outfitDesc|outfitDesc', 'mood|mood', 'intendedUse|intendedUse', 'notes|notes']
      .forEach(pair => { const [id, key] = pair.split('|'); bind(id, key); });
  }
  if (document.getElementById('inspInput')) {
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
    const bindT = (id, key) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', e => booking.data[key] = e.target.value);
    };
    bindT('hairstyle1', 'hairstyle1');
    bindT('hairstyle2', 'hairstyle2');
    bindT('vision', 'vision');
    bindT('instructions', 'notes');
    const disc = document.getElementById('disclaimerOk');
    if (disc) disc.addEventListener('change', e => booking.data.disclaimerOk = e.target.checked);

    const inspInput = document.getElementById('inspInput');
    document.querySelectorAll('.insp-slot[data-insp]').forEach(slot => {
      slot.addEventListener('click', () => inspInput.click());
    });
    document.querySelectorAll('.remove-insp').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        booking.data.inspiration.splice(parseInt(btn.dataset.idx), 1);
        renderPhotoStep();
      });
    });
    inspInput.addEventListener('change', e => {
      const files = Array.from(e.target.files);
      files.forEach(file => {
        if (booking.data.inspiration.length >= 4) { toast('Max 4 inspiration images', false); return; }
        const r = new FileReader();
        r.onload = ev => {
          booking.data.inspiration.push({ name: file.name, dataUrl: ev.target.result, file });
          renderPhotoStep();
        };
        r.readAsDataURL(file);
      });
      e.target.value = '';
    });
  }
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
    booking.data.inspiration.forEach((img, i) => uploads.push([`inspiration_${i + 1}`, img.file]));

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
    const typeLabel = PHOTO_TYPES.find(t => t.id === d.photoType)?.label || 'N/A';
    const lookLabel = LOOK_PREFS.find(l => l.id === d.look)?.label || 'N/A';
    const turnaroundLabel = { standard: 'Standard (4h)', priority: 'Priority (2h)', flexible: 'Flexible' }[d.turnaround] || 'N/A';

    let msg = `Hello GIDIGBA STUDIOS! 📸\n*New Online Photoshoot Booking Request*\n\n`;
    msg += `*ORDER*\n`;
    if (d.orderType === 'photoshoot') {
      msg += `Package: ${pkg.name} (GH₵ ${pkg.price})\n`;
    } else {
      msg += `Custom Edit (GH₵ ${getCustomTotal()})\nServices: ${d.selectedServices.map(i => SERVICES_EDIT[i].name).join(', ')}\n`;
    }
    msg += `Type: ${typeLabel}\nSetting: ${lookLabel}\n\n`;
    msg += `*SCHEDULE*\nPreferred: ${d.prefDate} ${d.prefTime}\nAlternative: ${d.altDate || '—'}\nTurnaround: ${turnaroundLabel}\n\n`;
    msg += `*CLIENT*\nName: ${d.fullName}\nPhone: ${d.phone}\nEmail: ${d.email}\nPeople: ${d.peopleCount || (isCouplePkg() ? '2' : '1')}\n\n`;
    msg += `*CREATIVE*\nOutfits: ${d.outfitDesc || 'N/A'}\nHairstyle: ${d.hairstyle1 || 'N/A'}\n`;
    if (d.hairstyle2) msg += `Partner hairstyle: ${d.hairstyle2}\n`;
    msg += `Makeup: ${d.makeup1 ? 'Light' : 'None'}${d.makeup2 ? ' / Partner: Light' : ''}\n`;
    if (d.vision) msg += `Background: ${d.vision}\n`;
    msg += `Mood: ${d.mood || 'N/A'}\nUse: ${d.intendedUse || 'N/A'}\nNotes: ${d.notes || 'N/A'}\n\n`;
    msg += `*PHOTOS*\n`;
    Object.entries(urls).forEach(([k, u]) => { msg += `${k}: ${u}\n`; });
    msg += `\n✅ I understand these are software-assisted generated images (minor variations may occur).\n✅ 100% online — no in-person session.\n✅ I've reviewed this request and will complete Mobile Money payment.`;

    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
    toast('Booking request ready in WhatsApp!');
    clearDraft();
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
