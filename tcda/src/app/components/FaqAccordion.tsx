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
        <div key={i} style={{ borderTop: "1px solid var(--color-border)", padding: "24px 0" }}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full text-left flex justify-between items-start gap-4"
          >
            <span
              style={{ fontFamily: "var(--font-body)", color: "var(--color-text)", letterSpacing: "var(--ls-body)" }}
            >
              {item.q}
            </span>
            <span className="text-xs font-light flex-shrink-0 mt-0.5 select-none" style={{ color: "var(--color-text)" }}>
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
                className="pr-8 overflow-hidden"
                style={{ color: "var(--color-text-secondary)", fontFamily: "var(--font-body)", lineHeight: 1.8, paddingBottom: "24px" }}
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
