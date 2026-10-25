import { Link } from "react-router";
import { Helmet } from "react-helmet-async";
import { useGlobalContext } from "./Root";
import { motion } from "motion/react";
import { JsonLd } from "../components/JsonLd";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import lookbookLooks from "../data/lookbookLooks.json";
import { useConvertAndFormat } from "../hooks/useConvertAndFormat";

const CDN = "https://cdn.tcdashop.com/";
const OG_IMAGE = `${CDN}look/001.webp`;
const FIRST_KEY = "tcda_lookbook_first";
const PAGE_SIZE = 6;

type Look = { pid: string; imgs: string[] };
type ProductInfo = { id: string; name: string; price: number; shipping_available?: boolean };

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickLooks(): Look[] {
  let prev: string | null = null;
  try { prev = localStorage.getItem(FIRST_KEY); } catch { /* ignore */ }
  let items = shuffle(lookbookLooks as Look[]);
  for (let n = 0; n < 5 && items.length > 1 && items[0].pid === prev; n++) items = shuffle(lookbookLooks as Look[]);
  if (items.length > 1 && items[0].pid === prev) items = [...items.slice(1), items[0]];
  try { if (items[0]) localStorage.setItem(FIRST_KEY, items[0].pid); } catch { /* ignore */ }
  return items;
}

export function LookbookPage() {
  const { language, countryCode } = useGlobalContext();
  const { t } = useTranslation();
  const convertAndFormat = useConvertAndFormat();
  const [looks] = useState<Look[]>(pickLooks);
  const [products, setProducts] = useState<Record<string, ProductInfo>>({});
  const [loaded, setLoaded] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const canonical = `https://tcdashop.com/en/lookbook`;

  useEffect(() => {
    let cancelled = false;
    const qs = countryCode ? `?country_code=${countryCode}` : "";
    fetch(`https://api.tcdashop.com/products${qs}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        const map: Record<string, ProductInfo> = {};
        for (const p of (data.products ?? []) as ProductInfo[]) map[p.id] = p;
        setProducts(map);
        setLoaded(true);
      })
      .catch(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => { cancelled = true; };
  }, [countryCode]);

  const cards = looks.filter((l) => products[l.pid]?.shipping_available !== false);
  const visibleCards = cards.slice(0, visibleCount);

  return (
    <div style={{ background: "var(--color-bg)" }}>
      <Helmet>
        <title>Lookbook — TCDA</title>
        <meta name="description" content="TCDA Lookbook — Color immersion as fashion. Explore the visual world of TCDA." />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content="Lookbook — TCDA" />
        <meta property="og:description" content="Abstract art transformed into wearable culture." />
        <meta property="og:image" content={OG_IMAGE} />
        <meta property="og:url" content={canonical} />
      </Helmet>
      <JsonLd type="ImageGallery" data={{
        "@context": "https://schema.org",
        "@type": "ImageGallery",
        "name": "TCDA Lookbook",
        "url": canonical,
        "image": OG_IMAGE,
      }} />

      {/* Hero title */}
      <div className="px-8 md:px-16" style={{ paddingTop: "120px", paddingBottom: "48px" }}>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-display)",
            fontWeight: "var(--weight-light)",
            letterSpacing: "var(--ls-display)",
            color: "var(--color-text)",
            lineHeight: 1,
          }}
        >
          LOOKBOOK
        </motion.h1>
        {loaded && (
          <p
            className="text-xs"
            style={{ marginTop: "16px", fontFamily: "var(--font-body)", color: "var(--color-text-secondary)", letterSpacing: "var(--ls-nav)" }}
          >
            {t("lookbook.count", { count: cards.length })}
          </p>
        )}
      </div>

      {/* Looks */}
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 clamp(16px, 4vw, 48px)" }}>
        <div className="grid grid-cols-1 md:grid-cols-2" style={{ rowGap: "64px", columnGap: "32px" }}>
          {visibleCards.map(({ pid, imgs }, ci) => {
            const product = products[pid];
            const name = product?.name ?? "";
            const to = `/${language}/product/${pid}`;
            return (
              <motion.div
                key={pid}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link
                  to={to}
                  style={{ display: "grid", gridTemplateColumns: `repeat(${imgs.length}, 1fr)`, gap: "2px" }}
                >
                  {imgs.map((img, i) => (
                    <img
                      key={img}
                      src={`${CDN}${img}`}
                      alt={`${name || "TCDA Lookbook"} ${i + 1}`}
                      style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", display: "block" }}
                      loading={ci === 0 ? "eager" : "lazy"}
                    />
                  ))}
                </Link>
                <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-start" }}>
                  {name && (
                    <span className="text-sm uppercase" style={{ fontFamily: "var(--font-body)", color: "var(--color-text)" }}>
                      {name}
                    </span>
                  )}
                  {product && (
                    <span style={{ fontFamily: "var(--font-body)", color: "var(--color-text-secondary)" }}>
                      {convertAndFormat(product.price)}
                    </span>
                  )}
                  <Link
                    to={to}
                    className="inline-block text-xs uppercase"
                    style={{
                      background: "transparent",
                      color: "var(--accent-electric)",
                      border: "1px solid var(--accent-electric)",
                      padding: "12px 24px",
                      fontFamily: "var(--font-body)",
                      letterSpacing: "var(--ls-nav)",
                    }}
                  >
                    {t("lookbook.viewProduct")} →
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
        {visibleCount < cards.length && (
          <div style={{ textAlign: "center", marginTop: "64px" }}>
            <button
              type="button"
              className="text-xs uppercase"
              onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
              style={{
                background: "transparent",
                color: "var(--color-text)",
                border: "1px solid var(--color-text)",
                padding: "12px 24px",
                cursor: "pointer",
                fontFamily: "var(--font-body)",
                letterSpacing: "var(--ls-nav)",
              }}
            >
              {t("lookbook.loadMore")}
            </button>
          </div>
        )}
      </div>
      {/* CTA */}
      <div style={{ textAlign: "center", paddingTop: "96px", paddingBottom: "96px" }}>
        <Link
          to={`/${language}/collection`}
          className="inline-block text-xs uppercase"
          style={{
            background: "var(--accent-electric)",
            color: "#080808",
            border: "1px solid var(--accent-electric)",
            padding: "18px 48px",
            fontFamily: "var(--font-body)",
            letterSpacing: "var(--ls-nav)",
            transition: "var(--transition-base)",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--color-accent-hover)"; e.currentTarget.style.borderColor = "var(--color-accent-hover)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "var(--accent-electric)"; e.currentTarget.style.borderColor = "var(--accent-electric)"; }}
        >
          {t("about.ctaLabel")}
        </Link>
      </div>
    </div>
  );
}
