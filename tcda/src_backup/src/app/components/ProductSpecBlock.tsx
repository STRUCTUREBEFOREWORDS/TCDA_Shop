import { motion } from "motion/react";
import { useEffect, useState, useRef } from "react";

interface ProductSpecBlockProps {
  material: string;
  description: string;
  sizes: string[];
}

export function ProductSpecBlock({ material, description, sizes }: ProductSpecBlockProps) {
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
    <section ref={ref} className="py-24 md:py-32 px-6 md:px-20 bg-black">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="max-w-4xl mx-auto"
      >
        {/* Material */}
        <div className="mb-12 pb-6 border-b border-white/10">
          <p className="text-white/40 text-xs font-light tracking-widest uppercase mb-2">
            Material
          </p>
          <p className="text-white text-base font-light">{material}</p>
        </div>

        {/* Size Table */}
        <div className="mb-12 pb-6 border-b border-white/10">
          <p className="text-white/40 text-xs font-light tracking-widest uppercase mb-4">
            Available Sizes
          </p>
          <div className="flex gap-4 flex-wrap">
            {sizes.map((size) => (
              <div
                key={size}
                className="px-4 py-2 border border-white/20 text-white text-sm font-light"
              >
                {size}
              </div>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <p className="text-white/40 text-xs font-light tracking-widest uppercase mb-2">
            Details
          </p>
          <p className="text-white/60 text-sm font-light leading-relaxed max-w-2xl">
            {description}
          </p>
        </div>
      </motion.div>
    </section>
  );
}