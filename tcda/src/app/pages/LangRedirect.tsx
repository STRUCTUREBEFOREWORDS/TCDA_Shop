import { useEffect } from "react";
import { useNavigate } from "react-router";

const LANG_MAP: Record<string, string> = {
  ja: "ja", en: "en", ko: "ko", zh: "zh", fr: "fr", es: "es",
};

export function LangRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then((r) => r.json())
      .then((data) => {
        const lang = data.languages?.split(",")[0]?.split("-")[0] || "en";
        const resolved = LANG_MAP[lang] ?? "en";
        navigate(`/${resolved}/`, { replace: true });
      })
      .catch(() => navigate("/en/", { replace: true }));
  }, []);

  return null;
}
