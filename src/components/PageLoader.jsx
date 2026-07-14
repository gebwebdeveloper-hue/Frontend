import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function PageLoader() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 950);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          className="fixed inset-0 z-[100] grid place-items-center bg-ink"
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          <div className="relative h-24 w-24 flex items-center justify-center">
            {/* Spinning indicator */}
            <motion.div
              className="absolute inset-0"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
            >
              <div className="absolute inset-0 rounded-full border border-white/10" />
              <div className="absolute inset-3 rounded-full border-t border-cyan-300" />
            </motion.div>
            
            {/* Static central logo */}
            <img
              src="/logo.png"
              alt="Lekhok Logo"
              className="h-10 w-10 object-contain rounded-full relative z-10"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

