#!/usr/bin/env python3
"""
sync-from-printful.py
Fetches retail prices + thumbnail URLs from Printful and patches data/products.json.
Only updates: price, thumbnail_url, synced.
All other metadata (name, description, material, images, sizes…) is preserved.

Usage:
  PRINTFUL_API_KEY=xxx python3 scripts/sync-from-printful.py
"""
import json, os, sys, urllib.request

API_KEY  = os.environ.get("PRINTFUL_API_KEY", "")
STORE_ID = os.environ.get("PRINTFUL_STORE_ID", "17873034")

if not API_KEY:
    print("ERROR: PRINTFUL_API_KEY not set", file=sys.stderr)
    sys.exit(1)

PRODUCTS_PATH = "data/products.json"
DOCS_PATH     = "docs/data/products.json"
HEADERS = {"Authorization": f"Bearer {API_KEY}", "X-PF-Store-Id": STORE_ID}

def pf_get(path):
    req = urllib.request.Request(f"https://api.printful.com{path}", headers=HEADERS)
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)

def main():
    # Load local products
    with open(PRODUCTS_PATH, encoding="utf-8") as f:
        data = json.load(f)

    print("Fetching Printful store products …")
    store_list = pf_get("/store/products?limit=100")["result"]

    # Build printful_id → live data map
    price_map = {}
    for sp in store_list:
        pid = sp["id"]
        detail = pf_get(f"/store/products/{pid}")["result"]
        variants = detail.get("sync_variants", [])
        if variants:
            rp = variants[0].get("retail_price", "0")
            price_map[pid] = {
                "price":         int(float(rp)),
                "currency":      variants[0].get("currency", "JPY"),
                "thumbnail_url": sp.get("thumbnail_url", ""),
                "synced":        sum(1 for v in variants if v.get("synced")),
            }
        print(f"  {sp['name'][:30]:<30}  id={pid}  price={price_map.get(pid, {}).get('price', '—')} {price_map.get(pid, {}).get('currency', '')}")

    # Patch products.json — price, thumbnail_url, synced only
    changed = False
    for p in data["products"]:
        pid = p.get("printful_id")
        if pid not in price_map:
            continue
        live = price_map[pid]
        if p.get("price") != live["price"]:
            print(f"  PRICE {p['id']}: {p.get('price')} → {live['price']} {live['currency']}")
            p["price"] = live["price"]
            changed = True
        if live["thumbnail_url"] and p.get("thumbnail_url") != live["thumbnail_url"]:
            p["thumbnail_url"] = live["thumbnail_url"]
            changed = True
        if p.get("synced") != live["synced"]:
            p["synced"] = live["synced"]
            changed = True

    if not changed:
        print("No price changes detected.")
        return

    for path in (PRODUCTS_PATH, DOCS_PATH):
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"Updated {PRODUCTS_PATH} and {DOCS_PATH}")

if __name__ == "__main__":
    main()
