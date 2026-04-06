import { motion } from "motion/react";
import { useEffect, useState, useRef } from "react";

interface TCDA_CTA_MidProps {
  ctaText: string;
  onCtaClick: () => void;
}

export function TCDA_CTA_Mid({ ctaText, onCtaClick }: TCDA_CTA_MidProps) {
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
    <section ref={ref} className="py-32 px-8 md:px-20 bg-black">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center gap-6"
      >
        {/* Divider Line */}
        <div className="w-12 h-px bg-white/20 mb-4" />
        
        {/* CTA - Text-like, not button-like */}
        <button
          onClick={onCtaClick}
          className="text-white text-sm font-light tracking-[0.3em] uppercase opacity-50 hover:opacity-100 transition-opacity duration-700 border-b border-white/20 hover:border-white/60 pb-2 transition-all"
        >
          {ctaText}
        </button>
        
        {/* Divider Line */}
        <div className="w-12 h-px bg-white/20 mt-4" />
      </motion.div>
    </section>
  );
}