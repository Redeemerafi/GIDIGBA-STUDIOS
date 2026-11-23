/* ============================================================
   GIDIGBA STUDIOS — shared page shell
   One source of truth for head tags, header, mobile menu and footer.
   Every page declares:
     <body data-page="track">
     <div id="chrome-top"></div> ... <div id="chrome-bottom"></div>
   Adding a page means adding one entry to NAV, never editing 16 files.
   ============================================================ */

const SITE = {
  name: 'GIDIGBA STUDIOS',
  tagline: 'Developed specially for businesses.',
  waDisplay: '+233 53 431 7611',
  wa: '233534317611',
  city: 'Accra, Ghana'
};

const NAV = [
  { key: 'home',        href: 'index.html',         label: 'Home' },
  { key: 'photoshoots', href: 'photoshoots.html',   label: 'Photoshoots' },
  { key: 'samples',     href: 'work.html',          label: 'Samples' },
  { key: 'services',    href: 'services.html',      label: 'Services' },
  { key: 'about',       href: 'about.html',         label: 'About' }
];

const FOOTER_NAV = [
  { title: 'Studio',  links: [['About', 'about.html'], ['Services', 'services.html'], ['Photoshoots', 'photoshoots.html'], ['Samples', 'work.html']] },
  { title: 'Book',    links: [['Start a Photoshoot', 'photoshoots.html'], ['Gift a Voucher', 'voucher.html'], ['Track Your Order', 'track.html'], ['Reviews', 'reviews.html']] },
  { title: 'More',    links: [['Journal', 'journal.html'], ['Brands', 'brands.html'], ['Restaurants', 'for-restaurants.html'], ['Real Estate', 'for-real-estate.html'], ['Events', 'for-events.html']] }
];

function chromeHead(pageTitle, description, pageKey) {
  return `
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${pageTitle}</title>
  <meta name="description" content="${description}" />
  <meta name="theme-color" content="#C0F500" />
  <link rel="icon" href="images/favicon.ico" sizes="any" />
  <link rel="icon" type="image/png" href="images/favicon-96.png" sizes="96x96" />
  <link rel="apple-touch-icon" href="images/logo-192.png" />
  <meta property="og:title" content="${pageTitle}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="images/og-image.jpg" />
  <meta property="og:type" content="website" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet" />
  <script>document.documentElement.setAttribute('data-theme',(function(){try{return localStorage.getItem('gidigba_theme')==='dark'?'dark':'light'}catch(e){return'light'}})());</script>
  <link rel="stylesheet" href="css/styles.css" />
  <script>document.documentElement.className=document.documentElement.className.replace('no-js','js');</script>`;
}

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
  <header class="site-header" role="banner">
    <div class="nav-inner">
      <a href="index.html" class="logo">
        <img src="images/logo-mark.png" alt="" width="36" height="36" />
        <span>GIDIGBA STUDIOS<small>${SITE.tagline}</small></span>
      </a>
      <nav class="nav-links" aria-label="Main">
        ${links}
      </nav>
      <div class="nav-actions">
        <button class="theme-toggle" onclick="toggleTheme()" aria-label="Switch theme">◐</button>
        <a href="photoshoots.html" class="btn btn-primary btn-sm nav-book">Book</a>
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
          <h2 class="footer-h">${c.title}</h2>
          ${c.links.map(([label, href]) => `<a href="${href}">${label}</a>`).join('\n          ')}
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
        <div class="footer-col">
          <h2 class="footer-h">Contact</h2>
          <a href="https://wa.me/${SITE.wa}" target="_blank" rel="noopener">WhatsApp ${SITE.waDisplay}</a>
          <a href="track.html">Track your order</a>
          <a href="reviews.html">Reviews &amp; FAQ</a>
        </div>
        ${cols}
      </div>
      <div class="footer-bottom">
        <span>© ${new Date().getFullYear()} ${SITE.name}. All rights reserved.</span>
        <span>100% online · Delivered within 24 business hours</span>
      </div>
    </div>
  </footer>

  <aside class="sticky-bar" id="stickyBar" aria-label="Book a session">
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

/* ---------- page shell wiring ---------- */
function injectHead() {
  // pages may declare their own title/description via data attributes; otherwise use the nav label
  const key  = document.body.dataset.page || 'home';
  const nav  = NAV.find(n => n.key === key);
  const title = document.body.dataset.title || (nav ? `${nav.label} | ${SITE.name}` : `${SITE.name} | ${SITE.tagline}`);
  const desc  = document.body.dataset.desc || 'GIDIGBA STUDIOS — Accra creative studio. 100% online photoshoots from GH₵15, delivered within 24 business hours.';
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

  const burger = document.querySelector('.menu-toggle');
  if (burger) burger.setAttribute('aria-expanded', 'false');

  // hide the sticky bar once the footer is in view
  const bar = document.getElementById('stickyBar');
  if (bar && 'IntersectionObserver' in window) {
    const foot = document.querySelector('.site-footer');
    if (foot) new IntersectionObserver(([e]) => {
      bar.classList.toggle('is-hidden', e.isIntersecting);
    }, { threshold: 0.15 }).observe(foot);
  }

  // reveal-on-scroll, with a no-observer fallback so nothing stays invisible
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

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeMenu();
});

/* ---------- offline ---------- */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
