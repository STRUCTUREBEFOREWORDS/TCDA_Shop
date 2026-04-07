import { motion } from "motion/react";
import { Link, useNavigate } from "react-router";
import { Minus, Plus, X } from "lucide-react";
import { useGlobalContext } from "./Root";
import { getTranslation } from "../data/translations";
import { formatPrice } from "../utils/formatPrice";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export function CartPage() {
  const { language, currency, cartItems, removeFromCart, updateQuantity } =
    useGlobalContext();
  const navigate = useNavigate();
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    navigate("/checkout", {
      state: { fromCart: true, cartItems, currency },
    });
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-8 pt-14">
        <p className="text-black/30 text-xs font-light tracking-[0.3em] uppercase">
          {t("cartEmpty")}
        </p>
        <Link
          to="/products"
          className="text-black text-xs font-light tracking-[0.3em] uppercase border-b border-black/20 pb-1 hover:border-black/60 transition-colors duration-300"
        >
          {t("continueShopping")}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-14">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-5xl mx-auto px-6 md:px-10 py-16"
      >
        {/* Header */}
        <h1 className="text-black text-xs font-light tracking-[0.4em] uppercase mb-16">
          {t("viewCart")}
          <span className="ml-2 text-black/30">({cartItems.length})</span>
        </h1>

        <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-16">
          {/* Item list */}
          <div className="space-y-0 divide-y divide-black/5">
            {cartItems.map((item) => (
              <div
                key={`${item.artworkId}-${item.size}`}
                className="flex gap-6 py-8"
              >
                {/* Image */}
                <Link
                  to={`/product/${item.artworkId}`}
                  className="w-24 flex-shrink-0 aspect-[3/4] bg-black/5 block"
                >
                  <ImageWithFallback
                    src={item.imageUrl}
                    alt={item.artworkName}
                    className="w-full h-full object-cover"
                  />
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0 space-y-2">
                  <p className="text-black text-sm font-light">{item.artworkName}</p>
                  <p className="text-black/40 text-[10px] font-light tracking-widest uppercase">
                    {t("size")}: {item.size}
                  </p>
                  <p className="text-black text-sm font-extralight tracking-wider">
                    {formatPrice(item.price * item.quantity, currency)}
                  </p>

                  {/* Quantity */}
                  <div className="flex items-center gap-4 pt-2">
                    <button
                      onClick={() =>
                        updateQuantity(item.artworkId, item.size, item.quantity - 1)
                      }
                      className="text-black/30 hover:text-black transition-colors"
                    >
                      <Minus size={12} strokeWidth={1.5} />
                    </button>
                    <span className="text-black text-xs font-light w-4 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.artworkId, item.size, item.quantity + 1)
                      }
                      className="text-black/30 hover:text-black transition-colors"
                    >
                      <Plus size={12} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeFromCart(item.artworkId, item.size)}
                  className="text-black/20 hover:text-black/50 transition-colors self-start mt-1"
                >
                  <X size={12} strokeWidth={1.5} />
                </button>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="mt-12 lg:mt-0">
            <div className="border border-black/10 p-8 space-y-6 sticky top-20">
              <h2 className="text-black text-[10px] font-light tracking-[0.3em] uppercase">
                {t("orderSummary")}
              </h2>

              <div className="space-y-3">
                <div className="flex justify-between text-xs font-light text-black/60">
                  <span>{t("subtotal")}</span>
                  <span>{formatPrice(subtotal, currency)}</span>
                </div>
                <div className="flex justify-between text-xs font-light text-black/60">
                  <span>{t("shipping")}</span>
                  <span>{t("free")}</span>
                </div>
              </div>

              <div className="border-t border-black/10 pt-4 flex justify-between">
                <span className="text-black text-xs font-light tracking-[0.2em] uppercase">
                  {t("total")}
                </span>
                <span className="text-black text-lg font-extralight tracking-wider">
                  {formatPrice(subtotal, currency)}
                </span>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full py-4 bg-black text-white text-xs font-light tracking-[0.25em] uppercase hover:bg-black/80 transition-colors duration-300"
              >
                {t("checkout")}
              </button>

              <Link
                to="/products"
                className="block text-center text-black/30 text-[10px] font-light tracking-widest uppercase hover:text-black/60 transition-colors duration-300"
              >
                {t("continueShopping")}
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
