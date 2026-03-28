/**
 * TCDA — Cloudflare Pages Function: /api/printful-webhook
 *
 * Receives Printful webhooks (product.created / product.updated),
 * verifies HMAC-SHA256 signature, fetches full product detail from
 * Printful API, and upserts into Cloudflare KV (TCDA_KV).
 *
 * Required env vars (Cloudflare Pages Settings → Environment variables):
 *   PRINTFUL_WEBHOOK_SECRET  = <webhook signing secret from Printful dashboard>
 *   PRINTFUL_API_KEY         = <Printful API key>
 *   PRINTFUL_STORE_ID        = <Printful Store ID>  (default: 17873034)
 *
 * KV binding (wrangler.toml / Cloudflare Pages → Functions → KV bindings):
 *   TCDA_KV
 */

const PRINTFUL_API = "https://api.printful.com";
const KV_KEY       = "products_json";  /* key under which full products blob is stored */
const MAX_RETRIES  = 3;

/* ── Entry point ─────────────────────────────────────────────────── */
export async function onRequestPost(context) {
  const { request, env } = context;

  /* 1. Read raw body (needed for HMAC verification) */
  const rawBody = await request.text();

  /* 2. Verify Printful webhook signature */
  const secret = env.PRINTFUL_WEBHOOK_SECRET;
  if (!secret) {
    console.error("PRINTFUL_WEBHOOK_SECRET not configured");
    return new Response("Webhook secret not configured", { status: 503 });
  }

  const sigHeader = request.headers.get("X-Printful-Signature") || "";
  const valid = await verifySignature(rawBody, sigHeader, secret);
  if (!valid) {
    console.warn("Webhook signature mismatch");
    return new Response("Invalid signature", { status: 401 });
  }

  /* 3. Parse event */
  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const type = event.type;
  if (type !== "product.created" && type !== "product.updated") {
    /* Other event types — acknowledge but do nothing */
    return new Response(JSON.stringify({ ok: true, skipped: type }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  /* 4. Extract sync product ID from event */
  const syncProductId =
    event.data?.sync_product?.id ||
    event.data?.product?.id ||
    null;

  if (!syncProductId) {
    console.warn("Could not extract sync_product.id from event:", JSON.stringify(event.data));
    return new Response(JSON.stringify({ ok: false, error: "no product id in payload" }), {
      status: 422,
      headers: { "Content-Type": "application/json" },
    });
  }

  /* 5. Fetch full product detail from Printful (with retry) */
  const apiKey  = env.PRINTFUL_API_KEY;
  const storeId = env.PRINTFUL_STORE_ID || "17873034";
  if (!apiKey) {
    return new Response("PRINTFUL_API_KEY not configured", { status: 503 });
  }

  let syncProduct = null;
  let fetchError  = null;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(
        `${PRINTFUL_API}/sync/products/${syncProductId}`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "X-PF-Store-Id": storeId,
          },
        }
      );
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Printful API ${res.status}: ${errText}`);
      }
      const data = await res.json();
      syncProduct = data.result;
      fetchError  = null;
      break;
    } catch (err) {
      fetchError = err;
      console.warn(`Printful fetch attempt ${attempt}/${MAX_RETRIES} failed:`, String(err));
      if (attempt < MAX_RETRIES) {
        /* Exponential back-off: 500ms, 1000ms, 2000ms */
        await sleep(500 * Math.pow(2, attempt - 1));
      }
    }
  }

  if (!syncProduct) {
    console.error("All Printful fetch attempts failed:", String(fetchError));
    return new Response(
      JSON.stringify({ ok: false, error: "Printful fetch failed after retries", detail: String(fetchError) }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }

  /* 6. Transform Printful response → TCDA product schema */
  const product = transformProduct(syncProduct);

  /* 7. Upsert into KV */
  if (!env.TCDA_KV) {
    console.error("TCDA_KV binding not found");
    return new Response("KV not configured", { status: 503 });
  }

  try {
    await upsertProduct(env.TCDA_KV, product);
  } catch (err) {
    console.error("KV upsert failed:", String(err));
    return new Response(
      JSON.stringify({ ok: false, error: "KV write failed", detail: String(err) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  console.log(`Product upserted: ${product.id} (Printful ID: ${product.printful_id})`);
  return new Response(
    JSON.stringify({ ok: true, product_id: product.id, printful_id: product.printful_id }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

/* ── Signature verification ──────────────────────────────────────── */
async function verifySignature(body, signature, secret) {
  if (!signature) return false;
  try {
    const enc     = new TextEncoder();
    const keyData = enc.encode(secret);
    const msgData = enc.encode(body);

    const cryptoKey = await crypto.subtle.importKey(
      "raw", keyData,
      { name: "HMAC", hash: "SHA-256" },
      false, ["verify"]
    );

    /* Printful sends hex digest */
    const sigBytes = hexToBytes(signature);
    return await crypto.subtle.verify("HMAC", cryptoKey, sigBytes, msgData);
  } catch (err) {
    console.error("Signature verification error:", String(err));
    return false;
  }
}

function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}

/* ── Transform Printful → TCDA schema ───────────────────────────── */
function transformProduct(result) {
  const sp       = result.sync_product;
  const variants = result.sync_variants || [];

  /* Derive TCDA product ID from Printful external_id or slug from name */
  const productId = sp.external_id || slugify(sp.name);

  /* Images: prefer sync_product thumbnail + variant previews */
  const images = [];
  if (sp.thumbnail_url) images.push(sp.thumbnail_url);
  variants.forEach((v) => {
    if (v.files) {
      v.files.forEach((f) => {
        if (f.type === "preview" && f.preview_url && !images.includes(f.preview_url)) {
          images.push(f.preview_url);
        }
      });
    }
  });

  /* Price: lowest retail_price across variants (in JPY if currency matches, else raw) */
  const prices = variants
    .map((v) => parseFloat(v.retail_price || "0"))
    .filter((p) => p > 0);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const priceCurrency = (variants[0]?.currency || "USD").toUpperCase();

  /* variant_ids: { size_label: variant_id } */
  const variantIds = {};
  variants.forEach((v) => {
    const sizeLabel = extractSizeLabel(v.name, v.options || []);
    if (sizeLabel) variantIds[sizeLabel] = v.id;
  });

  /* Determine size_template from product name heuristic */
  const sizeTemplate = guessSizeTemplate(sp.name, variants);

  /* Category + segment heuristics */
  const category = guessCategory(sp.name);
  const segment  = guessSegment(sp.name, variants);

  return {
    id:            productId,
    printful_id:   sp.id,
    name: {
      ja: sp.name,   /* Printful name as fallback; override manually if needed */
      en: sp.name,
    },
    images,
    thumbnail_url: sp.thumbnail_url || "",
    description: {
      ja: sp.external_id ? "" : "",
      en: sp.external_id ? "" : "",
    },
    material:      "",        /* Not available from Printful webhook — fill manually */
    price:         Math.round(minPrice),   /* raw price in priceCurrency */
    price_currency: priceCurrency,
    category,
    segment,
    variant_ids:   variantIds,
    synced:        variants.length,
    size_template: sizeTemplate,
    _updated_at:   new Date().toISOString(),
  };
}

function slugify(str) {
  return String(str)
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function extractSizeLabel(variantName, options) {
  /* Try options array first */
  const sizeOpt = options.find(
    (o) => o.id === "size" || String(o.id).toLowerCase().includes("size")
  );
  if (sizeOpt?.value) return String(sizeOpt.value);

  /* Fall back: last segment of variant name often is size */
  const parts = String(variantName).split(/[\/\-\|]/);
  const last  = parts[parts.length - 1]?.trim();
  /* Accept if it looks like a size token */
  if (last && /^(2XS|XS|S|M|L|XL|2XL|3XL|4XL|5XL|6XL|\d+)$/i.test(last)) return last.toUpperCase();

  return null;
}

function guessSizeTemplate(name) {
  const n = String(name).toLowerCase();
  if (n.includes("zip") && n.includes("hoodie")) return "zip_hoodie";
  if (n.includes("recycled") && n.includes("hoodie")) return "zip_hoodie_recycled";
  if (n.includes("hoodie")) return "hoodie";
  if (n.includes("women") || n.includes("ladies") || n.includes("female")) return "womens_tshirt";
  if (n.includes("t-shirt") || n.includes("tshirt") || n.includes("tee")) return "mens_tshirt";
  return "mens_tshirt";
}

function guessCategory(name) {
  const n = String(name).toLowerCase();
  if (n.includes("hoodie") || n.includes("jacket") || n.includes("coat") || n.includes("outer")) return "outer";
  if (n.includes("shoe") || n.includes("sneaker") || n.includes("boot")) return "shoes";
  return "tops";
}

function guessSegment(name, variants) {
  const n = String(name).toLowerCase();
  if (n.includes("women") || n.includes("ladies") || n.includes("female")) return "womens";
  if (n.includes("men") && !n.includes("women")) return "mens";
  /* Check variant names */
  const allNames = variants.map((v) => String(v.name).toLowerCase()).join(" ");
  if (allNames.includes("women")) return "womens";
  return "unisex";
}

/* ── KV upsert logic ─────────────────────────────────────────────── */
async function upsertProduct(kv, newProduct) {
  /* Load existing products blob from KV */
  let productsData = { products: [] };
  const existing = await kv.get(KV_KEY, "text");
  if (existing) {
    try {
      productsData = JSON.parse(existing);
    } catch {
      /* corrupt KV — start fresh */
      productsData = { products: [] };
    }
  }

  const products = productsData.products || [];
  const idx = products.findIndex(
    (p) => p.printful_id === newProduct.printful_id || p.id === newProduct.id
  );

  if (idx >= 0) {
    /* Update: preserve manually-set fields (name, description, material) if already set */
    const existing = products[idx];
    products[idx] = {
      ...existing,
      ...newProduct,
      /* Preserve curated text fields if they were already localised */
      name:        mergeLocalised(existing.name,        newProduct.name),
      description: mergeLocalised(existing.description, newProduct.description),
      material:    existing.material || newProduct.material,
    };
  } else {
    /* Insert */
    products.push(newProduct);
  }

  productsData.products = products;
  await kv.put(KV_KEY, JSON.stringify(productsData));
}

function mergeLocalised(existing, incoming) {
  if (typeof existing !== "object" || !existing) return incoming;
  /* Keep existing non-empty values; fill blanks from incoming */
  const merged = { ...incoming };
  for (const [lang, val] of Object.entries(existing)) {
    if (val && String(val).trim()) merged[lang] = val;
  }
  return merged;
}

/* ── Utility ─────────────────────────────────────────────────────── */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
