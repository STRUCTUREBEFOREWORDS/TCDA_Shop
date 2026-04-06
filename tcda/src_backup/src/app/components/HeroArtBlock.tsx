import { motion } from "motion/react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface HeroArtBlockProps {
  imageUrl: string;
  overlayText: string;
  ctaText: string;
  onCtaClick: () => void;
  key?: string; // Add key for animation reset
}

export function HeroArtBlock({ imageUrl, overlayText, ctaText, onCtaClick }: HeroArtBlockProps) {
  return (
    <motion.section
      key={imageUrl} // Reset animation when image changes
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      className="relative h-screen w-full flex items-center justify-center"
    >
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full">
        <ImageWithFallback
          src={imageUrl}
          alt="TCDA Artwork"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-16 px-6 md:px-20">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="text-white text-3xl md:text-5xl font-extralight text-center max-w-3xl leading-relaxed tracking-wide"
        >
          {overlayText}
        </motion.h1>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          onClick={onCtaClick}
          className="px-8 py-3 bg-white text-black text-sm font-light tracking-widest uppercase hover:bg-black hover:text-white transition-colors duration-300 border border-white"
        >
          {ctaText}
        </motion.button>
      </div>
    </motion.section>
  );
}