import os
import asyncio, json, sys
from playwright.async_api import async_playwright

BASE = "http://localhost:8080"
PAGES = ["index","about","services","photoshoots","work","brands","reviews","journal","track","voucher",
         "for-restaurants","for-real-estate","for-events"]

CONTRAST_JS = """
() => {
  const issues = [];
  const lum = (r,g,b) => { const f=c=>{c/=255; return c<=0.03928?c/12.92:Math.pow((c+0.055)/1.055,2.4);};
    return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b); };
  const ratio = (a,b) => { const L1=Math.max(a,b), L2=Math.min(a,b); return (L1+0.05)/(L2+0.05); };
  const parse = s => { const m=s.match(/rgba?\\(([^)]+)\\)/); if(!m) return null;
    const p=m[1].split(',').map(Number); return {r:p[0],g:p[1],b:p[2],a:p.length>3?p[3]:1}; };
  const effBg = el => {
    let n = el;
    while (n && n !== document.documentElement) {
      const cs = getComputedStyle(n);
      if (cs.backgroundImage && cs.backgroundImage.includes('url(')) return 'image';
      const c = parse(cs.backgroundColor);
      if (c && c.a > 0.85) return c;
      n = n.parentElement;
    }
    const b = parse(getComputedStyle(document.body).backgroundColor);
    return b && b.a > 0 ? b : {r:255,g:255,b:255,a:1};
  };
  const path = el => {
    let s = el.tagName.toLowerCase();
    if (el.id) s += '#'+el.id;
    if (el.className && typeof el.className==='string') s += '.'+el.className.trim().split(/\\s+/).slice(0,3).join('.');
    return s;
  };
  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el);
    if (cs.display==='none' || cs.visibility==='hidden' || parseFloat(cs.opacity) < 0.1) continue;
    const direct = [...el.childNodes].some(n => n.nodeType===3 && n.textContent.trim().length>1);
    if (!direct) continue;
    const rect = el.getBoundingClientRect();
    if (rect.width < 4 || rect.height < 4) continue;
    const fg = parse(cs.color);
    if (!fg || fg.a < 0.5) continue;
    const bg = effBg(el);
    if (bg === 'image') continue;
    const blended = fg.a < 1 ? {r: fg.r*fg.a+bg.r*(1-fg.a), g: fg.g*fg.a+bg.g*(1-fg.a), b: fg.b*fg.a+bg.b*(1-fg.a)} : fg;
    const cr = ratio(lum(fg.r,fg.g,fg.b), lum(bg.r,bg.g,bg.b));
    const fsz = parseFloat(cs.fontSize); const fw = parseInt(cs.fontWeight)||400;
    const large = fsz >= 24 || (fsz >= 18.66 && fw >= 700);
    const need = large ? 3.0 : 4.4;
    if (cr < need) issues.push({el: path(el), text: (el.textContent||'').trim().slice(0,48),
      color: cs.color, bg: `rgb(${bg.r},${bg.g},${bg.b})`, ratio: +cr.toFixed(2), need});
  }
  // dedupe by el+color
  const seen = new Set(); return issues.filter(i => { const k=i.el+i.color; if(seen.has(k)) return false; seen.add(k); return true; });
}
"""

THEME = os.environ.get("THEME", "light")

async def main():
    out = {"contrast": {}, "overflow": {}, "console": [], "func": []}
    async with async_playwright() as pw:
        browser = await pw.chromium.launch()
        ctx = await browser.new_context(viewport={"width":1280,"height":900})
        page = await ctx.new_page()
        page.on("console", lambda m: out["console"].append(f"{m.type}: {m.text[:160]}") if m.type in ("error",) else None)
        page.on("pageerror", lambda e: out["console"].append(f"pageerror: {str(e)[:160]}"))

        print(f"theme: {THEME}")
        for name in PAGES:
            await page.goto(f"{BASE}/{name}.html", wait_until="domcontentloaded")
            await page.wait_for_timeout(450)
            if THEME == "dark":
                await page.evaluate("document.documentElement.setAttribute('data-theme','dark')")
            # scroll pass to trigger reveals
            await page.evaluate("""async () => {
              const h = document.body.scrollHeight;
              for (let y=0; y<h; y+=700) { window.scrollTo(0,y); await new Promise(r=>setTimeout(r,40)); }
              window.scrollTo(0,0);
            }""")
            await page.wait_for_timeout(250)
            out["contrast"][name] = await page.evaluate(CONTRAST_JS)
            ov = await page.evaluate("() => document.documentElement.scrollWidth - document.documentElement.clientWidth")
            out["overflow"][name] = ov

        # mobile overflow spot-check
        mctx = await browser.new_context(viewport={"width":375,"height":812})
        mpage = await mctx.new_page()
        for name in PAGES:
            await mpage.goto(f"{BASE}/{name}.html", wait_until="domcontentloaded")
            await mpage.wait_for_timeout(300)
            if THEME == "dark":
                await mpage.evaluate("document.documentElement.setAttribute('data-theme','dark')")
            ov = await mpage.evaluate("() => document.documentElement.scrollWidth - document.documentElement.clientWidth")
            out["overflow"][name+"_m375"] = ov

        # ---- functional flows ----
        f = out["func"]
        #1 homepage editing button
        await page.goto(f"{BASE}/index.html", wait_until="domcontentloaded")
        await page.wait_for_timeout(400)
        await page.click("text=Image Editing from GH₵10")
        await page.wait_for_timeout(400)
        f.append(["home-edit-btn", await page.evaluate("() => { const m=document.getElementById('photoModal'); return {open: m && m.classList.contains('open'), step: window.booking && booking.step, tab: window.bookTab}; }")])
        await page.keyboard.press("Escape")

        #2 photoshoots tabs + rename + pose gating
        await page.goto(f"{BASE}/photoshoots.html", wait_until="domcontentloaded")
        await page.wait_for_timeout(500)
        names = await page.evaluate("() => [...document.querySelectorAll('#pkgGrid .pkg-name')].map(e=>e.textContent.trim())")
        f.append(["individual-tiles", names])
        inc = await page.evaluate("() => document.querySelector('#pkgGrid .pkg-card ul').innerText")
        f.append(["lite-inclusions", inc])
        await page.click("#pkgTabs .tab[data-pkgtype='couple']")
        await page.wait_for_timeout(300)
        cnames = await page.evaluate("() => [...document.querySelectorAll('#pkgGrid .pkg-name')].map(e=>e.textContent.trim())")
        f.append(["couple-tiles", cnames])
        cmp = await page.evaluate("() => [...document.querySelectorAll('.cmp-table tbody tr td:first-child')].map(e=>e.textContent.trim())")
        f.append(["cmp-col", cmp])
        # open LITE -> step2, no pose
        await page.click("#pkgTabs .tab[data-pkgtype='individual']")
        await page.wait_for_timeout(250)
        await page.evaluate("() => openPhotoBooking('LITE')")
        await page.wait_for_timeout(350)
        lite = await page.evaluate("() => ({step: booking.step, pose: !!document.getElementById('poseDesc'), pkg: booking.data.selectedPackage})")
        f.append(["lite-booking", lite])
        await page.evaluate("() => openPhotoBooking('SUPERIOR')")
        await page.wait_for_timeout(350)
        sup = await page.evaluate("() => ({step: booking.step, pose: !!document.getElementById('poseDesc'), pkg: booking.data.selectedPackage})")
        f.append(["superior-booking", sup])
        await page.evaluate("() => closeModal('photoModal')")

        #3 quiz rename mapping
        await page.evaluate("""() => {
          const click = txt => [...document.querySelectorAll('.quiz-opt')].find(b => b.textContent.includes(txt)).click();
          click('Just me'); click('Professional'); click('Go all out'); click('This week');
          quizResult();
        }""")
        await page.wait_for_timeout(300)
        q = await page.evaluate("() => document.getElementById('quizResult').innerText.slice(0,160)")
        f.append(["quiz-high", q])

        #4 voucher LITE
        await page.goto(f"{BASE}/voucher.html", wait_until="domcontentloaded")
        await page.wait_for_timeout(400)
        opts = await page.evaluate("() => [...document.querySelectorAll('#vPkg option')].map(o=>o.value)")
        f.append(["voucher-opts", opts])

        await browser.close()
    json.dump(out, open("/home/user/audit/theme_report.json","w"), indent=1)
    # print summary
    print("== CONTRAST ==")
    total = 0
    for k, v in out["contrast"].items():
        if v:
            total += len(v)
            print(f"{k}: {len(v)}")
            for i in v[:6]: print("   ", i)
    print("total contrast issues:", total)
    print("== OVERFLOW ==", {k:v for k,v in out["overflow"].items() if v>0} or "none")
    print("== CONSOLE =="); [print("  ", c) for c in out["console"][:12]] or print("  clean")
    print("== FUNC ==")
    for item in out["func"]: print("  ", item)

asyncio.run(main())
