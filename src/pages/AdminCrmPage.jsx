import { useState, useEffect, useMemo } from "react";
import {
  Users, UserPlus, PhoneCall, History, Edit3, Trash2, Search, Filter,
  CheckCircle2, XCircle, Clock, AlertCircle, Calendar, RefreshCw, X, MessageSquare, Plus, DollarSign
} from "lucide-react";
import AdminNavbar from "../components/AdminNavbar.jsx";
import PageTransition from "../components/PageTransition.jsx";
import { API_BASE } from "../config.js";

const SENTIMENT_BADGES = {
  "Positive": "bg-emerald-100 text-emerald-800 border-emerald-300",
  "Hot Lead": "bg-[#6B4226] text-white border-[#6B4226]",
  "Neutral": "bg-stone-100 text-stone-700 border-stone-300",
  "Cold Lead": "bg-[#F5F0EB] text-stone-600 border-stone-300",
  "Negative": "bg-rose-100 text-rose-800 border-rose-300"
};

const PAYMENT_BADGES = {
  "Paid": "bg-emerald-100 text-emerald-800 border-emerald-300",
  "Pending": "bg-amber-100 text-amber-900 border-amber-300",
  "Partial": "bg-blue-100 text-blue-800 border-blue-300",
  "Refunded": "bg-rose-100 text-rose-800 border-rose-300"
};

export default function AdminCrmPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  // Modal States
  const [showLogModal, setShowLogModal] = useState(false);
  const [selectedUserForLog, setSelectedUserForLog] = useState(null);
  const [logForm, setLogForm] = useState({
    note: "",
    adminName: "Admin",
    status: "Call Completed",
    sentiment: "Positive",
    paymentStatus: "Pending",
    paymentAmount: 0,
    nextFollowUpDate: ""
  });

  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [selectedUserForTimeline, setSelectedUserForTimeline] = useState(null);

  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    phone: "",
    co: "",
    district: "West Tripura",
    sentiment: "Neutral",
    paymentStatus: "Pending",
    paymentAmount: 0,
    crmNotes: ""
  });

  // Fetch Users & CRM records from MongoDB
  const fetchCrmUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/crm/users`);
      const data = await res.json();
      if (data.success && Array.isArray(data.users)) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error("Failed to fetch CRM users from MongoDB:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrmUsers();
  }, []);

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Filter tab check
      if (activeFilter === "positive" && u.sentiment !== "Positive" && u.sentiment !== "Hot Lead") return false;
      if (activeFilter === "negative" && u.sentiment !== "Negative" && u.sentiment !== "Cold Lead") return false;
      if (activeFilter === "pending" && u.paymentStatus !== "Pending") return false;
      if (activeFilter === "paid" && u.paymentStatus !== "Paid") return false;

      // Text search check
      if (!searchQuery.trim()) return true;
      const term = searchQuery.toLowerCase();
      return (
        (u.name && u.name.toLowerCase().includes(term)) ||
        (u.email && u.email.toLowerCase().includes(term)) ||
        (u.phone && u.phone.toLowerCase().includes(term)) ||
        (u.district && u.district.toLowerCase().includes(term)) ||
        (u.co && u.co.toLowerCase().includes(term)) ||
        (u.crmNotes && u.crmNotes.toLowerCase().includes(term))
      );
    });
  }, [users, activeFilter, searchQuery]);

  // Aggregated Stats
  const stats = useMemo(() => {
    const totalUsers = users.length;
    const positiveLeads = users.filter((u) => u.sentiment === "Positive" || u.sentiment === "Hot Lead").length;
    const negativeLeads = users.filter((u) => u.sentiment === "Negative" || u.sentiment === "Cold Lead").length;
    const pendingPaymentUsers = users.filter((u) => u.paymentStatus === "Pending").length;
    const totalFollowUps = users.reduce((sum, u) => sum + (u.followUpCount || 0), 0);
    return { totalUsers, positiveLeads, negativeLeads, pendingPaymentUsers, totalFollowUps };
  }, [users]);

  // Handle Opening Follow-Up Modal
  const handleOpenLogModal = (u) => {
    setSelectedUserForLog(u);
    setLogForm({
      note: "",
      adminName: "Admin",
      status: "Call Completed",
      sentiment: u.sentiment || "Positive",
      paymentStatus: u.paymentStatus || "Pending",
      paymentAmount: u.paymentAmount || 0,
      nextFollowUpDate: ""
    });
    setShowLogModal(true);
  };

  // Submit Log Follow-Up
  const handleSaveFollowUp = async (e) => {
    e.preventDefault();
    if (!selectedUserForLog) return;

    try {
      const res = await fetch(`${API_BASE}/crm/users/${selectedUserForLog._id || selectedUserForLog.id}/follow-up`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(logForm)
      });
      const data = await res.json();
      if (data.success) {
        setShowLogModal(false);
        fetchCrmUsers();
      }
    } catch (err) {
      console.error("Failed to log follow-up:", err);
    }
  };

  // Handle Opening User Modal (New or Edit)
  const handleOpenUserModal = (u = null) => {
    if (u) {
      setEditingUser(u);
      setUserForm({
        name: u.name || "",
        email: u.email || "",
        phone: u.phone || "",
        co: u.co || "",
        district: u.district || "West Tripura",
        sentiment: u.sentiment || "Neutral",
        paymentStatus: u.paymentStatus || "Pending",
        paymentAmount: u.paymentAmount || 0,
        crmNotes: u.crmNotes || ""
      });
    } else {
      setEditingUser(null);
      setUserForm({
        name: "",
        email: "",
        phone: "",
        co: "",
        district: "West Tripura",
        sentiment: "Neutral",
        paymentStatus: "Pending",
        paymentAmount: 0,
        crmNotes: ""
      });
    }
    setShowUserModal(true);
  };

  // Save Add / Edit User
  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        const res = await fetch(`${API_BASE}/crm/users/${editingUser._id || editingUser.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userForm)
        });
        const data = await res.json();
        if (data.success) {
          setShowUserModal(false);
          fetchCrmUsers();
        }
      } else {
        const res = await fetch(`${API_BASE}/crm/users`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userForm)
        });
        const data = await res.json();
        if (data.success) {
          setShowUserModal(false);
          fetchCrmUsers();
        }
      }
    } catch (err) {
      console.error("Failed to save user CRM details:", err);
    }
  };

  // Delete User
  const handleDeleteUser = async (id) => {
    if (!confirm("Are you sure you want to delete this lead/user from CRM?")) return;
    try {
      const res = await fetch(`${API_BASE}/crm/users/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchCrmUsers();
      }
    } catch (err) {
      console.error("Failed to delete user:", err);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#FDFBF7] text-stone-900 antialiased pb-20">
        <AdminNavbar activeTab="crm" />

        <main className="container mx-auto px-4 pt-24 lg:pt-28 max-w-7xl">
          {/* HEADER BAR */}
          <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-amber-900/15 bg-white p-6 shadow-xl shadow-stone-200/50">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-900 border border-amber-200 shadow-inner">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-amber-950 tracking-wide">
                  CRM & User Follow-Up Manager
                </h1>
                <p className="text-xs text-amber-900/70 font-medium">
                  Track registered readers, log call interactions, update lead sentiment & manage payments
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchCrmUsers}
                className="flex items-center gap-1.5 rounded-xl border border-stone-300 bg-[#F7F3ED] px-3.5 py-2 text-xs font-bold text-stone-800 hover:bg-stone-200 transition shadow-sm"
                title="Refresh CRM Data"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
              </button>
              <button
                onClick={() => handleOpenUserModal(null)}
                className="flex items-center gap-2 rounded-xl bg-[#6B4226] px-4 py-2 text-xs font-black text-white hover:bg-[#52331C] transition shadow-md"
              >
                <UserPlus className="h-4 w-4" /> Add New Lead / User
              </button>
            </div>
          </div>

          {/* 4 SUMMARY STAT CARDS */}
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            {/* STAT 1: TOTAL USERS */}
            <div className="rounded-3xl border border-amber-900/15 bg-white p-5 shadow-xl shadow-stone-200/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-900">
                  Total Users / Leads
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-900 border border-amber-200">
                  <Users className="h-4 w-4" />
                </span>
              </div>
              <h3 className="text-3xl font-black tracking-tight text-amber-950">{stats.totalUsers}</h3>
              <p className="text-[10px] text-stone-500 font-medium mt-1">Registered Readers in CRM</p>
            </div>

            {/* STAT 2: POSITIVE LEADS */}
            <div className="rounded-3xl border border-emerald-900/15 bg-gradient-to-br from-emerald-50 via-white to-white p-5 shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700">
                  Positive / Hot Leads
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="h-4 w-4" />
                </span>
              </div>
              <h3 className="text-3xl font-black tracking-tight text-emerald-700">{stats.positiveLeads}</h3>
              <p className="text-[10px] text-emerald-800 font-medium mt-1">Interested & Active Buyers</p>
            </div>

            {/* STAT 3: PAYMENT PENDING */}
            <div className="rounded-3xl border border-amber-900/15 bg-gradient-to-br from-amber-50 via-white to-white p-5 shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-900">
                  Payment Pending
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-900 border border-amber-200">
                  <Clock className="h-4 w-4" />
                </span>
              </div>
              <h3 className="text-3xl font-black tracking-tight text-amber-950">{stats.pendingPaymentUsers}</h3>
              <p className="text-[10px] text-amber-800 font-medium mt-1">Awaiting Payment Confirmation</p>
            </div>

            {/* STAT 4: TOTAL FOLLOW-UPS LOGGED */}
            <div className="rounded-3xl border border-amber-900/15 bg-white p-5 shadow-xl shadow-stone-200/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#8B5E3C]">
                  Follow-Up Calls Logged
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-[#8B5E3C] border border-amber-200">
                  <PhoneCall className="h-4 w-4" />
                </span>
              </div>
              <h3 className="text-3xl font-black tracking-tight text-amber-950">{stats.totalFollowUps}</h3>
              <p className="text-[10px] text-stone-500 font-medium mt-1">Total Follow-Up Interactions</p>
            </div>
          </div>

          {/* CRM FILTER & SEARCH TOOLBAR */}
          <div className="rounded-3xl border border-amber-900/15 bg-white p-6 shadow-xl shadow-stone-200/50 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-4">
              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setActiveFilter("all")}
                  className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                    activeFilter === "all"
                      ? "bg-[#6B4226] text-white shadow"
                      : "bg-[#F7F3ED] text-stone-700 hover:bg-stone-200"
                  }`}
                >
                  All Leads ({users.length})
                </button>
                <button
                  onClick={() => setActiveFilter("positive")}
                  className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                    activeFilter === "positive"
                      ? "bg-[#6B4226] text-white shadow"
                      : "bg-[#F7F3ED] text-stone-700 hover:bg-stone-200"
                  }`}
                >
                  Positive / Hot ({stats.positiveLeads})
                </button>
                <button
                  onClick={() => setActiveFilter("negative")}
                  className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                    activeFilter === "negative"
                      ? "bg-[#6B4226] text-white shadow"
                      : "bg-[#F7F3ED] text-stone-700 hover:bg-stone-200"
                  }`}
                >
                  Negative / Cold ({stats.negativeLeads})
                </button>
                <button
                  onClick={() => setActiveFilter("pending")}
                  className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                    activeFilter === "pending"
                      ? "bg-[#6B4226] text-white shadow"
                      : "bg-[#F7F3ED] text-stone-700 hover:bg-stone-200"
                  }`}
                >
                  Payment Pending ({stats.pendingPaymentUsers})
                </button>
                <button
                  onClick={() => setActiveFilter("paid")}
                  className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                    activeFilter === "paid"
                      ? "bg-[#6B4226] text-white shadow"
                      : "bg-[#F7F3ED] text-stone-700 hover:bg-stone-200"
                  }`}
                >
                  Payment Done ({users.filter(u => u.paymentStatus === "Paid").length})
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative flex items-center">
                <Search className="absolute left-3 h-4 w-4 text-stone-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search user name, email, phone, location, notes..."
                  className="rounded-xl border border-stone-300 bg-[#F7F3ED] pl-9 pr-4 py-2 text-xs text-stone-900 focus:border-amber-700 focus:outline-none transition w-64 sm:w-80 font-medium"
                />
              </div>
            </div>

            {/* REGISTERED USERS TABLE */}
            <div className="overflow-x-auto rounded-2xl border border-amber-900/15 bg-white shadow-sm">
              <table className="w-full text-left text-xs text-stone-900">
                <thead>
                  <tr className="border-b border-amber-950 bg-[#3B2314] text-[11px] font-bold uppercase tracking-wider text-amber-100">
                    <th className="p-3.5">SL</th>
                    <th className="p-3.5">REGISTERED USER / LEAD</th>
                    <th className="p-3.5">CONTACT & LOCATION</th>
                    <th className="p-3.5 text-center">FOLLOW-UPS</th>
                    <th className="p-3.5 text-center">DISPOSITION</th>
                    <th className="p-3.5 text-center">PAYMENT</th>
                    <th className="p-3.5 text-right">TOTAL SPENT (₹)</th>
                    <th className="p-3.5 text-center">LOG / TIMELINE</th>
                    <th className="p-3.5 text-center">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((u, idx) => (
                      <tr key={u._id || u.id || idx} className="hover:bg-amber-50/60 transition">
                        <td className="p-3.5 font-bold text-stone-500">{idx + 1}</td>
                        <td className="p-3.5">
                          <p className="font-extrabold text-amber-950 text-sm">{u.name || "Registered User"}</p>
                          <p className="text-[11px] text-stone-600 font-medium">{u.email}</p>
                          {u.crmNotes && (
                            <p className="text-[10px] text-stone-500 mt-1 bg-stone-100 p-1.5 rounded-lg italic border border-stone-200">
                              "{u.crmNotes}"
                            </p>
                          )}
                        </td>
                        <td className="p-3.5">
                          <p className="font-bold text-stone-800">{u.phone || "No Phone"}</p>
                          <p className="text-[10px] text-stone-500 font-medium">{u.co ? `c/o ${u.co}, ` : ""}{u.district || "Tripura"}</p>
                        </td>
                        <td className="p-3.5 text-center">
                          <span className="inline-flex items-center gap-1 rounded-xl border border-amber-300 bg-amber-100 px-3 py-1 text-xs font-black text-amber-900 shadow-sm">
                            <PhoneCall className="h-3 w-3 text-[#8B5E3C]" />
                            {u.followUpCount || 0} Calls
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          <span className={`inline-block rounded-full border px-3 py-0.5 text-[10px] font-black uppercase ${SENTIMENT_BADGES[u.sentiment] || SENTIMENT_BADGES["Neutral"]}`}>
                            {u.sentiment || "Neutral"}
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          <span className={`inline-block rounded-full border px-3 py-0.5 text-[10px] font-black uppercase ${PAYMENT_BADGES[u.paymentStatus] || PAYMENT_BADGES["Pending"]}`}>
                            {u.paymentStatus || "Pending"}
                          </span>
                        </td>
                        <td className="p-3.5 text-right font-black text-emerald-700 text-sm">
                          ₹{Number(u.totalSpent || u.paymentAmount || 0).toFixed(2)}
                        </td>
                        <td className="p-3.5 text-center whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => handleOpenLogModal(u)}
                              className="inline-flex items-center gap-1 rounded-xl bg-[#6B4226] px-3 py-1.5 text-[11px] font-bold text-white hover:bg-[#52331C] transition shadow-md"
                              title="Log Follow-up Interaction"
                            >
                              <PhoneCall className="h-3 w-3" /> Log Follow-up
                            </button>
                            <button
                              onClick={() => {
                                setSelectedUserForTimeline(u);
                                setShowTimelineModal(true);
                              }}
                              className="inline-flex items-center gap-1 rounded-xl border border-stone-300 bg-[#F7F3ED] px-2.5 py-1.5 text-[11px] font-bold text-stone-800 hover:bg-stone-200 transition"
                              title="View Interaction History Timeline"
                            >
                              <History className="h-3 w-3" /> Timeline
                            </button>
                          </div>
                        </td>
                        <td className="p-3.5 text-center whitespace-nowrap">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => handleOpenUserModal(u)}
                              className="rounded-lg border border-stone-200 bg-white p-1.5 text-stone-600 hover:bg-amber-100 hover:text-amber-900 transition"
                              title="Edit User CRM Details"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u._id || u.id)}
                              className="rounded-lg border border-stone-200 bg-white p-1.5 text-stone-500 hover:bg-rose-100 hover:text-rose-700 transition"
                              title="Delete Lead / User"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="p-8 text-center text-stone-500 font-medium">
                        No registered users found matching the filter or search query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        {/* ── MODAL 1: LOG FOLLOW-UP CALL / MESSAGE ── */}
        {showLogModal && selectedUserForLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md no-print animate-fade-in">
            <div className="w-full max-w-lg rounded-3xl border border-amber-900/15 bg-white p-6 sm:p-8 text-stone-900 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-stone-200 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-900 border border-amber-200 shadow-inner">
                    <PhoneCall className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-amber-950">Log Follow-Up Call</h3>
                    <p className="text-xs text-stone-600 font-medium">
                      User: <strong className="text-amber-950">{selectedUserForLog.name}</strong> ({selectedUserForLog.phone || selectedUserForLog.email})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowLogModal(false)}
                  className="rounded-xl border border-stone-300 bg-[#F7F3ED] p-2 text-stone-600 hover:bg-stone-200 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSaveFollowUp} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-600">
                    Call / Conversation Notes *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={logForm.note}
                    onChange={(e) => setLogForm({ ...logForm, note: e.target.value })}
                    placeholder="Enter call outcome, reader response, requested books or discount discussions..."
                    className="w-full rounded-xl border border-stone-300 bg-[#F7F3ED] p-3 text-xs font-medium text-stone-900 focus:border-amber-700 focus:outline-none transition"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-600">
                      User Disposition / Sentiment
                    </label>
                    <select
                      value={logForm.sentiment}
                      onChange={(e) => setLogForm({ ...logForm, sentiment: e.target.value })}
                      className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-xs text-stone-900 font-bold focus:border-amber-700 focus:outline-none transition"
                    >
                      <option value="Positive">Positive (Interested)</option>
                      <option value="Hot Lead">Hot Lead (Ready to buy)</option>
                      <option value="Neutral">Neutral (Thinking)</option>
                      <option value="Cold Lead">Cold Lead (Not responding)</option>
                      <option value="Negative">Negative (Not interested)</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-600">
                      Payment Status
                    </label>
                    <select
                      value={logForm.paymentStatus}
                      onChange={(e) => setLogForm({ ...logForm, paymentStatus: e.target.value })}
                      className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-xs text-stone-900 font-bold focus:border-amber-700 focus:outline-none transition"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid / Done</option>
                      <option value="Partial">Partial</option>
                      <option value="Refunded">Refunded</option>
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-600">
                      Admin Name
                    </label>
                    <input
                      type="text"
                      value={logForm.adminName}
                      onChange={(e) => setLogForm({ ...logForm, adminName: e.target.value })}
                      className="w-full rounded-xl border border-stone-300 bg-[#F7F3ED] px-3.5 py-2 text-xs font-medium text-stone-900 focus:border-amber-700 focus:outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-600">
                      Interaction Status Label
                    </label>
                    <input
                      type="text"
                      value={logForm.status}
                      onChange={(e) => setLogForm({ ...logForm, status: e.target.value })}
                      placeholder="e.g. Call Completed"
                      className="w-full rounded-xl border border-stone-300 bg-[#F7F3ED] px-3.5 py-2 text-xs font-medium text-stone-900 focus:border-amber-700 focus:outline-none transition"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-stone-200">
                  <button
                    type="button"
                    onClick={() => setShowLogModal(false)}
                    className="rounded-xl border border-stone-300 bg-[#F7F3ED] px-4 py-2.5 text-xs font-bold text-stone-700 hover:bg-stone-200 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-[#6B4226] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#52331C] transition shadow-md"
                  >
                    Save & Log Follow-up
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── MODAL 2: FOLLOW-UP TIMELINE HISTORY ── */}
        {showTimelineModal && selectedUserForTimeline && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md no-print animate-fade-in">
            <div className="w-full max-w-xl rounded-3xl border border-amber-900/15 bg-white p-6 sm:p-8 text-stone-900 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-stone-200 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-900 border border-amber-200 shadow-inner">
                    <History className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-amber-950">Follow-Up History Timeline</h3>
                    <p className="text-xs text-stone-600 font-medium">
                      User: <strong className="text-amber-950">{selectedUserForTimeline.name}</strong> ({selectedUserForTimeline.email})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowTimelineModal(false)}
                  className="rounded-xl border border-stone-300 bg-[#F7F3ED] p-2 text-stone-600 hover:bg-stone-200 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {selectedUserForTimeline.followUpLogs && selectedUserForTimeline.followUpLogs.length > 0 ? (
                <div className="relative border-l-2 border-amber-800/30 ml-4 space-y-6 py-2">
                  {selectedUserForTimeline.followUpLogs.map((log, idx) => (
                    <div key={log._id || idx} className="relative pl-6">
                      <span className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-[#6B4226] border-2 border-white ring-2 ring-amber-700/20" />
                      <div className="rounded-2xl border border-amber-900/10 bg-[#FDFBF7] p-4 space-y-2 shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-extrabold text-amber-950">
                            {new Date(log.date).toLocaleString()}
                          </span>
                          <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${SENTIMENT_BADGES[log.sentiment] || SENTIMENT_BADGES["Neutral"]}`}>
                            {log.sentiment || "Neutral"}
                          </span>
                        </div>
                        <p className="text-xs text-stone-800 font-medium">{log.note}</p>
                        <div className="flex items-center justify-between text-[10px] text-stone-500 font-medium border-t border-stone-200 pt-2">
                          <span>Logged by: <strong>{log.adminName || "Admin"}</strong></span>
                          <span>Payment: <strong className="text-amber-900">{log.paymentStatus || "Pending"}</strong></span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-stone-500 font-medium">
                  No follow-up calls logged yet for this user.
                </div>
              )}

              <div className="flex justify-end pt-3 border-t border-stone-200">
                <button
                  onClick={() => setShowTimelineModal(false)}
                  className="rounded-xl border border-stone-300 bg-[#F7F3ED] px-5 py-2 text-xs font-bold text-stone-800 hover:bg-stone-200 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── MODAL 3: ADD / EDIT USER CRM DETAILS ── */}
        {showUserModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md no-print animate-fade-in">
            <div className="w-full max-w-xl rounded-3xl border border-amber-900/15 bg-white p-6 sm:p-8 text-stone-900 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-stone-200 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-900 border border-amber-200 shadow-inner">
                    <UserPlus className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-amber-950">
                      {editingUser ? "Edit User CRM Details" : "Add New Lead / User"}
                    </h3>
                    <p className="text-xs text-stone-600 font-medium">Enter user contact details, sentiment & CRM attributes</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="rounded-xl border border-stone-300 bg-[#F7F3ED] p-2 text-stone-600 hover:bg-stone-200 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSaveUser} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-600">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={userForm.name}
                      onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                      placeholder="e.g. Subhajit Roy"
                      className="w-full rounded-xl border border-stone-300 bg-[#F7F3ED] px-3.5 py-2.5 text-xs text-stone-900 focus:border-amber-700 focus:outline-none transition font-medium"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-600">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={userForm.email}
                      onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                      placeholder="user@example.com"
                      className="w-full rounded-xl border border-stone-300 bg-[#F7F3ED] px-3.5 py-2.5 text-xs text-stone-900 focus:border-amber-700 focus:outline-none transition font-medium"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-600">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={userForm.phone}
                      onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                      placeholder="9862123456"
                      className="w-full rounded-xl border border-stone-300 bg-[#F7F3ED] px-3.5 py-2.5 text-xs text-stone-900 focus:border-amber-700 focus:outline-none transition font-mono"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-600">
                      Care Of (c/o)
                    </label>
                    <input
                      type="text"
                      value={userForm.co}
                      onChange={(e) => setUserForm({ ...userForm, co: e.target.value })}
                      placeholder="e.g. Madhuban"
                      className="w-full rounded-xl border border-stone-300 bg-[#F7F3ED] px-3.5 py-2.5 text-xs text-stone-900 focus:border-amber-700 focus:outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-600">
                      District
                    </label>
                    <input
                      type="text"
                      value={userForm.district}
                      onChange={(e) => setUserForm({ ...userForm, district: e.target.value })}
                      placeholder="West Tripura"
                      className="w-full rounded-xl border border-stone-300 bg-[#F7F3ED] px-3.5 py-2.5 text-xs text-stone-900 focus:border-amber-700 focus:outline-none transition"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-600">
                      User Disposition / Sentiment
                    </label>
                    <select
                      value={userForm.sentiment}
                      onChange={(e) => setUserForm({ ...userForm, sentiment: e.target.value })}
                      className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-xs text-stone-900 font-bold focus:border-amber-700 focus:outline-none transition"
                    >
                      <option value="Positive">Positive (Interested)</option>
                      <option value="Hot Lead">Hot Lead (Ready to buy)</option>
                      <option value="Neutral">Neutral (Thinking)</option>
                      <option value="Cold Lead">Cold Lead (Not responding)</option>
                      <option value="Negative">Negative (Not interested)</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-600">
                      Payment Status
                    </label>
                    <select
                      value={userForm.paymentStatus}
                      onChange={(e) => setUserForm({ ...userForm, paymentStatus: e.target.value })}
                      className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-xs text-stone-900 font-bold focus:border-amber-700 focus:outline-none transition"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid / Done</option>
                      <option value="Partial">Partial</option>
                      <option value="Refunded">Refunded</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-600">
                    CRM Internal Notes
                  </label>
                  <textarea
                    rows={3}
                    value={userForm.crmNotes}
                    onChange={(e) => setUserForm({ ...userForm, crmNotes: e.target.value })}
                    placeholder="Enter preferences, book genres, callback requests..."
                    className="w-full rounded-xl border border-stone-300 bg-[#F7F3ED] p-3 text-xs font-medium text-stone-900 focus:border-amber-700 focus:outline-none transition"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-stone-200">
                  <button
                    type="button"
                    onClick={() => setShowUserModal(false)}
                    className="rounded-xl border border-stone-300 bg-[#F7F3ED] px-4 py-2.5 text-xs font-bold text-stone-700 hover:bg-stone-200 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-[#6B4226] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#52331C] transition shadow-md"
                  >
                    {editingUser ? "Save CRM Changes" : "Create Lead"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
