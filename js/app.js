/* GIDIGBA STUDIOS v2 — core interactions + booking wizard
   Repaired from the pasted source:
   - HTML entities (&gt; &lt; &amp;) decoded
   - broken template literals / destructuring restored
   - truncated submitToWhatsApp() completed
   - image uploads now actually reach WhatsApp (they were only kept as blob URLs in memory)
*/
const WA = '233534317611';

/* ---------- theme ---------- */
(function initTheme() {
  let saved = null;
  try { saved = localStorage.getItem('gidigba_theme'); } catch (e) {}
  document.documentElement.setAttribute('data-theme', saved === 'dark' ? 'dark' : 'light');
})();

function toggleTheme() {
  const cur = document.documentElement.getAttribute('data-theme');
  const next = cur === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  try { localStorage.setItem('gidigba_theme', next); } catch (e) {}
}

/* ---------- nav ---------- */
window.addEventListener('scroll', () => {
  const h = document.querySelector('.site-header');
  if (h) h.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

function openMenu() {
  document.getElementById('mobileNav')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeMenu() {
  document.getElementById('mobileNav')?.classList.remove('open');
  document.body.style.overflow = '';
}

/* ---------- reveal ---------- */
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
} else {
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
}

/* ---------- toast ---------- */
function toast(msg, ok = true) {
  let t = document.querySelector('.toast');
  if (!t) {
    t = document.createElement('div');
    t.className = 'toast';
    t.setAttribute('role', 'status');
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.toggle('error', !ok);
  t.classList.add('show');
  clearTimeout(t._tid);
  t._tid = setTimeout(() => t.classList.remove('show'), 3200);
}

/* ---------- before / after slider ---------- */
function initBA() {
  const wrap = document.querySelector('.ba-wrap');
  if (!wrap) return;
  const before = wrap.querySelector('.ba-before');
  const handle = wrap.querySelector('.ba-handle');
  if (!before || !handle) return;
  let dragging = false;

  function setPos(x) {
    const r = wrap.getBoundingClientRect();
    let pct = ((x - r.left) / r.width) * 100;
    pct = Math.max(5, Math.min(95, pct));
    before.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
    handle.style.left = pct + '%';
  }
  handle.addEventListener('pointerdown', e => { dragging = true; handle.setPointerCapture(e.pointerId); });
  handle.addEventListener('pointermove', e => { if (dragging) setPos(e.clientX); });
  handle.addEventListener('pointerup', () => { dragging = false; });
  wrap.addEventListener('click', e => { if (e.target !== handle) setPos(e.clientX); });
}
initBA();

/* ---------- sticky bar ---------- */
function setSticky(hidden) {
  document.querySelector('.sticky-bar')?.classList.toggle('hidden', hidden);
}

/* ============================================================
   BOOKING WIZARD — one question per screen
   ============================================================ */
const PACKAGES = {
  SINGLE:   { name: 'SINGLE IMAGE', price: 15,  images: 1,  type: 'individual', outfits: 1 },
  LITE:     { name: 'LITE',         price: 35,  images: 3,  type: 'individual', outfits: 1 },
  MEDIUM:   { name: 'MEDIUM',       price: 55,  images: 5,  type: 'individual', outfits: 2 },
  SUPERIOR: { name: 'SUPERIOR',     price: 105, images: 10, type: 'individual', outfits: 3 },
  CSILVER:  { name: 'COUPLE SILVER',   price: 120, images: 3, type: 'couple', outfits: 1 },
  CGOLD:    { name: 'COUPLE GOLD',     price: 230, images: 4, type: 'couple', outfits: 2 },
  CPLAT:    { name: 'COUPLE PLATINUM', price: 350, images: 6, type: 'couple', outfits: 3 },
  EDIT:     { name: 'Single-change edit', price: 10, type: 'edit' }
};

const EDIT_SERVICES = [
  'Earring / Accessories Change', 'Hairstyle Change', 'Outfit Change', 'Makeup Application',
  'Basic Retouch', 'Advanced Retouch', 'Pose Adjustment', 'Background Choice',
  'Object Removal', 'Two People Combined', 'Full Scene Replacement', 'Cartoon / Anime Style',
  'Glasses On / Off', 'Teeth Whitening', 'Hair Color Change', 'Body / Weight Adjustment',
  'Wrinkle & Age Removal', 'Photo Restoration & Colorization', 'Watermark / Text Removal',
  'Photo Upscale / Sharpen'
];

let booking = { mode: null, step: 0, stages: [], data: {} };

function freshData() {
  return {
    package: null, gender: null, styleMe: false, makeup: false, hurry: false,
    about: '', notes: '', pose: '', disclaimer: false, outfitDesc: '', hairDesc: '',
    editServices: [], files: {}, orderNo: null
  };
}

/* ---------- order number ----------
   Every order gets one reference the moment a package is chosen, so the same
   code runs through the review screen, the WhatsApp message we receive and the
   tracker page. Format: GS-YYMMDD-XXXX (36^4 combinations per day).        */
function makeOrderNo(chosenAt) {
  const d = chosenAt ? new Date(chosenAt) : new Date();
  const p = n => String(n).padStart(2, '0');
  const stamp = String(d.getFullYear()).slice(2) + p(d.getMonth() + 1) + p(d.getDate());
  const ABC = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';   // no 0/O/1/I — it gets read out loud
  const bytes = new Uint8Array(4);
  if (window.crypto?.getRandomValues) window.crypto.getRandomValues(bytes);
  else for (let i = 0; i < 4; i++) bytes[i] = Math.floor(Math.random() * 256);
  const tail = [...bytes].map(b => ABC[b % ABC.length]).join('');
  return `GS-${stamp}-${tail}`;
}

function ensureOrderNo() {
  const d = booking.data;
  if (!d.orderNo) {
    d.orderNo = makeOrderNo();
    d.orderAt = Date.now();
    saveOrderRecord('started');   // list it on the tracker straight away
  }
  return d.orderNo;
}

/* keep one small record per order on this device, for the tracker page */
function saveOrderRecord(status) {
  const d = booking.data;
  if (!d.orderNo) return;
  const pkg = PACKAGES[d.package];
  let list = [];
  try { list = JSON.parse(localStorage.getItem('gidigba_orders') || '[]'); } catch (e) {}
  const rec = {
    orderNo: d.orderNo,
    when: d.orderAt || Date.now(),
    status: status || 'started',
    pkg: pkg ? (pkg.name || d.package) : (d.package || 'Photoshoot'),
    price: pkg ? pkg.price : null,
    gender: d.gender || null,
    hurry: !!d.hurry,
    updated: Date.now()
  };
  const i = list.findIndex(r => r.orderNo === d.orderNo);
  if (i >= 0) list[i] = Object.assign({}, list[i], rec);
  else list.unshift(rec);
  try { localStorage.setItem('gidigba_orders', JSON.stringify(list.slice(0, 30))); } catch (e) {}
}

function openBooking(mode, pkgKey) {
  booking.mode = mode || 'individual';
  booking.data = freshData();
  if (pkgKey && PACKAGES[pkgKey]) {
    booking.data.package = pkgKey;
    ensureOrderNo();
    // derive the flow from the package itself, not just the caller's hint
    const p = PACKAGES[pkgKey];
    if (p.type === 'couple') booking.mode = 'couple';
    else if (p.type === 'edit') booking.mode = 'edit';
  }
  buildStages();
  // if the caller already chose a package, skip the package screen
  const pkgIdx = booking.stages.indexOf('package');
  booking.step = (pkgKey && pkgIdx === 0) ? 1 : 0;
  renderStep();
  document.getElementById('bookingModal').classList.add('open');
  setSticky(true);
  document.body.style.overflow = 'hidden';
  document.body.classList.add('modal-open');
}

function closeBooking() {
  document.getElementById('bookingModal')?.classList.remove('open');
  setSticky(false);
  document.body.style.overflow = '';
  document.body.classList.remove('modal-open');
}

function buildStages() {
  const d = booking.data;
  if (booking.mode === 'edit') {
    booking.stages = ['package', 'editPick', 'editPhoto', 'editDetails', 'review'];
    return;
  }
  if (booking.mode === 'couple') {
    booking.stages = ['package', 'photos', 'outfit', 'hair', 'details', 'review'];
    return;
  }
  const s = ['package', 'gender', 'photos'];
  if (!d.styleMe) s.push('outfit', 'hair');
  if (d.gender === 'female') s.push('makeup');
  s.push('details', 'review');
  booking.stages = s;
}

function stageName() { return booking.stages[booking.step] || 'package'; }
function progressPct() { return ((booking.step + 1) / booking.stages.length) * 100; }

function validate() {
  const s = stageName();
  const d = booking.data;
  if (s === 'package' && !d.package) return 'Please select a package';
  if (s === 'gender' && !d.gender) return 'Please choose who this shoot is for';
  if (s === 'photos') {
    if (!d.files.selfie) return 'Selfie photo is required';
    if (!d.files.fullbody) return 'Full-body photo is required';
    if (booking.mode === 'couple') {
      if (!d.files.pselfie) return "Partner's selfie is required";
      if (!d.files.pfullbody) return "Partner's full-body photo is required";
    }
  }
  if (s === 'outfit' && d.outfitSel === 'upload') {
    const need = outfitNeed(), got = outfitGiven();
    if (need > 1 && got === 0) return `This package includes ${need} outfits — add at least one`;
    if (need <= 1 && !d.files.outfit) return 'Please add an outfit photo';
  }
  if (s === 'outfit' && d.outfitSel === 'wardrobe' && !d.outfitPick && !d.outfitDesc?.trim()) return 'Please pick an outfit from the wardrobe, or describe it';
  if (s === 'hair' && d.hairSel === 'upload' && !d.files.hair && !d.hairDesc?.trim()) return 'Please add a hairstyle photo or describe it';
  if (s === 'hair' && d.hairSel === 'wardrobe' && !d.hairPick && !d.hairDesc?.trim()) return 'Please pick a hairstyle, or describe it';
  if (s === 'details') {
    if (!d.about?.trim()) return 'Please tell us what the photoshoot is about';
    if (!d.disclaimer) return 'Please accept the software-assisted images disclaimer';
  }
  if (s === 'editPick' && (!d.editServices || d.editServices.length === 0)) return 'Select at least one edit';
  if (s === 'editPhoto' && !d.files.edit) return 'Please upload the photo to edit';
  if (s === 'editDetails' && !d.disclaimer) return 'Please accept the disclaimer';
  return null;
}

function nextStep() {
  const err = validate();
  if (err) { toast(err, false); return; }
  const cur = stageName();

  // stages are only rebuilt when we ADVANCE, never underneath the user
  if (['package', 'gender', 'outfit'].includes(cur)) buildStages();

  const i = booking.stages.indexOf(cur);
  if (i >= 0 && i < booking.stages.length - 1) {
    booking.step = i + 1;          // re-found by name, so removed stages can't skip
    renderStep();
    return;
  }
  if (i === booking.stages.length - 1) { submitToWhatsApp(); return; }

  // the current stage no longer exists (e.g. styling removed it) — go to the next known one
  const fallbacks = ['makeup', 'details', 'review'];
  const nxt = fallbacks.map(f => booking.stages.indexOf(f)).find(x => x >= 0);
  if (nxt !== undefined && nxt >= 0) { booking.step = nxt; renderStep(); }
  else submitToWhatsApp();
}

function prevStep() {
  if (booking.step <= 0) { closeBooking(); return; }
  const cur = stageName();
  buildStages();
  const i = booking.stages.indexOf(cur);
  if (i > 0) { booking.step = i - 1; }
  else if (i === 0) { booking.step = 0; }
  else {
    const order = ['package', 'gender', 'photos', 'outfit', 'hair', 'makeup', 'details', 'review'];
    let found = 0;
    for (let k = 0; k < order.length; k++) {
      const idx = booking.stages.indexOf(order[k]);
      if (idx >= 0 && order.indexOf(cur) > k) found = idx;
    }
    booking.step = Math.max(0, Math.min(found, booking.stages.length - 1));
  }
  renderStep();
}

function selectChoice(key, value) {
  booking.data[key] = value;
  if (key === 'package' && value) { ensureOrderNo(); }
  if (key === 'package') {
    const p = PACKAGES[value];
    if (p?.type === 'couple') booking.mode = 'couple';
    else if (p?.type === 'edit') booking.mode = 'edit';
    else booking.mode = 'individual';
    buildStages();
  }
  if (key === 'styleMe') { booking.data.styleMe = value; buildStages(); }
  renderStep();
}

function pickStyleMe() {
  // set both flags and re-render the CURRENT screen only;
  // stages are rebuilt on Continue, so nothing shifts under the user
  booking.data.styleMe = true;
  booking.data.outfitSel = 'styled';
  renderStep();
}

function toggleEditService(name) {
  const arr = booking.data.editServices || [];
  const i = arr.indexOf(name);
  if (i >= 0) arr.splice(i, 1); else arr.push(name);
  booking.data.editServices = arr;
  renderStep();
}

// index-based toggle: updates state + just the clicked chip (no scroll reset)
function toggleEditServiceIdx(idx) {
  const name = EDIT_SERVICES[idx];
  if (!name) return;
  const arr = booking.data.editServices || [];
  const i = arr.indexOf(name);
  if (i >= 0) arr.splice(i, 1); else arr.push(name);
  booking.data.editServices = arr;
  const el = document.querySelector(`.choice[data-idx="${idx}"]`);
  if (el) el.classList.toggle('selected', arr.includes(name));
}

function handleFile(key, input) {
  const file = input.files?.[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) { toast('Please choose an image', false); return; }
  const prev = booking.data.files[key];
  if (prev?.url) URL.revokeObjectURL(prev.url);   // don't leak the old blob
  booking.data.files[key] = { file, url: URL.createObjectURL(file), name: file.name };
  renderStep();
}

/* how many outfits the chosen package includes */
function outfitNeed() {
  const d = booking.data;
  if (d.outfitSel === 'styled' || d.styleMe) return 0;
  const p = PACKAGES[d.package];
  return Math.max(1, (p && p.outfits) || 1);
}
function outfitGiven() {
  const f = booking.data.files || {};
  const slots = Object.keys(f).filter(k => k.startsWith('outfit_') && f[k]).length;
  if (slots) return slots;
  return f.outfit ? 1 : 0;
}

function esc(s) {
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function uploadBox(key, label, sub) {
  const f = booking.data.files[key];
  const uid = 'cam_' + key;
  if (f) {
    return `
    <div class="upload-zone has-file">
      <img class="preview" src="${f.url}" alt="preview">
      <span class="uz-name">${esc(f.name)}</span>
      <small>${label} · saved</small>
      <div class="uz-src">
        <label class="uz-btn" for="${uid}_gallery">Change from gallery</label>
        <label class="uz-btn" for="${uid}_camera">Retake with camera</label>
      </div>
      <input id="${uid}_gallery" class="uz-input" type="file" accept="image/*"
             onchange="handleFile('${key}', this)">
      <input id="${uid}_camera" class="uz-input" type="file" accept="image/*" capture="user"
             onchange="handleFile('${key}', this)">
    </div>`;
  }
  return `
    <div class="upload-zone">
      <div class="icon">📷</div>
      <span class="uz-name">${label}</span>
      <small>${sub}</small>
      <div class="uz-src">
        <label class="uz-btn uz-btn-primary" for="${uid}_camera">Take with camera</label>
        <label class="uz-btn" for="${uid}_gallery">Choose from gallery</label>
      </div>
      <input id="${uid}_camera" class="uz-input" type="file" accept="image/*" capture="user"
             onchange="handleFile('${key}', this)">
      <input id="${uid}_gallery" class="uz-input" type="file" accept="image/*"
             onchange="handleFile('${key}', this)">
    </div>`;
}


/* once a style choice is made the three buttons step aside, so the
   wardrobe or upload panel has the whole screen to itself */
function stylePicked(key, what) {
  const d = booking.data;
  const sel = key === 'outfitSel' ? (d.outfitSel || (d.styleMe ? 'styled' : null)) : d.hairSel;
  if (!sel) return '';
  const label = sel === 'upload' ? 'Upload from my phone'
    : sel === 'wardrobe' ? (key === 'outfitSel' ? 'Choose from our wardrobe' : 'Choose from our options')
    : 'Let us style you';
  return `<div class="style-picked">
      <span class="sp-what">Your ${what}</span>
      <strong>${label}</strong>
      <button type="button" class="sp-change" onclick="clearStyleChoice('${key}')">Change</button>
    </div>`;
}
function clearStyleChoice(key) {
  booking.data[key] = null;
  if (key === 'outfitSel' && booking.data.styleMe) booking.data.styleMe = false;
  renderStep();
}

function renderStep() {
  const body = document.getElementById('modalBody');
  const foot = document.getElementById('modalFoot');
  const bar = document.getElementById('progressBar');
  const title = document.getElementById('modalTitle');
  if (!body) return;

  bar.style.width = progressPct() + '%';
  const s = stageName();
  const d = booking.data;
  const total = booking.stages.length;
  title.textContent = `Question ${booking.step + 1} of ${total}`;

  let html = '';

  if (s === 'package') {
    html = `
      <p class="q-label">Step 1</p>
      <h3 class="q-title">Choose your package</h3>
      <p class="q-sub">All individual packages include retouch, hairstyle, outfit and background. Makeup is optional. Delivered within 24 business hours.</p>
      <div class="choice-grid">
        ${Object.entries(PACKAGES).filter(([, p]) => p.type === 'individual').map(([k, p]) => `
          <div class="choice ${d.package === k ? 'selected' : ''}" onclick="selectChoice('package','${k}')">
            ${p.name}<small>GH₵ ${p.price} · ${p.images} image${p.images > 1 ? 's' : ''}</small>
          </div>`).join('')}
      </div>
      <p class="q-label mt-24">Couple packages</p>
      <div class="choice-grid">
        ${Object.entries(PACKAGES).filter(([, p]) => p.type === 'couple').map(([k, p]) => `
          <div class="choice ${d.package === k ? 'selected' : ''}" onclick="selectChoice('package','${k}')">
            ${p.name}<small>GH₵ ${p.price} · ${p.images} images</small>
          </div>`).join('')}
      </div>
      <p class="q-label mt-24">Or just one change</p>
      <div class="choice-grid">
        <div class="choice ${d.package === 'EDIT' ? 'selected' : ''}" onclick="selectChoice('package','EDIT')">
          Single-change edit<small>GH₵ 10 per change</small>
        </div>
      </div>`;
  }

  else if (s === 'gender') {
    html = `
      <p class="q-label">About the shoot</p>
      <h3 class="q-title">Who is this photoshoot for?</h3>
      <p class="q-sub">This helps us prepare the right options for hairstyle and makeup.</p>
      <div class="choice-grid cols-3">
        ${['female', 'male', 'child'].map(g => `
          <div class="choice ${d.gender === g ? 'selected' : ''}" onclick="selectChoice('gender','${g}')" style="text-transform:capitalize">${g}</div>
        `).join('')}
      </div>`;
  }

  else if (s === 'photos') {
    const isCouple = booking.mode === 'couple';
    html = `
      <p class="q-label">Photos</p>
      <h3 class="q-title">Upload your photos</h3>
      <p class="q-sub">We need a clear selfie and a full-body photo. You can take a new one or choose from your gallery.</p>
      ${uploadBox('selfie', 'Your selfie', 'Face clearly visible')}
      ${uploadBox('fullbody', 'Your full-body', 'Head to toe')}
      ${isCouple ? uploadBox('pselfie', "Partner's selfie", 'Face clearly visible') + uploadBox('pfullbody', "Partner's full-body", 'Head to toe') : ''}`;
  }

  else if (s === 'outfit') {
    const styledNow = d.outfitSel === 'styled' || d.styleMe;
    html = `
      <p class="q-label">Style</p>
      <h3 class="q-title">How should we handle outfit?</h3>
      ${stylePicked('outfitSel', 'outfit')}
      <div class="choice-grid${d.outfitSel || d.styleMe ? ' style-choices-hidden' : ''}">
        <div class="choice ${d.outfitSel === 'upload' ? 'selected' : ''}" onclick="selectChoice('outfitSel','upload')">Upload from my phone</div>
        <div class="choice ${d.outfitSel === 'wardrobe' ? 'selected' : ''}" onclick="selectChoice('outfitSel','wardrobe')">Choose from our wardrobe</div>
        <div class="choice ${d.outfitSel === 'styled' || d.styleMe ? 'selected' : ''}" onclick="pickStyleMe()">Let us style you</div>
      </div>
      ${styledNow ? `<div class="warning">No free style changes after work begins.</div>` : ''}
      ${d.outfitSel === 'upload' ? `
        <div class="outfit-need">
          <strong>${outfitNeed()} outfit${outfitNeed() > 1 ? 's' : ''}</strong>
          <span>included in ${esc(PACKAGES[d.package]?.name || 'your package')}${d.package && PACKAGES[d.package].type === 'couple' ? ' — each of you' : ''}. Add a photo of each one.</span>
        </div>
        ${Array.from({ length: outfitNeed() }, (_, i) =>
          uploadBox('outfit_' + i, 'Outfit ' + (i + 1), i === 0 ? 'Main look' : 'Change ' + (i + 1))
        ).join('')}` : ''}
      ${d.outfitSel === 'wardrobe' ? `
        ${outfitNeed() > 1 ? `<div class="outfit-need"><strong>${outfitNeed()} outfits</strong><span>included in ${esc(PACKAGES[d.package]?.name || 'your package')}. Pick the look you want most — we will advise on the rest.</span></div>` : ''}
        ${gidigbaGalleryHtml('outfits', 'outfit')}
        <p class="q-sub" style="margin-top:14px">Don't see yours? <a href="#" class="link-plain" onclick="selectChoice('outfitSel','upload'); return false;">Upload from your phone instead</a></p>` : ''}
      ${!styledNow && d.outfitSel ? `
        <div class="field">
          <label for="outfitDesc">Describe your outfit <span class="field-hint">(optional if you added a photo or picked one)</span></label>
          <textarea id="outfitDesc" placeholder="e.g. Gold kente cloth, white sundress, navy suit…">${esc(d.outfitDesc)}</textarea>
        </div>` : ''}`;
  }

  else if (s === 'hair') {
    html = `
      <p class="q-label">Hairstyle</p>
      <h3 class="q-title">How should we handle hairstyle?</h3>
      ${stylePicked('hairSel', 'hairstyle')}
      <div class="choice-grid${d.hairSel ? ' style-choices-hidden' : ''}">
        <div class="choice ${d.hairSel === 'upload' ? 'selected' : ''}" onclick="selectChoice('hairSel','upload')">Upload from my phone</div>
        <div class="choice ${d.hairSel === 'wardrobe' ? 'selected' : ''}" onclick="selectChoice('hairSel','wardrobe')">Choose from our options</div>
        <div class="choice ${d.hairSel === 'styled' ? 'selected' : ''}" onclick="selectChoice('hairSel','styled')">Let us style you</div>
      </div>
      ${d.hairSel === 'upload' ? uploadBox('hair', 'Hairstyle reference', 'Photo of the desired look') : ''}
      ${d.hairSel === 'wardrobe' ? `
        ${gidigbaGalleryHtml('styles', 'hair')}
        <p class="q-sub" style="margin-top:14px">Don't see yours? <a href="#" class="link-plain" onclick="selectChoice('hairSel','upload'); return false;">Upload from your phone instead</a></p>` : ''}
      ${d.hairSel && d.hairSel !== 'styled' ? `
        <div class="field">
          <label for="hairDesc">Describe the hairstyle <span class="field-hint">(optional if you added a photo or picked one)</span></label>
          <textarea id="hairDesc" placeholder="e.g. Long braids with gold cuffs, low-cut fade, curls…">${esc(d.hairDesc)}</textarea>
        </div>` : ''}`;
  }

  else if (s === 'makeup') {
    html = `
      <p class="q-label">Makeup</p>
      <h3 class="q-title">Add makeup?</h3>
      <p class="q-sub">Makeup will change the face — as it would in normal life.</p>
      <div class="choice-grid cols-2">
        <div class="choice ${d.makeup === true ? 'selected' : ''}" onclick="selectChoice('makeup',true)">Yes</div>
        <div class="choice ${d.makeup === false ? 'selected' : ''}" onclick="selectChoice('makeup',false)">No</div>
      </div>
      ${d.makeup ? `<div class="warning">Adding makeup will cause changes to your face — as it would in normal life.</div>` : ''}`;
  }

  else if (s === 'details') {
    const pkg = PACKAGES[d.package];
    html = `
      <p class="q-label">Final details</p>
      <h3 class="q-title">Tell us about the shoot</h3>
      <div class="field">
        <label for="about">What is the photoshoot about? *</label>
        <textarea id="about" placeholder="e.g. Graduation in kente, birthday with gold theme, LinkedIn headshot…">${esc(d.about)}</textarea>
      </div>
      ${pkg && pkg.images >= 10 ? `
      <div class="field">
        <label for="pose">Pose notes (optional)</label>
        <textarea id="pose" placeholder="e.g. seated, arms folded, looking away…">${esc(d.pose)}</textarea>
      </div>` : ''}
      <div class="field">
        <label for="notes">Additional notes (optional)</label>
        <textarea id="notes" placeholder="Anything else we should know?">${esc(d.notes)}</textarea>
      </div>
      <div class="toggle-row">
        <input type="checkbox" id="hurry" ${d.hurry ? 'checked' : ''} onchange="booking.data.hurry=this.checked">
        <label for="hurry">Hurry / priority delivery<br><small style="color:var(--muted)">A small fee may be demanded by the team after submission for priority delivery.</small></label>
      </div>
      <div class="toggle-row">
        <input type="checkbox" id="disc" ${d.disclaimer ? 'checked' : ''} onchange="booking.data.disclaimer=this.checked">
        <label for="disc"><strong>I understand:</strong> these are software-assisted generated images; minor changes may occur; details may not be 100% real-life accurate; 100% online service, no in-person session.</label>
      </div>`;
  }

  else if (s === 'editPick') {
    html = `
      <p class="q-label">Editing</p>
      <h3 class="q-title">What do you want to change?</h3>
      <p class="q-sub"><a href="#" onclick="selectChoice('package',null); return false;" class="link-plain">← Change package</a></p>
      <p class="q-sub">GH₵ 10 per change. Select one or more.</p>
      <div class="choice-grid">
        ${EDIT_SERVICES.map(name => `
          <div class="choice ${(d.editServices || []).includes(name) ? 'selected' : ''}" onclick="toggleEditServiceIdx(${EDIT_SERVICES.indexOf(name)})" data-idx="${EDIT_SERVICES.indexOf(name)}" style="text-align:left;justify-content:flex-start;padding-left:16px">
            ${name}
          </div>`).join('')}
      </div>`;
  }

  else if (s === 'editPhoto') {
    html = `
      <p class="q-label">Photo</p>
      <h3 class="q-title">Upload the photo to edit</h3>
      ${uploadBox('edit', 'Photo to edit', 'Clear, well-lit image works best')}`;
  }

  else if (s === 'editDetails') {
    html = `
      <p class="q-label">Details</p>
      <h3 class="q-title">Any extra notes?</h3>
      <div class="field">
        <label for="notes">Describe the changes or add notes</label>
        <textarea id="notes" placeholder="e.g. Make the background pure white, remove the person on the left…">${esc(d.notes)}</textarea>
      </div>
      <div class="toggle-row">
        <input type="checkbox" id="hurry" ${d.hurry ? 'checked' : ''} onchange="booking.data.hurry=this.checked">
        <label for="hurry">Hurry / priority<br><small style="color:var(--muted)">A small fee may be demanded for priority delivery.</small></label>
      </div>
      <div class="toggle-row">
        <input type="checkbox" id="disc" ${d.disclaimer ? 'checked' : ''} onchange="booking.data.disclaimer=this.checked">
        <label for="disc"><strong>I understand:</strong> these are software-assisted generated images; minor changes may occur; 100% online service, no in-person session.</label>
      </div>`;
  }

  else if (s === 'review') {
    const pkg = PACKAGES[d.package];
    html = `
      <p class="q-label">Review</p>
      <h3 class="q-title">Ready to send?</h3>
      <p class="q-sub">We'll open WhatsApp with your complete brief. Payment is via Mobile Money after confirmation.</p>
      <div class="order-ref"><span>Order number</span><strong>${ensureOrderNo()}</strong></div>
      <div class="review-block"><strong>Offer</strong>${pkg ? (pkg.type === 'edit'
        ? `${pkg.name} — ${(d.editServices || []).length} × GH₵10 = GH₵ ${(d.editServices || []).length * 10}`
        : `${pkg.name} — GH₵ ${pkg.price}`) : 'Custom edit'}</div>
      ${pkg?.type === 'couple' ? `<div class="review-block"><strong>Includes</strong>${pkg.images} images · ${pkg.outfits} outfit${pkg.outfits > 1 ? 's' : ''} each</div>` : ''}
      ${d.gender ? `<div class="review-block"><strong>For</strong>${d.gender}</div>` : ''}
      ${d.about ? `<div class="review-block"><strong>About</strong>${esc(d.about)}</div>` : ''}
      ${d.editServices?.length ? `<div class="review-block"><strong>Edits</strong>${d.editServices.join(', ')}</div>` : ''}
      <div class="review-block"><strong>Delivery</strong>Within 24 business hours${d.hurry ? ' (priority requested)' : ''}</div>
      <div class="review-block"><strong>Payment</strong>Mobile Money details shared on WhatsApp. Slot confirmed once payment completes.</div>`;
  }

  body.innerHTML = html;

  // innerHTML rebuilds drop the typed value — put it back, then keep it in sync
  const aboutEl = body.querySelector('#about');
  if (aboutEl) { aboutEl.value = booking.data.about || ''; aboutEl.addEventListener('input', e => booking.data.about = e.target.value); }
  const notesEl = body.querySelector('#notes');
  if (notesEl) { notesEl.value = booking.data.notes || ''; notesEl.addEventListener('input', e => booking.data.notes = e.target.value); }
  const poseEl = body.querySelector('#pose');
  if (poseEl) { poseEl.value = booking.data.pose || ''; poseEl.addEventListener('input', e => booking.data.pose = e.target.value); }
  const outfitDescEl = body.querySelector('#outfitDesc');
  if (outfitDescEl) { outfitDescEl.value = booking.data.outfitDesc || ''; outfitDescEl.addEventListener('input', e => booking.data.outfitDesc = e.target.value); }
  const hairDescEl = body.querySelector('#hairDesc');
  if (hairDescEl) { hairDescEl.value = booking.data.hairDesc || ''; hairDescEl.addEventListener('input', e => booking.data.hairDesc = e.target.value); }

  if (typeof restoreGallery === 'function') restoreGallery();

  const isLast = booking.step === booking.stages.length - 1;
  foot.innerHTML = `
    <button class="btn btn-ghost" onclick="prevStep()">${booking.step === 0 ? 'Close' : 'Back'}</button>
    <button class="btn btn-primary" onclick="nextStep()">${isLast ? 'Send on WhatsApp' : 'Continue'}</button>`;
}

/* ---------- submit ---------- */
function submitToWhatsApp() {
  const d = booking.data;
  const pkg = PACKAGES[d.package];
  const orderNo = ensureOrderNo();
  let msg = `Hello GIDIGBA STUDIOS!\n\n*New Online Order*\n`;
  msg += `*Order No: ${orderNo}*\n\n`;

  if (pkg) {
    msg += `*Offer:* ${pkg.name} — GH₵ ${pkg.price}\n`;
    if (pkg.type === 'individual') msg += `*Includes:* Retouch · Hairstyle · Outfit · Background · Makeup optional\n`;
    if (pkg.type === 'couple') msg += `*Images:* ${pkg.images} · Outfits each: ${pkg.outfits}\n`;
  }
  if (d.editServices?.length) {
    msg += `*Edits (GH₵10 each):* ${d.editServices.join(', ')}\n`;
    msg += `*Total edits:* ${d.editServices.length} × GH₵10 = GH₵ ${d.editServices.length * 10}\n`;
  }
  if (d.gender) msg += `*For:* ${d.gender}\n`;
  if (d.about) msg += `*About:* ${d.about}\n`;
  if (d.pose) msg += `*Pose notes:* ${d.pose}\n`;
  if (d.styleMe || d.outfitSel === 'styled') msg += `*Outfit:* Let us style you\n`;
  else if (d.outfitSel === 'upload') {
    const need = outfitNeed(), got = outfitGiven();
    msg += `*Outfit:* ${got} photo${got === 1 ? '' : 's'} of ${need} included\n`;
  }
  else if (d.outfitSel === 'wardrobe' && d.outfitPick) msg += `*Outfit:* Chosen from our wardrobe — ${d.outfitPick.cat} look ${d.outfitPick.idx + 1} (${d.outfitPick.src})${d.outfitDesc?.trim() ? ` — ${d.outfitDesc.trim()}` : ''}\n`;
  else if (d.outfitSel) msg += `*Outfit:* ${d.outfitDesc?.trim() || d.outfitSel}\n`;
  if (d.hairSel === 'styled') msg += `*Hairstyle:* Let us style you\n`;
  else if (d.hairSel === 'wardrobe' && d.hairPick) msg += `*Hairstyle:* Chosen from our styles — ${d.hairPick.cat} style ${d.hairPick.idx + 1} (${d.hairPick.src})${d.hairDesc?.trim() ? ` — ${d.hairDesc.trim()}` : ''}\n`;
  else if (d.hairSel) msg += `*Hairstyle:* ${d.hairDesc?.trim() || d.hairSel}\n`;
  if (d.gender === 'female') msg += `*Makeup:* ${d.makeup ? 'Yes — client informed face will change' : 'No'}\n`;
  if (d.notes) msg += `*Notes:* ${d.notes}\n`;
  msg += `*Hurry:* ${d.hurry ? 'Yes — priority requested (fee may apply)' : 'No'}\n`;
  msg += `*Delivery:* Within 24 business hours\n\n`;
  msg += `*PHOTOS*\n`;

  const fileKeys = Object.keys(d.files || {});
  fileKeys.forEach(k => {
    msg += `${k}: ${d.files[k].name}\n`;
  });
  msg += `\n(I will attach the ${fileKeys.length} photo(s) in this chat.)\n\n`;
  msg += `✅ I understand these are software-assisted generated images.\n`;
  msg += `✅ 100% online — no in-person session.\n\n`;
  msg += `*Order No: ${orderNo}*\n`;
  msg += `Please quote this number when you reply.`;
  saveOrderRecord('sent');
  if (d.disclaimer === false) msg += `\n⚠️ Disclaimer not accepted`;

  const url = `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`;
  const win = window.open(url, '_blank', 'noopener');
  if (!win) {
    toast('Pop-up blocked — opening WhatsApp in this tab', false);
    window.location.href = url;
  } else {
    toast('Opening WhatsApp with your brief…');
  }
  closeBooking();
}

/* keyboard + backdrop */
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  const m = document.getElementById('bookingModal');
  if (m?.classList.contains('open')) closeBooking();
  else closeMenu();
});
document.addEventListener('click', e => { if (e.target.classList?.contains('modal-overlay')) closeBooking(); });
