import { useState } from "react";
import { motion } from "motion/react";
import { Link } from "react-router";
import { artworks, ArtworkData } from "../data/artworks";
import { useGlobalContext } from "./Root";
import { getTranslation } from "../data/translations";
import { formatPrice } from "../utils/formatPrice";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { QuickViewModal } from "../components/QuickViewModal";

type SortKey = "newest" | "priceAsc" | "priceDesc";

function sortArtworks(items: ArtworkData[], sort: SortKey, currency: "USD" | "JPY" | "EUR") {
  const copy = [...items];
  if (sort === "priceAsc") return copy.sort((a, b) => a.price[currency] - b.price[currency]);
  if (sort === "priceDesc") return copy.sort((a, b) => b.price[currency] - a.price[currency]);
  return copy; // newest = original order
}

export function ArchivePage() {
  const { language, currency } = useGlobalContext();
  const [sort, setSort] = useState<SortKey>("newest");
  const [quickViewItem, setQuickViewItem] = useState<ArtworkData | null>(null);

  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);
  const sorted = sortArtworks(artworks, sort, currency);

  const sortOptions: { key: SortKey; label: string }[] = [
    { key: "newest", label: t("sortNewest") },
    { key: "priceAsc", label: t("sortPriceAsc") },
    { key: "priceDesc", label: t("sortPriceDesc") },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* ── TOP BAR ─────────────────────────────────────────────── */}
      <div className="sticky top-14 z-30 bg-white/95 backdrop-blur-sm border-b border-black/5">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-4 flex items-center justify-between">
          {/* Collection title + count */}
          <div className="flex items-center gap-4">
            <h1 className="text-black text-xs font-light tracking-[0.3em] uppercase">
              {t("shop")}
            </h1>
            <span className="text-black/30 text-[10px] font-light">
              {sorted.length}
            </span>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-1">
            {sortOptions.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSort(key)}
                className={`text-[10px] font-light tracking-widest uppercase px-3 py-1.5 transition-all duration-200 ${
                  sort === key
                    ? "text-black"
                    : "text-black/30 hover:text-black/60"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── PRODUCT GRID ─────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
          {sorted.map((artwork, index) => (
            <motion.div
              key={artwork.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{
                duration: 0.6,
                delay: (index % 4) * 0.05,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <ProductCard
                artwork={artwork}
                language={language}
                currency={currency}
                onQuickView={() => setQuickViewItem(artwork)}
              />
            </motion.div>
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-24 text-center">
          <p className="text-black/20 text-[10px] font-light tracking-[0.3em] uppercase">
            {language === "ja"
              ? "すべての作品は限定生産です"
              : language === "fr"
              ? "Toutes les pièces sont en édition limitée"
              : "All pieces are limited edition"}
          </p>
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        artwork={quickViewItem}
        isOpen={quickViewItem !== null}
        onClose={() => setQuickViewItem(null)}
        language={language}
        currency={currency}
      />
    </div>
  );
}

// ── ProductCard ────────────────────────────────────────────────────
interface ProductCardProps {
  artwork: ArtworkData;
  language: "en" | "ja" | "fr" | "es" | "ko" | "zh";
  currency: "USD" | "JPY" | "EUR";
  onQuickView: () => void;
}

function ProductCard({ artwork, language, currency, onQuickView }: ProductCardProps) {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);

  return (
    <div className="group">
      {/* Image container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-black/5 mb-4">
        <Link to={`/product/${artwork.id}`}>
          <ImageWithFallback
            src={artwork.imageUrl}
            alt={artwork.name[language]}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
        </Link>

        {/* Quick View — appears on hover */}
        <button
          onClick={onQuickView}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] font-light tracking-[0.2em] uppercase px-5 py-2.5 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 whitespace-nowrap backdrop-blur-sm"
        >
          {t("quickView")}
        </button>
      </div>

      {/* Card info — image / name / price only */}
      <div className="space-y-1.5">
        <Link to={`/product/${artwork.id}`}>
          <h3 className="text-black text-xs font-light tracking-widest uppercase opacity-70 group-hover:opacity-100 transition-opacity duration-200">
            {artwork.shortName}
          </h3>
        </Link>
        <p className="text-black/60 text-xs font-light tracking-wide">
          {artwork.name[language]}
        </p>
        <p className="text-black text-sm font-extralight tracking-wider">
          {formatPrice(artwork.price[currency], currency)}
        </p>
      </div>
    </div>
  );
}
