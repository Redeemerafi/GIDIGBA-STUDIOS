/* ============================================================
   GIDIGBA STUDIOS — orders admin
   Sign in, see every booking, move it along, reply on WhatsApp.
   ============================================================ */
(function () {
  const $ = s => document.querySelector(s);
  const STATUSES = [
    ['new', 'New'],
    ['confirmed', 'Confirmed'],
    ['shooting', 'In progress'],
    ['delivered', 'Delivered'],
    ['cancelled', 'Cancelled']
  ];
  const STATUS_LABEL = Object.fromEntries(STATUSES);

  let all = [];

  const esc = s => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  /* a number we can actually dial: Ghanaian local 024… becomes 233 24… */
  function waLink(phone, text) {
    let d = String(phone || '').replace(/[^\d]/g, '');
    if (!d) return null;
    if (d.startsWith('0')) d = '233' + d.slice(1);
    if (d.length === 9) d = '233' + d;
    return 'https://wa.me/' + d + (text ? '?text=' + encodeURIComponent(text) : '');
  }

  /* a reply that is ready to send, so nothing is typed twice */
  function replyText(o) {
    const first = String(o.customer_name || '').trim().split(/\s+/)[0];
    let t = `${first ? 'Hello ' + first + ',' : 'Hello,'} thank you for booking with GIDIGBA STUDIOS.\n\n`;
    t += `Your order number is ${o.order_no}`;
    if (o.package) t += ` (${o.package}${o.price ? ' — GH₵ ' + o.price : ''})`;
    t += `.\nWe have your photo(s) — finished images within 24 business hours.\n\n`;
    t += `Any questions, just reply here and quote ${o.order_no}.`;
    return t;
  }

  function when(ts) {
    const d = new Date(ts);
    const now = new Date();
    const sameDay = d.toDateString() === now.toDateString();
    const t = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    return sameDay ? 'Today ' + t : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ' · ' + t;
  }

  function ago(ts) {
    const mins = Math.round((Date.now() - new Date(ts).getTime()) / 60000);
    if (mins < 60) return mins + 'm ago';
    if (mins < 1440) return Math.round(mins / 60) + 'h ago';
    return Math.round(mins / 1440) + 'd ago';
  }

  function money(v) { return v == null ? '' : 'GH₵ ' + Number(v).toLocaleString('en-GH'); }

  /* ---------- boot ---------- */
  function show(id) { ['cfgNotice', 'signInBox', 'signUpBox', 'dashBox'].forEach(x => { $('#' + x).hidden = (x !== id); }); }

  if (!window.GDB || !GDB.ready) { show('cfgNotice'); return; }
  if (GDB.user()) { show('dashBox'); start(); } else { show('signInBox'); }

  /* ---------- sign in ---------- */
  $('#signInForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = $('#signInBtn'), err = $('#signInErr');
    btn.disabled = true; btn.textContent = 'Signing in…'; err.hidden = true;
    try {
      await GDB.signIn($('#email').value.trim(), $('#password').value);
      show('dashBox'); start();
    } catch (ex) {
      err.textContent = /invalid/i.test(ex.message) ? 'Wrong email or password.' : ex.message;
      err.hidden = false;
    } finally {
      btn.disabled = false; btn.textContent = 'Sign in';
    }
  });

  $('#showSignUp')?.addEventListener('click', e => { e.preventDefault(); show('signUpBox'); });
  $('#showSignIn')?.addEventListener('click', e => { e.preventDefault(); show('signInBox'); });

  $('#signUpForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = $('#signUpBtn'), err = $('#signUpErr'), ok = $('#signUpOk');
    btn.disabled = true; btn.textContent = 'Creating…'; err.hidden = true; ok.hidden = true;
    try {
      await GDB.signUp($('#suEmail').value.trim(), $('#suPass').value);
      ok.textContent = 'Account created. Check your email for the confirmation link, click it, then sign in here.';
      ok.hidden = false;
      btn.textContent = 'Account created';
    } catch (ex) {
      err.textContent = ex.message;
      err.hidden = false;
      btn.disabled = false; btn.textContent = 'Create account';
    }
  });

  $('#signOutBtn')?.addEventListener('click', async () => {
    await GDB.signOut(); show('signInBox');
  });
  $('#refreshBtn')?.addEventListener('click', load);

  /* ---------- data ---------- */
  async function start() {
    const u = GDB.user();
    const who = $('#whoami');
    if (who) who.textContent = u?.email || 'staff';
    await load();
  }

  async function load() {
    const list = $('#orderList');
    if (list) list.innerHTML = '<p class="admin-empty">Loading…</p>';
    try {
      all = (await GDB.listOrders()) || [];
      render();
    } catch (ex) {
      if (list) list.innerHTML = `<div class="admin-notice"><h2>Could not load orders</h2><p>${esc(ex.message)}</p>
        <p class="admin-sub">If this says permission denied, your email has not been added to the <code>admins</code> table yet.</p></div>`;
    }
  }

  function render() {
    renderStats();
    renderList();
  }

  function renderStats() {
    const row = $('#statRow');
    if (!row) return;
    const c = {};
    all.forEach(o => { c[o.status] = (c[o.status] || 0) + 1; });
    const today = all.filter(o => new Date(o.created_at).toDateString() === new Date().toDateString()).length;
    const money30 = all
      .filter(o => Date.now() - new Date(o.created_at).getTime() < 30 * 864e5 && o.status !== 'cancelled')
      .reduce((s, o) => s + (Number(o.price) || 0), 0);
    const cells = [
      ['Total', all.length],
      ['Today', today],
      ['New', c.new || 0],
      ['In progress', c.shooting || 0],
      ['Delivered', c.delivered || 0],
      ['Last 30 days', money(money30)]
    ];
    row.innerHTML = cells.map(([k, v]) =>
      `<div class="stat"><span>${k}</span><strong>${v}</strong></div>`).join('');
  }

  function renderList() {
    const box = $('#orderList');
    if (!box) return;
    const q = ($('#search')?.value || '').trim().toLowerCase();
    const st = $('#statusFilter')?.value || '';

    let rows = all.slice();
    if (st) rows = rows.filter(o => o.status === st);
    if (q) {
      rows = rows.filter(o =>
        [o.order_no, o.customer_name, o.phone, o.package, o.about, o.notes]
          .some(v => String(v || '').toLowerCase().includes(q)));
    }

    $('#emptyMsg').hidden = !(all.length === 0);
    if (!rows.length) { box.innerHTML = all.length ? '<p class="admin-empty">Nothing matches that filter.</p>' : ''; return; }

    box.innerHTML = rows.map(o => {
      const wa = waLink(o.phone, replyText(o));
      const items = [
        o.package ? `<span><b>Package</b> ${esc(o.package)}${o.price ? ' · ' + money(o.price) : ''}</span>` : '',
        o.gender ? `<span><b>For</b> ${esc(o.gender)}</span>` : '',
        o.photo_count ? `<span><b>Photos</b> ${o.photo_count}</span>` : '',
        o.hurry ? `<span><b>Priority</b> requested</span>` : '',
        o.about ? `<span class="wide"><b>About</b> ${esc(o.about)}</span>` : '',
        o.notes ? `<span class="wide"><b>Notes</b> ${esc(o.notes)}</span>` : '',
        (o.edits && o.edits.length) ? `<span class="wide"><b>Edits</b> ${esc(o.edits.join(', '))}</span>` : ''
      ].filter(Boolean).join('');

      return `
      <article class="order" data-id="${esc(o.id)}" data-status="${esc(o.status)}">
        <header class="order-head">
          <div>
            <div class="order-id">${esc(o.order_no)}</div>
            <div class="order-time">${when(o.created_at)} · ${ago(o.created_at)}</div>
          </div>
          <div class="order-head-right">
            <span class="status-dot" data-status="${esc(o.status)}">${esc(STATUS_LABEL[o.status] || o.status)}</span>
            ${o.customer_name ? `<div class="order-name">${esc(o.customer_name)}</div>` : ''}
            ${wa ? `<a class="order-wa" href="${wa}" target="_blank" rel="noopener">${esc(o.phone)}</a>`
                 : `<div class="order-name muted">no number</div>`}
          </div>
        </header>
        <div class="order-body">${items || '<span class="muted">No details</span>'}</div>
        ${(o.photo_paths && o.photo_paths.length) ? `
        <div class="order-photos">
          ${o.photo_paths.map((u, i) => `
            <a href="${esc(u)}" target="_blank" rel="noopener" class="order-photo" title="Open full size">
              <img src="${esc(u)}" alt="Photo ${i + 1}" loading="eager" decoding="async" />
              <span>Photo ${i + 1}</span>
            </a>`).join('')}
        </div>` : ''}
        <footer class="order-foot">
          <label>Progress
            <select class="status-select" data-id="${esc(o.id)}">
              ${STATUSES.map(([v, l]) => `<option value="${v}"${o.status === v ? ' selected' : ''}>${l}</option>`).join('')}
            </select>
          </label>
          ${wa ? `<a class="btn btn-primary btn-sm" href="${wa}" target="_blank" rel="noopener">Reply on WhatsApp</a>` : ''}
          <button class="btn btn-ghost btn-sm note-btn" data-id="${esc(o.id)}" type="button">Note</button>
          <button class="btn btn-ghost btn-sm del-btn" data-id="${esc(o.id)}" type="button">Delete</button>
        </footer>
      </article>`;
    }).join('');
  }

  /* ---------- interactions ---------- */
  document.addEventListener('change', async e => {
    const sel = e.target.closest('.status-select');
    if (!sel) return;
    const id = sel.dataset.id;
    const status = sel.value;
    sel.disabled = true;
    try {
      await GDB.updateOrder(id, { status });
      const row = all.find(o => o.id === id);
      if (row) row.status = status;
      render();
    } catch (ex) {
      alert('Could not save: ' + ex.message);
      sel.disabled = false;
    }
  });

  document.addEventListener('click', async e => {
    const del = e.target.closest('.del-btn');
    if (del) {
      if (!confirm('Delete this order? This cannot be undone.')) return;
      try {
        await GDB.deleteOrder(del.dataset.id);
        all = all.filter(o => o.id !== del.dataset.id);
        render();
      } catch (ex) { alert('Could not delete: ' + ex.message); }
      return;
    }
    const note = e.target.closest('.note-btn');
    if (note) {
      const row = all.find(o => o.id === note.dataset.id);
      const val = prompt('Note for this order (only staff see this):', row?.admin_note || '');
      if (val == null) return;
      try {
        await GDB.updateOrder(note.dataset.id, { admin_note: val });
        if (row) row.admin_note = val;
        toast('Note saved');
      } catch (ex) { alert('Could not save: ' + ex.message); }
    }
  });

  $('#search')?.addEventListener('input', renderList);
  $('#statusFilter')?.addEventListener('change', renderList);

  function toast(msg) {
    const t = document.createElement('div');
    t.className = 'admin-toast'; t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2200);
  }
})();
