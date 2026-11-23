"""Guard: images must actually fill their grid. A collapsed <img> is a bug."""
import asyncio
from playwright.async_api import async_playwright

BASE = "http://localhost:8080"

CHECKS = [
    ("index.html",        ".smp-cell img",  ".smp-collage", 2),
    ("work.html",         ".smp-preview img",".smp-choices", 2),
    ("samples-male.html", ".smp-item img",  ".smp-grid",    5),
    ("samples-female.html",".smp-item img", ".smp-grid",    13),
]

async def main():
    fails = []
    async with async_playwright() as pw:
        b = await pw.chromium.launch()
        for width in (390, 672, 768, 1024, 1440):
            p = await b.new_page(viewport={"width": width, "height": 900})
            for page, imgsel, gridsel, min_count in CHECKS:
                await p.goto(f"{BASE}/{page}", wait_until="domcontentloaded")
                await p.wait_for_timeout(500)
                r = await p.evaluate("""([imgsel, gridsel, minCount]) => {
                    const imgs = [...document.querySelectorAll(imgsel)];
                    const grid = document.querySelector(gridsel);
                    if (!grid || !imgs.length) return { missing: true };
                    const gw = grid.getBoundingClientRect().width;
                    const widest = Math.max(...imgs.map(i => i.getBoundingClientRect().width));
                    const shrunk = imgs.filter(i => i.getBoundingClientRect().width < gw * 0.10).length;
                    return { count: imgs.length, gw: Math.round(gw), widest: Math.round(widest), shrunk };
                }""", [imgsel, gridsel, min_count])
                if r.get("missing"):
                    fails.append(f"{page} @{width}: no {imgsel} inside {gridsel}")
                    continue
                if r["count"] < min_count:
                    fails.append(f"{page} @{width}: only {r['count']} images, want {min_count}")
                if r["shrunk"]:
                    fails.append(f"{page} @{width}: {r['shrunk']} image(s) collapsed (<10% of grid)")
                elif r["widest"] < r["gw"] * 0.18:
                    fails.append(f"{page} @{width}: widest image {r['widest']}px in a {r['gw']}px grid")
            await p.close()
        await b.close()
    for f in fails:
        print("FAIL", f)
    print(f"\n==== {len(fails)} failures ====" if fails else "\n==== ALL PASSED ====")

asyncio.run(main())
