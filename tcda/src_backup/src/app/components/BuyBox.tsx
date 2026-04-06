import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Language } from "../types";
import { getTranslation } from "../data/translations";

const SIZES = ["XS", "S", "M", "L", "XL"] as const;
type Size = (typeof SIZES)[number];

// Mock stock per size
const MOCK_STOCK: Record<Size, number> = {
  XS: 8,
  S: 12,
  M: 3,
  L: 10,
  XL: 1,
};

interface BuyBoxProps {
  name: string;
  price: string;
  selectedSize: string;
  onSizeChange: (size: string) => void;
  onBuyNow: () => void;
  onAddToCart: () => void;
  language: Language;
  onOpenSizeGuide: () => void;
  material: string;
}

function StockLabel({ stock, language }: { stock: number; language: Language }) {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);
  if (stock === 0) return <span className="text-red-400 text-[10px] font-light tracking-widest uppercase">{t("stockOut")}</span>;
  if (stock <= 2) return <span className="text-amber-400 text-[10px] font-light tracking-widest uppercase">{t("stockLow")} — {stock}</span>;
  return <span className="text-white/40 text-[10px] font-light tracking-widest uppercase">{t("stockAvailable")}</span>;
}

export function BuyBox({
  name,
  price,
  selectedSize,
  onSizeChange,
  onBuyNow,
  onAddToCart,
  language,
  onOpenSizeGuide,
  material,
}: BuyBoxProps) {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);
  const stock = MOCK_STOCK[selectedSize as Size] ?? 10;

  return (
    <div className="bg-black text-white px-8 py-10 lg:px-10 lg:py-12 h-full flex flex-col justify-center space-y-8">
      {/* Product name */}
      <div>
        <h1 className="text-white text-xl font-extralight tracking-[0.15em] leading-snug mb-4">
          {name}
        </h1>
        {/* Price */}
        <p className="text-white text-3xl font-extralight tracking-wider">{price}</p>
      </div>

      <div className="w-8 h-px bg-white/20" />

      {/* Size selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-white/40 text-[10px] font-light tracking-[0.3em] uppercase">
            {t("size")}
          </p>
          <button
            onClick={onOpenSizeGuide}
            className="text-white/30 text-[10px] font-light tracking-widest uppercase hover:text-white/70 transition-colors duration-300 underline underline-offset-4"
          >
            {t("sizeGuide")}
          </button>
        </div>

        <div className="flex gap-2">
          {SIZES.map((size) => {
            const sizeStock = MOCK_STOCK[size];
            const isSoldOut = sizeStock === 0;
            const isSelected = selectedSize === size;
            return (
              <button
                key={size}
                onClick={() => !isSoldOut && onSizeChange(size)}
                disabled={isSoldOut}
                className={`relative w-12 h-12 flex items-center justify-center text-xs font-light tracking-widest uppercase transition-all duration-300 ${
                  isSoldOut
                    ? "border border-white/10 text-white/20 cursor-not-allowed"
                    : isSelected
                    ? "bg-white text-black"
                    : "border border-white/20 text-white hover:border-white/60"
                }`}
              >
                {size}
                {isSelected && !isSoldOut && (
                  <motion.div
                    layoutId="sizeIndicator"
                    className="absolute inset-0 bg-white"
                    style={{ zIndex: -1 }}
                    transition={{ type: "spring", duration: 0.4 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Stock indicator */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedSize}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <StockLabel stock={stock} language={language} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Material */}
      <p className="text-white/30 text-[10px] font-light tracking-[0.2em] leading-relaxed">
        {material}
      </p>

      <div className="w-8 h-px bg-white/20" />

      {/* CTAs */}
      <div className="space-y-3">
        {/* Primary CTA */}
        <button
          onClick={onBuyNow}
          disabled={stock === 0}
          className="w-full py-4 bg-white text-black text-xs font-light tracking-[0.25em] uppercase hover:bg-white/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
        >
          {t("ctaText")}
        </button>

        {/* Add to Cart */}
        <button
          onClick={onAddToCart}
          disabled={stock === 0}
          className="w-full py-3.5 border border-white/30 text-white text-xs font-light tracking-[0.25em] uppercase hover:border-white/70 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
        >
          {t("addToCart")}
        </button>
      </div>
    </div>
  );
}
