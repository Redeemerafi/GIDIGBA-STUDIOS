/* ============================================================
   Compatibility layer.
   The ported pages were written against the old engine's function
   names. Their booking engine stays untouched — this file only
   supplies what the ported pages need, and delegates to it.
   ============================================================ */
(function () {
  const WA = '233534317611';
  const openWA = (msg) => window.open(`https://wa.me/${WA}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');

  /* ---- booking entry points ---- */
  // openBooking('individual' | 'couple' | 'EDIT') from the package cards
  if (typeof window.openBooking !== 'function') {
    window.openBooking = function (kind) {
      const map = { individual: 'SINGLE', couple: 'CSILVER', EDIT: 'EDIT' };
      const key = map[kind] || 'SINGLE';
      if (typeof openBooking === 'function') { try { return openBooking(key); } catch (e) {} }
      // their engine names it openBooking too, so this only runs if signatures drift
      location.href = 'photoshoots.html';
    };
  }

  if (typeof window.openBookingChoice !== 'function') {
    window.openBookingChoice = function (which) {
      if (which === 'business') {
        openWA('Hello GIDIGBA STUDIOS — I would like to discuss a business project.');
      } else {
        location.href = 'photoshoots.html';
      }
    };
  }

  if (typeof window.sharePkg !== 'function') window.sharePkg = function () {
    openWA('Hello GIDIGBA STUDIOS — I have a question about packages.');
  };

  /* ---- tracking: local drafts + submissions from this device ---- */
  if (typeof window.initTrack !== 'function') {
    window.initTrack = function () {
      const el = document.getElementById('trackResult');
      if (!el) return;
      let draft = null, submitted = [], orders = [];
      try { draft = JSON.parse(localStorage.getItem('gidigba_photo_draft') || 'null'); } catch (e) {}
      try { submitted = JSON.parse(localStorage.getItem('gidigba_submissions') || '[]'); } catch (e) {}
      try { orders = JSON.parse(localStorage.getItem('gidigba_orders') || '[]'); } catch (e) {}
      if (!draft && !submitted.length && !orders.length) {
        el.innerHTML = `<div class="card">
          <h2>Nothing tracked on this device yet</h2>
          <p style="color:var(--muted);margin-top:8px">Once you start a booking, its progress shows here.</p>
          <a class="btn btn-primary" style="margin-top:18px" href="photoshoots.html">Start a Photoshoot</a>
        </div>`;
        return;
      }
      let html = '';
      // orders made through the current booking flow each carry their own number
      if (orders.length) {
        const fmt = ts => { try { return new Date(ts).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }); } catch (e) { return '—'; } };
        html += orders.map(o => `
          <div class="order-card">
            <div class="order-no">${o.orderNo}</div>
            <div class="order-meta">${o.pkg || 'Photoshoot'}${o.price ? ' · GH₵ ' + o.price : ''} · ${fmt(o.when)}</div>
            <div class="order-chip" data-status="${o.status || 'started'}">${o.status === 'sent' ? 'Sent on WhatsApp' : 'Started'}</div>
          </div>`).join('');
        html += `<p class="order-meta" style="text-align:center;margin:0 0 20px;font-size:13px;color:var(--muted)">
          Quote this number when you message us and we can find your order straight away.</p>`;
      }
      if (draft) {
        const d = draft.data || {};
        html += `<div class="card" style="margin-bottom:16px">
          <span class="card-kicker">In progress</span>
          <h2>${d.selectedPackage || 'Photoshoot'} booking</h2>
          <p style="color:var(--muted);margin-top:6px">Started on this device. Finish it to send your details.</p>
          <a class="btn btn-primary" style="margin-top:16px" href="photoshoots.html">Continue booking</a>
        </div>`;
      }
      submitted.forEach(s => {
        html += `<div class="card" style="margin-bottom:16px">
          <span class="card-kicker">Submitted</span>
          <h2>${s.pkg || 'Photoshoot'}</h2>
          <p style="color:var(--muted);margin-top:6px">Sent to WhatsApp on ${s.date || '—'}.</p>
        </div>`;
      });
      el.innerHTML = html;
    };
  }

  /* ---- vouchers ---- */
  if (typeof window.voucherGen !== 'function') {
    window.voucherGen = function () {
      const val = (id) => (document.getElementById(id) || {}).value || '';
      const to = val('vTo') || 'Someone special';
      const from = val('vFrom') || 'A friend';
      const pkg = val('vPkg') || 'Photo shoot';
      const occ = val('vOccasion') || 'Just because';
      openWA(`*GIDIGBA Gift Voucher*\n\nTo: ${to}\nFrom: ${from}\nOccasion: ${occ}\nGift: ${pkg}\n\nRedeem at gidigba.studios — 100% online, delivered within 24 business hours.`);
    };
  }

  if (typeof window.shareReferral !== 'function') {
    window.shareReferral = function () {
      openWA('Hello GIDIGBA STUDIOS — I would like to refer a friend.');
    };
  }

  /* ---- run per-page init ---- */
  document.addEventListener('DOMContentLoaded', () => {
    const page = document.body.dataset.page;
    if (page === 'track' && typeof window.initTrack === 'function') window.initTrack();
    if (page === 'voucher' && typeof window.voucherGen === 'function') { /* bound to its button */ }
  });
})();
