import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, CheckCircle2, AlertCircle, Loader2, Copy, Check, QrCode, Smartphone } from "lucide-react";
import { API_BASE, SERVER_URL } from "../config.js";

export default function PayToReadModal({ story, isOpen, onClose, onSuccess }) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [paymentConfig, setPaymentConfig] = useState({ upiId: "pritamchakrabrty@slc", upiQrUrl: "" });
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submittedStatus, setSubmittedStatus] = useState(null); // 'pending' | 'approved' | 'rejected'

  // Build UPI deep link URL for opening payment apps directly
  const upiUrl = paymentConfig.upiId && story?.price
    ? `upi://pay?pa=${encodeURIComponent(paymentConfig.upiId)}&pn=${encodeURIComponent("Lekhok Tripura")}&am=${story.price}&cu=INR&tn=${encodeURIComponent("Story: " + (story?.title || ""))}`
    : "#";

  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      if (window.lenis) window.lenis.stop();

      fetch(`${API_BASE}/purchase/config`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.config) {
            const qrUrl = data.config.upiQrImageUrl || data.config.upiQrImage?.url || "";
            setPaymentConfig({
              upiId: data.config.upiId || "pritamchakrabrty@slc",
              upiQrUrl: qrUrl ? (qrUrl.startsWith("http") ? qrUrl : `${SERVER_URL}${qrUrl}`) : ""
            });
          }
        })
        .catch(() => {
          setPaymentConfig((prev) => ({ ...prev, upiId: "pritamchakrabrty@slc" }));
        });

      const savedUser = JSON.parse(localStorage.getItem("story_reader_info") || "{}");
      if (savedUser.name) setName(savedUser.name);
      if (savedUser.email) setEmail(savedUser.email);
      if (savedUser.phone) setPhone(savedUser.phone);

      if (story?._id && (savedUser.email || savedUser.transactionId)) {
        checkExistingStatus(story._id, savedUser.email, savedUser.transactionId);
      }

      return () => {
        document.body.style.overflow = prevOverflow;
        if (window.lenis) window.lenis.start();
      };
    }
  }, [isOpen, story]);

  const checkExistingStatus = (storyId, userEmail, trxId) => {
    let url = `${API_BASE}/newsletter/access-status?newsletterId=${storyId}`;
    if (userEmail) url += `&userEmail=${encodeURIComponent(userEmail)}`;
    if (trxId) url += `&transactionId=${encodeURIComponent(trxId)}`;
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

  const copyUpiId = () => {
    if (!paymentConfig.upiId) return;
    navigator.clipboard.writeText(paymentConfig.upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !phone.trim() || !transactionId.trim()) {
      setError("Please fill in all required fields including Transaction ID / UTR.");
      return;
    }
    if (phone.trim().length !== 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);
    fetch(`${API_BASE}/newsletter/access-request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        newsletterId: story._id,
        userName: name.trim(),
        userEmail: email.trim(),
        userPhone: phone.trim(),
        transactionId: transactionId.trim()
      })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          localStorage.setItem("story_reader_info", JSON.stringify({ name, email, phone, transactionId }));
          localStorage.setItem(`story_access_${story._id}`, JSON.stringify({ email, transactionId, status: "pending" }));
          setSubmittedStatus("pending");
        } else {
          setError(data.message || "Failed to submit transaction details.");
        }
      })
      .catch(() => setError("Network error. Please try again."))
      .finally(() => setLoading(false));
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
                <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-cyan-300">Paid Story Access</span>
                <h2 className="text-lg font-black text-white truncate">{story.title}</h2>
              </div>
            </div>

            {/* ── SUCCESS STATE ── */}
            {submittedStatus === "pending" ? (
              <div className="py-4 space-y-5 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 text-amber-300 border border-amber-400/30">
                  <CheckCircle2 size={40} />
                </div>
                <div>
                  <span className="rounded-full bg-amber-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-300 border border-amber-400/30">Verification Pending</span>
                  <h3 className="text-xl font-black text-white mt-3">Thank You for Your Support!</h3>
                  <p className="mt-2 text-sm text-white/70 leading-relaxed">Your payment transaction reference has been received. You'll be notified via email once approved.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left text-xs space-y-2.5 text-white/70">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-white/40">Transaction ID:</span>
                    <span className="font-mono text-cyan-300 font-bold">{transactionId || "Submitted"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Email:</span>
                    <span className="text-amber-300 font-semibold truncate max-w-[200px]">{email || "Saved"}</span>
                  </div>
                </div>
                <button type="button" onClick={onClose}
                  className="w-full rounded-2xl bg-cyan-400 px-6 py-3.5 text-sm font-black text-black hover:bg-cyan-300 transition uppercase tracking-wider">
                  Okay, Got It
                </button>
              </div>

            ) : submittedStatus === "approved" ? (
              /* ── APPROVED STATE ── */
              <div className="py-4 space-y-5 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-400/20 to-teal-500/20 text-emerald-300 border border-emerald-400/30">
                  <CheckCircle2 size={40} />
                </div>
                <div>
                  <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-300 border border-emerald-400/30">Access Approved</span>
                  <h3 className="text-2xl font-black text-white mt-3">Access Granted!</h3>
                  <p className="mt-2 text-sm text-white/70">Your payment has been verified. You can now read the full story!</p>
                </div>
                <button type="button"
                  onClick={() => { onClose(); if (onSuccess) onSuccess(); if (story?.slug) navigate(`/short-stories/${story.slug}`); }}
                  className="w-full rounded-2xl bg-emerald-400 px-6 py-3.5 text-sm font-black text-black hover:bg-emerald-300 transition uppercase tracking-wider">
                  Read Story Now
                </button>
              </div>

            ) : (
              /* ── PAYMENT FORM ── */
              <>
                {/* Price + UPI Button */}
                <div className="my-4 rounded-2xl border border-cyan-400/30 bg-gradient-to-r from-cyan-950/50 to-indigo-950/40 p-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-white/60">Story Reading Fee</p>
                    <p className="text-3xl font-black text-white">₹{story.price}</p>
                  </div>
                  <a href={upiUrl} className="rounded-full bg-cyan-400 px-4 py-2 text-xs font-black text-black uppercase tracking-wider hover:bg-cyan-300 transition flex items-center gap-1.5 shrink-0">
                    <Smartphone size={14} /> Open UPI App
                  </a>
                </div>

                {/* UPI Details */}
                <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-white/50">1. Pay via UPI</p>
                  <a href={upiUrl} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-400 px-4 py-3 text-sm font-black text-black hover:opacity-90 transition uppercase tracking-wider">
                    <Smartphone size={16} /> Open UPI App (Pay ₹{story.price})
                  </a>
                  {paymentConfig.upiId && (
                    <div className="flex items-center justify-between rounded-xl border border-cyan-400/20 bg-cyan-950/30 px-3 py-2.5">
                      <span className="font-mono text-xs font-bold text-cyan-200 truncate mr-2">{paymentConfig.upiId}</span>
                      <button type="button" onClick={copyUpiId}
                        className="shrink-0 flex items-center gap-1.5 rounded-lg bg-cyan-400/20 px-3 py-1.5 text-xs font-bold text-cyan-300 hover:bg-cyan-400/30 transition">
                        {copiedUpi ? <Check size={14} /> : <Copy size={14} />}
                        {copiedUpi ? "Copied!" : "Copy"}
                      </button>
                    </div>
                  )}
                  {paymentConfig.upiQrUrl && (
                    <div className="flex flex-col items-center p-3 rounded-xl border border-white/10 bg-white/5">
                      <img src={paymentConfig.upiQrUrl} alt="UPI QR" className="h-32 w-32 object-contain rounded-lg bg-white p-1" />
                      <span className="text-[10px] text-white/40 mt-2 flex items-center gap-1"><QrCode size={12} /> Scan with GPay, PhonePe, Paytm, BHIM</span>
                    </div>
                  )}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-white/50">2. Enter Your Details</p>

                  {error && (
                    <div className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-300">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" /><span>{error}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1.5">Full Name *</label>
                    <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white focus:border-cyan-400/50 focus:outline-none placeholder-white/20" />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1.5">Email *</label>
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white focus:border-cyan-400/50 focus:outline-none placeholder-white/20" />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1.5">Phone Number *</label>
                    <input type="tel" required maxLength={10} value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      placeholder="10-digit mobile number"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white focus:border-cyan-400/50 focus:outline-none font-mono placeholder-white/20" />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1.5">UPI Transaction ID / UTR *</label>
                    <input type="text" required value={transactionId} onChange={(e) => setTransactionId(e.target.value)} placeholder="e.g. 312456789012"
                      className="w-full rounded-xl border border-cyan-400/30 bg-cyan-950/30 px-4 py-3 text-base font-mono font-bold text-cyan-200 focus:border-cyan-400 focus:outline-none placeholder-cyan-500/30" />
                  </div>

                  <div className="flex gap-3 pt-2 pb-4">
                    <button type="button" onClick={onClose}
                      className="w-1/3 rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm font-semibold text-white/70 hover:bg-white/10 transition">
                      Cancel
                    </button>
                    <button type="submit" disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-3.5 text-sm font-black text-black hover:bg-cyan-300 transition disabled:opacity-50">
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Transaction ID"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
