import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Link } from "react-router";
import { useGlobalContext } from "./Root";
import { useTranslation } from "react-i18next";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

interface Product {
  id: string;
  name: string;
  thumbnail_url: string;
  images?: string[];
}

const FALLBACK_IMAGE = "https://cdn.tcdashop.com/logo/1.png";

/** Always use the product's first image; fall back to thumbnail_url then a placeholder. */
function getPrimaryImage(product: Product): string {
  return product.images?.[0] || product.thumbnail_url || FALLBACK_IMAGE;
}

/**
 * Assigns a deterministic span based on position in the list.
 * Pattern (repeating every 3): full, half, half → gives rows [1], [2], [1], [2], …
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
      // Pair two consecutive half-span items into one row
      const pair: Row = [{ product: products[i], span: "half" }];
      if (i + 1 < products.length && getSpan(i + 1) === "half") {
        pair.push({ product: products[i + 1], span: "half" });
        i += 2;
      } else {
        // Lone final item: let it fill the row as flex-1
        i++;
      }
      rows.push(pair);
    }
  }
  return rows;
}

export function LookbookPage() {
  const { language } = useGlobalContext();
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

  const rows = buildRows(products);

  return (
    <div className="bg-black min-h-screen">
      <div className="pt-24 pb-4 px-8 md:px-12">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="text-white/20 text-[10px] font-light tracking-[0.5em] uppercase"
        >
          {t("nav.collection")}
        </motion.p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-white/20 text-[10px] font-light tracking-widest">
            {t("common.loading")}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-px">
          {rows.map((row, rowIndex) => (
            <motion.div
              key={rowIndex}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="flex gap-px"
            >
              {row.map(({ product, span }) => (
                <Link
                  key={product.id}
                  to={`/${language}/product/${product.id}`}
                  className="group relative overflow-hidden flex-1"
                  style={{ height: span === "full" ? "80vh" : "60vh" }}
                >
                  <ImageWithFallback
                    src={getPrimaryImage(product)}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors duration-500" />
                  <div className="absolute bottom-6 right-6 flex flex-col items-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-white text-[10px] font-light tracking-[0.3em] uppercase">
                      {product.name}
                    </p>
                    <span className="text-white/60 text-[9px] font-light tracking-[0.3em] uppercase border-b border-white/30 pb-0.5">
                      VIEW ITEM
                    </span>
                  </div>
                </Link>
              ))}
            </motion.div>
          ))}
        </div>
      )}

      <div className="py-20 flex justify-center border-t border-white/5">
        <Link
          to={`/${language}/products`}
          className="text-white/30 text-[10px] font-light tracking-[0.4em] uppercase hover:text-white/70 transition-colors duration-300 border-b border-white/10 hover:border-white/40 pb-2"
        >
          {t("nav.shop")}
        </Link>
      </div>
    </div>
  );
}
