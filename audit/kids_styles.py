#!/usr/bin/env python3
"""Kids hairstyle gallery v2 — exact template only.
Pool: strict mannequin+kids queries. Filter: reject product/white-bg
shots, require brown mannequin-bust center + plain-ish backdrop.
dhash dedupe, top50 by template score."""
import hashlib, io, os, re, shutil, sys, urllib.parse
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed
from PIL import Image, ImageStat

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pin_download import norm, grab, HDRS, UA, collect

DEST = "/home/user/images/styles/children"
STAGE = "/tmp/kids_stage2"
TARGET = 50
NEAR_DUP_MAX = 10

QUERIES = [
    "kids braids mannequin head",
    "kids cornrows mannequin head",
    "kids beaded braids mannequin",
    "children braids mannequin head",
    "kids braids mannequin",
    "girl braids mannequin head",
    "kids hairstyle mannequin head",
    "toddler braids mannequin head",
    "kids box braids mannequin",
    "kids fulani braids mannequin",
    "mannequin head kids braids",
    "kids braided wig mannequin",
    "children cornrows mannequin",
    "kids beaded cornrows mannequin",
    "kid braids display head",
    "children hairstyle mannequin head",
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
    """Returns (ok, score). ok=False → wrong type (product shot / white bg)."""
    im = im.convert("RGB")
    w, h = im.size
    # overall white fraction (product shots / white backdrops)
    small = im.resize((60, 60))
    px = list(small.getdata())
    white = sum(1 for r, g, b in px if r > 218 and g > 218 and b > 218) / len(px)
    if white > 0.30:
        return False, 0
    # corner patches → backdrop
    cs = max(8, int(min(w, h) * 0.12))
    corners = [
        im.crop((0, 0, cs * 2, cs * 2)),
        im.crop((w - cs * 2, 0, w, cs * 2)),
        im.crop((0, h - cs * 2, cs * 2, h)),
        im.crop((w - cs * 2, h - cs * 2, w, h)),
    ]
    cv = sum(ImageStat.Stat(c).mean[0] for c in corners) / 4  # brightness proxy
    if cv > 205:   # white/very light backdrop → product or salon shot
        return False, 0
    # center → mannequin bust (warm brown)
    cw, ch = int(w * 0.34), int(h * 0.42)
    cx, cy = int(w * 0.33), int(h * 0.30)
    center = im.crop((cx, cy, cx + cw, cy + ch))
    r, g, b = ImageStat.Stat(center).mean
    brown = (100 < r < 220) and (r > b + 18) and (g > b - 5) and (g < r + 5)
    score = 0.0
    if brown:
        score += 55 + min(30, (r - b))       # warmer brown = closer bust
    score += max(0.0, 70 - cv / 3)            # plainer backdrop = higher
    score += (25 if white < 0.06 else 0)      # clean shot bonus
    ok = brown and white <= 0.18
    return ok, score


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
                    h = u.rsplit("/", 1)[-1]
                    if h not in seen:
                        seen.add(h)
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

    # filter + dedupe
    kept = []  # (score, path, hash)
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
            h = dhash(im)
            if any(ham(h, x[2]) <= NEAR_DUP_MAX for x in kept):
                continue
            contents.add(c)
            kept.append((sc, p, h))
        except Exception:
            continue
    print("passed filter+dedupe:", len(kept), flush=True)

    kept.sort(key=lambda x: -x[0])
    kept = kept[:TARGET]
    for i, (_, p, _) in enumerate(kept, 1):
        shutil.copy(p, os.path.join(DEST, f"kids-hair-{i:03d}.webp"))
    print("FINAL:", len(os.listdir(DEST)), flush=True)


if __name__ == "__main__":
    main()
