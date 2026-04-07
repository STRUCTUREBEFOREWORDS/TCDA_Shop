import { Outlet } from "react-router";
import { useState, createContext, useContext } from "react";
import { Language, Currency, CartItem } from "../types";
import { TCDA_GlobalNav } from "../components/TCDA_GlobalNav";
import { CartDrawer } from "../components/CartDrawer";

export const RATES: Record<Currency, number> = {
  JPY: 1,
  USD: 0.0067,
  EUR: 0.0062,
  GBP: 0.0053,
  KRW: 8.9,
  CNY: 0.048,
};

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
}

const GlobalContext = createContext<GlobalContextType | null>(null);

export const useGlobalContext = () => {
  const context = useContext(GlobalContext);
  if (!context) throw new Error("useGlobalContext must be used within Root");
  return context;
};

export function Root() {
  const [language, setLanguage] = useState<Language>("ja");
  const [currency, setCurrency] = useState<Currency>("JPY");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

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
      }}
    >
      <div className="font-[Inter] bg-white antialiased min-h-screen">
        <TCDA_GlobalNav />
        <Outlet />
        <CartDrawer />
      </div>
    </GlobalContext.Provider>
  );
}
