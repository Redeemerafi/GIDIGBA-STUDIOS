import asyncio, os, subprocess, sys, time
from playwright.async_api import async_playwright

BASE = os.environ.get("BASE", "http://localhost:8080")
if not BASE.startswith("http"):
    subprocess.run([sys.executable, "-m", "http.server", "8080", "--directory", BASE], check=True)
time.sleep(2)

passed = []; failed = []
def ok(name, cond, detail=""):
    (passed if cond else failed).append(name + (f" :: {detail}" if detail and not cond else ""))

async def main():
    async with async_playwright() as pw:
        browser = await pw.chromium.launch()
        page = await browser.new_page(viewport={"width": 1280, "height": 900})
        errs = []
        page.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)

        await page.goto(f"{BASE}/index.html", wait_until="domcontentloaded")
        await page.wait_for_timeout(1200)

        dom = await page.evaluate("""async () => {
            await document.fonts.ready;
            return {
                inter: document.fonts.check('16px Inter'),
                playfair: document.fonts.check('24px "Playfair Display"'),
                theme: document.documentElement.getAttribute('data-theme'),
                bg: getComputedStyle(document.body).backgroundColor,
                heroExists: !!document.querySelector('section.hero'),
                heroBg: getComputedStyle(document.querySelector('section.hero')).backgroundColor,
                h1w: getComputedStyle(document.querySelector('.brand-name')).fontWeight,
                outlineColor: getComputedStyle(document.querySelector('.brand-name .outline')).color,
                outlineBg: getComputedStyle(document.querySelector('.brand-name .outline')).backgroundImage,
                pill: getComputedStyle(document.querySelector('.btn-primary')).borderRadius,
                btnBg: getComputedStyle(document.querySelector('.btn-primary')).backgroundColor,
                navBlur: getComputedStyle(document.querySelector('.nav')).backdropFilter,
                navBg: getComputedStyle(document.querySelector('.nav')).backgroundColor,
                cardR: getComputedStyle(document.querySelector('.sol-card')).borderRadius,
                altBg: getComputedStyle(document.querySelector('.section-alt')).backgroundColor,
                ctaBg: getComputedStyle(document.querySelector('.cta-band')).backgroundImage,
                pillars: [...document.querySelectorAll('.pillar-card h3')].map(h => h.textContent.trim()),
                html: document.body.innerHTML,
                imgBad: [...document.images].filter(i => i.complete && i.naturalWidth === 0).length
            };
        }""")

        ok("THEME11: Inter loaded", dom["inter"])
        ok("THEME11: Playfair loaded", dom["playfair"])
        ok("THEME11: light body white", dom["theme"] == "light" and dom["bg"] == "rgb(255, 255, 255)", dom["bg"])
        ok("THEME11: hero black band", dom["heroExists"] and dom["heroBg"] == "rgb(0, 0, 0)", str(dom["heroBg"]))
        ok("THEME11: h1 Inter light300", dom["h1w"] == "300", dom["h1w"])
        ok("THEME11: outline transparent fill", dom["outlineColor"] in ("rgba(0, 0, 0, 0)", "transparent"), dom["outlineColor"])
        ok("THEME11: lime gradient text", "192, 245, 0" in dom["outlineBg"] or "192,245,45" in dom["outlineBg"], dom["outlineBg"][:80])
        ok("THEME11: lime pill", dom["pill"] == "9999px" and dom["btnBg"] == "rgb(192, 245, 0)", f'{dom["pill"]} {dom["btnBg"]}')
        ok("THEME11: nav dark blur20", "blur(20px)" in dom["navBlur"] and dom["navBg"].startswith("rgba(0, 0, 0, 0.8"), f'{dom["navBlur"]} {dom["navBg"]}')
        ok("THEME11: cards16px", dom["cardR"] == "16px", dom["cardR"])
        ok("THEME11: section-alt black", dom["altBg"] == "rgb(0, 0, 0)", dom["altBg"])
        ok("THEME11: cta lime gradient", "192, 245, 0" in dom["ctaBg"], dom["ctaBg"][:80])
        ok("THEME11: pillars GIDIGBA values", dom["pillars"] == ["ONLINE", "SPEED", "VALUE"], str(dom["pillars"]))
        ok("THEME11: no banned strings", "Class. Tech. Future." not in dom["html"] and "Under Radikal" not in dom["html"] and "RADIKAL" not in dom["html"])
        ok("THEME11: no broken images", dom["imgBad"] == 0, str(dom["imgBad"]))

        # dark mode
        await page.click("#themeToggle")
        await page.wait_for_timeout(400)
        d = await page.evaluate("""() => ({
            theme: document.documentElement.getAttribute('data-theme'),
            bg: getComputedStyle(document.body).backgroundColor
        })""")
        ok("THEME11: dark bg black", d["theme"] == "dark" and d["bg"] == "rgb(0, 0, 0)", d["bg"])
        await page.click("#themeToggle")
        await page.wait_for_timeout(300)

        # interactions
        await page.click("text=Image Editing from GH₵10")
        await page.wait_for_timeout(400)
        modal = await page.evaluate("() => !!document.querySelector('#photoModal.open')")
        ok("THEME11: editing CTA opens modal", modal)
        await page.evaluate("() => closeModal('photoModal')")
        await page.evaluate("() => showHowTab('b')")
        b = await page.evaluate("() => document.getElementById('howPanelB').hidden === false && document.getElementById('howPanelI').hidden === true")
        ok("THEME11: how-tab business", b)
        await page.evaluate("() => filterTransform(document.querySelectorAll('#transGrid') && document.querySelectorAll('.section-alt .filter-row .chip')[1], 'personal')")
        f = await page.evaluate("""() => {
            const vis = [...document.querySelectorAll('#transGrid .trans-item')].filter(i => i.style.display !== 'none').length;
            return vis;
        }""")
        ok("THEME11: transform filter", f == 3, str(f))
        await page.evaluate("() => filterTransform(document.querySelectorAll('.section-alt .filter-row .chip')[0], 'all')")

        # console clean
        ok("CONSOLE: clean", not errs, str(errs[:3]))
        await browser.close()

asyncio.run(main())
for n in passed: print("PASS:", n)
for n in failed: print("FAIL:", n)
print("passed:", len(passed), "failed:", len(failed))
if failed:
    sys.exit(1)
