import { Link } from "react-router";
import { useGlobalContext } from "../pages/Root";
import { useTranslation } from "react-i18next";

export function Footer() {
  const { language } = useGlobalContext();
  const { t } = useTranslation();

  return (
    <footer className="bg-black border-t border-white/10 px-8 md:px-12 py-12">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row gap-10 sm:gap-0 sm:justify-between">

        {/* Brand + legal */}
        <div className="flex flex-col gap-4">
          <span className="text-[10px] font-light tracking-widest uppercase text-white/20">© 2026 TCDA</span>
          <div className="flex flex-col gap-2">
            <Link to={`/${language}/legal`} className="text-[10px] font-light tracking-widest uppercase text-white/20 hover:text-white/60 transition-colors py-2 inline-block">
              {t("nav.legal")}
            </Link>
            <Link to={`/${language}/privacy`} className="text-[10px] font-light tracking-widest uppercase text-white/20 hover:text-white/60 transition-colors py-2 inline-block">
              {t("nav.privacy")}
            </Link>
          </div>
        </div>

        {/* Support */}
        <div className="flex flex-col gap-4">
          <span className="text-[10px] font-light tracking-[0.3em] uppercase text-white/20">
            {t("footer.support")}
          </span>
          <div className="flex flex-col gap-2">
            {[
              { to: `/${language}/size-guide`, label: t("footer.faq") },
              { to: `/${language}/size-guide`, label: t("footer.sizeGuide") },
              { to: `/${language}/shipping-returns`, label: t("footer.shippingReturns") },
              { to: `/${language}/contact`, label: t("footer.contact") },
            ].map(({ to, label }) => (
              <Link key={to + label} to={to} className="text-[10px] font-light tracking-widest uppercase text-white/20 hover:text-white/60 transition-colors py-2 inline-block">
                {label}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}
