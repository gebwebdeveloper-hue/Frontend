import { ArrowRight, Sparkles, BookOpen, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function HeroSection() {
  return (
    <section className="relative flex min-h-[90vh] md:min-h-screen items-center justify-start px-4 sm:px-8 md:px-12 xl:px-16 pt-32 pb-20 bg-black">
      {/* Background Image Container (With overflow-hidden for image scaling) */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src="/hero-bg-author.png"
          alt="Publish your Book with Lekhok Tripura"
          className="h-full w-full object-cover object-[85%_center] opacity-100 scale-105"
        />
        
        {/* Soft, minimal gradient overlay so the background image is fully vibrant and bright */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/35 25% to-transparent 55% w-full pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
      </div>

      <div className="relative z-10 mx-auto max-w-[96rem] w-full">
        <div className="max-w-2xl text-left">
          
          {/* Main Headline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="font-serif-display text-6xl sm:text-7xl md:text-8xl lg:text-[7.2rem] font-medium tracking-tight text-white leading-[0.92] select-none">
              Publish <br />
              <span className="font-normal font-serif-display italic">your</span> Book
            </h1>
          </motion.div>

          {/* Subtitle with divider lines */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="my-6 sm:my-8 max-w-lg space-y-3"
          >
            <div className="h-[1px] w-full bg-gradient-to-r from-white/40 via-white/20 to-transparent" />
            
            <div className="py-1">
              <p className="text-2xl sm:text-3xl md:text-4xl text-white/90 font-serif-display leading-tight">
                with <span className="font-bold text-white font-sans tracking-tight">India’s #1</span>
              </p>
              <p className="text-2xl sm:text-3xl md:text-4xl text-white/90 font-serif-display leading-tight mt-0.5">
                Publishing Platform
              </p>
            </div>

            <div className="h-[1px] w-full bg-gradient-to-r from-white/40 via-white/20 to-transparent" />
          </motion.div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-sm sm:text-base md:text-lg text-white/65 font-light tracking-wide"
          >
            Trusted by over <strong className="font-semibold text-white">10,000</strong> authors worldwide
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.8 }}
            className="mt-8 sm:mt-10 flex flex-wrap items-center gap-4"
          >
            <Link
              to="/reader"
              className="group flex items-center gap-3 rounded-full bg-white px-8 py-4 text-sm sm:text-base font-bold text-black shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all duration-300 hover:scale-105 hover:bg-cyan-50 hover:shadow-[0_0_40px_rgba(34,211,238,0.4)]"
            >
              <Sparkles size={18} className="text-black transition-transform group-hover:rotate-12" />
              <span>Publish Your Book</span>
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              to="/library"
              className="group flex items-center gap-2.5 rounded-full border border-white/20 bg-white/5 px-7 py-4 text-sm sm:text-base font-semibold text-white backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:bg-white/15 hover:border-white/40"
            >
              <BookOpen size={18} className="text-cyan-300" />
              <span>Read Books</span>
            </Link>
          </motion.div>

          {/* Highlights / Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="mt-12 flex flex-wrap items-center gap-6 border-t border-white/10 pt-6"
          >
            <div className="flex items-center gap-2.5 text-xs sm:text-sm text-white/70">
              <ShieldCheck size={16} className="text-cyan-400 shrink-0" />
              <span>100% Author Royalty Keep</span>
            </div>
            <div className="h-4 w-[1px] bg-white/15 hidden sm:block" />
            <div className="flex items-center gap-2.5 text-xs sm:text-sm text-white/70">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span>Instant PDF & Print Publishing</span>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Circular Animated Video Logo Emblem between Hero & Our Publications */}
      <div className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 z-30 pointer-events-none">
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          whileInView={{ scale: 1, opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative group pointer-events-auto flex items-center justify-center cursor-pointer"
        >
          {/* Ambient Outer Glow */}
          <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-indigo-500 opacity-60 blur-2xl group-hover:opacity-100 transition duration-700 animate-pulse" />
          
          {/* Outer Glass Ring Frame */}
          <div className="relative flex items-center justify-center p-1 rounded-full bg-gradient-to-tr from-cyan-400 via-white/50 to-fuchsia-500 shadow-[0_0_60px_rgba(34,211,238,0.4)] backdrop-blur-xl">
            {/* Mask Container */}
            <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden bg-black shadow-2xl">
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
              <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/50 pointer-events-none rounded-full" />
              <div className="absolute inset-0 ring-1 ring-white/30 rounded-full pointer-events-none" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}