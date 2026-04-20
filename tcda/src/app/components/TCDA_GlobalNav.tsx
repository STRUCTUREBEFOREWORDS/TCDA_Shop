import { useState, useEffect } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { ShoppingBag, X, Menu } from "lucide-react";
import { useGlobalContext } from "../pages/Root";
import { TCDA_LanguageCurrencySwitcher } from "./TCDA_LanguageCurrencySwitcher";
import { useTranslation } from "react-i18next";

export function TCDA_GlobalNav() {
  const { language, currency, setLanguage, setCurrency, cartCount, setIsCartOpen } =
    useGlobalContext();
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? "bg-black/95 backdrop-blur-sm" : "bg-transparent"
        }`}
      >
        <div className="flex items-center justify-between px-6 md:px-10 h-14">
          {/* Left — Logo */}
          <Link
            to={`/${language}/`}
            className="text-white text-xs font-light tracking-[0.4em] uppercase opacity-90 hover:opacity-100 transition-opacity duration-300"
          >
            <img src="https://cdn.tcdashop.com/logo/1.png" srcSet="https://cdn.tcdashop.com/logo/1-small.png 48w, https://cdn.tcdashop.com/logo/1.png 768w" sizes="48px" alt="TCDA" className="h-6 w-auto" />
          </Link>

          {/* Center — Nav links (desktop) */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to={`/${language}/products`}
              className="text-white text-[10px] font-light tracking-[0.25em] uppercase opacity-50 hover:opacity-100 transition-opacity duration-300"
            >
              {t("nav.shop")}
            </Link>
            <Link
              to={`/${language}/collection`}
              className="text-white text-[10px] font-light tracking-[0.25em] uppercase opacity-50 hover:opacity-100 transition-opacity duration-300"
            >
              {t("nav.collection")}
            </Link>
            <Link
              to={`/${language}/about`}
              className="text-white text-[10px] font-light tracking-[0.25em] uppercase opacity-50 hover:opacity-100 transition-opacity duration-300"
            >
              {t("nav.about")}
            </Link>
            <Link
              to={`/${language}/contact`}
              className="text-white text-[10px] font-light tracking-[0.25em] uppercase opacity-50 hover:opacity-100 transition-opacity duration-300"
            >
              {t("nav.contact")}
            </Link>
          </nav>

          {/* Right — Controls */}
          <div className="flex items-center gap-5">
            {/* Lang/Currency (desktop) */}
            <div className="hidden md:flex text-white">
              <TCDA_LanguageCurrencySwitcher
                language={language}
                currency={currency}
                onLanguageChange={setLanguage}
                onCurrencyChange={setCurrency}
              />
            </div>

            {/* Cart */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative text-white opacity-70 hover:opacity-100 transition-opacity duration-300"
              aria-label="Cart"
            >
              <ShoppingBag size={16} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-white text-black text-[9px] font-light flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden text-white opacity-70 hover:opacity-100 transition-opacity duration-300"
              aria-label="Menu"
            >
              {mobileOpen ? <X size={16} strokeWidth={1.5} /> : <Menu size={16} strokeWidth={1.5} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="md:hidden bg-black/95 backdrop-blur-sm border-t border-white/10 px-6 py-6 space-y-5"
            >
              {[
                { to: `/${language}/products`, label: t("nav.shop") },
                { to: `/${language}/collection`, label: t("nav.collection") },
                { to: `/${language}/about`, label: t("nav.about") },
                { to: `/${language}/contact`, label: t("nav.contact") },
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className="block text-white text-xs font-light tracking-[0.25em] uppercase opacity-60 hover:opacity-100 transition-opacity duration-300"
                >
                  {label}
                </Link>
              ))}
              <div className="pt-4 border-t border-white/10 text-white">
                <TCDA_LanguageCurrencySwitcher
                  language={language}
                  currency={currency}
                  onLanguageChange={setLanguage}
                  onCurrencyChange={setCurrency}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
}
