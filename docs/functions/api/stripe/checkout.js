/**
 * TCDA — Cloudflare Pages Function: Stripe Checkout Session
 *
 * Setup:
 * 1. Cloudflare Pages → Settings → Environment variables
 *    STRIPE_SECRET_KEY = sk_live_xxxx  (or sk_test_xxxx for testing)
 *    STRIPE_WEBHOOK_SECRET = whsec_xxxx  (after creating webhook in Stripe dashboard)
 *
 * Local dev:
 *   Add to .dev.vars:
 *     STRIPE_SECRET_KEY=sk_test_xxxx
 *
 * Stripe dashboard webhook URL: https://tcda.shop/api/stripe/webhook
 * Events to subscribe: checkout.session.completed
 */

const ALLOWED_ORIGINS = [
  "https://tcda.shop",
  "https://www.tcda.shop",
  "http://localhost",
  "http://127.0.0.1",
];

export async function onRequestPost(context) {
  const { request, env } = context;

  const origin = request.headers.get("Origin") || "";
  const isAllowed =
    ALLOWED_ORIGINS.some((o) => origin.startsWith(o)) ||
    origin.startsWith("http://localhost") ||
    origin.startsWith("http://127.0.0.1");

  if (!isAllowed) {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }

  const secretKey = env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return corsJson({ error: "Stripe not configured" }, 503, origin);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return corsJson({ error: "Invalid request body" }, 400, origin);
  }

  const { items, successUrl, cancelUrl } = body;

  if (!Array.isArray(items) || items.length === 0) {
    return corsJson({ error: "No items provided" }, 400, origin);
  }

  // Build Stripe line_items from cart
  const lineItems = items.map((item) => ({
    price_data: {
      currency: item.currency || "jpy",
      product_data: {
        name: item.name,
        ...(item.image ? { images: [item.image] } : {}),
      },
      unit_amount: item.priceJpy, // JPY is zero-decimal in Stripe
    },
    quantity: item.quantity || 1,
  }));

  // Webhook で Printful 発注に使うためカート情報をメタデータに保存
  const itemsMeta = JSON.stringify(
    items.map((item) => ({
      productId: item.productId,
      size: item.size,
      quantity: item.quantity || 1,
    }))
  );

  const params = new URLSearchParams();
  params.append("mode", "payment");
  params.append("success_url", successUrl || "https://tcdashop.com/success.html?session_id={CHECKOUT_SESSION_ID}");
  params.append("cancel_url", cancelUrl || "https://tcdashop.com/shop.html?cancelled=1");
  params.append("payment_method_types[]", "card");
  params.append("billing_address_collection", "auto");
  params.append("shipping_address_collection[allowed_countries][]", "JP");
  params.append("metadata[items]", itemsMeta);

  lineItems.forEach((item, i) => {
    params.append(`line_items[${i}][price_data][currency]`, item.price_data.currency);
    params.append(`line_items[${i}][price_data][product_data][name]`, item.price_data.product_data.name);
    params.append(`line_items[${i}][price_data][unit_amount]`, String(item.price_data.unit_amount));
    params.append(`line_items[${i}][quantity]`, String(item.quantity));
    if (item.price_data.product_data.images?.[0]) {
      params.append(`line_items[${i}][price_data][product_data][images][]`, item.price_data.product_data.images[0]);
    }
  });

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
  return new Response(null, {
    status: 204,
    headers: corsHeaders(origin),
  });
}

function corsJson(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
  });
}

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}
