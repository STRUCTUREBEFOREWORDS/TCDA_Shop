import { useEffect } from "react";
import { useNavigate } from "react-router";

const LANG_MAP: Record<string, string> = {
  ja: "ja", en: "en", ko: "ko", zh: "zh", fr: "fr", es: "es",
};

export function LangRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const lang = navigator.language?.split("-")[0] || "en";
    const resolved = LANG_MAP[lang] ?? "en";
    navigate(`/${resolved}/`, { replace: true });
  }, []);

  return null;
}
