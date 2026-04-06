import { motion } from "motion/react";
import { useEffect, useState, useRef } from "react";

interface EmotionBlockProps {
  text: string;
}

export function EmotionBlock({ text }: EmotionBlockProps) {
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
    <section ref={ref} className="py-32 md:py-48 px-6 md:px-20 bg-white">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="max-w-3xl mx-auto text-center"
      >
        <p className="text-black text-xl md:text-3xl font-extralight leading-loose tracking-wide">
          {text}
        </p>
      </motion.div>
    </section>
  );
}
