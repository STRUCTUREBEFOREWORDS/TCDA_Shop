import { useParams, Link } from "react-router";
import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useGlobalContext } from "./Root";
import { useTranslation } from "react-i18next";
import { formatPrice } from "../utils/formatPrice";
import { FitLabelNormalized, ProductFitMetadata } from "../types";
import { SizeGuideModal } from "../components/SizeGuideModal";

import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { FaqAccordion } from "../components/FaqAccordion";

interface Variant {
  id: number;
  size: string;
  color: string;
  retail_price: string;
  availability_status: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  thumbnail_url: string;
  images?: string[];
  sizes: string[];
  stock: number;
  variants: Variant[];
  size_category?: string;
  gender_type?: "mens" | "womens" | "unisex";
  fabric_composition?: string;
  description?: string;
  printful_variant_id?: number;
  product_type?: string | null;
  measuring_guide_image_url?: string | null;
  fit_metadata?: ProductFitMetadata | null;
  printful_description?: string | null;
  printful_product_type?: string | null;
}

interface SizeChartUnit {
  sizes: Record<string, number[]>;
  measurements: string[];
}

interface SizeChart {
  chart_data: {
    unit_cm: SizeChartUnit;
    unit_inch: SizeChartUnit;
    measure_yourself_cm?: SizeChartUnit;
    measure_yourself_inch?: SizeChartUnit;
    measure_yourself_image_url?: string;
    measure_yourself_description?: string;
  };
}


const FIT_LABEL_MAP: Record<FitLabelNormalized, string> = {
  slim:     "fit.slim",
  regular:  "fit.regular",
  relaxed:  "fit.relaxed",
  oversized:"fit.oversized",
  unknown:  "fit.unknown",
};



export function ProductPage() {
  const { id } = useParams();
  const { language, currency, rates, addToCart, countryCode } = useGlobalContext();
const { t } = useTranslation();
  
  const PURCHASE_FAQ_KEYS = [
    "sizeHelp", "oversized", "deliveryTime", "returns", "colorDifference", "orderChange",
  ] as const;
  const purchaseFaqItems = PURCHASE_FAQ_KEYS.map((key) => ({
    q: t(`faq.${key}.q`),
    a: t(`faq.${key}.a`),
  }));
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [added, setAdded] = useState(false);
  const [sizeUnit, setSizeUnit] = useState<"cm" | "inch">("cm");
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [sizeChart, setSizeChart] = useState<SizeChart | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [deliveryDate, setDeliveryDate] = useState<{ min: string; max: string } | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    setLoading(true);
    setSizeChart(null);
    fetch(`https://api.tcdashop.com/products/${id}?lang=${language}`)
      .then((res) => { if (!res.ok) throw new Error(`API ${res.status}`); return res.json(); })
      .then(async (data: Product) => {
        setProduct(data);
        const imageList = data.images?.length ? data.images : [data.thumbnail_url];
        setImages(imageList);
        setCurrentImageIndex(0);
        if (data.sizes?.length) setSelectedSize(data.sizes[0]);
        if (data.size_category) {
          const chartRes = await fetch(`https://api.tcdashop.com/size-charts/${data.size_category}`);
          const chartData = await chartRes.json();
          setSizeChart(chartData);
        }
        if (data.printful_variant_id) {
          fetch(`https://api.tcdashop.com/shipping/rates?country_code=${countryCode}&variant_id=${data.printful_variant_id}`)
            .then((r) => r.json())
            .then((d) => {
              if (d.min_delivery_date && d.max_delivery_date) {
                setDeliveryDate({ min: d.min_delivery_date, max: d.max_delivery_date });
              }
            })
            .catch(() => {});
        }
      })
      .finally(() => setLoading(false));
  }, [id, countryCode, language]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-black text-sm font-light tracking-widest opacity-40">{t("common.loading")}</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-black text-sm font-light tracking-widest opacity-40">{t("product.notFound")}</p>
      </div>
    );
  }

  const convertedPrice = Math.round(product.price * rates[currency]);

  const handleAddToCart = () => {
    if (!selectedSize) return;
    addToCart({
      artworkId: product.id,
      artworkName: product.name,
      price: convertedPrice,
      price_jpy: product.price,
      currency,
      size: selectedSize,
      imageUrl: product.images?.[0] || product.thumbnail_url,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white pt-20">
      <Helmet>
        <title>{product.name} | TCDA</title>
        <meta name="description" content={product.fabric_composition || "Transcend Color Digital Apparel — アートを着る、感性を解放する。"} />
        <meta property="og:type" content="product" />
        <meta property="og:title" content={`${product.name} | TCDA`} />
        <meta property="og:description" content={product.fabric_composition || "Transcend Color Digital Apparel — アートを着る、感性を解放する。"} />
        <meta property="og:url" content={`https://tcdashop.com/${language}/product/${product.id}`} />
        <meta property="og:image" content={product.images?.[0] || product.thumbnail_url} />
        <meta property="og:site_name" content="TCDA" />
        <meta property="product:price:amount" content={String(product.price)} />
        <meta property="product:price:currency" content="JPY" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${product.name} | TCDA`} />
        <meta name="twitter:image" content={product.images?.[0] || product.thumbnail_url} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": product.name,
            "image": images.length > 0 ? images : [product.thumbnail_url],
            "description": product.description || product.fabric_composition || "Transcend Color Digital Apparel",
            "brand": {
              "@type": "Brand",
              "name": "TCDA"
            },
            "offers": {
              "@type": "Offer",
              "url": `https://tcdashop.com/${language}/product/${product.id}`,
              "priceCurrency": "JPY",
              "price": product.price,
              "availability": product.stock > 0
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
              "seller": {
                "@type": "Organization",
                "name": "TCDA"
              }
            }
          })}
        </script>
      </Helmet>
      {/* BACK */}
      <div className="px-8 md:px-20 py-6 max-w-7xl mx-auto">
        <Link
          to={`/${language}/products`}
          className="text-black text-xs font-light tracking-[0.3em] uppercase opacity-40 hover:opacity-100 transition-opacity duration-300"
        >
          ← BACK
        </Link>
      </div>

      {/* MAIN: image + info */}
      <section className="px-8 md:px-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
          {/* Left: Image */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-4"
          >
            {/* Main image */}
            <div className="relative aspect-[3/4] overflow-hidden bg-black/5">
              <ImageWithFallback
                src={images[currentImageIndex] || product.thumbnail_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex((i) => Math.max(i - 1, 0))}
                    disabled={currentImageIndex === 0}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-white/80 text-black disabled:opacity-20 transition-opacity duration-200"
                    aria-label={t("product.prevImage")}
                  >
                    ‹
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex((i) => Math.min(i + 1, images.length - 1))}
                    disabled={currentImageIndex === images.length - 1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-white/80 text-black disabled:opacity-20 transition-opacity duration-200"
                    aria-label={t("product.nextImage")}
                  >
                    ›
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImageIndex(i)}
                    className={`flex-shrink-0 w-16 aspect-[3/4] overflow-hidden bg-black/5 transition-all duration-200 ${
                      i === currentImageIndex ? "ring-1 ring-black" : "opacity-50 hover:opacity-80"
                    }`}
                  >
                    <ImageWithFallback
                      src={src}
                      alt={`${product.name} ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Right: Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-8 pt-4"
          >
            {/* Name */}
            <h1 className="text-black text-2xl font-light tracking-widest uppercase">
              {product.name}
            </h1>

            {/* Price */}
            <p className="text-black text-xl font-light">
              {formatPrice(convertedPrice, currency)}
            </p>
            <p className="text-black/40 text-[10px] font-light tracking-wide -mt-6">
              {t("cart.taxNote")}
            </p>

            {/* Stock */}
            {product.stock <= 5 ? (
              <p className="text-red-500 text-xs font-light tracking-widest">
                {t("product.stockRemaining", { count: product.stock })}
              </p>
            ) : (
              <p className="text-black text-xs font-light opacity-40 tracking-widest">
                {t("product.stockRemaining", { count: product.stock })}
              </p>
            )}

            {/* Size selection */}
            <div>
              <p className="text-black text-xs font-light tracking-[0.3em] uppercase opacity-40 mb-4">
                {t("size.label")}
              </p>
              <div className="flex flex-wrap gap-3">
                {(product.sizes ?? ["XS", "S", "M", "L", "XL", "2XL"]).map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-14 h-14 flex items-center justify-center text-xs font-light tracking-widest uppercase transition-all duration-300 ${
                      selectedSize === size
                        ? "bg-black text-white"
                        : "bg-white text-black border border-black/20 hover:border-black/60"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* ADD TO CART */}
            <button
              onClick={handleAddToCart}
              disabled={!selectedSize}
              className="w-full py-4 bg-black text-white text-xs font-light tracking-[0.3em] uppercase hover:bg-black/80 transition-colors duration-300 disabled:opacity-30"
            >
              {added ? t("cart.added") : t("cart.addToCart")}
            </button>

            {/* Trust Block */}
            <div className="pt-4 pb-2">
              <ul className="space-y-1.5 mb-3">
                {(["processed", "delivered", "supported"] as const).map((key) => (
                  <li key={key} className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-black/25 flex-shrink-0" />
                    <span className="text-black/45 text-[10px] font-light leading-relaxed">
                      {t(`trust.${key}`)}
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                to={`/${language}/shipping-returns`}
                className="text-black/30 text-[10px] font-light tracking-widest uppercase hover:text-black/60 transition-colors duration-200"
              >
                {t("trust.shippingReturnsLink")} →
              </Link>
            </div>

            {/* Delivery */}
            <div className="border-t border-black/10 pt-6">
              <p className="text-black text-xs font-light tracking-widest uppercase opacity-40 mb-2">
                {t("product.deliveryLabel")}
              </p>
              <p className="text-black text-xs font-light opacity-60 leading-relaxed">
                {t("product.deliveryText")}
              </p>
            </div>

            {/* Model info */}
            <div className="border-t border-black/10 pt-6">
              <p className="text-black text-xs font-light tracking-widest uppercase opacity-40 mb-2">
                {t("product.modelLabel")}
              </p>
              <div className="space-y-1">
                {product.gender_type !== "womens" && (
                  <p className="text-black text-xs font-light opacity-60 leading-relaxed">
                    {t("product.mensModel")}
                  </p>
                )}
                {product.gender_type !== "mens" && (
                  <p className="text-black text-xs font-light opacity-60 leading-relaxed">
                    {t("product.womensModel")}
                  </p>
                )}
                <p className="text-black text-xs font-light opacity-30 leading-relaxed mt-2">
                  {t("product.aiModelNote")}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* DETAILS SECTION */}
      <section className="px-8 md:px-20 max-w-7xl mx-auto mt-24 space-y-16 pb-32">
        {/* Material */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="border-t border-black/10 pt-8"
        >
          <h2 className="text-black text-xs font-light tracking-[0.3em] uppercase mb-4">
            {t("product.materialDetailsLabel")}
          </h2>
          <p className="text-black text-sm font-light opacity-60 leading-relaxed whitespace-pre-line">
            {product.fabric_composition || '100% polyester, sublimation print. Machine wash cold. Do not tumble dry. All-over dye sublimation process produces vibrant, fade-resistant graphics that are part of the fabric itself.'}
          </p>
        </motion.div>

        {/* Description */}
        {product.description && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="border-t border-black/10 pt-8"
          >
            <h2 className="text-black text-xs font-light tracking-[0.3em] uppercase mb-4">
              {t("product.descriptionLabel")}
            </h2>
            <p className="text-black text-sm font-light opacity-60 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </motion.div>
        )}

        {/* Fit summary + size guide */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="border-t border-black/10 pt-8"
        >
          <h2 className="text-black text-xs font-light tracking-[0.3em] uppercase mb-4">
            {t("size.guide")}
          </h2>

          {product.fit_metadata && product.fit_metadata.fit_label_normalized !== "unknown" && (
            <div className="mb-5 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-black text-xs font-light tracking-widest uppercase opacity-40">
                  {t("sizeGuide.fit")}
                </span>
                <span className="text-black text-xs font-light tracking-[0.2em] uppercase">
                  {t(FIT_LABEL_MAP[product.fit_metadata.fit_label_normalized])}
                </span>
              </div>
              {product.fit_metadata.model_height_cm && product.fit_metadata.model_wear_size && (
                <p className="text-black/50 text-xs font-light">
                  {product.fit_metadata.model_height_cm}cm / {product.fit_metadata.model_wear_size}
                  {product.fit_metadata.is_ai_model && (
                    <span className="ml-2 opacity-50">{t("product.aiModelNote")}</span>
                  )}
                </p>
              )}
              {product.fit_metadata.recommendation_note && (
                <p className="text-black/50 text-xs font-light leading-relaxed">
                  {product.fit_metadata.recommendation_note}
                </p>
              )}
            </div>
          )}

          <button
            onClick={() => setSizeGuideOpen(true)}
            className="text-black text-xs font-light tracking-[0.3em] uppercase opacity-50 hover:opacity-100 transition-opacity duration-300 border-b border-black/20 pb-0.5"
          >
            {t("sizeGuide.seeGuide")} →
          </button>
        </motion.div>

        <SizeGuideModal
          isOpen={sizeGuideOpen}
          onClose={() => setSizeGuideOpen(false)}
          productName={product.name}
          productType={product.product_type}
          sizeCategory={product.size_category}
          sizeChart={sizeChart}
          sizeUnit={sizeUnit}
          onSwitchUnit={setSizeUnit}
          fitMetadata={product.fit_metadata}
          measuringGuideImageUrl={product.measuring_guide_image_url}
        />

        {/* Delivery date */}
        {deliveryDate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="border-t border-black/10 pt-8"
          >
            <h2 className="text-black text-xs font-light tracking-[0.3em] uppercase mb-4">
              {t("product.deliveryLabel")}
            </h2>
            <p className="text-black text-sm font-light opacity-60 leading-relaxed">
              {deliveryDate.min} 〜 {deliveryDate.max}
            </p>
          </motion.div>
        )}

        {/* Notes */}
        {product.description && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="border-t border-black/10 pt-8"
          >
            <h2 className="text-black text-xs font-light tracking-[0.3em] uppercase mb-4">
              {t("product.notesTitle")}
            </h2>
            <ul className="text-black text-sm font-light opacity-60 leading-relaxed space-y-2">
              <li>{t("product.notesItem1")}</li>
              <li>{t("product.notesItem2")}</li>
            </ul>
          </motion.div>
        )}

        {/* Shipping & Returns */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="border-t border-black/10 pt-8"
        >
          <h2 className="text-black text-xs font-light tracking-[0.3em] uppercase mb-4">
            {t("checkout.shippingInfo")}
          </h2>
          <p className="text-black text-sm font-light opacity-60 leading-relaxed">
            {t("checkout.shippingReturnsText")}
          </p>
        </motion.div>

        {/* Purchase FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="border-t border-black/10 pt-8"
        >
          <h2 className="text-black text-xs font-light tracking-[0.3em] uppercase mb-6">
            {t("faq.purchaseTitle")}
          </h2>
          <FaqAccordion items={purchaseFaqItems} />
        </motion.div>
      </section>
    </div>
  );
}
