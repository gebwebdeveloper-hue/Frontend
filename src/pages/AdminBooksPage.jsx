import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Sparkles, BookOpen, KeyRound, ArrowRight, Upload, Trash2, ShieldCheck, LogOut, Loader2, AlertCircle, User, Pencil, PlusCircle, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import PageTransition from "../components/PageTransition.jsx";
import { API_BASE, SERVER_URL } from "../config.js";

export default function AdminBooksPage() {
  const location = useLocation();
  // Auth state
  const [user, setUser] = useState(null);
  const [step, setStep] = useState("check-auth"); // check-auth, login-email, login-otp, dashboard
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [authError, setAuthError] = useState("");

  // Loading states
  const [submittingAuth, setSubmittingAuth] = useState(false);
  const [submittingBook, setSubmittingBook] = useState(false);
  const [loadingBooks, setLoadingBooks] = useState(false);

  // Books listing
  const [booksList, setBooksList] = useState([]);
  const [booksTotal, setBooksTotal] = useState(0);

  // Purchase requests state
  const [purchasesList, setPurchasesList] = useState([]);
  const [loadingPurchases, setLoadingPurchases] = useState(false);
  const [activeTab, setActiveTab] = useState("books"); // 'books', 'purchases', 'authors'
  const [adminNotes, setAdminNotes] = useState({});

  // Author management state
  const [authorsList, setAuthorsList] = useState([]);
  const [loadingAuthors, setLoadingAuthors] = useState(false);
  const [authorForm, setAuthorForm] = useState({ name: "", bio: "", featured: true, ourPublicationAuthor: false, order: 0 });
  const [authorThumbnail, setAuthorThumbnail] = useState(null);
  const [editingAuthor, setEditingAuthor] = useState(null);
  const [authorFormError, setAuthorFormError] = useState("");
  const [authorFormSuccess, setAuthorFormSuccess] = useState("");
  const [submittingAuthor, setSubmittingAuthor] = useState(false);

  // Book form state
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("10");
  const [category, setCategory] = useState("Story");
  const [pages, setPages] = useState("100");
  const [language, setLanguage] = useState("English");
  const [tags, setTags] = useState("");
  const [featured, setFeatured] = useState(false);
  const [trending, setTrending] = useState(false);
  const [ourPublication, setOurPublication] = useState(false);
  const [comingSoon, setComingSoon] = useState(false);
  const [editingBook, setEditingBook] = useState(null);

  // File states
  const [coverFile, setCoverFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [previewPdfFile, setPreviewPdfFile] = useState(null);
  const [previewImagesFiles, setPreviewImagesFiles] = useState([]);
  const [formSuccess, setFormSuccess] = useState("");
  const [formError, setFormError] = useState("");

  const MAX_FILE_MB = 10;
  const MAX_FILE_SIZE = MAX_FILE_MB * 1024 * 1024; // 10 MB in bytes
  const [fileSizeErrors, setFileSizeErrors] = useState({});

  const checkFileSize = (file, key) => {
    if (!file) return true;
    if (file.size > MAX_FILE_SIZE) {
      setFileSizeErrors((prev) => ({ ...prev, [key]: `File exceeds ${MAX_FILE_MB}MB limit (${(file.size / 1024 / 1024).toFixed(1)}MB)` }));
      return false;
    }
    setFileSizeErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });
    return true;
  };


  // Check authentication on mount
  useEffect(() => {
    fetch(`${API_BASE}/auth/me`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        if (data.success && data.user) {
          if (data.user.role === "admin") {
            setUser(data.user);
            setStep("dashboard");
            fetchBooks();
            fetchPurchases();
            fetchAuthors();
          } else {
            setAuthError("Access denied. Admin permissions required.");
            setStep("login-email");
          }
        } else {
          setStep("login-email");
        }
      })
      .catch(() => {
        setStep("login-email");
      });
  }, []);

  useEffect(() => {
    if (location.state?.editBookId && booksList.length > 0) {
      const bookToEdit = booksList.find((b) => b._id === location.state.editBookId);
      if (bookToEdit) {
        setActiveTab("books");
        handleEditBook(bookToEdit);
      }
    }
  }, [location.state?.editBookId, booksList]);

  const fetchBooks = () => {
    setLoadingBooks(true);
    fetch(`${API_BASE}/books?limit=2000`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setBooksList(data.books || []);
          setBooksTotal(data.pagination?.total || data.books?.length || 0);
        }
      })
      .catch((err) => console.error("Error fetching books:", err))
      .finally(() => setLoadingBooks(false));
  };

  const fetchPurchases = () => {
    setLoadingPurchases(true);
    fetch(`${API_BASE}/purchase/admin`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPurchasesList(data.purchases || []);
        }
      })
      .catch((err) => console.error("Error fetching purchases:", err))
      .finally(() => setLoadingPurchases(false));
  };

  const fetchAuthors = () => {
    setLoadingAuthors(true);
    fetch(`${API_BASE}/authors/all`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setAuthorsList(data.authors || []);
      })
      .catch(() => {})
      .finally(() => setLoadingAuthors(false));
  };

  const handleAuthorFormChange = (field, value) => {
    setAuthorForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetAuthorForm = () => {
    setAuthorForm({ name: "", bio: "", featured: true, ourPublicationAuthor: false, order: 0 });
    setAuthorThumbnail(null);
    setEditingAuthor(null);
    setAuthorFormError("");
    setAuthorFormSuccess("");
  };

  const handleAuthorSubmit = (e) => {
    e.preventDefault();
    setAuthorFormError("");
    setAuthorFormSuccess("");
    if (!authorForm.name.trim()) {
      setAuthorFormError("Author name is required.");
      return;
    }
    setSubmittingAuthor(true);
    const fd = new FormData();
    fd.append("name", authorForm.name);
    fd.append("bio", authorForm.bio);
    fd.append("featured", String(authorForm.featured));
    fd.append("ourPublicationAuthor", String(authorForm.ourPublicationAuthor));
    fd.append("order", String(authorForm.order));
    if (authorThumbnail) fd.append("thumbnail", authorThumbnail);

    const url = editingAuthor ? `${API_BASE}/authors/${editingAuthor._id}` : `${API_BASE}/authors`;
    const method = editingAuthor ? "PUT" : "POST";

    fetch(url, { method, body: fd, credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setAuthorFormSuccess(editingAuthor ? "Author updated!" : "Author created!");
          resetAuthorForm();
          fetchAuthors();
        } else {
          setAuthorFormError(data.message || "Failed to save author.");
        }
      })
      .catch(() => setAuthorFormError("Server error. Please try again."))
      .finally(() => setSubmittingAuthor(false));
  };

  const handleEditAuthor = (author) => {
    setEditingAuthor(author);
    setAuthorForm({
      name: author.name,
      bio: author.bio || "",
      featured: author.featured,
      ourPublicationAuthor: author.ourPublicationAuthor || false,
      order: author.order || 0,
    });
    setAuthorThumbnail(null);
    setAuthorFormError("");
    setAuthorFormSuccess("");
  };

  const handleDeleteAuthor = (id) => {
    if (!confirm("Delete this author? This cannot be undone.")) return;
    fetch(`${API_BASE}/authors/${id}`, { method: "DELETE", credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) fetchAuthors();
        else alert(data.message || "Failed to delete.");
      })
      .catch(() => alert("Error deleting author."));
  };

  const handleApprovePurchase = (id) => {
    const note = adminNotes[id] || "";
    fetch(`${API_BASE}/purchase/${id}/approve`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminNote: note }),
      credentials: "include"
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          fetchPurchases();
        } else {
          alert(data.message || "Failed to approve request.");
        }
      })
      .catch(() => alert("Error approving request."));
  };

  const handleRejectPurchase = (id) => {
    const note = adminNotes[id] || "";
    fetch(`${API_BASE}/purchase/${id}/reject`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminNote: note }),
      credentials: "include"
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          fetchPurchases();
        } else {
          alert(data.message || "Failed to reject request.");
        }
      })
      .catch(() => alert("Error rejecting request."));
  };

  const handleNoteChange = (id, val) => {
    setAdminNotes(prev => ({ ...prev, [id]: val }));
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
          // Print OTP in console in dev to assist testing
          console.log("DEV ONLY: OTP Sent:", data.otp || "Check server terminal logs");
        } else {
          setAuthError(data.message || "Failed to send OTP.");
        }
      })
      .catch(() => setAuthError("Server unreachable. Ensure backend is running."))
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
      body: JSON.stringify({ email, otp, name }),
      credentials: "include"
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          if (data.user.role === "admin") {
            setUser(data.user);
            setStep("dashboard");
            fetchBooks();
            fetchPurchases();
            fetchAuthors();
          } else {
            setAuthError("Authentication successful, but you are not an authorized admin.");
            setStep("login-email");
          }
        } else {
          setAuthError(data.message || "Invalid or expired OTP.");
        }
      })
      .catch(() => setAuthError("Verification failed. Please try again."))
      .finally(() => setSubmittingAuth(false));
  };

  const handleLogout = () => {
    fetch(`${API_BASE}/auth/logout`, { method: "POST", credentials: "include" })
      .then(() => {
        setUser(null);
        setStep("login-email");
        setBooksList([]);
        setAuthorsList([]);
      })
      .catch(() => {
        setUser(null);
        setStep("login-email");
      });
  };

  const handleDeleteBook = (id) => {
    if (!confirm("Are you sure you want to delete this book?")) return;

    fetch(`${API_BASE}/books/${id}`, {
      method: "DELETE",
      credentials: "include"
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          fetchBooks();
        } else {
          alert(data.message || "Failed to delete book.");
        }
      })
      .catch(() => alert("Failed to complete delete request."));
  };

  const resetBookForm = () => {
    setTitle("");
    setAuthor("");
    setDescription("");
    setPrice("10");
    setCategory("Story");
    setPages("100");
    setLanguage("English");
    setTags("");
    setFeatured(false);
    setTrending(false);
    setOurPublication(false);
    setComingSoon(false);
    setCoverFile(null);
    setPdfFile(null);
    setPreviewPdfFile(null);
    setPreviewImagesFiles([]);
    setEditingBook(null);
  };

  const handleEditBook = (book) => {
    setFormError("");
    setFormSuccess("");
    setEditingBook(book);

    setTitle(book.title || "");
    setAuthor(book.author || "");
    setDescription(book.description || "");
    setPrice(String(book.price || "0"));
    setCategory(book.category || "AI");
    setPages(String(book.pages || "1"));
    setLanguage(book.language || "English");
    setTags(book.tags ? book.tags.join(", ") : "");
    setFeatured(book.featured || false);
    setTrending(book.trending || false);
    setOurPublication(book.ourPublication || false);
    setComingSoon(book.comingSoon || false);

    setCoverFile(null);
    setPdfFile(null);
    setPreviewPdfFile(null);
    setPreviewImagesFiles([]);
  };

  const handleCreateBook = (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!title || !author || !description || !price || !category || !pages) {
      setFormError("All basic book metadata fields are required.");
      return;
    }
    if (!editingBook && !coverFile) {
      setFormError("A cover image is required.");
      return;
    }
    if (!editingBook && !comingSoon && !pdfFile) {
      setFormError("A full PDF document is required (unless marked as Coming Soon).");
      return;
    }

    setSubmittingBook(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("author", author);
    formData.append("description", description);
    formData.append("price", comingSoon ? "0" : price);
    formData.append("category", category);
    formData.append("pages", comingSoon ? "0" : pages);
    formData.append("language", language);
    formData.append("tags", tags);
    formData.append("featured", String(featured));
    formData.append("trending", String(trending));
    formData.append("ourPublication", String(ourPublication));
    formData.append("comingSoon", String(comingSoon));

    if (coverFile) {
      formData.append("cover", coverFile);
    }
    if (pdfFile) {
      formData.append("pdf", pdfFile);
    }
    if (previewPdfFile) {
      formData.append("previewPdf", previewPdfFile);
    }
    previewImagesFiles.forEach((file) => {
      formData.append("previewImages", file);
    });

    const url = editingBook ? `${API_BASE}/books/${editingBook._id}` : `${API_BASE}/books`;
    const method = editingBook ? "PUT" : "POST";

    fetch(url, {
      method,
      body: formData,
      credentials: "include"
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setFormSuccess(editingBook ? "Book updated successfully!" : "Book uploaded successfully!");
          resetBookForm();
          fetchBooks();
        } else {
          const detailsStr = data.details
            ? " Details: " + data.details.map((d) => `${d.path}: ${d.message}`).join(", ")
            : "";
          setFormError((data.message || (editingBook ? "Failed to update book." : "Failed to upload book.")) + detailsStr);
        }
      })
      .catch(() => setFormError("Failed to upload book. Check connection to server."))
      .finally(() => setSubmittingBook(false));
  };

  return (
    <PageTransition>
      <div className="min-h-screen px-6 py-28 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 animated-gradient opacity-80" />
        <div className="noise" />
        <div className="absolute left-0 top-0 h-[600px] w-[600px] rounded-full bg-cyan-500/5 blur-[180px] pointer-events-none" />
        <div className="absolute right-0 bottom-0 h-[600px] w-[600px] rounded-full bg-fuchsia-500/5 blur-[180px] pointer-events-none" />

        <div className="mx-auto max-w-6xl relative z-10">

          {/* CHECKING AUTH */}
          {step === "check-auth" && (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
              <Loader2 className="h-10 w-10 animate-spin text-cyan-300 mb-4" />
              <p className="text-white/60">Verifying session...</p>
            </div>
          )}

          {/* LOGIN - ENTER EMAIL */}
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

          {/* LOGIN - ENTER OTP */}
          {step === "login-otp" && (
            <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-2xl shadow-glow">
              <div className="mb-8 flex flex-col items-center text-center">
                <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-cyan-400/10 text-cyan-300">
                  <ShieldCheck size={24} />
                </div>
                <h1 className="text-2xl font-bold text-white">Verification Code / Password</h1>
                <p className="mt-2 text-sm text-white/50">Enter the 6-digit access code or your admin password for <strong className="text-white/80">{email}</strong>.</p>
              </div>

              {authError && (
                <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-2">Verification Code or Password</label>
                  <input
                    type="text"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter Code or Password"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-center text-lg font-semibold tracking-[0.1em] text-white placeholder-white/20 focus:border-cyan-400/40 focus:bg-white/10 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-2">Your Name (Optional)</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Admin Member"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm text-white placeholder-white/30 focus:border-cyan-400/40 focus:bg-white/10 focus:outline-none"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep("login-email")}
                    className="w-1/3 rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
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

          {/* ADMIN DASHBOARD */}
          {step === "dashboard" && (
            <div>
              {/* Header section with title and logout */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-white/10 pb-6 mb-8 gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
                  <p className="mt-1 text-sm text-white/55">Manage your digital assets and review readers access requests.</p>
                </div>
                
                <div className="flex items-center gap-3">
                  {/* Tabs */}
                  <div className="flex rounded-full bg-white/5 p-1 border border-white/10">
                    <button
                      onClick={() => setActiveTab("books")}
                      className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                        activeTab === "books" ? "bg-white text-black" : "text-white/60 hover:text-white"
                      }`}
                    >
                      Manage Books
                    </button>
                    <button
                      onClick={() => setActiveTab("purchases")}
                      className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                        activeTab === "purchases" ? "bg-white text-black" : "text-white/60 hover:text-white"
                      }`}
                    >
                      Purchase Requests
                    </button>
                    <button
                      onClick={() => setActiveTab("authors")}
                      className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                        activeTab === "authors" ? "bg-white text-black" : "text-white/60 hover:text-white"
                      }`}
                    >
                      Authors
                    </button>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white hover:bg-red-500/20 hover:border-red-500/30 transition"
                  >
                    <LogOut size={14} /> Log Out
                  </button>
                </div>
              </div>

              {/* TAB 1: BOOKS */}
              {activeTab === "books" && (
                <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
                  {/* LEFT: BOOK UPLOADER */}
                  <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl">
                    <div className="border-b border-white/10 pb-6 mb-8 flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-white">
                          {editingBook ? "Edit Ebook" : "Upload Ebook"}
                        </h2>
                        <p className="mt-1 text-sm text-white/55">
                          {editingBook ? `Editing details for: ${editingBook.title}` : "Add a new book to the platform database."}
                        </p>
                      </div>
                      {editingBook && (
                        <button
                          type="button"
                          onClick={resetBookForm}
                          className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/60 hover:text-white transition"
                        >
                          <X size={13} /> Cancel Edit
                        </button>
                      )}
                    </div>

                    {formError && (
                      <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300">
                        <AlertCircle className="h-5 w-5 shrink-0" />
                        <span>{formError}</span>
                      </div>
                    )}

                    {formSuccess && (
                      <div className="mb-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-emerald-300">
                        <span>{formSuccess}</span>
                      </div>
                    )}

                    <form onSubmit={handleCreateBook} className="space-y-6">
                      <div className="grid gap-6 md:grid-cols-2">
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-2">Book Title</label>
                          <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Pather Panchali"
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-cyan-400/40 focus:bg-white/10 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-2">Author Name</label>
                          {authorsList.length === 0 ? (
                            <div className="w-full rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-4 py-3 text-xs text-yellow-300">
                              No authors added yet. Go to the <strong>Authors</strong> tab to add authors first.
                            </div>
                          ) : (
                            <select
                              required
                              value={author}
                              onChange={(e) => setAuthor(e.target.value)}
                              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-cyan-400/40 focus:bg-white/10 focus:outline-none appearance-none"
                              style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23ffffff66' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center" }}
                            >
                              <option value="" disabled style={{ background: "#0a0a0a" }}>Select an author...</option>
                              {authorsList.map((a) => (
                                <option key={a._id} value={a.name} style={{ background: "#0a0a0a" }}>
                                  {a.name}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-2">Description</label>
                        <textarea
                          required
                          rows="4"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Write a compelling summary of the book..."
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-cyan-400/40 focus:bg-white/10 focus:outline-none resize-none"
                        />
                      </div>

                      <div className="grid gap-6 md:grid-cols-4">
                        <div>
                          <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 transition-colors ${comingSoon ? "text-white/20" : "text-white/50"}`}>Price (₹)</label>
                          <input
                            type="number"
                            required={!comingSoon}
                            min="0"
                            value={comingSoon ? "" : price}
                            disabled={comingSoon}
                            onChange={(e) => setPrice(e.target.value)}
                            className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none transition-all ${
                              comingSoon
                                ? "border-white/5 bg-white/[0.02] text-white/20 cursor-not-allowed"
                                : "border-white/10 bg-white/5 text-white focus:border-cyan-400/40 focus:bg-white/10"
                            }`}
                          />
                        </div>
                        <div>
                          <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 transition-colors ${comingSoon ? "text-white/20" : "text-white/50"}`}>Pages</label>
                          <input
                            type="number"
                            required={!comingSoon}
                            min="1"
                            value={comingSoon ? "" : pages}
                            disabled={comingSoon}
                            onChange={(e) => setPages(e.target.value)}
                            className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none transition-all ${
                              comingSoon
                                ? "border-white/5 bg-white/[0.02] text-white/20 cursor-not-allowed"
                                : "border-white/10 bg-white/5 text-white focus:border-cyan-400/40 focus:bg-white/10"
                            }`}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-2">Category</label>
                          <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-cyan-400/40 focus:bg-white/10 focus:outline-none appearance-none"
                            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23ffffff66' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center" }}
                          >
                            <option value="Story" style={{ background: "#0a0a0a" }}>Story</option>
                            <option value="Poem" style={{ background: "#0a0a0a" }}>Poem</option>
                            <option value="Folklore" style={{ background: "#0a0a0a" }}>Folklore</option>
                            <option value="Novel" style={{ background: "#0a0a0a" }}>Novel</option>
                            <option value="Drama" style={{ background: "#0a0a0a" }}>Drama</option>
                            <option value="Biography" style={{ background: "#0a0a0a" }}>Biography</option>
                            <option value="Essay" style={{ background: "#0a0a0a" }}>Essay</option>
                            <option value="Children Literature" style={{ background: "#0a0a0a" }}>Children Literature</option>
                            <option value="Other" style={{ background: "#0a0a0a" }}>Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-2">Language</label>
                          <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-cyan-400/40 focus:bg-white/10 focus:outline-none appearance-none"
                            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23ffffff66' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center" }}
                          >
                            <option value="English" style={{ background: "#0a0a0a" }}>English</option>
                            <option value="Bengali" style={{ background: "#0a0a0a" }}>Bengali (বাংলা)</option>
                            <option value="Hindi" style={{ background: "#0a0a0a" }}>Hindi (हिन्दी)</option>
                            <option value="Assamese" style={{ background: "#0a0a0a" }}>Assamese (অসমীয়া)</option>
                            <option value="Gujarati" style={{ background: "#0a0a0a" }}>Gujarati (ગુજરાતી)</option>
                            <option value="Kannada" style={{ background: "#0a0a0a" }}>Kannada (ಕನ್ನಡ)</option>
                            <option value="Konkani" style={{ background: "#0a0a0a" }}>Konkani (कोंकणी)</option>
                            <option value="Maithili" style={{ background: "#0a0a0a" }}>Maithili (मैथिली)</option>
                            <option value="Malayalam" style={{ background: "#0a0a0a" }}>Malayalam (മലയാളം)</option>
                            <option value="Manipuri" style={{ background: "#0a0a0a" }}>Manipuri (মণিপুরী)</option>
                            <option value="Marathi" style={{ background: "#0a0a0a" }}>Marathi (मराठी)</option>
                            <option value="Nepali" style={{ background: "#0a0a0a" }}>Nepali (नेपाली)</option>
                            <option value="Odia" style={{ background: "#0a0a0a" }}>Odia (ଓଡ଼ିଆ)</option>
                            <option value="Punjabi" style={{ background: "#0a0a0a" }}>Punjabi (ਪੰਜਾਬੀ)</option>
                            <option value="Sanskrit" style={{ background: "#0a0a0a" }}>Sanskrit (संस्कृतम्)</option>
                            <option value="Santali" style={{ background: "#0a0a0a" }}>Santali (ᱥᱟᱱᱛᱟᱲᱤ)</option>
                            <option value="Sindhi" style={{ background: "#0a0a0a" }}>Sindhi (سنڌي)</option>
                            <option value="Tamil" style={{ background: "#0a0a0a" }}>Tamil (தமிழ்)</option>
                            <option value="Telugu" style={{ background: "#0a0a0a" }}>Telugu (తెలుగు)</option>
                            <option value="Urdu" style={{ background: "#0a0a0a" }}>Urdu (اردو)</option>
                            <option value="Bodo" style={{ background: "#0a0a0a" }}>Bodo (बड़ो)</option>
                            <option value="Dogri" style={{ background: "#0a0a0a" }}>Dogri (डोगरी)</option>
                            <option value="Kashmiri" style={{ background: "#0a0a0a" }}>Kashmiri (کٲشُر)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid gap-6 md:grid-cols-2">
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-2">Tags (comma-separated)</label>
                          <input
                            type="text"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="design, product, engineering"
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-cyan-400/40 focus:bg-white/10 focus:outline-none"
                          />
                        </div>
                        <div className="flex gap-4 flex-wrap items-end h-full py-2">
                          <label className="flex items-center gap-3 cursor-pointer text-sm text-white/80">
                            <input
                              type="checkbox"
                              checked={featured}
                              onChange={(e) => setFeatured(e.target.checked)}
                              className="h-5 w-5 rounded border-white/10 bg-white/5 text-cyan-400 focus:ring-0 focus:ring-offset-0 focus:outline-none"
                            />
                            Bestselling Book
                          </label>
                          <label className="flex items-center gap-3 cursor-pointer text-sm text-white/80">
                            <input
                              type="checkbox"
                              checked={trending}
                              onChange={(e) => setTrending(e.target.checked)}
                              className="h-5 w-5 rounded border-white/10 bg-white/5 text-cyan-400 focus:ring-0 focus:ring-offset-0 focus:outline-none"
                            />
                            Trending Book
                          </label>
                          <label className="flex items-center gap-3 cursor-pointer text-sm text-white/80">
                            <input
                              type="checkbox"
                              checked={ourPublication}
                              onChange={(e) => setOurPublication(e.target.checked)}
                              className="h-5 w-5 rounded border-white/10 bg-white/5 text-cyan-400 focus:ring-0 focus:ring-offset-0 focus:outline-none"
                            />
                            Our Publication
                          </label>
                          <label className="flex items-center gap-3 cursor-pointer text-sm text-amber-300/90">
                            <input
                              type="checkbox"
                              checked={comingSoon}
                              onChange={(e) => setComingSoon(e.target.checked)}
                              className="h-5 w-5 rounded border-amber-400/20 bg-amber-400/5 text-amber-400 focus:ring-0 focus:ring-offset-0 focus:outline-none"
                            />
                            Coming Soon
                          </label>
                        </div>
                      </div>

                      {/* File Upload Fields */}
                      <div className="grid gap-6 md:grid-cols-2 border-t border-white/10 pt-6">
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-2">Cover Image (JPEG/PNG/WEBP) <span className="text-white/30 normal-case font-normal">· Max {MAX_FILE_MB}MB</span></label>
                          <div className={`relative flex items-center justify-center rounded-xl border border-dashed p-6 text-center transition ${fileSizeErrors.cover ? "border-red-400/40 bg-red-400/5" : "border-white/20 bg-white/5 hover:bg-white/10"}`}>
                            <input
                              type="file"
                              required={!editingBook}
                              accept="image/*"
                              onChange={(e) => { const f = e.target.files[0]; if (checkFileSize(f, "cover")) setCoverFile(f); else { setCoverFile(null); e.target.value = ""; } }}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            <div className="space-y-1">
                              <Upload className={`mx-auto h-8 w-8 ${fileSizeErrors.cover ? "text-red-400/60" : "text-white/40"}`} />
                              {fileSizeErrors.cover ? (
                                <p className="text-xs text-red-400 font-semibold">{fileSizeErrors.cover}</p>
                              ) : (
                                <>
                                  <p className="text-xs text-white/60">{coverFile ? coverFile.name : "Select cover image file"}</p>
                                  {coverFile && <p className="text-[10px] text-white/30">{(coverFile.size / 1024 / 1024).toFixed(2)}MB</p>}
                                  {!coverFile && <p className="text-[10px] text-white/25">JPEG · PNG · WEBP · Max {MAX_FILE_MB}MB</p>}
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 transition-colors ${comingSoon ? "text-white/20" : "text-white/50"}`}>
                            Full PDF Ebook (PDF) {!comingSoon && <span className="text-white/30 normal-case font-normal">· Max {MAX_FILE_MB}MB</span>}
                          </label>
                          <div className={`relative flex items-center justify-center rounded-xl border border-dashed p-6 text-center transition ${
                            comingSoon ? "border-white/5 bg-white/[0.02] cursor-not-allowed opacity-40" : fileSizeErrors.pdf ? "border-red-400/40 bg-red-400/5" : "border-white/20 bg-white/5 hover:bg-white/10"
                          }`}>
                            <input
                              type="file"
                              required={!editingBook && !comingSoon}
                              accept="application/pdf"
                              disabled={comingSoon}
                              onChange={(e) => { const f = e.target.files[0]; if (checkFileSize(f, "pdf")) setPdfFile(f); else { setPdfFile(null); e.target.value = ""; } }}
                              className={`absolute inset-0 opacity-0 ${comingSoon ? "pointer-events-none" : "cursor-pointer"}`}
                            />
                            <div className="space-y-1">
                              <Upload className={`mx-auto h-8 w-8 ${comingSoon ? "text-white/20" : fileSizeErrors.pdf ? "text-red-400/60" : "text-white/40"}`} />
                              {fileSizeErrors.pdf && !comingSoon ? (
                                <p className="text-xs text-red-400 font-semibold">{fileSizeErrors.pdf}</p>
                              ) : (
                                <>
                                  <p className={`text-xs ${comingSoon ? "text-white/20" : "text-white/60"}`}>{pdfFile && !comingSoon ? pdfFile.name : comingSoon ? "N/A — Coming Soon" : "Select full PDF document"}</p>
                                  {pdfFile && !comingSoon && <p className="text-[10px] text-white/30">{(pdfFile.size / 1024 / 1024).toFixed(2)}MB</p>}
                                  {!pdfFile && !comingSoon && <p className="text-[10px] text-white/25">PDF only · Max {MAX_FILE_MB}MB</p>}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Optional File Fields */}
                      <div className="grid gap-6 md:grid-cols-2">
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-2">Preview PDF (Optional) <span className="text-white/30 normal-case font-normal">· Max {MAX_FILE_MB}MB</span></label>
                          <div className={`relative flex items-center justify-center rounded-xl border border-dashed p-4 text-center transition ${fileSizeErrors.previewPdf ? "border-red-400/40 bg-red-400/5" : "border-white/20 bg-white/5 hover:bg-white/10"}`}>
                            <input
                              type="file"
                              accept="application/pdf"
                              onChange={(e) => { const f = e.target.files[0]; if (checkFileSize(f, "previewPdf")) setPreviewPdfFile(f); else { setPreviewPdfFile(null); e.target.value = ""; } }}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            <div className="space-y-1">
                              <Upload className={`mx-auto h-6 w-6 ${fileSizeErrors.previewPdf ? "text-red-400/60" : "text-white/40"}`} />
                              {fileSizeErrors.previewPdf ? (
                                <p className="text-xs text-red-400 font-semibold">{fileSizeErrors.previewPdf}</p>
                              ) : (
                                <>
                                  <p className="text-xs text-white/60">{previewPdfFile ? previewPdfFile.name : "Select preview PDF"}</p>
                                  {previewPdfFile && <p className="text-[10px] text-white/30">{(previewPdfFile.size / 1024 / 1024).toFixed(2)}MB</p>}
                                  {!previewPdfFile && <p className="text-[10px] text-white/25">PDF only · Max {MAX_FILE_MB}MB</p>}
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-2">Preview Images (Optional) <span className="text-white/30 normal-case font-normal">· Max {MAX_FILE_MB}MB each</span></label>
                          <div className={`relative flex items-center justify-center rounded-xl border border-dashed p-4 text-center transition ${fileSizeErrors.previewImages ? "border-red-400/40 bg-red-400/5" : "border-white/20 bg-white/5 hover:bg-white/10"}`}>
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={(e) => {
                                const files = Array.from(e.target.files);
                                const oversized = files.filter((f) => f.size > MAX_FILE_SIZE);
                                if (oversized.length > 0) {
                                  setFileSizeErrors((prev) => ({ ...prev, previewImages: `${oversized.length} file(s) exceed ${MAX_FILE_MB}MB limit` }));
                                  setPreviewImagesFiles([]);
                                  e.target.value = "";
                                } else {
                                  setFileSizeErrors((prev) => { const n = { ...prev }; delete n.previewImages; return n; });
                                  setPreviewImagesFiles(files);
                                }
                              }}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            <div className="space-y-1">
                              <Upload className={`mx-auto h-6 w-6 ${fileSizeErrors.previewImages ? "text-red-400/60" : "text-white/40"}`} />
                              {fileSizeErrors.previewImages ? (
                                <p className="text-xs text-red-400 font-semibold">{fileSizeErrors.previewImages}</p>
                              ) : (
                                <>
                                  <p className="text-xs text-white/60">{previewImagesFiles.length > 0 ? `${previewImagesFiles.length} file(s) selected` : "Select preview slide images"}</p>
                                  {!previewImagesFiles.length && <p className="text-[10px] text-white/25">JPEG · PNG · WEBP · Max {MAX_FILE_MB}MB each</p>}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={submittingBook}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-4 font-semibold text-black transition-all hover:scale-[1.02] disabled:opacity-50"
                      >
                        {submittingBook ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" /> {editingBook ? "Saving Changes..." : "Uploading & Processing..."}
                          </>
                        ) : (
                          <>
                            <Upload size={18} /> {editingBook ? "Save Changes" : "Upload Ebook"}
                          </>
                        )}
                      </button>
                    </form>
                  </div>

                  {/* RIGHT: QUICK LINK TO DATABASE */}
                  <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl flex flex-col gap-6">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">Database Ebooks</h2>
                      <p className="text-sm text-white/45 leading-relaxed">
                        Browse, search, and manage all published ebooks in the platform database.
                        Filter by author name, category, or flags like Trending, Bestselling, Coming Soon, and Our Publication.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 flex items-center gap-3">
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-cyan-400/10">
                          <BookOpen size={16} className="text-cyan-300" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{booksTotal} Books</p>
                          <p className="text-xs text-white/40">currently in database</p>
                        </div>
                      </div>

                      <Link
                        to="/admin/database"
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 py-4 font-bold text-black hover:opacity-90 transition shadow-lg shadow-cyan-500/20 text-sm"
                      >
                        <BookOpen size={17} />
                        Open Book Database
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: PURCHASE REQUESTS */}
              {activeTab === "purchases" && (
                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl">
                  <div className="border-b border-white/10 pb-6 mb-8">
                    <h2 className="text-2xl font-bold text-white">Access Requests</h2>
                    <p className="mt-1 text-sm text-white/55">Verify transaction numbers and approve ebook access for readers.</p>
                  </div>

                  {loadingPurchases ? (
                    <div className="flex flex-col items-center justify-center py-16">
                      <Loader2 className="h-8 w-8 animate-spin text-cyan-400 mb-3" />
                      <p className="text-sm text-white/55">Loading requests...</p>
                    </div>
                  ) : purchasesList.length === 0 ? (
                    <div className="text-center py-16 text-white/40">
                      <ShieldCheck size={48} className="mx-auto mb-4 opacity-20" />
                      <p>No access requests available to review.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {purchasesList.map((purchase) => (
                        <div
                          key={purchase._id}
                          className="rounded-2xl border border-white/5 bg-white/5 p-6 hover:bg-white/[0.08] transition flex flex-col gap-6"
                        >
                          {/* Upper: Book & User summary, status */}
                          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/5 pb-4">
                            <div>
                              <span className="text-[10px] uppercase font-semibold text-cyan-300 bg-cyan-400/10 px-2.5 py-0.5 rounded-full">
                                {purchase.bookId?.title || "Unknown Book"}
                              </span>
                              <h3 className="text-lg font-bold text-white mt-1.5">
                                {purchase.userId?.name || "Anonymous User"}
                              </h3>
                              <p className="text-xs text-white/45">{purchase.userId?.email}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-white/40">Amount</p>
                              <p className="text-lg font-bold text-white">₹{purchase.amount}</p>
                              <div className="mt-2">
                                {purchase.status === "approved" && (
                                  <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                                    Approved
                                  </span>
                                )}
                                {purchase.status === "rejected" && (
                                  <span className="rounded-full bg-red-500/10 px-3 py-1 text-[10px] font-semibold text-red-400 border border-red-500/20">
                                    Rejected
                                  </span>
                                )}
                                {purchase.status === "pending" && (
                                  <span className="rounded-full bg-amber-500/10 px-3 py-1 text-[10px] font-semibold text-amber-400 border border-amber-500/20 animate-pulse">
                                    Pending Review
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Middle: Details Grid */}
                          <div className="grid gap-6 md:grid-cols-3 text-xs text-white/70 leading-relaxed">
                            {/* Column 1: User Contact & Care of */}
                            <div className="space-y-2">
                              <p className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Reader Profile</p>
                              <p><span className="text-white/40">C/O:</span> {purchase.userId?.co || "N/A"}</p>
                              <p><span className="text-white/40">Phone:</span> {purchase.userId?.phone || "N/A"}</p>
                              <p><span className="text-white/40">Country:</span> {purchase.userId?.country || "India"}</p>
                            </div>

                            {/* Column 2: Address */}
                            <div className="space-y-2">
                              <p className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Location details</p>
                              <p><span className="text-white/40">District:</span> {purchase.userId?.district || "N/A"}</p>
                              <p><span className="text-white/40">Block:</span> {purchase.userId?.block || "N/A"}</p>
                              <p><span className="text-white/40">Post Office:</span> {purchase.userId?.postOffice || "N/A"}</p>
                              <p><span className="text-white/40">PIN:</span> {purchase.userId?.pin || "N/A"}</p>
                            </div>

                            {/* Column 3: Nearby Location & Landmark details */}
                            <div className="space-y-2">
                              <p className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Payment ref & landmarks</p>
                              <p className="text-white/90 font-medium">
                                <span className="text-white/40">UPI Ref:</span>{" "}
                                <span className="font-mono text-cyan-300 font-bold bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/30 select-all">
                                  {purchase.transactionNumber || "N/A"}
                                </span>
                              </p>
                              <p><span className="text-white/40">Landmark:</span> {purchase.userId?.nearbyLocation || "N/A"}</p>
                              <p><span className="text-white/40">Date:</span> {new Date(purchase.createdAt).toLocaleString()}</p>
                            </div>
                          </div>

                          {/* Screenshot area if any */}
                          {purchase.paymentScreenshot?.url && (
                            <div className="border-t border-white/5 pt-4">
                              <p className="text-[10px] uppercase font-bold text-white/40 tracking-wider mb-2">Attached Payment Screenshot</p>
                              <a 
                                href={purchase.paymentScreenshot.url.startsWith("http") ? purchase.paymentScreenshot.url : `${API_BASE.replace("/api", "")}${purchase.paymentScreenshot.url}`} 
                                target="_blank" 
                                rel="noreferrer"
                                className="inline-block rounded-xl overflow-hidden border border-white/10 hover:border-cyan-400/40 transition max-w-[200px]"
                              >
                                <img 
                                  src={purchase.paymentScreenshot.url.startsWith("http") ? purchase.paymentScreenshot.url : `${API_BASE.replace("/api", "")}${purchase.paymentScreenshot.url}`} 
                                  alt="Screenshot" 
                                  className="max-w-[200px] h-auto object-contain bg-zinc-900" 
                                />
                              </a>
                            </div>
                          )}

                          {/* Decision Area / Actions */}
                          <div className="border-t border-white/5 pt-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                            {purchase.status === "pending" ? (
                              <>
                                <div className="flex-1">
                                  <input
                                    type="text"
                                    placeholder="Add approval or rejection reason (optional)..."
                                    value={adminNotes[purchase._id] || ""}
                                    onChange={(e) => handleNoteChange(purchase._id, e.target.value)}
                                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-white placeholder-white/30 focus:border-cyan-400/40 focus:bg-white/10 focus:outline-none"
                                  />
                                </div>
                                <div className="flex gap-3 shrink-0">
                                  <button
                                    onClick={() => handleRejectPurchase(purchase._id)}
                                    className="rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-2.5 text-xs font-semibold text-red-400 hover:bg-red-500 hover:text-white transition"
                                  >
                                    Reject Request
                                  </button>
                                  <button
                                    onClick={() => handleApprovePurchase(purchase._id)}
                                    className="rounded-xl bg-cyan-400 px-5 py-2.5 text-xs font-semibold text-black hover:bg-cyan-300 transition"
                                  >
                                    Approve Access
                                  </button>
                                </div>
                              </>
                            ) : (
                              <div className="text-xs text-white/50 bg-white/[0.02] rounded-xl p-3.5 w-full flex flex-col gap-1">
                                <p>
                                  <strong className="text-white">Review Summary:</strong>{" "}
                                  {purchase.status === "approved" ? "Approved" : "Rejected"} by Admin.
                                </p>
                                {purchase.adminNote && (
                                  <p><span className="text-white/30">Note left:</span> "{purchase.adminNote}"</p>
                                )}
                                <p className="text-[10px] text-white/30 mt-1">
                                  Processed on: {new Date(purchase.status === "approved" ? purchase.approvedAt : purchase.rejectedAt).toLocaleString()}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: AUTHORS */}
          {activeTab === "authors" && (
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
              {/* LEFT: Author Form */}
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl">
                <div className="border-b border-white/10 pb-6 mb-8 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {editingAuthor ? "Edit Author" : "Add Author"}
                    </h2>
                    <p className="mt-1 text-sm text-white/55">
                      {editingAuthor ? `Editing: ${editingAuthor.name}` : "Create a new popular author profile."}
                    </p>
                  </div>
                  {editingAuthor && (
                    <button
                      type="button"
                      onClick={resetAuthorForm}
                      className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/60 hover:text-white transition"
                    >
                      <X size={13} /> Cancel Edit
                    </button>
                  )}
                </div>

                {authorFormError && (
                  <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <span>{authorFormError}</span>
                  </div>
                )}
                {authorFormSuccess && (
                  <div className="mb-5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-emerald-300">
                    {authorFormSuccess}
                  </div>
                )}

                <form onSubmit={handleAuthorSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-2">Author Name *</label>
                    <input
                      type="text"
                      required
                      value={authorForm.name}
                      onChange={(e) => handleAuthorFormChange("name", e.target.value)}
                      placeholder="Rabindranath Tagore"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-cyan-400/40 focus:bg-white/10 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-2">Short Bio</label>
                    <textarea
                      rows="3"
                      value={authorForm.bio}
                      onChange={(e) => handleAuthorFormChange("bio", e.target.value)}
                      placeholder="A brief description about the author..."
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-cyan-400/40 focus:bg-white/10 focus:outline-none resize-none"
                    />
                  </div>

                  <div className="grid gap-5 md:grid-cols-3">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-2">Display Order</label>
                      <input
                        type="number"
                        min="0"
                        value={authorForm.order}
                        onChange={(e) => handleAuthorFormChange("order", e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-cyan-400/40 focus:bg-white/10 focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-3 pt-7">
                      <input
                        type="checkbox"
                        id="author-featured"
                        checked={authorForm.featured}
                        onChange={(e) => handleAuthorFormChange("featured", e.target.checked)}
                        className="h-4 w-4 accent-cyan-400"
                      />
                      <label htmlFor="author-featured" className="text-sm text-white/70">Show in Popular Authors</label>
                    </div>
                    <div className="flex items-center gap-3 pt-7">
                      <input
                        type="checkbox"
                        id="author-ourPublicationAuthor"
                        checked={authorForm.ourPublicationAuthor}
                        onChange={(e) => handleAuthorFormChange("ourPublicationAuthor", e.target.checked)}
                        className="h-4 w-4 accent-cyan-400"
                      />
                      <label htmlFor="author-ourPublicationAuthor" className="text-sm text-white/70">Show in Publication's Authors</label>
                    </div>
                  </div>

                  {/* Thumbnail Upload */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-2">Author Photo</label>
                    <label className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed border-white/10 p-6 transition hover:border-cyan-400/30 hover:bg-white/[0.03]">
                      {authorThumbnail ? (
                        <>
                          <img
                            src={URL.createObjectURL(authorThumbnail)}
                            alt="Preview"
                            className="h-24 w-24 rounded-full object-cover border-2 border-cyan-400/30"
                          />
                          <span className="text-xs text-cyan-300">{authorThumbnail.name}</span>
                        </>
                      ) : editingAuthor?.thumbnail?.url ? (
                        <>
                          <img
                            src={editingAuthor.thumbnail.url.startsWith("/") ? `${API_BASE.replace("/api","")}${editingAuthor.thumbnail.url}` : editingAuthor.thumbnail.url}
                            alt="Current"
                            className="h-24 w-24 rounded-full object-cover border-2 border-white/20"
                          />
                          <span className="text-xs text-white/40">Click to change photo</span>
                        </>
                      ) : (
                        <>
                          <Upload size={24} className="text-white/30" />
                          <span className="text-xs text-white/40">Click to upload author photo (JPG, PNG, WebP)</span>
                        </>
                      )}
                      <input
                        type="file"
                        className="hidden"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => setAuthorThumbnail(e.target.files[0] || null)}
                      />
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingAuthor}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-semibold text-black transition-all hover:scale-[1.02] disabled:opacity-50"
                  >
                    {submittingAuthor ? <Loader2 className="h-5 w-5 animate-spin" /> : editingAuthor ? "Update Author" : "Create Author"}
                  </button>
                </form>
              </div>

              {/* RIGHT: Authors List */}
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl">
                <div className="border-b border-white/10 pb-6 mb-6">
                  <h2 className="text-xl font-bold text-white">All Authors</h2>
                  <p className="mt-1 text-sm text-white/55">{authorsList.length} author{authorsList.length !== 1 ? "s" : ""} on the platform.</p>
                </div>

                {loadingAuthors ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-cyan-300" />
                  </div>
                ) : authorsList.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <User size={36} className="mb-3 text-white/20" />
                    <p className="text-sm text-white/40">No authors added yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {authorsList.map((author) => {
                      const thumb = author.thumbnail?.url
                        ? author.thumbnail.url.startsWith("/")
                          ? `${API_BASE.replace("/api","")}${author.thumbnail.url}`
                          : author.thumbnail.url
                        : null;
                      return (
                        <div
                          key={author._id}
                          className="flex items-center gap-4 rounded-2xl border border-white/8 bg-white/[0.03] p-4"
                        >
                          {/* Thumb */}
                          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border border-white/10">
                            {thumb ? (
                              <img src={thumb} alt={author.name} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-white/5">
                                <User size={18} className="text-white/30" />
                              </div>
                            )}
                          </div>
                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-sm font-semibold text-white">{author.name}</p>
                            <p className="text-[10px] text-white/40">
                              Order: {author.order ?? 0} &bull; {author.featured ? "Featured" : "Hidden"}
                            </p>
                          </div>
                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleEditAuthor(author)}
                              className="grid h-8 w-8 place-items-center rounded-xl border border-white/10 bg-white/5 text-white/60 transition hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-cyan-300"
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteAuthor(author._id)}
                              className="grid h-8 w-8 place-items-center rounded-xl border border-white/10 bg-white/5 text-white/60 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
                            >
                              <Trash2 size={13} />
                            </button>
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
      </div>
    </PageTransition>
  );
}

