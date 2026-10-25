import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router";
import { OG_DEFAULT_IMAGE } from "../lib/seo";

const ROW_KEYS = [
  "seller",
  "address",
  "phone",
  "email",
  "price",
  "payment",
  "paymentTiming",
  "delivery",
  "returns",
  "quantity",
  "browser",
] as const;

export function LegalPage() {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen bg-black">
      <div className="text-white px-6 py-20 max-w-2xl mx-auto">
      <Helmet>
        <title>{t("legal.title")} | TCDA</title>
        <meta name="description" content={t("meta.legal.description")} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={`${t("legal.title")} | TCDA`} />
        <meta property="og:description" content={t("meta.legal.description")} />
        <meta property="og:url" content={`https://tcdashop.com${pathname.replace(/\/?$/, "/")}`} />
        <meta property="og:image" content={OG_DEFAULT_IMAGE} />
      </Helmet>
      <h1 className="text-sm font-light tracking-normal uppercase mb-12">
        {t("legal.title")}
      </h1>
      <div className="w-full text-xs font-light leading-loose divide-y divide-white/10">
        {ROW_KEYS.map((key) => (
          <div key={key} className="flex flex-col sm:flex-row py-3 gap-1 sm:gap-0">
            <span className="sm:w-40 shrink-0 text-white/40">{t(`legal.sections.${key}.label`)}</span>
            <span className="flex-1">{t(`legal.sections.${key}.value`)}</span>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}
