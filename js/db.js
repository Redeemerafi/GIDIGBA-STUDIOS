/* ============================================================
   GIDIGBA STUDIOS — thin Supabase client
   No SDK: a couple of fetches keeps the site light and avoids a CDN
   dependency (the site must work from a plain file too).
   ============================================================ */
(function () {
  const CFG = window.GIDIGBA_DB || {};
  const ready = !!(CFG.url && CFG.key);

  function headers(extra) {
    return Object.assign({
      'apikey': CFG.key,
      'Authorization': 'Bearer ' + (session()?.access_token || CFG.key),
      'Content-Type': 'application/json'
    }, extra || {});
  }

  function session() {
    try { return JSON.parse(localStorage.getItem('gidigba_admin_session') || 'null'); } catch (e) { return null; }
  }
  function setSession(s) {
    if (s) localStorage.setItem('gidigba_admin_session', JSON.stringify(s));
    else localStorage.removeItem('gidigba_admin_session');
  }

  async function call(path, opts) {
    if (!ready) throw new Error('NOT_CONFIGURED');
    const res = await fetch(CFG.url.replace(/\/$/, '') + path, Object.assign({ headers: headers() }, opts || {}));
    const text = await res.text();
    let body = null;
    try { body = text ? JSON.parse(text) : null; } catch (e) { body = text; }
    if (!res.ok) {
      const msg = (body && (body.message || body.error_description || body.error || body.msg)) || res.status;
      throw new Error(msg);
    }
    return body;
  }

  window.GDB = {
    ready,
    session,
    setSession,

    /* ---- auth ---- */
    async signIn(email, password) {
      const s = await call('/auth/v1/token?grant_type=password', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      setSession(s);
      return s;
    },
    async signUp(email, password) {
      return call('/auth/v1/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
    },
    async signOut() {
      const s = session();
      if (s?.access_token) {
        try {
          await call('/auth/v1/logout', { method: 'POST' });
        } catch (e) { /* token already gone is fine */ }
      }
      setSession(null);
    },
    user() { return session()?.user || null; },

    /* ---- orders ---- */
    async createOrder(o) {
      return call('/rest/v1/orders', {
        method: 'POST',
        headers: headers({ 'Prefer': 'return=representation' }),
        body: JSON.stringify(o)
      });
    },
    async listOrders() {
      return call('/rest/v1/orders?select=*&order=created_at.desc');
    },
    async updateOrder(id, patch) {
      return call('/rest/v1/orders?id=eq.' + encodeURIComponent(id), {
        method: 'PATCH',
        headers: headers({ 'Prefer': 'return=representation' }),
        body: JSON.stringify(patch)
      });
    },
    async deleteOrder(id) {
      return call('/rest/v1/orders?id=eq.' + encodeURIComponent(id), { method: 'DELETE' });
    },

    /* ---- stats for the dashboard ---- */
    async counts() {
      const rows = await call('/rest/v1/orders?select=status');
      const out = {};
      (rows || []).forEach(r => { out[r.status] = (out[r.status] || 0) + 1; });
      return out;
    }
  };
})();
