/* ============================================================
   GIDIGBA CREATIVES · reviews (text first, images optional)
   Stored on this device in localStorage and pushed to the
   studio WhatsApp so every review reaches the owner directly.
   ============================================================ */
(function () {
  var STORE = 'gidigba_reviews_v1';
  var WA = '233534317611';
  var IMGBB = 'dbc0dad2f83bf9f24d8abad5e0afd3d1';

  function esc(s) {
    var d = document.createElement('div');
    d.textContent = String(s == null ? '' : s);
    return d.innerHTML;
  }

  function load() {
    try { return JSON.parse(localStorage.getItem(STORE)) || []; }
    catch (e) { return []; }
  }

  function save(list) {
    try { localStorage.setItem(STORE, JSON.stringify(list)); } catch (e) {}
  }

  function fmtDate(d) {
    var days = Math.floor((Date.now() - d) / 86400000);
    if (days <= 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 30) return days + ' days ago';
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function render() {
    var grid = document.getElementById('reviewsGrid');
    if (!grid) return;
    var list = load();
    if (!list.length) {
      grid.innerHTML =
        '<div class="review-empty">' +
          '<span class="k">Empty chair</span>' +
          '<h3>This list is waiting for its first owner.</h3>' +
          '<p>Worked with Gidigba? Say how it went, two lines is enough. Reviews land here the moment they are sent.</p>' +
          '<a class="btn btn-primary" href="#leave" style="margin-top:6px;">Leave a Review</a>' +
        '</div>';
      return;
    }
    grid.innerHTML = list.map(function (r, i) {
      var initials = esc((r.n || '?').trim().split(/\s+/).map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase());
      var meta = [r.b ? esc(r.b) : null, fmtDate(r.d)].filter(Boolean).join(' · ');
      return '<article class="review-card">' +
          '<div class="rev-head">' +
            '<span class="rev-avatar">' + initials + '</span>' +
            '<div><b>' + esc(r.n) + '</b><span>' + meta + '</span></div>' +
          '</div>' +
          (r.t ? '<p class="rev-text">' + esc(r.t) + '</p>' : '') +
          (r.img ? '<img class="rev-img" src="' + esc(r.img) + '" alt="Review attachment" loading="lazy">' : '') +
          '<div class="rev-foot">' +
            '<span class="rev-tag">Client review</span>' +
            '<button type="button" class="rev-del" data-i="' + i + '" title="Remove this review from this device">×</button>' +
          '</div>' +
        '</article>';
    }).join('');

    grid.querySelectorAll('.rev-del').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var cur = load();
        cur.splice(parseInt(btn.getAttribute('data-i'), 10), 1);
        save(cur);
        render();
      });
    });
  }

  function toast(msg) {
    var t = document.getElementById('revToast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'revToast';
      t.className = 'rev-toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(function () { t.classList.remove('show'); }, 3000);
  }

  function uploadImage(file) {
    var fd = new FormData();
    fd.append('image', file);
    return fetch('https://api.imgbb.com/1/upload?key=' + IMGBB, { method: 'POST', body: fd })
      .then(function (res) { return res.json(); })
      .then(function (j) {
        if (j && j.success && j.data && j.data.url) return j.data.url;
        throw new Error('upload failed');
      });
  }

  function init() {
    render();
    var form = document.getElementById('reviewForm');
    if (!form) return;
    var fileInput = document.getElementById('revImage');
    var fileName = document.getElementById('revFileName');
    var submitBtn = document.getElementById('revSubmit');

    fileInput.addEventListener('change', function () {
      var f = fileInput.files && fileInput.files[0];
      fileName.textContent = f ? 'Attached: ' + f.name : '';
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = document.getElementById('revName').value.trim();
      if (!name) { toast('Your name is the one thing we need.'); document.getElementById('revName').focus(); return; }
      var biz = document.getElementById('revBiz').value.trim();
      var text = document.getElementById('revText').value.trim();
      var file = fileInput.files && fileInput.files[0];

      submitBtn.disabled = true;
      var original = submitBtn.textContent;
      submitBtn.textContent = file ? 'Uploading...' : 'Publishing...';

      var done = function (imgUrl) {
        var review = { n: name, b: biz, t: text, img: imgUrl || '', d: Date.now() };
        var list = load();
        list.unshift(review);
        save(list);
        form.reset();
        fileName.textContent = '';
        render();
        toast('Review posted. Thanks for keeping it real.');

        var wa = 'Client review for Gidigba Creatives:%0A%0A' +
          encodeURIComponent(name + (biz ? ' (' + biz + ')' : '')) +
          (text ? '%0A%0A' + encodeURIComponent(text) : '') +
          (imgUrl ? '%0A%0AAttached image: ' + encodeURIComponent(imgUrl) : '');
        window.open('https://wa.me/' + WA + '?text=' + wa, '_blank');

        submitBtn.disabled = false;
        submitBtn.textContent = original;
      };

      if (file) {
        uploadImage(file).then(done).catch(function () {
          toast('Image upload failed, posting your review without it.');
          done('');
        });
      } else {
        done('');
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
