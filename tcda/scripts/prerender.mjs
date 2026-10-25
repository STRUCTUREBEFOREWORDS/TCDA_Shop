/**
 * prerender.mjs
 * Head-only prerender: renders every indexable URL from the built docs/ in Chrome, then bakes the
 * Helmet-managed head (title + data-rh elements) into docs/{lang}/{path}/index.html.
 * The <body> and all other head elements (GTM, consent, GA4, preload) are left as built.
 * Run via: node scripts/prerender.mjs   (after `vite build`; wired into package.json build)
 * PRERENDER_DOCS overrides the docs directory (default: ../docs).
 */

import { createServer } from "http";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { join, dirname, extname, normalize } from "path";
import { chromium } from "playwright-core";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DOCS = process.env.PRERENDER_DOCS ?? join(__dirname, "..", "..", "docs");
const BASE_URL = "https://tcdashop.com";
const API_URL = "https://api.tcdashop.com";
const CONCURRENCY = 4;
const TIMEOUT_MS = 15_000;
const API_RETRIES = 3;
const JOB_ATTEMPTS = 3;
const STABLE_SAMPLES = 5; // 5 × 300ms with an unchanged head

const { langs: LANGS } = JSON.parse(readFileSync(join(__dirname, "..", "shared", "indexable-langs.json"), "utf-8"));

// Same fixed pages as generate-sitemap.js ("" = top page)
const STATIC_PATHS = ["", "products", "collection", "about", "faq", "lookbook", "contact", "legal", "privacy", "shipping-returns"];

const LOCALES_DIR = join(__dirname, "..", "public", "locales");
const metaCache = {};
const metaOf = (lang) => (metaCache[lang] ??= JSON.parse(readFileSync(join(LOCALES_DIR, lang, "translation.json"), "utf-8")).meta);

/** Expected title / description / og:description for a fixed page, from meta.* in the locale file */
function expectedFor(lang, path) {
  const m = metaOf(lang);
  const byPath = {
    "": { description: m.brand.description },
    about: { title: m.about.title, description: m.brand.description },
    collection: { description: m.collection.description },
    faq: { title: m.faq.title, description: m.faq.description },
    lookbook: { title: m.lookbook.title, description: m.lookbook.description, ogDescription: m.lookbook.ogDescription },
    contact: { description: m.contact.description },
    legal: { description: m.legal.description },
    privacy: { description: m.privacy.description },
    "shipping-returns": { description: m.shippingReturns.description },
    products: { description: m.products.description },
  };
  const e = byPath[path];
  return { ...e, ogDescription: e.ogDescription ?? e.description };
}

const MIME = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json",
  ".webmanifest": "application/manifest+json", ".svg": "image/svg+xml", ".png": "image/png", ".webp": "image/webp",
  ".ico": "image/x-icon", ".xml": "application/xml", ".txt": "text/plain",
};

/** Serves docs/ as-is; any path without a file extension falls back to the SPA shell (index.html) */
function startServer() {
  const shell = readFileSync(join(DOCS, "index.html"));
  const server = createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, "http://x").pathname);
    const file = normalize(join(DOCS, pathname));
    const isAsset = extname(pathname) !== "" && file.startsWith(DOCS) && existsSync(file) && statSync(file).isFile();
    if (isAsset) {
      res.writeHead(200, { "content-type": MIME[extname(file)] ?? "application/octet-stream" });
      res.end(readFileSync(file));
    } else {
      res.writeHead(200, { "content-type": MIME[".html"] });
      res.end(shell);
    }
  });
  return new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve(server)));
}

async function fetchProductIds() {
  const res = await fetch(`${API_URL}/products`, { signal: AbortSignal.timeout(10_000) });
  if (!res.ok) throw new Error(`GET /products: HTTP ${res.status}`);
  const data = await res.json();
  return (data.products ?? []).filter((p) => p.category).map((p) => p.id).filter(Boolean).sort();
}

const escapeHtml = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Capture document.title and every Helmet-managed (data-rh="true") head element */
function extractHead() {
  const elements = [...document.head.querySelectorAll('[data-rh="true"]')]
    .filter((el) => el.tagName !== "TITLE")
    .map((el) => el.outerHTML);
  return { title: document.title, elements };
}

async function renderOne(context, origin, job) {
  const page = await context.newPage();
  try {
    await page.route("**/*", async (route) => {
      const req = route.request();
      const url = req.url();
      // Nothing here affects the head: keep prerender traffic out of analytics and off the API
      const skip =
        ["image", "font", "media"].includes(req.resourceType()) ||
        /googletagmanager\.com|google-analytics\.com|clarity\.ms|ipapi\.co/.test(url) ||
        url.startsWith(`${API_URL}/events`);
      if (skip) return route.abort();
      if (!url.startsWith(API_URL)) return route.continue();
      const cors = { "access-control-allow-origin": "*", "access-control-allow-headers": "*", "access-control-allow-methods": "*" };
      if (req.method() === "OPTIONS") return route.fulfill({ status: 204, headers: cors });
      // The API intermittently answers 502 under parallel load: retry before giving up
      let response = await route.fetch();
      for (let attempt = 1; response.status() >= 500 && attempt <= API_RETRIES; attempt++) {
        await new Promise((r) => setTimeout(r, 1000 * attempt));
        response = await route.fetch();
      }
      await route.fulfill({ response, headers: { ...response.headers(), ...cors } });
    });
    await page.goto(`${origin}${job.path}`, { waitUntil: "domcontentloaded", timeout: TIMEOUT_MS });
    await page.waitForFunction(
      (expected) => document.querySelector('link[rel="canonical"][data-rh="true"]')?.getAttribute("href") === expected,
      job.canonical,
      { timeout: TIMEOUT_MS }
    );
    if (job.isProduct) {
      await page.waitForFunction(
        () => [...document.querySelectorAll('script[type="application/ld+json"][data-rh="true"]')].some((s) => /"@type":"Product"/.test(s.textContent)),
        null,
        { timeout: TIMEOUT_MS }
      );
    }
    if (job.expected) {
      try {
        await page.waitForFunction(
          (desc) => document.querySelector('meta[name="description"][data-rh="true"]')?.getAttribute("content") === desc,
          job.expected.description,
          { timeout: TIMEOUT_MS }
        );
      } catch {
        throw new Error("description never matched the translated meta text");
      }
    }
    // Root's canonical lands before the lazy-loaded page chunk adds its own tags: wait until the head stops changing
    let last = "";
    for (let stable = 0, waited = 0; stable < STABLE_SAMPLES; waited += 300) {
      if (waited > TIMEOUT_MS) throw new Error("head did not settle");
      await page.waitForTimeout(300);
      const sig = JSON.stringify(await page.evaluate(extractHead));
      stable = sig === last ? stable + 1 : 0;
      last = sig;
    }
    return JSON.parse(last);
  } finally {
    await page.close();
  }
}

/** Replace the shell's per-page SEO tags with the rendered head */
function buildHtml(shell, { title, elements }) {
  const stripped = shell
    .replace(/\s*<title>[\s\S]*?<\/title>/, "")
    .replace(/\s*<meta\s+name="description"[^>]*>/g, "")
    .replace(/\s*<meta\s+property="og:[^"]*"[^>]*>/g, "")
    .replace(/\s*<meta\s+name="twitter:[^"]*"[^>]*>/g, "");
  const injected = [`<title>${escapeHtml(title)}</title>`, ...elements].map((l) => `    ${l}`).join("\n");
  return stripped.replace("</head>", `${injected}\n  </head>`);
}

const decode = (v) => v.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");

/** Check every generated file; returns [{ path, check, expected, actual }] for each mismatch */
function verify(tmpRoot, jobs) {
  const bad = [];
  for (const job of jobs) {
    const html = readFileSync(join(tmpRoot, job.lang, job.rest, "index.html"), "utf-8");
    const head = html.slice(0, html.indexOf("</head>"));
    const titles = [...head.matchAll(/<title>([\s\S]*?)<\/title>/g)].map((m) => decode(m[1]));
    const descriptions = [...head.matchAll(/<meta name="description" content="([^"]*)"/g)].map((m) => decode(m[1]));
    const ogDescriptions = [...head.matchAll(/<meta property="og:description" content="([^"]*)"/g)].map((m) => decode(m[1]));
    const canonicals = [...head.matchAll(/<link rel="canonical" href="([^"]*)"/g)].map((m) => m[1]);
    const hreflangs = [...head.matchAll(/<link rel="alternate" hreflang="/g)].length;
    const ldProducts = [...head.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].filter((m) => /"@type":"Product"/.test(m[1])).length;
    const check = (name, expected, actual) => {
      if (String(expected) !== String(actual)) bad.push({ path: job.path, check: name, expected, actual });
    };
    check("title count", 1, titles.length);
    check("description count", 1, descriptions.length);
    check("canonical count", 1, canonicals.length);
    check("canonical", job.canonical, canonicals[0] ?? "(none)");
    check("hreflang count", 7, hreflangs);
    if (job.expected) {
      check("description", job.expected.description, descriptions[0] ?? "(none)");
      check("og:description", job.expected.ogDescription, ogDescriptions[0] ?? "(none)");
      if (job.expected.title) check("title", job.expected.title, titles[0] ?? "(none)");
    }
    if (job.isProduct) {
      check("JSON-LD Product count", 1, ldProducts);
      if (!descriptions[0]) bad.push({ path: job.path, check: "description non-empty", expected: "non-empty", actual: "(empty)" });
    }
  }
  return bad;
}

async function main() {
  const started = Date.now();
  const shell = readFileSync(join(DOCS, "index.html"), "utf-8");
  const productIds = await fetchProductIds();

  const jobs = [];
  for (const lang of LANGS) {
    for (const p of STATIC_PATHS) {
      const rest = p ? `${p}/` : "";
      jobs.push({ lang, path: `/${lang}/${rest}`, rest, canonical: `${BASE_URL}/${lang}/${rest}`, isProduct: false, expected: expectedFor(lang, p) });
    }
    for (const id of productIds) {
      const rest = `product/${id}/`;
      jobs.push({ lang, path: `/${lang}/${rest}`, rest, canonical: `${BASE_URL}/${lang}/${rest}`, isProduct: true });
    }
  }
  console.log(`[prerender] ${jobs.length} URL(s) (${LANGS.length} langs × ${STATIC_PATHS.length} pages + ${productIds.length} products)`);

  const server = await startServer();
  const origin = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({ channel: "chrome" });
  const context = await browser.newContext({ serviceWorkers: "block" });

  const tmpRoot = mkdtempSync(join(dirname(DOCS), ".prerender-"));
  try {
    const failures = [];
    let next = 0;

    async function worker() {
      while (next < jobs.length) {
        const job = jobs[next++];
        try {
          let head;
          for (let attempt = 1; ; attempt++) {
            try {
              head = await renderOne(context, origin, job);
              break;
            } catch (err) {
              if (attempt >= JOB_ATTEMPTS) throw err;
              await new Promise((r) => setTimeout(r, 10_000 * attempt));
            }
          }
          const out = join(tmpRoot, job.lang, job.rest, "index.html");
          mkdirSync(dirname(out), { recursive: true });
          writeFileSync(out, buildHtml(shell, head), "utf-8");
        } catch (err) {
          failures.push(`${job.path}: ${err.message.split("\n")[0]}`);
        }
      }
    }
    await Promise.all(Array.from({ length: CONCURRENCY }, worker));

    if (failures.length > 0) {
      console.error(`[prerender] ${failures.length} failure(s); docs/ left untouched:\n${failures.join("\n")}`);
      return 1;
    }

    const mismatches = verify(tmpRoot, jobs);
    if (mismatches.length > 0) {
      const rows = mismatches.map((m) => `| ${m.path} | ${m.check} | ${m.expected} | ${m.actual} |`);
      console.error(`[prerender] ${mismatches.length} mismatch(es); docs/ left untouched:\n| URL | check | expected | actual |\n|---|---|---|---|\n${rows.join("\n")}`);
      return 1;
    }

    for (const lang of LANGS) {
      rmSync(join(DOCS, lang), { recursive: true, force: true });
      renameSync(join(tmpRoot, lang), join(DOCS, lang));
    }
    console.log(`[prerender] Done — ${jobs.length} page(s) verified in ${((Date.now() - started) / 1000).toFixed(1)}s`);
    return 0;
  } finally {
    rmSync(tmpRoot, { recursive: true, force: true });
    await browser.close();
    server.close();
  }
}

main()
  .then((code) => process.exit(code))
  .catch((err) => {
    console.error("[prerender] Fatal error:", err);
    process.exit(1);
  });
