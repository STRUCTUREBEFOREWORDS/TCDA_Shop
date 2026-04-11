import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { Link } from "react-router";
import { Language, Currency } from "../types";
import { ArtworkData } from "../data/artworks";
import { getTranslation } from "../data/translations";
import { formatPrice } from "../utils/formatPrice";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useGlobalContext } from "../pages/Root";

interface Props {
  artwork: ArtworkData | null;
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  currency: Currency;
}

const SIZES = ["XS", "S", "M", "L", "XL"];

export function QuickViewModal({ artwork, isOpen, onClose, language, currency }: Props) {
  const [selectedSize, setSelectedSize] = useState("M");
  const { addToCart } = useGlobalContext();
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);

  if (!artwork) return null;

  const handleAddToCart = () => {
    addToCart({
      artworkId: artwork.id,
      artworkName: artwork.name[language],
      price: artwork.price[currency],
      currency,
      size: selectedSize,
      imageUrl: artwork.imageUrl,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 z-[60]"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] bg-black w-full max-w-2xl mx-4 flex flex-col sm:flex-row"
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors duration-200 z-10"
            >
              <X size={14} strokeWidth={1.5} />
            </button>

            {/* Image */}
            <div className="sm:w-2/5 aspect-[3/4] sm:aspect-auto">
              <ImageWithFallback
                src={artwork.imageUrl}
                alt={artwork.name[language]}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Info */}
            <div className="sm:w-3/5 p-8 flex flex-col justify-center space-y-6">
              <div>
                <h3 className="text-white text-sm font-extralight tracking-[0.2em] mb-3">
                  {artwork.name[language]}
                </h3>
                <p className="text-white text-2xl font-extralight tracking-wider">
                  {formatPrice(artwork.price[currency], currency)}
                </p>
              </div>

              {/* Size */}
              <div className="space-y-2">
                <p className="text-white/40 text-[10px] font-light tracking-[0.3em] uppercase">
                  {t("size")}
                </p>
                <div className="flex gap-2">
                  {SIZES.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-10 h-10 flex items-center justify-center text-xs font-light tracking-wide transition-all duration-200 ${
                        selectedSize === size
                          ? "bg-white text-black"
                          : "border border-white/20 text-white hover:border-white/50"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleAddToCart}
                  className="w-full py-3.5 bg-white text-black text-xs font-light tracking-[0.25em] uppercase hover:bg-white/90 transition-colors duration-200"
                >
                  {t("addToCart")}
                </button>
                <Link
                  to={`/${language}/product/${artwork.id}`}
                  onClick={onClose}
                  className="block w-full py-3 border border-white/20 text-white text-xs font-light tracking-[0.25em] uppercase text-center hover:border-white/50 transition-colors duration-200"
                >
                  View Details
                </Link>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
