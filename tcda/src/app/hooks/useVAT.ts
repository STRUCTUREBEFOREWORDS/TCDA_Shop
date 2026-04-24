import { useGlobalContext } from "../pages/Root";

const EU_COUNTRIES = new Set([
  "AT","BE","BG","CY","CZ","DE","DK","EE","ES","FI","FR","GR",
  "HR","HU","IE","IT","LT","LU","LV","MT","NL","PL","PT","RO",
  "SE","SI","SK",
]);

export function useVAT() {
  const { countryCode } = useGlobalContext();
  return { isEU: EU_COUNTRIES.has(countryCode) };
}
