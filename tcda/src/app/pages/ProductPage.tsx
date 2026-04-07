import { useParams, useNavigate, Link } from "react-router";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { artworks } from "../data/artworks";
import { getTranslation } from "../data/translations";
import { formatPrice } from "../utils/formatPrice";
import { useGlobalContext } from "./Root";
import { BuyBox } from "../components/BuyBox";
import { SizeGuideModal } from "../components/SizeGuideModal";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language, currency, addToCart } = useGlobalContext();
  const [selectedSize, setSelectedSize] = useState("M");
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [mobileCTAVisible, setMobileCTAVisible] = useState(false);
  const buyBoxRef = useRef<HTMLDivElement>(null);

  const artwork = artworks.find((a) => a.id === id);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    setSelectedSize("M");
  }, [id]);

  // Mobile sticky CTA: show when BuyBox scrolls out of view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setMobileCTAVisible(!entry.isIntersecting),
      { threshold: 0 }
    );
    if (buyBoxRef.current) observer.observe(buyBoxRef.current);
    return () => observer.disconnect();
  }, [artwork]);

  if (!artwork) {
    navigate("/");
    return null;
  }

  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);

  const handleBuyNow = () => {
    navigate("/checkout", {
      state: {
        artworkId: artwork.id,
        artworkName: artwork.name[language],
        price: artwork.price[currency],
        currency,
        size: selectedSize,
        imageUrl: artwork.imageUrl,
      },
    });
  };

  const handleAddToCart = () => {
    addToCart({
      artworkId: artwork.id,
      artworkName: artwork.name[language],
      price: artwork.price[currency],
      currency,
      size: selectedSize,
      imageUrl: artwork.imageUrl,
    });
  };

  // Related products: exclude current
  const related = artworks.filter((a) => a.id !== artwork.id);

  // Previous / next navigation
  const currentIndex = artworks.findIndex((a) => a.id === artwork.id);
  const prevArtwork = artworks[currentIndex - 1];
  const nextArtwork = artworks[currentIndex + 1];

  return (
    <div className="bg-black min-h-screen">
      <AnimatePresence mode="wait">
        <motion.div
          key={artwork.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* ── HERO: 2-COLUMN ───────────────────────────────────── */}
          {/* Desktop: left 60% sticky gallery / right 40% BuyBox   */}
          {/* Mobile: stacked image → BuyBox                        */}
          <div className="lg:flex lg:min-h-screen">
            {/* LEFT — Gallery (sticky on desktop) */}
            <div className="lg:w-[60%] lg:sticky lg:top-0 lg:h-screen bg-black overflow-hidden">
              <div className="relative h-[60vw] lg:h-full">
                <ImageWithFallback
                  src={artwork.imageUrl}
                  alt={artwork.name[language]}
                  className="w-full h-full object-cover"
                />
                {/* Subtle gradient at bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/40 to-transparent" />

                {/* Prev / Next nav (desktop) */}
                <div className="absolute bottom-8 right-8 hidden lg:flex gap-3">
                  {prevArtwork && (
                    <Link
                      to={`/product/${prevArtwork.id}`}
                      className="w-9 h-9 border border-white/20 flex items-center justify-center text-white/50 hover:text-white hover:border-white/60 transition-all duration-200"
                    >
                      <ChevronLeft size={14} strokeWidth={1.5} />
                    </Link>
                  )}
                  {nextArtwork && (
                    <Link
                      to={`/product/${nextArtwork.id}`}
                      className="w-9 h-9 border border-white/20 flex items-center justify-center text-white/50 hover:text-white hover:border-white/60 transition-all duration-200"
                    >
                      <ChevronRight size={14} strokeWidth={1.5} />
                    </Link>
                  )}
                </div>

                {/* Short name label */}
                <div className="absolute top-20 left-8">
                  <p className="text-white/30 text-[10px] font-light tracking-[0.4em] uppercase">
                    {artwork.shortName}
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT — BuyBox + scrollable content */}
            <div className="lg:w-[40%]">
              {/* BuyBox — visible in first viewport on desktop */}
              <div ref={buyBoxRef} className="lg:min-h-screen">
                <BuyBox
                  name={artwork.name[language]}
                  price={formatPrice(artwork.price[currency], currency)}
                  selectedSize={selectedSize}
                  onSizeChange={setSelectedSize}
                  onBuyNow={handleBuyNow}
                  onAddToCart={handleAddToCart}
                  language={language}
                  onOpenSizeGuide={() => setSizeGuideOpen(true)}
                  material={t("material")}
                />
              </div>

              {/* ── DETAILS ───────────────────────────────────────── */}
              <section className="bg-black px-8 lg:px-10 py-16 border-t border-white/10 space-y-10">
                {/* Color palette */}
                <div className="space-y-3">
                  <p className="text-white/30 text-[10px] font-light tracking-[0.3em] uppercase">
                    Palette
                  </p>
                  <div className="flex gap-2">
                    {artwork.colorPalette.map((color, i) => (
                      <div
                        key={i}
                        className="w-7 h-7 rounded-full border border-white/10"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                {/* Concept */}
                <div className="space-y-3">
                  <p className="text-white/30 text-[10px] font-light tracking-[0.3em] uppercase">
                    Concept
                  </p>
                  <p className="text-white/70 text-sm font-light leading-[180%]">
                    {artwork.concept[language]}
                  </p>
                </div>

                {/* Spec grid */}
                <div className="grid grid-cols-1 gap-4 pt-4 border-t border-white/10">
                  {[
                    { label: t("materialLabel"), value: t("material") },
                    { label: t("size"), value: t("sizeInfo") },
                    { label: "Edition", value: t("limited") },
                    { label: "Details", value: t("details") },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex gap-6">
                      <span className="text-white/30 text-[10px] font-light tracking-[0.2em] uppercase w-20 flex-shrink-0 pt-0.5">
                        {label}
                      </span>
                      <span className="text-white/60 text-xs font-light leading-relaxed">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              {/* ── TCDA PHILOSOPHY (compressed) ─────────────────── */}
              <section className="bg-black px-8 lg:px-10 py-12 border-t border-white/5">
                <p className="text-white/25 text-xs font-light leading-[200%] tracking-wide">
                  {t("philosophyBlock")}
                </p>
              </section>

              {/* ── RELATED PRODUCTS ──────────────────────────────── */}
              <section className="bg-black px-8 lg:px-10 py-16 border-t border-white/10">
                <p className="text-white/30 text-[10px] font-light tracking-[0.3em] uppercase mb-8">
                  {t("relatedProducts")}
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {related.slice(0, 4).map((rel) => (
                    <Link key={rel.id} to={`/product/${rel.id}`} className="group block">
                      <div className="aspect-[3/4] overflow-hidden bg-white/5 mb-3">
                        <ImageWithFallback
                          src={rel.imageUrl}
                          alt={rel.name[language]}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      </div>
                      <p className="text-white/60 text-[10px] font-light tracking-widest uppercase group-hover:text-white transition-colors duration-300">
                        {rel.shortName}
                      </p>
                      <p className="text-white/40 text-xs font-extralight mt-1">
                        {formatPrice(rel.price[currency], currency)}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* ── MOBILE STICKY CTA ───────────────────────────────────── */}
      <AnimatePresence>
        {mobileCTAVisible && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-t border-white/10 px-6 py-4 flex items-center gap-4"
          >
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-light truncate">{artwork.shortName}</p>
              <p className="text-white/50 text-xs font-extralight">
                {formatPrice(artwork.price[currency], currency)}
              </p>
            </div>
            <button
              onClick={handleBuyNow}
              className="flex-shrink-0 px-6 py-3 bg-white text-black text-xs font-light tracking-[0.2em] uppercase hover:bg-white/90 transition-colors duration-200"
            >
              {t("ctaText")}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Size Guide Modal */}
      <SizeGuideModal
        isOpen={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
        language={language}
      />
    </div>
  );
}
