import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, CheckCircle2, AlertCircle, Users, PenLine, CalendarDays, BookOpen, Sparkles, IdCard, BookMarked, Network, Mic2, FileText, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { API_BASE } from "../config.js";
import { useGsapReveal } from "../hooks/useGsapReveal.js";
import FooterSection from "../sections/FooterSection.jsx";


const stats = [
  { icon: Users, value: "250+", label: "Members" },
  { icon: PenLine, value: "100+", label: "Writers" },
  { icon: CalendarDays, value: "40+", label: "Events" },
  { icon: BookOpen, value: "50+", label: "Books" },
];

const members = [
  { name: "Ritvik Chakraborty", role: "Founder", action: "Know More" },
  { name: "Vacant", role: "Secretary" },
  { name: "Vacant", role: "Vice-Secretary" },
  { name: "Vacant", role: "Admin" },
  { name: "Vacant", role: "Member" },
];

const events = ["Monthly Book Discussion", "Poetry Evening", "Creative Writing Workshop"];

const benefits = [
  { icon: IdCard, label: "Membership ID Card" },
  { icon: BookMarked, label: "Club Diary" },
  { icon: CalendarDays, label: "Literary Events" },
  { icon: Network, label: "Networking" },
  { icon: Mic2, label: "Workshops" },
  { icon: FileText, label: "Publication Opportunities" },
  { icon: Sparkles, label: "Awareness Activity" },
  { icon: BookOpen, label: "Story Discussion" },
  { icon: PenLine, label: "Motivate New Gen to Read & Write" },
  { icon: Users, label: "Cultural Program Activity" },
  { icon: Eye, label: "Book Review" },
  { icon: CheckCircle2, label: "Proof Reading Before Publication" },
];

const initialForm = {
  fullName: "",
  email: "",
  phone: "",
  whatsapp: "",
  dateOfBirth: "",
  address: "",
  reason: "",
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
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const setField = (key) => (event) => {
    const value = ["phone", "whatsapp"].includes(key)
      ? event.target.value.replace(/[^0-9]/g, "").slice(0, 10)
      : event.target.value;
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch(`${API_BASE}/club/join`, {
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

  return (
    <main ref={scope} className="relative overflow-hidden pt-32">
      <div className="pointer-events-none absolute left-[-10%] top-20 h-[32rem] w-[32rem] rounded-full bg-cyan-500/10 blur-[170px]" />
      <div className="pointer-events-none absolute right-[-10%] top-[28rem] h-[34rem] w-[34rem] rounded-full bg-fuchsia-500/10 blur-[190px]" />

      <section className="section-shell relative z-10 pb-16 text-center md:pb-24">
        <motion.div data-reveal>
          <p className="text-sm font-bold uppercase tracking-[0.55em] text-cyan-300/80">Readers & Writers Club</p>
          <h1 className="mt-5 bg-gradient-to-r from-cyan-300 via-white to-fuchsia-300 bg-clip-text text-5xl font-black uppercase tracking-[0.08em] text-transparent md:text-7xl">
            Lekhok Tripura
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/68 md:text-xl">
            A literary community connecting readers and writers across Tripura.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href="#join-club" className="rounded-full bg-white px-8 py-4 text-base font-bold text-black shadow-[0_0_38px_rgba(34,211,238,0.18)] transition hover:scale-105 hover:bg-cyan-50">
              Join Club
            </a>
            <button onClick={() => setShowMembers((value) => !value)} className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-8 py-4 text-base font-bold text-cyan-100 transition hover:border-cyan-300/45 hover:bg-cyan-300/15">
              Check Our Members
            </button>
          </div>
        </motion.div>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item) => {
            const Icon = item.icon;
            return (
              <motion.div key={item.label} data-reveal whileHover={{ y: -6 }} className="rounded-lg border border-white/10 bg-white/[0.055] p-8 text-center shadow-card backdrop-blur-xl">
                <Icon className="mx-auto mb-4 h-7 w-7 text-cyan-300" />
                <div className="text-3xl font-black text-white">{item.value}</div>
                <div className="mt-2 text-base text-white/55">{item.label}</div>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="section-shell relative z-10 py-16">
        <h2 data-reveal className="text-center text-4xl font-black text-white md:text-5xl">About Us</h2>
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <article data-reveal className="rounded-lg border border-white/10 bg-white/[0.055] p-7 text-left text-base leading-8 text-white/70 shadow-card backdrop-blur-xl md:p-9 md:text-lg">
            <p>Lekhok Tripura Club is a community dedicated to writers, readers, and literature enthusiasts across Tripura. Founded with a vision to promote reading and creative writing, the club serves as a platform where literary minds can connect, share ideas, and grow together.</p>
            <p className="mt-5">In an age where reading habits are gradually declining and aspiring writers often struggle to find opportunities, Lekhok Tripura Club was created to revive the culture of books and storytelling.</p>
            <p className="mt-5">Our mission is to encourage reading, support emerging writers, and build a vibrant literary community through discussions, events, workshops, book promotions, and collaborative activities.</p>
            <p className="mt-5">Lekhok Tripura Club welcomes readers, writers, poets, bloggers, experienced authors, and anyone who simply loves books.</p>
            <p className="mt-5 text-right font-bold text-cyan-300">- Writers & Readers Club</p>
          </article>

          <article data-reveal className="rounded-lg border border-white/10 bg-white/[0.055] p-7 text-left text-base leading-8 text-white/70 shadow-card backdrop-blur-xl md:p-9 md:text-lg">
            <p>Lekhok Tripura Club হলো Tripura-এর লেখক, পাঠক এবং সাহিত্যপ্রেমীদের জন্য একটি উন্মুক্ত সাহিত্যিক সম্প্রদায়। আমাদের বিশ্বাস, একটি সমাজের চিন্তা, সংস্কৃতি ও সৃজনশীলতার বিকাশের অন্যতম ভিত্তি হলো বই পড়া এবং লেখালেখির চর্চা।</p>
            <p className="mt-5">বর্তমান সময়ে বই পড়ার অভ্যাস ধীরে ধীরে কমে যাচ্ছে এবং নতুন লেখকদের জন্য নিজেদের প্রকাশ করার সুযোগও সীমিত হয়ে উঠছে। এই বাস্তবতা থেকেই Lekhok Tripura Club-এর যাত্রা শুরু।</p>
            <p className="mt-5">আমাদের লক্ষ্য হলো Tripura-এর পাঠক ও লেখকদের একত্রিত করা, বইপড়ার সংস্কৃতিকে পুনরুজ্জীবিত করা এবং নতুন লেখকদের জন্য একটি সহায়ক সাহিত্যিক পরিবেশ তৈরি করা।</p>
            <p className="mt-5">Lekhok Tripura Club শুধুমাত্র একটি ক্লাব নয়, এটি বইপ্রেমীদের একটি পরিবার।</p>
            <p className="mt-5 text-right font-bold text-cyan-300">- Writers & Readers Club</p>
          </article>
        </div>
      </section>

      <section className="section-shell relative z-10 py-16 text-center">
        <h2 data-reveal className="text-4xl font-black text-white md:text-5xl">Our Members</h2>
        <button data-reveal onClick={() => setShowMembers((value) => !value)} className="mt-10 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-8 py-4 text-base font-bold text-cyan-100 transition hover:border-cyan-300/45 hover:bg-cyan-300/15">
          {showMembers ? "Hide Members" : "Check Our Members"}
        </button>

        <AnimatePresence>
          {showMembers && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="mx-auto mt-10 max-w-5xl rounded-lg border border-white/10 bg-white/[0.055] p-5 text-left shadow-card backdrop-blur-xl md:p-8">
                <div className="space-y-4">
                  {members.map((member, index) => (
                    <div key={`${member.name}-${member.role}`} className="group grid gap-4 rounded-lg border border-white/10 bg-black/25 p-5 transition hover:border-cyan-300/25 hover:bg-cyan-300/10 sm:grid-cols-[4rem_1fr_auto] sm:items-center">
                      <div className="text-lg font-black text-cyan-300/85">{String(index + 1).padStart(2, "0")}.</div>
                      <div>
                        <h3 className="text-xl font-black text-white">{member.name}</h3>
                        <p className="mt-1 text-sm text-white/55">{member.role}</p>
                      </div>
                      {member.action ? <button className="text-sm font-bold text-cyan-200 underline decoration-cyan-300/30 underline-offset-4 transition group-hover:text-white">{member.action} --</button> : null}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <section className="section-shell relative z-10 py-16">
        <h2 data-reveal className="text-center text-4xl font-black text-white md:text-5xl">Upcoming Events</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {events.map((event) => (
            <motion.div key={event} data-reveal whileHover={{ y: -5 }} className="rounded-lg border border-white/10 bg-white/[0.055] p-7 text-lg font-semibold text-white/80 shadow-card backdrop-blur-xl">
              {event}
            </motion.div>
          ))}
        </div>
      </section>

      <section className="section-shell relative z-10 py-16">
        <h2 data-reveal className="text-center text-4xl font-black text-white md:text-5xl">Club Activities & Benefits</h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <motion.div key={benefit.label} data-reveal whileHover={{ y: -5 }} className="rounded-lg border border-white/10 bg-white/[0.055] p-6 shadow-card backdrop-blur-xl">
                <Icon className="mb-5 h-6 w-6 text-cyan-300" />
                <p className="text-base font-semibold leading-7 text-white/82">{benefit.label}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section id="join-club" className="section-shell relative z-10 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 data-reveal className="text-center text-4xl font-black text-white md:text-5xl">Join Our Club</h2>
          <form onSubmit={handleSubmit} data-reveal className="mt-10 rounded-lg border border-white/10 bg-white/[0.055] p-6 shadow-card backdrop-blur-xl md:p-8">
            {message.text && (
              <div className={`mb-5 flex items-start gap-3 rounded-lg border p-4 text-sm ${message.type === "success" ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300" : "border-red-500/20 bg-red-500/10 text-red-300"}`}>
                {message.type === "success" ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
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
              <label className="block text-sm font-bold text-white/75 md:col-span-2">Address
                <textarea required value={form.address} onChange={setField("address")} placeholder="Enter your complete address" rows={3} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white placeholder-white/25 outline-none transition focus:border-cyan-400/40 focus:bg-white/10" />
              </label>
              <label className="block text-sm font-bold text-white/75 md:col-span-2">Why you want to join our team?
                <textarea required value={form.reason} onChange={setField("reason")} placeholder="Share your reasons for joining the club..." rows={4} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white placeholder-white/25 outline-none transition focus:border-cyan-400/40 focus:bg-white/10" />
              </label>
            </div>

            <button type="submit" disabled={loading} className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3 font-bold text-black transition hover:scale-105 hover:bg-cyan-50 disabled:opacity-60">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Submit Application
            </button>
          </form>
        </div>
      </section>

      <div className="section-shell pt-0 pb-16">
        <Link to="/" className="text-sm font-semibold text-white/45 transition hover:text-cyan-300">Back to home</Link>
      </div>
      <FooterSection />
    </main>
  );
}
