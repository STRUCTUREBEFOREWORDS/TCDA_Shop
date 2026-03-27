const PRINTFUL_API = "https://api.printful.com";

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return Response.json({ valid: false, error: "missing id" }, { status: 400 });
  }

  const apiKey = env.PRINTFUL_API_KEY;
  if (!apiKey) {
    return Response.json({ valid: false, error: "api key not configured" }, { status: 500 });
  }

  let res;
  try {
    res = await fetch(`${PRINTFUL_API}/store/products/${id}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "X-PF-Store-Id": env.PRINTFUL_STORE_ID || "",
      },
    });
  } catch (err) {
    return Response.json({ valid: false, error: "fetch failed" }, { status: 502 });
  }

  if (!res.ok) {
    return Response.json({ valid: false, error: `printful ${res.status}` });
  }

  let data;
  try {
    data = await res.json();
  } catch {
    return Response.json({ valid: false, error: "parse error" });
  }

  const product = data.result?.sync_product;
  if (!product) {
    return Response.json({ valid: false });
  }

  return Response.json({
    valid: true,
    preview_url: product.thumbnail_url || null,
    name: product.name || null,
  });
}
