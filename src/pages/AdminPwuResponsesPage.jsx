import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardList, Search, RefreshCw, Loader2, Download, Phone, Mail,
  MapPin, BookOpen, Layers, CheckCircle2, Clock, AlertCircle, Trash2,
  ExternalLink, MessageSquare, X, Eye, Sparkles, Filter
} from "lucide-react";
import PageTransition from "../components/PageTransition.jsx";
import AdminNavbar from "../components/AdminNavbar.jsx";
import { API_BASE } from "../config.js";

const STATUS_COLORS = {
  Pending: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  Contacted: "border-cyan-500/40 bg-cyan-500/10 text-cyan-300",
  "Quotation Sent": "border-blue-500/40 bg-blue-500/10 text-blue-300",
  "In Progress": "border-purple-500/40 bg-purple-500/10 text-purple-300",
  Completed: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  Cancelled: "border-red-500/40 bg-red-500/10 text-red-300",
};

export default function AdminPwuResponsesPage() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);

  const [responses, setResponses] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, contacted: 0, quotationSent: 0, completed: 0 });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [message, setMessage] = useState({ type: "", text: "" });

  const [selectedResponse, setSelectedResponse] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [adminNoteInput, setAdminNoteInput] = useState("");

  // Check admin authentication on mount
  useEffect(() => {
    fetch(`${API_BASE}/auth/me`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success && data.user?.role === "admin") {
          setAuthed(true);
          fetchResponses();
        } else {
          setAuthed(false);
        }
      })
      .catch(() => setAuthed(false))
      .finally(() => setChecking(false));
  }, []);

  // Lock background scroll when modal is open
  useEffect(() => {
    if (!selectedResponse) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") setSelectedResponse(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [selectedResponse]);

  const fetchResponses = async () => {
    setLoading(true);
    setMessage({ type: "", text: "" });
    try {
      const params = new URLSearchParams();
      if (filterStatus && filterStatus !== "all") params.append("status", filterStatus);
      if (searchQuery.trim()) params.append("search", searchQuery.trim());

      const res = await fetch(`${API_BASE}/pwu/responses?${params.toString()}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResponses(data.responses || []);
        if (data.stats) setStats(data.stats);
      } else {
        setMessage({ type: "error", text: data.message || "Failed to load responses." });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to connect to server." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authed) {
      const timer = setTimeout(() => {
        fetchResponses();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [filterStatus, searchQuery]);

  const handleUpdateStatus = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`${API_BASE}/pwu/responses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResponses((prev) =>
          prev.map((r) => (r._id === id ? { ...r, status: newStatus } : r))
        );
        if (selectedResponse?._id === id) {
          setSelectedResponse((prev) => ({ ...prev, status: newStatus }));
        }
      } else {
        alert(data.message || "Failed to update status.");
      }
    } catch {
      alert("Error connecting to server.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSaveNotes = async (id) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`${API_BASE}/pwu/responses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ adminNotes: adminNoteInput }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResponses((prev) =>
          prev.map((r) => (r._id === id ? { ...r, adminNotes: adminNoteInput } : r))
        );
        if (selectedResponse?._id === id) {
          setSelectedResponse((prev) => ({ ...prev, adminNotes: adminNoteInput }));
        }
        alert("Admin notes saved!");
      }
    } catch {
      alert("Error connecting to server.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this quotation inquiry record?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${API_BASE}/pwu/responses/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResponses((prev) => prev.filter((r) => r._id !== id));
        if (selectedResponse?._id === id) setSelectedResponse(null);
      } else {
        alert(data.message || "Failed to delete record.");
      }
    } catch {
      alert("Error connecting to server.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleExportCsv = () => {
    window.open(`${API_BASE}/pwu/export`, "_blank");
  };

  if (checking) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950 text-white">
        <Loader2 className="animate-spin text-cyan-400" size={32} />
      </div>
    );
  }

  if (!authed) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center text-white">
          <ClipboardList size={48} className="text-cyan-400 mb-4" />
          <h1 className="text-2xl font-black">Admin Access Required</h1>
          <p className="mt-2 text-sm text-white/60 max-w-sm">
            Please log in with an administrator account to view Publish With Us (PWU) form responses.
          </p>
          <a
            href="/admin"
            className="mt-6 rounded-full bg-cyan-400 px-6 py-2.5 text-xs font-black uppercase tracking-wider text-black hover:bg-cyan-300 transition"
          >
            Go to Admin Login
          </a>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-zinc-950 text-white">
        {/* Navigation */}
        <AdminNavbar activeTab="pwu_responses" />

        <div className="section-shell py-8 md:py-12 space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-0.5 text-[10px] font-black uppercase tracking-widest text-cyan-300">
                  ADMIN PANEL
                </span>
              </div>
              <h1 className="mt-2 text-3xl md:text-4xl font-black text-white flex items-center gap-3">
                <ClipboardList className="text-cyan-400" size={32} /> PWU Form Response
              </h1>
              <p className="mt-1 text-xs md:text-sm text-white/60">
                Publish With Us — Authors book details submitted for publishing quotations.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={fetchResponses}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/10 hover:border-white/20 transition cursor-pointer"
              >
                <RefreshCw size={14} className={loading ? "animate-spin text-cyan-400" : ""} />
                <span>Refresh</span>
              </button>

              <button
                type="button"
                onClick={handleExportCsv}
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/15 px-4 py-2.5 text-xs font-extrabold text-emerald-300 hover:bg-emerald-400/25 transition cursor-pointer"
              >
                <Download size={14} />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <span className="text-[11px] font-black uppercase tracking-wider text-white/50">Total Inquiries</span>
              <div className="mt-2 text-3xl font-black text-white">{stats.total}</div>
            </div>

            <div className="rounded-2xl border border-amber-400/20 bg-amber-950/20 p-5">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-300">Pending Review</span>
              <div className="mt-2 text-3xl font-black text-amber-300">{stats.pending}</div>
            </div>

            <div className="rounded-2xl border border-blue-400/20 bg-blue-950/20 p-5">
              <span className="text-[11px] font-black uppercase tracking-wider text-blue-300">Quotation Sent</span>
              <div className="mt-2 text-3xl font-black text-blue-300">{stats.quotationSent}</div>
            </div>

            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-950/20 p-5">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-300">Completed</span>
              <div className="mt-2 text-3xl font-black text-emerald-300">{stats.completed}</div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder="Search by author name, phone, email, or book..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-black/40 pl-10 pr-4 py-2.5 text-xs text-white placeholder-white/40 outline-none focus:border-cyan-400 focus:bg-black/60 transition"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
              {["all", "Pending", "Contacted", "Quotation Sent", "In Progress", "Completed", "Cancelled"].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setFilterStatus(st)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold whitespace-nowrap transition cursor-pointer border ${
                    filterStatus === st
                      ? "border-cyan-400 bg-cyan-400/20 text-cyan-200"
                      : "border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {st === "all" ? "All Inquiries" : st}
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          {message.text && (
            <div
              className={`rounded-xl p-3 text-xs font-semibold border ${
                message.type === "error"
                  ? "border-red-400/40 bg-red-950/50 text-red-200"
                  : "border-emerald-400/40 bg-emerald-950/50 text-emerald-200"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Responses Table / Cards */}
          {loading && responses.length === 0 ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-cyan-400" size={32} />
            </div>
          ) : responses.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-12 text-center">
              <ClipboardList size={40} className="mx-auto text-white/30 mb-3" />
              <h3 className="text-lg font-black text-white">No PWU Responses Found</h3>
              <p className="mt-1 text-xs text-white/50">
                {searchQuery || filterStatus !== "all"
                  ? "Try adjusting your search or status filter."
                  : "New quotation inquiries submitted by authors on the website will appear here."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {responses.map((item) => (
                <div
                  key={item._id}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6 transition hover:border-white/20 hover:bg-white/[0.05] space-y-4"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/10 pb-4">
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="text-base md:text-lg font-black text-white">{item.authorName}</h3>
                        <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${STATUS_COLORS[item.status] || "border-white/20 text-white/70"}`}>
                          {item.status}
                        </span>
                        <span className="text-[11px] text-white/40">
                          {new Date(item.createdAt).toLocaleString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-4 text-xs text-white/70 flex-wrap">
                        <a
                          href={`tel:${item.authorNumber}`}
                          className="inline-flex items-center gap-1 hover:text-cyan-300 transition"
                        >
                          <Phone size={12} className="text-cyan-400" /> {item.authorNumber}
                        </a>
                        <a
                          href={`https://wa.me/91${item.authorNumber.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-emerald-300 font-bold hover:underline"
                        >
                          <MessageSquare size={12} /> WhatsApp
                        </a>
                        <a
                          href={`mailto:${item.authorEmail}`}
                          className="inline-flex items-center gap-1 hover:text-cyan-300 transition"
                        >
                          <Mail size={12} className="text-cyan-400" /> {item.authorEmail}
                        </a>
                      </div>
                    </div>

                    {/* Status Changer & Quick Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={item.status}
                        disabled={updatingId === item._id}
                        onChange={(e) => handleUpdateStatus(item._id, e.target.value)}
                        className="rounded-xl border border-white/15 bg-black/50 px-3 py-1.5 text-xs font-bold text-white outline-none focus:border-cyan-400 cursor-pointer"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Quotation Sent">Quotation Sent</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedResponse(item);
                          setAdminNoteInput(item.adminNotes || "");
                        }}
                        className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/70 hover:text-white hover:bg-white/10 transition cursor-pointer"
                        title="View Full Details"
                      >
                        <Eye size={15} />
                      </button>

                      <button
                        type="button"
                        disabled={deletingId === item._id}
                        onClick={() => handleDelete(item._id)}
                        className="rounded-xl border border-red-500/20 bg-red-500/10 p-2 text-red-300 hover:bg-red-500/20 transition cursor-pointer"
                        title="Delete Record"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Book & Print Specifications Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-black/30 rounded-xl p-3 text-xs">
                    <div>
                      <span className="text-[10px] text-white/45 font-black uppercase">BOOK NAME</span>
                      <p className="font-extrabold text-cyan-200 mt-0.5 truncate">{item.bookName}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-white/45 font-black uppercase">LANGUAGE</span>
                      <p className="font-bold text-white mt-0.5">{item.bookLanguage}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-white/45 font-black uppercase">PAGE COUNT (A5)</span>
                      <p className="font-bold text-white mt-0.5">{item.bookPageCount}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-white/45 font-black uppercase">COPIES NEEDED</span>
                      <p className="font-bold text-amber-300 mt-0.5">{item.copiesNeeded}</p>
                    </div>
                  </div>

                  {/* Address & Selected Add-ons */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-white/70">
                    <div className="flex items-start gap-1.5">
                      <MapPin size={13} className="text-white/40 shrink-0 mt-0.5" />
                      <span className="leading-snug">{item.authorAddress}</span>
                    </div>

                    {item.selectedAddons && item.selectedAddons.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                        <span className="text-[10px] text-white/40 uppercase font-black">ADD ONS:</span>
                        {item.selectedAddons.map((ad) => (
                          <span
                            key={ad}
                            className="rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-2 py-0.5 text-[10px] font-bold text-cyan-300"
                          >
                            {ad}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Admin Notes Preview */}
                  {item.adminNotes && (
                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-2.5 text-xs text-amber-200/90 flex items-start gap-2">
                      <MessageSquare size={13} className="text-amber-400 shrink-0 mt-0.5" />
                      <span><strong>Internal Admin Note:</strong> {item.adminNotes}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FULL DETAILS MODAL */}
        {createPortal(
          <AnimatePresence>
            {selectedResponse && (
              <div
                className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
                onClick={() => setSelectedResponse(null)}
                data-lenis-prevent="true"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  onClick={(e) => e.stopPropagation()}
                  onWheel={(e) => e.stopPropagation()}
                  data-lenis-prevent="true"
                  tabIndex={0}
                  className="relative flex flex-col max-h-[88vh] w-full max-w-2xl overflow-hidden rounded-3xl border border-white/15 bg-zinc-950 shadow-2xl outline-none"
                >
                  {/* Sticky Modal Header */}
                  <div className="flex items-start justify-between gap-4 border-b border-white/10 p-6 md:p-8 pb-4 shrink-0 bg-zinc-950/90 backdrop-blur z-10">
                    <div>
                      <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${STATUS_COLORS[selectedResponse.status] || "border-white/20 text-white/70"}`}>
                        {selectedResponse.status}
                      </span>
                      <h2 className="mt-2 text-2xl font-black text-white">{selectedResponse.bookName}</h2>
                      <p className="text-xs text-white/60">
                        Submitted by <strong className="text-white">{selectedResponse.authorName}</strong> on {new Date(selectedResponse.createdAt).toLocaleString("en-IN")}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedResponse(null)}
                      className="rounded-full border border-white/10 p-2 text-white/60 hover:text-white hover:bg-white/10 transition cursor-pointer"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Scrollable Body */}
                  <div
                    className="flex-1 overflow-y-auto overscroll-contain p-6 md:p-8 pt-4 space-y-6 custom-scrollbar"
                    data-lenis-prevent="true"
                  >
                    {/* Author Info */}
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-3">
                      <h4 className="text-xs font-black uppercase tracking-wider text-cyan-300">AUTHOR DETAILS</h4>
                      <div className="grid gap-3 sm:grid-cols-2 text-xs">
                        <div>
                          <span className="text-white/40 block">AUTHOR NAME:</span>
                          <strong className="text-white text-sm">{selectedResponse.authorName}</strong>
                        </div>
                        <div>
                          <span className="text-white/40 block">AUTHOR PHONE:</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <strong className="text-white">{selectedResponse.authorNumber}</strong>
                            <a
                              href={`https://wa.me/91${selectedResponse.authorNumber.replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-md bg-emerald-400/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 hover:bg-emerald-400/30"
                            >
                              WhatsApp
                            </a>
                          </div>
                        </div>
                        <div>
                          <span className="text-white/40 block">AUTHOR EMAIL:</span>
                          <a href={`mailto:${selectedResponse.authorEmail}`} className="text-cyan-300 hover:underline">
                            {selectedResponse.authorEmail}
                          </a>
                        </div>
                        <div>
                          <span className="text-white/40 block">AUTHOR ADDRESS:</span>
                          <p className="text-white/80">{selectedResponse.authorAddress}</p>
                        </div>
                      </div>
                    </div>

                    {/* Book & Printing Info */}
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-3">
                      <h4 className="text-xs font-black uppercase tracking-wider text-cyan-300">BOOK SPECIFICATIONS</h4>
                      <div className="grid gap-3 sm:grid-cols-2 text-xs">
                        <div>
                          <span className="text-white/40 block">BOOK NAME:</span>
                          <strong className="text-white text-sm">{selectedResponse.bookName}</strong>
                        </div>
                        <div>
                          <span className="text-white/40 block">LANGUAGE:</span>
                          <strong className="text-white">{selectedResponse.bookLanguage}</strong>
                        </div>
                        <div>
                          <span className="text-white/40 block">BOOK PAGE COUNT (A5):</span>
                          <strong className="text-white">{selectedResponse.bookPageCount}</strong>
                        </div>
                        <div>
                          <span className="text-white/40 block">NEED BOOK COPIES TO BE PRINTED:</span>
                          <strong className="text-amber-300 font-extrabold">{selectedResponse.copiesNeeded}</strong>
                        </div>
                      </div>

                      {selectedResponse.selectedAddons?.length > 0 && (
                        <div className="pt-3 border-t border-white/10">
                          <span className="text-white/40 block text-xs mb-1.5">SELECTED ADD-ONS:</span>
                          <div className="flex gap-2 flex-wrap">
                            {selectedResponse.selectedAddons.map((ad) => (
                              <span
                                key={ad}
                                className="rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-1 text-xs font-bold text-cyan-300"
                              >
                                {ad}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedResponse.notes && (
                        <div className="pt-3 border-t border-white/10 text-xs">
                          <span className="text-white/40 block">AUTHOR NOTES / INSTRUCTIONS:</span>
                          <p className="mt-1 text-white/80 italic">"{selectedResponse.notes}"</p>
                        </div>
                      )}
                    </div>

                    {/* Internal Admin Notes */}
                    <div className="rounded-2xl border border-amber-400/20 bg-amber-950/20 p-5 space-y-3">
                      <h4 className="text-xs font-black uppercase tracking-wider text-amber-300">INTERNAL ADMIN NOTES</h4>
                      <textarea
                        rows={3}
                        placeholder="Add internal notes (e.g., Quotation of ₹12,500 sent on WhatsApp, author requested 150 copies...)"
                        value={adminNoteInput}
                        onChange={(e) => setAdminNoteInput(e.target.value)}
                        className="w-full rounded-xl border border-white/15 bg-black/40 p-3 text-xs text-white placeholder-white/30 outline-none focus:border-amber-400"
                      />
                      <div className="flex justify-end">
                        <button
                          type="button"
                          disabled={updatingId === selectedResponse._id}
                          onClick={() => handleSaveNotes(selectedResponse._id)}
                          className="rounded-xl bg-amber-400 px-4 py-2 text-xs font-black text-black hover:bg-amber-300 transition cursor-pointer"
                        >
                          Save Admin Note
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
      </div>
    </PageTransition>
  );
}
