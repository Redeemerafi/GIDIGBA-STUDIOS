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
- **Full flow suite: 17/17** — business brief → WhatsApp, choice modal, LITE e2e (style-me lift + Style/Makeup/Hurry message lines), COUPLE GOLD e2e (partner uploads + descriptions), edit e2e (GH₵10 total), track after real order, voucher generate, referral share, FAQ, look prefill, quiz → book MEDIUM, share card, mobile menu, before/after slider, zero page errors
- Validation UX: a blocked Continue now **scrolls the missing field into view and flashes it red** (`.field-error`) — typing/uploading clears it. Covers photoAbout, selfie/fullbody/partner uploads, hairstyle boxes, vision, disclaimer, package/service pickers
- Service worker **v9 = network-first** for pages/assets (cache only as offline fallback) — browsers always get the newest build when online; stale-theme incidents gone
- QA sweep: every delivery claim now says **24 business hours** (8 spots; journal's "24 hours" kept — it's Instagram stories), `twitter:card` added to 12 pages, sitemap covers all 13 pages

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

## v5 — Font swap + light/dark toggle (2026-11-05)

- **Font everywhere → Plus Jakarta Sans** (Google link on all 13 pages, weights 300–800; `--font-display`, body, `.door-title`, and the script.js canvas fonts). Poppins/Inter fully removed (0 refs).
- **Light/dark mode toggle**: sun/moon button in the nav (desktop + mobile chrome). **Light is default**; choice persists in `localStorage gidigba_theme`; a tiny inline head script applies the theme before first paint (no flash, no-JS → light).
- Implementation: all theme colors in styles.css now flow through variables (`--bg/--text/--surface/--ink/--green-ink/--nav-bg/--grid-line/--tint/--inset/--hover/--ghost…`); `[data-theme="dark"]` redefines the palette (lime stays `#C0F500` on dark); `.opt-warn` gets an amber dark variant. Service-worker bumped to `gidigba-v10` (network-first, so theme updates reach users immediately).
- Tests: `audit/theme_test.py` **11/11** (default light, toggle + persistence across pages, icon swap, fresh-visitor light, dark contrast, booking smoke, toggle present on all 13 pages, no dark overflow); `audit/theme_audit.py` contrast/overflow/console **clean in BOTH themes** (`THEME=light|dark` env); flows **17/17**; flag_test **8/8**.

To undo the font: swap the 13 Google links + 3 styles.css spots + canvas strings back (pattern in git history `c64c763..HEAD`).

## v6 — Declutter pass: plain backgrounds, calmer type (2026-11-05)

User feedback: "background looks / font size / things look too clumsy" → direction chosen: **plain & clean backgrounds, smaller & calmer typography, keep lime energy but organized**.

- **Removed decorations**: film-grain overlay (`body::after`), hero blueprint grid (`.hero-grid` + div), hero lime glow blob (`.hero-glow` + div), page-hero grid + glow (`::before/::after`), CTA grid, all lime radial glow layers (photo-callout/diff/cta/quiz → solid backgrounds), hero side marker, hero floating pills (`hv-pill` ×2), hero eyebrow line, **giant outline ghost words** on12 pages (`.ph-ghost`) + footer ghost wordmark (`.footer::before`).
- **Typography**: all `font-weight:800` → `700` (54 spots); hero/section/door/cta/diff/page-hero heading clamps scaled down (~25%); `.eyebrow` →10.5px/600/muted, no lime dash.
- **Bug fixed**: `body { color: var(--text)111 }` (mangled v5 replace — invalid CSS) → `color: var(--text)`.
- **Kept**: lime doors/CTAs, meta row (24h/95%/100%), `.section-alt` quiet bands, photo collage, all content.
- Tests: theme_test **11/11**, theme_audit **light + dark both clean** (contrast0/overflow none/console clean), flows **17/17**, flag_test **8/8**; DOM assertions (no grid/glow/pills/grain/ghosts; body color rgb(17,17,17)).

## v7 — Real photos, male/female sections, priority-fee disclosure (2026-11-05)

- **All fake AI images removed** (work-*, about-studio, callout-portrait, before-phone deleted from `images/`) and replaced with the user's **19 real photos** (`images/f-*.webp` ×11, `images/m-*.webp` ×8) + new `og-image.jpg` (f-gold,1200×630).
- **Work page = Female + Male sections** (replaced All/Business/Personal filter): `works[]` now carries `sex`; renders into `#workGridF` (8) / `#workGridM` (5) with section heads; Sample badges + look-prefill kept.
- **Before/after slider**: before = `f-before.webp` (blurry white female, user's500px shot), after = `f-kente.webp`.
- **Hurry toggle ⚡**: auto-discloses "A small fee may be demanded by the team after submission for priority delivery." (note appears on toggle, review gets a Priority-fee row, WhatsApp message appends the note when Hurry: YES). Standing rule unchanged: standard delivery stays24 business hours.
- Swaps: index collage (f-kente + m-denim), index/about portraits, photoshoots look grid (incl. m-red headshot), journal thumbs.
- Tests: flows **17/17**, flag **8/8**, theme **11/11**, new checks **5/5** (F/M counts,13-page zero-broken-images, ba sources, hurry note), audits **light + dark clean**.

## v8 — Flat & simple pass (2026-11-05)

User: "SEE HOW BULKY THE SITE IS, MAKE IT AS SIMPLE AS POSSIBLE AND FLAT" (mobile-menu screenshot).

- **Mobile menu**: links17px/600 (was up to32px/700), letter-spacing tightened, row gap0, hover no slide, foot compact (24/16), transitions minimal.
- **Flat**: every `box-shadow` → `none` (21 removed: cards, modals, buttons, glows; focus ring is outline — kept); all radii squashed to **8px** (10px for big panels) via literals + `--radius:8` / `--radius-sm:6`; **exception**: `.toggle-switch` stays pill (100px).
- **Buttons**: `.btn`11×22/13px (was16×30/14), `.btn-sm`9×16/12.5, `.btn-lg`13×24/14.
- Tests: flows17/17, flag8/8, theme11/11, flat DOM checks (menu17px, shadows0, switch pill, modal btn), audits light+dark clean.

## v9 — EDITORIAL look (PREVIEW, awaiting user verdict) (2026-11-20)

User: "i do not like this website look at all, create a different look and vibe and send a preview first".

New vibe — **warm-paper editorial magazine**:
- **Type**: Fraunces (serif display: hero, headings, doors, menu, canvas watermarks) + Inter (body/labels/buttons); hero tagline = italic serif; nav links =11px caps/tracking.
- **Palette**: warm paper `#F7F5EE` light / warm ink `#141412` dark; warm greys for text/lines; lime kept as accent (eyebrow square, outline STUDIOS, door-primary, hover states) — `--green-ink` olive-on-paper.
- **Shape**: all corners **2px** (switch stays pill), zero shadows (from v8), hairline borders (`1px solid var(--line-strong)` on doors/nav/footer), buttons = ink fill → lime on hover, small caps11.5px.
- Google link ×13 now `Fraunces+Inter`; zero "Plus Jakarta" left.
- Tests: flows17/17, flag8/8, theme **11/11** (color assertions updated to warm palette), audits **clean light+dark**, editorial DOM checks (Fraunces loaded, paper bg,2px doors, ink btn).
- **This is a preview** — revert = `git revert`/reset to `dd7abdb` if user rejects.

## v10 — SOFT PASTEL MODERN (PREVIEW, awaiting verdict) (2026-11-20)

User rejected editorial ("something different, don't copy what we have") and picked **Soft Pastel Modern** from options.

- **Type**: Outfit everywhere (13 links, body, display var, canvas); sentence-case friendly sizes (nav14.5, buttons14.5, eyebrows = pastel pills13px).
- **Palette**: cream `#FBF9F4` / pastel dark `#17171C`; sage + lavender washes (`--ink`=#F1EEFA lav, `--ink-2`=#EEF3E9 sage, `--lav-soft/--sage-soft/--peach-soft/--violet`); **violet #6D5BD0 CTAs** (hover ink); lime kept only as `.hl` highlighter + logo/meta.
- **Shape**: radius back up — `--radius:24 / sm:12 / lg:28`, literals16, buttons/badges **pill999**, doors **28px gradient cards** (violet primary / sage secondary, soft shadow), cards24 + soft shadows (pastel vibe = subtle depth OK).
- **Decoration**: hero = soft gradient + two pastel blob circles; page-headers lavender wash; CTA = sage→lavender gradient; section-alt = lavender; mobile menu = lavender sheet.
- **Contrast fixes**: door gradients gained `background-color` (audit reads color, not image), `.btn-ghost` theme-aware (`var(--surface)`), badge dark text variants.
- Tests: flows17/17, flag8/8, theme11/11 (expectations → cream rgb(251,249,244) / dark rgb(23,23,28)), audits **clean both themes**, pastel DOM checks.
- PREVIEW — revert to `81332f0` if rejected.
