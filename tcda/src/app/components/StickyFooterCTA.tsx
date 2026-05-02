import { motion, useScroll, useTransform } from "motion/react";
import { useEffect, useState } from "react";
import { useGlobalContext } from "../pages/Root";

interface StickyFooterCTAProps {
  ctaText: string;
  onCtaClick: () => void;
}

export function StickyFooterCTA({ ctaText, onCtaClick }: StickyFooterCTAProps) {
  const { isCartOpen } = useGlobalContext();
  const [isVisible, setIsVisible] = useState(false);
  const { scrollY } = useScroll();

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky CTA after scrolling past 80vh
      setIsVisible(window.scrollY > window.innerHeight * 0.8);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const opacity = useTransform(scrollY, [window.innerHeight * 0.8, window.innerHeight], [0, 1]);

  if (!isVisible || isCartOpen) return null;

  return (
    <motion.div
      style={{ opacity }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-t border-white/10 py-6"
    >
      <div className="container mx-auto px-6 flex justify-center">
        <button
          onClick={onCtaClick}
          className="px-10 py-3 bg-white text-black text-sm font-light tracking-widest uppercase hover:bg-transparent hover:text-white transition-all duration-300 border border-white"
        >
          {ctaText}
        </button>
      </div>
    </motion.div>
  );
}
