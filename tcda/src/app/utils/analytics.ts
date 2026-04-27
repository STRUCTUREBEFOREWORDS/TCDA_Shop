const API = "https://api.tcdashop.com";

function getDeviceType(): string {
  return window.innerWidth < 768 ? "mobile" : "desktop";
}

async function sendEvent(event_type: string, metadata: Record<string, unknown> = {}) {
  try {
    await fetch(`${API}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_type,
        page_url: window.location.pathname,
        referrer: document.referrer,
        device_type: getDeviceType(),
        metadata,
      }),
    });
  } catch (_) {}
}

export const trackPageView = (lang: string) =>
  sendEvent("page_view", { lang });

export const trackProductView = (product_id: string, lang: string) =>
  sendEvent("product_view", { product_id, lang });

export const trackAddToCart = (product_id: string, currency: string, price: number) =>
  sendEvent("add_to_cart", { product_id, currency, price });

export const trackPurchase = (order_id: string, amount: number, currency: string) =>
  sendEvent("purchase", { order_id, amount, currency });
