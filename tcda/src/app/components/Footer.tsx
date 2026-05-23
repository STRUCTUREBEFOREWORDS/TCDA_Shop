import { useState } from "react";
import { Link } from "react-router";
import { useGlobalContext } from "../pages/Root";
import { useTranslation } from "react-i18next";
import { TCDA_LanguageCurrencySwitcher } from "./TCDA_LanguageCurrencySwitcher";
import { usePushSubscription } from "../hooks/usePushSubscription";
import pinterestIcon from "../../assets/sns/sns_icons/pinterest.webp";
import xIcon from "../../assets/sns/sns_icons/x.webp";
import instagramIcon from "../../assets/sns/sns_icons/instagram.webp";
import tiktokIcon from "../../assets/sns/sns_icons/tiktok.webp";

const SNS_LINKS = [
  { href: "https://www.pinterest.com/tcda_apparel/", icon: pinterestIcon, label: "Pinterest" },
  { href: "https://www.tiktok.com/@tcda.apparel", icon: tiktokIcon, label: "TikTok" },
  { href: "https://www.instagram.com/tcda.apparel/", icon: instagramIcon, label: "Instagram" },
  { href: "https://x.com/tcda_apparel", icon: xIcon, label: "X" },
];

const LINK_STYLE: React.CSSProperties = {
  fontFamily: "var(--font-body)",
  fontSize: "var(--text-caption)",
  letterSpacing: "var(--ls-nav)",
  color: "var(--color-text-secondary)",
  transition: "var(--transition-base)",
  textTransform: "uppercase",
};

const NEWSLETTER_KEY = "newsletter_subscribed";

function useNewsletter(language: string) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "duplicate" | "error">(
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

export function Footer() {
  const { language, currency, setLanguage, setCurrency } = useGlobalContext();
  const { t } = useTranslation();
  const { subscribed, loading, subscribe } = usePushSubscription();
  const { email, setEmail, status, submit } = useNewsletter(language);

  return (
    <footer
      className="px-8 md:px-12 py-12"
      style={{ background: "var(--color-bg)", borderTop: "1px solid var(--color-border)" }}
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row gap-10 sm:gap-0 sm:justify-between">

        {/* Brand */}
        <div className="flex flex-col gap-4">
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-caption)",
              letterSpacing: "var(--ls-nav)",
              color: "var(--color-text-tertiary)",
            }}
          >
            <span style={{ whiteSpace: "nowrap" }}>© 2026 TCDA</span>
          </span>
          <div className="mt-4" style={{ color: "var(--color-text)" }}>
            <TCDA_LanguageCurrencySwitcher
              language={language}
              currency={currency}
              onLanguageChange={setLanguage}
              onCurrencyChange={setCurrency}
            />
          </div>
        </div>

        {/* Support */}
        <div className="flex flex-col gap-4">
          <span style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-caption)", letterSpacing: "var(--ls-nav)", color: "var(--color-text-tertiary)", textTransform: "uppercase" }}>
            {t("footer.support")}
          </span>
          <div className="flex flex-col gap-2">
            {[
              { to: `/${language}/faq`, label: t("footer.faq") },
              { to: `/${language}/contact`, label: t("footer.contact") },
              { to: `/${language}/shipping-returns`, label: t("footer.shippingReturns") },
              { to: `/${language}/privacy`, label: t("nav.privacy") },
              { to: `/${language}/legal`, label: t("nav.legal") },
            ].map(({ to, label }) => (
              <Link
                key={to + label}
                to={to}
                style={LINK_STYLE}
                className="py-2 inline-block"
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-text)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-secondary)")}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

      </div>

      {/* SNS Icons */}
      <div className="max-w-7xl mx-auto mt-10 flex justify-center gap-6">
        {SNS_LINKS.map(({ href, icon, label }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="opacity-50 hover:opacity-70 transition-opacity"
          >
            <img src={icon} alt={label} width={24} height={24} />
          </a>
        ))}
      </div>

      {/* Newsletter */}
      <div className="max-w-7xl mx-auto mt-8 flex flex-col items-center gap-2">
        {status === "done" ? (
          <span style={{ ...LINK_STYLE, color: "#c8ff00" }}>
            {t("footer.newsletterSubscribed")}
          </span>
        ) : (
          <form onSubmit={submit} className="flex gap-2">
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
                color: "var(--color-text)",
                background: "transparent",
                border: "1px solid var(--color-border)",
                padding: "8px 12px",
                outline: "none",
                width: "220px",
              }}
            />
            <button
              type="submit"
              disabled={status === "loading"}
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "var(--text-caption)",
                letterSpacing: "var(--ls-nav)",
                color: "var(--color-bg)",
                background: "#c8ff00",
                border: "none",
                padding: "8px 20px",
                cursor: status === "loading" ? "wait" : "pointer",
                opacity: status === "loading" ? 0.6 : 1,
                textTransform: "uppercase",
                transition: "var(--transition-base)",
                position: "relative",
                zIndex: 10,
              }}
            >
              {status === "loading" ? "..." : t("footer.newsletterSubscribe")}
            </button>
          </form>
        )}
        {(status === "duplicate" || status === "error") && (
          <span style={{ ...LINK_STYLE, color: "var(--color-text-secondary)" }}>
            {status === "duplicate"
              ? t("footer.newsletterDuplicate")
              : t("footer.newsletterError")}
          </span>
        )}
      </div>

      {/* Push Notification */}
      <div className="max-w-7xl mx-auto mt-8 flex justify-center">
        {subscribed ? (
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-caption)",
              letterSpacing: "var(--ls-nav)",
              color: "#c8ff00",
              textTransform: "uppercase",
            }}
          >
            {t("footer.notified")}
          </span>
        ) : (
          <button
            onClick={subscribe}
            disabled={loading}
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-caption)",
              letterSpacing: "var(--ls-nav)",
              color: "var(--color-bg)",
              background: "#c8ff00",
              border: "none",
              padding: "8px 20px",
              cursor: loading ? "wait" : "pointer",
              opacity: loading ? 0.6 : 1,
              textTransform: "uppercase",
              transition: "var(--transition-base)",
              position: "relative",
              zIndex: 10,
            }}
          >
            {loading ? "..." : t("footer.notifyMe")}
          </button>
        )}
      </div>
    </footer>
  );
}
