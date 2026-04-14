import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useLocation, useNavigate } from "react-router";
import { Check } from "lucide-react";
import { useGlobalContext } from "./Root";
import { useTranslation } from "react-i18next";

import { formatPrice } from "../utils/formatPrice";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { CartItem } from "../types";
import { redirectToCheckout } from "../utils/stripe";

type Step = 1 | 2;

interface LocationState {
  artworkId?: string;
  artworkName?: string;
  price?: number;
  price_jpy?: number;
  currency?: string;
  size?: string;
  imageUrl?: string;
  fromCart?: boolean;
  cartItems?: CartItem[];
}

export function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { language, currency } = useGlobalContext();
const { t } = useTranslation();
  const state = location.state as LocationState;

  const [step, setStep] = useState<Step>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [shipping, setShipping] = useState({
    email: "",
    name: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
  });

  

  const items: CartItem[] = state?.fromCart && state.cartItems
    ? state.cartItems
    : state?.artworkName
    ? [
        {
          artworkId: state.artworkId ?? "",
          artworkName: state.artworkName ?? "",
          price: state.price ?? 0,
          currency: currency,
          size: state.size ?? "",
          imageUrl: state.imageUrl ?? "",
          quantity: 1,
        },
      ]
    : [];

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center pt-14">
        <div className="text-center space-y-6">
          <p className="text-black/40 text-xs font-light tracking-widest uppercase">
            No items
          </p>
          <button
            onClick={() => navigate(`/${language}/products`)}
            className="text-black text-xs font-light tracking-widest uppercase border-b border-black/20 pb-1 hover:border-black transition-colors"
          >
            {t("cart.continueShopping")}
          </button>
        </div>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    setIsLoading(true);
    try {
      const checkoutItems = state?.fromCart
        ? (state.cartItems ?? []).map((c) => ({
            name: c.artworkName,
            price_jpy: c.price_jpy,
            quantity: c.quantity,
            size: c.size,
          }))
        : [
            {
              name: state?.artworkName ?? "TCDA Product",
              price_jpy: state?.price_jpy ?? state?.price ?? 0,
              quantity: 1,
              size: state?.size ?? "M",
            },
          ];
      await redirectToCheckout(checkoutItems, currency, language);
    } catch (e) {
      console.error(e);
      setIsLoading(false);
    }
  };

  const steps: { num: Step; label: string }[] = [
    { num: 1, label: t("checkout.shippingInfo") },
    { num: 2, label: t("checkout.confirmOrder") },
  ];

  const OrderSummary = () => (
    <div className="border border-black/10 p-6 space-y-6 sticky top-20">
      <h3 className="text-black/40 text-[10px] font-light tracking-[0.3em] uppercase">
        {t("cart.orderSummary")}
      </h3>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={`${item.artworkId}-${item.size}`} className="flex gap-3">
            <div className="w-14 aspect-[3/4] flex-shrink-0 bg-black/5">
              <ImageWithFallback
                src={item.imageUrl}
                alt={item.artworkName}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <p className="text-black text-xs font-light leading-snug truncate">
                {item.artworkName}
              </p>
              <p className="text-black/40 text-[10px] font-light">
                {t("size.label")}: {item.size} · {t("cart.quantity")}: {item.quantity}
              </p>
              <p className="text-black text-xs font-extralight">
                {formatPrice(item.price * item.quantity, currency)}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-black/10 pt-4 space-y-2">
        <div className="flex justify-between text-xs font-light text-black/40">
          <span>{t("cart.shipping")}</span>
          <span>{t("cart.free")}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-black text-xs font-light tracking-[0.2em] uppercase">{t("cart.total")}</span>
          <span className="text-black text-base font-extralight tracking-wider">
            {formatPrice(total, currency)}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white pt-14">
      <div className="max-w-5xl mx-auto px-6 md:px-10 py-16">
        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-16">
          {steps.map(({ num, label }, i) => (
            <div key={num} className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div
                  className={`w-5 h-5 flex items-center justify-center text-[9px] font-light transition-all duration-300 ${
                    step > num
                      ? "bg-black text-white"
                      : step === num
                      ? "border border-black text-black"
                      : "border border-black/15 text-black/25"
                  }`}
                >
                  {step > num ? <Check size={10} strokeWidth={2} /> : num}
                </div>
                <span
                  className={`text-[10px] font-light tracking-[0.2em] uppercase transition-colors duration-300 ${
                    step === num ? "text-black" : "text-black/25"
                  }`}
                >
                  {label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className="w-8 h-px bg-black/10" />
              )}
            </div>
          ))}
        </div>

        <div className="lg:grid lg:grid-cols-[1fr_300px] lg:gap-16">
          <div>
            <AnimatePresence mode="wait">
              {/* ── STEP 1: SHIPPING ── */}
              {step === 1 && (
                <motion.form
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={(e) => { e.preventDefault(); setStep(2); }}
                  className="space-y-6"
                >
                  <h2 className="text-black text-xs font-light tracking-[0.3em] uppercase mb-8">
                    {t("checkout.shippingInfo")}
                  </h2>

                  {[
                    { key: "email", label: "Email", type: "email", placeholder: "your@email.com" },
                    { key: "name", label: t("checkout.fieldName"), type: "text", placeholder: "Full name" },
                    { key: "address", label: t("checkout.fieldAddress"), type: "text", placeholder: "Street address" },
                    { key: "city", label: t("checkout.fieldCity"), type: "text", placeholder: "City" },
                    { key: "postalCode", label: t("checkout.fieldPostalCode"), type: "text", placeholder: "000-0000" },
                    { key: "country", label: t("checkout.fieldCountry"), type: "text", placeholder: "Japan" },
                  ].map(({ key, label, type, placeholder }) => (
                    <div key={key}>
                      <label className="block text-black/40 text-[10px] font-light tracking-[0.25em] uppercase mb-2">
                        {label}
                      </label>
                      <input
                        type={type}
                        required
                        value={shipping[key as keyof typeof shipping]}
                        onChange={(e) => setShipping({ ...shipping, [key]: e.target.value })}
                        placeholder={placeholder}
                        className="w-full px-4 py-3 bg-white border border-black/15 text-black text-sm font-light placeholder:text-black/20 focus:outline-none focus:border-black transition-colors duration-200"
                      />
                    </div>
                  ))}

                  <button
                    type="submit"
                    className="w-full mt-4 py-4 bg-black text-white text-xs font-light tracking-[0.25em] uppercase hover:bg-black/80 transition-colors duration-300"
                  >
                    {t("checkout.next")}
                  </button>
                </motion.form>
              )}

              {/* ── STEP 2: CONFIRM & PAY ── */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <h2 className="text-black text-xs font-light tracking-[0.3em] uppercase mb-8">
                    {t("checkout.confirmOrder")}
                  </h2>

                  {/* Shipping summary */}
                  <div className="border border-black/10 p-5 space-y-3">
                    <p className="text-black/40 text-[10px] font-light tracking-[0.25em] uppercase">{t("checkout.shippingInfo")}</p>
                    <div className="space-y-1">
                      {[shipping.name, shipping.email, shipping.address, `${shipping.city} ${shipping.postalCode}`, shipping.country].map((v, i) => (
                        <p key={i} className="text-black text-xs font-light">{v}</p>
                      ))}
                    </div>
                    <button
                      onClick={() => setStep(1)}
                      className="text-black/40 text-[10px] font-light tracking-[0.2em] uppercase border-b border-black/15 pb-0.5 hover:text-black hover:border-black/40 transition-all duration-200"
                    >
                      {t("checkout.back")}
                    </button>
                  </div>

                  <button
                    onClick={handlePlaceOrder}
                    disabled={isLoading}
                    className="w-full py-4 bg-black text-white text-xs font-light tracking-[0.25em] uppercase hover:bg-black/80 transition-colors duration-300 disabled:opacity-40"
                  >
                    {isLoading ? "..." : t("cart.placeOrder")}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order summary */}
          <div className="mt-12 lg:mt-0">
            <OrderSummary />
          </div>
        </div>
      </div>
    </div>
  );
}
