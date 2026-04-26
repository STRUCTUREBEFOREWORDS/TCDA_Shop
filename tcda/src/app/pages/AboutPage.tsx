import { useEffect } from "react";
import { motion } from "motion/react";
import { Link, useLocation } from "react-router";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { useGlobalContext } from "./Root";
import { pushDataLayer } from "../hooks/useDataLayer";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 } as Record<string, unknown>,
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
};

const VALUES = [
  { key: "1" },
  { key: "2" },
  { key: "3" },
];

const WHO_KEYS = ["individual", "artSeeker", "selfTransformer"] as const;
const DIFFERENT_KEYS = ["artFirst", "limited", "wearable"] as const;


export function AboutPage() {
  const { language, currency, countryCode } = useGlobalContext();
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const canonicalPath = pathname.replace(/^\/(en|ja|fr|es|ko|zh|de|it|pt|ar)/, "");
  const canonical = `https://tcdashop.com/en${canonicalPath}`;

  useEffect(() => {
    pushDataLayer('page_view', {
      page_type: 'about',
      language,
      currency,
      country: countryCode,
    });
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "var(--color-bg)" }}>
      <Helmet>
        <title>About — TCDA</title>
        <meta name="description" content="TCDA is an art-driven fashion brand at the intersection of abstract art, modern silhouette, and personal transformation." />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content="About — TCDA" />
        <meta property="og:description" content="TCDA is an art-driven fashion brand at the intersection of abstract art, modern silhouette, and personal transformation." />
        <meta property="og:url" content={canonical} />
      </Helmet>

      {/* 01. Hero */}
      <section style={{ position: "relative", width: "100%", overflowX: "hidden" }}>
        <img
          src="https://cdn.tcdashop.com/top/about-hero-desktop.webp"
          srcSet="https://cdn.tcdashop.com/top/about-hero-mobile.webp 828w, https://cdn.tcdashop.com/top/about-hero-desktop.webp 1440w"
          sizes="(max-width: 768px) 828px, 1440px"
          alt=""
          loading="eager"
          fetchPriority="high"
          decoding="async"
          style={{ width: "100%", display: "block" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1 }} />

        <div style={{ position: "absolute", bottom: "8%", left: 0, right: 0, padding: "0 var(--container-padding-desktop)", zIndex: 2 }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px, 5vw, 80px)", fontWeight: 500, letterSpacing: "0.04em", lineHeight: 1.5, color: "var(--color-text)", marginBottom: "24px", maxWidth: "800px", wordBreak: "keep-all" }}>
            {t("about.hero.title")}
          </h1>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "clamp(14px, 1.5vw, 18px)", color: "rgba(255,255,255,0.7)", maxWidth: "480px", lineHeight: 1.6 }}>
            {t("about.hero.subtitle")}
          </p>
        </div>
      </section>

      {/* 02. Story */}
      <section
        className="relative"
        style={{
          marginTop: "160px",
          paddingLeft: "var(--container-padding-desktop)",
          paddingRight: "var(--container-padding-desktop)",
        }}
      >

        <motion.div
          {...fadeUp}
          className="grid grid-cols-1 md:grid-cols-[40%_60%] items-start"
          style={{ gap: "80px" }}
        >
          {/* Left: image */}
          <div className="w-full overflow-hidden" style={{ aspectRatio: "2/3" }}>
            <img
              src="https://cdn.tcdashop.com/top/about-section-01-desktop.webp"
              srcSet="https://cdn.tcdashop.com/top/about-section-01-mobile.webp 828w, https://cdn.tcdashop.com/top/about-section-01-desktop.webp 1440w"
              sizes="(max-width: 768px) 828px, 1440px"
              alt="TCDA Story"
              className="w-full h-full object-cover"
              style={{ objectPosition: "center center" }}
            />
          </div>

          {/* Right: text */}
          <div className="flex flex-col justify-center">
            <h2
              className="leading-[1.4] mb-8"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-subheading)",
                fontWeight: "var(--weight-light)",
                letterSpacing: "var(--ls-display)",
                color: "var(--color-text)",
              }}
            >
              {t("about.storyTitle")}
            </h2>
            <p
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--color-text-secondary)",
                lineHeight: 1.8,
                letterSpacing: "var(--ls-body)",
              }}
            >
              {t("about.storyBody")}
            </p>
          </div>
        </motion.div>
      </section>

      {/* 03. Values */}
      <section className="relative" style={{ marginTop: "160px" }}>

        <motion.div {...fadeUp}>
          <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: "2px" }}>
            {VALUES.map(({ key }, i) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                style={{ padding: "40px", border: "1px solid var(--color-border)" }}
              >
                <h3
                  className="mb-4 leading-[1.4]"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "var(--text-subheading)",
                    fontWeight: "var(--weight-light)",
                    letterSpacing: "var(--ls-display)",
                    color: "var(--color-text)",
                  }}
                >
                  {t(`about.value${key}`)}
                </h3>
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    color: "var(--color-text-secondary)",
                    lineHeight: 1.8,
                    letterSpacing: "var(--ls-body)",
                  }}
                >
                  {t(`about.value${key}Body`)}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* 04. Brand Foundation */}
      <section
        className="relative"
        style={{
          borderTop: "1px solid var(--color-border)",
          paddingTop: "80px",
          marginTop: "80px",
          paddingLeft: "var(--container-padding-desktop)",
          paddingRight: "var(--container-padding-desktop)",
        }}
      >

        <motion.div {...fadeUp}>
          <h2
            className="leading-[1.4] mb-10"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-subheading)",
              fontWeight: "var(--weight-light)",
              letterSpacing: "var(--ls-display)",
              color: "var(--color-text)",
            }}
          >
            {t("about.brandFoundation.title")}
          </h2>

          {/* What TCDA Is */}
          <motion.p
            {...fadeUp}
            className="mb-16"
            style={{ fontFamily: "var(--font-body)", color: "var(--color-text-secondary)", lineHeight: 1.8, letterSpacing: "var(--ls-body)", maxWidth: "640px" }}
          >
            {t("about.brandFoundation.description")}
          </motion.p>

          {/* Who It Is For */}
          <div className="grid grid-cols-1 md:grid-cols-3 mb-16" style={{ gap: "2px" }}>
            {WHO_KEYS.map((key, i) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                style={{ padding: "32px", border: "1px solid var(--color-border)" }}
              >
                <p
                  className="mb-2"
                  style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-caption)", fontWeight: "var(--weight-light)", letterSpacing: "var(--ls-display)", color: "var(--color-text)" }}
                >
                  {t(`about.brandFoundation.${key}.title`)}
                </p>
                <p style={{ fontFamily: "var(--font-body)", color: "var(--color-text-secondary)", lineHeight: 1.8, letterSpacing: "var(--ls-body)" }}>
                  {t(`about.brandFoundation.${key}.description`)}
                </p>
              </motion.div>
            ))}
          </div>

          {/* What Makes TCDA Different */}
          <div className="flex flex-col mb-16" style={{ gap: "40px" }}>
            {DIFFERENT_KEYS.map((key) => (
              <motion.div
                key={key}
                {...fadeUp}
                className="pl-6"
                style={{ borderLeft: "2px solid rgba(255,255,255,0.3)" }}
              >
                <p
                  className="mb-1"
                  style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-caption)", fontWeight: "var(--weight-light)", letterSpacing: "var(--ls-display)", color: "var(--color-text)" }}
                >
                  {t(`about.brandFoundation.${key}.title`)}
                </p>
                <p style={{ fontFamily: "var(--font-body)", color: "var(--color-text-secondary)", lineHeight: 1.8, letterSpacing: "var(--ls-body)" }}>
                  {t(`about.brandFoundation.${key}.description`)}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Product Philosophy */}
          <motion.p
            {...fadeUp}
            style={{ fontFamily: "var(--font-display)", fontSize: "clamp(16px, 2vw, 24px)", fontStyle: "italic", fontWeight: 300, letterSpacing: "0.05em", color: "var(--color-text-secondary)", borderLeft: "2px solid rgba(255,255,255,0.3)", paddingLeft: "24px", marginTop: "40px" }}
          >
            {t("about.brandFoundation.quote")}
          </motion.p>
        </motion.div>
      </section>

      {/* 05. CTA */}
      <section
        className="relative flex flex-col items-center justify-center text-center"
        style={{ height: "60vh", marginTop: "160px" }}
      >

        <motion.div {...fadeUp} className="flex flex-col items-center gap-10">
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-heading)",
              fontWeight: "var(--weight-light)",
              letterSpacing: "var(--ls-display)",
              color: "var(--color-text)",
            }}
          >
            {t("about.ctaLabel")}
          </h2>
          <Link
            to={`/${language}/collection`}
            className="inline-block px-14 py-4 uppercase"
            style={{
              border: "1px solid var(--color-text)",
              color: "var(--color-text)",
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-caption)",
              letterSpacing: "var(--ls-nav)",
              transition: "var(--transition-base)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--color-text)";
              e.currentTarget.style.color = "var(--color-text)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--color-text)";
              e.currentTarget.style.color = "var(--color-text)";
            }}
          >
            {t("nav.collection")}
          </Link>
          <div className="flex items-center justify-center gap-2" style={{ fontFamily: "var(--font-body)", fontSize: "13px" }}>
            <Link
              to={`/${language}/faq`}
              className="transition-all duration-300"
              style={{ color: "var(--color-text-secondary)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-text)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-secondary)")}
            >
              Explore FAQ
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
