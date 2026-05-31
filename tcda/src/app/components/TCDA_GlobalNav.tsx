import { useState, useEffect } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { ShoppingBag, X, Menu } from "lucide-react";
import { useGlobalContext } from "../pages/Root";
import { useTranslation } from "react-i18next";

const NEWSLETTER_KEY = "newsletter_nav_subscribed";

function useNewsletter(language: string) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    () => (localStorage.getItem(NEWSLETTER_KEY) ? "done" : "idle")
  );
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || status === "loading" || status === "done") return;
    setStatus("loading");
    try {
      const res = await fetch("https://api.tcdashop.com/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, lang: language }),
      });
      if (res.ok) {
        localStorage.setItem(NEWSLETTER_KEY, "1");
        setStatus("done");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };
  return { email, setEmail, status, submit };
}

const NAV_LINK_STYLE: React.CSSProperties = {
  fontFamily: "var(--font-body)",
  fontSize: "var(--text-caption)",
  letterSpacing: "var(--ls-nav)",
  fontWeight: "var(--weight-regular)",
  color: "var(--color-text-secondary)",
  transition: "var(--transition-base)",
  textTransform: "uppercase",
};

const GENDER_FILTERS = [
  { key: "male", label: "MEN'S" },
  { key: "female", label: "WOMEN'S" },
  { key: "unisex", label: "UNISEX" },
];

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
  const [collectionOpen, setCollectionOpen] = useState(false);
  const [mobileCollectionOpen, setMobileCollectionOpen] = useState(false);
  const { email, setEmail, status, submit } = useNewsletter(language);

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
          <nav className="hidden lg:flex items-center gap-8">
            {/* COLLECTION: button → panel */}
            <button
              onClick={() => setCollectionOpen((v) => !v)}
              style={{
                ...NAV_LINK_STYLE,
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-text)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-secondary)")}
            >
              {t("nav.collection")}
            </button>
            {[
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
            {/* Newsletter inline form (desktop) */}
            {status !== "done" && (
              <form onSubmit={submit} className="flex items-center gap-1.5">
                <span style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "10px",
                  letterSpacing: "var(--ls-nav)",
                  color: "var(--color-text-tertiary)",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                }}>
                  Newsletter
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("footer.newsletterPlaceholder")}
                  required
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "10px",
                    letterSpacing: "var(--ls-nav)",
                    color: "#f0f0f0",
                    background: "transparent",
                    border: "1px solid #333",
                    padding: "5px 10px",
                    outline: "none",
                    width: "160px",
                  }}
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "10px",
                    letterSpacing: "var(--ls-nav)",
                    color: "#080808",
                    background: "#c8ff00",
                    border: "none",
                    padding: "5px 12px",
                    cursor: status === "loading" ? "wait" : "pointer",
                    opacity: status === "loading" ? 0.6 : 1,
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                  }}
                >
                  {status === "loading" ? "..." : t("footer.newsletterSubscribe")}
                </button>
              </form>
            )}
          </nav>

          {/* PC Collection Panel */}
          {collectionOpen && (
            <>
              {/* オーバーレイ：パネル外クリックで閉じる */}
              <div
                style={{ position: "fixed", inset: 0, zIndex: 40 }}
                onClick={() => setCollectionOpen(false)}
              />
              {/* パネル本体 */}
              <div
                style={{
                  position: "fixed",
                  top: "56px",
                  left: 0,
                  right: 0,
                  zIndex: 50,
                  background: "var(--color-bg)",
                  borderBottom: "1px solid var(--color-border)",
                  padding: "48px clamp(24px, 6vw, 80px)",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "48px",
                  maxWidth: "480px",
                  marginLeft: "clamp(24px, 6vw, 80px)",
                }}
              >
                {/* カテゴリー列 */}
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <span style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "9px",
                    letterSpacing: "0.2em",
                    color: "var(--color-text-tertiary)",
                    textTransform: "uppercase",
                    marginBottom: "4px",
                  }}>
                    Category
                  </span>
                  {CATEGORY_FILTERS.map((f) => (
                    <Link
                      key={f.key}
                      to={`/${language}/collection?category=${f.key}`}
                      onClick={() => setCollectionOpen(false)}
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "12px",
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        color: "var(--color-text-secondary)",
                        transition: "var(--transition-base)",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-text)")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-secondary)")}
                    >
                      {f.label}
                    </Link>
                  ))}
                </div>

                {/* ジェンダー列 */}
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <span style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "9px",
                    letterSpacing: "0.2em",
                    color: "var(--color-text-tertiary)",
                    textTransform: "uppercase",
                    marginBottom: "4px",
                  }}>
                    Gender
                  </span>
                  {GENDER_FILTERS.map((f) => (
                    <Link
                      key={f.key}
                      to={`/${language}/collection?gender=${f.key}`}
                      onClick={() => setCollectionOpen(false)}
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "12px",
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        color: "var(--color-text-secondary)",
                        transition: "var(--transition-base)",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-text)")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-secondary)")}
                    >
                      {f.label}
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}

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
              className="lg:hidden transition-opacity duration-300"
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
            className="lg:hidden fixed inset-0 z-[60] flex flex-col overflow-y-auto"
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

            {/* Nav items — 画面全体を使った3分割レイアウト */}
            <nav style={{ padding: "0 32px", display: "flex", flexDirection: "column", flex: 1, justifyContent: "space-between", paddingBottom: "48px" }}>

              {/* SP Collection Accordion */}
              <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "clamp(24px, 6vw, 40px)" }}>
                <button
                  onClick={() => setMobileCollectionOpen((v) => !v)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    padding: 0,
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(36px, 9vw, 56px)",
                    fontWeight: 200,
                    letterSpacing: "0.04em",
                    color: "var(--color-text)",
                  }}
                >
                  <span>{t("nav.collection")}</span>
                  <span style={{
                    fontSize: "16px",
                    letterSpacing: "0.1em",
                    color: "var(--color-text-tertiary)",
                    transition: "transform 0.3s ease",
                    transform: mobileCollectionOpen ? "rotate(45deg)" : "rotate(0deg)",
                  }}>
                    +
                  </span>
                </button>

                {/* アコーディオン展開部分 */}
                {mobileCollectionOpen && (
                  <div style={{
                    display: "flex",
                    gap: "40px",
                    paddingTop: "24px",
                    paddingLeft: "4px",
                  }}>
                    {/* カテゴリー */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      <span style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "9px",
                        letterSpacing: "0.2em",
                        color: "var(--color-text-tertiary)",
                        textTransform: "uppercase",
                      }}>
                        Category
                      </span>
                      {CATEGORY_FILTERS.map((f) => (
                        <Link
                          key={f.key}
                          to={`/${language}/collection?category=${f.key}`}
                          onClick={() => setMobileOpen(false)}
                          style={{
                            fontFamily: "var(--font-body)",
                            fontSize: "13px",
                            letterSpacing: "0.15em",
                            textTransform: "uppercase",
                            color: "var(--color-text-secondary)",
                          }}
                        >
                          {f.label}
                        </Link>
                      ))}
                    </div>

                    {/* ジェンダー */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      <span style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "9px",
                        letterSpacing: "0.2em",
                        color: "var(--color-text-tertiary)",
                        textTransform: "uppercase",
                      }}>
                        Gender
                      </span>
                      {GENDER_FILTERS.map((f) => (
                        <Link
                          key={f.key}
                          to={`/${language}/collection?gender=${f.key}`}
                          onClick={() => setMobileOpen(false)}
                          style={{
                            fontFamily: "var(--font-body)",
                            fontSize: "13px",
                            letterSpacing: "0.15em",
                            textTransform: "uppercase",
                            color: "var(--color-text-secondary)",
                          }}
                        >
                          {f.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* LOOKBOOK */}
              <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "clamp(20px, 5vw, 32px)" }}>
                <Link
                  to={`/${language}/lookbook`}
                  onClick={() => setMobileOpen(false)}
                  style={{ fontFamily: "var(--font-display)", fontSize: "clamp(36px, 9vw, 56px)", fontWeight: 200, letterSpacing: "0.02em", color: "var(--color-text)", lineHeight: 1 }}
                >
                  LOOKBOOK
                </Link>
              </div>

              {/* ABOUT */}
              <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "clamp(20px, 5vw, 32px)" }}>
                <Link
                  to={`/${language}/about`}
                  onClick={() => setMobileOpen(false)}
                  style={{ fontFamily: "var(--font-display)", fontSize: "clamp(36px, 9vw, 56px)", fontWeight: 200, letterSpacing: "0.02em", color: "var(--color-text)", lineHeight: 1 }}
                >
                  {t("nav.about")}
                </Link>
              </div>

              {/* Newsletter */}
              {status !== "done" && (
                <div style={{ paddingTop: "clamp(20px, 5vw, 32px)" }}>
                  <p style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "11px",
                    letterSpacing: "0.2em",
                    color: "var(--color-text-tertiary)",
                    textTransform: "uppercase",
                    marginBottom: "12px",
                  }}>
                    Newsletter
                  </p>
                  <form onSubmit={submit} style={{ display: "flex", gap: "8px" }}>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t("footer.newsletterPlaceholder")}
                      required
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "var(--text-caption)",
                        letterSpacing: "var(--ls-nav)",
                        color: "#f0f0f0",
                        background: "transparent",
                        border: "1px solid #333",
                        padding: "10px 12px",
                        outline: "none",
                        flex: 1,
                      }}
                    />
                    <button
                      type="submit"
                      disabled={status === "loading"}
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "var(--text-caption)",
                        letterSpacing: "var(--ls-nav)",
                        color: "#080808",
                        background: "#c8ff00",
                        border: "none",
                        padding: "10px 16px",
                        cursor: status === "loading" ? "wait" : "pointer",
                        opacity: status === "loading" ? 0.6 : 1,
                        textTransform: "uppercase",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {status === "loading" ? "..." : t("footer.newsletterSubscribe")}
                    </button>
                  </form>
                </div>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
