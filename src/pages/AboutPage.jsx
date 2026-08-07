import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BookOpen, Sparkles, MapPin, Calendar, HeartHandshake, ShieldCheck,
  Award, Compass, Target, Feather, Layers, CheckCircle2, Globe, Cpu,
  Rocket, Users, ArrowRight, Lightbulb, Check, ChevronRight, FileText,
  Printer, Smartphone, ShoppingBag, Share2, Megaphone, Star, MessageSquare, BookMarked
} from "lucide-react";
import PageTransition from "../components/PageTransition.jsx";
import FooterSection from "../sections/FooterSection.jsx";
import { useGsapReveal } from "../hooks/useGsapReveal.js";

// 19 Complete Publishing Services
const services = [
  { icon: FileText,     title: "Manuscript Formatting",      desc: "Professional typography & structural manuscript alignment." },
  { icon: Layers,       title: "Interior Book Design",       desc: "Custom page layouts tailored to genre & reading comfort." },
  { icon: Sparkles,     title: "Creative Cover Design",      desc: "Eye-catching, market-ready book cover illustrations." },
  { icon: ShieldCheck,  title: "ISBN Registration",          desc: "Official barcode & ISBN assignment for legal identification." },
  { icon: BookOpen,     title: "Paperback Publishing",       desc: "High-quality print production with crisp matte/gloss finish." },
  { icon: BookMarked,   title: "Hardcover Publishing",       desc: "Durable collector's edition hardbound book binding." },
  { icon: Smartphone,   title: "eBook Publishing",           desc: "Reflowable ePub formatting for screen readability." },
  { icon: Smartphone,   title: "Kindle Publishing",          desc: "Optimized Amazon KDP eBook distribution." },
  { icon: Globe,        title: "Google Play Books",          desc: "Global Android reader reach via Google Play." },
  { icon: Printer,      title: "Print-on-Demand (POD)",      desc: "Zero-inventory smart printing as orders arrive." },
  { icon: Globe,        title: "Online Distribution",        desc: "Nationwide availability across leading online stores." },
  { icon: Globe,        title: "Website Listing",            desc: "Featured placement on our official store & library." },
  { icon: ShoppingBag,  title: "Amazon Publishing",          desc: "Prime listing with nationwide doorstep delivery." },
  { icon: ShoppingBag,  title: "Flipkart Listing",           desc: "Pan-India presence on Flipkart's bookstore." },
  { icon: Award,        title: "Author Branding",            desc: "Personal branding, bio creation & author identity." },
  { icon: Megaphone,    title: "Book Marketing",             desc: "Targeted promotional campaigns & audience outreach." },
  { icon: Share2,       title: "Social Media Promotions",    desc: "Custom banners, video teasers & social highlights." },
  { icon: Rocket,       title: "Book Launch Support",        desc: "Virtual & physical launch event coordination." },
  { icon: MessageSquare,title: "Publishing Consultation",    desc: "1-on-1 expert guidance through every step." }
];

// Why Authors Choose Us Points
const whyChooseUs = [
  "Professional publishing guidance from day one",
  "Transparent, affordable pricing with zero hidden fees",
  "High-quality physical book production & paper stock",
  "Custom creative cover & interior design solutions",
  "Nationwide physical and digital distribution",
  "Dedicated book marketing & social media support",
  "Prompt, personalized 1-on-1 author communication",
  "Strict project timelines & publishing management",
  "100% author-focused service model & IP respect",
  "Long-term literary partnership beyond launch"
];

// Core Belief Pillars
const beliefPillars = [
  { icon: ShieldCheck, title: "Books Preserve History",       desc: "Storing cultural heritage, memories, and timeless knowledge." },
  { icon: Users,       title: "Books Shape Societies",       desc: "Fostering empathy, critical thinking, and social progress." },
  { icon: Lightbulb,   title: "Books Inspire Generations",   desc: "Sparking imagination and curiosity in future minds." },
  { icon: Compass,     title: "Books Challenge Perspectives",desc: "Introducing novel ideas that reshape how we see the world." },
  { icon: HeartHandshake, title: "Books Create Cultural Impact", desc: "Building bridges across languages and regional boundaries." }
];

export default function AboutPage() {
  const scope = useGsapReveal({ stagger: 0.05, y: 24 });
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <PageTransition>
      <main ref={scope} className="relative min-h-screen overflow-hidden bg-zinc-950 pt-28 text-white">
        {/* Ambient Glowing Blobs */}
        <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-cyan-500/10 blur-[160px]" />
        <div className="pointer-events-none absolute -right-40 top-96 h-[30rem] w-[30rem] rounded-full bg-indigo-500/10 blur-[180px]" />
        <div className="pointer-events-none absolute left-1/3 bottom-96 h-96 w-96 rounded-full bg-fuchsia-500/10 blur-[170px]" />

        {/* ══════════════ HERO SECTION ══════════════ */}
        <section className="section-shell relative z-10 pb-16 pt-6 text-center md:pb-24 md:pt-10">
          <motion.div data-reveal className="mx-auto max-w-4xl">
            {/* Eyebrow Badge */}
            <div className="mb-6 inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1.5 backdrop-blur-md">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <span className="text-xs font-black uppercase tracking-[0.35em] text-cyan-300">
                About Lekhok Tripura Publishers
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl font-black uppercase leading-tight tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
              Transforming <span className="bg-gradient-to-r from-cyan-300 via-teal-200 to-indigo-300 bg-clip-text text-transparent">Dreams</span> Into Published Books
            </h1>

            {/* Subtitle */}
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/70 md:text-xl">
              Every book has the power to inspire, educate, preserve culture, and change lives. Behind every remarkable book is an author with a unique voice, a meaningful story, and a dream of reaching readers.
            </p>

            {/* Quick Location & Foundation Badges */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-extrabold text-cyan-300 backdrop-blur-md">
                <MapPin className="h-4 w-4 text-cyan-400" />
                Agartala, Tripura
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-extrabold text-amber-300 backdrop-blur-md">
                <Calendar className="h-4 w-4 text-amber-400" />
                Est. 5 March 2024
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-extrabold text-emerald-300 backdrop-blur-md">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                Author-First &amp; Transparent
              </div>
            </div>
          </motion.div>
        </section>

        {/* ══════════════ WELCOME & FOUNDATIONAL VISION ══════════════ */}
        <section className="section-shell relative z-10 pb-16">
          <div data-reveal className="relative overflow-hidden rounded-3xl border border-cyan-500/25 bg-gradient-to-br from-cyan-950/30 via-zinc-950 to-indigo-950/30 p-8 shadow-2xl backdrop-blur-xl md:p-12">
            <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
            
            <div className="relative z-10 grid gap-8 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-8">
                <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-400">Welcome To Our Publishing House</p>
                <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl md:text-4xl">
                  Making Publishing Transparent, Accessible &amp; Affordable
                </h2>
                <div className="mt-6 space-y-4 text-sm sm:text-base leading-relaxed text-white/75">
                  <p>
                    Founded on <strong className="text-white">5 March 2024</strong> in <strong className="text-cyan-300">Agartala, Tripura</strong>, Lekhok Tripura Publishers was established with a simple yet powerful vision—to create a publishing house where authors are respected, creativity is celebrated, and the publishing journey is transparent, affordable, and accessible for everyone.
                  </p>
                  <p>
                    We believe that publishing should never be limited by geography, financial barriers, or industry complexity. Every writer, regardless of experience, deserves an equal opportunity to publish professionally and share their work with readers around the world.
                  </p>
                  <p>
                    Whether you are a first-time author taking your first step into publishing or an experienced writer looking for a reliable publishing partner, our mission is to provide the guidance, expertise, and professional support needed to bring your manuscript to life.
                  </p>
                </div>
              </div>

              <div className="lg:col-span-4 flex flex-col gap-4">
                <div className="rounded-2xl border border-white/10 bg-zinc-900/80 p-6 backdrop-blur-md">
                  <div className="text-3xl font-black text-cyan-300">5 March 2024</div>
                  <div className="mt-1 text-xs font-bold uppercase tracking-wider text-white/50">Founded In Agartala</div>
                  <p className="mt-2 text-xs text-white/65">Building a trusted independent publishing brand for writers nationwide.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-zinc-900/80 p-6 backdrop-blur-md">
                  <div className="text-3xl font-black text-amber-300">100% Transparent</div>
                  <div className="mt-1 text-xs font-bold uppercase tracking-wider text-white/50">Author Rights &amp; Royalties</div>
                  <p className="mt-2 text-xs text-white/65">Complete respect for creative vision and intellectual property.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════ OUR STORY ══════════════ */}
        <section className="section-shell relative z-10 py-16">
          <div className="text-center">
            <p data-reveal className="text-xs font-black uppercase tracking-[0.35em] text-cyan-400">Where It All Began</p>
            <h2 data-reveal className="mt-2 text-3xl font-black text-white sm:text-4xl md:text-5xl">Our Story</h2>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            <article data-reveal className="flex flex-col justify-between rounded-3xl border border-white/10 bg-white/[0.03] p-8 shadow-card backdrop-blur-xl md:p-10">
              <div>
                <div className="grid h-12 w-12 place-items-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-300 mb-6">
                  <Feather size={24} />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Overcoming Publishing Barriers</h3>
                <p className="text-sm sm:text-base leading-relaxed text-white/70 space-y-4">
                  The journey of Lekhok Tripura Publishers began with a realization that many talented writers struggle not because of a lack of creativity, but because of a lack of opportunities.
                </p>
                <p className="mt-4 text-sm sm:text-base leading-relaxed text-white/70">
                  Many aspiring authors face confusing publishing processes, expensive service charges, poor communication, limited marketing support, or publishing models that fail to recognize the value of their work. These challenges discourage countless writers from publishing their stories.
                </p>
              </div>
              <div className="mt-8 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4 text-xs font-semibold text-cyan-200">
                💡 Lekhok Tripura Publishers was created to solve these exact problems.
              </div>
            </article>

            <article data-reveal className="flex flex-col justify-between rounded-3xl border border-white/10 bg-white/[0.03] p-8 shadow-card backdrop-blur-xl md:p-10">
              <div>
                <div className="grid h-12 w-12 place-items-center rounded-2xl border border-indigo-400/30 bg-indigo-400/10 text-indigo-300 mb-6">
                  <HeartHandshake size={24} />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Building Genuine Partnerships</h3>
                <p className="text-sm sm:text-base leading-relaxed text-white/70">
                  Our goal has always been to make professional publishing straightforward, transparent, and author-friendly. We wanted to create an environment where writers feel supported from the moment they complete their manuscript until the day their book reaches readers.
                </p>
                <p className="mt-4 text-sm sm:text-base leading-relaxed text-white/70">
                  Instead of treating authors as customers, we believe in building long-term partnerships based on trust, professionalism, and mutual growth. Every manuscript represents years of imagination, dedication, research, and personal emotion.
                </p>
              </div>
              <div className="mt-8 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4 text-xs font-semibold text-indigo-200">
                🤝 We approach every project with the same care and commitment as our own work.
              </div>
            </article>
          </div>
        </section>

        {/* ══════════════ WHAT WE BELIEVE ══════════════ */}
        <section className="section-shell relative z-10 py-16">
          <div className="text-center">
            <p data-reveal className="text-xs font-black uppercase tracking-[0.35em] text-cyan-400">Our Core Philosophy</p>
            <h2 data-reveal className="mt-2 text-3xl font-black text-white sm:text-4xl md:text-5xl">What We Believe</h2>
            <p data-reveal className="mx-auto mt-4 max-w-2xl text-sm sm:text-base text-white/60">
              Books are more than products. Publishing is not merely a business—it is a lasting responsibility.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {beliefPillars.map(({ icon: Icon, title, desc }) => (
              <motion.div
                key={title}
                data-reveal
                whileHover={{ y: -6 }}
                className="group rounded-2xl border border-white/10 bg-white/[0.035] p-6 text-center shadow-card backdrop-blur-xl transition hover:border-cyan-400/40 hover:bg-white/[0.07]"
              >
                <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-400 group-hover:scale-110 transition">
                  <Icon size={22} />
                </div>
                <h3 className="text-sm font-extrabold text-white mb-2">{title}</h3>
                <p className="text-xs text-white/55 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>

          <div data-reveal className="mt-8 rounded-3xl border border-white/10 bg-white/[0.02] p-6 text-center md:p-8">
            <p className="text-sm sm:text-base text-white/80 leading-relaxed max-w-3xl mx-auto">
              At Lekhok Tripura Publishers, every title we publish contributes to a larger mission of promoting reading, encouraging creative expression, and supporting the growth of literature across India. We are particularly passionate about discovering fresh voices, encouraging emerging writers, and giving regional literature the professional platform it deserves.
            </p>
          </div>
        </section>

        {/* ══════════════ MISSION & VISION ══════════════ */}
        <section className="section-shell relative z-10 py-16">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Our Mission */}
            <div data-reveal className="relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/40 via-zinc-950 to-zinc-950 p-8 shadow-2xl backdrop-blur-xl md:p-10">
              <div className="grid h-14 w-14 place-items-center rounded-2xl border border-cyan-400/30 bg-cyan-400/15 text-cyan-300 mb-6">
                <Target size={28} />
              </div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-400">Purpose &amp; Goals</p>
              <h3 className="mt-1 text-2xl font-black text-white sm:text-3xl">Our Mission</h3>
              <p className="mt-4 text-sm sm:text-base leading-relaxed text-white/75">
                Our mission is to empower writers by providing affordable, transparent, and professional publishing solutions without compromising on quality. We strive to simplify the publishing experience while maintaining the highest standards in editorial support, book production, design, distribution, and marketing.
              </p>
              <p className="mt-4 text-sm sm:text-base leading-relaxed text-white/75">
                Our objective is not simply to publish books but to help authors establish long-term literary careers.
              </p>
              <div className="mt-8 rounded-2xl border border-cyan-400/30 bg-cyan-400/10 p-5 text-center">
                <p className="text-xs font-bold uppercase tracking-wider text-cyan-300">Our Guiding Question</p>
                <p className="mt-1 text-lg font-black text-white">"How can we help this author succeed?"</p>
              </div>
            </div>

            {/* Our Vision */}
            <div data-reveal className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 via-zinc-950 to-zinc-950 p-8 shadow-2xl backdrop-blur-xl md:p-10">
              <div className="grid h-14 w-14 place-items-center rounded-2xl border border-indigo-400/30 bg-indigo-400/15 text-indigo-300 mb-6">
                <Compass size={28} />
              </div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-indigo-400">Future Outlook</p>
              <h3 className="mt-1 text-2xl font-black text-white sm:text-3xl">Our Vision</h3>
              <p className="mt-4 text-sm sm:text-base leading-relaxed text-white/75">
                Our vision is to become one of India's most respected independent publishing houses by creating opportunities for writers from every background. We aspire to build a publishing ecosystem where creativity is encouraged, regional voices receive national recognition, and every deserving manuscript reaches its audience.
              </p>
              <p className="mt-4 text-sm sm:text-base leading-relaxed text-white/75">
                In the coming years, we aim to expand our publishing network, strengthen our digital presence, introduce innovative publishing technologies, and collaborate with authors, educators, literary organizations, and readers nationwide.
              </p>
              <div className="mt-8 rounded-2xl border border-indigo-400/30 bg-indigo-400/10 p-5 text-center">
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-300">Our Benchmark</p>
                <p className="mt-1 text-sm font-bold text-white">Synonymous with Quality, Integrity, Innovation &amp; Author Satisfaction.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════ WHAT WE DO (OUR SERVICES) ══════════════ */}
        <section className="section-shell relative z-10 py-16">
          <div className="text-center">
            <p data-reveal className="text-xs font-black uppercase tracking-[0.35em] text-cyan-400">Complete Publishing Solutions Under One Roof</p>
            <h2 data-reveal className="mt-2 text-3xl font-black text-white sm:text-4xl md:text-5xl">What We Do</h2>
            <p data-reveal className="mx-auto mt-4 max-w-2xl text-sm sm:text-base text-white/60">
              Every service is carefully designed to help authors publish confidently while maintaining professional publishing standards.
            </p>
          </div>

          <div data-reveal className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {services.map(({ icon: Icon, title, desc }) => (
              <motion.div
                key={title}
                whileHover={{ y: -5 }}
                className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl transition hover:border-cyan-400/40 hover:bg-white/[0.06]"
              >
                <div className="mb-4 grid h-10 w-10 place-items-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-400 group-hover:scale-110 transition">
                  <Icon size={20} />
                </div>
                <h3 className="text-sm font-extrabold text-white group-hover:text-cyan-300 transition">{title}</h3>
                <p className="mt-1 text-xs text-white/55 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ══════════════ PHILOSOPHY & SUPPORTING NEW AUTHORS ══════════════ */}
        <section className="section-shell relative z-10 py-16">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Publishing Philosophy */}
            <div data-reveal className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl md:p-10">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-400">Guiding Principles</p>
              <h3 className="mt-1 text-2xl font-black text-white sm:text-3xl">Our Publishing Philosophy</h3>
              <ul className="mt-6 space-y-3">
                {[
                  "Every author deserves honesty.",
                  "Every manuscript deserves respect.",
                  "Every published book deserves professional presentation.",
                  "We never believe in unnecessary complexity.",
                  "We communicate clearly & maintain full process transparency.",
                  "We provide practical guidance & encourage team collaboration."
                ].map((point) => (
                  <li key={point} className="flex items-start gap-3 text-sm sm:text-base text-white/80">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-cyan-400 mt-0.5" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Supporting Emerging Authors */}
            <div data-reveal className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl md:p-10">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-amber-400">New Voices Matter</p>
              <h3 className="mt-1 text-2xl font-black text-white sm:text-3xl">Supporting Emerging Authors</h3>
              <p className="mt-6 text-sm sm:text-base leading-relaxed text-white/75">
                Many publishing houses focus primarily on established writers. At Lekhok Tripura Publishers, we strongly believe in the power of new voices. Some of today's most celebrated authors once struggled to publish their very first book.
              </p>
              <p className="mt-4 text-sm sm:text-base leading-relaxed text-white/75">
                Our team works closely with new authors, providing step-by-step guidance throughout the publishing process—from manuscript preparation to distribution and marketing. We believe talent should always be given an opportunity.
              </p>
            </div>
          </div>
        </section>

        {/* ══════════════ QUALITY & TECHNOLOGY ══════════════ */}
        <section className="section-shell relative z-10 py-16">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Commitment to Quality */}
            <div data-reveal className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl md:p-10">
              <div className="grid h-12 w-12 place-items-center rounded-2xl border border-emerald-400/30 bg-emerald-400/10 text-emerald-300 mb-6">
                <Star size={24} />
              </div>
              <h3 className="text-2xl font-black text-white sm:text-3xl">Our Commitment to Quality</h3>
              <p className="mt-4 text-sm sm:text-base leading-relaxed text-white/75">
                Quality is the foundation of our publishing process. Every book published under the Lekhok Tripura Publishers name reflects our commitment to professional standards.
              </p>
              <p className="mt-4 text-sm sm:text-base leading-relaxed text-white/75">
                From typography and page layout to cover aesthetics, printing quality, digital formatting, and online presentation, every detail matters. Our goal is to ensure each publication offers readers an enjoyable experience while giving authors a book they can proudly call their own.
              </p>
            </div>

            {/* Technology Meets Publishing */}
            <div data-reveal className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl md:p-10">
              <div className="grid h-12 w-12 place-items-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-300 mb-6">
                <Cpu size={24} />
              </div>
              <h3 className="text-2xl font-black text-white sm:text-3xl">Technology Meets Publishing</h3>
              <p className="mt-4 text-sm sm:text-base leading-relaxed text-white/75">
                Modern readers consume books across multiple formats—printed editions, eBooks, smartphones, tablets, and eReaders. Lekhok Tripura Publishers embraces modern technology while preserving the timeless value of physical books.
              </p>
              <p className="mt-4 text-sm sm:text-base leading-relaxed text-white/75">
                Through digital publishing, print-on-demand solutions, and online distribution platforms, we enable authors to reach readers across India and around the world.
              </p>
            </div>
          </div>
        </section>

        {/* ══════════════ WHY AUTHORS CHOOSE US ══════════════ */}
        <section className="section-shell relative z-10 py-16">
          <div className="text-center">
            <p data-reveal className="text-xs font-black uppercase tracking-[0.35em] text-cyan-400">Built On Trust &amp; Quality</p>
            <h2 data-reveal className="mt-2 text-3xl font-black text-white sm:text-4xl md:text-5xl">Why Authors Choose Us</h2>
          </div>

          <div data-reveal className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
            {whyChooseUs.map((reason, i) => (
              <motion.div
                key={reason}
                whileHover={{ x: 6 }}
                className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-md transition hover:border-cyan-400/30 hover:bg-white/[0.06]"
              >
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-500 text-black font-black text-xs">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <p className="text-sm sm:text-base font-bold text-white/85">{reason}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ══════════════ LOOKING AHEAD & JOIN OUR JOURNEY ══════════════ */}
        <section className="section-shell relative z-10 py-16">
          <div data-reveal className="relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/60 via-zinc-950 to-indigo-950/60 p-8 text-center shadow-2xl backdrop-blur-xl md:p-14">
            <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />

            <div className="relative z-10 mx-auto max-w-3xl">
              <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-300">
                <Rocket size={28} />
              </div>
              <p className="text-xs font-black uppercase tracking-[0.4em] text-cyan-300">Start Your Publishing Journey</p>
              <h2 className="mt-2 text-3xl font-black text-white sm:text-4xl md:text-5xl">
                Join Our Literary Journey
              </h2>
              <p className="mt-5 text-sm sm:text-base leading-relaxed text-white/75">
                Whether your manuscript is your first story, your lifelong research, your poetry collection, your novel, your memoir, your children's book, or your academic work, we are honored to become part of your publishing journey.
              </p>
              <div className="mt-6 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm font-black text-amber-300 max-w-xl mx-auto">
                "Your story deserves to be published. Your voice deserves to be heard. Your journey begins with Lekhok Tripura Publishers."
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <a
                  href="#contact"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/club#join-club");
                  }}
                  className="rounded-2xl bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 px-8 py-4 text-xs sm:text-sm font-black uppercase tracking-wider text-black shadow-[0_0_40px_rgba(6,182,212,0.45)] transition hover:scale-105 hover:shadow-[0_0_55px_rgba(6,182,212,0.6)] active:scale-100"
                >
                  Publish With Us
                </a>
                <Link
                  to="/library"
                  className="rounded-2xl border border-white/20 bg-white/10 px-7 py-4 text-xs sm:text-sm font-bold text-white backdrop-blur-md transition hover:bg-white/20 hover:border-white/40"
                >
                  Explore Library
                </Link>
                <Link
                  to="/club"
                  className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-7 py-4 text-xs sm:text-sm font-bold text-cyan-200 backdrop-blur-md transition hover:bg-cyan-400/20 hover:border-cyan-400/50"
                >
                  Join Writers Club
                </Link>
              </div>
            </div>
          </div>
        </section>

        <FooterSection />
      </main>
    </PageTransition>
  );
}
