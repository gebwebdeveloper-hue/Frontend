import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, BookOpen, Clock, AlertTriangle, ShieldCheck, MapPin, Loader2,
  ArrowRight, User, Phone, Mail, Home, Building2, Store, CreditCard,
  ArrowLeft, CheckCircle2, Shield, FileText, Upload, Calendar, Compass
} from "lucide-react";
import { API_BASE, SERVER_URL } from "../config.js";
import { loadRazorpayScript } from "../utils/razorpay.js";

const SELF_PICKUP_ADDRESS = "Madhuban kathaltali, Tarader Thikana, Agartala, Tripura 799003";

const INDIAN_STATES = [
  "Tripura",
  "Assam",
  "West Bengal",
  "Meghalaya",
  "Mizoram",
  "Manipur",
  "Nagaland",
  "Arunachal Pradesh",
  "Sikkim",
  "Bihar",
  "Jharkhand",
  "Odisha",
  "Delhi",
  "Karnataka",
  "Maharashtra",
  "Tamil Nadu",
  "Uttar Pradesh",
  "Other State"
];

const TRIPURA_DISTRICTS = [
  "West Tripura",
  "Dhalai",
  "Gomati",
  "Khowai",
  "North Tripura",
  "Sepahijala",
  "South Tripura",
  "Unakoti"
];

export default function RentalCheckoutModal({ book, isOpen, onClose, onSuccess }) {
  const [step, setStep] = useState("details"); // 'details' | 'payment'

  // User form details
  const [renterName, setRenterName] = useState("");
  const [renterPhone, setRenterPhone] = useState("");
  const [renterEmail, setRenterEmail] = useState("");
  const [dob, setDob] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [state, setState] = useState("Tripura");
  const [district, setDistrict] = useState("West Tripura");
  const [villageTown, setVillageTown] = useState("");
  const [postOffice, setPostOffice] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [policeStation, setPoliceStation] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [co, setCo] = useState("");

  // Library Card state
  const [userLibraryCard, setUserLibraryCard] = useState(null);
  const [libraryCardId, setLibraryCardId] = useState("");
  const [libraryCardPdfFile, setLibraryCardPdfFile] = useState(null);
  const [libraryCardPdfUrl, setLibraryCardPdfUrl] = useState("");
  const [buyingCard, setBuyingCard] = useState(false);
  const [isCardSuspended, setIsCardSuspended] = useState(false);
  const [cardError, setCardError] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    setStep("details");
    setError("");
    setCardError("");
    setIsCardSuspended(false);

    // Lock background scroll and pause Lenis smooth scroll
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
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

    // Fetch active library card for user
    fetch(`${API_BASE}/library-card/my-card`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success) {
          if (data.isSuspended) {
            setIsCardSuspended(true);
            setCardError("Access Revoked: Your Library Card access has been suspended by the administrator.");
          }
          if (data.hasCard && data.libraryCard) {
            setUserLibraryCard(data.libraryCard);
            setLibraryCardId(data.libraryCard.cardId);
            setLibraryCardPdfUrl(data.libraryCard.pdfUrl);
            if (data.libraryCard.dob) setDob(data.libraryCard.dob);
            if (data.libraryCard.fatherName) setFatherName(data.libraryCard.fatherName);
            if (data.libraryCard.state) setState(data.libraryCard.state);
            if (data.libraryCard.district) setDistrict(data.libraryCard.district);
            if (data.libraryCard.villageTown) setVillageTown(data.libraryCard.villageTown);
            if (data.libraryCard.postOffice) setPostOffice(data.libraryCard.postOffice);
            if (data.libraryCard.pinCode) setPinCode(data.libraryCard.pinCode);
            if (data.libraryCard.policeStation) setPoliceStation(data.libraryCard.policeStation);
            if (data.libraryCard.emergencyContact) setEmergencyContact(data.libraryCard.emergencyContact);
          } else {
            setUserLibraryCard(null);
          }
        }
      })
      .catch(() => {});

    return () => {
      document.body.style.overflow = prevBodyOverflow || "unset";
      document.documentElement.style.overflow = prevHtmlOverflow || "unset";
      if (window.lenis) window.lenis.start();
    };
  }, [isOpen]);

  if (!isOpen || !book) return null;

  const rentalPrice = book.rentalPrice || 50;
  const rentalDuration = book.rentalDurationDays || 15;
  const finePerDay = book.finePerDay || 5;

  // 18% GST Calculation for Rental
  const gstAmount = Number((rentalPrice * 0.18).toFixed(2));
  const totalAmount = Number((rentalPrice + gstAmount).toFixed(2));

  const today = new Date();
  const dueDate = new Date(today.getTime() + rentalDuration * 24 * 60 * 60 * 1000);
  const dueDateFormatted = dueDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Handle instant Library Card Purchase (₹1 Test Price)
  const handleBuyLibraryCard = async () => {
    setBuyingCard(true);
    setCardError("");

    if (!renterName.trim()) { setCardError("Please enter your Full Name."); setBuyingCard(false); return; }
    if (!renterPhone.trim() || renterPhone.length < 10) { setCardError("Please enter a valid 10-digit Phone Number."); setBuyingCard(false); return; }
    if (!dob.trim()) { setCardError("Please enter your Date of Birth (DOB)."); setBuyingCard(false); return; }
    if (!fatherName.trim()) { setCardError("Please enter Father's Name."); setBuyingCard(false); return; }
    if (!emergencyContact.trim()) { setCardError("Please enter Emergency Contact No."); setBuyingCard(false); return; }

    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error("Razorpay SDK failed to load. Please check internet connection.");
      }

      // 1. Create Library Card payment order
      const orderRes = await fetch(`${API_BASE}/library-card/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.success) {
        throw new Error(orderData.message || "Failed to create Library Card order.");
      }

      // 2. Launch Razorpay
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: "INR",
        name: "Lekhok Tripura Publishers",
        description: "Library Membership Card (₹1)",
        order_id: orderData.orderId,
        prefill: {
          name: renterName || user?.name || "",
          email: renterEmail || user?.email || "",
          contact: renterPhone || user?.phone || "",
        },
        theme: { color: "#34d399" },
        handler: async function (response) {
          try {
            const verifyRes = await fetch(`${API_BASE}/library-card/verify-payment`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                name: renterName,
                phone: renterPhone,
                dob,
                fatherName,
                state,
                district,
                villageTown,
                postOffice,
                pinCode,
                policeStation,
                emergencyContact,
                co,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              setUserLibraryCard(verifyData.libraryCard);
              setLibraryCardId(verifyData.libraryCard.cardId);
              setLibraryCardPdfUrl(verifyData.libraryCard.pdfUrl);
            } else {
              setCardError(verifyData.message || "Library Card verification failed.");
            }
          } catch {
            setCardError("Server connection error verifying Library Card.");
          } finally {
            setBuyingCard(false);
          }
        },
        modal: {
          onDismiss: function () {
            setBuyingCard(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setCardError(err.message || "Failed to purchase Library Card.");
      setBuyingCard(false);
    }
  };

  const handleProceedToPayment = (e) => {
    e.preventDefault();
    setError("");

    if (!renterName.trim()) { setError("Please enter your Full Name."); return; }
    if (!renterPhone.trim() || renterPhone.length < 10) { setError("Please enter a valid 10-digit Phone Number."); return; }
    if (!renterEmail.trim()) { setError("Please enter your Gmail / Email Address."); return; }
    if (!dob.trim()) { setError("Please enter your Date of Birth (DOB)."); return; }
    if (!fatherName.trim()) { setError("Please enter Father's Name."); return; }
    if (!district.trim()) { setError("Please enter District."); return; }
    if (!villageTown.trim()) { setError("Please enter Village / Town Name."); return; }
    if (!postOffice.trim()) { setError("Please enter Post Office."); return; }
    if (!pinCode.trim()) { setError("Please enter Pin Code."); return; }
    if (!policeStation.trim()) { setError("Please enter Police Station."); return; }
    if (!emergencyContact.trim()) { setError("Please enter Emergency Contact No."); return; }
    if (!libraryCardId.trim()) {
      setError("A valid Library Card ID is required. Please buy a card or enter your Library Card ID.");
      return;
    }

    setStep("payment");
  };

  const handleExecuteRazorpay = async () => {
    setLoading(true);
    setError("");

    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error("Razorpay SDK failed to load. Check your network connection.");
      }

      // 1. Create Rental Order
      const orderRes = await fetch(`${API_BASE}/rentals/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          bookId: book._id,
          renterName,
          renterPhone,
          renterEmail,
          co,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderData.success) {
        throw new Error(orderData.message || "Failed to initiate rental payment order.");
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
            name: renterName || user?.name || "",
            email: renterEmail || user?.email || "",
            contact: renterPhone || user?.phone || "",
          },
          theme: { color: "#10b981" },
          handler: async function (response) {
            await completeRentalVerification(response);
          },
          modal: {
            onDismiss: function () {
              setLoading(false);
              setError("Payment cancelled. Please complete payment to confirm your rental.");
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
      let res;
      if (libraryCardPdfFile) {
        const formData = new FormData();
        formData.append("bookId", book._id);
        formData.append("renterName", renterName);
        formData.append("renterPhone", renterPhone);
        formData.append("renterEmail", renterEmail);
        formData.append("dob", dob);
        formData.append("fatherName", fatherName);
        formData.append("state", state);
        formData.append("district", district);
        formData.append("villageTown", villageTown);
        formData.append("postOffice", postOffice);
        formData.append("pinCode", pinCode);
        formData.append("policeStation", policeStation);
        formData.append("emergencyContact", emergencyContact);
        formData.append("co", co || "");
        formData.append("libraryCardId", libraryCardId);
        if (paymentData.razorpay_order_id) formData.append("razorpay_order_id", paymentData.razorpay_order_id);
        if (paymentData.razorpay_payment_id) formData.append("razorpay_payment_id", paymentData.razorpay_payment_id);
        if (paymentData.razorpay_signature) formData.append("razorpay_signature", paymentData.razorpay_signature);
        formData.append("libraryCardPdf", libraryCardPdfFile);

        res = await fetch(`${API_BASE}/rentals/verify-payment`, {
          method: "POST",
          credentials: "include",
          body: formData,
        });
      } else {
        res = await fetch(`${API_BASE}/rentals/verify-payment`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            bookId: book._id,
            renterName,
            renterPhone,
            renterEmail,
            dob,
            fatherName,
            state,
            district,
            villageTown,
            postOffice,
            pinCode,
            policeStation,
            emergencyContact,
            co,
            libraryCardId,
            libraryCardPdfUrl,
            razorpay_order_id: paymentData.razorpay_order_id,
            razorpay_payment_id: paymentData.razorpay_payment_id,
            razorpay_signature: paymentData.razorpay_signature,
          }),
        });
      }

      const data = await res.json();
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
          className="relative z-10 w-full max-w-[620px] rounded-3xl border border-emerald-400/30 bg-zinc-950 p-6 text-white shadow-2xl md:p-8 max-h-[88vh] overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-500/30 scrollbar-track-transparent my-auto"
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
                {step === "details" ? "1. Reader Member Details & Library Card" : "2. Razorpay Online Payment"}
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
                <span className="text-white/70 font-semibold">{rentalDuration} Days Duration</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-2xl border border-red-400/30 bg-red-950/40 p-3.5 text-xs text-red-300">
              <AlertTriangle size={16} className="shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: USER DETAILS & LIBRARY CARD */}
          {step === "details" && (
            <form onSubmit={handleProceedToPayment} className="space-y-4 text-xs">
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

              {/* SECTION 1: PERSONAL IDENTIFICATION */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
                <div className="text-xs font-black uppercase tracking-wider text-emerald-300 flex items-center gap-2">
                  <User size={14} /> Personal Identification
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {/* Name */}
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-white/75 mb-1">
                      Full Name *
                    </label>
                    <input
                      required
                      type="text"
                      value={renterName}
                      onChange={(e) => setRenterName(e.target.value)}
                      placeholder="Enter full name"
                      className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-xs text-white placeholder-white/30 outline-none focus:border-emerald-400"
                    />
                  </div>

                  {/* DOB */}
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-white/75 mb-1 flex items-center gap-1">
                      <Calendar size={11} className="text-emerald-400" /> DOB (Date of Birth) *
                    </label>
                    <input
                      required
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-xs text-white outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {/* Father's Name */}
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-white/75 mb-1">
                      Father's Name *
                    </label>
                    <input
                      required
                      type="text"
                      value={fatherName}
                      onChange={(e) => setFatherName(e.target.value)}
                      placeholder="Enter Father's Name"
                      className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-xs text-white placeholder-white/30 outline-none focus:border-emerald-400"
                    />
                  </div>

                  {/* Emergency Contact */}
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-white/75 mb-1 flex items-center gap-1">
                      <Phone size={11} className="text-amber-400" /> Emergency Contact No. *
                    </label>
                    <input
                      required
                      type="text"
                      value={emergencyContact}
                      onChange={(e) => setEmergencyContact(e.target.value.replace(/[^0-9]/g, "").slice(0, 10))}
                      placeholder="10-digit emergency phone"
                      className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-xs text-white placeholder-white/30 outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {/* Phone */}
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-white/75 mb-1">
                      Phone Number *
                    </label>
                    <input
                      required
                      type="text"
                      value={renterPhone}
                      onChange={(e) => setRenterPhone(e.target.value.replace(/[^0-9]/g, "").slice(0, 10))}
                      placeholder="10-digit phone number"
                      className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-xs text-white placeholder-white/30 outline-none focus:border-emerald-400"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-white/75 mb-1">
                      Gmail / Email Address *
                    </label>
                    <input
                      required
                      type="email"
                      value={renterEmail}
                      onChange={(e) => setRenterEmail(e.target.value)}
                      placeholder="your.email@gmail.com"
                      className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-xs text-white placeholder-white/30 outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: RESIDENTIAL & LOCATION DETAILS */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
                <div className="text-xs font-black uppercase tracking-wider text-cyan-300 flex items-center gap-2">
                  <Compass size={14} /> Residential &amp; Location Details
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {/* State Dropdown */}
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-white/75 mb-1">
                      State *
                    </label>
                    <select
                      value={state}
                      onChange={(e) => {
                        const newSt = e.target.value;
                        setState(newSt);
                        if (newSt === "Tripura") {
                          setDistrict("West Tripura");
                        } else {
                          setDistrict("");
                        }
                      }}
                      className="w-full rounded-xl border border-white/15 bg-zinc-900 px-3 py-2 text-xs text-white outline-none focus:border-emerald-400 cursor-pointer"
                    >
                      {INDIAN_STATES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* District Dropdown / Custom Input */}
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-white/75 mb-1">
                      District *
                    </label>
                    {state === "Tripura" ? (
                      <select
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full rounded-xl border border-white/15 bg-zinc-900 px-3 py-2 text-xs text-white outline-none focus:border-emerald-400 cursor-pointer"
                      >
                        {TRIPURA_DISTRICTS.map((dist) => (
                          <option key={dist} value={dist}>
                            {dist}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        required
                        type="text"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        placeholder="Enter District name"
                        className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-xs text-white placeholder-white/30 outline-none focus:border-emerald-400"
                      />
                    )}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {/* Vill/Town Name */}
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-white/75 mb-1">
                      Vill / Town Name *
                    </label>
                    <input
                      required
                      type="text"
                      value={villageTown}
                      onChange={(e) => setVillageTown(e.target.value)}
                      placeholder="Enter Village or Town"
                      className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-xs text-white placeholder-white/30 outline-none focus:border-emerald-400"
                    />
                  </div>

                  {/* Post Office */}
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-white/75 mb-1">
                      Post Office *
                    </label>
                    <input
                      required
                      type="text"
                      value={postOffice}
                      onChange={(e) => setPostOffice(e.target.value)}
                      placeholder="Enter Post Office"
                      className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-xs text-white placeholder-white/30 outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {/* Pin Code */}
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-white/75 mb-1">
                      Pin Code *
                    </label>
                    <input
                      required
                      type="text"
                      value={pinCode}
                      onChange={(e) => setPinCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                      placeholder="6-digit PIN code"
                      className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-xs text-white placeholder-white/30 outline-none focus:border-emerald-400"
                    />
                  </div>

                  {/* Police Station */}
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-white/75 mb-1">
                      Police Station *
                    </label>
                    <input
                      required
                      type="text"
                      value={policeStation}
                      onChange={(e) => setPoliceStation(e.target.value)}
                      placeholder="Enter Police Station"
                      className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-xs text-white placeholder-white/30 outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>
              </div>

              {/* LIBRARY CARD SECTION */}
              <div className="rounded-2xl border border-emerald-400/30 bg-emerald-950/30 p-4 space-y-3 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="text-emerald-400" size={18} />
                    <span className="font-extrabold text-white text-xs uppercase tracking-wider">
                      Library Membership Card *
                    </span>
                  </div>
                  {userLibraryCard && (
                    <span className="rounded-full bg-emerald-400/20 border border-emerald-400/30 px-2.5 py-0.5 text-[10px] font-black text-emerald-300">
                      ✓ Active Card
                    </span>
                  )}
                </div>

                {userLibraryCard ? (
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between rounded-xl bg-black/50 p-3 border border-white/10">
                      <div>
                        <span className="text-[10px] text-white/50 block font-bold">LIBRARY CARD ID</span>
                        <span className="font-black text-emerald-300 text-base tracking-wider">{userLibraryCard.cardId}</span>
                      </div>
                      <a
                        href={`${API_BASE}/library-card/download/${userLibraryCard.cardId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 rounded-xl border border-emerald-400/40 bg-emerald-400/10 px-3 py-2 text-[11px] font-bold text-emerald-300 hover:bg-emerald-400/20 transition"
                      >
                        <FileText size={14} /> View Card PDF
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <p className="text-[11px] text-white/70 leading-relaxed">
                      A valid <strong className="text-emerald-300">Library Card ID</strong> is required to rent books. Buy a digital Library Card for <strong className="text-amber-300 font-bold">₹1</strong> using the member details filled above.
                    </p>

                    {cardError && <p className="text-xs text-red-400 font-semibold">{cardError}</p>}

                    <button
                      type="button"
                      onClick={handleBuyLibraryCard}
                      disabled={buyingCard}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 py-2.5 text-xs font-black uppercase text-black shadow-md hover:scale-[1.01] transition disabled:opacity-60 cursor-pointer"
                    >
                      {buyingCard ? (
                        <>
                          <Loader2 className="animate-spin" size={15} /> Processing Card Purchase...
                        </>
                      ) : (
                        <>
                          <CreditCard size={15} /> Buy Library Card (₹1)
                        </>
                      )}
                    </button>

                    {/* Or enter ID & upload PDF manually */}
                    <div className="pt-2 border-t border-white/10 space-y-2">
                      <p className="text-[10px] text-white/50 font-bold">ALREADY HAVE A CARD? ENTER ID & UPLOAD PDF:</p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <input
                          type="text"
                          placeholder="Card ID (e.g. LTC-849204)"
                          value={libraryCardId}
                          onChange={(e) => setLibraryCardId(e.target.value)}
                          className="rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white placeholder-white/30 outline-none focus:border-emerald-400"
                        />
                        <div className="flex items-center">
                          <input
                            type="file"
                            accept=".pdf,application/pdf"
                            onChange={(e) => setLibraryCardPdfFile(e.target.files?.[0] || null)}
                            className="text-[11px] text-white/70 file:mr-2 file:rounded-lg file:border-0 file:bg-emerald-400/20 file:px-2.5 file:py-1.5 file:text-[10px] file:font-bold file:text-emerald-300 hover:file:bg-emerald-400/30 cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* PROCEED BUTTON */}
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-400 py-3.5 text-xs font-black uppercase tracking-wider text-black shadow-lg shadow-emerald-400/20 transition hover:bg-emerald-300 cursor-pointer"
              >
                Proceed to Payment <ArrowRight size={16} />
              </button>
            </form>
          )}

          {/* STEP 2: RAZORPAY PAYMENT BREAKDOWN */}
          {step === "payment" && (
            <div className="space-y-5">
              <button
                onClick={() => setStep("details")}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-white/60 hover:text-white transition cursor-pointer"
              >
                <ArrowLeft size={14} /> Back to details
              </button>

              {/* PAYMENT SUMMARY BOX */}
              <div className="rounded-2xl border border-emerald-400/30 bg-emerald-950/30 p-5 space-y-3 shadow-lg">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-xs text-white/70">Base Rental Fee ({rentalDuration} Days):</span>
                  <span className="text-sm font-bold text-white">₹{rentalPrice.toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-xs text-white/70">18% GST Tax:</span>
                  <span className="text-sm font-bold text-amber-300">+ ₹{gstAmount.toFixed(2)}</span>
                </div>

                {libraryCardId && (
                  <div className="flex items-center justify-between border-b border-white/10 pb-3 text-xs">
                    <span className="text-white/70">Library Card ID:</span>
                    <span className="font-bold text-emerald-300">{libraryCardId}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <span className="text-sm font-extrabold uppercase text-white">Total Payable Amount:</span>
                  <span className="text-xl font-black text-emerald-400">₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* RAZORPAY NOTICE */}
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 flex items-start gap-3">
                <ShieldCheck size={20} className="text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs text-white/80 space-y-1">
                  <p className="font-bold text-white">100% Secure Checkout via Razorpay</p>
                  <p className="text-white/60 text-[11px] leading-relaxed">
                    Pay instantly using UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, or Net Banking.
                  </p>
                </div>
              </div>

              {/* PAY NOW BUTTON */}
              <button
                onClick={handleExecuteRazorpay}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 py-3.5 text-xs font-black uppercase tracking-wider text-black shadow-lg shadow-emerald-400/20 transition hover:scale-[1.01] disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Processing Payment...
                  </>
                ) : (
                  <>
                    <CreditCard size={16} /> Pay ₹{totalAmount.toFixed(2)} with Razorpay
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
