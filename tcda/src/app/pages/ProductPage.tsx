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
import { Copy, Check } from "lucide-react";
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

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
  const { language, currency, rates, addToCart, countryCode, addRecentProduct } = useGlobalContext();
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
  const [copied, setCopied] = useState(false);
  const [sizeUnit, setSizeUnit] = useState<"cm" | "inch">("cm");
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [sizeChart, setSizeChart] = useState<SizeChart | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [deliveryDate, setDeliveryDate] = useState<{ min: string; max: string } | null>(null);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifySubmitted, setNotifySubmitted] = useState(false);
  const [reviews, setReviews] = useState<{ rating: number; name?: string; body?: string; created_at: string }[]>([]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    setLoading(true);
    setSizeChart(null);
    fetch(`https://api.tcdashop.com/products/${id}?lang=${language}`)
      .then((res) => { if (!res.ok) throw new Error(`API ${res.status}`); return res.json(); })
      .then(async (data: Product) => {
        setProduct(data);
        addRecentProduct({
          id: data.id,
          name: data.name,
          price: data.price,
          imageUrl: data.images?.[0] || data.thumbnail_url,
        });
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

  useEffect(() => {
    if (!id) return;
    fetch(`https://api.tcdashop.com/reviews/${id}`)
      .then((r) => r.json())
      .then((d) => setReviews(d.reviews ?? []))
      .catch(() => {});
  }, [id]);

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
        <meta name="description" content={product.description || product.fabric_composition || "Transcend Color Digital Apparel — アートを着る、感性を解放する。"} />
        <meta property="og:type" content="product" />
        <meta property="og:title" content={`${product.name} | TCDA`} />
        <meta property="og:description" content={product.description || product.fabric_composition || "Transcend Color Digital Apparel — アートを着る、感性を解放する。"} />
        <meta property="og:url" content={`https://tcdashop.com/${language}/product/${product.id}`} />
        <meta property="og:image" content={product.images?.[0] || product.thumbnail_url} />
        <meta property="og:site_name" content="TCDA" />
        <meta property="product:price:amount" content={String(product.price)} />
        <meta property="product:price:currency" content="JPY" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${product.name} | TCDA`} />
        <meta name="twitter:description" content={product.description || product.fabric_composition || "Transcend Color Digital Apparel — アートを着る、感性を解放する。"} />
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
      <div className="px-4 sm:px-6 md:px-10 lg:px-20 py-6 max-w-7xl mx-auto">
        <Link
          to={`/${language}/products`}
          className="text-black text-xs font-light tracking-[0.3em] uppercase opacity-40 hover:opacity-100 transition-opacity duration-300"
        >
          {t("product.backToShop")}
        </Link>
      </div>

      {/* MAIN: image + info */}
      <section className="px-4 sm:px-6 md:px-10 lg:px-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-start">
          {/* Left: Image */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-4"
          >
            {/* Main image */}
            <div className="relative aspect-[3/4] bg-black/5">
              <Zoom>
                <ImageWithFallback
                  src={images[currentImageIndex] || product.thumbnail_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </Zoom>
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
                    className={`flex-shrink-0 w-12 sm:w-16 aspect-[3/4] overflow-hidden bg-black/5 transition-all duration-200 ${
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
            {product.stock === 0 ? (
              <p className="text-red-500 text-xs font-light tracking-widest">
                {t("product.outOfStock")}
              </p>
            ) : product.stock <= 5 ? (
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
                    className={`w-12 h-12 md:w-14 md:h-14 flex items-center justify-center text-[11px] md:text-xs font-light tracking-widest uppercase transition-all duration-300 ${
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

            {/* ADD TO CART / RESTOCK NOTIFY */}
            {product.stock === 0 ? (
              <div className="space-y-3">
                {notifySubmitted ? (
                  <p className="text-black/50 text-xs font-light tracking-widest text-center py-4">
                    {t("product.notifyRegistered")}
                  </p>
                ) : (
                  <>
                    <input
                      type="email"
                      value={notifyEmail}
                      onChange={(e) => setNotifyEmail(e.target.value)}
                      placeholder={t("product.notifyEmailPlaceholder")}
                      className="w-full border border-black/20 px-4 py-3 text-xs font-light tracking-wide focus:outline-none focus:border-black/60 placeholder:text-black/30"
                    />
                    <button
                      onClick={async () => {
                        if (!notifyEmail) return;
                        await fetch("https://api.tcdashop.com/restock-notify", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            email: notifyEmail,
                            product_id: product.id,
                            size: selectedSize || null,
                          }),
                        });
                        setNotifySubmitted(true);
                      }}
                      disabled={!notifyEmail}
                      className="w-full py-4 bg-black text-white text-xs font-light tracking-[0.3em] uppercase hover:bg-black/80 transition-colors duration-300 disabled:opacity-30"
                    >
                      {t("product.notifyMe")}
                    </button>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={handleAddToCart}
                disabled={!selectedSize}
                className="w-full py-4 bg-black text-white text-xs font-light tracking-[0.3em] uppercase hover:bg-black/80 transition-colors duration-300 disabled:opacity-30"
              >
                {added ? t("cart.added") : t("cart.addToCart")}
              </button>
            )}

            {/* SNS Share */}
            <div className="flex items-center gap-3 mt-4">
              <span className="text-sm text-gray-500">{t('share')}:</span>
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(product.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-60 hover:opacity-100 transition-opacity"
                aria-label="Share on X"
              >
                <img src="/icons/x.svg" className="w-5 h-5" alt="X" style={{ filter: 'invert(1)' }} />
              </a>
              <a
                href={`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-60 hover:opacity-100 transition-opacity"
                aria-label="Share on LINE"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" className="w-5 h-5">
                  <rect width="36" height="36" rx="8" fill="#06C755"/>
                  <path d="M30 17.2C30 11.55 24.63 7 18 7S6 11.55 6 17.2c0 5.07 4.5 9.32 10.57 10.12.41.09.97.27 1.11.62.13.32.08.82.04 1.14l-.18 1.08c-.05.32-.25 1.24 1.09.68 1.33-.57 7.2-4.24 9.82-7.26C29.19 21.4 30 19.39 30 17.2z" fill="#fff"/>
                  <path d="M15.05 14.77h-.93a.26.26 0 0 0-.26.26v5.77c0 .14.12.26.26.26h.93c.14 0 .26-.12.26-.26v-5.77a.26.26 0 0 0-.26-.26zM21.87 14.77h-.93a.26.26 0 0 0-.26.26v3.43l-2.64-3.57a.27.27 0 0 0-.21-.12h-.95a.26.26 0 0 0-.26.26v5.77c0 .14.12.26.26.26h.93c.14 0 .26-.12.26-.26v-3.43l2.65 3.57a.26.26 0 0 0 .21.11h.94c.14 0 .26-.12.26-.26v-5.77a.26.26 0 0 0-.26-.26zM13.16 19.61h-2.54v-4.58a.26.26 0 0 0-.26-.26h-.93a.26.26 0 0 0-.26.26v5.77c0 .07.03.13.07.18.05.04.11.07.18.07h3.74c.14 0 .26-.12.26-.26v-.92a.26.26 0 0 0-.26-.26zM26.57 16.22c.14 0 .26-.12.26-.26v-.93a.26.26 0 0 0-.26-.26h-3.74a.25.25 0 0 0-.18.07.25.25 0 0 0-.08.18v5.77c0 .07.03.13.08.18a.25.25 0 0 0 .18.07h3.74c.14 0 .26-.12.26-.26v-.92a.26.26 0 0 0-.26-.26h-2.54v-.98h2.54c.14 0 .26-.12.26-.26v-.93a.26.26 0 0 0-.26-.26h-2.54v-.97z" fill="#06C755"/>
                </svg>
              </a>
              <a
                href={`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(window.location.href)}&media=${encodeURIComponent(product.images?.[0] || product.thumbnail_url || '')}&description=${encodeURIComponent(product.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-60 hover:opacity-100 transition-opacity"
                aria-label="Save to Pinterest"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" fill="#E60023"/>
                </svg>
              </a>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="opacity-60 hover:opacity-100 transition-opacity text-gray-600"
                aria-label={copied ? t('copied') : t('copy_link')}
              >
                {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>

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
      <section className="px-4 sm:px-6 md:px-10 lg:px-20 max-w-7xl mx-auto mt-24 space-y-16 pb-32">
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

        {/* Reviews */}
        {reviews.length > 0 && (() => {
          const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="border-t border-black/10 pt-8"
            >
              <div className="flex items-baseline gap-4 mb-6">
                <h2 className="text-black text-xs font-light tracking-[0.3em] uppercase">
                  {t("reviews.title")}
                </h2>
                <span className="text-black/40 text-[10px] font-light tracking-wider">
                  {"★".repeat(Math.round(avg))}{"☆".repeat(5 - Math.round(avg))} {avg.toFixed(1)} ({reviews.length})
                </span>
              </div>
              <div className="space-y-6">
                {reviews.map((r, i) => (
                  <div key={i} className="border-b border-black/5 pb-6 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-black/60 tracking-wider">
                          {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                        </span>
                        <span className="text-[10px] font-light tracking-wider text-black/50">
                          {r.name || t("reviews.anonymous")}
                        </span>
                      </div>
                      <span className="text-[9px] text-black/30 tracking-wider">
                        {new Date(r.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {r.body && (
                      <p className="text-[11px] font-light text-black/60 leading-relaxed tracking-wide">
                        {r.body}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })()}
      </section>
    </div>
  );
}
