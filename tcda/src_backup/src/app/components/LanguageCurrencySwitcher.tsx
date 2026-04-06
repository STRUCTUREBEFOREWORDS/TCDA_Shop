import { motion } from "motion/react";

export type Language = "en" | "ja" | "fr";
export type Currency = "USD" | "JPY" | "EUR";

interface LanguageCurrencySwitcherProps {
  language: Language;
  currency: Currency;
  onLanguageChange: (lang: Language) => void;
  onCurrencyChange: (curr: Currency) => void;
}

export function LanguageCurrencySwitcher({
  language,
  currency,
  onLanguageChange,
  onCurrencyChange,
}: LanguageCurrencySwitcherProps) {
  const languages: { code: Language; label: string }[] = [
    { code: "en", label: "EN" },
    { code: "ja", label: "日本語" },
    { code: "fr", label: "FR" },
  ];

  const currencies: Currency[] = ["USD", "JPY", "EUR"];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="fixed top-8 right-8 z-50 flex items-center gap-8"
    >
      {/* Language Switcher */}
      <div className="flex items-center gap-3">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => onLanguageChange(lang.code)}
            className={`text-xs font-light tracking-widest uppercase transition-all duration-300 ${
              language === lang.code
                ? "text-white opacity-100"
                : "text-white/40 hover:text-white/70"
            }`}
          >
            {lang.label}
          </button>
        ))}
      </div>

      <div className="w-px h-4 bg-white/20" />

      {/* Currency Switcher */}
      <div className="flex items-center gap-3">
        {currencies.map((curr) => (
          <button
            key={curr}
            onClick={() => onCurrencyChange(curr)}
            className={`text-xs font-light tracking-widest uppercase transition-all duration-300 ${
              currency === curr
                ? "text-white opacity-100"
                : "text-white/40 hover:text-white/70"
            }`}
          >
            {curr}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
