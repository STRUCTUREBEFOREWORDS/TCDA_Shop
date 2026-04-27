import { Link } from "react-router";
import { useGlobalContext } from "../pages/Root";
import { useTranslation } from "react-i18next";
import { TCDA_LanguageCurrencySwitcher } from "./TCDA_LanguageCurrencySwitcher";
import pinterestIcon from "../../assets/sns/sns_icons/pinterest.webp";
import xIcon from "../../assets/sns/sns_icons/x.webp";
import instagramIcon from "../../assets/sns/sns_icons/instagram.webp";
import tiktokIcon from "../../assets/sns/sns_icons/tiktok.webp";

const SNS_LINKS = [
  { href: "https://jp.pinterest.com/tcda_shop/", icon: pinterestIcon, label: "Pinterest" },
  { href: "https://www.tiktok.com/@tcda.shop", icon: tiktokIcon, label: "TikTok" },
  { href: "https://www.instagram.com/tcda.shop/", icon: instagramIcon, label: "Instagram" },
  { href: "https://x.com/tcda_shop", icon: xIcon, label: "X" },
];

const LINK_STYLE: React.CSSProperties = {
  fontFamily: "var(--font-body)",
  fontSize: "var(--text-caption)",
  letterSpacing: "var(--ls-nav)",
  color: "var(--color-text-secondary)",
  transition: "var(--transition-base)",
  textTransform: "uppercase",
};

export function Footer() {
  const { language, currency, setLanguage, setCurrency } = useGlobalContext();
  const { t } = useTranslation();

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
    </footer>
  );
}
