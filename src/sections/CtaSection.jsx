import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function CtaSection() {
  return (
    <section className="px-5 py-20 md:py-28">
      <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Card 1: Ready to start reading */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] px-6 py-16 text-center shadow-glow backdrop-blur-xl flex flex-col items-center justify-between min-h-[340px]">
          <div className="pointer-events-none absolute inset-x-10 top-0 h-40 rounded-full bg-cyan-400/20 blur-3xl" />
          
          <div>
            <p className="relative mb-5 text-xs font-semibold uppercase tracking-[0.35em] text-cyan-200/80">
              Start Now
            </p>
            <h2 className="relative mx-auto max-w-lg text-4xl font-semibold leading-tight text-white md:text-5xl">
              Ready to start reading?
            </h2>
          </div>

          <motion.div className="relative mt-8 inline-flex" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link 
              className="group flex items-center gap-2 rounded-full bg-white px-7 py-4 font-semibold text-black transition hover:bg-cyan-50" 
              to="/library"
            >
              Enter the library <ArrowRight className="transition group-hover:translate-x-1" size={18} />
            </Link>
          </motion.div>
        </div>

        {/* Card 2: Ready to start publishing */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] px-6 py-16 text-center shadow-glow backdrop-blur-xl flex flex-col items-center justify-between min-h-[340px]">
          <div className="pointer-events-none absolute inset-x-10 top-0 h-40 rounded-full bg-indigo-500/20 blur-3xl" />
          
          <div>
            <p className="relative mb-5 text-xs font-semibold uppercase tracking-[0.35em] text-indigo-200/80">
              Publish With Us
            </p>
            <h2 className="relative mx-auto max-w-lg text-4xl font-semibold leading-tight text-white md:text-5xl">
              Ready to start publishing?
            </h2>
          </div>

          <motion.div className="relative mt-8 inline-flex" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link 
              to="/publish-with-us"
              className="group flex items-center gap-2 rounded-full bg-white px-7 py-4 font-semibold text-black transition hover:bg-indigo-50"
            >
              Publish with us <ArrowRight className="transition group-hover:translate-x-1" size={18} />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

