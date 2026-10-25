import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router";
import { OG_DEFAULT_IMAGE } from "../lib/seo";

const SECTION_KEYS = [
  "dataCollection",
  "legalBasis",
  "dataUsage",
  "thirdParty",
  "transfers",
  "retention",
  "cookies",
  "security",
  "rights",
  "contact",
] as const;

export function PrivacyPage() {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen bg-black">
      <div className="text-white px-6 py-20 max-w-2xl mx-auto">
      <Helmet>
        <title>{t("privacy.title")} | TCDA</title>
        <meta name="description" content={t("meta.privacy.description")} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={`${t("privacy.title")} | TCDA`} />
        <meta property="og:description" content={t("meta.privacy.description")} />
        <meta property="og:url" content={`https://tcdashop.com${pathname.replace(/\/?$/, "/")}`} />
        <meta property="og:image" content={OG_DEFAULT_IMAGE} />
      </Helmet>
      <h1 className="text-sm font-light tracking-normal uppercase mb-12">
        {t("privacy.title")}
      </h1>
      <div className="space-y-10 text-xs font-light leading-loose break-words" style={{ overflowWrap: "break-word" }}>
        {SECTION_KEYS.map((key) => (
          <section key={key}>
            <h2 className="tracking-normal uppercase mb-4 text-white/40">
              {t(`privacy.sections.${key}.title`)}
            </h2>
            <p>{t(`privacy.sections.${key}.body`)}</p>
          </section>
        ))}
        <p className="text-white/30">{t("privacy.effectiveDate")}</p>
      </div>
      </div>
    </div>
  );
}
