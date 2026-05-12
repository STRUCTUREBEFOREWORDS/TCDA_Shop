import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Link, useLocation } from "react-router";
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
  const genderLabel =
    product.gender_type === "male" ? "MEN'S"
    : product.gender_type === "female" ? "WOMEN'S"
    : "UNISEX";

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
          {genderLabel}
        </span>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: 500, color: "var(--color-accent)" }}>
          {convertAndFormat(product.price)}
        </p>
      </div>
    </Link>
  );
}

export function CollectionPage() {
  const { language, currency, rates, countryCode } = useGlobalContext();
  const { pathname } = useLocation();
  const canonicalPath = pathname.replace(/^\/(en|ja|fr|es|ko|zh|de|it|pt|ar|hi)/, "");
  const canonical = `https://tcdashop.com/en${canonicalPath}`;
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>("");

  const FILTERS = [
    { key: "", label: "ALL" },
    { key: "tshirt", label: "TOPS" },
    { key: "jacket", label: "OUTERWEAR" },
    { key: "sweatshirt", label: "SWEATSHIRTS" },
    { key: "bottoms", label: "BOTTOMS" },
    { key: "accessories", label: "ACCESSORIES" },
  ];

  const filteredProducts = products.filter((p) => {
    if (activeFilter === "") return true;
    return p.category === activeFilter;
  });

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
    fetch("https://api.tcdashop.com/products")
      .then((res) => res.json())
      .then((data) => setProducts(data.products ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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

      {/* Filter */}
      <div className="flex gap-2 px-4 md:px-16 overflow-x-auto" style={{ marginTop: "clamp(24px, 4vw, 48px)", scrollbarWidth: "none", WebkitOverflowScrolling: "touch" } as React.CSSProperties}>
        {FILTERS.map((f) => (
          <button
            key={f.key || "all"}
            onClick={() => setActiveFilter(f.key)}
            className="px-4 py-2 text-[10px] font-light tracking-[0.3em] uppercase transition-all duration-300"
            style={{
              border: `1px solid ${activeFilter === f.key ? "var(--color-text)" : "var(--color-border)"}`,
              color: activeFilter === f.key ? "var(--color-text)" : "var(--color-text-tertiary)",
              background: "transparent",
            }}
          >
            {f.label}
          </button>
        ))}
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
          {filteredProducts.map((product, index) => {
            const isLarge = index % 7 === 0 && index !== 0;
            return (
              <motion.div
                key={product.id}
                className={isLarge ? "col-span-2" : ""}
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
            );
          })}
        </div>
      )}

      {/* CTA */}
      <div
        className="px-8 md:px-12 pt-10 pb-8"
        style={{ borderTop: "1px solid var(--color-border)", marginTop: "clamp(32px, 5vw, 64px)" }}
      >
        <Link
          to={`/${language}/products`}
          className="inline-block px-10 py-4 text-[10px] font-light tracking-[0.4em] uppercase transition-colors duration-300"
          style={{ border: "1px solid var(--color-border)", color: "var(--color-text-secondary)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--color-text-secondary)";
            e.currentTarget.style.color = "var(--color-text)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--color-border)";
            e.currentTarget.style.color = "var(--color-text-secondary)";
          }}
        >
          {t("nav.shop")}
        </Link>
      </div>
    </div>
  );
}
