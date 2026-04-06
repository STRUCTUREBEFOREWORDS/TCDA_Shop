import { Currency } from "../components/LanguageCurrencySwitcher";

export function formatPrice(amount: number, currency: Currency): string {
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
  };

  return formatters[currency].format(amount);
}
