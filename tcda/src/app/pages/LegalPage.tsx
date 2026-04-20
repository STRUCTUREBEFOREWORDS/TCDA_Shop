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
      <h1 className="text-sm font-light tracking-[0.3em] uppercase mb-12">
        {t("legal.title")}
      </h1>
      <table className="w-full text-xs font-light leading-loose border-collapse">
        <tbody>
          {ROW_KEYS.map((key) => (
            <tr key={key} className="border-t border-white/10">
              <td className="py-4 pr-8 text-white/40 whitespace-nowrap align-top w-40">
                {t(`legal.sections.${key}.label`)}
              </td>
              <td className="py-4">{t(`legal.sections.${key}.value`)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
