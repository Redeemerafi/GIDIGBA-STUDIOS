#!/usr/bin/env python3
"""Download outfit + hairstyle reference images from Pinterest searches.
Incremental: skips files already present, dedupes by pin hash, resizes to <=600px wide."""
import io, os, re, sys, time, urllib.parse
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed
from PIL import Image
from playwright.sync_api import sync_playwright

ROOT = "/home/user/images"
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome126.0 Safari/537.36"
HDRS = {"User-Agent": UA, "Referer": "https://www.pinterest.com/"}

CATS = [
    ("outfits/female",   ["women outfit fashion", "women street style outfit", "african women fashion outfit", "casual women outfit", "party dress women", "women traditional wear ghana"], 100),
    ("outfits/male",     ["men outfit fashion", "men style outfit", "men casual outfit", "african men fashion", "men suit style", "men streetwear outfit"], 100),
    ("outfits/children", ["kids outfit fashion", "children clothes style", "toddler fashion outfit", "kids streetwear", "children african fashion", "kids casual wear"], 100),
    ("styles/female",    ["wig mannequin head", "wigs mannequin display", "lace front wig display", "black wig mannequin", "curly wig mannequin head", "long wig display head"], 50),
    ("styles/male",      ["men wig mannequin head", "male wig display head", "men hair wig display", "male toupee mannequin", "black men wig mannequin", "short wig display head"], 50),
    ("styles/children",  ["kids hairstyles on mannequins", "kids hairstyles mannequin", "children hairstyle mannequin head", "kids wig styles display", "girl wig mannequin child", "boys wig mannequin head", "toddler hairstyle display"], 50),
]

def norm(u):
    # upgrade any size path to 736x, keep only pinimg photo urls
    if "i.pinimg.com" not in u:
        return None
    u = re.sub(r"/\d+x\d*/", "/736x/", u)
    u = re.sub(r"/\d+x/", "/736x/", u)
    if not re.search(r"\.(jpg|jpeg|png|webp)", u, re.I):
        return None
    # drop tiny avatars by hash path pattern still fine; filter emoji-ish later by size
    return u.split("?")[0]

def collect(pg, query, want, max_scrolls=18):
    q = urllib.parse.quote(query)
    pg.goto(f"https://www.pinterest.com/search/pins/?q={q}&rs=typed",
            wait_until="domcontentloaded", timeout=45000)
    pg.wait_for_timeout(3000)
    found = {}
    stagnant = 0
    for s in range(max_scrolls):
        urls = pg.evaluate("""() => {
            const out = [];
            document.querySelectorAll('img').forEach(i => {
                const src = i.currentSrc || i.src || '';
                if (src.includes('i.pinimg.com')) out.push(src);
            });
            return out;
        }""")
        before = len(found)
        for u in urls:
            n = norm(u)
            if not n:
                continue
            h = n.rsplit("/", 1)[-1]
            found[h] = n
        if len(found) >= want * 1.4:
            break
        if len(found) == before:
            stagnant += 1
            if stagnant >= 3:
                break
        else:
            stagnant = 0
        pg.mouse.wheel(0, 4200)
        pg.wait_for_timeout(1800)
    return list(found.values())[: want * 2]

def grab(url, path):
    try:
        r = requests.get(url, headers=HDRS, timeout=25)
        if r.status_code != 200 or len(r.content) < 4000:
            return False
        im = Image.open(io.BytesIO(r.content)).convert("RGB")
        w, h = im.size
        if w < 200 or h < 200:      # skip icons/avatars
            return False
        if w > 600:
            im = im.resize((600, max(1, int(h * 600 / w))), Image.LANCZOS)
        im.save(path, "WEBP", quality=78)
        return True
    except Exception:
        return False

def run_cat(pg, sub, queries, target):
    d = os.path.join(ROOT, sub)
    os.makedirs(d, exist_ok=True)
    have = len([f for f in os.listdir(d) if f.endswith(".webp")])
    if have >= target:
        print(f"[{sub}] already {have}/{target}", flush=True)
        return have
    urls = []
    seen = set()
    for q in queries:
        got = collect(pg, q, target)
        for u in got:
            h = u.rsplit("/", 1)[-1]
            if h not in seen:
                seen.add(h)
                urls.append(u)
        if len(urls) >= target * 1.5:
            break
    print(f"[{sub}] collected {len(urls)} candidate urls", flush=True)
    # download in order until target reached
    idx = have
    i = 0
    with ThreadPoolExecutor(max_workers=8) as ex:
        while idx < target and i < len(urls):
            batch = urls[i:i + 24]
            i += 24
            futs = {}
            for u in batch:
                if idx >= target:
                    break
                idx += 1
                path = os.path.join(d, f"{sub.replace('/', '-')}-{idx:03d}.webp")
                futs[ex.submit(grab, u, path)] = path
            for fu in as_completed(futs):
                path = futs[fu]
                try:
                    ok = fu.result()
                except Exception:
                    ok = False
                if not ok and os.path.exists(path):
                    os.remove(path)
                    idx -= 1
    have = len([f for f in os.listdir(d) if f.endswith(".webp")])
    print(f"[{sub}] DONE {have}/{target}", flush=True)
    return have

def main():
    with sync_playwright() as pw:
        b = pw.chromium.launch()
        ctx = b.new_context(viewport={"width": 1400, "height": 900}, user_agent=UA)
        pg = ctx.new_page()
        for sub, queries, target in CATS:
            try:
                run_cat(pg, sub, queries, target)
            except Exception as e:
                print(f"[{sub}] ERR {e}", flush=True)
        b.close()

if __name__ == "__main__":
    main()
