import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, CheckCircle2, XCircle, AlertCircle, X, Loader2, BookOpen, ChevronRight, PackageCheck, ShoppingBag } from "lucide-react";
import { API_BASE, SERVER_URL } from "../config.js";

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
                  My Orders & Approval Status
                </h3>
                <p className="text-xs text-white/50">Track your order verification and book access</p>
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
                              <span className="rounded-lg border border-white/15 bg-white/5 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-cyan-300">
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
                              <span>PENDING APPROVAL</span>
                            </div>
                          )}

                          {isApproved && (
                            <div className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-extrabold text-emerald-300">
                              <CheckCircle2 size={14} />
                              <span>APPROVED</span>
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
