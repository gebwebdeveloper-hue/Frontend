import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Trash2, X, AlertCircle, CheckCircle2, Loader2, Sparkles, ArrowRight, Copy, MapPin, CreditCard, ShieldCheck } from "lucide-react";
import { getCart, removeFromCart, clearCart } from "../utils/cart.js";
import { INDIA_STATES, DISTRICTS_BY_STATE } from "../utils/indiaData.js";
import { API_BASE, SERVER_URL } from "../config.js";
import { loadRazorpayScript } from "../utils/razorpay.js";
import AuthModal from "./AuthModal.jsx";

import { PackageCheck } from "lucide-react";

export default function CartModal({ isOpen, onClose, onOpenOrders }) {
  const [cartItems, setCartItems] = useState([]);
  const [step, setStep] = useState("cart"); // 'cart', 'address', 'payment', 'success'
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Delivery Address Form
  const [deliveryForm, setDeliveryForm] = useState({
    co: "",
    country: "India",
    state: "",
    district: "",
    block: "",
    pin: "",
    postOffice: "",
    nearbyLocation: ""
  });

  const getDeliveryCharge = (state) => {
    if (!state) return 120;
    const s = state.trim().toLowerCase();
    if (s === "tripura") return 0;
    if (s === "west bengal") return 100;
    return 120;
  };

  // Districts available for the currently selected state
  const availableDistricts = deliveryForm.state ? (DISTRICTS_BY_STATE[deliveryForm.state] || []) : [];

  const refreshCart = () => {
    setCartItems(getCart());
  };

  useEffect(() => {
    refreshCart();
    window.addEventListener("lekhak:cart-updated", refreshCart);
    return () => window.removeEventListener("lekhak:cart-updated", refreshCart);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetch(`${API_BASE}/auth/me`, { credentials: "include" })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (!data?.success || !data?.user) {
            onClose();
            setShowAuthModal(true);
          } else {
            setCurrentUser(data.user);
            refreshCart();
            setStep("cart");
            setErrorMsg("");
          }
        })
        .catch(() => {
          onClose();
          setShowAuthModal(true);
        });
    }
  }, [isOpen]);

  const hasPhysicalItems = cartItems.some(
    (item) => item.format === "paperback" || item.format === "hardcover"
  );

  const isClubMember = !!(currentUser?.memberId && String(currentUser.memberId).startsWith("LTCLUB-"));
  const GST_RATE = 0.18;

  // Recalculate prices considering club membership status
  const processedItems = cartItems.map((item) => {
    const rawBase = Number(item.basePrice || item.price) || 0;
    const basePrice = isClubMember ? Math.round(rawBase * 0.95 * 100) / 100 : rawBase;
    const price = Math.round(basePrice * (1 + GST_RATE) * 100) / 100;
    const originalPrice = Math.round(rawBase * (1 + GST_RATE) * 100) / 100;
    return {
      ...item,
      basePrice,
      price,
      originalPrice,
      isClubMember
    };
  });

  const totalPrice = processedItems.reduce((acc, item) => acc + (Number(item.price) || 0), 0);
  const totalBasePrice = processedItems.reduce((acc, item) => acc + (Number(item.basePrice || item.price) || 0), 0);
  const totalGST = Math.round((totalPrice - totalBasePrice) * 100) / 100;
  const deliveryCharge = hasPhysicalItems ? getDeliveryCharge(deliveryForm.state) : 0;
  const grandTotal = totalPrice + deliveryCharge;

  const formatPrice = (price) => `₹${price}`;

  const handleProceedToCheckout = async () => {
    setErrorMsg("");
    try {
      const meRes = await fetch(`${API_BASE}/auth/me`, { credentials: "include" });
      if (!meRes.ok) {
        setShowAuthModal(true);
        return;
      }
      const meData = await meRes.json();
      if (!meData.success || !meData.user) {
        setShowAuthModal(true);
        return;
      }

      if (hasPhysicalItems) {
        setStep("address");
      } else {
        setStep("payment");
      }
    } catch {
      setErrorMsg("Could not check authentication status.");
    }
  };

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    if (hasPhysicalItems) {
      if (!deliveryForm.state) {
        setErrorMsg("Please select your State.");
        return;
      }
      if (!deliveryForm.district || !deliveryForm.block || !deliveryForm.pin || !deliveryForm.nearbyLocation) {
        setErrorMsg("Please fill out all required address fields.");
        return;
      }
      if (deliveryForm.pin.length !== 6) {
        setErrorMsg("Please enter a valid 6-digit numeric PIN code.");
        return;
      }
    }
    setErrorMsg("");
    setStep("payment");
  };

  const handleRazorpayCheckout = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        setErrorMsg("Failed to load Razorpay Payment Gateway. Please check your internet connection.");
        setLoading(false);
        return;
      }

      const orderPayload = {
        items: cartItems,
        note: `Cart purchase of ${cartItems.length} items totaling ₹${grandTotal}`,
        ...(hasPhysicalItems ? deliveryForm : {})
      };

      const res = await fetch(`${API_BASE}/purchase/razorpay/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
        credentials: "include"
      });

      const data = await res.json();

      if (res.status === 401) {
        setShowAuthModal(true);
        setLoading(false);
        return;
      }

      if (!data.success || !data.orderId) {
        setErrorMsg(data.message || "Failed to initiate Razorpay payment order.");
        setLoading(false);
        return;
      }

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency || "INR",
        name: "Lekhok Tripura",
        description: `Order for ${cartItems.length} books (₹${totalPrice})`,
        order_id: data.orderId,
        handler: async function (response) {
          setLoading(true);
          try {
            const verifyRes = await fetch(`${API_BASE}/purchase/razorpay/verify`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              }),
              credentials: "include"
            });

            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              clearCart();
              setStep("success");
            } else {
              setErrorMsg(verifyData.message || "Payment verification failed.");
            }
          } catch {
            setErrorMsg("Network error verifying payment with backend.");
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: "",
          email: "",
          contact: ""
        },
        theme: {
          color: "#06b6d4"
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.on("payment.failed", function (response) {
        setErrorMsg(response.error.description || "Payment failed or was cancelled.");
        setLoading(false);
      });

      setLoading(false);
      paymentObject.open();
    } catch (err) {
      console.error("Razorpay Error:", err);
      setErrorMsg("Error communicating with Razorpay payment gateway.");
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-xl"
          onClick={onClose}
          data-lenis-prevent
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="relative flex max-h-[90vh] sm:max-h-[88vh] w-full max-w-2xl flex-col rounded-3xl border border-cyan-500/25 bg-zinc-950/95 p-4 sm:p-7 shadow-[0_0_60px_rgba(6,182,212,0.15)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            data-lenis-prevent
          >
            {/* Ambient Background Blur Elements */}
            <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-cyan-500/15 blur-[100px]" />
            <div className="pointer-events-none absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-indigo-500/15 blur-[100px]" />

            {/* Header Bar */}
            <div className="relative z-10 mb-4 sm:mb-5 flex items-center justify-between border-b border-white/10 pb-4 sm:pb-5">
              <div className="flex items-center gap-3 min-w-0">
                <div className="grid h-10 w-10 sm:h-12 sm:w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 to-indigo-500 text-black shadow-lg shadow-cyan-500/25 ring-1 ring-cyan-400/40">
                  <ShoppingCart size={20} className="stroke-[2.5]" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-xl font-black uppercase tracking-wider text-white truncate">
                      My Shopping Cart
                    </h3>
                    <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2 py-0.5 text-[11px] sm:text-xs font-black text-cyan-300 shrink-0">
                      {cartItems.length}
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-white/50 mt-0.5 truncate">Review items & checkout securely</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="grid h-8 w-8 sm:h-9 sm:w-9 shrink-0 place-items-center rounded-full border border-white/10 bg-white/5 text-white/60 transition hover:border-white/25 hover:bg-white/10 hover:text-white ml-2"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* Step Wizard Bar (When Items Exist) */}
            {cartItems.length > 0 && step !== "success" && (
              <div className="relative z-10 mb-4 sm:mb-5 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-2.5 sm:p-3 text-[11px] sm:text-xs font-bold text-white/60 overflow-x-auto no-scrollbar">
                <div className={`flex items-center gap-1.5 sm:gap-2 ${step === "cart" ? "text-cyan-300" : "text-white/40"}`}>
                  <span className={`grid h-4 w-4 sm:h-5 sm:w-5 place-items-center rounded-full text-[9px] sm:text-[10px] ${step === "cart" ? "bg-cyan-400 text-black font-black" : "bg-white/10 text-white"}`}>1</span>
                  <span className="whitespace-nowrap">Cart Items</span>
                </div>

                {hasPhysicalItems && (
                  <>
                    <div className="h-0.5 w-3 sm:w-6 bg-white/10 shrink" />
                    <div className={`flex items-center gap-1.5 sm:gap-2 ${step === "address" ? "text-cyan-300" : "text-white/40"}`}>
                      <span className={`grid h-4 w-4 sm:h-5 sm:w-5 place-items-center rounded-full text-[9px] sm:text-[10px] ${step === "address" ? "bg-cyan-400 text-black font-black" : "bg-white/10 text-white"}`}>2</span>
                      <span className="whitespace-nowrap">Address</span>
                    </div>
                  </>
                )}

                <div className="h-0.5 w-3 sm:w-6 bg-white/10 shrink" />
                <div className={`flex items-center gap-1.5 sm:gap-2 ${step === "payment" ? "text-cyan-300" : "text-white/40"}`}>
                  <span className={`grid h-4 w-4 sm:h-5 sm:w-5 place-items-center rounded-full text-[9px] sm:text-[10px] ${step === "payment" ? "bg-cyan-400 text-black font-black" : "bg-white/10 text-white"}`}>
                    {hasPhysicalItems ? "3" : "2"}
                  </span>
                  <span className="whitespace-nowrap">Payment</span>
                </div>
              </div>
            )}

            {/* Error Banner */}
            {errorMsg && (
              <div className="relative z-10 mb-4 flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs font-semibold text-red-300 shadow-lg">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Scrollable Content View */}
            <div className="relative z-10 flex-1 min-h-0 overflow-y-auto pr-1 custom-scrollbar" data-lenis-prevent>
              {/* ─────────── 1. CART ITEMS STEP ─────────── */}
              {step === "cart" && (
                <div>
                  {isClubMember && processedItems.length > 0 && (
                    <div className="mb-3.5 flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-300">
                      <ShieldCheck size={16} className="shrink-0 text-emerald-400" />
                      <span>5% Club Member Discount applied to all book purchases!</span>
                    </div>
                  )}
                  {processedItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="grid h-20 w-20 place-items-center rounded-3xl border border-white/10 bg-white/[0.03] text-white/30 mb-4 backdrop-blur-sm shadow-xl">
                        <ShoppingCart size={38} />
                      </div>
                      <h4 className="text-xl font-black text-white">Your Cart is Empty</h4>
                      <p className="mt-2 max-w-xs text-xs text-white/50 leading-relaxed">
                        Add your favorite books from the library to purchase multiple books together.
                      </p>
                      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                        <button
                          onClick={onClose}
                          className="rounded-2xl bg-gradient-to-r from-cyan-400 to-indigo-500 px-6 py-3 text-xs font-extrabold uppercase tracking-wider text-black shadow-lg shadow-cyan-500/20 hover:scale-105 transition"
                        >
                          Explore Library
                        </button>
                        {onOpenOrders && (
                          <button
                            onClick={() => {
                              onClose();
                              onOpenOrders();
                            }}
                            className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-xs font-bold text-white hover:bg-white/10 transition"
                          >
                            <PackageCheck size={16} className="text-cyan-400" />
                            My Orders & Status
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {processedItems.map((item, idx) => (
                        <div
                          key={`${item.bookId}-${item.format}-${idx}`}
                          className="group relative rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 sm:p-4 transition-all duration-300 hover:border-cyan-400/30 hover:bg-white/[0.06] shadow-md backdrop-blur-sm"
                        >
                          <div className="flex items-start sm:items-center justify-between gap-3 sm:gap-4">
                            {/* Book Cover Thumbnail & Details */}
                            <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0 flex-1">
                              <div className="h-16 w-12 sm:h-20 sm:w-14 shrink-0 overflow-hidden rounded-xl bg-zinc-900 border border-white/15 shadow-md">
                                {item.cover ? (
                                  <img
                                    src={item.cover.startsWith("http") ? item.cover : `${SERVER_URL}${item.cover}`}
                                    alt={item.title}
                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                  />
                                ) : (
                                  <div className="h-full w-full bg-gradient-to-br from-cyan-500 to-indigo-600 grid place-items-center text-[9px] font-black text-white">
                                    BOOK
                                  </div>
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <h4 className="line-clamp-2 sm:line-clamp-1 text-sm sm:text-base font-extrabold text-white group-hover:text-cyan-300 transition leading-snug">
                                  {item.title}
                                </h4>
                                <p className="truncate text-xs font-medium text-white/50 mt-0.5">{item.author}</p>
                                
                                <div className="mt-1.5 flex items-center gap-2">
                                  <span className="rounded-md border border-cyan-400/30 bg-cyan-400/15 px-2 py-0.5 text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-cyan-300 shadow-glow">
                                    {item.format}
                                  </span>
                                  {isClubMember && (
                                    <span className="rounded-md border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-emerald-300">
                                      5% Club Off
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Price & Delete Button */}
                            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-4 shrink-0">
                              <div className="text-right">
                                <div className="flex items-baseline gap-1.5 justify-end">
                                  {isClubMember && item.originalPrice > item.price && (
                                    <span className="text-xs font-bold text-white/40 line-through">
                                      {formatPrice(item.originalPrice)}
                                    </span>
                                  )}
                                  <span className="text-base sm:text-lg font-black text-white tracking-wide">
                                    {formatPrice(item.price)}
                                  </span>
                                </div>
                                {item.basePrice && (
                                  <p className="text-[9px] sm:text-[10px] text-white/40 mt-0.5 whitespace-nowrap">
                                    Base ₹{item.basePrice} + 18% GST
                                  </p>
                                )}
                              </div>
                              <button
                                onClick={() => removeFromCart(item.bookId, item.format)}
                                className="grid h-8 w-8 sm:h-9 sm:w-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5 text-white/40 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
                                title="Remove book from cart"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ─────────── 2. ADDRESS STEP ─────────── */}
              {step === "address" && (
                <form onSubmit={handleAddressSubmit} className="space-y-4 py-1">
                  <div className="mb-3 flex items-center gap-2.5 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-3.5 text-xs text-cyan-200">
                    <MapPin className="h-5 w-5 shrink-0 text-cyan-400" />
                    <span>
                      Shipping address required for physical editions (**Paperback / Hardcover**).
                    </span>
                  </div>

                  <div className="grid gap-3.5 sm:grid-cols-2">
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-wider text-white/60 mb-1">C/O (Care Of)</label>
                      <input
                        type="text"
                        value={deliveryForm.co}
                        onChange={(e) => setDeliveryForm({ ...deliveryForm, co: e.target.value })}
                        placeholder="e.g. S/O Mr. Das"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs text-white placeholder-white/20 focus:border-cyan-400/50 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-wider text-white/60 mb-1">Country *</label>
                      <input
                        type="text"
                        required
                        value={deliveryForm.country}
                        onChange={(e) => setDeliveryForm({ ...deliveryForm, country: e.target.value })}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs text-white focus:border-cyan-400/50 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-wider text-white/60 mb-1">State *</label>
                      <select
                        required
                        value={deliveryForm.state}
                        onChange={(e) => setDeliveryForm({ ...deliveryForm, state: e.target.value, district: "" })}
                        className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3.5 py-2.5 text-xs text-white focus:border-cyan-400/50 focus:outline-none"
                      >
                        <option value="">-- Select State --</option>
                        {INDIA_STATES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      {deliveryForm.state && (
                        <p className="mt-1 text-[10px] text-amber-300 font-semibold">
                          Delivery charge: ₹{getDeliveryCharge(deliveryForm.state)}
                          {deliveryForm.state === "Tripura" ? " (within Tripura)" :
                           deliveryForm.state === "West Bengal" ? " (West Bengal)" :
                           " (Other state)"}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-wider text-white/60 mb-1">District *</label>
                      <select
                        required
                        value={deliveryForm.district}
                        onChange={(e) => setDeliveryForm({ ...deliveryForm, district: e.target.value })}
                        disabled={!deliveryForm.state}
                        className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3.5 py-2.5 text-xs text-white focus:border-cyan-400/50 focus:outline-none disabled:opacity-40"
                      >
                        <option value="">{deliveryForm.state ? "-- Select District --" : "-- Select State first --"}</option>
                        {availableDistricts.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-wider text-white/60 mb-1">Block *</label>
                      <input
                        type="text"
                        required
                        value={deliveryForm.block}
                        onChange={(e) => setDeliveryForm({ ...deliveryForm, block: e.target.value })}
                        placeholder="e.g. Jirania"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs text-white placeholder-white/20 focus:border-cyan-400/50 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-wider text-white/60 mb-1">Pin Code *</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        required
                        value={deliveryForm.pin}
                        onChange={(e) => setDeliveryForm({ ...deliveryForm, pin: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                        placeholder="e.g. 799001"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs text-white placeholder-white/20 focus:border-cyan-400/50 focus:outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-wider text-white/60 mb-1">Post Office</label>
                      <input
                        type="text"
                        value={deliveryForm.postOffice}
                        onChange={(e) => setDeliveryForm({ ...deliveryForm, postOffice: e.target.value })}
                        placeholder="e.g. Agartala College"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs text-white placeholder-white/20 focus:border-cyan-400/50 focus:outline-none"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-extrabold uppercase tracking-wider text-white/60 mb-1">Nearby Location / Landmark *</label>
                      <input
                        type="text"
                        required
                        value={deliveryForm.nearbyLocation}
                        onChange={(e) => setDeliveryForm({ ...deliveryForm, nearbyLocation: e.target.value })}
                        placeholder="e.g. Near MBB College gate"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs text-white placeholder-white/20 focus:border-cyan-400/50 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setStep("cart")}
                      className="w-1/3 rounded-2xl border border-white/10 bg-white/5 py-3 text-xs font-extrabold text-white transition hover:bg-white/10"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="flex-1 rounded-2xl bg-gradient-to-r from-cyan-400 to-indigo-500 py-3 text-xs font-extrabold uppercase tracking-wider text-black transition hover:scale-[1.02] shadow-lg shadow-cyan-500/20"
                    >
                      Continue to Payment
                    </button>
                  </div>
                </form>
              )}

              {/* ─────────── 3. PAYMENT STEP ─────────── */}
              {step === "payment" && (
                <div className="space-y-5 py-1">
                  {/* Summary Box */}
                  <div className="relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 via-indigo-500/5 to-zinc-950 p-6 text-center shadow-lg">
                    <p className="text-xs font-black uppercase tracking-widest text-cyan-300">Total Order Amount</p>
                    <p className="mt-1 text-4xl font-black bg-gradient-to-r from-cyan-300 via-white to-indigo-300 bg-clip-text text-transparent">
                      {formatPrice(grandTotal)}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-white/50">{cartItems.length} books in this order</p>
                    {/* Price Breakdown */}
                    <div className="mt-3 space-y-1 text-[11px] text-white/50">
                      <div className="flex items-center justify-center gap-3">
                        <span>Books: ₹{totalBasePrice.toFixed(2)}</span>
                        <span className="text-white/20">+</span>
                        <span className="text-amber-300">GST (18%): ₹{totalGST.toFixed(2)}</span>
                      </div>
                      {deliveryCharge > 0 && (
                        <div className="flex items-center justify-center gap-2 text-emerald-300">
                          <span>+ Delivery ({deliveryForm.state}): ₹{deliveryCharge}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Razorpay Automatic Checkout Card */}
                  <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 space-y-4 backdrop-blur-sm text-center">
                    <div className="flex items-center justify-center gap-2 text-cyan-300 font-extrabold text-xs uppercase tracking-wider">
                      <ShieldCheck size={18} /> 100% Secure & Automated Payment
                    </div>

                    <p className="text-xs text-white/70 leading-relaxed max-w-md mx-auto">
                      Pay instantly via <strong>UPI (GPay, PhonePe, Paytm, BHIM)</strong>, <strong>Credit/Debit Cards</strong>, <strong>NetBanking</strong>, or <strong>Wallets</strong>. Access will be granted automatically upon payment verification!
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-[11px] font-bold text-white/40">
                      <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-cyan-300">✓ Instant Approval</span>
                      <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-emerald-300">✓ Automatic Reader Access</span>
                      <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-indigo-300">✓ 256-bit Encryption</span>
                    </div>

                    <button
                      type="button"
                      disabled={loading}
                      onClick={handleRazorpayCheckout}
                      className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-500 py-4 text-sm font-black uppercase tracking-wider text-black transition hover:scale-[1.02] active:scale-[0.99] disabled:opacity-50 shadow-[0_0_40px_rgba(6,182,212,0.3)] mt-4"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" /> Processing Payment...
                        </>
                      ) : (
                        <>
                          <CreditCard size={18} /> Pay {formatPrice(grandTotal)} via Razorpay
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex justify-start">
                    <button
                      type="button"
                      onClick={() => setStep(hasPhysicalItems ? "address" : "cart")}
                      className="rounded-2xl border border-white/10 bg-white/5 px-6 py-2.5 text-xs font-extrabold text-white transition hover:bg-white/10"
                    >
                      ← Back to Cart
                    </button>
                  </div>
                </div>
              )}

              {/* ─────────── 4. SUCCESS STEP ─────────── */}
              {step === "success" && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="relative mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.3)] border border-emerald-500/40">
                    <CheckCircle2 size={42} className="animate-bounce" />
                  </div>
                  <h4 className="text-2xl font-black text-white">Payment Verified & Access Granted!</h4>
                  <p className="mt-3 max-w-md text-xs font-medium text-white/65 leading-relaxed">
                    Your payment was successfully verified via Razorpay! Your eBooks have been unlocked instantly in your account.
                  </p>
                  <button
                    onClick={() => {
                      onClose();
                      if (onOpenOrders) onOpenOrders();
                    }}
                    className="mt-8 w-full max-w-xs rounded-2xl bg-emerald-400 py-3.5 text-xs font-black uppercase tracking-wider text-black hover:bg-emerald-300 transition shadow-lg shadow-emerald-500/20"
                  >
                    View My Purchased Books
                  </button>
                </div>
              )}
            </div>

            {/* Sticky Bottom Footer Summary (Cart Step) */}
            {step === "cart" && cartItems.length > 0 && (
              <div className="relative z-10 mt-3.5 sm:mt-5 border-t border-white/10 pt-3 sm:pt-4 flex items-center justify-between gap-3 sm:gap-4">
                <div className="min-w-0">
                  <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-white/40 truncate">Total Amount</p>
                  <p className="text-xl sm:text-3xl font-black bg-gradient-to-r from-cyan-300 via-white to-indigo-300 bg-clip-text text-transparent">
                    {formatPrice(totalPrice)}
                  </p>
                  <p className="text-[9px] sm:text-[10px] text-white/35 mt-0.5 truncate">
                    incl. 18% GST (₹{totalGST.toFixed(2)}){hasPhysicalItems ? " + delivery" : ""}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleProceedToCheckout}
                  className="group flex items-center justify-center gap-2 sm:gap-3 rounded-2xl bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-500 px-4 sm:px-7 py-3 sm:py-3.5 text-xs font-black uppercase tracking-wider text-black shadow-[0_0_30px_rgba(34,211,238,0.25)] hover:scale-[1.02] transition shrink-0 whitespace-nowrap"
                >
                  <span>Checkout ({cartItems.length})</span>
                  <ArrowRight size={15} className="transition-transform group-hover:translate-x-1 shrink-0" />
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Auth Modal Trigger */}
      {showAuthModal && (
        <AuthModal
          initialTab="login"
          onClose={() => {
            setShowAuthModal(false);
          }}
        />
      )}
    </>,
    document.body
  );
}
