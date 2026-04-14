import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { FitLabelNormalized, ProductFitMetadata } from "../types";

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

const SIZE_ORDER = ["2XS","XS","S","M","L","XL","2XL","3XL","4XL","5XL","6XL"];

const MEASUREMENT_I18N: Record<string, string> = {
  "身幅": "sizeTable.width",
  "着丈": "sizeTable.length",
  "袖丈": "sizeTable.sleeveLength",
};

const FIT_COLOR: Record<FitLabelNormalized, string> = {
  slim:     "text-blue-400",
  regular:  "text-green-400",
  relaxed:  "text-amber-400",
  oversized:"text-purple-400",
  unknown:  "text-black/30",
};

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

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const chartUnit = sizeChart?.chart_data?.[sizeUnit === "cm" ? "unit_cm" : "unit_inch"];
  const resolvedMeasuringImageUrl = measuringGuideImageUrl ?? sizeChart?.chart_data?.measure_yourself_image_url ?? null;
  const chartSizeEntries = chartUnit
    ? Object.entries(chartUnit.sizes).sort(
        (a, b) => SIZE_ORDER.indexOf(a[0]) - SIZE_ORDER.indexOf(b[0])
      )
    : [];

  const fitKey: FitLabelNormalized = (fitMetadata?.fit_label_normalized ?? "unknown") as FitLabelNormalized;
  const fitLabelI18n = `fit.${fitKey}`;
  const fitNoteI18n = `fit.${fitKey}Note`;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

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

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-8 py-6 space-y-10">

              {fitMetadata && fitKey !== "unknown" && (
                <div className="border-b border-black/5 pb-8">
                  <p className="text-black/30 text-[9px] font-light tracking-[0.4em] uppercase mb-3">
                    {t("sizeGuide.fit")}
                  </p>
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`text-xs font-light tracking-[0.3em] uppercase ${FIT_COLOR[fitKey]}`}>
                      {t(fitLabelI18n)}
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
                  <p className="text-black/50 text-xs font-light leading-relaxed">{t(fitNoteI18n)}</p>
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

              <div>
                <div className="flex items-center justify-between mb-4">
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

                {chartUnit && chartSizeEntries.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs font-light">
                      <thead>
                        <tr className="border-b border-black/10">
                          <th className="text-left py-2 pr-6 text-black/40 font-light tracking-widest uppercase">
                            {t("sizeTable.size")}
                          </th>
                          {chartUnit.measurements.map((m) => (
                            <th key={m} className="text-left py-2 pr-6 text-black/40 font-light tracking-widest uppercase">
                              {t(MEASUREMENT_I18N[m] ?? m)} ({sizeUnit})
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {chartSizeEntries.map(([size, values]) => (
                          <tr key={size} className="border-b border-black/5">
                            <td className="py-3 pr-6 text-black/70">{size}</td>
                            {values.map((v, i) => (
                              <td key={i} className="py-3 pr-6 text-black/70">
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

                <p className="text-black/25 text-[10px] font-light mt-3">{t("size.guideNote")}</p>
              </div>

              {resolvedMeasuringImageUrl ? (
                <div>
                  <p className="text-black/30 text-[9px] font-light tracking-[0.4em] uppercase mb-4">
                    {t("sizeGuide.howToMeasure")}
                  </p>
                  <img
                    src={resolvedMeasuringImageUrl}
                    alt={t("sizeGuide.howToMeasure")}
                    className="w-full max-w-sm mx-auto"
                  />
                </div>
              ) : (
                <div>
                  <p className="text-black/30 text-[9px] font-light tracking-[0.4em] uppercase mb-4">
                    {t("sizeGuide.howToMeasure")}
                  </p>
                  <ul className="space-y-3">
                    {([
                      { label: t("size.chest"), note: t("sizeGuide.measureChest") },
                      { label: t("size.length"), note: t("sizeGuide.measureLength") },
                      { label: t("size.shoulder"), note: t("sizeGuide.measureShoulder") },
                      { label: t("sizeTable.sleeveLength"), note: t("sizeGuide.measureSleeve") },
                    ] as { label: string; note: string }[]).map(({ label, note }) => (
                      <li key={label} className="flex gap-3">
                        <span className="text-black/40 text-[10px] font-light tracking-widest uppercase w-24 flex-shrink-0 pt-0.5">
                          {label}
                        </span>
                        <span className="text-black/60 text-xs font-light leading-relaxed">{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

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
