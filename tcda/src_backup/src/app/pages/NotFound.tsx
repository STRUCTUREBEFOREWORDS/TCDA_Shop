import { motion } from "motion/react";
import { Link } from "react-router";

export function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-8">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="text-center"
      >
        <p className="text-black text-sm font-light tracking-widest uppercase mb-8 opacity-40">
          404
        </p>
        <p className="text-black text-xl font-light mb-12">This space does not exist.</p>
        <Link
          to="/"
          className="inline-block text-black text-xs font-light tracking-widest uppercase opacity-60 hover:opacity-100 transition-opacity duration-300 border-b border-black/30 pb-1"
        >
          Return
        </Link>
      </motion.div>
    </div>
  );
}
