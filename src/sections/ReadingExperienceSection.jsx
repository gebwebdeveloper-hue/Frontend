import {
  ArrowRight,
  Bookmark,
  Moon,
  Search,
  ShieldCheck,
  BookOpen,
  Gauge,
  CheckCircle2,
} from "lucide-react";

import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import SectionHeading from "../components/SectionHeading.jsx";

const features = [
  {
    title: "Secure Online Reader",
    desc: "Books stay protected with controlled browser access.",
    icon: ShieldCheck,
  },
  {
    title: "Resume Reading",
    desc: "Continue exactly where you left off.",
    icon: BookOpen,
  },
  {
    title: "Bookmarks & Notes",
    desc: "Save important pages for quick access.",
    icon: Bookmark,
  },
  {
    title: "Fast Navigation",
    desc: "Search chapters instantly.",
    icon: Search,
  },
];

export default function ReadingExperienceSection() {
  return (
    <section className="relative overflow-hidden py-0">

      {/* Background Glow */}

      <div className="absolute left-0 top-40 h-80 w-80 rounded-full bg-cyan-500/10 blur-[150px]" />

      <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-violet-500/10 blur-[170px]" />

      <div className="section-shell !pt-8 md:!pt-12">

        <SectionHeading
          eyebrow="Premium Reader"
          title="Read beautifully on every device."
          copy="Built for immersive reading with bookmarks, reading progress, secure access, and distraction-free typography."
        />

        <div className="mt-20 grid items-center gap-20 lg:grid-cols-[0.9fr_1.1fr]">

          {/* LEFT */}

          <div className="space-y-5">

            {features.map((item) => {

              const Icon = item.icon;

              return (

                <motion.div
                  key={item.title}
                  whileHover={{
                    x: 8,
                  }}
                  className="group rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl transition"
                >
                  <div className="flex items-start gap-5">

                    <div className="rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-500 p-3 text-white">
                      <Icon size={22} />
                    </div>

                    <div>

                      <h3 className="text-xl font-bold text-white">
                        {item.title}
                      </h3>

                      <p className="mt-2 text-white/60">
                        {item.desc}
                      </p>

                    </div>

                  </div>

                </motion.div>

              );
            })}

            {/* Statistics */}

            <div className="grid grid-cols-3 gap-4 pt-6">

              {[
                ["99.9%", "Secure"],
                ["250+", "Books"],
                ["24/7", "Access"],
              ].map(([v, l]) => (

                <div
                  key={l}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-center backdrop-blur-xl"
                >
                  <h3 className="text-3xl font-black text-white">
                    {v}
                  </h3>

                  <p className="mt-2 text-sm text-white/55">
                    {l}
                  </p>

                </div>

              ))}

            </div>

          </div>

          {/* RIGHT */}

          <motion.div
            initial={{
              opacity: 0,
              scale: .9,
            }}
            whileInView={{
              opacity: 1,
              scale: 1,
            }}
            viewport={{
              once: true,
            }}
            className="relative"
          >

            {/* Glow */}

            <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-[90px]" />

            {/* Browser */}

            <div className="relative rounded-[34px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl shadow-2xl">

              {/* Browser Top */}

              <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">

                <div className="flex gap-2">

                  <span className="h-3 w-3 rounded-full bg-red-400" />
                  <span className="h-3 w-3 rounded-full bg-yellow-400" />
                  <span className="h-3 w-3 rounded-full bg-green-400" />

                </div>

                <div className="flex items-center gap-3 text-white/60">

                  <Gauge size={18} />
                  <Moon size={18} />

                </div>

              </div>

              {/* Reader */}

              <div className="rounded-2xl bg-[#F5F1E8] p-6">

                <div className="grid grid-cols-[240px_1fr] gap-6">

                  {/* Cover */}

                  <motion.div
                    animate={{
                      rotateY: [0, -6, 0],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                    }}
                    className="rounded-2xl bg-gradient-to-br from-cyan-300 via-blue-500 to-violet-600 p-6 text-white shadow-xl"
                  >

                    <p className="text-xs uppercase tracking-[0.4em]">
                      Preview
                    </p>

                    <h2 className="mt-24 text-4xl font-black leading-none">
                      PDF
                      <br />
                      Reader
                    </h2>

                  </motion.div>

                  {/* Content */}

                  <div>

                    {Array.from({ length: 12 }).map((_, i) => (
                      <div
                        key={i}
                        className="mb-4 h-3 rounded-full bg-black/10"
                        style={{
                          width: `${100 - (i % 3) * 12}%`,
                        }}
                      />
                    ))}

                    {/* Progress */}

                    <div className="mt-10 flex items-center justify-between rounded-2xl bg-black/5 p-4">

                      <div>

                        <p className="text-xs uppercase tracking-[0.3em] text-black/50">
                          Reading Progress
                        </p>

                        <h3 className="mt-2 text-xl font-bold">
                          Page 81 / 246
                        </h3>

                      </div>

                      <div className="flex h-16 w-16 items-center justify-center rounded-full border-[6px] border-cyan-400 text-lg font-bold">
                        33%
                      </div>

                    </div>

                  </div>

                </div>

              </div>

              {/* Floating Bookmark */}

              <motion.div
                animate={{
                  y: [0, -8, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                }}
                className="absolute -right-6 top-24 rounded-2xl border border-white/10 bg-black/70 p-4 backdrop-blur-xl"
              >
                <Bookmark className="text-cyan-300" />
              </motion.div>

              {/* Floating Status */}

              <motion.div
                animate={{
                  y: [0, 10, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                }}
                className="absolute -left-6 bottom-20 rounded-2xl border border-white/10 bg-black/70 px-5 py-3 backdrop-blur-xl"
              >
                <div className="flex items-center gap-3">

                  <CheckCircle2 className="text-green-400" />

                  <div>

                    <p className="text-xs text-white/50">
                      Synced
                    </p>

                    <h4 className="text-sm font-semibold text-white">
                      Reading Progress
                    </h4>

                  </div>

                </div>

              </motion.div>

            </div>

          </motion.div>

        </div>

        {/* Bottom CTA */}

        <div className="mt-20 flex justify-center">

          <Link
            to="/reader"
            className="group flex items-center gap-3 rounded-full bg-white px-8 py-4 font-semibold text-black transition hover:scale-105"
          >
            Experience the Reader

            <ArrowRight
              size={18}
              className="transition group-hover:translate-x-1"
            />

          </Link>

        </div>

      </div>

    </section>
  );
}