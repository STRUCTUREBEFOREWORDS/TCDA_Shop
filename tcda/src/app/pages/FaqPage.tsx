import { useEffect } from "react";
import { motion } from "motion/react";
import { Link, useLocation } from "react-router";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { useGlobalContext } from "./Root";
import { FaqAccordion, FaqItem } from "../components/FaqAccordion";
import { JsonLd } from "../components/JsonLd";
import { pushDataLayer } from "../hooks/useDataLayer";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 } as Record<string, unknown>,
  viewport: { once: true, amount: 0.15 },
  transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
};


interface Category {
  titleKey: string;
  items: FaqItem[];
}

export function FaqPage() {
  const { language, currency, countryCode } = useGlobalContext();
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const canonicalPath = pathname.replace(/^\/(en|ja|fr|es|ko|zh|de|it|pt|ar)/, "");
  const canonical = `https://tcdashop.com/en${canonicalPath}`;

  useEffect(() => {
    pushDataLayer('page_view', {
      page_type: 'faq',
      faq_category: 'all',
      language,
      currency,
      country: countryCode,
    });
  }, []);

  const categories: Category[] = [
    {
      titleKey: "faq.categoryAbout",
      items: [
        { q: t("faq.q1"), a: t("faq.a1") },
        { q: t("faq.q2"), a: t("faq.a2") },
        { q: t("faq.q3"), a: t("faq.a3") },
      ],
    },
    {
      titleKey: "faq.categorySizing",
      items: [
        { q: t("faq.sizeHelp.q"), a: t("faq.sizeHelp.a") },
        { q: t("faq.oversized.q"), a: t("faq.oversized.a") },
        { q: t("faq.modelSize.q"), a: t("faq.modelSize.a") },
      ],
    },
    {
      titleKey: "faq.categoryShipping",
      items: [
        { q: t("faq.deliveryTime.q"), a: t("faq.deliveryTime.a") },
        { q: t("faq.internationalShipping.q"), a: t("faq.internationalShipping.a") },
        { q: t("faq.returns.q"), a: t("faq.returns.a") },
        { q: t("faq.defect.q"), a: t("faq.defect.a") },
      ],
    },
    {
      titleKey: "faq.categoryProduct",
      items: [
        { q: t("faq.colorDifference.q"), a: t("faq.colorDifference.a") },
        { q: t("faq.washing.q"), a: t("faq.washing.a") },
        { q: t("faq.paymentMethods.q"), a: t("faq.paymentMethods.a") },
      ],
    },
  ];

  const allQA = categories.flatMap(({ items }) => items);

  return (
    <div className="min-h-screen" style={{ background: "var(--color-bg)" }}>
      <Helmet>
        <title>FAQ — TCDA</title>
        <meta name="description" content="Answers about TCDA products, sizing, shipping, and returns." />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content="FAQ — TCDA" />
        <meta property="og:description" content="Answers about TCDA products, sizing, shipping, and returns." />
        <meta property="og:url" content={canonical} />
      </Helmet>
      <JsonLd type="FAQPage" data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": allQA.map(({ q, a }) => ({
          "@type": "Question",
          "name": q,
          "acceptedAnswer": { "@type": "Answer", "text": a },
        })),
      }} />

      {/* Hero */}
      <section
        className="relative flex flex-col justify-end items-start"
        style={{
          height: "60vh",
          padding: "0 var(--container-padding-desktop) var(--section-padding-desktop)",
        }}
      >

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="leading-[1.2]"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-display)",
            fontWeight: "var(--weight-light)",
            letterSpacing: "var(--ls-display)",
            color: "var(--color-text)",
          }}
        >
          {t("faq.pageTitle")}
        </motion.h1>
      </section>

      {/* FAQ Categories */}
      <div
        style={{
          maxWidth: "var(--max-width-content)",
          margin: "0 auto",
          padding: "0 clamp(16px, 5vw, var(--container-padding-desktop))",
          marginBottom: "clamp(24px, 4vw, 48px)",
        }}
      >
        {categories.map(({ titleKey, items }, idx) => (
          <section
            key={titleKey}
            style={{
              borderTop: "1px solid var(--color-border)",
              paddingTop: "clamp(32px, 6vw, 80px)",
              marginTop: idx === 0 ? "clamp(32px, 6vw, 80px)" : "clamp(32px, 6vw, 80px)",
            }}
          >
            <motion.div {...fadeUp} className="flex gap-16 items-start">
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "var(--text-caption)",
                  letterSpacing: "var(--ls-nav)",
                  color: "var(--color-text-tertiary)",
                  flexShrink: 0,
                  minWidth: "32px",
                }}
              >
                0{idx + 1}
              </span>
              <div className="flex-1">
                <h2
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "var(--text-subheading)",
                    fontWeight: "var(--weight-light)",
                    letterSpacing: "var(--ls-display)",
                    color: "var(--color-text)",
                    marginBottom: "clamp(20px, 4vw, 40px)",
                  }}
                >
                  {t(titleKey)}
                </h2>
                <div>
                  <FaqAccordion items={items} />
                </div>
              </div>
            </motion.div>
          </section>
        ))}
      </div>

      {/* CTA */}
      <section
        className="text-center"
        style={{ padding: "0 var(--container-padding-desktop) var(--section-padding-desktop)" }}
      >
        <motion.div {...fadeUp}>
          <p
            className="mb-8"
            style={{ fontFamily: "var(--font-body)", fontSize: "16px", color: "var(--color-text-secondary)" }}
          >
            {t("faq.ctaLabel")}
          </p>
          <Link
            to={`/${language}/contact`}
            className="inline-block px-10 py-3 uppercase"
            style={{
              border: "1px solid var(--color-text)",
              color: "var(--color-text)",
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-caption)",
              letterSpacing: "var(--ls-nav)",
              transition: "var(--transition-base)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--color-text)";
              e.currentTarget.style.color = "var(--color-bg)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--color-text)";
            }}
          >
            {t("nav.contact")}
          </Link>
          <div className="flex items-center justify-center gap-2 mt-6" style={{ fontFamily: "var(--font-body)", fontSize: "13px" }}>
            <Link
              to={`/${language}/about`}
              className="transition-all duration-300"
              style={{ color: "var(--color-text-secondary)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-text)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-secondary)")}
            >
              About TCDA
            </Link>
            <span style={{ color: "var(--color-border)" }}>·</span>
            <Link
              to={`/${language}/collection`}
              className="transition-all duration-300"
              style={{ color: "var(--color-text-secondary)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-text)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-secondary)")}
            >
              View Collection
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
