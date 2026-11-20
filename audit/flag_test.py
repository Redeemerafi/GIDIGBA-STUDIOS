import asyncio, base64
from playwright.async_api import async_playwright
BASE = "http://localhost:8080"
PNG = base64.b64decode("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==")
FILES = [{"name":"t.png","mimeType":"image/png","buffer":PNG}]
R=[]
def ok(n,c,d=""): R.append(c); print((("PASS " if c else "FAIL ")+n+(("" if c else f" << {d}"))))

async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch()
        ctx = await b.new_context(viewport={"width":1280,"height":900})
        pg = await ctx.new_page()
        errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)[:120]))
        await pg.goto(f"{BASE}/photoshoots.html", wait_until="domcontentloaded"); await pg.wait_for_timeout(500)
        await pg.evaluate("() => { clearDraft(); openPhotoBooking('LITE'); }")
        await pg.wait_for_timeout(300)
        # walk the wizard to the notes stage (where photoAbout + disclaimer live)
        await pg.evaluate("() => setGender('female')")
        await pg.evaluate("() => photoNextStep()")                       # → selfie
        await pg.wait_for_timeout(200)
        await pg.set_input_files('.upload-box[data-key="selfie"] input[type=file]', FILES)
        await pg.set_input_files('.upload-box[data-key="fullbody"] input[type=file]', FILES)
        await pg.evaluate("() => photoNextStep()")                       # → outfit
        await pg.wait_for_timeout(200)
        await pg.evaluate("() => setFlowSel('outfit','upload')")
        await pg.fill("#outfitDesc", "navy suit")
        await pg.evaluate("() => photoNextStep()")                       # → hair
        await pg.wait_for_timeout(200)
        await pg.evaluate("() => setFlowSel('hair','upload')")
        await pg.fill("#hairstyle1", "braids")
        await pg.evaluate("() => photoNextStep()")                       # → makeup (female)
        await pg.wait_for_timeout(200)
        await pg.evaluate("() => photoNextStep()")                       # makeup ok → notes
        await pg.wait_for_timeout(250)
        stg = await pg.evaluate("() => booking.stage")
        ok("walks-to-notes-stage", stg == "notes", f"stage={stg}")
        # simulate user scrolled to BOTTOM of the notes screen, continue with EMPTY photoAbout
        await pg.evaluate("() => { const m = document.querySelector('#photoModal .modal'); m.scrollTop = m.scrollHeight; }")
        await pg.wait_for_timeout(200)
        await pg.evaluate("() => photoNextStep()")
        await pg.wait_for_timeout(900)
        st = await pg.evaluate("() => booking.step")
        flagged = await pg.evaluate("() => document.getElementById('photoAbout').classList.contains('field-error')")
        toast = await pg.evaluate("() => document.getElementById('toast').textContent")
        inview = await pg.evaluate("""() => { const el = document.getElementById('photoAbout'); const r = el.getBoundingClientRect();
          const m = document.querySelector('#photoModal .modal').getBoundingClientRect();
          return r.height > 0 && r.top >= m.top - 5 && r.bottom <= m.bottom + 5; }""")
        scrolled_up = await pg.evaluate("() => { const m = document.querySelector('#photoModal .modal'); return m.scrollTop < m.scrollHeight - m.clientHeight - 10 || m.scrollTop === 0; }")
        ok("blocks-at-step2", st == 2, f"step={st}")
        ok("photoAbout-flagged", flagged)
        ok("toast-names-field", "photoshoot is about" in (toast or ""), str(toast))
        ok("field-scrolled-into-modal-view", inview and scrolled_up, f"inview={inview} scrolled_up={scrolled_up}")
        # typing clears the flag
        await pg.fill("#photoAbout", "Graduation shoot")
        await pg.wait_for_timeout(150)
        cleared = await pg.evaluate("() => !document.getElementById('photoAbout').classList.contains('field-error')")
        ok("typing-clears-flag", cleared)
        # continue with disclaimer unchecked → flagged
        await pg.evaluate("() => photoNextStep()")
        await pg.wait_for_timeout(400)
        st = await pg.evaluate("() => booking.step")
        dflag = await pg.evaluate("() => document.querySelector('.disclaimer-check').classList.contains('field-error')")
        ok("disclaimer-flagged-when-missing", st == 2 and dflag, f"step={st} flag={dflag}")
        # check disclaimer → passes to step3
        await pg.check("#disclaimerOk")
        await pg.evaluate("() => photoNextStep()")
        await pg.wait_for_timeout(350)
        st = await pg.evaluate("() => booking.step")
        ok("advances-to-step3", st == 3, f"step={st}")
        ok("no-pageerrors", not errs, str(errs))
        await b.close()
    print(f"==== {sum(R)}/{len(R)} PASSED ====")
    raise SystemExit(0 if all(R) else 1)
asyncio.run(main())
