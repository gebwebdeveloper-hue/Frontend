import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, BookOpen, Clock, AlertTriangle, ShieldCheck, MapPin, Loader2,
  ArrowRight, User, Phone, Mail, Home, Building2, Store, CreditCard,
  ArrowLeft, CheckCircle2, Shield
} from "lucide-react";
import { API_BASE, SERVER_URL } from "../config.js";
import { loadRazorpayScript } from "../utils/razorpay.js";

const SELF_PICKUP_ADDRESS = "Madhuban kathaltali, Tarader Thikana, Agartala, Tripura 799003";

export default function RentalCheckoutModal({ book, isOpen, onClose, onSuccess }) {
  const [step, setStep] = useState("details"); // 'details' | 'payment'

  // User form details
  const [renterName, setRenterName] = useState("");
  const [renterPhone, setRenterPhone] = useState("");
  const [renterEmail, setRenterEmail] = useState("");
  const [co, setCo] = useState("");
  const [fullAddress, setFullAddress] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    setStep("details");
    setError("");

    // Lock background scroll and pause Lenis smooth scroll
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (window.lenis) window.lenis.stop();

    // Fetch user profile
    fetch(`${API_BASE}/auth/me`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success && data.user) {
          setUser(data.user);
          setRenterName(data.user.name || "");
          setRenterPhone(data.user.phone || "");
          setRenterEmail(data.user.email || "");
          setCo(data.user.co || "");
        }
      })
      .catch(() => {});

    return () => {
      document.body.style.overflow = prevOverflow || "unset";
      if (window.lenis) window.lenis.start();
    };
  }, [isOpen]);

  if (!isOpen || !book) return null;

  const rentalPrice = book.rentalPrice || 50;
  const rentalDuration = book.rentalDurationDays || 15;
  const finePerDay = book.finePerDay || 5;

  // 18% GST Calculation
  const gstAmount = Number((rentalPrice * 0.18).toFixed(2));
  const totalAmount = Number((rentalPrice + gstAmount).toFixed(2));

  const today = new Date();
  const dueDate = new Date(today.getTime() + rentalDuration * 24 * 60 * 60 * 1000);
  const dueDateFormatted = dueDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handleProceedToPayment = (e) => {
    e.preventDefault();
    setError("");

    if (!renterName.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!renterPhone.trim() || renterPhone.length < 10) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }
    if (!renterEmail.trim()) {
      setError("Please enter your Gmail / email address.");
      return;
    }
    if (!fullAddress.trim()) {
      setError("Please provide your full resident address.");
      return;
    }
    if (!user) {
      setError("Please log in to your account to rent books.");
      return;
    }

    setStep("payment");
  };

  const handleRazorpayPayment = async () => {
    setLoading(true);
    setError("");

    try {
      const isLoaded = await loadRazorpayScript();

      // 1. Create order on backend
      const orderRes = await fetch(`${API_BASE}/rentals/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          bookId: book._id,
          fullAddress,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderData.success) {
        throw new Error(orderData.message || "Failed to initiate rental payment order.");
      }

      if (orderData.directSubmission) {
        await completeRentalVerification({});
        return;
      }

      // 2. Open Razorpay Checkout Modal
      if (isLoaded && window.Razorpay && orderData.orderId && orderData.keyId) {
        const options = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency || "INR",
          name: "Lekhok Tripura Publishers",
          description: `Book Rental: ${book.title} (Incl. 18% GST)`,
          order_id: orderData.orderId,
          prefill: {
            name: renterName || user.name || "",
            email: renterEmail || user.email || "",
            contact: renterPhone || user.phone || "",
          },
          theme: { color: "#10b981" },
          handler: async function (response) {
            await completeRentalVerification(response);
          },
          modal: {
            onDismiss: function () {
              setLoading(false);
              setError("Payment cancelled. Please complete payment to confirm your order.");
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        await completeRentalVerification({});
      }
    } catch (err) {
      setError(err.message || "An error occurred during rental checkout.");
      setLoading(false);
    }
  };

  const completeRentalVerification = async (paymentData) => {
    try {
      const verifyRes = await fetch(`${API_BASE}/rentals/verify-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          bookId: book._id,
          renterName,
          renterPhone,
          renterEmail,
          co,
          fullAddress,
          deliveryAddress: fullAddress,
          razorpay_order_id: paymentData.razorpay_order_id,
          razorpay_payment_id: paymentData.razorpay_payment_id,
          razorpay_signature: paymentData.razorpay_signature,
        }),
      });

      const data = await verifyRes.json();
      if (data.success) {
        window.dispatchEvent(new Event("lekhak:login"));
        if (onSuccess) onSuccess(data);
        onClose();
      } else {
        setError(data.message || "Rental payment verification failed.");
      }
    } catch {
      setError("Server connection error during payment verification.");
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          className="relative z-10 w-full max-w-lg rounded-3xl border border-emerald-400/30 bg-zinc-950 p-6 text-white shadow-2xl md:p-8 max-h-[85vh] overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-500/30 scrollbar-track-transparent my-auto"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white/70 transition hover:bg-white/20 hover:text-white cursor-pointer"
          >
            <X size={18} />
          </button>

          {/* Header */}
          <div className="mb-5 flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl border border-emerald-400/30 bg-emerald-400/10 text-emerald-400">
              <BookOpen size={24} />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">
                📖 BOOK RENT CHECKOUT
              </span>
              <h2 className="text-xl font-black text-white">
                {step === "details" ? "1. Contact & Pickup Details" : "2. Razorpay Online Payment"}
              </h2>
            </div>
          </div>

          {/* Selected Book Summary */}
          <div className="mb-5 flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
            {book.cover?.url ? (
              <img
                src={book.cover.url.startsWith("http") ? book.cover.url : `${SERVER_URL}${book.cover.url}`}
                alt={book.title}
                className="h-16 w-12 rounded-lg object-cover shadow-md shrink-0"
              />
            ) : (
              <div className="grid h-16 w-12 place-items-center rounded-lg bg-zinc-800 text-xs font-bold text-white/40 shrink-0">
                BOOK
              </div>
            )}
            <div className="overflow-hidden">
              <h3 className="font-extrabold text-white text-sm line-clamp-1">{book.title}</h3>
              <p className="text-xs text-white/60">by {book.author}</p>
              <div className="mt-1 flex items-center gap-2 text-xs">
                <span className="font-black text-emerald-300">₹{rentalPrice} Base Fee</span>
                <span className="text-white/40">•</span>
                <span className="text-white/70">{rentalDuration} Days Duration</span>
              </div>
            </div>
          </div>

          {/* STEP 1: USER DETAILS & PICKUP ADDRESS */}
          {step === "details" && (
            <form onSubmit={handleProceedToPayment} className="space-y-4">
              {/* SELF PICKUP NOTICE BANNER */}
              <div className="rounded-2xl border border-amber-400/40 bg-gradient-to-r from-amber-950/40 via-zinc-950 to-amber-950/40 p-4 shadow-lg">
                <div className="flex items-start gap-3">
                  <Store size={20} className="text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="inline-block rounded-full bg-amber-400/20 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-300 mb-1 border border-amber-400/30">
                      📍 SELF PICKUP ONLY
                    </span>
                    <p className="text-xs font-bold text-white leading-snug">
                      Pick Up Location:
                    </p>
                    <p className="text-xs text-amber-200/90 font-medium mt-0.5 leading-relaxed">
                      {SELF_PICKUP_ADDRESS}
                    </p>
                  </div>
                </div>
              </div>

              {/* RENTAL TERMS SUMMARY */}
              <div className="space-y-2 rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-3.5 text-xs">
                <div className="flex justify-between border-b border-white/10 pb-1.5">
                  <span className="text-white/60">Rental Window:</span>
                  <strong className="text-emerald-300">{rentalDuration} Days</strong>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-1.5">
                  <span className="text-white/60">Return Deadline:</span>
                  <strong className="text-cyan-300">{dueDateFormatted}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Late Fine:</span>
                  <strong className="text-amber-300">₹{finePerDay}/day after deadline</strong>
                </div>
              </div>

              {/* FORM FIELDS */}
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Name */}
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-white/75 mb-1 flex items-center gap-1.5">
                    <User size={12} className="text-emerald-400" /> Full Name *
                  </label>
                  <input
                    required
                    type="text"
                    value={renterName}
                    onChange={(e) => setRenterName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-xs text-white placeholder-white/30 outline-none transition focus:border-emerald-400 focus:bg-white/10"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-white/75 mb-1 flex items-center gap-1.5">
                    <Phone size={12} className="text-emerald-400" /> Phone Number *
                  </label>
                  <input
                    required
                    type="text"
                    value={renterPhone}
                    onChange={(e) => setRenterPhone(e.target.value.replace(/[^0-9]/g, "").slice(0, 10))}
                    placeholder="10-digit phone number"
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-xs text-white placeholder-white/30 outline-none transition focus:border-emerald-400 focus:bg-white/10"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Email */}
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-white/75 mb-1 flex items-center gap-1.5">
                    <Mail size={12} className="text-emerald-400" /> Gmail / Email Address *
                  </label>
                  <input
                    required
                    type="email"
                    value={renterEmail}
                    onChange={(e) => setRenterEmail(e.target.value)}
                    placeholder="your.email@gmail.com"
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-xs text-white placeholder-white/30 outline-none transition focus:border-emerald-400 focus:bg-white/10"
                  />
                </div>

                {/* C/O */}
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-white/75 mb-1 flex items-center gap-1.5">
                    <Building2 size={12} className="text-emerald-400" /> C/O (Care Of)
                  </label>
                  <input
                    type="text"
                    value={co}
                    onChange={(e) => setCo(e.target.value)}
                    placeholder="Father's / Guardian's Name"
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-xs text-white placeholder-white/30 outline-none transition focus:border-emerald-400 focus:bg-white/10"
                  />
                </div>
              </div>

              {/* Full Address */}
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-white/75 mb-1 flex items-center gap-1.5">
                  <Home size={12} className="text-emerald-400" /> Full Resident Address *
                </label>
                <textarea
                  required
                  rows={2}
                  value={fullAddress}
                  onChange={(e) => setFullAddress(e.target.value)}
                  placeholder="House No, Village/City, Landmark, District, PIN Code..."
                  className="w-full rounded-xl border border-white/15 bg-white/5 p-3 text-xs text-white placeholder-white/30 outline-none transition focus:border-emerald-400 focus:bg-white/10"
                />
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs font-bold text-red-300">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 px-6 py-4 text-xs font-black uppercase tracking-wider text-black shadow-lg shadow-emerald-400/20 transition hover:scale-[1.02] cursor-pointer"
              >
                PROCEED TO PAYMENT (₹{totalAmount.toFixed(2)} INCL. GST) <ArrowRight size={16} />
              </button>
            </form>
          )}

          {/* STEP 2: RAZORPAY PAYMENT */}
          {step === "payment" && (
            <div className="space-y-5">
              {/* BACK BUTTON */}
              <button
                type="button"
                onClick={() => setStep("details")}
                className="flex items-center gap-1.5 text-xs font-bold text-white/60 hover:text-white transition cursor-pointer"
              >
                <ArrowLeft size={14} /> Back to Contact Details
              </button>

              {/* PRICING BREAKDOWN CARD */}
              <div className="rounded-2xl border border-emerald-400/30 bg-emerald-950/30 p-4 text-xs space-y-2">
                <div className="flex justify-between text-white/70">
                  <span>Base Rental Fee ({rentalDuration} Days):</span>
                  <strong className="text-white">₹{rentalPrice.toFixed(2)}</strong>
                </div>
                <div className="flex justify-between text-emerald-300">
                  <span>GST (18%):</span>
                  <strong>+ ₹{gstAmount.toFixed(2)}</strong>
                </div>
                <div className="flex justify-between border-t border-white/10 pt-2 text-sm font-black">
                  <span className="text-white">Total Amount to Pay:</span>
                  <span className="text-emerald-300 text-base">₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* RAZORPAY METHOD CARD */}
              <div className="rounded-2xl border border-emerald-400 bg-emerald-400/10 p-5 shadow-lg shadow-emerald-400/10 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-400/20 text-emerald-400">
                    <CreditCard size={22} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white">Razorpay Secure Online Payment</h4>
                    <p className="text-xs text-emerald-300/90 font-medium mt-0.5">
                      Instant Automated Payment Gateway
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/40 p-3 text-xs text-white/70 space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-300 font-bold">
                    <Shield size={14} /> 100% Encrypted &amp; Verified Payment
                  </div>
                  <p className="text-[11px] text-white/60">
                    Supports <strong>UPI, Google Pay, PhonePe, Paytm, BHIM, Credit/Debit Cards, NetBanking &amp; Wallets</strong>.
                  </p>
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs font-bold text-red-300">
                  {error}
                </div>
              )}

              {/* ACTION BUTTON */}
              <button
                type="button"
                disabled={loading}
                onClick={handleRazorpayPayment}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 px-6 py-4 text-xs font-black uppercase tracking-wider text-black shadow-lg shadow-emerald-400/20 transition hover:scale-[1.02] disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Launching Razorpay...
                  </>
                ) : (
                  <>
                    PAY ₹{totalAmount.toFixed(2)} VIA RAZORPAY NOW <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
