import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, Currency } from '../types';
interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  currency: Currency;
  setCurrency: (curr: Currency) => void;
  convertPrice: (price: number) => number;
  getCurrencySymbol: () => string;
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
  const [language, setLanguage] = useState<Language>('en');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [rates, setRates] = useState<Record<Currency, number>>(fallbackRates);

  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then((res) => res.json())
      .then((data) => {
        const country = data.country_code;
        const lang = data.languages?.split(',')[0]?.split('-')[0] || 'en';
        const currencyMap: Record<string, Currency> = {
          JP: 'JPY', US: 'USD', GB: 'GBP',
          KR: 'KRW', CN: 'CNY',
          DE: 'EUR', FR: 'EUR', IT: 'EUR', ES: 'EUR',
          NL: 'EUR', BE: 'EUR', AT: 'EUR', PT: 'EUR',
        };
        const langMap: Record<string, Language> = {
          ja: 'ja', en: 'en', ko: 'ko', zh: 'zh', fr: 'fr', es: 'es',
        };
        if (currencyMap[country]) setCurrency(currencyMap[country]);
        if (langMap[lang]) setLanguage(langMap[lang]);
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
    <AppContext.Provider value={{ language, setLanguage, currency, setCurrency, convertPrice, getCurrencySymbol }}>
      {children}
    </AppContext.Provider>
  );
}
export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
