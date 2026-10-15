import type { Currency } from "../app/types";

export const CURRENCIES: readonly Currency[] = [
  "JPY", "USD", "EUR", "GBP", "KRW", "CNY", "AUD", "AED", "SGD", "BRL", "CAD", "INR",
];

/** True if `value` is one of the supported currency codes (use it to validate stored values). */
export function isCurrency(value: unknown): value is Currency {
  return typeof value === "string" && (CURRENCIES as readonly string[]).includes(value);
}

export const COUNTRY_TO_CURRENCY: Record<string, Currency> = {
  JP: "JPY", US: "USD", GB: "GBP", KR: "KRW", CN: "CNY",
  DE: "EUR", FR: "EUR", IT: "EUR", ES: "EUR", NL: "EUR", BE: "EUR", AT: "EUR", PT: "EUR",
  AU: "AUD", CA: "CAD", SG: "SGD", BR: "BRL", AE: "AED", IN: "INR",
};

export const LANGUAGE_TO_CURRENCY: Record<string, Currency> = {
  ja: "JPY", en: "USD", fr: "EUR", de: "EUR", es: "EUR", it: "EUR", pt: "EUR",
  ko: "KRW", zh: "CNY", hi: "INR", ar: "USD",
};

/**
 * Pure currency resolution, in priority order:
 * a valid stored choice > the visitor's country > the site language > "JPY".
 */
export function resolveCurrency({
  stored,
  country,
  language,
}: {
  stored?: unknown;
  country?: string | null;
  language?: string | null;
}): Currency {
  if (isCurrency(stored)) return stored;
  if (country && has(COUNTRY_TO_CURRENCY, country)) return COUNTRY_TO_CURRENCY[country];
  if (language && has(LANGUAGE_TO_CURRENCY, language)) return LANGUAGE_TO_CURRENCY[language];
  return "JPY";
}

/**
 * What to apply when an auto-detection result arrives (country lookup, cached country, or a failure).
 * Returns null when the visitor already has a valid stored choice, which always wins. `stored` must be
 * read at the moment the result arrives, not at mount: the visitor may have chosen in the meantime.
 */
export function currencyToApplyOnDetection({
  stored,
  country,
  language,
}: {
  stored?: unknown;
  country?: string | null;
  language?: string | null;
}): Currency | null {
  if (isCurrency(stored)) return null;
  return resolveCurrency({ country, language });
}

// Own-property check: keys like "constructor" must not resolve through the prototype chain.
function has(map: Record<string, Currency>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(map, key);
}
