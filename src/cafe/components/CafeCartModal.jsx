import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag, X, Plus, Minus, Trash2, Coffee, ShieldCheck,
  CreditCard, Loader2, Sparkles, ArrowRight, Phone,
} from "lucide-react";
import { getCafeCart, updateCafeCartQty, removeFromCafeCart, clearCafeCart } from "../utils/cafeCart.js";
import { API_BASE } from "../../config.js";

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

  const handleCheckout = () => {
    alert("Online food & beverage ordering for counter pickup is launching very soon! Please place your order directly at the Lekhok Tripura Cafe counter.");
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
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Drawer */}
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative z-10 flex h-full w-full max-w-md flex-col bg-[#140803] text-[#FAF5EB] shadow-2xl overflow-hidden border-l border-[#D4A85A]/25"
          data-lenis-prevent
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#D4A85A]/25 p-5 bg-[#23120A]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#D4A85A] text-[#140803] font-black shadow-md">
                <ShoppingBag size={18} />
              </div>
              <div>
                <h3 className="font-black text-[#FAF5EB] text-base">Your Cafe Order</h3>
                <p className="text-[11px] text-[#D4A85A] font-semibold">{cart.length} item{cart.length !== 1 ? "s" : ""}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="grid h-9 w-9 place-items-center rounded-full border border-white/20 text-white hover:bg-white/10 transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3 custom-scrollbar" data-lenis-prevent>
            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-900/40 p-3 text-xs font-semibold text-red-200">
                {error}
              </div>
            )}

            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Coffee size={48} className="mb-3 text-[#D4A85A]/40" />
                <p className="font-bold text-[#FAF5EB] text-base mb-1">Your cart is empty</p>
                <p className="text-xs text-white/50 max-w-xs">Explore our menu and add your favorite drinks and snacks!</p>
              </div>
            ) : (
              cart.map((item) => {
                const itemId = item._id || item.id;
                return (
                  <div
                    key={itemId}
                    className="flex items-center gap-3 rounded-2xl border border-[#D4A85A]/20 bg-[#23120A] p-3 shadow-sm"
                  >
                    {/* Item Image */}
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[#140803] flex items-center justify-center border border-[#D4A85A]/15">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                      ) : (
                        <Coffee size={20} className="text-[#D4A85A]/50" />
                      )}
                    </div>

                    {/* Name & Category */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#FAF5EB] truncate">{item.name}</p>
                      <p className="text-[10px] text-[#D4A85A] font-semibold uppercase tracking-wider">{item.category}</p>
                      <p className="text-xs font-black text-[#D4A85A] mt-0.5">₹{item.price * item.quantity}</p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-1.5 rounded-xl border border-[#D4A85A]/30 bg-[#140803] p-1">
                      <button
                        onClick={() => updateCafeCartQty(itemId, item.quantity - 1)}
                        className="grid h-6 w-6 place-items-center rounded-lg text-white hover:bg-white/10 transition"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-5 text-center text-xs font-bold text-[#D4A85A]">{item.quantity}</span>
                      <button
                        onClick={() => updateCafeCartQty(itemId, item.quantity + 1)}
                        className="grid h-6 w-6 place-items-center rounded-lg text-white hover:bg-white/10 transition"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    {/* Delete */}
                    <button
                      onClick={() => removeFromCafeCart(itemId)}
                      className="text-red-400 hover:text-red-300 transition p-1"
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
            <div className="border-t border-[#D4A85A]/25 bg-[#23120A] p-5 space-y-3">
              <div>
                <label className="mb-1 flex items-center gap-1 text-[11px] font-bold text-[#D4A85A] uppercase tracking-wide">
                  <Phone size={11} /> Contact Phone Number (for order pickup updates)
                </label>
                <input
                  type="tel"
                  placeholder="Enter 10-digit mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-[#D4A85A]/30 bg-[#140803] px-3 py-2 text-xs text-[#FAF5EB] outline-none focus:border-[#D4A85A]"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-bold text-white/70">Total Amount:</span>
                <span className="text-xl font-black text-[#D4A85A]">₹{totalAmount}</span>
              </div>

              <button
                onClick={handleCheckout}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#D4A85A] to-[#A0522D] py-3.5 text-sm font-black text-[#140803] shadow-lg transition hover:scale-[1.02] hover:shadow-xl"
              >
                <Sparkles size={16} /> Place Order (Coming Soon)
              </button>

              <p className="text-[10px] text-center text-white/40 flex items-center justify-center gap-1">
                <ShieldCheck size={12} className="text-emerald-400" /> 256-Bit Secure Razorpay Payment
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
