import { Link } from "react-router";
import { Helmet } from "react-helmet-async";
import { useGlobalContext } from "./Root";
import { motion } from "motion/react";
import { JsonLd } from "../components/JsonLd";
import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import lookbookLooks from "../data/lookbookLooks.json";
import { LookCard, shuffle, type Look, type ProductInfo } from "../components/LookCard";

const OG_IMAGE = "https://cdn.tcdashop.com/look/001.webp";
const FIRST_KEY = "tcda_lookbook_first";
const PAGE_SIZE = 6;

function pickLooks(): Look[] {
  return shuffle(lookbookLooks as Look[]);
}

export function LookbookPage() {
  const { language, countryCode } = useGlobalContext();
  const { t } = useTranslation();
  const [looks] = useState<Look[]>(pickLooks);
  const [products, setProducts] = useState<Record<string, ProductInfo>>({});
  const [loaded, setLoaded] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const canonical = `https://tcdashop.com/${language}/lookbook/`;

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

  const cards = useMemo(() => {
    if (!loaded) return [];
    const nameOf = (pid: string) => products[pid]?.name ?? "";
    const rest = looks.filter((l) => products[l.pid]?.shipping_available !== false);
    const result: Look[] = [];
    while (rest.length > 0) {
      const n1 = result.length > 0 ? nameOf(result[result.length - 1].pid) : null;
      const n2 = result.length > 1 ? nameOf(result[result.length - 2].pid) : null;
      let idx = rest.findIndex((l) => nameOf(l.pid) !== n1 && nameOf(l.pid) !== n2);
      if (idx < 0) idx = rest.findIndex((l) => nameOf(l.pid) !== n1);
      if (idx < 0) idx = 0;
      result.push(rest.splice(idx, 1)[0]);
    }
    let prev: string | null = null;
    try { prev = localStorage.getItem(FIRST_KEY); } catch { /* ignore */ }
    if (result.length > 2 && result[0].pid === prev) {
      const second = nameOf(result[1].pid);
      const j = result.findIndex((l, i) => i > 1 && nameOf(l.pid) !== second);
      if (j > 0) [result[0], result[j]] = [result[j], result[0]];
    }
    return result;
  }, [loaded, looks, products]);

  useEffect(() => {
    if (cards.length === 0) return;
    try { localStorage.setItem(FIRST_KEY, cards[0].pid); } catch { /* ignore */ }
  }, [cards]);

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
            style={{ marginTop: "28px", fontFamily: "var(--font-body)", color: "var(--color-text-secondary)", letterSpacing: "var(--ls-nav)" }}
          >
            {t("lookbook.count", { count: cards.length })}
          </p>
        )}
      </div>

      {/* Looks */}
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 clamp(16px, 4vw, 48px)" }}>
        <div className="grid grid-cols-1 md:grid-cols-2" style={{ rowGap: "64px", columnGap: "32px" }}>
          {visibleCards.map((look, ci) => (
            <LookCard key={look.pid} look={look} product={products[look.pid]} eager={ci === 0} />
          ))}
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
