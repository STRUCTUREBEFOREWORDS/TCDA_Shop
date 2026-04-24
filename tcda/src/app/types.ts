export type Language = "en" | "ja" | "fr" | "es" | "ko" | "zh" | "ar" | "pt" | "de" | "it";
export type Currency = "USD" | "JPY" | "EUR" | "GBP" | "KRW" | "CNY";

export type FitLabelNormalized = "slim" | "regular" | "relaxed" | "oversized" | "unknown";

export interface ProductFitMetadata {
  fit_label_normalized: FitLabelNormalized;
  silhouette_note: string | null;
  recommendation_note: string | null;
  model_height_cm: number | null;
  model_wear_size: string | null;
  is_ai_model: boolean;
}

export interface RecentProduct {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
}

export interface CartItem {
  artworkId: string;
  artworkName: string;
  price: number;
  price_jpy: number;
  currency: Currency;
  size: string;
  imageUrl: string;
  quantity: number;
}
