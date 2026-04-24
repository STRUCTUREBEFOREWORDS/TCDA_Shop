import { Link } from "react-router";
import { useGlobalContext } from "../pages/Root";
import { useTranslation } from "react-i18next";
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

export function Footer() {
  const { language } = useGlobalContext();
  const { t } = useTranslation();

  return (
    <footer className="bg-black border-t border-white/10 px-8 md:px-12 py-12">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row gap-10 sm:gap-0 sm:justify-between">

        {/* Brand + legal */}
        <div className="flex flex-col gap-4">
          <span className="text-[10px] font-light tracking-widest uppercase text-white/50">© 2026 Transcend Creative Dimension Aura</span>
          <div className="flex flex-col gap-2">
            <Link to={`/${language}/legal`} className="text-[10px] font-light tracking-widest uppercase text-white/50 hover:text-white transition-colors py-2 inline-block">
              {t("nav.legal")}
            </Link>
            <Link to={`/${language}/privacy`} className="text-[10px] font-light tracking-widest uppercase text-white/50 hover:text-white transition-colors py-2 inline-block">
              {t("nav.privacy")}
            </Link>
          </div>
        </div>

        {/* Support */}
        <div className="flex flex-col gap-4">
          <span className="text-[10px] font-light tracking-[0.3em] uppercase text-white/50">
            {t("footer.support")}
          </span>
          <div className="flex flex-col gap-2">
            {[
              { to: `/${language}/size-guide`, label: t("footer.faq") },
              { to: `/${language}/size-guide`, label: t("footer.sizeGuide") },
              { to: `/${language}/shipping-returns`, label: t("footer.shippingReturns") },
              { to: `/${language}/contact`, label: t("footer.contact") },
            ].map(({ to, label }) => (
              <Link key={to + label} to={to} className="text-[10px] font-light tracking-widest uppercase text-white/50 hover:text-white transition-colors py-2 inline-block">
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
