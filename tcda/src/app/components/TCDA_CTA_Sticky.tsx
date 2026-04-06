import { motion } from "motion/react";
import { useEffect, useState } from "react";

interface TCDA_CTA_StickyProps {
  ctaText: string;
  onCtaClick: () => void;
}

export function TCDA_CTA_Sticky({ ctaText, onCtaClick }: TCDA_CTA_StickyProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling past 50vh
      setIsVisible(window.scrollY > window.innerHeight * 0.5);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check initial state

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
    >
      <button
        onClick={onCtaClick}
        className="px-8 py-3 bg-black/90 backdrop-blur-md border border-white/20 text-white text-xs font-light tracking-[0.3em] uppercase hover:bg-white hover:text-black hover:border-black transition-all duration-700 shadow-2xl"
      >
        {ctaText}
      </button>
    </motion.div>
  );
}