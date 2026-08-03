import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  BookOpen,
  ShoppingCart,
  CreditCard,
  Truck,
  MessageCircle,
  Mail,
  Phone,
  Search,
  CheckCircle2,
  Loader2,
  HeadphonesIcon,
  FileText,
  Shield,
  Zap,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import { Link } from "react-router-dom";
import FooterSection from "../sections/FooterSection.jsx";
import { API_BASE } from "../config.js";

/* ─── Data ─────────────────────────────────────────────── */

const categories = [
  {
    icon: BookOpen,
    label: "Books & Reading",
    color: "from-cyan-500 to-blue-600",
  },
  {
    icon: ShoppingCart,
    label: "Orders & Cart",
    color: "from-violet-500 to-purple-600",
  },
  {
    icon: CreditCard,
    label: "Payments & Billing",
    color: "from-emerald-500 to-green-600",
  },
  {
    icon: Truck,
    label: "Shipping & Delivery",
    color: "from-orange-500 to-amber-600",
  },
  {
    icon: FileText,
    label: "Publishing",
    color: "from-pink-500 to-rose-600",
  },
  {
    icon: Shield,
    label: "Account & Privacy",
    color: "from-sky-500 to-indigo-600",
  },
];

const faqs = [
  {
    category: "Books & Reading",
    items: [
      {
        q: "How do I read an eBook after purchasing?",
        a: "After your purchase is approved, go to your profile → My Orders & Status. For approved eBook orders you will find a Download/Read button. The eBook will open in our built-in premium reader.",
      },
      {
        q: "Can I read on multiple devices?",
        a: "Yes! Your purchased eBooks are linked to your account. Simply log in from any browser-enabled device—desktop, tablet, or mobile—and access your library under My Orders.",
      },
      {
        q: "What formats are the eBooks available in?",
        a: "All eBooks are delivered through our secure online reader. PDF download is available for approved purchases via the Invoice or Download button on your order.",
      },
      {
        q: "Are there free books available?",
        a: "Yes! Visit Read Stories (Short Stories) from the navigation bar to enjoy free short stories and excerpts from our authors.",
      },
    ],
  },
  {
    category: "Orders & Cart",
    items: [
      {
        q: "How do I add a book to my cart?",
        a: "Browse the library, click Buy Now on any book. Select your preferred format—eBook, Paperback, or Hardcover—and click Add to Cart. Then proceed to checkout from the cart icon in the navbar.",
      },
      {
        q: "Why is my cart empty after switching accounts?",
        a: "Cart data is tied to your account session. If you log in with a different account, your previous cart is automatically cleared for privacy and security.",
      },
      {
        q: "Can I change my order after placing it?",
        a: "Orders can only be modified before admin approval. Please contact us immediately via WhatsApp or email if you need to make changes.",
      },
      {
        q: "What is the order approval process?",
        a: "After you place an order and submit payment proof, our team reviews and approves it within 24–48 hours. You'll be notified and can then access your eBook or track your physical shipment.",
      },
    ],
  },
  {
    category: "Payments & Billing",
    items: [
      {
        q: "What payment methods are accepted?",
        a: "We accept UPI, Google Pay, PhonePe, and bank transfers. After placing your order, scan the provided QR code or use our UPI ID and submit your Transaction ID as proof.",
      },
      {
        q: "How do I download my invoice?",
        a: "Once your order is approved, go to My Orders & Status. Click the Invoice (PDF) button on your approved order to open a printable tax invoice you can save as PDF.",
      },
      {
        q: "What if my payment was deducted but my order is still pending?",
        a: "Please contact us on WhatsApp (+91 60335 50539) with your Transaction ID and screenshot. We will verify and approve your order promptly.",
      },
      {
        q: "Are there any hidden charges?",
        a: "No hidden charges. The price shown on each book is the final price. For Paperback/Hardcover orders, shipping charges (if applicable) are communicated before final payment confirmation.",
      },
    ],
  },
  {
    category: "Shipping & Delivery",
    items: [
      {
        q: "How long does Paperback/Hardcover delivery take?",
        a: "Physical books are typically dispatched within 3–5 business days after payment approval. Standard delivery takes 5–10 business days depending on your location.",
      },
      {
        q: "How can I track my shipment?",
        a: "Go to My Orders & Status and open your physical book order. You'll see a live shipment tracker with the current status, courier name, AWB/tracking number, and delivery checkpoints updated by our team.",
      },
      {
        q: "Do you deliver outside Tripura?",
        a: "Yes, we deliver across India. International shipping is not yet available but is planned for a future update.",
      },
      {
        q: "What if my book arrives damaged?",
        a: "Please take a photo and contact us within 48 hours of delivery via WhatsApp or email. We will arrange a replacement or refund at no extra cost.",
      },
    ],
  },
  {
    category: "Publishing",
    items: [
      {
        q: "How do I publish my book with Lekhok Tripura?",
        a: "Visit the Publish with Us page from the navbar. Choose your publishing plan (Self-Publishing or Sponsored), fill in the plan request form with your book details, and our team will reach out within 3–5 business days.",
      },
      {
        q: "What is the difference between Paperback and Hardcover?",
        a: "Paperback has a soft, flexible cover and is more affordable. Hardcover has a rigid, durable cover and a premium feel. Both are printed and distributed by Lekhok Tripura through our partner network.",
      },
      {
        q: "Can I publish an eBook only without printing?",
        a: "Absolutely! Select Publish E-Book in the Format Preference field of the Plan Request form. We handle formatting, cover design, and distribution across digital platforms.",
      },
      {
        q: "How long does the publishing process take?",
        a: "Typically 4–8 weeks from manuscript submission to final publication, depending on editing, cover design, and printing requirements. You will be kept updated throughout the process.",
      },
    ],
  },
];

const quickLinks = [
  { label: "Buy Books", to: "/library", icon: BookOpen },
  { label: "Read Stories", to: "/short-stories", icon: FileText },
  { label: "Publish with Us", to: "/reader", icon: Zap },
  { label: "Join Club", to: "/club", icon: HeadphonesIcon },
];

/* ─── Sub-components ────────────────────────────────────── */

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      className="border border-white/10 rounded-2xl overflow-hidden bg-white/[0.03] backdrop-blur-sm"
      initial={false}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left group transition hover:bg-white/[0.04]"
      >
        <span className="text-sm sm:text-base font-semibold text-white/85 group-hover:text-cyan-300 transition leading-snug">
          {q}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="shrink-0 text-white/40"
        >
          <ChevronDown size={18} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-5 text-sm leading-7 text-white/60">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Main page ─────────────────────────────────────────── */

export default function HelpPage() {
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  /* ── Filter FAQs by search + category ── */
  const filtered = faqs
    .filter((cat) => activeCategory === "All" || cat.category === activeCategory)
    .map((cat) => ({
      ...cat,
      items: cat.items.filter(
        ({ q, a }) =>
          !search ||
          q.toLowerCase().includes(search.toLowerCase()) ||
          a.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter((cat) => cat.items.length > 0);

  const allCategories = ["All", ...faqs.map((f) => f.category)];

  /* ── Contact form submit (sends to WhatsApp wa.me link as fallback) ── */
  const handleContact = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSending(true);
    setError("");
    // Simulate a brief delay then open WhatsApp with pre-filled message
    await new Promise((r) => setTimeout(r, 800));
    const text = `*Help Request from ${form.name}*\n📧 ${form.email}\n📌 Subject: ${form.subject || "General Inquiry"}\n\n${form.message}`;
    window.open(`https://wa.me/916033550539?text=${encodeURIComponent(text)}`, "_blank");
    setSending(false);
    setSent(true);
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-[#080b10] text-white">
      {/* ── Hero ──────────────────────────────────── */}
      <section className="relative overflow-hidden pt-32 pb-6 text-center">
        {/* glows */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[500px] w-[700px] rounded-full bg-cyan-500/10 blur-[140px]" />
          <div className="absolute left-1/4 bottom-0 h-64 w-64 rounded-full bg-violet-500/10 blur-[120px]" />
          <div className="absolute right-1/4 top-1/3 h-48 w-48 rounded-full bg-emerald-500/10 blur-[100px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative pt-28 pb-8 md:pt-36 md:pb-10 max-w-3xl mx-auto px-5 text-center"
        >
          <span className="inline-block mb-5 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.25em] text-cyan-300">
            Help & Support
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-5">
            How can we{" "}
            <span className="bg-gradient-to-r from-cyan-300 to-violet-400 bg-clip-text text-transparent">
              help you?
            </span>
          </h1>
          <p className="text-base sm:text-lg text-white/55 max-w-xl mx-auto mb-10">
            Search our knowledge base or browse by topic — we're here to help you every step of the way.
          </p>

          {/* Search */}
          <div className="relative max-w-xl mx-auto" id="search-box">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 z-10 pointer-events-none" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setShowDropdown(true); }}
              onFocus={() => search && setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              placeholder="Search for answers…"
              className="w-full rounded-2xl border border-white/15 bg-white/[0.06] py-4 pl-12 pr-12 text-white placeholder:text-white/35 outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/10 transition backdrop-blur-xl"
            />
            {search && (
              <button
                onMouseDown={() => { setSearch(""); setShowDropdown(false); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none"/></svg>
              </button>
            )}

            {/* Live results dropdown */}
            <AnimatePresence>
              {showDropdown && search.trim().length > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="absolute left-0 right-0 top-full mt-2 z-50 max-h-80 overflow-y-auto rounded-2xl border border-white/15 bg-[#0d1117]/95 backdrop-blur-2xl shadow-2xl shadow-black/60"
                >
                  {(() => {
                    const results = faqs.flatMap((cat) =>
                      cat.items
                        .filter(({ q, a }) =>
                          q.toLowerCase().includes(search.toLowerCase()) ||
                          a.toLowerCase().includes(search.toLowerCase())
                        )
                        .map((item) => ({ ...item, category: cat.category }))
                    );
                    if (results.length === 0) {
                      return (
                        <div className="px-5 py-8 text-center">
                          <HelpCircle size={28} className="text-white/20 mx-auto mb-2" />
                          <p className="text-sm text-white/40">No results found for "<span className="text-white/60">{search}</span>"</p>
                        </div>
                      );
                    }
                    return results.map((item, i) => (
                      <button
                        key={i}
                        onMouseDown={() => {
                          setActiveCategory(item.category);
                          setShowDropdown(false);
                          setTimeout(() => {
                            document.getElementById("faq-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
                          }, 100);
                        }}
                        className="group flex w-full items-start gap-3 px-5 py-4 text-left transition hover:bg-white/[0.06] border-b border-white/5 last:border-b-0"
                      >
                        <HelpCircle size={15} className="text-cyan-400 mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white/90 group-hover:text-cyan-300 transition line-clamp-1">
                            {item.q}
                          </p>
                          <p className="text-xs text-white/40 mt-0.5 line-clamp-1">{item.a}</p>
                          <span className="mt-1 inline-block text-[10px] font-black uppercase tracking-wider text-cyan-400/60 bg-cyan-400/10 px-2 py-0.5 rounded-full">
                            {item.category}
                          </span>
                        </div>
                      </button>
                    ));
                  })()}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </section>

      {/* ── Quick-access category cards ───────────── */}
      <section className="relative mx-auto max-w-7xl px-5 pt-2 pb-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map(({ icon: Icon, label, color }, i) => (
            <motion.button
              key={label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => setActiveCategory(activeCategory === label ? "All" : label)}
              className={`group flex flex-col items-center gap-3 rounded-2xl border p-5 text-center transition-all duration-300 ${
                activeCategory === label
                  ? "border-cyan-400/40 bg-cyan-400/10 shadow-[0_0_20px_rgba(34,211,238,0.15)]"
                  : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.07]"
              }`}
            >
              <div className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${color} shadow-lg`}>
                <Icon size={18} className="text-white" />
              </div>
              <span className={`text-xs font-bold leading-tight transition ${activeCategory === label ? "text-cyan-300" : "text-white/70 group-hover:text-white"}`}>
                {label}
              </span>
            </motion.button>
          ))}
        </div>
      </section>

      {/* ── FAQ accordion ─────────────────────────── */}
      <section id="faq-section" className="relative mx-auto max-w-7xl px-5 pt-4 pb-12">
        <div className="flex items-center gap-3 mb-8">
          <HelpCircle size={22} className="text-cyan-400" />
          <h2 className="text-xl font-black text-white">
            {activeCategory === "All" ? "Frequently Asked Questions" : activeCategory}
          </h2>
          {search && (
            <span className="ml-auto text-xs text-white/40">
              {filtered.reduce((acc, c) => acc + c.items.length, 0)} result(s)
            </span>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-14 text-center">
            <HelpCircle size={40} className="text-white/20 mx-auto mb-4" />
            <p className="text-white/50 text-sm">No results found for "<span className="text-white/70">{search}</span>".</p>
            <p className="text-xs text-white/35 mt-2">Try different keywords or contact us directly.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {filtered.map((cat) => (
              <div key={cat.category}>
                {activeCategory === "All" && (
                  <h3 className="text-sm font-black uppercase tracking-widest text-cyan-300/70 mb-4">
                    {cat.category}
                  </h3>
                )}
                <div className="space-y-3">
                  {cat.items.map((item) => (
                    <FAQItem key={item.q} q={item.q} a={item.a} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Quick Links ───────────────────────────── */}
      <section className="relative mx-auto max-w-7xl px-5 pt-4 pb-12">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl">
          <h2 className="text-lg font-black text-white mb-6">Quick Links</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {quickLinks.map(({ label, to, icon: Icon }) => (
              <Link
                key={label}
                to={to}
                className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 transition hover:border-cyan-400/30 hover:bg-cyan-400/5"
              >
                <Icon size={16} className="text-white/40 group-hover:text-cyan-400 transition shrink-0" />
                <span className="text-sm font-semibold text-white/70 group-hover:text-white transition">
                  {label}
                </span>
                <ExternalLink size={12} className="ml-auto text-white/20 group-hover:text-cyan-400/60 transition" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact section ───────────────────────── */}
      <section className="relative mx-auto max-w-7xl px-5 pt-4 pb-20">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.3fr] lg:gap-12">

          {/* Contact info */}
          <div className="space-y-6">
            <div>
              <span className="text-[11px] font-black uppercase tracking-[0.25em] text-cyan-300 bg-cyan-400/10 px-3 py-1 rounded-full border border-cyan-400/20">
                Still need help?
              </span>
              <h2 className="text-3xl sm:text-4xl font-black mt-4 mb-3">
                Get in touch{" "}
                <span className="bg-gradient-to-r from-cyan-300 to-violet-400 bg-clip-text text-transparent">
                  with us
                </span>
              </h2>
              <p className="text-white/55 leading-7 text-sm">
                Our support team typically responds within a few hours. You can also reach us directly on WhatsApp for instant help.
              </p>
            </div>

            {/* Contact cards */}
            <div className="space-y-3">
              <a
                href="https://wa.me/916033550539"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] p-5 transition hover:border-emerald-400/40 hover:bg-emerald-500/10"
              >
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-500/20">
                  <MessageCircle size={20} className="text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-black text-white group-hover:text-emerald-300 transition">WhatsApp</p>
                  <p className="text-xs text-white/50">+91 60335 50539 · Fastest response</p>
                </div>
                <ExternalLink size={14} className="ml-auto text-white/20 group-hover:text-emerald-400 transition" />
              </a>

              <a
                href="mailto:lekhoktripura@gmail.com"
                className="group flex items-center gap-4 rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.06] p-5 transition hover:border-cyan-400/40 hover:bg-cyan-500/10"
              >
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-cyan-500/20">
                  <Mail size={20} className="text-cyan-400" />
                </div>
                <div>
                  <p className="text-sm font-black text-white group-hover:text-cyan-300 transition">Email</p>
                  <p className="text-xs text-white/50">lekhoktripura@gmail.com</p>
                </div>
                <ExternalLink size={14} className="ml-auto text-white/20 group-hover:text-cyan-400 transition" />
              </a>

              <div className="flex items-center gap-4 rounded-2xl border border-violet-500/20 bg-violet-500/[0.06] p-5">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-violet-500/20">
                  <Phone size={20} className="text-violet-400" />
                </div>
                <div>
                  <p className="text-sm font-black text-white">Phone / Call</p>
                  <p className="text-xs text-white/50">+91 60335 50539 · Mon–Sat, 10am–6pm</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 backdrop-blur-xl">
            {sent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center h-full py-10 text-center gap-4"
              >
                <div className="grid h-16 w-16 place-items-center rounded-full bg-emerald-500/20 border border-emerald-500/30">
                  <CheckCircle2 size={28} className="text-emerald-400" />
                </div>
                <h3 className="text-xl font-black text-white">Message sent via WhatsApp!</h3>
                <p className="text-sm text-white/55">
                  Your message has been pre-filled and opened in WhatsApp. Our team will respond shortly.
                </p>
                <button
                  onClick={() => setSent(false)}
                  className="mt-2 rounded-xl border border-white/15 px-5 py-2.5 text-sm font-bold text-white/70 hover:text-white hover:border-white/30 transition"
                >
                  Send another message
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleContact} className="space-y-4">
                <h3 className="text-lg font-black text-white mb-6">Send us a message</h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-white/55 mb-1.5">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="Rahul Das"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-cyan-400/40 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-white/55 mb-1.5">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      placeholder="you@email.com"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-cyan-400/40 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/55 mb-1.5">Subject</label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                    placeholder="e.g. Payment issue, Tracking query…"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-cyan-400/40 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/55 mb-1.5">Message *</label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                    placeholder="Describe your issue or question in detail…"
                    className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-cyan-400/40 transition"
                  />
                </div>

                {error && <p className="text-xs text-red-400">{error}</p>}

                <button
                  type="submit"
                  disabled={sending}
                  className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3.5 text-sm font-black text-white transition hover:opacity-90 disabled:opacity-60 shadow-[0_4px_20px_rgba(6,182,212,0.3)] hover:shadow-[0_6px_25px_rgba(6,182,212,0.45)]"
                >
                  {sending ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Opening WhatsApp…
                    </>
                  ) : (
                    <>
                      <MessageCircle size={16} />
                      Send via WhatsApp
                    </>
                  )}
                </button>
                <p className="text-center text-[10px] text-white/30">
                  Your message will open in WhatsApp for instant support
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
}
