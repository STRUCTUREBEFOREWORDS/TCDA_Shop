import { useGlobalContext } from "../pages/Root";
import { useVAT } from "./useVAT";

export type GeoRegion = "JP" | "US" | "EU" | "DEFAULT";

export function useGeoUI(): GeoRegion {
  const { countryCode } = useGlobalContext();
  const { isEU } = useVAT();
  if (countryCode === "JP") return "JP";
  if (countryCode === "US") return "US";
  if (isEU) return "EU";
  return "DEFAULT";
}
