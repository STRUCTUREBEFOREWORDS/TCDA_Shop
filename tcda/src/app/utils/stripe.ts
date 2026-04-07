export interface CheckoutItem {
  name: string;
  price_jpy: number;
  quantity: number;
  size: string;
}

export async function redirectToCheckout(items: CheckoutItem[]): Promise<void> {
  const res = await fetch('https://api.tcdashop.com/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
  });
  const data = await res.json();
  if (data.url) {
    window.location.href = data.url;
  } else {
    throw new Error('Checkout URL not returned');
  }
}
