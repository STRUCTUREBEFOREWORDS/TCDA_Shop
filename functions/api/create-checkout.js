/**
 * TCDA — Cloudflare Pages Function: /api/create-checkout
 *
 * Validates price server-side using products.json + currency.json,
 * then creates a Stripe Checkout Session.
 *
 * Required env vars (Cloudflare Pages Settings → Environment variables):
 *   STRIPE_SECRET_KEY = sk_live_xxxx
 */

const ALLOWED_ORIGINS = [
  "https://tcdashop.com",
  "https://www.tcdashop.com",
  "http://localhost",
  "http://127.0.0.1",
];

/* Stripe zero-decimal currencies — unit_amount = integer amount, no ×100 */
const ZERO_DECIMAL = new Set([
  "BIF","CLP","DJF","GNF","ISK","JPY","KMF","KRW","MGA","PYG",
  "RWF","UGX","VND","VUV","XAF","XOF","XPF",
]);

export async function onRequestPost(context) {
  const { request, env } = context;

  const origin = request.headers.get("Origin") || "";
  const allowed =
    ALLOWED_ORIGINS.some((o) => origin.startsWith(o)) ||
    origin.startsWith("http://localhost") ||
    origin.startsWith("http://127.0.0.1");
  if (!allowed) return new Response("Forbidden", { status: 403 });

  const secretKey = env.STRIPE_SECRET_KEY;
  if (!secretKey) return corsJson({ error: "Stripe not configured" }, 503, origin);

  /* ── Parse body ────────────────────────────────────────────────── */
  let body;
  try { body = await request.json(); }
  catch { return corsJson({ error: "Invalid JSON" }, 400, origin); }

  const { product_id, currency, price_display, lang, size, name, image } = body;

  if (!product_id || !currency || price_display === undefined || price_display === null) {
    return corsJson({ error: "Missing required fields: product_id, currency, price_display" }, 400, origin);
  }

  const CUR = String(currency).toUpperCase();

  /* ── Fetch products.json + currency.json from same origin ────── */
  const base = new URL(request.url).origin;
  let productsData, rates;
  try {
    const [pr, cr] = await Promise.all([
      fetch(base + "/data/products.json"),
      fetch(base + "/data/currency.json"),
    ]);
    if (!pr.ok) throw new Error("products.json " + pr.status);
    if (!cr.ok) throw new Error("currency.json "  + cr.status);
    [productsData, rates] = await Promise.all([pr.json(), cr.json()]);
  } catch (err) {
    return corsJson({ error: "Failed to load reference data: " + String(err) }, 502, origin);
  }

  /* ── Find product ────────────────────────────────────────────── */
  const product = (productsData.products || []).find((p) => p.id === product_id);
  if (!product) return corsJson({ error: "Product not found: " + product_id }, 404, origin);

  /* ── Validate currency ──────────────────────────────────────── */
  const rate = rates[CUR];
  if (rate === undefined) return corsJson({ error: "Unsupported currency: " + CUR }, 400, origin);

  /* ── Server-side price re-calculation & validation ───────────── */
  const recalc = product.price * rate;
  /* Allow ±1 cent tolerance for floating-point drift */
  if (Math.round(recalc * 100) !== Math.round(Number(price_display) * 100)) {
    return corsJson(
      { error: "Price mismatch — tampering detected", expected: recalc, received: price_display },
      400, origin
    );
  }

  /* ── Stripe unit_amount ─────────────────────────────────────── */
  const isZero = ZERO_DECIMAL.has(CUR);
  const unitAmount = isZero
    ? Math.round(Number(price_display))         /* e.g. ¥1200 → 1200  */
    : Math.round(Number(price_display) * 100);  /* e.g. $12.00 → 1200 */

  /* ── Product display name ───────────────────────────────────── */
  const safeLang = String(lang || "ja").replace(/[^a-z-]/gi, "");
  const productName = (() => {
    if (typeof product.name === "object") {
      return product.name[safeLang] || product.name.ja || product.name.en || product_id;
    }
    return String(product.name || product_id);
  })();
  const displayName = name || (productName + (size ? ` (${size})` : ""));

  /* ── Build Stripe params ────────────────────────────────────── */
  const params = new URLSearchParams();
  params.append("mode", "payment");
  params.append("success_url", `https://tcdashop.com/success.html?session_id={CHECKOUT_SESSION_ID}`);
  params.append("cancel_url",  `https://tcdashop.com/shop.html?cancelled=1`);
  params.append("payment_method_types[]", "card");
  params.append("billing_address_collection", "auto");
  params.append("line_items[0][price_data][currency]",              CUR.toLowerCase());
  params.append("line_items[0][price_data][product_data][name]",    displayName);
  params.append("line_items[0][price_data][unit_amount]",           String(unitAmount));
  params.append("line_items[0][quantity]",                          "1");
  if (image) params.append("line_items[0][price_data][product_data][images][]", image);
  params.append("metadata[product_id]", product_id);
  params.append("metadata[size]",       size || "");
  params.append("metadata[currency]",   CUR);
  params.append("metadata[lang]",       safeLang);

  /* ── Call Stripe ────────────────────────────────────────────── */
  try {
    const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });
    const session = await stripeRes.json();
    if (!stripeRes.ok) {
      return corsJson({ error: session.error?.message || "Stripe error" }, stripeRes.status, origin);
    }
    return corsJson({ url: session.url, sessionId: session.id }, 200, origin);
  } catch (err) {
    return corsJson({ error: "Checkout failed", detail: String(err) }, 502, origin);
  }
}

export async function onRequestOptions(context) {
  const origin = context.request.headers.get("Origin") || "";
  return new Response(null, { status: 204, headers: corsHeaders(origin) });
}

function corsJson(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
  });
}

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin":  origin || "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}
