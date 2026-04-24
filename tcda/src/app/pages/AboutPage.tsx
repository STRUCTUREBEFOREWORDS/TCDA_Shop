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
    <div className="min-h-screen bg-black">
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
          className="text-white/40 text-[10px] tracking-[0.4em] uppercase mb-10"
        >
          Transcend Creative Dimension Aura
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="text-white font-extralight leading-[1.4] tracking-wide max-w-2xl"
          style={{ fontSize: "clamp(28px, 5vw, 52px)" }}
        >
          {t("about.heroTitle")}
        </motion.h1>
      </section>

      {/* 2. Brand Visual */}
      <div className="w-full overflow-hidden" style={{ aspectRatio: "16/7" }}>
        <img
          src="https://cdn.tcdashop.com/top/1.webp"
          srcSet="https://cdn.tcdashop.com/top/1-mobile.webp 550w, https://cdn.tcdashop.com/top/1.webp 902w"
          sizes="(max-width: 768px) 550px, 902px"
          alt="TCDA"
          className="w-full h-full object-cover"
        />
      </div>

      {/* 3. Story */}
      <section className="px-5 sm:px-8 md:px-16 lg:px-20 py-[120px] max-md:py-[60px] bg-black border-t border-white/5">
        <motion.div {...fadeUp} className="max-w-2xl">
          <p className="text-white/30 text-[10px] tracking-[0.4em] uppercase mb-10">
            {t("about.storyLabel")}
          </p>
          <h2 className="text-white text-2xl md:text-3xl font-extralight leading-[1.6] tracking-wide mb-8">
            {t("about.storyTitle")}
          </h2>
          <p className="text-white/65 text-sm font-light leading-loose tracking-wide">
            {t("about.storyBody")}
          </p>
        </motion.div>
      </section>

      {/* 4. Values */}
      <section className="px-5 sm:px-8 md:px-16 lg:px-20 py-[120px] max-md:py-[60px] bg-black border-t border-white/5">
        <motion.div {...fadeUp}>
          <p className="text-white/30 text-[10px] tracking-[0.4em] uppercase mb-14">
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
                <span className="text-white/20 text-xs font-light">0{i + 1}</span>
                <h3 className="text-white text-[11px] tracking-[0.3em] uppercase mt-3 mb-4">
                  {t(`about.value${key}`)}
                </h3>
                <p className="text-white/60 text-xs font-light leading-loose">
                  {t(`about.value${key}Body`)}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* 5. CTA */}
      <section className="py-[120px] max-md:py-[60px] bg-black border-t border-white/5 flex items-center justify-center">
        <motion.div {...fadeUp} className="text-center">
          <Link
            to={`/${language}/collection`}
            className="inline-block px-14 py-4 border border-[#E8FF00] text-[#E8FF00] hover:bg-[#E8FF00] hover:text-black transition-colors duration-300 text-xs tracking-[0.4em] uppercase"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "16px" }}
          >
            {t("about.ctaLabel")}
          </Link>
          <div className="flex items-center justify-center gap-2 mt-6" style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px" }}>
            <Link to={`/${language}/faq`} className="text-white/50 hover:text-[#E8FF00] hover:opacity-100 transition-all duration-300">
              Explore FAQ
            </Link>
            <span className="text-white/20">·</span>
            <Link to={`/${language}/brand-foundation`} className="text-white/50 hover:text-[#E8FF00] hover:opacity-100 transition-all duration-300">
              View Brand Foundation
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
