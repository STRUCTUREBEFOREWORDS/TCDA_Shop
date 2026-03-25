#!/usr/bin/env node
/**
 * scripts/sync-variant-ids.js
 *
 * Printful API から sync_variant_id を取得し、
 * data/products.js の variant_ids を自動更新するスクリプト。
 *
 * 使い方:
 *   node scripts/sync-variant-ids.js
 *
 * 事前準備:
 *   .env に PRINTFUL_API_KEY を設定してください。
 */

require("dotenv").config({ path: require("path").resolve(__dirname, "../server/.env") });
const https = require("https");
const fs = require("fs");
const path = require("path");

const API_KEY = process.env.PRINTFUL_API_KEY;
if (!API_KEY) {
  console.error("❌  PRINTFUL_API_KEY が .env に設定されていません");
  process.exit(1);
}

// ── Printful API ヘルパー ─────────────────────────────────────────
function printfulGet(endpoint) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "api.printful.com",
      path: endpoint,
      method: "GET",
      headers: {
        Authorization: "Bearer " + API_KEY,
        "Content-Type": "application/json",
      },
    };
    const req = https.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(new Error("JSON parse error: " + body.slice(0, 200)));
        }
      });
    });
    req.on("error", reject);
    req.end();
  });
}

// ── メイン処理 ────────────────────────────────────────────────────
async function main() {
  console.log("Printful 商品一覧を取得中…\n");

  // 1. ストア商品一覧
  const listData = await printfulGet("/store/products?limit=100");
  if (!listData.result) {
    console.error("❌  API エラー:", JSON.stringify(listData));
    process.exit(1);
  }

  const products = listData.result;
  console.log(`✅  ${products.length} 件の商品を取得\n`);

  const variantMap = {};

  for (const item of products) {
    const detail = await printfulGet("/store/products/" + item.id);
    if (!detail.result) continue;

    const { sync_product, sync_variants } = detail.result;
    const name = sync_product.name;

    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`商品名 : ${name}`);
    console.log(`ID     : ${sync_product.id}`);
    console.log(`バリアント:`);

    const sizeMap = {};
    for (const v of sync_variants) {
      const sizeName = v.size || v.name || "default";
      sizeMap[sizeName] = v.id;
      console.log(`  ${sizeName.padEnd(6)} → variant_id: ${v.id}`);
    }
    variantMap[sync_product.id] = { name, sizeMap };
  }

  // 2. 結果を表示（data/products.js に貼る形式）
  console.log("\n\n━━ data/products.js 用 variant_ids スニペット ━━\n");

  for (const [id, { name, sizeMap }] of Object.entries(variantMap)) {
    const sizesStr = Object.entries(sizeMap)
      .map(([s, vid]) => `${JSON.stringify(s)}: ${vid}`)
      .join(", ");
    console.log(`// ${name}  (printful_id: ${id})`);
    console.log(`variant_ids: { ${sizesStr} },`);
    console.log();
  }

  // 3. data/printful-products.json に保存（参照用）
  const outPath = path.resolve(__dirname, "../data/printful-products.json");
  fs.writeFileSync(
    outPath,
    JSON.stringify(
      {
        fetched_at: new Date().toISOString(),
        products: Object.entries(variantMap).map(([id, { name, sizeMap }]) => ({
          printful_id: Number(id),
          name,
          variant_ids: sizeMap,
        })),
      },
      null,
      2
    )
  );
  console.log(`✅  data/printful-products.json に保存しました`);
  console.log(`   → このファイルを参照して data/products.js を更新してください`);
}

main().catch((err) => {
  console.error("❌ 予期しないエラー:", err.message);
  process.exit(1);
});
