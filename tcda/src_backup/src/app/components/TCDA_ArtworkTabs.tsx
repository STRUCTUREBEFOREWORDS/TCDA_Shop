import { motion } from "motion/react";

export interface ArtworkTab {
  id: string;
  shortName: string;
}

interface TCDA_ArtworkTabsProps {
  tabs: ArtworkTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function TCDA_ArtworkTabs({ tabs, activeTab, onTabChange }: TCDA_ArtworkTabsProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, delay: 0.8 }}
      className="fixed top-8 left-8 z-40 flex items-center gap-1 text-white mix-blend-difference"
    >
      {tabs.map((tab, index) => (
        <div key={tab.id} className="flex items-center">
          <button
            onClick={() => onTabChange(tab.id)}
            className={`text-[10px] font-light tracking-widest uppercase transition-opacity duration-300 ${
              activeTab === tab.id ? "opacity-100" : "opacity-30 hover:opacity-60"
            }`}
          >
            {tab.shortName}
          </button>
          {index < tabs.length - 1 && <span className="mx-2 opacity-20">/</span>}
        </div>
      ))}
    </motion.div>
  );
}
