import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { useGlobalContext } from "./Root";
import { useTranslation } from "react-i18next";

import { formatPrice } from "../utils/formatPrice";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { CartItem } from "../types";
import { redirectToCheckout } from "../utils/stripe";

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

const COUNTRIES = [
  { code: "JP", name: "Japan" },
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "KR", name: "South Korea" },
  { code: "AU", name: "Australia" },
  { code: "CA", name: "Canada" },
  { code: "TW", name: "Taiwan" },
  { code: "SG", name: "Singapore" },
  { code: "IT", name: "Italy" },
  { code: "ES", name: "Spain" },
  { code: "PT", name: "Portugal" },
  { code: "NL", name: "Netherlands" },
  { code: "BE", name: "Belgium" },
  { code: "CH", name: "Switzerland" },
  { code: "SE", name: "Sweden" },
  { code: "DK", name: "Denmark" },
  { code: "NO", name: "Norway" },
  { code: "FI", name: "Finland" },
  { code: "PL", name: "Poland" },
  { code: "CZ", name: "Czech Republic" },
  { code: "AT", name: "Austria" },
  { code: "NZ", name: "New Zealand" },
  { code: "HK", name: "Hong Kong" },
];

const NEEDS_STATE = ["US", "CA", "AU"];

export function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { language, currency } = useGlobalContext();
  const { t } = useTranslation();
  const state = location.state as LocationState;

  const [country, setCountry] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [shippingAmount, setShippingAmount] = useState<number | null>(null);
  const [deliveryRange, setDeliveryRange] = useState<{ min: number; max: number } | null>(null);
  const [shippingLoading, setShippingLoading] = useState(false);

  const items: CartItem[] = state?.fromCart && state.cartItems
    ? state.cartItems
    : state?.artworkName
    ? [{
        artworkId: state.artworkId ?? "",
        artworkName: state.artworkName ?? "",
        price: state.price ?? 0,
        price_jpy: state.price_jpy ?? 0,
        currency: currency,
        size: state.size ?? "",
        imageUrl: state.imageUrl ?? "",
        quantity: 1,
      }]
    : [];

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const grandTotal = shippingAmount !== null ? subtotal + shippingAmount : subtotal;

  const needsState = NEEDS_STATE.includes(country);
  const stateLabel = country === "AU" ? "State" : "State / Province";

  const addBusinessDays = (days: number): Date => {
    const d = new Date();
    let remaining = days;
    while (remaining > 0) {
      d.setDate(d.getDate() + 1);
      if (d.getDay() !== 0 && d.getDay() !== 6) remaining--;
    }
    return d;
  };

  const formatDeliveryDate = (d: Date): string => {
    if (language === "ja") {
      return new Intl.DateTimeFormat("ja", { month: "long", day: "numeric" }).format(d);
    }
    return new Intl.DateTimeFormat(language, { month: "short", day: "numeric" }).format(d);
  };

  const deliveryDates = deliveryRange
    ? {
        min: formatDeliveryDate(addBusinessDays(deliveryRange.min)),
        max: formatDeliveryDate(addBusinessDays(deliveryRange.max)),
      }
    : null;

  useEffect(() => {
    if (!country) return;
    if (needsState && stateCode.length < 2) return;

    const variantItems = items
      .filter((i) => i.variantId)
      .map((i) => ({ variant_id: i.variantId!, quantity: i.quantity }));
    if (variantItems.length === 0) return;

    let cancelled = false;
    setShippingLoading(true);
    setShippingAmount(null);
    setDeliveryRange(null);

    fetch("https://api.tcdashop.com/shipping/estimate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        country_code: country,
        state_code: stateCode,
        items: variantItems,
        currency: currency.toLowerCase(),
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.shipping_amount !== undefined) {
          setShippingAmount(data.shipping_amount);
          if (data.min_delivery_days && data.max_delivery_days) {
            setDeliveryRange({ min: data.min_delivery_days, max: data.max_delivery_days });
          }
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setShippingLoading(false); });

    return () => { cancelled = true; };
  }, [country, stateCode]);

  const handlePlaceOrder = async () => {
    setIsLoading(true);
    try {
      const checkoutItems = state?.fromCart
        ? (state.cartItems ?? []).map((c) => ({
            name: c.artworkName,
            price_jpy: c.price_jpy,
            quantity: c.quantity,
            size: c.size,
            product_id: c.artworkId,
          }))
        : [{
            name: state?.artworkName ?? "TCDA Product",
            price_jpy: state?.price_jpy ?? state?.price ?? 0,
            quantity: 1,
            size: state?.size ?? "M",
            product_id: state?.artworkId ?? "",
          }];
      await redirectToCheckout(checkoutItems, currency, language, shippingAmount ?? 0);
    } catch (e) {
      console.error(e);
      setIsLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center pt-14">
        <div className="text-center space-y-6">
          <p className="text-white/40 text-xs font-light tracking-widest uppercase">No items</p>
          <button
            onClick={() => navigate(`/${language}/products`)}
            className="text-white text-xs font-light tracking-widest uppercase border-b border-white/20 pb-1 hover:border-white/30 transition-colors"
          >
            {t("cart.continueShopping")}
          </button>
        </div>
      </div>
    );
  }

  const canCheckout = country && (!needsState || stateCode.length >= 2);

  return (
    <div className="min-h-screen bg-black pt-14">
      <div className="max-w-lg mx-auto px-6 py-16 space-y-10">

        {/* Country selector */}
        <div className="space-y-5">
          <h2 className="text-white/40 text-[10px] font-light tracking-[0.3em] uppercase">
            {t("checkout.fieldCountry")}
          </h2>
          <select
            value={country}
            onChange={(e) => { setCountry(e.target.value); setStateCode(""); }}
            className="w-full px-4 py-3 bg-black border border-white/15 text-white text-sm font-light focus:outline-none focus:border-white/30 transition-colors duration-200 appearance-none"
            style={{ colorScheme: "dark" }}
          >
            <option value="" disabled style={{ color: "rgba(255,255,255,0.2)" }}>—</option>
            {COUNTRIES.map(({ code, name }) => (
              <option key={code} value={code} style={{ background: "#000", color: "#fff" }}>{name}</option>
            ))}
          </select>

          {needsState && (
            <input
              type="text"
              value={stateCode}
              onChange={(e) => setStateCode(e.target.value.toUpperCase())}
              placeholder={country === "AU" ? "NSW" : "CA"}
              maxLength={3}
              className="w-full px-4 py-3 bg-black border border-white/15 text-white text-sm font-light placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors duration-200 uppercase"
              aria-label={stateLabel}
            />
          )}
        </div>

        {/* Order summary */}
        <div className="border-t border-white/10 pt-8 space-y-5">
          <h3 className="text-white/40 text-[10px] font-light tracking-[0.3em] uppercase">
            {t("cart.orderSummary")}
          </h3>

          <div className="space-y-4">
            {items.map((item) => (
              <div key={`${item.artworkId}-${item.size}`} className="flex gap-3">
                <div className="w-14 aspect-[3/4] flex-shrink-0">
                  <ImageWithFallback
                    src={item.imageUrl}
                    alt={item.artworkName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="text-white text-xs font-light leading-snug truncate">{item.artworkName}</p>
                  <p className="text-white/40 text-[10px] font-light">
                    {t("size.label")}: {item.size} · {t("cart.quantity")}: {item.quantity}
                  </p>
                  <p className="text-white text-xs font-extralight">
                    {formatPrice(item.price * item.quantity, currency)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 pt-4 space-y-2">
            <div className="flex justify-between text-xs font-light text-white/40">
              <span>{t("cart.subtotal") || "Subtotal"}</span>
              <span>{formatPrice(subtotal, currency)}</span>
            </div>
            <div className="flex justify-between text-xs font-light text-white/40">
              <span>{t("cart.shipping")}</span>
              <span>
                {shippingLoading
                  ? "..."
                  : shippingAmount !== null
                  ? formatPrice(shippingAmount, currency)
                  : t("cart.shippingNote")}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-white/10">
              <span className="text-white text-xs font-light tracking-[0.2em] uppercase">{t("cart.total")}</span>
              <span className="text-white text-base font-extralight tracking-wider">
                {formatPrice(grandTotal, currency)}
              </span>
            </div>
            {deliveryDates && (
              <p className="text-white/40 text-[9px] font-light tracking-wide text-right pt-1">
                {t("product.deliveryLabel")}:{" "}
                {language === "ja"
                  ? `${deliveryDates.min}〜${deliveryDates.max}`
                  : `${deliveryDates.min} – ${deliveryDates.max}`}
              </p>
            )}
            <p className="text-white/30 text-[9px] font-light tracking-wide text-right">
              {t("cart.taxNote")}
            </p>
          </div>
        </div>

        {/* Pay button */}
        <button
          onClick={handlePlaceOrder}
          disabled={!canCheckout || isLoading}
          className="w-full py-4 bg-[#E8FF00] text-black text-xs font-light tracking-[0.25em] uppercase hover:bg-white transition-colors duration-300 disabled:opacity-30"
        >
          {isLoading ? "..." : t("cart.placeOrder")}
        </button>
      </div>
    </div>
  );
}
