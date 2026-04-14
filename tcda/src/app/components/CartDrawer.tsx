import { motion, AnimatePresence } from "motion/react";
import { X, Minus, Plus } from "lucide-react";
import { useGlobalContext } from "../pages/Root";
import { redirectToCheckout } from "../utils/stripe";
import { useTranslation } from "react-i18next";
import { formatPrice } from "../utils/formatPrice";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function CartDrawer() {
  const {
    language,
    currency,
    cartItems,
    cartCount,
    removeFromCart,
    updateQuantity,
    isCartOpen,
    setIsCartOpen,
  } = useGlobalContext();

  const { t } = useTranslation();

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/60 z-[80]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 right-0 h-full w-full max-w-sm bg-black z-[90] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-white/10">
              <h2 className="text-white text-xs font-light tracking-[0.3em] uppercase">
                {t("cart.viewCart")}
                {cartCount > 0 && (
                  <span className="ml-2 text-white/40">({cartCount})</span>
                )}
              </h2>
              <button
                onClick={() => setIsCartOpen(false)}
                className="text-white/40 hover:text-white transition-colors duration-200"
              >
                <X size={14} strokeWidth={1.5} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full space-y-6 px-8">
                  <p className="text-white/30 text-xs font-light tracking-widest uppercase">
                    {t("cart.cartEmpty")}
                  </p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="text-white/50 text-xs font-light tracking-widest uppercase border-b border-white/20 pb-1 hover:text-white hover:border-white/60 transition-all duration-300"
                  >
                    {t("cart.continueShopping")}
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-white/10">
                  {cartItems.map((item) => (
                    <div
                      key={`${item.artworkId}-${item.size}`}
                      className="flex gap-4 px-8 py-6"
                    >
                      {/* Thumbnail */}
                      <div className="w-20 aspect-[3/4] flex-shrink-0 bg-white/5">
                        <ImageWithFallback
                          src={item.imageUrl}
                          alt={item.artworkName}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 space-y-2">
                        <p className="text-white text-xs font-light tracking-wide leading-snug">
                          {item.artworkName}
                        </p>
                        <p className="text-white/40 text-[10px] font-light tracking-widest uppercase">
                          {t("size.label")}: {item.size}
                        </p>
                        <p className="text-white text-sm font-extralight">
                          {formatPrice(item.price, currency)}
                        </p>

                        {/* Quantity */}
                        <div className="flex items-center gap-3 pt-1">
                          <button
                            onClick={() =>
                              updateQuantity(item.artworkId, item.size, item.quantity - 1)
                            }
                            className="text-white/40 hover:text-white transition-colors"
                          >
                            <Minus size={12} strokeWidth={1.5} />
                          </button>
                          <span className="text-white text-xs font-light w-4 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.artworkId, item.size, item.quantity + 1)
                            }
                            className="text-white/40 hover:text-white transition-colors"
                          >
                            <Plus size={12} strokeWidth={1.5} />
                          </button>
                        </div>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => removeFromCart(item.artworkId, item.size)}
                        className="text-white/20 hover:text-white/60 transition-colors self-start mt-0.5"
                      >
                        <X size={12} strokeWidth={1.5} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="border-t border-white/10 px-8 py-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-white/40 text-[10px] font-light tracking-[0.25em] uppercase">
                    {t("cart.total")}
                  </span>
                  <span className="text-white text-lg font-extralight tracking-wider">
                    {formatPrice(total, currency)}
                  </span>
                </div>
                <p className="text-white/30 text-[10px] font-light tracking-wide text-right -mt-2">
                  {t("cart.taxNote")}
                </p>
                <button
                  onClick={async () => {
                    setIsCartOpen(false);
                    const items = cartItems.map((item) => ({
                      name: item.artworkName,
                      price_jpy: item.price_jpy,
                      quantity: item.quantity,
                      size: item.size,
                    }));
                    await redirectToCheckout(items, currency, language);
                  }}
                  className="block w-full py-4 bg-white text-black text-xs font-light tracking-[0.25em] uppercase text-center hover:bg-white/90 transition-colors duration-200"
                >
                  {t("cart.checkout")}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
