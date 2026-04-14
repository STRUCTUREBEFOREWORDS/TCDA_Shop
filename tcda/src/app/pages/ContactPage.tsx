import { useState } from "react";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";

type FormState = "default" | "loading" | "success" | "error";

export function ContactPage() {
  const { t } = useTranslation();
  const [formState, setFormState] = useState<FormState>("default");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormState("loading");
    try {
      const res = await fetch("https://api.tcdashop.com/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, order_number: orderNumber, message }),
      });
      if (!res.ok) throw new Error("Request failed");
      setFormState("success");
    } catch {
      setFormState("error");
    }
  }

  const inputClass =
    "w-full bg-white border border-black/15 px-4 py-3 text-sm font-light text-black placeholder:text-black/25 focus:outline-none focus:border-black/40 transition-colors duration-200";

  return (
    <div className="min-h-screen bg-white pt-20">
      <Helmet>
        <title>{t("contact.title")} | TCDA</title>
      </Helmet>

      {/* Hero */}
      <div className="px-8 md:px-20 max-w-4xl mx-auto py-16 border-b border-black/10">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="text-black/20 text-[10px] font-light tracking-[0.5em] uppercase mb-4"
        >
          {t("contact.title")}
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-black/50 text-sm font-light leading-relaxed max-w-xl"
        >
          {t("contact.pageIntro")}
        </motion.p>
      </div>

      <div className="px-8 md:px-20 max-w-4xl mx-auto py-16 pb-32">

        {formState === "success" ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-md"
          >
            <p className="text-black/60 text-sm font-light leading-relaxed">
              {t("contact.success")}
            </p>
          </motion.div>
        ) : (
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-md space-y-5"
          >
            {/* Name */}
            <div className="space-y-1.5">
              <label className="block text-black/40 text-[10px] font-light tracking-widest uppercase">
                {t("contact.name")}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("contact.namePlaceholder")}
                className={inputClass}
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-black/40 text-[10px] font-light tracking-widest uppercase">
                {t("contact.email")}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("contact.emailPlaceholder")}
                className={inputClass}
              />
            </div>

            {/* Order Number */}
            <div className="space-y-1.5">
              <label className="block text-black/40 text-[10px] font-light tracking-widest uppercase">
                {t("contact.orderNumber")}
              </label>
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder={t("contact.orderNumberPlaceholder")}
                className={inputClass}
              />
            </div>

            {/* Message */}
            <div className="space-y-1.5">
              <label className="block text-black/40 text-[10px] font-light tracking-widest uppercase">
                {t("contact.message")}
              </label>
              <textarea
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t("contact.messagePlaceholder")}
                className={`${inputClass} resize-none`}
              />
            </div>

            {/* Error state */}
            {formState === "error" && (
              <div className="py-3">
                <p className="text-black/50 text-xs font-light leading-relaxed mb-1">
                  {t("contact.error")}
                </p>
                <p className="text-black/30 text-[10px] font-light tracking-widest uppercase mt-2">
                  {t("contact.orEmail")}
                </p>
                <a
                  href="mailto:info@tcdashop.com"
                  className="text-black/50 text-xs font-light hover:text-black transition-colors"
                >
                  info@tcdashop.com
                </a>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={formState === "loading"}
              className="w-full py-4 bg-black text-white text-xs font-light tracking-[0.3em] uppercase hover:bg-black/80 transition-colors duration-300 disabled:opacity-40"
            >
              {formState === "loading" ? t("contact.submitting") : t("contact.submit")}
            </button>
          </motion.form>
        )}

      </div>
    </div>
  );
}
