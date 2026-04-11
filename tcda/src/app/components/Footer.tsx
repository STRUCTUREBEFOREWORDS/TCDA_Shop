import { Link } from "react-router";
import { useGlobalContext } from "../pages/Root";
import { getTranslation } from "../data/translations";

export function Footer() {
  const { language } = useGlobalContext();
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);

  return (
    <footer className="bg-black border-t border-white/10 px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-light tracking-widest uppercase text-white/20">
      <span>© 2026 TCDA</span>
      <div className="flex gap-8">
        <Link to={`/${language}/legal`} className="hover:text-white/60 transition-colors">{t("legal")}</Link>
        <Link to={`/${language}/privacy`} className="hover:text-white/60 transition-colors">{t("privacy")}</Link>
      </div>
    </footer>
  );
}
