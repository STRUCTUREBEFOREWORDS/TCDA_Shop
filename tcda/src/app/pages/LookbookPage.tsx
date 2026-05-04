import { Helmet } from "react-helmet-async";
import { useGlobalContext } from "./Root";
import { motion } from "motion/react";
import { JsonLd } from "../components/JsonLd";

const IMAGES = Array.from({ length: 11 }, (_, i) =>
  `https://cdn.tcdashop.com/look/${String(i + 1).padStart(3, "0")}.webp`
);

export function LookbookPage() {
  const { language } = useGlobalContext();
  const canonical = `https://tcdashop.com/en/lookbook`;

  return (
    <div style={{ background: "var(--color-bg)" }}>
      <Helmet>
        <title>Lookbook — TCDA</title>
        <meta name="description" content="TCDA Lookbook — Abstract art transformed into wearable culture. Explore the visual world of Transcend Creative Dimension Aura." />
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
    </div>
  );
}
