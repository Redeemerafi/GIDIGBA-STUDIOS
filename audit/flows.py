import asyncio, json, base64
from playwright.async_api import async_playwright

BASE = "http://localhost:8080"
PNG = base64.b64decode("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==")
FILES = [{"name": "test.png", "mimeType": "image/png", "buffer": PNG}]
results = []

def ok(name, cond, detail=""):
    results.append((name, bool(cond), detail))
    print(("PASS " if cond else "FAIL ") + name + ("" if cond else f"  << {detail}"))

async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch()
        ctx = await b.new_context(viewport={"width":1280,"height":900})
        await ctx.add_init_script("window.__opened=[]; window.open=(u)=>{window.__opened.push(String(u)); return null;};")
        page = await ctx.new_page()
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)[:160]))
        await page.route("**/api.imgbb.com/**", lambda r: r.fulfill(
            status=200, content_type="application/json",
            headers={"access-control-allow-origin": "*"},
            body=json.dumps({"success": True, "data": {"url": "https://i.ibb.co/fake/upload.jpg"}})))

        # 1. business brief
        await page.goto(f"{BASE}/index.html", wait_until="domcontentloaded"); await page.wait_for_timeout(400)
        await page.evaluate("() => openBookingChoice('business')")
        await page.wait_for_timeout(300)
        open1 = await page.evaluate("() => document.getElementById('projectModal').classList.contains('open')")
        await page.fill("#projectForm [name=name]", "Kwame Test")
        await page.fill("#projectForm [name=company]", "Test Co")
        await page.fill("#projectForm [name=email]", "k@test.com")
        await page.fill("#projectForm [name=phone]", "0244000000")
        await page.select_option("#projectForm [name=service]", index=1)
        await page.fill("#projectForm [name=brief]", "Need brand visuals for a launch.")
        await page.click("#projectForm button[type=submit]")
        await page.wait_for_timeout(300)
        opened = await page.evaluate("() => window.__opened")
        ok("business-brief", open1 and any("wa.me/233534317611" in u and "New%20Business%20Project%20Brief" in u for u in opened), str(opened)[-200:])
        await page.evaluate("() => window.__opened=[]")

        # 2. choice modal (ambiguous CTA path)
        await page.evaluate("() => openBookingChoice()")
        await page.wait_for_timeout(250)
        cm = await page.evaluate("() => document.getElementById('bookingChoiceModal').classList.contains('open')")
        ok("choice-modal", cm)
        await page.evaluate("() => closeModal('bookingChoiceModal')")

        # 3. LITE e2e — one-question wizard: gender → photos → outfit(styled) → makeup → notes → review
        await page.evaluate("() => { clearDraft(); openPhotoBooking('LITE'); }")
        await page.wait_for_timeout(300)
        stg = await page.evaluate("() => booking.stage")
        ok("wizard-opens-at-gender", stg == "gender", f"stage={stg}")
        await page.evaluate("() => setGender('female')")
        await page.evaluate("() => photoNextStep()")            # gender → selfie
        await page.wait_for_timeout(250)
        await page.set_input_files('.upload-box[data-key="selfie"] input[type=file]', FILES)
        await page.set_input_files('.upload-box[data-key="fullbody"] input[type=file]', FILES)
        await page.wait_for_timeout(150)
        await page.evaluate("() => photoNextStep()")            # selfie → outfit
        await page.wait_for_timeout(250)
        await page.evaluate("() => setFlowSel('outfit','styled')")  # styleMe — lifts hair (stage skipped)
        await page.evaluate("() => photoNextStep()")            # outfit → makeup (hair skipped)
        await page.wait_for_timeout(250)
        stg = await page.evaluate("() => booking.stage")
        ok("styleme-skips-hair-stage", stg == "makeup", f"stage={stg}")
        await page.evaluate("() => setMakeupChoice(true)")
        await page.evaluate("() => photoNextStep()")            # makeup → notes
        await page.wait_for_timeout(250)
        await page.evaluate("() => toggleHurry()")
        await page.fill("#photoAbout", "Graduation in kente")
        await page.check("#disclaimerOk")
        await page.evaluate("() => photoNextStep()")            # notes → review
        await page.wait_for_timeout(350)
        st = await page.evaluate("() => booking.step")
        ok("styleme-lifts-hair-req", st == 3, f"step={st}")
        await page.click("#nextStepBtn")  # Send -> submitPhotoOrder
        await page.wait_for_timeout(700)
        opened = await page.evaluate("() => window.__opened")
        msg = ""
        for u in opened:
            if "wa.me/233534317611" in u:
                from urllib.parse import unquote
                msg = unquote(u.split("text=")[-1])
        asserts = [
            "Offer: LITE (GH₵ 35)" in msg,
            "Includes: makeup, retouch, hair, outfit & background choice" in msg,
            "Delivery: within 24 business hours" in msg,
            "Photoshoot: Graduation in kente" in msg,
            "Hurry: YES" in msg,
            "Style: YES" in msg,
            "Makeup: YES" in msg,
            "Outfit: Skipped — styled by GIDIGBA" in msg,
            "SCHEDULE" not in msg and "CLIENT DETAILS" not in msg,
            "233534317611" in u if (u := opened[-1]) else False,
        ]
        ok("lite-e2e-message", all(asserts), f"checks={asserts} msg_head={msg[:160]}")
        await page.evaluate("() => window.__opened=[]")

        # 4. COUPLE GOLD standard path (required uploads + descriptions)
        await page.evaluate("() => openPhotoBooking('COUPLE GOLD')")
        await page.wait_for_timeout(400)
        await page.fill("#photoAbout", "Anniversary shoot, gold theme")
        for key in ("selfie", "fullbody", "partnerSelfie", "partnerFull"):
            await page.set_input_files(f'.upload-box[data-key="{key}"] input[type=file]', FILES)
        await page.fill("#outfitDesc", "Matching navy outfits")
        await page.fill("#hairstyle1", "Silver waves")
        await page.fill("#hairstyle2", "Low cut")
        await page.check("#disclaimerOk")
        await page.evaluate("() => photoNextStep()")
        await page.wait_for_timeout(350)
        st = await page.evaluate("() => booking.step")
        ok("couple-step2-validates", st == 3, f"step={st}")
        await page.click("#nextStepBtn")
        await page.wait_for_timeout(700)
        opened = await page.evaluate("() => window.__opened")
        from urllib.parse import unquote
        msg = next((unquote(u.split("text=")[-1]) for u in opened if "wa.me/233534317611" in u), "")
        asserts = [
            "Offer: COUPLE GOLD (GH₵ 230)" in msg,
            "Includes: 4 images · 2 outfits each · Creative scene" in msg,
            "Hairstyle: Silver waves" in msg,
            "Partner hairstyle: Low cut" in msg,
            "Style: No" in msg,
            "partnerSelfie:" in msg and "partnerFull:" in msg,
            "Photoshoot: Anniversary shoot, gold theme" in msg,
        ]
        ok("couple-e2e-message", all(asserts), f"checks={asserts} msg_head={msg[:200]}")
        await page.evaluate("() => window.__opened=[]")

        # 5. edit e2e (bookEdit from editing tab)
        await page.evaluate("() => bookEdit(2)")  # Outfit Change
        await page.wait_for_timeout(400)
        await page.evaluate("() => photoNextStep()")  # step1 ->2 (service preselected)
        await page.wait_for_timeout(400)
        await page.set_input_files('.upload-box[data-key="editImage"] input[type=file]', FILES)
        await page.check("#disclaimerOk")
        # smart follow-up: Outfit Change must be answered before proceeding
        fb = await page.evaluate("() => !!document.getElementById('svcFb2')")
        await page.fill("#svcFb2", "Black evening gown with gold heels")
        await page.evaluate("() => photoNextStep()")  # step2 ->3 (gated on follow-up)
        await page.wait_for_timeout(300)
        st = await page.evaluate("() => booking.step")
        await page.click("#nextStepBtn")
        await page.wait_for_timeout(700)
        opened = await page.evaluate("() => window.__opened")
        msg = next((unquote(u.split("text=")[-1]) for u in opened if "wa.me/233534317611" in u), "")
        asserts = [
            st == 3,
            "Single-change edits — GH₵10 each" in msg,
            "Outfit Change — GH₵10" in msg,
            "Total: GH₵ 10" in msg,
            "editImage:" in msg,
            fb,
            "Outfit Change: Black evening gown with gold heels" in msg,
        ]
        ok("edit-e2e-message", all(asserts), f"checks={asserts} step={st} msg_head={msg[:160]}")
        await page.evaluate("() => window.__opened=[]")

        # 6. track after real order
        await page.goto(f"{BASE}/track.html", wait_until="domcontentloaded"); await page.wait_for_timeout(400)
        tr = await page.inner_text("#trackResult")
        ok("track-shows-last-order", "order found" in tr.lower() and ("single-change edits" in tr.lower() or "lite" in tr.lower()), tr[:120])

        # 7. voucher generate
        await page.goto(f"{BASE}/voucher.html", wait_until="domcontentloaded"); await page.wait_for_timeout(400)
        await page.fill("#vRecipient", "Ama")
        await page.fill("#vSender", "Kojo")
        await page.select_option("#vPkg", "LITE")
        await page.click("#voucherOut, button:has-text('Generate Voucher')")
        await page.wait_for_timeout(500)
        vout = await page.evaluate("() => (document.getElementById('voucherOut')||{}).innerText || ''")
        vc = await page.evaluate("() => !!document.querySelector('#voucherOut canvas, #voucherOut img')")
        ok("voucher-gen", ("LITE" in vout or vc) and "VG-" in vout, f"canvas/img={vc} out={vout[:120]}")

        # 8. referral share
        await page.goto(f"{BASE}/reviews.html", wait_until="domcontentloaded"); await page.wait_for_timeout(400)
        await page.evaluate("() => shareReferral()")
        await page.wait_for_timeout(250)
        opened = await page.evaluate("() => window.__opened")
        from urllib.parse import unquote as _u
        ok("referral-share", any("ref=" in _u(u) and "GIDIGBA" in _u(u) for u in opened), str(opened)[:200])
        await page.evaluate("() => window.__opened=[]")

        # 9. FAQ toggle
        await page.click(".faq-question >> nth=0")
        await page.wait_for_timeout(250)
        faq = await page.evaluate("() => document.querySelector('.faq-item').classList.contains('open')")
        ok("faq-toggle", faq)

        # 10. work look prefill
        await page.goto(f"{BASE}/work.html", wait_until="domcontentloaded"); await page.wait_for_timeout(500)
        await page.evaluate("() => bookLook('graduation', 'Sample Look')")
        await page.wait_for_timeout(400)
        pre = await page.evaluate("() => ({open: document.getElementById('photoModal').classList.contains('open'), about: booking.data.photoAbout})")
        ok("look-prefill", pre["open"] and pre["about"] == "Graduation", str(pre))
        await page.evaluate("() => closeModal('photoModal'); clearDraft()")

        # 11. quiz -> book match
        await page.goto(f"{BASE}/photoshoots.html", wait_until="domcontentloaded"); await page.wait_for_timeout(500)
        await page.evaluate("""() => {
          const click = txt => [...document.querySelectorAll('.quiz-opt')].find(b => b.textContent.includes(txt)).click();
          click('Just me'); click('Professional'); click('Go all out'); click('This week'); quizResult();
        }""")
        await page.wait_for_timeout(300)
        await page.click("#quizResult .btn-primary")
        await page.wait_for_timeout(400)
        q = await page.evaluate("() => ({pkg: booking.data.selectedPackage, open: document.getElementById('photoModal').classList.contains('open')})")
        ok("quiz-books-match", q["open"] and q["pkg"] == "MEDIUM", str(q))
        await page.evaluate("() => closeModal('photoModal'); clearDraft()")

        # 12. sharePkg no crash
        await page.evaluate("() => sharePkg('SUPERIOR')")
        await page.wait_for_timeout(300)
        ok("share-pkg-no-crash", len(errors) == 0, str(errors))

        # 13. mobile menu
        m = await b.new_context(viewport={"width":375,"height":812})
        mp = await m.new_page()
        await mp.goto(f"{BASE}/index.html", wait_until="domcontentloaded"); await mp.wait_for_timeout(400)
        await mp.click(".burger")
        await mp.wait_for_timeout(400)
        vis = await mp.evaluate("() => { const mm = document.querySelector('.mobile-menu'); const cs = getComputedStyle(mm); return cs.opacity === '1' && cs.visibility === 'visible'; }")
        vis2 = await mp.evaluate("() => { const mm = document.querySelector('.mobile-menu'); const cs = getComputedStyle(mm); return cs.visibility === 'visible' && parseFloat(cs.opacity) > 0.9; }")
        ok("mobile-menu-opens", vis or vis2, f"strict={vis} relaxed={vis2}")

        # 14. ba slider
        await page.goto(f"{BASE}/photoshoots.html", wait_until="domcontentloaded"); await page.wait_for_timeout(500)
        before = await page.evaluate("() => document.getElementById('baBefore').style.clipPath")
        await page.evaluate("() => { const r = document.getElementById('baRange'); r.value = 80; r.dispatchEvent(new Event('input')); }")
        await page.wait_for_timeout(250)
        after = await page.evaluate("() => document.getElementById('baBefore').style.clipPath")
        ok("ba-slider", before != after and after is not None and ("20" in after or "80" in after), f"{before} -> {after}")

        ok("no-pageerrors", len(errors) == 0, str(errors[:3]))
        await b.close()

    fails = [r for r in results if not r[1]]
    print(f"\n==== {len(results)-len(fails)}/{len(results)} PASSED ====")
    if fails:
        print("FAILURES:", [f[0] for f in fails]); raise SystemExit(1)

asyncio.run(main())
