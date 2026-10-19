import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { useGlobalContext } from "./Root";

type FormState = "idle" | "submitting" | "success" | "error";
type ErrorKind = "invalid" | "rate" | "server";

export function WithdrawalPage() {
  const { t } = useTranslation();
  const { language } = useGlobalContext();

  const [formState, setFormState] = useState<FormState>("idle");
  const [errorKind, setErrorKind] = useState<ErrorKind>("server");
  const [orderRef, setOrderRef] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [hp, setHp] = useState(""); // honeypot

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (formState === "submitting") return;

    setFormState("submitting");
    try {
      const res = await fetch("https://api.tcdashop.com/withdrawal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_ref: orderRef.trim(),
          email: email.trim(),
          message,
          lang: language,
          hp, // honeypot value — empty for real users
        }),
      });
      if (!res.ok) {
        setErrorKind(res.status === 422 ? "invalid" : res.status === 429 ? "rate" : "server");
        setFormState("error");
        return;
      }
      setFormState("success");
    } catch {
      setErrorKind("server");
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
        <title>{t("withdrawal.title")} | TCDA</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      {/* Page header */}
      <div className="px-8 md:px-20 max-w-4xl mx-auto py-16 border-b border-white/10">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="text-white/20 text-[10px] font-light tracking-[0.5em] uppercase mb-4"
        >
          {t("withdrawal.title")}
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-white/50 text-sm font-light leading-relaxed max-w-xl"
        >
          {t("withdrawal.intro")}
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
                {t("withdrawal.successTitle")}
              </p>
              <p className="text-white/50 text-sm font-light leading-relaxed">
                {t("withdrawal.successBody")}
              </p>
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
                  name="hp"
                  tabIndex={-1}
                  autoComplete="off"
                  value={hp}
                  onChange={(e) => setHp(e.target.value)}
                />
              </div>

              {/* Order reference */}
              <div>
                <label className={labelClass}>{t("withdrawal.orderRef")}</label>
                <input
                  type="text"
                  required
                  maxLength={8}
                  pattern="[0-9A-Fa-f]{8}"
                  autoComplete="off"
                  value={orderRef}
                  onChange={(e) => setOrderRef(e.target.value.replace(/[^0-9A-Fa-f]/g, "").slice(0, 8))}
                  placeholder={t("withdrawal.orderRefPlaceholder")}
                  className={`${inputClass} uppercase`}
                />
              </div>

              {/* Email */}
              <div>
                <label className={labelClass}>{t("withdrawal.email")}</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("withdrawal.emailPlaceholder")}
                  className={inputClass}
                />
              </div>

              {/* Message */}
              <div>
                <label className={labelClass}>{t("withdrawal.message")}</label>
                <textarea
                  rows={5}
                  maxLength={2000}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t("withdrawal.messagePlaceholder")}
                  className={`${inputClass} resize-none`}
                />
              </div>

              {/* Error state */}
              {formState === "error" && (
                <div className="py-3 space-y-2">
                  <p className="text-white/60 text-xs font-light leading-relaxed">
                    {t(`withdrawal.error.${errorKind}`)}
                  </p>
                  <a
                    href="mailto:info@tcdashop.com"
                    className="block text-white/50 text-xs font-light hover:text-white transition-colors duration-200"
                  >
                    info@tcdashop.com
                  </a>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={formState === "submitting"}
                className="w-full py-4 bg-[#E8FF00] text-black text-xs font-light tracking-[0.3em] uppercase hover:bg-white transition-colors duration-300 disabled:opacity-40"
              >
                {formState === "submitting" ? t("withdrawal.submitting") : t("withdrawal.submit")}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
