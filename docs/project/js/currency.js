/**
 * TCDA — Multi-Currency
 * Supported: JPY, USD, EUR, GBP, CNY
 * Base currency: JPY (all product prices stored in JPY)
 * Rates refreshed from localStorage cache (max 6 h) or static fallback.
 * For production, swap fetchRates() to hit a real FX API (e.g. exchangerate.host).
 */

(function (global) {
  "use strict";

  /* ── 1. Currency config ──────────────────────────────────────── */
  const CURRENCIES = [
    { code: "JPY", symbol: "¥",  locale: "ja-JP", label: "JPY ¥",  decimals: 0 },
    { code: "USD", symbol: "$",  locale: "en-US", label: "USD $",  decimals: 2 },
    { code: "EUR", symbol: "€",  locale: "de-DE", label: "EUR €",  decimals: 2 },
    { code: "GBP", symbol: "£",  locale: "en-GB", label: "GBP £",  decimals: 2 },
    { code: "CNY", symbol: "¥",  locale: "zh-CN", label: "CNY ¥",  decimals: 2 },
  ];

  /*
   * Static fallback rates (JPY base, approximate March 2026).
   * These are used when the live fetch fails or is unavailable.
   * Update periodically or replace fetchRates() with a real API call.
   */
  const STATIC_RATES = {
    JPY: 1,
    USD: 0.00667,   /* 1 JPY ≈ 0.00667 USD  (1 USD ≈ 150 JPY) */
    EUR: 0.00617,   /* 1 JPY ≈ 0.00617 EUR  (1 EUR ≈ 162 JPY) */
    GBP: 0.00526,   /* 1 JPY ≈ 0.00526 GBP  (1 GBP ≈ 190 JPY) */
    CNY: 0.04839,   /* 1 JPY ≈ 0.04839 CNY  (1 CNY ≈ 20.7 JPY) */
  };

  const STORAGE_KEY_CURRENCY = "tcda-currency-v1";
  const STORAGE_KEY_RATES    = "tcda-fx-rates-v1";
  const CACHE_TTL_MS         = 6 * 60 * 60 * 1000; /* 6 hours */
  const DEFAULT_CURRENCY     = "JPY";

  /* ── 2. State ────────────────────────────────────────────────── */
  let _rates = { ...STATIC_RATES };

  /* ── 3. Rate helpers ─────────────────────────────────────────── */
  function loadCachedRates() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_RATES);
      if (!raw) return false;
      const { timestamp, rates } = JSON.parse(raw);
      if (Date.now() - timestamp < CACHE_TTL_MS && rates) {
        _rates = rates;
        return true;
      }
    } catch (_) {}
    return false;
  }

  /**
   * Optional live fetch — replace the URL with a CORS-friendly FX endpoint.
   * Example: https://api.exchangerate.host/latest?base=JPY&symbols=USD,EUR,GBP,CNY
   * Currently disabled to keep the site backend-free; remove the early-return to enable.
   */
  async function fetchRates() {
    /* Comment out the next line to enable live rate fetching: */
    return;

    // try {
    //   const res = await fetch(
    //     "https://api.exchangerate.host/latest?base=JPY&symbols=USD,EUR,GBP,CNY",
    //     { signal: AbortSignal.timeout(4000) }
    //   );
    //   if (!res.ok) return;
    //   const json = await res.json();
    //   if (json.rates) {
    //     _rates = { JPY: 1, ...json.rates };
    //     localStorage.setItem(
    //       STORAGE_KEY_RATES,
    //       JSON.stringify({ timestamp: Date.now(), rates: _rates })
    //     );
    //     applyPrices(getCurrentCurrency());
    //   }
    // } catch (_) {}
  }

  /* ── 4. Currency detection ───────────────────────────────────── */
  function detectCurrency() {
    const stored = localStorage.getItem(STORAGE_KEY_CURRENCY);
    if (stored && CURRENCIES.find((c) => c.code === stored)) return stored;

    /* Map browser locale → likely currency */
    const locale = (navigator.language || "en").toLowerCase();
    if (locale.startsWith("zh")) return "CNY";
    if (locale.startsWith("ja")) return "JPY";
    if (locale.startsWith("ar")) return "USD"; /* broad fallback for Arab region */
    if (["en-gb", "en-ie"].some((l) => locale.startsWith(l))) return "GBP";
    if (locale.startsWith("en")) return "USD";
    /* Euro-zone common locales */
    const euroLocales = ["de", "fr", "it", "es", "nl", "pt", "pl", "el", "fi", "sk", "bg", "ro", "hr"];
    if (euroLocales.some((l) => locale.startsWith(l))) return "EUR";
    return DEFAULT_CURRENCY;
  }

  function getCurrentCurrency() {
    return localStorage.getItem(STORAGE_KEY_CURRENCY) || DEFAULT_CURRENCY;
  }

  /* ── 5. Price formatting ─────────────────────────────────────── */
  function convertFromJPY(jpyAmount, toCurrency) {
    const rate = _rates[toCurrency] || 1;
    return jpyAmount * rate;
  }

  function formatPrice(jpyAmount, currencyCode) {
    const currency = CURRENCIES.find((c) => c.code === currencyCode) || CURRENCIES[0];
    const converted = convertFromJPY(Number(jpyAmount), currencyCode);

    try {
      return new Intl.NumberFormat(currency.locale, {
        style: "currency",
        currency: currencyCode,
        minimumFractionDigits: currency.decimals,
        maximumFractionDigits: currency.decimals,
      }).format(converted);
    } catch (_) {
      /* Fallback if Intl.NumberFormat is unsupported */
      const rounded = currency.decimals === 0
        ? Math.round(converted)
        : converted.toFixed(currency.decimals);
      return `${currency.symbol}${rounded}`;
    }
  }

  /* ── 6. Apply prices to DOM ──────────────────────────────────── */
  /**
   * Elements should carry:
   *   data-price-jpy="74000"          — raw JPY amount
   *   data-price-display              — marker; its textContent will be replaced
   */
  function applyPrices(currencyCode) {
    document.querySelectorAll("[data-price-display]").forEach((el) => {
      const jpyAmount = el.getAttribute("data-price-jpy");
      if (jpyAmount === null) return;
      el.textContent = formatPrice(jpyAmount, currencyCode);
    });

    /* Sync switcher UI */
    document.querySelectorAll("[data-currency-btn]").forEach((btn) => {
      const active = btn.getAttribute("data-currency-btn") === currencyCode;
      btn.setAttribute("aria-pressed", String(active));
      btn.classList.toggle("is-active", active);
    });

    localStorage.setItem(STORAGE_KEY_CURRENCY, currencyCode);
  }

  /* ── 7. Init ─────────────────────────────────────────────────── */
  function init() {
    loadCachedRates();
    fetchRates(); /* async, non-blocking */
    const currency = detectCurrency();
    applyPrices(currency);
  }

  /* ── 8. Public API ───────────────────────────────────────────── */
  global.TCDACurrency = {
    currencies: CURRENCIES,
    formatPrice,
    applyPrices,
    getCurrentCurrency,
    detectCurrency,
    init,
  };
})(window);
