import { useState } from "react";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { API_BASE } from "../config.js";

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

export default function ClubJoinSection() {
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
            ? "Application submitted successfully! Check your email or wait for admin confirmation."
            : "Application submitted. Admin confirmation pending.",
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
    <section id="join-club-form" className="section-shell relative z-10 !py-12 border-t border-white/5 bg-zinc-950">
      {/* Background Glow */}
      <div className="pointer-events-none absolute right-[-10%] top-[-10%] h-80 w-80 rounded-full bg-cyan-500/5 blur-[120px]" />
      
      <div className="mx-auto max-w-4xl relative z-10">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-black text-white md:text-5xl uppercase tracking-[0.04em]">Join Our Club</h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-white/55 text-sm md:text-base">
            Fill out the application form below to become a member of the Lekhok Tripura Readers & Writers Club.
          </p>
        </div>

        <form 
          onSubmit={handleSubmit} 
          className="rounded-3xl border border-white/8 bg-white/[0.02] p-6 shadow-2xl backdrop-blur-3xl md:p-8"
        >
          {message.text && (
            <div className={`mb-6 flex items-start gap-3 rounded-xl border p-4 text-sm transition-all ${
              message.type === "success" 
                ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-300" 
                : "border-red-500/20 bg-red-500/5 text-red-300"
            }`}>
              {message.type === "success" ? <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" /> : <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />}
              <span>{message.text}</span>
            </div>
          )}

          <div className="grid gap-6 text-left md:grid-cols-2">
            <Field label="Full Name">
              <input 
                required 
                value={form.fullName} 
                onChange={setField("fullName")} 
                placeholder="Enter your full name" 
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition focus:border-cyan-400/40 focus:bg-white/8" 
              />
            </Field>

            <Field label="Mail ID">
              <input 
                required 
                type="email" 
                value={form.email} 
                onChange={setField("email")} 
                placeholder="example@mail.com" 
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition focus:border-cyan-400/40 focus:bg-white/8" 
              />
            </Field>

            <Field label="Phone Number">
              <input 
                required 
                value={form.phone} 
                onChange={setField("phone")} 
                placeholder="10-digit mobile number" 
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition focus:border-cyan-400/40 focus:bg-white/8" 
              />
            </Field>

            <Field label="WhatsApp Number">
              <input 
                required 
                value={form.whatsapp} 
                onChange={setField("whatsapp")} 
                placeholder="10-digit WhatsApp number" 
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition focus:border-cyan-400/40 focus:bg-white/8" 
              />
            </Field>

            <Field label="Date of Birth">
              <input 
                required 
                type="date" 
                value={form.dateOfBirth} 
                onChange={setField("dateOfBirth")} 
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40 focus:bg-white/8" 
              />
            </Field>
            
            <div />

            <label className="block text-sm font-bold text-white/75 md:col-span-2">Address
              <textarea 
                required 
                value={form.address} 
                onChange={setField("address")} 
                placeholder="Enter your complete address" 
                rows={3} 
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition focus:border-cyan-400/40 focus:bg-white/8 resize-none" 
              />
            </label>

            <label className="block text-sm font-bold text-white/75 md:col-span-2">Why you want to join our team?
              <textarea 
                required 
                value={form.reason} 
                onChange={setField("reason")} 
                placeholder="Share your reasons for joining the club..." 
                rows={4} 
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition focus:border-cyan-400/40 focus:bg-white/8 resize-none" 
              />
            </label>
          </div>

          <div className="mt-8 text-center md:text-left">
            <button 
              type="submit" 
              disabled={loading} 
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 font-bold text-black shadow-[0_0_24px_rgba(255,255,255,0.06)] transition hover:scale-105 hover:bg-cyan-50 disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin text-black" />}
              Submit Application
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
