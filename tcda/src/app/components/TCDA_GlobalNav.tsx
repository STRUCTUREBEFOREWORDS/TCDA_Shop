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

const CATEGORY_FILTERS = [
  { key: "new", label: "NEW" },
  { key: "tshirt", label: "TOPS" },
  { key: "jacket", label: "OUTERWEAR" },
  { key: "sweatshirt", label: "SWEATSHIRTS" },
  { key: "bottoms", label: "BOTTOMS" },
  { key: "accessories", label: "ACCESSORIES" },
];

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

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

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
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden fixed inset-0 z-[60] flex flex-col overflow-y-auto"
            style={{ background: "var(--color-bg)" }}
          >
            {/* Header row */}
            <div className="flex items-center justify-between px-6 h-14 flex-shrink-0">
              <Link
                to={`/${language}/`}
                onClick={() => setMobileOpen(false)}
              >
                <img src="https://cdn.tcdashop.com/logo/1.png" alt="TCDA" className="h-6 w-auto opacity-90" />
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                style={{ color: "var(--color-text)", opacity: 0.7 }}
                aria-label="Close"
              >
                <X size={16} strokeWidth={1.5} />
              </button>
            </div>

            {/* Brand visual */}
            <div style={{ padding: "0 24px 28px", flexShrink: 0 }}>
              <img
                src="https://cdn.tcdashop.com/look/001.webp"
                alt="TCDA"
                style={{ width: "100%", height: "200px", objectFit: "cover", objectPosition: "center top", display: "block" }}
              />
            </div>

            {/* Nav items */}
            <nav style={{ padding: "0 24px 40px", display: "flex", flexDirection: "column" }}>

              {/* COLLECTION + sub-categories */}
              <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "20px", paddingBottom: "16px" }}>
                <Link
                  to={`/${language}/collection`}
                  onClick={() => setMobileOpen(false)}
                  style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(28px, 7vw, 36px)", fontWeight: 400, letterSpacing: "0.04em", color: "var(--color-text)", display: "block", marginBottom: "14px" }}
                >
                  {t("nav.collection")}
                </Link>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 20px" }}>
                  {CATEGORY_FILTERS.map(({ key, label }) => (
                    <Link
                      key={key}
                      to={`/${language}/collection?category=${key}`}
                      onClick={() => setMobileOpen(false)}
                      style={{ fontFamily: "var(--font-body)", fontSize: "10px", letterSpacing: "0.22em", color: "var(--color-text-tertiary)", textTransform: "uppercase" }}
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              </div>

              <Link
                to={`/${language}/lookbook`}
                onClick={() => setMobileOpen(false)}
                style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(28px, 7vw, 36px)", fontWeight: 400, letterSpacing: "0.04em", color: "var(--color-text)", borderTop: "1px solid var(--color-border)", padding: "20px 0" }}
              >
                LOOKBOOK
              </Link>

              <Link
                to={`/${language}/about`}
                onClick={() => setMobileOpen(false)}
                style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(28px, 7vw, 36px)", fontWeight: 400, letterSpacing: "0.04em", color: "var(--color-text)", borderTop: "1px solid var(--color-border)", padding: "20px 0" }}
              >
                {t("nav.about")}
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
