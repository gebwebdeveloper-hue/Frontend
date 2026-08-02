import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Loader2, Trash2, CheckCircle2, Search, RefreshCw, AlertCircle } from "lucide-react";
import { API_BASE, SERVER_URL } from "../../config.js";

export default function AdminUsersTab(props) {
  const [internalUsersList, setInternalUsersList] = useState([]);
  const [internalLoading, setInternalLoading] = useState(true);
  const [internalError, setInternalError] = useState("");
  const [internalSearchQuery, setInternalSearchQuery] = useState("");
  const [expandedUser, setExpandedUser] = useState(null);

  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState({ title: "", description: "" });

  // Lock body scroll when modal is open
  useEffect(() => {
    if (showSuccessPopup) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showSuccessPopup]);

  const usersList = props.usersList !== undefined ? props.usersList : internalUsersList;
  const loadingUsers = props.loadingUsers !== undefined ? props.loadingUsers : internalLoading;
  const usersError = props.usersError !== undefined ? props.usersError : internalError;
  const userSearchQuery = props.userSearchQuery !== undefined ? props.userSearchQuery : internalSearchQuery;
  const setUserSearchQuery = props.setUserSearchQuery || setInternalSearchQuery;

  const fetchAdminUsers = () => {
    if (props.fetchAdminUsers) {
      props.fetchAdminUsers();
      return;
    }
    setInternalLoading(true);
    setInternalError("");
    fetch(`${API_BASE}/admin/users`, { credentials: "include" })
      .then((r) => {
        if (!r.ok) {
          if (r.status === 401 || r.status === 403) {
            throw new Error("Admin session required or permissions missing. Please log out & log in again.");
          }
          throw new Error(`Server HTTP error ${r.status}`);
        }
        return r.json();
      })
      .then((d) => {
        console.log("AdminUsersTab fetched users:", d);
        if (d && d.success && Array.isArray(d.users)) {
          setInternalUsersList(d.users);
        } else {
          setInternalError(d?.message || "Failed to load registered readers.");
          setInternalUsersList([]);
        }
      })
      .catch((err) => {
        console.error("AdminUsersTab fetch error:", err);
        setInternalError(err.message || "Failed to connect to backend server.");
        setInternalUsersList([]);
      })
      .finally(() => setInternalLoading(false));
  };

  useEffect(() => {
    if (props.usersList === undefined) {
      fetchAdminUsers();
    }
  }, []);

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
          setShowSuccessPopup(true);
          fetchAdminUsers();
        } else {
          alert(data.message || "Failed to revoke access.");
        }
      })
      .catch(() => alert("Error communicating with server."));
  };

  const filteredUsers = (Array.isArray(usersList) ? usersList : []).filter((u) => {
    if (!u) return false;
    const query = (userSearchQuery || "").trim().toLowerCase();
    if (!query) return true;
    const nameMatch = (u.name || "").toLowerCase().includes(query);
    const emailMatch = (u.email || "").toLowerCase().includes(query);
    const phoneMatch = (u.phone || "").toLowerCase().includes(query);
    return nameMatch || emailMatch || phoneMatch;
  });

  return (
    <div className="space-y-6 text-white">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-white">User Access & Purchase Management</h2>
            <button
              onClick={fetchAdminUsers}
              title="Refresh users list"
              className="rounded-full border border-white/10 bg-white/5 p-2 text-white/60 hover:text-white hover:bg-white/10 transition"
            >
              <RefreshCw size={14} className={loadingUsers ? "animate-spin text-cyan-400" : ""} />
            </button>
          </div>
          <p className="text-xs text-white/50 mt-1">
            Inspect registered readers ({Array.isArray(usersList) ? usersList.length : 0} total), check their purchased books, and revoke access for violations.
          </p>
        </div>

        <div className="w-full sm:w-72 relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={userSearchQuery || ""}
            onChange={(e) => setUserSearchQuery(e.target.value)}
            placeholder="Search reader name or email..."
            className="w-full rounded-2xl border border-white/10 bg-white/5 pl-9 pr-4 py-2.5 text-xs text-white placeholder-white/30 focus:border-cyan-400/40 focus:outline-none"
          />
        </div>
      </div>

      {usersError && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-xs text-red-300 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-red-400 shrink-0" />
            <span>{usersError}</span>
          </div>
          <button
            onClick={fetchAdminUsers}
            className="rounded-xl bg-red-500/20 px-3 py-1.5 font-bold hover:bg-red-500/30 text-white transition flex items-center gap-1.5 shrink-0"
          >
            <RefreshCw size={12} /> Retry
          </button>
        </div>
      )}

      {loadingUsers ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-white/60 rounded-3xl border border-white/10 bg-white/[0.02]">
          <Loader2 size={36} className="animate-spin text-cyan-400" />
          <p className="text-xs font-semibold">Loading registered readers & purchase history...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-12 text-center">
          <User size={40} className="mx-auto mb-3 text-white/30" />
          <h3 className="text-base font-bold text-white">No Registered Readers Found</h3>
          <p className="text-xs text-white/50 mt-1">
            {userSearchQuery ? `No user matching "${userSearchQuery}"` : `Total registered users in DB: ${Array.isArray(usersList) ? usersList.length : 0}`}
          </p>
          <button
            onClick={fetchAdminUsers}
            className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 hover:bg-white/10 hover:text-white transition"
          >
            <RefreshCw size={14} /> Refresh List
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredUsers.map((u, idx) => {
            if (!u) return null;
            const uId = u._id || `user-${idx}`;
            const isExpanded = expandedUser === uId;
            const initial = u.name
              ? u.name.charAt(0).toUpperCase()
              : (u.email || "U").charAt(0).toUpperCase();

            return (
              <div
                key={uId}
                className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-6 backdrop-blur-xl transition hover:border-white/20"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 to-indigo-500 font-bold text-black text-lg shadow-md">
                      {initial}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-extrabold text-white">{u.name || "Reader"}</h3>
                        <span className="rounded-full bg-cyan-400/10 border border-cyan-400/20 px-2.5 py-0.5 text-[10px] font-extrabold text-cyan-300">
                          {u.totalBooksBought || 0} Books Purchased
                        </span>
                      </div>
                      <p className="text-xs text-white/50">{u.email || "No Email"} {u.phone ? `· ${u.phone}` : ""}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-[10px] uppercase font-bold text-white/40">Total Spent</p>
                      <p className="text-base font-black text-cyan-300">₹{u.totalSpent || 0}</p>
                    </div>

                    <button
                      onClick={() => setExpandedUser(isExpanded ? null : uId)}
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/10 transition"
                    >
                      {isExpanded ? "Hide Books" : `Inspect Books (${(u.purchases || []).length})`}
                    </button>
                  </div>
                </div>

                {/* Expanded Purchased Books List */}
                {isExpanded && (
                  <div className="mt-5 pt-4 border-t border-white/10 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white/60 mb-2">
                      Purchased Books & Access Status
                    </h4>

                    {(!Array.isArray(u.purchases) || u.purchases.length === 0) ? (
                      <p className="text-xs text-white/40 italic">This user has not placed any book orders yet.</p>
                    ) : (
                      u.purchases.map((p, pIdx) => {
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
                                <h5 className="truncate text-sm font-bold text-white">{book?.title || "Unknown Book"}</h5>
                                <p className="truncate text-xs text-white/45">{book?.author || "Author"} · Format: <strong className="uppercase text-cyan-300">{p.format || "ebook"}</strong></p>
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
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Success Notification Modal Popup */}
      <AnimatePresence>
        {showSuccessPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
            onClick={() => setShowSuccessPopup(false)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl border border-emerald-500/30 bg-zinc-950 p-6 sm:p-8 shadow-[0_0_50px_rgba(16,185,129,0.25)] text-center select-none"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Ambient glow circle */}
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 h-36 w-36 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />

              {/* Icon */}
              <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-glow">
                <CheckCircle2 size={36} className="animate-bounce" />
              </div>

              {/* Title */}
              <h3 className="text-2xl font-black text-white tracking-wide">
                {popupMessage.title || "Action Successful!"}
              </h3>

              {/* Description */}
              <p className="mt-3 text-sm text-white/65 leading-relaxed">
                {popupMessage.description || "The action has been completed successfully."}
              </p>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => setShowSuccessPopup(false)}
                className="mt-6 w-full rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 py-3.5 text-sm font-extrabold uppercase tracking-wider text-black shadow-lg shadow-emerald-500/20 transition hover:scale-[1.02] hover:opacity-95"
              >
                OK, Got It
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
