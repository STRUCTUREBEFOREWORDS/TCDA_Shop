import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export interface FaqItem {
  q: string;
  a: string;
}

interface Props {
  items: FaqItem[];
}

export function FaqAccordion({ items }: Props) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="space-y-0">
      {items.map((item, i) => (
        <div key={i} className="border-b border-white/10">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full text-left py-4 flex justify-between items-start gap-4"
          >
            <span className="text-white text-sm font-light opacity-70 leading-snug">
              {item.q}
            </span>
            <span className="text-white/30 text-xs font-light flex-shrink-0 mt-0.5 select-none">
              {open === i ? "−" : "+"}
            </span>
          </button>
          <AnimatePresence>
            {open === i && (
              <motion.p
                key="answer"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="text-white/55 text-xs font-light leading-relaxed pb-4 pr-8 overflow-hidden"
              >
                {item.a}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
