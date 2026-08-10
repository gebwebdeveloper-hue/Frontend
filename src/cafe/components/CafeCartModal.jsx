import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag, X, Plus, Minus, Trash2, Coffee, ShieldCheck,
  CreditCard, Loader2, Sparkles, ArrowRight, Phone,
} from "lucide-react";
import { getCafeCart, updateCafeCartQty, removeFromCafeCart, clearCafeCart } from "../utils/cafeCart.js";
import { API_BASE } from "../../config.js";

// Helper to load Razorpay script dynamically
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      return resolve(true);
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CafeCartModal({ isOpen, onClose, authUser, onOrderPlaced }) {
  const [cart, setCart] = useState([]);
  const [phone, setPhone] = useState(authUser?.phone || "");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const refreshCart = () => setCart(getCafeCart());

  useEffect(() => {
    refreshCart();
    window.addEventListener("lekhak:cafe-cart-updated", refreshCart);
    return () => window.removeEventListener("lekhak:cafe-cart-updated", refreshCart);
  }, []);

  useEffect(() => {
    if (authUser?.phone && !phone) setPhone(authUser.phone);
  }, [authUser]);

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = async () => {
    if (!authUser) {
      setError("Please login to place an order.");
      return;
    }

    if (cart.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    setProcessing(true);
    setError("");

    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error("Razorpay SDK failed to load. Please check your internet connection.");
      }

      // 1. Create Razorpay order on backend
      const res = await fetch(`${API_BASE}/cafe/orders/create-razorpay-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          items: cart,
          customerPhone: phone,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || "Failed to create order.");
      }

      // 2. Open Razorpay Checkout Modal
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "Lekhok Tripura Cafe",
        description: `Order #${data.orderNumber} (${cart.length} items)`,
        image: "/Web.jpeg",
        order_id: data.razorpayOrderId,
        prefill: {
          name: authUser.name || "Customer",
          email: authUser.email || "",
          contact: phone || authUser.phone || "",
        },
        theme: {
          color: "#6B3F2A",
        },
        handler: async function (response) {
          try {
            // 3. Verify Payment
            const verifyRes = await fetch(`${API_BASE}/cafe/orders/verify-payment`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: data.orderId,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              clearCafeCart();
              onClose();
              if (onOrderPlaced) onOrderPlaced(verifyData.order);
            } else {
              setError(verifyData.message || "Payment verification failed.");
            }
          } catch (e) {
            setError(e.message || "Payment verification failed.");
          } finally {
            setProcessing(false);
          }
        },
        modal: {
          ondismiss: function () {
            setProcessing(false);
          },
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.on("payment.failed", function (response) {
        setError(response.error?.description || "Payment failed.");
        setProcessing(false);
      });
      paymentObject.open();
    } catch (err) {
      setError(err.message || "Something went wrong.");
      setProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Drawer */}
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative z-10 flex h-full w-full max-w-md flex-col bg-[#FAF5EB] shadow-2xl overflow-hidden"
          data-lenis-prevent
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#D4A85A]/25 p-5 bg-[#FFF8F0]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#6B3F2A] text-white shadow-md">
                <ShoppingBag size={18} />
              </div>
              <div>
                <h3 className="font-bold text-[#2C1810] text-base">Your Cafe Order</h3>
                <p className="text-[11px] text-[#D4A85A] font-semibold">{cart.length} item{cart.length !== 1 ? "s" : ""}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="grid h-9 w-9 place-items-center rounded-full border border-[#6B3F2A]/20 text-[#6B3F2A] hover:bg-[#6B3F2A]/10 transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3" data-lenis-prevent>
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-600">
                {error}
              </div>
            )}

            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Coffee size={48} className="mb-3 text-[#D4A85A]/40" />
                <p className="font-bold text-[#2C1810] text-base mb-1">Your cart is empty</p>
                <p className="text-xs text-[#2C1810]/50 max-w-xs">Explore our menu and add your favorite drinks and snacks!</p>
              </div>
            ) : (
              cart.map((item) => {
                const itemId = item._id || item.id;
                return (
                  <div
                    key={itemId}
                    className="flex items-center gap-3 rounded-2xl border border-[#D4A85A]/20 bg-white p-3 shadow-sm"
                  >
                    {/* Item Image */}
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[#FAF5EB] flex items-center justify-center border border-[#D4A85A]/15">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                      ) : (
                        <Coffee size={20} className="text-[#6B3F2A]/40" />
                      )}
                    </div>

                    {/* Name & Category */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#2C1810] truncate">{item.name}</p>
                      <p className="text-[10px] text-[#D4A85A] font-semibold uppercase tracking-wider">{item.category}</p>
                      <p className="text-xs font-black text-[#6B3F2A] mt-0.5">₹{item.price * item.quantity}</p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-1.5 rounded-xl border border-[#6B3F2A]/15 bg-[#FAF5EB] p-1">
                      <button
                        onClick={() => updateCafeCartQty(itemId, item.quantity - 1)}
                        className="grid h-6 w-6 place-items-center rounded-lg text-[#6B3F2A] hover:bg-[#6B3F2A]/10 transition"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-5 text-center text-xs font-bold text-[#2C1810]">{item.quantity}</span>
                      <button
                        onClick={() => updateCafeCartQty(itemId, item.quantity + 1)}
                        className="grid h-6 w-6 place-items-center rounded-lg text-[#6B3F2A] hover:bg-[#6B3F2A]/10 transition"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    {/* Delete */}
                    <button
                      onClick={() => removeFromCafeCart(itemId)}
                      className="text-red-400 hover:text-red-600 transition p-1"
                      title="Remove"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Checkout Box */}
          {cart.length > 0 && (
            <div className="border-t border-[#D4A85A]/25 bg-[#FFF8F0] p-5 space-y-3">
              {/* Phone input for notification */}
              <div>
                <label className="mb-1 flex items-center gap-1 text-[11px] font-bold text-[#6B3F2A] uppercase tracking-wide">
                  <Phone size={11} /> Contact Phone Number (for order pickup updates)
                </label>
                <input
                  type="tel"
                  placeholder="Enter 10-digit mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-[#D4A85A]/30 bg-white px-3 py-2 text-xs text-[#2C1810] outline-none focus:border-[#6B3F2A]"
                />
              </div>

              {/* Total Row */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-bold text-[#2C1810]/70">Total Amount:</span>
                <span className="text-xl font-black text-[#6B3F2A]">₹{totalAmount}</span>
              </div>

              {/* Pay with Razorpay CTA */}
              <button
                onClick={handleCheckout}
                disabled={processing}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#6B3F2A] to-[#A0522D] py-3.5 text-sm font-bold text-white shadow-lg transition hover:scale-[1.02] hover:shadow-xl disabled:opacity-60"
              >
                {processing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Processing Payment…
                  </>
                ) : (
                  <>
                    <CreditCard size={16} /> Pay ₹{totalAmount} via Razorpay <ArrowRight size={14} />
                  </>
                )}
              </button>

              <p className="text-[10px] text-center text-[#2C1810]/40 flex items-center justify-center gap-1">
                <ShieldCheck size={12} className="text-[#4A7C59]" /> 256-Bit Secure Razorpay Payment
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
