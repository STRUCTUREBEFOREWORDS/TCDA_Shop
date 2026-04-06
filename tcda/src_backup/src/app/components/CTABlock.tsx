import { motion } from "motion/react";
import { useEffect, useState, useRef } from "react";

interface CTABlockProps {
  ctaText: string;
  price: string;
  onCtaClick: () => void;
}

export function CTABlock({ ctaText, price, onCtaClick }: CTABlockProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
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
    <section ref={ref} className="py-32 md:py-48 px-6 md:px-20 bg-black">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="max-w-2xl mx-auto flex flex-col items-center gap-8"
      >
        {/* Price */}
        <p className="text-white text-2xl md:text-3xl font-extralight tracking-widest">
          {price}
        </p>

        {/* CTA Button */}
        <button
          onClick={onCtaClick}
          className="px-12 py-4 bg-white text-black text-sm font-light tracking-widest uppercase hover:bg-transparent hover:text-white transition-all duration-300 border border-white"
        >
          {ctaText}
        </button>
      </motion.div>
    </section>
  );
}
