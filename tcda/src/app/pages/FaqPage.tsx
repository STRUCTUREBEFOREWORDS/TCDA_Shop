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

const sectionPad = "py-[120px] px-6 md:px-16 max-md:py-[60px]";

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
    <div className="min-h-screen bg-black">
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
        className="flex items-center justify-center border-b border-white/5"
        style={{ height: "40vh" }}
      >
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(48px, 8vw, 96px)",
            color: "#ffffff",
            lineHeight: 1,
          }}
        >
          {t("faq.pageTitle")}
        </motion.h1>
      </section>

      {/* FAQ Categories */}
      {categories.map(({ titleKey, items }) => (
        <section key={titleKey} className={`${sectionPad} border-b border-white/5`}>
          <div className="max-w-3xl mx-auto">
            <motion.h2
              {...fadeUp}
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "32px",
                color: "#E8FF00",
                marginBottom: "32px",
              }}
            >
              {t(titleKey)}
            </motion.h2>
            <motion.div {...fadeUp}>
              <FaqAccordion items={items} />
            </motion.div>
          </div>
        </section>
      ))}

      {/* CTA */}
      <section className={`${sectionPad} text-center`}>
        <motion.div {...fadeUp}>
          <p
            className="mb-8 text-white/50"
            style={{ fontFamily: "'Inter', sans-serif", fontSize: "16px" }}
          >
            {t("faq.ctaLabel")}
          </p>
          <Link
            to={`/${language}/contact`}
            className="inline-block px-10 py-3 border border-[#E8FF00] text-[#E8FF00] hover:bg-[#E8FF00] hover:text-black transition-colors duration-300"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "18px", letterSpacing: "0.1em" }}
          >
            {t("nav.contact")}
          </Link>
          <div className="flex items-center justify-center gap-2 mt-6" style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px" }}>
            <Link to={`/${language}/about`} className="text-white/50 hover:text-[#E8FF00] hover:opacity-100 transition-all duration-300">
              About TCDA
            </Link>
            <span className="text-white/20">·</span>
            <Link to={`/${language}/collection`} className="text-white/50 hover:text-[#E8FF00] hover:opacity-100 transition-all duration-300">
              View Collection
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
