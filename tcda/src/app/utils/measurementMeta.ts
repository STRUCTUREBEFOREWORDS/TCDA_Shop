/**
 * Shared measurement metadata used by SizeGuideModal and SizeGuidePage.
 * Single source of truth for the A/B/C/D/E marker system.
 */

export type MeasurementKey = "width" | "length" | "sleeve" | "shoulder" | "waist";

export interface MeasurementMeta {
  marker: string;
  labelKey: string;
  helpKey: string;
}

export const MEASUREMENT_LABEL_MAP: Record<MeasurementKey, MeasurementMeta> = {
  width:    { marker: "A", labelKey: "sizeGuide.measurements.width",    helpKey: "sizeGuide.measurementHelp.width" },
  length:   { marker: "B", labelKey: "sizeGuide.measurements.length",   helpKey: "sizeGuide.measurementHelp.length" },
  sleeve:   { marker: "C", labelKey: "sizeGuide.measurements.sleeve",   helpKey: "sizeGuide.measurementHelp.sleeve" },
  shoulder: { marker: "D", labelKey: "sizeGuide.measurements.shoulder", helpKey: "sizeGuide.measurementHelp.shoulder" },
  waist:    { marker: "E", labelKey: "sizeGuide.measurements.waist",    helpKey: "sizeGuide.measurementHelp.waist" },
};

/** Canonical display order for the standalone size guide page */
export const MEASUREMENT_KEYS_ORDER: MeasurementKey[] = [
  "width", "length", "sleeve", "shoulder", "waist",
];

/**
 * Maps DB column names (Japanese + English variants) → MeasurementKey.
 * Used by SizeGuideModal to map Printful/DB data to the shared system.
 */
export const MEASUREMENT_TO_KEY: Record<string, MeasurementKey> = {
  // Japanese (stored in DB)
  "身幅": "width",
  "着丈": "length",
  "袖丈": "sleeve",
  "肩幅": "shoulder",
  "ウエスト": "waist",
  // English variants
  "width": "width",
  "body width": "width",
  "chest": "width",
  "length": "length",
  "body length": "length",
  "sleeve": "sleeve",
  "sleeve length": "sleeve",
  "shoulder": "shoulder",
  "shoulder width": "shoulder",
  "waist": "waist",
};
