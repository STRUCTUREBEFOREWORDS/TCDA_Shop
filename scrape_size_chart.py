import asyncio
import json
from playwright.async_api import async_playwright

PRODUCT_ID = 438  # Gildan 5000 | Adult T-Shirt Heavy Cotton
IN_TO_CM = 2.54

def round_cm(inches):
    return round(float(inches) * IN_TO_CM)

async def scrape():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        await page.goto(
            f"https://api.printful.com/products/{PRODUCT_ID}/sizes",
            wait_until="domcontentloaded",
        )
        data = json.loads(await page.locator("body").inner_text())
        await browser.close()

    tables = data["result"]["size_tables"]

    # product_measure テーブルを使用（製品実寸）
    pm = next(t for t in tables if t["type"] == "product_measure")

    length_map = {v["size"]: v["value"] for v in next(m for m in pm["measurements"] if m["type_label"] == "Length")["values"]}
    width_map  = {v["size"]: v["value"] for v in next(m for m in pm["measurements"] if m["type_label"] == "Width")["values"]}

    sizes = data["result"]["available_sizes"]

    size_chart = []
    for size in sizes:
        chest_cm  = round_cm(float(width_map[size]) * 2)   # Width = half-chest
        length_cm = round_cm(length_map[size])
        size_chart.append({
            "size":   size,
            "chest":  chest_cm,
            "waist":  chest_cm,   # Gildan 5000 は waist データなし → chest と同値
            "length": length_cm,
        })

    print(json.dumps(size_chart, ensure_ascii=False, indent=2))

asyncio.run(scrape())
