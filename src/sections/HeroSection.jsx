import { ArrowRight, Play, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const stats = [
  {
    number: "5",
    label: "Premium Books",
  },
  {
    number: "10k+",
    label: "Readers",
  },
  {
    number: "4.9★",
    label: "User Rating",
  },
];

export default function HeroSection() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden px-6 pt-28 pb-16">

      {/* Background */}
      <div className="absolute inset-0 animated-gradient" />
      <div className="noise" />

      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover opacity-20 pointer-events-none z-0"
      >
        <source src="/Animated_map_zooming_into_book_202607112222.mp4" type="video/mp4" />
      </video>

      <div className="absolute left-0 top-0 h-[700px] w-[700px] rounded-full bg-cyan-500/10 blur-[180px] pointer-events-none" />
      <div className="absolute right-0 bottom-0 h-[650px] w-[650px] rounded-full bg-fuchsia-500/10 blur-[180px] pointer-events-none" />

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center text-center">

        {/* Badge */}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-xl"
        >
          <Sparkles size={16} />
          <span className="text-sm text-white/70">
            Premium PDF Reading Experience
          </span>
        </motion.div>

        {/* Heading */}

        <div className="space-y-1 text-center">

          <motion.h1
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .8 }}
            className="text-5xl font-black uppercase leading-[0.82] tracking-[-2px] text-white sm:text-7xl md:text-8xl xl:text-[8.5rem]"
          >
            READ
          </motion.h1>

          <motion.h1
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: .15, duration: .8 }}
            className="text-5xl font-black uppercase leading-[0.82] tracking-[-2px] text-white sm:text-7xl md:text-8xl xl:text-[8.5rem]"
          >
            WITHOUT
          </motion.h1>

          <motion.h1
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: .3, duration: .8 }}
            className="bg-gradient-to-r from-cyan-300 via-white to-fuchsia-400 bg-clip-text text-5xl font-black uppercase leading-[0.82] tracking-[-2px] text-transparent sm:text-7xl md:text-8xl xl:text-[8.5rem] animate-text-gradient"
          >
            LIMITS
          </motion.h1>

        </div>

        {/* Circular Masked Logo Video Emblem (Below LIMITS) */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
          className="relative mt-8 group flex justify-center"
        >
          {/* Ambient Outer Glow */}
          <div className="absolute -inset-3 rounded-full bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-indigo-500 opacity-50 blur-xl group-hover:opacity-90 transition duration-700 animate-pulse" />
          
          {/* Outer Glass Ring Frame */}
          <div className="relative flex items-center justify-center p-[3px] rounded-full bg-gradient-to-tr from-cyan-400/80 via-white/40 to-fuchsia-500/80 shadow-[0_0_50px_rgba(34,211,238,0.25)]">
            {/* Mask Container */}
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden bg-black/90 shadow-inner">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover scale-105 group-hover:scale-115 transition-transform duration-700"
              >
                <source src="/ETA_AMR_LOGO_EI_LOGO_TAR_ANIMA (1).mp4" type="video/mp4" />
              </video>
              
              {/* Glossy Overlay Highlight */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/15 via-transparent to-black/40 pointer-events-none rounded-full" />
              <div className="absolute inset-0 ring-1 ring-white/20 rounded-full pointer-events-none" />
            </div>
          </div>
        </motion.div>

        {/* Description */}

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: .7 }}
          className="mt-8 max-w-2xl text-center text-lg leading-9 text-white/60"
        >
          Buy once. Read forever.

          Experience beautifully crafted ebooks with a distraction-free,
          secure reader designed for developers, creators and lifelong
          learners.
        </motion.p>

        {/* Buttons */}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: .9 }}
          className="mt-10 flex flex-wrap gap-5 justify-center"
        >
          <Link
            to="/library"
            className="group flex items-center gap-2 rounded-full bg-white px-8 py-4 font-bold text-black shadow-[0_0_24px_rgba(255,255,255,0.12)] transition hover:scale-105 hover:bg-cyan-50 hover:shadow-[0_0_36px_rgba(34,211,238,0.3)]"
          >
            Read Books

            <ArrowRight
              size={18}
              className="transition group-hover:translate-x-1"
            />
          </Link>

          <Link
            to="/reader"
            className="group flex items-center gap-2.5 rounded-full border border-cyan-400/30 bg-cyan-400/5 px-8 py-4 font-bold text-cyan-200 transition hover:scale-105 hover:bg-cyan-400/10 hover:border-cyan-400/50 hover:text-white shadow-[0_0_20px_rgba(34,211,238,0.05)] hover:shadow-[0_0_30px_rgba(34,211,238,0.15)]"
          >
            <Sparkles size={16} className="text-cyan-300 transition group-hover:scale-110 group-hover:rotate-6" />

            Publish your books
          </Link>
        </motion.div>

        {/* Stats */}

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="mt-14 flex flex-wrap gap-5 justify-center"
        >
          {stats.map((item) => (
            <div
              key={item.label}
              className="rounded-3xl border border-white/10 bg-white/5 px-6 py-5 backdrop-blur-xl"
            >
              <div className="text-3xl font-bold text-white">
                {item.number}
              </div>

              <div className="mt-1 text-sm text-white/55">
                {item.label}
              </div>
            </div>
          ))}
        </motion.div>

      </div>

      {/* Scroll Indicator */}

      <motion.div
        animate={{
          y: [0, 10, 0],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
        }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <div className="h-14 w-[2px] overflow-hidden rounded-full bg-white/10">
          <div className="h-6 w-full bg-white" />
        </div>
      </motion.div>

    </section>
  );
}