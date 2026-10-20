import { Link } from "react-router";
import { Helmet } from "react-helmet-async";
import { useGlobalContext } from "./Root";
import { motion } from "motion/react";
import { JsonLd } from "../components/JsonLd";
import { useTranslation } from "react-i18next";

const IMAGES = [
  "001", "004", "005", "006", "007", "008", "009", "010", "011"
].map(n => `https://cdn.tcdashop.com/look/${n}.webp`);

export function LookbookPage() {
  const { language } = useGlobalContext();
  const { t } = useTranslation();
  const canonical = `https://tcdashop.com/en/lookbook`;

  return (
    <div style={{ background: "var(--color-bg)" }}>
      <Helmet>
        <title>Lookbook — TCDA</title>
        <meta name="description" content="TCDA Lookbook — Color immersion as fashion. Explore the visual world of TCDA." />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content="Lookbook — TCDA" />
        <meta property="og:description" content="Abstract art transformed into wearable culture." />
        <meta property="og:image" content={IMAGES[0]} />
        <meta property="og:url" content={canonical} />
      </Helmet>
      <JsonLd type="ImageGallery" data={{
        "@context": "https://schema.org",
        "@type": "ImageGallery",
        "name": "TCDA Lookbook",
        "url": canonical,
        "image": IMAGES,
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
        {IMAGES.map((src, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <img
              src={src}
              alt={`TCDA Lookbook ${i + 1}`}
              style={{ width: "100%", display: "block" }}
              loading={i < 2 ? "eager" : "lazy"}
            />
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
