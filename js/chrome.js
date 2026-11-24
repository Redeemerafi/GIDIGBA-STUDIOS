/* ============================================================
   GIDIGBA STUDIOS — shared page shell
   Header, mobile menu, footer and sticky bar generated once, so the
   pages behave like the comparison build's but stay consistent.
   Their styles.css is used untouched; everything here renders the
   same markup their pages had hard-coded.
   ============================================================ */

const SITE = {
  name: 'GIDIGBA STUDIOS',
  tagline: 'Developed specially for businesses.',
  waDisplay: '+233 53 431 7611',
  wa: '233534317611',
  city: 'Accra, Ghana'
};

/* exactly their five nav items, in their order */
const NAV = [
  { key: 'home',        href: 'index.html',       label: 'Home' },
  { key: 'photoshoots', href: 'photoshoots.html', label: 'Photoshoots' },
  { key: 'services',    href: 'services.html',    label: 'Services' },
  { key: 'samples',     href: 'work.html',        label: 'Work' },
  { key: 'about',       href: 'about.html',       label: 'About' }
];

/* exactly their two footer columns */
/* Their five pages each carry a different Contact column. Reproduced per page
   so the port matches the source exactly; pages they never had get the
   homepage variant. */
const CONTACT_WA = ['WhatsApp +233 53 431 7611', 'https://wa.me/233534317611'];
const CONTACT_BOOK = ['Book a session', 'photoshoots.html'];
const CONTACT_HOURS = 'Open 8am – 8pm';
const CONTACT_BY_PAGE = {
  home:        [CONTACT_WA, CONTACT_BOOK, CONTACT_HOURS],
  photoshoots: [CONTACT_WA, CONTACT_HOURS],
  services:    [CONTACT_WA],
  samples:     [CONTACT_WA],   /* their Work page — and our samples pages */
  about:       [CONTACT_WA]
};

function footerContact() {
  const key = document.body.dataset.page || 'index';
  const variants = CONTACT_BY_PAGE[key] || [CONTACT_WA, CONTACT_BOOK, CONTACT_HOURS];
  return variants.map(v =>
    typeof v === 'string'
      ? `<p style="margin-top:12px;opacity:.6">${v}</p>`
      : `<a href="${v[1]}"${v[1].startsWith('http') ? ' target="_blank" rel="noopener"' : ''}>${v[0]}</a>`
  ).join('\n          ');
}

/* Every page we publish is reachable from here. Their build had a two-column
   footer, which left samples, journal, voucher, track, brands and the three
   industry pages with no inbound link at all. The grid handles four. */
const FOOTER_NAV = [
  { title: 'Studio',  links: [['About', 'about.html'], ['Services', 'services.html'],
                              ['Photoshoots', 'photoshoots.html'], ['Work', 'work.html']] },
  { title: 'Prices',  links: [['Individuals', 'photoshoots-individual.html'],
                              ['Couples', 'photoshoots-couples.html'],
                              ['Single edits', 'photoshoots-editing.html'],
                              ['Voucher', 'voucher.html'], ['Track order', 'track.html']] },
  { title: 'More',    links: [['Work samples', 'samples.html'],
                              ['Samples — women', 'samples-female.html'],
                              ['Samples — men', 'samples-male.html'],
                              ['Samples — children', 'samples-child.html'],
                              ['Samples — couples', 'samples-couple.html'],
                              ['Journal', 'journal.html'], ['Reviews', 'reviews.html'],
                              ['Brands', 'brands.html']] },
  { title: 'For business', links: [['Restaurants', 'for-restaurants.html'],
                                   ['Real estate', 'for-real-estate.html'],
                                   ['Events', 'for-events.html']] },
  { title: 'Contact', links: [] }
];

function chromeTop() {
  const current = document.body.dataset.page || '';
  const links = NAV.map(l =>
    `<a href="${l.href}"${current === l.key ? ' class="active" aria-current="page"' : ''}>${l.label}</a>`
  ).join('\n        ');
  const mobile = NAV.map(l =>
    `<a href="${l.href}" onclick="closeMenu()">${l.label}</a>`
  ).join('\n    ');

  return `
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header">
    <div class="nav-inner">
      <a href="index.html" class="logo">
        <img src="images/logo-mark.png" alt="" width="36" height="36" />
        <span>GIDIGBA STUDIOS<small>${SITE.tagline}</small></span>
      </a>
      <nav class="nav-links" aria-label="Main">
        ${links}
      </nav>
      <div class="nav-actions">
        <button class="theme-toggle" onclick="toggleTheme()" aria-label="Toggle theme">◐</button>
        <a href="photoshoots.html" class="btn btn-primary btn-sm" style="display:none" id="navBook">Book</a>
        <button class="menu-toggle" onclick="openMenu()" aria-label="Open menu" aria-expanded="false">☰</button>
      </div>
    </div>
  </header>

  <div class="mobile-nav" id="mobileNav" hidden>
    <div class="mobile-nav-head">
      <span class="logo">GIDIGBA</span>
      <button class="modal-close" onclick="closeMenu()" aria-label="Close menu">✕</button>
    </div>
    ${mobile}
    <a href="photoshoots.html" class="btn btn-primary btn-block" style="margin-top:20px" onclick="closeMenu()">Book a Photoshoot</a>
  </div>`;
}

function chromeBottom() {
  const cols = FOOTER_NAV.map(c => `
        <div class="footer-col">
          <h4>${c.title}</h4>
          ${c.title === 'Contact' ? footerContact() : c.links.map(([label, href]) =>
            `<a href="${href}">${label}</a>`
          ).join('\n          ')}
        </div>`).join('');

  return `
  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <a href="index.html" class="logo">
            <img src="images/logo-mark.png" alt="" width="36" height="36" />
            <span>GIDIGBA STUDIOS<small>${SITE.tagline}</small></span>
          </a>
          <p>Creative production, digital growth and 100% online photoshoots. Based in ${SITE.city}.</p>
        </div>
        ${cols}
      </div>
      <div class="footer-bottom">
        <span>© 2026 GIDIGBA STUDIOS · Accra, Ghana</span>
      </div>
    </div>
  </footer>

`;
}

function injectHead() {
  const key = document.body.dataset.page || 'home';
  const nav = NAV.find(n => n.key === key);
  const title = document.body.dataset.title || (nav ? `${nav.label} | ${SITE.name}` : `${SITE.name} | ${SITE.tagline}`);
  const desc = document.body.dataset.desc || 'GIDIGBA STUDIOS — Accra creative studio. 100% online photoshoots from GH₵15, delivered within 24 business hours.';
  if (!document.title) document.title = title;
  const ensure = (sel, make) => { if (!document.head.querySelector(sel)) document.head.insertAdjacentHTML('beforeend', make()); };
  ensure('meta[name="description"]', () => `<meta name="description" content="${desc}">`);
  ensure('meta[name="theme-color"]', () => '<meta name="theme-color" content="#C0F500">');
  ensure('link[rel="icon"]', () => '<link rel="icon" href="images/favicon.ico" sizes="any">');
  ensure('meta[property="og:title"]', () => `<meta property="og:title" content="${title}">`);
  ensure('meta[property="og:image"]', () => '<meta property="og:image" content="images/og-image.jpg">');
  ensure('link[href*="fonts.googleapis"]', () => '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet">');
}

function wireShell() {
  injectHead();

  const top = document.getElementById('chrome-top');
  if (top) top.innerHTML = chromeTop();
  // pages that open on a dark hero need a white header, not a black one
  const first = document.querySelector('#main > section');
  if (first && (first.classList.contains('page-hero') || first.classList.contains('hero'))) {
    document.body.dataset.darkHero = '1';
  }

  const bottom = document.getElementById('chrome-bottom');
  if (bottom) bottom.innerHTML = chromeBottom();

  // the nav Book button appears once the page moves
  const navBook = document.getElementById('navBook');
  if (navBook) {
    const onScroll = () => navBook.classList.toggle('is-visible', window.scrollY > 200);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // hide the sticky bar once the footer is in view
  const bar = document.getElementById('stickyBar');
  if (bar && 'IntersectionObserver' in window) {
    const foot = document.querySelector('.site-footer');
    if (foot) new IntersectionObserver(([e]) => {
      bar.classList.toggle('is-hidden', e.isIntersecting);
    }, { threshold: 0.15 }).observe(foot);
  }

  // reveal-on-scroll, with a fallback so nothing stays invisible
  const items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    items.forEach(i => i.classList.add('in'));
  } else {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -8% 0px' });
    items.forEach(i => io.observe(i));
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', wireShell);
} else {
  wireShell();
}

/* ---------- theme + menu ---------- */
function toggleTheme() {
  const root = document.documentElement;
  const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  try { localStorage.setItem('gidigba_theme', next); } catch (e) {}
}

function openMenu() {
  const m = document.getElementById('mobileNav');
  if (!m) return;
  m.hidden = false;
  m.classList.add('open');
  document.body.style.overflow = 'hidden';
  const b = document.querySelector('.menu-toggle');
  if (b) b.setAttribute('aria-expanded', 'true');
}

function closeMenu() {
  const m = document.getElementById('mobileNav');
  if (!m) return;
  m.classList.remove('open');
  m.hidden = true;
  document.body.style.overflow = '';
  const b = document.querySelector('.menu-toggle');
  if (b) b.setAttribute('aria-expanded', 'false');
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

/* ---------- offline ---------- */
/* Service worker: network-first, so design changes show on the next reload.
   updateViaCache:'none' stops the browser serving a stale sw.js itself. */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' })
      .then(reg => reg.update().catch(() => {}))
      .catch(() => {});
  });
}
