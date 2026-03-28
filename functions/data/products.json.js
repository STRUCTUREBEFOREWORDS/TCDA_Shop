/**
 * TCDA — Cloudflare Pages Function: /data/products.json
 *
 * Serves the products JSON from Cloudflare KV (TCDA_KV).
 * If KV is empty or unavailable, returns the static seed data
 * bundled in this file so the shop always works.
 *
 * Cache-Control: no-store — ensures every request reflects
 * the latest KV state after a Printful webhook upsert.
 *
 * KV binding required: TCDA_KV
 */

const KV_KEY = "products_json";

export async function onRequestGet(context) {
  const { env } = context;

  /* Try to serve from KV */
  if (env.TCDA_KV) {
    try {
      const kvValue = await env.TCDA_KV.get(KV_KEY, "text");
      if (kvValue) {
        return new Response(kvValue, {
          status: 200,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "no-store",
            "Access-Control-Allow-Origin": "*",
          },
        });
      }
    } catch (err) {
      console.warn("KV read failed, falling back to seed data:", String(err));
    }
  }

  /* Fallback: return seed data (static products) */
  return new Response(JSON.stringify(SEED_PRODUCTS), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": "*",
      "X-Products-Source": "seed",
    },
  });
}

/* ── Seed data ───────────────────────────────────────────────────── */
/* This mirrors /data/products.json and is used when KV is empty.    */
/* Update this whenever the canonical products.json is updated.      */

const SEED_PRODUCTS = {
  "products": [
    {
      "id": "zip-hoodie03",
      "printful_id": 424275426,
      "name": { "ja": "クロマ ノイズ ジャケット", "en": "Chroma Noise Jacket" },
      "images": [
        "products/zip-hoodie03/main.jpg",
        "products/zip-hoodie03/sub1.jpg",
        "products/zip-hoodie03/sub2.jpg",
        "products/zip-hoodie03/sub3.jpg",
        "products/zip-hoodie03/sub4.jpg"
      ],
      "thumbnail_url": "https://files.cdn.printful.com/files/1cc/1cc44af603dd6fda3022e6528552323f_preview.png",
      "description": {
        "ja": "TCDAフラッグシップ。クロマティックノイズを全面に展開したフルジップジャケット。受注生産・限定アイテム。",
        "en": "TCDA flagship. Full-zip jacket with chromatic noise spread across the entire surface. Made-to-order, limited."
      },
      "material": "80% Cotton, 20% Polyester",
      "price": 74000,
      "category": "outer",
      "segment": "unisex",
      "variant_ids": {
        "2XS": 5236394895, "XS": 5236394896, "S": 5236394897,
        "M": 5236394898, "L": 5236394899, "XL": 5236394900,
        "2XL": 5236394901, "3XL": 5236394902, "4XL": 5236394903,
        "5XL": 5236394904, "6XL": 5236394905
      },
      "synced": 11,
      "size_template": "zip_hoodie"
    },
    {
      "id": "zip-hoodie02",
      "printful_id": 424275382,
      "name": { "ja": "ユニセックス ジップアップパーカー", "en": "Unisex Zip Hoodie" },
      "images": [
        "products/zip-hoodie02/Photoroom_20251127_145215.jpg",
        "products/zip-hoodie02/Photoroom_20251127_145210.jpg",
        "products/zip-hoodie02/Photoroom_20251127_142953.jpg",
        "products/zip-hoodie02/Photoroom_20251127_142948.jpg",
        "products/zip-hoodie02/Photoroom_20251127_142900.jpg",
        "products/zip-hoodie02/Photoroom_20251127_142431.PNG",
        "products/zip-hoodie02/Photoroom_20251127_142412.jpg",
        "products/zip-hoodie02/Photoroom_20251127_142404.jpg",
        "products/zip-hoodie02/Photoroom_20251127_142358.jpg"
      ],
      "description": {
        "ja": "デジタル信号を意匠化したクロマシリーズのジップジャケット。ユニセックスシルエットに大胆なグラフィック。",
        "en": "Zip jacket in the Chroma series, designed from digital signal patterns. Bold graphics on a unisex silhouette."
      },
      "material": "リサイクルポリエステル95％、スパンデックス5％",
      "price": 14999,
      "category": "outer",
      "segment": "unisex",
      "size_template": "zip_hoodie_recycled"
    },
    {
      "id": "zip-hoodie01",
      "printful_id": 424275370,
      "name": { "ja": "クロマ フラックス ジャケット", "en": "Chroma Flux Jacket" },
      "images": [
        "products/zip-hoodie01/main.jpg",
        "products/zip-hoodie01/sub1.jpg",
        "products/zip-hoodie01/sub2.jpg",
        "products/zip-hoodie01/sub3.jpg",
        "products/zip-hoodie01/sub4.jpg"
      ],
      "thumbnail_url": "https://files.cdn.printful.com/files/9e1/9e146d418bc30e9e2b5d4d63cd40882c_preview.png",
      "description": {
        "ja": "クロマフラックス——エネルギーの流れを色と形で可視化した、TCDAを象徴するフルジップジャケット。受注生産。",
        "en": "Chroma Flux — a full-zip jacket that visualizes energy flow through colour and form. The defining TCDA piece. Made-to-order."
      },
      "material": "80% Cotton, 20% Polyester",
      "price": 74000,
      "category": "outer",
      "segment": "unisex",
      "variant_ids": {
        "2XS": 5236394906, "XS": 5236394907, "S": 5236394908,
        "M": 5236394909, "L": 5236394910, "XL": 5236394911,
        "2XL": 5236394912, "3XL": 5236394913, "4XL": 5236394914,
        "5XL": 5236394915, "6XL": 5236394916
      },
      "synced": 11,
      "size_template": "zip_hoodie"
    },
    {
      "id": "hoodie02",
      "printful_id": 424275390,
      "name": { "ja": "クロマ パルス フーディー", "en": "Chroma Pulse Hoodie" },
      "images": [
        "products/hoodie02/main.jpg",
        "products/hoodie02/sub1.jpg",
        "products/hoodie02/sub2.jpg",
        "products/hoodie02/sub3.jpg"
      ],
      "thumbnail_url": "https://files.cdn.printful.com/files/abc/abc123_preview.png",
      "description": {
        "ja": "脈動するデジタル信号を全面プリントで表現したプルオーバーフーディー。重厚なコットン素材に鮮烈な発色。",
        "en": "Pullover hoodie with an all-over print of pulsating digital signals. Rich colour on heavyweight cotton."
      },
      "material": "80% Cotton, 20% Polyester",
      "price": 18900,
      "category": "outer",
      "segment": "unisex",
      "size_template": "hoodie"
    },
    {
      "id": "hoodie01",
      "printful_id": 424275378,
      "name": { "ja": "クロマ ウェーブ フーディー", "en": "Chroma Wave Hoodie" },
      "images": [
        "products/hoodie01/main.jpg",
        "products/hoodie01/sub1.jpg",
        "products/hoodie01/sub2.jpg"
      ],
      "description": {
        "ja": "波状のクロマティックグラデーションが全体を覆う、重厚なコットン製プルオーバーフーディー。",
        "en": "Heavy cotton pullover hoodie covered in wave-like chromatic gradients."
      },
      "material": "80% Cotton, 20% Polyester",
      "price": 18900,
      "category": "outer",
      "segment": "unisex",
      "size_template": "hoodie"
    },
    {
      "id": "womens-tshirt04",
      "printful_id": 424275418,
      "name": { "ja": "クロマ ドット ウィメンズTシャツ", "en": "Chroma Dot Women's T-shirt" },
      "images": [
        "products/womens-tshirt04/main.jpg",
        "products/womens-tshirt04/sub1.jpg"
      ],
      "description": {
        "ja": "ドット状の光粒子が広がるクロマシリーズのウィメンズTシャツ。軽やかなフィット感。",
        "en": "Women's T-shirt in the Chroma series featuring spreading dot-like light particles. Light, comfortable fit."
      },
      "material": "95% Polyester, 5% Elastane",
      "price": 7900,
      "category": "tops",
      "segment": "womens",
      "size_template": "womens_tshirt"
    },
    {
      "id": "womens-tshirt03",
      "printful_id": 424275414,
      "name": { "ja": "クロマ ライン ウィメンズTシャツ", "en": "Chroma Line Women's T-shirt" },
      "images": [
        "products/womens-tshirt03/main.jpg",
        "products/womens-tshirt03/sub1.jpg"
      ],
      "description": {
        "ja": "流線型のクロマラインが全面を駆けるウィメンズTシャツ。",
        "en": "Women's T-shirt with streamlined Chroma lines running across the surface."
      },
      "material": "95% Polyester, 5% Elastane",
      "price": 7900,
      "category": "tops",
      "segment": "womens",
      "size_template": "womens_tshirt"
    },
    {
      "id": "womens-tshirt02",
      "printful_id": 424275410,
      "name": { "ja": "クロマ スプラッシュ ウィメンズTシャツ", "en": "Chroma Splash Women's T-shirt" },
      "images": [
        "products/womens-tshirt02/main.jpg",
        "products/womens-tshirt02/sub1.jpg"
      ],
      "description": {
        "ja": "スプラッシュ状の色彩が弾けるウィメンズTシャツ。鮮やかなクロマカラー。",
        "en": "Women's T-shirt with splashing colour bursts. Vivid Chroma colours."
      },
      "material": "95% Polyester, 5% Elastane",
      "price": 7900,
      "category": "tops",
      "segment": "womens",
      "size_template": "womens_tshirt"
    },
    {
      "id": "womens-tshirt01",
      "printful_id": 424275406,
      "name": { "ja": "クロマ グロウ ウィメンズTシャツ", "en": "Chroma Glow Women's T-shirt" },
      "images": [
        "products/womens-tshirt01/main.jpg",
        "products/womens-tshirt01/sub1.jpg"
      ],
      "description": {
        "ja": "発光するクロマティックグローが全面に広がるウィメンズTシャツ。",
        "en": "Women's T-shirt with an all-over glowing chromatic pattern."
      },
      "material": "95% Polyester, 5% Elastane",
      "price": 7900,
      "category": "tops",
      "segment": "womens",
      "size_template": "womens_tshirt"
    },
    {
      "id": "mens-tshirt04",
      "printful_id": 424275402,
      "name": { "ja": "クロマ ダーク メンズTシャツ", "en": "Chroma Dark Men's T-shirt" },
      "images": [
        "products/mens-tshirt04/main.jpg",
        "products/mens-tshirt04/sub1.jpg"
      ],
      "description": {
        "ja": "ダークトーンで構成されたクロマティックパターンのメンズTシャツ。",
        "en": "Men's T-shirt with a dark-toned chromatic pattern."
      },
      "material": "100% Polyester",
      "price": 7300,
      "category": "tops",
      "segment": "mens",
      "size_template": "mens_tshirt"
    },
    {
      "id": "mens-tshirt03",
      "printful_id": 424275398,
      "name": { "ja": "クロマ フロスト メンズTシャツ", "en": "Chroma Frost Men's T-shirt" },
      "images": [
        "products/mens-tshirt03/main.jpg",
        "products/mens-tshirt03/sub1.jpg"
      ],
      "description": {
        "ja": "霜のような結晶パターンが広がるクロマシリーズのメンズTシャツ。",
        "en": "Men's T-shirt with a frost crystal pattern from the Chroma series."
      },
      "material": "100% Polyester",
      "price": 7300,
      "category": "tops",
      "segment": "mens",
      "size_template": "mens_tshirt"
    },
    {
      "id": "mens-tshirt02",
      "printful_id": 424275394,
      "name": { "ja": "クロマ ブラスト メンズTシャツ", "en": "Chroma Blast Men's T-shirt" },
      "images": [
        "products/mens-tshirt02/main.jpg",
        "products/mens-tshirt02/sub1.jpg"
      ],
      "description": {
        "ja": "爆発的なクロマティックエネルギーを表現したメンズTシャツ。",
        "en": "Men's T-shirt expressing explosive chromatic energy."
      },
      "material": "100% Polyester",
      "price": 7300,
      "category": "tops",
      "segment": "mens",
      "size_template": "mens_tshirt"
    },
    {
      "id": "mens-tshirt01",
      "printful_id": 424275386,
      "name": { "ja": "クロマ ウェーブ メンズTシャツ", "en": "Chroma Wave Men's T-shirt" },
      "images": [
        "products/mens-tshirt01/main.jpg",
        "products/mens-tshirt01/sub1.jpg"
      ],
      "description": {
        "ja": "波状のクロマカラーが全面に広がるメンズTシャツ。",
        "en": "Men's T-shirt with wave-like Chroma colours across the surface."
      },
      "material": "100% Polyester",
      "price": 7300,
      "category": "tops",
      "segment": "mens",
      "size_template": "mens_tshirt"
    }
  ]
};
