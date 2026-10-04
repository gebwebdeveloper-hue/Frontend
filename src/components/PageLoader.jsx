import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function PageLoader() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050508]/95 backdrop-blur-2xl"
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <div className="relative flex flex-col items-center gap-6">
            {/* Multi-ring glowing spinner */}
            <div className="relative flex h-24 w-24 items-center justify-center">
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-cyan-400/20 border-t-cyan-400"
                animate={{ rotate: 360 }}
                transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute inset-2.5 rounded-full border-2 border-fuchsia-500/20 border-b-fuchsia-400"
                animate={{ rotate: -360 }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
              />
              <div className="absolute inset-0 rounded-full bg-cyan-400/15 blur-xl animate-pulse" />
              
              <img
                src="/logo.png"
                alt="Lekhok Logo"
                className="relative z-10 h-10 w-10 rounded-full object-contain shadow-glow"
              />
            </div>

            {/* Brand Title & Pulse bar */}
            <div className="flex flex-col items-center gap-2">
              <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/90">
                LEKHOK TRIPURA
              </h4>
              <div className="h-1 w-32 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-indigo-400 to-fuchsia-400"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

