import { Language, Currency } from "../types";
import gbFlag from "../../assets/flags/gb.svg";
import jpFlag from "../../assets/flags/jp.svg";
import frFlag from "../../assets/flags/fr.svg";
import esFlag from "../../assets/flags/es.svg";
import krFlag from "../../assets/flags/kr.svg";
import cnFlag from "../../assets/flags/cn.svg";
import arFlag from "../../assets/flags/ar.svg";
import ptFlag from "../../assets/flags/pt.svg";
import deFlag from "../../assets/flags/de.svg";
import itFlag from "../../assets/flags/it.svg";

export type { Language, Currency };

interface Props {
  language: Language;
  currency: Currency;
  onLanguageChange: (lang: Language) => void;
  onCurrencyChange: (curr: Currency) => void;
  mobile?: boolean;
}

const LANGUAGES: { code: Language; flag: string }[] = [
  { code: "en", flag: gbFlag },
  { code: "ja", flag: jpFlag },
  { code: "fr", flag: frFlag },
  { code: "es", flag: esFlag },
  { code: "ko", flag: krFlag },
  { code: "zh", flag: cnFlag },
  { code: "ar", flag: arFlag },
  { code: "pt", flag: ptFlag },
  { code: "de", flag: deFlag },
  { code: "it", flag: itFlag },
];

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  JPY: "¥",
  USD: "$",
  EUR: "€",
  GBP: "£",
  KRW: "₩",
  CNY: "¥",
  AUD: "A$",
  AED: "AED",
  SGD: "S$",
  BRL: "R$",
  CAD: "C$",
};

const CURRENCIES: Currency[] = ["JPY", "USD", "EUR", "GBP", "KRW", "CNY", "AUD", "AED", "SGD", "BRL", "CAD"];

export function TCDA_LanguageCurrencySwitcher({
  language,
  currency,
  onLanguageChange,
  onCurrencyChange,
  mobile = false,
}: Props) {
  if (mobile) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3">
          {LANGUAGES.map(({ code, flag }) => (
            <button
              key={code}
              onClick={() => onLanguageChange(code)}
              title={code.toUpperCase()}
              className={`transition-opacity duration-300 ${
                language === code ? "opacity-100 underline decoration-[#E8FF00] underline-offset-4" : "opacity-30 hover:opacity-60"
              }`}
            >
              <img src={flag} alt={code} className="w-6 h-auto" />
            </button>
          ))}
        </div>
        <div className="border-t border-white/10 pt-4 flex flex-wrap gap-3">
          {CURRENCIES.map((curr) => (
            <button
              key={curr}
              onClick={() => onCurrencyChange(curr)}
              title={curr}
              className={`text-[13px] font-light transition-opacity duration-300 ${
                currency === curr ? "opacity-100 text-[#E8FF00]" : "opacity-30 hover:opacity-60"
              }`}
            >
              {CURRENCY_SYMBOLS[curr]}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
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
      <div className="flex flex-wrap items-center gap-2">
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
