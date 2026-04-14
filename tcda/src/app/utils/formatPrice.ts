import { Currency } from "../types";

const formatters: Record<Currency, Intl.NumberFormat> = {
  USD: new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }),
  JPY: new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    minimumFractionDigits: 0,
  }),
  EUR: new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
  }),
  GBP: new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 0,
  }),
  KRW: new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    minimumFractionDigits: 0,
  }),
  // CNY uses the same ¥ symbol as JPY in most locales.
  // We use a plain number formatter and prepend CN¥ explicitly.
  CNY: new Intl.NumberFormat("zh-CN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }),
};

export function formatPrice(amount: number, currency: Currency): string {
  if (currency === "CNY") {
    return "CN¥" + formatters.CNY.format(amount);
  }
  return formatters[currency].format(amount);
}
