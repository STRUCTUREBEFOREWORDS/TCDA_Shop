import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Link } from "react-router";
import { useGlobalContext } from "./Root";
import { useTranslation } from "react-i18next";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { formatPrice } from "../utils/formatPrice";

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
  const { language, currency, rates } = useGlobalContext();
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://api.tcdashop.com/products")
      .then((res) => res.json())
      .then((data) => setProducts(data.products ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const convertAndFormat = (jpy: number) => {
    const rate = rates[currency] ?? 1;
    const converted =
      currency === "JPY" ? Math.round(jpy) : Math.round(jpy * rate * 100) / 100;
    return formatPrice(converted, currency);
  };

  const rows = buildRows(products);

  return (
    <div className="bg-black min-h-screen overflow-x-hidden">
      {/* Page header */}
      <div className="pt-20 pb-6 px-8 md:px-12">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="text-white/20 text-[10px] font-light tracking-[0.3em] md:tracking-[0.5em] uppercase"
        >
          {t("nav.collection")}
        </motion.p>
      </div>

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
              className="flex gap-px items-start"
            >
              {row.map(({ product, span }) => (
                <Link
                  key={product.id}
                  to={`/${language}/product/${product.id}`}
                  className="group block flex-1"
                >
                  {/* Image */}
                  <div
                    className={`relative overflow-hidden ${span === "full" ? "h-[50vh] sm:h-[60vh]" : "h-[38vh] sm:h-[45vh]"}`}
                  >
                    <ImageWithFallback
                      src={getPrimaryImage(product)}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/25 transition-colors duration-500" />
                  </div>

                  {/* Product info */}
                  <div className="px-2 pt-3 pb-6 flex items-baseline justify-between gap-3">
                    <h3 className="text-white/60 text-[10px] font-light tracking-[0.25em] uppercase truncate group-hover:text-white/90 transition-colors duration-300">
                      {product.name}
                    </h3>
                    <p className="text-white/40 text-[10px] font-light tracking-wider shrink-0 group-hover:text-white/70 transition-colors duration-300">
                      {convertAndFormat(product.price)}
                    </p>
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
