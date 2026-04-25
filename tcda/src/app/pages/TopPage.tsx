import { useRef, useEffect } from "react";
import { motion } from "motion/react";
import { Link } from "react-router";
import { useGlobalContext } from "./Root";
import { useTranslation } from "react-i18next";
import { JsonLd } from "../components/JsonLd";
import { pushDataLayer } from "../hooks/useDataLayer";

const HERO_IMAGE = "https://cdn.tcdashop.com/top/hero-transcend.webp";

const DISPLAY_STYLE: React.CSSProperties = {
  fontFamily: "var(--font-display)",
  fontSize: "var(--text-display)",
  fontWeight: "var(--weight-light)",
  letterSpacing: "var(--ls-display)",
};

const SECTION_NUM_STYLE: React.CSSProperties = {
  position: "absolute",
  top: "40px",
  left: "var(--container-padding-desktop)",
  fontFamily: "var(--font-body)",
  fontSize: "var(--text-caption)",
  letterSpacing: "var(--ls-nav)",
  color: "var(--color-text-tertiary)",
};

const CONTENT_PAD: React.CSSProperties = {
  padding: "0 var(--container-padding-desktop) var(--section-padding-desktop)",
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

  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    pushDataLayer('page_view', {
      page_type: 'top',
      language,
      currency,
      country: countryCode,
    });
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!imgRef.current) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 12;
      const y = (e.clientY / window.innerHeight - 0.5) * 8;
      imgRef.current.style.transform = `translate(${x}px, ${y}px) scale(1.05)`;
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-black">
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
      <section className="relative h-screen w-full overflow-hidden">
        <img
          ref={imgRef}
          src={HERO_IMAGE}
          srcSet="https://cdn.tcdashop.com/top/hero-transcend.webp 902w"
          sizes="(max-width: 768px) 550px, 902px"
          alt="TCDA"
          className="absolute inset-0 w-full h-full object-cover object-center scale-105"
          loading="eager"
          fetchPriority="high"
          decoding="async"
          style={{ willChange: "transform", transition: "transform 0.7s cubic-bezier(0.22,1,0.36,1)" }}
        />
        <div className="absolute inset-0 bg-black/30" />
        <span style={SECTION_NUM_STYLE}>01</span>
        <div className="absolute inset-0 flex flex-col justify-end items-start" style={CONTENT_PAD}>
          <motion.h1
            {...fadeUp}
            className="leading-none select-none"
            style={{ ...DISPLAY_STYLE, color: "var(--color-text)" }}
          >
            TRANSCEND
          </motion.h1>
        </div>
      </section>

      {/* SECTION 2 — CREATIVE */}
      <section
        className="relative h-screen w-full overflow-hidden flex flex-col justify-end items-start"
        style={{ ...CONTENT_PAD, backgroundImage: "url(https://cdn.tcdashop.com/top/006.webp)", backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat", backgroundAttachment: "scroll", width: "100%", height: "100%", overflow: "hidden" }}
      >
        <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.4)", zIndex: 0 }} />
        <span style={{ ...SECTION_NUM_STYLE, zIndex: 1 }}>02</span>
        <motion.h2
          {...fadeUp}
          className="leading-none select-none"
          style={{ ...DISPLAY_STYLE, color: "var(--color-accent)", position: "relative", zIndex: 1 }}
        >
          CREATIVE
        </motion.h2>
      </section>

      {/* SECTION 3 — DIMENSION */}
      <section
        className="relative h-screen w-full overflow-hidden flex flex-col justify-end items-start"
        style={{ ...CONTENT_PAD, backgroundImage: "url(https://cdn.tcdashop.com/top/010.webp)", backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat", backgroundAttachment: "scroll", width: "100%", height: "100%", overflow: "hidden" }}
      >
        <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.4)", zIndex: 0 }} />
        <span style={{ ...SECTION_NUM_STYLE, zIndex: 1 }}>03</span>
        <motion.h2
          {...fadeUp}
          className="leading-none select-none"
          style={{ ...DISPLAY_STYLE, color: "var(--color-text)", position: "relative", zIndex: 1 }}
        >
          DIMENSION
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ fontFamily: "var(--font-body)", fontSize: "18px", color: "var(--color-text-secondary)", marginTop: "24px", position: "relative", zIndex: 1 }}
        >
          Art-driven fashion for those who refuse the ordinary.
        </motion.p>
      </section>

      {/* SECTION 4 — AURA */}
      <section
        className="relative h-screen w-full overflow-hidden flex flex-col justify-end items-start"
        style={{ ...CONTENT_PAD, backgroundImage: "url(https://cdn.tcdashop.com/top/011.webp)", backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat", backgroundAttachment: "scroll", width: "100%", height: "100%", overflow: "hidden" }}
      >
        <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.4)", zIndex: 0 }} />
        <span style={{ ...SECTION_NUM_STYLE, zIndex: 1 }}>04</span>
        <motion.h2
          {...fadeUp}
          className="leading-none select-none"
          style={{ fontFamily: "var(--font-display)", fontSize: "clamp(32px, 12vw, 200px)", fontWeight: "var(--weight-light)", letterSpacing: "var(--ls-display)", color: "var(--color-text)", position: "relative", zIndex: 1 }}
        >
          AURA
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ marginTop: "24px", position: "relative", zIndex: 1 }}
        >
          <Link
            to={`/${language}/collection`}
            style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-caption)", letterSpacing: "var(--ls-nav)", color: "var(--color-accent)", transition: "var(--transition-base)" }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            {t("nav.collection")} →
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
