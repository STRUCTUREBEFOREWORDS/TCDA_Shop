import { Outlet, useParams, useNavigate, useLocation } from "react-router";
import { useState, useEffect, useCallback, createContext, useContext, Suspense } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Helmet } from "react-helmet-async";
import i18n from "../i18n";
import { Language, Currency, CartItem, RecentProduct } from "../types";
import { TCDA_GlobalNav } from "../components/TCDA_GlobalNav";
import { CartDrawer } from "../components/CartDrawer";
import { Footer } from "../components/Footer";
import { CookieBanner, STORAGE_KEY, ConsentValue } from "../components/CookieBanner";
import { trackPageView } from "../utils/analytics";
import { currencyToApplyOnDetection, isCurrency } from "../../utils/currencyResolver";

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
  INR: 0.55,
};

export const SUPPORTED_LANGS: Language[] = ["en", "ja", "fr", "es", "ko", "zh", "ar", "pt", "de", "it", "hi"];

const BASE_URL = "https://tcdashop.com";
const HREFLANG_LANGS: { lang: string; hreflang: string }[] = [
  { lang: "ja", hreflang: "ja" },
  { lang: "en", hreflang: "en" },
  { lang: "fr", hreflang: "fr" },
  { lang: "es", hreflang: "es" },
  { lang: "ko", hreflang: "ko" },
  { lang: "zh", hreflang: "zh" },
  { lang: "ar", hreflang: "ar" },
  { lang: "pt", hreflang: "pt" },
  { lang: "de", hreflang: "de" },
  { lang: "it", hreflang: "it" },
  { lang: "hi", hreflang: "hi" },
];

/** Injects hreflang <link> tags for every page automatically via Root. */
function HreflangHelmet({ pathname }: { pathname: string }) {
  // Strip the leading /:lang segment to get the path suffix (e.g. /ja/products → /products)
  const suffix = pathname.replace(/^\/[a-z]{2}(\/|$)/, "/") || "/";
  const pathSuffix = suffix === "/" ? "/" : suffix.replace(/\/$/, "");
  // Self-referencing canonical: current language + path, with trailing slash
  const selfUrl = pathname.replace(/\/?$/, "/");

  return (
    <Helmet>
      {HREFLANG_LANGS.map(({ lang, hreflang }) => (
        <link
          key={hreflang}
          rel="alternate"
          hrefLang={hreflang}
          href={`${BASE_URL}/${lang}${pathSuffix === "/" ? "/" : pathSuffix}`}
        />
      ))}
      <link
        rel="alternate"
        hrefLang="x-default"
        href={`${BASE_URL}/en${pathSuffix === "/" ? "/" : pathSuffix}`}
      />
      <link
        rel="canonical"
        href={`${BASE_URL}${selfUrl}`}
      />
    </Helmet>
  );
}

const CURRENCY_STORAGE_KEY = "tcda_currency_selected";

/** A currency the visitor chose explicitly (Footer switcher). Invalid or unreadable values are ignored. */
function readStoredCurrency(): Currency | null {
  try {
    const v = localStorage.getItem(CURRENCY_STORAGE_KEY);
    return isCurrency(v) ? v : null;
  } catch {
    return null;
  }
}

const EU_COUNTRY_CODES = new Set([
  "AT","BE","BG","CY","CZ","DE","DK","EE","ES","FI","FR","GB",
  "GR","HR","HU","IE","IT","LT","LU","LV","MT","NL","PL","PT",
  "RO","SE","SI","SK","NO","IS","LI","CH",
]);

function initClarity() {
  if ((window as any).clarity) return;
  (function(c: any, l: any, a: string, r: string, i: string) {
    c[a] = c[a] || function() { (c[a].q = c[a].q || []).push(arguments); };
    const t = l.createElement(r) as HTMLScriptElement;
    t.async = true;
    t.src = "https://www.clarity.ms/tag/" + i;
    const y = l.getElementsByTagName(r)[0];
    y.parentNode!.insertBefore(t, y);
  })(window, document, "clarity", "script", "wbxtdqbpsz");
}

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
  clearCart: () => void;
  addRecentProduct: (product: RecentProduct) => void;
  removeRecentProduct: (id: string) => void;
}

const CART_KEY = "tcda_cart";
const CART_TTL_MS = 14 * 24 * 60 * 60 * 1000;

function isValidCartItem(i: unknown): i is CartItem {
  if (!i || typeof i !== "object") return false;
  const c = i as Record<string, unknown>;
  return (
    typeof c.artworkId === "string" && c.artworkId !== "" &&
    typeof c.artworkName === "string" &&
    typeof c.price === "number" && Number.isFinite(c.price) &&
    typeof c.price_jpy === "number" && Number.isFinite(c.price_jpy) && c.price_jpy >= 0 &&
    typeof c.currency === "string" &&
    typeof c.size === "string" && c.size !== "" &&
    typeof c.imageUrl === "string" &&
    typeof c.quantity === "number" && Number.isInteger(c.quantity) && c.quantity > 0
  );
}

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    if (!data || typeof data.savedAt !== "number" || !Array.isArray(data.items)) return [];
    if (Date.now() - data.savedAt > CART_TTL_MS) return [];
    return data.items.filter(isValidCartItem);
  } catch {
    return [];
  }
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

  const [currency, setCurrencyState] = useState<Currency>(() => readStoredCurrency() ?? "JPY");
  // Explicit choice (Footer switcher): update state and remember it. Auto-detection uses setCurrencyState
  // directly so that it is never saved as if the visitor had chosen it.
  const setCurrency = useCallback((curr: Currency) => {
    setCurrencyState(curr);
    try {
      localStorage.setItem(CURRENCY_STORAGE_KEY, curr);
    } catch {
      /* storage unavailable: ignore */
    }
  }, []);
  const [rates, setRates] = useState<Record<Currency, number>>(RATES);
  const [cartItems, setCartItems] = useState<CartItem[]>(loadCart);
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

  const removeRecentProduct = (id: string) => {
    setRecentProducts((prev) => {
      const next = prev.filter((p) => p.id !== id);
      try { localStorage.setItem("tcda_recent_products", JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  };

  // Restore previous consent decision into gtag on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ConsentValue | null;
    if (stored && typeof (window as Window & { gtag?: Function }).gtag === "function") {
      (window as unknown as { gtag: Function }).gtag("consent", "update", {
        analytics_storage: stored,
        ad_storage: stored,
        ad_user_data: stored,
        ad_personalization: stored,
      });
    }
  }, []);

  // EU圏ユーザーがconsentを付与した時（新規 or localStorage復元）にClarity起動
  useEffect(() => {
    if (consent === "granted") {
      initClarity();
      (window as any).clarity("consentv2", { ad_Storage: "denied", analytics_Storage: "granted" });
    }
  }, [consent]);

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
            INR: data.rates.INR ?? RATES.INR,
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
      document.documentElement.lang = lang;
    }
  }, [lang]);

  useEffect(() => {
    trackPageView(language);
  }, [location.pathname]);

  useEffect(() => {
    // A currency the visitor chose always wins: the stored choice is re-read each time a detection result
    // is applied (the visitor may click the switcher while /country is still pending).
    const applyDetected = (country: string | null) => {
      const next = currencyToApplyOnDetection({ stored: readStoredCurrency(), country, language });
      if (next) setCurrencyState(next);
    };
    const cached = sessionStorage.getItem("tcda_country");
    if (cached) {
      setCountryCode(cached);
      applyDetected(cached);
      if (!EU_COUNTRY_CODES.has(cached)) initClarity();
      return;
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    fetch("https://api.tcdashop.com/country", { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        clearTimeout(timeout);
        const code = data.country ?? "JP";
        setCountryCode(code);
        applyDetected(code);
        sessionStorage.setItem("tcda_country", code);
        if (!EU_COUNTRY_CODES.has(code)) initClarity();
      })
      .catch(() => {
        clearTimeout(timeout);
        // Country detection failed: fall back to the site language (then JPY).
        applyDetected(null);
      });
  }, []);

  // Auto-detect language on first visit via Accept-Language header (server-side read)
  useEffect(() => {
    const hasPreference = localStorage.getItem("tcda_lang_selected");
    if (hasPreference) return;
    // URL already carries a supported language prefix: respect it, no detection or redirect
    const firstSegment = window.location.pathname.split("/")[1];
    if (SUPPORTED_LANGS.includes(firstSegment as Language)) return;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    fetch("https://api.tcdashop.com/detect-language", { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        clearTimeout(timeout);
        const detectedLang = data.lang as Language;
        if (!SUPPORTED_LANGS.includes(detectedLang)) return;
        localStorage.setItem("tcda_lang_selected", detectedLang);
        const currentPath = window.location.pathname;
        const newPath = currentPath.replace(
          /^\/(ja|en|fr|es|ko|zh|ar|pt|de|it|hi)(\/|$)/,
          `/${detectedLang}$2`
        );
        if (newPath !== currentPath) {
          window.location.replace(newPath);
        }
      })
      .catch(() => { clearTimeout(timeout); });
  }, []);

  const setLanguage = (newLang: Language) => {
    localStorage.setItem("tcda_lang_selected", newLang);
    const newPath = location.pathname.replace(`/${language}`, `/${newLang}`);
    i18n.changeLanguage(newLang);
    navigate(newPath);
  };

  useEffect(() => {
    try {
      if (cartItems.length === 0) {
        localStorage.removeItem(CART_KEY);
      } else {
        localStorage.setItem(CART_KEY, JSON.stringify({ savedAt: Date.now(), items: cartItems }));
      }
    } catch { /* ignore */ }
  }, [cartItems]);

  const clearCart = () => {
    setCartItems([]);
    try { localStorage.removeItem(CART_KEY); } catch { /* ignore */ }
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
        clearCart,
        recentProducts,
        addRecentProduct,
        removeRecentProduct,
      }}
    >
      <HreflangHelmet pathname={location.pathname} />
      <div className="font-[Inter] bg-black antialiased min-h-screen">
        <TCDA_GlobalNav />
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            style={{ background: "#000", minHeight: "100vh" }}
          >
            <Suspense fallback={<div style={{ background: "#000", minHeight: "100vh" }} />}>
              <Outlet />
            </Suspense>
          </motion.div>
        </AnimatePresence>
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
