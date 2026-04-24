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

      {/* 1. Hero */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-5 sm:px-8">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-[10px] tracking-[0.4em] uppercase mb-10"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          Transcend Creative Dimension Aura
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="leading-[1.4] max-w-2xl"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-heading)",
            fontWeight: "var(--weight-light)",
            letterSpacing: "var(--ls-display)",
            color: "var(--color-text)",
          }}
        >
          {t("about.heroTitle")}
        </motion.h1>
      </section>

      {/* 2. Brand Visual */}
      <div className="w-full overflow-hidden" style={{ height: "70vh" }}>
        <img
          src="https://cdn.tcdashop.com/top/1.webp"
          srcSet="https://cdn.tcdashop.com/top/1-mobile.webp 550w, https://cdn.tcdashop.com/top/1.webp 902w"
          sizes="(max-width: 768px) 550px, 902px"
          alt="TCDA"
          className="w-full h-full object-cover"
          style={{ objectPosition: "center center" }}
        />
      </div>

      {/* 3. Story */}
      <section
        className="px-5 sm:px-8 md:px-16 lg:px-20 py-[120px] max-md:py-[60px]"
        style={{ borderTop: "1px solid var(--color-border)" }}
      >
        <motion.div {...fadeUp} className="max-w-2xl">
          <p className="text-[10px] tracking-[0.4em] uppercase mb-10" style={{ color: "var(--color-text-tertiary)" }}>
            {t("about.storyLabel")}
          </p>
          <h2
            className="leading-[1.6] mb-8"
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
            className="text-sm font-light leading-loose"
            style={{ fontFamily: "var(--font-body)", color: "var(--color-text-secondary)", letterSpacing: "var(--ls-body)" }}
          >
            {t("about.storyBody")}
          </p>
        </motion.div>
      </section>

      {/* 4. Values */}
      <section
        className="px-5 sm:px-8 md:px-16 lg:px-20 py-[120px] max-md:py-[60px]"
        style={{ borderTop: "1px solid var(--color-border)" }}
      >
        <motion.div {...fadeUp}>
          <p className="text-[10px] tracking-[0.4em] uppercase mb-14" style={{ color: "var(--color-text-tertiary)" }}>
            {t("about.valuesTitle")}
          </p>
          <div className="grid md:grid-cols-3 gap-12 max-w-4xl">
            {VALUES.map(({ key }, i) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className="text-xs font-light" style={{ color: "var(--color-text-tertiary)" }}>0{i + 1}</span>
                <h3
                  className="text-[11px] tracking-[0.3em] uppercase mt-3 mb-4"
                  style={{ color: "var(--color-text)", fontFamily: "var(--font-body)" }}
                >
                  {t(`about.value${key}`)}
                </h3>
                <p
                  className="text-xs font-light leading-loose"
                  style={{ fontFamily: "var(--font-body)", color: "var(--color-text-secondary)", letterSpacing: "var(--ls-body)" }}
                >
                  {t(`about.value${key}Body`)}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* 5. CTA */}
      <section
        className="py-[120px] max-md:py-[60px] flex items-center justify-center"
        style={{ borderTop: "1px solid var(--color-border)" }}
      >
        <motion.div {...fadeUp} className="text-center">
          <Link
            to={`/${language}/collection`}
            className="inline-block px-14 py-4 uppercase"
            style={{
              border: "1px solid var(--color-accent)",
              color: "var(--color-accent)",
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-caption)",
              letterSpacing: "var(--ls-nav)",
              transition: "var(--transition-base)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--color-accent)";
              e.currentTarget.style.color = "var(--color-bg)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--color-accent)";
            }}
          >
            {t("about.ctaLabel")}
          </Link>
          <div className="flex items-center justify-center gap-2 mt-6" style={{ fontFamily: "var(--font-body)", fontSize: "13px" }}>
            <Link
              to={`/${language}/faq`}
              className="transition-all duration-300"
              style={{ color: "var(--color-text-secondary)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-accent)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-secondary)")}
            >
              Explore FAQ
            </Link>
            <span style={{ color: "var(--color-border)" }}>·</span>
            <Link
              to={`/${language}/brand-foundation`}
              className="transition-all duration-300"
              style={{ color: "var(--color-text-secondary)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-accent)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-secondary)")}
            >
              View Brand Foundation
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
