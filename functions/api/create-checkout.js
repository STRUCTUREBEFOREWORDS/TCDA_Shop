/**
 * TCDA — /api/create-checkout  (Cloudflare Pages Function)
 * Security: price re-validation, synced-product check, fixed CORS
 */

const ORIGIN       = "https://tcdashop.com";
const STRIPE_API   = "https://api.stripe.com/v1/checkout/sessions";
const ZERO_DECIMAL = new Set([
  "BIF","CLP","DJF","GNF","ISK","JPY","KMF","KRW","MGA","PYG",
  "RWF","UGX","VND","VUV","XAF","XOF","XPF",
]);

function cors() {
  return {
    "Access-Control-Allow-Origin":  ORIGIN,
    "Access-Control-Allow-Methods": "GET, POST",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}
function err(msg, status = 400) {
  return new Response(JSON.stringify({ error: msg }), {
    status,
    headers: { "Content-Type": "application/json", ...cors() },
  });
}
function ok(data) {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json", ...cors() },
  });
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: cors() });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  /* ① CORS origin check */
  const origin = request.headers.get("Origin") || "";
  if (origin !== ORIGIN && !origin.startsWith("http://localhost") && !origin.startsWith("http://127.0.0.1")) {
    return new Response("Forbidden", { status: 403 });
  }

  /* Stripe key */
  const secretKey = env.STRIPE_SECRET_KEY;
  if (!secretKey) return err("Stripe not configured", 400);

  /* Parse body */
  let body;
  try { body = await request.json(); }
  catch { return err("Invalid JSON"); }

  const { product_id, currency, price_display, lang, size, image } = body;

  if (!product_id || !currency || price_display == null) {
    return err("Missing: product_id, currency, price_display");
  }

  const CUR = String(currency).toUpperCase();
  const pd  = Number(price_display);
  if (!Number.isFinite(pd) || pd <= 0) return err("Invalid price_display");

  /* Load reference data server-side */
  const base = new URL(request.url).origin;
  let products, rates;
  try {
    const [pr, cr] = await Promise.all([
      fetch(base + "/data/products.json"),
      fetch(base + "/data/currency.json"),
    ]);
    if (!pr.ok || !cr.ok) throw new Error("reference data unavailable");
    [products, rates] = await Promise.all([pr.json(), cr.json()]);
  } catch (e) {
    return err("Reference data load failed: " + String(e));
  }

  /* ③ 存在しない商品ID */
  const product = (products.products || []).find((p) => p.id === product_id);
  if (!product) return err("Invalid product: " + product_id);

  /* ④ 未同期商品（synced === 0 または variant_ids が空） */
  const synced = Number(product.synced ?? 1);
  const hasVariants = product.variant_ids && Object.keys(product.variant_ids).length > 0;
  if (synced === 0 && !hasVariants) return err("Product not synced: " + product_id);

  /* ② 通貨レート確認 */
  const rate = rates[CUR];
  if (rate === undefined) return err("Unsupported currency: " + CUR);

  /* ① 価格改ざんチェック */
  const recalculated = product.price * rate;
  if (Math.round(recalculated * 100) !== Math.round(pd * 100)) {
    return err("Invalid price");   /* 改ざん → 400、詳細は返さない */
  }

  /* unit_amount: zero-decimal は整数、それ以外は ×100 */
  const isZero     = ZERO_DECIMAL.has(CUR);
  const unitAmount = isZero ? Math.round(pd) : Math.round(pd * 100);

  /* ⑤ 多言語: Stripe表示は英語固定 */
  const displayName = (
    typeof product.name === "object"
      ? (product.name.en || product.name.ja || product_id)
      : String(product.name || product_id)
  ) + (size ? ` (${size})` : "");

  /* Stripe params */
  const params = new URLSearchParams();
  params.append("mode",                    "payment");
  params.append("success_url",             `${ORIGIN}/success.html?session_id={CHECKOUT_SESSION_ID}`);
  params.append("cancel_url",              `${ORIGIN}/shop.html?cancelled=1`);
  params.append("payment_method_types[]",  "card");
  params.append("billing_address_collection", "auto");
  params.append("line_items[0][price_data][currency]",           CUR.toLowerCase());
  params.append("line_items[0][price_data][product_data][name]", displayName);
  params.append("line_items[0][price_data][unit_amount]",        String(unitAmount));
  params.append("line_items[0][quantity]",                       "1");
  if (image) params.append("line_items[0][price_data][product_data][images][]", image);
  params.append("metadata[product_id]", product_id);
  params.append("metadata[size]",       size || "");
  params.append("metadata[currency]",   CUR);
  params.append("metadata[lang]",       String(lang || "ja").replace(/[^a-z-]/gi, ""));

  /* Stripe API call */
  try {
    const res     = await fetch(STRIPE_API, {
      method: "POST",
      headers: { Authorization: `Bearer ${secretKey}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
    const session = await res.json();
    if (!res.ok) return err(session.error?.message || "Stripe error");
    return ok({ url: session.url, sessionId: session.id });
  } catch (e) {
    return err("Checkout failed: " + String(e));
  }
}
