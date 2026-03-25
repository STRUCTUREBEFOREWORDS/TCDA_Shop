/**
 * TCDA — Express サーバー
 *
 * 起動: node server/server.js
 * 前提: .env ファイルが存在すること
 *
 * エンドポイント:
 *   GET  /api/printful/products    Printful商品一覧（variant IDs確認用）
 *   POST /api/stripe/checkout      Stripe Checkout セッション作成
 *   POST /api/stripe/webhook       Stripe Webhook → Printful 自動発注
 */

require("dotenv").config();

const express = require("express");
const cors    = require("cors");
const path    = require("path");
const stripe  = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { getProductById } = require("../data/products");

// ─── 起動前チェック ───────────────────────────────────────────────────────────
if (!process.env.STRIPE_SECRET_KEY) {
  console.error("[ERROR] STRIPE_SECRET_KEY 未設定 — .env を確認してください");
  process.exit(1);
}
if (!process.env.STRIPE_WEBHOOK_SECRET) {
  console.warn("[WARN]  STRIPE_WEBHOOK_SECRET 未設定 — webhook 署名検証をスキップします");
}
if (!process.env.PRINTFUL_API_KEY) {
  console.warn("[WARN]  PRINTFUL_API_KEY 未設定 — Printful 連携は無効です");
}

// ─── アプリ設定 ───────────────────────────────────────────────────────────────
const app      = express();
const PORT     = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

// ─── CORS（Live Server 5500 ↔ Express 3000 の通信を許可）────────────────────
app.use(cors({
  origin: [
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    "http://127.0.0.1:5501",
    "http://localhost:5501",
  ],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
}));

app.use(express.static(path.join(__dirname, "..")));

// ─── GET /api/printful/products ───────────────────────────────────────────────
// Printful の実際の sync_variant_id を確認するためのエンドポイント。
// 取得した ID を data/products.js の variant_ids に設定すること。
app.get("/api/printful/products", async (req, res) => {
  const apiKey = process.env.PRINTFUL_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: "PRINTFUL_API_KEY 未設定" });
  }

  console.log("[Printful] 商品一覧取得開始...");

  try {
    // ① ストア商品一覧
    const listRes = await fetch("https://api.printful.com/store/products", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!listRes.ok) {
      if (listRes.status === 401) {
        console.error("[Printful] 認証エラー (401) — PRINTFUL_API_KEY を確認");
        return res.status(401).json({ error: "Printful 認証エラー — PRINTFUL_API_KEY を確認してください" });
      }
      return res.status(listRes.status).json({ error: `Printful API エラー (${listRes.status})` });
    }

    const listData = await listRes.json();
    const products = listData.result || [];
    console.log(`[Printful] ${products.length} 商品を取得`);

    // ② 各商品の variant 詳細（sync_variant_id 含む）を取得
    const detailed = await Promise.all(
      products.map(async (p) => {
        try {
          const detailRes = await fetch(
            `https://api.printful.com/store/products/${p.id}`,
            { headers: { Authorization: `Bearer ${apiKey}` } }
          );
          if (!detailRes.ok) return null;
          const detail = await detailRes.json();
          const sp       = detail.result?.sync_product;
          const variants = detail.result?.sync_variants || [];

          return {
            printful_id: sp?.id,
            name:        sp?.name,
            image:       sp?.thumbnail_url,
            // サイズ別 sync_variant_id マッピング — data/products.js の variant_ids に貼り付ける
            variants: variants.map((v) => ({
              sync_variant_id: v.id,
              name:  v.name,
              size:  v.size  || "",
              color: v.color || "",
              price: v.retail_price || "",
            })),
          };
        } catch (err) {
          console.warn(`[Printful] 商品詳細取得失敗 id=${p.id}:`, err.message);
          return null;
        }
      })
    );

    const result = detailed.filter(Boolean);
    console.log(`[Printful] ${result.length} 商品の詳細取得完了`);
    res.json({ products: result });
  } catch (err) {
    console.error("[Printful] products 取得エラー:", err.message);
    res.status(500).json({ error: "Printful API 取得失敗" });
  }
});

// ─── POST /api/stripe/checkout ────────────────────────────────────────────────
app.post(
  ["/api/stripe/checkout", "/create-checkout-session"],
  express.json(),
  async (req, res) => {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "カートが空です" });
    }

    // webhook で Printful 発注に使うためカート情報をメタデータに保存
    const itemsMeta = items.map((item) => ({
      productId: item.productId,
      size:      item.size || "",
      quantity:  item.quantity || 1,
    }));

    console.log("[Stripe] ▶ 受信データ:", JSON.stringify(req.body, null, 2));
    console.log("[Stripe] Checkout session 作成:", JSON.stringify(itemsMeta));

    const lineItems = items.map((item) => {
      const product  = getProductById(item.productId);
      const name     = product
        ? `${product.name}${item.size ? ` — ${item.size}` : ""}`
        : (item.name || "TCDA Product");
      // 画像 URL（先頭の / を正規化）
      const imageUrl = product?.image
        ? `${BASE_URL}/${String(product.image).replace(/^\//, "")}`
        : null;

      return {
        price_data: {
          currency: "jpy",
          product_data: {
            name,
            ...(imageUrl ? { images: [imageUrl] } : {}),
          },
          unit_amount: item.priceJpy || (product ? product.price : 0),
        },
        quantity: item.quantity || 1,
      };
    });

    try {
      const session = await stripe.checkout.sessions.create({
        mode:                         "payment",
        payment_method_types:         ["card"],
        line_items:                   lineItems,
        success_url:                  `${BASE_URL}/success.html?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url:                   `${BASE_URL}/shop.html?cancelled=1`,
        billing_address_collection:   "auto",
        shipping_address_collection:  { allowed_countries: ["JP"] },
        metadata:                     { items: JSON.stringify(itemsMeta) },
      });

      console.log("[Stripe] Session 作成成功:", session.id);
      res.json({ url: session.url, sessionId: session.id });
    } catch (err) {
      console.error("[Stripe] Session 作成エラー:", err.message);
      if (err.statusCode === 401) {
        console.error("[Stripe] 認証エラー — STRIPE_SECRET_KEY を確認してください");
      }
      res.status(502).json({ error: "決済の初期化に失敗しました" });
    }
  }
);

// ─── POST /api/stripe/webhook ─────────────────────────────────────────────────
app.post(
  ["/api/stripe/webhook", "/webhook"],
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig           = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;
    if (webhookSecret) {
      try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
      } catch (err) {
        console.error("[Webhook] 署名検証失敗:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }
    } else {
      // 開発中（STRIPE_WEBHOOK_SECRET 未設定）は署名検証をスキップ
      try {
        event = JSON.parse(req.body.toString());
      } catch {
        return res.status(400).send("Invalid JSON");
      }
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      console.log("\n[Webhook] ====== 決済完了 ======");
      console.log("[Webhook] Session ID :", session.id);
      console.log("[Webhook] 顧客メール  :", session.customer_details?.email);
      console.log("[Webhook] 金額        :", session.amount_total, session.currency?.toUpperCase());
      console.log("[Webhook] ==========================\n");

      await triggerPrintfulOrder(session);
    }

    res.json({ received: true });
  }
);

// ─── Printful 自動発注（詳細ログ付き）──────────────────────────────────────
async function triggerPrintfulOrder(session) {
  const apiKey = process.env.PRINTFUL_API_KEY;
  if (!apiKey) {
    console.warn("[Printful] API キー未設定 — 発注をスキップします");
    return;
  }

  // メタデータからアイテムを復元
  let items;
  try {
    items = JSON.parse(session.metadata?.items || "[]");
  } catch {
    console.error("[Printful] metadata.items のパースに失敗");
    return;
  }

  console.log("\n[Printful] ====== 発注処理開始 ======");
  console.log("[Printful] 受信アイテム:", JSON.stringify(items, null, 2));

  if (!items.length) {
    console.warn("[Printful] 発注アイテムなし — metadata.items が空です");
    return;
  }

  // 配送先（Stripe の shipping_details から）
  const shipping  = session.shipping_details?.address;
  const recipient = {
    name:         session.customer_details?.name  || "Customer",
    email:        session.customer_details?.email || "",
    address1:     shipping?.line1        || "",
    address2:     shipping?.line2        || "",
    city:         shipping?.city         || "",
    zip:          shipping?.postal_code  || "",
    country_code: shipping?.country      || "JP",
  };

  console.log("[Printful] 配送先:", JSON.stringify(recipient, null, 2));

  // Printful items 構築
  const printfulItems = [];

  for (const item of items) {
    console.log(`\n[Printful] --- アイテム処理 ---`);
    console.log(`[Printful]   productId : ${item.productId}`);
    console.log(`[Printful]   size      : ${item.size}`);
    console.log(`[Printful]   quantity  : ${item.quantity}`);

    const product = getProductById(item.productId);
    if (!product) {
      console.warn(`[Printful] ❌ 商品未発見: "${item.productId}"`);
      console.warn(`[Printful]    → data/products.js に id="${item.productId}" が存在するか確認`);
      continue;
    }
    console.log(`[Printful] ✓ 商品発見: ${product.name}`);
    console.log(`[Printful]   variant_ids:`, JSON.stringify(product.variant_ids));

    const variantId = product.variant_ids?.[item.size];
    if (!variantId) {
      console.warn(`[Printful] ❌ variant_id 未設定: ${product.name} / size="${item.size}"`);
      console.warn(`[Printful]    設定済みサイズ: [ ${Object.keys(product.variant_ids || {}).join(", ")} ]`);
      console.warn(`[Printful]    → GET /api/printful/products で実際の ID を取得し,`);
      console.warn(`[Printful]      data/products.js の variant_ids に設定してください`);
      continue;
    }
    console.log(`[Printful] ✓ variant_id: ${variantId}`);

    printfulItems.push({ sync_variant_id: variantId, quantity: item.quantity });
  }

  if (!printfulItems.length) {
    console.warn("\n[Printful] ❌ 有効アイテムなし — 発注中断");
    console.warn("[Printful]    原因: variant_ids がすべて 0 (未設定)");
    console.warn("[Printful]    修正手順:");
    console.warn("    1. node server/server.js を起動");
    console.warn("    2. GET http://localhost:3000/api/printful/products を開く");
    console.warn("    3. 各商品の sync_variant_id をコピー");
    console.warn("    4. data/products.js の variant_ids に設定");
    console.warn("    5. functions/api/stripe/webhook.js の PRODUCTS も同様に更新\n");
    return;
  }

  const orderPayload = { recipient, items: printfulItems };
  console.log("\n[Printful] 発注ペイロード:", JSON.stringify(orderPayload, null, 2));

  try {
    const fetchRes = await fetch("https://api.printful.com/orders", {
      method:  "POST",
      headers: {
        Authorization:  `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderPayload),
    });

    const data = await fetchRes.json();

    if (!fetchRes.ok) {
      if (fetchRes.status === 401) {
        console.error("[Printful] ❌ 認証エラー (401) — PRINTFUL_API_KEY を確認してください");
      } else {
        console.error(`[Printful] ❌ 発注エラー (${fetchRes.status}):`, JSON.stringify(data, null, 2));
      }
      return;
    }

    console.log("[Printful] ✅ 発注成功!");
    console.log("[Printful]   Order ID :", data.result?.id);
    console.log("[Printful]   Status   :", data.result?.status);
    console.log("[Printful] ==============================\n");
  } catch (err) {
    console.error("[Printful] ❌ リクエスト失敗:", err.message);
  }
}

// ─── サーバー起動 ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n✓ TCDA サーバー起動: ${BASE_URL}`);
  console.log("  GET  /api/printful/products   Printful商品一覧（variant ID確認用）");
  console.log("  POST /api/stripe/checkout     Stripe Checkout セッション作成");
  console.log("  POST /api/stripe/webhook      Stripe Webhook → Printful 自動発注");
  console.log(`\n環境    : ${process.env.NODE_ENV || "development"}`);
  console.log(`Stripe  : ${process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_") ? "テストモード ✓" : "本番モード"}`);
  console.log(`Printful: ${process.env.PRINTFUL_API_KEY ? "API キー設定済み ✓" : "未設定 ⚠"}`);
  console.log("");
});
