import { motion } from "motion/react";
import { useEffect, useState, useRef } from "react";

interface ConceptBlockProps {
  title: string;
  description: string;
  colorPalette: string[];
  paletteLabel: string; // Add translated label
}

export function ConceptBlock({ title, description, colorPalette, paletteLabel }: ConceptBlockProps) {
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
        className="max-w-4xl mx-auto"
      >
        {/* Title */}
        <h2 className="text-white text-4xl md:text-6xl font-extralight mb-12 tracking-wide">
          {title}
        </h2>

        {/* Description */}
        <p className="text-white/70 text-lg md:text-xl font-light leading-relaxed mb-16 max-w-2xl">
          {description}
        </p>

        {/* Color Palette */}
        <div className="flex items-center gap-6">
          <span className="text-white/50 text-sm font-light tracking-widest uppercase">
            {paletteLabel}
          </span>
          <div className="flex gap-3">
            {colorPalette.map((color, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="w-12 h-12 rounded-full border border-white/20"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}