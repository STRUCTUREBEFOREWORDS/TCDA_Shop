export interface CheckoutItem {
  name: string;
  price_jpy: number;
  quantity: number;
  size: string;
  product_id?: string;
}

/** Site language → Stripe Checkout locale (all 6 supported natively) */
const STRIPE_LOCALE: Record<string, string> = {
  ja: "ja",
  en: "en",
  fr: "fr",
  es: "es",
  ko: "ko",
  zh: "zh",
};

/**
 * @param items     Cart items. price_jpy must be the JPY base price (not the display-converted price).
 * @param currency  Currency code the user has selected (e.g. "USD"). Defaults to "jpy".
 * @param language  Site language used for Stripe Checkout locale. Defaults to "ja".
 */
export async function redirectToCheckout(
  items: CheckoutItem[],
  currency = "jpy",
  language = "ja"
): Promise<void> {
  const locale = STRIPE_LOCALE[language] ?? "auto";
  const res = await fetch("https://api.tcdashop.com/create-checkout-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items,
      currency: currency.toLowerCase(),
      locale,
      language,
    }),
  });
  const data = await res.json();
  if (data.url) {
    window.location.href = data.url;
  } else {
    throw new Error("Checkout URL not returned");
  }
}
