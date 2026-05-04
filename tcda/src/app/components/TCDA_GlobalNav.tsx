import { useState, useEffect } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { ShoppingBag, X, Menu } from "lucide-react";
import { useGlobalContext } from "../pages/Root";
import { useTranslation } from "react-i18next";

const NAV_LINK_STYLE: React.CSSProperties = {
  fontFamily: "var(--font-body)",
  fontSize: "var(--text-caption)",
  letterSpacing: "var(--ls-nav)",
  fontWeight: "var(--weight-regular)",
  color: "var(--color-text-secondary)",
  transition: "var(--transition-base)",
  textTransform: "uppercase",
};

export function TCDA_GlobalNav() {
  const { language, cartCount, setIsCartOpen } =
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
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={scrolled ? { background: "rgba(0,0,0,0.95)", backdropFilter: "blur(4px)" } : { background: "transparent" }}
      >
        <div className="flex items-center justify-between px-6 md:px-10 h-14">
          {/* Left — Logo */}
          <Link
            to={`/${language}/`}
            className="opacity-90 hover:opacity-100 transition-opacity duration-300"
            style={{ fontFamily: "var(--font-display)", letterSpacing: "var(--ls-display)" }}
          >
            <img src="https://cdn.tcdashop.com/logo/1.png" srcSet="https://cdn.tcdashop.com/logo/1-small.png 48w, https://cdn.tcdashop.com/logo/1.png 768w" sizes="48px" alt="TCDA" className="h-6 w-auto" />
          </Link>

          {/* Center — Nav links (desktop) */}
          <nav className="hidden md:flex items-center gap-8">
            {[
              { to: `/${language}/collection`, label: t("nav.collection") },
              { to: `/${language}/lookbook`, label: "LOOKBOOK" },
              { to: `/${language}/about`, label: t("nav.about") },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                style={NAV_LINK_STYLE}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-text)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-secondary)")}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Right — Controls */}
          <div className="flex items-center gap-5">
            {/* Cart */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative transition-opacity duration-300"
              style={{ color: "var(--color-text)", opacity: 0.7 }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
              aria-label="Cart"
            >
              <ShoppingBag size={16} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 text-[9px] font-light flex items-center justify-center rounded-full"
                  style={{ background: "var(--color-text)", color: "var(--color-bg)" }}
                >
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden transition-opacity duration-300"
              style={{ color: "var(--color-text)", opacity: 0.7 }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
              aria-label="Menu"
            >
              <Menu size={16} strokeWidth={1.5} />
            </button>
          </div>
        </div>

      </motion.header>

      {/* Mobile fullscreen overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden fixed inset-0 z-[60] flex flex-col px-8"
            style={{ background: "#000000" }}
          >
            {/* Close button */}
            <div className="flex justify-end pt-5 h-14 items-center">
              <button
                onClick={() => setMobileOpen(false)}
                style={{ color: "var(--color-text)", opacity: 0.7 }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
                aria-label="Close"
              >
                <X size={16} strokeWidth={1.5} />
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex flex-col gap-6 pt-20">
              {[
                { to: `/${language}/collection`, label: t("nav.collection") },
                { to: `/${language}/about`, label: t("nav.about") },
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  style={{ ...NAV_LINK_STYLE, fontSize: "var(--text-body)", letterSpacing: "var(--ls-nav)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-text)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-secondary)")}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
