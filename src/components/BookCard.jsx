import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Star, Loader2, AlertCircle, CheckCircle2, Copy, Smartphone, Mail, KeyRound, ShieldCheck, Coins, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { API_BASE, SERVER_URL } from "../config.js";
import AuthModal from "./AuthModal.jsx";

export default function BookCard({ book, onAuthorClick, isAuthorActive = false }) {
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
  const [authReturnAction, setAuthReturnAction] = useState("ebook");
  const [accessStatus, setAccessStatus] = useState("loading"); // 'loading', 'unauthenticated', 'no_purchase', 'pending', 'approved'
  const [accessCheckLoading, setAccessCheckLoading] = useState(true);
  const [showPhysicalOrder, setShowPhysicalOrder] = useState(false);
  const [physicalFormat, setPhysicalFormat] = useState("paperback");
  const [selectedFormat, setSelectedFormat] = useState("ebook");
  const [physicalLoading, setPhysicalLoading] = useState(false);
  const [physicalError, setPhysicalError] = useState("");
  const [physicalSuccess, setPhysicalSuccess] = useState("");
  const [deliveryForm, setDeliveryForm] = useState({
    co: "",
    country: "India",
    district: "",
    block: "",
    pin: "",
    postOffice: "",
    nearbyLocation: ""
  });


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
  const [upiConfig, setUpiConfig] = useState({ upiId: "pritamchakrabrty@slc", upiQrImageUrl: "" });

  const formatPrice = (price) => {
    if (typeof price === "number") return `₹${price}`;
    return String(price || "").replace("$", "₹");
  };

  const handleOpenPreview = async (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    
    // Show Details modal immediately!
    setShowReader(true);
    setModalStep("details");
    setSelectedFormat("ebook");
    setAccessCheckLoading(true);
    setAccessStatus("loading");
    setErrorMsg("");

    // Coming Soon books — skip all access checks, no purchase possible
    if (book.comingSoon) {
      setAccessStatus("coming_soon");
      setAccessCheckLoading(false);
      return;
    }
    
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
      setAuthReturnAction("ebook");
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
              upiId: data.upiId || "pritamchakrabrty@slc",
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
  const openPhysicalOrder = async (format) => {
    setPhysicalFormat(format);
    setPhysicalError("");
    setPhysicalSuccess("");

    try {
      const res = await fetch(`${API_BASE}/auth/me`, { credentials: "include" });
      if (!res.ok) {
        setAuthReturnAction(`physical:${format}`);
        setShowAuthModal(true);
        return;
      }
      setShowPhysicalOrder(true);
    } catch {
      setPhysicalError("Could not check your login status. Please try again.");
      setShowPhysicalOrder(true);
    }
  };

  const submitPhysicalOrder = async (e) => {
    e.preventDefault();
    setPhysicalLoading(true);
    setPhysicalError("");
    setPhysicalSuccess("");

    try {
      const formData = new FormData();
      formData.append("bookId", book._id || book.id);
      formData.append("format", physicalFormat);
      formData.append("note", `${physicalFormat} delivery request for ${book.title}`);
      Object.entries(deliveryForm).forEach(([key, value]) => formData.append(key, value));

      const res = await fetch(`${API_BASE}/purchase`, {
        method: "POST",
        body: formData,
        credentials: "include"
      });
      const data = await res.json();

      if (res.status === 401) {
        setShowPhysicalOrder(false);
        setAuthReturnAction(`physical:${physicalFormat}`);
        setShowAuthModal(true);
        return;
      }

      if (data.success) {
        setPhysicalSuccess(data.adminEmailSent ? `Your ${physicalFormat} request has been submitted and mailed to admin.` : `Your ${physicalFormat} request has been submitted. Admin email could not be confirmed.`);
      } else {
        setPhysicalError(data.message || "Could not submit delivery request.");
      }
    } catch {
      setPhysicalError("Could not submit delivery request.");
    } finally {
      setPhysicalLoading(false);
    }
  };

  return (
    <>
      <motion.article
        className="premium-book-card group relative overflow-hidden rounded-lg p-3 animate-fade-in cursor-pointer select-none"
        whileHover={{ y: -10, rotateX: 4, rotateY: -4, scale: 1.02 }}
        transition={{ type: "spring", stiffness: 220, damping: 18 }}
        onClick={handleOpenPreview}
      >
        <div className="book-cover-frame relative mb-3 aspect-[3/4] overflow-hidden rounded-md bg-zinc-900 shadow-md">
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
          {/* Hover overlay details button */}
          <div className="absolute inset-0 bg-black/60 opacity-0 transition-all duration-300 group-hover:opacity-100 flex items-center justify-center pointer-events-none">
            <span className="rounded-full bg-white/95 px-5 py-2.5 text-[11px] font-extrabold uppercase tracking-wider text-black shadow-glow transform translate-y-3 transition-all duration-300 group-hover:translate-y-0">
              Preview Ebook
            </span>
          </div>
          {/* Coming Soon badge */}
          {book.comingSoon && (
            <div className="absolute top-2 right-2 z-10 rounded-full bg-amber-400/90 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest text-black shadow-lg">
              Coming Soon
            </div>
          )}
        </div>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="truncate text-base font-bold text-white transition-colors duration-300 group-hover:text-cyan-50">{book.title}</h3>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAuthorClick?.(book.author);
              }}
              className={`mt-1 max-w-full truncate text-left text-xs font-semibold transition ${
                isAuthorActive
                  ? "text-fuchsia-200 drop-shadow-[0_0_14px_rgba(217,70,239,0.48)]"
                  : "text-cyan-200/85 hover:text-fuchsia-200 hover:drop-shadow-[0_0_12px_rgba(34,211,238,0.5)]"
              }`}
            >
              {book.author}
            </button>
          </div>
          <p className="shrink-0 text-sm font-bold text-cyan-200 drop-shadow-[0_0_14px_rgba(103,232,249,0.45)]">
            {formatPrice(book.price)}
          </p>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-white/[0.58]">
          <span className="book-rating-pill flex items-center gap-1 text-amber-100"><Star size={12} fill="currentColor" /> {book.rating || "4.9"}</span>
          <span>{book.pages} pages</span>
        </div>
      </motion.article>

      {/* Gated Preview Modal Overlay */}
      {createPortal(
        <AnimatePresence>
          {showReader && (
            <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
            onClick={handleCloseModal}
            data-lenis-prevent
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
              data-lenis-prevent
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
              <div className={`flex-1 min-h-0 ${modalStep === "pdf" ? "flex flex-col h-full" : "overflow-y-auto pr-2"}`} data-lenis-prevent>
                
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
                            {selectedFormat === "paperback" && book.paperbackPrice && Number(book.paperbackPrice) > 0
                              ? formatPrice(book.paperbackPrice)
                              : selectedFormat === "hardcover" && book.hardcoverPrice && Number(book.hardcoverPrice) > 0
                              ? formatPrice(book.hardcoverPrice)
                              : formatPrice(book.price)}
                          </div>
                        </div>

                        {/* Description */}
                        <div className="max-h-[180px] overflow-y-auto pr-1 text-xs text-white/60 leading-relaxed custom-scrollbar">
                          <p className="whitespace-pre-line">{book.description}</p>
                        </div>
                      </div>

                      {/* Available Formats Grid */}
                      <div className="mt-6 border-t border-white/5 pt-4">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40 mb-3">Available Formats</p>
                        <div className="grid grid-cols-2 gap-3">
                          {/* E-BOOK */}
                          {book.comingSoon || accessStatus === "coming_soon" ? (
                            <div className="col-span-2 flex flex-col items-center justify-center gap-2 rounded-xl border border-amber-400/25 bg-amber-400/5 py-4 px-3">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300/60">E-Book</span>
                              <span className="text-sm font-extrabold text-amber-300">⏳ Coming Soon</span>
                              <span className="text-[10px] text-white/35 text-center">The digital edition of this book is not available yet. Stay tuned!</span>
                            </div>
                          ) : accessCheckLoading ? (
                            <button disabled className="flex items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/10 py-3 text-xs font-semibold text-white/40">
                              <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-400" /> Verifying Access...
                            </button>
                          ) : accessStatus === "approved" ? (
                            <button
                              type="button"
                              onClick={() => { setSelectedFormat("ebook"); setModalStep("pdf"); }}
                              className={`flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold transition shadow-lg ${
                                selectedFormat === "ebook"
                                  ? "bg-white text-black"
                                  : "bg-gradient-to-r from-cyan-400 to-indigo-500 text-black hover:scale-[1.01]"
                              }`}
                            >
                              Read E-Book
                            </button>
                          ) : accessStatus === "pending" ? (
                            <button
                              type="button"
                              onClick={() => { setSelectedFormat("ebook"); setModalStep("pending"); }}
                              className="flex items-center justify-center gap-2 rounded-xl bg-amber-400/10 border border-amber-400/20 py-3 text-xs font-bold text-amber-300 hover:bg-amber-400/20 transition"
                            >
                              E-Book Pending
                            </button>
                          ) : !book.price || Number(book.price) <= 0 ? (
                            <button
                              type="button"
                              disabled
                              className="book-format-button flex items-center justify-center rounded-xl border border-white/5 bg-white/[0.02] py-3 text-xs font-semibold uppercase tracking-[0.04em] text-white/40 cursor-not-allowed"
                            >
                              E-Book
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedFormat("ebook");
                                handleDetailsPurchaseAction();
                              }}
                              className={`flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold transition ${
                                selectedFormat === "ebook"
                                  ? "bg-white text-black"
                                  : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
                              }`}
                            >
                              E-Book ({formatPrice(book.price)})
                            </button>
                          )}

                          {/* Paperback */}
                          {book.paperbackPrice && Number(book.paperbackPrice) > 0 ? (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedFormat("paperback");
                                openPhysicalOrder("paperback");
                              }}
                              className={`book-format-button book-format-button-active flex items-center justify-center rounded-xl border py-3 text-xs font-bold uppercase tracking-[0.04em] transition ${
                                selectedFormat === "paperback"
                                  ? "bg-white text-black border-white"
                                  : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
                              }`}
                            >
                              Paperback ({formatPrice(book.paperbackPrice)})
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled
                              className="book-format-button flex items-center justify-center rounded-xl border border-white/5 bg-white/[0.02] py-3 text-xs font-semibold uppercase tracking-[0.04em] text-white/40 cursor-not-allowed"
                              title="Paperback edition is not available for this book"
                            >
                              Paperback
                            </button>
                          )}

                          {/* Hardcover */}
                          {book.hardcoverPrice && Number(book.hardcoverPrice) > 0 ? (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedFormat("hardcover");
                                openPhysicalOrder("hardcover");
                              }}
                              className={`book-format-button book-format-button-active flex items-center justify-center rounded-xl border py-3 text-xs font-bold uppercase tracking-[0.04em] transition ${
                                selectedFormat === "hardcover"
                                  ? "bg-white text-black border-white"
                                  : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
                              }`}
                            >
                              Hardcover ({formatPrice(book.hardcoverPrice)})
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled
                              className="book-format-button flex items-center justify-center rounded-xl border border-white/5 bg-white/[0.02] py-3 text-xs font-semibold uppercase tracking-[0.04em] text-white/40 cursor-not-allowed"
                              title="Hardcover edition is not available for this book"
                            >
                              Hardcover
                            </button>
                          )}

                          {/* Listen in YouTube */}
                          {book.listenInYoutube ? (
                            <a
                              href={book.youtubeLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="book-format-button book-format-button-active flex items-center justify-center rounded-xl border border-white/10 bg-white/5 py-3 text-xs font-bold uppercase tracking-[0.04em] text-white/80 transition hover:bg-white/10 hover:text-white"
                            >
                              Listen in YouTube
                            </a>
                          ) : (
                            <button
                              type="button"
                              disabled
                              className="book-format-button flex items-center justify-center rounded-xl border border-white/5 bg-white/[0.02] py-3 text-xs font-semibold uppercase tracking-[0.04em] text-white/40 cursor-not-allowed"
                              title="YouTube listening option is not available yet"
                            >
                              Listen in YouTube
                            </button>
                          )}
                        </div>
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
                                src="/QR.jpeg" 
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
      </AnimatePresence>,
      document.body
    )}

    {createPortal(
      <AnimatePresence>
        {showPhysicalOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
            onClick={() => setShowPhysicalOrder(false)}
          >
            <motion.form
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onSubmit={submitPhysicalOrder}
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-zinc-950 p-6 shadow-glow custom-scrollbar"
            >
              <div className="mb-5 flex items-start justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-300">Delivery Request</p>
                  <h3 className="mt-1 text-xl font-bold capitalize text-white">{physicalFormat} order</h3>
                  <p className="mt-1 text-xs text-white/45">{book.title}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPhysicalOrder(false)}
                  className="rounded-full p-2 text-white/50 transition hover:bg-white/10 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              {physicalError && (
                <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-xs text-red-300">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{physicalError}</span>
                </div>
              )}

              {physicalSuccess && (
                <div className="mb-4 flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-xs text-emerald-300">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{physicalSuccess}</span>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-white/50">C/O (Care Of)</label>
                  <input value={deliveryForm.co} onChange={(e) => setDeliveryForm((f) => ({ ...f, co: e.target.value }))} placeholder="S/O Mr. Smith" className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs text-white placeholder-white/20 focus:border-cyan-400/40 focus:bg-white/10 focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-white/50">Country</label>
                  <input value={deliveryForm.country} onChange={(e) => setDeliveryForm((f) => ({ ...f, country: e.target.value }))} className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs text-white focus:border-cyan-400/40 focus:bg-white/10 focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-white/50">District *</label>
                  <input required value={deliveryForm.district} onChange={(e) => setDeliveryForm((f) => ({ ...f, district: e.target.value }))} placeholder="West Tripura" className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs text-white placeholder-white/20 focus:border-cyan-400/40 focus:bg-white/10 focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-white/50">Block *</label>
                  <input required value={deliveryForm.block} onChange={(e) => setDeliveryForm((f) => ({ ...f, block: e.target.value }))} placeholder="Jirania" className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs text-white placeholder-white/20 focus:border-cyan-400/40 focus:bg-white/10 focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-white/50">PIN Code *</label>
                  <input required value={deliveryForm.pin} onChange={(e) => setDeliveryForm((f) => ({ ...f, pin: e.target.value.replace(/[^0-9]/g, "") }))} placeholder="799001" className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs text-white placeholder-white/20 focus:border-cyan-400/40 focus:bg-white/10 focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-white/50">Post Office</label>
                  <input value={deliveryForm.postOffice} onChange={(e) => setDeliveryForm((f) => ({ ...f, postOffice: e.target.value }))} placeholder="Jirania P.O." className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs text-white placeholder-white/20 focus:border-cyan-400/40 focus:bg-white/10 focus:outline-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-white/50">Nearby Landmark *</label>
                  <input required value={deliveryForm.nearbyLocation} onChange={(e) => setDeliveryForm((f) => ({ ...f, nearbyLocation: e.target.value }))} placeholder="Near SBI Bank, school, temple, etc." className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs text-white placeholder-white/20 focus:border-cyan-400/40 focus:bg-white/10 focus:outline-none" />
                </div>
              </div>

              <button
                type="submit"
                disabled={physicalLoading || Boolean(physicalSuccess)}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-bold text-black transition hover:bg-cyan-50 disabled:opacity-50"
              >
                {physicalLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : physicalSuccess ? "Request Submitted" : "Submit Delivery Request"}
              </button>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
    )}
      {/* Auth gate: shown when unauthenticated user clicks E-BOOK */}
      {showAuthModal && createPortal(
        <AuthModal
          initialTab="login"
          onClose={(user) => {
            setShowAuthModal(false);
            if (!user) return;

            if (authReturnAction.startsWith("physical:")) {
              const format = authReturnAction.split(":")[1] || "paperback";
              setPhysicalFormat(format);
              setPhysicalError("");
              setPhysicalSuccess("");
              setShowPhysicalOrder(true);
              return;
            }

            handleOpenPreview({ stopPropagation: () => {} });
          }}
        />,
        document.body
      )}
    </>
  );
}














