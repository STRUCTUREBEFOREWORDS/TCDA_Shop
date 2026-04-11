import { Outlet, useParams, useNavigate, useLocation } from "react-router";
import { useState, useEffect, createContext, useContext } from "react";
import i18n from "../i18n";
import { Language, Currency, CartItem } from "../types";
import { TCDA_GlobalNav } from "../components/TCDA_GlobalNav";
import { CartDrawer } from "../components/CartDrawer";
import { Footer } from "../components/Footer";

export const RATES: Record<Currency, number> = {
  JPY: 1,
  USD: 0.0067,
  EUR: 0.0062,
  GBP: 0.0053,
  KRW: 8.9,
  CNY: 0.048,
};

export const SUPPORTED_LANGS: Language[] = ["en", "ja", "fr", "es", "ko", "zh"];

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
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [countryCode, setCountryCode] = useState<string>("JP");

  // Redirect if lang segment is invalid; sync i18next language
  useEffect(() => {
    if (!SUPPORTED_LANGS.includes(lang as Language)) {
      navigate("/en/", { replace: true });
    } else {
      i18n.changeLanguage(lang);
    }
  }, [lang]);

  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then((res) => res.json())
      .then((data) => {
        if (data.country_code) setCountryCode(data.country_code);
        const currencyMap: Record<string, Currency> = {
          JP: "JPY", US: "USD", GB: "GBP",
          KR: "KRW", CN: "CNY",
          DE: "EUR", FR: "EUR", IT: "EUR", ES: "EUR",
        };
        if (currencyMap[data.country_code]) setCurrency(currencyMap[data.country_code]);
      })
      .catch(() => {});
  }, []);

  const setLanguage = (newLang: Language) => {
    // Replace /:lang segment in current path
    const newPath = location.pathname.replace(`/${language}`, `/${newLang}`);
    navigate(newPath, { replace: true });
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
        rates: RATES,
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
      }}
    >
      <div className="font-[Inter] bg-white antialiased min-h-screen">
        <TCDA_GlobalNav />
        <Outlet />
        <Footer />
        <CartDrawer />
      </div>
    </GlobalContext.Provider>
  );
}
