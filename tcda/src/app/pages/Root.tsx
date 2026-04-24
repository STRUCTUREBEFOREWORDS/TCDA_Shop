import { Outlet, useParams, useNavigate, useLocation } from "react-router";
import { useState, useEffect, createContext, useContext } from "react";
import { AnimatePresence } from "motion/react";
import { Helmet } from "react-helmet-async";
import i18n from "../i18n";
import { Language, Currency, CartItem, RecentProduct } from "../types";
import { TCDA_GlobalNav } from "../components/TCDA_GlobalNav";
import { CartDrawer } from "../components/CartDrawer";
import { Footer } from "../components/Footer";
import { CookieBanner, STORAGE_KEY, ConsentValue } from "../components/CookieBanner";

/** Fallback rates used before live rates arrive from the backend */
export const RATES: Record<Currency, number> = {
  JPY: 1,
  USD: 0.0067,
  EUR: 0.0062,
  GBP: 0.0053,
  KRW: 8.9,
  CNY: 0.048,
  AUD: 0.0104,
  AED: 0.0246,
  SGD: 0.0090,
  BRL: 0.035,
  CAD: 0.0092,
};

export const SUPPORTED_LANGS: Language[] = ["en", "ja", "fr", "es", "ko", "zh", "ar", "pt", "de", "it"];

const BASE_URL = "https://tcdashop.com";
const HREFLANG_LANGS: { lang: string; hreflang: string }[] = [
  { lang: "ja", hreflang: "ja" },
  { lang: "en", hreflang: "en" },
  { lang: "fr", hreflang: "fr" },
  { lang: "es", hreflang: "es" },
  { lang: "ko", hreflang: "ko" },
  { lang: "zh", hreflang: "zh" },
];

/** Injects hreflang <link> tags for every page automatically via Root. */
function HreflangHelmet({ pathname }: { pathname: string }) {
  // Strip the leading /:lang segment → keep the rest (e.g. /ja/products → /products)
  const suffix = pathname.replace(/^\/[a-z]{2}(\/|$)/, "/") || "/";
  const canonical = suffix === "/" ? suffix : suffix.replace(/\/$/, "");

  return (
    <Helmet>
      {HREFLANG_LANGS.map(({ lang, hreflang }) => (
        <link
          key={hreflang}
          rel="alternate"
          hrefLang={hreflang}
          href={`${BASE_URL}/${lang}${canonical === "/" ? "/" : canonical}`}
        />
      ))}
      <link
        rel="alternate"
        hrefLang="x-default"
        href={`${BASE_URL}/en${canonical === "/" ? "/" : canonical}`}
      />
      <link
        rel="canonical"
        href={`${BASE_URL}/en${canonical === "/" ? "/" : canonical}`}
      />
    </Helmet>
  );
}

const EU_COUNTRY_CODES = new Set([
  "AT","BE","BG","CY","CZ","DE","DK","EE","ES","FI","FR","GB",
  "GR","HR","HU","IE","IT","LT","LU","LV","MT","NL","PL","PT",
  "RO","SE","SI","SK",
]);

interface GlobalContextType {
  language: Language;
  currency: Currency;
  rates: typeof RATES;
  cartItems: CartItem[];
  cartCount: number;
  setLanguage: (lang: Language) => void;
  setCurrency: (curr: Currency) => void;
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (artworkId: string, size: string) => void;
  updateQuantity: (artworkId: string, size: string, quantity: number) => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  countryCode: string;
  recentProducts: RecentProduct[];
  addRecentProduct: (product: RecentProduct) => void;
}

const GlobalContext = createContext<GlobalContextType | null>(null);

export const useGlobalContext = () => {
  const context = useContext(GlobalContext);
  if (!context) throw new Error("useGlobalContext must be used within Root");
  return context;
};

export function Root() {
  const { lang } = useParams<{ lang: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const language: Language = SUPPORTED_LANGS.includes(lang as Language)
    ? (lang as Language)
    : "en";

  const [currency, setCurrency] = useState<Currency>("JPY");
  const [rates, setRates] = useState<Record<Currency, number>>(RATES);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [countryCode, setCountryCode] = useState<string>("JP");
  const [consent, setConsent] = useState<ConsentValue | null>(
    () => (localStorage.getItem(STORAGE_KEY) as ConsentValue | null)
  );
  const [recentProducts, setRecentProducts] = useState<RecentProduct[]>(() => {
    try {
      const stored = localStorage.getItem("tcda_recent_products");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const addRecentProduct = (product: RecentProduct) => {
    setRecentProducts((prev) => {
      const filtered = prev.filter((p) => p.id !== product.id);
      const next = [product, ...filtered].slice(0, 5);
      localStorage.setItem("tcda_recent_products", JSON.stringify(next));
      return next;
    });
  };

  // Restore previous consent decision into gtag on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ConsentValue | null;
    if (stored && typeof (window as Window & { gtag?: Function }).gtag === "function") {
      (window as Window & { gtag: Function }).gtag("consent", "update", {
        analytics_storage: stored,
      });
    }
  }, []);

  // Fetch live exchange rates from backend (updated daily via frankfurter.app)
  useEffect(() => {
    fetch("https://api.tcdashop.com/exchange-rates")
      .then((r) => r.json())
      .then((data) => {
        if (data.rates) {
          setRates({
            JPY: 1,
            USD: data.rates.USD ?? RATES.USD,
            EUR: data.rates.EUR ?? RATES.EUR,
            GBP: data.rates.GBP ?? RATES.GBP,
            KRW: data.rates.KRW ?? RATES.KRW,
            CNY: data.rates.CNY ?? RATES.CNY,
            AUD: data.rates.AUD ?? RATES.AUD,
            AED: data.rates.AED ?? RATES.AED,
            SGD: data.rates.SGD ?? RATES.SGD,
            BRL: data.rates.BRL ?? RATES.BRL,
            CAD: data.rates.CAD ?? RATES.CAD,
          });
        }
      })
      .catch(() => {}); // keep fallback RATES on error
  }, []);

  // Redirect if lang segment is invalid; sync i18next language
  useEffect(() => {
    if (!SUPPORTED_LANGS.includes(lang as Language)) {
      navigate("/en/", { replace: true });
    } else {
      i18n.changeLanguage(lang);
    }
  }, [lang]);

  useEffect(() => {
    const cached = sessionStorage.getItem("tcda_country");
    if (cached) {
      const currencyMap: Record<string, Currency> = {
        JP: "JPY", US: "USD", GB: "GBP",
        KR: "KRW", CN: "CNY",
        DE: "EUR", FR: "EUR", IT: "EUR", ES: "EUR",
      };
      setCountryCode(cached);
      if (currencyMap[cached]) setCurrency(currencyMap[cached]);
      return;
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    fetch("https://api.tcdashop.com/country", { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        clearTimeout(timeout);
        const code = data.country ?? "JP";
        const currencyMap: Record<string, Currency> = {
          JP: "JPY", US: "USD", GB: "GBP",
          KR: "KRW", CN: "CNY",
          DE: "EUR", FR: "EUR", IT: "EUR", ES: "EUR",
        };
        setCountryCode(code);
        if (currencyMap[code]) setCurrency(currencyMap[code]);
        sessionStorage.setItem("tcda_country", code);
      })
      .catch(() => { clearTimeout(timeout); });
  }, []);

  const setLanguage = (newLang: Language) => {
    const newPath = location.pathname.replace(`/${language}`, `/${newLang}`);
    i18n.changeLanguage(newLang);
    navigate(newPath);
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = (item: Omit<CartItem, "quantity">) => {
    setCartItems((prev: CartItem[]) => {
      const existing = prev.find(
        (i) => i.artworkId === item.artworkId && i.size === item.size
      );
      if (existing) {
        return prev.map((i) =>
          i.artworkId === item.artworkId && i.size === item.size
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (artworkId: string, size: string) => {
    setCartItems((prev: CartItem[]) =>
      prev.filter((i) => !(i.artworkId === artworkId && i.size === size))
    );
  };

  const updateQuantity = (artworkId: string, size: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(artworkId, size);
      return;
    }
    setCartItems((prev: CartItem[]) =>
      prev.map((i) =>
        i.artworkId === artworkId && i.size === size ? { ...i, quantity } : i
      )
    );
  };

  return (
    <GlobalContext.Provider
      value={{
        language,
        currency,
        rates,
        cartItems,
        cartCount,
        setLanguage,
        setCurrency,
        addToCart,
        removeFromCart,
        updateQuantity,
        isCartOpen,
        setIsCartOpen,
        countryCode,
        recentProducts,
        addRecentProduct,
      }}
    >
      <HreflangHelmet pathname={location.pathname} />
      <div className="font-[Inter] bg-white antialiased min-h-screen">
        <TCDA_GlobalNav />
        <Outlet />
        <Footer />
        <CartDrawer />
        <AnimatePresence>
          {EU_COUNTRY_CODES.has(countryCode) && consent === null && (
            <CookieBanner onConsent={setConsent} />
          )}
        </AnimatePresence>
      </div>
    </GlobalContext.Provider>
  );
}
