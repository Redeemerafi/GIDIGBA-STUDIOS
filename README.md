# GIDIGBA STUDIOS — v2 site

The comparison build's design and booking, extended to the full site.

## Structure
- `js/chrome.js` — one source for head tags, header, mobile menu, footer, sticky bar.
  Add a page to `NAV` and it appears everywhere. No page hard-codes chrome.
- `js/app.js` — the booking engine from the comparison build (unchanged design),
  with the outfit count wired to the package.
- `js/legacy-shim.js` — supplies the function names the ported pages call
  (track, vouchers, referrals) without touching the booking engine.
- `styles.css` — their stylesheet + `smp-*` sample components + ported
  component rules for the pages that came across.

## Pages (16)
index · photoshoots · work (samples chooser) · samples-female · samples-male ·
services · about · reviews · journal · brands · track · voucher ·
for-restaurants · for-real-estate · for-events · 404

## Booking
Package → Gender → Photos → Outfit → Hair → Makeup → Details → Review.
Outfit uploads equal the package's included outfits:
SINGLE 1 · LITE 1 · MEDIUM 2 · SUPERIOR 3 · couple 1/2/3.

## Tests
`python3 audit/site_test.py` — 121 checks: every page's chrome, title, images,
content and error state, plus outfit counts and reaching review.
