/**
 * TCDA — Cloudflare Pages Function: Printful API Proxy
 *
 * This function acts as a secure server-side proxy for Printful API requests.
 * The API key is stored as a Cloudflare Pages environment variable
 * (Settings → Environment variables → PRINTFUL_API_KEY) and never exposed
 * to the browser.
 *
 * Setup steps:
 * 1. Deploy to Cloudflare Pages
 * 2. Go to Pages project → Settings → Environment variables
 * 3. Add: PRINTFUL_API_KEY = <your key>   (Production + Preview)
 * 4. Optionally add: PRINTFUL_STORE_ID = <your store id>
 *
 * Local dev (Wrangler):
 * Create a `.dev.vars` file in the project root (already in .gitignore):
 *   PRINTFUL_API_KEY=your_key_here
 *   PRINTFUL_STORE_ID=your_store_id
 * Then run: npx wrangler pages dev project/
 */
/*
 * Confirmed store IDs (2026-03-17):
 *   17873034  →  TCDA (native) ← primary
 *   12419111  →  Transcend Color Digital Apparel (base)
 *   12418790  →  Personal orders (native)
 */

const PRINTFUL_API = "https://api.printful.com";

// Allowed origins (update if your domain is different)
const ALLOWED_ORIGINS = [
  "https://tcda.shop",
  "https://www.tcda.shop",
  "http://localhost",
  "http://127.0.0.1",
];
// Also allow GitHub Pages preview
const ALLOWED_ORIGIN_PATTERNS = ["https://structurebeforewords.github.io"];

export async function onRequest(context) {
  const { request, env } = context;

  // CORS preflight
  if (request.method === "OPTIONS") {
    return corsResponse(new Response(null, { status: 204 }), request);
  }

  // Only allow GET requests through the proxy
  if (request.method !== "GET") {
    return corsResponse(
      new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json" },
      }),
      request
    );
  }

  const apiKey = env.PRINTFUL_API_KEY;
  if (!apiKey) {
    return corsResponse(
      new Response(JSON.stringify({ error: "API key not configured" }), {
        status: 503,
        headers: { "Content-Type": "application/json" },
      }),
      request
    );
  }

  // Build Printful URL from the request path
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api\/printful/, "") || "/";
  const printfulUrl = `${PRINTFUL_API}${path}${url.search}`;

  try {
    const headers = {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "X-PF-Store-Id": env.PRINTFUL_STORE_ID || "17873034",
    };

    const pfResponse = await fetch(printfulUrl, { headers });
    const body = await pfResponse.text();

    const response = new Response(body, {
      status: pfResponse.status,
      headers: {
        "Content-Type": "application/json",
        // Cache product data for 5 minutes, size charts for 1 hour
        "Cache-Control": path.includes("/sizes")
          ? "public, max-age=3600"
          : "public, max-age=300",
      },
    });

    return corsResponse(response, request);
  } catch (err) {
    return corsResponse(
      new Response(JSON.stringify({ error: "Upstream fetch failed", detail: String(err) }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      }),
      request
    );
  }
}

function corsResponse(response, request) {
  const origin = request.headers.get("Origin") || "";
  const isAllowed =
    ALLOWED_ORIGINS.some((o) => origin.startsWith(o)) ||
    ALLOWED_ORIGIN_PATTERNS.some((p) => origin.startsWith(p)) ||
    origin.startsWith("http://localhost") ||
    origin.startsWith("http://127.0.0.1");

  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", isAllowed ? origin : ALLOWED_ORIGINS[0]);
  headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Accept");
  headers.set("Vary", "Origin");

  return new Response(response.body, {
    status: response.status,
    headers,
  });
}
