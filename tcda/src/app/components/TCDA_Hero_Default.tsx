import { motion } from "motion/react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface TCDA_Hero_DefaultProps {
  imageUrl: string;
  philosophicalText: string;
  ctaText: string;
  onCtaClick: () => void;
}

export function TCDA_Hero_Default({
  imageUrl,
  philosophicalText,
  ctaText,
  onCtaClick,
}: TCDA_Hero_DefaultProps) {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Fullscreen Artwork */}
      <div className="absolute inset-0 w-full h-full">
        <ImageWithFallback
          src={imageUrl}
          alt="TCDA Artwork"
          className="w-full h-full object-cover"
        />
        {/* Subtle gradient for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />
      </div>

      {/* Content - Bottom Left Positioning */}
      <div className="absolute inset-0 flex items-end p-8 md:p-20">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-start gap-12 max-w-3xl"
        >
          {/* Philosophical Sentence - Large, Light */}
          <h1 className="text-white text-2xl md:text-4xl lg:text-5xl font-extralight leading-[140%] tracking-wide">
            {philosophicalText}
          </h1>

          {/* CTA #1 - Instant Decision Point */}
          <button
            onClick={onCtaClick}
            className="text-white text-xs font-light tracking-[0.3em] uppercase opacity-60 hover:opacity-100 transition-all duration-700 border-b border-white/30 hover:border-white/80 pb-2"
          >
            {ctaText}
          </button>
        </motion.div>
      </div>

      {/* Scroll Indicator - Subtle */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, delay: 1.2 }}
        className="absolute bottom-8 right-8 md:right-20"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-16 bg-white/20"
        />
      </motion.div>
    </section>
  );
}