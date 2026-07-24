import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Trash2, X, AlertCircle, CheckCircle2, Loader2, Sparkles, ArrowRight, Copy, MapPin, CreditCard, ShieldCheck } from "lucide-react";
import { getCart, removeFromCart, clearCart } from "../utils/cart.js";
import { API_BASE, SERVER_URL } from "../config.js";
import AuthModal from "./AuthModal.jsx";

import { PackageCheck } from "lucide-react";

export default function CartModal({ isOpen, onClose, onOpenOrders }) {
  const [cartItems, setCartItems] = useState([]);
  const [step, setStep] = useState("cart"); // 'cart', 'address', 'payment', 'success'
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [upiConfig, setUpiConfig] = useState({ upiId: "pritamchakrabrty@slc", upiQrImageUrl: "" });
  const [transactionNumber, setTransactionNumber] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Delivery Address Form
  const [deliveryForm, setDeliveryForm] = useState({
    co: "",
    country: "India",
    district: "",
    block: "",
    pin: "",
    postOffice: "",
    nearbyLocation: ""
  });

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
      refreshCart();
      setStep("cart");
      setErrorMsg("");
      fetch(`${API_BASE}/purchase/config`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setUpiConfig({
              upiId: data.upiId || "pritamchakrabrty@slc",
              upiQrImageUrl: data.upiQrImageUrl || ""
            });
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  const hasPhysicalItems = cartItems.some(
    (item) => item.format === "paperback" || item.format === "hardcover"
  );

  const totalPrice = cartItems.reduce((acc, item) => acc + (Number(item.price) || 0), 0);

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
      if (!deliveryForm.district || !deliveryForm.block || !deliveryForm.pin || !deliveryForm.nearbyLocation) {
        setErrorMsg("Please fill out all required address fields.");
        return;
      }
    }
    setErrorMsg("");
    setStep("payment");
  };

  const handleBatchPaymentSubmit = async (e) => {
    e.preventDefault();
    if (!transactionNumber) {
      setErrorMsg("Please enter your UPI transaction number.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const formData = new FormData();
      formData.append("items", JSON.stringify(cartItems));
      formData.append("transactionNumber", transactionNumber);
      formData.append(
        "note",
        `Cart Purchase of ${cartItems.length} books totaling ₹${totalPrice}`
      );

      if (hasPhysicalItems) {
        Object.entries(deliveryForm).forEach(([key, val]) => {
          formData.append(key, val);
        });
      }

      const res = await fetch(`${API_BASE}/purchase/batch`, {
        method: "POST",
        body: formData,
        credentials: "include"
      });

      const data = await res.json();

      if (res.status === 401) {
        setShowAuthModal(true);
        return;
      }

      if (data.success) {
        clearCart();
        setStep("success");
      } else {
        setErrorMsg(data.message || "Failed to complete purchase request.");
      }
    } catch {
      setErrorMsg("Connection error submitting payment details.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiConfig.upiId);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  if (!isOpen) return null;

  return createPortal(
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 p-4 backdrop-blur-xl"
          onClick={onClose}
          data-lenis-prevent
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="relative flex max-h-[88vh] w-full max-w-2xl flex-col rounded-3xl border border-cyan-500/25 bg-zinc-950/95 p-6 sm:p-8 shadow-[0_0_60px_rgba(6,182,212,0.15)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            data-lenis-prevent
          >
            {/* Ambient Background Blur Elements */}
            <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-cyan-500/15 blur-[100px]" />
            <div className="pointer-events-none absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-indigo-500/15 blur-[100px]" />

            {/* Header Bar */}
            <div className="relative z-10 mb-5 flex items-center justify-between border-b border-white/10 pb-5">
              <div className="flex items-center gap-3.5">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 to-indigo-500 text-black shadow-lg shadow-cyan-500/25 ring-1 ring-cyan-400/40">
                  <ShoppingCart size={22} className="stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black uppercase tracking-wider text-white">
                      My Shopping Cart
                    </h3>
                    <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-0.5 text-xs font-black text-cyan-300">
                      {cartItems.length}
                    </span>
                  </div>
                  <p className="text-xs text-white/50 mt-0.5">Review items & checkout securely</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 text-white/60 transition hover:border-white/25 hover:bg-white/10 hover:text-white"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Step Wizard Bar (When Items Exist) */}
            {cartItems.length > 0 && step !== "success" && (
              <div className="relative z-10 mb-5 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-xs font-bold text-white/60">
                <div className={`flex items-center gap-2 ${step === "cart" ? "text-cyan-300" : "text-white/40"}`}>
                  <span className={`grid h-5 w-5 place-items-center rounded-full text-[10px] ${step === "cart" ? "bg-cyan-400 text-black" : "bg-white/10 text-white"}`}>1</span>
                  <span>Cart Items</span>
                </div>

                {hasPhysicalItems && (
                  <>
                    <div className="h-0.5 w-6 bg-white/10" />
                    <div className={`flex items-center gap-2 ${step === "address" ? "text-cyan-300" : "text-white/40"}`}>
                      <span className={`grid h-5 w-5 place-items-center rounded-full text-[10px] ${step === "address" ? "bg-cyan-400 text-black" : "bg-white/10 text-white"}`}>2</span>
                      <span>Address</span>
                    </div>
                  </>
                )}

                <div className="h-0.5 w-6 bg-white/10" />
                <div className={`flex items-center gap-2 ${step === "payment" ? "text-cyan-300" : "text-white/40"}`}>
                  <span className={`grid h-5 w-5 place-items-center rounded-full text-[10px] ${step === "payment" ? "bg-cyan-400 text-black" : "bg-white/10 text-white"}`}>
                    {hasPhysicalItems ? "3" : "2"}
                  </span>
                  <span>Payment</span>
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
                  {cartItems.length === 0 ? (
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
                      {cartItems.map((item, idx) => (
                        <div
                          key={`${item.bookId}-${item.format}-${idx}`}
                          className="group relative flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition-all duration-300 hover:border-cyan-400/30 hover:bg-white/[0.06] shadow-md backdrop-blur-sm"
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            {/* Book Cover Thumbnail */}
                            <div className="h-20 w-14 shrink-0 overflow-hidden rounded-xl bg-zinc-900 border border-white/15 shadow-md">
                              {item.cover ? (
                                <img
                                  src={item.cover.startsWith("http") ? item.cover : `${SERVER_URL}${item.cover}`}
                                  alt={item.title}
                                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                              ) : (
                                <div className="h-full w-full bg-gradient-to-br from-cyan-500 to-indigo-600 grid place-items-center text-[10px] font-black text-white">
                                  BOOK
                                </div>
                              )}
                            </div>

                            {/* Book Details */}
                            <div className="min-w-0">
                              <h4 className="truncate text-base font-extrabold text-white group-hover:text-cyan-300 transition">
                                {item.title}
                              </h4>
                              <p className="truncate text-xs font-medium text-white/50">{item.author}</p>
                              
                              <div className="mt-2 flex items-center gap-2">
                                <span className="rounded-lg border border-cyan-400/30 bg-cyan-400/15 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-cyan-300 shadow-glow">
                                  {item.format}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Price & Actions */}
                          <div className="flex items-center gap-4 shrink-0">
                            <span className="text-lg font-black text-white tracking-wide">
                              {formatPrice(item.price)}
                            </span>
                            <button
                              onClick={() => removeFromCart(item.bookId, item.format)}
                              className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-white/40 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
                              title="Remove book from cart"
                            >
                              <Trash2 size={16} />
                            </button>
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
                      <label className="block text-[10px] font-extrabold uppercase tracking-wider text-white/60 mb-1">District *</label>
                      <input
                        type="text"
                        required
                        value={deliveryForm.district}
                        onChange={(e) => setDeliveryForm({ ...deliveryForm, district: e.target.value })}
                        placeholder="e.g. West Tripura"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs text-white placeholder-white/20 focus:border-cyan-400/50 focus:outline-none"
                      />
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
                        required
                        value={deliveryForm.pin}
                        onChange={(e) => setDeliveryForm({ ...deliveryForm, pin: e.target.value })}
                        placeholder="e.g. 799001"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs text-white placeholder-white/20 focus:border-cyan-400/50 focus:outline-none"
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
                <form onSubmit={handleBatchPaymentSubmit} className="space-y-4 py-1">
                  {/* Summary Box */}
                  <div className="relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 via-indigo-500/5 to-zinc-950 p-5 text-center shadow-lg">
                    <p className="text-xs font-black uppercase tracking-widest text-cyan-300">Total Order Amount</p>
                    <p className="mt-1 text-4xl font-black bg-gradient-to-r from-cyan-300 via-white to-indigo-300 bg-clip-text text-transparent">
                      {formatPrice(totalPrice)}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-white/50">{cartItems.length} books in this order</p>
                  </div>

                  {/* Payment Details Box */}
                  <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 space-y-4 backdrop-blur-sm">
                    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/40 p-3.5">
                      <div className="flex items-center gap-2">
                        <CreditCard size={18} className="text-cyan-400" />
                        <span className="text-xs font-bold text-white/70">UPI ID:</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyUpi}
                        className="flex items-center gap-1.5 rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-3 py-1.5 text-xs font-extrabold text-cyan-300 hover:bg-cyan-400/20 transition"
                      >
                        <Copy size={13} /> {copySuccess ? "Copied!" : upiConfig.upiId}
                      </button>
                    </div>

                    {upiConfig.upiQrImageUrl && (
                      <div className="flex flex-col items-center justify-center py-2">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-white/50 mb-2">Scan QR to Pay</p>
                        <div className="rounded-2xl border border-white/20 bg-white p-3 shadow-2xl">
                          <img
                            src={upiConfig.upiQrImageUrl.startsWith("http") ? upiConfig.upiQrImageUrl : `${SERVER_URL}${upiConfig.upiQrImageUrl}`}
                            alt="UPI QR Code"
                            className="h-44 w-44 object-contain"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-white/80 mb-2">
                        UPI Transaction ID / Reference Number *
                      </label>
                      <input
                        type="text"
                        required
                        value={transactionNumber}
                        onChange={(e) => setTransactionNumber(e.target.value.replace(/[^0-9]/g, ""))}
                        placeholder="Enter 12-digit UPI reference number"
                        className="w-full rounded-2xl border border-cyan-400/30 bg-white/5 px-4 py-3.5 text-sm font-black tracking-widest text-cyan-200 placeholder-white/20 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(hasPhysicalItems ? "address" : "cart")}
                      className="w-1/3 rounded-2xl border border-white/10 bg-white/5 py-3.5 text-xs font-extrabold text-white transition hover:bg-white/10"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-500 py-3.5 text-xs font-black uppercase tracking-wider text-black transition hover:scale-[1.02] disabled:opacity-50 shadow-lg shadow-cyan-500/25"
                    >
                      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Submit Order Request"}
                    </button>
                  </div>
                </form>
              )}

              {/* ─────────── 4. SUCCESS STEP ─────────── */}
              {step === "success" && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="relative mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.3)] border border-emerald-500/40">
                    <CheckCircle2 size={42} className="animate-bounce" />
                  </div>
                  <h4 className="text-2xl font-black text-white">Order Submitted Successfully!</h4>
                  <p className="mt-3 max-w-md text-xs font-medium text-white/60 leading-relaxed">
                    Your purchase request has been submitted to the admin team. Once verified, your books will be unlocked in your account!
                  </p>
                  <button
                    onClick={onClose}
                    className="mt-8 w-full max-w-xs rounded-2xl bg-emerald-400 py-3.5 text-xs font-black uppercase tracking-wider text-black hover:bg-emerald-300 transition shadow-lg shadow-emerald-500/20"
                  >
                    OK, Got It
                  </button>
                </div>
              )}
            </div>

            {/* Sticky Bottom Footer Summary (Cart Step) */}
            {step === "cart" && cartItems.length > 0 && (
              <div className="relative z-10 mt-5 border-t border-white/10 pt-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Total Amount</p>
                  <p className="text-3xl font-black bg-gradient-to-r from-cyan-300 via-white to-indigo-300 bg-clip-text text-transparent">
                    {formatPrice(totalPrice)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleProceedToCheckout}
                  className="group flex items-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-500 px-7 py-3.5 text-xs font-black uppercase tracking-wider text-black shadow-[0_0_30px_rgba(34,211,238,0.25)] hover:scale-[1.02] transition"
                >
                  Checkout ({cartItems.length})
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
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
