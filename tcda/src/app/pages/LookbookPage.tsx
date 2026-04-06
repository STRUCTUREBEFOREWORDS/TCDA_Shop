import { motion } from "motion/react";
import { Link } from "react-router";
import { artworks } from "../data/artworks";
import { useGlobalContext } from "./Root";
import { getTranslation } from "../data/translations";
import { formatPrice } from "../utils/formatPrice";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

// Lookbook entries: pair of image + product link
const LOOKS = [
  { artwork: artworks[0], caption: null },
  { artwork: artworks[1], caption: null },
  { artwork: artworks[2], caption: null },
  { artwork: artworks[0], caption: null },  // repeat for fullness
  { artwork: artworks[2], caption: null },
];

export function LookbookPage() {
  const { language, currency } = useGlobalContext();
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);

  return (
    <div className="bg-black min-h-screen">
      {/* Page label */}
      <div className="pt-24 pb-4 px-8 md:px-12">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="text-white/20 text-[10px] font-light tracking-[0.5em] uppercase"
        >
          {t("look")}
        </motion.p>
      </div>

      {/* Fullscreen continuous visuals */}
      <div className="space-y-px">
        {LOOKS.map((look, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            {/* Full-width image */}
            <div
              className={`relative overflow-hidden ${
                index % 3 === 0
                  ? "h-screen"
                  : index % 3 === 1
                  ? "h-[70vh]"
                  : "h-[85vh]"
              }`}
            >
              <ImageWithFallback
                src={look.artwork.imageUrl}
                alt={look.artwork.name[language]}
                className="w-full h-full object-cover"
              />
              {/* Subtle overlay */}
              <div className="absolute inset-0 bg-black/15" />

              {/* Product overlay — bottom right */}
              <div className="absolute bottom-8 right-8">
                <Link
                  to={`/product/${look.artwork.id}`}
                  className="group flex flex-col items-end gap-2"
                >
                  <p className="text-white/40 text-[10px] font-light tracking-[0.3em] uppercase group-hover:text-white/80 transition-colors duration-300">
                    {look.artwork.shortName}
                  </p>
                  <p className="text-white/60 text-sm font-extralight tracking-wider group-hover:text-white transition-colors duration-300">
                    {formatPrice(look.artwork.price[currency], currency)}
                  </p>
                  <span className="text-white/30 text-[9px] font-light tracking-[0.3em] uppercase border-b border-white/20 pb-0.5 group-hover:text-white/60 group-hover:border-white/50 transition-all duration-300">
                    {t("shop")}
                  </span>
                </Link>
              </div>

              {/* Minimal copy — top left, only on first */}
              {index === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.2, delay: 0.4 }}
                  className="absolute top-20 left-8 md:left-12"
                >
                  <p className="text-white/40 text-xs font-extralight tracking-[0.2em] max-w-xs leading-[180%]">
                    {language === "ja"
                      ? "着るという行為そのものが、表明である。"
                      : language === "fr"
                      ? "L'acte de s'habiller est lui-même une déclaration."
                      : "The act of wearing is itself a statement."}
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer CTA */}
      <div className="py-20 flex justify-center border-t border-white/5">
        <Link
          to="/products"
          className="text-white/30 text-[10px] font-light tracking-[0.4em] uppercase hover:text-white/70 transition-colors duration-300 border-b border-white/10 hover:border-white/40 pb-2"
        >
          {t("shop")}
        </Link>
      </div>
    </div>
  );
}
