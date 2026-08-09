import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BookOpen, Clock, AlertTriangle, CheckCircle2, RefreshCw,
  Loader2, Search, ArrowLeft, LogOut, ShieldCheck, ListPlus, FileText, BellRing
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import PageTransition from "../components/PageTransition.jsx";
import AdminNavbar from "../components/AdminNavbar.jsx";
import AdminRentalCatalogManager from "../components/AdminRentalCatalogManager.jsx";
import { API_BASE } from "../config.js";

export default function AdminRentalsPage() {
  const navigate = useNavigate();

  // Sub tab state
  const [subTab, setSubTab] = useState("catalog"); // 'catalog' | 'orders'

  // Auth State
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [authError, setAuthError] = useState("");
  const [submittingAuth, setSubmittingAuth] = useState(false);
  const [loginStep, setLoginStep] = useState("email"); // 'email' | 'otp'

  // Rentals State
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmingId, setConfirmingId] = useState(null);
  const [sendingReminderId, setSendingReminderId] = useState(null);
  const [adminNote, setAdminNote] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });

  // Session check on mount
  useEffect(() => {
    fetch(`${API_BASE}/auth/me`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        if (data.success && data.user && data.user.role === "admin") {
          setAuthed(true);
          fetchRentals();
        } else {
          setAuthed(false);
        }
      })
      .catch(() => setAuthed(false))
      .finally(() => setChecking(false));
  }, []);

  const fetchRentals = async () => {
    try {
      setLoading(true);
      setMessage({ type: "", text: "" });
      const res = await fetch(`${API_BASE}/rentals/admin/all`, { credentials: "include" });
      const data = await res.json();
      if (res.ok && data.success) {
        setRentals(data.rentals || []);
      } else {
        setMessage({ type: "error", text: data.message || "Failed to load rental records." });
      }
    } catch {
      setMessage({ type: "error", text: "Could not connect to server." });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email) return;
    setSubmittingAuth(true);
    setAuthError("");
    try {
      const res = await fetch(`${API_BASE}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setLoginStep("otp");
      } else {
        setAuthError(data.message || "Failed to send code.");
      }
    } catch {
      setAuthError("Server unreachable.");
    } finally {
      setSubmittingAuth(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) return;
    setSubmittingAuth(true);
    setAuthError("");
    try {
      const res = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
        credentials: "include",
      });
      const data = await res.json();
      if (data.success && data.user?.role === "admin") {
        setAuthed(true);
        fetchRentals();
      } else {
        setAuthError(data.message || "Invalid OTP / permissions.");
      }
    } catch {
      setAuthError("Verification failed.");
    } finally {
      setSubmittingAuth(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, { method: "POST", credentials: "include" });
    } catch {}
    setAuthed(false);
    navigate("/admin");
  };

  const handleConfirmReturn = async (rentalId) => {
    try {
      setConfirmingId(rentalId);
      setMessage({ type: "", text: "" });

      const res = await fetch(`${API_BASE}/rentals/admin/${rentalId}/confirm-return`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ adminNotes: adminNote }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: data.message });
        setAdminNote("");
        fetchRentals();
      } else {
        setMessage({ type: "error", text: data.message || "Failed to confirm return." });
      }
    } catch {
      setMessage({ type: "error", text: "Server error confirming return." });
    } finally {
      setConfirmingId(null);
    }
  };

  const handleSendReminder = async (rentalId) => {
    setSendingReminderId(rentalId);
    setMessage({ type: "", text: "" });
    try {
      const res = await fetch(`${API_BASE}/rentals/admin/${rentalId}/send-reminder`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: data.message });
      } else {
        setMessage({ type: "error", text: data.message || "Failed to send reminder email." });
      }
    } catch {
      setMessage({ type: "error", text: "Server error sending reminder email." });
    } finally {
      setSendingReminderId(null);
    }
  };

  // Metrics
  const activeCount = rentals.filter((r) => r.status === "active").length;
  const overdueCount = rentals.filter((r) => r.status === "overdue" || (r.daysOverdue > 0 && r.status !== "returned")).length;
  const returnRequestedCount = rentals.filter((r) => r.status === "return_requested").length;
  const returnedCount = rentals.filter((r) => r.status === "returned").length;

  // Filter & Search
  const filteredRentals = rentals.filter((r) => {
    const matchesFilter =
      filterStatus === "all" ||
      r.status === filterStatus ||
      (filterStatus === "overdue" && r.daysOverdue > 0 && r.status !== "returned");

    const bookTitle = r.bookId?.title || "";
    const renterName = r.renterName || "";
    const renterEmail = r.renterEmail || "";
    const renterPhone = r.renterPhone || "";

    const matchesSearch =
      bookTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      renterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      renterEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      renterPhone.includes(searchQuery);

    return matchesFilter && matchesSearch;
  });

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  if (!authed) {
    return (
      <PageTransition>
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-zinc-950 p-8 shadow-2xl backdrop-blur-xl">
            <div className="mb-6 flex flex-col items-center text-center">
              <div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-emerald-400/10 text-emerald-400">
                <ShieldCheck size={24} />
              </div>
              <h1 className="text-xl font-bold text-white">Admin Authentication</h1>
              <p className="mt-1 text-xs text-white/50">Log in to manage Lekhok Tripura Book Rentals</p>
            </div>

            {authError && (
              <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-300">
                {authError}
              </div>
            )}

            {loginStep === "email" ? (
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wider">Admin Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@lekhoktripura.in"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white placeholder-white/30 focus:border-emerald-400 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submittingAuth}
                  className="w-full rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 py-3 text-xs font-bold text-black hover:opacity-95 transition disabled:opacity-50"
                >
                  {submittingAuth ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Request Access Code"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wider">Access Code / Password</label>
                  <input
                    type="text"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter OTP code"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-mono text-white placeholder-white/30 focus:border-emerald-400 focus:outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setLoginStep("email")}
                    className="w-1/3 rounded-xl border border-white/10 bg-white/5 py-3 text-xs font-semibold text-white"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={submittingAuth}
                    className="flex-1 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 py-3 text-xs font-bold text-black hover:opacity-95 transition disabled:opacity-50"
                  >
                    {submittingAuth ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Verify & Enter"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <main className="min-h-screen pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        {/* Responsive Admin Navbar */}
        <AdminNavbar onLogoutSuccess={handleLogout} />

        {/* Header Title Section */}
        <div className="flex items-center gap-3 pb-2">
          <Link to="/admin" className="rounded-full p-2 bg-white/5 border border-white/10 text-white/60 hover:text-white transition cursor-pointer">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-white">Book Rentals Admin</h1>
            <p className="mt-0.5 text-xs text-white/55">Manage book rental catalog, track active rentals, and verify physical returns.</p>
          </div>
        </div>

        {/* Sub Navigation Bar */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSubTab("catalog")}
            className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-xs font-black uppercase tracking-wider transition cursor-pointer ${
              subTab === "catalog"
                ? "bg-emerald-400 text-black shadow-lg shadow-emerald-400/20"
                : "border border-white/10 bg-white/5 text-white/60 hover:text-white"
            }`}
          >
            <ListPlus size={16} /> Add / Manage Rental Books Catalog
          </button>

          <button
            type="button"
            onClick={() => setSubTab("orders")}
            className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-xs font-black uppercase tracking-wider transition cursor-pointer ${
              subTab === "orders"
                ? "bg-emerald-400 text-black shadow-lg shadow-emerald-400/20"
                : "border border-white/10 bg-white/5 text-white/60 hover:text-white"
            }`}
          >
            <FileText size={16} /> Rental Orders &amp; Returns ({rentals.length})
          </button>
        </div>

        {subTab === "catalog" ? (
          <AdminRentalCatalogManager onCatalogUpdated={fetchRentals} />
        ) : (
          <div className="space-y-8">
            {/* Metrics Overview Banner */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-5 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">Active Rentals</span>
                  <Clock size={18} className="text-cyan-400" />
                </div>
                <p className="mt-2 text-3xl font-black text-white">{activeCount}</p>
              </div>

              <div className="rounded-2xl border border-red-400/20 bg-red-400/5 p-5 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-red-300">Overdue Rentals</span>
                  <AlertTriangle size={18} className="text-red-400" />
                </div>
                <p className="mt-2 text-3xl font-black text-white">{overdueCount}</p>
              </div>

              <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-5 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-300">Return Requests</span>
                  <RefreshCw size={18} className="text-amber-400" />
                </div>
                <p className="mt-2 text-3xl font-black text-white">{returnRequestedCount}</p>
              </div>

              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-5 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">Returned Books</span>
                  <CheckCircle2 size={18} className="text-emerald-400" />
                </div>
                <p className="mt-2 text-3xl font-black text-white">{returnedCount}</p>
              </div>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: "all", label: `All (${rentals.length})` },
                  { id: "active", label: `Active (${activeCount})` },
                  { id: "overdue", label: `Overdue (${overdueCount})` },
                  { id: "return_requested", label: `Return Pending (${returnRequestedCount})` },
                  { id: "returned", label: `Returned (${returnedCount})` },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setFilterStatus(tab.id)}
                    className={`rounded-xl px-3.5 py-2 text-xs font-bold transition cursor-pointer ${
                      filterStatus === tab.id
                        ? "bg-emerald-400 text-black font-black"
                        : "border border-white/10 bg-white/5 text-white/60 hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="relative max-w-xs w-full">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search renter name, email, book..."
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-xs text-white placeholder-white/30 outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            {message.text && (
              <div
                className={`rounded-xl border p-3.5 text-xs font-bold ${
                  message.type === "success"
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                    : "border-red-500/30 bg-red-500/10 text-red-300"
                }`}
              >
                {message.text}
              </div>
            )}

            {/* Rentals Table */}
            <div className="overflow-x-auto rounded-3xl border border-white/10 bg-zinc-950 p-1 shadow-2xl">
              <table className="w-full text-left text-xs text-white/80">
                <thead className="border-b border-white/10 bg-black/40 text-[10px] font-black uppercase tracking-wider text-white/50">
                  <tr>
                    <th className="p-4">Book</th>
                    <th className="p-4">Renter Details</th>
                    <th className="p-4">Dates</th>
                    <th className="p-4">Status &amp; Fine</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-white/40">
                        <Loader2 size={24} className="animate-spin mx-auto mb-2 text-emerald-400" /> Loading rentals database...
                      </td>
                    </tr>
                  ) : filteredRentals.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-white/40">
                        No rental records found matching your filter.
                      </td>
                    </tr>
                  ) : (
                    filteredRentals.map((r) => {
                      const book = r.bookId || {};
                      const user = r.userId || {};
                      const isReturned = r.status === "returned";
                      const isReturnPending = r.status === "return_requested";
                      const isOverdue = r.status === "overdue" || (r.daysOverdue > 0 && !isReturned);

                      const startDateStr = new Date(r.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
                      const dueDateStr = new Date(r.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

                      const now = new Date();
                      const dueDateObj = new Date(r.dueDate);
                      const diffMs = dueDateObj.getTime() - now.getTime();
                      const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

                      return (
                        <tr key={r._id} className="hover:bg-white/5 transition">
                          {/* Book */}
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              {book.cover?.url ? (
                                <img src={book.cover.url} alt="" className="h-12 w-9 rounded object-cover shadow shrink-0" />
                              ) : (
                                <div className="grid h-12 w-9 place-items-center rounded bg-zinc-800 text-[9px] font-bold text-white/40 shrink-0">
                                  BOOK
                                </div>
                              )}
                              <div>
                                <p className="font-extrabold text-white line-clamp-1">{book.title || "Book"}</p>
                                <p className="text-[10px] text-white/50">Base Fee: ₹{r.rentalFee} | GST (18%): ₹{r.gstAmount || (r.rentalFee * 0.18).toFixed(2)}</p>
                                <p className="text-[10px] font-black text-emerald-300">Total Paid: ₹{r.totalAmount || (r.rentalFee * 1.18).toFixed(2)}</p>
                              </div>
                            </div>
                          </td>

                          {/* Renter */}
                          <td className="p-4 space-y-0.5">
                            <p className="font-bold text-white">{r.renterName || user.name || "Reader"}</p>
                            {r.co && <p className="text-[10px] text-white/50">C/O: {r.co}</p>}
                            <p className="text-[10px] text-white/60">{r.renterEmail}</p>
                            <p className="text-[10px] font-mono text-emerald-300">{r.renterPhone}</p>
                            <p className="text-[10px] text-white/40 line-clamp-1">Address: {r.deliveryAddress}</p>
                            <span className="inline-block text-[9px] font-bold text-amber-300 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full mt-1">
                              📍 Self Pickup: Madhuban kathaltali, Tarader Thikana, Agartala, Tripura 799003
                            </span>
                          </td>

                          {/* Dates */}
                          <td className="p-4 space-y-1">
                            <p className="text-[10px] text-white/60">Taken: <strong className="text-white">{startDateStr}</strong></p>
                            <p className="text-[10px] text-white/60">Due: <strong className="text-cyan-300">{dueDateStr}</strong></p>
                            {!isReturned && (
                              <div className="pt-0.5">
                                {daysLeft > 0 ? (
                                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-extrabold text-emerald-300">
                                    <Clock size={10} /> {daysLeft} Day{daysLeft === 1 ? "" : "s"} Left
                                  </span>
                                ) : daysLeft === 0 ? (
                                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-400/20 px-2 py-0.5 text-[10px] font-extrabold text-amber-300">
                                    <Clock size={10} /> Due Today!
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 rounded-full border border-red-400/40 bg-red-400/20 px-2 py-0.5 text-[10px] font-black text-red-300">
                                    <AlertTriangle size={10} /> {Math.abs(daysLeft)} Day{Math.abs(daysLeft) === 1 ? "" : "s"} Overdue
                                  </span>
                                )}
                              </div>
                            )}
                          </td>

                          {/* Status */}
                          <td className="p-4">
                            {isReturned ? (
                              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/15 px-2.5 py-1 text-[10px] font-extrabold text-emerald-300">
                                <CheckCircle2 size={11} /> Returned
                              </span>
                            ) : isReturnPending ? (
                              <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/15 px-2.5 py-1 text-[10px] font-extrabold text-amber-300">
                                🟡 Return Pending ({daysLeft > 0 ? `${daysLeft} Days Left` : daysLeft === 0 ? "Due Today" : `${Math.abs(daysLeft)} Days Overdue`})
                              </span>
                            ) : isOverdue ? (
                              <div>
                                <span className="inline-flex items-center gap-1 rounded-full border border-red-400/30 bg-red-400/15 px-2.5 py-1 text-[10px] font-black text-red-300">
                                  ⚠️ Overdue ({r.daysOverdue || Math.abs(daysLeft)} Days)
                                </span>
                                <p className="mt-1 text-[10px] font-bold text-red-400">
                                  Late Fine: ₹{r.totalFine || r.calculatedFine || 0}
                                </p>
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full border border-cyan-400/30 bg-cyan-400/15 px-2.5 py-1 text-[10px] font-extrabold text-cyan-300">
                                🟢 Currently Rented ({daysLeft > 0 ? `${daysLeft} Days Left` : daysLeft === 0 ? "Due Today" : `${Math.abs(daysLeft)} Days Overdue`})
                              </span>
                            )}
                          </td>

                          {/* Action */}
                          <td className="p-4 text-right">
                            {!isReturned ? (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleSendReminder(r._id)}
                                  disabled={sendingReminderId === r._id}
                                  className="inline-flex items-center gap-1.5 rounded-xl border border-amber-400/40 bg-amber-400/10 px-3 py-2 text-[10px] font-extrabold text-amber-300 hover:bg-amber-400/20 transition disabled:opacity-50 cursor-pointer whitespace-nowrap"
                                  title="Send daily return & late fine reminder email to renter"
                                >
                                  {sendingReminderId === r._id ? (
                                    <Loader2 size={12} className="animate-spin" />
                                  ) : (
                                    <BellRing size={12} className="text-amber-400" />
                                  )}
                                  <span>{sendingReminderId === r._id ? "Sending..." : "Send Reminder"}</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleConfirmReturn(r._id)}
                                  disabled={confirmingId === r._id}
                                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 px-3.5 py-2 text-[10px] font-black text-black shadow hover:opacity-90 transition disabled:opacity-50 cursor-pointer whitespace-nowrap"
                                >
                                  {confirmingId === r._id ? (
                                    <Loader2 size={12} className="animate-spin" />
                                  ) : (
                                    <CheckCircle2 size={12} />
                                  )}
                                  CONFIRM RETURN
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] text-white/30 font-bold">Returned</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </PageTransition>
  );
}
