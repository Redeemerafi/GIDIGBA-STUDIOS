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
const CONTACT_HOURS = 'Mon–Sat · 08:00–20:00';
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

const FOOTER_NAV = [
  { title: 'Studio',  links: [['About', 'about.html'], ['Services', 'services.html'],
                              ['Photoshoots', 'photoshoots.html'], ['Work', 'work.html']] },
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
        <span>Payment: Mobile Money · Bank Transfer</span>
      </div>
    </div>
  </footer>

  <div class="sticky-bar" id="stickyBar">
    <div class="sb-left">
      <strong>From GH₵15</strong>
      <span>1 image · all-in</span>
    </div>
    <a href="photoshoots.html" class="btn btn-primary btn-sm">Book session</a>
    <a class="sb-wa" href="https://wa.me/${SITE.wa}" target="_blank" rel="noopener" aria-label="WhatsApp us">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.5 14.4c-.3-.2-1.7-.8-2-.9-.3-.1-.5-.2-.7.1-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-.3-.2-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.5-.6c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.2-.7-1.6-.9-2.2-.2-.5-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3 4.7 4.2.7.3 1.2.4 1.6.6.7.2 1.3.2 1.8.1.6-.1 1.7-.7 1.9-1.3.2-.7.2-1.2.2-1.3-.1-.2-.3-.2-.5-.4z"/><path d="M12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.4 1.3 4.8L2 22l5.3-1.4c1.4.8 3 1.2 4.7 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18.2c-1.5 0-2.9-.4-4.1-1.1l-.3-.2-3.1.8.8-3-.2-.3C4.4 15 4 13.5 4 12c0-4.4 3.6-8 8-8s8 3.6 8 8-3.6 8.2-8 8.2z"/></svg>
    </a>
  </div>`;
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
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
