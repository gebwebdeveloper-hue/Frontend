import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, BookMarked, Star, Crown, BarChart3, PlusCircle, ScrollText, Globe, Palette, Pencil, Keyboard, FileEdit, Megaphone, CheckCircle2, AlertCircle, Loader2, Paintbrush, PencilLine, ShieldCheck, Truck, UserRoundCheck, X, BadgeCheck, FileText, WalletCards, Globe2, Sparkles, UploadCloud } from "lucide-react";

import PageTransition from "../components/PageTransition.jsx";
import FooterSection from "../sections/FooterSection.jsx";
import { API_BASE } from "../config.js";
import { useGsapReveal } from "../hooks/useGsapReveal.js";
import { loadRazorpayScript } from "../utils/razorpay.js";

const publishingPlans = [
  {
    id: "basic",
    name: "Basic Publishing Plan",
    price: "₹4,999",
    Icon: BookMarked,
    iconBg: "bg-cyan-400/15",
    iconColor: "text-cyan-300",
    color: "from-cyan-400/20 to-blue-600/20",
    border: "border-cyan-400/30",
    badge: "Starter",
    description: "An ideal publishing package for first-time authors looking for an affordable and professional publishing experience.",
    features: [
      "ISBN Allocation",
      "Basic Book Cover Design",
      "Paperback Edition",
      "E-book Edition",
      "Amazon Listing",
      "Flipkart Listing",
      "Meesho Listing",
      "Listing on the Lekhok Tripura Publishers Website (Paperback & E-book)",
      "Certificate of Publishing",
      "Free Lekhok Tripura Club Membership",
      "2 Promotional Posters",
      "2 Complimentary Author Copies",
      "Total Print Run: 10 Copies",
    ],
  },
  {
    id: "essential",
    name: "Essential Publishing Plan",
    price: "₹9,999",
    Icon: Star,
    iconBg: "bg-violet-400/15",
    iconColor: "text-violet-300",
    color: "from-violet-400/20 to-purple-600/20",
    border: "border-violet-400/30",
    badge: "Popular",
    description: "A complete publishing solution with enhanced marketing support and greater author visibility.",
    base: "Everything in the Basic Publishing Plan, plus:",
    features: [
      "6 Complimentary Author Copies",
      "Total Print Run: 26 Copies",
      "Meta (Facebook & Instagram) Advertising — Ad Budget up to ₹1,000",
      "Dedicated Author Profile on the Lekhok Tripura Publishers Website",
      "4 Professionally Designed Promotional Posters",
    ],
  },
  {
    id: "popular",
    name: "Popular Publishing Plan",
    price: "₹14,999",
    Icon: Crown,
    iconBg: "bg-amber-400/15",
    iconColor: "text-amber-300",
    color: "from-amber-400/20 to-orange-600/20",
    border: "border-amber-400/30",
    badge: "Best Value",
    description: "Our most comprehensive publishing package for authors who want maximum exposure, branding, and professional promotion.",
    base: "Everything in the Essential Publishing Plan, plus:",
    features: [
      "Dedicated Personal Author Website",
      "Meta (Facebook & Instagram) Advertising — Ad Budget up to ₹2,000",
      "10 Complimentary Author Copies",
      "Total Print Run: 50 Copies",
      "Enhanced Digital Branding & Online Presence",
    ],
  },
];

const ADDONS_MASTER_LIST = [
  { name: "Professional Cover Design", price: "₹3,000", numericPrice: 3000, desc: "High-quality artist-designed book cover." },
  { name: "Book Trailer / Promotional Video", price: "₹3,000", numericPrice: 3000, desc: "Promotional HD video trailer for social media." },
  { name: "Social Media Marketing", price: "₹1,000 for 6 days", numericPrice: 1000, desc: "Targeted promotional campaign for 6 days." },
  { name: "Author Website", price: "₹6,200", numericPrice: 6200, desc: "Dedicated personal website for author branding." },
  { name: "Book Launch Event", price: "₹10,000", numericPrice: 10000, desc: "Virtual or physical book launch event." },
  { name: "Press Release", price: "₹10,000", numericPrice: 10000, desc: "Media coverage & official press distribution." },
  { name: "Author Interview", price: "₹25,000", numericPrice: 25000, desc: "Featured literary interview & media spotlight." },
  { name: "Book Review Campaign", price: "₹10,000", numericPrice: 10000, desc: "Book reviews by literature bloggers & critics." },
  { name: "Printed Bookmarks", price: "₹500", numericPrice: 500, desc: "Custom printed bookmarks." },
  { name: "Posters", price: "₹50 / per poster", numericPrice: 50, desc: "Promotional printed posters." },
  { name: "Author Visiting Card", price: "₹500", numericPrice: 500, desc: "Personalized author visiting cards." },
  { name: "QR Code for Book", price: "₹100", numericPrice: 100, desc: "Custom QR code linking to book store." },
  { name: "Copyright Registration Assistance", price: "₹6,000", numericPrice: 6000, desc: "Official copyright filing support." },
  { name: "Translation Service", price: "₹10,000", numericPrice: 10000, desc: "Professional manuscript translation." },
  { name: "Audiobook Publishing", price: "₹10,000", numericPrice: 10000, desc: "Audiobook recording & publishing." },
  { name: "Premium Cover Finish (Matte / Gloss / Spot UV)", price: "₹2,000", numericPrice: 2000, desc: "Special cover lamination finish." },
  { name: "Amazon A+ Content", price: "₹3,000", numericPrice: 3000, desc: "Rich Amazon listing graphics & layout." },
  { name: "Roll-up Standee", price: "₹1,500", numericPrice: 1500, desc: "Promotional roll-up display standee." },
];

function calculateTotalPricing(planName, selectedAddonsList = [], posterCount = 1) {
  const planPrices = {
    basic: { base: 4999, name: "Basic Publishing Plan" },
    essential: { base: 9999, name: "Essential Publishing Plan" },
    popular: { base: 14999, name: "Popular Publishing Plan" },
  };

  const norm = String(planName || "").toLowerCase();
  const planInfo = norm.includes("essential")
    ? planPrices.essential
    : norm.includes("popular")
    ? planPrices.popular
    : planPrices.basic;

  let addonsTotal = 0;
  const addonsBreakdown = [];

  (selectedAddonsList || []).forEach((addonName) => {
    if (addonName === "Posters" || addonName.startsWith("Posters")) {
      const cost = 50 * (posterCount || 1);
      addonsTotal += cost;
      addonsBreakdown.push({
        name: `Posters (${posterCount} ${posterCount === 1 ? "Poster" : "Posters"})`,
        numericPrice: cost,
      });
    } else {
      const item = ADDONS_MASTER_LIST.find(
        (a) => a.name === addonName || addonName.startsWith(a.name) || a.name.startsWith(addonName)
      );
      if (item) {
        addonsTotal += item.numericPrice;
        addonsBreakdown.push(item);
      }
    }
  });

  const basePrice = planInfo.base;
  const subtotal = basePrice + addonsTotal;
  const gst = subtotal * 0.18;
  const total = subtotal + gst;

  return {
    planName: planInfo.name,
    basePrice,
    addonsTotal,
    addonsBreakdown,
    subtotal,
    gst,
    total,
  };
}

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
  bookTitle: "",
  subtitle: "",
  authorName: "",
  language: "Bengali",
  customLanguage: "",
  genre: "",
  totalPages: "",
  bookSize: 'A5 (5.83" × 8.27")',
  customBookSize: "",
  paperType: "Cream / Off-White",
  customPaperType: "",
  printType: "Black & White",
  bookType: "Paperback",
  copies: "10",
  address: "",
  note: "",
  customAddon: "",
  bookAbout: "",
  manuscriptReady: "Yes",
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
  const [posterCount, setPosterCount] = useState(1);
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
    setPosterCount(1);
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
      if (!form.name || !form.phone || !form.email || !form.bookTitle) {
        setMessage({ type: "error", text: "Please fill in all required fields." });
        setLoading(false);
        return;
      }

      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        setMessage({ type: "error", text: "Failed to load Razorpay Payment Gateway. Please check your connection." });
        setLoading(false);
        return;
      }

      const preparedAddons = selectedAddons.map((addon) => {
        if (addon === "Posters" || addon.startsWith("Posters")) {
          return `Posters (${posterCount} ${posterCount === 1 ? "Poster" : "Posters"})`;
        }
        return addon;
      });

      // 1. Create order on server
      const orderRes = await fetch(`${API_BASE}/publishing/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planName: selectedPlan || "Basic Publishing Plan",
          name: form.name,
          email: form.email,
          phone: form.phone,
          addons: preparedAddons,
        })
      });

      const orderData = await orderRes.json();
      if (!orderData.success) {
        setMessage({ type: "error", text: orderData.message || "Failed to initiate payment." });
        setLoading(false);
        return;
      }

      // 2. Open Razorpay Modal
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "Lekhok Tripura Publishers",
        description: `Self Publishing: ${selectedPlan || "Plan Registration"}`,
        order_id: orderData.orderId,
        prefill: {
          name: form.name,
          email: form.email,
          contact: form.phone
        },
        theme: { color: "#06b6d4" },
        handler: async function (response) {
          try {
            // 3. Verify Payment
            const verifyRes = await fetch(`${API_BASE}/publishing/verify-payment`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });

            const verifyData = await verifyRes.json();
            if (!verifyData.success) {
              setMessage({ type: "error", text: verifyData.message || "Payment verification failed." });
              setLoading(false);
              return;
            }

            // 4. Submit Registration Details with Payment ID
            const payload = new FormData();
            payload.append("planName", selectedPlan || "Self Publishing");
            payload.append("name", form.name);
            payload.append("phone", form.phone);
            payload.append("email", form.email);
            payload.append("bookTitle", form.bookTitle);
            payload.append("subtitle", form.subtitle || "");
            payload.append("authorName", form.authorName || form.name);
            payload.append("language", form.language === "Other" ? (form.customLanguage || "Other") : form.language);
            payload.append("genre", form.genre);
            payload.append("totalPages", form.totalPages);
            payload.append("bookSize", form.bookSize === "Custom Size" ? (form.customBookSize || "Custom Size") : form.bookSize);
            payload.append("paperType", form.paperType === "Others" ? (form.customPaperType || "Others") : form.paperType);
            payload.append("printType", form.printType);
            payload.append("bookType", form.bookType);
            payload.append("copies", form.copies);
            payload.append("address", form.address || "");
            payload.append("note", form.note || "");
            payload.append("paymentId", response.razorpay_payment_id);
            if (preparedAddons?.length) {
              preparedAddons.forEach((addon) => payload.append("addons", addon));
            }
            if (form.customAddon) {
              payload.append("customAddon", form.customAddon);
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
                text: `🎉 Payment Verified & Registration Submitted! A confirmation receipt has been emailed to ${form.email}`,
              });
              setManuscript(null);
              setSelectedAddons([]);
              setForm((current) => ({ ...initialForm, name: current.name, phone: current.phone, email: current.email }));
            } else {
              setMessage({ type: "error", text: data.message || "Payment received, but registration submission failed. Our team will contact you." });
            }
          } catch {
            setMessage({ type: "error", text: "Error verifying payment signature." });
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (resp) {
        setMessage({ type: "error", text: resp.error?.description || "Payment was cancelled or failed." });
        setLoading(false);
      });
      rzp.open();
    } catch {
      setMessage({ type: "error", text: "Could not initiate payment. Please try again." });
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
                  Book Publishing Plans – 2026 · Professional · Transparent · Author-Centric
                </span>
                <h2 data-reveal className="mt-4 text-4xl font-black text-white md:text-5xl">
                  Self Publishing at Lekhok Tripura
                </h2>
                <p data-reveal className="mx-auto mt-4 max-w-2xl text-white/60">
                  Simple, transparent publishing plans with no hidden fees. Choose the package that fits your vision.
                </p>
              </div>

              {/* THREE PLAN CARDS */}
              <div className="grid gap-8 lg:grid-cols-3">
                {publishingPlans.map((plan, idx) => (
                  <motion.div
                    key={plan.id}
                    data-reveal
                    whileHover={{ y: -6 }}
                    className={`relative flex flex-col rounded-3xl border ${plan.border} bg-gradient-to-b ${plan.color} p-8 backdrop-blur-xl shadow-card`}
                  >
                    {/* Badge */}
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-[10px] font-black uppercase tracking-widest text-white backdrop-blur-xl">
                      {plan.badge}
                    </span>

                    <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${plan.iconBg} mb-4`}>
                      <plan.Icon className={`h-5 w-5 ${plan.iconColor}`} />
                    </div>
                    <h3 className="text-xl font-black text-white leading-tight">{plan.name}</h3>
                    <p className="mt-1 text-3xl font-black text-white">{plan.price}<span className="text-sm font-bold text-white/50">/–</span></p>
                    <p className="mt-3 text-sm text-white/65 leading-relaxed">{plan.description}</p>

                    {plan.base && (
                      <p className="mt-5 text-xs font-black uppercase tracking-wider text-cyan-300">{plan.base}</p>
                    )}

                    <ul className="mt-4 space-y-2.5 flex-1">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5 text-sm text-white/80">
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      type="button"
                      onClick={() => openPlanModal(`${plan.name}`)}
                      className="mt-8 w-full rounded-full bg-white py-3.5 text-sm font-black text-black transition hover:scale-105 hover:bg-cyan-50 shadow-md"
                    >
                      Choose {plan.name.split(" ")[0]} Plan
                    </button>
                  </motion.div>
                ))}
              </div>

              {/* PLAN COMPARISON TABLE */}
              <div data-reveal className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 md:p-10 backdrop-blur-xl shadow-card">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-6">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                    <BarChart3 className="h-5 w-5 text-white/70" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-black text-white">Plan Comparison</h3>
                </div>
                <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/30">
                  <table className="w-full text-sm">
                    <thead className="bg-white/5 border-b border-white/10">
                      <tr>
                        <th className="p-4 text-left text-xs font-black uppercase tracking-wider text-white/60">Features</th>
                        <th className="p-4 text-center text-xs font-black uppercase tracking-wider text-cyan-300">Basic</th>
                        <th className="p-4 text-center text-xs font-black uppercase tracking-wider text-violet-300">Essential</th>
                        <th className="p-4 text-center text-xs font-black uppercase tracking-wider text-amber-300">Popular</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {[
                        { feature: "ISBN Allocation", basic: true, essential: true, popular: true },
                        { feature: "Basic Book Cover Design", basic: true, essential: true, popular: true },
                        { feature: "Paperback Edition", basic: true, essential: true, popular: true },
                        { feature: "E-book Edition", basic: true, essential: true, popular: true },
                        { feature: "Amazon Listing", basic: true, essential: true, popular: true },
                        { feature: "Flipkart Listing", basic: true, essential: true, popular: true },
                        { feature: "Meesho Listing", basic: true, essential: true, popular: true },
                        { feature: "Lekhok Tripura Website Listing", basic: true, essential: true, popular: true },
                        { feature: "Certificate of Publishing", basic: true, essential: true, popular: true },
                        { feature: "Free Club Membership", basic: true, essential: true, popular: true },
                        { feature: "Promotional Posters", basic: "2", essential: "4", popular: "4" },
                        { feature: "Author Profile on Publisher Website", basic: false, essential: true, popular: true },
                        { feature: "Dedicated Author Website", basic: false, essential: false, popular: true },
                        { feature: "Meta Advertisement Budget", basic: "—", essential: "₹1,000", popular: "₹2,000" },
                        { feature: "Complimentary Author Copies", basic: "2", essential: "6", popular: "10" },
                        { feature: "Total Printed Copies", basic: "10", essential: "26", popular: "50" },
                      ].map((row) => (
                        <tr key={row.feature} className="hover:bg-white/[0.02]">
                          <td className="p-4 text-white/75 font-medium">{row.feature}</td>
                          {[row.basic, row.essential, row.popular].map((val, i) => (
                            <td key={i} className="p-4 text-center">
                              {val === true ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-400 mx-auto" />
                              ) : val === false ? (
                                <span className="text-white/25 text-lg">—</span>
                              ) : (
                                <span className="text-xs font-black text-white/80">{val}</span>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ADD-ON SERVICES */}
              <div data-reveal className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 md:p-10 backdrop-blur-xl shadow-card">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-6">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-400/15">
                    <PlusCircle className="h-5 w-5 text-violet-300" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-black text-white">Add-on Services <span className="text-sm font-semibold text-white/50">(Optional)</span></h3>
                </div>
                <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/30">
                  <table className="w-full text-left text-sm text-white/80">
                    <thead className="bg-white/5 text-xs font-bold uppercase tracking-wider text-cyan-300 border-b border-white/10">
                      <tr>
                        <th className="p-4">Service</th>
                        <th className="p-4 text-right whitespace-nowrap">Charges</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {ADDONS_MASTER_LIST.map((s) => (
                        <tr key={s.name} className="hover:bg-white/[0.02]">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.06]">
                                <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
                              </div>
                              <div>
                                <span className="font-medium text-white/85 block">{s.name}</span>
                                {s.desc && <span className="text-[11px] text-white/45 block mt-0.5">{s.desc}</span>}
                              </div>
                            </div>
                          </td>
                          <td className="p-4 font-extrabold text-cyan-300 text-right whitespace-nowrap text-xs">{s.price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* TERMS & CONDITIONS */}
              <div data-reveal className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 md:p-10 backdrop-blur-xl shadow-card">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-6">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400/10">
                    <ScrollText className="h-5 w-5 text-cyan-300" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-black text-white">Terms & Conditions</h3>
                </div>
                <ol className="space-y-4 list-none">
                  {[
                    "The advertisement budget included in each publishing plan is part of the package. Authors may increase the advertising budget at any time by purchasing additional Meta (Facebook & Instagram) advertising services.",
                    "Additional Meta advertising campaigns will be charged according to the author's preferred budget, along with a 30% Marketing Management Fee for campaign planning, audience targeting, optimization, monitoring, and performance reporting.",
                    "Complimentary author copies are included only as specified under each publishing plan. Additional printed copies may be ordered at the prevailing printing charges.",
                    "Prices for optional add-on services may vary depending on the complexity and specific requirements of the project.",
                    "Royalty & Sales: For all Paperback and E-book sales through Amazon, Flipkart, Meesho, the Lekhok Tripura Publishers website, and other distribution platforms, the author will receive 100% of the net royalty/profit after deduction of all applicable platform fees, payment gateway charges, printing costs (where applicable), taxes (including GST/TDS, if applicable), shipping charges (where applicable), and any mandatory third-party service fees.",
                    "Royalties are calculated based on the actual amount received by the publisher from the respective sales platform after all deductions made by the platform or service provider.",
                    "The publisher reserves the right to modify platform listings, distribution channels, or promotional strategies whenever necessary to improve the book's reach and availability.",
                    "Submission of a manuscript does not guarantee publication. All manuscripts are subject to editorial and quality review before acceptance.",
                    "By enrolling in any publishing plan, the author acknowledges that they have read, understood, and agreed to all the terms and conditions of Lekhok Tripura Publishers.",
                  ].map((term, i) => (
                    <li key={i} className="flex gap-4">
                      <span className="shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-cyan-400/10 text-cyan-300 text-xs font-black">{i + 1}</span>
                      <p className="text-sm text-white/70 leading-relaxed">{term}</p>
                    </li>
                  ))}
                </ol>
              </div>

              {/* WHY PUBLISH WITH US */}
              <div data-reveal className="rounded-3xl border border-cyan-400/30 bg-gradient-to-r from-cyan-950/40 via-cyan-900/20 to-zinc-950 p-8 md:p-10 text-left shadow-card backdrop-blur-xl">
                <h3 className="text-xl md:text-2xl font-black text-cyan-300 mb-6">Why Publish with Lekhok Tripura Publishers?</h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    "Transparent Pricing",
                    "Professional Publishing Support",
                    "National Online Distribution",
                    "Amazon, Flipkart & Meesho Availability",
                    "E-book Publishing",
                    "Author-Centric Publishing Process",
                    "Marketing & Promotional Assistance",
                    "Dedicated Support from Manuscript to Publication",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-2.5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-cyan-400 mt-0.5" />
                      <span className="text-sm text-white/80 font-medium">{item}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-8 pt-6 border-t border-white/10">
                  <p className="text-base font-black text-white">Publish Your Story. Build Your Author Brand. Reach Readers Everywhere.</p>
                  <p className="mt-2 text-sm text-white/60"><strong className="text-white">Lekhok Tripura Publishers</strong> — <em>"Where Every Story Finds Its Readers."</em></p>
                </div>
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
                        {/* Banner & SKU Box */}
                        <div className="md:col-span-2 rounded-2xl border border-cyan-400/30 bg-gradient-to-r from-cyan-950/60 via-zinc-950 to-indigo-950/60 p-5 shadow-xl">
                          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3 mb-3">
                            <h4 className="text-2xl font-black text-white">Self Publishing</h4>
                            <span className="rounded-full bg-cyan-400/10 border border-cyan-400/30 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-cyan-300">
                              {selectedPlan} Plan
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center justify-between rounded-xl border border-amber-400/30 bg-amber-400/10 p-3.5 text-xs text-amber-300 font-bold">
                            <span>BOOK SKU No.</span>
                            <span className="text-white/70 font-normal italic">(Will be shared after successful registration)</span>
                          </div>
                        </div>

                        {/* Pre-filled Author Contact Details */}
                        <Input label="Author Full Name *" required value={form.name} onChange={setField("name")} placeholder="Full Name" />
                        <Input label="Phone Number *" required value={form.phone} onChange={setField("phone")} placeholder="10-digit mobile number" inputMode="numeric" />
                        <Input label="Mail ID *" required type="email" value={form.email} onChange={setField("email")} placeholder="example@mail.com" className="md:col-span-2" />

                        {/* Book Title & Subtitle */}
                        <Input label="* Book Title :" required value={form.bookTitle} onChange={setField("bookTitle")} placeholder="Enter your book title" className="md:col-span-2" />
                        <Input label="Subtitle (If Any) :" value={form.subtitle} onChange={setField("subtitle")} placeholder="Enter subtitle (optional)" className="md:col-span-2" />

                        {/* Author Name on Cover */}
                        <Input label="* Author Name (As it should appear on the cover) :" required value={form.authorName} onChange={setField("authorName")} placeholder="Author Name for book cover" className="md:col-span-2" />

                        {/* Language Selection */}
                        <fieldset className="md:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4">
                          <legend className="px-2 text-xs font-bold uppercase tracking-wider text-white/70">* Language :</legend>
                          <div className="mt-3 flex flex-wrap gap-3">
                            {["Bengali", "English", "Hindi", "Other"].map((lang) => (
                              <label key={lang} className={`flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold transition ${form.language === lang ? "border-cyan-300/45 bg-cyan-300/15 text-cyan-100 shadow-glow shadow-cyan-300/5" : "border-white/10 bg-black/20 text-white/55 hover:text-white"}`}>
                                <input type="radio" name="language" value={lang} checked={form.language === lang} onChange={setField("language")} className="sr-only" />
                                {lang}
                              </label>
                            ))}
                          </div>
                          {form.language === "Other" && (
                            <input type="text" value={form.customLanguage} onChange={setField("customLanguage")} placeholder="Specify Other Language..." className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs text-white placeholder-white/30 outline-none focus:border-cyan-400/50" />
                          )}
                        </fieldset>

                        {/* Book Genre & Page Count */}
                        <Input label="* Book Genre :" required value={form.genre} onChange={setField("genre")} placeholder="e.g. Novel, Poetry, Story Collection, Drama" />
                        <Input label="* Total Number of Pages :" required value={form.totalPages} onChange={setField("totalPages")} placeholder="e.g. 120" inputMode="numeric" />

                        {/* Book Size */}
                        <fieldset className="md:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4">
                          <legend className="px-2 text-xs font-bold uppercase tracking-wider text-white/70">* Book Size :</legend>
                          <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                            {[
                              'A5 (5.83" × 8.27")',
                              '5.5" × 8.5"',
                              '6" × 9"',
                              'Custom Size'
                            ].map((size) => (
                              <label key={size} className={`flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold transition ${form.bookSize === size ? "border-cyan-300/45 bg-cyan-300/15 text-cyan-100" : "border-white/10 bg-black/20 text-white/55 hover:text-white"}`}>
                                <input type="radio" name="bookSize" value={size} checked={form.bookSize === size} onChange={setField("bookSize")} className="sr-only" />
                                {size}
                              </label>
                            ))}
                          </div>
                          {form.bookSize === "Custom Size" && (
                            <input type="text" value={form.customBookSize} onChange={setField("customBookSize")} placeholder="Specify Custom Size..." className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs text-white placeholder-white/30 outline-none focus:border-cyan-400/50" />
                          )}
                        </fieldset>

                        {/* Paper Type */}
                        <fieldset className="md:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4">
                          <legend className="px-2 text-xs font-bold uppercase tracking-wider text-white/70">* Paper Type :</legend>
                          <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                            {["Cream / Off-White", "White", "Premium Paper", "Others"].map((paper) => (
                              <label key={paper} className={`flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold transition ${form.paperType === paper ? "border-cyan-300/45 bg-cyan-300/15 text-cyan-100" : "border-white/10 bg-black/20 text-white/55 hover:text-white"}`}>
                                <input type="radio" name="paperType" value={paper} checked={form.paperType === paper} onChange={setField("paperType")} className="sr-only" />
                                {paper}
                              </label>
                            ))}
                          </div>
                          {form.paperType === "Others" && (
                            <input type="text" value={form.customPaperType} onChange={setField("customPaperType")} placeholder="Specify Other Paper Type..." className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs text-white placeholder-white/30 outline-none focus:border-cyan-400/50" />
                          )}
                        </fieldset>

                        {/* Print Type */}
                        <fieldset className="md:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4">
                          <legend className="px-2 text-xs font-bold uppercase tracking-wider text-white/70">* Print Type :</legend>
                          <div className="mt-3 flex flex-wrap gap-3">
                            {["Black & White", "Full Color", "Color + Black & White"].map((print) => (
                              <label key={print} className={`flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold transition ${form.printType === print ? "border-cyan-300/45 bg-cyan-300/15 text-cyan-100" : "border-white/10 bg-black/20 text-white/55 hover:text-white"}`}>
                                <input type="radio" name="printType" value={print} checked={form.printType === print} onChange={setField("printType")} className="sr-only" />
                                {print}
                              </label>
                            ))}
                          </div>
                        </fieldset>

                        {/* Book Type */}
                        <fieldset className="md:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4">
                          <legend className="px-2 text-xs font-bold uppercase tracking-wider text-white/70">* Book Type :</legend>
                          <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                            {[
                              "Paperback",
                              "Hardcover",
                              "Paperback + eBook",
                              "Hardcover + eBook",
                              "eBook Only"
                            ].map((type) => (
                              <label key={type} className={`flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold transition ${form.bookType === type ? "border-cyan-300/45 bg-cyan-300/15 text-cyan-100" : "border-white/10 bg-black/20 text-white/55 hover:text-white"}`}>
                                <input type="radio" name="bookType" value={type} checked={form.bookType === type} onChange={setField("bookType")} className="sr-only" />
                                {type}
                              </label>
                            ))}
                          </div>
                        </fieldset>

                        {/* Initial Print Quantity */}
                        <Input label="* Number of Copies Required (Initial Print Quantity) :" required value={form.copies} onChange={setField("copies")} placeholder="e.g. 10 Copies" className="md:col-span-2" />

                        {/* Add-on Services (Optional) */}
                        <div className="md:col-span-2 mt-4">
                          <h4 className="text-xs font-black uppercase tracking-wider text-cyan-300 mb-1 flex items-center gap-2">
                            <Sparkles size={14} /> Add-on Services (Optional)
                          </h4>
                          <p className="text-xs text-white/45 mb-4">Select any optional services to enhance your book publishing package.</p>
                          <div className="grid gap-2.5 sm:grid-cols-2 text-xs">
                            {ADDONS_MASTER_LIST.map((addonObj) => {
                              const addon = addonObj.name;
                              const isSelected = selectedAddons.includes(addon);

                              if (addon === "Posters") {
                                return (
                                  <div
                                    key={addon}
                                    className={`flex items-center justify-between gap-2 p-3 rounded-xl border transition ${
                                      isSelected
                                        ? "border-cyan-300 bg-cyan-300/15 text-cyan-100 font-bold shadow-md shadow-cyan-500/10"
                                        : "border-white/10 bg-white/5 text-white/65 hover:border-white/20 hover:text-white"
                                    }`}
                                  >
                                    <div
                                      className="flex items-center gap-2 overflow-hidden cursor-pointer flex-1"
                                      onClick={() => {
                                        if (!isSelected) {
                                          setSelectedAddons((prev) => [...prev, "Posters"]);
                                        }
                                      }}
                                    >
                                      <div className={`h-4 w-4 shrink-0 rounded border flex items-center justify-center ${isSelected ? "border-cyan-300 bg-cyan-300 text-black font-black" : "border-white/30"}`}>
                                        {isSelected && "✓"}
                                      </div>
                                      <span className="truncate">Posters</span>
                                    </div>

                                    {isSelected ? (
                                      <div className="flex items-center gap-2 shrink-0">
                                        <div className="flex items-center rounded-lg border border-cyan-400/40 bg-black/40 p-0.5">
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              if (posterCount > 1) {
                                                setPosterCount((prev) => prev - 1);
                                              } else {
                                                setSelectedAddons((prev) => prev.filter((item) => !item.startsWith("Posters")));
                                              }
                                            }}
                                            className="grid h-6 w-6 place-items-center rounded-md bg-white/10 text-xs font-bold text-white transition hover:bg-cyan-400 hover:text-black"
                                            title="Decrease poster count"
                                          >
                                            -
                                          </button>
                                          <span className="px-2 text-xs font-black text-cyan-300 min-w-[1.4rem] text-center">
                                            {posterCount}
                                          </span>
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setPosterCount((prev) => prev + 1);
                                            }}
                                            className="grid h-6 w-6 place-items-center rounded-md bg-cyan-400 text-xs font-bold text-black transition hover:bg-cyan-300"
                                            title="Add another poster"
                                          >
                                            +
                                          </button>
                                        </div>
                                        <span className="rounded-md bg-cyan-300 px-2 py-0.5 text-[10px] font-black text-black">
                                          ₹{posterCount * 50}
                                        </span>
                                      </div>
                                    ) : (
                                      <span className="shrink-0 rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-extrabold text-cyan-300">
                                        +₹50 / per poster
                                      </span>
                                    )}
                                  </div>
                                );
                              }

                              return (
                                <button
                                  type="button"
                                  key={addon}
                                  onClick={() => {
                                    setSelectedAddons((prev) =>
                                      prev.includes(addon)
                                        ? prev.filter((item) => item !== addon)
                                        : [...prev, addon]
                                    );
                                  }}
                                  className={`flex items-center justify-between gap-2 p-3 rounded-xl border text-left transition ${
                                    isSelected
                                      ? "border-cyan-300 bg-cyan-300/15 text-cyan-100 font-bold shadow-md shadow-cyan-500/10"
                                      : "border-white/10 bg-white/5 text-white/65 hover:border-white/20 hover:text-white"
                                  }`}
                                >
                                  <div className="flex items-center gap-2 overflow-hidden">
                                    <div className={`h-4 w-4 shrink-0 rounded border flex items-center justify-center ${isSelected ? "border-cyan-300 bg-cyan-300 text-black font-black" : "border-white/30"}`}>
                                      {isSelected && "✓"}
                                    </div>
                                    <span className="truncate">{addon}</span>
                                  </div>
                                  <span className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-extrabold ${isSelected ? "bg-cyan-300 text-black" : "bg-white/10 text-cyan-300"}`}>
                                    +{addonObj.price}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                          <div className="mt-3">
                            <input
                              type="text"
                              value={form.customAddon}
                              onChange={setField("customAddon")}
                              placeholder="Other Add-on Service (specify here)..."
                              className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs text-white placeholder-white/30 outline-none focus:border-cyan-400/50"
                            />
                          </div>
                        </div>

                        {/* Full Address */}
                        <Textarea label="Full Address *" required rows={3} value={form.address} onChange={setField("address")} placeholder="Village/City, Post Office, District, State, PIN Code" className="md:col-span-2" />

                        {/* Notes */}
                        <Textarea label="Special Notes / Instructions (Optional)" rows={2} value={form.note} onChange={setField("note")} placeholder="Any preferred time to call or special instructions?" className="md:col-span-2" />

                        {/* Price Summary Breakdown Box */}
                        {(() => {
                          const pricing = calculateTotalPricing(selectedPlan, selectedAddons, posterCount);

                          return (
                            <div className="md:col-span-2 mt-2 rounded-2xl border border-cyan-400/30 bg-gradient-to-r from-cyan-950/60 via-zinc-950 to-indigo-950/60 p-4 space-y-3 shadow-xl">
                              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                                <div>
                                  <p className="text-xs text-white/60">Selected Plan Package</p>
                                  <p className="text-lg font-black text-white">{pricing.planName}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-white/60">Total Payable Fee (Incl. 18% GST)</p>
                                  <p className="text-2xl font-black text-cyan-300">₹{pricing.total.toFixed(2)}</p>
                                </div>
                              </div>

                              {pricing.addonsBreakdown.length > 0 && (
                                <div className="space-y-1.5 text-xs border-b border-white/10 pb-3">
                                  <p className="font-bold text-cyan-300">Selected Add-on Services ({pricing.addonsBreakdown.length}):</p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {pricing.addonsBreakdown.map((item) => (
                                      <span key={item.name} className="inline-flex items-center gap-1 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-1 text-[11px] font-bold text-cyan-200">
                                        {item.name}: ₹{item.numericPrice.toLocaleString("en-IN")}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div className="flex flex-wrap items-center justify-between text-xs text-white/70 gap-2">
                                <span>Base Plan: <strong>₹{pricing.basePrice.toLocaleString("en-IN")}.00</strong></span>
                                <span>Add-ons Total: <strong>₹{pricing.addonsTotal.toLocaleString("en-IN")}.00</strong></span>
                                <span>Subtotal: <strong>₹{pricing.subtotal.toLocaleString("en-IN")}.00</strong></span>
                                <span>GST (18%): <strong>₹{pricing.gst.toFixed(2)}</strong></span>
                                <span className="text-cyan-300 font-extrabold text-sm">Total Amount: <strong>₹{pricing.total.toFixed(2)}</strong></span>
                              </div>
                            </div>
                          );
                        })()}

                        {/* Manuscript File Upload */}
                        <label className="md:col-span-2 block rounded-2xl border border-dashed border-white/15 bg-white/5 p-5 text-sm font-bold text-white/70 transition hover:border-cyan-300/35 hover:bg-cyan-300/10">
                          <span className="flex items-center gap-3"><UploadCloud className="h-5 w-5 text-cyan-300" /> Upload Manuscript (PDF / Word)</span>
                          <span className="mt-1 block text-xs font-medium text-white/45">PDF or Word document (.pdf, .doc, .docx). Max 10MB.</span>
                          <input type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={handleFileChange} className="mt-3 block w-full text-xs text-white/60 file:mr-4 file:rounded-full file:border-0 file:bg-white file:px-4 file:py-2 file:text-xs file:font-bold file:text-black" />
                          {manuscript ? <span className="mt-2 block text-xs text-cyan-200">Selected: {manuscript.name}</span> : null}
                        </label>
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
                      className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-400 px-5 py-3.5 text-sm font-black text-black transition hover:opacity-90 disabled:opacity-60 shadow-lg shadow-cyan-400/20"
                    >
                      {loading && <Loader2 className="h-4 w-4 animate-spin text-black" />}
                      {selectedPlan ? (
                        (() => {
                          const norm = String(selectedPlan || "").toLowerCase();
                          const total = norm.includes("essential") ? "9,438.82" : (norm.includes("popular") ? "14,158.82" : "5,898.82");
                          return `Pay ₹${total} via Razorpay & Submit Registration`;
                        })()
                      ) : "Submit Free Sponsored Publishing Request"}
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










