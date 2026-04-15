import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { useGlobalContext } from "../pages/Root";

type ConsentValue = "granted" | "denied";

const STORAGE_KEY = "consent_analytics";

function updateGtag(value: ConsentValue) {
  if (typeof window !== "undefined" && typeof (window as Window & { gtag?: Function }).gtag === "function") {
    (window as Window & { gtag: Function }).gtag("consent", "update", {
      analytics_storage: value,
    });
  }
}

interface Props {
  onConsent: (value: ConsentValue) => void;
}

export function CookieBanner({ onConsent }: Props) {
  const { t } = useTranslation();
  const { language } = useGlobalContext();

  function handle(value: ConsentValue) {
    localStorage.setItem(STORAGE_KEY, value);
    updateGtag(value);
    onConsent(value);
  }

  return (
    <motion.div
      initial={{ y: 24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 24, opacity: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="fixed bottom-0 left-0 right-0 z-[100] bg-black/95 backdrop-blur-sm border-t border-white/10"
    >
      <div className="max-w-4xl mx-auto px-6 md:px-10 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="flex-1 text-white/60 text-[11px] font-light leading-relaxed">
          {t("cookie.message")}{" "}
          <Link
            to={`/${language}/privacy`}
            className="text-white/40 underline underline-offset-2 hover:text-white/70 transition-colors duration-200"
          >
            {t("cookie.learnMore")}
          </Link>
        </p>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => handle("denied")}
            className="text-white/40 text-[10px] font-light tracking-[0.2em] uppercase hover:text-white/70 transition-colors duration-200 py-2 px-4 border border-white/15 hover:border-white/30"
          >
            {t("cookie.decline")}
          </button>
          <button
            onClick={() => handle("granted")}
            className="bg-white text-black text-[10px] font-light tracking-[0.2em] uppercase hover:bg-white/85 transition-colors duration-200 py-2 px-4"
          >
            {t("cookie.accept")}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export { STORAGE_KEY };
export type { ConsentValue };
