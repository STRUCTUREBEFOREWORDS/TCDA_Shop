export const BRAND = {
  name: "TCDA",
  fullName: "Transcend Creative Dimension Aura",
} as const;

export const CTA = {
  shopNow:   { en: "Shop Now",       ja: "今すぐ購入",   fr: "Acheter",  es: "Comprar",  ko: "지금 구매",   zh: "立即购买" },
  addToCart: { en: "Add to Cart",    ja: "カートに追加", fr: "Ajouter",  es: "Añadir",   ko: "장바구니",    zh: "加入购物车" },
  checkout:  { en: "Checkout",       ja: "購入手続き",   fr: "Commander",es: "Pagar",    ko: "결제하기",    zh: "去结账" },
  view:      { en: "View",           ja: "見る",         fr: "Voir",     es: "Ver",      ko: "보기",        zh: "查看" },
} as const;

export const SHIPPING = {
  worldwide:     "Worldwide shipping available",
  duration:      "Delivered in 7–14 business days",
  freeThreshold: "Free shipping on orders over $150",
} as const;

export const RETURNS = {
  basic:     "Returns accepted within 30 days",
  condition: "Unworn, unwashed, original packaging",
} as const;

export const CUSTOMS = {
  notice: "Import duties may apply depending on your country",
} as const;

export const VAT = {
  label: "Price includes VAT",
} as const;

export const PRODUCT_TERMS = {
  design_intent: "design_intent",
  best_for:      "best_for",
  silhouette:    "silhouette",
  material_feel: "material_feel",
  style_pairing: "style_pairing",
} as const;
