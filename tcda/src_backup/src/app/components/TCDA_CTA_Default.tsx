import { motion } from "motion/react";
import { useEffect, useState, useRef } from "react";

interface TCDA_CTA_DefaultProps {
  ctaText: string;
  price: string;
  onCtaClick: () => void;
}

export function TCDA_CTA_Default({ ctaText, price, onCtaClick }: TCDA_CTA_DefaultProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.4 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return (
    <section ref={ref} className="py-40 px-8 md:px-20 bg-black">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-xl mx-auto flex flex-col items-center gap-20"
      >
        {/* Price - Minimal, Not Emphasized */}
        <div className="text-center space-y-3">
          <p className="text-white text-xs font-light tracking-[0.4em] uppercase opacity-30">
            Investment
          </p>
          <p className="text-white text-2xl font-extralight tracking-[0.2em] opacity-60">
            {price}
          </p>
        </div>

        {/* Divider */}
        <div className="w-24 h-px bg-white/10" />

        {/* Final CTA - Border Only, Emphasized Hover */}
        <button
          onClick={onCtaClick}
          className="px-12 py-5 border border-white text-white text-sm font-light tracking-[0.3em] uppercase hover:bg-white hover:text-black transition-all duration-700"
        >
          {ctaText}
        </button>

        {/* Subtle Note */}
        <p className="text-white text-xs font-light tracking-wide opacity-20 text-center max-w-sm">
          This decision is irreversible
        </p>
      </motion.div>
    </section>
  );
}