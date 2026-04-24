import { motion, useScroll, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { useState, useEffect, useRef } from 'react';
import { Menu, X } from 'lucide-react';

interface NavigationProps {
  onNavigate: (section: string) => void;
}

export function Navigation({ onNavigate }: NavigationProps) {
  const { language, setLanguage, currency, setCurrency } = useApp();
  const [showCurrMenu, setShowCurrMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const currRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  useEffect(() => {
    return scrollY.on('change', (latest) => {
      setIsScrolled(latest > 80);
    });
  }, [scrollY]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (currRef.current && !currRef.current.contains(event.target as Node)) {
        setShowCurrMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const languages = [
    { code: 'en' as const, label: 'EN' },
    { code: 'es' as const, label: 'ES' },
    { code: 'fr' as const, label: 'FR' },
    { code: 'ja' as const, label: 'JA' },
  ];

  const currencies = [
    { code: 'USD' as const, label: 'USD' },
    { code: 'EUR' as const, label: 'EUR' },
    { code: 'GBP' as const, label: 'GBP' },
    { code: 'JPY' as const, label: 'JPY' },
  ];

  const cycleLanguage = () => {
    const currentIndex = languages.findIndex((lang) => lang.code === language);
    const nextIndex = (currentIndex + 1) % languages.length;
    setLanguage(languages[nextIndex].code);
  };

  const solidBg = isScrolled || menuOpen;
  const textColor = solidBg ? 'text-black' : 'text-white';
  const bgColor = solidBg ? 'bg-white/95 shadow-sm' : 'bg-transparent';

  const handleNav = (section: string) => {
    onNavigate(section);
    setMenuOpen(false);
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.8 }}
      className={`fixed left-0 right-0 top-0 z-40 transition-all duration-300 ${bgColor}`}
    >
      {/* ── Main bar ── */}
      <div className="flex items-center justify-between px-4 py-4 md:px-8 md:py-5">
        {/* Logo */}
        <button
          onClick={() => handleNav('hero')}
          className="flex items-center gap-2 transition-opacity hover:opacity-70"
          aria-label="Transcend Creative Dimension Aura – Home"
        >
          <img
            src="/logo.svg"
            alt="Transcend Creative Dimension Aura"
            className="h-9 w-auto md:h-11"
          />
        </button>

        {/* Desktop links */}
        <div className="hidden items-center gap-8 md:flex">
          {(['archive', 'shop', 'about'] as const).map((section) => (
            <button
              key={section}
              onClick={() => handleNav(section)}
              className={`text-xs tracking-[0.2em] transition-opacity hover:opacity-70 ${textColor}`}
            >
              {section.toUpperCase()}
            </button>
          ))}

          {/* Currency */}
          <div className="relative" ref={currRef}>
            <button
              onClick={() => setShowCurrMenu(!showCurrMenu)}
              className={`text-xs tracking-[0.2em] transition-opacity hover:opacity-70 ${textColor}`}
            >
              {currency}
            </button>
            <AnimatePresence>
              {showCurrMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="absolute right-0 top-full mt-2 bg-white shadow-lg"
                >
                  {currencies.map((curr) => (
                    <button
                      key={curr.code}
                      onClick={() => { setCurrency(curr.code); setShowCurrMenu(false); }}
                      className={`block w-full px-6 py-3 text-left text-xs tracking-widest transition-colors hover:bg-neutral-100 ${currency === curr.code ? 'bg-neutral-100' : ''}`}
                    >
                      {curr.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Language */}
          <button
            onClick={cycleLanguage}
            className={`text-xs tracking-[0.2em] transition-opacity hover:opacity-70 ${textColor}`}
          >
            {language.toUpperCase()}
          </button>
        </div>

        {/* Mobile: hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={`md:hidden transition-opacity hover:opacity-70 ${textColor}`}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          {menuOpen
            ? <X className="h-5 w-5" strokeWidth={1.5} />
            : <Menu className="h-5 w-5" strokeWidth={1.5} />
          }
        </button>
      </div>

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-neutral-100 bg-white md:hidden"
          >
            <div className="flex flex-col px-4 py-2">
              {(['archive', 'shop', 'about'] as const).map((section) => (
                <button
                  key={section}
                  onClick={() => handleNav(section)}
                  className="border-b border-neutral-100 py-4 text-left text-xs tracking-[0.2em] text-black transition-opacity hover:opacity-60 last:border-0"
                >
                  {section.toUpperCase()}
                </button>
              ))}

              {/* Currency — inline buttons */}
              <div className="border-b border-neutral-100 py-4">
                <p className="mb-3 text-[10px] tracking-[0.2em] text-neutral-400">CURRENCY</p>
                <div className="flex flex-wrap gap-2">
                  {currencies.map((curr) => (
                    <button
                      key={curr.code}
                      onClick={() => setCurrency(curr.code)}
                      className={`px-4 py-2 text-xs tracking-widest transition-colors ${
                        currency === curr.code
                          ? 'bg-black text-white'
                          : 'bg-neutral-100 text-neutral-600'
                      }`}
                    >
                      {curr.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Language — inline buttons */}
              <div className="py-4">
                <p className="mb-3 text-[10px] tracking-[0.2em] text-neutral-400">LANGUAGE</p>
                <div className="flex flex-wrap gap-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className={`px-4 py-2 text-xs tracking-widest transition-colors ${
                        language === lang.code
                          ? 'bg-black text-white'
                          : 'bg-neutral-100 text-neutral-600'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
