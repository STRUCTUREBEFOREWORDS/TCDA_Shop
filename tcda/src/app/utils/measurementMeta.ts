/**
 * Shared measurement metadata used by SizeGuideModal and SizeGuidePage.
 * Single source of truth for the A/B/C/D/E marker system.
 */

export type MeasurementKey = "width" | "length" | "sleeve" | "shoulder" | "waist" | "inseam" | "rise" | "half_chest" | "sleeve_length" | "waist_half" | "center_back_sleeve" | "top_width" | "bottom_width" | "handle_length" | "height"
| "top_circumference" | "crown_height" | "brim_height" | "hem_width" | "depth";

export interface MeasurementMeta {
  marker: string;
  labelKey: string;
  helpKey?: string;
}

export const MEASUREMENT_LABEL_MAP: Record<MeasurementKey, MeasurementMeta> = {
  width:    { marker: "A", labelKey: "sizeGuide.measurements.width",    helpKey: "sizeGuide.measurementHelp.width" },
  length:   { marker: "B", labelKey: "sizeGuide.measurements.length",   helpKey: "sizeGuide.measurementHelp.length" },
  sleeve:   { marker: "C", labelKey: "sizeGuide.measurements.sleeve",   helpKey: "sizeGuide.measurementHelp.sleeve" },
  shoulder: { marker: "D", labelKey: "sizeGuide.measurements.shoulder", helpKey: "sizeGuide.measurementHelp.shoulder" },
  waist:    { marker: "E", labelKey: "sizeGuide.measurements.waist",    helpKey: "sizeGuide.measurementHelp.waist" },
  inseam:       { marker: "B", labelKey: "sizeGuide.measurements.inseam",       helpKey: "sizeGuide.measurementHelp.inseam" },
  rise:         { marker: "C", labelKey: "sizeGuide.measurements.rise",         helpKey: "sizeGuide.measurementHelp.rise" },
  half_chest:        { marker: "A", labelKey: "sizeGuide.measurements.half_chest",        helpKey: "sizeGuide.measurementHelp.half_chest" },
  sleeve_length:     { marker: "C", labelKey: "sizeGuide.measurements.sleeve_length",     helpKey: "sizeGuide.measurementHelp.sleeve_length" },
  waist_half:        { marker: "A", labelKey: "sizeGuide.measurements.waist_half" },
  center_back_sleeve:{ marker: "D", labelKey: "sizeGuide.measurements.center_back_sleeve" },
  top_width:         { marker: "A", labelKey: "sizeGuide.measurements.top_width" },
  bottom_width:      { marker: "B", labelKey: "sizeGuide.measurements.bottom_width" },
  handle_length:     { marker: "D", labelKey: "sizeGuide.measurements.handle_length" },
  height:            { marker: "B", labelKey: "sizeGuide.measurements.height" },
  top_circumference: { marker: "A", labelKey: "sizeGuide.measurements.top_circumference" },
  crown_height:      { marker: "B", labelKey: "sizeGuide.measurements.crown_height" },
  brim_height:       { marker: "C", labelKey: "sizeGuide.measurements.brim_height" },
  hem_width:         { marker: "D", labelKey: "sizeGuide.measurements.hem_width" },
  depth:             { marker: "C", labelKey: "sizeGuide.measurements.depth" },
};

/** Per-category override: maps raw measurement markers → MeasurementKey.
 *  Used when the DB stores letter markers ("A","B","C") instead of named columns. */
export const CATEGORY_MEASUREMENT_MAP: Partial<Record<string, Record<string, MeasurementKey>>> = {
  track_jacket:        { A: "half_chest", B: "length", C: "sleeve_length" },
  recycled_sweatshirt: { A: "half_chest", B: "length", C: "sleeve_length" },
  windbreaker_mens:    { A: "length", B: "half_chest", C: "sleeve_length" },
  windbreaker_womens:  { A: "length", B: "half_chest", C: "sleeve_length" },
  crop_tee:                { A: "half_chest", B: "length", C: "sleeve_length" },
  shorts:                  { A: "waist_half", B: "inseam", C: "rise" },
  crop_top_ls:             { A: "half_chest", B: "length", C: "sleeve_length", D: "center_back_sleeve" },
  athletic_tshirt_womens:  { A: "half_chest", B: "length", C: "sleeve_length" },
  athletic_tshirt_mens:    { A: "half_chest", B: "length", C: "sleeve_length" },
  large_tote_bag:          { A: "top_width", B: "bottom_width", C: "length", D: "handle_length" },
  tote_bag:           { A: "width", B: "height", C: "handle_length" },
  track_pants:        { A: "waist", B: "inseam" },
  beanie:             { A: "height", B: "width" },
  bucket_hat:         { A: "top_circumference", B: "crown_height", C: "brim_height" },
  wide_leg_joggers:   { A: "waist_half", B: "inseam", C: "rise", D: "hem_width", E: "length" },
  utility_crossbody:  { A: "width", B: "height", C: "depth" },
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
  "inseam": "inseam",
  "inseam length": "inseam",
  "rise": "rise",
  "front rise": "rise",
  "waistband": "waist",
  "top circumference": "top_circumference",
  "crown height": "crown_height",
  "brim height": "brim_height",
  "hem width": "hem_width",
  "depth": "depth",
};
