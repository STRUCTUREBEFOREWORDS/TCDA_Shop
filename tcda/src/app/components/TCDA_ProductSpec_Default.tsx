import { motion } from "motion/react";
import { useEffect, useState, useRef } from "react";

interface TCDA_ProductSpec_DefaultProps {
  material: string;
  sizeInfo: string;
  description: string;
}

export function TCDA_ProductSpec_Default({
  material,
  sizeInfo,
  description,
}: TCDA_ProductSpec_DefaultProps) {
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
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-2xl mx-auto space-y-8"
      >
        {/* Material */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 0.6 } : { opacity: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-white text-sm font-light mb-1">{material}</p>
        </motion.div>

        {/* Size Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 0.6 } : { opacity: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-white text-sm font-light mb-1">{sizeInfo}</p>
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 0.6 } : { opacity: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-white text-sm font-light leading-relaxed">{description}</p>
        </motion.div>
      </motion.div>
    </section>
  );
}