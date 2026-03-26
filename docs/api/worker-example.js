export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "POST" && url.pathname === "/api/checkout/stripe-session") {
      return handleStripeCheckout(request, env);
    }

    if (request.method === "POST" && url.pathname === "/api/fulfillment/printful-order") {
      return handlePrintfulOrder(request, env);
    }

    if (request.method === "GET" && url.pathname === "/api/catalog") {
      return jsonResponse({ items: [] });
    }

    return new Response("Not Found", { status: 404 });
  },
};

async function handleStripeCheckout(request, env) {
  const body = await request.json();

  const line_items = (body.cart || []).map((item) => ({
    quantity: item.quantity,
    price_data: {
      currency: body.currency || "jpy",
      unit_amount: item.price,
      product_data: {
        name: `${item.name} / ${item.size}`,
      },
    },
  }));

  const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      mode: "payment",
      success_url: body.successUrl,
      cancel_url: body.cancelUrl,
      ...serializeLineItems(line_items),
    }),
  });

  if (!stripeResponse.ok) {
    const errorText = await stripeResponse.text();
    return jsonResponse({ message: errorText }, 500);
  }

  const session = await stripeResponse.json();
  return jsonResponse({ url: session.url, id: session.id });
}

async function handlePrintfulOrder(request, env) {
  const body = await request.json();

  const printfulPayload = {
    recipient: body.shippingAddress || {
      name: "Pending",
      country_code: "JP",
    },
    items: (body.items || []).map((item) => ({
      sync_variant_id: item.printfulVariantId || 0,
      quantity: item.quantity,
    })),
    external_id: `tcda-${Date.now()}`,
  };

  const response = await fetch("https://api.printful.com/orders", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.PRINTFUL_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(printfulPayload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return jsonResponse({ message: errorText }, 500);
  }

  const data = await response.json();
  return jsonResponse({ ok: true, result: data.result });
}

function serializeLineItems(items) {
  const params = {};
  items.forEach((item, index) => {
    params[`line_items[${index}][quantity]`] = String(item.quantity);
    params[`line_items[${index}][price_data][currency]`] = item.price_data.currency;
    params[`line_items[${index}][price_data][unit_amount]`] = String(item.price_data.unit_amount);
    params[`line_items[${index}][price_data][product_data][name]`] = item.price_data.product_data.name;
  });
  return params;
}

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
    },
  });
}
