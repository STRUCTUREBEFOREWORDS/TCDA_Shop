import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
type Language = 'en' | 'es' | 'fr' | 'ja';
type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY';
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
};
const fallbackRates: Record<Currency, number> = {
  JPY: 1,
  USD: 0.0067,
  EUR: 0.0062,
  GBP: 0.0053,
};
export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [rates, setRates] = useState<Record<Currency, number>>(fallbackRates);
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
