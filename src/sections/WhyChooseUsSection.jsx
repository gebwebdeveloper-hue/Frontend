import {
  ShieldCheck,
  BookOpen,
  Smartphone,
  Clock3,
  Bookmark,
  Zap,
  ArrowRight,
} from "lucide-react";

import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import SectionHeading from "../components/SectionHeading.jsx";
import { useGsapReveal } from "../hooks/useGsapReveal.js";

const features = [
  {
    title: "Lifetime Access",
    description:
      "Purchase once and enjoy unlimited access forever from any device.",
    icon: BookOpen,
    gradient: "from-cyan-500 to-blue-600",
    large: true,
  },
  {
    title: "Secure Purchases",
    description:
      "Every purchase is manually verified for trust and complete ownership.",
    icon: ShieldCheck,
    gradient: "from-emerald-500 to-cyan-500",
  },
  {
    title: "Instant Reading",
    description:
      "Approved purchases immediately unlock your premium reader.",
    icon: Zap,
    gradient: "from-pink-500 to-orange-500",
  },
  {
    title: "Bookmarks",
    description:
      "Save your favourite pages and continue exactly where you stopped.",
    icon: Bookmark,
    gradient: "from-violet-500 to-fuchsia-500",
  },
  {
    title: "Cross Device",
    description:
      "Desktop, laptop, tablet or mobile — your library follows you.",
    icon: Smartphone,
    gradient: "from-yellow-400 to-lime-500",
  },
  {
    title: "Fast Experience",
    description:
      "Minimal interface focused entirely on comfortable reading.",
    icon: Clock3,
    gradient: "from-indigo-500 to-cyan-400",
  },
];

const stats = [
  {
    value: "10K+",
    label: "Readers",
  },
  {
    value: "250+",
    label: "Books",
  },
  {
    value: "99.9%",
    label: "Uptime",
  },
  {
    value: "4.9★",
    label: "Rating",
  },
];

export default function WhyChooseUsSection() {
  const scope = useGsapReveal({
    stagger: 0.06,
    scale: 0.96,
  });

  return (
    <section
      ref={scope}
      className="section-shell relative overflow-hidden"
    >
      {/* Glow */}

      <div className="absolute left-0 top-20 h-80 w-80 rounded-full bg-cyan-500/10 blur-[140px]" />

      <div className="absolute right-0 bottom-0 h-80 w-80 rounded-full bg-fuchsia-500/10 blur-[160px]" />

      <SectionHeading
        eyebrow="Why Readers Choose Lekhak"
        title="Everything after checkout feels effortless."
        copy="From secure purchases to distraction-free reading, every interaction is designed to feel premium."
      />

      {/* Bento Grid */}

      <div className="mt-14 grid gap-5 lg:grid-cols-3">

        {features.map((feature) => {

          const Icon = feature.icon;

          return (
            <motion.article
              key={feature.title}
              data-reveal
              whileHover={{
                y: -10,
              }}
              transition={{
                type: "spring",
                stiffness: 220,
              }}
              className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl ${
                feature.large ? "lg:col-span-2" : ""
              }`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 blur-3xl transition duration-500 group-hover:opacity-20`}
              />

              <div
                className={`mb-8 inline-flex rounded-2xl bg-gradient-to-br ${feature.gradient} p-4 text-white shadow-lg`}
              >
                <Icon size={24} />
              </div>

              <h3 className="text-3xl font-bold text-white">
                {feature.title}
              </h3>

              <p className="mt-4 max-w-xl leading-8 text-white/60">
                {feature.description}
              </p>

              <div className="absolute right-8 top-8 text-7xl font-black text-white/5 transition group-hover:text-white/10">
                0{features.indexOf(feature) + 1}
              </div>

            </motion.article>
          );
        })}

      </div>

      {/* Statistics */}

      <div className="mt-20 grid gap-5 md:grid-cols-4">

        {stats.map((item) => (

          <motion.div
            key={item.label}
            whileHover={{
              y: -6,
            }}
            className="rounded-3xl border border-white/10 bg-white/[0.04] p-7 text-center backdrop-blur-xl"
          >
            <h3 className="text-4xl font-black text-white">
              {item.value}
            </h3>

            <p className="mt-2 text-white/60">
              {item.label}
            </p>

          </motion.div>

        ))}

      </div>

      {/* CTA */}

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
        className="mt-20 rounded-[36px] border border-white/10 bg-gradient-to-r from-white/[0.05] to-white/[0.02] p-10 backdrop-blur-xl"
      >
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

          <div>

            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">
              Ready to Start?
            </p>

            <h2 className="mt-3 text-4xl font-bold text-white">
              Build your personal digital library.
            </h2>

            <p className="mt-4 max-w-2xl text-lg leading-8 text-white/60">
              Buy once, own forever, and enjoy a premium reading experience
              crafted for curious minds.
            </p>

          </div>

          <Link
            to="/library"
            className="group flex items-center gap-3 rounded-full bg-white px-8 py-4 font-semibold text-black transition hover:scale-105"
          >
            Explore Library

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