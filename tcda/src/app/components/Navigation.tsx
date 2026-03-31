import { motion, useScroll } from 'motion/react';
import { useApp } from '../context/AppContext';
import { useState, useEffect, useRef } from 'react';

interface NavigationProps {
  onNavigate: (section: string) => void;
}

export function Navigation({ onNavigate }: NavigationProps) {
  const { language, setLanguage, currency, setCurrency } = useApp();
  const [showCurrMenu, setShowCurrMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const currRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  // Track scroll position
  useEffect(() => {
    return scrollY.on('change', (latest) => {
      setIsScrolled(latest > 100);
    });
  }, [scrollY]);

  // Close currency menu when clicking outside
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

  const textColor = isScrolled ? 'text-black' : 'text-white';
  const bgColor = isScrolled ? 'bg-white/95 shadow-sm' : 'bg-transparent';

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.8 }}
      className={`fixed left-0 right-0 top-0 z-40 flex items-center justify-between px-8 py-6 transition-all duration-300 ${bgColor}`}
    >
      {/* Logo */}
      <button
        onClick={() => onNavigate('hero')}
        className={`text-2xl tracking-[0.3em] transition-all hover:opacity-70 ${textColor}`}
      >
        ATELIER
      </button>

      {/* Navigation Links */}
      <div className="flex items-center gap-8">
        <button
          onClick={() => onNavigate('archive')}
          className={`text-xs tracking-[0.2em] transition-all hover:opacity-70 ${textColor}`}
        >
          ARCHIVE
        </button>
        <button
          onClick={() => onNavigate('shop')}
          className={`text-xs tracking-[0.2em] transition-all hover:opacity-70 ${textColor}`}
        >
          SHOP
        </button>
        <button
          onClick={() => onNavigate('about')}
          className={`text-xs tracking-[0.2em] transition-all hover:opacity-70 ${textColor}`}
        >
          ABOUT
        </button>
        
        {/* Currency Selector */}
        <div className="relative" ref={currRef}>
          <button
            onClick={() => setShowCurrMenu(!showCurrMenu)}
            className={`text-xs tracking-[0.2em] transition-all hover:opacity-70 ${textColor}`}
          >
            {currency}
          </button>

          {showCurrMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute right-0 top-full mt-2 bg-white shadow-lg"
            >
              {currencies.map((curr) => (
                <button
                  key={curr.code}
                  onClick={() => {
                    setCurrency(curr.code);
                    setShowCurrMenu(false);
                  }}
                  className={`block w-full px-6 py-3 text-left text-xs tracking-widest transition-colors hover:bg-neutral-100 ${
                    currency === curr.code ? 'bg-neutral-100' : ''
                  }`}
                >
                  {curr.label}
                </button>
              ))}
            </motion.div>
          )}
        </div>

        {/* Language Toggle */}
        <button
          onClick={cycleLanguage}
          className={`text-xs tracking-[0.2em] transition-all hover:opacity-70 ${textColor}`}
        >
          {language.toUpperCase()}
        </button>
      </div>
    </motion.nav>
  );
}