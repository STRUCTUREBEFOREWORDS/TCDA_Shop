import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { Language } from "../types";
import { getTranslation } from "../data/translations";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

const SIZE_DATA = [
  { size: "XS", chest: "82–86", length: "65", shoulder: "40" },
  { size: "S",  chest: "86–90", length: "67", shoulder: "42" },
  { size: "M",  chest: "90–94", length: "69", shoulder: "44" },
  { size: "L",  chest: "94–98", length: "71", shoulder: "46" },
  { size: "XL", chest: "98–104", length: "73", shoulder: "48" },
];

export function SizeGuideModal({ isOpen, onClose, language }: Props) {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 z-[60]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] bg-black border border-white/10 w-full max-w-md mx-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-white/10">
              <h2 className="text-white text-xs font-light tracking-[0.3em] uppercase">
                {t("sizeGuideTitle")}
              </h2>
              <button
                onClick={onClose}
                className="text-white/40 hover:text-white transition-colors duration-200"
              >
                <X size={14} strokeWidth={1.5} />
              </button>
            </div>

            {/* Table */}
            <div className="px-8 py-6">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-[10px] font-light tracking-[0.2em] uppercase text-white/40 pb-3">
                      {t("size")}
                    </th>
                    <th className="text-left text-[10px] font-light tracking-[0.2em] uppercase text-white/40 pb-3">
                      {t("chest")}
                    </th>
                    <th className="text-left text-[10px] font-light tracking-[0.2em] uppercase text-white/40 pb-3">
                      {t("length")}
                    </th>
                    <th className="text-left text-[10px] font-light tracking-[0.2em] uppercase text-white/40 pb-3">
                      {t("shoulder")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {SIZE_DATA.map((row) => (
                    <tr key={row.size} className="border-b border-white/5">
                      <td className="text-white text-xs font-light py-3">{row.size}</td>
                      <td className="text-white/60 text-xs font-light py-3">{row.chest}</td>
                      <td className="text-white/60 text-xs font-light py-3">{row.length}</td>
                      <td className="text-white/60 text-xs font-light py-3">{row.shoulder}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-white/30 text-[10px] font-light mt-5 leading-relaxed">
                {t("sizeGuideNote")}
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
