/**
 * TCDA — Cloudflare Worker
 * Deploy: wrangler deploy
 *
 * KV binding  : PRODUCTS_KV
 * Env vars    : STRIPE_SECRET_KEY, PRINTFUL_API_KEY, PRINTFUL_STORE_ID,
 *               PRINTFUL_WEBHOOK_SECRET
 */

const SHOP_ORIGIN = "https://tcdashop.com";
const ALLOWED_ORIGINS = [
  SHOP_ORIGIN,
  "https://www.tcdashop.com",
  "http://localhost",
  "http://127.0.0.1",
];

const ZERO_DECIMAL = new Set([
  "BIF","CLP","DJF","GNF","ISK","JPY","KMF","KRW","MGA","PYG",
  "RWF","UGX","VND","VUV","XAF","XOF","XPF",
]);

const KV_KEY      = "products";

/* currency.json をWorker内に直接保持（外部fetch不要・改ざん不可） */
const CURRENCY_RATES = {
  JPY:1, USD:0.0067, EUR:0.0062, GBP:0.0053, AUD:0.0102,
  CAD:0.0091, SGD:0.0090, HKD:0.052, CNY:0.048, KRW:9.1,
  CHF:0.0058, SEK:0.070, NOK:0.072, DKK:0.046, NZD:0.011,
  MXN:0.13, BRL:0.038, INR:0.57, THB:0.24, MYR:0.031,
  PHP:0.39, IDR:107, TWD:0.22, ZAR:0.12, AED:0.025,
  SAR:0.025, TRY:0.23, CZK:0.15, PLN:0.027, HUF:2.6,
};
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

    if (url.pathname === "/api/product-update" && method === "POST") {
      return handleProductUpdate(req, env, origin);
    }

    if (url.pathname === "/api/products-save" && method === "POST") {
      return handleProductsSave(req, env, origin);
    }

    if (url.pathname === "/api/printful-webhook" && method === "POST") {
      return handleWebhook(req, env);
    }

    if (url.pathname === "/api/printful-sync" && method === "GET") {
      return handlePrintfulSync(env, origin);
    }

    return new Response("Not found", { status: 404 });
  },
};

/* ── POST /api/product-update ────────────────────────────────────── */
async function handleProductUpdate(req, env, origin) {
  let product;
  try { product = await req.json(); }
  catch { return corsJson({ error: "Invalid JSON" }, 400, origin); }

  if (!product.id)                                             return corsJson({ error: "id required" }, 422, origin);
  if (product.price == null)                                   return corsJson({ error: "price required" }, 422, origin);
  if (product.variant_ids == null)
                                                               return corsJson({ error: "variant_ids required" }, 422, origin);

  if (!env.PRODUCTS_KV) return corsJson({ error: "PRODUCTS_KV missing" }, 503, origin);

  await upsertProduct(env.PRODUCTS_KV, product);
  return corsJson({ ok: true, id: product.id }, 200, origin);
}

/* ── POST /api/products-save (full replace — CMS reorder/bulk) ───── */
async function handleProductsSave(req, env, origin) {
  let body;
  try { body = await req.json(); }
  catch { return corsJson({ error: "Invalid JSON" }, 400, origin); }

  if (!Array.isArray(body.products)) return corsJson({ error: "products array required" }, 400, origin);
  if (!env.PRODUCTS_KV) return corsJson({ error: "PRODUCTS_KV missing" }, 503, origin);

  await env.PRODUCTS_KV.put(KV_KEY, JSON.stringify({ products: body.products }));
  return corsJson({ ok: true }, 200, origin);
}

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
  /* ⑥ CORS固定 */
  if (!allowedOrigin(origin)) return new Response("Forbidden", { status: 403 });

  const secretKey = env.STRIPE_SECRET_KEY;
  if (!secretKey) return corsJson({ error: "Stripe not configured" }, 400, origin);

  let body;
  try { body = await req.json(); }
  catch { return corsJson({ error: "Invalid JSON" }, 400, origin); }

  const { product_id, currency, price_display, lang, size, image } = body;

  /* ⑦ 必須フィールド検証 */
  if (!product_id || !currency || price_display == null) {
    return corsJson({ error: "Missing: product_id, currency, price_display" }, 400, origin);
  }

  const CUR = String(currency).toUpperCase();
  const pd  = Number(price_display);
  if (!Number.isFinite(pd) || pd <= 0) return corsJson({ error: "Invalid price_display" }, 400, origin);

  /* 商品データ: KVから直接取得。レート: Worker内定数（外部fetch不要・改ざん不可） */
  const productsData = await kvGet(env);
  const rates        = CURRENCY_RATES;

  /* ③ 存在しない商品ID → 400 */
  const product = (productsData.products || []).find((p) => p.id === product_id);
  if (!product) return corsJson({ error: "Invalid product" }, 400, origin);

  /* ④ 未同期商品: variant_ids がなければ注文不可 → 400 */
  const hasVariants = product.variant_ids && Object.keys(product.variant_ids).length > 0;
  if (!hasVariants) return corsJson({ error: "Product not synced" }, 400, origin);

  /* ② 通貨レート確認 */
  const rate = rates[CUR];
  if (rate === undefined) return corsJson({ error: "Unsupported currency" }, 400, origin);

  /* ① 価格改ざんチェック */
  const recalculated = product.price * rate;
  if (Math.round(recalculated * 100) !== Math.round(pd * 100)) {
    return corsJson({ error: "Invalid price" }, 400, origin);   /* 詳細は返さない */
  }

  /* unit_amount: zero-decimal は整数、それ以外は ×100 */
  const isZero     = ZERO_DECIMAL.has(CUR);
  const unitAmount = isZero ? Math.round(pd) : Math.round(pd * 100);

  /* ⑤ 多言語: Stripe表示は英語固定 */
  const productName = typeof product.name === "object"
    ? (product.name.en || product.name.ja || product_id)
    : String(product.name || product_id);
  const displayName = productName + (size ? ` (${size})` : "");

  const params = new URLSearchParams();
  params.append("mode",                    "payment");
  params.append("success_url",             `${SHOP_ORIGIN}/success.html?session_id={CHECKOUT_SESSION_ID}`);
  params.append("cancel_url",              `${SHOP_ORIGIN}/shop.html?cancelled=1`);
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
    if (!res.ok) return corsJson({ error: session.error?.message || "Stripe error" }, 400, origin);
    return corsJson({ url: session.url, sessionId: session.id }, 200, origin);
  } catch (e) {
    return corsJson({ error: "Checkout failed" }, 400, origin);
  }
}

/* ── GET /api/printful-sync ──────────────────────────────────────── */
async function handlePrintfulSync(env, origin) {
  const apiKey  = env.PRINTFUL_API_KEY;
  const storeId = env.PRINTFUL_STORE_ID || "17873034";
  if (!apiKey)         return corsJson({ error: "PRINTFUL_API_KEY missing" }, 503, origin);
  if (!env.PRODUCTS_KV) return corsJson({ error: "PRODUCTS_KV missing" },     503, origin);

  /* Rate-limit: skip if synced within 5 minutes */
  const lastSync = await env.PRODUCTS_KV.get("_last_sync", "text");
  if (lastSync && Date.now() - parseInt(lastSync, 10) < 5 * 60 * 1000) {
    return corsJson({ ok: true, skipped: true, message: "Recently synced" }, 200, origin);
  }

  /* 1. List all sync products */
  let syncList = [];
  try {
    const r = await fetch(`${PF_API}/sync/products`, {
      headers: { Authorization: `Bearer ${apiKey}`, "X-PF-Store-Id": storeId },
    });
    if (!r.ok) throw new Error("HTTP " + r.status);
    const d = await r.json();
    syncList = d.result || [];
  } catch (e) {
    return corsJson({ error: "Printful list error: " + e.message }, 502, origin);
  }

  /* 2. Fetch each product's variants */
  const incoming = [];
  for (const sp of syncList) {
    try {
      const r = await fetch(`${PF_API}/sync/products/${sp.id}`, {
        headers: { Authorization: `Bearer ${apiKey}`, "X-PF-Store-Id": storeId },
      });
      if (!r.ok) continue;
      const d = await r.json();
      incoming.push(transformProduct(d.result));
    } catch { continue; }
  }

  /* 3. Merge into existing KV data */
  const existing  = await kvGet(env);
  const list      = existing.products || [];
  for (const product of incoming) {
    const idx = list.findIndex((p) => p.printful_id === product.printful_id || p.id === product.id);
    if (idx >= 0) {
      const old = list[idx];
      list[idx] = {
        ...old, ...product,
        name:        mergeLocalised(old.name,        product.name),
        description: mergeLocalised(old.description, product.description),
        material:    old.material || product.material,
      };
    } else {
      list.push(product);
    }
  }

  await env.PRODUCTS_KV.put(KV_KEY, JSON.stringify({ products: list }));
  await env.PRODUCTS_KV.put("_last_sync", String(Date.now()));

  return corsJson({ ok: true, synced: incoming.length }, 200, origin);
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
  return "tshirt";
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
  /* ⑥ 本番はSHOP_ORIGIN固定、localhost/127のみ動的許可 */
  const allow = (origin.startsWith("http://localhost") || origin.startsWith("http://127.0.0.1"))
    ? origin : SHOP_ORIGIN;
  return {
    "Access-Control-Allow-Origin":  allow,
    "Access-Control-Allow-Methods": "GET, POST",
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
