import { motion } from "motion/react";
import { Link } from "react-router";
import { artworks } from "../data/artworks";
import { useGlobalContext } from "./Root";
import { getTranslation } from "../data/translations";
import { formatPrice } from "../utils/formatPrice";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

// Look preview images — editorial shots
const LOOK_IMAGES = [
  artworks[0].imageUrl,
  artworks[1].imageUrl,
  artworks[2].imageUrl,
];

export function TopPage() {
  const { language, currency } = useGlobalContext();
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);

  const heroLine: Record<string, string> = {
    en: "You were never meant to fit in.",
    ja: "あなたは最初から「普通」に属していなかった。",
    fr: "Vous n'étiez jamais censé vous conformer.",
    es: "Nunca se supuso que encajaras.",
    ko: "당신은 처음부터 맞지 않았습니다.",
    zh: "你从来都不是为了融入而生的。",
  };

  return (
    <div className="min-h-screen bg-black">
      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative h-screen w-full overflow-hidden">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1769866631763-169df2a7acb1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxldGhlcmVhbCUyMG1pbmltYWwlMjBibGFjayUyMHdoaXRlJTIwYWJzdHJhY3R8ZW58MXx8fHwxNzc1MDk2NjI0fDA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="TCDA"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/55" />

        {/* Hero text — 1 line only */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-white text-base md:text-xl font-extralight tracking-[0.2em] leading-[160%] max-w-2xl"
          >
            {heroLine[language] ?? heroLine.en}
          </motion.p>

          {/* Shop CTA — small */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 1.2 }}
            className="mt-16"
          >
            <Link
              to="/products"
              className="text-white/50 text-[10px] font-light tracking-[0.4em] uppercase hover:text-white transition-colors duration-500 border-b border-white/20 hover:border-white/60 pb-2"
            >
              {t("shop")}
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 1.6, repeat: Infinity, repeatType: "reverse", repeatDelay: 0.4 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-px h-10 bg-white/20" />
        </motion.div>
      </section>

      {/* ── PRODUCT GRID (immediate — no philosophy) ─────────────── */}
      <section className="bg-black py-20 px-6 md:px-10">
        <div className="max-w-7xl mx-auto">
          {/* Section label */}
          <div className="mb-10 flex items-center justify-between">
            <p className="text-white/20 text-[10px] font-light tracking-[0.4em] uppercase">
              {t("collection")}
            </p>
            <Link
              to="/products"
              className="text-white/30 text-[10px] font-light tracking-[0.3em] uppercase hover:text-white/70 transition-colors duration-300 border-b border-white/10 hover:border-white/40 pb-1"
            >
              {t("viewAll")}
            </Link>
          </div>

          {/* Grid: 2 col mobile / 3 col desktop */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-14">
            {artworks.map((artwork, index) => (
              <motion.div
                key={artwork.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.7, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link to={`/product/${artwork.id}`} className="group block">
                  {/* Image */}
                  <div className="aspect-[3/4] overflow-hidden bg-white/5 mb-4">
                    <ImageWithFallback
                      src={artwork.imageUrl}
                      alt={(artwork.name as Record<string, string>)[language] ?? artwork.name.en}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                    />
                  </div>
                  {/* Name + Price */}
                  <div className="space-y-1.5">
                    <p className="text-white/50 text-[10px] font-light tracking-[0.3em] uppercase group-hover:text-white/90 transition-colors duration-300">
                      {artwork.shortName}
                    </p>
                    <p className="text-white/70 text-xs font-light">
                      {(artwork.name as Record<string, string>)[language] ?? artwork.name.en}
                    </p>
                    <p className="text-white text-sm font-extralight tracking-wider">
                      {formatPrice(artwork.price[currency], currency)}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LOOK PREVIEW ────────────────────────────────────────── */}
      <section className="bg-black py-20 px-6 md:px-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10 flex items-center justify-between">
            <p className="text-white/20 text-[10px] font-light tracking-[0.4em] uppercase">
              {t("look")}
            </p>
            <Link
              to="/look"
              className="text-white/30 text-[10px] font-light tracking-[0.3em] uppercase hover:text-white/70 transition-colors duration-300 border-b border-white/10 hover:border-white/40 pb-1"
            >
              {t("viewAll")}
            </Link>
          </div>

          {/* Editorial images — horizontal */}
          <div className="grid grid-cols-3 gap-4">
            {LOOK_IMAGES.map((src, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
                className="relative"
              >
                <Link to="/look">
                  <div className="aspect-[2/3] overflow-hidden bg-white/5">
                    <ImageWithFallback
                      src={src}
                      alt={`Look ${i + 1}`}
                      className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-black/20 hover:bg-black/10 transition-colors duration-500" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
