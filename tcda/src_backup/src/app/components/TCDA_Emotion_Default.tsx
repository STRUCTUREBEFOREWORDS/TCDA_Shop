import { motion } from "motion/react";
import { useEffect, useState, useRef } from "react";

interface TCDA_Emotion_DefaultProps {
  text: string;
}

export function TCDA_Emotion_Default({ text }: TCDA_Emotion_DefaultProps) {
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
        initial={{ opacity: 0, y: 30 }}
        animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 1.2, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-[640px] mx-auto"
      >
        <p className="text-black text-lg md:text-xl font-light leading-[180%] tracking-wide text-center">
          {text}
        </p>
      </motion.div>
    </section>
  );
}