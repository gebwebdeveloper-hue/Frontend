import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Loader2, CheckCircle2, AlertCircle,
  Users, PenLine, CalendarDays, BookOpen,
  Sparkles, IdCard, BookMarked, Network,
  Mic2, FileText, Eye, Trophy, MessageCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { API_BASE } from "../config.js";
import { useGsapReveal } from "../hooks/useGsapReveal.js";
import FooterSection from "../sections/FooterSection.jsx";

const stats = [
  { icon: Users,        value: "5",  label: "Members"  },
  { icon: PenLine,      value: "7",  label: "Writers"  },
  { icon: CalendarDays, value: "2",  label: "Events"   },
  { icon: BookOpen,     value: "5",  label: "Books"    },
];

const members = [
  { name: "Ritvik Chakraborty", role: "Founder",        action: "Know More" },
  { name: "Vacant",             role: "Secretary"                           },
  { name: "Vacant",             role: "Vice-Secretary"                      },
  { name: "Vacant",             role: "Admin"                               },
  { name: "Vacant",             role: "Member"                              },
];

const events = [
  "Monthly Book Discussion",
  "Poetry Evening",
  "Creative Writing Workshop",
];

const memberBenefits = [
  { icon: BookOpen,     label: "Access to Hardcopy & Paperback Books", sub: "Available in store." },
  { icon: IdCard,       label: "20 Visiting Cards",                    sub: "Premium quality."    },
  { icon: Trophy,       label: "1 Batch (Badge)",                      sub: "Official club badge." },
  { icon: IdCard,       label: "1 Membership Card",                    sub: "Personalized card."   },
  { icon: CheckCircle2, label: "Lifetime 10% Discount",                sub: "On publishing books." },
];

const activities = [
  { icon: BookMarked,     label: "Club Diary"                  },
  { icon: MessageCircle,  label: "Story Discussion"            },
  { icon: PenLine,        label: "Poetry & Writing Sessions"   },
  { icon: Users,          label: "Workshops & Author Interaction" },
  { icon: Trophy,         label: "Events & Competitions"       },
  { icon: BookOpen,       label: "Book Launch Events"          },
];

const benefits = [
  { icon: IdCard,       label: "Membership ID Card"                    },
  { icon: BookMarked,   label: "Club Diary"                            },
  { icon: CalendarDays, label: "Literary Events"                       },
  { icon: Network,      label: "Networking"                            },
  { icon: Mic2,         label: "Workshops"                             },
  { icon: FileText,     label: "Publication Opportunities"             },
  { icon: Sparkles,     label: "Awareness Activity"                    },
  { icon: BookOpen,     label: "Story Discussion"                      },
  { icon: PenLine,      label: "Motivate New Gen to Read & Write"      },
  { icon: Users,        label: "Cultural Program Activity"             },
  { icon: Eye,          label: "Book Review"                           },
  { icon: CheckCircle2, label: "Proof Reading Before Publication"      },
];

const initialForm = {
  fullName: "", email: "", phone: "", whatsapp: "",
  dateOfBirth: "", address: "", reason: "",
};

function Field({ label, children }) {
  return (
    <label className="block text-sm font-bold text-white/75">
      {label}
      {children}
    </label>
  );
}

export default function ClubPage() {
  const scope = useGsapReveal({ stagger: 0.06, y: 24 });
  const [showMembers, setShowMembers] = useState(false);
  const [form, setForm]               = useState(initialForm);
  const [loading, setLoading]         = useState(false);
  const [message, setMessage]         = useState({ type: "", text: "" });

  const setField = (key) => (e) => {
    const value = ["phone", "whatsapp"].includes(key)
      ? e.target.value.replace(/[^0-9]/g, "").slice(0, 10)
      : e.target.value;
    setForm((cur) => ({ ...cur, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });
    try {
      const res  = await fetch(`${API_BASE}/club/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setForm(initialForm);
        setMessage({
          type: "success",
          text: data.adminEmailSent
            ? "Application submitted and mailed to admin."
            : "Application submitted. Admin email could not be confirmed.",
        });
      } else {
        setMessage({ type: "error", text: data.message || "Could not submit application." });
      }
    } catch {
      setMessage({ type: "error", text: "Could not submit application." });
    } finally {
      setLoading(false);
    }
  };

  const scrollToJoin = (e) => {
    if (e) e.preventDefault();
    const el = document.getElementById("join-club");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => {
        const input = el.querySelector("input");
        if (input) input.focus();
      }, 500);
    }
  };

  const scrollToMembers = () => {
    setShowMembers(true);
    setTimeout(() => {
      const el = document.getElementById("our-members");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  return (
    <main ref={scope} className="relative overflow-hidden pt-28">
      {/* Ambient blobs */}
      <div className="pointer-events-none absolute left-[-10%] top-20 h-[32rem] w-[32rem] rounded-full bg-cyan-500/10 blur-[170px]" />
      <div className="pointer-events-none absolute right-[-10%] top-[28rem] h-[34rem] w-[34rem] rounded-full bg-fuchsia-500/10 blur-[190px]" />

      {/* ══════════════ HERO (FULL-WIDTH EDGE-TO-EDGE) ══════════════ */}
      <section className="relative z-10 w-full overflow-hidden pb-12 sm:pb-16 pt-4 md:pt-6">
        {/* Full-width edge-to-edge Background Image & Overlay Container */}
        <div className="absolute inset-0 z-0">
          <img
            src="/club-hero-bg.png"
            alt="Lekhok Tripura Club Hero Background"
            className="h-full w-full object-cover object-[78%_center] sm:object-center lg:object-right opacity-90 sm:opacity-95 transition-transform duration-1000 scale-105"
          />
          {/* Responsive dark overlay gradients: vertical on mobile portrait, horizontal on tablet/desktop */}
          <div className="absolute inset-0 bg-gradient-to-b sm:bg-gradient-to-r from-zinc-950/90 via-zinc-950/75 sm:via-zinc-950/65 to-zinc-950/40 sm:to-zinc-950/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 sm:via-transparent to-zinc-950/50 sm:to-zinc-950/30" />
        </div>

        {/* Hero Content Container */}
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-24">
          <div className="max-w-2xl text-left">
            <motion.div data-reveal>
              {/* Eyebrow badge */}
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-zinc-950/80 px-4 py-1.5 backdrop-blur-md shadow-lg">
                <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                <span className="text-[11px] font-black uppercase tracking-[0.4em] text-cyan-300">
                  Readers &amp; Writers Club &nbsp;·&nbsp; Est. 2025
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl font-black uppercase leading-[1.06] text-white sm:text-5xl md:text-6xl lg:text-[5rem]">
                Join<br />
                <span className="bg-gradient-to-r from-cyan-300 via-teal-200 to-fuchsia-300 bg-clip-text text-transparent drop-shadow">
                  Lekhok
                </span><br />
                Tripura Club
              </h1>

              {/* Bengali tagline */}
              <p className="mt-4 text-lg font-bold tracking-wide text-cyan-300 drop-shadow md:text-xl">
                কলমে ত্রিপুরা, কথায় পরিবর্তন
              </p>

              {/* Subtitle */}
              <p className="mt-3.5 max-w-xl text-sm leading-relaxed text-white/85 drop-shadow sm:text-base md:text-lg">
                A community of writers, by writers, for literature.
                Be a part of a growing literary movement in Tripura.
              </p>

              {/* Price & Membership tag */}
              <div className="mt-7 flex flex-wrap items-center gap-4">
                <div className="inline-flex items-center gap-3.5 rounded-2xl border border-amber-400/40 bg-zinc-950/85 px-5 py-3 backdrop-blur-md shadow-xl shadow-black/40">
                  <span className="text-[11px] font-black uppercase tracking-widest text-amber-300">
                    Lifetime Membership
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-white">₹999</span>
                  <span className="rounded-lg bg-amber-400 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-black">
                    ONLY
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={scrollToJoin}
                  className="rounded-2xl bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 px-8 py-4 text-xs sm:text-sm font-black uppercase tracking-wider text-black shadow-[0_0_40px_rgba(6,182,212,0.45)] transition hover:scale-105 hover:shadow-[0_0_55px_rgba(6,182,212,0.6)] active:scale-100 cursor-pointer"
                >
                  Become a Member
                </button>
                <button
                  type="button"
                  onClick={scrollToMembers}
                  className="rounded-2xl border border-white/25 bg-zinc-950/75 px-7 py-4 text-xs sm:text-sm font-bold text-white backdrop-blur-md shadow-lg transition hover:bg-white/20 hover:border-white/40 cursor-pointer"
                >
                  Check Our Members
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── Stats Row Below Hero ── */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(({ icon: Icon, value, label }) => (
            <motion.div
              key={label}
              data-reveal
              whileHover={{ y: -4 }}
              className="group rounded-2xl border border-white/10 bg-zinc-950/70 p-6 text-center shadow-card backdrop-blur-xl transition-all hover:border-cyan-400/30 hover:bg-zinc-900/80"
            >
              <Icon className="mx-auto mb-2.5 h-6 w-6 text-cyan-400 transition group-hover:scale-110" />
              <div className="text-3xl font-black text-white">{value}</div>
              <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-white/50">{label}</div>
            </motion.div>
          ))}
        </div>

        {/* ── Member Benefits Strip ── */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6">
          <div className="rounded-3xl border border-white/10 bg-zinc-950/70 p-6 sm:p-8 backdrop-blur-md shadow-2xl">
            <p className="mb-5 text-center text-[11px] font-black uppercase tracking-[0.45em] text-white/40">
              Member Will Get
            </p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {memberBenefits.map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex flex-col items-center gap-2 text-center">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
                    <Icon className="h-5 w-5 text-cyan-400" />
                  </div>
                  <p className="text-xs font-bold leading-snug text-white/80">{label}</p>
                  <p className="text-[10px] text-white/40">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Club Activities Row ── */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-4">
          <div className="rounded-2xl border border-white/10 bg-zinc-950/70 p-4 sm:p-5 backdrop-blur-md shadow-xl">
            <p className="mb-3.5 text-center text-[11px] font-black uppercase tracking-[0.45em] text-white/40">
              Club Activities
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              {activities.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-white/70 transition hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-white"
                >
                  <Icon className="h-3.5 w-3.5 text-cyan-400" />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ ABOUT US ══════════════ */}
      <section id="about-us" className="section-shell relative z-10 py-16">
        <h2 data-reveal className="text-center text-4xl font-black text-white md:text-5xl">About Us</h2>
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <article data-reveal className="rounded-lg border border-white/10 bg-white/[0.055] p-7 text-left text-base leading-8 text-white/70 shadow-card backdrop-blur-xl md:p-9 md:text-lg">
            <p>Lekhok Tripura Club is a community dedicated to writers, readers, and literature enthusiasts across Tripura. Founded with a vision to promote reading and creative writing, the club serves as a platform where literary minds can connect, share ideas, and grow together.</p>
            <p className="mt-5">In an age where reading habits are gradually declining and aspiring writers often struggle to find opportunities, Lekhok Tripura Club was created to revive the culture of books and storytelling.</p>
            <p className="mt-5">Our mission is to encourage reading, support emerging writers, and build a vibrant literary community through discussions, events, workshops, book promotions, and collaborative activities.</p>
            <p className="mt-5">Lekhok Tripura Club welcomes readers, writers, poets, bloggers, experienced authors, and anyone who simply loves books.</p>
            <p className="mt-5 text-right font-bold text-cyan-300">- Writers &amp; Readers Club</p>
          </article>

          <article data-reveal className="rounded-lg border border-white/10 bg-white/[0.055] p-7 text-left text-base leading-8 text-white/70 shadow-card backdrop-blur-xl md:p-9 md:text-lg">
            <p>Lekhok Tripura Club হলো Tripura-এর লেখক, পাঠক এবং সাহিত্যপ্রেমীদের জন্য একটি উন্মুক্ত সাহিত্যিক সম্প্রদায়। আমাদের বিশ্বাস, একটি সমাজের চিন্তা, সংস্কৃতি ও সৃজনশীলতার বিকাশের অন্যতম ভিত্তি হলো বই পড়া এবং লেখালেখির চর্চা।</p>
            <p className="mt-5">বর্তমান সময়ে বই পড়ার অভ্যাস ধীরে ধীরে কমে যাচ্ছে এবং নতুন লেখকদের জন্য নিজেদের প্রকাশ করার সুযোগও সীমিত হয়ে উঠছে। এই বাস্তবতা থেকেই Lekhok Tripura Club-এর যাত্রা শুরু।</p>
            <p className="mt-5">আমাদের লক্ষ্য হলো Tripura-এর পাঠক ও লেখকদের একত্রিত করা, বইপড়ার সংস্কৃতিকে পুনরুজ্জীবিত করা এবং নতুন লেখকদের জন্য একটি সহায়ক সাহিত্যিক পরিবেশ তৈরি করা।</p>
            <p className="mt-5">Lekhok Tripura Club শুধুমাত্র একটি ক্লাব নয়, এটি বইপ্রেমীদের একটি পরিবার।</p>
            <p className="mt-5 text-right font-bold text-cyan-300">- Writers &amp; Readers Club</p>
          </article>
        </div>
      </section>

      {/* ══════════════ OUR MEMBERS ══════════════ */}
      <section id="our-members" className="section-shell relative z-10 py-16 text-center">
        <h2 data-reveal className="text-4xl font-black text-white md:text-5xl">Our Members</h2>
        <button
          data-reveal
          onClick={() => setShowMembers((v) => !v)}
          className="mt-10 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-8 py-4 text-base font-bold text-cyan-100 transition hover:border-cyan-300/45 hover:bg-cyan-300/15"
        >
          {showMembers ? "Hide Members" : "Check Our Members"}
        </button>

        <AnimatePresence>
          {showMembers && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mx-auto mt-10 max-w-5xl rounded-lg border border-white/10 bg-white/[0.055] p-5 text-left shadow-card backdrop-blur-xl md:p-8">
                <div className="space-y-4">
                  {members.map((member, i) => (
                    <div
                      key={`${member.name}-${member.role}`}
                      className="group grid gap-4 rounded-lg border border-white/10 bg-black/25 p-5 transition hover:border-cyan-300/25 hover:bg-cyan-300/10 sm:grid-cols-[4rem_1fr_auto] sm:items-center"
                    >
                      <div className="text-lg font-black text-cyan-300/85">{String(i + 1).padStart(2, "0")}.</div>
                      <div>
                        <h3 className="text-xl font-black text-white">{member.name}</h3>
                        <p className="mt-1 text-sm text-white/55">{member.role}</p>
                      </div>
                      {member.action && (
                        <button
                          type="button"
                          onClick={() => document.getElementById("about-us")?.scrollIntoView({ behavior: "smooth" })}
                          className="text-sm font-bold text-cyan-200 underline decoration-cyan-300/30 underline-offset-4 transition group-hover:text-white cursor-pointer"
                        >
                          {member.action} →
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ══════════════ EVENTS ══════════════ */}
      <section className="section-shell relative z-10 py-16">
        <h2 data-reveal className="text-center text-4xl font-black text-white md:text-5xl">Upcoming Events</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {events.map((event) => (
            <motion.div
              key={event}
              data-reveal
              whileHover={{ y: -5 }}
              className="rounded-lg border border-white/10 bg-white/[0.055] p-7 text-lg font-semibold text-white/80 shadow-card backdrop-blur-xl"
            >
              {event}
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════════ FULL BENEFITS ══════════════ */}
      <section className="section-shell relative z-10 py-16">
        <h2 data-reveal className="text-center text-4xl font-black text-white md:text-5xl">Club Activities &amp; Benefits</h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map(({ icon: Icon, label }) => (
            <motion.div
              key={label}
              data-reveal
              whileHover={{ y: -5 }}
              className="rounded-lg border border-white/10 bg-white/[0.055] p-6 shadow-card backdrop-blur-xl"
            >
              <Icon className="mb-5 h-6 w-6 text-cyan-300" />
              <p className="text-base font-semibold leading-7 text-white/82">{label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════════ JOIN FORM ══════════════ */}
      <section id="join-club" className="section-shell relative z-10 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 data-reveal className="text-center text-4xl font-black text-white md:text-5xl">Join Our Club</h2>
          <form
            onSubmit={handleSubmit}
            data-reveal
            className="mt-10 rounded-lg border border-white/10 bg-white/[0.055] p-6 shadow-card backdrop-blur-xl md:p-8"
          >
            {message.text && (
              <div
                className={`mb-5 flex items-start gap-3 rounded-lg border p-4 text-sm ${
                  message.type === "success"
                    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                    : "border-red-500/20 bg-red-500/10 text-red-300"
                }`}
              >
                {message.type === "success"
                  ? <CheckCircle2 className="h-5 w-5 shrink-0" />
                  : <AlertCircle className="h-5 w-5 shrink-0" />}
                <span>{message.text}</span>
              </div>
            )}

            <div className="grid gap-4 text-left md:grid-cols-2">
              <Field label="Full Name">
                <input required value={form.fullName} onChange={setField("fullName")} placeholder="Enter your full name" className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white placeholder-white/25 outline-none transition focus:border-cyan-400/40 focus:bg-white/10" />
              </Field>
              <Field label="Mail ID">
                <input required type="email" value={form.email} onChange={setField("email")} placeholder="example@mail.com" className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white placeholder-white/25 outline-none transition focus:border-cyan-400/40 focus:bg-white/10" />
              </Field>
              <Field label="Phone Number">
                <input required value={form.phone} onChange={setField("phone")} placeholder="10-digit mobile number" className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white placeholder-white/25 outline-none transition focus:border-cyan-400/40 focus:bg-white/10" />
              </Field>
              <Field label="WhatsApp Number">
                <input required value={form.whatsapp} onChange={setField("whatsapp")} placeholder="10-digit WhatsApp number" className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white placeholder-white/25 outline-none transition focus:border-cyan-400/40 focus:bg-white/10" />
              </Field>
              <Field label="Date of Birth">
                <input required type="date" value={form.dateOfBirth} onChange={setField("dateOfBirth")} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40 focus:bg-white/10" />
              </Field>
              <div />
              <label className="block text-sm font-bold text-white/75 md:col-span-2">
                Address
                <textarea required value={form.address} onChange={setField("address")} placeholder="Enter your complete address" rows={3} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white placeholder-white/25 outline-none transition focus:border-cyan-400/40 focus:bg-white/10" />
              </label>
              <label className="block text-sm font-bold text-white/75 md:col-span-2">
                Why you want to join our team?
                <textarea required value={form.reason} onChange={setField("reason")} placeholder="Share your reasons for joining the club..." rows={4} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white placeholder-white/25 outline-none transition focus:border-cyan-400/40 focus:bg-white/10" />
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3 font-bold text-black transition hover:scale-105 hover:bg-cyan-50 disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Submit Application
            </button>
          </form>
        </div>
      </section>

      <div className="section-shell pb-16 pt-0">
        <Link to="/" className="text-sm font-semibold text-white/45 transition hover:text-cyan-300">
          Back to home
        </Link>
      </div>

      <FooterSection />
    </main>
  );
}
