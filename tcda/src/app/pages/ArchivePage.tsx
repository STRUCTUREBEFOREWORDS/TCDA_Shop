import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useGlobalContext } from "./Root";
import { getTranslation } from "../data/translations";

interface Product {
  id: string;
  name: string;
  price: number;
  printful_product_id: number;
  thumbnail_url: string;
}

export function ArchivePage() {
  const { language, currency, rates } = useGlobalContext();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);

  useEffect(() => {
    fetch("https://api.tcdashop.com/products")
      .then((res) => res.json())
      .then((data) => { setProducts(data.products ?? []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const symbols: Record<string, string> = {
    JPY: "¥", USD: "$", EUR: "€", GBP: "£", KRW: "₩", CNY: "CN¥",
  };

  const formatPrice = (jpy: number) => {
    const rate = rates[currency] ?? 1;
    const amount = Math.round(jpy * rate);
    const symbol = symbols[currency] ?? "¥";
    return `${symbol}${amount.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-14 z-30 bg-white/95 backdrop-blur-sm border-b border-black/5">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-black text-xs font-light tracking-[0.3em] uppercase">
              {t("shop")}
            </h1>
            <span className="text-black/30 text-[10px] font-light">
              {products.length}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-10 py-12">
        {loading ? (
          <p className="text-black/40 text-xs tracking-widest text-center py-24">Loading...</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.6, delay: (index % 4) * 0.05, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="group">
                  <div className="relative aspect-[3/4] overflow-hidden bg-black/5 mb-4">
                    <img
                      src={product.thumbnail_url}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-black text-xs font-light tracking-widest uppercase opacity-70">
                      {product.name}
                    </h3>
                    <p className="text-black text-sm font-extralight tracking-wider">
                      {formatPrice(product.price)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
