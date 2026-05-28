import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, Currency } from '../types';

const SUPPORTED_LANGS: Language[] = ['en', 'ja', 'fr', 'es', 'ko', 'zh', 'ar', 'pt', 'de', 'it', 'hi'];
const CURRENCY_MAP: Record<string, Currency> = {
  JP: 'JPY', US: 'USD', GB: 'GBP',
  KR: 'KRW', CN: 'CNY',
  DE: 'EUR', FR: 'EUR', IT: 'EUR', ES: 'EUR',
  NL: 'EUR', BE: 'EUR', AT: 'EUR', PT: 'EUR',
};

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  currency: Currency;
  setCurrency: (curr: Currency) => void;
  convertPrice: (price: number) => number;
  getCurrencySymbol: () => string;
  countryCode: string;
}
const AppContext = createContext<AppContextType | undefined>(undefined);
const currencySymbols: Record<Currency, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  KRW: '₩',
  CNY: 'CN¥',
};
const fallbackRates: Record<Currency, number> = {
  JPY: 1,
  USD: 0.0067,
  EUR: 0.0062,
  GBP: 0.0053,
  KRW: 9.1,
  CNY: 0.048,
};
export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const stored = localStorage.getItem('tcda_lang_selected') as Language;
    if (stored && SUPPORTED_LANGS.includes(stored)) return stored;
    const match = window.location.pathname.match(/^\/(ja|en|fr|es|ko|zh|ar|pt|de|it|hi)(\/|$)/);
    return (match?.[1] as Language) ?? 'en';
  });

  const [currency, setCurrency] = useState<Currency>(() => {
    const country = sessionStorage.getItem('tcda_country');
    return (country && CURRENCY_MAP[country]) ? CURRENCY_MAP[country] : 'USD';
  });

  const [rates, setRates] = useState<Record<Currency, number>>(fallbackRates);
  const [countryCode, setCountryCode] = useState<string>(() =>
    sessionStorage.getItem('tcda_country') ?? 'US'
  );

  // Currency detection: use sessionStorage set by Root.tsx, else fetch /country once
  useEffect(() => {
    const cached = sessionStorage.getItem('tcda_country');
    if (cached) {
      if (CURRENCY_MAP[cached]) setCurrency(CURRENCY_MAP[cached]);
      setCountryCode(cached);
      return;
    }
    fetch('https://api.tcdashop.com/country')
      .then((r) => r.json())
      .then((data) => {
        const country = data.country ?? 'US';
        sessionStorage.setItem('tcda_country', country);
        setCountryCode(country);
        if (CURRENCY_MAP[country]) setCurrency(CURRENCY_MAP[country]);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch('https://api.tcdashop.com/exchange-rates')
      .then((res) => res.json())
      .then((data) => {
        if (data.rates) {
          setRates({ JPY: 1, ...data.rates });
        }
      })
      .catch(() => {});
  }, []);
  const convertPrice = (price: number): number => {
    const converted = price * (rates[currency] ?? fallbackRates[currency]);
    return currency === 'JPY' ? Math.round(converted) : Math.round(converted * 100) / 100;
  };
  const getCurrencySymbol = (): string => currencySymbols[currency];
  return (
    <AppContext.Provider value={{ language, setLanguage, currency, setCurrency, convertPrice, getCurrencySymbol, countryCode }}>
      {children}
    </AppContext.Provider>
  );
}
export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
