import { useState } from "react";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { MEASUREMENT_LABEL_MAP, MEASUREMENT_KEYS_ORDER } from "../utils/measurementMeta";

const FIT_KEYS = ["slim", "regular", "relaxed", "oversized"] as const;

const FIT_BADGE_COLOR: Record<typeof FIT_KEYS[number], string> = {
  slim:     "bg-blue-50 text-blue-500 border-blue-100",
  regular:  "bg-green-50 text-green-500 border-green-100",
  relaxed:  "bg-amber-50 text-amber-500 border-amber-100",
  oversized:"bg-purple-50 text-purple-500 border-purple-100",
};

const FAQ_COUNT = 12;

export function SizeGuidePage() {
  const { t } = useTranslation();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = Array.from({ length: FAQ_COUNT }, (_, i) => ({
    q: t(`sizeGuide.faq${i + 1}q`),
    a: t(`sizeGuide.faq${i + 1}a`),
  }));

  return (
    <div className="min-h-screen bg-white pt-20">
      <Helmet>
        <title>{t("sizeGuide.title")} | TCDA</title>
      </Helmet>

      {/* Hero */}
      <div className="px-8 md:px-20 max-w-4xl mx-auto py-16 border-b border-black/10">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="text-black/20 text-[10px] font-light tracking-[0.5em] uppercase mb-4"
        >
          {t("sizeGuide.title")}
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-black/50 text-sm font-light leading-relaxed max-w-xl"
        >
          {t("sizeGuide.pageIntro")}
        </motion.p>
      </div>

      <div className="px-8 md:px-20 max-w-4xl mx-auto space-y-20 py-16 pb-32">

        {/* Fit Definitions */}
        <section>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6 }}
            className="text-black text-xs font-light tracking-[0.4em] uppercase mb-8 opacity-40"
          >
            {t("sizeGuide.fitDefinitions")}
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {FIT_KEYS.map((fit) => (
              <motion.div
                key={fit}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6 }}
                className="border border-black/8 p-6"
              >
                <span className={`inline-block px-2 py-0.5 text-[10px] font-light tracking-[0.3em] uppercase border mb-3 ${FIT_BADGE_COLOR[fit]}`}>
                  {t(`fit.${fit}`)}
                </span>
                <p className="text-black/60 text-xs font-light leading-relaxed">
                  {t(`fit.${fit}Note`)}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* How to Measure */}
        <section>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6 }}
            className="text-black text-xs font-light tracking-[0.4em] uppercase mb-8 opacity-40"
          >
            {t("sizeGuide.howToMeasure")}
          </motion.h2>
          <div className="space-y-0">
            {MEASUREMENT_KEYS_ORDER.map((key) => {
              const { marker, labelKey, helpKey } = MEASUREMENT_LABEL_MAP[key];
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.5 }}
                  className="border-t border-black/8 py-5 flex gap-4 items-start"
                >
                  {/* Marker badge */}
                  <span className="w-6 h-6 flex items-center justify-center bg-black text-white text-[9px] font-light rounded-full flex-shrink-0 mt-0.5">
                    {marker}
                  </span>
                  {/* Label + help */}
                  <div className="min-w-0">
                    <p className="text-black/60 text-[10px] font-light tracking-widest uppercase mb-1">
                      {t(labelKey)}
                    </p>
                    <p className="text-black/45 text-xs font-light leading-relaxed">
                      {t(helpKey)}
                    </p>
                  </div>
                </motion.div>
              );
            })}
            <div className="border-t border-black/8" />
          </div>
          {/* Notes */}
          <div className="mt-5 space-y-1.5">
            <p className="text-black/30 text-[10px] font-light">
              {t("sizeGuide.measurementFlatNote")}
            </p>
            <p className="text-black/25 text-[10px] font-light">
              {t("sizeGuide.measurementVariationNote")}
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6 }}
            className="text-black text-xs font-light tracking-[0.4em] uppercase mb-8 opacity-40"
          >
            FAQ
          </motion.h2>
          <div className="space-y-0">
            {faqs.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.4 }}
                className="border-b border-black/8"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left py-5 flex justify-between items-start gap-4"
                >
                  <span className="text-black text-sm font-light opacity-70 leading-relaxed">
                    {item.q}
                  </span>
                  <span className="text-black/30 text-xs font-light flex-shrink-0 mt-0.5">
                    {openFaq === i ? "−" : "+"}
                  </span>
                </button>
                {openFaq === i && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="text-black/50 text-xs font-light leading-relaxed pb-5 pr-8"
                  >
                    {item.a}
                  </motion.p>
                )}
              </motion.div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
