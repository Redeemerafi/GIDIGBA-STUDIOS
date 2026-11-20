import sys, re, json, urllib.request, urllib.parse
from playwright.sync_api import sync_playwright

BASE = "http://localhost:8080/"
src = open("audit/theme_audit.py").read()
CJS = re.search(r'CONTRAST_JS = """(.*?)"""', src, re.S).group(1)

def api(url):
    with urllib.request.urlopen(BASE + "api/" + url, timeout=5) as r:
        return json.loads(r.read().decode())

results = []
def check(name, ok, detail=""):
    results.append((name, bool(ok)))
    print(("PASS" if ok else "FAIL"), "|", name, detail, flush=True)

with sync_playwright() as pw:
    b = pw.chromium.launch()
    ctx = b.new_context(viewport={"width": 1280, "height": 900})
    page = ctx.new_page()

    # 1. default = light
    page.goto(BASE, wait_until="networkidle")
    dt = page.evaluate("document.documentElement.getAttribute('data-theme')")
    ls = page.evaluate("localStorage.getItem('gidigba_theme')")
    bg = page.evaluate("getComputedStyle(document.body).backgroundColor")
    check("default theme is light", dt == "light" and ls in (None, "light"), f"theme={dt} ls={ls}")
    check("light body background cream", bg == "rgb(251, 249, 244)", bg)

    # 2. toggle -> dark, persists, icon swaps
    page.click("#themeToggle")
    dt = page.evaluate("document.documentElement.getAttribute('data-theme')")
    ls = page.evaluate("localStorage.getItem('gidigba_theme')")
    bg = page.evaluate("getComputedStyle(document.body).backgroundColor")
    sun_vis = page.is_visible("#themeToggle .tt-sun")
    moon_vis = page.is_visible("#themeToggle .tt-moon")
    check("toggle switches to dark", dt == "dark" and ls == "dark", f"theme={dt} ls={ls}")
    check("dark body background pastel dark", bg == "rgb(23, 23, 28)", bg)
    check("sun icon shows in dark", sun_vis and not moon_vis, f"sun={sun_vis} moon={moon_vis}")

    # 3. persists across navigation
    page.goto(BASE + "photoshoots.html", wait_until="networkidle")
    dt = page.evaluate("document.documentElement.getAttribute('data-theme')")
    bg = page.evaluate("getComputedStyle(document.body).backgroundColor")
    check("dark persists across pages", dt == "dark" and bg == "rgb(23, 23, 28)", f"theme={dt} bg={bg}")

    # 4. dark contrast on this page
    c = page.evaluate(CJS)
    check("dark contrast photoshoots", not c, f"{len(c)} issues")

    # 5. toggle back -> light
    page.click("#themeToggle")
    dt = page.evaluate("document.documentElement.getAttribute('data-theme')")
    ls = page.evaluate("localStorage.getItem('gidigba_theme')")
    bg = page.evaluate("getComputedStyle(document.body).backgroundColor")
    check("toggle back to light", dt == "light" and ls == "light" and bg == "rgb(251, 249, 244)", f"{dt} {ls} {bg}")

    # 6. fresh visitor (no storage) = light even after prior dark in another context
    ctx2 = b.new_context(viewport={"width": 1280, "height": 900})
    p2 = ctx2.new_page()
    p2.goto(BASE + "services.html", wait_until="networkidle")
    dt = p2.evaluate("document.documentElement.getAttribute('data-theme')")
    check("fresh visitor gets light", dt == "light", dt)

    # 7. photo booking engine still works in light (smoke)
    p2.evaluate("() => { clearDraft(); openPhotoBooking('LITE'); }")
    p2.wait_for_selector("#photoModal", state="visible")
    p2.wait_for_selector("#photoAbout")
    check("photo booking opens (smoke)", p2.is_visible("#photoAbout"))
    p2.keyboard.press("Escape")

    # 8. toggle button exists on every page + layout sanity at dark
    PAGES = ["index.html","about.html","services.html","photoshoots.html","work.html","brands.html","reviews.html","journal.html","track.html","voucher.html","for-restaurants.html","for-real-estate.html","for-events.html"]
    missing = []
    for pg in PAGES:
        p2.goto(BASE + pg, wait_until="networkidle")
        p2.evaluate("document.documentElement.setAttribute('data-theme','dark')")
        if p2.evaluate("!!document.getElementById('themeToggle')") is not True:
            missing.append(pg)
        ov = p2.evaluate("document.documentElement.scrollWidth - document.documentElement.clientWidth")
        if ov > 4: missing.append(f"{pg} overflow-dark {ov}")
    check("toggle on all13 pages + no dark overflow", not missing, str(missing))

    b.close()

npass = sum(1 for _, ok in results if ok)
print(f"THEME {npass}/{len(results)}")
sys.exit(0 if npass == len(results) else 1)
