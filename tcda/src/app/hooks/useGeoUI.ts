import { useGlobalContext } from "../pages/Root";

export type GeoRegion = "JP" | "US" | "DEFAULT";

export function useGeoUI(): GeoRegion {
  const { countryCode } = useGlobalContext();
  if (countryCode === "JP") return "JP";
  if (countryCode === "US") return "US";
  return "DEFAULT";
}
