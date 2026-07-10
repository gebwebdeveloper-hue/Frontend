import { useState, useEffect } from "react";
import { ArrowUpRight, Star, Loader2, AlertCircle, CheckCircle2, Copy, Smartphone, Mail, KeyRound, ShieldCheck, Coins, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { API_BASE, SERVER_URL } from "../config.js";
import AuthModal from "./AuthModal.jsx";

export default function BookCard({ book }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [showReader, setShowReader] = useState(false);
  const [modalStep, setModalStep] = useState(null); // 'checking', 'pay', 'pending', 'pdf'
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [accessStatus, setAccessStatus] = useState("loading"); // 'loading', 'unauthenticated', 'no_purchase', 'pending', 'approved'
  const [accessCheckLoading, setAccessCheckLoading] = useState(true);

  // Registration form fields
  const [name, setName] = useState("");
  const [co, setCo] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("India");
  const [district, setDistrict] = useState("");
  const [block, setBlock] = useState("");
  const [pin, setPin] = useState("");
  const [postOffice, setPostOffice] = useState("");
  const [nearbyLocation, setNearbyLocation] = useState("");

  // Transaction fields
  const [otp, setOtp] = useState("");
  const [transactionNumber, setTransactionNumber] = useState("");
  const [upiConfig, setUpiConfig] = useState({ upiId: "kiransamanta88@okaxis", upiQrImageUrl: "" });

  const formatPrice = (price) => {
    if (typeof price === "number") return `₹${price}`;
    return String(price || "").replace("$", "₹");
  };

  const handleOpenPreview = async (e) => {
    e.stopPropagation();
    if (e && e.stopPropagation) e.stopPropagation();
    
    // Redirect to library page if not already there
    if (location.pathname !== "/library") {
      navigate("/library");
      return;
    }
    
    // Show Details modal immediately!
    setShowReader(true);
    setModalStep("details");
    setAccessCheckLoading(true);
    setAccessStatus("loading");
    setErrorMsg("");
    
    try {
      // Check if user is logged in
      const meRes = await fetch(`${API_BASE}/auth/me`, { credentials: "include" });
      if (!meRes.ok) {
        setAccessStatus("unauthenticated");
        setAccessCheckLoading(false);
        return;
      }
      
      const meData = await meRes.json();
      if (!meData.success || !meData.user) {
        setAccessStatus("unauthenticated");
        setAccessCheckLoading(false);
        return;
      }

      // Pre-fill email/name so payment form shows user info
      if (meData.user.email) setEmail(meData.user.email);
      if (meData.user.name) setName(meData.user.name);

      // Admin gets instant access
      if (meData.user.role === "admin") {
        setAccessStatus("approved");
        setAccessCheckLoading(false);
        return;
      }
      
      // Check purchase status for this book
      const bookId = book._id || book.id;
      const purchaseRes = await fetch(`${API_BASE}/purchase/me`, { credentials: "include" });
      if (!purchaseRes.ok) {
        setAccessStatus("no_purchase");
        setAccessCheckLoading(false);
        return;
      }
      
      const purchaseData = await purchaseRes.json();
      if (purchaseData.success && purchaseData.purchases) {
        const bookPurchase = purchaseData.purchases.find((p) => {
          const pid = p.bookId?._id?.toString() || p.bookId?.toString();
          return pid === bookId?.toString();
        });

        if (bookPurchase) {
          if (bookPurchase.status === "approved") {
            setAccessStatus("approved");
          } else if (bookPurchase.status === "pending") {
            setAccessStatus("pending");
            if (bookPurchase.transactionNumber) setTransactionNumber(bookPurchase.transactionNumber);
          } else {
            setAccessStatus("no_purchase");
            setErrorMsg(`Your previous request was rejected: "${bookPurchase.adminNote || 'No reason provided'}". You can pay and submit a new transaction ID.`);
          }
        } else {
          setAccessStatus("no_purchase");
        }
      } else {
        setAccessStatus("no_purchase");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to check book access status.");
      setAccessStatus("unauthenticated");
    } finally {
      setAccessCheckLoading(false);
    }
  };

  const handleDetailsPurchaseAction = () => {
    if (accessStatus === "unauthenticated") {
      setShowReader(false);
      setShowAuthModal(true);
    } else if (accessStatus === "no_purchase") {
      setModalStep("pay");
    }
  };

  useEffect(() => {
    if (modalStep === "pay") {
      fetch(`${API_BASE}/purchase/config`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setUpiConfig({
              upiId: data.upiId || "kiransamanta88@okaxis",
              upiQrImageUrl: data.upiQrImageUrl || ""
            });
          }
        })
        .catch(() => {});
    }
  }, [modalStep]);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!email || !name || !phone) {
      setErrorMsg("Name, Email, and Phone number are required.");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    
    try {
      const res = await fetch(`${API_BASE}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        credentials: "include"
      });
      const data = await res.json();
      if (data.success) {
        setModalStep("otp");
      } else {
        setErrorMsg(data.message || "Failed to send OTP.");
      }
    } catch (err) {
      setErrorMsg("Error connecting to server.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) {
      setErrorMsg("Please enter the verification OTP.");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    
    try {
      const res = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp,
          name,
          co,
          phone,
          country,
          district,
          block,
          pin,
          postOffice,
          nearbyLocation
        }),
        credentials: "include"
      });
      const data = await res.json();
      if (data.success) {
        // Dispatch event so the Navbar picks up the new session immediately
        window.dispatchEvent(new Event("lekhak:login"));
        setModalStep("pay");
      } else {
        setErrorMsg(data.message || "Invalid or expired OTP.");
      }
    } catch (err) {
      setErrorMsg("OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    if (!transactionNumber) {
      setErrorMsg("Please enter the UPI transaction number.");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    
    try {
      const formData = new FormData();
      formData.append("bookId", book._id || book.id);
      formData.append("transactionNumber", transactionNumber);
      formData.append("note", `UPI payment of ₹${book.price} for ${book.title}`);
      
      const res = await fetch(`${API_BASE}/purchase`, {
        method: "POST",
        body: formData,
        credentials: "include"
      });
      const data = await res.json();
      if (data.success) {
        setModalStep("pending");
      } else {
        setErrorMsg(data.message || "Failed to submit purchase request.");
      }
    } catch (err) {
      setErrorMsg("Error submitting payment details.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowReader(false);
    setModalStep(null);
    setErrorMsg("");
    // Release the blob URL to avoid memory leaks
    if (pdfBlobUrl) {
      URL.revokeObjectURL(pdfBlobUrl);
      setPdfBlobUrl(null);
    }
    setPdfError("");
  };

  // When the step becomes "pdf", fetch the PDF with credentials so the auth
  // cookie is sent, then create a local blob URL for the iframe.
  // Using fetch() instead of an iframe src ensures cookies are sent cross-origin.
  useEffect(() => {
    const bookId = book._id || book.id;
    if (modalStep === "pdf" && bookId && !pdfBlobUrl && !pdfLoading) {
      setPdfLoading(true);
      setPdfError("");
      fetch(`${API_BASE}/books/${bookId}/preview-stream`, {
        credentials: "include"
      })
        .then(async (res) => {
          if (!res.ok) {
            // Try to parse error JSON; fall back to a generic message
            const contentType = res.headers.get("content-type") || "";
            if (contentType.includes("application/json")) {
              const d = await res.json();
              throw new Error(d.message || `Error ${res.status}: access denied.`);
            }
            throw new Error(
              res.status === 401
                ? "You are not logged in. Please register and verify your email."
                : res.status === 403
                ? "Access denied. Your purchase has not been approved yet."
                : `Server error (${res.status}). Please try again.`
            );
          }
          return res.blob();
        })
        .then((blob) => {
          const url = URL.createObjectURL(blob);
          setPdfBlobUrl(url);
        })
        .catch((err) => {
          console.error("[PDF] Failed to load:", err);
          setPdfError(err.message || "Failed to load PDF. Access may not be approved yet.");
          // If access is denied, push user back to pending screen
          setModalStep("pending");
        })
        .finally(() => setPdfLoading(false));
    }
  }, [modalStep]);

  const cleanPrice = typeof book.price === "number" ? book.price : String(book.price).replace(/[^0-9]/g, "");
  const upiUrl = `upi://pay?pa=${upiConfig.upiId}&pn=Lekhak%20Tripura&am=${cleanPrice}&cu=INR&tn=Ebook%20Access%20Request`;
  const isMobile = typeof navigator !== "undefined" && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  return (
    <>
      <motion.article
        className="premium-book-card group relative overflow-hidden rounded-lg p-4 animate-fade-in"
        whileHover={{ y: -10, rotateX: 4, rotateY: -4, scale: 1.02 }}
        transition={{ type: "spring", stiffness: 220, damping: 18 }}
      >
        <div className="book-cover-frame relative mb-5 aspect-[3/4] overflow-hidden rounded-md bg-zinc-900">
          {book.cover?.url ? (
            <img
              src={book.cover.url.startsWith("http") ? book.cover.url : `${SERVER_URL}${book.cover.url}`}
              alt={book.title}
              className="h-full w-full object-cover transition duration-700 group-hover:scale-105 group-hover:saturate-[1.08]"
            />
          ) : (
            <div className={`h-full w-full bg-gradient-to-br ${book.gradient || "from-cyan-400 to-indigo-600"} p-5 relative flex flex-col justify-between`}>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.5),transparent_26%)]" />
              <div className="relative flex h-full flex-col justify-between rounded border border-white/[0.24] p-4 text-white">
                <p className="text-xs uppercase tracking-[0.32em]">{book.category}</p>
                <h3 className="text-3xl font-semibold leading-none">{book.title}</h3>
                <p className="text-sm text-white/75">{book.author}</p>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="truncate text-xl font-semibold text-white transition-colors duration-300 group-hover:text-cyan-50">{book.title}</h3>
            <p className="mt-1 text-sm text-white/[0.52]">{book.author}</p>
          </div>
          <p className="shrink-0 text-lg font-semibold text-cyan-200 drop-shadow-[0_0_14px_rgba(103,232,249,0.45)]">
            {formatPrice(book.price)}
          </p>
        </div>
        <div className="mt-4 flex items-center justify-between text-sm text-white/[0.58]">
          <span className="book-rating-pill flex items-center gap-1 text-amber-100"><Star size={14} fill="currentColor" /> {book.rating || "4.9"}</span>
          <span>{book.pages} pages</span>
        </div>
        <button 
          onClick={handleOpenPreview}
          className="book-card-action mt-5 flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-black opacity-0 transition group-hover:opacity-100 hover:scale-[1.03] active:scale-[0.98]"
        >
          Open Preview <ArrowUpRight size={15} />
        </button>
      </motion.article>

      {/* Gated Preview Modal Overlay */}
      <AnimatePresence>
        {showReader && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className={`relative flex max-h-[90vh] w-full flex-col rounded-3xl border border-white/10 bg-zinc-950 p-6 shadow-glow overflow-hidden transition-all duration-350 ${
                modalStep === "pdf"
                  ? "max-w-6xl h-[88vh] md:h-[90vh] md:p-5"
                  : modalStep === "details"
                  ? "max-w-3xl"
                  : "max-w-xl"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">{book.title}</h3>
                  <p className="text-xs text-white/50">by {book.author} — Preview Access</p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="rounded-full p-2 text-white/50 hover:bg-white/10 hover:text-white transition"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Error Alert */}
              {errorMsg && (
                <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-xs text-red-300">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Steps Container */}
              <div className={`flex-1 min-h-0 ${modalStep === "pdf" ? "flex flex-col h-full" : "overflow-y-auto pr-2"}`}>
                
                {/* 0. BOOK DETAILS & ACTIONS */}
                {modalStep === "details" && (
                  <div className="flex flex-col md:flex-row gap-6 py-2">
                    {/* Cover */}
                    <div className="w-full md:w-1/3 shrink-0">
                      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-zinc-900 border border-white/5 shadow-2xl">
                        {book.cover?.url ? (
                          <img
                            src={book.cover.url.startsWith("http") ? book.cover.url : `${SERVER_URL}${book.cover.url}`}
                            alt={book.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className={`h-full w-full bg-gradient-to-br ${book.gradient || "from-cyan-400 to-indigo-600"} p-4 flex flex-col justify-between text-white`}>
                            <p className="text-[10px] uppercase tracking-[0.2em]">{book.category}</p>
                            <h4 className="text-xl font-bold leading-tight">{book.title}</h4>
                            <p className="text-xs text-white/70">{book.author}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Content details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="space-y-4">
                        {/* Category & Stats */}
                        <div className="flex flex-wrap gap-2 items-center text-xs">
                          <span className="rounded-full bg-cyan-400/10 px-2.5 py-1 text-cyan-300 font-semibold">{book.category}</span>
                          <span className="text-white/40">•</span>
                          <span className="text-white/60">{book.pages} pages</span>
                          <span className="text-white/40">•</span>
                          <span className="book-rating-pill flex items-center gap-1 text-amber-100"><Star size={12} fill="currentColor" /> {book.rating || "4.9"}</span>
                          <span className="text-white/40">•</span>
                          <span className="text-white/60">{book.language || "English"}</span>
                        </div>

                        {/* Title & Price */}
                        <div>
                          <h4 className="text-2xl font-bold text-white leading-tight">{book.title}</h4>
                          <p className="text-sm text-white/50 mt-1">by {book.author}</p>
                          <div className="mt-2 text-2xl font-bold text-cyan-300">
                            {formatPrice(book.price)}
                          </div>
                        </div>

                        {/* Description */}
                        <div className="max-h-[180px] overflow-y-auto pr-1 text-xs text-white/60 leading-relaxed custom-scrollbar">
                          <p className="whitespace-pre-line">{book.description}</p>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="mt-6 border-t border-white/5 pt-4">
                        {accessCheckLoading ? (
                          <button disabled className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/10 py-3.5 text-sm font-semibold text-white/40">
                            <Loader2 className="h-4 w-4 animate-spin" /> Verifying Access...
                          </button>
                        ) : accessStatus === "approved" ? (
                          <button
                            onClick={() => setModalStep("pdf")}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 py-3.5 text-sm font-bold text-black hover:scale-[1.01] transition shadow-lg shadow-cyan-500/10"
                          >
                            Start Reading Ebook Now
                          </button>
                        ) : accessStatus === "pending" ? (
                          <button
                            onClick={() => setModalStep("pending")}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400/10 border border-amber-400/20 py-3.5 text-sm font-bold text-amber-300 hover:bg-amber-400/20 transition"
                          >
                            Access Request Pending (View Details)
                          </button>
                        ) : (
                          <button
                            onClick={handleDetailsPurchaseAction}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3.5 text-sm font-bold text-black hover:bg-cyan-50 transition"
                          >
                            Purchase Now for {formatPrice(book.price)}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* 1. CHECKING ACCESS */}
                {modalStep === "checking" && (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-cyan-400 mb-4" />
                    <p className="text-white/60 text-sm">Verifying access rights...</p>
                  </div>
                )}

                {/* 2. REGISTRATION FORM */}
                {modalStep === "register" && (
                  <form onSubmit={handleRegister} className="space-y-4 py-2">
                    <div className="mb-2">
                      <h4 className="text-md font-semibold text-white">Step 1: Reader Registration</h4>
                      <p className="text-xs text-white/45 mt-1">Please register your details below before previewing the book.</p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-white/50 mb-1.5">Full Name *</label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. John Doe"
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs text-white placeholder-white/20 focus:border-cyan-400/40 focus:bg-white/10 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-white/50 mb-1.5">Email Address *</label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="e.g. name@domain.com"
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs text-white placeholder-white/20 focus:border-cyan-400/40 focus:bg-white/10 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-white/50 mb-1.5">C/O (Care Of) *</label>
                        <input
                          type="text"
                          required
                          value={co}
                          onChange={(e) => setCo(e.target.value)}
                          placeholder="e.g. S/O Mr. Smith"
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs text-white placeholder-white/20 focus:border-cyan-400/40 focus:bg-white/10 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-white/50 mb-1.5">Phone Number *</label>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="e.g. +91 9876543210"
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs text-white placeholder-white/20 focus:border-cyan-400/40 focus:bg-white/10 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-white/50 mb-1.5">Country *</label>
                        <input
                          type="text"
                          required
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs text-white focus:border-cyan-400/40 focus:bg-white/10 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-white/50 mb-1.5">District *</label>
                        <input
                          type="text"
                          required
                          value={district}
                          onChange={(e) => setDistrict(e.target.value)}
                          placeholder="e.g. West Tripura"
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs text-white placeholder-white/20 focus:border-cyan-400/40 focus:bg-white/10 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-white/50 mb-1.5">Block *</label>
                        <input
                          type="text"
                          required
                          value={block}
                          onChange={(e) => setBlock(e.target.value)}
                          placeholder="e.g. Jirania"
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs text-white placeholder-white/20 focus:border-cyan-400/40 focus:bg-white/10 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-white/50 mb-1.5">Pin Code *</label>
                        <input
                          type="text"
                          required
                          value={pin}
                          onChange={(e) => setPin(e.target.value)}
                          placeholder="e.g. 799001"
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs text-white placeholder-white/20 focus:border-cyan-400/40 focus:bg-white/10 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-white/50 mb-1.5">Post Office *</label>
                        <input
                          type="text"
                          required
                          value={postOffice}
                          onChange={(e) => setPostOffice(e.target.value)}
                          placeholder="e.g. Agartala College"
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs text-white placeholder-white/20 focus:border-cyan-400/40 focus:bg-white/10 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-white/50 mb-1.5">Nearby Location *</label>
                        <input
                          type="text"
                          required
                          value={nearbyLocation}
                          onChange={(e) => setNearbyLocation(e.target.value)}
                          placeholder="e.g. Near MBB College, opposite SBI bank"
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs text-white placeholder-white/20 focus:border-cyan-400/40 focus:bg-white/10 focus:outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-semibold text-black transition-all hover:scale-[1.01] disabled:opacity-50 mt-6"
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Request Verification OTP"}
                    </button>
                  </form>
                )}

                {/* 3. OTP VERIFICATION */}
                {modalStep === "otp" && (
                  <form onSubmit={handleVerifyOtp} className="space-y-4 py-8 max-w-sm mx-auto text-center">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-400/10 text-cyan-300 mx-auto mb-4">
                      <Mail size={24} />
                    </div>
                    <div>
                      <h4 className="text-md font-semibold text-white">Step 2: Verify Your Email</h4>
                      <p className="text-xs text-white/55 mt-1.5 leading-relaxed">
                        We have dispatched a 6-digit login verification OTP to <strong className="text-cyan-300">{email}</strong>.
                      </p>
                    </div>

                    <div>
                      <input
                        type="text"
                        required
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="Enter 6-digit OTP"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-md font-semibold tracking-widest text-white placeholder-white/20 focus:border-cyan-400/40 focus:bg-white/10 focus:outline-none"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setModalStep("register")}
                        className="w-1/3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-semibold text-white transition hover:bg-white/10"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-semibold text-black transition-all hover:scale-[1.01] disabled:opacity-50"
                      >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify & Continue"}
                      </button>
                    </div>
                  </form>
                )}

                {/* 4. PAYMENT FORM */}
                {modalStep === "pay" && (
                  <form onSubmit={handleSubmitPayment} className="space-y-5 py-2">
                    <div>
                      <h4 className="text-md font-semibold text-white">Step 3: Purchase Ebook</h4>
                      <p className="text-xs text-white/45 mt-1">To gain full access to <span className="text-white font-medium">{book.title}</span>, pay the amount below via UPI.</p>
                    </div>

                    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-white/40">Amount to Pay</p>
                        <p className="text-2xl font-bold text-cyan-300 mt-0.5">{formatPrice(book.price)}</p>
                      </div>
                      <div className="text-right">
                        <span className="inline-block rounded-full bg-cyan-400/10 px-3 py-1 text-[10px] font-semibold text-cyan-300">
                          Instant Review
                        </span>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      {/* Left: UPI details */}
                      <div className="rounded-2xl border border-white/5 bg-white/5 p-4 flex flex-col justify-between min-h-[220px]">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40">Scan QR Code or Pay UPI ID</p>
                          <div className="my-4 flex items-center justify-center">
                            {upiConfig.upiQrImageUrl ? (
                              <img 
                                src={upiConfig.upiQrImageUrl.startsWith("http") ? upiConfig.upiQrImageUrl : `http://localhost:5000${upiConfig.upiQrImageUrl}`} 
                                alt="UPI QR" 
                                className="h-32 w-32 object-contain rounded-xl border border-white/10 bg-white p-1" 
                              />
                            ) : (
                              <img 
                                src="/Gpay-QR.jpeg" 
                                alt="UPI QR" 
                                className="h-32 w-32 object-contain rounded-xl border border-white/10 bg-white p-1" 
                              />
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between rounded-xl bg-black/40 border border-white/5 px-3 py-2">
                          <span className="font-mono text-[11px] text-cyan-300 truncate select-all">{upiConfig.upiId}</span>
                          <button 
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(upiConfig.upiId);
                              setCopySuccess(true);
                              setTimeout(() => setCopySuccess(false), 2000);
                            }}
                            className="text-[10px] text-white/60 hover:text-white transition flex items-center gap-1 shrink-0 ml-2"
                          >
                            {copySuccess ? "Copied" : <Copy size={12} />}
                          </button>
                        </div>
                      </div>

                      {/* Right: Payment instructions */}
                      <div className="rounded-2xl border border-white/5 bg-white/5 p-4 flex flex-col justify-between min-h-[220px]">
                        <div className="space-y-3">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40">Payment Actions</p>
                          
                          {isMobile ? (
                            <a
                              href={upiUrl}
                              className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 py-3 text-xs font-semibold text-black hover:bg-cyan-300 transition"
                            >
                              <Smartphone size={14} /> Pay with UPI App
                            </a>
                          ) : (
                            <div className="rounded-xl bg-white/5 border border-white/5 p-3 text-xs text-white/60 leading-relaxed">
                              Open your mobile payments app (GPay, PhonePe, Paytm, etc.) and pay to the UPI ID or scan the QR.
                            </div>
                          )}

                          <div className="pt-2">
                            <label className="block text-[10px] font-semibold uppercase tracking-wider text-white/50 mb-1.5">UPI Transaction Reference Number *</label>
                            <input
                              type="text"
                              required
                              value={transactionNumber}
                              onChange={(e) => setTransactionNumber(e.target.value.replace(/[^0-9]/g, ""))}
                              placeholder="e.g. 12-digit transaction number"
                              className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs text-white placeholder-white/20 focus:border-cyan-400/40 focus:bg-white/10 focus:outline-none"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-semibold text-black transition-all hover:scale-[1.01] disabled:opacity-50 mt-4"
                        >
                          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Transaction Code"}
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                {/* 5. ACCESS PENDING */}
                {modalStep === "pending" && (
                  <div className="py-12 text-center max-w-md mx-auto space-y-4">
                    <div className="grid h-16 w-16 place-items-center rounded-full bg-amber-400/10 text-amber-300 mx-auto">
                      <ShieldCheck size={32} />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white">Purchase Review In Progress</h4>
                      <p className="text-xs text-white/60 mt-2 leading-relaxed">
                        Your transaction reference code has been recorded. Admin is checking the payment details. Once verified, your ebook access will be activated immediately.
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-white/5 p-4 text-left space-y-1.5">
                      <p className="text-[10px] uppercase text-white/40">Registered Email</p>
                      <p className="text-xs font-medium text-white">{email || "Your registered email"}</p>
                      <div className="h-px bg-white/5 my-2" />
                      <p className="text-[10px] uppercase text-white/40">Payment reference</p>
                      <p className="text-xs font-mono text-cyan-300">{transactionNumber || "Review code pending"}</p>
                    </div>
                    <button
                      onClick={handleCloseModal}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-semibold text-white hover:bg-white/10 transition mt-4"
                    >
                      Close Window
                    </button>
                  </div>
                )}

                {/* 6. SECURE EMBED AREA (PDF PREVIEW) */}
                {modalStep === "pdf" && (
                  <div 
                    className="relative flex-1 w-full overflow-hidden rounded-2xl border border-white/5 bg-[#151515] flex flex-col"
                    onContextMenu={(e) => e.preventDefault()}
                  >
                    {pdfLoading && (
                      <div className="flex h-full flex-col items-center justify-center gap-3 text-white/40">
                        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
                        <p className="text-xs">Loading your ebook securely...</p>
                      </div>
                    )}
                    {!pdfLoading && pdfError && (
                      <div className="flex h-full flex-col items-center justify-center gap-3 text-red-300 px-6 text-center">
                        <AlertCircle className="h-8 w-8" />
                        <p className="text-sm">{pdfError}</p>
                      </div>
                    )}
                    {!pdfLoading && pdfBlobUrl && (
                      <iframe
                        src={`${pdfBlobUrl}#toolbar=0&navpanes=0`}
                        className="h-full w-full border-0 rounded-2xl select-none flex-1"
                        title={book.title}
                      />
                    )}
                    {/* Overlay to disable context menus & right-click on PDF */}
                    <div 
                      className="absolute inset-0 bg-transparent pointer-events-none"
                      onContextMenu={(e) => e.preventDefault()}
                    />
                  </div>
                )}

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth gate: shown when unauthenticated user clicks Open Preview */}
      {showAuthModal && (
        <AuthModal
          initialTab="login"
          onClose={(user) => {
            setShowAuthModal(false);
            if (user) {
              // Re-run the preview check now that they're logged in
              handleOpenPreview({ stopPropagation: () => {} });
            }
          }}
        />
      )}
    </>
  );
}



