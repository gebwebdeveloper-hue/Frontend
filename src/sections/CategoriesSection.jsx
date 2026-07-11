import { Link } from "react-router-dom";
import { Users, PenLine, CalendarDays, BookOpen, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

import { useGsapReveal } from "../hooks/useGsapReveal.js";

const stats = [
  { icon: Users, value: "250+", label: "Members" },
  { icon: PenLine, value: "100+", label: "Writers" },
  { icon: CalendarDays, value: "40+", label: "Events" },
  { icon: BookOpen, value: "50+", label: "Books" },
];

export default function CategoriesSection() {
  const scope = useGsapReveal({ stagger: 0.06, y: 24 });

  return (
    <section ref={scope} className="section-shell relative overflow-hidden !pt-8 md:!pt-12 !pb-8 md:!pb-12">
      <div className="pointer-events-none absolute left-0 top-20 h-80 w-80 rounded-full bg-cyan-500/10 blur-[140px]" />
      <div className="pointer-events-none absolute right-0 bottom-0 h-80 w-80 rounded-full bg-fuchsia-500/10 blur-[150px]" />

      <div className="relative z-10 rounded-lg border border-white/10 bg-white/[0.045] p-6 text-center shadow-card backdrop-blur-xl md:p-10">
        <motion.div data-reveal>
          <p className="text-sm font-bold uppercase tracking-[0.5em] text-cyan-300/75">Lekhok Tripura Club</p>
          <h2 className="mt-5 bg-gradient-to-r from-cyan-300 via-white to-fuchsia-300 bg-clip-text text-4xl font-black uppercase tracking-[0.08em] text-transparent md:text-6xl animate-text-gradient select-none">
            Readers & Writers Club
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/65 md:text-lg">
            A literary community connecting readers, writers, poets, bloggers, and literature lovers across Tripura.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/club#join-club" className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-base font-bold text-black shadow-[0_0_38px_rgba(34,211,238,0.16)] transition hover:scale-105 hover:bg-cyan-50">
              <Sparkles size={16} /> Join Our Club
            </Link>
            <Link to="/club" className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-8 py-4 text-base font-bold text-cyan-100 transition hover:border-cyan-300/45 hover:bg-cyan-300/15">
              Explore Club
            </Link>
          </div>
        </motion.div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item) => {
            const Icon = item.icon;
            return (
              <motion.div key={item.label} data-reveal whileHover={{ y: -6 }} className="rounded-lg border border-white/10 bg-black/25 p-6 text-center backdrop-blur-xl">
                <Icon className="mx-auto mb-4 h-7 w-7 text-cyan-300" />
                <div className="text-3xl font-black text-white">{item.value}</div>
                <div className="mt-2 text-sm text-white/55">{item.label}</div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
