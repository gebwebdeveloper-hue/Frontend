import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Loader2, Search, Trash2, Edit3, Plus, ArrowLeft,
  RefreshCw, CheckCircle2, Shield, Phone, Mail, MapPin, Calendar,
  MessageSquare, UserCheck, Clock, X, AlertCircle, RotateCcw, Copy
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import PageTransition from "../components/PageTransition.jsx";
import AdminNavbar from "../components/AdminNavbar.jsx";
import { API_BASE } from "../config.js";

const initialFormState = {
  fullName: "",
  email: "",
  phone: "",
  whatsapp: "",
  role: "Member",
  status: "active",
  address: "",
  dateOfBirth: "",
  actionText: "",
  reason: "",
  portfolioUrl: "",
};

export default function AdminClubPage() {
  const navigate = useNavigate();

  // Auth State
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);

  // Members Data State
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modals & Active Edit State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [submitting, setSubmitting] = useState(false);
  const [deletingMember, setDeletingMember] = useState(null);
  const [popupMessage, setPopupMessage] = useState(null);

  // Refund Modal State
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [selectedRefundMember, setSelectedRefundMember] = useState(null);
  const [refundReason, setRefundReason] = useState("");
  const [processingRefund, setProcessingRefund] = useState(false);

  const handleOpenRefund = (member) => {
    setSelectedRefundMember(member);
    setRefundReason("");
    setRefundModalOpen(true);
  };

  const handleExecuteRefund = async (e) => {
    e.preventDefault();
    if (!selectedRefundMember) return;
    setProcessingRefund(true);

    try {
      const res = await fetch(`${API_BASE}/club/admin/members/${selectedRefundMember._id}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ refundReason })
      });
      const data = await res.json();

      if (data.success) {
        setMembers((prev) =>
          prev.map((m) => (m._id === selectedRefundMember._id ? { ...m, paymentStatus: "refunded", status: "cancelled", actionText: `Refunded ₹${selectedRefundMember.amountPaid || 1178.82}` } : m))
        );
        setRefundModalOpen(false);
        setPopupMessage({ type: "success", text: `Refund of ₹${selectedRefundMember.amountPaid || 1178.82} for ${selectedRefundMember.fullName} processed successfully!` });
      } else {
        alert(data.message || "Failed to process refund.");
      }
    } catch {
      alert("Error processing club membership refund.");
    } finally {
      setProcessingRefund(false);
    }
  };

  const [form, setForm] = useState(initialFormState);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Delete Confirm Modal
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isModalOpen || deletingMember || refundModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isModalOpen, deletingMember, refundModalOpen]);

  // Auto-dismiss popup message alert after 5 seconds
  useEffect(() => {
    if (!popupMessage) return;
    const timer = setTimeout(() => {
      setPopupMessage(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, [popupMessage]);

  // 1. Auth Check
  useEffect(() => {
    fetch(`${API_BASE}/auth/me`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.user?.role === "admin") {
          setAuthed(true);
        } else {
          navigate("/admin");
        }
      })
      .catch(() => navigate("/admin"))
      .finally(() => setChecking(false));
  }, [navigate]);

  // 2. Fetch All Club Members
  const fetchMembers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/club/admin/members`, { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setMembers(data.members || []);
      } else {
        setError(data.message || "Failed to fetch club members.");
      }
    } catch {
      setError("Network error fetching club members.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authed) {
      fetchMembers();
    }
  }, [authed]);

  // 3. Open Add Modal
  const handleOpenAdd = () => {
    setEditingMember(null);
    setForm(initialFormState);
    setFormError("");
    setIsModalOpen(true);
  };

  // 4. Open Edit Modal
  const handleOpenEdit = (member) => {
    setEditingMember(member);
    setForm({
      fullName: member.fullName || "",
      email: member.email || "",
      phone: member.phone || "",
      whatsapp: member.whatsapp || "",
      role: member.role || "Member",
      status: member.status || "active",
      address: member.address || "",
      dateOfBirth: member.dateOfBirth || "",
      actionText: member.actionText || "",
      reason: member.reason || "",
      portfolioUrl: member.portfolioUrl || "",
    });
    setFormError("");
    setIsModalOpen(true);
  };

  // 5. Submit Add / Edit Form
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError("");

    try {
      const url = editingMember
        ? `${API_BASE}/club/admin/members/${editingMember._id}`
        : `${API_BASE}/club/admin/members`;
      const method = editingMember ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.success) {
        setIsModalOpen(false);
        setPopupMessage({
          type: "success",
          text: editingMember ? "Member updated successfully!" : "New member added successfully!",
        });
        fetchMembers();
      } else {
        setFormError(data.message || "Failed to save member details.");
      }
    } catch {
      setFormError("Network error while saving details.");
    } finally {
      setFormSubmitting(false);
    }
  };

  // 6. Delete Member
  const handleDeleteMember = async () => {
    if (!deletingMember) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`${API_BASE}/club/admin/members/${deletingMember._id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setDeletingMember(null);
        setPopupMessage({ type: "success", text: "Member deleted successfully." });
        fetchMembers();
      } else {
        setPopupMessage({ type: "error", text: data.message || "Could not delete member." });
      }
    } catch {
      setPopupMessage({ type: "error", text: "Network error trying to delete member." });
    } finally {
      setDeleteLoading(false);
    }
  };

  // 7. Toggle Quick Status (Pending <-> Active)
  const handleToggleStatus = async (member) => {
    const newStatus = member.status === "active" ? "pending" : "active";
    try {
      const res = await fetch(`${API_BASE}/club/admin/members/${member._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setMembers((prev) =>
          prev.map((m) => (m._id === member._id ? { ...m, status: newStatus } : m))
        );
        setPopupMessage({
          type: "success",
          text: `Status updated to ${newStatus.toUpperCase()}`,
        });
      }
    } catch {
      setPopupMessage({ type: "error", text: "Failed to update member status." });
    }
  };

  // Filtered List
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchesSearch =
        m.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        m.email?.toLowerCase().includes(search.toLowerCase()) ||
        m.phone?.includes(search) ||
        m.role?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === "all" || m.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [members, search, statusFilter]);

  // Statistics
  const totalCount = members.length;
  const activeCount = members.filter((m) => m.status === "active").length;
  const pendingCount = members.filter((m) => m.status === "pending").length;

  if (checking) {
    return (
      <div className="min-h-screen grid place-items-center bg-zinc-950 text-cyan-400">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  if (!authed) return null;

  return (
    <PageTransition>
      <main className="min-h-screen bg-zinc-950 pt-28 pb-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          {/* Responsive Admin Navbar */}
          <AdminNavbar />

          {/* Header & Back Link */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <h1 className="text-3xl font-black uppercase tracking-wider text-white sm:text-4xl">
                Club Members &amp; Applications
              </h1>
              <p className="mt-1 text-xs text-white/55">
                Add, edit, manage, and approve Lekhok Tripura Club members &amp; applicants.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={fetchMembers}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-bold text-white transition hover:bg-white/10 cursor-pointer"
              >
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
              </button>
              <button
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 px-6 py-3 text-xs font-black uppercase tracking-wider text-black shadow-[0_0_30px_rgba(6,182,212,0.3)] transition hover:scale-105 cursor-pointer"
              >
                <Plus size={16} /> Add Member
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-white/50">Total Members</span>
                <Users className="h-5 w-5 text-cyan-400" />
              </div>
              <div className="mt-2 text-3xl font-black text-white">{totalCount}</div>
            </div>

            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-300/80">Active Members</span>
                <UserCheck className="h-5 w-5 text-emerald-400" />
              </div>
              <div className="mt-2 text-3xl font-black text-emerald-300">{activeCount}</div>
            </div>

            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300/80">Pending Applications</span>
                <Clock className="h-5 w-5 text-amber-400" />
              </div>
              <div className="mt-2 text-3xl font-black text-amber-300">{pendingCount}</div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4 backdrop-blur-md">
            {/* Search Input */}
            <div className="relative min-w-[260px] flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by Name, Mail ID, Phone, Role..."
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-xs text-white placeholder-white/30 outline-none transition focus:border-cyan-400/50 focus:bg-white/10"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2">
              {[
                { id: "all", label: `All (${totalCount})` },
                { id: "active", label: `Active (${activeCount})` },
                { id: "pending", label: `Pending (${pendingCount})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`rounded-xl px-4 py-2 text-xs font-extrabold transition ${
                    statusFilter === tab.id
                      ? "bg-cyan-400 text-black shadow-glow"
                      : "border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Error Message Banner */}
          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-xs font-semibold text-red-300">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Members Grid / List */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-cyan-400 mb-3" />
              <p className="text-xs text-white/50">Loading club members...</p>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-12 text-center">
              <Users className="mx-auto h-12 w-12 text-white/20 mb-3" />
              <h3 className="text-lg font-extrabold text-white">No Members Found</h3>
              <p className="mt-1 text-xs text-white/50">
                {search ? "No member matches your search criteria." : "Click 'Add Member' to add the first club member."}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredMembers.map((member) => (
                <motion.div
                  key={member._id}
                  layout
                  className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.035] p-5 shadow-card backdrop-blur-xl transition hover:border-cyan-400/30 hover:bg-white/[0.06]"
                >
                  <div>
                    {/* Header: Role & Status */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-cyan-300">
                        {member.role || "Member"}
                      </span>
                      <button
                        onClick={() => handleToggleStatus(member)}
                        className={`rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider transition ${
                          member.status === "active"
                            ? "border border-emerald-400/30 bg-emerald-400/15 text-emerald-300 hover:bg-emerald-400/25"
                            : "border border-amber-400/30 bg-amber-400/15 text-amber-300 hover:bg-amber-400/25"
                        }`}
                        title="Click to toggle status"
                      >
                        {member.status}
                      </button>
                    </div>

                    {/* Member Name + Member ID badge */}
                    <h3 className="text-lg font-black text-white group-hover:text-cyan-300 transition">
                      {member.fullName}
                    </h3>
                    {member.memberId && (
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <span className="font-mono text-[11px] font-black text-amber-300 tracking-wider">{member.memberId}</span>
                        <button
                          type="button"
                          onClick={() => { navigator.clipboard.writeText(member.memberId).catch(() => {}); }}
                          className="text-white/30 hover:text-amber-300 transition"
                          title="Copy Member ID"
                        >
                          <Copy size={11} />
                        </button>
                      </div>
                    )}

                    {/* Details List */}
                    <div className="mt-3 space-y-2 text-xs text-white/65">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
                        <span className="truncate">{member.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                        <span>{member.phone}</span>
                        {member.whatsapp && member.whatsapp !== member.phone && (
                          <span className="text-[10px] text-white/40">(WA: {member.whatsapp})</span>
                        )}
                      </div>
                      {member.address && (
                        <div className="flex items-start gap-2">
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-amber-400 mt-0.5" />
                          <span className="line-clamp-2">{member.address}</span>
                        </div>
                      )}
                      {member.reason && (
                        <div className="mt-2 rounded-xl border border-white/10 bg-black/30 p-2.5 text-[11px] text-white/60">
                          <p className="font-bold text-white/75 mb-0.5">Application Note:</p>
                          <p className="italic leading-relaxed">"{member.reason}"</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-3">
                    <span className="text-[10px] font-medium text-white/40">
                      Added: {new Date(member.createdAt).toLocaleDateString()}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenRefund(member)}
                        disabled={member.paymentStatus === "refunded"}
                        className={`px-2.5 py-1 rounded-xl text-xs font-semibold border flex items-center gap-1 transition ${
                          member.paymentStatus === "refunded"
                            ? "border-zinc-800 bg-zinc-900/50 text-zinc-600 cursor-not-allowed"
                            : "border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
                        }`}
                        title="Issue Refund (₹1,178.82)"
                      >
                        <RotateCcw size={13} /> {member.paymentStatus === "refunded" ? "Refunded" : "Refund"}
                      </button>
                      <button
                        onClick={() => handleOpenEdit(member)}
                        className="grid h-8 w-8 place-items-center rounded-xl border border-white/10 bg-white/5 text-cyan-300 transition hover:border-cyan-400/40 hover:bg-cyan-400/10"
                        title="Edit Member"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => setDeletingMember(member)}
                        className="grid h-8 w-8 place-items-center rounded-xl border border-white/10 bg-white/5 text-white/40 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
                        title="Delete Member"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

        </div>

        {/* ══════════════ ADD / EDIT MEMBER MODAL ══════════════ */}
        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
              onClick={() => setIsModalOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-white/15 bg-zinc-950 p-6 shadow-2xl custom-scrollbar"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
                  <h3 className="text-xl font-black text-white">
                    {editingMember ? "Edit Club Member" : "Add New Club Member"}
                  </h3>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/5 text-white/60 hover:text-white"
                  >
                    <X size={16} />
                  </button>
                </div>

                {formError && (
                  <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                    <AlertCircle size={16} />
                    <span>{formError}</span>
                  </div>
                )}

                <form onSubmit={handleFormSubmit} className="space-y-4 text-left">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-1">
                      Full Name *
                    </label>
                    <input
                      required
                      type="text"
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      placeholder="e.g. Ritvik Chakraborty"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs text-white placeholder-white/25 outline-none transition focus:border-cyan-400/50 focus:bg-white/10"
                    />
                  </div>

                  {/* Mail ID */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-1">
                      Mail ID *
                    </label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="e.g. member@mail.com"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs text-white placeholder-white/25 outline-none transition focus:border-cyan-400/50 focus:bg-white/10"
                    />
                  </div>

                  {/* Phone & WhatsApp */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-1">
                        Phone Number *
                      </label>
                      <input
                        required
                        type="text"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/[^0-9]/g, "").slice(0, 10) })}
                        placeholder="10-digit mobile number"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs text-white placeholder-white/25 outline-none transition focus:border-cyan-400/50 focus:bg-white/10"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-1">
                        WhatsApp Number
                      </label>
                      <input
                        type="text"
                        value={form.whatsapp}
                        onChange={(e) => setForm({ ...form, whatsapp: e.target.value.replace(/[^0-9]/g, "").slice(0, 10) })}
                        placeholder="10-digit WhatsApp number"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs text-white placeholder-white/25 outline-none transition focus:border-cyan-400/50 focus:bg-white/10"
                      />
                    </div>
                  </div>

                  {/* Role & Status */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-1">
                        Role / Designation
                      </label>
                      <select
                        value={form.role}
                        onChange={(e) => setForm({ ...form, role: e.target.value })}
                        className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3.5 py-2.5 text-xs text-white outline-none transition focus:border-cyan-400/50"
                      >
                        <option value="Founder">Founder</option>
                        <option value="Secretary">Secretary</option>
                        <option value="Vice-Secretary">Vice-Secretary</option>
                        <option value="Admin">Admin</option>
                        <option value="Member">Member</option>
                        <option value="Writer">Writer</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-1">
                        Status
                      </label>
                      <select
                        value={form.status}
                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                        className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3.5 py-2.5 text-xs text-white outline-none transition focus:border-cyan-400/50"
                      >
                        <option value="active">Active (Visible on Website)</option>
                        <option value="pending">Pending (Review Required)</option>
                      </select>
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-1">
                      Address
                    </label>
                    <textarea
                      rows={2}
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      placeholder="Full address..."
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs text-white placeholder-white/25 outline-none transition focus:border-cyan-400/50 focus:bg-white/10"
                    />
                  </div>

                  {/* Portfolio Link / Website */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-1">
                      Portfolio Link / Website (Optional)
                    </label>
                    <input
                      type="url"
                      value={form.portfolioUrl || ""}
                      onChange={(e) => setForm({ ...form, portfolioUrl: e.target.value })}
                      placeholder="https://yourportfolio.com or social link"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs text-white placeholder-white/25 outline-none transition focus:border-cyan-400/50 focus:bg-white/10"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-bold text-white/70 hover:bg-white/10"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={formSubmitting}
                      className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-6 py-2.5 text-xs font-black uppercase text-black hover:bg-cyan-300 disabled:opacity-50"
                    >
                      {formSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      {editingMember ? "Save Changes" : "Add Member"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ══════════════ DELETE CONFIRM MODAL ══════════════ */}
        <AnimatePresence>
          {deletingMember && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
              onClick={() => setDeletingMember(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md rounded-3xl border border-white/15 bg-zinc-950 p-6 text-center shadow-2xl"
              >
                <Trash2 className="mx-auto h-12 w-12 text-red-400 mb-3" />
                <h3 className="text-lg font-black text-white">Delete Club Member</h3>
                <p className="mt-2 text-xs text-white/60">
                  Are you sure you want to remove <strong className="text-white">{deletingMember.fullName}</strong> from the club members list? This action cannot be undone.
                </p>

                <div className="mt-6 flex items-center justify-center gap-3">
                  <button
                    onClick={() => setDeletingMember(null)}
                    className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-bold text-white/70 hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteMember}
                    disabled={deleteLoading}
                    className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-6 py-2.5 text-xs font-black uppercase text-white hover:bg-red-600 disabled:opacity-50"
                  >
                    {deleteLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Delete Member
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ══════════════ REFUND CONFIRMATION MODAL ══════════════ */}
        <AnimatePresence>
          {refundModalOpen && selectedRefundMember && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
              onClick={() => setRefundModalOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-md rounded-3xl border border-amber-500/30 bg-zinc-950 p-6 shadow-2xl"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                  <div className="flex items-center gap-2 text-amber-400">
                    <RotateCcw size={18} />
                    <h3 className="text-lg font-black text-white">Refund Club Membership</h3>
                  </div>
                  <button onClick={() => setRefundModalOpen(false)} className="text-white/40 hover:text-white">
                    <X size={18} />
                  </button>
                </div>

                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 mb-4 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-white/50">Member Name:</span>
                    <span className="font-bold text-white">{selectedRefundMember.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Email:</span>
                    <span className="font-bold text-white">{selectedRefundMember.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Payment ID:</span>
                    <span className="font-mono text-cyan-300">{selectedRefundMember.paymentId || "N/A"}</span>
                  </div>
                  <div className="flex justify-between text-sm border-t border-amber-500/20 pt-2 font-bold">
                    <span className="text-white">Refund Amount:</span>
                    <span className="text-emerald-400">₹{selectedRefundMember.amountPaid || 1178.82}</span>
                  </div>
                </div>

                <form onSubmit={handleExecuteRefund} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-white/70 mb-1.5">Reason for Refund / Note (Optional)</label>
                    <textarea
                      rows={3}
                      value={refundReason}
                      onChange={(e) => setRefundReason(e.target.value)}
                      placeholder="e.g. Member requested cancellation / Duplicate payment..."
                      className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white placeholder-white/30 focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setRefundModalOpen(false)}
                      className="w-1/3 rounded-xl border border-white/10 bg-white/5 py-3 text-xs font-bold text-white/60 hover:bg-white/10"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={processingRefund}
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 text-xs font-black text-black hover:bg-amber-400 transition disabled:opacity-50"
                    >
                      {processingRefund ? <Loader2 className="h-4 w-4 animate-spin text-black" /> : `Confirm Refund (₹${selectedRefundMember.amountPaid || 1178.82})`}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ══════════════ FEEDBACK POPUP ══════════════ */}
        <AnimatePresence>
          {popupMessage && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-cyan-400/30 bg-zinc-900/95 px-5 py-3.5 text-xs font-bold text-white shadow-2xl backdrop-blur-md"
            >
              <CheckCircle2 className="h-5 w-5 text-cyan-400" />
              <span>{popupMessage.text}</span>
              <button
                onClick={() => setPopupMessage(null)}
                className="ml-2 text-white/40 hover:text-white"
              >
                <X size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </PageTransition>
  );
}
