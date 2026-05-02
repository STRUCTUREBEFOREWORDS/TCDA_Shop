import { useParams, Link, useLocation } from "react-router";
import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useGlobalContext } from "./Root";
import { useTranslation } from "react-i18next";
import { formatPrice } from "../utils/formatPrice";
import { applyPsychologicalPrice } from "../../utils/priceRounding";
import { pushDataLayer } from "../hooks/useDataLayer";
import { trackProductView, trackAddToCart } from "../utils/analytics";
import { FitLabelNormalized, ProductFitMetadata } from "../types";
import { SizeGuideModal } from "../components/SizeGuideModal";

import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { JsonLd } from "../components/JsonLd";
import { Copy, Check } from "lucide-react";

interface Variant {
  id: number;
  size: string;
  color: string;
  retail_price: string;
  availability_status: string;
}

interface FabricDetail {
  materials_eu?: string | string[] | Record<string, string>;
  materials_us?: string | string[] | Record<string, string>;
  weight_eu?: string | Record<string, string>;
  weight_us?: string | Record<string, string>;
  features?: string[] | Record<string, string[]>;
  certifications?: string[];
  origin?: string[] | Record<string, string[]>;
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
  gender_type?: "male" | "female" | "unisex";
  fabric_composition?: string;
  fabric_detail?: FabricDetail | null;
  description?: string;
  printful_variant_id?: number;
  product_type?: string | null;
  measuring_guide_image_url?: string | null;
  fit_metadata?: ProductFitMetadata | null;
  printful_description?: string | null;
  printful_product_type?: string | null;
  category?: string;
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

const SIZE_ORDER = ['2XS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL'];

const FIT_LABEL_MAP: Record<FitLabelNormalized, string> = {
  slim:     "fit.slim",
  regular:  "fit.regular",
  relaxed:  "fit.relaxed",
  oversized:"fit.oversized",
  unknown:  "fit.unknown",
};

interface AccordionItem {
  title: string;
  content: React.ReactNode;
}

function InfoAccordion({ items }: { items: AccordionItem[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div>
      {items.map((item, i) => (
        <div key={i} style={{ borderTop: "1px solid var(--color-border)" }}>
          <button
            className="w-full flex items-center justify-between py-4 text-left"
            onClick={() => setOpen(open === i ? null : i)}
          >
            <span
              className="uppercase"
              style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-caption)", letterSpacing: "normal", color: "var(--color-text)" }}
            >
              {item.title}
            </span>
            <span className="text-lg leading-none" style={{ color: "var(--color-text-tertiary)" }}>{open === i ? "−" : "+"}</span>
          </button>
          <AnimatePresence initial={false}>
            {open === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                style={{ overflow: "hidden" }}
              >
                <div
                  className="pb-5 text-xs font-light leading-loose"
                  style={{ fontFamily: "var(--font-body)", color: "var(--color-text-secondary)" }}
                >
                  {item.content}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

export function ProductPage() {
  const { id } = useParams();
  const { language, currency, rates, addToCart, countryCode, addRecentProduct } = useGlobalContext();
  const { pathname } = useLocation();
  const canonicalPath = pathname.replace(/^\/(en|ja|fr|es|ko|zh|de|it|pt|ar)/, "");
  const canonical = `https://tcdashop.com/en${canonicalPath}`;
  const { t } = useTranslation();

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
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: 'ViewContent',
          content_ids: [data.id],
          content_name: data.name,
          content_type: 'product',
          value: data.price,
          currency: 'JPY'
        });
        pushDataLayer('page_view', {
          page_type: 'product',
          product_name: data.name,
          product_category: (data as unknown as Record<string, unknown>).category,
          language,
          currency,
          country: countryCode,
        });
        trackProductView(data.id, language);
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
        <p className="text-sm font-light tracking-widest" style={{ color: "var(--color-text-tertiary)" }}>{t("common.loading")}</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm font-light tracking-widest" style={{ color: "var(--color-text-tertiary)" }}>{t("product.notFound")}</p>
      </div>
    );
  }

  const rawPrice = currency === "JPY" ? product.price : product.price * (rates[currency] ?? 1);
  const convertedPrice = applyPsychologicalPrice(rawPrice, currency);

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
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'AddToCart',
      content_ids: [product.id],
      content_name: product.name,
      content_type: 'product',
      value: product.price,
      currency: 'JPY'
    });
    trackAddToCart(product.id, currency, product.price);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const accordionItems: AccordionItem[] = [
    {
      title: t("size.guide"),
      content: (
        <div>
          {product.fit_metadata && product.fit_metadata.fit_label_normalized !== "unknown" && (
            <p className="mb-3">
              {t("sizeGuide.fit")}: {t(FIT_LABEL_MAP[product.fit_metadata.fit_label_normalized])}
              {product.fit_metadata.model_height_cm && product.fit_metadata.model_wear_size && (
                <span className="ml-2 opacity-70">
                  ({product.fit_metadata.model_height_cm}cm / {product.fit_metadata.model_wear_size})
                </span>
              )}
            </p>
          )}
          {product.fit_metadata?.recommendation_note && (
            <p className="mb-3 leading-relaxed">{product.fit_metadata.recommendation_note}</p>
          )}
          <button
            onClick={() => setSizeGuideOpen(true)}
            className="underline opacity-70 hover:opacity-100 transition-opacity duration-200"
          >
            {t("sizeGuide.seeGuide")} →
          </button>
        </div>
      ),
    },
    {
      title: t("checkout.shippingInfo"),
      content: (
        <div>
          <p className="leading-relaxed">{t("product.deliveryText")}</p>
          {deliveryDate && (
            <p className="mt-2 opacity-70">{deliveryDate.min} 〜 {deliveryDate.max}</p>
          )}
        </div>
      ),
    },
    {
      title: t("trust.shippingReturnsLink"),
      content: <p className="leading-relaxed">{t("checkout.shippingReturnsText")}</p>,
    },
  ];

  return (
    <div className="pt-20" style={{ background: "var(--color-bg)", color: "var(--color-text)" }}>
      <Helmet>
        <title>{`${product.name} — TCDA`}</title>
        <meta name="description" content={`Shop ${product.name} by TCDA. Worldwide shipping.`} />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="product" />
        <meta property="og:title" content={`${product.name} — TCDA`} />
        <meta property="og:description" content={`Shop ${product.name} by TCDA. Worldwide shipping.`} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={product.images?.[0] || product.thumbnail_url} />
        <meta property="og:site_name" content="TCDA" />
        <meta property="product:price:amount" content={String(product.price)} />
        <meta property="product:price:currency" content="JPY" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${product.name} — TCDA`} />
        <meta name="twitter:description" content={`Shop ${product.name} by TCDA. Worldwide shipping.`} />
        <meta name="twitter:image" content={product.images?.[0] || product.thumbnail_url} />
      </Helmet>
      <JsonLd type="Product" data={{
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        "image": images.length > 0 ? images : [product.thumbnail_url],
        "description": product.description || product.fabric_composition || "Transcend Creative Dimension Aura",
        "brand": { "@type": "Brand", "name": "TCDA" },
        "offers": {
          "@type": "Offer",
          "url": `https://tcdashop.com/${language}/product/${product.id}`,
          "priceCurrency": "JPY",
          "price": product.price,
          "availability": product.stock > 0
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
          "seller": { "@type": "Organization", "name": "TCDA" },
        },
      }} />

      {/* BACK */}
      <div className="px-4 sm:px-6 md:px-10 lg:px-20 py-6 max-w-7xl mx-auto">
        <Link
          to={`/${language}/products`}
          className="text-xs font-light tracking-[0.3em] uppercase transition-all duration-300"
          style={{ color: "var(--color-text-tertiary)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-text)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-tertiary)")}
        >
          ←
        </Link>
      </div>

      {/* MAIN: image + info */}
      <section className="px-4 sm:px-6 md:px-10 lg:px-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-[65%_35%] items-start">

          {/* Left: Main image + thumbnails */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col"
            style={{ gap: "4px" }}
          >
            {/* Main image — full width */}
            <div style={{ width: "100%", background: "#000000", aspectRatio: "2/3", overflow: "hidden", position: "relative" }}>
              <ImageWithFallback
                src={images[currentImageIndex] || product.thumbnail_url}
                alt={product.name}
                style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
                loading="eager"
                fetchPriority="high"
              />
            </div>

            {/* Thumbnails — horizontal scroll below main image */}
            {images.length > 1 && (
              <div
                className="flex flex-row overflow-x-auto"
                style={{ gap: "2px", scrollbarWidth: "none" } as React.CSSProperties}
              >
                {images.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImageIndex(i)}
                    style={{
                      width: "72px",
                      aspectRatio: "2/3",
                      flexShrink: 0,
                      background: "#000000",
                      border: i === currentImageIndex ? "1px solid rgba(255,255,255,0.6)" : "1px solid transparent",
                      opacity: i === currentImageIndex ? 1 : 0.5,
                      overflow: "hidden",
                    }}
                  >
                    <ImageWithFallback
                      src={src}
                      alt={`${product.name} ${i + 1}`}
                      className="w-full h-full object-cover"
                      loading="eager"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Right: Info (sticky) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col md:sticky md:top-20"
            style={{ paddingLeft: "clamp(0px, 5vw, 60px)", paddingTop: "clamp(24px, 5vw, 80px)" }}
          >
            {/* Gender + product type tag */}
            <p style={{ fontSize: "9px", letterSpacing: "0.25em", color: "var(--color-text-tertiary)", textTransform: "uppercase", marginBottom: "16px", fontFamily: "var(--font-body)", fontWeight: "var(--weight-light)" }}>
              {product.gender_type === "male" ? "MEN'S"
                : product.gender_type === "female" ? "WOMEN'S"
                : "UNISEX"}
              {product.product_type ? ` · ${product.product_type.replace(/_/g, " ").toUpperCase()}` : ""}
            </p>

            {/* Price */}
            <p style={{ fontFamily: "var(--font-body)", fontSize: "20px", color: "var(--color-accent)", marginBottom: "40px" }}>
              {formatPrice(convertedPrice, currency)}
            </p>

            {/* Stock */}
            {product.stock === 0 && (
              <p className="text-xs font-light tracking-widest mb-4" style={{ color: "var(--color-danger)" }}>
                {t("product.outOfStock")}
              </p>
            )}

            {/* Size selection */}
            <div>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-caption)", letterSpacing: "var(--ls-nav)", color: "var(--color-text-secondary)", marginBottom: "12px", textTransform: "uppercase" }}>
                {t("size.label")}
              </p>
              <div className="grid grid-cols-4" style={{ gap: "4px" }}>
                {[...(product.sizes ?? ["XS", "S", "M", "L", "XL", "2XL"])].sort((a, b) => {
                  const ai = SIZE_ORDER.indexOf(a);
                  const bi = SIZE_ORDER.indexOf(b);
                  return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
                }).map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className="flex items-center justify-center text-[11px] font-light tracking-widest uppercase transition-all duration-300"
                    style={selectedSize === size ? {
                      border: "1px solid var(--color-accent)",
                      color: "var(--color-accent)",
                      padding: "12px",
                    } : {
                      border: "1px solid var(--color-border)",
                      color: "var(--color-text-secondary)",
                      padding: "12px",
                    }}
                    onMouseEnter={(e) => {
                      if (selectedSize !== size) {
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)";
                        e.currentTarget.style.color = "rgba(255,255,255,0.8)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedSize !== size) {
                        e.currentTarget.style.borderColor = "var(--color-border)";
                        e.currentTarget.style.color = "var(--color-text-secondary)";
                      }
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Add to Cart */}
            {product.stock === 0 ? (
              <div className="space-y-3 mt-12">
                {notifySubmitted ? (
                  <p className="text-xs font-light tracking-widest text-center py-4" style={{ color: "var(--color-text-secondary)" }}>
                    {t("product.notifyRegistered")}
                  </p>
                ) : (
                  <>
                    <input
                      type="email"
                      value={notifyEmail}
                      onChange={(e) => setNotifyEmail(e.target.value)}
                      placeholder={t("product.notifyEmailPlaceholder")}
                      className="w-full bg-transparent px-4 py-3 text-xs font-light tracking-wide focus:outline-none"
                      style={{ border: "1px solid var(--color-border)", color: "var(--color-text)" }}
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
                      className="w-full py-4 text-xs font-light tracking-[0.3em] uppercase disabled:opacity-30"
                      style={{ background: "var(--color-bg)", color: "var(--color-text)", fontFamily: "var(--font-body)", transition: "var(--transition-base)" }}
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
                className="w-full text-xs uppercase disabled:opacity-30"
                style={{ background: "var(--color-accent)", color: "var(--color-bg)", fontFamily: "var(--font-body)", letterSpacing: "var(--ls-nav)", transition: "var(--transition-base)", marginTop: "32px", padding: "18px" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#ffffff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "var(--color-accent)"; }}
              >
                {added ? t("cart.added") : t("cart.addToCart")}
              </button>
            )}

            {/* SNS Share */}
            <div className="flex items-center gap-3 mt-6">
              <span className="text-sm" style={{ color: "var(--color-text-tertiary)" }}>{t('share')}:</span>
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(product.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-60 hover:opacity-100 transition-opacity"
                aria-label="Share on X"
              >
                <img src="/icons/x.svg" className="w-5 h-5" alt="X" />
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
                className="opacity-60 hover:opacity-100 transition-opacity"
                style={{ color: "var(--color-text-secondary)" }}
                aria-label={copied ? t('copied') : t('copy_link')}
              >
                {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>

            {/* Reviews */}
            {reviews.length > 0 && (() => {
              const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
              return (
                <div className="mt-6 pt-4 pb-2">
                  <div className="flex items-baseline gap-3 mb-3">
                    <span className="text-[11px] tracking-wider" style={{ color: "var(--color-text-secondary)" }}>
                      {"★".repeat(Math.round(avg))}{"☆".repeat(5 - Math.round(avg))}
                    </span>
                    <span className="text-[10px] font-light tracking-wider" style={{ color: "var(--color-text-tertiary)" }}>
                      {avg.toFixed(1)} ({reviews.length})
                    </span>
                  </div>
                  <div className="space-y-4">
                    {reviews.map((r, i) => (
                      <div key={i} className="pb-4 last:border-0" style={{ borderBottom: "1px solid var(--color-border)" }}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px]" style={{ color: "var(--color-text-secondary)" }}>
                              {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                            </span>
                            <span className="text-[10px] font-light" style={{ color: "var(--color-text-tertiary)" }}>
                              {r.name || t("reviews.anonymous")}
                            </span>
                          </div>
                          <span className="text-[9px]" style={{ color: "var(--color-text-tertiary)", opacity: 0.6 }}>
                            {new Date(r.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {r.body && (
                          <p className="text-[11px] font-light leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                            {r.body}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Info Accordion */}
            <div style={{ marginTop: "48px" }}>
              <InfoAccordion items={accordionItems} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* DETAILS SECTION */}
      <section className="px-4 sm:px-6 md:px-10 lg:px-20 max-w-7xl mx-auto mt-24 space-y-16 pb-16">
        {/* Material */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="pt-8"
          style={{ borderTop: "1px solid var(--color-border)" }}
        >
          <h2 className="text-xs font-light tracking-[0.3em] uppercase mb-6" style={{ color: "var(--color-text)" }}>
            {t("product.materialDetailsLabel")}
          </h2>
          {product.fabric_detail ? (() => {
            const getLocalizedList = (field: string[] | Record<string, string[]> | undefined): string[] => {
              if (!field) return [];
              if (Array.isArray(field)) return field;
              return field[language] ?? field["en"] ?? [];
            };
            const getLocalizedString = (field: string | string[] | Record<string, string> | undefined): string => {
              if (!field) return "";
              if (typeof field === "string") return field;
              if (Array.isArray(field)) return field.join(", ");
              return field[language] ?? field["en"] ?? "";
            };
            const features = getLocalizedList(product.fabric_detail.features);
            const origin = getLocalizedList(product.fabric_detail.origin);
            const matEu = getLocalizedString(product.fabric_detail.materials_eu);
            const matUs = getLocalizedString(product.fabric_detail.materials_us);
            const wtEu = getLocalizedString(product.fabric_detail.weight_eu);
            const wtUs = getLocalizedString(product.fabric_detail.weight_us);
            return (
            <div className="space-y-3" style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-caption)", color: "var(--color-text-secondary)" }}>
              {matEu && (
                <div className="flex gap-4">
                  <span className="shrink-0 uppercase tracking-[0.15em]" style={{ color: "var(--color-text-tertiary)", minWidth: "90px" }}>{t("product.fabricMaterialEu")}</span>
                  <span>{matEu}</span>
                </div>
              )}
              {matUs && (
                <div className="flex gap-4">
                  <span className="shrink-0 uppercase tracking-[0.15em]" style={{ color: "var(--color-text-tertiary)", minWidth: "90px" }}>{t("product.fabricMaterialUs")}</span>
                  <span>{matUs}</span>
                </div>
              )}
              {wtEu && (
                <div className="flex gap-4">
                  <span className="shrink-0 uppercase tracking-[0.15em]" style={{ color: "var(--color-text-tertiary)", minWidth: "90px" }}>{t("product.fabricWeightEu")}</span>
                  <span>{wtEu}</span>
                </div>
              )}
              {wtUs && (
                <div className="flex gap-4">
                  <span className="shrink-0 uppercase tracking-[0.15em]" style={{ color: "var(--color-text-tertiary)", minWidth: "90px" }}>{t("product.fabricWeightUs")}</span>
                  <span>{wtUs}</span>
                </div>
              )}
              {features.length > 0 && (
                <div className="flex gap-4">
                  <span className="shrink-0 uppercase tracking-[0.15em]" style={{ color: "var(--color-text-tertiary)", minWidth: "90px" }}>{t("product.fabricFeatures")}</span>
                  <ul className="space-y-1">
                    {features.map((f, i) => <li key={i}>{f}</li>)}
                  </ul>
                </div>
              )}
              {(product.fabric_detail.certifications?.length ?? 0) > 0 && (
                <div className="flex gap-4">
                  <span className="shrink-0 uppercase tracking-[0.15em]" style={{ color: "var(--color-text-tertiary)", minWidth: "90px" }}>{t("product.fabricCertifications")}</span>
                  <span>{product.fabric_detail.certifications!.join(", ")}</span>
                </div>
              )}
              {origin.length > 0 && (
                <div className="flex gap-4">
                  <span className="shrink-0 uppercase tracking-[0.15em]" style={{ color: "var(--color-text-tertiary)", minWidth: "90px" }}>{t("product.fabricOrigin")}</span>
                  <ul className="space-y-1">
                    {origin.map((o, i) => <li key={i}>{o}</li>)}
                  </ul>
                </div>
              )}
            </div>
            );
          })() : (
            <p className="text-sm font-light leading-relaxed whitespace-pre-line" style={{ color: "var(--color-text-secondary)" }}>
              {(() => {
                try {
                  const parsed = JSON.parse(product.fabric_composition ?? "");
                  return parsed?.materials_eu?.[language]
                    ?? parsed?.materials_eu?.en
                    ?? parsed?.materials_us?.[language]
                    ?? parsed?.materials_us?.en
                    ?? product.fabric_composition;
                } catch {
                  return product.fabric_composition;
                }
              })()}
            </p>
          )}
        </motion.div>

        {/* Fit summary + size guide */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="pt-8"
          style={{ borderTop: "1px solid var(--color-border)" }}
        >
          <h2 className="text-xs font-light tracking-[0.3em] uppercase mb-4" style={{ color: "var(--color-text)" }}>
            {t("size.guide")}
          </h2>

          {product.fit_metadata && product.fit_metadata.fit_label_normalized !== "unknown" && (
            <div className="mb-5 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-light tracking-widest uppercase" style={{ color: "var(--color-text-tertiary)" }}>
                  {t("sizeGuide.fit")}
                </span>
                <span className="text-xs font-light tracking-[0.2em] uppercase" style={{ color: "var(--color-text)" }}>
                  {t(FIT_LABEL_MAP[product.fit_metadata.fit_label_normalized])}
                </span>
              </div>
              {product.fit_metadata.model_height_cm && product.fit_metadata.model_wear_size && (
                <p className="text-xs font-light" style={{ color: "var(--color-text-secondary)" }}>
                  {product.fit_metadata.model_height_cm}cm / {product.fit_metadata.model_wear_size}
                  {product.fit_metadata.is_ai_model && (
                    <span className="ml-2 opacity-50">{t("product.aiModelNote")}</span>
                  )}
                </p>
              )}
              {product.fit_metadata.recommendation_note && (
                <p className="text-xs font-light leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                  {product.fit_metadata.recommendation_note}
                </p>
              )}
            </div>
          )}

          <button
            onClick={() => setSizeGuideOpen(true)}
            className="text-xs font-light tracking-[0.3em] uppercase transition-opacity duration-300 pb-0.5"
            style={{ color: "var(--color-text-secondary)", borderBottom: "1px solid var(--color-border)" }}
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
            className="pt-8"
            style={{ borderTop: "1px solid var(--color-border)" }}
          >
            <h2 className="text-xs font-light tracking-[0.3em] uppercase mb-4" style={{ color: "var(--color-text)" }}>
              {t("product.deliveryLabel")}
            </h2>
            <p className="text-sm font-light leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
              {deliveryDate.min} 〜 {deliveryDate.max}
            </p>
          </motion.div>
        )}

        {/* Shipping & Returns */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="pt-8"
          style={{ borderTop: "1px solid var(--color-border)" }}
        >
          <h2 className="text-xs font-light tracking-[0.3em] uppercase mb-4" style={{ color: "var(--color-text)" }}>
            {t("checkout.shippingInfo")}
          </h2>
          <p className="text-sm font-light leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
            {t("checkout.shippingReturnsText")}
          </p>
        </motion.div>
      </section>
    </div>
  );
}
