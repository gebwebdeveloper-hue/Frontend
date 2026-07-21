import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, CheckCircle2, AlertCircle, Loader2, Megaphone, Paintbrush, PencilLine, ShieldCheck, Truck, UserRoundCheck, X, BadgeCheck, FileText, WalletCards, Globe2, Sparkles, UploadCloud } from "lucide-react";

import PageTransition from "../components/PageTransition.jsx";
import FooterSection from "../sections/FooterSection.jsx";
import { API_BASE } from "../config.js";
import { useGsapReveal } from "../hooks/useGsapReveal.js";

const plans = [
  {
    name: "Publication Cost",
    price: "₹999",
    tag: "The Basic Publishing Suite",
    description: "Perfect for authors looking to get their manuscript professionally formatted and distributed across major digital platforms.",
    features: [
      "Professional Interior Formatting: Standard layout styling for both print-ready PDF and reflowable ePub/Mobi formats.",
      "Global E-Book Publishing: Distribution setup on major platforms (like Amazon Kindle, Kobo, and Google Books).",
      "Official ISBN Assignment: Provision of a unique International Standard Book Number (ISBN) for legal identification and tracking.",
      "Basic Cover Design: A clean, template-based digital cover design utilizing high-quality stock imagery and standard typography.",
      "Official Website Listing: A dedicated author/book feature page on our publishing house website to drive traffic and credibility."
    ],
  }
];

const addonsList = [
  { id: "cover", name: "Premium Cover Design", price: "₹1,500 – ₹4,000", desc: "Custom artist-designed cover with detailed illustrations and specialized typography." },
  { id: "proofreading", name: "Proofreading & Editing", price: "₹0.50 / word", desc: "Thorough spell check, grammar correction, line edits, and consistency verification." },
  { id: "typing", name: "Manuscript Digitization", price: "₹0.80 / word", desc: "Word-by-word typing into editable digital formats for handwritten manuscripts or diaries." },
  { id: "website", name: "Author Portfolio Website", price: "₹5,000 – ₹7,000", desc: "Custom personal brand website to display author biography, portfolio, and direct buy links (domain extra)." },
  { id: "posters", name: "Book Mockups & Posters", price: "₹50 – ₹100 / poster", desc: "High-resolution 3D book mockups and customized social media promotional graphics." },
  { id: "marketing", name: "Social Media Marketing", price: "Custom / As per budget", desc: "Targeted ad setups and promotional campaigns across major social media channels." }
];

const services = [
  { icon: PencilLine, title: "Editorial Services", copy: "Manuscript review, clarity checks, proofreading, copy editing, and language polish." },
  { icon: Paintbrush, title: "Designing Services", copy: "Cover design, page layout, typography, book posters, and launch-ready creatives." },
  { icon: Megaphone, title: "Marketing Services", copy: "Promotion strategy, social media launch support, reader positioning, and visibility planning." },
  { icon: Truck, title: "Distribution Services", copy: "Print, eBook, local reach, and wider distribution options based on your publishing plan." },
  { icon: UserRoundCheck, title: "Author Support", copy: "Guided support from manuscript discussion to launch, updates, and post-publication next steps." },
  { icon: ShieldCheck, title: "Legal Services", copy: "ISBN assistance, copyright guidance, publishing agreements, and basic documentation support." },
];

const processSteps = [
  { icon: BadgeCheck, title: "Online Registration", copy: "Choose paid self publishing or submit a Free Sponsored Publishing application with your manuscript PDF." },
  { icon: FileText, title: "Manuscript Submission", copy: "Share what your book is about, confirm manuscript readiness, and upload a PDF manuscript under 5MB." },
  { icon: BookOpen, title: "Editorial Review", copy: "Our team checks fit, quality needs, publishing scope, and the right path for your book." },
  { icon: WalletCards, title: "Plan Confirmation", copy: "For self publishing, confirm the plan and required services before production begins." },
  { icon: Globe2, title: "Published & Promoted", copy: "Your book moves through design, formatting, launch preparation, and reader discovery." },
];

const advantages = ["Transparent publishing process", "Print and digital support", "Author-first guidance", "Local literary community", "Marketing-ready launch material", "Professional book presentation"];

const initialForm = {
  name: "",
  phone: "",
  email: "",
  address: "",
  bookTitle: "",
  genre: "রহস্য",
  pageCount: "20-50",
  publishingType: "বই ছাপাতে (Paperback/Hardcover)",
  nominee: "",
  bookAbout: "",
  manuscriptReady: "Yes",
  note: "",
};

function Input({ label, className = "", ...props }) {
  return (
    <label className={`block text-sm font-bold text-white/70 ${className}`}>
      {label}
      <input {...props} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white placeholder-white/25 outline-none transition focus:border-cyan-400/40 focus:bg-white/10" />
    </label>
  );
}

function Textarea({ label, className = "", ...props }) {
  return (
    <label className={`block text-sm font-bold text-white/70 ${className}`}>
      {label}
      <textarea {...props} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white placeholder-white/25 outline-none transition focus:border-cyan-400/40 focus:bg-white/10" />
    </label>
  );
}

export default function ReaderPage() {
  const scope = useGsapReveal({ stagger: 0.06, y: 24 });
  const [modalOpen, setModalOpen] = useState(false);
  const [showPlans, setShowPlans] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [manuscript, setManuscript] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetch(`${API_BASE}/auth/me`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data?.success || !data.user) return;
        setForm((current) => ({
          ...current,
          name: current.name || data.user.name || "",
          phone: current.phone || data.user.phone || "",
          email: current.email || data.user.email || "",
        }));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!modalOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setModalOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [modalOpen]);

  const setField = (key) => (event) => {
    const value = key === "phone" ? event.target.value.replace(/[^0-9]/g, "").slice(0, 10) : event.target.value;
    setForm((current) => ({ ...current, [key]: value }));
  };

  const openFreeModal = () => {
    setSelectedPlan("");
    setMessage({ type: "", text: "" });
    setModalOpen(true);
  };

  const openPlanModal = (planName) => {
    setSelectedPlan(planName);
    setManuscript(null);
    setSelectedAddons([]);
    setMessage({ type: "", text: "" });
    setForm((current) => ({ ...current, note: `I am interested in the ${planName} self-publishing plan. Please call me back with more details.` }));
    setModalOpen(true);
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    if (!file) {
      setManuscript(null);
      return;
    }
    const filename = file.name.toLowerCase();
    const isAllowed = filename.endsWith(".pdf") || filename.endsWith(".doc") || filename.endsWith(".docx");
    if (!isAllowed) {
      setMessage({ type: "error", text: "Please upload manuscript as PDF or Word document (.doc, .docx)." });
      event.target.value = "";
      setManuscript(null);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setMessage({ type: "error", text: "Manuscript file must be under 10MB." });
      event.target.value = "";
      setManuscript(null);
      return;
    }
    setMessage({ type: "", text: "" });
    setManuscript(file);
  };

  const handleFreeSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      if (!manuscript) {
        setMessage({ type: "error", text: "Please upload your manuscript (PDF/DOCX) under 10MB." });
        setLoading(false);
        return;
      }

      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) => payload.append(key, value));
      payload.append("manuscript", manuscript);

      const res = await fetch(`${API_BASE}/publishing/free`, {
        method: "POST",
        body: payload,
      });
      const data = await res.json();

      if (data.success) {
        setMessage({
          type: "success",
          text: data.adminEmailSent
            ? "Free sponsored publishing request submitted with manuscript and mailed to admin."
            : "Request submitted. Admin email could not be confirmed.",
        });
        setManuscript(null);
        setForm((current) => ({ ...initialForm, name: current.name, phone: current.phone, email: current.email }));
      } else {
        const errorText = data.errors?.length
          ? data.errors.map((e) => e.message).join(", ")
          : data.message || "Could not submit request.";
        setMessage({ type: "error", text: errorText });
      }
    } catch {
      setMessage({ type: "error", text: "Could not submit request." });
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const payload = new FormData();
      payload.append("planName", selectedPlan);
      payload.append("name", form.name);
      payload.append("phone", form.phone);
      payload.append("email", form.email);
      payload.append("address", form.address);
      payload.append("bookTitle", form.bookTitle);
      payload.append("genre", form.genre);
      payload.append("pageCount", form.pageCount);
      payload.append("publishingType", form.publishingType);
      payload.append("nominee", form.nominee);
      payload.append("bookAbout", form.bookAbout);
      payload.append("note", form.note);
      if (selectedAddons?.length) {
        selectedAddons.forEach((addon) => payload.append("addons", addon));
      }
      if (manuscript) {
        payload.append("manuscript", manuscript);
      }

      const res = await fetch(`${API_BASE}/publishing/plan`, {
        method: "POST",
        body: payload,
      });
      const data = await res.json();

      if (data.success) {
        setMessage({
          type: "success",
          text: data.adminEmailSent
            ? `${selectedPlan} plan request submitted and mailed to admin.`
            : "Plan request submitted. Admin email could not be confirmed.",
        });
        setManuscript(null);
        setForm((current) => ({ ...initialForm, name: current.name, phone: current.phone, email: current.email }));
      } else {
        const errorText = data.errors?.length
          ? data.errors.map((e) => e.message).join(", ")
          : data.message || "Could not submit plan request.";
        setMessage({ type: "error", text: errorText });
      }
    } catch {
      setMessage({ type: "error", text: "Could not submit plan request." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <main ref={scope} className="relative overflow-hidden pt-32">
        <div className="pointer-events-none absolute left-[-8%] top-20 h-[34rem] w-[34rem] rounded-full bg-cyan-500/10 blur-[170px]" />
        <div className="pointer-events-none absolute right-[-10%] top-[32rem] h-[32rem] w-[32rem] rounded-full bg-fuchsia-500/10 blur-[180px]" />

        <section className="section-shell relative z-10 pb-16 text-center">
          <motion.div data-reveal>
            <p className="text-sm font-bold uppercase tracking-[0.5em] text-cyan-300/80">Publish with us</p>
            <h1 className="mt-5 bg-gradient-to-r from-cyan-300 via-white to-fuchsia-300 bg-clip-text text-5xl font-black uppercase tracking-[0.06em] text-transparent md:text-7xl animate-text-gradient">
              Bring Your Book To Readers
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-white/68 md:text-xl">
              Choose a guided paid self-publishing plan or apply for Free Sponsored Publishing if financial constraints are stopping your book from reaching readers.
            </p>
          </motion.div>

          <div className="mt-12 flex justify-center">
            <motion.div data-reveal whileHover={{ y: -6 }} className="rounded-3xl border border-white/10 bg-white/[0.055] p-8 text-left shadow-card backdrop-blur-xl md:p-10 max-w-xl w-full">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-300"><Sparkles size={24} /></div>
              <h2 className="mt-6 text-3xl font-black text-white">Self Publishing</h2>
              <p className="mt-4 text-white/62">Paid plans for authors who want a structured publishing team, faster production, and clear service packages.</p>
              <button
                onClick={() => {
                  setShowPlans(true);
                  setTimeout(() => {
                    const el = document.getElementById("self-publishing");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }, 100);
                }}
                className="mt-6 inline-flex rounded-full bg-white px-8 py-3.5 font-bold text-black transition hover:scale-105 hover:bg-cyan-50"
              >
                View Plans / Details
              </button>
            </motion.div>
          </div>
        </section>

        <AnimatePresence>
          {showPlans && (
            <motion.section
              id="self-publishing"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5 }}
              className="section-shell relative z-10 py-16 overflow-hidden space-y-16"
            >
              {/* Header Banner */}
              <div className="text-center">
                <span className="inline-block rounded-full border border-cyan-400/30 bg-cyan-400/10 px-5 py-2 text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">
                  Self-Publishing Service Offerings & Scope of Work
                </span>
                <h2 data-reveal className="mt-4 text-4xl font-black text-white md:text-5xl">
                  Self Publishing at Lekhok Tripura
                </h2>
                <p data-reveal className="mx-auto mt-4 max-w-2xl text-white/60">
                  Simple, transparent, and direct publishing cost with no hidden fees.
                </p>
              </div>

              {/* 1. EXECUTIVE OVERVIEW & VALUE PROPOSITION */}
              <div data-reveal className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 md:p-10 backdrop-blur-xl shadow-card">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-6">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300 font-bold text-sm">1</span>
                  <h3 className="text-xl md:text-2xl font-black text-white">Executive Overview & Value Proposition</h3>
                </div>
                <p className="text-base text-white/75 leading-relaxed">
                  At <strong className="text-cyan-300">Lekhok Tripura</strong>, we aim to redefine self-publishing by removing steep upfront financial barriers for authors. Traditional self-publishing platforms often require authors to purchase 100 to 200 copies upfront. We provide full publishing, printing, and distribution freedom starting with a minimum order of just <strong className="text-white">10 copies</strong>.
                </p>
                
                <div className="mt-8 rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-6">
                  <h4 className="text-sm font-extrabold uppercase tracking-wider text-amber-300 mb-4">Why Choose Lekhok Tripura?</h4>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-xl border border-white/8 bg-black/30 p-5">
                      <strong className="block text-sm text-white mb-2 font-bold">Reduced Financial Burden</strong>
                      <p className="text-xs text-white/60 leading-relaxed">Order as few as 10 paperback or hardcover copies based on your needs and budget.</p>
                    </div>
                    <div className="rounded-xl border border-white/8 bg-black/30 p-5">
                      <strong className="block text-sm text-white mb-2 font-bold">All-In-One Platform</strong>
                      <p className="text-xs text-white/60 leading-relaxed">End-to-end management including manuscript typing, proofreading, design, ISBN allocation, and global distribution.</p>
                    </div>
                    <div className="rounded-xl border border-white/8 bg-black/30 p-5">
                      <strong className="block text-sm text-white mb-2 font-bold">Extensive Market Reach</strong>
                      <p className="text-xs text-white/60 leading-relaxed">Distribution network spanning Tripura, Kolkata, and Bangladesh, alongside key global e-commerce channels.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. BASIC SELF-PUBLISHING PACKAGE */}
              <div data-reveal className="rounded-3xl border border-cyan-400/20 bg-cyan-950/20 p-8 md:p-10 backdrop-blur-xl shadow-card">
                <div className="flex items-center justify-between flex-wrap gap-4 border-b border-white/10 pb-4 mb-6">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300 font-bold text-sm">2</span>
                    <div>
                      <h3 className="text-xl md:text-2xl font-black text-white">Basic Self-Publishing Package</h3>
                      <p className="text-xs text-white/55 mt-1">Essential setup and distribution to ensure your book meets professional standards.</p>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-6 py-2 text-right">
                    <span className="text-2xl font-black text-white">₹999</span>
                    <span className="text-xs font-bold text-cyan-300 ml-1">+ GST</span>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    { no: "01", unit: "Basic Book Cover", scope: "Standard visual cover design tailored to the book theme." },
                    { no: "02", unit: "ISBN Allocation", scope: "Official ISBN registration and barcoding for legal distribution." },
                    { no: "03", unit: "Interior Formatting", scope: "Basic layout alignment and interior typesetting for standard reading formats." },
                    { no: "04", unit: "E-Book Publishing", scope: "Digital publishing across Amazon Kindle, Google Play Books, and lekhoktripura.in." },
                    { no: "05", unit: "Promotional Posters", scope: "Includes 2 complimentary promotional posters for online announcements." },
                    { no: "06", unit: "Print Publishing", scope: "Paperback or Hardcover options available with flexible minimum orders (10 copies)." },
                  ].map((item) => (
                    <div key={item.no} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                      <span className="text-xs font-black text-cyan-300">{item.no}</span>
                      <h4 className="mt-1 text-base font-bold text-white">{item.unit}</h4>
                      <p className="mt-2 text-xs text-white/60 leading-relaxed">{item.scope}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-white/10">
                  <p className="text-xs font-bold uppercase tracking-wider text-white/50 mb-3">Associated Channels & Platforms:</p>
                  <div className="flex flex-wrap gap-2">
                    {["Amazon", "Flipkart", "Amazon Kindle", "Google Play Books", "YouTube", "Lekhok Tripura Store"].map((ch) => (
                      <span key={ch} className="rounded-lg border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-bold text-cyan-200">
                        {ch}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-8 flex justify-center">
                  <button 
                    type="button" 
                    onClick={() => openPlanModal("Publication Cost Self Publishing Plan")} 
                    className="rounded-full bg-white px-8 py-3.5 font-bold text-black transition hover:scale-105 hover:bg-cyan-50 shadow-glow"
                  >
                    Choose Basic Plan
                  </button>
                </div>
              </div>

              {/* 3. PREMIUM ADD-ON SERVICES */}
              <div data-reveal className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 md:p-10 backdrop-blur-xl shadow-card">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-6">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300 font-bold text-sm">3</span>
                  <div>
                    <h3 className="text-xl md:text-2xl font-black text-white">Premium Add-On Services</h3>
                    <p className="text-xs text-white/55 mt-1">Authors looking to elevate their book's commercial appeal can select individual customized add-ons.</p>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/30">
                  <table className="w-full text-left text-sm text-white/80">
                    <thead className="bg-white/5 text-xs font-bold uppercase tracking-wider text-cyan-300 border-b border-white/10">
                      <tr>
                        <th className="p-4">Service</th>
                        <th className="p-4">Description</th>
                        <th className="p-4 whitespace-nowrap">Pricing Structure</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {[
                        { name: "Premium Cover Design", desc: "Custom artist-designed cover with detailed illustrations and specialized typography.", price: "₹1,500 – ₹4,000" },
                        { name: "Proofreading & Editing", desc: "Thorough spell check, grammar correction, line edits, and consistency verification.", price: "₹0.50 / word" },
                        { name: "Manuscript Digitization", desc: "Word-by-word typing into editable digital formats for handwritten manuscripts or diaries.", price: "₹0.80 / word" },
                        { name: "Author Portfolio Website", desc: "Custom personal brand website to display author biography, portfolio, and direct buy links.", price: "₹5,000 – ₹7,000 (Domain extra)" },
                        { name: "Book Mockups & Posters", desc: "High-resolution 3D book mockups and customized social media promotional graphics.", price: "₹50 – ₹100 / poster" },
                        { name: "Social Media Marketing", desc: "Targeted ad setups and promotional campaigns across major social media channels.", price: "Custom / As per budget" },
                      ].map((s) => (
                        <tr key={s.name} className="hover:bg-white/[0.02]">
                          <td className="p-4 font-bold text-white whitespace-nowrap">{s.name}</td>
                          <td className="p-4 text-xs text-white/60 leading-relaxed">{s.desc}</td>
                          <td className="p-4 font-extrabold text-cyan-300 whitespace-nowrap text-xs">{s.price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 4. STEP-BY-STEP EXECUTION PROCESS */}
              <div data-reveal className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 md:p-10 backdrop-blur-xl shadow-card">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-8">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300 font-bold text-sm">4</span>
                  <h3 className="text-xl md:text-2xl font-black text-white">Step-By-Step Execution Process</h3>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    { step: "1", title: "Initial Discussion & Needs Analysis", desc: "Understanding author requirements, target readership, and service scope." },
                    { step: "2", title: "Details & Manuscript Submission", desc: "Collecting author details, title, page counts, raw manuscript, and banking info." },
                    { step: "3", title: "Agreement & Quotation", desc: "Issuing transparent cost estimations and formal publishing agreement." },
                    { step: "4", title: "Execution & Formatting", desc: "Proofreading, cover design, typesetting, and final review before printing." },
                    { step: "5", title: "Review, Payment & Printing", desc: "Final proof approval, payment completion, and printing execution." },
                    { step: "6", title: "Distribution & Support", desc: "E-commerce listing, author certificate issuance, delivery, and post-launch support." },
                  ].map((st) => (
                    <div key={st.step} className="rounded-2xl border border-white/10 bg-white/5 p-6 flex flex-col justify-between">
                      <div>
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-cyan-400 text-black font-black text-xs">
                          {st.step}
                        </span>
                        <h4 className="mt-4 text-base font-bold text-white">{st.title}</h4>
                        <p className="mt-2 text-xs text-white/55 leading-relaxed">{st.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. LEKHOK TRIPURA CLUB */}
              <div data-reveal className="rounded-3xl border border-cyan-400/30 bg-gradient-to-r from-cyan-950/40 via-cyan-900/20 to-zinc-950 p-8 md:p-10 text-left shadow-card backdrop-blur-xl">
                <div className="flex items-center gap-3 border-b border-cyan-400/20 pb-4 mb-4">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400/20 text-cyan-300 font-bold text-sm">5</span>
                  <h3 className="text-xl md:text-2xl font-black text-white">Lekhok Tripura Club</h3>
                </div>
                <p className="text-sm md:text-base text-white/75 leading-relaxed">
                  <strong className="text-cyan-300">Lekhok Tripura Club</strong> is a vibrant literary community dedicated to writers, poets, bloggers, and literature enthusiasts across Tripura and beyond. Founded to revive the culture of reading and creative writing, the club provides a platform for literary minds to connect, share ideas, and grow together through workshops, events, book discussions, and collaborative projects.
                </p>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <section className="section-shell relative z-10 py-16">
          <h2 data-reveal className="text-center text-4xl font-black text-white md:text-5xl">Our Publishing Process</h2>
          <p data-reveal className="mx-auto mt-4 max-w-2xl text-center text-white/55">A simple, transparent path from manuscript to publication.</p>
          <div className="relative mx-auto mt-14 max-w-4xl">
            <div className="absolute left-6 top-0 hidden h-full w-px bg-white/10 md:block" />
            <div className="space-y-5">
              {processSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <motion.div key={step.title} data-reveal className="relative rounded-lg border border-white/10 bg-white/[0.055] p-6 shadow-card backdrop-blur-xl md:ml-14">
                    <div className="absolute -left-[4.4rem] top-6 hidden h-12 w-12 items-center justify-center rounded-full border border-cyan-300/25 bg-black text-cyan-300 md:flex"><Icon size={20} /></div>
                    <p className="text-sm font-black text-cyan-300">0{index + 1}</p>
                    <h3 className="mt-2 text-2xl font-black text-white">{step.title}</h3>
                    <p className="mt-3 max-w-2xl text-white/62">{step.copy}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Free Sponsored Publishing Section */}
        <section className="section-shell relative z-10 py-16">
          <div data-reveal className="rounded-3xl border border-cyan-300/20 bg-gradient-to-r from-cyan-950/40 via-cyan-900/20 to-zinc-950 p-8 sm:p-12 text-center md:text-left shadow-card backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-200 mx-auto md:mx-0">
                <BookOpen size={24} />
              </div>
              <h2 className="mt-6 text-3xl sm:text-4xl font-black text-white">Free Sponsored Publishing</h2>
              <p className="mt-4 text-lg text-white/70 leading-relaxed">
                For financially challenged writers. Because talent should never be limited by financial constraints.
              </p>
              <p className="mt-2 text-sm text-white/50">
                যেসব মেধাবী লেখক শুধুমাত্র আর্থিক অসুবিধার কারণে তাঁদের বই প্রকাশ করতে পারছেন না, তাঁদের জন্য আমাদের এই বিশেষ উদ্যোগ।
              </p>
            </div>
            <div className="shrink-0">
              <button 
                onClick={openFreeModal} 
                className="inline-flex rounded-full border border-cyan-300/40 bg-cyan-300/15 px-8 py-4 font-bold text-cyan-100 shadow-glow shadow-cyan-300/10 transition hover:scale-105 hover:bg-cyan-300/25 hover:border-cyan-300/60"
              >
                Apply for Sponsorship
              </button>
            </div>
          </div>
        </section>

        <section className="section-shell relative z-10 py-16">
          <h2 data-reveal className="text-center text-4xl font-black text-white md:text-5xl">See Our Services</h2>
          <p data-reveal className="mx-auto mt-4 max-w-2xl text-center text-white/55">Comprehensive support to bring your manuscript into a polished book.</p>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <motion.div key={service.title} data-reveal whileHover={{ y: -5 }} className="rounded-lg border border-white/10 bg-white/[0.055] p-7 shadow-card backdrop-blur-xl">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-black"><Icon size={22} /></div>
                  <h3 className="mt-6 text-xl font-black text-white">{service.title}</h3>
                  <p className="mt-3 leading-7 text-white/60">{service.copy}</p>
                </motion.div>
              );
            })}
          </div>
        </section>

        <section className="section-shell relative z-10 py-16">
          <h2 data-reveal className="text-center text-4xl font-black text-white md:text-5xl">The Lekhak Advantage</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {advantages.map((item) => (
              <motion.div key={item} data-reveal className="rounded-lg border border-white/10 bg-white/[0.055] p-5 text-white/78 shadow-card backdrop-blur-xl">
                <CheckCircle2 className="mb-4 h-5 w-5 text-cyan-300" />
                {item}
              </motion.div>
            ))}
          </div>
        </section>

        {createPortal(
          <AnimatePresence>
            {modalOpen && (
              <motion.div 
                className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md" 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                onClick={() => setModalOpen(false)}
                data-lenis-prevent
              >
                <motion.div 
                  initial={{ y: 30, opacity: 0, scale: 0.96 }} 
                  animate={{ y: 0, opacity: 1, scale: 1 }} 
                  exit={{ y: 20, opacity: 0, scale: 0.96 }} 
                  onClick={(e) => e.stopPropagation()}
                  className="relative flex max-h-[85vh] w-full max-w-3xl flex-col rounded-3xl border border-white/10 bg-zinc-950 p-6 shadow-glow"
                  data-lenis-prevent
                >
                  {/* Sticky Header */}
                  <div className="flex shrink-0 items-start justify-between gap-4 border-b border-white/10 pb-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.35em] text-cyan-300">{selectedPlan ? `${selectedPlan} Plan` : "Free Sponsored Publishing"}</p>
                      <h3 className="mt-2 text-2xl font-black text-white">{selectedPlan ? "Plan Request" : "Sponsorship Application"}</h3>
                      <p className="mt-1 text-xs text-white/50">Name, phone, and email are prefilled when you are logged in.</p>
                    </div>
                    <button 
                      onClick={() => setModalOpen(false)} 
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/10 text-white/60 transition hover:bg-white/10 hover:text-white" 
                      aria-label="Close form"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* Scrollable Form Content */}
                  <form onSubmit={selectedPlan ? handlePlanSubmit : handleFreeSubmit} className="flex-1 overflow-y-auto mt-4 pr-1.5 custom-scrollbar" data-lenis-prevent>
                    {message.text && (
                      <div className={`mb-5 flex items-start gap-3 rounded-xl border p-4 text-xs ${message.type === "success" ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300" : "border-red-500/20 bg-red-500/10 text-red-300"}`}>
                        {message.type === "success" ? <CheckCircle2 className="h-4.5 w-4.5 shrink-0" /> : <AlertCircle className="h-4.5 w-4.5 shrink-0" />}
                        <span>{message.text}</span>
                      </div>
                    )}

                    {selectedPlan ? (
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="md:col-span-2 rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.06] p-5 text-sm leading-7 text-white/80">
                          <h4 className="text-xl font-black text-white">{selectedPlan} Self Publishing Plan</h4>
                          <p className="mt-1 text-cyan-300 font-bold">গল্প জমা ফর্ম (Manuscript / Story Submission)</p>
                          <p className="mt-2 text-white/70">
                            আপনি কি আপনার নিজের লেখা গল্প, কবিতা বা কোনো সাহিত্যকর্ম আমাদের পেজ/ ওয়েবসাইটে প্রকাশ করতে চান? তাহলে নিচের তথ্যগুলি সঠিকভাবে পূরণ করুন। আমরা আপনার লেখা যাচাইয়ের পর আপনাকে প্রকাশ করার বিষয়ে জানাব।
                          </p>
                        </div>

                        <Input label="আপনার পূর্ণ নাম (Your Full Name) *" required value={form.name} onChange={setField("name")} placeholder="Author full name" />
                        <Input label="Mobile No *" required value={form.phone} onChange={setField("phone")} placeholder="10-digit mobile number" inputMode="numeric" />
                        <Input label="Mail ID *" required type="email" value={form.email} onChange={setField("email")} placeholder="you@example.com" className="md:col-span-2" />
                        
                        <Input label="বই শিরোনাম (Book Name) *" required value={form.bookTitle} onChange={setField("bookTitle")} placeholder="e.g. আপনার বইয়ের নাম" className="md:col-span-2" />

                        {/* Genre & Page Count */}
                        <div className="md:col-span-1">
                          <label className="block text-sm font-bold text-white/70 mb-2">
                            আপনার কবিতা / গল্পের ধরন কি (Genre) *
                          </label>
                          <select
                            required
                            value={form.genre}
                            onChange={setField("genre")}
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-cyan-400/40 focus:bg-white/10 focus:outline-none appearance-none"
                            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23ffffff66' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center" }}
                          >
                            <option value="রহস্য" style={{ background: "#0a0a0a" }}>রহস্য (Mystery)</option>
                            <option value="প্রেম" style={{ background: "#0a0a0a" }}>প্রেম (Romance)</option>
                            <option value="বিরহ" style={{ background: "#0a0a0a" }}>বিরহ (Heartbreak)</option>
                            <option value="গোয়েন্দা" style={{ background: "#0a0a0a" }}>গোয়েন্দা (Detective)</option>
                            <option value="ভৌতিক" style={{ background: "#0a0a0a" }}>ভৌতিক (Horror)</option>
                            <option value="অলৌকিক" style={{ background: "#0a0a0a" }}>অলৌকিক (Supernatural)</option>
                            <option value="ঐতিহাসিক" style={{ background: "#0a0a0a" }}>ঐতিহাসিক (Historical)</option>
                            <option value="এডভেঞ্চার" style={{ background: "#0a0a0a" }}>এডভেঞ্চার (Adventure)</option>
                            <option value="ট্র্যাজেডি" style={{ background: "#0a0a0a" }}>ট্র্যাজেডি (Tragedy)</option>
                            <option value="Other" style={{ background: "#0a0a0a" }}>Other</option>
                          </select>
                        </div>

                        <div className="md:col-span-1">
                          <label className="block text-sm font-bold text-white/70 mb-2">
                            Book Page Count A5 *
                          </label>
                          <select
                            required
                            value={form.pageCount}
                            onChange={setField("pageCount")}
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-cyan-400/40 focus:bg-white/10 focus:outline-none appearance-none"
                            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23ffffff66' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center" }}
                          >
                            <option value="20-50" style={{ background: "#0a0a0a" }}>20–50</option>
                            <option value="50-100" style={{ background: "#0a0a0a" }}>50–100</option>
                            <option value="100-200" style={{ background: "#0a0a0a" }}>100–200</option>
                            <option value="200-300" style={{ background: "#0a0a0a" }}>200–300</option>
                            <option value="300-400" style={{ background: "#0a0a0a" }}>300–400</option>
                            <option value="400-500" style={{ background: "#0a0a0a" }}>400–500</option>
                          </select>
                        </div>

                        {/* Publishing Format Preference */}
                        <fieldset className="md:col-span-2 rounded-xl border border-white/10 bg-white/5 p-4">
                          <legend className="px-2 text-sm font-bold text-white/70">আপনি কি চাইছেন? (Format Preference) *</legend>
                          <div className="mt-3 flex flex-wrap gap-4">
                            {[
                              { id: "paperback", label: "বই ছাপাতে (Paperback/Hardcover)", val: "বই ছাপাতে (Paperback/Hardcover)" },
                              { id: "ebook", label: "Publish E-Book", val: "Publish E-Book" }
                            ].map((opt) => (
                              <label key={opt.id} className={`flex cursor-pointer items-center gap-2 rounded-xl border px-5 py-3 text-sm font-bold transition ${form.publishingType === opt.val ? "border-cyan-300/45 bg-cyan-300/15 text-cyan-100" : "border-white/10 bg-black/20 text-white/55 hover:text-white"}`}>
                                <input type="radio" name="publishingType" value={opt.val} checked={form.publishingType === opt.val} onChange={setField("publishingType")} className="sr-only" />
                                {opt.label}
                              </label>
                            ))}
                          </div>
                        </fieldset>

                        {/* Nominee Name & Relationship */}
                        <div className="md:col-span-2">
                          <label className="block text-sm font-bold text-white/70">
                            আপনার পর আপনার বইএর লভ্যাংশ কাকে দিতে চান ? *
                          </label>
                          <span className="block text-xs text-white/45 italic mb-2">
                            Nominee Name , Relationship with author & contact details
                          </span>
                          <input
                            required
                            type="text"
                            value={form.nominee}
                            onChange={setField("nominee")}
                            placeholder="Nominee Name, Relationship & Contact Details"
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white placeholder-white/25 outline-none transition focus:border-cyan-400/40 focus:bg-white/10"
                          />
                        </div>

                        <Textarea label="আপনার ঠিকানা সম্পূর্ণ ভাবে ( যাতে আমরা বই পাঠাতে কোনও সমস্যা না হয় ) *" required rows={3} value={form.address} onChange={setField("address")} placeholder="Village/City, Post Office, District, State, PIN Code" className="md:col-span-2" />

                        {/* Manuscript File Upload */}
                        <label className="md:col-span-2 block rounded-xl border border-dashed border-white/15 bg-white/5 p-5 text-sm font-bold text-white/70 transition hover:border-cyan-300/35 hover:bg-cyan-300/10">
                          <span className="flex items-center gap-3"><UploadCloud className="h-5 w-5 text-cyan-300" /> আপনার সম্পূর্ণ গল্প/লেখা এখানে পেস্ট / আপলোড করুন</span>
                          <span className="mt-2 block text-xs font-medium text-white/45">Upload 1 supported file: PDF or Word document (.pdf, .doc, .docx). Max 10MB.</span>
                          <input type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={handleFileChange} className="mt-4 block w-full text-sm text-white/60 file:mr-4 file:rounded-full file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-bold file:text-black" />
                          {manuscript ? <span className="mt-3 block text-xs text-cyan-200">Selected File: {manuscript.name}</span> : null}
                        </label>

                        <Textarea label="আপনি কি নিজের লেখা সম্পর্কে সংক্ষিপ্ত বর্ণনা দিতে চান? (ঐচ্ছিক)" rows={3} value={form.bookAbout} onChange={setField("bookAbout")} placeholder="Brief description of your writing" className="md:col-span-2" />
                        <Textarea label="Notes / Special Instructions" rows={2} value={form.note} onChange={setField("note")} placeholder="Any preferred time to call or additional requirements?" className="md:col-span-2" />
                        
                        {/* Add-Ons Selection */}
                        <div className="md:col-span-2 mt-4">
                          <h4 className="text-sm font-bold text-white/75 mb-1 flex items-center gap-2">
                            <Sparkles size={16} className="text-cyan-300" />
                            Choose add on with your basic publication plan (999/-) *
                          </h4>
                          <p className="text-xs text-white/45 mb-4">Select any additional features you would like to include in your publishing package.</p>
                          <div className="grid gap-3 sm:grid-cols-2">
                            {addonsList.map((addon) => {
                              const isSelected = selectedAddons.includes(addon.name);
                              return (
                                <button
                                  type="button"
                                  key={addon.id}
                                  onClick={() => {
                                    setSelectedAddons((prev) =>
                                      prev.includes(addon.name)
                                        ? prev.filter((name) => name !== addon.name)
                                        : [...prev, addon.name]
                                    );
                                  }}
                                  className={`text-left p-4 rounded-xl border transition-all duration-200 select-none ${
                                    isSelected
                                      ? "border-cyan-300 bg-cyan-300/[0.08] shadow-glow shadow-cyan-300/5"
                                      : "border-white/10 bg-white/5 hover:border-white/20"
                                  }`}
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="font-bold text-sm text-white">{addon.name}</span>
                                    <span className="text-xs font-black text-cyan-300 shrink-0">{addon.price}</span>
                                  </div>
                                  <p className="mt-1.5 text-xs text-white/50 leading-relaxed">{addon.desc}</p>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="md:col-span-2 rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.06] p-4 text-sm leading-7 text-white/72">
                          <h4 className="text-lg font-black text-white">Free Sponsored Publishing</h4>
                          <p className="mt-2 font-semibold text-cyan-100">For Financially Challenged Writers</p>
                          <p className="mt-2 italic text-white/68">"Because talent should never be limited by financial constraints."</p>
                          <p className="mt-4">যেসব মেধাবী লেখক শুধুমাত্র আর্থিক অসুবিধার কারণে তাঁদের বই প্রকাশ করতে পারছেন না, তাঁদের জন্য <strong className="text-white">Lekhok Tripura</strong>-এর বিশেষ <strong className="text-white">Free Sponsored Publishing</strong> উদ্যোগ।</p>
                          <p className="mt-3">যদি আপনি আর্থিকভাবে স্বচ্ছল হন, তাহলে অনুগ্রহ করে <strong className="text-white">Paid Self Publishing</strong> অপশনটি নির্বাচন করুন। আপনার প্রকাশনার জন্য প্রদত্ত অর্থের একটি অংশ আমরা এই উদ্যোগে ব্যয় করি।</p>
                          <p className="mt-3 font-semibold text-cyan-100">একজন লেখকের পাশে দাঁড়িয়ে আপনি আরেকজন স্বপ্নবাজ লেখকের স্বপ্ন পূরণে অবদান রাখছেন।</p>
                        </div>
                        <Input label="Name" required value={form.name} onChange={setField("name")} placeholder="Author name" />
                        <Input label="Phone Number" required value={form.phone} onChange={setField("phone")} placeholder="10-digit phone number" inputMode="numeric" />
                        <Input label="Email" required type="email" value={form.email} onChange={setField("email")} placeholder="you@example.com" className="md:col-span-2" />
                        <Textarea label="Your Book is about?" required rows={4} value={form.bookAbout} onChange={setField("bookAbout")} placeholder="Tell us about your book, theme, genre, and why it matters" className="md:col-span-2" />
                        <fieldset className="md:col-span-2 rounded-xl border border-white/10 bg-white/5 p-4">
                          <legend className="px-2 text-sm font-bold text-white/70">Is your manuscript ready?</legend>
                          <div className="mt-3 flex flex-wrap gap-3">
                            {["Yes", "No"].map((option) => (
                              <label key={option} className={`flex cursor-pointer items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-bold transition ${form.manuscriptReady === option ? "border-cyan-300/45 bg-cyan-300/15 text-cyan-100" : "border-white/10 bg-black/20 text-white/55 hover:text-white"}`}>
                                <input type="radio" name="manuscriptReady" value={option} checked={form.manuscriptReady === option} onChange={setField("manuscriptReady")} className="sr-only" />
                                {option}
                              </label>
                            ))}
                          </div>
                        </fieldset>
                        <label className="md:col-span-2 block rounded-xl border border-dashed border-white/15 bg-white/5 p-5 text-sm font-bold text-white/70 transition hover:border-cyan-300/35 hover:bg-cyan-300/10">
                          <span className="flex items-center gap-3"><UploadCloud className="h-5 w-5 text-cyan-300" /> Submit your manuscript</span>
                          <span className="mt-2 block text-xs font-medium text-white/45">PDF or Word document (.pdf, .doc, .docx). Max 10MB.</span>
                          <input required type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={handleFileChange} className="mt-4 block w-full text-sm text-white/60 file:mr-4 file:rounded-full file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-bold file:text-black" />
                          {manuscript ? <span className="mt-3 block text-xs text-cyan-200">Selected: {manuscript.name}</span> : null}
                        </label>
                      </div>
                    )}

                    <button 
                      type="submit" 
                      disabled={loading} 
                      className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-bold text-black transition hover:scale-[1.01] hover:bg-cyan-50 disabled:opacity-60"
                    >
                      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                      {selectedPlan ? "Submit Plan Request" : "Submit Free Sponsored Publishing Request"}
                    </button>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
      </main>
      <FooterSection />
    </PageTransition>

  );
}










