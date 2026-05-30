import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "motion/react";
import { Link, useLocation, useSearchParams } from "react-router";
import { Helmet } from "react-helmet-async";
import { useGlobalContext } from "./Root";
import { useTranslation } from "react-i18next";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { formatPrice } from "../utils/formatPrice";
import { applyPsychologicalPrice } from "../../utils/priceRounding";
import { pushDataLayer } from "../hooks/useDataLayer";
import { JsonLd } from "../components/JsonLd";

interface Product {
  id: string;
  name: string;
  price: number;
  thumbnail_url: string;
  images?: string[];
  gender_type?: string;
  product_type?: string;
  category?: string;
}

const FALLBACK_IMAGE = "https://cdn.tcdashop.com/logo/1.png";

function ProductCard({
  product,
  language,
  convertAndFormat,
}: {
  product: Product;
  language: string;
  convertAndFormat: (jpy: number) => string;
}) {
  const image0 = product.images?.[0] || product.thumbnail_url || FALLBACK_IMAGE;
  const image1 = product.images?.[1];

  return (
    <Link
      to={`/${language}/product/${product.id}`}
      className="group block"
    >
      <div className="relative overflow-hidden w-full" style={{ aspectRatio: "2/3" }}>
        <div className={`absolute inset-0 transition-opacity duration-[400ms] ease-in-out${image1 ? " group-hover:opacity-0" : ""}`}>
          <ImageWithFallback
            src={image0}
            alt={product.name}
            className="w-full h-full object-cover object-top"
          />
        </div>
        {image1 && (
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-[400ms] ease-in-out">
            <ImageWithFallback
              src={image1}
              alt={product.name}
              className="w-full h-full object-cover object-top"
              loading="eager"
            />
          </div>
        )}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{ border: "1px solid var(--color-text)" }}
        />
      </div>
      <div style={{ marginTop: "12px", padding: "8px 4px", display: "flex", flexDirection: "column", gap: "4px" }}>
        <span style={{ fontSize: "11px", letterSpacing: "0.15em", color: "var(--color-text)", textTransform: "uppercase", fontFamily: "var(--font-body)", fontWeight: "var(--weight-regular)" }}>
          {product.name}
        </span>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: 500, color: "var(--color-accent)" }}>
          {convertAndFormat(product.price)}
        </p>
      </div>
    </Link>
  );
}

const GENDER_FILTERS = [
  { key: "male", label: "MEN'S" },
  { key: "female", label: "WOMEN'S" },
  { key: "unisex", label: "UNISEX" },
];

const CATEGORY_FILTERS = [
  { key: "new", label: "NEW" },
  { key: "tshirt", label: "TOPS" },
  { key: "jacket", label: "OUTERWEAR" },
  { key: "sweatshirt", label: "SWEATSHIRTS" },
  { key: "bottoms", label: "BOTTOMS" },
  { key: "accessories", label: "ACCESSORIES" },
];

const FILTER_BUTTON_STYLE = (active: boolean): React.CSSProperties => ({
  fontFamily: "var(--font-body)",
  fontSize: "11px",
  letterSpacing: "0.2em",
  textTransform: "uppercase",
  background: "transparent",
  border: "none",
  cursor: "pointer",
  padding: "0 0 2px",
  whiteSpace: "nowrap",
  color: active ? "var(--color-text)" : "var(--color-text-tertiary)",
  textDecoration: active ? "underline" : "none",
  textDecorationColor: "var(--color-accent)",
  textUnderlineOffset: "5px",
  transition: "color 0.3s ease",
});

export function CollectionPage() {
  const { language, currency, rates, countryCode } = useGlobalContext();
  const { pathname } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const canonical = `https://tcdashop.com${pathname.endsWith("/") && pathname.length > 1 ? pathname.slice(0, -1) : pathname}`;
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>(searchParams.get("category") ?? "new");
  const [activeGender, setActiveGender] = useState<string>(searchParams.get("gender") ?? "unisex");
  const [visibleCount, setVisibleCount] = useState(24);
  const PAGE_SIZE = 24;
  const sentinelRef = useRef<HTMLDivElement>(null);

  const filteredProducts = activeGender
    ? products.filter((p) => p.gender_type === activeGender)
    : products;
  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  const loadMore = useCallback(() => {
    setVisibleCount((n) => n + PAGE_SIZE);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && hasMore) loadMore(); },
      { threshold: 0.1 }
    );
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  useEffect(() => {
    pushDataLayer('page_view', {
      page_type: 'collection',
      collection_name: 'main',
      language,
      currency,
      country: countryCode,
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    const url = activeFilter
      ? `https://api.tcdashop.com/products?category=${encodeURIComponent(activeFilter)}`
      : "https://api.tcdashop.com/products";
    fetch(url)
      .then((res) => res.json())
      .then((data) => setProducts(data.products ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeFilter]);

  useEffect(() => {
    if (products.length === 0 || activeFilter !== "new") return;
    if (products.some((p) => p.gender_type === activeGender)) return;

    // NEW × activeGender が 0件 → NEW全体で最多カテゴリーにフォールバック
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      if (p.category) counts[p.category] = (counts[p.category] ?? 0) + 1;
    });
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
    if (top) setActiveFilter(top);
  }, [products]);

  const handleFilterChange = (key: string) => {
    setActiveFilter(key);
    setVisibleCount(PAGE_SIZE);
    const params: Record<string, string> = {};
    if (key) params.category = key;
    if (activeGender) params.gender = activeGender;
    setSearchParams(params, { replace: true });
  };

  const handleGenderChange = (key: string) => {
    setActiveGender(key);
    setVisibleCount(PAGE_SIZE);
    const params: Record<string, string> = {};
    if (activeFilter) params.category = activeFilter;
    if (key) params.gender = key;
    setSearchParams(params, { replace: true });
  };

  const convertAndFormat = (jpy: number) => {
    const rate = rates[currency] ?? 1;
    const raw = currency === "JPY" ? jpy : jpy * rate;
    const converted = applyPsychologicalPrice(raw, currency);
    return formatPrice(converted, currency);
  };

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: "var(--color-bg)" }}>
      <Helmet>
        <title>{t("collection.heroTitle")} — TCDA</title>
        <meta name="description" content="TCDA Collection — Abstract art apparel. TOPS / OUTERWEAR / SWEATSHIRTS. Worldwide shipping from Japan." />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={`${t("collection.heroTitle")} — TCDA`} />
        <meta property="og:description" content="TCDA Collection — Abstract art apparel. TOPS / OUTERWEAR / SWEATSHIRTS. Worldwide shipping from Japan." />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content="https://cdn.tcdashop.com/top/006-desktop.webp" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://cdn.tcdashop.com/top/006-desktop.webp" />
      </Helmet>
      <JsonLd type="ItemList" data={{
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "TCDA Collection",
        "url": "https://tcdashop.com/en/collection",
        "itemListElement": filteredProducts.map((p, i) => ({
          "@type": "ListItem",
          "position": i + 1,
          "url": `https://tcdashop.com/en/product/${p.id}`,
          "name": p.name,
        }))
      }} />

      {/* Hero */}
      <section
        className="flex flex-col justify-end items-start px-8 md:px-16"
        style={{ paddingTop: "80px", paddingBottom: "32px" }}
      >
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-display)",
            fontWeight: "var(--weight-light)",
            letterSpacing: "var(--ls-display)",
            color: "var(--color-text)",
            lineHeight: 1,
          }}
        >
          {t("collection.heroTitle")}
        </motion.h1>
      </section>

      {/* Filters */}
      <div
        className="px-4 md:px-16"
        style={{ marginTop: "clamp(24px, 4vw, 48px)" }}
      >
        {/* 上段: カテゴリー */}
        <div
          className="flex gap-6 overflow-x-auto"
          style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch", paddingBottom: "12px" } as React.CSSProperties}
        >
          {CATEGORY_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => handleFilterChange(f.key)}
              style={FILTER_BUTTON_STYLE(activeFilter === f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
        {/* 下段: ジェンダー */}
        <div
          className="flex gap-6 overflow-x-auto"
          style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" } as React.CSSProperties}
        >
          {GENDER_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => handleGenderChange(f.key)}
              style={FILTER_BUTTON_STYLE(activeGender === f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-[10px] font-light tracking-widest" style={{ color: "var(--color-text-tertiary)" }}>
            {t("common.loading")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3" style={{ gap: "2px", marginTop: "clamp(24px, 4vw, 48px)" }}>
          {filteredProducts.length === 0 ? (
            <div
              style={{
                gridColumn: "1 / -1",
                padding: "clamp(48px, 10vw, 120px) 0",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "11px",
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  color: "var(--color-text-tertiary)",
                }}
              >
                No items found
              </p>
            </div>
          ) : (
            visibleProducts.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, amount: 0.05 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                <ProductCard
                  product={product}
                  language={language}
                  convertAndFormat={convertAndFormat}
                />
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} style={{ height: 1 }} />
      {hasMore && (
        <div className="flex justify-center" style={{ marginTop: "clamp(16px, 3vw, 32px)", paddingBottom: "32px" }}>
          <p className="text-[10px] font-light tracking-widest" style={{ color: "var(--color-text-tertiary)" }}>
            {t("common.loading")}
          </p>
        </div>
      )}

    </div>
  );
}
