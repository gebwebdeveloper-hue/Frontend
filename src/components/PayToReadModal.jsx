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
  const [statusMessage, setStatusMessage] = useState("");
  const [submittedStatus, setSubmittedStatus] = useState(null); // 'pending' | 'approved' | 'rejected'

  // Build UPI deep link URL for opening payment apps directly
  const upiUrl = paymentConfig.upiId && story?.price
    ? `upi://pay?pa=${encodeURIComponent(paymentConfig.upiId)}&pn=${encodeURIComponent("Lekhok Tripura")}&am=${story.price}&cu=INR&tn=${encodeURIComponent("Story: " + (story?.title || ""))}`
    : "#";

  useEffect(() => {
    if (isOpen) {
      // Do NOT set body overflow:hidden — it prevents scroll inside fixed overlays on Android Chrome
      // Just stop Lenis smooth scroll so it doesn't interfere
      if (window.lenis) window.lenis.stop();

      // Fetch UPI details (same as Library payment config)
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
        .catch((err) => {
          console.error("Error loading UPI details:", err);
          setPaymentConfig((prev) => ({ ...prev, upiId: "pritamchakrabrty@slc" }));
        });

      // Restore saved user info from localStorage if available
      const savedUser = JSON.parse(localStorage.getItem("story_reader_info") || "{}");
      if (savedUser.name) setName(savedUser.name);
      if (savedUser.email) setEmail(savedUser.email);
      if (savedUser.phone) setPhone(savedUser.phone);

      // Check existing status for this story if any
      if (story?._id && (savedUser.email || savedUser.transactionId)) {
        checkExistingStatus(story._id, savedUser.email, savedUser.transactionId);
      }
    } else {
      if (window.lenis) window.lenis.start();
    }

    return () => {
      if (window.lenis) window.lenis.start();
    };
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
          if (data.status === "approved" && onSuccess) {
            onSuccess();
          }
        }
      })
      .catch((err) => console.error(err));
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
    setStatusMessage("");

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
          // Save in localStorage
          localStorage.setItem("story_reader_info", JSON.stringify({ name, email, phone, transactionId }));
          localStorage.setItem(`story_access_${story._id}`, JSON.stringify({ email, transactionId, status: "pending" }));
          
          setSubmittedStatus("pending");
          setStatusMessage("Thank you for your contribution and support! Your payment details have been submitted. Our team will verify your transaction ID shortly, and you will be notified via email once your story access is approved.");
        } else {
          setError(data.message || "Failed to submit transaction details.");
        }
      })
      .catch((err) => {
        console.error(err);
        setError("Network error. Please try again.");
      })
      .finally(() => setLoading(false));
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && story && (
        <>
          {/* Dark backdrop */}
          <div
            className="fixed inset-0 z-[9998] bg-black/75 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Scroll container — fullscreen fixed, scrolls vertically, modal card inside */}
          <div
            className="fixed inset-0 z-[9999] overflow-y-auto"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {/* Flex column so modal sticks to bottom on mobile, center on desktop */}
            <div className="flex min-h-full items-end justify-center sm:items-center sm:p-4">
              <motion.div
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, y: 80 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 80 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="relative w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl border border-cyan-500/40 bg-zinc-950 shadow-2xl text-white px-5 sm:px-8 pb-8 pt-2"
              >
                {/* Drag handle */}
                <div className="flex justify-center py-2 sm:hidden">
                  <div className="h-1 w-10 rounded-full bg-white/20" />
                </div>

                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition"
                >
                  <X size={18} />
                </button>

                {/* Header */}
                <div className="flex items-center gap-3 border-b border-white/10 pb-4 pt-2">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                    <Lock size={22} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-cyan-300">Paid Story Access</span>
                    <h2 className="text-lg font-black text-white truncate">{story.title}</h2>
                  </div>
                </div>

                {submittedStatus === "pending" ? (
                  /* DEDICATED SUCCESS & APPRECIATION VIEW AFTER SUBMISSION */
                  <div className="py-4 space-y-6 text-center">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 text-amber-300 border border-amber-400/30 shadow-lg shadow-amber-500/10">
                      <CheckCircle2 size={40} />
                    </div>

                    <div>
                      <span className="rounded-full bg-amber-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-300 border border-amber-400/30">
                        Verification Pending
                      </span>
                      <h3 className="text-2xl font-black text-white mt-3">
                        Thank You for Your Contribution & Support!
                      </h3>
                      <p className="mt-3 text-xs sm:text-sm text-white/70 leading-relaxed max-w-md mx-auto">
                        We sincerely appreciate your love for literature and Lekhok Tripura. Your payment transaction reference has been successfully received.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left text-xs space-y-2.5 text-white/70">
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-white/40">Story Title:</span>
                        <span className="font-semibold text-white truncate max-w-[200px]">{story.title}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-white/40">Transaction ID / UTR:</span>
                        <span className="font-mono text-cyan-300 font-bold">{transactionId || "Submitted"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/40">Notification Email:</span>
                        <span className="text-amber-300 font-semibold truncate max-w-[200px]">{email || "Saved"}</span>
                      </div>
                    </div>

                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3.5 text-xs text-amber-200 text-center leading-relaxed">
                      <strong>You will be notified via email</strong> as soon as your payment is verified and story access is approved by the admin!
                    </div>

                    <button
                      type="button"
                      onClick={onClose}
                      className="w-full rounded-2xl bg-cyan-400 px-6 py-3.5 text-xs font-black text-black hover:bg-cyan-300 transition shadow-glow shadow-cyan-400/20 uppercase tracking-wider"
                    >
                      Okay, Got It
                    </button>
                  </div>
                ) : submittedStatus === "approved" ? (
                  /* DEDICATED APPROVED VIEW */
                  <div className="py-4 space-y-6 text-center">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-400/20 to-teal-500/20 text-emerald-300 border border-emerald-400/30 shadow-lg shadow-emerald-500/10">
                      <CheckCircle2 size={40} />
                    </div>

                    <div>
                      <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-300 border border-emerald-400/30">
                        Access Approved
                      </span>
                      <h3 className="text-2xl font-black text-white mt-3">Access Granted!</h3>
                      <p className="mt-2 text-xs sm:text-sm text-white/70 leading-relaxed max-w-md mx-auto">
                        Your payment has been verified by the admin. You can now read the complete story!
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        if (onSuccess) onSuccess();
                        if (story?.slug) navigate(`/short-stories/${story.slug}`);
                      }}
                      className="w-full rounded-2xl bg-emerald-400 px-6 py-3.5 text-xs font-black text-black hover:bg-emerald-300 transition shadow-glow shadow-emerald-400/20 uppercase tracking-wider"
                    >
                      Read Story Now
                    </button>
                  </div>
                ) : (
                  /* FORM & UPI DETAILS VIEW BEFORE SUBMISSION */
                  <>
                    {/* Price Banner */}
                    <div className="my-5 rounded-2xl border border-cyan-400/30 bg-gradient-to-r from-cyan-950/50 to-indigo-950/40 p-4 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs text-white/60">Story Reading Fee</p>
                        <p className="text-3xl font-black text-white mt-0.5">₹{story.price}</p>
                      </div>
                      <a
                        href={upiUrl}
                        className="rounded-full bg-cyan-400 px-4 py-2 text-xs font-black text-black uppercase tracking-wider hover:bg-cyan-300 transition flex items-center gap-1.5 shadow-glow shadow-cyan-400/20 shrink-0"
                      >
                        <Smartphone size={14} /> Open UPI App
                      </a>
                    </div>

                    {/* UPI ID & Payment Box */}
                    <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-white/50">1. Pay to Owner UPI ID</p>

                      <a
                        href={upiUrl}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-400 px-4 py-3 text-xs font-black text-black hover:opacity-90 transition shadow-glow shadow-cyan-400/20 uppercase tracking-wider"
                      >
                        <Smartphone size={16} /> Open UPI App (Pay ₹{story.price})
                      </a>

                      {paymentConfig.upiId ? (
                        <div className="flex items-center justify-between rounded-xl border border-cyan-400/20 bg-cyan-950/30 px-3 py-2.5">
                          <span className="font-mono text-xs font-bold text-cyan-200 truncate mr-2">{paymentConfig.upiId}</span>
                          <button
                            type="button"
                            onClick={copyUpiId}
                            className="shrink-0 flex items-center gap-1.5 rounded-lg bg-cyan-400/20 px-3 py-1.5 text-xs font-bold text-cyan-300 hover:bg-cyan-400/30 transition"
                          >
                            {copiedUpi ? <Check size={14} /> : <Copy size={14} />}
                            {copiedUpi ? "Copied!" : "Copy"}
                          </button>
                        </div>
                      ) : (
                        <p className="text-xs text-white/60 italic">UPI ID: Please ask admin / scan UPI QR Code</p>
                      )}

                      {paymentConfig.upiQrUrl && (
                        <div className="flex flex-col items-center justify-center p-3 rounded-xl border border-white/10 bg-white/5">
                          <img src={paymentConfig.upiQrUrl} alt="UPI Scanner QR" className="h-32 w-32 object-contain rounded-lg bg-white p-1" />
                          <span className="text-[10px] text-white/40 mt-2 flex items-center gap-1"><QrCode size={12} /> Scan QR with Google Pay, PhonePe, Paytm, BHIM</span>
                        </div>
                      )}
                    </div>

                    {/* Form to submit Transaction ID */}
                    <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-white/50">2. Enter Transaction Reference & Details</p>

                      {error && (
                        <div className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-xs text-red-300">
                          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                          <span>{error}</span>
                        </div>
                      )}

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1">Your Full Name *</label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Full Name"
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white focus:border-cyan-400/40 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1">Email Address *</label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your.email@example.com"
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white focus:border-cyan-400/40 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1">Phone / Mobile No *</label>
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                          placeholder="10-digit mobile number"
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white focus:border-cyan-400/40 focus:outline-none font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1">UPI Transaction ID / UTR *</label>
                        <input
                          type="text"
                          required
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value)}
                          placeholder="e.g. 312456789012"
                          className="w-full rounded-xl border border-cyan-400/30 bg-cyan-950/30 px-3.5 py-2.5 text-sm font-mono font-bold text-cyan-200 focus:border-cyan-400 focus:outline-none placeholder-cyan-500/40"
                        />
                      </div>

                      <div className="flex gap-3 pt-1">
                        <button
                          type="button"
                          onClick={onClose}
                          className="w-1/3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-semibold text-white/70 hover:bg-white/10 hover:text-white transition"
                        >
                          Cancel
                        </button>

                        <button
                          type="submit"
                          disabled={loading}
                          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-xs font-black text-black hover:bg-cyan-300 transition shadow-glow shadow-cyan-400/20 disabled:opacity-50"
                        >
                          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Transaction ID"}
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
