#!/usr/bin/env python3
"""Women's hairstyle gallery — wig-on-mannequin-head template only
(like the user's reference: long wavy/curly wigs on display heads,
premium product look). Reject white product shots, dhash dedupe, top60."""
import hashlib, io, os, shutil, sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from PIL import Image, ImageStat

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pin_download import norm, grab, HDRS, UA, collect

DEST = "/home/user/images/styles/female"
STAGE = "/tmp/women_stage"
TARGET = 60
NEAR_DUP_MAX = 10

QUERIES = [
    "curly wig mannequin head",
    "wavy wig mannequin head",
    "black wig mannequin head",
    "lace front wig mannequin",
    "human hair wig mannequin display",
    "long black wig mannequin",
    "deep wave wig mannequin",
    "body wave wig display head",
    "black curly wig mannequin",
    "wig display head long hair",
    "mannequin head wig long hair",
    "kinky curly wig mannequin",
    "glueless wig mannequin head",
    "hd lace wig mannequin",
    "wig on mannequin head display",
    "wavy wig display head",
]


def dhash(img, size=12):
    g = img.convert("L").resize((size + 1, size), Image.LANCZOS)
    px = list(g.getdata())
    bits = []
    for r in range(size):
        for c in range(size):
            bits.append(1 if px[r * (size + 1) + c] > px[r * (size + 1) + c + 1] else 0)
    return sum(b << i for i, b in enumerate(bits))


def ham(a, b):
    return bin(a ^ b).count("1")


def template_score(im):
    """ok = plausible wig-on-mannequin display. Score favors dark hair mass + premium backdrop."""
    im = im.convert("RGB")
    w, h = im.size
    small = im.resize((60, 60))
    px = list(small.getdata())
    white = sum(1 for r, g, b in px if r > 218 and g > 218 and b > 218) / len(px)
    if white > 0.32:
        return False, 0
    # corners → backdrop
    cs = max(8, int(min(w, h) * 0.12))
    corners = [
        im.crop((0, 0, cs * 2, cs * 2)), im.crop((w - cs * 2, 0, w, cs * 2)),
        im.crop((0, h - cs * 2, cs * 2, h)), im.crop((w - cs * 2, h - cs * 2, w, h)),
    ]
    cv = sum(ImageStat.Stat(c).mean[0] for c in corners) / 4
    if cv > 225:
        return False, 0
    # center → hair mass + mannequin
    cw, ch = int(w * 0.5), int(h * 0.55)
    cx, cy = int(w * 0.25), int(h * 0.18)
    center = im.crop((cx, cy, cx + cw, cy + ch)).resize((50, 50))
    cpx = list(center.getdata())
    dark = sum(1 for r, g, b in cpx if (r + g + b) / 3 < 75) / len(cpx)          # dark hair
    warm = sum(1 for r, g, b in cpx if r > 110 and r > b + 25 and g > b) / len(cpx)  # mannequin skin/bust
    hair_or_head = dark >= 0.12 or warm >= 0.10
    if not hair_or_head:
        return False, 0
    score = 0.0
    score += min(45, dark * 120)          # voluminous dark hair = their look
    score += min(25, warm * 90)           # mannequin bust visible
    score += max(0.0, (215 - cv) / 6)     # darker/premium backdrop
    score += (20 if white < 0.05 else 0)
    return True, score


def main():
    os.makedirs(STAGE, exist_ok=True)
    for f in os.listdir(STAGE):
        os.remove(os.path.join(STAGE, f))
    os.makedirs(DEST, exist_ok=True)
    for f in os.listdir(DEST):
        os.remove(os.path.join(DEST, f))

    urls, seen = [], set()
    from playwright.sync_api import sync_playwright
    with sync_playwright() as pw:
        b = pw.chromium.launch()
        ctx = b.new_context(viewport={"width": 1400, "height": 900}, user_agent=UA)
        pg = ctx.new_page()
        for q in QUERIES:
            try:
                got = collect(pg, q, want=40, max_scrolls=14)
                for u in got:
                    hh = u.rsplit("/", 1)[-1]
                    if hh not in seen:
                        seen.add(hh)
                        urls.append(u)
                print(f"'{q}': pool={len(urls)}", flush=True)
            except Exception as e:
                print(f"'{q}' ERR {e}", flush=True)
        b.close()

    print("candidates:", len(urls), flush=True)
    paths = []
    with ThreadPoolExecutor(max_workers=8) as ex:
        futs = {}
        for i, u in enumerate(urls):
            p = os.path.join(STAGE, f"c{i:03d}.webp")
            futs[ex.submit(grab, u, p)] = p
        for fu in as_completed(futs):
            p = futs[fu]
            try:
                if fu.result():
                    paths.append(p)
            except Exception:
                pass
    paths.sort()
    print("downloaded:", len(paths), flush=True)

    kept = []
    contents = set()
    for p in paths:
        try:
            with open(p, "rb") as fh:
                blob = fh.read()
            c = hashlib.sha1(blob).hexdigest()
            if c in contents:
                continue
            im = Image.open(io.BytesIO(blob))
            ok, sc = template_score(im)
            if not ok:
                continue
            hh = dhash(im)
            if any(ham(hh, x[2]) <= NEAR_DUP_MAX for x in kept):
                continue
            contents.add(c)
            kept.append((sc, p, hh))
        except Exception:
            continue
    print("passed filter+dedupe:", len(kept), flush=True)

    kept.sort(key=lambda x: -x[0])
    kept = kept[:TARGET]
    for i, (_, p, _) in enumerate(kept, 1):
        shutil.copy(p, os.path.join(DEST, f"women-hair-{i:03d}.webp"))
    print("FINAL:", len(os.listdir(DEST)), flush=True)


if __name__ == "__main__":
    main()
