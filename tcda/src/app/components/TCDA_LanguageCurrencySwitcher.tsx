import { Language, Currency } from "../types";
import gbFlag from "../../assets/flags/gb.svg";
import jpFlag from "../../assets/flags/jp.svg";
import frFlag from "../../assets/flags/fr.svg";
import esFlag from "../../assets/flags/es.svg";
import krFlag from "../../assets/flags/kr.svg";
import cnFlag from "../../assets/flags/cn.svg";

export type { Language, Currency };

interface Props {
  language: Language;
  currency: Currency;
  onLanguageChange: (lang: Language) => void;
  onCurrencyChange: (curr: Currency) => void;
}

const LANGUAGES: { code: Language; flag: string }[] = [
  { code: "en", flag: gbFlag },
  { code: "ja", flag: jpFlag },
  { code: "fr", flag: frFlag },
  { code: "es", flag: esFlag },
  { code: "ko", flag: krFlag },
  { code: "zh", flag: cnFlag },
];

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  JPY: "¥",
  USD: "$",
  EUR: "€",
  GBP: "£",
  KRW: "₩",
  CNY: "¥",
};

const CURRENCIES: Currency[] = ["JPY", "USD", "EUR", "GBP", "KRW", "CNY"];

export function TCDA_LanguageCurrencySwitcher({
  language,
  currency,
  onLanguageChange,
  onCurrencyChange,
}: Props) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        {LANGUAGES.map(({ code, flag }) => (
          <button
            key={code}
            onClick={() => onLanguageChange(code)}
            title={code.toUpperCase()}
            className={`transition-opacity duration-300 ${
              language === code ? "opacity-100" : "opacity-30 hover:opacity-60"
            }`}
          >
            <img src={flag} alt={code} className="w-5 h-auto" />
          </button>
        ))}
      </div>
      <div className="w-px h-3 bg-current opacity-20" />
      <div className="flex items-center gap-2">
        {CURRENCIES.map((curr) => (
          <button
            key={curr}
            onClick={() => onCurrencyChange(curr)}
            title={curr}
            className={`text-[13px] font-light transition-opacity duration-300 ${
              currency === curr ? "opacity-100" : "opacity-30 hover:opacity-60"
            }`}
          >
            {CURRENCY_SYMBOLS[curr]}
          </button>
        ))}
      </div>
    </div>
  );
}
