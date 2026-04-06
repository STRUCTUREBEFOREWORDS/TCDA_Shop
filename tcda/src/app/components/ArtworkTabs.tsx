import { motion } from "motion/react";

export interface ArtworkTab {
  id: string;
  name: {
    en: string;
    ja: string;
    fr: string;
  };
  shortName: string;
}

interface ArtworkTabsProps {
  tabs: ArtworkTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function ArtworkTabs({ tabs, activeTab, onTabChange }: ArtworkTabsProps) {
  return (
    <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="flex items-center gap-1 bg-black/50 backdrop-blur-md border border-white/10 p-1"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="relative px-6 py-2 text-xs font-light tracking-widest uppercase transition-all duration-300"
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-white"
                transition={{ type: "spring", duration: 0.6 }}
              />
            )}
            <span
              className={`relative z-10 transition-colors duration-300 ${
                activeTab === tab.id ? "text-black" : "text-white/70 hover:text-white"
              }`}
            >
              {tab.shortName}
            </span>
          </button>
        ))}
      </motion.div>
    </div>
  );
}
