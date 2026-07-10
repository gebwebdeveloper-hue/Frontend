import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function CtaSection() {
  return (
    <section className="px-5 py-28">
      <div className="relative mx-auto overflow-hidden rounded-lg border border-white/10 bg-white/[0.06] px-6 py-20 text-center shadow-glow backdrop-blur-xl">
        <div className="absolute inset-x-20 top-0 h-40 rounded-full bg-cyan-400/20 blur-3xl" />
        <p className="relative mb-5 text-xs font-semibold uppercase tracking-[0.35em] text-cyan-200/80">Start now</p>
        <h2 className="relative mx-auto max-w-4xl text-5xl font-semibold leading-tight text-white md:text-7xl">Ready to start reading?</h2>
        <motion.div className="relative mt-9 inline-flex" whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.96 }}>
          <Link className="group flex items-center gap-2 rounded-full bg-white px-7 py-4 font-semibold text-black" to="/library">
            Enter the library <ArrowRight className="transition group-hover:translate-x-1" size={18} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
