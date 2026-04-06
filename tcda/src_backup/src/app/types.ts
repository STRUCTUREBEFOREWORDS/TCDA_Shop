export type Language = "en" | "ja" | "fr" | "es" | "ko" | "zh";
export type Currency = "USD" | "JPY" | "EUR";

export interface CartItem {
  artworkId: string;
  artworkName: string;
  price: number;
  currency: Currency;
  size: string;
  imageUrl: string;
  quantity: number;
}
