/* GIDIGBA STUDIOS — wardrobe and hairstyle galleries
   The old site let a client open our wardrobe and pick a look.
   The rebuild kept the option but never drew the pictures, so the
   step looked empty. This file supplies the picture lists and draws
   them inside the booking step. */

window.GALLERIES = {
  outfits: {
    female:   Array.from({ length: 100 }, (_, i) => `images/outfits/female/outfits-female-${String(i + 1).padStart(3, '0')}.webp`),
    male:     Array.from({ length: 100 }, (_, i) => `images/outfits/male/outfits-male-${String(i + 1).padStart(3, '0')}.webp`),
    children: Array.from({ length: 100 }, (_, i) => `images/outfits/children/outfits-children-${String(i + 1).padStart(3, '0')}.webp`)
  },
  styles: {
    female:   Array.from({ length: 60 }, (_, i) => `images/styles/female/women-hair-${String(i + 1).padStart(3, '0')}.webp`),
    male:     Array.from({ length: 50 }, (_, i) => `images/styles/male/styles-male-${String(i + 1).padStart(3, '0')}.webp`),
    children: Array.from({ length: 50 }, (_, i) => `images/styles/children/kids-hair-${String(i + 1).padStart(3, '0')}.webp`)
  }
};

(function () {
  function galleries() { return window.GALLERIES || {}; }

  function has(kind) {
    const g = galleries()[kind];
    return !!(g && ['female', 'male', 'children'].some(c => (g[c] || []).length));
  }

  /* which tabs to show: your own section first, then children */
  function catsFor(gender) {
    if (gender === 'female') return ['female', 'children'];
    if (gender === 'male') return ['male', 'children'];
    if (gender === 'child') return ['children'];
    return ['female', 'male', 'children'];
  }

  window.gidigbaGalleryHtml = function (kind, target) {
    if (!has(kind)) return '';
    const cats = catsFor(booking.data.gender);
    const title = kind === 'outfits' ? 'Our wardrobe' : 'Our hairstyles';
    return `
      <div class="gallery-picker" data-kind="${kind}" data-target="${target}">
        <p class="gp-title">${title}</p>
        <p class="gp-sub">Pick the one you like. If you would rather send your own, tap Change at the top.</p>
        <div class="gallery-tabs">
          ${cats.map((c, k) => `<button type="button" class="g-tab ${k === 0 ? 'active' : ''}" onclick="setGalleryCat(this, '${kind}', '${target}', '${c}')">${c.charAt(0).toUpperCase() + c.slice(1)}</button>`).join('')}
        </div>
        <div class="pick-grid" id="pickGrid_${target}"></div>
        <p class="pick-note" id="pickNote_${target}" hidden></p>
      </div>`;
  };

  window.setGalleryCat = function (btn, kind, target, cat) {
    btn.parentNode.querySelectorAll('.g-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderGrid(kind, target, cat);
  };

  function renderGrid(kind, target, cat) {
    const grid = document.getElementById('pickGrid_' + target);
    if (!grid) return;
    const list = (galleries()[kind] || {})[cat] || [];
    const pick = target === 'outfit' ? booking.data.outfitPick : booking.data.hairPick;
    if (!list.length) {
      grid.innerHTML = `<div class="pick-empty">No ${cat} options yet.</div>`;
      return;
    }
    grid.innerHTML = list.map((src, idx) =>
      `<img src="${src}" alt="${cat} ${kind === 'outfits' ? 'outfit' : 'hairstyle'} ${idx + 1}" loading="lazy"
            class="${pick && pick.cat === cat && pick.idx === idx ? 'picked' : ''}"
            onclick="pickGalleryItem('${target}', '${cat}', ${idx}, '${src}')">`
    ).join('');
  }

  window.pickGalleryItem = function (target, cat, idx, src) {
    const d = booking.data;
    const label = cat.charAt(0).toUpperCase() + cat.slice(1);
    if (target === 'outfit') d.outfitPick = { cat, idx, src };
    else d.hairPick = { cat, idx, src };

    const grid = document.getElementById('pickGrid_' + target);
    if (grid) grid.querySelectorAll('img').forEach(im => im.classList.remove('picked'));
    if (grid) { const im = grid.querySelectorAll('img')[idx]; if (im) im.classList.add('picked'); }

    const note = document.getElementById('pickNote_' + target);
    if (note) {
      note.hidden = false;
      note.innerHTML = `${target === 'outfit' ? 'Outfit' : 'Hairstyle'} ${idx + 1} picked (${label}) <button type="button" onclick="clearGalleryPick('${target}')">Change</button>`;
    }
    toast(`${target === 'outfit' ? 'Outfit' : 'Hairstyle'} picked`);
  };

  window.clearGalleryPick = function (target) {
    if (target === 'outfit') booking.data.outfitPick = null;
    else booking.data.hairPick = null;
    const grid = document.getElementById('pickGrid_' + target);
    if (grid) grid.querySelectorAll('img').forEach(im => im.classList.remove('picked'));
    const note = document.getElementById('pickNote_' + target);
    if (note) { note.hidden = true; note.innerHTML = ''; }
  };

  /* called after every step renders */
  window.restoreGallery = function () {
    ['outfit', 'hair'].forEach(target => {
      const kind = target === 'outfit' ? 'outfits' : 'styles';
      const grid = document.getElementById('pickGrid_' + target);
      if (!grid) return;
      const active = grid.closest('.gallery-picker').querySelector('.g-tab.active');
      renderGrid(kind, target, active ? active.textContent.toLowerCase() : catsFor(booking.data.gender)[0]);
      const pick = target === 'outfit' ? booking.data.outfitPick : booking.data.hairPick;
      if (pick) {
        const note = document.getElementById('pickNote_' + target);
        if (note) {
          note.hidden = false;
          note.innerHTML = `${target === 'outfit' ? 'Outfit' : 'Hairstyle'} ${pick.idx + 1} picked (${pick.cat.charAt(0).toUpperCase() + pick.cat.slice(1)}) <button type="button" onclick="clearGalleryPick('${target}')">Change</button>`;
        }
      }
    });
  };
})();
