/**
 * TCDA — Express サーバー（本番対応版）
 *
 * 起動:
 *   node server/server.js
 *
 * エンドポイント:
 *   GET  /api/printful/products       Printful 商品一覧（variant ID 確認）
 *   POST /create-checkout-session     Stripe Checkout セッション作成
 *   POST /webhook                     Stripe Webhook → Printful 自動発注
 *
 * Stripe CLI でのローカルテスト手順:
 *   1. stripe listen --forward-to localhost:3000/webhook
 *   2. 別ターミナルで: stripe trigger checkout.session.completed
 *   3. サーバーログで Printful 発注完了を確認
 *
 * .env 必須項目（server/.env）:
 *   STRIPE_SECRET_KEY      = sk_test_xxx  または sk_live_xxx
 *   STRIPE_WEBHOOK_SECRET  = whsec_xxx   （stripe listen で表示される値）
 *   PRINTFUL_API_KEY       = xxx
 */

// ─── 環境変数（server/.env を確実に読み込む）────────────────────────────────
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const express = require("express");
const cors    = require("cors");
const axios   = require("axios");
const stripe  = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { getProductById } = require("../data/products");

// ─── 起動前チェック（必須変数が欠けていたら即終了）───────────────────────────
const REQUIRED_ENV = ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET", "PRINTFUL_API_KEY"];
const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
if (missing.length) {
  console.error("[FATAL] 以下の環境変数が未設定です:", missing.join(", "));
  console.error("        server/.env を確認してください");
  process.exit(1);
}

// ─── アプリ設定 ───────────────────────────────────────────────────────────────
const app      = express();
const PORT     = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

// Printful API クライアント
const printfulAPI = axios.create({
  baseURL: "https://api.printful.com",
  headers: {
    Authorization: `Bearer ${process.env.PRINTFUL_API_KEY}`,
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// ─── CORS（Live Server ↔ Express の通信を許可）──────────────────────────────
app.use(cors({
  origin: [
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    "http://127.0.0.1:5501",
    "http://localhost:5501",
    "https://tcdashop.com",
  ],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
}));

app.use(express.static(path.join(__dirname, "..")));

// ─── GET /api/printful/products ───────────────────────────────────────────────
// variant ID 確認用。初期セットアップ後は使用不要。
app.get("/api/printful/products", async (req, res) => {
  console.log("[Printful] 商品一覧取得開始...");
  try {
    const { data: listData } = await printfulAPI.get("/store/products?limit=100");
    const products = listData.result || [];

    const detailed = await Promise.all(
      products.map(async (p) => {
        try {
          const { data } = await printfulAPI.get(`/store/products/${p.id}`);
          const sp       = data.result?.sync_product;
          const variants = data.result?.sync_variants || [];
          return {
            printful_id: sp?.id,
            name:        sp?.name,
            image:       sp?.thumbnail_url,
            variants: variants.map((v) => ({
              sync_variant_id: v.id,
              size:  v.size  || "",
              price: v.retail_price || "",
            })),
          };
        } catch {
          return null;
        }
      })
    );

    res.json({ products: detailed.filter(Boolean) });
  } catch (err) {
    console.error("[Printful] 取得エラー:", err.message);
    res.status(500).json({ error: "Printful API 取得失敗" });
  }
});

// ─── POST /create-checkout-session ────────────────────────────────────────────
app.post(
  ["/create-checkout-session", "/api/stripe/checkout"],
  express.json(),
  async (req, res) => {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "カートが空です" });
    }

    // Webhook で Printful 発注に使うカート情報をメタデータに保存
    const itemsMeta = items.map(({ productId, size, quantity }) => ({
      productId,
      size:     size     || "",
      quantity: quantity || 1,
    }));

    console.log("[Stripe] Checkout session 作成:", JSON.stringify(itemsMeta));

    const lineItems = items.map((item) => {
      const product  = getProductById(item.productId);
      const name     = product
        ? `${product.name}${item.size ? ` — ${item.size}` : ""}`
        : item.name || "TCDA Product";
      const imageUrl = product?.image
        ? `${BASE_URL}/${String(product.image).replace(/^\//, "")}`
        : null;

      return {
        price_data: {
          currency: "jpy",
          product_data: { name, ...(imageUrl ? { images: [imageUrl] } : {}) },
          unit_amount: item.priceJpy || product?.price || 0,
        },
        quantity: item.quantity || 1,
      };
    });

    try {
      const session = await stripe.checkout.sessions.create({
        mode:                        "payment",
        payment_method_types:        ["card"],
        line_items:                  lineItems,
        success_url:                 `${BASE_URL}/success.html?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url:                  `${BASE_URL}/shop.html?cancelled=1`,
        billing_address_collection:  "auto",
        shipping_address_collection: { allowed_countries: ["JP"] },
        metadata:                    { items: JSON.stringify(itemsMeta) },
      });

      console.log("[Stripe] ✅ Session 作成成功:", session.id);
      res.json({ url: session.url, sessionId: session.id });
    } catch (err) {
      console.error("[Stripe] ❌ Session 作成エラー:", err.message);
      res.status(502).json({ error: "決済の初期化に失敗しました" });
    }
  }
);

// ─── POST /webhook ────────────────────────────────────────────────────────────
// 重要: express.raw() が必須（署名検証に生のボディが必要）
app.post(
  ["/webhook", "/api/stripe/webhook"],
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig           = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    // 署名検証（必須 — スキップ不可）
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error("[Webhook] ❌ 署名検証失敗:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // 決済完了イベントのみ処理
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      console.log("\n[Webhook] ====== 決済完了 ======");
      console.log("[Webhook] Session ID :", session.id);
      console.log("[Webhook] 顧客       :", session.customer_details?.email);
      console.log("[Webhook] 金額       :", session.amount_total, session.currency?.toUpperCase());
      console.log("[Webhook] ========================\n");

      // Printful 自動発注（失敗しても Stripe へは 200 を返す）
      try {
        await triggerPrintfulOrder(session);
      } catch (err) {
        console.error("[Printful] ❌ 発注処理で予期しないエラー:", err.message);
      }
    }

    // Stripe には必ず 200 を返す（リトライ防止）
    res.json({ received: true });
  }
);

// ─── Printful 自動発注 ───────────────────────────────────────────────────────
async function triggerPrintfulOrder(session) {
  // メタデータからカートアイテムを復元
  let items;
  try {
    items = JSON.parse(session.metadata?.items || "[]");
  } catch {
    console.error("[Printful] ❌ metadata.items のパースに失敗");
    return;
  }

  if (!items.length) {
    console.warn("[Printful] ❌ 発注アイテムなし（metadata.items が空）");
    return;
  }

  console.log("[Printful] ====== 発注処理開始 ======");

  // 配送先（Stripe shipping_details から）
  const addr      = session.shipping_details?.address || {};
  const recipient = {
    name:         session.customer_details?.name  || "Customer",
    email:        session.customer_details?.email || "",
    address1:     addr.line1       || "",
    address2:     addr.line2       || "",
    city:         addr.city        || "",
    zip:          addr.postal_code || "",
    country_code: addr.country     || "JP",
  };

  console.log("[Printful] 配送先:", JSON.stringify(recipient));

  // variant_id を解決
  const printfulItems = [];
  for (const item of items) {
    const product = getProductById(item.productId);
    if (!product) {
      console.warn(`[Printful] ❌ 商品未発見: ${item.productId}`);
      continue;
    }

    const variantId = product.variant_ids?.[item.size];
    if (!variantId) {
      console.warn(`[Printful] ❌ variant_id 未設定: ${product.name} / size="${item.size}"`);
      console.warn(`            利用可能サイズ: [ ${Object.keys(product.variant_ids || {}).join(", ")} ]`);
      continue;
    }

    console.log(`[Printful] ✅ ${product.name} / ${item.size} → variant_id: ${variantId}`);
    printfulItems.push({ sync_variant_id: variantId, quantity: item.quantity || 1 });
  }

  if (!printfulItems.length) {
    console.error("[Printful] ❌ 有効アイテムなし — 発注中断");
    return;
  }

  // Printful に注文を送信
  const orderPayload = { recipient, items: printfulItems };
  console.log("[Printful] 発注ペイロード:", JSON.stringify(orderPayload, null, 2));

  const { data } = await printfulAPI.post("/orders", orderPayload);

  console.log("[Printful] ✅ 発注成功!");
  console.log("[Printful]   Order ID :", data.result?.id);
  console.log("[Printful]   Status   :", data.result?.status);
  console.log("[Printful] ==============================\n");
}

// ─── サーバー起動 ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  const mode = process.env.STRIPE_SECRET_KEY?.startsWith("sk_live_") ? "本番" : "テスト";
  console.log(`\n✅ TCDA サーバー起動: ${BASE_URL}`);
  console.log(`   Stripe  : ${mode}モード`);
  console.log(`   Printful: API キー設定済み`);
  console.log("");
  console.log("  POST /create-checkout-session   Stripe Checkout セッション作成");
  console.log("  POST /webhook                   Stripe Webhook → Printful 自動発注");
  console.log("  GET  /api/printful/products     Printful 商品一覧（variant ID 確認）");
  console.log("");
  console.log("  Stripe CLI テスト:");
  console.log("  $ stripe listen --forward-to localhost:3000/webhook");
  console.log("  $ stripe trigger checkout.session.completed");
  console.log("");
});
