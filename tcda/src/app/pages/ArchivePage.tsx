import { useState, useEffect } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { useGlobalContext } from "./Root";
import { useTranslation } from "react-i18next";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { formatPrice } from "../utils/formatPrice";
interface Product {
  id: string;
  name: string;
  price: number;
  printful_product_id: number;
  thumbnail_url: string;
  images?: string[];
}
type Category = 'ALL' | 'HOODIE' | 'ZIP HOODIE' | 'T-SHIRT';
const CATEGORIES: Category[] = ['ALL', 'HOODIE', 'ZIP HOODIE', 'T-SHIRT'];
const CATEGORY_I18N_KEY: Record<Category, string> = {
  'ALL':       'shop.all',
  'HOODIE':    'shop.hoodie',
  'ZIP HOODIE':'shop.zipHoodie',
  'T-SHIRT':   'shop.tshirt',
};
function getCategory(name: string): Category {
  const n = name.toLowerCase();
  if (n.includes('zip')) return 'ZIP HOODIE';
  if (n.includes('hoodie')) return 'HOODIE';
  if (n.includes('t-shirt') || n.includes('tshirt')) return 'T-SHIRT';
  return 'ALL';
}
export function ArchivePage() {
  const { language, currency, rates, recentProducts } = useGlobalContext();
const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Category>('ALL');
  
  useEffect(() => {
    fetch("https://api.tcdashop.com/products")
      .then((res) => res.json())
      .then((data) => { setProducts(data.products ?? []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
  const convertAndFormat = (jpy: number) => {
    const rate = rates[currency] ?? 1;
    const converted = currency === "JPY"
      ? Math.round(jpy)
      : Math.round(jpy * rate * 100) / 100;
    return formatPrice(converted, currency);
  };
  const filtered = active === 'ALL' ? products : products.filter((p) => getCategory(p.name) === active);
  return (
    <div className="min-h-screen bg-black">
      <div className="sticky top-14 z-30 bg-black/95 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-4">
          <div className="flex items-center gap-4 mb-3">
            <h1 className="text-white text-xs font-light tracking-[0.3em] uppercase">
              {t("nav.shop")}
            </h1>
            <span className="text-white/30 text-[10px] font-light">
              {filtered.length}
            </span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={`px-4 sm:px-5 py-2 text-[10px] tracking-widest border transition-colors whitespace-nowrap min-h-[44px] ${
                  active === cat
                    ? 'bg-white text-black border-white'
                    : 'bg-black text-white border-white/30 hover:bg-white hover:text-black hover:border-white'
                }`}
              >
                {t(CATEGORY_I18N_KEY[cat])}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-12">
        {loading ? (
          <p className="text-white/40 text-xs tracking-widest text-center py-24">{t("common.loading")}</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-8 md:gap-x-6 md:gap-y-12">
            {filtered.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.6, delay: (index % 4) * 0.05, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="group">
                  <Link to={`/${language}/product/${product.id}`}>
                    <div className="relative aspect-[3/4] overflow-hidden bg-white/5 mb-4">
                      <ImageWithFallback
                        src={product.images?.[0] || product.thumbnail_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                      />
                    </div>
                  </Link>
                  <div className="space-y-1.5">
                    <h3 className="text-white text-xs font-light tracking-widest uppercase opacity-70">
                      {product.name}
                    </h3>
                    <p className="text-white text-sm font-extralight tracking-wider">
                      {convertAndFormat(product.price)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* RECENTLY VIEWED */}
      {recentProducts.length > 0 && (
        <div className="border-t border-white/5 px-6 md:px-10 py-12">
          <div className="max-w-7xl mx-auto">
            <p className="text-white/20 text-[10px] font-light tracking-[0.4em] uppercase mb-8">
              {t("shop.recentlyViewed")}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-3 gap-y-8 md:gap-x-6 md:gap-y-10">
              {recentProducts.slice(0, 4).map((product) => (
                <Link
                  key={product.id}
                  to={`/${language}/product/${product.id}`}
                  className="group block"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-white/5 mb-3">
                    <ImageWithFallback
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-white/60 text-[10px] font-light tracking-widest uppercase truncate group-hover:text-white/90 transition-colors duration-300">
                      {product.name}
                    </p>
                    <p className="text-white/40 text-xs font-extralight tracking-wider">
                      {convertAndFormat(product.price)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
