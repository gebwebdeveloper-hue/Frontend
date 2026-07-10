import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: -80, y: -80 });

  useEffect(() => {
    const move = (event) => setPosition({ x: event.clientX, y: event.clientY });
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  return (
    <motion.div
      className="pointer-events-none fixed left-0 top-0 z-[90] hidden h-10 w-10 rounded-full border border-white/30 mix-blend-difference lg:block"
      animate={{ x: position.x - 20, y: position.y - 20 }}
      transition={{ type: "spring", stiffness: 420, damping: 32, mass: 0.35 }}
    />
  );
}
