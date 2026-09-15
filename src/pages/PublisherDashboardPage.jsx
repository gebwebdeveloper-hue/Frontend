import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_BASE } from "../config.js";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  BookOpen,
  DollarSign,
  Briefcase,
  Clock,
  UserPlus,
  PlusCircle,
  LogOut,
  Edit3,
  Trash2,
  X,
  BookOpenCheck,
  ArrowLeft,
  ExternalLink,
  Eye,
  Sparkles,
  PackageCheck,
  Layers,
  Search,
  ShoppingCart,
  Plus,
  Link2,
  Globe,
  ShoppingBag,
  ChevronDown
} from "lucide-react";

import PublisherExecutionManager from "../publisher/components/PublisherExecutionManager.jsx";

export default function PublisherDashboardPage() {
  const navigate = useNavigate();
  const [token, setToken] = useState(() => localStorage.getItem("lekhok_publisher_token") || "");
  const [role, setRole] = useState(() => localStorage.getItem("lekhok_publisher_role") || "");
  
  // Login toggle: "publisher" | "author"
  const [loginTab, setLoginTab] = useState("publisher");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);

  // Active Tab: "overview" | "execution" | "authors" | "sales"
  const [activeTab, setActiveTab] = useState("overview");

  // Publisher data states
  const [overviewMetrics, setOverviewMetrics] = useState(null);
  const [paymentBreakdown, setPaymentBreakdown] = useState([]);
  const [authorEarnings, setAuthorEarnings] = useState([]);
  const [rawAuthors, setRawAuthors] = useState([]);
  const [recentSales, setRecentSales] = useState([]);

  // Selected Author Workflow Editor
  const [selectedAuthor, setSelectedAuthor] = useState(null);
  const [editingWorkflow, setEditingWorkflow] = useState([]);
  const [editingPaymentStatus, setEditingPaymentStatus] = useState("PENDING");
  const [editingAmountPaid, setEditingAmountPaid] = useState(0);

  // Viewing Author Details & Books Page
  const [viewingAuthor, setViewingAuthor] = useState(null);
  const [authorBooksList, setAuthorBooksList] = useState([]);
  const [loadingAuthorBooks, setLoadingAuthorBooks] = useState(false);
  const [authorBooksSearch, setAuthorBooksSearch] = useState("");

  // Catalog books & Dynamic Books for Add Sale Modal
  const [allCatalogBooks, setAllCatalogBooks] = useState([]);
  const [saleModalAuthorBooks, setSaleModalAuthorBooks] = useState([]);
  const [loadingSaleBooks, setLoadingSaleBooks] = useState(false);
  const [isCustomBookTitle, setIsCustomBookTitle] = useState(false);

  // Modals
  const [showAddSaleModal, setShowAddSaleModal] = useState(false);
  const [editingSaleId, setEditingSaleId] = useState(null);
  const [saleForm, setSaleForm] = useState({
    authorEmail: "",
    bookTitle: "",
    quantity: 1,
    unitPrice: 299,
    authorProfit: 209,
    channel: "Direct / Website"
  });

  const [showAddAuthorModal, setShowAddAuthorModal] = useState(false);
  const [authorForm, setAuthorForm] = useState({
    name: "",
    email: "",
    phone: "",
    selectedPlan: "Basic Publishing Plan",
    planAmount: 1212
  });

  const [showEditAuthorModal, setShowEditAuthorModal] = useState(false);
  const [editAuthorForm, setEditAuthorForm] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    selectedPlan: "Basic Publishing Plan",
    planAmount: 1212,
    publishingPaymentStatus: "PENDING",
    amountPaid: 0,
    password: ""
  });
  const [savingAuthorDetails, setSavingAuthorDetails] = useState(false);

  // Preview & Marketplace Links State
  const [showLinksModal, setShowLinksModal] = useState(false);
  const [selectedBookForLinks, setSelectedBookForLinks] = useState(null);
  const [previewLinksForm, setPreviewLinksForm] = useState([]);
  const [savingLinks, setSavingLinks] = useState(false);
  const [activePreviewMenuId, setActivePreviewMenuId] = useState(null);

  useEffect(() => {
    if (token) {
      if (role === "author") {
        navigate("/author_dashboard");
      } else {
        fetchPublisherData();
      }
    }
  }, [token, role, navigate]);

  const fetchPublisherData = async () => {
    try {
      setLoading(true);
      const [res, booksRes] = await Promise.all([
        fetch(`${API_BASE}/publisher/overview`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_BASE}/books?limit=1000`)
      ]);

      const data = await res.json();
      if (data.success) {
        setOverviewMetrics(data.metrics);
        setPaymentBreakdown(data.paymentBreakdown || []);
        setAuthorEarnings(data.authorEarnings || []);
        setRawAuthors(data.paymentBreakdown || []);
        setRecentSales(data.recentSales || []);
      }

      const booksData = await booksRes.json();
      if (booksData.success) {
        setAllCatalogBooks(booksData.books || []);
      }
    } catch (err) {
      console.error("Failed to fetch publisher overview:", err);
    } finally {
      setLoading(false);
    }
  };

  // Sync author's books when Add Sale modal is opened or author changes
  useEffect(() => {
    if (!showAddSaleModal) return;

    const email = (saleForm.authorEmail || rawAuthors[0]?.email || "").trim().toLowerCase();
    if (!email) return;

    const authorObj = rawAuthors.find((a) => a.email?.toLowerCase() === email);
    const authorName = authorObj?.name || "";

    setLoadingSaleBooks(true);

    // Fetch author profile to get full associated books
    const lookupTarget = authorName || email;
    fetch(`${API_BASE}/authors/profile/${encodeURIComponent(lookupTarget)}`)
      .then((r) => r.json())
      .then((d) => {
        let foundBooks = [];
        if (d.success && d.author?.books && d.author.books.length > 0) {
          foundBooks = d.author.books;
        } else {
          // Fallback filter from allCatalogBooks
          foundBooks = allCatalogBooks.filter((b) => {
            if (!b.author) return false;
            const bkAuth = b.author.toLowerCase();
            const targetAuth = authorName.toLowerCase();
            return bkAuth.includes(targetAuth) || targetAuth.includes(bkAuth);
          });
        }
        setSaleModalAuthorBooks(foundBooks);

        // If no bookTitle is currently set or it's not custom, select first book
        if (!isCustomBookTitle && foundBooks.length > 0) {
          const currentMatches = foundBooks.find((b) => b.title === saleForm.bookTitle);
          const chosenBook = currentMatches || foundBooks[0];
          const unitP = chosenBook.paperbackPrice || chosenBook.price || 299;
          const qty = saleForm.quantity || 1;
          setSaleForm((prev) => ({
            ...prev,
            authorEmail: email,
            bookTitle: chosenBook.title,
            unitPrice: unitP,
            authorProfit: Math.round(unitP * qty * 0.7)
          }));
        }
      })
      .catch((err) => {
        console.error("Failed to fetch author books for sale form:", err);
      })
      .finally(() => setLoadingSaleBooks(false));
  }, [showAddSaleModal, saleForm.authorEmail, rawAuthors, allCatalogBooks, isCustomBookTitle]);


  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setLoading(true);

    const endpoint = loginTab === "author" ? `${API_BASE}/publisher/author-login` : `${API_BASE}/publisher/login`;

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        setToken(data.token);
        localStorage.setItem("lekhok_publisher_token", data.token);
        if (loginTab === "author") {
          localStorage.setItem("lekhok_publisher_role", "author");
          setRole("author");
          navigate("/author_dashboard");
        } else {
          localStorage.setItem("lekhok_publisher_role", "publisher");
          setRole("publisher");
        }
      } else {
        setLoginError(data.message || `Invalid ${loginTab} credentials.`);
      }
    } catch (err) {
      setLoginError("Failed to connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setToken("");
    setRole("");
    localStorage.removeItem("lekhok_publisher_token");
    localStorage.removeItem("lekhok_publisher_role");
  };

  const handleOpenAddSale = () => {
    setEditingSaleId(null);
    setIsCustomBookTitle(false);
    setSaleForm({
      authorEmail: rawAuthors[0]?.email || "",
      bookTitle: "",
      quantity: 1,
      unitPrice: 299,
      authorProfit: 209,
      channel: "Direct / Website"
    });
    setShowAddSaleModal(true);
  };

  const handleOpenEditSale = (sale) => {
    setEditingSaleId(sale._id || sale.id);
    setIsCustomBookTitle(false);
    setSaleForm({
      authorEmail: sale.authorEmail || "",
      bookTitle: sale.bookTitle || "",
      quantity: sale.quantity || 1,
      unitPrice: sale.unitPrice || 299,
      authorProfit: sale.authorProfit !== undefined ? sale.authorProfit : Math.round((sale.unitPrice || 299) * (sale.quantity || 1) * 0.7),
      channel: sale.channel || "Direct / Website"
    });
    setShowAddSaleModal(true);
  };

  const handleDeleteSale = async (saleId) => {
    if (!window.confirm("Are you sure you want to delete this sale record?")) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/publisher/sales/${saleId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        alert("Sale transaction deleted successfully!");
        fetchPublisherData();
      } else {
        alert(data.message || "Failed to delete sale transaction.");
      }
    } catch (err) {
      alert("Error deleting sale transaction.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAuthor = async (e, auth) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete author "${auth.name}"? This will remove their portal account and dashboard entry.`)) {
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/publisher/authors/${auth.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        alert(`Author "${auth.name}" deleted successfully.`);
        fetchPublisherData();
      } else {
        alert(data.message || "Failed to delete author.");
      }
    } catch (err) {
      console.error("Failed to delete author:", err);
      alert("Error deleting author.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditAuthor = (auth) => {
    setEditAuthorForm({
      id: auth.id || auth._id,
      name: auth.name || "",
      email: auth.email || "",
      phone: auth.phone || "",
      selectedPlan: auth.selectedPlan || "Basic Publishing Plan",
      planAmount: auth.planAmount !== undefined ? auth.planAmount : 1212,
      publishingPaymentStatus: auth.status || "PENDING",
      amountPaid: auth.planPaid !== undefined ? auth.planPaid : 0,
      password: ""
    });
    setShowEditAuthorModal(true);
  };

  const handleSaveAuthorDetails = async (e) => {
    e.preventDefault();
    if (!editAuthorForm.id) return;
    try {
      setSavingAuthorDetails(true);
      const res = await fetch(`${API_BASE}/publisher/authors/${editAuthorForm.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editAuthorForm)
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message || "Author details updated successfully!");
        setShowEditAuthorModal(false);
        // If currently viewing this author, update local view state as well
        if (viewingAuthor && (viewingAuthor.id === editAuthorForm.id || viewingAuthor._id === editAuthorForm.id)) {
          setViewingAuthor((prev) => ({
            ...prev,
            name: editAuthorForm.name,
            email: editAuthorForm.email,
            phone: editAuthorForm.phone,
            selectedPlan: editAuthorForm.selectedPlan,
            planAmount: Number(editAuthorForm.planAmount),
            status: editAuthorForm.publishingPaymentStatus,
            planPaid: Number(editAuthorForm.amountPaid)
          }));
        }
        fetchPublisherData();
      } else {
        alert(data.message || "Failed to update author details.");
      }
    } catch (err) {
      console.error("Error updating author details:", err);
      alert("Error updating author details. Please try again.");
    } finally {
      setSavingAuthorDetails(false);
    }
  };

  const handleAddSale = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const url = editingSaleId
        ? `${API_BASE}/publisher/sales/${editingSaleId}`
        : `${API_BASE}/publisher/sales`;
      const method = editingSaleId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(saleForm)
      });
      const data = await res.json();
      if (data.success) {
        setShowAddSaleModal(false);
        setEditingSaleId(null);
        fetchPublisherData();
        alert(editingSaleId ? "Sale transaction updated successfully!" : "Sale transaction recorded successfully!");
      } else {
        alert(data.message || "Failed to save sale");
      }
    } catch (err) {
      alert("Error saving sale.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAuthor = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/publisher/authors`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(authorForm)
      });
      const data = await res.json();
      if (data.success) {
        setShowAddAuthorModal(false);
        alert(`Author registered! Login details emailed to ${authorForm.email}`);
        fetchPublisherData();
      } else {
        alert(data.message || "Failed to create author");
      }
    } catch (err) {
      alert("Error creating author.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWorkflow = async (authorId) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/publisher/authors/${authorId}/workflow`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          workflowSteps: editingWorkflow,
          publishingPaymentStatus: editingPaymentStatus,
          amountPaid: Number(editingAmountPaid)
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("Author workflow status updated!");
        setSelectedAuthor(null);
        fetchPublisherData();
      }
    } catch (err) {
      alert("Error updating workflow.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAuthorBooks = async (auth) => {
    setViewingAuthor(auth);
    setActiveTab("authors");
    setLoadingAuthorBooks(true);
    setAuthorBooksSearch("");
    try {
      const queryName = encodeURIComponent(auth.name || auth.email);
      // 1. Fetch author profile with books
      const res = await fetch(`${API_BASE}/authors/profile/${queryName}`);
      const data = await res.json();
      if (data.success && data.author) {
        setAuthorBooksList(data.author.books || []);
      } else {
        // Fallback: search books by author name
        const booksRes = await fetch(`${API_BASE}/books?author=${queryName}&limit=50`);
        const booksData = await booksRes.json();
        setAuthorBooksList(booksData.books || []);
      }
    } catch (err) {
      console.error("Failed to load author books:", err);
      setAuthorBooksList([]);
    } finally {
      setLoadingAuthorBooks(false);
    }
  };

  const handleQuickSaleForBook = (auth, bookTitle, unitPrice) => {
    setEditingSaleId(null);
    setIsCustomBookTitle(false);
    setSaleForm({
      authorEmail: auth.email || "",
      bookTitle: bookTitle || "",
      quantity: 1,
      unitPrice: unitPrice || 299,
      authorProfit: Math.round((unitPrice || 299) * 0.7),
      channel: "Direct / Website"
    });
    setShowAddSaleModal(true);
  };

  // -------------------------------------------------------------
  // PREVIEW / MARKETPLACE LINKS MANAGEMENT HANDLERS
  // -------------------------------------------------------------
  const handleOpenLinksModal = (book) => {
    setSelectedBookForLinks(book);
    const existing = book.previewLinks && Array.isArray(book.previewLinks) && book.previewLinks.length > 0
      ? JSON.parse(JSON.stringify(book.previewLinks))
      : [
          { platform: "website", title: "Official Web Reader", url: `/reader?book=${book.slug || book._id}` }
        ];
    setPreviewLinksForm(existing);
    setShowLinksModal(true);
  };

  const handleAddLinkRow = (presetPlatform = "amazon") => {
    const defaultTitles = {
      amazon: "Amazon Store",
      kindle: "Amazon Kindle",
      flipkart: "Flipkart Store",
      website: "Official Web Reader",
      google_play: "Google Play Books",
      other: "Preview / Store Link"
    };
    setPreviewLinksForm((prev) => [
      ...prev,
      {
        platform: presetPlatform,
        title: defaultTitles[presetPlatform] || "Store Link",
        url: presetPlatform === "website" && selectedBookForLinks ? `/reader?book=${selectedBookForLinks.slug || selectedBookForLinks._id}` : ""
      }
    ]);
  };

  const handleUpdateLinkRow = (index, field, value) => {
    setPreviewLinksForm((prev) => {
      const updated = [...prev];
      const prevPlatform = updated[index]?.platform;
      updated[index] = { ...updated[index], [field]: value };
      if (field === "platform") {
        const defaultTitles = {
          amazon: "Amazon Store",
          kindle: "Amazon Kindle",
          flipkart: "Flipkart Store",
          website: "Official Web Reader",
          google_play: "Google Play Books",
          other: "Preview / Store Link"
        };
        const currentTitle = updated[index].title || "";
        if (!currentTitle || currentTitle === defaultTitles[prevPlatform]) {
          updated[index].title = defaultTitles[value] || "Store Link";
        }
      }
      return updated;
    });
  };

  const handleRemoveLinkRow = (index) => {
    setPreviewLinksForm((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSavePreviewLinks = async (e) => {
    e.preventDefault();
    if (!selectedBookForLinks) return;
    try {
      setSavingLinks(true);
      const targetId = selectedBookForLinks._id || selectedBookForLinks.id || selectedBookForLinks.slug;
      const cleanLinks = previewLinksForm.filter((l) => l.url && l.url.trim());
      const res = await fetch(`${API_BASE}/books/${targetId}/preview-links`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ previewLinks: cleanLinks })
      });
      const data = await res.json();
      if (data.success) {
        setAuthorBooksList((prev) =>
          prev.map((b) => {
            if ((b._id && b._id === selectedBookForLinks._id) || (b.slug && b.slug === selectedBookForLinks.slug)) {
              return { ...b, previewLinks: data.book?.previewLinks || cleanLinks };
            }
            return b;
          })
        );
        setShowLinksModal(false);
        setSelectedBookForLinks(null);
        alert("Preview and marketplace links saved successfully!");
      } else {
        alert(data.message || "Failed to save preview links.");
      }
    } catch (err) {
      alert("Error saving preview links.");
    } finally {
      setSavingLinks(false);
    }
  };


  // -------------------------------------------------------------
  // LOGIN SCREEN
  // -------------------------------------------------------------
  if (!token || role === "author") {
    return (
      <div className="min-h-screen bg-[#060608] text-white flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#c8923a]/10 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="w-full max-w-md bg-[#0f0f14]/90 backdrop-blur-xl border border-[#c8923a]/30 rounded-3xl p-8 shadow-2xl relative z-10">
          <div className="text-center mb-6">
            <div className="w-20 h-20 mx-auto mb-4 p-1 rounded-2xl bg-gradient-to-b from-[#1c1c28] to-[#0e0e14] border border-[#c8923a]/40 shadow-xl flex items-center justify-center">
              <img src="/logo.png" alt="Lekhok Tripura Logo" className="w-14 h-14 object-contain" />
            </div>
            <h1 className="font-serif text-2xl font-extrabold bg-gradient-to-r from-[#f5d796] via-[#c8923a] to-[#e6b35c] bg-clip-text text-transparent tracking-wide">
              Lekhok Tripura Publishers
            </h1>
            <p className="text-xs text-gray-400 mt-1 font-medium">
              {loginTab === "publisher" ? "Publisher & Admin Command Center" : "Author Royalties Portal"}
            </p>
          </div>

          {/* LOGIN TOGGLE SWITCH */}
          <div className="flex gap-2 mb-6 bg-[#08080b] p-1.5 rounded-2xl border border-[#222230]">
            <button
              type="button"
              onClick={() => {
                setLoginTab("publisher");
                setLoginError("");
              }}
              className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition ${
                loginTab === "publisher"
                  ? "bg-gradient-to-r from-[#d99b38] to-[#f3c06b] text-black shadow-lg"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Publisher Login
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginTab("author");
                setLoginError("");
              }}
              className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition ${
                loginTab === "author"
                  ? "bg-gradient-to-r from-[#d99b38] to-[#f3c06b] text-black shadow-lg"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Author Login
            </button>
          </div>

          {loginError && (
            <div className="mb-4 p-3 bg-red-950/80 border border-red-700/80 rounded-xl text-red-300 text-xs">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 font-medium">
                {loginTab === "publisher" ? "Login ID / Admin Email" : "Registered Author Email"}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={loginTab === "publisher" ? "kiransamanta88@gmail.com" : "author@lekhoktripura.in"}
                className="w-full px-4 py-3 bg-[#08080b] border border-[#242432] rounded-xl text-sm focus:outline-none focus:border-[#c8923a] text-white transition"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1.5 font-medium">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={loginTab === "publisher" ? "Enter admin password" : "e.g. RITTV3210"}
                className="w-full px-4 py-3 bg-[#08080b] border border-[#242432] rounded-xl text-sm focus:outline-none focus:border-[#c8923a] text-white transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-[#d99b38] to-[#f3c06b] hover:from-[#e5a845] hover:to-[#fbd080] text-black font-extrabold rounded-xl transition-all shadow-lg shadow-[#c8923a]/20 text-sm mt-2 flex items-center justify-center gap-2"
            >
              {loading ? "Authenticating..." : loginTab === "publisher" ? "Login to Publisher Dashboard" : "Login to Author Portal"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // PUBLISHER DASHBOARD VIEW WITH FIXED SIDEBAR
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#050507] text-gray-100 font-sans pl-0 md:pl-64">
      {/* LEFT NAVIGATION SIDEBAR (FIXED POSITION) */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[#09090d] border-r border-[#1a1a26] p-6 flex flex-col justify-between hidden md:flex z-40 overflow-y-auto">
        <div className="space-y-6">
          <div className="text-center pb-5 border-b border-[#1c1c28]">
            <div className="w-16 h-16 mx-auto rounded-2xl border border-[#c8923a]/40 p-1.5 bg-[#12121c] shadow-lg flex items-center justify-center">
              <img src="/logo.png" alt="Lekhok Tripura Logo" className="w-full h-full object-contain" />
            </div>
            <h2 className="font-serif text-sm font-bold text-white mt-3">Lekhok Tripura</h2>
            <p className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase mt-0.5">Publisher & Admin Portal</p>
          </div>

          <nav className="space-y-2 text-xs">
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full text-left px-4 py-3 rounded-xl font-bold transition flex items-center gap-3 ${
                activeTab === "overview"
                  ? "bg-gradient-to-r from-[#d99b38] to-[#f3c06b] text-black shadow-lg shadow-[#c8923a]/20"
                  : "text-gray-400 hover:text-white hover:bg-[#14141f]"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab("execution")}
              className={`w-full text-left px-4 py-3 rounded-xl font-bold transition flex items-center gap-3 ${
                activeTab === "execution"
                  ? "bg-gradient-to-r from-[#d99b38] to-[#f3c06b] text-black shadow-lg shadow-[#c8923a]/20"
                  : "text-gray-400 hover:text-white hover:bg-[#14141f]"
              }`}
            >
              <BookOpenCheck className="w-4 h-4" />
              <span>Execution Manager</span>
            </button>

            <button
              onClick={() => setActiveTab("authors")}
              className={`w-full text-left px-4 py-3 rounded-xl font-bold transition flex items-center justify-between ${
                activeTab === "authors"
                  ? "bg-gradient-to-r from-[#d99b38] to-[#f3c06b] text-black shadow-lg shadow-[#c8923a]/20"
                  : "text-gray-400 hover:text-white hover:bg-[#14141f]"
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4" />
                <span>Authors</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                activeTab === "authors" ? "bg-black/20 text-black" : "bg-[#1f1f2e] text-[#f3c06b]"
              }`}>
                {rawAuthors.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("sales")}
              className={`w-full text-left px-4 py-3 rounded-xl font-bold transition flex items-center gap-3 ${
                activeTab === "sales"
                  ? "bg-gradient-to-r from-[#d99b38] to-[#f3c06b] text-black shadow-lg shadow-[#c8923a]/20"
                  : "text-gray-400 hover:text-white hover:bg-[#14141f]"
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Sales & Payments</span>
            </button>
          </nav>
        </div>

        <div className="space-y-3 pt-6 border-t border-[#1c1c28]">
          <button
            onClick={() => setShowAddAuthorModal(true)}
            className="w-full py-2.5 bg-[#14141e] hover:bg-[#1e1e2c] border border-[#c8923a]/40 text-xs font-bold rounded-xl text-[#f3c06b] transition flex items-center justify-center gap-2 shadow"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Author</span>
          </button>
          <button
            onClick={handleOpenAddSale}
            className="w-full py-2.5 bg-gradient-to-r from-[#d99b38] to-[#f3c06b] hover:from-[#e5a845] hover:to-[#fbd080] text-black text-xs font-extrabold rounded-xl shadow-lg shadow-[#c8923a]/20 transition flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Sale</span>
          </button>

          <Link
            to="/author_dashboard"
            className="w-full py-2.5 bg-[#14141e] hover:bg-[#1e1e2c] border border-[#c8923a]/40 text-xs font-bold rounded-xl text-[#f3c06b] transition flex items-center justify-center gap-2 shadow"
          >
            <BookOpen className="w-4 h-4" />
            <span>Switch to Author Portal</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2.5 rounded-xl font-bold text-xs text-gray-400 hover:text-red-400 transition flex items-center gap-3"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="min-h-screen flex flex-col">
        {/* Top Header */}
        <header className="border-b border-[#1c1c28] bg-[#09090d] px-6 py-3.5 flex justify-between items-center sticky top-0 z-30">
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-[#14141d] border border-[#c8923a]/40 p-1 flex items-center justify-center md:hidden">
              <img src="/logo.png" alt="Lekhok Tripura Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="font-serif text-lg font-extrabold bg-gradient-to-r from-[#f5d796] to-[#c8923a] bg-clip-text text-transparent tracking-wide">
                LEKHOK TRIPURA
              </h1>
              <p className="text-[10px] text-gray-400 tracking-wider uppercase font-semibold">Publisher & Admin Portal</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/author_dashboard"
              className="px-3.5 py-2 bg-[#14141e] hover:bg-[#1e1e2c] border border-[#c8923a]/40 text-xs font-bold rounded-xl text-[#f3c06b] transition flex items-center gap-2 shadow"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Author Portal →</span>
            </Link>
            <button
              onClick={() => setShowAddAuthorModal(true)}
              className="px-3.5 py-2 bg-[#14141e] hover:bg-[#1e1e2c] border border-[#c8923a]/40 text-xs font-bold rounded-xl text-[#f3c06b] transition flex items-center gap-2 shadow"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Author</span>
            </button>
            <button
              onClick={() => setShowAddSaleModal(true)}
              className="px-3.5 py-2 bg-gradient-to-r from-[#d99b38] to-[#f3c06b] hover:from-[#e5a845] hover:to-[#fbd080] text-black text-xs font-extrabold rounded-xl shadow-lg shadow-[#c8923a]/20 transition flex items-center gap-2"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Sale</span>
            </button>
            <button
              onClick={handleLogout}
              className="px-3.5 py-2 border border-[#333346] hover:bg-[#161622] text-xs font-semibold rounded-xl transition text-gray-300 flex items-center gap-2"
            >
              <LogOut className="w-3.5 h-3.5 text-gray-400" />
              <span>Logout</span>
            </button>
          </div>
        </header>

        <main className="p-6 md:p-8 space-y-8 flex-1">
          {/* TAB 0: EXECUTION MANAGER */}
          {activeTab === "execution" && (
            <PublisherExecutionManager authors={rawAuthors} token={token} onRefresh={fetchPublisherData} />
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 1: OVERVIEW */}
          {/* ------------------------------------------------------------- */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-b from-[#111118] to-[#0a0a0f] border border-[#222232] hover:border-[#c8923a]/40 p-5 rounded-2xl transition duration-300 shadow-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-400 font-medium">Total Books Sold</span>
                    <div className="p-2 bg-[#1c1c28] rounded-xl text-[#c8923a]">
                      <BookOpen className="w-4 h-4" />
                    </div>
                  </div>
                  <h2 className="text-3xl font-extrabold text-white">{overviewMetrics?.totalBooksSold || 0}</h2>
                </div>

                <div className="bg-gradient-to-b from-[#111118] to-[#0a0a0f] border border-[#222232] hover:border-[#c8923a]/40 p-5 rounded-2xl transition duration-300 shadow-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-400 font-medium">Gross Sales</span>
                    <div className="p-2 bg-[#1c1c28] rounded-xl text-[#c8923a]">
                      <DollarSign className="w-4 h-4" />
                    </div>
                  </div>
                  <h2 className="text-3xl font-extrabold text-[#f3c06b]">₹{(overviewMetrics?.grossSales || 0).toLocaleString("en-IN")}</h2>
                </div>

                <div className="bg-gradient-to-b from-[#111118] to-[#0a0a0f] border border-[#222232] hover:border-[#c8923a]/40 p-5 rounded-2xl transition duration-300 shadow-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-400 font-medium">Author Profit</span>
                    <div className="p-2 bg-[#1c1c28] rounded-xl text-[#c8923a]">
                      <Briefcase className="w-4 h-4" />
                    </div>
                  </div>
                  <h2 className="text-3xl font-extrabold text-[#f3c06b]">₹{(overviewMetrics?.totalAuthorProfit || 0).toLocaleString("en-IN")}</h2>
                </div>

                <div className="bg-gradient-to-b from-[#111118] to-[#0a0a0f] border border-[#222232] hover:border-[#c8923a]/40 p-5 rounded-2xl transition duration-300 shadow-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-400 font-medium">Total Pending</span>
                    <div className="p-2 bg-amber-950/60 text-amber-400 rounded-xl">
                      <Clock className="w-4 h-4" />
                    </div>
                  </div>
                  <h2 className="text-3xl font-extrabold text-amber-500">₹{(overviewMetrics?.totalPendingFees || 0).toLocaleString("en-IN")}</h2>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#0f0f15] border border-[#1e1e2d] p-5 rounded-2xl">
                  <p className="text-xs text-gray-400 mb-1 font-medium">Publishing Fees Due</p>
                  <h3 className="text-xl font-bold text-white">₹{(overviewMetrics?.publishingFeesDue || 0).toLocaleString("en-IN")}</h3>
                </div>
                <div className="bg-[#0f0f15] border border-[#1e1e2d] p-5 rounded-2xl">
                  <p className="text-xs text-gray-400 mb-1 font-medium">Publishing Fees Received</p>
                  <h3 className="text-xl font-bold text-emerald-400">₹{(overviewMetrics?.publishingFeesReceived || 0).toLocaleString("en-IN")}</h3>
                </div>
                <div className="bg-[#0f0f15] border border-[#1e1e2d] p-5 rounded-2xl">
                  <p className="text-xs text-gray-400 mb-1 font-medium">Royalty Paid</p>
                  <h3 className="text-xl font-bold text-emerald-400">₹{(overviewMetrics?.royaltyPaid || 0).toLocaleString("en-IN")}</h3>
                </div>
                <div className="bg-[#0f0f15] border border-[#1e1e2d] p-5 rounded-2xl">
                  <p className="text-xs text-gray-400 mb-1 font-medium">Royalty Pending</p>
                  <h3 className="text-xl font-bold text-amber-400">₹{(overviewMetrics?.royaltyPending || 0).toLocaleString("en-IN")}</h3>
                </div>
              </div>

              {/* Payment Breakdown Table */}
              <div className="bg-[#0e0e14] border border-[#1f1f2e] rounded-3xl p-6 shadow-xl">
                <h3 className="font-serif text-xl font-extrabold text-[#f3c06b] mb-1">Payment Breakdown</h3>
                <p className="text-xs text-gray-400 mb-5">Publishing plan payment status and royalty breakdown per author</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#222232] text-gray-400 uppercase tracking-wider text-[11px]">
                        <th className="pb-3 font-semibold">Author</th>
                        <th className="pb-3 font-semibold">Plan Amount</th>
                        <th className="pb-3 font-semibold">Plan Paid</th>
                        <th className="pb-3 font-semibold">Plan Pending</th>
                        <th className="pb-3 font-semibold">Royalty Earned</th>
                        <th className="pb-3 font-semibold">Royalty Paid</th>
                        <th className="pb-3 font-semibold">Royalty Pending</th>
                        <th className="pb-3 font-semibold">Total Pending</th>
                        <th className="pb-3 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#181824]">
                      {paymentBreakdown.length === 0 ? (
                        <tr>
                          <td colSpan="9" className="py-8 text-center text-gray-500">No registered authors found. Click "+ Add Author" to add one.</td>
                        </tr>
                      ) : (
                        paymentBreakdown.map((row) => (
                          <tr
                            key={row.id}
                            onClick={() => handleOpenAuthorBooks(row)}
                            className="hover:bg-[#181826] transition cursor-pointer group"
                            title={`Click to view all books for ${row.name}`}
                          >
                            <td className="py-4">
                              <p className="font-bold text-white text-sm group-hover:text-[#f3c06b] transition flex items-center gap-1.5">
                                <span>{row.name}</span>
                                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 text-[#f3c06b] transition" />
                              </p>
                              <p className="text-[11px] text-gray-400">{row.email}</p>
                            </td>
                            <td className="py-4 text-gray-300 font-medium">₹{row.planAmount.toFixed(2)}</td>
                            <td className="py-4 text-gray-300 font-medium">₹{row.planPaid.toFixed(2)}</td>
                            <td className="py-4 text-gray-300 font-medium">₹{row.planPending.toFixed(2)}</td>
                            <td className="py-4 text-gray-300 font-medium">₹{row.royaltyEarned.toFixed(2)}</td>
                            <td className="py-4 text-gray-300 font-medium">₹{row.royaltyPaid.toFixed(2)}</td>
                            <td className="py-4 text-gray-300 font-medium">₹{row.royaltyPending.toFixed(2)}</td>
                            <td className="py-4 font-extrabold text-[#f3c06b]">₹{row.totalPending.toFixed(2)}</td>
                            <td className="py-4">
                              <span className={`px-3 py-1 rounded-lg text-[10px] font-extrabold ${
                                row.status === "PAID" ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800" : "bg-amber-950/80 text-amber-400 border border-amber-800"
                              }`}>
                                {row.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Author Earnings Table */}
              <div className="bg-[#0e0e14] border border-[#1f1f2e] rounded-3xl p-6 shadow-xl">
                <h3 className="font-serif text-xl font-extrabold text-white mb-4">Author Earnings Overview</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#222232] text-gray-400 uppercase tracking-wider text-[11px]">
                        <th className="pb-3 font-semibold">Author</th>
                        <th className="pb-3 font-semibold">Books Sold</th>
                        <th className="pb-3 font-semibold">Gross Sales</th>
                        <th className="pb-3 font-semibold">Author Profit</th>
                        <th className="pb-3 font-semibold">Royalty Paid</th>
                        <th className="pb-3 font-semibold">Royalty Pending</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#181824]">
                      {authorEarnings.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="py-8 text-center text-gray-500">No author earnings recorded yet.</td>
                        </tr>
                      ) : (
                        authorEarnings.map((row) => (
                          <tr
                            key={row.id}
                            onClick={() => {
                              const target = rawAuthors.find((a) => a.email === row.email) || row;
                              handleOpenAuthorBooks(target);
                            }}
                            className="hover:bg-[#181826] transition cursor-pointer group"
                            title={`Click to view all books for ${row.name}`}
                          >
                            <td className="py-4 font-bold text-white text-sm group-hover:text-[#f3c06b] transition flex items-center gap-1.5">
                              <span>{row.name}</span>
                              <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 text-[#f3c06b] transition" />
                            </td>
                            <td className="py-4 text-gray-300 font-medium">{row.booksSold}</td>
                            <td className="py-4 text-gray-300 font-medium">₹{row.gross.toFixed(2)}</td>
                            <td className="py-4 text-gray-300 font-medium">₹{row.profit.toFixed(2)}</td>
                            <td className="py-4 text-emerald-400 font-bold">₹{row.paid.toFixed(2)}</td>
                            <td className="py-4 text-amber-400 font-extrabold">₹{row.pending.toFixed(2)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 2: AUTHORS MANAGEMENT & AUTHOR BOOKS VIEW */}
          {/* ------------------------------------------------------------- */}
          {activeTab === "authors" && (
            <div className="space-y-6">
              {/* IF VIEWING A SPECIFIC AUTHOR'S BOOKS */}
              {viewingAuthor ? (
                <div className="space-y-6">
                  {/* Top Navigation & Action Banner */}
                  <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0e0e14] p-6 rounded-3xl border border-[#c8923a]/30 shadow-xl">
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => setViewingAuthor(null)}
                        className="p-2.5 bg-[#161622] hover:bg-[#202030] border border-white/10 hover:border-[#c8923a]/40 text-[#f3c06b] rounded-xl font-bold transition flex items-center gap-2 text-xs"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to All Authors</span>
                      </button>

                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="font-serif text-2xl font-extrabold text-white">{viewingAuthor.name}</h2>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                            viewingAuthor.status === "PAID"
                              ? "bg-emerald-950/80 text-emerald-400 border-emerald-800"
                              : "bg-amber-950/80 text-amber-400 border-amber-800"
                          }`}>
                            {viewingAuthor.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5 font-mono">
                          {viewingAuthor.email} • {viewingAuthor.phone || "No phone"} • {viewingAuthor.selectedPlan}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <Link
                        to={`/author/${encodeURIComponent(viewingAuthor.name)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-2 bg-[#161622] hover:bg-[#202030] border border-[#c8923a]/40 text-xs font-bold text-[#f3c06b] rounded-xl transition flex items-center gap-1.5 shadow"
                      >
                        <span>Public Storefront</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleOpenEditAuthor(viewingAuthor)}
                        className="px-3.5 py-2 bg-[#161622] hover:bg-[#202030] border border-[#c8923a]/50 text-xs font-bold text-[#f3c06b] hover:text-white rounded-xl transition flex items-center gap-1.5 shadow"
                        title="Edit Author Name, Email, Phone, Plan & Password"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#f3c06b]" />
                        <span>Edit Author Details</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedAuthor(viewingAuthor);
                          setEditingWorkflow([
                            { stepNumber: 1, name: "Payment", status: viewingAuthor.status === "PAID" ? "COMPLETED" : "PENDING" },
                            { stepNumber: 2, name: "ISBN Generated", status: "PENDING" },
                            { stepNumber: 3, name: "Book Page", status: "PENDING" },
                            { stepNumber: 4, name: "Book Cover", status: "PENDING" },
                            { stepNumber: 5, name: "Formatting", status: "PENDING" },
                            { stepNumber: 6, name: "Author Approval", status: "PENDING" },
                            { stepNumber: 7, name: "Ready to Print", status: "PENDING" },
                            { stepNumber: 8, name: "Printing", status: "PENDING" },
                            { stepNumber: 9, name: "Stock Ready", status: "PENDING" }
                          ]);
                          setEditingPaymentStatus(viewingAuthor.status || "PENDING");
                          setEditingAmountPaid(viewingAuthor.planPaid || 0);
                        }}
                        className="px-3.5 py-2 bg-[#161622] hover:bg-[#202030] border border-[#333348] text-xs text-gray-200 rounded-xl font-bold transition flex items-center gap-1.5"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#f3c06b]" />
                        <span>Edit 9-Step Progress</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSaleForm({
                            authorEmail: viewingAuthor.email || "",
                            bookTitle: authorBooksList[0]?.title || "",
                            quantity: 1,
                            unitPrice: authorBooksList[0]?.price || 299,
                            authorProfit: Math.round((authorBooksList[0]?.price || 299) * 0.7),
                            channel: "Direct / Website"
                          });
                          setShowAddSaleModal(true);
                        }}
                        className="px-3.5 py-2 bg-gradient-to-r from-[#d99b38] to-[#f3c06b] hover:from-[#e5a845] hover:to-[#fbd080] text-black text-xs font-extrabold rounded-xl shadow transition flex items-center gap-1.5"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Record Sale</span>
                      </button>
                    </div>
                  </div>

                  {/* Financial & Publication Metrics Summary */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-[#0e0e14] border border-[#1f1f2e] p-4 rounded-2xl">
                      <p className="text-gray-400 text-xs font-medium mb-1">Total Books Associated</p>
                      <h4 className="text-2xl font-extrabold text-white flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-[#f3c06b]" />
                        <span>{authorBooksList.length}</span>
                      </h4>
                    </div>

                    <div className="bg-[#0e0e14] border border-[#1f1f2e] p-4 rounded-2xl">
                      <p className="text-gray-400 text-xs font-medium mb-1">Plan Fee (₹)</p>
                      <h4 className="text-2xl font-extrabold text-[#f3c06b]">
                        ₹{(viewingAuthor.planAmount || 0).toFixed(2)}
                      </h4>
                      <p className="text-[11px] text-emerald-400 mt-0.5">Paid: ₹{(viewingAuthor.planPaid || 0).toFixed(2)}</p>
                    </div>

                    <div className="bg-[#0e0e14] border border-[#1f1f2e] p-4 rounded-2xl">
                      <p className="text-gray-400 text-xs font-medium mb-1">Royalty Earned</p>
                      <h4 className="text-2xl font-extrabold text-emerald-400">
                        ₹{(viewingAuthor.royaltyEarned || 0).toFixed(2)}
                      </h4>
                      <p className="text-[11px] text-gray-400 mt-0.5">Paid: ₹{(viewingAuthor.royaltyPaid || 0).toFixed(2)}</p>
                    </div>

                    <div className="bg-[#0e0e14] border border-[#1f1f2e] p-4 rounded-2xl">
                      <p className="text-gray-400 text-xs font-medium mb-1">Total Outstanding Pending</p>
                      <h4 className="text-2xl font-extrabold text-amber-400">
                        ₹{(viewingAuthor.totalPending || 0).toFixed(2)}
                      </h4>
                      <p className="text-[11px] text-amber-500/80 mt-0.5">Due to/from author</p>
                    </div>
                  </div>

                  {/* Books Catalog for this Author */}
                  <div className="bg-[#0e0e14] border border-[#1f1f2e] rounded-3xl p-6 shadow-xl space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1c1c28] pb-4">
                      <div>
                        <h3 className="font-serif text-xl font-extrabold text-white flex items-center gap-2">
                          <Layers className="w-5 h-5 text-[#f3c06b]" />
                          <span>Books by {viewingAuthor.name}</span>
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                          List of all eBook, Paperback, and published titles in catalog for this author.
                        </p>
                      </div>

                      {/* Search Filter */}
                      <div className="relative min-w-[220px]">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={authorBooksSearch}
                          onChange={(e) => setAuthorBooksSearch(e.target.value)}
                          placeholder="Search this author's books..."
                          className="w-full bg-[#08080c] border border-[#242432] focus:border-[#c8923a] pl-8 pr-3 py-2 rounded-xl text-xs text-white placeholder:text-gray-500 outline-none"
                        />
                      </div>
                    </div>

                    {loadingAuthorBooks ? (
                      <div className="py-12 text-center text-gray-400 text-xs animate-pulse">
                        Loading books for {viewingAuthor.name}...
                      </div>
                    ) : authorBooksList.length === 0 ? (
                      <div className="p-10 text-center bg-[#09090e] border border-[#181824] rounded-2xl space-y-3">
                        <BookOpen className="w-10 h-10 text-gray-600 mx-auto" />
                        <div>
                          <p className="text-sm font-bold text-gray-300">No Published Books Found Yet</p>
                          <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                            No active catalog titles matched "{viewingAuthor.name}". You can record sales transactions or create new book titles in the Admin Books Manager.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSaleForm({
                              authorEmail: viewingAuthor.email || "",
                              bookTitle: `${viewingAuthor.name} Book`,
                              quantity: 1,
                              unitPrice: 299,
                              authorProfit: 209,
                              channel: "Direct / Website"
                            });
                            setShowAddSaleModal(true);
                          }}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-[#161622] hover:bg-[#202030] border border-[#c8923a]/40 text-[#f3c06b] text-xs font-bold rounded-xl transition"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>Record Book Sale for {viewingAuthor.name}</span>
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {authorBooksList
                          .filter((b) =>
                            !authorBooksSearch.trim() ||
                            b.title?.toLowerCase().includes(authorBooksSearch.toLowerCase()) ||
                            b.category?.toLowerCase().includes(authorBooksSearch.toLowerCase())
                          )
                          .map((bk, i) => (
                            <div
                              key={bk._id || i}
                              className="bg-[#08080d] border border-[#1e1e2d] hover:border-[#c8923a]/40 rounded-2xl p-4 flex flex-col justify-between space-y-3 transition duration-200 shadow-md group"
                            >
                              <div className="flex gap-3.5 items-start">
                                {bk.cover?.url || bk.coverUrl ? (
                                  <img
                                    src={bk.cover?.url || bk.coverUrl}
                                    alt={bk.title}
                                    className="w-16 h-22 object-cover rounded-xl border border-[#2a2a3a] shrink-0 shadow"
                                  />
                                ) : (
                                  <div className="w-16 h-22 rounded-xl bg-gradient-to-br from-[#1a1a26] to-[#0e0e14] border border-[#2a2a3a] flex flex-col items-center justify-center text-center p-1.5 shrink-0 text-[#f3c06b]">
                                    <BookOpen className="w-6 h-6 mb-1 opacity-70" />
                                    <span className="text-[8px] font-bold uppercase leading-tight line-clamp-2">
                                      {bk.title}
                                    </span>
                                  </div>
                                )}

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    {bk.category && (
                                      <span className="px-2 py-0.5 bg-[#14141f] text-[#f3c06b] border border-[#262638] text-[9px] font-bold rounded-md uppercase">
                                        {bk.category}
                                      </span>
                                    )}
                                    {bk.featured && (
                                      <span className="px-1.5 py-0.5 bg-cyan-950/80 text-cyan-300 text-[9px] font-bold rounded-md">
                                        Featured
                                      </span>
                                    )}
                                  </div>

                                  <h4 className="font-bold text-white text-sm mt-1.5 line-clamp-2 group-hover:text-[#f3c06b] transition">
                                    {bk.title}
                                  </h4>

                                  <p className="text-[11px] text-gray-400 mt-0.5 font-mono">
                                    Slug: {bk.slug || bk.isbn || "—"}
                                  </p>

                                  <div className="mt-2 flex items-baseline gap-2">
                                    <span className="text-sm font-extrabold text-[#f3c06b]">
                                      ₹{bk.paperbackPrice || bk.price || 299}
                                    </span>
                                    {Boolean(bk.paperbackPrice && bk.price && bk.paperbackPrice !== bk.price) && (
                                      <span className="text-[10px] text-gray-400 font-medium">
                                        (eBook: ₹{bk.price})
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="pt-3 border-t border-[#181824] flex items-center justify-between gap-2 text-xs relative">
                                {/* Preview Links Trigger */}
                                <div className="relative">
                                  {(!bk.previewLinks || bk.previewLinks.length === 0) ? (
                                    <Link
                                      to={`/reader?book=${bk.slug || bk._id}`}
                                      target="_blank"
                                      className="text-gray-400 hover:text-white text-[11px] font-semibold flex items-center gap-1.5 transition"
                                    >
                                      <Eye className="w-3.5 h-3.5 text-[#f3c06b]" />
                                      <span>Preview</span>
                                    </Link>
                                  ) : bk.previewLinks.length === 1 ? (
                                    <a
                                      href={bk.previewLinks[0].url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-gray-300 hover:text-white text-[11px] font-semibold flex items-center gap-1.5 transition"
                                    >
                                      <Eye className="w-3.5 h-3.5 text-[#f3c06b]" />
                                      <span className="capitalize">{bk.previewLinks[0].title || bk.previewLinks[0].platform || "Preview"}</span>
                                      <ExternalLink className="w-2.5 h-2.5 text-gray-500" />
                                    </a>
                                  ) : (
                                    <div className="relative">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setActivePreviewMenuId(activePreviewMenuId === (bk._id || i) ? null : (bk._id || i));
                                        }}
                                        className="text-[#f3c06b] hover:text-white text-[11px] font-bold flex items-center gap-1 transition bg-[#141420] hover:bg-[#1c1c2e] px-2.5 py-1 rounded-lg border border-[#c8923a]/40 shadow-sm"
                                      >
                                        <Eye className="w-3.5 h-3.5" />
                                        <span>Preview ({bk.previewLinks.length})</span>
                                        <ChevronDown className="w-3 h-3 text-[#f3c06b]" />
                                      </button>

                                      {activePreviewMenuId === (bk._id || i) && (
                                        <div
                                          onClick={(e) => e.stopPropagation()}
                                          className="absolute left-0 bottom-full mb-2 w-56 bg-[#0e0e16] border border-[#c8923a]/50 rounded-2xl p-2 shadow-2xl z-40 space-y-1 backdrop-blur-md"
                                        >
                                          <div className="px-2.5 py-1 text-[10px] uppercase font-bold text-gray-400 border-b border-[#1f1f2e] flex items-center justify-between">
                                            <span>Preview & Store Links</span>
                                            <span className="text-[#f3c06b] font-mono">{bk.previewLinks.length}</span>
                                          </div>
                                          {bk.previewLinks.map((pl, plIdx) => (
                                            <a
                                              key={plIdx}
                                              href={pl.url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              onClick={() => setActivePreviewMenuId(null)}
                                              className="flex items-center justify-between px-2.5 py-2 rounded-xl text-[11px] font-medium text-gray-200 hover:text-white hover:bg-[#1a1a2a] transition group/link border border-transparent hover:border-[#c8923a]/30"
                                            >
                                              <div className="flex items-center gap-2 truncate">
                                                <span className={`w-2 h-2 rounded-full shrink-0 ${
                                                  pl.platform === 'amazon' ? 'bg-[#ff9900]' :
                                                  pl.platform === 'kindle' ? 'bg-[#f0c14b]' :
                                                  pl.platform === 'flipkart' ? 'bg-[#2874f0]' :
                                                  pl.platform === 'google_play' ? 'bg-[#0086f8]' :
                                                  'bg-[#10b981]'
                                                }`}></span>
                                                <span className="truncate font-semibold">{pl.title || pl.platform}</span>
                                              </div>
                                              <ExternalLink className="w-3 h-3 text-gray-500 group-hover/link:text-[#f3c06b] shrink-0 ml-1" />
                                            </a>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>

                                <div className="flex items-center gap-1.5">
                                  {/* Manage Links Button */}
                                  <button
                                    type="button"
                                    onClick={() => handleOpenLinksModal(bk)}
                                    className="px-2.5 py-1.5 text-gray-400 hover:text-[#f3c06b] hover:bg-[#181826] border border-[#222232] hover:border-[#c8923a]/40 rounded-lg text-[11px] font-semibold transition flex items-center gap-1 shadow-sm"
                                    title="Add or Edit Preview Links (Amazon, Kindle, Flipkart, etc.)"
                                  >
                                    <Link2 className="w-3.5 h-3.5 text-[#f3c06b]" />
                                    <span>Links {bk.previewLinks && bk.previewLinks.length > 0 ? `(${bk.previewLinks.length})` : ""}</span>
                                  </button>

                                  {/* Record Sale */}
                                  <button
                                    type="button"
                                    onClick={() => handleQuickSaleForBook(viewingAuthor, bk.title, bk.paperbackPrice || bk.price || 299)}
                                    className="px-3 py-1.5 bg-[#161622] hover:bg-[#202032] border border-[#c8923a]/40 text-[#f3c06b] hover:text-white rounded-lg text-[11px] font-bold transition flex items-center gap-1 shadow-sm"
                                  >
                                    <PlusCircle className="w-3 h-3" />
                                    <span>Record Sale</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* Author Sales History */}
                  <div className="bg-[#0e0e14] border border-[#1f1f2e] rounded-3xl p-6 shadow-xl space-y-4">
                    <div className="flex flex-wrap justify-between items-center gap-3">
                      <h3 className="font-serif text-xl font-extrabold text-white">
                        Sales Ledger for {viewingAuthor.name}
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSaleId(null);
                          setIsCustomBookTitle(false);
                          setSaleForm({
                            authorEmail: viewingAuthor.email || "",
                            bookTitle: "",
                            quantity: 1,
                            unitPrice: 299,
                            authorProfit: 209,
                            channel: "Direct / Website"
                          });
                          setShowAddSaleModal(true);
                        }}
                        className="px-3.5 py-1.5 bg-[#161622] hover:bg-[#202032] border border-[#c8923a]/40 text-[#f3c06b] hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Record Sale</span>
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-[#222232] text-gray-400 uppercase tracking-wider text-[11px]">
                            <th className="pb-3 font-semibold">Date</th>
                            <th className="pb-3 font-semibold">Book Title</th>
                            <th className="pb-3 font-semibold">Qty</th>
                            <th className="pb-3 font-semibold">Unit Price</th>
                            <th className="pb-3 font-semibold">Gross Sales</th>
                            <th className="pb-3 font-semibold">Author Royalty</th>
                            <th className="pb-3 font-semibold">Channel</th>
                            <th className="pb-3 font-semibold text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#181824]">
                          {recentSales.filter((s) => s.authorEmail === viewingAuthor.email).length === 0 ? (
                            <tr>
                              <td colSpan="8" className="py-6 text-center text-gray-500">
                                No sales recorded yet for this author.
                              </td>
                            </tr>
                          ) : (
                            recentSales
                              .filter((s) => s.authorEmail === viewingAuthor.email)
                              .map((sale) => (
                                <tr key={sale._id || sale.id} className="hover:bg-[#14141f] transition">
                                  <td className="py-3.5 text-gray-400">
                                    {new Date(sale.saleDate || sale.createdAt).toLocaleDateString("en-IN")}
                                  </td>
                                  <td className="py-3.5 font-bold text-white">{sale.bookTitle}</td>
                                  <td className="py-3.5 text-gray-300 font-medium">{sale.quantity}</td>
                                  <td className="py-3.5 text-gray-300 font-medium">₹{sale.unitPrice}</td>
                                  <td className="py-3.5 text-white font-extrabold">₹{sale.grossSales}</td>
                                  <td className="py-3.5 text-emerald-400 font-extrabold">₹{sale.authorProfit}</td>
                                  <td className="py-3.5 text-gray-400">{sale.channel || "Direct"}</td>
                                  <td className="py-3.5 text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => handleOpenEditSale(sale)}
                                        className="p-1.5 text-gray-400 hover:text-[#f3c06b] hover:bg-[#1e1e2c] border border-transparent hover:border-[#c8923a]/40 rounded-lg transition"
                                        title="Edit Sale"
                                      >
                                        <Edit3 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteSale(sale._id || sale.id)}
                                        className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/30 rounded-lg transition"
                                        title="Delete Sale"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                /* MAIN AUTHORS LIST VIEW */
                <div className="space-y-6">
                  <div className="flex flex-wrap justify-between items-center gap-4 bg-[#0e0e14] p-6 rounded-3xl border border-[#1f1f2e] shadow-xl">
                    <div>
                      <h2 className="font-serif text-xl font-extrabold text-[#f3c06b]">Author Management & Directory</h2>
                      <p className="text-xs text-gray-400 mt-1">
                        Click on any author to view their published books, royalties, stock inventory, and sales.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowAddAuthorModal(true)}
                      className="px-4 py-2.5 bg-gradient-to-r from-[#d99b38] to-[#f3c06b] text-black font-extrabold text-xs rounded-xl shadow flex items-center gap-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Register New Author</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {rawAuthors.length === 0 ? (
                      <div className="bg-[#0e0e14] p-10 rounded-3xl border border-[#1f1f2e] text-center text-gray-500 text-sm">
                        No authors registered yet. Click "+ Register New Author" above to add your first author.
                      </div>
                    ) : (
                      rawAuthors.map((auth) => (
                        <div
                          key={auth.id}
                          onClick={() => handleOpenAuthorBooks(auth)}
                          className="bg-[#0e0e14] border border-[#1f1f2e] hover:border-[#c8923a]/60 hover:bg-[#11111a] rounded-3xl p-6 space-y-4 transition-all duration-300 shadow-xl cursor-pointer group relative"
                        >
                          <div className="flex flex-wrap justify-between items-center gap-3 border-b border-[#1c1c28] pb-4">
                            <div className="flex items-center gap-3.5">
                              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2a2a3a] to-[#14141d] border border-[#c8923a]/50 flex items-center justify-center font-serif text-base font-bold text-[#f3c06b] overflow-hidden shadow-lg group-hover:scale-105 transition">
                                {auth.thumbnailUrl ? (
                                  <img src={auth.thumbnailUrl} alt={auth.name} className="w-full h-full object-cover" />
                                ) : (
                                  auth.name.charAt(0)
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-serif text-lg font-bold text-white group-hover:text-[#f3c06b] transition">
                                    {auth.name}
                                  </h3>
                                  <span className="text-[10px] text-gray-400 bg-[#161622] border border-[#2a2a3a] px-2 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition hidden sm:inline">
                                    Click to view books →
                                  </span>
                                </div>
                                <p className="text-xs text-gray-400 mt-0.5">{auth.email} • {auth.phone}</p>
                              </div>
                            </div>

                            <div className="text-right flex items-center gap-2.5">
                              <span className="text-xs text-[#f3c06b] font-bold bg-[#181824] px-3 py-1 rounded-lg border border-[#2a2a3a]">
                                {auth.selectedPlan}
                              </span>
                              <span className={`px-3 py-1 rounded-lg text-[10px] font-extrabold ${
                                auth.status === "PAID"
                                  ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                                  : "bg-amber-950 text-amber-400 border border-amber-800"
                              }`}>
                                {auth.status}
                              </span>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenAuthorBooks(auth);
                                }}
                                className="px-3.5 py-2 bg-gradient-to-r from-[#d99b38] to-[#f3c06b] hover:from-[#e5a845] hover:to-[#fbd080] text-black text-xs font-extrabold rounded-xl transition shadow flex items-center gap-1.5"
                              >
                                <BookOpen className="w-3.5 h-3.5" />
                                <span>View Books</span>
                              </button>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenEditAuthor(auth);
                                }}
                                className="px-3 py-2 bg-[#161622] hover:bg-[#202030] border border-[#333348] hover:border-[#c8923a]/50 text-xs text-gray-300 hover:text-[#f3c06b] rounded-xl font-bold transition shadow flex items-center gap-1.5"
                                title="Edit Author Details (Name, Email, Phone, Plan)"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-[#f3c06b]" />
                                <span className="hidden sm:inline">Edit Details</span>
                              </button>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedAuthor(auth);
                                  setEditingWorkflow([
                                    { stepNumber: 1, name: "Payment", status: auth.status === "PAID" ? "COMPLETED" : "PENDING" },
                                    { stepNumber: 2, name: "ISBN Generated", status: "PENDING" },
                                    { stepNumber: 3, name: "Book Page", status: "PENDING" },
                                    { stepNumber: 4, name: "Book Cover", status: "PENDING" },
                                    { stepNumber: 5, name: "Formatting", status: "PENDING" },
                                    { stepNumber: 6, name: "Author Approval", status: "PENDING" },
                                    { stepNumber: 7, name: "Ready to Print", status: "PENDING" },
                                    { stepNumber: 8, name: "Printing", status: "PENDING" },
                                    { stepNumber: 9, name: "Stock Ready", status: "PENDING" }
                                  ]);
                                  setEditingPaymentStatus(auth.status || "PENDING");
                                  setEditingAmountPaid(auth.planPaid || 0);
                                }}
                                className="px-3.5 py-2 bg-[#161622] hover:bg-[#202030] border border-[#333348] text-xs text-gray-300 hover:text-white rounded-xl font-bold transition shadow flex items-center gap-1.5"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-[#f3c06b]" />
                                <span className="hidden sm:inline">Edit 9-Step Progress</span>
                              </button>

                              <button
                                type="button"
                                onClick={(e) => handleDeleteAuthor(e, auth)}
                                title="Delete author from publisher directory"
                                className="p-2 bg-[#1c1214] hover:bg-red-950/60 border border-red-900/40 hover:border-red-600/60 text-red-400 hover:text-red-300 rounded-xl transition shadow flex items-center justify-center"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                            <div className="bg-[#08080c] p-3.5 rounded-xl border border-[#181824]">
                              <p className="text-gray-500 font-medium mb-0.5">Plan Amount</p>
                              <p className="font-bold text-white">₹{auth.planAmount.toFixed(2)}</p>
                            </div>
                            <div className="bg-[#08080c] p-3.5 rounded-xl border border-[#181824]">
                              <p className="text-gray-500 font-medium mb-0.5">Plan Paid</p>
                              <p className="font-bold text-emerald-400">₹{auth.planPaid.toFixed(2)}</p>
                            </div>
                            <div className="bg-[#08080c] p-3.5 rounded-xl border border-[#181824]">
                              <p className="text-gray-500 font-medium mb-0.5">Royalty Earned</p>
                              <p className="font-bold text-white">₹{auth.royaltyEarned.toFixed(2)}</p>
                            </div>
                            <div className="bg-[#08080c] p-3.5 rounded-xl border border-[#181824]">
                              <p className="text-gray-500 font-medium mb-0.5">Total Pending</p>
                              <p className="font-bold text-amber-400">₹{auth.totalPending.toFixed(2)}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 3: SALES & PAYMENTS LEDGER */}
          {/* ------------------------------------------------------------- */}
          {activeTab === "sales" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-[#0e0e14] p-6 rounded-3xl border border-[#1f1f2e] shadow-xl">
                <div>
                  <h2 className="font-serif text-xl font-extrabold text-[#f3c06b]">Sales & Royalty Payments Ledger</h2>
                  <p className="text-xs text-gray-400 mt-1">Record sales transactions and view recent book sales history.</p>
                </div>
                <button
                  onClick={handleOpenAddSale}
                  className="px-4 py-2.5 bg-gradient-to-r from-[#d99b38] to-[#f3c06b] text-black font-extrabold text-xs rounded-xl shadow flex items-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Record Book Sale</span>
                </button>
              </div>

              <div className="bg-[#0e0e14] border border-[#1f1f2e] rounded-3xl p-6 shadow-xl">
                <h3 className="font-serif text-xl font-extrabold text-white mb-4">Recent Book Sales History</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#222232] text-gray-400 uppercase tracking-wider text-[11px]">
                        <th className="pb-3 font-semibold">Date</th>
                        <th className="pb-3 font-semibold">Author Email</th>
                        <th className="pb-3 font-semibold">Book Title</th>
                        <th className="pb-3 font-semibold">Qty</th>
                        <th className="pb-3 font-semibold">Unit Price</th>
                        <th className="pb-3 font-semibold">Gross Sales</th>
                        <th className="pb-3 font-semibold">Author Royalty</th>
                        <th className="pb-3 font-semibold">Channel</th>
                        <th className="pb-3 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#181824]">
                      {recentSales.length === 0 ? (
                        <tr>
                          <td colSpan="9" className="py-8 text-center text-gray-500">No book sales recorded yet. Click "+ Record Book Sale" to add one.</td>
                        </tr>
                      ) : (
                        recentSales.map((sale) => (
                          <tr key={sale._id || sale.id} className="hover:bg-[#14141f] transition">
                            <td className="py-4 text-gray-400">{new Date(sale.saleDate || sale.createdAt).toLocaleDateString("en-IN")}</td>
                            <td className="py-4 font-bold text-white">{sale.authorEmail}</td>
                            <td className="py-4 text-gray-200">{sale.bookTitle}</td>
                            <td className="py-4 text-gray-300 font-medium">{sale.quantity}</td>
                            <td className="py-4 text-gray-300 font-medium">₹{sale.unitPrice}</td>
                            <td className="py-4 text-white font-extrabold">₹{sale.grossSales}</td>
                            <td className="py-4 text-emerald-400 font-extrabold">₹{sale.authorProfit}</td>
                            <td className="py-4 text-gray-400">{sale.channel || "Direct"}</td>
                            <td className="py-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditSale(sale)}
                                  className="p-1.5 text-gray-400 hover:text-[#f3c06b] hover:bg-[#1e1e2c] border border-transparent hover:border-[#c8923a]/40 rounded-lg transition"
                                  title="Edit Sale"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSale(sale._id || sale.id)}
                                  className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/30 rounded-lg transition"
                                  title="Delete Sale"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL: EDIT WORKFLOW & STEPS */}
      {selectedAuthor && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-[#0f0f16] border border-[#c8923a]/40 w-full max-w-2xl p-6 rounded-3xl space-y-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-[#222232] pb-4">
              <div>
                <h3 className="font-serif text-lg font-extrabold text-[#f3c06b]">Edit 9-Step Publishing Workflow</h3>
                <p className="text-xs text-gray-400">{selectedAuthor.name} ({selectedAuthor.email})</p>
              </div>
              <button onClick={() => setSelectedAuthor(null)} className="text-gray-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Publishing Payment Status</label>
                <select
                  value={editingPaymentStatus}
                  onChange={(e) => setEditingPaymentStatus(e.target.value)}
                  className="w-full bg-[#08080c] border border-[#262636] px-3 py-2.5 rounded-xl text-white focus:border-[#c8923a]"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="PAID">PAID</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-400 mb-1 font-semibold font-medium">Plan Amount Paid (₹)</label>
                <input
                  type="number"
                  value={editingAmountPaid}
                  onChange={(e) => setEditingAmountPaid(e.target.value)}
                  className="w-full bg-[#08080c] border border-[#262636] px-3 py-2.5 rounded-xl text-white focus:border-[#c8923a]"
                />
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">9 Workflow Execution Steps</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {editingWorkflow.map((st, idx) => (
                  <div key={st.stepNumber} className="bg-[#08080c] p-3 rounded-xl border border-[#1e1e2d] space-y-1">
                    <p className="font-bold text-[#f3c06b]">{st.stepNumber}. {st.name}</p>
                    <select
                      value={st.status}
                      onChange={(e) => {
                        const updated = [...editingWorkflow];
                        updated[idx].status = e.target.value;
                        setEditingWorkflow(updated);
                      }}
                      className="w-full bg-[#12121c] border border-[#262636] px-2 py-1.5 rounded-lg text-white text-[11px]"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="IN_PROGRESS">IN_PROGRESS</option>
                      <option value="COMPLETED">COMPLETED</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[#222232]">
              <button
                type="button"
                onClick={() => setSelectedAuthor(null)}
                className="px-4 py-2 bg-gray-800 text-xs font-semibold rounded-xl text-gray-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveWorkflow(selectedAuthor.id)}
                className="px-5 py-2.5 bg-gradient-to-r from-[#d99b38] to-[#f3c06b] text-xs font-extrabold rounded-xl text-black shadow"
              >
                Save Progress
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT SALE */}
      {showAddSaleModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0f0f16] border border-[#c8923a]/40 w-full max-w-md p-6 rounded-3xl space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="font-serif text-lg font-extrabold text-[#f3c06b]">
                {editingSaleId ? "Edit Sale Record" : "Record New Book Sale"}
              </h3>
              <button
                onClick={() => {
                  setShowAddSaleModal(false);
                  setEditingSaleId(null);
                }}
                className="text-gray-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddSale} className="space-y-4">
              {/* AUTHOR SELECTION DROPDOWN */}
              <div>
                <label className="block text-xs text-gray-400 mb-1 font-medium">Select Publication Author</label>
                <select
                  required
                  value={saleForm.authorEmail}
                  onChange={(e) => {
                    const newEmail = e.target.value;
                    setIsCustomBookTitle(false);
                    setSaleForm((prev) => ({
                      ...prev,
                      authorEmail: newEmail,
                      bookTitle: ""
                    }));
                  }}
                  className="w-full bg-[#08080c] border border-[#242432] focus:border-[#c8923a] px-3.5 py-2.5 rounded-xl text-xs text-white"
                >
                  <option value="">-- Choose Author from Directory --</option>
                  {rawAuthors.map((a) => (
                    <option key={a.id || a.email} value={a.email}>
                      {a.name} ({a.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* BOOK SELECTION (LIST OR CUSTOM) */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs text-gray-400 font-medium">Book Title</label>
                  {saleModalAuthorBooks.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsCustomBookTitle(!isCustomBookTitle)}
                      className="inline-flex items-center gap-1 text-[11px] text-[#f3c06b] hover:underline"
                    >
                      {isCustomBookTitle ? (
                        <>
                          <ArrowLeft className="w-3 h-3" />
                          <span>Select from Author's Books</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3 h-3" />
                          <span>Custom Book Title</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {loadingSaleBooks ? (
                  <div className="px-3.5 py-2.5 bg-[#08080c] border border-[#242432] rounded-xl text-xs text-gray-400 animate-pulse flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-[#f3c06b]" />
                    <span>Loading books for author...</span>
                  </div>
                ) : !isCustomBookTitle && saleModalAuthorBooks.length > 0 ? (
                  <div className="relative">
                    <select
                      required
                      value={saleForm.bookTitle}
                      onChange={(e) => {
                        const selectedTitle = e.target.value;
                        if (selectedTitle === "__custom__") {
                          setIsCustomBookTitle(true);
                          return;
                        }
                        const matchedBook = saleModalAuthorBooks.find((b) => b.title === selectedTitle);
                        const unitP = matchedBook?.paperbackPrice || matchedBook?.price || saleForm.unitPrice || 299;
                        const qty = saleForm.quantity || 1;
                        setSaleForm((prev) => ({
                          ...prev,
                          bookTitle: selectedTitle,
                          unitPrice: unitP,
                          authorProfit: Math.round(unitP * qty * 0.7)
                        }));
                      }}
                      className="w-full bg-[#08080c] border border-[#242432] focus:border-[#c8923a] px-3.5 py-2.5 rounded-xl text-xs text-white outline-none"
                    >
                      <option value="">-- Select Book Associated with Author --</option>
                      {saleModalAuthorBooks.map((bk) => (
                        <option key={bk._id || bk.slug || bk.title} value={bk.title}>
                          {bk.title} {bk.paperbackPrice || bk.price ? `(₹${bk.paperbackPrice || bk.price})` : ""}
                        </option>
                      ))}
                      <option value="__custom__">+ Other / Enter Custom Book Name...</option>
                    </select>
                  </div>
                ) : (
                  <input
                    type="text"
                    required
                    value={saleForm.bookTitle}
                    onChange={(e) => setSaleForm({ ...saleForm, bookTitle: e.target.value })}
                    placeholder="e.g. Frame Face Then Feelings"
                    className="w-full bg-[#08080c] border border-[#242432] focus:border-[#c8923a] px-3.5 py-2.5 rounded-xl text-xs text-white outline-none"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1 font-medium">Quantity</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={saleForm.quantity}
                    onChange={(e) => {
                      const q = Number(e.target.value);
                      const p = saleForm.unitPrice || 299;
                      setSaleForm({
                        ...saleForm,
                        quantity: q,
                        authorProfit: Math.round(p * q * 0.7)
                      });
                    }}
                    className="w-full bg-[#08080c] border border-[#242432] px-3.5 py-2.5 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1 font-medium">Unit Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={saleForm.unitPrice}
                    onChange={(e) => {
                      const p = Number(e.target.value);
                      const q = saleForm.quantity || 1;
                      setSaleForm({
                        ...saleForm,
                        unitPrice: p,
                        authorProfit: Math.round(p * q * 0.7)
                      });
                    }}
                    className="w-full bg-[#08080c] border border-[#242432] px-3.5 py-2.5 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs text-gray-400 font-medium">Author Royalty Profit (₹)</label>
                  <span className="text-[10px] text-gray-500 font-mono">
                    Total Gross: ₹{(saleForm.quantity || 1) * (saleForm.unitPrice || 0)}
                  </span>
                </div>
                <input
                  type="number"
                  required
                  value={saleForm.authorProfit}
                  onChange={(e) => setSaleForm({ ...saleForm, authorProfit: Number(e.target.value) })}
                  className="w-full bg-[#08080c] border border-[#242432] px-3.5 py-2.5 rounded-xl text-xs text-[#f3c06b] font-bold"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddSaleModal(false);
                    setEditingSaleId(null);
                  }}
                  className="px-4 py-2 bg-gray-800 text-xs font-semibold rounded-xl text-gray-300 hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-[#d99b38] to-[#f3c06b] text-xs font-extrabold rounded-xl text-black shadow hover:brightness-105 transition"
                >
                  {editingSaleId ? "Update Sale" : "Save Sale"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD AUTHOR */}
      {showAddAuthorModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0f0f16] border border-[#c8923a]/40 w-full max-w-md p-6 rounded-3xl space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="font-serif text-lg font-extrabold text-[#f3c06b]">Register New Author</h3>
              <button onClick={() => setShowAddAuthorModal(false)} className="text-gray-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-400">Credentials will be generated & emailed automatically.</p>
            <form onSubmit={handleCreateAuthor} className="space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1 font-medium">Author Name</label>
                <input
                  type="text"
                  required
                  value={authorForm.name}
                  onChange={(e) => setAuthorForm({ ...authorForm, name: e.target.value })}
                  placeholder="Full Name"
                  className="w-full bg-[#08080c] border border-[#242432] px-3.5 py-2.5 rounded-xl text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1 font-medium">Email ID</label>
                <input
                  type="email"
                  required
                  value={authorForm.email}
                  onChange={(e) => setAuthorForm({ ...authorForm, email: e.target.value })}
                  placeholder="author@email.com"
                  className="w-full bg-[#08080c] border border-[#242432] px-3.5 py-2.5 rounded-xl text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1 font-medium">Phone Number</label>
                <input
                  type="text"
                  required
                  value={authorForm.phone}
                  onChange={(e) => setAuthorForm({ ...authorForm, phone: e.target.value })}
                  placeholder="9876547890"
                  className="w-full bg-[#08080c] border border-[#242432] px-3.5 py-2.5 rounded-xl text-xs text-white"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddAuthorModal(false)}
                  className="px-4 py-2 bg-gray-800 text-xs font-semibold rounded-xl text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-[#d99b38] to-[#f3c06b] text-xs font-extrabold rounded-xl text-black shadow"
                >
                  Create & Email Credentials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MODAL: PREVIEW & MARKETPLACE LINKS */}
      {showLinksModal && selectedBookForLinks && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-[#0f0f16] border border-[#c8923a]/50 w-full max-w-xl p-6 rounded-3xl space-y-5 shadow-2xl">
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-[#222232] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2a2a3a] to-[#12121c] border border-[#c8923a]/40 flex items-center justify-center text-[#f3c06b]">
                  <Link2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-extrabold text-white flex items-center gap-2">
                    <span>Preview & Marketplace Links</span>
                  </h3>
                  <p className="text-xs text-[#f3c06b] font-medium line-clamp-1">
                    {selectedBookForLinks.title}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowLinksModal(false);
                  setSelectedBookForLinks(null);
                }}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#1a1a26] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Preset Buttons */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Quick Add Platform</span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleAddLinkRow("amazon")}
                  className="px-3 py-1.5 bg-[#181824] hover:bg-[#222232] text-[#ff9900] border border-[#ff9900]/30 hover:border-[#ff9900] rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>+ Amazon</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddLinkRow("kindle")}
                  className="px-3 py-1.5 bg-[#181824] hover:bg-[#222232] text-[#f0c14b] border border-[#f0c14b]/30 hover:border-[#f0c14b] rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>+ Kindle</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddLinkRow("flipkart")}
                  className="px-3 py-1.5 bg-[#181824] hover:bg-[#222232] text-[#2874f0] border border-[#2874f0]/30 hover:border-[#2874f0] rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>+ Flipkart</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddLinkRow("website")}
                  className="px-3 py-1.5 bg-[#181824] hover:bg-[#222232] text-[#f3c06b] border border-[#c8923a]/30 hover:border-[#c8923a] rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>+ Web Reader</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddLinkRow("other")}
                  className="px-3 py-1.5 bg-[#181824] hover:bg-[#222232] text-gray-300 border border-gray-700 hover:border-gray-500 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Custom Link</span>
                </button>
              </div>
            </div>

            {/* Links Form List */}
            <form onSubmit={handleSavePreviewLinks} className="space-y-4">
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {previewLinksForm.length === 0 ? (
                  <div className="p-8 text-center bg-[#09090d] border border-dashed border-[#222232] rounded-2xl text-gray-400 text-xs">
                    <p className="font-semibold text-gray-300">No preview or store links added yet.</p>
                    <p className="mt-1 text-[11px] text-gray-500">Click any preset button above or "+ Add Another Link" below to add Amazon, Kindle, Flipkart, or Web Reader links.</p>
                  </div>
                ) : (
                  previewLinksForm.map((linkItem, idx) => (
                    <div
                      key={idx}
                      className="bg-[#09090f] border border-[#1f1f2e] hover:border-[#c8923a]/40 p-3.5 rounded-2xl space-y-3 transition"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="w-5 h-5 rounded-full bg-[#181826] text-[#f3c06b] text-[11px] font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <select
                            value={linkItem.platform || "amazon"}
                            onChange={(e) => handleUpdateLinkRow(idx, "platform", e.target.value)}
                            className="bg-[#12121c] border border-[#262636] focus:border-[#c8923a] text-white text-xs font-semibold px-2.5 py-1.5 rounded-xl outline-none"
                          >
                            <option value="amazon">Amazon Store</option>
                            <option value="kindle">Amazon Kindle</option>
                            <option value="flipkart">Flipkart</option>
                            <option value="website">Official Web Reader</option>
                            <option value="google_play">Google Play Books</option>
                            <option value="other">Other / Custom</option>
                          </select>
                          <input
                            type="text"
                            required
                            value={linkItem.title || ""}
                            onChange={(e) => handleUpdateLinkRow(idx, "title", e.target.value)}
                            placeholder="Link Title (e.g. Buy on Amazon)"
                            className="flex-1 bg-[#12121c] border border-[#262636] focus:border-[#c8923a] text-white text-xs px-3 py-1.5 rounded-xl outline-none"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveLinkRow(idx)}
                          className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                          title="Remove Link"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          required
                          value={linkItem.url || ""}
                          onChange={(e) => handleUpdateLinkRow(idx, "url", e.target.value)}
                          placeholder="Destination URL (e.g. https://www.amazon.in/dp/...)"
                          className="flex-1 bg-[#050508] border border-[#262636] focus:border-[#c8923a] text-[#f3c06b] font-mono text-[11px] px-3 py-2 rounded-xl outline-none"
                        />
                        {linkItem.url && (
                          <a
                            href={linkItem.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-[#12121c] hover:bg-[#1a1a2a] text-gray-300 hover:text-[#f3c06b] border border-[#262636] rounded-xl text-xs transition shrink-0"
                            title="Test open link"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-[#222232]">
                <button
                  type="button"
                  onClick={() => handleAddLinkRow("amazon")}
                  className="px-3 py-2 bg-[#14141f] hover:bg-[#1c1c2e] border border-[#262638] hover:border-[#c8923a]/40 text-[#f3c06b] text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Link</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowLinksModal(false);
                      setSelectedBookForLinks(null);
                    }}
                    className="px-4 py-2 bg-gray-800 text-xs font-semibold rounded-xl text-gray-300 hover:bg-gray-700 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingLinks}
                    className="px-5 py-2 bg-gradient-to-r from-[#d99b38] to-[#f3c06b] text-xs font-extrabold rounded-xl text-black shadow hover:brightness-105 transition disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {savingLinks ? "Saving Links..." : "Save Links"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT AUTHOR DETAILS MODAL */}
      {showEditAuthorModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          data-lenis-prevent="true"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0e0e14] border border-[#c8923a]/50 w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto custom-scrollbar"
          >
            <div className="flex justify-between items-center border-b border-[#222232] pb-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#f3c06b]">Edit Author Details</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Update author contact info, credentials, and publishing plan.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowEditAuthorModal(false)}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAuthorDetails} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 font-semibold mb-1.5 uppercase tracking-wider text-[10px]">
                  Author Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={editAuthorForm.name}
                  onChange={(e) => setEditAuthorForm({ ...editAuthorForm, name: e.target.value })}
                  placeholder="e.g. Pranab kr Nath"
                  className="w-full bg-[#08080c] border border-[#262638] focus:border-[#c8923a] text-white px-3.5 py-2.5 rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-gray-400 font-semibold mb-1.5 uppercase tracking-wider text-[10px]">
                    Email Address (Login ID) *
                  </label>
                  <input
                    type="email"
                    required
                    value={editAuthorForm.email}
                    onChange={(e) => setEditAuthorForm({ ...editAuthorForm, email: e.target.value })}
                    placeholder="author@lekhoktripura.in"
                    className="w-full bg-[#08080c] border border-[#262638] focus:border-[#c8923a] text-white px-3.5 py-2.5 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-semibold mb-1.5 uppercase tracking-wider text-[10px]">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={editAuthorForm.phone}
                    onChange={(e) => setEditAuthorForm({ ...editAuthorForm, phone: e.target.value })}
                    placeholder="e.g. 9876543210"
                    className="w-full bg-[#08080c] border border-[#262638] focus:border-[#c8923a] text-white px-3.5 py-2.5 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-gray-400 font-semibold mb-1.5 uppercase tracking-wider text-[10px]">
                    Publishing Plan
                  </label>
                  <select
                    value={editAuthorForm.selectedPlan}
                    onChange={(e) => {
                      const val = e.target.value;
                      let amt = 1212;
                      if (val === "Publication Author Plan") amt = 1212;
                      if (val === "Premium Publishing Plan") amt = 2499;
                      if (val === "Standard Publishing Plan") amt = 1999;
                      if (val === "Basic Publishing Plan") amt = 1212;
                      setEditAuthorForm({ ...editAuthorForm, selectedPlan: val, planAmount: amt });
                    }}
                    className="w-full bg-[#08080c] border border-[#262638] focus:border-[#c8923a] text-white px-3.5 py-2.5 rounded-xl outline-none"
                  >
                    <option value="Basic Publishing Plan">Basic Publishing Plan (₹1212)</option>
                    <option value="Publication Author Plan">Publication Author Plan (₹1212)</option>
                    <option value="Standard Publishing Plan">Standard Publishing Plan (₹1999)</option>
                    <option value="Premium Publishing Plan">Premium Publishing Plan (₹2499)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 font-semibold mb-1.5 uppercase tracking-wider text-[10px]">
                    Plan Fee (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editAuthorForm.planAmount}
                    onChange={(e) => setEditAuthorForm({ ...editAuthorForm, planAmount: Number(e.target.value) })}
                    className="w-full bg-[#08080c] border border-[#262638] focus:border-[#c8923a] text-white px-3.5 py-2.5 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-gray-400 font-semibold mb-1.5 uppercase tracking-wider text-[10px]">
                    Payment Status
                  </label>
                  <select
                    value={editAuthorForm.publishingPaymentStatus}
                    onChange={(e) => setEditAuthorForm({ ...editAuthorForm, publishingPaymentStatus: e.target.value })}
                    className="w-full bg-[#08080c] border border-[#262638] focus:border-[#c8923a] text-white px-3.5 py-2.5 rounded-xl outline-none"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="PAID">PAID</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 font-semibold mb-1.5 uppercase tracking-wider text-[10px]">
                    Amount Paid (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editAuthorForm.amountPaid}
                    onChange={(e) => setEditAuthorForm({ ...editAuthorForm, amountPaid: Number(e.target.value) })}
                    className="w-full bg-[#08080c] border border-[#262638] focus:border-[#c8923a] text-white px-3.5 py-2.5 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 font-semibold mb-1.5 uppercase tracking-wider text-[10px]">
                  Reset Portal Password (Optional)
                </label>
                <input
                  type="text"
                  value={editAuthorForm.password}
                  onChange={(e) => setEditAuthorForm({ ...editAuthorForm, password: e.target.value })}
                  placeholder="Leave blank to keep existing password"
                  className="w-full bg-[#08080c] border border-[#262638] focus:border-[#c8923a] text-white px-3.5 py-2.5 rounded-xl outline-none font-mono text-xs"
                />
                <p className="mt-1 text-[10px] text-gray-500">
                  Default format: First 5 letters of author name (UPPERCASE) + Last 4 digits of phone number.
                </p>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#222232]">
                <button
                  type="button"
                  onClick={() => setShowEditAuthorModal(false)}
                  className="px-4 py-2.5 bg-gray-800 text-gray-300 font-semibold text-xs rounded-xl hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAuthorDetails}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#d99b38] to-[#f3c06b] hover:from-[#e5a845] hover:to-[#fbd080] text-black font-extrabold text-xs rounded-xl shadow transition disabled:opacity-50"
                >
                  {savingAuthorDetails ? "Saving..." : "Save Author Details"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
