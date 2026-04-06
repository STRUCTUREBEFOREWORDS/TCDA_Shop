import { motion } from "motion/react";
import { useEffect, useState, useRef } from "react";

interface TCDA_Concept_DefaultProps {
  title: string;
  concept: string;
  colorPalette: string[];
}

export function TCDA_Concept_Default({ title, concept, colorPalette }: TCDA_Concept_DefaultProps) {
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
    <section ref={ref} className="py-[120px] px-8 md:px-20 bg-black">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="text-white text-4xl md:text-5xl font-extralight tracking-wide"
        >
          {title}
        </motion.h2>

        {/* Concept */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="text-white/60 text-base font-light leading-relaxed max-w-xl"
        >
          {concept}
        </motion.p>

        {/* Color Palette */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="flex gap-3 pt-4"
        >
          {colorPalette.map((color, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.8, delay: 0.4 + index * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="w-6 h-6 rounded-full"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}