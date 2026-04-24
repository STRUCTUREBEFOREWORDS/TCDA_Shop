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

const WHO = [
  { label: "The Individual", body: "Someone who refuses to dress like everyone else." },
  { label: "The Art Seeker", body: "Someone who finds meaning in visual expression." },
  { label: "The Self-Transformer", body: "Someone in the process of becoming." },
];

const DIFFERENT = [
  { title: "Art-First Design", body: "Every piece starts as a visual concept, not a product." },
  { title: "Limited Feeling", body: "Not mass. Not fast. Designed to feel rare." },
  { title: "Wearable Identity", body: "Clothing as a form of self-declaration." },
];

const SECTION_NUM_STYLE: React.CSSProperties = {
  position: "absolute",
  top: "40px",
  left: "var(--container-padding-desktop)",
  fontFamily: "var(--font-body)",
  fontSize: "var(--text-caption)",
  letterSpacing: "var(--ls-nav)",
  color: "var(--color-text-tertiary)",
};

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
      <section
        className="relative flex flex-col justify-end items-start"
        style={{
          height: "80vh",
          padding: "0 var(--container-padding-desktop) var(--section-padding-desktop)",
        }}
      >
        <span style={SECTION_NUM_STYLE}>01</span>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="leading-[1.2]"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-display)",
            fontWeight: "var(--weight-light)",
            letterSpacing: "var(--ls-display)",
            color: "var(--color-text)",
          }}
        >
          {t("about.heroTitle")}
        </motion.h1>
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
        <span style={SECTION_NUM_STYLE}>02</span>
        <motion.div
          {...fadeUp}
          className="grid grid-cols-1 md:grid-cols-[40%_60%] items-start"
          style={{ gap: "80px" }}
        >
          {/* Left: image */}
          <div className="w-full overflow-hidden" style={{ aspectRatio: "2/3" }}>
            <img
              src="https://cdn.tcdashop.com/top/1.webp"
              srcSet="https://cdn.tcdashop.com/top/1-mobile.webp 550w, https://cdn.tcdashop.com/top/1.webp 902w"
              sizes="(max-width: 768px) 550px, 902px"
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
        <span style={SECTION_NUM_STYLE}>03</span>
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
          marginTop: "160px",
          paddingLeft: "var(--container-padding-desktop)",
          paddingRight: "var(--container-padding-desktop)",
        }}
      >
        <span style={SECTION_NUM_STYLE}>04</span>
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
            BRAND FOUNDATION
          </h2>

          {/* What TCDA Is */}
          <motion.p
            {...fadeUp}
            className="mb-16"
            style={{ fontFamily: "var(--font-body)", color: "var(--color-text-secondary)", lineHeight: 1.8, letterSpacing: "var(--ls-body)", maxWidth: "640px" }}
          >
            TCDA — Transcend Creative Dimension Aura — is a brand born at the intersection of digital art and wearable culture.
            Every design begins as a visual concept, created to carry meaning beyond aesthetics.
          </motion.p>

          {/* Who It Is For */}
          <div className="grid grid-cols-1 md:grid-cols-3 mb-16" style={{ gap: "2px" }}>
            {WHO.map(({ label, body }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                style={{ padding: "32px", border: "1px solid var(--color-border)" }}
              >
                <p
                  className="mb-2"
                  style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-caption)", fontWeight: "var(--weight-light)", letterSpacing: "var(--ls-display)", color: "var(--color-accent)" }}
                >
                  {label}
                </p>
                <p style={{ fontFamily: "var(--font-body)", color: "var(--color-text-secondary)", lineHeight: 1.8, letterSpacing: "var(--ls-body)" }}>
                  {body}
                </p>
              </motion.div>
            ))}
          </div>

          {/* What Makes TCDA Different */}
          <div className="flex flex-col mb-16" style={{ gap: "40px" }}>
            {DIFFERENT.map(({ title, body }) => (
              <motion.div
                key={title}
                {...fadeUp}
                className="pl-6"
                style={{ borderLeft: "2px solid var(--color-accent)" }}
              >
                <p
                  className="mb-1"
                  style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-caption)", fontWeight: "var(--weight-light)", letterSpacing: "var(--ls-display)", color: "var(--color-text)" }}
                >
                  {title}
                </p>
                <p style={{ fontFamily: "var(--font-body)", color: "var(--color-text-secondary)", lineHeight: 1.8, letterSpacing: "var(--ls-body)" }}>
                  {body}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Product Philosophy */}
          <motion.p
            {...fadeUp}
            style={{ fontFamily: "var(--font-body)", color: "var(--color-text-secondary)", lineHeight: 1.8, fontStyle: "italic", letterSpacing: "var(--ls-body)" }}
          >
            "We don't make clothes. We make artifacts of personal transformation."
          </motion.p>
        </motion.div>
      </section>

      {/* 05. CTA */}
      <section
        className="relative flex flex-col items-center justify-center text-center"
        style={{ height: "60vh", marginTop: "160px" }}
      >
        <span style={SECTION_NUM_STYLE}>05</span>
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
              e.currentTarget.style.borderColor = "var(--color-accent)";
              e.currentTarget.style.color = "var(--color-accent)";
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
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-accent)")}
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
