import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Link, useLocation } from "react-router";
import { Helmet } from "react-helmet-async";
import { useGlobalContext } from "./Root";
import { useTranslation } from "react-i18next";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { formatPrice } from "../utils/formatPrice";
import { applyPsychologicalPrice } from "../../utils/priceRounding";
import { useVAT } from "../hooks/useVAT";
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

/**
 * Pattern (repeating every 3): full, half, half
 * → rows: [1 full], [2 half], [1 full], [2 half], …
 */
function getSpan(index: number): "full" | "half" {
  return index % 3 === 0 ? "full" : "half";
}

type Row = { product: Product; span: "full" | "half" }[];

function buildRows(products: Product[]): Row[] {
  const rows: Row[] = [];
  let i = 0;
  while (i < products.length) {
    const span = getSpan(i);
    if (span === "full") {
      rows.push([{ product: products[i], span: "full" }]);
      i++;
    } else {
      const pair: Row = [{ product: products[i], span: "half" }];
      if (i + 1 < products.length && getSpan(i + 1) === "half") {
        pair.push({ product: products[i + 1], span: "half" });
        i += 2;
      } else {
        i++;
      }
      rows.push(pair);
    }
  }
  return rows;
}

export function CollectionPage() {
  const { language, currency, rates, countryCode } = useGlobalContext();
  const { pathname } = useLocation();
  const canonicalPath = pathname.replace(/^\/(en|ja|fr|es|ko|zh|de|it|pt|ar)/, "");
  const canonical = `https://tcdashop.com/en${canonicalPath}`;
  const { isEU } = useVAT();
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
    const withVAT = isEU ? raw * 1.20 : raw;
    const converted = applyPsychologicalPrice(withVAT, currency);
    return formatPrice(converted, currency);
  };

  const rows = buildRows(products);

  return (
    <div className="bg-black min-h-screen overflow-x-hidden">
      <Helmet>
        <title>Collection — TCDA</title>
        <meta name="description" content="Browse the full TCDA collection. Art-driven fashion for those who refuse the ordinary." />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content="Collection — TCDA" />
        <meta property="og:description" content="Browse the full TCDA collection. Art-driven fashion for those who refuse the ordinary." />
        <meta property="og:url" content={canonical} />
      </Helmet>
      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6" style={{ height: "60vh" }}>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(64px, 10vw, 120px)", color: "#ffffff", lineHeight: 1 }}
        >
          {t("collection.heroTitle")}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6"
          style={{ fontFamily: "'Inter', sans-serif", fontSize: "18px", color: "rgba(255,255,255,0.6)" }}
        >
          {t("collection.heroSub")}
        </motion.p>
      </section>

      {/* Concept block */}
      <section className="px-8 md:px-16 py-[120px] max-md:py-[60px] border-t border-white/5 border-b border-white/5">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ maxWidth: "560px" }}
        >
          <h2
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "40px", color: "#ffffff", marginBottom: "24px" }}
          >
            {t("collection.conceptTitle")}
          </h2>
          <p
            style={{ fontFamily: "'Inter', sans-serif", fontSize: "16px", color: "rgba(255,255,255,0.8)", lineHeight: 1.8 }}
          >
            {t("collection.conceptBody")}
          </p>
          <div className="flex items-center gap-2 mt-8" style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px" }}>
            <Link to={`/${language}/about`} className="text-white/50 hover:text-[#E8FF00] hover:opacity-100 transition-all duration-300">
              Our Story
            </Link>
            <span className="text-white/20">·</span>
            <Link to={`/${language}/brand-foundation`} className="text-white/50 hover:text-[#E8FF00] hover:opacity-100 transition-all duration-300">
              Brand Foundation
            </Link>
          </div>
        </motion.div>
      </section>


      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-white/20 text-[10px] font-light tracking-widest">
            {t("common.loading")}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-px px-px">
          {rows.map((row, rowIndex) => (
            <motion.div
              key={rowIndex}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.05 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className={`grid gap-px items-start ${row.length > 1 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}
            >
              {row.map(({ product, span }) => (
                <Link
                  key={product.id}
                  to={`/${language}/product/${product.id}`}
                  className="group block"
                >
                  {/* Image */}
                  <div className={`relative overflow-hidden ${span === "full" ? "aspect-[3/4] md:aspect-[2/3]" : "aspect-[3/4]"}`}>
                    <ImageWithFallback
                      src={getPrimaryImage(product)}
                      alt={product.name}
                      className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.06]"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500 pointer-events-none" />
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 pointer-events-none">
                      <span className="text-white text-[11px] tracking-[0.3em] uppercase border-b border-[#E8FF00] pb-px">
                        View
                      </span>
                    </div>
                  </div>

                  {/* Product info */}
                  <div className="px-2 pt-3 pb-6">
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="text-white/70 text-[10px] font-light tracking-[0.25em] uppercase truncate group-hover:text-white transition-colors duration-300">
                        {product.name}
                      </h3>
                      <p className="text-[#E8FF00] text-[10px] font-light tracking-wider shrink-0 group-hover:text-[#E8FF00]/80 transition-colors duration-300">
                        {convertAndFormat(product.price)}
                      </p>
                    </div>
                    {isEU && (
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", opacity: 0.5, color: "white" }}>
                        Price includes VAT
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </motion.div>
          ))}
        </div>
      )}

      {/* CTA */}
      <div className="px-8 md:px-12 pt-12 pb-16 border-t border-white/5">
        <Link
          to={`/${language}/products`}
          className="inline-block px-10 py-4 border border-white/20 text-white/50 text-[10px] font-light tracking-[0.4em] uppercase hover:border-white/50 hover:text-white/80 transition-colors duration-300"
        >
          {t("nav.shop")}
        </Link>
      </div>
    </div>
  );
}
