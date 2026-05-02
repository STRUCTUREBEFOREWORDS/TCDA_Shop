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
  CNY: new Intl.NumberFormat("zh-CN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }),
  AUD: new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 2,
  }),
  AED: new Intl.NumberFormat("ar-AE", {
    style: "currency",
    currency: "AED",
    minimumFractionDigits: 0,
  }),
  SGD: new Intl.NumberFormat("en-SG", {
    style: "currency",
    currency: "SGD",
    minimumFractionDigits: 2,
  }),
  BRL: new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }),
  CAD: new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
  }),
  INR: new Intl.NumberFormat("hi-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }),
};

export function formatPrice(amount: number, currency: Currency): string {
  if (currency === "CNY") {
    return "CN¥" + formatters.CNY.format(amount);
  }
  return formatters[currency].format(amount);
}
