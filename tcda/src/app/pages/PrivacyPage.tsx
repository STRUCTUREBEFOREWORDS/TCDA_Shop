import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";

const SECTION_KEYS = [
  "dataCollection",
  "dataUsage",
  "thirdParty",
  "cookies",
  "security",
  "contact",
] as const;

export function PrivacyPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-black text-white px-6 py-20 max-w-2xl mx-auto">
      <Helmet>
        <title>{t("privacy.title")} | TCDA</title>
      </Helmet>
      <h1 className="text-sm font-light tracking-[0.3em] uppercase mb-12">
        {t("privacy.title")}
      </h1>
      <div className="space-y-10 text-xs font-light leading-loose">
        {SECTION_KEYS.map((key) => (
          <section key={key}>
            <h2 className="tracking-widest uppercase mb-4 text-white/40">
              {t(`privacy.sections.${key}.title`)}
            </h2>
            <p>{t(`privacy.sections.${key}.body`)}</p>
          </section>
        ))}
        <p className="text-white/30">{t("privacy.effectiveDate")}</p>
      </div>
    </div>
  );
}
