/**
 * generate-sitemap.js
 * Generates public/sitemap.xml with full hreflang support for the indexable languages (shared/indexable-langs.json).
 * Run via: node scripts/generate-sitemap.js
 * Automatically called before `vite build` via package.json build script.
 */

import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { join, dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const BASE_URL = "https://tcdashop.com";
const { langs: LANGS, default: X_DEFAULT_LANG } = JSON.parse(
  readFileSync(join(__dirname, "..", "shared", "indexable-langs.json"), "utf-8")
);
const TODAY = new Date().toISOString().split("T")[0];

// Static pages: [path, priority, changefreq]
const STATIC_PAGES = [
  ["",                  "1.0", "weekly"],
  ["products",          "0.9", "weekly"],
  ["collection",        "0.8", "monthly"],
  ["about",             "0.7", "monthly"],
  ["faq",               "0.7", "monthly"],
  ["lookbook",          "0.6", "monthly"],
  ["contact",           "0.6", "monthly"],
  ["legal",             "0.5", "yearly"],
  ["privacy",           "0.5", "yearly"],
  ["shipping-returns",  "0.5", "yearly"],
];

/** Absolute URL with trailing slash, matching the canonical emitted by the pages */
function pageUrl(lang, pathSuffix) {
  return pathSuffix ? `${BASE_URL}/${lang}/${pathSuffix}/` : `${BASE_URL}/${lang}/`;
}

/**
 * Build all hreflang alternate links for a given path suffix.
 * e.g. suffix="" → /ja/, /en/, ...
 *      suffix="products" → /ja/products/, /en/products/, ...
 */
function hreflangLinks(pathSuffix) {
  const lines = LANGS.map((lang) => {
    const href = pageUrl(lang, pathSuffix);
    return `    <xhtml:link rel="alternate" hreflang="${lang}" href="${href}"/>`;
  });
  const defaultHref = pageUrl(X_DEFAULT_LANG, pathSuffix);
  lines.push(
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${defaultHref}"/>`
  );
  return lines.join("\n");
}

/** Build one <url> block for a given lang + path suffix */
function urlBlock(lang, pathSuffix, priority, changefreq) {
  const loc = pageUrl(lang, pathSuffix);
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
    return (data.products ?? []).filter((p) => p.category).map((p) => p.id).filter(Boolean).sort();
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
