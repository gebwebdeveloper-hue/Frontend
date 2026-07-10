import { useState } from "react";
import { Loader2, CheckCircle2, AlertCircle, Users, PenLine, CalendarDays, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

import { API_BASE } from "../config.js";
import { useGsapReveal } from "../hooks/useGsapReveal.js";

const stats = [
  { icon: Users, value: "250+", label: "Members" },
  { icon: PenLine, value: "100+", label: "Writers" },
  { icon: CalendarDays, value: "40+", label: "Events" },
  { icon: BookOpen, value: "50+", label: "Books" },
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

export default function CategoriesSection() {
  const scope = useGsapReveal({ stagger: 0.06, y: 24 });
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const setField = (key) => (event) => {
    const value = ["phone", "whatsapp"].includes(key)
      ? event.target.value.replace(/[^0-9]/g, "")
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
        setMessage({ type: "success", text: data.adminEmailSent ? "Application submitted and mailed to admin." : "Application submitted. Admin email could not be confirmed." });
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
    <section ref={scope} className="section-shell relative overflow-hidden">
      <div className="pointer-events-none absolute left-0 top-20 h-80 w-80 rounded-full bg-cyan-500/10 blur-[140px]" />
      <div className="pointer-events-none absolute right-0 bottom-0 h-80 w-80 rounded-full bg-fuchsia-500/10 blur-[150px]" />

      <div className="relative z-10">
        <motion.div data-reveal className="text-center">
          <h2 className="bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-indigo-400 bg-clip-text text-5xl font-black uppercase tracking-[0.08em] text-transparent md:text-7xl">
            Lekhok Tripura
          </h2>
          <p className="mt-8 text-2xl font-extrabold text-cyan-300 md:text-3xl">Readers & Writers Club</p>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-white/65 md:text-xl">
            A literary community connecting readers and writers across Tripura.
          </p>
          <a
            href="#lekhok-club-form"
            className="mt-8 inline-flex rounded-full bg-white px-8 py-4 text-base font-bold text-black shadow-[0_0_38px_rgba(34,211,238,0.16)] transition hover:scale-105 hover:bg-cyan-50"
          >
            Join Club
          </a>
        </motion.div>

        <div className="mt-24 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                data-reveal
                whileHover={{ y: -6 }}
                className="rounded-lg border border-white/10 bg-white/[0.055] p-9 text-center shadow-card backdrop-blur-xl"
              >
                <Icon className="mx-auto mb-4 h-7 w-7 text-cyan-300" />
                <div className="text-3xl font-black text-white">{item.value}</div>
                <div className="mt-3 text-lg text-white/55">{item.label}</div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-24 text-center">
          <h3 className="text-4xl font-black text-white md:text-5xl">About Us</h3>
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
        </div>

        <div id="lekhok-club-form" className="mt-24">
          <h3 className="text-center text-4xl font-black text-white md:text-5xl">Join Our Club</h3>
          <form onSubmit={handleSubmit} data-reveal className="mt-10 rounded-lg border border-white/10 bg-white/[0.055] p-6 shadow-card backdrop-blur-xl md:p-8">
            {message.text && (
              <div className={`mb-5 flex items-start gap-3 rounded-lg border p-4 text-sm ${message.type === "success" ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300" : "border-red-500/20 bg-red-500/10 text-red-300"}`}>
                {message.type === "success" ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
                <span>{message.text}</span>
              </div>
            )}

            <div className="space-y-4 text-left text-white">
              <label className="block text-sm font-bold text-white/75">Full Name
                <input required value={form.fullName} onChange={setField("fullName")} placeholder="Enter your full name" className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white placeholder-white/25 outline-none transition focus:border-cyan-400/40 focus:bg-white/10" />
              </label>
              <label className="block text-sm font-bold text-white/75">Mail ID
                <input required type="email" value={form.email} onChange={setField("email")} placeholder="example@mail.com" className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white placeholder-white/25 outline-none transition focus:border-cyan-400/40 focus:bg-white/10" />
              </label>
              <label className="block text-sm font-bold text-white/75">Phone Number
                <input required value={form.phone} onChange={setField("phone")} placeholder="10-digit mobile number" className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white placeholder-white/25 outline-none transition focus:border-cyan-400/40 focus:bg-white/10" />
              </label>
              <label className="block text-sm font-bold text-white/75">WhatsApp Number
                <input required value={form.whatsapp} onChange={setField("whatsapp")} placeholder="10-digit WhatsApp number" className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white placeholder-white/25 outline-none transition focus:border-cyan-400/40 focus:bg-white/10" />
              </label>
              <label className="block text-sm font-bold text-white/75">Date of Birth
                <input required type="date" value={form.dateOfBirth} onChange={setField("dateOfBirth")} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white placeholder-white/25 outline-none transition focus:border-cyan-400/40 focus:bg-white/10" />
              </label>
              <label className="block text-sm font-bold text-white/75">Address
                <textarea required value={form.address} onChange={setField("address")} placeholder="Enter your complete address" rows={3} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white placeholder-white/25 outline-none transition focus:border-cyan-400/40 focus:bg-white/10" />
              </label>
              <label className="block text-sm font-bold text-white/75">Why you want to join our team?
                <textarea required value={form.reason} onChange={setField("reason")} placeholder="Share your reasons for joining the club..." rows={4} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white placeholder-white/25 outline-none transition focus:border-cyan-400/40 focus:bg-white/10" />
              </label>
            </div>

            <button type="submit" disabled={loading} className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3 font-bold text-black transition hover:scale-105 hover:bg-cyan-50 disabled:opacity-60">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Submit Application
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

