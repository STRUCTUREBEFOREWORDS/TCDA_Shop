/**
 * generate-sitemap.js
 * Generates public/sitemap.xml with full hreflang support for all 6 languages.
 * Run via: node scripts/generate-sitemap.js
 * Automatically called before `vite build` via package.json build script.
 */

import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { join, dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const BASE_URL = "https://tcdashop.com";
const LANGS = ["ja", "en", "fr", "es", "ko", "zh", "de", "it", "pt", "ar"];
const X_DEFAULT_LANG = "ja";
const TODAY = new Date().toISOString().split("T")[0];

// Static pages: [path, priority, changefreq]
const STATIC_PAGES = [
  ["",                  "1.0", "weekly"],
  ["products",          "0.9", "weekly"],
  ["collection",        "0.8", "monthly"],
  ["about",             "0.7", "monthly"],
  ["faq",               "0.7", "monthly"],
  ["brand-foundation",  "0.6", "monthly"],
  ["contact",           "0.6", "monthly"],
  ["legal",             "0.5", "yearly"],
  ["privacy",           "0.5", "yearly"],
  ["shipping-returns",  "0.5", "yearly"],
];

/**
 * Build all hreflang alternate links for a given path suffix.
 * e.g. suffix="" → /ja/, /en/, ...
 *      suffix="products" → /ja/products, /en/products, ...
 */
function hreflangLinks(pathSuffix) {
  const lines = LANGS.map((lang) => {
    const href = pathSuffix
      ? `${BASE_URL}/${lang}/${pathSuffix}`
      : `${BASE_URL}/${lang}/`;
    return `    <xhtml:link rel="alternate" hreflang="${lang}" href="${href}"/>`;
  });
  const defaultHref = pathSuffix
    ? `${BASE_URL}/${X_DEFAULT_LANG}/${pathSuffix}`
    : `${BASE_URL}/${X_DEFAULT_LANG}/`;
  lines.push(
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${defaultHref}"/>`
  );
  return lines.join("\n");
}

/** Build one <url> block for a given lang + path suffix */
function urlBlock(lang, pathSuffix, priority, changefreq) {
  const loc = pathSuffix
    ? `${BASE_URL}/${lang}/${pathSuffix}`
    : `${BASE_URL}/${lang}/`;
  return `  <url>
    <loc>${loc}</loc>
${hreflangLinks(pathSuffix)}
    <lastmod>${TODAY}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

/** Fetch product IDs from the API; returns [] on network failure */
async function fetchProductIds() {
  try {
    const res = await fetch(`${BASE_URL.replace("tcdashop.com", "api.tcdashop.com")}/products`, {
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return (data.products ?? []).map((p) => p.id).filter(Boolean);
  } catch (err) {
    console.warn(`[sitemap] Could not fetch products: ${err.message} — skipping product URLs`);
    return [];
  }
}

async function main() {
  console.log("[sitemap] Generating sitemap.xml …");

  const productIds = await fetchProductIds();
  console.log(`[sitemap] ${productIds.length} product(s) found`);

  const urlBlocks = [];

  // Static pages
  for (const [path, priority, changefreq] of STATIC_PAGES) {
    for (const lang of LANGS) {
      urlBlocks.push(urlBlock(lang, path, priority, changefreq));
    }
  }

  // Product pages
  for (const id of productIds) {
    for (const lang of LANGS) {
      urlBlocks.push(urlBlock(lang, `product/${id}`, "0.8", "monthly"));
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlBlocks.join("\n")}
</urlset>
`;

  const outPath = join(__dirname, "..", "public", "sitemap.xml");
  writeFileSync(outPath, xml, "utf-8");

  const urlCount = urlBlocks.length;
  console.log(`[sitemap] Done — ${urlCount} URLs written to public/sitemap.xml`);
}

main().catch((err) => {
  console.error("[sitemap] Fatal error:", err);
  process.exit(1);
});
