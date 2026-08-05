import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Loader2, Search, Trash2, ArrowLeft,
  RefreshCw, CheckCircle2, Shield, Phone, Mail, BookOpen, Sparkles
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import PageTransition from "../components/PageTransition.jsx";
import { API_BASE, SERVER_URL } from "../config.js";

export default function AdminUsersPage() {
  const navigate = useNavigate();

  // Admin Auth State
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);

  // Registered Users Data State
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [expandedUser, setExpandedUser] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Popup Feedback
  const [popupMessage, setPopupMessage] = useState(null);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (popupMessage) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
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

  // 2. Fetch All Registered Users & Story Purchases
  const fetchUsers = () => {
    setLoading(true);
    setError("");
    Promise.all([
      fetch(`${API_BASE}/admin/users`, { credentials: "include" }).then((r) => {
        if (!r.ok) {
          if (r.status === 401) throw new Error("Admin session required. Please log in.");
          throw new Error(`Server returned HTTP ${r.status}`);
        }
        return r.json();
      }),
      fetch(`${API_BASE}/newsletter/admin/access-requests`, { credentials: "include" }).then((r) => r.json()).catch(() => ({ success: false, requests: [] }))
    ])
      .then(([usersRes, storyRes]) => {
        if (usersRes.success && Array.isArray(usersRes.users)) {
          const allStories = (storyRes.success && Array.isArray(storyRes.requests)) ? storyRes.requests : [];
          
          const enrichedUsers = usersRes.users.map((u) => {
            const userEmail = (u.email || "").toLowerCase().trim();
            const userStories = allStories.filter((s) => (s.userEmail || "").toLowerCase().trim() === userEmail);
            return {
              ...u,
              storyPurchases: userStories
            };
          });

          setUsers(enrichedUsers);
        } else {
          setError(usersRes.message || "Failed to load registered users.");
          setUsers([]);
        }
      })
      .catch((err) => {
        console.error("Error fetching admin users:", err);
        setError(err.message || "Failed to connect to backend server.");
        setUsers([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (authed) fetchUsers();
  }, [authed]);

  // 3. Revoke Book Access Handler
  const handleRevokeUserAccess = (purchaseId) => {
    if (!window.confirm("Are you sure you want to revoke this user's access to this book?")) return;

    fetch(`${API_BASE}/admin/users/purchases/${purchaseId}/revoke`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ reason: "Access revoked by admin due to policy violation." })
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setPopupMessage({
            title: "Access Revoked!",
            description: "The user's access to this book has been successfully revoked."
          });
          fetchUsers();
        } else {
          alert(data.message || "Failed to revoke access.");
        }
      })
      .catch(() => alert("Error communicating with server."));
  };

  // Delete Registered User Handler
  const handleDeleteUser = (userToDelete) => {
    if (!userToDelete || !userToDelete._id) return;
    const userName = userToDelete.name || userToDelete.email || "this reader";
    if (!window.confirm(`Are you sure you want to permanently delete user "${userName}"? This will remove their account permanently.`)) {
      return;
    }

    setDeletingId(userToDelete._id);
    fetch(`${API_BASE}/admin/users/${userToDelete._id}`, {
      method: "DELETE",
      credentials: "include"
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setPopupMessage({
            title: "User Account Deleted!",
            description: `User "${userName}" has been successfully removed from the system.`
          });
          fetchUsers();
        } else {
          alert(data.message || "Failed to delete user account.");
        }
      })
      .catch(() => alert("Error communicating with server."))
      .finally(() => setDeletingId(null));
  };

  // 4. Filter Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (!u) return false;
      const q = search.trim().toLowerCase();
      if (!q) return true;
      const nameMatch = (u.name || "").toLowerCase().includes(q);
      const emailMatch = (u.email || "").toLowerCase().includes(q);
      const phoneMatch = (u.phone || "").toLowerCase().includes(q);
      return nameMatch || emailMatch || phoneMatch;
    });
  }, [users, search]);

  if (checking) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-3 text-cyan-400">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-xs text-white/50">Checking admin session...</p>
      </div>
    );
  }

  if (!authed) return null;

  return (
    <PageTransition>
      <div className="min-h-screen bg-zinc-950 text-white px-4 py-8 sm:px-8 max-w-7xl mx-auto pt-24 pb-16">
        
        {/* Navigation & Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between border-b border-white/10 pb-6 mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Registered Users Directory</h1>
            <p className="text-xs text-white/50 mt-1">
              All registered platform members ({users.length} total readers), purchase history, and access management.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            {/* Tabs */}
            <div className="flex rounded-full bg-white/5 p-1 border border-white/10 overflow-x-auto max-w-full whitespace-nowrap scrollbar-none">
              <Link
                to="/admin"
                className="rounded-full px-4 py-1.5 text-xs font-semibold transition shrink-0 text-white/60 hover:text-white"
              >
                Manage Books
              </Link>
              <Link
                to="/admin/purchases"
                className="rounded-full px-4 py-1.5 text-xs font-semibold transition shrink-0 text-white/60 hover:text-white"
              >
                Razorpay Payments
              </Link>
              <Link
                to="/admin/news"
                className="rounded-full px-4 py-1.5 text-xs font-semibold transition shrink-0 text-white/60 hover:text-white"
              >
                News &amp; Updates
              </Link>
              <Link
                to="/admin"
                className="rounded-full px-4 py-1.5 text-xs font-semibold transition shrink-0 text-white/60 hover:text-white"
              >
                Authors
              </Link>
              <Link
                to="/admin?tab=newsletter"
                className="rounded-full px-4 py-1.5 text-xs font-semibold transition shrink-0 text-white/60 hover:text-white"
              >
                Free Stories
              </Link>
              <Link
                to="/admin/users"
                className="rounded-full px-4 py-1.5 text-xs font-semibold transition shrink-0 bg-white text-black"
              >
                Manage Users
              </Link>
            </div>

            <button
              onClick={fetchUsers}
              className="flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white hover:bg-white/10 transition shrink-0"
            >
              <RefreshCw size={13} className={loading ? "animate-spin text-cyan-400" : ""} /> Refresh List
            </button>
          </div>
        </div>

        {/* Page Title & Search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Registered Users Directory</h1>
            <p className="text-xs text-white/50 mt-1">
              All registered platform members ({users.length} total readers), purchase history, and access management.
            </p>
          </div>

          <div className="w-full sm:w-80 relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by reader name, email, or phone..."
              className="w-full rounded-2xl border border-white/10 bg-white/5 pl-9 pr-4 py-3 text-xs text-white placeholder-white/30 focus:border-cyan-400/40 focus:outline-none"
            />
          </div>
        </div>

        {/* Error Notification Banner */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-xs text-red-300 flex items-center justify-between gap-3">
            <span>⚠ {error}</span>
            <button
              onClick={fetchUsers}
              className="rounded-xl bg-red-500/20 px-3 py-1.5 font-bold hover:bg-red-500/30 text-white transition flex items-center gap-1.5 shrink-0"
            >
              <RefreshCw size={12} /> Retry Loading
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-white/50 rounded-3xl border border-white/10 bg-white/[0.02]">
            <Loader2 size={40} className="animate-spin text-cyan-400" />
            <p className="text-sm font-semibold text-white/70">Fetching all registered readers...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          /* Empty State */
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-16 text-center">
            <User size={48} className="mx-auto mb-4 text-white/30" />
            <h2 className="text-lg font-bold text-white">No Registered Users Found</h2>
            <p className="text-xs text-white/50 mt-1">
              {search ? `No user matching search term "${search}"` : "No registered user accounts exist in the database."}
            </p>
            <button
              onClick={fetchUsers}
              className="mt-6 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-semibold text-white hover:bg-white/10 transition"
            >
              <RefreshCw size={14} /> Refresh List
            </button>
          </div>
        ) : (
          /* Users Cards List */
          <div className="grid gap-4">
            {filteredUsers.map((u, idx) => {
              if (!u) return null;
              const uId = u._id || `user-${idx}`;
              const isExpanded = expandedUser === uId;
              const initial = u.name
                ? u.name.charAt(0).toUpperCase()
                : (u.email || "U").charAt(0).toUpperCase();

              const bookPurchases = Array.isArray(u.purchases) ? u.purchases : [];
              const storyPurchases = Array.isArray(u.storyPurchases) ? u.storyPurchases : [];

              const approvedBooksCount = bookPurchases.filter((p) => p.status === "approved").length;
              const approvedStoriesCount = storyPurchases.filter((s) => s.status === "approved").length;

              const booksSpent = bookPurchases.filter((p) => p.status === "approved").reduce((acc, curr) => acc + (curr.amount || 0), 0);
              const storiesSpent = storyPurchases.filter((s) => s.status === "approved").reduce((acc, curr) => acc + (curr.amount || 0), 0);
              const totalSpent = booksSpent + storiesSpent;
              const totalItems = bookPurchases.length + storyPurchases.length;

              return (
                <div
                  key={uId}
                  className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-6 backdrop-blur-xl transition hover:border-white/20"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 to-indigo-500 font-extrabold text-black text-xl shadow-md">
                        {initial}
                      </div>

                      {/* User Info */}
                      <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h3 className="text-base font-extrabold text-white">{u.name || "Reader Account"}</h3>
                          {u.role === "admin" && (
                            <span className="rounded-full bg-indigo-500/20 border border-indigo-500/30 px-2.5 py-0.5 text-[10px] font-black uppercase text-indigo-300 flex items-center gap-1">
                              <Shield size={10} /> Admin
                            </span>
                          )}
                          <span className="rounded-full bg-cyan-400/10 border border-cyan-400/20 px-2.5 py-0.5 text-[10px] font-bold text-cyan-300">
                            {approvedBooksCount} Books · {approvedStoriesCount} Stories
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-white/50">
                          <span className="flex items-center gap-1">
                            <Mail size={12} className="text-white/40" /> {u.email || "No email registered"}
                          </span>
                          {u.phone && (
                            <span className="flex items-center gap-1">
                              <Phone size={12} className="text-white/40" /> {u.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right side stats & inspect button */}
                    <div className="flex items-center gap-5">
                      <div className="text-right hidden sm:block">
                        <p className="text-[10px] uppercase font-bold text-white/40">Total Spent</p>
                        <p className="text-base font-black text-cyan-300">₹{totalSpent}</p>
                      </div>

                      <button
                        onClick={() => setExpandedUser(isExpanded ? null : uId)}
                        className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/10 transition"
                      >
                        {isExpanded ? "Hide Details" : `Inspect Purchases (${totalItems})`}
                      </button>

                      {u.role !== "admin" && (
                        <button
                          onClick={() => handleDeleteUser(u)}
                          disabled={deletingId === u._id}
                          title="Delete User Account"
                          className="rounded-2xl border border-red-500/20 bg-red-500/10 p-2.5 text-red-400 hover:bg-red-500/20 hover:border-red-500/40 transition disabled:opacity-40 flex items-center justify-center shrink-0"
                        >
                          {deletingId === u._id ? (
                            <Loader2 size={16} className="animate-spin text-red-400" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded Purchased Books & Stories History */}
                  {isExpanded && (
                    <div className="mt-5 pt-4 border-t border-white/10 space-y-4">
                      {/* Section 1: Book Purchases */}
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300 mb-2 flex items-center gap-1.5">
                          <BookOpen size={13} /> Book Purchases ({bookPurchases.length})
                        </h4>

                        {bookPurchases.length === 0 ? (
                          <p className="text-xs text-white/40 italic">No book orders placed yet.</p>
                        ) : (
                          <div className="space-y-2">
                            {bookPurchases.map((p, pIdx) => {
                              if (!p) return null;
                              const pId = p._id || `p-${pIdx}`;
                              const book = p.bookId || {};
                              const pStatus = (p.status || "pending").toLowerCase();
                              const isApproved = pStatus === "approved";
                              const isPending = pStatus === "pending";

                              return (
                                <div
                                  key={pId}
                                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-3.5"
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className="h-12 w-9 shrink-0 overflow-hidden rounded-lg bg-zinc-900 border border-white/10">
                                      {book?.cover?.url ? (
                                        <img
                                          src={book.cover.url.startsWith("http") ? book.cover.url : `${SERVER_URL}${book.cover.url}`}
                                          alt={book.title || "Book"}
                                          className="h-full w-full object-cover"
                                        />
                                      ) : (
                                        <div className="h-full w-full bg-cyan-500 grid place-items-center text-[8px] text-white">
                                          BOOK
                                        </div>
                                      )}
                                    </div>

                                    <div className="min-w-0">
                                      <h5 className="truncate text-sm font-bold text-white">{book?.title || "Unknown Title"}</h5>
                                      <p className="truncate text-xs text-white/45">
                                        {book?.author || "Author"} · Format: <strong className="uppercase text-cyan-300">{p.format || "ebook"}</strong>
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3 shrink-0">
                                    <span className="text-xs font-bold text-white">₹{p.amount ?? 0}</span>

                                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                      isApproved
                                        ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                                        : isPending
                                        ? "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                                        : "bg-red-500/10 text-red-400 border border-red-500/20"
                                    }`}>
                                      {pStatus.toUpperCase()}
                                    </span>

                                    {isApproved && (
                                      <button
                                        type="button"
                                        onClick={() => handleRevokeUserAccess(p._id)}
                                        className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-extrabold text-red-300 hover:bg-red-500/20 transition flex items-center gap-1.5"
                                      >
                                        <Trash2 size={13} /> Revoke Access
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Section 2: Short Story Access Purchases */}
                      <div className="pt-2 border-t border-white/5">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-fuchsia-300 mb-2 flex items-center gap-1.5">
                          <Sparkles size={13} /> Short Story Access Purchases ({storyPurchases.length})
                        </h4>

                        {storyPurchases.length === 0 ? (
                          <p className="text-xs text-white/40 italic">No short story access purchased yet.</p>
                        ) : (
                          <div className="space-y-2">
                            {storyPurchases.map((s, sIdx) => {
                              const sId = s._id || `s-${sIdx}`;
                              const storyObj = s.newsletterId || {};
                              const sStatus = (s.status || "pending").toLowerCase();
                              const isApproved = sStatus === "approved";

                              return (
                                <div
                                  key={sId}
                                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-3.5"
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className="h-10 w-10 shrink-0 grid place-items-center rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-300">
                                      <Sparkles size={18} />
                                    </div>
                                    <div className="min-w-0">
                                      <h5 className="truncate text-sm font-bold text-white">{storyObj.title || "Short Story Access"}</h5>
                                      <p className="truncate text-xs text-white/45">
                                        by {storyObj.author || "Lekhok Tripura"} · Ref: <span className="font-mono text-cyan-300">{s.razorpayPaymentId || s.transactionId || "N/A"}</span>
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3 shrink-0">
                                    <span className="text-xs font-bold text-emerald-400">₹{s.amount ?? 0}</span>
                                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                      isApproved
                                        ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                                        : "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                                    }`}>
                                      {sStatus.toUpperCase()}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Modal Notification Popup */}
        <AnimatePresence>
          {popupMessage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
              onClick={() => setPopupMessage(null)}
            >
              <motion.div
                initial={{ scale: 0.85, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.85, opacity: 0, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="relative w-full max-w-md overflow-hidden rounded-3xl border border-emerald-500/30 bg-zinc-950 p-6 sm:p-8 shadow-[0_0_50px_rgba(16,185,129,0.25)] text-center select-none"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-glow">
                  <CheckCircle2 size={36} className="animate-bounce" />
                </div>
                <h3 className="text-2xl font-black text-white tracking-wide">{popupMessage.title}</h3>
                <p className="mt-3 text-sm text-white/65 leading-relaxed">{popupMessage.description}</p>
                <button
                  type="button"
                  onClick={() => setPopupMessage(null)}
                  className="mt-6 w-full rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 py-3.5 text-sm font-extrabold uppercase tracking-wider text-black shadow-lg shadow-emerald-500/20 transition hover:scale-[1.02] hover:opacity-95"
                >
                  OK, Got It
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </PageTransition>
  );
}
