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

interface Product {
  id: string;
  name: string;
  price: number;
  thumbnail_url: string;
  images?: string[];
}

const FALLBACK_IMAGE = "https://cdn.tcdashop.com/logo/1.png";

function getPrimaryImage(product: Product): string {
  return product.images?.[0] || product.thumbnail_url || FALLBACK_IMAGE;
}

export function CollectionPage() {
  const { language, currency, rates, countryCode } = useGlobalContext();
  const { pathname } = useLocation();
  const canonicalPath = pathname.replace(/^\/(en|ja|fr|es|ko|zh|de|it|pt|ar)/, "");
  const canonical = `https://tcdashop.com/en${canonicalPath}`;
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

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
        <title>Collection — TCDA</title>
        <meta name="description" content="Browse the full TCDA collection." />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content="Collection — TCDA" />
        <meta property="og:description" content="Browse the full TCDA collection." />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content="https://cdn.tcdashop.com/top/006-desktop.webp" />
      </Helmet>

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

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-[10px] font-light tracking-widest" style={{ color: "var(--color-text-tertiary)" }}>
            {t("common.loading")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2" style={{ gap: "2px", marginTop: "clamp(60px, 10vw, 160px)" }}>
          {products.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.05 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link to={`/${language}/product/${product.id}`} className="group block">
                {/* Image */}
                <div className="relative overflow-hidden w-full" style={{ aspectRatio: "2/3" }}>
                  <ImageWithFallback
                    src={getPrimaryImage(product)}
                    alt={product.name}
                    className="w-full h-full object-cover object-top"
                    style={{ transition: "transform var(--transition-slow)" }}
                  />
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{ border: "1px solid var(--color-text)" }}
                  />
                </div>

                {/* Product info */}
                <div className="px-1 pb-6" style={{ marginTop: "12px" }}>
                  <h3
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "var(--text-caption)",
                      fontWeight: "var(--weight-light)",
                      letterSpacing: "var(--ls-nav)",
                      color: "var(--color-text)",
                    }}
                  >
                    {product.name}
                  </h3>
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "var(--text-caption)",
                      color: "var(--color-accent)",
                      marginTop: "4px",
                    }}
                  >
                    {convertAndFormat(product.price)}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {/* CTA */}
      <div
        className="px-8 md:px-12 pt-12 pb-16"
        style={{ borderTop: "1px solid var(--color-border)", marginTop: "clamp(60px, 10vw, 160px)" }}
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
