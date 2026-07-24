import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, CheckCircle2, XCircle, AlertCircle, X, Loader2, BookOpen, ChevronRight, PackageCheck, ShoppingBag, Truck, MapPin, Package, Box, Copy, ExternalLink, Calendar, ChevronDown, ChevronUp, Navigation } from "lucide-react";
import { API_BASE, SERVER_URL } from "../config.js";

function ShipmentTracker({ purchase }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const steps = [
    { key: "processing", label: "Processing", icon: Package },
    { key: "packed", label: "Packed", icon: Box },
    { key: "shipped", label: "Shipped", icon: Truck },
    { key: "out_for_delivery", label: "Out for Delivery", icon: Navigation },
    { key: "delivered", label: "Delivered", icon: CheckCircle2 }
  ];

  const statusOrder = ["processing", "packed", "shipped", "out_for_delivery", "delivered"];
  const currentIdx = statusOrder.indexOf(purchase.shipmentStatus || "processing");

  const handleCopyTracking = () => {
    if (purchase.trackingNumber) {
      navigator.clipboard.writeText(purchase.trackingNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const currentLoc = purchase.currentLocation || "Main Warehouse";
  const courier = purchase.courierService || "Standard Logistics";
  const statusLabel = (purchase.shipmentStatus || "processing").toUpperCase().replace(/_/g, " ");

  return (
    <div className="mt-3 rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-950/30 via-zinc-900/60 to-zinc-950 p-4 space-y-4">
      {/* Header Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-cyan-400/15 text-cyan-300">
            <Truck size={16} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-cyan-300/80">Paperback Shipment Tracking</span>
            <h5 className="text-xs font-black text-white flex items-center gap-1.5">
              <span>{statusLabel}</span>
              {currentLoc && (
                <span className="text-[11px] font-semibold text-cyan-200/70">({currentLoc})</span>
              )}
            </h5>
          </div>
        </div>

        {purchase.estimatedDeliveryDate && (
          <div className="flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/20">
            <Calendar size={12} />
            <span>Est. Delivery: {new Date(purchase.estimatedDeliveryDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
          </div>
        )}
      </div>

      {/* Visual Step Progress Bar */}
      <div className="py-2">
        <div className="relative flex items-center justify-between">
          <div className="absolute left-0 top-1/2 -z-0 h-1 w-full -translate-y-1/2 bg-white/10 rounded-full" />
          <div
            className="absolute left-0 top-1/2 -z-0 h-1 -translate-y-1/2 bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full transition-all duration-500"
            style={{ width: `${Math.max(0, (currentIdx / (steps.length - 1)) * 100)}%` }}
          />

          {steps.map((s, idx) => {
            const IconComp = s.icon;
            const isDone = idx <= currentIdx;
            const isCurrent = idx === currentIdx;

            return (
              <div key={s.key} className="relative z-10 flex flex-col items-center gap-1">
                <div
                  className={`grid h-7 w-7 place-items-center rounded-full text-xs font-black transition-all ${
                    isDone
                      ? isCurrent
                        ? "bg-cyan-400 text-black ring-4 ring-cyan-400/30 scale-110 shadow-lg"
                        : "bg-emerald-500 text-black"
                      : "bg-zinc-800 text-white/40 border border-white/10"
                  }`}
                >
                  <IconComp size={13} />
                </div>
                <span
                  className={`text-[9px] font-extrabold uppercase tracking-tight hidden sm:block ${
                    isDone ? (isCurrent ? "text-cyan-300" : "text-white/80") : "text-white/30"
                  }`}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tracking Details & Courier Info */}
      <div className="grid gap-3 sm:grid-cols-2 text-xs rounded-xl bg-white/[0.03] p-3 border border-white/5">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 block">Logistics / Courier Partner</span>
          <span className="font-extrabold text-white">{courier}</span>
        </div>

        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 block">AWB / Tracking Number</span>
          {purchase.trackingNumber ? (
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-mono font-bold text-cyan-300">{purchase.trackingNumber}</span>
              <button
                type="button"
                onClick={handleCopyTracking}
                className="text-[10px] text-white/60 hover:text-white flex items-center gap-0.5"
              >
                <Copy size={11} /> {copied ? "Copied" : "Copy"}
              </button>
              {purchase.trackingUrl && (
                <a
                  href={purchase.trackingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-400 hover:underline flex items-center gap-0.5 text-[10px]"
                >
                  <ExternalLink size={11} /> Track
                </a>
              )}
            </div>
          ) : (
            <span className="text-white/40 italic">Awaiting Tracking Number</span>
          )}
        </div>

        {purchase.deliveryAddress && (
          <div className="sm:col-span-2 border-t border-white/5 pt-2 mt-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-0.5">Shipping Address</span>
            <span className="text-white/70 leading-relaxed text-[11px]">
              {[
                purchase.deliveryAddress.co ? `C/O ${purchase.deliveryAddress.co}` : null,
                purchase.deliveryAddress.nearbyLocation ? `Landmark: ${purchase.deliveryAddress.nearbyLocation}` : null,
                purchase.deliveryAddress.block ? `Block: ${purchase.deliveryAddress.block}` : null,
                purchase.deliveryAddress.district,
                purchase.deliveryAddress.postOffice ? `PO: ${purchase.deliveryAddress.postOffice}` : null,
                purchase.deliveryAddress.pin ? `PIN: ${purchase.deliveryAddress.pin}` : null,
                purchase.deliveryAddress.country || "India"
              ].filter(Boolean).join(", ")}
            </span>
          </div>
        )}
      </div>

      {/* Expandable Tracking Checkpoints */}
      {purchase.shipmentHistory && purchase.shipmentHistory.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="flex items-center justify-between w-full text-[11px] font-bold text-cyan-300 hover:text-cyan-200 transition py-1"
          >
            <span>Live Checkpoints & Location Updates ({purchase.shipmentHistory.length})</span>
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {expanded && (
            <div className="mt-2 space-y-2 border-t border-white/10 pt-2.5 custom-scrollbar max-h-48 overflow-y-auto pr-1">
              {[...purchase.shipmentHistory].reverse().map((chk, i) => (
                <div key={i} className="flex items-start gap-2.5 text-[11px] bg-black/40 p-2.5 rounded-xl border border-white/5">
                  <div className="mt-0.5 grid h-4 w-4 place-items-center rounded-full bg-cyan-400/20 text-cyan-300 shrink-0">
                    <MapPin size={10} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white uppercase text-[10px]">{chk.status.replace(/_/g, " ")}</span>
                      <span className="text-[9px] text-white/40">{new Date(chk.timestamp).toLocaleString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                    {chk.location && <p className="text-cyan-200/90 font-semibold">{chk.location}</p>}
                    {chk.note && <p className="text-white/50 text-[10px] mt-0.5">{chk.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function MyOrdersModal({ isOpen, onClose, onReadBook }) {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMyOrders = () => {
    setLoading(true);
    setError("");
    fetch(`${API_BASE}/purchase/me`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPurchases(data.purchases || []);
        } else {
          setError(data.message || "Failed to load purchase history.");
        }
      })
      .catch(() => setError("Unable to connect to server."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isOpen) {
      fetchMyOrders();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[140] flex items-center justify-center bg-black/80 p-4 backdrop-blur-xl"
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
          {/* Ambient Glow */}
          <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-cyan-500/15 blur-[100px]" />
          <div className="pointer-events-none absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-indigo-500/15 blur-[100px]" />

          {/* Header */}
          <div className="relative z-10 mb-5 flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3.5">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 to-indigo-500 text-black shadow-lg shadow-cyan-500/25 ring-1 ring-cyan-400/40">
                <PackageCheck size={22} className="stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-wider text-white">
                  My Orders & Status
                </h3>
                <p className="text-xs text-white/50">Track your paperback shipments & ebook approvals</p>
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

          {/* Content Body */}
          <div className="relative z-10 flex-1 min-h-0 overflow-y-auto pr-1 custom-scrollbar" data-lenis-prevent>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-white/50">
                <Loader2 size={36} className="animate-spin text-cyan-400" />
                <p className="text-xs font-semibold">Loading your order requests...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-red-400">
                <AlertCircle size={36} className="mb-2" />
                <p className="text-sm font-bold">{error}</p>
                <button
                  onClick={fetchMyOrders}
                  className="mt-4 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white hover:bg-white/10"
                >
                  Try Again
                </button>
              </div>
            ) : purchases.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="grid h-16 w-16 place-items-center rounded-3xl border border-white/10 bg-white/[0.03] text-white/30 mb-4 backdrop-blur-sm shadow-xl">
                  <ShoppingBag size={32} />
                </div>
                <h4 className="text-lg font-extrabold text-white">No Orders Found</h4>
                <p className="mt-1 text-xs text-white/50 max-w-xs">
                  You haven't placed any book purchase requests yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {purchases.map((purchase) => {
                  const book = purchase.bookId;
                  const isApproved = purchase.status === "approved";
                  const isPending = purchase.status === "pending";
                  const isRejected = purchase.status === "rejected";
                  const isPhysical = purchase.format === "paperback" || purchase.format === "hardcover";

                  const coverUrl = book?.cover?.url
                    ? book.cover.url.startsWith("/uploads")
                      ? `${SERVER_URL}${book.cover.url}`
                      : book.cover.url
                    : null;

                  return (
                    <div
                      key={purchase._id}
                      className="group relative rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition-all duration-300 hover:border-cyan-400/30 hover:bg-white/[0.06] backdrop-blur-sm"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        {/* Book Info */}
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="h-16 w-12 shrink-0 overflow-hidden rounded-xl bg-zinc-900 border border-white/15 shadow-md">
                            {coverUrl ? (
                              <img
                                src={coverUrl}
                                alt={book?.title || "Book"}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full bg-gradient-to-br from-cyan-500 to-indigo-600 grid place-items-center text-[9px] font-black text-white">
                                BOOK
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <h4 className="truncate text-base font-extrabold text-white">
                              {book?.title || "Unknown Book"}
                            </h4>
                            <p className="truncate text-xs text-white/50">{book?.author || ""}</p>
                            
                            <div className="mt-1.5 flex flex-wrap items-center gap-2">
                              <span className="rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-cyan-300">
                                {purchase.format || "EBOOK"}
                              </span>
                              <span className="text-xs font-black text-white">
                                ₹{purchase.amount}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Approval Status Tag & Actions */}
                        <div className="flex flex-col sm:items-end gap-2 shrink-0">
                          {isPending && (
                            <div className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-extrabold text-amber-300">
                              <Clock size={14} className="animate-spin" />
                              <span>PENDING REVIEW</span>
                            </div>
                          )}

                          {isApproved && (
                            <div className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-extrabold text-emerald-300">
                              <CheckCircle2 size={14} />
                              <span>{isPhysical ? "ORDER CONFIRMED" : "APPROVED"}</span>
                            </div>
                          )}

                          {isRejected && (
                            <div className="flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-extrabold text-red-300">
                              <XCircle size={14} />
                              <span>DECLINED</span>
                            </div>
                          )}

                          <span className="text-[10px] font-medium text-white/40">
                            {formatDate(purchase.createdAt)}
                          </span>
                        </div>
                      </div>

                      {/* Detail Notes */}
                      <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <span className="text-white/40 font-mono text-[11px]">
                          Txn ID: <strong className="text-white/70">{purchase.transactionNumber || "N/A"}</strong>
                        </span>

                        {isApproved && purchase.format === "ebook" && onReadBook && (
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onReadBook(book);
                            }}
                            className="flex items-center gap-1.5 rounded-xl bg-cyan-400 px-3.5 py-1.5 text-xs font-black uppercase text-black hover:bg-cyan-300 transition"
                          >
                            <BookOpen size={13} /> Read E-Book
                          </button>
                        )}
                      </div>

                      {isRejected && purchase.adminNote && (
                        <div className="mt-2.5 rounded-xl border border-red-500/20 bg-red-500/5 p-2.5 text-xs text-red-300">
                          <strong>Admin Note:</strong> {purchase.adminNote}
                        </div>
                      )}

                      {/* Paperback Shipment Tracker Card */}
                      {isPhysical && (isApproved || isPending) && (
                        <ShipmentTracker purchase={purchase} />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
