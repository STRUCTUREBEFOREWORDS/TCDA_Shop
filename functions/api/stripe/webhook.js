/**
 * TCDA — Cloudflare Pages Function: Stripe Webhook Handler
 *
 * Stripe ダッシュボード → Developers → Webhooks → エンドポイント追加
 * URL: https://tcdashop.com/api/stripe/webhook
 * 購読イベント: checkout.session.completed
 *
 * 環境変数（Cloudflare Pages → Settings → Environment variables）:
 *   STRIPE_WEBHOOK_SECRET = whsec_xxxx
 *   PRINTFUL_API_KEY      = xxxx
 */

// 商品マスター（Cloudflare Functions 環境では dynamic import 不可のため直接定義）
// data/products.js の variant_ids と同期させること
const PRODUCTS = [
  {
    id: "tcda-cnj-001",
    variant_ids: { S: 0, M: 0, L: 0, XL: 0 },
  },
  {
    id: "tcda-csj-001",
    variant_ids: { S: 0, M: 0, L: 0, XL: 0 },
  },
  {
    id: "tcda-pts-001",
    variant_ids: { XS: 0, S: 0, M: 0, L: 0, XL: 0, "2XL": 0 },
  },
  {
    id: "tcda-svt-001",
    variant_ids: { XS: 0, S: 0, M: 0, L: 0, XL: 0, "2XL": 0 },
  },
  {
    id: "tcda-ces-001",
    variant_ids: {
      "24.5": 0, "25": 0, "25.5": 0, "26": 0,
      "26.5": 0, "27": 0, "27.5": 0, "28": 0,
    },
  },
];

function getProductById(id) {
  return PRODUCTS.find((p) => p.id === id) || null;
}

export async function onRequestPost(context) {
  const { request, env } = context;

  const sig = request.headers.get("stripe-signature");
  const webhookSecret = env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return new Response("Webhook secret not configured", { status: 503 });
  }

  const rawBody = await request.text();

  let event;
  try {
    event = await verifyStripeSignature(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error("[Webhook] 署名検証失敗:", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    console.log("[Order] 決済完了:", {
      sessionId: session.id,
      email: session.customer_details?.email,
      amount: session.amount_total,
      currency: session.currency,
    });

    // Printful 自動発注
    await triggerPrintfulOrder(session, env.PRINTFUL_API_KEY);
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

// ─── Printful 自動発注 ────────────────────────────────────────────────────────
async function triggerPrintfulOrder(session, apiKey) {
  if (!apiKey) {
    console.warn("[Printful] API キー未設定 — 発注をスキップします");
    return;
  }

  let items;
  try {
    items = JSON.parse(session.metadata?.items || "[]");
  } catch {
    console.error("[Printful] メタデータのパースに失敗");
    return;
  }

  if (!items.length) {
    console.warn("[Printful] 発注アイテムなし");
    return;
  }

  const shipping = session.shipping_details?.address;
  const recipient = {
    name:         session.customer_details?.name || "Customer",
    email:        session.customer_details?.email || "",
    address1:     shipping?.line1 || "",
    address2:     shipping?.line2 || "",
    city:         shipping?.city || "",
    zip:          shipping?.postal_code || "",
    country_code: shipping?.country || "JP",
  };

  const printfulItems = [];
  for (const item of items) {
    const product = getProductById(item.productId);
    if (!product) {
      console.warn("[Printful] 商品なし:", item.productId);
      continue;
    }
    const variantId = product.variant_ids[item.size];
    if (!variantId) {
      console.warn(`[Printful] variant_id 未設定: ${item.productId} / ${item.size}`);
      continue;
    }
    printfulItems.push({
      sync_variant_id: variantId,
      quantity: item.quantity,
    });
  }

  if (!printfulItems.length) {
    console.warn("[Printful] 有効アイテムなし（data/products.js の variant_ids を設定してください）");
    return;
  }

  const orderPayload = {
    recipient,
    items: printfulItems,
  };

  try {
    const res = await fetch("https://api.printful.com/orders", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderPayload),
    });

    const data = await res.json();

    if (!res.ok) {
      if (res.status === 401) {
        console.error("[Printful] 認証エラー (401) — PRINTFUL_API_KEY を確認してください");
      } else {
        console.error(`[Printful] 発注エラー (${res.status}):`, JSON.stringify(data));
      }
      return;
    }

    console.log("[Printful] 発注成功 — Order ID:", data.result?.id);
  } catch (err) {
    console.error("[Printful] リクエスト失敗:", err.message);
  }
}

// ─── Stripe 署名検証（Web Crypto API）────────────────────────────────────────
async function verifyStripeSignature(payload, header, secret) {
  if (!header) throw new Error("Missing stripe-signature header");

  const parts = Object.fromEntries(
    header.split(",").map((p) => p.split("="))
  );
  const timestamp = parts["t"];
  const signature = parts["v1"];

  if (!timestamp || !signature) throw new Error("Invalid signature header format");

  const signedPayload = `${timestamp}.${payload}`;
  const keyData = new TextEncoder().encode(secret);
  const msgData = new TextEncoder().encode(signedPayload);

  const key = await crypto.subtle.importKey(
    "raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const mac = await crypto.subtle.sign("HMAC", key, msgData);
  const expected = Array.from(new Uint8Array(mac))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  if (expected !== signature) throw new Error("Signature mismatch");

  const age = Math.floor(Date.now() / 1000) - Number(timestamp);
  if (age > 300) throw new Error("Event timestamp too old");

  return JSON.parse(payload);
}
