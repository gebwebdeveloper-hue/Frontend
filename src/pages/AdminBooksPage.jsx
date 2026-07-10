import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, BookOpen, KeyRound, ArrowRight, Upload, Trash2, ShieldCheck, LogOut, Loader2, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import PageTransition from "../components/PageTransition.jsx";
import { API_BASE, SERVER_URL } from "../config.js";

export default function AdminBooksPage() {
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

  // Purchase requests state
  const [purchasesList, setPurchasesList] = useState([]);
  const [loadingPurchases, setLoadingPurchases] = useState(false);
  const [activeTab, setActiveTab] = useState("books"); // 'books', 'purchases'
  const [adminNotes, setAdminNotes] = useState({});

  // Book form state
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("10");
  const [category, setCategory] = useState("AI");
  const [pages, setPages] = useState("100");
  const [language, setLanguage] = useState("English");
  const [tags, setTags] = useState("");
  const [featured, setFeatured] = useState(false);
  const [trending, setTrending] = useState(false);

  // File states
  const [coverFile, setCoverFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [previewPdfFile, setPreviewPdfFile] = useState(null);
  const [previewImagesFiles, setPreviewImagesFiles] = useState([]);
  const [formSuccess, setFormSuccess] = useState("");
  const [formError, setFormError] = useState("");



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

  const fetchBooks = () => {
    setLoadingBooks(true);
    fetch(`${API_BASE}/books`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setBooksList(data.books || []);
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

  const handleCreateBook = (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!title || !author || !description || !price || !category || !pages) {
      setFormError("All basic book metadata fields are required.");
      return;
    }
    if (!coverFile) {
      setFormError("A cover image is required.");
      return;
    }
    if (!pdfFile) {
      setFormError("A full PDF document is required.");
      return;
    }

    setSubmittingBook(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("author", author);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("category", category);
    formData.append("pages", pages);
    formData.append("language", language);
    formData.append("tags", tags);
    formData.append("featured", String(featured));
    formData.append("trending", String(trending));

    formData.append("cover", coverFile);
    formData.append("pdf", pdfFile);
    if (previewPdfFile) {
      formData.append("previewPdf", previewPdfFile);
    }
    previewImagesFiles.forEach((file) => {
      formData.append("previewImages", file);
    });

    fetch(`${API_BASE}/books`, {
      method: "POST",
      body: formData,
      credentials: "include"
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setFormSuccess("Book uploaded successfully!");
          // Reset form fields
          setTitle("");
          setAuthor("");
          setDescription("");
          setPrice("10");
          setCategory("AI");
          setPages("100");
          setTags("");
          setFeatured(false);
          setTrending(false);
          setCoverFile(null);
          setPdfFile(null);
          setPreviewPdfFile(null);
          setPreviewImagesFiles([]);
          // Refresh list
          fetchBooks();
        } else {
          const detailsStr = data.details
            ? " Details: " + data.details.map((d) => `${d.path}: ${d.message}`).join(", ")
            : "";
          setFormError((data.message || "Failed to upload book.") + detailsStr);
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
                    <div className="border-b border-white/10 pb-6 mb-8">
                      <h2 className="text-2xl font-bold text-white">Upload Ebook</h2>
                      <p className="mt-1 text-sm text-white/55">Add a new book to the platform database.</p>
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
                            placeholder="Systems of Thought"
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-cyan-400/40 focus:bg-white/10 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-2">Author Name</label>
                          <input
                            type="text"
                            required
                            value={author}
                            onChange={(e) => setAuthor(e.target.value)}
                            placeholder="Mira Sen"
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-cyan-400/40 focus:bg-white/10 focus:outline-none"
                          />
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
                          <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-2">Price (₹)</label>
                          <input
                            type="number"
                            required
                            min="0"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-cyan-400/40 focus:bg-white/10 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-2">Pages</label>
                          <input
                            type="number"
                            required
                            min="1"
                            value={pages}
                            onChange={(e) => setPages(e.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-cyan-400/40 focus:bg-white/10 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-2">Category</label>
                          <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-[#151515] px-4 py-3 text-sm text-white focus:border-cyan-400/40 focus:bg-white/10 focus:outline-none"
                          >
                            <option value="AI">AI</option>
                            <option value="Business">Business</option>
                            <option value="Design">Design</option>
                            <option value="Finance">Finance</option>
                            <option value="Programming">Programming</option>
                            <option value="Cyber Security">Cyber Security</option>
                            <option value="Self Improvement">Self Improvement</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-2">Language</label>
                          <input
                            type="text"
                            required
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-cyan-400/40 focus:bg-white/10 focus:outline-none"
                          />
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
                        <div className="flex gap-6 items-end h-full py-2">
                          <label className="flex items-center gap-3 cursor-pointer text-sm text-white/80">
                            <input
                              type="checkbox"
                              checked={featured}
                              onChange={(e) => setFeatured(e.target.checked)}
                              className="h-5 w-5 rounded border-white/10 bg-white/5 text-cyan-400 focus:ring-0 focus:ring-offset-0 focus:outline-none"
                            />
                            Featured Book
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
                        </div>
                      </div>

                      {/* File Upload Fields */}
                      <div className="grid gap-6 md:grid-cols-2 border-t border-white/10 pt-6">
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-2">Cover Image (JPEG/PNG/WEBP)</label>
                          <div className="relative flex items-center justify-center rounded-xl border border-dashed border-white/20 bg-white/5 p-6 text-center hover:bg-white/10 transition">
                            <input
                              type="file"
                              required
                              accept="image/*"
                              onChange={(e) => setCoverFile(e.target.files[0])}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            <div className="space-y-1">
                              <Upload className="mx-auto h-8 w-8 text-white/40" />
                              <p className="text-xs text-white/60">{coverFile ? coverFile.name : "Select cover image file"}</p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-2">Full PDF Ebook (PDF)</label>
                          <div className="relative flex items-center justify-center rounded-xl border border-dashed border-white/20 bg-white/5 p-6 text-center hover:bg-white/10 transition">
                            <input
                              type="file"
                              required
                              accept="application/pdf"
                              onChange={(e) => setPdfFile(e.target.files[0])}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            <div className="space-y-1">
                              <Upload className="mx-auto h-8 w-8 text-white/40" />
                              <p className="text-xs text-white/60">{pdfFile ? pdfFile.name : "Select full PDF document"}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Optional File Fields */}
                      <div className="grid gap-6 md:grid-cols-2">
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-2">Preview PDF (Optional)</label>
                          <div className="relative flex items-center justify-center rounded-xl border border-dashed border-white/20 bg-white/5 p-4 text-center hover:bg-white/10 transition">
                            <input
                              type="file"
                              accept="application/pdf"
                              onChange={(e) => setPreviewPdfFile(e.target.files[0])}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            <div className="space-y-1">
                              <Upload className="mx-auto h-6 w-6 text-white/40" />
                              <p className="text-xs text-white/60">{previewPdfFile ? previewPdfFile.name : "Select preview PDF"}</p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-2">Preview Images (Optional)</label>
                          <div className="relative flex items-center justify-center rounded-xl border border-dashed border-white/20 bg-white/5 p-4 text-center hover:bg-white/10 transition">
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={(e) => setPreviewImagesFiles(Array.from(e.target.files))}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            <div className="space-y-1">
                              <Upload className="mx-auto h-6 w-6 text-white/40" />
                              <p className="text-xs text-white/60">{previewImagesFiles.length > 0 ? `${previewImagesFiles.length} files selected` : "Select preview slide images"}</p>
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
                            <Loader2 className="h-5 w-5 animate-spin" /> Uploading & Processing...
                          </>
                        ) : (
                          <>
                            <Upload size={18} /> Upload Ebook
                          </>
                        )}
                      </button>
                    </form>
                  </div>

                  {/* RIGHT: DATABASE LISTING */}
                  <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl flex flex-col h-full">
                    <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-6 mb-6">Database Ebooks</h2>

                    {loadingBooks ? (
                      <div className="flex flex-col items-center justify-center py-12 flex-1">
                        <Loader2 className="h-8 w-8 animate-spin text-white/40 mb-3" />
                        <p className="text-sm text-white/55">Loading books...</p>
                      </div>
                    ) : booksList.length === 0 ? (
                      <div className="text-center py-12 flex-1 flex flex-col items-center justify-center text-white/40">
                        <BookOpen size={48} className="mb-4 text-white/10" />
                        <p>No books uploaded to the database yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 flex-1">
                        {booksList.map((book) => (
                          <div
                            key={book._id}
                            className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/5 p-4 transition hover:bg-white/[0.08]"
                          >
                            <div className="h-16 w-12 shrink-0 overflow-hidden rounded-md bg-zinc-900">
                              {book.cover?.url ? (
                                <img
                                  src={book.cover.url.startsWith("http") ? book.cover.url : `${SERVER_URL}${book.cover.url}`}
                                  alt={book.title}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full bg-cyan-900" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="truncate font-semibold text-white">{book.title}</h4>
                              <p className="truncate text-xs text-white/50">by {book.author}</p>
                              <span className="mt-1 inline-block rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/70">
                                {book.category}
                              </span>
                            </div>
                            <button
                              onClick={() => handleDeleteBook(book._id)}
                              className="grid h-9 w-9 place-items-center rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
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

        </div>
      </div>
    </PageTransition>
  );
}
