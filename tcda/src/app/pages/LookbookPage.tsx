import { motion } from "motion/react";
import { Link } from "react-router";
import { useGlobalContext } from "./Root";
import { getTranslation } from "../data/translations";
import { useProducts } from "../hooks/useProducts";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useApp } from "../context/AppContext";

export function LookbookPage() {
  const { language } = useGlobalContext();
  const { convertPrice, getCurrencySymbol } = useApp();
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);
  const { products, loading } = useProducts();

  const looks = products.filter(p => p.images && p.images.length > 0);

  if (loading) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <p className="text-white/20 text-xs tracking-[0.3em]">LOADING...</p>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen">
      <div className="pt-24 pb-4 px-8 md:px-12">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="text-white/20 text-[10px] font-light tracking-[0.5em] uppercase"
        >
          {t("look")}
        </motion.p>
      </div>

      <div className="space-y-px">
        {looks.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div
              className={`relative overflow-hidden ${
                index % 3 === 0 ? "h-screen" : index % 3 === 1 ? "h-[70vh]" : "h-[85vh]"
              }`}
            >
              <ImageWithFallback
                src={product.images![0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/15" />

              <div className="absolute bottom-8 right-8">
                <Link
                  to={`/product/${product.id}`}
                  className="group flex flex-col items-end gap-2"
                >
                  <p className="text-white/40 text-[10px] font-light tracking-[0.3em] uppercase group-hover:text-white/80 transition-colors duration-300">
                    {product.name}
                  </p>
                  <p className="text-white/60 text-sm font-extralight tracking-wider group-hover:text-white transition-colors duration-300">
                    {getCurrencySymbol()}{convertPrice(product.price).toLocaleString()}
                  </p>
                  <span className="text-white/30 text-[9px] font-light tracking-[0.3em] uppercase border-b border-white/20 pb-0.5 group-hover:text-white/60 group-hover:border-white/50 transition-all duration-300">
                    VIEW ITEM
                  </span>
                </Link>
              </div>

              {index === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.2, delay: 0.4 }}
                  className="absolute top-20 left-8 md:left-12"
                >
                  <p className="text-white/40 text-xs font-extralight tracking-[0.2em] max-w-xs leading-[180%]">
                    {language === "ja"
                      ? "着るという行為そのものが、表明である。"
                      : language === "fr"
                      ? "L'acte de s'habiller est lui-même une déclaration."
                      : "The act of wearing is itself a statement."}
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="py-20 flex justify-center border-t border-white/5">
        <Link
          to="/products"
          className="text-white/30 text-[10px] font-light tracking-[0.4em] uppercase hover:text-white/70 transition-colors duration-300 border-b border-white/10 hover:border-white/40 pb-2"
        >
          {t("shop")}
        </Link>
      </div>
    </div>
  );
}
