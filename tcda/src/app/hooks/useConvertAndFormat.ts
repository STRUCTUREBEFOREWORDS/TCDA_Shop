import { useGlobalContext } from "../pages/Root";
import { formatPrice } from "../utils/formatPrice";
import { applyPsychologicalPrice } from "../../utils/priceRounding";

export function useConvertAndFormat() {
  const { currency, rates } = useGlobalContext();
  return (jpy: number) => {
    const rate = rates[currency] ?? 1;
    const raw = currency === "JPY" ? jpy : jpy * rate;
    const converted = applyPsychologicalPrice(raw, currency);
    return formatPrice(converted, currency);
  };
}
