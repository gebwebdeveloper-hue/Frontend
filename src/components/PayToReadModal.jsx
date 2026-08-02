import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, CheckCircle2, AlertCircle, Loader2, ShieldCheck } from "lucide-react";
import { API_BASE } from "../config.js";
import { loadRazorpayScript } from "../utils/razorpay.js";

export default function PayToReadModal({ story, isOpen, onClose, onSuccess }) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submittedStatus, setSubmittedStatus] = useState(null); // 'pending' | 'approved'

  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      if (window.lenis) window.lenis.stop();

      const savedUser = JSON.parse(localStorage.getItem("story_reader_info") || "{}");
      if (savedUser.name) setName(savedUser.name);
      if (savedUser.email) setEmail(savedUser.email);
      if (savedUser.phone) setPhone(savedUser.phone);

      if (story?._id && savedUser.email) {
        checkExistingStatus(story._id, savedUser.email);
      }

      return () => {
        document.body.style.overflow = prevOverflow;
        if (window.lenis) window.lenis.start();
      };
    }
  }, [isOpen, story]);

  const checkExistingStatus = (storyId, userEmail) => {
    const url = `${API_BASE}/newsletter/access-status?newsletterId=${storyId}&userEmail=${encodeURIComponent(userEmail)}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.status !== "none") {
          setSubmittedStatus(data.status);
          if (data.status === "approved" && onSuccess) onSuccess();
        }
      })
      .catch(console.error);
  };

  const handleRazorpayPay = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !phone.trim()) {
      setError("Please fill in all required contact details.");
      return;
    }
    if (phone.trim().length !== 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);

    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        setError("Failed to load Razorpay Payment Gateway. Please check your internet connection.");
        setLoading(false);
        return;
      }

      // 1. Create order on backend
      const res = await fetch(`${API_BASE}/newsletter/razorpay/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newsletterId: story._id,
          userName: name.trim(),
          userEmail: email.trim(),
          userPhone: phone.trim()
        })
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Failed to initiate payment.");
        setLoading(false);
        return;
      }

      localStorage.setItem("story_reader_info", JSON.stringify({ name: name.trim(), email: email.trim(), phone: phone.trim() }));

      // 2. Open Razorpay modal
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency || "INR",
        name: "Lekhok Tripura",
        description: `Access for: ${story.title}`,
        order_id: data.orderId,
        prefill: {
          name: name.trim(),
          email: email.trim(),
          contact: phone.trim()
        },
        theme: {
          color: "#06b6d4"
        },
        handler: async function (response) {
          try {
            const verifyRes = await fetch(`${API_BASE}/newsletter/razorpay/verify`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              setSubmittedStatus("approved");
              if (onSuccess) onSuccess();
            } else {
              setError(verifyData.message || "Payment verification failed.");
            }
          } catch {
            setError("Error verifying payment signature.");
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
        setError(resp.error?.description || "Payment was cancelled or failed.");
        setLoading(false);
      });
      rzp.open();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && story && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          data-lenis-prevent
          className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
          style={{ WebkitOverflowScrolling: "touch" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            data-lenis-prevent
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full sm:max-w-lg max-h-[85dvh] sm:max-h-[85vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-cyan-500/40 bg-zinc-950 p-5 sm:p-8 text-white shadow-2xl custom-scrollbar my-0 sm:my-auto"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {/* Drag Handle Indicator for Mobile */}
            <div className="flex justify-center pb-2 sm:hidden">
              <div className="h-1 w-10 rounded-full bg-white/20" />
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 sm:right-5 sm:top-5 grid h-9 w-9 place-items-center rounded-full bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition z-10"
            >
              <X size={18} />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 border-b border-white/10 pb-4 pt-1 sm:pt-0">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                <Lock size={22} />
              </div>
              <div className="min-w-0 pr-8">
                <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-cyan-300">Automated Razorpay Checkout</span>
                <h2 className="text-lg font-black text-white truncate">{story.title}</h2>
              </div>
            </div>

            {/* ── APPROVED STATE ── */}
            {submittedStatus === "approved" ? (
              <div className="py-6 space-y-5 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-400/20 to-teal-500/20 text-emerald-300 border border-emerald-400/30">
                  <CheckCircle2 size={40} />
                </div>
                <div>
                  <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-300 border border-emerald-400/30">
                    Payment Verified
                  </span>
                  <h3 className="text-2xl font-black text-white mt-3">Access Granted!</h3>
                  <p className="mt-2 text-sm text-white/70">Your payment of ₹{story.price} has been verified automatically via Razorpay. Enjoy reading!</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onSuccess) onSuccess();
                    if (story?.slug) navigate(`/short-stories/${story.slug}`);
                  }}
                  className="w-full rounded-2xl bg-emerald-400 px-6 py-3.5 text-sm font-black text-black hover:bg-emerald-300 transition uppercase tracking-wider shadow-lg shadow-emerald-400/20"
                >
                  Read Story Now →
                </button>
              </div>
            ) : (
              /* ── PAYMENT FORM ── */
              <form onSubmit={handleRazorpayPay} className="mt-5 space-y-4">
                {/* Price Display */}
                <div className="rounded-2xl border border-cyan-400/30 bg-gradient-to-r from-cyan-950/50 to-indigo-950/40 p-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-white/60">Story Access Fee</p>
                    <p className="text-3xl font-black text-white">₹{story.price}</p>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-3 py-1 text-[10px] font-bold text-emerald-300 border border-emerald-400/30">
                    <ShieldCheck size={14} /> Instant Access
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-300">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white focus:border-cyan-400/50 focus:outline-none placeholder-white/20"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1.5">Email *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white focus:border-cyan-400/50 focus:outline-none placeholder-white/20"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1.5">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="10-digit mobile number"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white focus:border-cyan-400/50 focus:outline-none font-mono placeholder-white/20"
                  />
                </div>

                <div className="flex gap-3 pt-2 pb-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-1/3 rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm font-semibold text-white/70 hover:bg-white/10 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-400 px-5 py-3.5 text-sm font-black text-black hover:opacity-90 transition disabled:opacity-50 shadow-lg shadow-cyan-400/20"
                  >
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin text-black" />
                    ) : (
                      <>Pay ₹{story.price} via Razorpay</>
                    )}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
