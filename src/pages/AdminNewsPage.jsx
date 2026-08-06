import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Newspaper,
  Plus,
  Pencil,
  Trash2,
  Pin,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Search,
  LogOut,
  Calendar,
  User,
  Upload,
  X,
  KeyRound,
  ArrowRight,
  Sparkles,
  Tag,
  Edit3,
  FolderKanban
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import PageTransition from "../components/PageTransition.jsx";
import { API_BASE, SERVER_URL } from "../config.js";

export default function AdminNewsPage() {
  const location = useLocation();

  // Auth state
  const [user, setUser] = useState(null);
  const [step, setStep] = useState("check-auth"); // check-auth, login-email, login-otp, dashboard
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [authError, setAuthError] = useState("");
  const [submittingAuth, setSubmittingAuth] = useState(false);

  // News state
  const [newsList, setNewsList] = useState([]);
  const [loadingNews, setLoadingNews] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [newsModalOpen, setNewsModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState("");
  const [newsForm, setNewsForm] = useState({
    title: "",
    summary: "",
    content: "",
    category: "Platform Update",
    isPinned: false,
    author: "Lekhok Tripura Team",
    coverImage: null
  });
  const [submittingForm, setSubmittingForm] = useState(false);

  // Dynamic Categories List (derived strictly from active news posts in DB)
  const existingCategories = useMemo(() => {
    const set = new Set();
    newsList.forEach((n) => {
      if (n.category && n.category.trim()) {
        set.add(n.category.trim());
      }
    });
    return Array.from(set);
  }, [newsList]);

  // Category Manager State
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategoryName, setEditingCategoryName] = useState(null);
  const [renameInputValue, setRenameInputValue] = useState("");
  const [deletingCategoryName, setDeletingCategoryName] = useState(null);
  const [fallbackCategoryInput, setFallbackCategoryInput] = useState("General News");
  const [submittingCategoryAction, setSubmittingCategoryAction] = useState(false);

  // Group category post count
  const categoryPostCounts = useMemo(() => {
    const map = {};
    newsList.forEach((n) => {
      const c = n.category || "General News";
      map[c] = (map[c] || 0) + 1;
    });
    return map;
  }, [newsList]);

  const handleRenameCategory = (oldCat) => {
    if (!renameInputValue.trim()) return;
    setSubmittingCategoryAction(true);

    fetch(`${API_BASE}/news/categories/rename`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ oldCategory: oldCat, newCategory: renameInputValue.trim() })
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setEditingCategoryName(null);
          setRenameInputValue("");
          fetchNews();
          setPopupMessage({
            title: "Category Renamed!",
            description: `Successfully renamed category to '${renameInputValue.trim()}'.`
          });
          setShowSuccessPopup(true);
        } else {
          alert(data.message || "Failed to rename category.");
        }
      })
      .catch(() => alert("Server error renaming category."))
      .finally(() => setSubmittingCategoryAction(false));
  };

  const handleDeleteCategory = (catToDelete, deletePosts = false) => {
    setSubmittingCategoryAction(true);

    fetch(`${API_BASE}/news/categories`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        category: catToDelete,
        fallbackCategory: fallbackCategoryInput.trim() || "General News",
        deletePosts
      })
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setDeletingCategoryName(null);
          fetchNews();
          setPopupMessage({
            title: "Category Deleted!",
            description: deletePosts
              ? `Category '${catToDelete}' and its posts were deleted.`
              : `Category '${catToDelete}' was removed and its posts were reassigned.`
          });
          setShowSuccessPopup(true);
        } else {
          alert(data.message || "Failed to delete category.");
        }
      })
      .catch(() => alert("Server error deleting category."))
      .finally(() => setSubmittingCategoryAction(false));
  };

  // Success Popup
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState({ title: "", description: "" });

  useEffect(() => {
    fetch(`${API_BASE}/auth/me`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user && data.user.role === "admin") {
          setUser(data.user);
          setStep("dashboard");
          fetchNews();
        } else {
          setStep("login-email");
        }
      })
      .catch(() => setStep("login-email"));
  }, [location.pathname]);

  useEffect(() => {
    if (newsModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [newsModalOpen]);

  const fetchNews = () => {
    setLoadingNews(true);
    fetch(`${API_BASE}/news`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.news)) {
          setNewsList(data.news);
        }
      })
      .catch((err) => console.error("Error fetching news:", err))
      .finally(() => setLoadingNews(false));
  };

  const handleRequestOtp = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubmittingAuth(true);
    setAuthError("");

    fetch(`${API_BASE}/auth/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
      credentials: "include"
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStep("login-otp");
        } else {
          setAuthError(data.message || "Failed to send OTP.");
        }
      })
      .catch(() => setAuthError("Server error. Please try again."))
      .finally(() => setSubmittingAuth(false));
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (!otp) return;
    setSubmittingAuth(true);
    setAuthError("");

    fetch(`${API_BASE}/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
      credentials: "include"
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          if (data.user.role !== "admin") {
            setAuthError("Access denied. Admin privileges required.");
            setStep("login-email");
          } else {
            setUser(data.user);
            setStep("dashboard");
            fetchNews();
          }
        } else {
          setAuthError(data.message || "Invalid OTP code.");
        }
      })
      .catch(() => setAuthError("Server error. Please try again."))
      .finally(() => setSubmittingAuth(false));
  };

  const handleLogout = async () => {
    await fetch(`${API_BASE}/auth/logout`, { method: "POST", credentials: "include" }).catch(() => {});
    setUser(null);
    setStep("login-email");
  };

  const handleOpenCreateModal = () => {
    setEditingNews(null);
    setIsCreatingCategory(false);
    setCustomCategoryInput("");
    const initialCat = existingCategories.length > 0 ? existingCategories[0] : "Platform Update";
    setNewsForm({
      title: "",
      summary: "",
      content: "",
      category: initialCat,
      isPinned: false,
      author: "Lekhok Tripura Team",
      coverImage: null
    });
    setNewsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingNews(item);
    setIsCreatingCategory(false);
    setCustomCategoryInput("");
    setNewsForm({
      title: item.title || "",
      summary: item.summary || "",
      content: item.content || "",
      category: item.category || "Platform Update",
      isPinned: item.isPinned || false,
      author: item.author || "Lekhok Tripura Team",
      coverImage: null
    });
    setNewsModalOpen(true);
  };

  const handleSaveNews = (e) => {
    e.preventDefault();
    setSubmittingForm(true);

    let categoryToSave = newsForm.category;
    if (isCreatingCategory || newsForm.category === "__create_new__") {
      categoryToSave = customCategoryInput.trim();
      if (!categoryToSave) {
        alert("Please type a name for the new category.");
        setSubmittingForm(false);
        return;
      }
    }

    const formData = new FormData();
    formData.append("title", newsForm.title);
    formData.append("summary", newsForm.summary);
    formData.append("content", newsForm.content);
    formData.append("category", categoryToSave);
    formData.append("isPinned", newsForm.isPinned);
    formData.append("author", newsForm.author);
    if (newsForm.coverImage) {
      formData.append("coverImage", newsForm.coverImage);
    }

    const url = editingNews
      ? `${API_BASE}/news/${editingNews._id}`
      : `${API_BASE}/news`;
    const method = editingNews ? "PUT" : "POST";

    fetch(url, {
      method,
      credentials: "include",
      body: formData
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setNewsModalOpen(false);
          setPopupMessage({
            title: editingNews ? "Announcement Updated!" : "Announcement Published!",
            description: editingNews ? "News announcement details have been updated." : "Your website announcement is live for readers."
          });
          setShowSuccessPopup(true);
          fetchNews();
        } else {
          alert(data.message || "Failed to save announcement.");
        }
      })
      .catch(() => alert("Error communicating with backend."))
      .finally(() => setSubmittingForm(false));
  };

  const handleDeleteNews = (item) => {
    if (!window.confirm(`Are you sure you want to delete "${item.title}"?`)) return;

    fetch(`${API_BASE}/news/${item._id}`, {
      method: "DELETE",
      credentials: "include"
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setPopupMessage({
            title: "Announcement Deleted!",
            description: "The news announcement has been removed."
          });
          setShowSuccessPopup(true);
          fetchNews();
        } else {
          alert(data.message || "Failed to delete announcement.");
        }
      })
      .catch(() => alert("Error communicating with backend."));
  };

  const handleTogglePin = (item) => {
    const formData = new FormData();
    formData.append("title", item.title);
    formData.append("summary", item.summary);
    formData.append("content", item.content);
    formData.append("category", item.category || "General News");
    formData.append("author", item.author || "Lekhok Tripura Team");
    formData.append("isPinned", (!item.isPinned).toString());

    fetch(`${API_BASE}/news/${item._id}`, {
      method: "PUT",
      credentials: "include",
      body: formData
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setPopupMessage({
            title: item.isPinned ? "Unpinned from Spotlight" : "Pinned to Spotlight!",
            description: item.isPinned
              ? "This announcement is no longer featured in the top Spotlight."
              : "This announcement is now featured at the top of the News page."
          });
          setShowSuccessPopup(true);
          fetchNews();
        } else {
          alert(data.message || "Failed to update pin status.");
        }
      })
      .catch(() => alert("Error communicating with backend."));
  };

  const filteredNews = useMemo(() => {
    if (!searchQuery.trim()) return newsList;
    const q = searchQuery.toLowerCase().trim();
    return newsList.filter(
      (n) =>
        (n.title || "").toLowerCase().includes(q) ||
        (n.summary || "").toLowerCase().includes(q)
    );
  }, [newsList, searchQuery]);

  return (
    <PageTransition>
      <div className="min-h-screen px-4 sm:px-6 py-20 sm:py-28 relative overflow-hidden bg-black text-white">
        {/* Background glow */}
        <div className="absolute inset-0 animated-gradient opacity-80" />
        <div className="noise" />
        <div className="absolute left-0 top-0 h-[600px] w-[600px] rounded-full bg-cyan-500/5 blur-[180px] pointer-events-none" />

        <div className="mx-auto max-w-7xl relative z-10">
          {/* CHECKING AUTH */}
          {step === "check-auth" && (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
              <Loader2 className="h-10 w-10 animate-spin text-cyan-300 mb-4" />
              <p className="text-white/60">Verifying admin session...</p>
            </div>
          )}

          {/* LOGIN - EMAIL */}
          {step === "login-email" && (
            <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-2xl shadow-glow">
              <div className="mb-8 flex flex-col items-center text-center">
                <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-cyan-400/10 text-cyan-300">
                  <KeyRound size={24} />
                </div>
                <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
                <p className="mt-2 text-sm text-white/50">Enter admin email to request access verification.</p>
              </div>

              {authError && (
                <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleRequestOtp} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-2">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@lekhak.local"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm text-white placeholder-white/30 focus:border-cyan-400/40 focus:bg-white/10 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingAuth}
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-semibold text-black transition-all hover:scale-[1.02] disabled:opacity-50"
                >
                  {submittingAuth ? <Loader2 className="h-5 w-5 animate-spin" /> : "Request Access OTP"}
                  {!submittingAuth && <ArrowRight size={16} className="transition group-hover:translate-x-1" />}
                </button>
              </form>
            </div>
          )}

          {/* LOGIN - OTP */}
          {step === "login-otp" && (
            <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-2xl shadow-glow">
              <div className="mb-8 flex flex-col items-center text-center">
                <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-cyan-400/10 text-cyan-300">
                  <Newspaper size={24} />
                </div>
                <h1 className="text-2xl font-bold text-white">Enter OTP</h1>
                <p className="mt-2 text-sm text-white/50">Verification code sent to {email}</p>
              </div>

              {authError && (
                <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-2">6-Digit Code</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    className="w-full text-center tracking-[0.5em] font-mono text-lg rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white focus:border-cyan-400/40 focus:bg-white/10 focus:outline-none"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep("login-email")}
                    className="w-1/3 rounded-xl border border-white/10 bg-white/5 py-3.5 text-sm font-semibold text-white/60 hover:bg-white/10 transition"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={submittingAuth}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3.5 text-sm font-semibold text-black transition-all hover:scale-[1.02] disabled:opacity-50"
                  >
                    {submittingAuth ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verify & Log In"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* DASHBOARD */}
          {step === "dashboard" && (
            <div>
              {/* Header section */}
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between border-b border-white/10 pb-6 mb-8 gap-6">
                <div>
                  <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <span className="animated-text-gradient">News &amp; Updates</span> Manager
                  </h1>
                  <p className="mt-1 text-sm text-white/55">
                    Publish official website announcements, new feature releases, and system updates for readers.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                  {/* Navigation Tabs */}
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
                      className="rounded-full px-4 py-1.5 text-xs font-semibold transition shrink-0 bg-white text-black font-bold"
                    >
                      News &amp; Updates
                    </Link>
                    <Link
                      to="/admin?tab=newsletter"
                      className="rounded-full px-4 py-1.5 text-xs font-semibold transition shrink-0 text-white/60 hover:text-white"
                    >
                      Free Stories
                    </Link>
                    <Link
                      to="/admin/users"
                      className="rounded-full px-4 py-1.5 text-xs font-semibold transition shrink-0 text-white/60 hover:text-white"
                    >
                      Manage Users
                    </Link>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white hover:bg-red-500/20 hover:border-red-500/30 transition shrink-0 w-full sm:w-auto"
                  >
                    <LogOut size={14} /> Log Out
                  </button>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Search Bar */}
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 h-4 w-4" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search announcements by title..."
                    className="w-full rounded-2xl border border-white/10 bg-white/5 pl-11 pr-4 py-3 text-xs text-white placeholder-white/30 focus:border-cyan-400/50 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                  <button
                    onClick={() => setCategoryModalOpen(true)}
                    className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-bold text-white hover:bg-white/10 transition w-full sm:w-auto"
                  >
                    <FolderKanban size={15} className="text-cyan-400" /> Manage Categories ({existingCategories.length})
                  </button>

                  <button
                    onClick={handleOpenCreateModal}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-5 py-3 text-xs font-bold text-black hover:bg-cyan-300 transition w-full sm:w-auto shadow-glow"
                  >
                    <Plus size={16} /> Publish New Announcement
                  </button>
                </div>
              </div>

              {/* News List Grid */}
              {loadingNews ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="h-10 w-10 animate-spin text-cyan-300 mb-4" />
                  <p className="text-white/60 text-sm">Loading announcements...</p>
                </div>
              ) : filteredNews.length === 0 ? (
                <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-16 text-center">
                  <Newspaper size={48} className="mx-auto mb-4 text-white/30" />
                  <h3 className="text-lg font-bold text-white">No Announcements Found</h3>
                  <p className="text-xs text-white/50 mt-1">
                    Click "Publish New Announcement" to post website updates for readers.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredNews.map((item) => (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl hover:border-white/20 transition-all shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                    >
                      <div className="flex items-start gap-4 min-w-0">
                        {item.coverImage?.url ? (
                          <img
                            src={item.coverImage.url.startsWith("http") ? item.coverImage.url : `${SERVER_URL}${item.coverImage.url}`}
                            alt={item.title}
                            className="h-16 w-20 rounded-2xl object-cover border border-white/10 shrink-0 bg-zinc-900"
                          />
                        ) : (
                          <div className="h-16 w-16 rounded-2xl bg-cyan-950/40 border border-cyan-500/20 flex items-center justify-center text-cyan-300 shrink-0">
                            <Newspaper size={24} />
                          </div>
                        )}

                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            {item.isPinned && (
                              <span className="rounded-full bg-amber-400/20 border border-amber-400/30 px-2.5 py-0.5 text-[9px] font-black uppercase text-amber-300 flex items-center gap-1">
                                <Pin size={10} /> Pinned
                              </span>
                            )}
                            <span className="rounded-full bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5 text-[9px] font-extrabold uppercase text-cyan-300">
                              {(item.category || "general").replace("_", " ")}
                            </span>
                            <span className="text-[10px] text-white/40 flex items-center gap-1">
                              <Calendar size={10} /> {new Date(item.createdAt).toLocaleDateString("en-IN")}
                            </span>
                          </div>

                          <h3 className="text-lg font-bold text-white truncate">{item.title}</h3>
                          <p className="text-xs text-white/60 line-clamp-1">{item.summary}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                        <button
                          onClick={() => handleTogglePin(item)}
                          className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition ${
                            item.isPinned
                              ? "bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30"
                              : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                          }`}
                          title={item.isPinned ? "Unpin from Featured Spotlight" : "Pin to Featured Spotlight"}
                        >
                          <Pin size={13} className={item.isPinned ? "rotate-45 text-amber-400" : ""} />
                          {item.isPinned ? "Unpin Spotlight" : "Pin Spotlight"}
                        </button>

                        <Link
                          to="/news"
                          target="_blank"
                          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/70 hover:bg-white/10 hover:text-white transition"
                        >
                          View Public
                        </Link>
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-500/30 transition"
                        >
                          <Pencil size={13} /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteNews(item)}
                          className="flex items-center gap-1 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-400 hover:bg-red-500/20 transition"
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* CREATE / EDIT ANNOUNCEMENT MODAL */}
      {createPortal(
        <AnimatePresence>
          {newsModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md overflow-y-auto"
              onClick={() => setNewsModalOpen(false)}
              data-lenis-prevent
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl border border-cyan-500/30 bg-zinc-950 p-6 sm:p-8 shadow-glow my-auto scrollbar-thin scrollbar-thumb-white/20"
                onClick={(e) => e.stopPropagation()}
                data-lenis-prevent
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
                  <div className="flex items-center gap-2">
                    <Newspaper size={20} className="text-cyan-400" />
                    <h3 className="text-lg font-bold text-white">
                      {editingNews ? "Edit News Announcement" : "Publish New Announcement"}
                    </h3>
                  </div>
                  <button
                    onClick={() => setNewsModalOpen(false)}
                    className="rounded-full p-2 text-white/50 hover:bg-white/10 hover:text-white transition"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleSaveNews} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1.5">Headline Title *</label>
                    <input
                      type="text"
                      required
                      value={newsForm.title}
                      onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                      placeholder="e.g. Website v2.0 Released: Razorpay Automated Checkout Now Live!"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-cyan-400/40 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50">Category *</label>
                        {!isCreatingCategory ? (
                          <button
                            type="button"
                            onClick={() => {
                              setIsCreatingCategory(true);
                              setCustomCategoryInput("");
                            }}
                            className="text-[10px] font-bold text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            + Create New Category
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setIsCreatingCategory(false);
                              setNewsForm({ ...newsForm, category: existingCategories[0] || "Platform Update" });
                            }}
                            className="text-[10px] font-bold text-white/50 hover:text-white underline cursor-pointer"
                          >
                            Use Existing Category
                          </button>
                        )}
                      </div>

                      {!isCreatingCategory ? (
                        <select
                          value={newsForm.category}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "__create_new__") {
                              setIsCreatingCategory(true);
                              setCustomCategoryInput("");
                            } else {
                              setNewsForm({ ...newsForm, category: val });
                            }
                          }}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white focus:border-cyan-400/40 focus:outline-none"
                        >
                          {existingCategories.map((cat) => (
                            <option key={cat} value={cat} className="bg-zinc-900 text-white">
                              {cat}
                            </option>
                          ))}
                          <option value="__create_new__" className="bg-zinc-900 text-cyan-300 font-bold">
                            + Create New Category...
                          </option>
                        </select>
                      ) : (
                        <input
                          type="text"
                          required
                          autoFocus
                          value={customCategoryInput}
                          onChange={(e) => setCustomCategoryInput(e.target.value)}
                          placeholder="Type new category name (e.g. Press Release)..."
                          className="w-full rounded-xl border border-cyan-400/50 bg-cyan-950/40 px-4 py-3 text-xs text-white placeholder-white/40 focus:border-cyan-400 focus:outline-none shadow-glow"
                        />
                      )}
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1.5">Author</label>
                      <input
                        type="text"
                        value={newsForm.author}
                        onChange={(e) => setNewsForm({ ...newsForm, author: e.target.value })}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white focus:border-cyan-400/40 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1.5">Short Summary *</label>
                    <input
                      type="text"
                      required
                      maxLength={500}
                      value={newsForm.summary}
                      onChange={(e) => setNewsForm({ ...newsForm, summary: e.target.value })}
                      placeholder="Brief overview shown on cards..."
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white focus:border-cyan-400/40 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1.5">Full Announcement Body *</label>
                    <textarea
                      rows="6"
                      required
                      value={newsForm.content}
                      onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })}
                      placeholder="Detailed announcement details..."
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white focus:border-cyan-400/40 focus:outline-none resize-none leading-relaxed"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="isPinned"
                      checked={newsForm.isPinned}
                      onChange={(e) => setNewsForm({ ...newsForm, isPinned: e.target.checked })}
                      className="h-4 w-4 rounded accent-cyan-400"
                    />
                    <label htmlFor="isPinned" className="text-xs text-white/80 font-semibold cursor-pointer">
                      Pin this announcement to top banner showcase
                    </label>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50">Cover Image (Optional)</label>
                      <span className="text-[10px] font-semibold text-cyan-300/80">Max: 1920×1080px | Max size: 5MB</span>
                    </div>

                    <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/10 p-5 transition hover:border-cyan-400/30 hover:bg-white/[0.03] text-center">
                      {newsForm.coverImage ? (
                        <div className="flex flex-col items-center gap-2">
                          <img
                            src={URL.createObjectURL(newsForm.coverImage)}
                            alt="Preview"
                            className="max-h-36 max-w-full object-contain rounded-lg border border-white/10 bg-zinc-900 p-1"
                          />
                          <div className="text-xs text-cyan-300 font-medium truncate max-w-xs">
                            {newsForm.coverImage.name} ({(newsForm.coverImage.size / (1024 * 1024)).toFixed(2)} MB)
                          </div>
                          <span className="text-[10px] text-white/40 underline">Click to change image</span>
                        </div>
                      ) : editingNews?.coverImage?.url ? (
                        <div className="flex flex-col items-center gap-2">
                          <img
                            src={editingNews.coverImage.url.startsWith("http") ? editingNews.coverImage.url : `${SERVER_URL}${editingNews.coverImage.url}`}
                            alt="Current Cover"
                            className="max-h-36 max-w-full object-contain rounded-lg border border-white/10 bg-zinc-900 p-1"
                          />
                          <span className="text-xs text-white/60">Current image uploaded. Click to replace.</span>
                        </div>
                      ) : (
                        <>
                          <Upload size={22} className="text-cyan-400/70" />
                          <span className="text-xs font-semibold text-white/70">Click to browse or drop cover image</span>
                          <span className="text-[10px] text-white/40">Recommended: 1200×630px · Formats: JPEG, PNG, WEBP (Max 5MB)</span>
                        </>
                      )}
                      <input
                        type="file"
                        className="hidden"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            if (file.size > 5 * 1024 * 1024) {
                              alert("File size exceeds 5MB limit. Please select a smaller image file.");
                              return;
                            }
                            setNewsForm({ ...newsForm, coverImage: file });
                          }
                        }}
                      />
                    </label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setNewsModalOpen(false)}
                      className="w-1/3 rounded-xl border border-white/10 bg-white/5 py-3 text-xs font-bold text-white/60 hover:bg-white/10 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingForm}
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-cyan-400 py-3 text-xs font-bold text-black hover:bg-cyan-300 transition disabled:opacity-50"
                    >
                      {submittingForm ? <Loader2 className="h-4 w-4 animate-spin text-black" /> : editingNews ? "Save Announcement" : "Publish Announcement"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* SUCCESS POPUP MODAL */}
      {createPortal(
        <AnimatePresence>
          {showSuccessPopup && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[110] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
              onClick={() => setShowSuccessPopup(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="relative w-full max-w-sm rounded-3xl border border-emerald-500/30 bg-zinc-950 p-6 text-center shadow-glow"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-xl font-bold text-white">{popupMessage.title}</h3>
                <p className="mt-2 text-xs text-white/60">{popupMessage.description}</p>
                <button
                  onClick={() => setShowSuccessPopup(false)}
                  className="mt-6 w-full rounded-xl bg-emerald-400 py-3 text-xs font-bold text-black hover:bg-emerald-300 transition"
                >
                  Close
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* MANAGE CATEGORIES MODAL */}
      {createPortal(
        <AnimatePresence>
          {categoryModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md overflow-y-auto"
              onClick={() => {
                setCategoryModalOpen(false);
                setEditingCategoryName(null);
                setDeletingCategoryName(null);
              }}
              data-lenis-prevent
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="relative w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-3xl border border-cyan-500/30 bg-zinc-950 p-6 sm:p-8 shadow-glow my-auto scrollbar-thin scrollbar-thumb-white/20"
                onClick={(e) => e.stopPropagation()}
                data-lenis-prevent
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
                  <div className="flex items-center gap-2">
                    <FolderKanban size={20} className="text-cyan-400" />
                    <h3 className="text-lg font-bold text-white">Manage News Categories</h3>
                  </div>
                  <button
                    onClick={() => {
                      setCategoryModalOpen(false);
                      setEditingCategoryName(null);
                      setDeletingCategoryName(null);
                    }}
                    className="rounded-full p-2 text-white/50 hover:bg-white/10 hover:text-white transition"
                  >
                    <X size={18} />
                  </button>
                </div>

                <p className="text-xs text-white/50 mb-5">
                  Rename category titles or delete categories across all platform announcements.
                </p>

                <div className="space-y-3">
                  {existingCategories.map((cat) => {
                    const postCount = categoryPostCounts[cat] || 0;
                    const isEditing = editingCategoryName === cat;
                    const isDeleting = deletingCategoryName === cat;

                    return (
                      <div
                        key={cat}
                        className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex flex-col gap-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <Tag size={15} className="text-cyan-400" />
                            <span className="text-sm font-bold text-white">{cat}</span>
                            <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold text-white/60">
                              {postCount} {postCount === 1 ? "post" : "posts"}
                            </span>
                          </div>

                          {!isEditing && !isDeleting && (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => {
                                  setEditingCategoryName(cat);
                                  setRenameInputValue(cat);
                                  setDeletingCategoryName(null);
                                }}
                                className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70 hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-cyan-300 transition"
                                title="Rename Category"
                              >
                                <Pencil size={12} /> Rename
                              </button>
                              <button
                                onClick={() => {
                                  setDeletingCategoryName(cat);
                                  setEditingCategoryName(null);
                                }}
                                className="flex items-center gap-1 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/20 transition"
                                title="Delete Category"
                              >
                                <Trash2 size={12} /> Delete
                              </button>
                            </div>
                          )}
                        </div>

                        {/* RENAME INLINE ROW */}
                        {isEditing && (
                          <div className="pt-2 border-t border-white/10 flex items-center gap-2">
                            <input
                              type="text"
                              value={renameInputValue}
                              onChange={(e) => setRenameInputValue(e.target.value)}
                              placeholder="Enter new category name..."
                              className="flex-1 rounded-xl border border-cyan-400/50 bg-cyan-950/30 px-3.5 py-2 text-xs text-white placeholder-white/30 focus:outline-none"
                            />
                            <button
                              disabled={submittingCategoryAction}
                              onClick={() => handleRenameCategory(cat)}
                              className="rounded-xl bg-cyan-400 px-4 py-2 text-xs font-bold text-black hover:bg-cyan-300 transition disabled:opacity-50"
                            >
                              {submittingCategoryAction ? <Loader2 size={13} className="animate-spin" /> : "Save"}
                            </button>
                            <button
                              onClick={() => setEditingCategoryName(null)}
                              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/60 hover:bg-white/10"
                            >
                              Cancel
                            </button>
                          </div>
                        )}

                        {/* DELETE CONFIRMATION ROW */}
                        {isDeleting && (
                          <div className="pt-2 border-t border-white/10 space-y-2">
                            {postCount > 0 ? (
                              <>
                                <p className="text-xs text-red-300 font-medium">
                                  Category currently has {postCount} {postCount === 1 ? "post" : "posts"}. Choose an action:
                                </p>
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                  <input
                                    type="text"
                                    value={fallbackCategoryInput}
                                    onChange={(e) => setFallbackCategoryInput(e.target.value)}
                                    placeholder="Reassign category (e.g. General News)"
                                    className="flex-1 rounded-xl border border-red-500/40 bg-red-950/30 px-3.5 py-2 text-xs text-white placeholder-white/30 focus:outline-none"
                                  />
                                  <button
                                    disabled={submittingCategoryAction}
                                    onClick={() => handleDeleteCategory(cat, false)}
                                    className="rounded-xl bg-cyan-500 px-3.5 py-2 text-xs font-bold text-black hover:bg-cyan-400 transition disabled:opacity-50 shrink-0"
                                  >
                                    Reassign &amp; Delete
                                  </button>
                                  <button
                                    disabled={submittingCategoryAction}
                                    onClick={() => handleDeleteCategory(cat, true)}
                                    className="rounded-xl bg-red-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-red-500 transition disabled:opacity-50 shrink-0"
                                  >
                                    Delete All {postCount} Posts
                                  </button>
                                  <button
                                    onClick={() => setDeletingCategoryName(null)}
                                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/60 hover:bg-white/10 shrink-0"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </>
                            ) : (
                              <div className="flex items-center justify-between gap-3 pt-1">
                                <span className="text-xs text-white/70">Are you sure you want to delete category <strong>'{cat}'</strong>?</span>
                                <div className="flex items-center gap-2">
                                  <button
                                    disabled={submittingCategoryAction}
                                    onClick={() => handleDeleteCategory(cat, false)}
                                    className="rounded-xl bg-red-500 px-4 py-2 text-xs font-bold text-white hover:bg-red-400 transition"
                                  >
                                    {submittingCategoryAction ? <Loader2 size={13} className="animate-spin text-white" /> : "Confirm Delete"}
                                  </button>
                                  <button
                                    onClick={() => setDeletingCategoryName(null)}
                                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/60 hover:bg-white/10"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </PageTransition>
  );
}
