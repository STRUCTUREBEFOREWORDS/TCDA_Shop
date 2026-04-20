import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { useGlobalContext } from "./Root";

type FormState = "idle" | "submitting" | "success" | "error";

const SUBMIT_COOLDOWN_MS = 30_000; // 30 s between submissions

export function ContactPage() {
  const { t } = useTranslation();
  const { language } = useGlobalContext();

  const [formState, setFormState] = useState<FormState>("idle");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [hp, setHp] = useState(""); // honeypot
  const lastSubmitRef = useRef<number>(0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Client-side rate limit
    const now = Date.now();
    if (now - lastSubmitRef.current < SUBMIT_COOLDOWN_MS) return;
    lastSubmitRef.current = now;

    setFormState("submitting");
    try {
      const res = await fetch("https://api.tcdashop.com/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          order_number: orderNumber,
          subject,
          message,
          lang: language,
          hp, // honeypot value — empty for real users
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setFormState("success");
    } catch {
      setFormState("error");
    }
  }

  const inputClass =
    "w-full bg-black border border-white/15 px-4 py-3 text-sm font-light text-white placeholder:text-white/25 focus:outline-none focus:border-white/40 transition-colors duration-200";

  const labelClass =
    "block text-white/40 text-[10px] font-light tracking-widest uppercase mb-1.5";

  return (
    <div className="min-h-screen bg-black pt-20">
      <Helmet>
        <title>{t("contact.title")} | TCDA</title>
      </Helmet>

      {/* Page header */}
      <div className="px-8 md:px-20 max-w-4xl mx-auto py-16 border-b border-white/10">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="text-white/20 text-[10px] font-light tracking-[0.5em] uppercase mb-4"
        >
          {t("contact.title")}
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-white/50 text-sm font-light leading-relaxed max-w-xl"
        >
          {t("contact.intro")}
        </motion.p>
      </div>

      <div className="px-8 md:px-20 max-w-4xl mx-auto py-16 pb-32">
        <AnimatePresence mode="wait">

          {/* ── Success ── */}
          {formState === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-md space-y-4"
            >
              <p className="text-white text-sm font-light tracking-widest uppercase">
                {t("contact.successTitle")}
              </p>
              <p className="text-white/50 text-sm font-light leading-relaxed">
                {t("contact.successBody")}
              </p>
              <p className="text-white/30 text-[10px] font-light tracking-widest uppercase mt-4">
                {t("contact.replyNote")}
              </p>
              <a
                href={`mailto:${t("contact.directEmail")}`}
                className="text-white/40 text-xs font-light hover:text-white transition-colors duration-200"
              >
                {t("contact.directEmail")}
              </a>
            </motion.div>
          )}

          {/* ── Form ── */}
          {formState !== "success" && (
            <motion.form
              key="form"
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-md space-y-5"
            >
              {/* Honeypot — hidden from real users, filled by bots */}
              <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", opacity: 0, pointerEvents: "none" }}>
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={hp}
                  onChange={(e) => setHp(e.target.value)}
                />
              </div>

              {/* Name */}
              <div>
                <label className={labelClass}>{t("contact.name")}</label>
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
              <div>
                <label className={labelClass}>{t("contact.email")}</label>
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
              <div>
                <label className={labelClass}>{t("contact.orderNumber")}</label>
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder={t("contact.orderNumberPlaceholder")}
                  className={inputClass}
                />
              </div>

              {/* Subject */}
              <div>
                <label className={labelClass}>{t("contact.subject")}</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={t("contact.subjectPlaceholder")}
                  className={inputClass}
                />
              </div>

              {/* Message */}
              <div>
                <label className={labelClass}>{t("contact.message")}</label>
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
                <div className="py-3 space-y-2">
                  <p className="text-white/60 text-xs font-light leading-relaxed">
                    {t("contact.errorBody")}
                  </p>
                  <a
                    href={`mailto:${t("contact.directEmail")}`}
                    className="block text-white/50 text-xs font-light hover:text-white transition-colors duration-200"
                  >
                    {t("contact.directEmail")}
                  </a>
                </div>
              )}

              {/* Reply note */}
              <p className="text-white/25 text-[10px] font-light tracking-wide">
                {t("contact.replyNote")}
              </p>

              {/* Submit */}
              <button
                type="submit"
                disabled={formState === "submitting"}
                className="w-full py-4 bg-[#E8FF00] text-black text-xs font-light tracking-[0.3em] uppercase hover:bg-white transition-colors duration-300 disabled:opacity-40"
              >
                {formState === "submitting" ? t("contact.submitting") : t("contact.submit")}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
