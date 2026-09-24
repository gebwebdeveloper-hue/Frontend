import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  Search,
  RefreshCw,
  Loader2,
  Download,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  Clock,
  AlertCircle,
  Trash2,
  ExternalLink,
  MessageSquare,
  X,
  Eye,
  Filter,
  UserCheck,
  Award,
  FileText
} from "lucide-react";
import PageTransition from "../components/PageTransition.jsx";
import AdminNavbar from "../components/AdminNavbar.jsx";
import { API_BASE, SERVER_URL } from "../config.js";

const getMediaUrl = (url) => (!url ? "" : url.startsWith("http") ? url : `${SERVER_URL}${url}`);

const STATUS_COLORS = {
  Pending: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  Reviewed: "border-cyan-500/40 bg-cyan-500/10 text-cyan-300",
  Shortlisted: "border-blue-500/40 bg-blue-500/10 text-blue-300",
  Interviewed: "border-purple-500/40 bg-purple-500/10 text-purple-300",
  Hired: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  Rejected: "border-rose-500/40 bg-rose-500/10 text-rose-300",
};

const ROLE_COLORS = {
  Sales: "text-amber-400 bg-amber-400/10 border-amber-400/30",
  Marketing: "text-cyan-400 bg-cyan-400/10 border-cyan-400/30",
  "Cover artist": "text-fuchsia-400 bg-fuchsia-400/10 border-fuchsia-400/30",
  "Book editor": "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
  Accountant: "text-violet-400 bg-violet-400/10 border-violet-400/30",
  "Designer role": "text-rose-400 bg-rose-400/10 border-rose-400/30",
  "Office assistant": "text-teal-400 bg-teal-400/10 border-teal-400/30",
};

export default function AdminCareerResponsesPage() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);

  const [responses, setResponses] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    reviewed: 0,
    shortlisted: 0,
    interviewed: 0,
    hired: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [message, setMessage] = useState({ type: "", text: "" });

  const [selectedResponse, setSelectedResponse] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [adminNoteInput, setAdminNoteInput] = useState("");

  // Check admin authentication
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
      if (filterRole && filterRole !== "All") params.append("role", filterRole);
      if (filterStatus && filterStatus !== "All") params.append("status", filterStatus);
      if (searchQuery.trim()) params.append("search", searchQuery.trim());

      const res = await fetch(`${API_BASE}/careers/responses?${params.toString()}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResponses(data.data || []);
        if (data.stats) setStats(data.stats);
      } else {
        setMessage({
          type: "error",
          text: data.message || "Failed to load career responses.",
        });
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
  }, [searchQuery, filterRole, filterStatus, authed]);

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`${API_BASE}/careers/responses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResponses((prev) =>
          prev.map((item) => (item._id === id ? { ...item, status: newStatus } : item))
        );
        if (selectedResponse && selectedResponse._id === id) {
          setSelectedResponse((prev) => ({ ...prev, status: newStatus }));
        }
        setMessage({ type: "success", text: `Status changed to "${newStatus}".` });
      } else {
        setMessage({ type: "error", text: data.message || "Could not update status." });
      }
    } catch {
      setMessage({ type: "error", text: "Network error while updating status." });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSaveNotes = async (id) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`${API_BASE}/careers/responses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ adminNotes: adminNoteInput }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResponses((prev) =>
          prev.map((item) =>
            item._id === id ? { ...item, adminNotes: adminNoteInput } : item
          )
        );
        if (selectedResponse && selectedResponse._id === id) {
          setSelectedResponse((prev) => ({ ...prev, adminNotes: adminNoteInput }));
        }
        setMessage({ type: "success", text: "Admin notes saved successfully." });
      } else {
        setMessage({ type: "error", text: data.message || "Failed to save note." });
      }
    } catch {
      setMessage({ type: "error", text: "Network error while saving note." });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to permanently delete this application record?")) {
      return;
    }
    setDeletingId(id);
    try {
      const res = await fetch(`${API_BASE}/careers/responses/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResponses((prev) => prev.filter((item) => item._id !== id));
        if (selectedResponse && selectedResponse._id === id) {
          setSelectedResponse(null);
        }
        setMessage({ type: "success", text: "Application deleted successfully." });
      } else {
        setMessage({ type: "error", text: data.message || "Could not delete record." });
      }
    } catch {
      setMessage({ type: "error", text: "Network error while deleting." });
    } finally {
      setDeletingId(null);
    }
  };

  const openDetailsModal = (item) => {
    setSelectedResponse(item);
    setAdminNoteInput(item.adminNotes || "");
  };

  const handleExportCsv = () => {
    window.open(`${API_BASE}/careers/export`, "_blank");
  };

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <Loader2 className="animate-spin text-cyan-400" size={32} />
      </div>
    );
  }

  if (!authed) {
    return (
      <PageTransition>
        <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-white">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900/50 p-8 text-center backdrop-blur">
            <Briefcase className="mx-auto mb-4 text-rose-400" size={48} />
            <h1 className="text-2xl font-black">Admin Access Required</h1>
            <p className="mt-2 text-sm text-white/60">
              You must be logged in as an administrator to view Careers Responses.
            </p>
            <a
              href="/admin"
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-cyan-400 px-6 py-2.5 text-sm font-bold text-black hover:bg-cyan-300 transition"
            >
              Go to Admin Login
            </a>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#06080d] text-white">
        <AdminNavbar />

        <main className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pt-20">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                <Briefcase size={14} /> Careers Responses
              </div>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
                Job Applications Dashboard
              </h1>
              <p className="mt-1 text-sm text-white/60">
                Review applicant responses, filter by target roles, update interview stages, and manage recruitment.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={fetchResponses}
                disabled={loading}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white hover:bg-white/10 transition"
              >
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                Refresh
              </button>

              <button
                type="button"
                onClick={handleExportCsv}
                className="flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-black hover:bg-cyan-400 transition shadow-lg shadow-cyan-500/20"
              >
                <Download size={14} />
                Export CSV
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: "Total Received", val: stats.total, color: "text-white" },
              { label: "Pending", val: stats.pending, color: "text-amber-400" },
              { label: "Reviewed", val: stats.reviewed, color: "text-cyan-400" },
              { label: "Shortlisted", val: stats.shortlisted, color: "text-blue-400" },
              { label: "Interviewed", val: stats.interviewed, color: "text-purple-400" },
              { label: "Hired", val: stats.hired, color: "text-emerald-400" },
            ].map((st) => (
              <div
                key={st.label}
                className="rounded-2xl border border-white/10 bg-zinc-900/60 p-4 backdrop-blur-sm"
              >
                <span className="text-[11px] uppercase tracking-wider text-white/50 block font-semibold">
                  {st.label}
                </span>
                <span className={`text-2xl font-black mt-1 block ${st.color}`}>
                  {st.val || 0}
                </span>
              </div>
            ))}
          </div>

          {/* Toast / Alert Message */}
          <AnimatePresence>
            {message.text && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`p-4 rounded-xl flex items-center justify-between gap-3 text-xs font-semibold ${
                  message.type === "success"
                    ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
                    : "bg-rose-500/10 border border-rose-500/30 text-rose-300"
                }`}
              >
                <span>{message.text}</span>
                <button
                  type="button"
                  onClick={() => setMessage({ type: "", text: "" })}
                  className="hover:opacity-70"
                >
                  <X size={14} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-zinc-900/40 border border-white/10 p-4 rounded-2xl backdrop-blur-md">
            {/* Search */}
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search candidate name, mobile, mail, hometown, state..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white placeholder-white/30 text-xs focus:border-cyan-400 outline-none transition"
              />
            </div>

            {/* Role Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/50 flex items-center gap-1">
                <Filter size={13} /> Role:
              </span>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-xs font-semibold text-white focus:border-cyan-400 outline-none cursor-pointer"
              >
                <option value="All">All Roles</option>
                <option value="Sales">Sales</option>
                <option value="Marketing">Marketing</option>
                <option value="Cover artist">Cover artist</option>
                <option value="Book editor">Book editor</option>
                <option value="Accountant">Accountant</option>
                <option value="Designer role">Designer role</option>
                <option value="Office assistant">Office assistant</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/50">Status:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-xs font-semibold text-white focus:border-cyan-400 outline-none cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Reviewed">Reviewed</option>
                <option value="Shortlisted">Shortlisted</option>
                <option value="Interviewed">Interviewed</option>
                <option value="Hired">Hired</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Applications Content */}
          {loading && responses.length === 0 ? (
            <div className="p-16 text-center text-white/40">
              <Loader2 className="mx-auto mb-3 animate-spin text-cyan-400" size={32} />
              <p className="text-sm">Loading applications...</p>
            </div>
          ) : responses.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 p-16 text-center bg-zinc-900/20">
              <Briefcase className="mx-auto mb-4 text-white/20" size={48} />
              <h3 className="text-lg font-bold text-white">No Applications Found</h3>
              <p className="mt-1 text-xs text-white/50">
                {searchQuery || filterRole !== "All" || filterStatus !== "All"
                  ? "Try resetting filters or searching with different keywords."
                  : "Applications submitted on the public Careers page will appear here."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {responses.map((item) => {
                const roleBadgeClass =
                  ROLE_COLORS[item.role] || "text-slate-300 bg-slate-500/10 border-slate-500/20";
                const statusBadgeClass =
                  STATUS_COLORS[item.status] || "border-white/20 text-white/70";

                return (
                  <motion.div
                    key={item._id}
                    layout
                    className="flex flex-col justify-between rounded-2xl border border-white/10 bg-zinc-900/50 p-5 backdrop-blur-sm hover:border-cyan-500/30 transition-all shadow-lg"
                  >
                    <div>
                      {/* Top Bar: Role & Status */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <span
                          className={`rounded-lg border px-2.5 py-1 text-[11px] font-bold tracking-wide ${roleBadgeClass}`}
                        >
                          {item.role}
                        </span>

                        <select
                          value={item.status}
                          disabled={updatingId === item._id}
                          onChange={(e) => handleStatusChange(item._id, e.target.value)}
                          className={`rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-transparent cursor-pointer outline-none ${statusBadgeClass}`}
                        >
                          <option value="Pending" className="bg-zinc-900 text-amber-300">
                            Pending
                          </option>
                          <option value="Reviewed" className="bg-zinc-900 text-cyan-300">
                            Reviewed
                          </option>
                          <option value="Shortlisted" className="bg-zinc-900 text-blue-300">
                            Shortlisted
                          </option>
                          <option value="Interviewed" className="bg-zinc-900 text-purple-300">
                            Interviewed
                          </option>
                          <option value="Hired" className="bg-zinc-900 text-emerald-300">
                            Hired
                          </option>
                          <option value="Rejected" className="bg-zinc-900 text-rose-300">
                            Rejected
                          </option>
                        </select>
                      </div>

                      {/* Applicant Name */}
                      <h3 className="text-lg font-bold text-white">{item.name}</h3>

                      {/* Contact items */}
                      <div className="mt-3 space-y-2 text-xs text-white/70">
                        {/* Phone */}
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-white/50">
                            <Phone size={13} className="text-cyan-400" />
                            {item.number}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <a
                              href={`https://wa.me/91${item.number.replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 hover:bg-emerald-500/30 transition"
                            >
                              WhatsApp
                            </a>
                            <a
                              href={`tel:${item.number}`}
                              className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-bold text-white hover:bg-white/20 transition"
                            >
                              Call
                            </a>
                          </div>
                        </div>

                        {/* Email */}
                        <div className="flex items-center gap-1.5 truncate">
                          <Mail size={13} className="text-cyan-400 flex-shrink-0" />
                          <a
                            href={`mailto:${item.email}`}
                            className="text-cyan-300 hover:underline truncate"
                          >
                            {item.email}
                          </a>
                        </div>

                        {/* Location */}
                        <div className="flex items-center gap-1.5 text-white/60">
                          <MapPin size={13} className="text-cyan-400 flex-shrink-0" />
                          <span className="truncate">
                            {item.hometown}, {item.state} ({item.pin})
                          </span>
                        </div>
                      </div>

                      {/* Date & Links */}
                      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-white/40">
                        <span>
                          Applied: {new Date(item.createdAt).toLocaleDateString("en-IN")}
                        </span>
                        <div className="flex items-center gap-2.5">
                          {item.resumeUrl && (
                            <a
                              href={getMediaUrl(item.resumeUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold hover:underline"
                              title="View Resume PDF"
                            >
                              <FileText size={12} /> Resume
                            </a>
                          )}
                          {item.portfolioUrl && (
                            <a
                              href={item.portfolioUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-cyan-400 hover:underline"
                            >
                              <ExternalLink size={12} /> Link
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => openDetailsModal(item)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-2 text-xs font-semibold text-white hover:bg-cyan-500 hover:text-black transition"
                      >
                        <Eye size={13} /> View Details
                      </button>

                      <button
                        type="button"
                        disabled={deletingId === item._id}
                        onClick={() => handleDelete(item._id)}
                        className="p-2 rounded-xl border border-white/10 bg-white/5 text-rose-400 hover:bg-rose-500/20 hover:border-rose-500/30 transition disabled:opacity-50"
                        title="Delete Record"
                      >
                        {deletingId === item._id ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <Trash2 size={15} />
                        )}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </main>

        {/* Modal: Full Application Details (createPortal + data-lenis-prevent) */}
        {selectedResponse &&
          typeof document !== "undefined" &&
          createPortal(
            <div
              className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-6"
              data-lenis-prevent="true"
              onWheel={(e) => e.stopPropagation()}
              onClick={() => setSelectedResponse(null)}
            >
              <div
                className="relative flex flex-col w-full max-w-2xl max-h-[90vh] rounded-3xl border border-white/20 bg-zinc-950 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                data-lenis-prevent="true"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Sticky Modal Header */}
                <div className="flex items-start justify-between gap-4 border-b border-white/10 p-6 pb-4 shrink-0 bg-zinc-950/95 backdrop-blur z-10">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-lg border px-2.5 py-0.5 text-xs font-bold ${
                          ROLE_COLORS[selectedResponse.role] || "text-white"
                        }`}
                      >
                        {selectedResponse.role}
                      </span>
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                          STATUS_COLORS[selectedResponse.status] || "text-white"
                        }`}
                      >
                        {selectedResponse.status}
                      </span>
                    </div>
                    <h2 className="mt-2 text-2xl font-black text-white">
                      {selectedResponse.name}
                    </h2>
                    <p className="text-xs text-white/60">
                      Applied on{" "}
                      {new Date(selectedResponse.createdAt).toLocaleString("en-IN")}
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
                  className="flex-1 overflow-y-auto overscroll-contain p-6 space-y-6"
                  data-lenis-prevent="true"
                  onWheel={(e) => e.stopPropagation()}
                >
                  {/* Contact & Location Details */}
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-cyan-300">
                      APPLICANT DETAILS
                    </h4>
                    <div className="grid gap-3 sm:grid-cols-2 text-xs">
                      <div>
                        <span className="text-white/40 block">NAME:</span>
                        <strong className="text-white text-sm">{selectedResponse.name}</strong>
                      </div>
                      <div>
                        <span className="text-white/40 block">PHONE NUMBER:</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <strong className="text-white">{selectedResponse.number}</strong>
                          <a
                            href={`https://wa.me/91${selectedResponse.number.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-md bg-emerald-400/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 hover:bg-emerald-400/30"
                          >
                            WhatsApp
                          </a>
                        </div>
                      </div>
                      <div>
                        <span className="text-white/40 block">MAIL ID:</span>
                        <a
                          href={`mailto:${selectedResponse.email}`}
                          className="text-cyan-300 hover:underline"
                        >
                          {selectedResponse.email}
                        </a>
                      </div>
                      <div>
                        <span className="text-white/40 block">STATE:</span>
                        <strong className="text-white">{selectedResponse.state}</strong>
                      </div>
                      <div>
                        <span className="text-white/40 block">HOMETOWN:</span>
                        <strong className="text-white">{selectedResponse.hometown}</strong>
                      </div>
                      <div>
                        <span className="text-white/40 block">PIN CODE:</span>
                        <strong className="text-white">{selectedResponse.pin}</strong>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-white/40 block">FULL ADDRESS:</span>
                        <p className="text-white/90 mt-0.5">{selectedResponse.address}</p>
                      </div>
                    </div>
                  </div>

                  {/* Resume, Portfolio & Experience */}
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-wider text-cyan-300">
                      RESUME & APPLICATION PROFILE
                    </h4>
                    <div className="space-y-4 text-xs">
                      {/* Resume PDF */}
                      <div>
                        <span className="text-white/40 block mb-1.5 font-bold uppercase tracking-wider text-[10px]">
                          RESUME (PDF):
                        </span>
                        {selectedResponse.resumeUrl ? (
                          <a
                            href={getMediaUrl(selectedResponse.resumeUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-emerald-300 hover:text-emerald-200 bg-emerald-500/10 border border-emerald-500/30 px-4 py-2.5 rounded-xl font-bold hover:bg-emerald-500/20 transition shadow-lg shadow-emerald-950/20"
                          >
                            <FileText size={16} className="text-emerald-400" />
                            <span>View & Download Resume PDF</span>
                            <ExternalLink size={13} className="opacity-70 ml-1" />
                          </a>
                        ) : (
                          <p className="text-white/40 italic">No resume attached for this submission.</p>
                        )}
                      </div>

                      {/* Portfolio Link */}
                      <div>
                        <span className="text-white/40 block mb-1.5 font-bold uppercase tracking-wider text-[10px]">
                          PORTFOLIO / PROFILE LINK:
                        </span>
                        {selectedResponse.portfolioUrl ? (
                          <a
                            href={selectedResponse.portfolioUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-cyan-300 hover:underline bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-lg break-all"
                          >
                            <ExternalLink size={14} />
                            {selectedResponse.portfolioUrl}
                          </a>
                        ) : (
                          <p className="text-white/40 italic">No portfolio link provided.</p>
                        )}
                      </div>

                      {/* Experience */}
                      {selectedResponse.experience && (
                        <div>
                          <span className="text-white/40 block mb-1.5 font-bold uppercase tracking-wider text-[10px]">
                            EXPERIENCE / WHY THEY WANT TO JOIN:
                          </span>
                          <p className="text-white/90 bg-black/40 border border-white/5 p-3.5 rounded-xl whitespace-pre-wrap leading-relaxed">
                            {selectedResponse.experience}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status & Admin Notes */}
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-cyan-300">
                      RECRUITMENT STAGE & NOTES
                    </h4>

                    <div>
                      <label className="text-xs text-white/50 block mb-1">
                        Application Status:
                      </label>
                      <select
                        value={selectedResponse.status}
                        onChange={(e) =>
                          handleStatusChange(selectedResponse._id, e.target.value)
                        }
                        className="w-full sm:w-64 rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-xs font-bold text-white outline-none focus:border-cyan-400 cursor-pointer"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Reviewed">Reviewed</option>
                        <option value="Shortlisted">Shortlisted</option>
                        <option value="Interviewed">Interviewed</option>
                        <option value="Hired">Hired</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>

                    <div className="pt-2">
                      <label className="text-xs text-white/50 block mb-1">
                        Internal Admin Notes:
                      </label>
                      <textarea
                        rows={3}
                        value={adminNoteInput}
                        onChange={(e) => setAdminNoteInput(e.target.value)}
                        placeholder="e.g. Portfolio reviewed. Scheduled call for Friday 3 PM..."
                        className="w-full rounded-xl border border-white/10 bg-zinc-900 p-3 text-xs text-white outline-none focus:border-cyan-400 resize-none"
                      />
                      <button
                        type="button"
                        disabled={updatingId === selectedResponse._id}
                        onClick={() => handleSaveNotes(selectedResponse._id)}
                        className="mt-2 rounded-xl bg-cyan-400 px-4 py-2 text-xs font-bold text-black hover:bg-cyan-300 transition disabled:opacity-50"
                      >
                        {updatingId === selectedResponse._id ? "Saving..." : "Save Notes"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-between gap-3 border-t border-white/10 p-4 px-6 bg-zinc-950 shrink-0">
                  <span className="text-[11px] text-white/40">
                    ID: {selectedResponse._id}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedResponse(null)}
                    className="rounded-xl bg-white/10 px-4 py-2 text-xs font-bold text-white hover:bg-white/20 transition cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )}
      </div>
    </PageTransition>
  );
}
