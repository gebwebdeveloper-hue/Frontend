import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Check, Clock, Coffee, Bell, UtensilsCrossed,
  CheckCircle2, Sparkles, AlertCircle, ShoppingBag, Loader2,
  History, ArrowRight, ChevronRight, RefreshCw,
} from "lucide-react";
import { API_BASE } from "../../config.js";

const STAGES = [
  { id: "New Order",  label: "New Order",  icon: Clock },
  { id: "Accepted",   label: "Accepted",   icon: Check },
  { id: "Confirmed",  label: "Confirmed",  icon: CheckCircle2 },
  { id: "Preparing",  label: "Preparing",  icon: UtensilsCrossed },
  { id: "Ready",      label: "Ready",      icon: Bell },
  { id: "Collected",  label: "Collected",  icon: ShoppingBag },
];

export default function CafeOrderTrackerModal({ isOpen, onClose, order: initialOrder }) {
  const [activeTab, setActiveTab] = useState("tracker"); // "tracker" | "history"
  const [selectedOrder, setSelectedOrder] = useState(initialOrder);
  const [allOrders, setAllOrders] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    setSelectedOrder(initialOrder);
    if (initialOrder?.status === "Collected") {
      // default tab if collected or opening from history
    }
  }, [initialOrder]);

  // Fetch all past & present orders for the history tab
  const fetchOrderHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch(`${API_BASE}/cafe/orders/my-orders`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success && data.orders) {
        setAllOrders(data.orders);
        if (!selectedOrder && data.orders.length > 0) {
          setSelectedOrder(data.orders[0]);
        }
      }
    } catch {
      // ignore
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchOrderHistory();
    }
  }, [isOpen]);

  // Live polling every 4 seconds for the selected order's status
  useEffect(() => {
    if (!isOpen || !selectedOrder?._id) return;

    const pollStatus = async () => {
      try {
        const res = await fetch(`${API_BASE}/cafe/orders/live-status/${selectedOrder._id}`, {
          credentials: "include",
        });
        const data = await res.json();
        if (data.success && data.order) {
          setSelectedOrder(data.order);
        }
      } catch {
        // ignore
      }
    };

    const interval = setInterval(pollStatus, 4000);
    return () => clearInterval(interval);
  }, [isOpen, selectedOrder?._id]);

  if (!isOpen) return null;

  const currentStageIdx = selectedOrder ? STAGES.findIndex((s) => s.id === selectedOrder.status) : 0;
  const isReady = selectedOrder?.status === "Ready";
  const isCollected = selectedOrder?.status === "Collected";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-[#D4A85A]/30 bg-[#FAF5EB] shadow-2xl flex flex-col max-h-[85vh]"
          data-lenis-prevent
        >
          {/* Top Banner & Tab Navigation */}
          <div
            className="flex flex-col border-b border-[#D4A85A]/25"
            style={{ background: "linear-gradient(135deg, #2C1810, #6B3F2A)" }}
          >
            <div className="flex items-center justify-between px-6 pt-5 pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#D4A85A] text-[#2C1810] shadow-md">
                  <Coffee size={22} />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-[#FAF5EB]">Lekhok Tripura Cafe</p>
                  <p className="text-sm font-bold text-[#D4A85A]">
                    {activeTab === "tracker" && selectedOrder ? `Order #${selectedOrder.orderNumber}` : "My Order History"}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Tab switch buttons */}
            <div className="flex px-6 gap-3 pb-3">
              <button
                onClick={() => setActiveTab("tracker")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition ${
                  activeTab === "tracker"
                    ? "bg-[#D4A85A] text-[#2C1810] shadow-md"
                    : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                }`}
              >
                <Clock size={14} /> Live Status
              </button>
              <button
                onClick={() => { setActiveTab("history"); fetchOrderHistory(); }}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition ${
                  activeTab === "history"
                    ? "bg-[#D4A85A] text-[#2C1810] shadow-md"
                    : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                }`}
              >
                <History size={14} /> Order History ({allOrders.length})
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar" data-lenis-prevent>

            {/* ── TAB 1: LIVE TRACKER VIEW ───────────────────────────────── */}
            {activeTab === "tracker" && (
              selectedOrder ? (
                <>
                  {/* 🚨 SPECIAL READY NOTIFICATION CARD */}
                  {isReady && (
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="relative overflow-hidden rounded-2xl border-2 border-[#D4A85A] bg-gradient-to-r from-[#6B3F2A] to-[#A0522D] p-5 text-white shadow-xl"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#D4A85A] text-[#2C1810] shadow-lg animate-bounce">
                          <Bell size={24} />
                        </div>
                        <div>
                          <span className="inline-block rounded-full bg-[#D4A85A] px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-[#2C1810] mb-1">
                            Ready for Pickup!
                          </span>
                          <h4 className="text-base font-black leading-snug">
                            Your order is ready. Please collect your meal from the counter.
                          </h4>
                          <p className="text-xs text-white/80 mt-1">
                            Show Order <span className="font-extrabold text-[#D4A85A]">#{selectedOrder.orderNumber}</span> at the cafe counter.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* COLLECTED BANNER */}
                  {isCollected && (
                    <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-center text-emerald-800">
                      <CheckCircle2 size={24} className="mx-auto mb-1 text-emerald-600" />
                      <p className="font-bold text-sm">Order Collected!</p>
                      <p className="text-xs text-emerald-600 mb-3">Thank you for visiting Lekhok Tripura Cafe!</p>
                      <button
                        onClick={() => setActiveTab("history")}
                        className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
                      >
                        <History size={13} /> View All Order History
                      </button>
                    </div>
                  )}

                  {/* Status Stepper Tracker */}
                  <div>
                    <p className="mb-4 text-xs font-bold uppercase tracking-wider text-[#6B3F2A]">Order Progress</p>

                    <div className="space-y-3">
                      {STAGES.map((stage, idx) => {
                        const isDone = idx <= currentStageIdx;
                        const isCurrent = idx === currentStageIdx;
                        const Icon = stage.icon;

                        return (
                          <div
                            key={stage.id}
                            className={`flex items-center gap-3.5 rounded-2xl p-3 border transition-all ${
                              isCurrent
                                ? "border-[#6B3F2A] bg-white shadow-md"
                                : isDone
                                ? "border-emerald-200 bg-emerald-50/50"
                                : "border-[#D4A85A]/15 bg-white/40 opacity-50"
                            }`}
                          >
                            <div
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-bold transition ${
                                isCurrent
                                  ? "bg-[#6B3F2A] text-white shadow-md animate-pulse"
                                  : isDone
                                  ? "bg-emerald-500 text-white"
                                  : "bg-[#D4A85A]/20 text-[#6B3F2A]"
                              }`}
                            >
                              <Icon size={16} />
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-bold ${isCurrent ? "text-[#6B3F2A]" : isDone ? "text-emerald-900" : "text-[#2C1810]"}`}>
                                {stage.label}
                              </p>
                              {isCurrent && (
                                <p className="text-[10px] text-[#6B3F2A]/70 font-medium">
                                  Current Status
                                </p>
                              )}
                            </div>

                            {isDone && <Check size={16} className="text-emerald-600" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Ordered Items Summary */}
                  <div className="border-t border-[#D4A85A]/20 pt-4">
                    <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[#6B3F2A]">Ordered Items</p>
                    <div className="space-y-2">
                      {selectedOrder.items.map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-xs py-1">
                          <span className="font-semibold text-[#2C1810]">
                            {item.name} <span className="text-[#6B3F2A] font-bold">x{item.quantity}</span>
                          </span>
                          <span className="font-bold text-[#6B3F2A]">₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex justify-between border-t border-[#D4A85A]/20 pt-2 text-sm font-black text-[#2C1810]">
                      <span>Total Paid:</span>
                      <span className="text-[#6B3F2A]">₹{selectedOrder.totalAmount}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-12 text-center text-xs text-[#2C1810]/50 font-bold">
                  No active order selected. Select an order from your history tab!
                </div>
              )
            )}

            {/* ── TAB 2: ORDER HISTORY VIEW ───────────────────────────────── */}
            {activeTab === "history" && (
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#6B3F2A]">Past &amp; Active Orders</p>
                  <button
                    onClick={fetchOrderHistory}
                    disabled={historyLoading}
                    className="flex items-center gap-1 text-[11px] font-semibold text-[#6B3F2A] hover:underline"
                  >
                    <RefreshCw size={12} className={historyLoading ? "animate-spin" : ""} /> Refresh
                  </button>
                </div>

                {historyLoading && allOrders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <Loader2 size={24} className="animate-spin text-[#6B3F2A]" />
                    <p className="mt-2 text-xs text-[#2C1810]/50">Loading history…</p>
                  </div>
                ) : allOrders.length === 0 ? (
                  <div className="py-16 text-center">
                    <ShoppingBag size={40} className="mx-auto mb-2 text-[#D4A85A]/40" />
                    <p className="text-sm font-bold text-[#2C1810]/50">No order history found</p>
                    <p className="text-xs text-[#2C1810]/40 mt-1">Place an order from our cafe menu to see it here!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {allOrders.map((ord) => {
                      const isSelected = selectedOrder?._id === ord._id;
                      return (
                        <div
                          key={ord._id}
                          onClick={() => {
                            setSelectedOrder(ord);
                            setActiveTab("tracker");
                          }}
                          className={`group cursor-pointer rounded-2xl border p-4 transition-all ${
                            isSelected
                              ? "border-[#6B3F2A] bg-white shadow-md"
                              : "border-[#D4A85A]/25 bg-white hover:border-[#6B3F2A]/40 hover:shadow-sm"
                          }`}
                        >
                          <div className="flex items-center justify-between border-b border-[#D4A85A]/15 pb-2.5 mb-2.5">
                            <div>
                              <p className="text-xs font-black text-[#6B3F2A]">#{ord.orderNumber}</p>
                              <p className="text-[10px] text-[#2C1810]/45">
                                {new Date(ord.createdAt).toLocaleString("en-IN", {
                                  dateStyle: "medium",
                                  timeStyle: "short",
                                })}
                              </p>
                            </div>
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase text-white ${
                                ord.status === "Ready"
                                  ? "bg-emerald-600 animate-pulse"
                                  : ord.status === "Collected"
                                  ? "bg-[#4A7C59]"
                                  : "bg-[#6B3F2A]"
                              }`}
                            >
                              {ord.status}
                            </span>
                          </div>

                          {/* Items brief */}
                          <div className="text-xs space-y-1 mb-3 text-[#2C1810]/80">
                            {ord.items.map((it, idx) => (
                              <div key={idx} className="flex justify-between">
                                <span>{it.name} <strong className="text-[#6B3F2A]">x{it.quantity}</strong></span>
                                <span className="font-semibold text-[#6B3F2A]">₹{it.price * it.quantity}</span>
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center justify-between border-t border-[#D4A85A]/15 pt-2 text-xs">
                            <span className="font-black text-[#2C1810]">Total Paid: ₹{ord.totalAmount}</span>
                            <span className="flex items-center gap-1 font-bold text-[#6B3F2A] group-hover:translate-x-1 transition-transform">
                              Track Status <ChevronRight size={14} />
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
