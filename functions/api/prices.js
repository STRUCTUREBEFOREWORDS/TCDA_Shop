/**
 * TCDA — /api/prices
 * Returns live retail prices for all store products from Printful.
 * Cached at the edge for 5 minutes.
 * Response: { prices: { [printful_id]: { price, currency } } }
 */
const PRINTFUL_API = "https://api.printful.com";
export async function onRequestGet(context) {
  const { env } = context;
  const apiKey = env.PRINTFUL_API_KEY;
  const storeId = env.PRINTFUL_STORE_ID || "17873034";

  if (!apiKey) {
    return Response.json({ error: "api key not configured" }, { status: 503 });
  }
  const h = {
    Authorization: "Bearer " + apiKey,
    "X-PF-Store-Id": storeId,
  };

  let listData;
  try {
    const r = await fetch(PRINTFUL_API + "/store/products?limit=100", { headers: h });
    listData = await r.json();
  } catch {
    return Response.json({ error: "upstream fetch failed" }, { status: 502 });
  }
  const storeProducts = listData.result || [];

  const results = await Promise.all(
    storeProducts.map(async (sp) => {
      try {
        const r = await fetch(PRINTFUL_API + "/store/products/" + sp.id, { headers: h });
        const d = await r.json();
        const variants = (d.result && d.result.sync_variants) || [];
        const first = variants[0];
        if (!first) return null;
        return {
          id: sp.id,
          price: Math.round(parseFloat(first.retail_price)),
          currency: first.currency,
        };
      } catch {
        return null;
      }
    })
  );

  const prices = {};
  results.forEach((item) => {
    if (item) prices[item.id] = { price: item.price, currency: item.currency };
  });

  return new Response(JSON.stringify({ prices }), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=300, s-maxage=300",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
