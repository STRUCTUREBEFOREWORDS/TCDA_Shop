import { motion, useScroll, useTransform } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { useRef } from 'react';

interface HeroProps {
  onScrollClick: () => void;
}

export function Hero({ onScrollClick }: HeroProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, ease: 'easeOut' }}
      className="relative min-h-screen w-full overflow-hidden"
      style={{ minHeight: 'min(100svh, 100vh)' }}
    >
      {/* Background Image with Parallax */}
      <motion.div style={{ y }} className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1574892627801-de77f82b5a6d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaWdoJTIwZmFzaGlvbiUyMG1vZGVsJTIwYWJzdHJhY3QlMjBhcnR8ZW58MXx8fHwxNzc0NzgyODA1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Hero"
          className="h-[120%] w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/25" />
      </motion.div>

      {/* Scroll Indicator */}
      <motion.button
        style={{ opacity }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        onClick={onScrollClick}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 cursor-pointer sm:bottom-12"
        aria-label="Scroll to shop"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown className="h-7 w-7 text-white sm:h-8 sm:w-8" strokeWidth={1} />
        </motion.div>
      </motion.button>
    </motion.section>
  );
}
