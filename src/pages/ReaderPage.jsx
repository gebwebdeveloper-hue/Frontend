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
    id: "starter",
    name: "Starter Publishing Plan",
    price: "₹999",
    Icon: BookMarked,
    iconBg: "bg-emerald-400/15",
    iconColor: "text-emerald-300",
    color: "from-emerald-400/10 to-teal-600/10",
    border: "border-emerald-400/30",
    badge: "New",
    description: "An entry-level publishing package covering all the essentials to get your book published professionally.",
    features: [
      "ISBN Allocation",
      "Basic Book Cover Design",
      "Book Formatting",
      { label: "E-book Edition", highlight: true },
      "Listing on the Lekhok Tripura Publishers Website (E-book)",
      "Certificate of Publishing",
    ],
  },
  {
    id: "basic",
    name: "Basic Publishing Plan",
    price: "₹4,999",
    numericPrice: 4999,
    pages: "Upto 100 pages",
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
      "2 Promotional Posters",
      "2 Complimentary Author Copies",
      "Total Print Run: 10 Copies",
    ],
  },
  {
    id: "essential",
    name: "Essential Publishing Plan",
    price: "₹9,999",
    numericPrice: 9999,
    pages: "Upto 100 pages",
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
    numericPrice: 14999,
    pages: "Upto 100 pages",
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

function calculateTotalPricing(planName, selectedAddonsList = [], posterCount = 1, isClubMember = false) {
  const planPrices = {
    starter: { base: 999, name: "Starter Publishing Plan" },
    basic: { base: 4999, name: "Basic Publishing Plan" },
    essential: { base: 9999, name: "Essential Publishing Plan" },
    popular: { base: 14999, name: "Popular Publishing Plan" },
  };

  const norm = String(planName || "").toLowerCase();
  const planInfo = norm.includes("essential")
    ? planPrices.essential
    : norm.includes("popular")
    ? planPrices.popular
    : norm.includes("starter")
    ? planPrices.starter
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

  const rawBasePrice = planInfo.base;
  const basePrice = isClubMember ? Math.round(rawBasePrice * 0.90 * 100) / 100 : rawBasePrice;
  const subtotal = basePrice + addonsTotal;
  const gst = subtotal * 0.18;
  const total = subtotal + gst;

  const hasRegistrationFee = !norm.includes("starter");
  const regBase = 1000;
  const regGst = Math.round(regBase * 0.18 * 100) / 100;
  const regTotal = regBase + regGst; // 1180.00
  const registrationFee = hasRegistrationFee ? regTotal : total;
  const remainingBase = hasRegistrationFee ? Math.max(0, basePrice - regBase) : 0;
  const remainingToPayLater = hasRegistrationFee ? Math.max(0, basePrice - regBase + addonsTotal) : 0;

  return {
    planName: planInfo.name,
    rawBasePrice,
    basePrice,
    isClubMember,
    addonsTotal,
    addonsBreakdown,
    subtotal,
    gst,
    total,
    hasRegistrationFee,
    regBase,
    regGst,
    regTotal,
    registrationFee,
    remainingBase,
    remainingToPayLater,
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

export const basicPlanFeatures = [
  "Paperback / Hardcover (Depand on budget)",
  "Amazon Listing",
  "Flipkart Listing",
  "Messho Listing",
  "Website Listing",
  "E-Book",
  "Kindle Listing",
  "Playbook Listing",
  "Website Ebook listing",
  "ISBN Registration",
  "Book Formatting",
  "Book Editing",
  "Basic Book Cover design",
  "2 Promotional mockup",
  "Author Certificate",
  "10 Copies should be printed (2 free author copy)",
];

export const addonServicesList = [
  "Proof Reading",
  "Book Typing",
  "Professional Book Cover design",
  "Book Trailer / Promotional Video",
  "Author Website",
  "Press Release",
  "Book Review Campaign",
  "Audiobook Publishing",
  "AD runs",
];

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
      <input {...props} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition focus:border-cyan-400/40 focus:bg-white/10" />
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
  const [currentUser, setCurrentUser] = useState(null);

  // PWU (Publish With Us) states
  const [showBasicDetails, setShowBasicDetails] = useState(false);
  const [pwuForm, setPwuForm] = useState({
    authorName: "",
    authorNumber: "",
    authorEmail: "",
    authorAddress: "",
    bookName: "",
    bookLanguage: "Bengali",
    bookPageCount: "",
    copiesNeeded: "",
    notes: "",
  });
  const [pwuSelectedAddons, setPwuSelectedAddons] = useState([]);
  const [pwuSubmitting, setPwuSubmitting] = useState(false);
  const [pwuMessage, setPwuMessage] = useState({ type: "", text: "" });

  const togglePwuAddon = (addon) => {
    setPwuSelectedAddons((prev) =>
      prev.includes(addon) ? prev.filter((a) => a !== addon) : [...prev, addon]
    );
  };

  const handlePwuSubmit = async (e) => {
    e.preventDefault();
    setPwuMessage({ type: "", text: "" });

    if (!pwuForm.authorName.trim()) {
      setPwuMessage({ type: "error", text: "Please enter Author Name." });
      return;
    }
    if (!pwuForm.authorNumber.trim() || pwuForm.authorNumber.replace(/\D/g, "").length < 10) {
      setPwuMessage({ type: "error", text: "Please enter a valid 10-digit Author Number." });
      return;
    }
    if (!pwuForm.authorEmail.trim()) {
      setPwuMessage({ type: "error", text: "Please enter Author Mail ID." });
      return;
    }
    if (!pwuForm.authorAddress.trim()) {
      setPwuMessage({ type: "error", text: "Please enter Author Address." });
      return;
    }
    if (!pwuForm.bookName.trim()) {
      setPwuMessage({ type: "error", text: "Please enter Book Name." });
      return;
    }
    if (!pwuForm.bookLanguage.trim()) {
      setPwuMessage({ type: "error", text: "Please enter Book Language." });
      return;
    }
    const pagesInt = parseInt(pwuForm.bookPageCount, 10);
    if (!pwuForm.bookPageCount || isNaN(pagesInt) || pagesInt <= 0) {
      setPwuMessage({ type: "error", text: "Please enter a valid positive integer for Book Page Count (A5)." });
      return;
    }
    const copiesInt = parseInt(pwuForm.copiesNeeded, 10);
    if (!pwuForm.copiesNeeded || isNaN(copiesInt) || copiesInt <= 0) {
      setPwuMessage({ type: "error", text: "Please enter a valid positive integer for book copies to be printed." });
      return;
    }

    setPwuSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/pwu/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...pwuForm,
          selectedAddons: pwuSelectedAddons,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPwuMessage({
          type: "success",
          text: data.message || "Thank you! Your details have been submitted. Our team will contact you shortly with the quotation.",
        });
        setPwuForm((prev) => ({
          ...prev,
          bookName: "",
          bookPageCount: "",
          copiesNeeded: "",
          notes: "",
        }));
        setPwuSelectedAddons([]);
      } else {
        setPwuMessage({
          type: "error",
          text: data.message || "Failed to submit quotation details. Please try again.",
        });
      }
    } catch {
      setPwuMessage({
        type: "error",
        text: "Could not connect to server. Please check your network connection.",
      });
    } finally {
      setPwuSubmitting(false);
    }
  };

  const isClubMember = !!(currentUser?.memberId && String(currentUser.memberId).startsWith("LTCLUB-"));

  useEffect(() => {
    fetch(`${API_BASE}/auth/me`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data?.success || !data.user) return;
        setCurrentUser(data.user);
        setForm((current) => ({
          ...current,
          name: current.name || data.user.name || "",
          phone: current.phone || data.user.phone || "",
          email: current.email || data.user.email || "",
        }));
        setPwuForm((current) => ({
          ...current,
          authorName: current.authorName || data.user.name || "",
          authorNumber: current.authorNumber || data.user.phone || "",
          authorEmail: current.authorEmail || data.user.email || "",
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
          isClubMember,
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
                  Self Publishing · Transparent Quotations · Author Centric
                </span>
                <h2 data-reveal className="mt-4 text-4xl font-black text-white md:text-5xl">
                  Self Publishing at Lekhok Tripura
                </h2>
                <p data-reveal className="mx-auto mt-4 max-w-2xl text-white/60">
                  Review what we provide in our publishing packages and share your book details below to receive a custom tailored quotation.
                </p>
              </div>

              {/* CARD: WHAT WE PROVIDE IN BASIC */}
              <div data-reveal className="rounded-3xl border border-emerald-400/30 bg-gradient-to-b from-emerald-950/30 via-zinc-950 to-zinc-950 p-6 md:p-8 backdrop-blur-xl shadow-card">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
                  <div className="flex items-start gap-4">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-emerald-400/40 bg-emerald-400/10 text-emerald-300">
                      <BookOpen size={24} />
                    </div>
                    <div>
                      <span className="rounded-full border border-emerald-400/30 bg-emerald-400/15 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-300">
                        PUBLISHING PACKAGE
                      </span>
                      <h3 className="mt-1.5 text-2xl md:text-3xl font-black text-white">
                        What we provide in basic
                      </h3>
                      <p className="mt-1 text-xs md:text-sm text-white/60">
                        A complete professional foundation covering formatting, design, multi-channel distribution, ISBN registration, and printed author copies.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowBasicDetails((prev) => !prev)}
                    className="self-start md:self-center inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-400/15 px-6 py-3 text-xs font-black uppercase tracking-wider text-emerald-200 transition hover:scale-105 hover:bg-emerald-400/25 hover:border-emerald-400/70 shadow-lg shadow-emerald-400/10 cursor-pointer shrink-0"
                  >
                    <span>{showBasicDetails ? "Hide Details" : "Click to know more"}</span>
                    <PlusCircle size={16} className={`transition-transform duration-300 ${showBasicDetails ? "rotate-45" : ""}`} />
                  </button>
                </div>

                {/* EXPANDABLE LIST: BASIC PLAN & ADD ON */}
                <AnimatePresence>
                  {showBasicDetails && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.4 }}
                      className="overflow-hidden pt-6 space-y-8"
                    >
                      {/* Basic Plan Section */}
                      <div className="rounded-2xl border border-emerald-400/20 bg-emerald-950/20 p-5 md:p-6">
                        <div className="flex items-center gap-2 mb-4 text-emerald-300 font-black text-base md:text-lg">
                          <CheckCircle2 size={20} className="text-emerald-400" />
                          <h4>Basic Plan Includes:</h4>
                        </div>
                        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {basicPlanFeatures.map((item, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs md:text-sm text-white/85"
                            >
                              <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                              <span className="leading-snug">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Add On Section */}
                      <div className="rounded-2xl border border-cyan-400/20 bg-cyan-950/20 p-5 md:p-6">
                        <div className="flex items-center gap-2 mb-4 text-cyan-300 font-black text-base md:text-lg">
                          <Sparkles size={20} className="text-cyan-400" />
                          <h4>Next ADD ON -</h4>
                        </div>
                        <p className="text-xs text-white/60 mb-4">
                          Enhance your book release with optional specialized production, marketing, and promotional boosters:
                        </p>
                        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {addonServicesList.map((item, idx) => (
                            <li
                              key={idx}
                              className="flex items-center gap-2.5 rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-3 text-xs md:text-sm text-cyan-100 font-medium"
                            >
                              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-400/20 text-cyan-300 text-[11px] font-black">
                                +
                              </span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* QUOTATION FORM CARD (Hidden unless "Click to know more" is clicked) */}
              <AnimatePresence>
                {showBasicDetails && (
                  <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 24 }}
                    transition={{ duration: 0.4 }}
                    className="rounded-3xl border border-white/15 bg-white/[0.04] p-6 md:p-10 backdrop-blur-xl shadow-card space-y-6"
                  >
                <div className="border-b border-white/10 pb-5">
                  <span className="inline-block rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1 text-[10px] font-black uppercase tracking-widest text-cyan-300">
                    REQUEST A QUOTE
                  </span>
                  <h3 className="mt-2 text-2xl md:text-3xl font-black text-white">
                    Share these details for quotation .
                  </h3>
                  <p className="mt-1 text-xs md:text-sm text-white/60">
                    Please submit your manuscript information below. Our publishing editorial team will review your specifications and send you an official custom quotation.
                  </p>
                </div>

                {pwuMessage.text && (
                  <div
                    className={`rounded-2xl p-4 text-xs md:text-sm font-semibold flex items-start gap-3 border ${
                      pwuMessage.type === "success"
                        ? "border-emerald-400/40 bg-emerald-950/60 text-emerald-200"
                        : "border-red-400/40 bg-red-950/60 text-red-200"
                    }`}
                  >
                    {pwuMessage.type === "success" ? (
                      <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
                    )}
                    <span className="leading-relaxed">{pwuMessage.text}</span>
                  </div>
                )}

                <form onSubmit={handlePwuSubmit} className="space-y-6">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-white/70 mb-2">
                        AUTHOR NAME <span className="text-rose-400">*</span> :
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="Enter Author Full Name"
                        value={pwuForm.authorName}
                        onChange={(e) => setPwuForm({ ...pwuForm, authorName: e.target.value })}
                        className="w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-cyan-400 focus:bg-black/60 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-white/70 mb-2">
                        AUTHOR NUMBER <span className="text-rose-400">*</span> :
                      </label>
                      <input
                        required
                        type="tel"
                        maxLength={10}
                        placeholder="10-digit mobile number"
                        value={pwuForm.authorNumber}
                        onChange={(e) =>
                          setPwuForm({ ...pwuForm, authorNumber: e.target.value.replace(/\D/g, "").slice(0, 10) })
                        }
                        className="w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-cyan-400 focus:bg-black/60 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-white/70 mb-2">
                        AUTHOR MAIL ID <span className="text-rose-400">*</span> :
                      </label>
                      <input
                        required
                        type="email"
                        placeholder="e.g. author@example.com"
                        value={pwuForm.authorEmail}
                        onChange={(e) => setPwuForm({ ...pwuForm, authorEmail: e.target.value })}
                        className="w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-cyan-400 focus:bg-black/60 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-white/70 mb-2">
                        BOOK LANGUAGE <span className="text-rose-400">*</span> :
                      </label>
                      <select
                        value={pwuForm.bookLanguage}
                        onChange={(e) => setPwuForm({ ...pwuForm, bookLanguage: e.target.value })}
                        className="w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400 focus:bg-black/60 transition cursor-pointer"
                      >
                        <option value="Bengali" className="bg-zinc-900 text-white">Bengali (বাংলা)</option>
                        <option value="English" className="bg-zinc-900 text-white">English</option>
                        <option value="Kokborok" className="bg-zinc-900 text-white">Kokborok</option>
                        <option value="Hindi" className="bg-zinc-900 text-white">Hindi (हिंदी)</option>
                        <option value="Other" className="bg-zinc-900 text-white">Other</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-black uppercase tracking-wider text-white/70 mb-2">
                        AUTHOR ADDRESS <span className="text-rose-400">*</span> :
                      </label>
                      <textarea
                        required
                        rows={2}
                        placeholder="Enter full postal address (Village/City, Post Office, Police Station, District, State, PIN Code)"
                        value={pwuForm.authorAddress}
                        onChange={(e) => setPwuForm({ ...pwuForm, authorAddress: e.target.value })}
                        className="w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-cyan-400 focus:bg-black/60 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-white/70 mb-2">
                        BOOK NAME <span className="text-rose-400">*</span> :
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="Enter title / working title of book"
                        value={pwuForm.bookName}
                        onChange={(e) => setPwuForm({ ...pwuForm, bookName: e.target.value })}
                        className="w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-cyan-400 focus:bg-black/60 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-white/70 mb-2">
                        BOOK PAGE COUNT (A5) <span className="text-rose-400">*</span> :
                      </label>
                      <input
                        required
                        type="number"
                        min="1"
                        step="1"
                        placeholder="e.g. 120"
                        value={pwuForm.bookPageCount}
                        onChange={(e) => setPwuForm({ ...pwuForm, bookPageCount: e.target.value.replace(/\D/g, "") })}
                        onKeyDown={(e) => {
                          if (["e", "E", "+", "-", "."].includes(e.key)) e.preventDefault();
                        }}
                        className="w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-cyan-400 focus:bg-black/60 transition"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-black uppercase tracking-wider text-white/70 mb-2">
                        NEED BOOK COPIES TO BE PRINTED <span className="text-rose-400">*</span> :
                      </label>
                      <input
                        required
                        type="number"
                        min="1"
                        step="1"
                        placeholder="e.g. 50"
                        value={pwuForm.copiesNeeded}
                        onChange={(e) => setPwuForm({ ...pwuForm, copiesNeeded: e.target.value.replace(/\D/g, "") })}
                        onKeyDown={(e) => {
                          if (["e", "E", "+", "-", "."].includes(e.key)) e.preventDefault();
                        }}
                        className="w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-cyan-400 focus:bg-black/60 transition"
                      />
                    </div>
                  </div>

                  {/* OPTIONAL ADD ONS CHECKBOXES */}
                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-cyan-300">
                      <Sparkles size={14} /> Optional Add-on Services:
                    </div>
                    <p className="text-xs text-white/50">
                      Select any add-on services you would like us to price into your quotation:
                    </p>
                    <div className="grid gap-2.5 sm:grid-cols-2 md:grid-cols-3 pt-2">
                      {addonServicesList.map((addon) => {
                        const checked = pwuSelectedAddons.includes(addon);
                        return (
                          <button
                            key={addon}
                            type="button"
                            onClick={() => togglePwuAddon(addon)}
                            className={`flex items-center gap-2.5 rounded-xl border p-3 text-left transition cursor-pointer ${
                              checked
                                ? "border-cyan-400 bg-cyan-500/15 text-white"
                                : "border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/[0.06] hover:text-white"
                            }`}
                          >
                            <div
                              className={`grid h-4 w-4 shrink-0 place-items-center rounded border ${
                                checked ? "border-cyan-400 bg-cyan-400 text-black" : "border-white/30"
                              }`}
                            >
                              {checked && <CheckCircle2 size={12} className="text-black stroke-[3]" />}
                            </div>
                            <span className="text-xs font-semibold leading-tight">{addon}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* OPTIONAL NOTES */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-white/70 mb-2">
                      ANY SPECIAL NOTES / INSTRUCTIONS (OPTIONAL):
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Add any specific requirements (e.g. hardcover preference, timeline, etc.)..."
                      value={pwuForm.notes}
                      onChange={(e) => setPwuForm({ ...pwuForm, notes: e.target.value })}
                      className="w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-cyan-400 focus:bg-black/60 transition"
                    />
                  </div>

                  {/* SUBMIT BUTTON */}
                  <button
                    type="submit"
                    disabled={pwuSubmitting}
                    className="w-full flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 py-4 text-xs md:text-sm font-black uppercase tracking-wider text-black shadow-xl shadow-emerald-400/20 hover:scale-[1.01] transition disabled:opacity-60 cursor-pointer"
                  >
                    {pwuSubmitting ? (
                      <>
                        <Loader2 className="animate-spin" size={18} /> Submitting Quotation Request...
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} /> Submit Details For Quotation
                      </>
                    )}
                  </button>
                </form>
                  </motion.div>
                )}
              </AnimatePresence>

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
                        <div>
                          <Input
                            label="* Total Number of Pages (Limit: 100 Pages) :"
                            required
                            value={form.totalPages}
                            onChange={setField("totalPages")}
                            placeholder="e.g. 100"
                            inputMode="numeric"
                          />
                          <p className="mt-1.5 text-[11px] text-cyan-300/80 font-medium leading-normal">
                            💡 Standard plan includes up to 100 pages. If pages exceed 100, extra charges will be needed and included on Quotation (CALL / MESSAGE TO 6033550539).
                          </p>
                          {Number(form.totalPages) > 100 && (
                            <div className="mt-2 rounded-xl border border-amber-400/40 bg-amber-400/10 p-2.5 text-xs text-amber-200 font-bold flex items-start gap-1.5">
                              <span className="shrink-0">⚠️</span>
                              <span>Note: Manuscript exceeds 100 pages limit. Extra charges will be needed & included on Quotation. CALL / MESSAGE TO 6033550539</span>
                            </div>
                          )}
                        </div>

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
                        <div className="md:col-span-2">
                          <Input
                            label="* Number of Copies Required (Initial Print Quantity) :"
                            required
                            value={form.copies}
                            onChange={setField("copies")}
                            placeholder="e.g. 10 Copies"
                          />
                          <p className="mt-1.5 text-[11px] text-cyan-300/80 font-medium leading-normal">
                            💡 Standard plan includes print run copies as per package (Basic: 10, Essential: 26, Popular: 50). If additional printed copies are required, extra charges will be needed and included on Quotation (CALL / MESSAGE TO 6033550539).
                          </p>
                        </div>

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
                          const pricing = calculateTotalPricing(selectedPlan, selectedAddons, posterCount, isClubMember);

                          return (
                            <div className="md:col-span-2 mt-2 rounded-2xl border border-cyan-400/30 bg-gradient-to-r from-cyan-950/60 via-zinc-950 to-indigo-950/60 p-4 space-y-3 shadow-xl">
                              {isClubMember && (
                                <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-xs font-bold text-emerald-300">
                                  <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
                                  <span>10% Club Member Discount Applied on Base Publishing Plan!</span>
                                </div>
                              )}

                              {pricing.hasRegistrationFee ? (
                                <div className="space-y-3">
                                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                                    <div>
                                      <p className="text-xs text-white/60">Selected Plan Package</p>
                                      <p className="text-lg font-black text-white">{pricing.planName}</p>
                                    </div>
                                    <div className="text-right">
                                      <span className="inline-block rounded-full border border-emerald-400/40 bg-emerald-400/15 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-300">
                                        PAY NOW TO UNLOCK
                                      </span>
                                      <p className="text-2xl font-black text-emerald-300">₹{pricing.regTotal.toFixed(2)}</p>
                                      <p className="text-[10px] text-white/50 font-medium">₹1,000 + 18% GST (₹180.00)</p>
                                    </div>
                                  </div>

                                  <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-3 text-xs text-emerald-200">
                                    <p className="font-bold flex items-center gap-1.5 text-emerald-300">
                                      <Sparkles size={14} /> Registration Fee: ₹1,000 + 18% GST (₹1,180.00) to Unlock Plan!
                                    </p>
                                    <p className="mt-1 text-[11px] text-white/75 leading-relaxed">
                                      Pay <strong>₹1,180.00</strong> (₹1,000 registration fee + 18% GST) today to unlock this plan and submit your manuscript. <strong>Pay the rest later</strong> (Remaining: <strong className="text-white">₹{pricing.remainingToPayLater.toLocaleString("en-IN")}.00</strong>) before final book printing & distribution.
                                    </p>
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

                                  <div className="flex flex-wrap items-center justify-between text-xs text-white/70 gap-2 pt-1 border-t border-white/10">
                                    <span>Total Package: <strong>₹{pricing.basePrice.toLocaleString("en-IN")}.00</strong></span>
                                    <span>Registration Fee: <strong>₹1,000.00</strong></span>
                                    <span>GST (18%): <strong>₹180.00</strong></span>
                                    <span>Pay Now to Unlock: <strong className="text-emerald-300">₹{pricing.regTotal.toFixed(2)}</strong></span>
                                    <span>Pay the Rest Later: <strong className="text-cyan-300">₹{pricing.remainingToPayLater.toLocaleString("en-IN")}.00</strong></span>
                                  </div>
                                </div>
                              ) : (
                                <>
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
                                    <span>
                                      Base Plan:{" "}
                                      {isClubMember && pricing.rawBasePrice > pricing.basePrice ? (
                                        <>
                                          <span className="line-through text-white/40 mr-1">₹{pricing.rawBasePrice.toLocaleString("en-IN")}.00</span>
                                          <strong className="text-emerald-300">₹{pricing.basePrice.toLocaleString("en-IN")}.00</strong>
                                        </>
                                      ) : (
                                        <strong>₹{pricing.basePrice.toLocaleString("en-IN")}.00</strong>
                                      )}
                                    </span>
                                    <span>Add-ons Total: <strong>₹{pricing.addonsTotal.toLocaleString("en-IN")}.00</strong></span>
                                    <span>Subtotal: <strong>₹{pricing.subtotal.toLocaleString("en-IN")}.00</strong></span>
                                    <span>GST (18%): <strong>₹{pricing.gst.toFixed(2)}</strong></span>
                                    <span className="text-cyan-300 font-extrabold text-sm">Total Amount: <strong>₹{pricing.total.toFixed(2)}</strong></span>
                                  </div>
                                </>
                              )}
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
                          const currentPricing = calculateTotalPricing(selectedPlan, selectedAddons, posterCount, isClubMember);
                          if (currentPricing.hasRegistrationFee) {
                            return `Pay ₹${currentPricing.regTotal.toFixed(2)} (₹1,000 + 18% GST) to Unlock & Submit Registration`;
                          }
                          return `Pay ₹${currentPricing.total.toFixed(2)} via Razorpay & Submit Registration`;
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










