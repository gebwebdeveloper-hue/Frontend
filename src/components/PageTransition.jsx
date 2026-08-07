import { motion } from "framer-motion";

export default function PageTransition({ children }) {
  return (
    <motion.main
      className="w-full overflow-x-hidden max-w-full"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {children}
    </motion.main>
  );
}
