export function applyPsychologicalPrice(amount: number, currency: string): number {
  switch (currency) {
    case "JPY":
      return Math.floor(amount / 1000) * 1000 + 800;
    case "KRW":
      return Math.floor(amount / 1000) * 1000;
    case "CNY":
      return Math.floor(amount) + 0.9;
    case "AED":
      return Math.round(amount);
    case "USD":
    case "EUR":
    case "GBP":
    case "AUD":
    case "CAD":
    case "SGD":
    case "BRL":
      return Math.floor(amount) + 0.99;
    default:
      return Math.round(amount * 100) / 100;
  }
}
