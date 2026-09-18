if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js');
  });
}

function isOnline() {
  return navigator.onLine;
}

// ---------- DATA ----------
const WA_NUMBER = '233534317611';
const WA_INTRO = "Hello GIDIGBA CREATIVES! I need help with my business visuals.";
const SERVICES = [
  { name: 'Branding', icon: 'fa-pen-nib', short: 'Logo, identity & business design' },
  { name: 'Graphic Design', icon: 'fa-image', short: 'Graphics, ads & social media' },
  { name: 'Business & Product Visuals', icon: 'fa-camera', short: 'Product & commercial imagery' },
  { name: 'Video', icon: 'fa-video', short: 'Brand films, commercials & AI video' },
  { name: 'Motion & Animation', icon: 'fa-film', short: 'Logo & motion graphics' },
  { name: 'Advanced Creative Production', icon: 'fa-wand-magic-sparkles', short: 'AI visuals & cinematic concepts' }
];
const MAX_IMAGES = 4;
const DRAFT_KEY = 'gidigba_creatives_draft';

let selectedServices = [];
let projectImages = [];

// ---------- DRAFT (survives refresh; images don't) ----------
function saveDraft() {
  const d = {
    selectedServices,
    bizName: document.getElementById('bizName')?.value || '',
    bizIdea: document.getElementById('bizIdea')?.value || '',
    bizBudget: document.getElementById('bizBudget')?.value || ''
  };
  localStorage.setItem(DRAFT_KEY, JSON.stringify(d));
}
function loadDraft() {
  let d = null;
  try { d = JSON.parse(localStorage.getItem(DRAFT_KEY)); } catch (e) { d = null; }
  if (!d) return;
  selectedServices = Array.isArray(d.selectedServices) ? d.selectedServices : [];
  if (d.bizName) document.getElementById('bizName').value = d.bizName;
  if (d.bizIdea) document.getElementById('bizIdea').value = d.bizIdea;
  if (d.bizBudget) document.getElementById('bizBudget').value = d.bizBudget;
}
window.addEventListener('beforeunload', saveDraft);
loadDraft();

// ---------- NAVIGATION ----------
window.showScreen = function (id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0, 0);
  if (id === 'project') renderChips();
};

window.startProject = function (idx) {
  if (typeof idx === 'number') selectedServices = [idx];
  showScreen('project');
};

window.waChat = function () {
  window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(WA_INTRO)}`, '_blank');
};

// ---------- SERVICE CHIPS ----------
function renderChips() {
  document.getElementById('serviceChips').innerHTML = SERVICES.map((s, i) => `
    <div class="chip ${selectedServices.includes(i) ? 'active' : ''}" onclick="toggleService(${i})">
      <i class="fas ${s.icon}"></i>
      <span>${s.name}</span>
    </div>`).join('');
}
window.toggleService = function (i) {
  const p = selectedServices.indexOf(i);
  if (p > -1) selectedServices.splice(p, 1);
  else selectedServices.push(i);
  renderChips();
  saveDraft();
};

// ---------- IMAGE UPLOADS ----------
window.addImages = function (e) {
  const room = MAX_IMAGES - projectImages.length;
  if (room <= 0) { e.target.value = ''; showToast('Maximum ' + MAX_IMAGES + ' images'); return; }
  const files = Array.from(e.target.files).slice(0, room);
  files.forEach(f => {
    const rd = new FileReader();
    rd.onload = ev => {
      projectImages.push({ file: f, data: ev.target.result });
      renderImagePreviews();
    };
    rd.readAsDataURL(f);
  });
  e.target.value = '';
};
window.removeImage = function (i) {
  projectImages.splice(i, 1);
  renderImagePreviews();
};
function renderImagePreviews() {
  document.getElementById('imagePreviews').innerHTML = projectImages.map((im, i) => `
    <div class="image-thumb">
      <img src="${im.data}" alt="Upload ${i + 1}">
      <span class="img-remove" onclick="removeImage(${i})"><i class="fas fa-times"></i></span>
    </div>`).join('');
}

// ---------- REVIEW ----------
function esc(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}
window.goToReview = function () {
  if (selectedServices.length === 0) return showToast('Select at least one service');
  const biz = document.getElementById('bizName').value.trim();
  if (!biz) return showToast('Tell us your business name');
  const idea = document.getElementById('bizIdea').value.trim();
  if (!idea) return showToast('Describe what you want to create');
  const budget = document.getElementById('bizBudget').value.trim();
  let details = `<h3>New Project Brief</h3>
    <p><strong>Services:</strong> ${selectedServices.map(i => esc(SERVICES[i].name)).join(', ')}</p>
    <p><strong>Business:</strong> ${esc(biz)}</p>
    <p><strong>Idea:</strong> ${esc(idea)}</p>`;
  if (budget) details += `<p><strong>Budget:</strong> ${esc(budget)}</p>`;
  details += `<p><strong>Images:</strong> ${projectImages.length > 0 ? projectImages.length + ' attached' : 'None yet — can share later'}</p>`;
  document.getElementById('reviewDetails').innerHTML = details;
  saveDraft();
  showScreen('review');
};

// ---------- SUBMIT ----------
async function submitOrder() {
  if (!isOnline()) {
    saveDraft();
    showToast("You're offline — your brief is saved. Send it when you're back online.", true);
    return;
  }
  const btn = document.getElementById('submitBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spin"></span> Uploading...';
  const KEY = 'dbc0dad2f83bf9f24d8abad5e0afd3d1';
  const urls = [];
  try {
    for (const im of projectImages) {
      const fd = new FormData();
      fd.append('image', im.file);
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${KEY}`, { method: 'POST', body: fd });
      const data = await res.json();
      if (!data.success) throw new Error('Upload failed');
      urls.push(data.data.url);
    }
    const biz = document.getElementById('bizName').value.trim().replace(/\n/g, ' ');
    const idea = document.getElementById('bizIdea').value.trim().replace(/\n/g, ' ');
    const budget = document.getElementById('bizBudget').value.trim();
    let msg = `Hello GIDIGBA CREATIVES!%0A%0A📦 New Project Brief%0A🎯 Services: ${selectedServices.map(i => SERVICES[i].name).join(', ')}%0A💼 Business: ${biz}%0A📝 Idea: ${idea}`;
    if (budget) msg += `%0A💰 Budget: ${budget}`;
    if (urls.length) msg += `%0A%0A📸 Images:` + urls.map(u => `%0A${u}`).join('');
    else msg += `%0A📸 Images: None yet — I'll share them here`;
    msg += `%0A%0A✅ I've reviewed this brief and I'm ready to discuss pricing.`;
    window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, '_blank');
    showToast('Brief sent! We\'ll get back to you.', true);
  } catch (e) {
    showToast('Upload failed', false);
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fab fa-whatsapp"></i> Send Brief via WhatsApp';
  }
}

function showToast(m, g = true) {
  const t = document.getElementById('toast');
  t.textContent = m;
  t.style.background = g ? '#BCEB2D' : '#ff4444';
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

// ---------- FEEDBACK CAROUSEL ----------
function initFeedbackCarousel() {
  const track = document.getElementById('feedbackTrack');
  const dotsContainer = document.getElementById('feedbackDots');
  if (!track) return;
  const slides = track.querySelectorAll('.feedback-slide');
  dotsContainer.innerHTML = '';
  slides.forEach((_, i) => {
    const dot = document.createElement('span');
    dot.className = 'feedback-dot' + (i === 0 ? ' active' : '');
    dot.onclick = () => track.scrollTo({ left: slides[i].offsetLeft, behavior: 'smooth' });
    dotsContainer.appendChild(dot);
  });
  track.addEventListener('scroll', () => {
    const scrollPos = track.scrollLeft;
    slides.forEach((slide, i) => {
      const dot = dotsContainer.children[i];
      if (dot) dot.classList.toggle('active', Math.abs(scrollPos - slide.offsetLeft) < 50);
    });
  });
}

window.onload = function () {
  loadDraft();
  renderChips();
  renderImagePreviews();
  initFeedbackCarousel();
};

// ---------- PWA INSTALL ----------
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  document.getElementById('installBar').classList.add('show');
});

document.getElementById('installBtn').addEventListener('click', async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      document.getElementById('installBar').classList.remove('show');
    }
    deferredPrompt = null;
  }
});

window.addEventListener('appinstalled', () => {
  document.getElementById('installBar').classList.remove('show');
});
