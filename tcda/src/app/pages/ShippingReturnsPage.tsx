import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router";
import { useGlobalContext } from "./Root";

export function ShippingReturnsPage() {
  const { t } = useTranslation();
  const { language } = useGlobalContext();

  const sections = [
    {
      title: t("shippingReturns.shippingTitle"),
      body: t("shippingReturns.shippingBody"),
    },
    {
      title: t("shippingReturns.deliveryTitle"),
      body: t("shippingReturns.deliveryBody"),
    },
    {
      title: t("shippingReturns.customsTitle"),
      body: t("shippingReturns.customsBody"),
    },
  ];

  return (
    <div className="min-h-screen bg-black pt-20">
      <Helmet>
        <title>{t("shippingReturns.title")} | TCDA</title>
      </Helmet>

      {/* Hero */}
      <div className="px-8 md:px-20 max-w-4xl mx-auto py-16 border-b border-white/10">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="text-white/20 text-[10px] font-light tracking-[0.5em] uppercase mb-4"
        >
          {t("shippingReturns.title")}
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-white/50 text-sm font-light leading-relaxed max-w-xl"
        >
          {t("shippingReturns.pageIntro")}
        </motion.p>
      </div>

      <div className="px-8 md:px-20 max-w-4xl mx-auto py-16 pb-32 space-y-0">

        {/* Shipping + Delivery */}
        {sections.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, delay: i * 0.05 }}
            className="border-t border-white/8 py-8"
          >
            <p className="text-white/30 text-[10px] font-light tracking-[0.4em] uppercase mb-3">
              {s.title}
            </p>
            <p className="text-white/60 text-sm font-light leading-relaxed">
              {s.body}
            </p>
            {i === 0 && (
              <p className="text-white/35 text-xs font-light leading-relaxed mt-3">
                {t("shippingReturns.shippingAddressNote")}
              </p>
            )}
          </motion.div>
        ))}

        {/* Returns */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="border-t border-white/8 py-8"
        >
          <p className="text-white/30 text-[10px] font-light tracking-[0.4em] uppercase mb-5">
            {t("shippingReturns.returnsTitle")}
          </p>
          <div className="space-y-3 mb-5">
            {(["returnsCondition", "returnsPeriod", "returnsMethod"] as const).map((key) => (
              <div key={key} className="flex gap-3 items-start">
                <span className="w-1 h-1 rounded-full bg-black/20 flex-shrink-0 mt-2" />
                <p className="text-white/60 text-sm font-light leading-relaxed">
                  {t(`shippingReturns.${key}`)}
                </p>
              </div>
            ))}
          </div>
          <p className="text-white/35 text-xs font-light leading-relaxed">
            {t("shippingReturns.returnsNote")}
          </p>
        </motion.div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
          className="border-t border-b border-white/8 py-8"
        >
          <p className="text-white/30 text-[10px] font-light tracking-[0.4em] uppercase mb-3">
            {t("shippingReturns.contactTitle")}
          </p>
          <p className="text-white/50 text-sm font-light leading-relaxed mb-4">
            {t("shippingReturns.contactBody")}
          </p>
          <a
            href="mailto:info@tcdashop.com"
            className="text-white/60 text-xs font-light tracking-widest hover:text-white transition-colors duration-200"
          >
            info@tcdashop.com
          </a>
        </motion.div>

        {/* Back links */}
        <div className="pt-10 flex gap-6 flex-wrap">
          <Link
            to={`/${language}/size-guide`}
            className="text-white/30 text-[10px] font-light tracking-widest uppercase hover:text-white/60 transition-colors"
          >
            {t("footer.sizeGuide")} →
          </Link>
          <Link
            to={`/${language}/contact`}
            className="text-white/30 text-[10px] font-light tracking-widest uppercase hover:text-white/60 transition-colors"
          >
            {t("footer.contact")} →
          </Link>
        </div>

      </div>
    </div>
  );
}
