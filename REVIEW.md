# GIDIGBA STUDIOS — Review Guide (v4: LIGHT THEME + Poppins + RENAME)

## What changed in v4 (your latest instructions)

| You asked | Built |
|---|---|
| Font Syne → something normal | **Poppins** everywhere — Google Fonts link on all 13 pages, `--font-display` stack, and the canvas voucher/referral card fonts |
| "Too much black" | **Full light theme**: white + light-grey alternating sections, dark text, white cards with crisp borders. Lime `#C0F500` kept for buttons, marquee, badges, active tabs. Lime **text** is now dark lime `#4f7000` (`--green-ink`) so it stays readable. Footer, CTA band, mobile menu, booking modal all light. Dark only survives *over photos* (floating pills, before/after tags, sticky bar) |
| Homepage price tiles → one button | The 20-tile grid is gone → single **"Image Editing from GH₵10 →"** button that opens the Editing booking directly |
| Rename packages | **LITE · GH₵35 · MEDIUM · GH₵55 · SUPERIOR · GH₵105** — package cards, compare table, booking step 1, quiz, voucher dropdown and the pose gate all renamed. SINGLE IMAGE and the couple names unchanged |
| State package inclusions | Every individual package card and compare-table row now spells out **Makeup · Retouch · Hair · Outfit · Background** (per image) + **24 business hours** delivery; the section blurb states it in one sentence too |

Bonus fixes found during the audit: brands logo text was near-invisible on white (fixed), the mobile sticky-bar WhatsApp icon had a malformed SVG path (repaired), service worker cache bumped to `gidigba-v8`.

## Test-drive checklist (v4)

1. **Homepage** — light background, Poppins headings, two hero doors, and ONE "Image Editing from GH₵10" button (no tile grid).
2. **Photoshoots → Individual** — SINGLE IMAGE / LITE / MEDIUM / SUPERIOR cards, each listing the five inclusions; compare table rows renamed.
3. **Booking** — SUPERIOR shows the POSE box, LITE does not; quiz and voucher show the new names; editing button opens step 1 on the Editing tab.
4. **Delivery wording** — everywhere says *24 business hours*.

## Automated verification (v4, all passing)

- Contrast audit: **0 issues across 13 pages** · no overflow at 1280 or 375 · console clean (SVG error gone)
- Functional: home button → editing modal ✓ · tile names ✓ · pose gates ✓ · quiz → MEDIUM ✓ · voucher 7 options ✓
- `node --check` OK · CSS braces balanced · zero "Syne" references left

---

# GIDIGBA STUDIOS — Review Guide: SIMPLE & AFFORDABLE (v3)

## What changed in v3 (your latest instructions)

| You asked | Built |
|---|---|
| No "photoshoot about" options — text space only | Step 2 question **"What is the photoshoot about? *"** is now a **free-text box** (clients type e.g. "Graduation in kente"). Emoji chips removed. "Get this look" and the quiz pre-fill the text |
| Description under each upload | Each style item is now its own card: **👗 Outfit → outfit photo box → describe box directly under it** · **💇 Hairstyle → hair photo box → describe box under it** · 💞 Partner hairstyle card (couple) |
| "Let us style us" option | Toggle: **"👗 Let us style you — skip the outfit & hairstyle process"** — hides all outfit/hair cards; shows warning **"⚠️ No free style changes after work begins"**; hairstyle requirement lifts; review + WhatsApp say *Styled by GIDIGBA* |
| Add makeup + face-change notice | Toggle: **"💄 Add makeup"** → **"⚠️ Adding makeup will cause changes to your face — as it would in normal life."** Flows to review + message (`Makeup: YES — client informed…`) |
| Our logo | Your G-mark cropped from `image-2.png` → **nav + footer logo, favicon on all13 pages**, PWA manifest icons (local logo-192/512). No more text "G" placeholder |

# — Previous guide (v2, still applies) —

**Status: committed locally, NOT pushed — awaiting your review.**
Local `main` tip: see `gidigba-repo` (GitHub still at `2a278af`; all v2–v4 batches are unpushed commits).

---

## What changed in v2 (your latest instructions)

| You asked | Built |
|---|---|
| Use the old couple packages | **COUPLE SILVER GH₵120 · COUPLE GOLD GH₵230 · COUPLE PLATINUM GH₵350** — old features (3/4/6 images, outfits, studio/creative/premium) restored on package page, booking, compare table, quiz and voucher |
| Package page: individual / couple / simple editing | **Three tabs: `Individual` · `Couple` · `Editing · GH₵10`** — editing tab lists all20 standalone services as bookable cards |
| No date/email/time after photo type | **Step2 = photos only**: type → selfie (req) + full-body (req) + **outfit upload *or* describe** + **hairstyle upload *or* describe** + partner set (couple) + additional notes + **⚡ hurry tap** + AI disclaimer. No date, time, name, phone, email, look-picker or inspiration |
| Pose only for biggest package | Pose textarea appears **only** for `SUPERIOR` and `COUPLE PLATINUM` |
| No couple option for single packages | The **"Couple" chip is hidden** in the photoshoot-type grid when an Individual package is selected (auto-shown+selected for couple packages) |
| Hurry tap | "⚡ I'm in a hurry — I need my images ASAP" toggle → shows in review + WhatsApp message as `Hurry: YES — ASAP` |

Booking stays **3 steps: Pick (3 tabs) → Photos → Review & Send**. Delivery: **24 business hours** for everything.

## Test-drive checklist

1. **Photoshoots → Packages**: tap the three tabs — Individual (15/35/55/105), Couple (120/230/350), Editing (20 cards @10).
2. **Booking**: step1 has the same three tabs. Pick SINGLE IMAGE → step2 shows type grid **without** the Couple chip, selfie/fullbody/outfit/hairstyle upload-or-describe boxes, notes, hurry toggle — no date/time/email anywhere.
3. Pick **SUPERIOR** → a POSE box appears. Pick **COUPLE GOLD** → Couple chip preselected + partner selfie/fullbody/hairstyle appear, no pose box. **COUPLE PLATINUM** → pose appears.
4. **Send** → WhatsApp message has no SCHEDULE/CLIENT sections; includes `Hurry:` line, outfit/hairstyle as text or "Photo attached".
5. Homepage "change one thing" tiles and quiz (couple → old couple packages) still work; voucher dropdown lists all7 offers.

## Automated verification (all passing)

- Package page tabs:4 /3(old prices) /20 cards ✓
- Booking tabs mirror page ✓ · step2 field inventory fully asserted (18/18) ✓
- Single-image walk + edit walk end-to-end → correct WhatsApp messages (fake imgbb) ✓
- Pose gates (pkg10 ✓, platinum ✓, gold ✗, single ✗) ✓ · couple type hidden for individual ✓
- **52/52 views clean** (13 pages ×4 widths) · `node --check` OK · CSS balanced

## Unchanged from previous review

Two hero doors · GH₵15 all-in · GH₵10 edits ·20-item menu · sticky "From GH₵15" · referral · tracker · journal · industry pages · `PAY_URL`/`SEASONAL` config · `YOUR-DOMAIN.com` placeholders.

## Push when ready

```bash
cd gidigba-repo
git remote add origin https://github.com/Redeemerafi/GIDIGBA-STUDIOS.git   # if missing
git push origin main
```
