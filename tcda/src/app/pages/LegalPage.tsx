import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";

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

  return (
    <div className="min-h-screen bg-black text-white px-6 py-20 max-w-2xl mx-auto">
      <Helmet>
        <title>{t("legal.title")} | TCDA</title>
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
  );
}
