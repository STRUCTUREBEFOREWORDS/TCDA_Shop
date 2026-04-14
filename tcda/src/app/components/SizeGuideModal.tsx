import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { FitLabelNormalized, ProductFitMetadata } from "../types";

// ─── Fraction display (inch mode) ──────────────────────────────────────────
function toFraction(value: number | string): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return String(value);
  const whole = Math.floor(num);
  const decimal = Math.round((num - whole) * 8) / 8;
  const fractionMap: Record<number, string> = {
    0: "", 0.125: "⅛", 0.25: "¼", 0.375: "⅜",
    0.5: "½", 0.625: "⅝", 0.75: "¾", 0.875: "⅞",
  };
  const frac = fractionMap[decimal] ?? "";
  return whole === 0 ? (frac || "0") : frac ? `${whole}${frac}` : `${whole}`;
}

// ─── Size ordering ──────────────────────────────────────────────────────────
const SIZE_ORDER = ["2XS","XS","S","M","L","XL","2XL","3XL","4XL","5XL","6XL"];

// ─── Measurement label system ───────────────────────────────────────────────
type MeasurementKey = "width" | "length" | "sleeve" | "shoulder" | "waist";

/**
 * Maps DB column names (Japanese + English variants) → MeasurementKey.
 * All keys are lowercase for case-insensitive matching.
 */
const MEASUREMENT_TO_KEY: Record<string, MeasurementKey> = {
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

const MEASUREMENT_LABEL_MAP: Record<MeasurementKey, { marker: string; labelKey: string }> = {
  width:    { marker: "A", labelKey: "sizeGuide.measurements.width" },
  length:   { marker: "B", labelKey: "sizeGuide.measurements.length" },
  sleeve:   { marker: "C", labelKey: "sizeGuide.measurements.sleeve" },
  shoulder: { marker: "D", labelKey: "sizeGuide.measurements.shoulder" },
  waist:    { marker: "E", labelKey: "sizeGuide.measurements.waist" },
};

/** Description key for text fallback (no image) */
const MEASUREMENT_DESC_KEY: Partial<Record<MeasurementKey, string>> = {
  width:    "sizeGuide.measureChest",
  length:   "sizeGuide.measureLength",
  shoulder: "sizeGuide.measureShoulder",
  sleeve:   "sizeGuide.measureSleeve",
};

// ─── Fit color map ──────────────────────────────────────────────────────────
const FIT_COLOR: Record<FitLabelNormalized, string> = {
  slim:     "text-blue-400",
  regular:  "text-green-400",
  relaxed:  "text-amber-400",
  oversized:"text-purple-400",
  unknown:  "text-black/30",
};

// ─── Types ──────────────────────────────────────────────────────────────────
interface SizeChartUnit {
  sizes: Record<string, number[]>;
  measurements: string[];
}

interface SizeChart {
  chart_data: {
    unit_cm: SizeChartUnit;
    unit_inch: SizeChartUnit;
    measure_yourself_cm?: SizeChartUnit;
    measure_yourself_inch?: SizeChartUnit;
    measure_yourself_image_url?: string;
    measure_yourself_description?: string;
  };
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  productType?: string | null;
  sizeChart: SizeChart | null;
  sizeUnit: "cm" | "inch";
  onSwitchUnit: (unit: "cm" | "inch") => void;
  fitMetadata?: ProductFitMetadata | null;
  measuringGuideImageUrl?: string | null;
}

// ─── Component ──────────────────────────────────────────────────────────────
export function SizeGuideModal({
  isOpen,
  onClose,
  productName,
  productType,
  sizeChart,
  sizeUnit,
  onSwitchUnit,
  fitMetadata,
  measuringGuideImageUrl,
}: Props) {
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Escape key close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // ── Derived values ────────────────────────────────────────────────────────
  const chartUnit = sizeChart?.chart_data?.[sizeUnit === "cm" ? "unit_cm" : "unit_inch"];

  const chartSizeEntries = chartUnit
    ? Object.entries(chartUnit.sizes).sort(
        (a, b) => SIZE_ORDER.indexOf(a[0]) - SIZE_ORDER.indexOf(b[0])
      )
    : [];

  /**
   * Resolve measurement metadata for each column in the chart.
   * Preserves the DB column order so values[i] ↔ activeMeasurements[i].
   */
  const activeMeasurements = (chartUnit?.measurements ?? []).map((raw) => {
    const key = MEASUREMENT_TO_KEY[raw] ?? MEASUREMENT_TO_KEY[raw.toLowerCase()];
    if (!key) return null;
    const { marker, labelKey } = MEASUREMENT_LABEL_MAP[key];
    return { key, marker, labelKey, raw };
  }).filter((x): x is { key: MeasurementKey; marker: string; labelKey: string; raw: string } => x !== null);

  // Fallback: use measure_yourself_image_url from chart_data if product-level URL is absent
  const resolvedMeasuringImageUrl =
    measuringGuideImageUrl ?? sizeChart?.chart_data?.measure_yourself_image_url ?? null;

  const fitKey: FitLabelNormalized = (fitMetadata?.fit_label_normalized ?? "unknown") as FitLabelNormalized;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed z-50 bg-white flex flex-col overflow-hidden
              inset-0
              md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2
              md:w-full md:max-w-2xl md:max-h-[88vh]"
          >
            {/* ── Fixed header ───────────────────────────────────────────── */}
            <div className="flex items-start justify-between px-8 py-6 border-b border-black/10 flex-shrink-0">
              <div>
                <p className="text-black/30 text-[9px] font-light tracking-[0.4em] uppercase mb-1">
                  {t("sizeGuide.title")}
                </p>
                <h2 className="text-black text-sm font-light tracking-widest uppercase">
                  {productName}
                </h2>
                {productType && (
                  <p className="text-black/40 text-[10px] font-light tracking-widest mt-0.5">
                    {productType}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="text-black/40 hover:text-black transition-colors duration-200 mt-0.5"
                aria-label={t("sizeGuide.close")}
              >
                <X size={16} strokeWidth={1.5} />
              </button>
            </div>

            {/* ── Scrollable body ─────────────────────────────────────────── */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-8 py-6 space-y-8">

              {/* ① cm / inch toggle + section label */}
              <div className="flex items-center justify-between">
                <p className="text-black/30 text-[9px] font-light tracking-[0.4em] uppercase">
                  {t("size.guide")}
                </p>
                {sizeChart && (
                  <div className="flex gap-1">
                    {(["cm", "inch"] as const).map((unit) => (
                      <button
                        key={unit}
                        onClick={() => onSwitchUnit(unit)}
                        className={`px-3 py-1 text-[10px] font-light tracking-widest uppercase transition-all duration-200 ${
                          sizeUnit === unit
                            ? "bg-black text-white"
                            : "text-black/40 hover:text-black/70"
                        }`}
                      >
                        {unit}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* ② Measuring guide: image + legend + flat note */}
              <div className="border-b border-black/5 pb-8">
                <p className="text-black/30 text-[9px] font-light tracking-[0.4em] uppercase mb-4">
                  {t("sizeGuide.howToMeasure")}
                </p>

                {/* Image */}
                {resolvedMeasuringImageUrl && (
                  <img
                    src={resolvedMeasuringImageUrl}
                    alt={t("sizeGuide.howToMeasure")}
                    className="w-full max-w-xs mx-auto mb-5"
                  />
                )}

                {/* Legend: A / Width, B / Length, C / Sleeve … */}
                {activeMeasurements.length > 0 && (
                  <ul className="grid grid-cols-2 gap-x-6 gap-y-2 mb-4">
                    {activeMeasurements.map(({ marker, labelKey }) => (
                      <li key={marker} className="flex items-center gap-2.5">
                        <span className="w-5 h-5 flex items-center justify-center bg-black text-white text-[9px] font-light rounded-full flex-shrink-0">
                          {marker}
                        </span>
                        <span className="text-black/60 text-xs font-light">
                          {t(labelKey)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Text fallback: when no image, show brief descriptions */}
                {!resolvedMeasuringImageUrl && activeMeasurements.length > 0 && (
                  <ul className="space-y-3 mb-4">
                    {activeMeasurements.map(({ key, marker, labelKey }) => {
                      const descKey = MEASUREMENT_DESC_KEY[key];
                      return (
                        <li key={marker} className="flex gap-3">
                          <span className="w-5 h-5 flex items-center justify-center bg-black text-white text-[9px] font-light rounded-full flex-shrink-0 mt-0.5">
                            {marker}
                          </span>
                          <div>
                            <span className="text-black/50 text-[10px] font-light tracking-widest uppercase mr-2">
                              {t(labelKey)}
                            </span>
                            {descKey && (
                              <span className="text-black/50 text-xs font-light leading-relaxed">
                                — {t(descKey)}
                              </span>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}

                {/* Flat measurement note */}
                <p className="text-black/30 text-[10px] font-light">
                  {t("sizeGuide.measurementFlatNote")}
                </p>
              </div>

              {/* ③ Size table */}
              <div>
                {chartUnit && chartSizeEntries.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs font-light">
                      <thead>
                        <tr className="border-b border-black/10">
                          <th className="text-left py-2 pr-6 text-black/40 font-light tracking-widest uppercase whitespace-nowrap">
                            {t("sizeTable.size")}
                          </th>
                          {activeMeasurements.length > 0
                            ? activeMeasurements.map(({ marker, labelKey }) => (
                                <th
                                  key={marker}
                                  className="text-left py-2 pr-6 text-black/40 font-light tracking-widest uppercase whitespace-nowrap"
                                >
                                  <span className="inline-flex items-center gap-1.5">
                                    <span className="w-4 h-4 flex items-center justify-center bg-black/10 text-black/60 text-[8px] rounded-full">
                                      {marker}
                                    </span>
                                    {t(labelKey)}
                                    <span className="text-black/25 normal-case tracking-normal">
                                      ({sizeUnit})
                                    </span>
                                  </span>
                                </th>
                              ))
                            : chartUnit.measurements.map((m) => (
                                <th
                                  key={m}
                                  className="text-left py-2 pr-6 text-black/40 font-light tracking-widest uppercase whitespace-nowrap"
                                >
                                  {m} ({sizeUnit})
                                </th>
                              ))
                          }
                        </tr>
                      </thead>
                      <tbody>
                        {chartSizeEntries.map(([size, values]) => (
                          <tr key={size} className="border-b border-black/5">
                            <td className="py-3 pr-6 text-black/70 font-light">{size}</td>
                            {values.map((v, i) => (
                              <td key={i} className="py-3 pr-6 text-black/70 font-light">
                                {sizeUnit === "inch" ? toFraction(v) : v}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-black/30 text-xs font-light">{t("size.noChartAvailable")}</p>
                )}

                <p className="text-black/25 text-[10px] font-light mt-3">
                  {t("sizeGuide.measurementVariationNote")}
                </p>
              </div>

              {/* ④ Fit section (moved below table) */}
              {fitMetadata && fitKey !== "unknown" && (
                <div className="border-t border-black/5 pt-8">
                  <p className="text-black/30 text-[9px] font-light tracking-[0.4em] uppercase mb-3">
                    {t("sizeGuide.fit")}
                  </p>
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`text-xs font-light tracking-[0.3em] uppercase ${FIT_COLOR[fitKey]}`}>
                      {t(`fit.${fitKey}`)}
                    </span>
                    {fitMetadata.model_height_cm && fitMetadata.model_wear_size && (
                      <span className="text-black/30 text-[10px] font-light">
                        — {fitMetadata.model_height_cm}cm / {fitMetadata.model_wear_size}
                        {fitMetadata.is_ai_model && (
                          <span className="ml-2 opacity-50">{t("product.aiModelNote")}</span>
                        )}
                      </span>
                    )}
                  </div>
                  <p className="text-black/50 text-xs font-light leading-relaxed">
                    {t(`fit.${fitKey}Note`)}
                  </p>
                  {fitMetadata.silhouette_note && (
                    <p className="text-black/40 text-xs font-light leading-relaxed mt-2 italic">
                      {fitMetadata.silhouette_note}
                    </p>
                  )}
                  {fitMetadata.recommendation_note && (
                    <>
                      <p className="text-black/30 text-[9px] font-light tracking-[0.4em] uppercase mt-5 mb-1">
                        {t("sizeGuide.recommendation")}
                      </p>
                      <p className="text-black/60 text-xs font-light leading-relaxed">
                        {fitMetadata.recommendation_note}
                      </p>
                    </>
                  )}
                </div>
              )}

            </div>

            {/* ── Fixed footer ────────────────────────────────────────────── */}
            <div className="px-8 py-5 border-t border-black/10 flex-shrink-0">
              <button
                onClick={onClose}
                className="w-full py-3 text-black text-xs font-light tracking-[0.3em] uppercase border border-black/20 hover:border-black/60 transition-colors duration-200"
              >
                {t("sizeGuide.close")}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
