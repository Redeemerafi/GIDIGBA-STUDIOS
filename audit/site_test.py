"""Full regression for the v2 site (their layout, all pages)."""
import asyncio, sys
from playwright.async_api import async_playwright

BASE = "http://localhost:8090"
PAGES = ["index.html","photoshoots.html","work.html","samples-female.html","samples-male.html",
         "services.html","about.html","reviews.html","journal.html","brands.html","track.html",
         "voucher.html","for-restaurants.html","for-real-estate.html","for-events.html","404.html"]
EXPECT_OUTFITS = {"SINGLE":1,"LITE":1,"MEDIUM":2,"SUPERIOR":3,"CSILVER":1,"CGOLD":2,"CPLAT":3}
ok = fail = 0
def chk(name, cond, detail=""):
    global ok, fail
    if cond: ok += 1
    else: fail += 1; print(f"FAIL {name} :: {detail}")

async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch()

        # --- every page: chrome, title, no broken images, no page errors
        p = await b.new_page(viewport={"width":1280,"height":900})
        for pg in PAGES:
            errs = []
            p.on("pageerror", lambda e: errs.append(str(e)[:80]))
            r = await p.goto(f"{BASE}/{pg}", wait_until="networkidle")
            await p.wait_for_timeout(250)
            m = await p.evaluate("""() => ({
                h: !!document.querySelector('.site-header'),
                f: !!document.querySelector('.site-footer'),
                t: (document.title || '').length,
                broken: [...document.images].filter(i => i.complete && i.naturalWidth === 0).length,
                len: document.querySelector('main')?.textContent.trim().length || 0})""")
            chk(f"{pg} 200", r.status == 200, r.status)
            chk(f"{pg} header", m["h"])
            chk(f"{pg} footer", m["f"])
            chk(f"{pg} title", m["t"] > 10, m["t"])
            chk(f"{pg} images", m["broken"] == 0, m["broken"])
            chk(f"{pg} content", m["len"] > 200, m["len"])
            chk(f"{pg} no errors", not errs, errs)
        await p.close()

        # --- outfit counts follow the package
        p = await b.new_page(viewport={"width":390,"height":844})
        await p.goto(f"{BASE}/photoshoots.html", wait_until="networkidle")
        for pkg, want in EXPECT_OUTFITS.items():
            got = await p.evaluate("""(pkg) => {
                openBooking('individual');
                booking.data.package = pkg; booking.stages = ['outfit']; booking.step = 0;
                booking.data.outfitSel = 'upload'; renderStep();
                return document.querySelectorAll('.upload-zone').length;
            }""", pkg)
            chk(f"outfits {pkg}", got == want, f"got {got} want {want}")

        # --- booking reaches review
        await p.goto(f"{BASE}/photoshoots.html", wait_until="networkidle")
        await p.evaluate("() => openBooking('individual')")
        await p.wait_for_timeout(300)
        await p.evaluate("""() => {
            selectChoice('package','MEDIUM'); buildStages();
            booking.data.gender='female';
            booking.data.files.selfie={file:new File(['x'],'a.jpg',{type:'image/jpeg'})};
            booking.data.files.fullbody={file:new File(['x'],'b.jpg',{type:'image/jpeg'})};
            booking.data.outfitSel='styled'; booking.data.styleMe=true;
            booking.data.hairSel='styled';
            booking.data.about='test shoot'; booking.data.disclaimer=true;
            booking.step = booking.stages.length - 1; renderStep();
        }""")
        await p.wait_for_timeout(400)
        chk("reaches review", await p.evaluate("() => stageName()") == "review",
            await p.evaluate("() => stageName()"))
        chk("review renders", await p.evaluate("() => document.querySelector('.modal').textContent.length") > 200)
        await p.close()
        await b.close()
    print(f"\n==== {ok} passed, {fail} failed ====")
    sys.exit(1 if fail else 0)

asyncio.run(main())
