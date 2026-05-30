import { Helmet } from "react-helmet-async";
import { useGlobalContext } from "./Root";
import { motion } from "motion/react";
import { JsonLd } from "../components/JsonLd";

const IMAGES: { src: string; statement?: string }[] = [
  { src: "https://cdn.tcdashop.com/look/001.webp", statement: "Color as structure." },
  { src: "https://cdn.tcdashop.com/look/004.webp" },
  { src: "https://cdn.tcdashop.com/look/005.webp", statement: "Geometry in motion." },
  { src: "https://cdn.tcdashop.com/look/006.webp" },
  { src: "https://cdn.tcdashop.com/look/007.webp", statement: "Each piece begins as a painting." },
  { src: "https://cdn.tcdashop.com/look/008.webp" },
  { src: "https://cdn.tcdashop.com/look/009.webp", statement: "Worn, not framed." },
  { src: "https://cdn.tcdashop.com/look/010.webp" },
  { src: "https://cdn.tcdashop.com/look/011.webp" },
];

export function LookbookPage() {
  const { language } = useGlobalContext();
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
        {IMAGES.map(({ src, statement }, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            style={{ position: "relative" }}
          >
            <img
              src={src}
              alt={`TCDA Lookbook ${i + 1}`}
              style={{ width: "100%", display: "block" }}
              loading={i < 2 ? "eager" : "lazy"}
            />
            {statement && (
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  position: "absolute",
                  bottom: "clamp(16px, 4vw, 40px)",
                  left: "clamp(16px, 5vw, 60px)",
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(14px, 2.5vw, 28px)",
                  fontWeight: 200,
                  letterSpacing: "0.06em",
                  color: "rgba(255,255,255,0.75)",
                  textShadow: "0 1px 12px rgba(0,0,0,0.6)",
                  pointerEvents: "none",
                }}
              >
                {statement}
              </motion.p>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
