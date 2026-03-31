import { createContext, useContext, useState, ReactNode } from 'react';

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

const currencyRates: Record<Currency, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.5,
};

const currencySymbols: Record<Currency, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const [currency, setCurrency] = useState<Currency>('USD');

  const convertPrice = (price: number): number => {
    const converted = price * currencyRates[currency];
    return currency === 'JPY' ? Math.round(converted) : Math.round(converted * 100) / 100;
  };

  const getCurrencySymbol = (): string => {
    return currencySymbols[currency];
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        currency,
        setCurrency,
        convertPrice,
        getCurrencySymbol,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
