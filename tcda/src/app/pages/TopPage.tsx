import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Link } from "react-router";
import { Helmet } from "react-helmet-async";
import { useGlobalContext } from "./Root";
import { useTranslation } from "react-i18next";
import { JsonLd } from "../components/JsonLd";
import { pushDataLayer } from "../hooks/useDataLayer";

const DISPLAY_STYLE: React.CSSProperties = {
  fontFamily: "var(--font-display)",
  fontSize: "clamp(40px, 10vw, 160px)",
  fontWeight: 500,
  letterSpacing: "-0.02em",
  lineHeight: 0.9,
};


const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 } as Record<string, unknown>,
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
};

export function TopPage() {
  const { language, currency, countryCode } = useGlobalContext();
  const { t } = useTranslation();

  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let rafId: number;
    const handler = () => {
      rafId = requestAnimationFrame(() => setScrollY(window.scrollY));
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => {
      window.removeEventListener("scroll", handler);
      cancelAnimationFrame(rafId);
    };
  }, []);

  useEffect(() => {
    pushDataLayer('page_view', {
      page_type: 'top',
      language,
      currency,
      country: countryCode,
    });
  }, []);

  return (
    <div className="min-h-screen bg-black">
      <Helmet>
        <title>TCDA — Transcend Creative Dimension Aura</title>
        <meta name="description" content="TCDA is an art-driven fashion brand at the intersection of abstract art, modern silhouette, and personal transformation." />
        <meta property="og:title" content="TCDA — Transcend Creative Dimension Aura" />
        <meta property="og:description" content="TCDA is an art-driven fashion brand at the intersection of abstract art, modern silhouette, and personal transformation." />
        <meta property="og:url" content="https://tcdashop.com/en/" />
        <meta property="og:image" content="https://cdn.tcdashop.com/top/hero-transcend-desktop.webp" />
      </Helmet>
      <JsonLd type="Organization" data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "TCDA",
        "legalName": "Transcend Creative Dimension Aura",
        "url": "https://tcdashop.com",
        "logo": "https://cdn.tcdashop.com/logo/1.webp",
        "sameAs": [
          "https://www.instagram.com/tcda.shop/",
          "https://www.tiktok.com/@tcda.shop",
          "https://jp.pinterest.com/tcda_shop/",
          "https://x.com/tcda_shop"
        ]
      }} />
      <JsonLd type="WebSite" data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "TCDA",
        "url": "https://tcdashop.com"
      }} />

      {/* SECTION 1 — TRANSCEND */}
      <section style={{ position: "relative", width: "100%", overflowX: "hidden" }}>
        <img
          src="https://cdn.tcdashop.com/top/hero-transcend-desktop.webp"
          srcSet="https://cdn.tcdashop.com/top/hero-transcend-mobile.webp 828w, https://cdn.tcdashop.com/top/hero-transcend-desktop.webp 1440w"
          sizes="(max-width: 768px) 828px, 1440px"
          alt="TRANSCEND"
          fetchPriority="high"
          loading="eager"
          style={{ width: "100%", display: "block" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 1 }} />

        <div style={{ position: "absolute", bottom: "8%", left: 0, right: 0, padding: "0 clamp(16px, 5vw, var(--container-padding-desktop))", zIndex: 2 }}>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="leading-none select-none"
            style={{ ...DISPLAY_STYLE, color: "var(--color-text)", textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}
          >
            {t("home.transcend")}
          </motion.h1>
        </div>
      </section>

      {/* SECTION 2 — CREATIVE */}
      <section style={{ position: "relative", width: "100%", overflowX: "hidden" }}>
        <img src="https://cdn.tcdashop.com/top/006-desktop.webp" srcSet="https://cdn.tcdashop.com/top/006-mobile.webp 828w, https://cdn.tcdashop.com/top/006-desktop.webp 1440w" sizes="(max-width: 768px) 828px, 1440px" alt="" loading="eager" fetchPriority="high" decoding="async" style={{ width: "100%", display: "block" }} />
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 1 }} />

        <div style={{ position: "absolute", bottom: "8%", left: 0, right: 0, padding: "0 clamp(16px, 5vw, var(--container-padding-desktop))", zIndex: 2 }}>
          <motion.h2
            {...fadeUp}
            className="leading-none select-none"
            style={{ ...DISPLAY_STYLE, color: "var(--color-text)", textShadow: "0 2px 20px rgba(0,0,0,0.5)", transform: `translateX(${scrollY * -0.1}px)`, transition: "none" }}
          >
            CREATIVE
          </motion.h2>
        </div>
      </section>

      {/* SECTION 3 — DIMENSION */}
      <section style={{ position: "relative", width: "100%", overflowX: "hidden" }}>
        <img src="https://cdn.tcdashop.com/top/010-desktop.webp" srcSet="https://cdn.tcdashop.com/top/010-mobile.webp 828w, https://cdn.tcdashop.com/top/010-desktop.webp 1440w" sizes="(max-width: 768px) 828px, 1440px" alt="" loading="lazy" decoding="async" style={{ width: "100%", display: "block" }} />
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 1 }} />

        <div style={{ position: "absolute", bottom: "8%", left: 0, right: 0, padding: "0 clamp(16px, 5vw, var(--container-padding-desktop))", zIndex: 2 }}>
          <motion.h2
            {...fadeUp}
            className="leading-none select-none"
            style={{ ...DISPLAY_STYLE, color: "var(--color-text)", textShadow: "0 2px 20px rgba(0,0,0,0.5)", transform: `translateX(${scrollY * 0.1}px)`, transition: "none" }}
          >
            DIMENSION
          </motion.h2>
        </div>
      </section>

      {/* SECTION 4 — AURA */}
      <section style={{ position: "relative", width: "100%", overflowX: "hidden" }}>
        <img src="https://cdn.tcdashop.com/top/011-desktop.webp" srcSet="https://cdn.tcdashop.com/top/011-mobile.webp 828w, https://cdn.tcdashop.com/top/011-desktop.webp 1440w" sizes="(max-width: 768px) 828px, 1440px" alt="" loading="lazy" decoding="async" style={{ width: "100%", display: "block" }} />
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 1 }} />

        <div style={{ position: "absolute", bottom: "8%", left: 0, right: 0, padding: "0 clamp(16px, 5vw, var(--container-padding-desktop))", zIndex: 2 }}>
          <motion.h2
            {...fadeUp}
            className="leading-none select-none"
            style={{ ...DISPLAY_STYLE, fontSize: "clamp(40px, 12vw, 180px)", color: "var(--color-text)", textShadow: "0 2px 20px rgba(0,0,0,0.5)", transform: `translateX(${scrollY * -0.1}px)`, transition: "none" }}
          >
            AURA
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ marginTop: "24px" }}
          >
            <Link
              to={`/${language}/collection`}
              style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-caption)", letterSpacing: "var(--ls-nav)", color: "var(--color-text)", transition: "var(--transition-base)" }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              {t("nav.collection")} →
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
