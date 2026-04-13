import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpBackend from "i18next-http-backend";

const SUPPORTED_LANGS = ["ja", "en", "fr", "es", "ko", "zh"];

/**
 * URL の /:lang セグメントから初期言語を取得する。
 * i18n.init() は一度しか実行されないモジュールシングルトンのため、
 * Root.tsx の useEffect より前に正しい言語を設定しておく必要がある。
 * これにより changeLanguage() による二段階 fetch を回避し、
 * 初回描画から正しい言語で t() が解決される。
 */
function detectLngFromURL(): string {
  const seg = window.location.pathname.split("/").filter(Boolean)[0] ?? "";
  return SUPPORTED_LANGS.includes(seg) ? seg : "ja";
}

i18n
  .use(HttpBackend)
  .use(initReactI18next)
  .init({
    lng: detectLngFromURL(),
    fallbackLng: "ja",
    ns: ["translation"],
    defaultNS: "translation",
    backend: {
      loadPath: "/locales/{{lng}}/translation.json",
    },
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });

export default i18n;
