import { Link } from "react-router";

export function Footer() {
  return (
    <footer className="border-t border-white/10 px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-light tracking-widest uppercase text-white/20">
      <span>© 2026 TCDA</span>
      <div className="flex gap-8">
        <Link to="/legal" className="hover:text-white/60 transition-colors">特定商取引法</Link>
        <Link to="/privacy" className="hover:text-white/60 transition-colors">プライバシーポリシー</Link>
      </div>
    </footer>
  );
}
