import { Link } from "react-router";
import { Helmet } from "react-helmet-async";
import { useGlobalContext } from "./Root";
import { motion } from "motion/react";
import { JsonLd } from "../components/JsonLd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import lookbookImages from "../data/lookbookImages.json";

const CDN = "https://cdn.tcdashop.com/";
const OG_IMAGE = `${CDN}look/001.webp`;
const FIRST_KEY = "tcda_lookbook_first";
const COUNT = 9;

type LookItem = { img: string; pid: string };

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickLooks(): LookItem[] {
  const groups = new Map<string, LookItem[]>();
  for (const it of lookbookImages as LookItem[]) {
    const g = groups.get(it.pid);
    if (g) g.push(it); else groups.set(it.pid, [it]);
  }
  const pick = () => shuffle([...groups.keys()]).slice(0, COUNT).map(pid => {
    const g = groups.get(pid)!;
    return g[Math.floor(Math.random() * g.length)];
  });
  let prev: string | null = null;
  try { prev = localStorage.getItem(FIRST_KEY); } catch { /* ignore */ }
  let items = pick();
  for (let n = 0; n < 5 && items.length > 1 && items[0].img === prev; n++) items = pick();
  if (items.length > 1 && items[0].img === prev) items = [...items.slice(1), items[0]];
  try { if (items[0]) localStorage.setItem(FIRST_KEY, items[0].img); } catch { /* ignore */ }
  return items;
}

export function LookbookPage() {
  const { language } = useGlobalContext();
  const { t } = useTranslation();
  const [looks] = useState<LookItem[]>(pickLooks);
  const canonical = `https://tcdashop.com/en/lookbook`;

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
      </div>

      {/* Images */}
      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        {looks.map(({ img, pid }, i) => (
          <motion.div
            key={img}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            style={{ position: "relative" }}
          >
            <Link to={`/${language}/product/${pid}`} style={{ display: "block" }}>
              <img
                src={`${CDN}${img}`}
                alt={`TCDA Lookbook ${i + 1}`}
                style={{ width: "100%", display: "block" }}
                loading={i < 2 ? "eager" : "lazy"}
              />
              <span
                className="text-xs uppercase"
                style={{
                  position: "absolute",
                  left: "16px",
                  bottom: "16px",
                  background: "rgba(8,8,8,0.8)",
                  color: "var(--accent-electric)",
                  border: "1px solid var(--accent-electric)",
                  padding: "8px 16px",
                  fontFamily: "var(--font-body)",
                  letterSpacing: "var(--ls-nav)",
                }}
              >
                {t("lookbook.viewProduct")}
              </span>
            </Link>
          </motion.div>
        ))}
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
