/**
 * TCDA — Cloudflare Worker
 * Deploy: wrangler deploy
 *
 * KV binding  : PRODUCTS_KV
 * Env vars    : STRIPE_SECRET_KEY, PRINTFUL_API_KEY, PRINTFUL_STORE_ID,
 *               PRINTFUL_WEBHOOK_SECRET
 */

const ALLOWED_ORIGINS = [
  "https://tcdashop.com",
  "https://www.tcdashop.com",
  "http://localhost",
  "http://127.0.0.1",
];

const ZERO_DECIMAL = new Set([
  "BIF","CLP","DJF","GNF","ISK","JPY","KMF","KRW","MGA","PYG",
  "RWF","UGX","VND","VUV","XAF","XOF","XPF",
]);

const KV_KEY      = "products_json";
const PF_API      = "https://api.printful.com";
const MAX_RETRY   = 3;

/* ── Router ──────────────────────────────────────────────────────── */
export default {
  async fetch(req, env) {
    const url    = new URL(req.url);
    const origin = req.headers.get("Origin") || "";
    const method = req.method;

    /* CORS preflight */
    if (method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    if (url.pathname === "/api/products" && method === "GET") {
      return handleProducts(env, origin);
    }

    if (url.pathname === "/api/product" && method === "GET") {
      return handleProduct(url, env, origin);
    }

    if ((url.pathname === "/api/checkout" || url.pathname === "/api/create-checkout") && method === "POST") {
      return handleCheckout(req, env, origin);
    }

    if (url.pathname === "/api/printful-webhook" && method === "POST") {
      return handleWebhook(req, env);
    }

    return new Response("Not found", { status: 404 });
  },
};

/* ── GET /api/products ───────────────────────────────────────────── */
async function handleProducts(env, origin) {
  const data = await kvGet(env);
  return corsJson(data, 200, origin);
}

/* ── GET /api/product?id=xxx ─────────────────────────────────────── */
async function handleProduct(url, env, origin) {
  const id = url.searchParams.get("id");
  if (!id) return corsJson({ error: "id required" }, 400, origin);

  const data    = await kvGet(env);
  const product = (data.products || []).find((p) => p.id === id);
  if (!product) return corsJson({ error: "Not found" }, 404, origin);
  return corsJson(product, 200, origin);
}

/* ── POST /api/checkout ──────────────────────────────────────────── */
async function handleCheckout(req, env, origin) {
  if (!allowedOrigin(origin)) return new Response("Forbidden", { status: 403 });

  const secretKey = env.STRIPE_SECRET_KEY;
  if (!secretKey) return corsJson({ error: "Stripe not configured" }, 503, origin);

  let body;
  try { body = await req.json(); }
  catch { return corsJson({ error: "Invalid JSON" }, 400, origin); }

  const { product_id, currency, price_display, lang, size, name, image } = body;

  if (!product_id || !currency || price_display == null) {
    return corsJson({ error: "Missing: product_id, currency, price_display" }, 400, origin);
  }

  const CUR = String(currency).toUpperCase();

  /* Load products + currency rates from Worker origin */
  const base = new URL(req.url).origin;
  let productsData, rates;
  try {
    const [pr, cr] = await Promise.all([
      fetch(base + "/api/products"),
      fetch(base + "/data/currency.json"),
    ]);
    if (!pr.ok) throw new Error("products " + pr.status);
    if (!cr.ok) throw new Error("currency " + cr.status);
    [productsData, rates] = await Promise.all([pr.json(), cr.json()]);
  } catch (err) {
    return corsJson({ error: "Failed to load reference data: " + err }, 502, origin);
  }

  const product = (productsData.products || []).find((p) => p.id === product_id);
  if (!product) return corsJson({ error: "Product not found: " + product_id }, 404, origin);

  const rate = rates[CUR];
  if (rate === undefined) return corsJson({ error: "Unsupported currency: " + CUR }, 400, origin);

  /* Server-side price validation */
  const recalc = product.price * rate;
  if (Math.round(recalc * 100) !== Math.round(Number(price_display) * 100)) {
    return corsJson({ error: "Price mismatch", expected: recalc, received: price_display }, 400, origin);
  }

  const isZero     = ZERO_DECIMAL.has(CUR);
  const unitAmount = isZero
    ? Math.round(Number(price_display))
    : Math.round(Number(price_display) * 100);

  const safeLang   = String(lang || "ja").replace(/[^a-z-]/gi, "");
  const productName = typeof product.name === "object"
    ? (product.name[safeLang] || product.name.ja || product.name.en || product_id)
    : String(product.name || product_id);
  const displayName = name || (productName + (size ? ` (${size})` : ""));

  const params = new URLSearchParams();
  params.append("mode",                    "payment");
  params.append("success_url",             "https://tcdashop.com/success.html?session_id={CHECKOUT_SESSION_ID}");
  params.append("cancel_url",              "https://tcdashop.com/shop.html?cancelled=1");
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
  params.append("metadata[lang]",       safeLang);

  try {
    const res     = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization:  `Bearer ${secretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });
    const session = await res.json();
    if (!res.ok) return corsJson({ error: session.error?.message || "Stripe error" }, res.status, origin);
    return corsJson({ url: session.url, sessionId: session.id }, 200, origin);
  } catch (err) {
    return corsJson({ error: "Checkout failed", detail: String(err) }, 502, origin);
  }
}

/* ── POST /api/printful-webhook ──────────────────────────────────── */
async function handleWebhook(req, env) {
  const rawBody = await req.text();

  /* Signature check */
  const secret = env.PRINTFUL_WEBHOOK_SECRET;
  if (secret) {
    const sig   = req.headers.get("X-Printful-Signature") || "";
    const valid = await verifyHmac(rawBody, sig, secret);
    if (!valid) return new Response("Invalid signature", { status: 401 });
  }

  let event;
  try { event = JSON.parse(rawBody); }
  catch { return new Response("Invalid JSON", { status: 400 }); }

  const type = event.type;
  if (type !== "product.created" && type !== "product.updated") {
    return new Response(JSON.stringify({ ok: true, skipped: type }), {
      status: 200, headers: { "Content-Type": "application/json" },
    });
  }

  const syncId = event.data?.sync_product?.id || event.data?.product?.id;
  if (!syncId) return new Response(JSON.stringify({ ok: false, error: "no product id" }), { status: 422 });

  const apiKey  = env.PRINTFUL_API_KEY;
  const storeId = env.PRINTFUL_STORE_ID || "17873034";
  if (!apiKey) return new Response("PRINTFUL_API_KEY missing", { status: 503 });

  /* Fetch from Printful with retry */
  let pfResult = null;
  for (let i = 1; i <= MAX_RETRY; i++) {
    try {
      const r = await fetch(`${PF_API}/sync/products/${syncId}`, {
        headers: { Authorization: `Bearer ${apiKey}`, "X-PF-Store-Id": storeId },
      });
      if (!r.ok) throw new Error("HTTP " + r.status);
      const d = await r.json();
      pfResult = d.result;
      break;
    } catch (err) {
      if (i === MAX_RETRY) return new Response(JSON.stringify({ ok: false, error: String(err) }), { status: 502 });
      await sleep(500 * Math.pow(2, i - 1));
    }
  }

  const product = transformProduct(pfResult);

  if (!env.PRODUCTS_KV) return new Response("PRODUCTS_KV missing", { status: 503 });

  await upsertProduct(env.PRODUCTS_KV, product);

  return new Response(JSON.stringify({ ok: true, id: product.id }), {
    status: 200, headers: { "Content-Type": "application/json" },
  });
}

/* ── KV helpers ──────────────────────────────────────────────────── */
async function kvGet(env) {
  if (!env.PRODUCTS_KV) return { products: [] };
  try {
    const v = await env.PRODUCTS_KV.get(KV_KEY, "text");
    return v ? JSON.parse(v) : { products: [] };
  } catch { return { products: [] }; }
}

async function upsertProduct(kv, incoming) {
  let data = { products: [] };
  const raw = await kv.get(KV_KEY, "text");
  if (raw) { try { data = JSON.parse(raw); } catch { /**/ } }

  const list = data.products || [];
  const idx  = list.findIndex((p) => p.printful_id === incoming.printful_id || p.id === incoming.id);

  if (idx >= 0) {
    const old = list[idx];
    list[idx] = {
      ...old, ...incoming,
      name:        mergeLocalised(old.name,        incoming.name),
      description: mergeLocalised(old.description, incoming.description),
      material:    old.material || incoming.material,
    };
  } else {
    list.push(incoming);
  }

  data.products = list;
  await kv.put(KV_KEY, JSON.stringify(data));
}

function mergeLocalised(old, incoming) {
  if (typeof old !== "object" || !old) return incoming;
  const out = { ...incoming };
  for (const [k, v] of Object.entries(old)) { if (v?.trim()) out[k] = v; }
  return out;
}

/* ── Printful → TCDA transform ───────────────────────────────────── */
function transformProduct(result) {
  const sp       = result.sync_product;
  const variants = result.sync_variants || [];
  const id       = sp.external_id || slugify(sp.name);

  const images = [];
  if (sp.thumbnail_url) images.push(sp.thumbnail_url);
  variants.forEach((v) => (v.files || []).forEach((f) => {
    if (f.type === "preview" && f.preview_url && !images.includes(f.preview_url))
      images.push(f.preview_url);
  }));

  const prices = variants.map((v) => parseFloat(v.retail_price || 0)).filter(Boolean);
  const price  = prices.length ? Math.min(...prices) : 0;

  const variantIds = {};
  variants.forEach((v) => {
    const sz = extractSize(v.name, v.options || []);
    if (sz) variantIds[sz] = v.id;
  });

  return {
    id,
    printful_id:   sp.id,
    name:          { ja: sp.name, en: sp.name },
    images,
    thumbnail_url: sp.thumbnail_url || "",
    description:   { ja: "", en: "" },
    material:      "",
    price:         Math.round(price),
    price_currency: (variants[0]?.currency || "USD").toUpperCase(),
    category:      guessCategory(sp.name),
    segment:       guessSegment(sp.name, variants),
    variant_ids:   variantIds,
    synced:        variants.length,
    size_template: guessSizeTemplate(sp.name),
    _updated_at:   new Date().toISOString(),
  };
}

function slugify(s) {
  return String(s).toLowerCase().replace(/[^\w\s-]/g,"").replace(/\s+/g,"-").replace(/-+/g,"-").replace(/^-|-$/g,"");
}
function extractSize(name, opts) {
  const o = opts.find((x) => String(x.id).toLowerCase().includes("size"));
  if (o?.value) return String(o.value);
  const last = String(name).split(/[\/\-\|]/).pop()?.trim();
  return /^(2XS|XS|S|M|L|XL|2XL|3XL|4XL|5XL|6XL|\d+)$/i.test(last) ? last.toUpperCase() : null;
}
function guessSizeTemplate(n) {
  n = n.toLowerCase();
  if (n.includes("zip") && n.includes("hoodie")) return "zip_hoodie";
  if (n.includes("recycled") && n.includes("hoodie")) return "zip_hoodie_recycled";
  if (n.includes("hoodie")) return "hoodie";
  if (n.includes("women") || n.includes("ladies")) return "womens_tshirt";
  return "mens_tshirt";
}
function guessCategory(n) {
  n = n.toLowerCase();
  if (n.includes("hoodie") || n.includes("jacket")) return "outer";
  if (n.includes("shoe") || n.includes("sneaker")) return "shoes";
  return "tops";
}
function guessSegment(n, variants) {
  n = n.toLowerCase();
  if (n.includes("women") || n.includes("ladies")) return "womens";
  if (n.includes("men") && !n.includes("women")) return "mens";
  const all = variants.map((v) => v.name.toLowerCase()).join(" ");
  return all.includes("women") ? "womens" : "unisex";
}

/* ── HMAC-SHA256 ─────────────────────────────────────────────────── */
async function verifyHmac(body, hexSig, secret) {
  if (!hexSig) return false;
  try {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name:"HMAC", hash:"SHA-256" }, false, ["verify"]);
    const sig = new Uint8Array(hexSig.match(/.{2}/g).map((b) => parseInt(b, 16)));
    return crypto.subtle.verify("HMAC", key, sig, enc.encode(body));
  } catch { return false; }
}

/* ── CORS + response helpers ─────────────────────────────────────── */
function allowedOrigin(origin) {
  return ALLOWED_ORIGINS.some((o) => origin.startsWith(o));
}
function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin":  origin || "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}
function corsJson(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
  });
}
function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }
