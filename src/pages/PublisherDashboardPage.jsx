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
  ShoppingBag,
  Plus,
  Link2,
  Globe,
  ChevronDown,
  Check,
  CheckCircle,
  HelpCircle
} from "lucide-react";

import PublisherExecutionManager from "../publisher/components/PublisherExecutionManager.jsx";
import PublisherOverviewTab from "../publisher/components/PublisherOverviewTab.jsx";
import PublisherAuthorsTab from "../publisher/components/PublisherAuthorsTab.jsx";
import PublisherSalesTab from "../publisher/components/PublisherSalesTab.jsx";
import PublisherHelpModal from "../publisher/components/PublisherHelpModal.jsx";

const DEFAULT_9_STEPS = [
  { stepNumber: 1, name: "Payment", status: "PENDING" },
  { stepNumber: 2, name: "ISBN Generated", status: "PENDING" },
  { stepNumber: 3, name: "Book Page", status: "PENDING" },
  { stepNumber: 4, name: "Book Cover", status: "PENDING" },
  { stepNumber: 5, name: "Formatting", status: "PENDING" },
  { stepNumber: 6, name: "Author Approval", status: "PENDING" },
  { stepNumber: 7, name: "Ready to Print", status: "PENDING" },
  { stepNumber: 8, name: "Printing", status: "PENDING" },
  { stepNumber: 9, name: "Stock Ready", status: "PENDING" }
];

function getAuthorWorkflowSteps(auth) {
  if (!auth) return DEFAULT_9_STEPS.map((s) => ({ ...s }));
  const existing = Array.isArray(auth.workflowSteps) ? auth.workflowSteps : [];
  return DEFAULT_9_STEPS.map((defStep) => {
    const found = existing.find(
      (s) => Number(s.stepNumber) === defStep.stepNumber || s.name?.toLowerCase() === defStep.name?.toLowerCase()
    );
    if (found) {
      let st = String(found.status || "PENDING").toUpperCase();
      if (st === "PENDING" && defStep.stepNumber === 1 && (auth.status === "PAID" || auth.publishingPaymentStatus === "PAID")) {
        st = "COMPLETED";
      }
      return {
        stepNumber: defStep.stepNumber,
        name: defStep.name,
        status: st,
        value: found.value || ""
      };
    }
    if (defStep.stepNumber === 1 && (auth.status === "PAID" || auth.publishingPaymentStatus === "PAID")) {
      return { ...defStep, status: "COMPLETED" };
    }
    return { ...defStep };
  });
}

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
  const [selectedWorkflowBookTitle, setSelectedWorkflowBookTitle] = useState("");
  const [isBookDropdownOpen, setIsBookDropdownOpen] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState([]);
  const [editingPaymentStatus, setEditingPaymentStatus] = useState("PENDING");
  const [editingPlanAmount, setEditingPlanAmount] = useState(1212);
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

  // Save Workflow Success Modal state
  const [workflowSuccessNotice, setWorkflowSuccessNotice] = useState(null);

  // Help & Documentation Modal state
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Lock background scroll whenever any modal is open
  useEffect(() => {
    const isAnyModalOpen = Boolean(
      selectedAuthor ||
      showAddSaleModal ||
      showAddAuthorModal ||
      showEditAuthorModal ||
      showLinksModal ||
      workflowSuccessNotice ||
      showHelpModal
    );

    if (isAnyModalOpen) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      if (window.lenis) {
        try {
          window.lenis.stop();
        } catch (e) {
          console.error("Error stopping Lenis:", e);
        }
      }
    } else {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      if (window.lenis) {
        try {
          window.lenis.start();
        } catch (e) {
          console.error("Error starting Lenis:", e);
        }
      }
    }

    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      if (window.lenis) {
        try {
          window.lenis.start();
        } catch (e) {}
      }
    };
  }, [selectedAuthor, showAddSaleModal, showAddAuthorModal, showEditAuthorModal, showLinksModal, workflowSuccessNotice, showHelpModal]);

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
        body: JSON.stringify({
          ...editAuthorForm,
          planAmount: editAuthorForm.planAmount === "" ? 0 : Number(editAuthorForm.planAmount),
          amountPaid: editAuthorForm.amountPaid === "" ? 0 : Number(editAuthorForm.amountPaid)
        })
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

  const getAssociatedBooksForAuthor = (auth) => {
    if (!auth) return [];
    const authorName = (auth.name || "").trim().toLowerCase();
    const directBooks = Array.isArray(auth.books)
      ? auth.books.filter((b) => b.title && b.title !== `${auth.name} Books`)
      : [];
    const catalogMatches = allCatalogBooks.filter((b) => {
      if (!b.author) return false;
      const bkAuth = b.author.toLowerCase().trim();
      return bkAuth === authorName || bkAuth.includes(authorName) || authorName.includes(bkAuth);
    });

    const seen = new Set();
    const combined = [];
    [...catalogMatches, ...directBooks].forEach((b) => {
      const title = (b.title || "").trim();
      if (title && !seen.has(title.toLowerCase())) {
        seen.add(title.toLowerCase());
        combined.push(b);
      }
    });

    if (combined.length === 0) {
      if (auth.books && auth.books.length > 0) {
        combined.push(auth.books[0]);
      } else {
        combined.push({ title: `${auth.name || 'Author'} Official Book`, isbn: auth.isbnNo || "—", pages: auth.pageCount || 120 });
      }
    }
    return combined;
  };

  const hydrateWorkflowForBook = (bookTitle, auth) => {
    if (!auth) return;
    const targetTitle = String(bookTitle || "").trim();
    const bookDoc = (auth?.books || []).find(
      (b) => b.title && b.title.trim().toLowerCase() === targetTitle.toLowerCase()
    );

    const catalogMatch = allCatalogBooks.find(
      (b) => b.title && b.title.trim().toLowerCase() === targetTitle.toLowerCase()
    );

    const steps = getAuthorWorkflowSteps(bookDoc || auth);
    const step2 = steps.find((s) => s.stepNumber === 2);
    if (step2 && !step2.value) {
      step2.value = bookDoc?.isbn || catalogMatch?.isbn || auth?.isbnNo || (auth?.books && auth.books[0]?.isbn && auth.books[0].isbn !== "—" ? auth.books[0].isbn : "") || "";
    }
    const step3 = steps.find((s) => s.stepNumber === 3);
    if (step3 && !step3.value) {
      const initialPages = bookDoc?.pages || bookDoc?.pageCount || catalogMatch?.pages || auth?.pageCount || auth?.pages || (auth?.books && auth.books[0]?.pages) || 120;
      step3.value = initialPages ? String(initialPages) : "120";
    }

    const payStatus = bookDoc?.publishingPaymentStatus || auth?.status || auth?.publishingPaymentStatus || "PENDING";
    const planAmt = bookDoc?.planAmount !== undefined ? bookDoc.planAmount : (auth?.planAmount !== undefined ? auth.planAmount : 1212);
    const amtPaid = bookDoc?.amountPaid !== undefined ? bookDoc.amountPaid : (auth?.planPaid !== undefined ? auth.planPaid : (auth?.amountPaid || 0));

    setSelectedWorkflowBookTitle(targetTitle || (auth?.books?.[0]?.title || "Default Title"));
    setEditingWorkflow(steps);
    setEditingPaymentStatus(payStatus);
    setEditingPlanAmount(planAmt);
    setEditingAmountPaid(amtPaid);
  };

  const handleOpenWorkflowModal = (auth, initialBookTitle) => {
    if (!auth) return;
    setIsBookDropdownOpen(false);
    setSelectedAuthor(auth);
    const associated = getAssociatedBooksForAuthor(auth);
    const targetBook = initialBookTitle || associated[0]?.title || (auth.books && auth.books[0]?.title) || "";
    hydrateWorkflowForBook(targetBook, auth);
  };

  const handleSelectWorkflowBook = (newBookTitle) => {
    if (!selectedAuthor) return;
    hydrateWorkflowForBook(newBookTitle, selectedAuthor);
  };

  const handleSaveWorkflow = async (authorId) => {
    const targetId = authorId || selectedAuthor?.id || selectedAuthor?._id || selectedAuthor?.authorId;
    if (!targetId) {
      alert("No author selected.");
      return;
    }
    const step2 = editingWorkflow.find((s) => s.stepNumber === 2);
    const isbnVal = step2?.value?.trim() || "";
    const step3 = editingWorkflow.find((s) => s.stepNumber === 3);
    const pageCountVal = step3?.value ? Number(step3.value) : undefined;

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/publisher/authors/${targetId}/workflow`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          bookTitle: selectedWorkflowBookTitle,
          workflowSteps: editingWorkflow,
          publishingPaymentStatus: editingPaymentStatus,
          planAmount: Number(editingPlanAmount || 0),
          amountPaid: Number(editingAmountPaid || 0),
          isbnNo: isbnVal,
          pageCount: pageCountVal
        })
      });
      const data = await res.json();
      if (data.success) {
        // Show rich modal notice instead of browser alert
        setWorkflowSuccessNotice({
          bookTitle: selectedWorkflowBookTitle || "Book",
          authorName: selectedAuthor?.name || "Author",
          authorId: targetId
        });

        // Update local viewingAuthor state immediately
        if (viewingAuthor && (viewingAuthor.id === targetId || viewingAuthor._id === targetId || viewingAuthor.authorId === targetId)) {
          setViewingAuthor((prev) => ({
            ...prev,
            workflowSteps: editingWorkflow,
            status: editingPaymentStatus,
            planAmount: Number(editingPlanAmount || 0),
            planPaid: Number(editingAmountPaid || 0),
            isbnNo: isbnVal || prev.isbnNo,
            pageCount: pageCountVal !== undefined ? pageCountVal : prev.pageCount,
            pages: pageCountVal !== undefined ? pageCountVal : prev.pages
          }));
        }
        setSelectedAuthor(null);
        await fetchPublisherData();
      } else {
        alert(data.message || "Failed to update workflow.");
      }
    } catch (err) {
      console.error("Error updating workflow:", err);
      alert("Error updating workflow. Please try again.");
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
          { platform: "website", title: "Buy Books Store Page", url: `/library?book=${encodeURIComponent(book.slug || book._id)}` }
        ];
    setPreviewLinksForm(existing);
    setShowLinksModal(true);
  };

  const handleAddLinkRow = (presetPlatform = "amazon") => {
    const defaultTitles = {
      amazon: "Amazon Store",
      kindle: "Amazon Kindle",
      flipkart: "Flipkart Store",
      website: "Buy Books Store Page",
      google_play: "Google Play Books",
      other: "Preview / Store Link"
    };
    setPreviewLinksForm((prev) => [
      ...prev,
      {
        platform: presetPlatform,
        title: defaultTitles[presetPlatform] || "Store Link",
        url: presetPlatform === "website" && selectedBookForLinks ? `/library?book=${encodeURIComponent(selectedBookForLinks.slug || selectedBookForLinks._id)}` : ""
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
          website: "Buy Books Store Page",
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

          <button
            type="button"
            onClick={() => setShowHelpModal(true)}
            className="w-full text-left px-4 py-3 rounded-xl font-bold transition flex items-center gap-3 bg-[#12121c] border border-[#c8923a]/40 text-[#f3c06b] hover:bg-[#1a1a28] hover:border-[#c8923a] shadow-sm cursor-pointer group"
          >
            <HelpCircle className="w-4 h-4 text-[#f3c06b] group-hover:rotate-12 transition-transform" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white group-hover:text-[#f3c06b] transition">Help & Guide</span>
              <span className="text-[10px] text-gray-400">Tabs & Workflows manual</span>
            </div>
          </button>
        </div>

        <div className="space-y-3 pt-6 border-t border-[#1c1c28]">
          <button
            onClick={() => setShowAddAuthorModal(true)}
            className="w-full py-2.5 bg-[#14141e] hover:bg-[#1e1e2c] border border-[#c8923a]/40 text-xs font-bold rounded-xl text-[#f3c06b] transition flex items-center justify-center gap-2 shadow cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Author</span>
          </button>
          <button
            onClick={handleOpenAddSale}
            className="w-full py-2.5 bg-gradient-to-r from-[#d99b38] to-[#f3c06b] hover:from-[#e5a845] hover:to-[#fbd080] text-black text-xs font-extrabold rounded-xl shadow-lg shadow-[#c8923a]/20 transition flex items-center justify-center gap-2 cursor-pointer"
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
            className="w-full text-left px-4 py-2.5 rounded-xl font-bold text-xs text-gray-400 hover:text-red-400 transition flex items-center gap-3 cursor-pointer"
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
            <button
              type="button"
              onClick={() => setShowHelpModal(true)}
              className="px-3.5 py-2 bg-[#14141e] hover:bg-[#1e1e2c] border border-[#c8923a]/50 text-xs font-bold rounded-xl text-[#f3c06b] hover:text-white transition flex items-center gap-2 shadow cursor-pointer"
              title="Dashboard Help & Guide"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#f3c06b]" />
              <span className="hidden sm:inline">Help & Guide</span>
            </button>
            <Link
              to="/author_dashboard"
              className="px-3.5 py-2 bg-[#14141e] hover:bg-[#1e1e2c] border border-[#c8923a]/40 text-xs font-bold rounded-xl text-[#f3c06b] transition flex items-center gap-2 shadow"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Author Portal →</span>
            </Link>
            <button
              onClick={() => setShowAddAuthorModal(true)}
              className="px-3.5 py-2 bg-[#14141e] hover:bg-[#1e1e2c] border border-[#c8923a]/40 text-xs font-bold rounded-xl text-[#f3c06b] transition flex items-center gap-2 shadow cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Author</span>
            </button>
            <button
              onClick={() => setShowAddSaleModal(true)}
              className="px-3.5 py-2 bg-gradient-to-r from-[#d99b38] to-[#f3c06b] hover:from-[#e5a845] hover:to-[#fbd080] text-black text-xs font-extrabold rounded-xl shadow-lg shadow-[#c8923a]/20 transition flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Sale</span>
            </button>
            <button
              onClick={handleLogout}
              className="px-3.5 py-2 border border-[#333348] hover:bg-[#161622] text-xs font-semibold rounded-xl transition text-gray-300 flex items-center gap-2 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-gray-400" />
              <span>Logout</span>
            </button>
          </div>
        </header>

        <main className="p-6 md:p-8 space-y-8 flex-1">
          {/* TAB 0: EXECUTION MANAGER */}
          {activeTab === "execution" && (
            <PublisherExecutionManager
              authors={rawAuthors}
              token={token}
              onRefresh={fetchPublisherData}
              allCatalogBooks={allCatalogBooks}
            />
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 1: OVERVIEW */}
          {/* ------------------------------------------------------------- */}
          {activeTab === "overview" && (
            <PublisherOverviewTab
              overviewMetrics={overviewMetrics}
              paymentBreakdown={paymentBreakdown}
              authorEarnings={authorEarnings}
              rawAuthors={rawAuthors}
              onOpenAuthorBooks={handleOpenAuthorBooks}
            />
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 2: AUTHORS MANAGEMENT & AUTHOR BOOKS VIEW */}
          {/* ------------------------------------------------------------- */}
          {activeTab === "authors" && (
            <PublisherAuthorsTab
              rawAuthors={rawAuthors}
              viewingAuthor={viewingAuthor}
              setViewingAuthor={setViewingAuthor}
              authorBooksList={authorBooksList}
              loadingAuthorBooks={loadingAuthorBooks}
              authorBooksSearch={authorBooksSearch}
              setAuthorBooksSearch={setAuthorBooksSearch}
              recentSales={recentSales}
              onOpenAddAuthor={() => setShowAddAuthorModal(true)}
              onOpenEditAuthor={handleOpenEditAuthor}
              onOpenWorkflowModal={handleOpenWorkflowModal}
              onDeleteAuthor={handleDeleteAuthor}
              onOpenAuthorBooks={handleOpenAuthorBooks}
              onOpenAddSaleForAuthor={(author) => {
                setSaleForm({
                  authorEmail: author?.email || "",
                  bookTitle: authorBooksList[0]?.title || "",
                  quantity: 1,
                  unitPrice: authorBooksList[0]?.price || 299,
                  authorProfit: Math.round((authorBooksList[0]?.price || 299) * 0.7),
                  channel: "Direct / Website"
                });
                setShowAddSaleModal(true);
              }}
              onOpenEditSale={handleOpenEditSale}
              onDeleteSale={handleDeleteSale}
              onOpenLinksModal={handleOpenLinksModal}
              onQuickSaleForBook={(b) => {
                setSaleForm({
                  authorEmail: viewingAuthor?.email || "",
                  bookTitle: b?.title || "",
                  quantity: 1,
                  unitPrice: b?.price || 299,
                  authorProfit: Math.round((b?.price || 299) * 0.7),
                  channel: "Direct / Website"
                });
                setShowAddSaleModal(true);
              }}
              getAuthorWorkflowSteps={getAuthorWorkflowSteps}
            />
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 3: SALES & PAYMENTS LEDGER */}
          {/* ------------------------------------------------------------- */}
          {activeTab === "sales" && (
            <PublisherSalesTab
              recentSales={recentSales}
              onOpenAddSale={handleOpenAddSale}
              onOpenEditSale={handleOpenEditSale}
              onDeleteSale={handleDeleteSale}
            />
          )}
        </main>
      </div>

      {/* MODAL: EDIT WORKFLOW & STEPS */}
      {selectedAuthor && (() => {
        const associatedBooks = getAssociatedBooksForAuthor(selectedAuthor);
        const step2 = editingWorkflow.find((s) => s.stepNumber === 2);
        const isStep2Completed = step2 && (step2.status === "COMPLETED" || step2.status === "Completed");
        const step3 = editingWorkflow.find((s) => s.stepNumber === 3);
        const isStep3Completed = step3 && (step3.status === "COMPLETED" || step3.status === "Completed");
        const planTotal = Number(editingPlanAmount || 0);
        const paidTotal = Number(editingAmountPaid || 0);
        const pendingDue = Math.max(0, planTotal - paidTotal);

        return (
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 z-50 overflow-y-auto"
            onClick={() => setSelectedAuthor(null)}
            data-lenis-prevent="true"
          >
            <div
              className="bg-[#0f0f16] border border-[#c8923a]/40 w-full max-w-2xl h-[88vh] max-h-[88vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden my-auto"
              onClick={(e) => e.stopPropagation()}
              data-lenis-prevent="true"
            >
              {/* Header (Fixed Top) */}
              <div className="flex justify-between items-start border-b border-[#222232] p-5 sm:p-6 pb-4 shrink-0 bg-[#0f0f16]">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-serif text-lg font-extrabold text-[#f3c06b]">Edit 9-Step Publishing Workflow</h3>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      {associatedBooks.length} {associatedBooks.length === 1 ? "Book" : "Books"} Associated
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {selectedAuthor.name} ({selectedAuthor.email})
                  </p>
                </div>
                <button
                  onClick={() => setSelectedAuthor(null)}
                  className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Content Body with fixed height and explicit scrolling */}
              <div
                className="p-5 sm:p-6 overflow-y-auto flex-1 min-h-0 space-y-5 custom-scrollbar gold-scrollbar"
                data-lenis-prevent="true"
                style={{
                  overscrollBehavior: "contain",
                  WebkitOverflowScrolling: "touch",
                  touchAction: "pan-y"
                }}
              >
                {/* Book Selection Dropdown */}
                <div className="bg-[#12121c] border border-[#222234] p-4 rounded-2xl space-y-2.5 relative">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-200 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-[#f3c06b]" />
                      Select Book to Update Workflow:
                    </label>
                    <span className="text-[11px] font-semibold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-lg">
                      {associatedBooks.length} {associatedBooks.length === 1 ? "Book" : "Books"}
                    </span>
                  </div>

                  {/* Custom Dropdown Trigger */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsBookDropdownOpen(!isBookDropdownOpen)}
                      className="w-full bg-[#08080c] border border-[#2e2e42] hover:border-[#f3c06b]/70 focus:border-[#f3c06b] px-3.5 py-2.5 rounded-xl text-white text-xs font-semibold flex items-center justify-between gap-2 transition cursor-pointer"
                    >
                      {(() => {
                        const currentBk =
                          associatedBooks.find(
                            (b) => (b.title || "").toLowerCase() === (selectedWorkflowBookTitle || "").toLowerCase()
                          ) || associatedBooks[0];
                        return (
                          <div className="flex items-center gap-2.5 min-w-0 flex-1 text-left">
                            <div className="w-6 h-6 rounded-lg bg-[#181824] border border-[#c8923a]/30 flex items-center justify-center shrink-0 text-[#f3c06b]">
                              <BookOpen className="w-3.5 h-3.5" />
                            </div>
                            <span className="truncate font-semibold text-white">
                              {currentBk?.title || selectedWorkflowBookTitle || "Select Book"}
                            </span>
                            {currentBk?.pages ? (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-gray-800 text-gray-300 font-normal shrink-0">
                                {currentBk.pages} pages
                              </span>
                            ) : null}
                            {currentBk?.isbn && currentBk.isbn !== "—" ? (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono shrink-0 hidden sm:inline-block">
                                ISBN: {currentBk.isbn}
                              </span>
                            ) : null}
                          </div>
                        );
                      })()}
                      <ChevronDown
                        className={`w-4 h-4 text-[#f3c06b] shrink-0 transition-transform duration-200 ${
                          isBookDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* Custom Dropdown Menu */}
                    {isBookDropdownOpen && (
                      <div
                        className="absolute left-0 right-0 top-full mt-1.5 bg-[#0e0e16] border border-[#c8923a]/40 rounded-xl shadow-2xl z-30 p-1.5 space-y-1 max-h-56 overflow-y-auto custom-scrollbar gold-scrollbar"
                        data-lenis-prevent="true"
                      >
                        {associatedBooks.map((bk, i) => {
                          const isSelected =
                            (bk.title || "").toLowerCase() === (selectedWorkflowBookTitle || "").toLowerCase();
                          return (
                            <button
                              key={i}
                              type="button"
                              onClick={() => {
                                handleSelectWorkflowBook(bk.title);
                                setIsBookDropdownOpen(false);
                              }}
                              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between gap-2 transition cursor-pointer ${
                                isSelected
                                  ? "bg-gradient-to-r from-amber-500/20 to-amber-500/5 text-amber-300 border border-amber-500/30"
                                  : "text-gray-300 hover:bg-[#181824] hover:text-white"
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <div
                                  className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                                    isSelected
                                      ? "bg-amber-400/20 text-[#f3c06b]"
                                      : "bg-[#181824] text-gray-400"
                                  }`}
                                >
                                  <BookOpen className="w-3.5 h-3.5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="truncate font-bold text-white">{bk.title}</div>
                                  <div className="flex items-center gap-2 text-[10px] text-gray-400 font-normal">
                                    {bk.pages ? <span>{bk.pages} pages</span> : null}
                                    {bk.isbn && bk.isbn !== "—" ? (
                                      <span className="font-mono text-amber-400/80">ISBN: {bk.isbn}</span>
                                    ) : null}
                                  </div>
                                </div>
                              </div>
                              {isSelected && <Check className="w-4 h-4 text-[#f3c06b] shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Publishing Payment & Financial Details */}
                <div className="bg-[#12121c] border border-[#222234] p-4 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-[#f3c06b]" />
                      <span>Publishing Payment & Financials</span>
                      {selectedWorkflowBookTitle && (
                        <span className="text-[#f3c06b] text-[11px] font-normal lowercase">
                          for “{selectedWorkflowBookTitle}”
                        </span>
                      )}
                    </h4>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        editingPaymentStatus === "PAID"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : editingPaymentStatus === "IN_PROGRESS" || editingPaymentStatus === "PARTIAL"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                      }`}
                    >
                      {editingPaymentStatus}
                    </span>
                  </div>

                  {/* 3 Live Summary Badges */}
                  <div className="grid grid-cols-3 gap-2.5 text-center">
                    <div className="bg-[#08080c] border border-[#1e1e2d] p-2.5 rounded-xl">
                      <div className="text-[10px] uppercase font-bold text-gray-400">Total Amount</div>
                      <div className="text-sm font-extrabold text-[#f3c06b]">₹{planTotal.toLocaleString("en-IN")}</div>
                    </div>
                    <div className="bg-[#08080c] border border-[#1e1e2d] p-2.5 rounded-xl">
                      <div className="text-[10px] uppercase font-bold text-gray-400">Paid Till Now</div>
                      <div className="text-sm font-extrabold text-emerald-400">₹{paidTotal.toLocaleString("en-IN")}</div>
                    </div>
                    <div
                      className={`p-2.5 rounded-xl border ${
                        pendingDue > 0 ? "bg-rose-950/30 border-rose-800/50" : "bg-emerald-950/30 border-emerald-800/50"
                      }`}
                    >
                      <div className="text-[10px] uppercase font-bold text-gray-400">Pending Due</div>
                      <div className={`text-sm font-extrabold ${pendingDue > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                        ₹{pendingDue.toLocaleString("en-IN")}
                      </div>
                    </div>
                  </div>

                  {/* Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                    <div>
                      <label className="block text-gray-400 mb-1 font-semibold">Payment Status</label>
                      <select
                        value={editingPaymentStatus}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditingPaymentStatus(val);
                          if (val === "PAID") {
                            setEditingAmountPaid(planTotal);
                            setEditingWorkflow((prev) =>
                              prev.map((st) => (st.stepNumber === 1 ? { ...st, status: "COMPLETED" } : st))
                            );
                          } else if (val === "PENDING") {
                            setEditingAmountPaid(0);
                            setEditingWorkflow((prev) =>
                              prev.map((st) => (st.stepNumber === 1 ? { ...st, status: "PENDING" } : st))
                            );
                          } else if (val === "IN_PROGRESS") {
                            setEditingWorkflow((prev) =>
                              prev.map((st) => (st.stepNumber === 1 ? { ...st, status: "IN_PROGRESS" } : st))
                            );
                          }
                        }}
                        className="w-full bg-[#08080c] border border-[#262636] px-3 py-2 rounded-xl text-white focus:border-[#c8923a]"
                      >
                        <option value="PENDING">PENDING (Awaiting Payment)</option>
                        <option value="IN_PROGRESS">IN_PROGRESS (Partial Payment)</option>
                        <option value="PAID">PAID (Full Payment)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-400 mb-1 font-semibold">Total Plan Amount (₹)</label>
                      <input
                        type="number"
                        value={editingPlanAmount ?? ""}
                        onChange={(e) => setEditingPlanAmount(e.target.value === "" ? "" : Number(e.target.value))}
                        className="w-full bg-[#08080c] border border-[#262636] px-3 py-2 rounded-xl text-white font-mono focus:border-[#c8923a]"
                        placeholder="e.g. 5000"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-gray-400 font-semibold">Amount Paid (₹)</label>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingAmountPaid(planTotal);
                            setEditingPaymentStatus("PAID");
                            setEditingWorkflow((prev) =>
                              prev.map((st) => (st.stepNumber === 1 ? { ...st, status: "COMPLETED" } : st))
                            );
                          }}
                          className="text-[10px] text-emerald-400 hover:underline font-bold"
                        >
                          Full Paid
                        </button>
                      </div>
                      <input
                        type="number"
                        value={editingAmountPaid ?? ""}
                        onChange={(e) => {
                          const val = e.target.value === "" ? "" : Number(e.target.value);
                          setEditingAmountPaid(val);
                          const num = Number(val || 0);
                          const tot = Number(editingPlanAmount || 0);
                          if (num >= tot && tot > 0) {
                            setEditingPaymentStatus("PAID");
                            setEditingWorkflow((prev) =>
                              prev.map((st) => (st.stepNumber === 1 ? { ...st, status: "COMPLETED" } : st))
                            );
                          } else if (num > 0) {
                            setEditingPaymentStatus("IN_PROGRESS");
                            setEditingWorkflow((prev) =>
                              prev.map((st) => (st.stepNumber === 1 ? { ...st, status: "IN_PROGRESS" } : st))
                            );
                          } else {
                            setEditingPaymentStatus("PENDING");
                            setEditingWorkflow((prev) =>
                              prev.map((st) => (st.stepNumber === 1 ? { ...st, status: "PENDING" } : st))
                            );
                          }
                        }}
                        className="w-full bg-[#08080c] border border-[#262636] px-3 py-2 rounded-xl text-emerald-300 font-mono font-bold focus:border-emerald-500"
                        placeholder="e.g. 2500"
                      />
                    </div>
                  </div>
                </div>

                {/* Step 2 (ISBN) or Step 3 (Book Page) Info Notice Banner */}
                {(isStep2Completed || isStep3Completed) && (
                  <div className="bg-amber-950/30 border border-amber-500/40 p-3 rounded-2xl flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 text-amber-300 font-medium">
                      <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>
                        {isStep2Completed && isStep3Completed ? (
                          <>
                            <strong>Details Required:</strong> ISBN Generation (Step 2) & Book Page Count (Step 3) are
                            COMPLETED. Please verify values below.
                          </>
                        ) : isStep2Completed ? (
                          <>
                            <strong>ISBN Generation Active:</strong> Step 2 is set to COMPLETED. Please enter or verify
                            the assigned ISBN number below.
                          </>
                        ) : (
                          <>
                            <strong>Book Page Count Active:</strong> Step 3 is set to COMPLETED. Please enter or verify
                            the book's total page count below.
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                )}

                {/* 9 Workflow Execution Steps */}
                <div className="space-y-3 text-xs">
                  <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">
                    9 Workflow Execution Steps
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {editingWorkflow.map((st, idx) => {
                      const isPaymentStep = st.stepNumber === 1;
                      const isIsbnStep = st.stepNumber === 2;
                      const isPageStep = st.stepNumber === 3;
                      const isCompleted = st.status === "COMPLETED" || st.status === "Completed";
                      const isInProgress = st.status === "IN_PROGRESS" || st.status === "In Progress";
                      const isHighlighted = (isIsbnStep || isPageStep) && isCompleted;

                      return (
                        <div
                          key={st.stepNumber}
                          className={`bg-[#08080c] p-3 rounded-xl border ${
                            isHighlighted
                              ? "border-amber-500/70 ring-1 ring-amber-500/30"
                              : "border-[#1e1e2d]"
                          } space-y-2`}
                        >
                          <div className="flex items-center justify-between">
                            <p className="font-bold text-[#f3c06b]">
                              {st.stepNumber}. {st.name}
                            </p>
                            {isPaymentStep && (
                              <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                                PAYMENT
                              </span>
                            )}
                            {isIsbnStep && (
                              <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                                ISBN
                              </span>
                            )}
                            {isPageStep && (
                              <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">
                                PAGES
                              </span>
                            )}
                          </div>

                          <select
                            value={st.status}
                            onChange={(e) => {
                              const newStatus = e.target.value;
                              setEditingWorkflow((prev) =>
                                prev.map((item, i) => (i === idx ? { ...item, status: newStatus } : item))
                              );
                              if (isPaymentStep) {
                                setEditingPaymentStatus(newStatus);
                                if (newStatus === "COMPLETED") {
                                  setEditingAmountPaid(planTotal);
                                } else if (newStatus === "PENDING") {
                                  setEditingAmountPaid(0);
                                }
                              }
                            }}
                            className="w-full bg-[#12121c] border border-[#262636] px-2 py-1.5 rounded-lg text-white text-[11px] font-semibold focus:border-[#c8923a]"
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="IN_PROGRESS">IN_PROGRESS</option>
                            <option value="COMPLETED">COMPLETED</option>
                          </select>

                          {/* Step 1 Payment Status Helper */}
                          {isPaymentStep && (isInProgress || isCompleted) && (
                            <div className="pt-1 text-[10px] text-gray-400">
                              <span className="text-emerald-400 font-bold">Paid: ₹{paidTotal}</span>
                              {pendingDue > 0 ? (
                                <span className="text-rose-400 font-semibold ml-1.5">• Due: ₹{pendingDue}</span>
                              ) : (
                                <span className="text-emerald-400 font-semibold ml-1.5">• Clear</span>
                              )}
                            </div>
                          )}

                          {/* Step 2 ISBN Entry Field */}
                          {isIsbnStep && (
                            <div className="pt-1">
                              <label className="block text-[10px] text-gray-400 font-semibold mb-1 flex items-center justify-between">
                                <span>
                                  ISBN Number {isCompleted && <span className="text-amber-400 font-bold">*</span>}:
                                </span>
                                {isCompleted && !st.value && (
                                  <span className="text-[9px] text-amber-400 font-bold">Required</span>
                                )}
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. 978-81-98765-43-2"
                                value={st.value || ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setEditingWorkflow((prev) =>
                                    prev.map((item, i) => (i === idx ? { ...item, value: val } : item))
                                  );
                                }}
                                className={`w-full bg-[#12121c] border ${
                                  isCompleted && !st.value
                                    ? "border-amber-500/80 focus:border-amber-400"
                                    : "border-[#262636] focus:border-[#c8923a]"
                                } px-2 py-1.5 rounded-lg text-white text-xs placeholder:text-gray-600 focus:outline-none font-mono`}
                              />
                              {isCompleted && !st.value && (
                                <p className="text-[10px] text-amber-400 mt-1">Please enter ISBN number</p>
                              )}
                            </div>
                          )}

                          {/* Step 3 Book Page Count Entry Field */}
                          {isPageStep && (
                            <div className="pt-1">
                              <label className="block text-[10px] text-gray-400 font-semibold mb-1 flex items-center justify-between">
                                <span>
                                  Total Page Count {isCompleted && <span className="text-amber-400 font-bold">*</span>}:
                                </span>
                                {isCompleted && !st.value && (
                                  <span className="text-[9px] text-amber-400 font-bold">Required</span>
                                )}
                              </label>
                              <input
                                type="number"
                                min="1"
                                placeholder="e.g. 150"
                                value={st.value || ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setEditingWorkflow((prev) =>
                                    prev.map((item, i) => (i === idx ? { ...item, value: val } : item))
                                  );
                                }}
                                className={`w-full bg-[#12121c] border ${
                                  isCompleted && !st.value
                                    ? "border-amber-500/80 focus:border-amber-400"
                                    : "border-[#262636] focus:border-[#c8923a]"
                                } px-2 py-1.5 rounded-lg text-white text-xs placeholder:text-gray-600 focus:outline-none font-mono`}
                              />
                              {isCompleted && !st.value && (
                                <p className="text-[10px] text-amber-400 mt-1">Please enter total pages</p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Footer (Fixed Bottom) */}
              <div className="flex justify-end gap-3 p-4 sm:p-5 border-t border-[#222232] shrink-0 bg-[#0c0c12]">
                <button
                  type="button"
                  onClick={() => setSelectedAuthor(null)}
                  className="px-4 py-2.5 bg-gray-800 text-xs font-semibold rounded-xl text-gray-300 hover:bg-gray-700 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveWorkflow(selectedAuthor.id || selectedAuthor._id || selectedAuthor.authorId)}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#d99b38] to-[#f3c06b] hover:from-[#e5a845] hover:to-[#fbd080] text-xs font-extrabold rounded-xl text-black shadow transition cursor-pointer"
                >
                  Save Progress {selectedWorkflowBookTitle ? `for “${selectedWorkflowBookTitle}”` : ""}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL: WORKFLOW SAVE SUCCESS & EXECUTION MANAGER NOTICE */}
      {workflowSuccessNotice && (
        <div
          className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto"
          data-lenis-prevent="true"
          onClick={() => setWorkflowSuccessNotice(null)}
        >
          <div
            className="bg-[#0f0f16] border border-[#c8923a]/50 w-full max-w-lg p-6 sm:p-7 rounded-3xl space-y-5 shadow-2xl my-auto text-center relative"
            data-lenis-prevent="true"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setWorkflowSuccessNotice(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Glowing Success Icon */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-amber-500/10 border border-emerald-500/40 mx-auto flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/10">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>

            {/* Title & Description */}
            <div className="space-y-1.5">
              <h3 className="font-serif text-xl font-extrabold text-white">
                Progress Saved Successfully!
              </h3>
              <p className="text-xs text-gray-300">
                Workflow steps and financials updated for{" "}
                <span className="text-[#f3c06b] font-bold">“{workflowSuccessNotice.bookTitle}”</span> ({workflowSuccessNotice.authorName}).
              </p>
            </div>

            {/* Prominent Execution Manager Notice Banner */}
            <div className="p-4 bg-gradient-to-r from-amber-500/10 via-[#181826] to-amber-500/10 border border-[#c8923a]/40 rounded-2xl text-left space-y-2">
              <div className="flex items-center gap-2 text-[#f3c06b] font-bold text-xs">
                <Briefcase className="w-4 h-4 text-[#f3c06b] shrink-0" />
                <span>Notice for Future Updates:</span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                For future updates, comprehensive roadmap management, print counts, delivery tracking, and reprint requests, please refer to the <strong className="text-white font-bold">Execution Manager</strong>.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setWorkflowSuccessNotice(null)}
                className="w-full sm:w-auto px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-xs font-semibold rounded-xl text-gray-300 transition cursor-pointer"
              >
                Done
              </button>
              <button
                type="button"
                onClick={() => {
                  setWorkflowSuccessNotice(null);
                  setActiveTab("execution");
                }}
                className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-[#d99b38] to-[#f3c06b] hover:from-[#e5a845] hover:to-[#fbd080] text-black font-extrabold text-xs rounded-xl shadow-lg shadow-[#c8923a]/20 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Briefcase className="w-4 h-4 text-black" />
                <span>Go to Execution Manager</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT SALE */}
      {showAddSaleModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto"
          data-lenis-prevent="true"
        >
          <div
            className="bg-[#0f0f16] border border-[#c8923a]/40 w-full max-w-md p-6 rounded-3xl space-y-4 shadow-2xl my-auto max-h-[90vh] overflow-y-auto custom-scrollbar gold-scrollbar"
            data-lenis-prevent="true"
          >
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
                <label className="block text-xs text-gray-400 mb-1 font-medium">Select Author</label>
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
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto"
          data-lenis-prevent="true"
        >
          <div
            className="bg-[#0f0f16] border border-[#c8923a]/40 w-full max-w-md p-6 rounded-3xl space-y-4 shadow-2xl my-auto max-h-[90vh] overflow-y-auto custom-scrollbar gold-scrollbar"
            data-lenis-prevent="true"
          >
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
        <div
          className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto"
          data-lenis-prevent="true"
        >
          <div
            className="bg-[#0f0f16] border border-[#c8923a]/50 w-full max-w-xl p-6 rounded-3xl space-y-5 shadow-2xl my-auto max-h-[90vh] overflow-y-auto custom-scrollbar gold-scrollbar"
            data-lenis-prevent="true"
          >
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
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar gold-scrollbar" data-lenis-prevent="true">
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
          data-lenis-prevent="true"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0e0e14] border border-[#c8923a]/50 w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 my-auto max-h-[90vh] overflow-y-auto custom-scrollbar gold-scrollbar"
            data-lenis-prevent="true"
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
                    value={editAuthorForm.planAmount ?? ""}
                    onChange={(e) => setEditAuthorForm({ ...editAuthorForm, planAmount: e.target.value === "" ? "" : Number(e.target.value) })}
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
                    value={editAuthorForm.amountPaid ?? ""}
                    onChange={(e) => setEditAuthorForm({ ...editAuthorForm, amountPaid: e.target.value === "" ? "" : Number(e.target.value) })}
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

      {/* MODAL: HELP & DASHBOARD DOCUMENTATION GUIDE */}
      <PublisherHelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        onSelectTab={(tab) => setActiveTab(tab)}
      />
    </div>
  );
}
