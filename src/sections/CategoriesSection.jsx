import {
  ArrowUpRight,
  BookOpen,
  Brain,
  Briefcase,
  DollarSign,
  Palette,
  Cpu,
  Shield,
  Sparkles,
  FlaskConical,
  Landmark,
  ArrowRight,
} from "lucide-react";

import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import SectionHeading from "../components/SectionHeading.jsx";
import { useGsapReveal } from "../hooks/useGsapReveal.js";

const categories = [
  {
    title: "Programming",
    icon: BookOpen,
    books: "86 Books",
    color: "from-cyan-400 to-blue-600",
  },
  {
    title: "Business",
    icon: Briefcase,
    books: "42 Books",
    color: "from-emerald-400 to-cyan-600",
  },
  {
    title: "Finance",
    icon: DollarSign,
    books: "28 Books",
    color: "from-yellow-300 to-lime-500",
  },
  {
    title: "Marketing",
    icon: Sparkles,
    books: "37 Books",
    color: "from-pink-400 to-orange-500",
  },
  {
    title: "Design",
    icon: Palette,
    books: "55 Books",
    color: "from-fuchsia-500 to-rose-500",
  },
  {
    title: "Artificial Intelligence",
    icon: Brain,
    books: "74 Books",
    color: "from-indigo-500 to-cyan-400",
  },
  {
    title: "Cyber Security",
    icon: Shield,
    books: "31 Books",
    color: "from-slate-500 to-blue-500",
  },
  {
    title: "Self Improvement",
    icon: Sparkles,
    books: "61 Books",
    color: "from-orange-400 to-red-500",
  },
  {
    title: "Science",
    icon: FlaskConical,
    books: "46 Books",
    color: "from-sky-400 to-violet-500",
  },
  {
    title: "History",
    icon: Landmark,
    books: "25 Books",
    color: "from-amber-400 to-orange-600",
  },
];

export default function CategoriesSection() {
  const scope = useGsapReveal({
    stagger: 0.05,
    y: 24,
  });

  return (
    <section
      ref={scope}
      className="section-shell relative overflow-hidden"
    >
      {/* Background Glow */}

      <div className="pointer-events-none absolute left-0 top-24 h-72 w-72 rounded-full bg-cyan-500/10 blur-[140px]" />

      <div className="pointer-events-none absolute right-0 bottom-0 h-80 w-80 rounded-full bg-fuchsia-500/10 blur-[140px]" />

      {/* Heading */}

      <div className="mb-16 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">

        <SectionHeading
          eyebrow="Browse Categories"
          title="Discover knowledge across every discipline."
          copy="Explore curated collections covering technology, business, design, finance, AI and much more."
        />

        <Link
          to="/library"
          className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 font-medium text-white backdrop-blur-xl transition hover:bg-white/10"
        >
          Browse Library

          <ArrowRight
            size={18}
            className="transition group-hover:translate-x-1"
          />
        </Link>

      </div>

      {/* Categories */}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">

        {categories.map((category, index) => {

          const Icon = category.icon;

          return (

            <motion.button
              key={category.title}
              data-reveal
              whileHover={{
                y: -8,
              }}
              transition={{
                type: "spring",
                stiffness: 220,
              }}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-left backdrop-blur-xl"
            >

              {/* Gradient Glow */}

              <div
                className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 blur-2xl transition duration-500 group-hover:opacity-20`}
              />

              {/* Icon */}

              <div
                className={`mb-10 inline-flex rounded-2xl bg-gradient-to-br ${category.color} p-4 text-white shadow-lg`}
              >
                <Icon size={24} />
              </div>

              <h3 className="text-xl font-bold text-white">
                {category.title}
              </h3>

              <p className="mt-2 text-sm text-white/55">
                {category.books}
              </p>

              <div className="mt-10 flex items-center justify-between">

                <span className="text-sm text-cyan-300">
                  Explore
                </span>

                <ArrowUpRight
                  size={18}
                  className="transition duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                />

              </div>

              {/* Border Glow */}

              <div className="absolute inset-0 rounded-3xl border border-transparent transition group-hover:border-cyan-400/30" />

            </motion.button>

          );
        })}
      </div>

      {/* Bottom CTA */}

      <motion.div
        initial={{
          opacity: 0,
          y: 40,
        }}
        whileInView={{
          opacity: 1,
          y: 0,
        }}
        viewport={{
          once: true,
        }}
        className="mt-20 rounded-[32px] border border-white/10 bg-gradient-to-r from-white/[0.04] to-white/[0.02] p-10 backdrop-blur-xl"
      >
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

          <div>

            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">
              Endless Learning
            </p>

            <h3 className="mt-3 text-3xl font-bold text-white">
              Find the next book that changes how you think.
            </h3>

            <p className="mt-3 max-w-2xl text-white/60">
              Every category is carefully curated to help you build skills,
              explore new ideas, and keep learning through premium reading
              experiences.
            </p>

          </div>

          <Link
            to="/library"
            className="group flex items-center gap-3 rounded-full bg-white px-8 py-4 font-semibold text-black transition hover:scale-105"
          >
            Explore All Books

            <ArrowRight
              size={18}
              className="transition group-hover:translate-x-1"
            />
          </Link>

        </div>
      </motion.div>
    </section>
  );
}