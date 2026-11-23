"""The package decides how many outfits are asked for. Regression guard."""
import asyncio
from playwright.async_api import async_playwright
BASE = "http://localhost:8080"
EXPECT = {"SINGLE IMAGE":1, "LITE":1, "MEDIUM":2, "SUPERIOR":3,
          "COUPLE SILVER":1, "COUPLE GOLD":2, "COUPLE PLATINUM":3}

async def main():
    ok_all = True
    async with async_playwright() as pw:
        b = await pw.chromium.launch()
        p = await b.new_page(viewport={"width": 390, "height": 844})
        await p.goto(f"{BASE}/photoshoots.html", wait_until="domcontentloaded")
        for name, want in EXPECT.items():
            got = await p.evaluate("(n) => { localStorage.clear(); openPhotoBooking(n); return getOutfitCount(); }", name)
            status = "PASS" if got == want else "FAIL"
            if got != want: ok_all = False
            print(f"{status} {name}: expects {want}, engine says {got}")
        # and the boxes actually rendered for a 3-outfit package
        await p.evaluate("() => { localStorage.clear(); openPhotoBooking('SUPERIOR'); }")
        await p.wait_for_timeout(400)
        await p.evaluate("""() => {
            booking.stage='outfit'; booking.data.gender='female';
            booking.data.outfitSel='upload'; renderPhotoStep();
        }""")
        await p.wait_for_timeout(400)
        boxes = await p.locator('.upload-box[data-key^=outfitImg]').count()
        descs = await p.locator('textarea[data-outfit-desc]').count()
        print(f"{'PASS' if boxes==3 else 'FAIL'} SUPERIOR renders {boxes} outfit upload boxes (want 3)")
        print(f"{'PASS' if descs==3 else 'FAIL'} SUPERIOR renders {descs} description fields (want 3)")
        ok_all = ok_all and boxes == 3 and descs == 3
        await b.close()
    print("\n==== " + ("ALL PASSED" if ok_all else "FAILURES ABOVE") + " ====")

asyncio.run(main())
