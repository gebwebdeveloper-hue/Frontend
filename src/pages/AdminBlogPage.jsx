import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Plus,
  Pencil,
  Trash2,
  Pin,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Search,
  Calendar,
  User,
  Upload,
  X,
  KeyRound,
  ArrowRight,
  Sparkles,
  FolderKanban,
  Eye,
  Image as ImageIcon
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import PageTransition from "../components/PageTransition.jsx";
import AdminNavbar from "../components/AdminNavbar.jsx";
import { API_BASE, SERVER_URL } from "../config.js";

export default function AdminBlogPage() {
  const location = useLocation();

  // Auth state
  const [user, setUser] = useState(null);
  const [step, setStep] = useState("check-auth"); // check-auth, login-email, login-otp, dashboard
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [authError, setAuthError] = useState("");
  const [submittingAuth, setSubmittingAuth] = useState(false);

  // Blogs state
  const [blogsList, setBlogsList] = useState([]);
  const [loadingBlogs, setLoadingBlogs] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [blogModalOpen, setBlogModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState("");
  const [blogForm, setBlogForm] = useState({
    title: "",
    summary: "",
    content: "",
    category: "General",
    isPinned: false,
    author: "Lekhok Tripura Team",
    imageCaption: "",
    coverImage: null
  });
  const [submittingForm, setSubmittingForm] = useState(false);

  // Dynamic Categories List (derived strictly from active blog posts in DB)
  const existingCategories = useMemo(() => {
    const set = new Set();
    blogsList.forEach((b) => {
      if (b.category && b.category.trim()) {
        set.add(b.category.trim());
      }
    });
    return Array.from(set);
  }, [blogsList]);

  // Category Manager State
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategoryName, setEditingCategoryName] = useState(null);
  const [renameInputValue, setRenameInputValue] = useState("");
  const [deletingCategoryName, setDeletingCategoryName] = useState(null);
  const [fallbackCategoryInput, setFallbackCategoryInput] = useState("General");
  const [submittingCategoryAction, setSubmittingCategoryAction] = useState(false);

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
          fetchBlogs();
        } else {
          setStep("login-email");
        }
      })
      .catch(() => setStep("login-email"));
  }, [location.pathname]);

  useEffect(() => {
    if (blogModalOpen || categoryModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [blogModalOpen, categoryModalOpen]);

  const fetchBlogs = () => {
    setLoadingBlogs(true);
    fetch(`${API_BASE}/blogs`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.blogs)) {
          setBlogsList(data.blogs);
        }
      })
      .catch((err) => console.error("Error fetching blogs:", err))
      .finally(() => setLoadingBlogs(false));
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
            fetchBlogs();
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
    setEditingBlog(null);
    setIsCreatingCategory(false);
    setCustomCategoryInput("");
    const initialCat = existingCategories.length > 0 ? existingCategories[0] : "General";
    setBlogForm({
      title: "",
      summary: "",
      content: "",
      category: initialCat,
      isPinned: false,
      author: "Lekhok Tripura Team",
      imageCaption: "",
      coverImage: null
    });
    setBlogModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingBlog(item);
    setIsCreatingCategory(false);
    setCustomCategoryInput("");
    setBlogForm({
      title: item.title || "",
      summary: item.summary || "",
      content: item.content || "",
      category: item.category || "General",
      isPinned: item.isPinned || false,
      author: item.author || "Lekhok Tripura Team",
      imageCaption: item.imageCaption || "",
      coverImage: null
    });
    setBlogModalOpen(true);
  };

  const handleSaveBlog = (e) => {
    e.preventDefault();
    setSubmittingForm(true);

    let categoryToSave = blogForm.category;
    if (isCreatingCategory || blogForm.category === "__create_new__") {
      categoryToSave = customCategoryInput.trim();
      if (!categoryToSave) {
        alert("Please type a name for the new category.");
        setSubmittingForm(false);
        return;
      }
    }

    const formData = new FormData();
    formData.append("title", blogForm.title);
    formData.append("summary", blogForm.summary);
    formData.append("content", blogForm.content);
    formData.append("category", categoryToSave);
    formData.append("isPinned", blogForm.isPinned);
    formData.append("author", blogForm.author);
    formData.append("imageCaption", blogForm.imageCaption);
    if (blogForm.coverImage) {
      formData.append("coverImage", blogForm.coverImage);
    }

    const url = editingBlog
      ? `${API_BASE}/blogs/${editingBlog._id}`
      : `${API_BASE}/blogs`;
    const method = editingBlog ? "PUT" : "POST";

    fetch(url, {
      method,
      credentials: "include",
      body: formData
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setBlogModalOpen(false);
          setPopupMessage({
            title: editingBlog ? "Blog Post Updated!" : "Blog Post Published!",
            description: editingBlog ? "Blog article details have been updated." : "Your blog article is now live for readers."
          });
          setShowSuccessPopup(true);
          fetchBlogs();
        } else {
          alert(data.message || "Failed to save blog post.");
        }
      })
      .catch(() => alert("Error communicating with backend."))
      .finally(() => setSubmittingForm(false));
  };

  const handleDeleteBlog = (item) => {
    if (!window.confirm(`Are you sure you want to delete "${item.title}"?`)) return;

    fetch(`${API_BASE}/blogs/${item._id}`, {
      method: "DELETE",
      credentials: "include"
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setPopupMessage({
            title: "Blog Article Deleted!",
            description: "The blog post has been permanently removed."
          });
          setShowSuccessPopup(true);
          fetchBlogs();
        } else {
          alert(data.message || "Failed to delete blog post.");
        }
      })
      .catch(() => alert("Error communicating with backend."));
  };

  const handleTogglePin = (item) => {
    const formData = new FormData();
    formData.append("title", item.title);
    formData.append("summary", item.summary);
    formData.append("content", item.content);
    formData.append("category", item.category || "General");
    formData.append("author", item.author || "Lekhok Tripura Team");
    formData.append("imageCaption", item.imageCaption || "");
    formData.append("isPinned", (!item.isPinned).toString());

    fetch(`${API_BASE}/blogs/${item._id}`, {
      method: "PUT",
      credentials: "include",
      body: formData
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setPopupMessage({
            title: item.isPinned ? "Unpinned Blog Post" : "Pinned Blog Post!",
            description: item.isPinned
              ? "This blog post is no longer pinned at the top."
              : "This blog post is now featured at the top of the blog page."
          });
          setShowSuccessPopup(true);
          fetchBlogs();
        } else {
          alert(data.message || "Failed to update pin status.");
        }
      })
      .catch(() => alert("Error communicating with backend."));
  };

  const handleRenameCategory = (oldCat) => {
    if (!renameInputValue.trim()) return;
    setSubmittingCategoryAction(true);

    fetch(`${API_BASE}/blogs/categories/rename`, {
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
          fetchBlogs();
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

    fetch(`${API_BASE}/blogs/categories`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        category: catToDelete,
        fallbackCategory: fallbackCategoryInput.trim() || "General",
        deletePosts
      })
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setDeletingCategoryName(null);
          fetchBlogs();
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

  const filteredBlogs = useMemo(() => {
    if (!searchQuery.trim()) return blogsList;
    const q = searchQuery.toLowerCase().trim();
    return blogsList.filter(
      (b) =>
        (b.title || "").toLowerCase().includes(q) ||
        (b.summary || "").toLowerCase().includes(q)
    );
  }, [blogsList, searchQuery]);

  return (
    <PageTransition>
      <div className="min-h-screen px-4 sm:px-6 py-20 sm:py-28 relative overflow-hidden bg-black text-white">
        {/* Background glow */}
        <div className="absolute inset-0 animated-gradient opacity-80" />
        <div className="noise" />
        <div className="absolute left-0 top-0 h-[600px] w-[600px] rounded-full bg-amber-500/5 blur-[180px] pointer-events-none" />

        <div className="mx-auto max-w-7xl relative z-10">
          {/* CHECKING AUTH */}
          {step === "check-auth" && (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
              <Loader2 className="h-10 w-10 animate-spin text-amber-300 mb-4" />
              <p className="text-white/60">Verifying admin session...</p>
            </div>
          )}

          {/* LOGIN - EMAIL */}
          {step === "login-email" && (
            <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-2xl shadow-glow">
              <div className="mb-8 flex flex-col items-center text-center">
                <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-amber-400/10 text-amber-300">
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
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm text-white placeholder-white/30 focus:border-amber-400/40 focus:bg-white/10 focus:outline-none"
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
                <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-amber-400/10 text-amber-300">
                  <FileText size={24} />
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
                    className="w-full text-center tracking-[0.5em] font-mono text-lg rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white focus:border-amber-400/40 focus:bg-white/10 focus:outline-none"
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
              {/* Admin Navbar */}
              <AdminNavbar onLogoutSuccess={handleLogout} />

              {/* Title Section */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                  <span className="animated-text-gradient">Blog Articles</span> Manager
                </h1>
                <p className="mt-1 text-sm text-white/55">
                  Write, edit, and publish engaging blog articles, historical stories, and literary guides for readers.
                </p>
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
                    placeholder="Search blogs by title..."
                    className="w-full rounded-2xl border border-white/10 bg-white/5 pl-11 pr-4 py-3 text-xs text-white placeholder-white/30 focus:border-amber-400/50 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                  <button
                    onClick={() => setCategoryModalOpen(true)}
                    className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-bold text-white hover:bg-white/10 transition w-full sm:w-auto"
                  >
                    <FolderKanban size={15} className="text-amber-400" /> Manage Categories ({existingCategories.length})
                  </button>

                  <button
                    onClick={handleOpenCreateModal}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-amber-400 px-5 py-3 text-xs font-bold text-black hover:bg-amber-300 transition w-full sm:w-auto shadow-glow"
                  >
                    <Plus size={16} /> Publish New Blog Post
                  </button>
                </div>
              </div>

              {/* Blog List Grid */}
              {loadingBlogs ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="h-10 w-10 animate-spin text-amber-300 mb-4" />
                  <p className="text-white/60 text-sm">Loading blog articles...</p>
                </div>
              ) : filteredBlogs.length === 0 ? (
                <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-16 text-center">
                  <FileText size={48} className="mx-auto mb-4 text-white/30" />
                  <h3 className="text-lg font-bold text-white">No Blog Articles Found</h3>
                  <p className="text-xs text-white/50 mt-1">
                    Click "Publish New Blog Post" to publish blog stories for readers.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredBlogs.map((item) => (
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
                          <div className="h-16 w-16 rounded-2xl bg-amber-950/40 border border-amber-500/20 flex items-center justify-center text-amber-300 shrink-0">
                            <FileText size={24} />
                          </div>
                        )}

                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            {item.isPinned && (
                              <span className="rounded-full bg-amber-400/20 border border-amber-400/30 px-2.5 py-0.5 text-[9px] font-black uppercase text-amber-300 flex items-center gap-1">
                                <Pin size={10} /> Featured
                              </span>
                            )}
                            <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 text-[9px] font-extrabold uppercase text-amber-300">
                              {item.category || "General"}
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
                          title={item.isPinned ? "Unpin from Featured" : "Pin to Featured"}
                        >
                          <Pin size={13} className={item.isPinned ? "rotate-45 text-amber-400" : ""} />
                          {item.isPinned ? "Unpin Post" : "Pin Post"}
                        </button>

                        <Link
                          to="/news?tab=blogs"
                          target="_blank"
                          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/70 hover:bg-white/10 hover:text-white transition"
                        >
                          View Public
                        </Link>
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-amber-300 hover:bg-amber-500/20 hover:border-amber-500/30 transition"
                        >
                          <Pencil size={13} /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteBlog(item)}
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

      {/* CREATE / EDIT BLOG MODAL */}
      {createPortal(
        <AnimatePresence>
          {blogModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md overflow-y-auto"
              onClick={() => setBlogModalOpen(false)}
              data-lenis-prevent
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="relative w-full max-w-3xl max-h-[88vh] overflow-y-auto rounded-3xl border border-amber-500/30 bg-zinc-950 p-6 sm:p-8 shadow-glow my-auto scrollbar-thin scrollbar-thumb-white/20"
                onClick={(e) => e.stopPropagation()}
                data-lenis-prevent
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
                  <div className="flex items-center gap-2">
                    <FileText size={20} className="text-amber-400" />
                    <h3 className="text-lg font-bold text-white">
                      {editingBlog ? "Edit Blog Article" : "Publish New Blog Post"}
                    </h3>
                  </div>
                  <button
                    onClick={() => setBlogModalOpen(false)}
                    className="rounded-full p-2 text-white/50 hover:bg-white/10 hover:text-white transition"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleSaveBlog} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1.5">Article Title *</label>
                    <input
                      type="text"
                      required
                      value={blogForm.title}
                      onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                      placeholder="e.g. ১৪ বছরের একটি শিশুকে মৃত্যুদণ্ড—George Stinney Jr.-এর মর্মান্তিক গল্প"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-amber-400/40 focus:outline-none font-medium"
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
                            className="text-[10px] font-bold text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            + Create New Category
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setIsCreatingCategory(false);
                              setBlogForm({ ...blogForm, category: existingCategories[0] || "General" });
                            }}
                            className="text-[10px] font-bold text-white/50 hover:text-white underline cursor-pointer"
                          >
                            Use Existing Category
                          </button>
                        )}
                      </div>

                      {!isCreatingCategory ? (
                        <select
                          value={blogForm.category}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "__create_new__") {
                              setIsCreatingCategory(true);
                              setCustomCategoryInput("");
                            } else {
                              setBlogForm({ ...blogForm, category: val });
                            }
                          }}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white focus:border-amber-400/40 focus:outline-none"
                        >
                          {existingCategories.map((cat) => (
                            <option key={cat} value={cat} className="bg-zinc-900 text-white">
                              {cat}
                            </option>
                          ))}
                          <option value="__create_new__" className="bg-zinc-900 text-amber-300 font-bold">
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
                          placeholder="Type new category (e.g. Story, History)..."
                          className="w-full rounded-xl border border-amber-400/50 bg-amber-950/40 px-4 py-3 text-xs text-white placeholder-white/40 focus:border-amber-400 focus:outline-none shadow-glow"
                        />
                      )}
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1.5">Author</label>
                      <input
                        type="text"
                        value={blogForm.author}
                        onChange={(e) => setBlogForm({ ...blogForm, author: e.target.value })}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white focus:border-amber-400/40 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1.5">Short Excerpt / Paragraph Summary *</label>
                    <textarea
                      required
                      rows={3}
                      maxLength={1000}
                      value={blogForm.summary}
                      onChange={(e) => setBlogForm({ ...blogForm, summary: e.target.value })}
                      placeholder="Brief excerpt displayed on blog cards..."
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white focus:border-amber-400/40 focus:outline-none resize-none leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1.5">Featured Image / Cover</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setBlogForm({ ...blogForm, coverImage: e.target.files[0] || null })}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white file:mr-3 file:rounded-lg file:border-0 file:bg-amber-400 file:px-3 file:py-1 file:text-xs file:font-bold file:text-black cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1.5">Image Subtitle / Caption</label>
                      <input
                        type="text"
                        value={blogForm.imageCaption}
                        onChange={(e) => setBlogForm({ ...blogForm, imageCaption: e.target.value })}
                        placeholder="e.g. George Stinney Jr.—১৯৪৪ সালে মাত্র ১৪ বছর বয়সে..."
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-white focus:border-amber-400/40 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1.5">Full Article Content *</label>
                    <textarea
                      required
                      rows={8}
                      value={blogForm.content}
                      onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                      placeholder="Write your complete blog post here..."
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white focus:border-amber-400/40 focus:outline-none resize-y leading-relaxed font-light"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <input
                      type="checkbox"
                      id="isPinned"
                      checked={blogForm.isPinned}
                      onChange={(e) => setBlogForm({ ...blogForm, isPinned: e.target.checked })}
                      className="h-4 w-4 rounded border-white/20 bg-white/10 text-amber-400 focus:ring-amber-400/50"
                    />
                    <label htmlFor="isPinned" className="text-xs font-semibold text-white/80 cursor-pointer">
                      Pin to Featured Spotlight at Top
                    </label>
                  </div>

                  <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-4 mt-6">
                    <button
                      type="button"
                      onClick={() => setBlogModalOpen(false)}
                      className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-bold text-white/70 hover:bg-white/10 hover:text-white transition"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={submittingForm}
                      className="flex items-center gap-2 rounded-xl bg-amber-400 px-6 py-2.5 text-xs font-bold text-black hover:bg-amber-300 transition shadow-glow disabled:opacity-50"
                    >
                      {submittingForm ? <Loader2 size={14} className="animate-spin" /> : editingBlog ? "Update Blog Post" : "Publish Blog Post"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* CATEGORY MANAGER MODAL */}
      {createPortal(
        <AnimatePresence>
          {categoryModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
              onClick={() => setCategoryModalOpen(false)}
              data-lenis-prevent
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-zinc-950 p-6 sm:p-8 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
                data-lenis-prevent
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
                  <div className="flex items-center gap-2">
                    <FolderKanban size={20} className="text-amber-400" />
                    <h3 className="text-lg font-bold text-white">Manage Blog Categories</h3>
                  </div>
                  <button
                    onClick={() => setCategoryModalOpen(false)}
                    className="rounded-full p-2 text-white/50 hover:bg-white/10 hover:text-white transition"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                  {existingCategories.length === 0 ? (
                    <p className="text-xs text-white/50 text-center py-4">No active categories found.</p>
                  ) : (
                    existingCategories.map((cat) => (
                      <div key={cat} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
                        {editingCategoryName === cat ? (
                          <div className="flex items-center gap-2 w-full">
                            <input
                              type="text"
                              value={renameInputValue}
                              onChange={(e) => setRenameInputValue(e.target.value)}
                              className="flex-1 rounded-xl border border-amber-400/50 bg-black px-3 py-1.5 text-xs text-white"
                            />
                            <button
                              onClick={() => handleRenameCategory(cat)}
                              disabled={submittingCategoryAction}
                              className="rounded-xl bg-amber-400 px-3 py-1.5 text-xs font-bold text-black"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingCategoryName(null)}
                              className="rounded-xl bg-white/10 px-3 py-1.5 text-xs font-bold text-white"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <>
                            <span className="text-xs font-bold text-white">{cat}</span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setEditingCategoryName(cat);
                                  setRenameInputValue(cat);
                                }}
                                className="p-1.5 rounded-lg text-amber-300 hover:bg-amber-500/20"
                                title="Rename Category"
                              >
                                <Pencil size={13} />
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(cat, false)}
                                className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/20"
                                title="Delete Category"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))
                  )}
                </div>
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
              className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
              onClick={() => setShowSuccessPopup(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 10 }}
                className="w-full max-w-sm rounded-3xl border border-amber-400/40 bg-zinc-950 p-6 text-center shadow-glow"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-amber-400/20 text-amber-300">
                  <CheckCircle2 size={24} />
                </div>
                <h4 className="text-lg font-bold text-white">{popupMessage.title}</h4>
                <p className="mt-1.5 text-xs text-white/70 leading-relaxed">{popupMessage.description}</p>
                <button
                  onClick={() => setShowSuccessPopup(false)}
                  className="mt-5 w-full rounded-xl bg-amber-400 py-2.5 text-xs font-bold text-black hover:bg-amber-300 transition"
                >
                  Dismiss
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </PageTransition>
  );
}
