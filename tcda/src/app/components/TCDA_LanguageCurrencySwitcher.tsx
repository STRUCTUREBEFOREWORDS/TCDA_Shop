import { Language, Currency } from "../types";

export type { Language, Currency };

interface Props {
  language: Language;
  currency: Currency;
  onLanguageChange: (lang: Language) => void;
  onCurrencyChange: (curr: Currency) => void;
}

export function TCDA_LanguageCurrencySwitcher({
  language,
  currency,
  onLanguageChange,
  onCurrencyChange,
}: Props) {
  const languages: { code: Language; label: string }[] = [
    { code: "en", label: "EN" },
    { code: "ja", label: "JA" },
    { code: "fr", label: "FR" },
    { code: "es", label: "ES" },
    { code: "ko", label: "KO" },
    { code: "zh", label: "ZH" },
  ];

  const currencies: Currency[] = ["JPY", "USD", "EUR", "GBP", "KRW", "CNY"];

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-1.5">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => onLanguageChange(lang.code)}
            className={`text-[10px] font-light tracking-widest uppercase transition-opacity duration-300 ${
              language === lang.code ? "opacity-100" : "opacity-30 hover:opacity-60"
            }`}
          >
            {lang.label}
          </button>
        ))}
      </div>
      <div className="w-px h-3 bg-current opacity-20" />
      <div className="flex items-center gap-1.5">
        {currencies.map((curr) => (
          <button
            key={curr}
            onClick={() => onCurrencyChange(curr)}
            className={`text-[10px] font-light tracking-widest uppercase transition-opacity duration-300 ${
              currency === curr ? "opacity-100" : "opacity-30 hover:opacity-60"
            }`}
          >
            {curr}
          </button>
        ))}
      </div>
    </div>
  );
}
