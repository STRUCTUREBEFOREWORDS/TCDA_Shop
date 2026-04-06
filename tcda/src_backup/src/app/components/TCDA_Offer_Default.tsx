import { motion } from "motion/react";
import { useEffect, useState, useRef } from "react";

interface TCDA_Offer_DefaultProps {
  limitedText: string;
}

export function TCDA_Offer_Default({ limitedText }: TCDA_Offer_DefaultProps) {
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
    <section ref={ref} className="py-[120px] px-8 md:px-20 bg-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 1.2, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-2xl mx-auto text-center"
      >
        <p className="text-black text-sm font-light tracking-[0.25em] uppercase opacity-40">
          {limitedText}
        </p>
      </motion.div>
    </section>
  );
}