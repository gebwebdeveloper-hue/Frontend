import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ShieldCheck,
  LogOut,
  Loader2,
  AlertCircle,
  Search,
  CheckCircle2,
  Truck,
  Box,
  Package,
  MapPin,
  FileText,
  DollarSign,
  BookOpen,
  Calendar,
  User,
  Phone,
  Mail,
  ExternalLink,
  X,
  KeyRound,
  ArrowRight,
  Pencil,
  Trash2,
  RotateCcw,
  RefreshCw
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import PageTransition from "../components/PageTransition.jsx";
import AdminNavbar from "../components/AdminNavbar.jsx";
import { API_BASE } from "../config.js";

export default function AdminPurchasesPage() {
  const location = useLocation();

  // Auth state
  const [user, setUser] = useState(null);
  const [step, setStep] = useState("check-auth"); // check-auth, login-email, login-otp, dashboard
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [authError, setAuthError] = useState("");
  const [submittingAuth, setSubmittingAuth] = useState(false);

  // Purchases list state
  const [purchasesList, setPurchasesList] = useState([]);
  const [loadingPurchases, setLoadingPurchases] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [formatFilter, setFormatFilter] = useState("all"); // 'all', 'ebook', 'paperback', 'hardcover', 'story'

  // Shipment tracking modal state
  const [shipmentModalOpen, setShipmentModalOpen] = useState(false);
  const [selectedShipmentPurchase, setSelectedShipmentPurchase] = useState(null);
  const [shipmentForm, setShipmentForm] = useState({
    shipmentStatus: "processing",
    courierService: "",
    trackingNumber: "",
    trackingUrl: "",
    currentLocation: "",
    estimatedDeliveryDate: "",
    note: ""
  });
  const [updatingShipment, setUpdatingShipment] = useState(false);

  // Edit transaction modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [editForm, setEditForm] = useState({
    amount: "",
    status: "approved",
    razorpayPaymentId: "",
    adminNote: ""
  });
  const [updatingEdit, setUpdatingEdit] = useState(false);

  // Refund modal state
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [selectedRefundPurchase, setSelectedRefundPurchase] = useState(null);
  const [refundReason, setRefundReason] = useState("");
  const [processingRefund, setProcessingRefund] = useState(false);

  const handleOpenRefundModal = (purchase) => {
    setSelectedRefundPurchase(purchase);
    setRefundReason("");
    setRefundModalOpen(true);
  };

  const handleExecuteRefund = async (e) => {
    e.preventDefault();
    if (!selectedRefundPurchase) return;
    setProcessingRefund(true);

    const isStory = selectedRefundPurchase.itemType === "story" || selectedRefundPurchase.format === "story";
    const endpoint = isStory
      ? `${API_BASE}/newsletter/admin/access-requests/${selectedRefundPurchase._id}/refund`
      : `${API_BASE}/purchase/${selectedRefundPurchase._id}/refund`;

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ refundReason })
      });
      const data = await res.json();

      if (data.success) {
        setPurchasesList((prev) =>
          prev.map((p) => (p._id === selectedRefundPurchase._id ? { ...p, status: "cancelled", adminNote: `[REFUNDED] ${refundReason}` } : p))
        );
        setRefundModalOpen(false);
        setPopupMessage({
          title: "💸 Refund Processed!",
          description: data.message || `Refund of ₹${selectedRefundPurchase.amount} issued successfully!`
        });
        setShowSuccessPopup(true);
      } else {
        alert(data.message || "Failed to process refund.");
      }
    } catch {
      alert("Error initiating refund request.");
    } finally {
      setProcessingRefund(false);
    }
  };

  // Success popup message state
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState({ title: "", description: "" });

  useEffect(() => {
    fetch(`${API_BASE}/auth/me`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user && data.user.role === "admin") {
          setUser(data.user);
          setStep("dashboard");
          fetchPurchases();
        } else {
          setStep("login-email");
        }
      })
      .catch(() => setStep("login-email"));
  }, [location.pathname]);

  useEffect(() => {
    if (shipmentModalOpen || editModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [shipmentModalOpen, editModalOpen]);

  const fetchPurchases = () => {
    setLoadingPurchases(true);
    Promise.all([
      fetch(`${API_BASE}/purchase/admin`, { credentials: "include" }).then((r) => r.json()),
      fetch(`${API_BASE}/newsletter/admin/access-requests`, { credentials: "include" }).then((r) => r.json())
    ])
      .then(([bookRes, storyRes]) => {
        const bookList = (bookRes.success && Array.isArray(bookRes.purchases))
          ? bookRes.purchases.map(p => ({ ...p, itemType: "book" }))
          : [];

        const storyList = (storyRes.success && Array.isArray(storyRes.requests))
          ? storyRes.requests.map(s => ({
              _id: s._id,
              itemType: "story",
              format: "story",
              amount: s.amount,
              status: s.status,
              adminNote: s.adminNote,
              createdAt: s.createdAt,
              razorpayPaymentId: s.razorpayPaymentId || s.transactionId,
              razorpayOrderId: s.razorpayOrderId,
              transactionNumber: s.transactionId,
              bookId: {
                title: s.newsletterId?.title || "Short Story",
                author: s.newsletterId?.author || "Lekhok Tripura",
                cover: s.newsletterId?.cover
              },
              userId: {
                name: s.userName,
                email: s.userEmail,
                phone: s.userPhone
              }
            }))
          : [];

        const combined = [...bookList, ...storyList].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setPurchasesList(combined);
      })
      .catch((err) => console.error("Error fetching purchases & story requests:", err))
      .finally(() => setLoadingPurchases(false));
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
            fetchPurchases();
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

  const handleOpenShipmentModal = (purchase) => {
    setSelectedShipmentPurchase(purchase);
    setShipmentForm({
      shipmentStatus: purchase.shipmentStatus || "processing",
      courierService: purchase.courierService || "",
      trackingNumber: purchase.trackingNumber || "",
      trackingUrl: purchase.trackingUrl || "",
      currentLocation: purchase.currentLocation || "",
      estimatedDeliveryDate: purchase.estimatedDeliveryDate ? new Date(purchase.estimatedDeliveryDate).toISOString().split("T")[0] : "",
      note: ""
    });
    setShipmentModalOpen(true);
  };

  const handleSaveShipment = (e) => {
    e.preventDefault();
    if (!selectedShipmentPurchase) return;

    setUpdatingShipment(true);
    fetch(`${API_BASE}/purchase/${selectedShipmentPurchase._id}/shipment`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(shipmentForm)
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setShipmentModalOpen(false);
          setPopupMessage({
            title: "Shipment Updated!",
            description: "Courier tracking details & status have been updated successfully."
          });
          setShowSuccessPopup(true);
          fetchPurchases();
        } else {
          alert(data.message || "Failed to update shipment status.");
        }
      })
      .catch(() => alert("Error updating shipment."))
      .finally(() => setUpdatingShipment(false));
  };

  const handlePushToShiprocket = async (purchaseId) => {
    try {
      const res = await fetch(`${API_BASE}/purchase/${purchaseId}/sync-shiprocket`, {
        method: "POST",
        credentials: "include"
      });
      const data = await res.json();
      if (data.success) {
        setPopupMessage({
          title: "Shiprocket Order Created! 🚀",
          description: `Order successfully created in Shiprocket! Order ID: ${data.shiprocket?.orderId || "Synced"}`
        });
        setShowSuccessPopup(true);
        fetchPurchases();
      } else {
        alert(data.message || "Failed to sync order to Shiprocket.");
      }
    } catch {
      alert("Network error pushing order to Shiprocket.");
    }
  };

  const handleAutoSyncTracking = async (purchaseId) => {
    try {
      const res = await fetch(`${API_BASE}/purchase/${purchaseId}/auto-sync-tracking`, {
        method: "POST",
        credentials: "include"
      });
      const data = await res.json();
      if (data.success && data.purchase) {
        const p = data.purchase;
        setShipmentForm({
          shipmentStatus: p.shipmentStatus || "processing",
          courierService: p.courierService || "",
          trackingNumber: p.trackingNumber || "",
          trackingUrl: p.trackingUrl || "",
          currentLocation: p.currentLocation || "",
          estimatedDeliveryDate: p.estimatedDeliveryDate ? new Date(p.estimatedDeliveryDate).toISOString().split("T")[0] : "",
          note: ""
        });
        setPopupMessage({
          title: "Tracking Auto-Synced! 🔄",
          description: `Fetched live tracking from Shiprocket. Courier: ${p.courierService || "Synced"}, AWB: ${p.trackingNumber || "N/A"}`
        });
        setShowSuccessPopup(true);
        fetchPurchases();
      } else {
        alert(data.message || "Failed to auto-sync tracking.");
      }
    } catch {
      alert("Network error fetching live Shiprocket tracking.");
    }
  };

  const handleOpenEditModal = (purchase) => {
    setEditingTransaction(purchase);
    setEditForm({
      amount: String(purchase.amount || "0"),
      status: purchase.status || "approved",
      razorpayPaymentId: purchase.razorpayPaymentId || purchase.transactionNumber || "",
      adminNote: purchase.adminNote || ""
    });
    setEditModalOpen(true);
  };

  const handleSaveEditTransaction = (e) => {
    e.preventDefault();
    if (!editingTransaction) return;

    setUpdatingEdit(true);
    const isStory = editingTransaction.itemType === "story";
    const url = isStory
      ? `${API_BASE}/newsletter/admin/access-requests/${editingTransaction._id}`
      : `${API_BASE}/purchase/${editingTransaction._id}`;

    fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        amount: Number(editForm.amount),
        status: editForm.status,
        razorpayPaymentId: editForm.razorpayPaymentId,
        transactionNumber: editForm.razorpayPaymentId,
        transactionId: editForm.razorpayPaymentId,
        adminNote: editForm.adminNote
      })
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setEditModalOpen(false);
          setPopupMessage({
            title: "Transaction Updated!",
            description: "Transaction details have been updated successfully."
          });
          setShowSuccessPopup(true);
          fetchPurchases();
        } else {
          alert(data.message || "Failed to update transaction.");
        }
      })
      .catch(() => alert("Error updating transaction."))
      .finally(() => setUpdatingEdit(false));
  };

  const handleDeleteTransaction = (purchase) => {
    if (!window.confirm("Are you sure you want to permanently delete this transaction record?")) return;

    const isStory = purchase.itemType === "story";
    const url = isStory
      ? `${API_BASE}/newsletter/admin/access-requests/${purchase._id}`
      : `${API_BASE}/purchase/${purchase._id}`;

    fetch(url, {
      method: "DELETE",
      credentials: "include"
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setPopupMessage({
            title: "Transaction Deleted!",
            description: "The transaction record has been permanently deleted."
          });
          setShowSuccessPopup(true);
          fetchPurchases();
        } else {
          alert(data.message || "Failed to delete transaction.");
        }
      })
      .catch(() => alert("Error deleting transaction."));
  };

  // Metrics Calculations
  const metrics = useMemo(() => {
    const approvedPurchases = purchasesList.filter((p) => p.status === "approved");
    const totalRevenue = approvedPurchases.reduce((acc, p) => acc + (p.amount || 0), 0);
    const totalCount = approvedPurchases.length;
    const ebookCount = approvedPurchases.filter((p) => p.format === "ebook").length;
    const storyCount = approvedPurchases.filter((p) => p.itemType === "story" || p.format === "story").length;
    const physicalCount = approvedPurchases.filter((p) => p.format === "paperback" || p.format === "hardcover").length;

    return { totalRevenue, totalCount, ebookCount, storyCount, physicalCount };
  }, [purchasesList]);

  // Filtered Purchases
  const filteredPurchases = useMemo(() => {
    return purchasesList.filter((p) => {
      // Format Filter
      if (formatFilter === "ebook" && p.format !== "ebook") return false;
      if (formatFilter === "story" && p.itemType !== "story" && p.format !== "story") return false;
      if (formatFilter === "paperback" && p.format !== "paperback") return false;
      if (formatFilter === "hardcover" && p.format !== "hardcover") return false;

      // Search Query Filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const userName = (p.userId?.name || "").toLowerCase();
      const userEmail = (p.userId?.email || "").toLowerCase();
      const userPhone = (p.userId?.phone || "").toLowerCase();
      const bookTitle = (p.bookId?.title || "").toLowerCase();
      const razorpayPaymentId = (p.razorpayPaymentId || p.transactionNumber || "").toLowerCase();
      const razorpayOrderId = (p.razorpayOrderId || "").toLowerCase();

      return (
        userName.includes(q) ||
        userEmail.includes(q) ||
        userPhone.includes(q) ||
        bookTitle.includes(q) ||
        razorpayPaymentId.includes(q) ||
        razorpayOrderId.includes(q)
      );
    });
  }, [purchasesList, searchQuery, formatFilter]);

  return (
    <PageTransition>
      <div className="min-h-screen px-4 sm:px-6 py-20 sm:py-28 relative overflow-hidden bg-black text-white">
        {/* Background glow */}
        <div className="absolute inset-0 animated-gradient opacity-80" />
        <div className="noise" />
        <div className="absolute left-0 top-0 h-[600px] w-[600px] rounded-full bg-cyan-500/5 blur-[180px] pointer-events-none" />
        <div className="absolute right-0 bottom-0 h-[600px] w-[600px] rounded-full bg-fuchsia-500/5 blur-[180px] pointer-events-none" />

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
                  <ShieldCheck size={24} />
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
              {/* Responsive Admin Navbar */}
              <AdminNavbar onLogoutSuccess={handleLogout} />

              {/* Title Section */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-white flex flex-wrap items-center gap-3">
                  Razorpay Payment History
                  <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-extrabold uppercase text-cyan-300">
                    100% Automated
                  </span>
                </h1>
                <p className="mt-1 text-sm text-white/55">
                  Review verified automated Razorpay reader transactions, edit or delete records &amp; manage physical shipment tracking.
                </p>
              </div>

              {/* Metrics Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-6 backdrop-blur-xl">
                  <div className="flex items-center justify-between text-emerald-400 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">Total Revenue</span>
                    <span className="text-xl font-extrabold leading-none text-emerald-400">₹</span>
                  </div>
                  <h3 className="text-3xl font-black text-white">₹{metrics.totalRevenue}</h3>
                  <p className="text-xs text-white/40 mt-1">Verified Razorpay Payments</p>
                </div>

                <div className="rounded-3xl border border-cyan-500/20 bg-cyan-500/5 p-6 backdrop-blur-xl">
                  <div className="flex items-center justify-between text-cyan-400 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">Successful Orders</span>
                    <CheckCircle2 size={20} />
                  </div>
                  <h3 className="text-3xl font-black text-white">{metrics.totalCount}</h3>
                  <p className="text-xs text-white/40 mt-1">Instant Verified Access</p>
                </div>

                <div className="rounded-3xl border border-indigo-500/20 bg-indigo-500/5 p-6 backdrop-blur-xl">
                  <div className="flex items-center justify-between text-indigo-400 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">Digital E-Books</span>
                    <BookOpen size={20} />
                  </div>
                  <h3 className="text-3xl font-black text-white">{metrics.ebookCount}</h3>
                  <p className="text-xs text-white/40 mt-1">Instant Reader Unlocks</p>
                </div>

                <div className="rounded-3xl border border-fuchsia-500/20 bg-fuchsia-500/5 p-6 backdrop-blur-xl">
                  <div className="flex items-center justify-between text-fuchsia-400 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">Stories & Physical</span>
                    <Sparkles size={20} />
                  </div>
                  <h3 className="text-3xl font-black text-white">{metrics.storyCount + metrics.physicalCount}</h3>
                  <p className="text-xs text-white/40 mt-1">{metrics.storyCount} Stories · {metrics.physicalCount} Physical</p>
                </div>
              </div>

              {/* Filters & Search Toolbar */}
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Search Bar */}
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 h-4 w-4" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by reader, email, book or payment ID..."
                    className="w-full rounded-2xl border border-white/10 bg-white/5 pl-11 pr-4 py-3 text-xs text-white placeholder-white/30 focus:border-cyan-400/50 focus:outline-none"
                  />
                </div>

                {/* Format Filter Tabs */}
                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto scrollbar-none">
                  <button
                    onClick={() => setFormatFilter("all")}
                    className={`rounded-full px-4 py-2 text-xs font-bold transition shrink-0 ${
                      formatFilter === "all"
                        ? "bg-cyan-400 text-black shadow-glow"
                        : "bg-white/5 border border-white/10 text-white/70 hover:bg-white/10"
                    }`}
                  >
                    All Formats ({purchasesList.length})
                  </button>
                  <button
                    onClick={() => setFormatFilter("ebook")}
                    className={`rounded-full px-4 py-2 text-xs font-bold transition shrink-0 ${
                      formatFilter === "ebook"
                        ? "bg-cyan-400 text-black shadow-glow"
                        : "bg-white/5 border border-white/10 text-white/70 hover:bg-white/10"
                    }`}
                  >
                    E-Books ({metrics.ebookCount})
                  </button>
                  <button
                    onClick={() => setFormatFilter("story")}
                    className={`rounded-full px-4 py-2 text-xs font-bold transition shrink-0 ${
                      formatFilter === "story"
                        ? "bg-fuchsia-400 text-black shadow-glow"
                        : "bg-white/5 border border-white/10 text-white/70 hover:bg-white/10"
                    }`}
                  >
                    Short Stories ({metrics.storyCount})
                  </button>
                  <button
                    onClick={() => setFormatFilter("paperback")}
                    className={`rounded-full px-4 py-2 text-xs font-bold transition shrink-0 ${
                      formatFilter === "paperback"
                        ? "bg-amber-400 text-black shadow-glow"
                        : "bg-white/5 border border-white/10 text-white/70 hover:bg-white/10"
                    }`}
                  >
                    Paperbacks
                  </button>
                  <button
                    onClick={() => setFormatFilter("hardcover")}
                    className={`rounded-full px-4 py-2 text-xs font-bold transition shrink-0 ${
                      formatFilter === "hardcover"
                        ? "bg-purple-400 text-black shadow-glow"
                        : "bg-white/5 border border-white/10 text-white/70 hover:bg-white/10"
                    }`}
                  >
                    Hardcovers
                  </button>
                </div>
              </div>

              {/* Transactions List */}
              {loadingPurchases ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="h-10 w-10 animate-spin text-cyan-300 mb-4" />
                  <p className="text-white/60 text-sm">Loading Razorpay transaction records...</p>
                </div>
              ) : filteredPurchases.length === 0 ? (
                <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-12 text-center">
                  <p className="text-white/50 text-base">No Razorpay transactions found matching your filter.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredPurchases.map((purchase) => {
                    const book = purchase.bookId || {};
                    const reader = purchase.userId || {};
                    const isPhysical = purchase.format === "paperback" || purchase.format === "hardcover";
                    const isStory = purchase.itemType === "story" || purchase.format === "story";
                    const addr = purchase.deliveryAddress || {};

                    return (
                      <motion.div
                        key={purchase._id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl hover:border-white/20 transition-all shadow-xl"
                      >
                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                          {/* Book/Story Details & Format */}
                          <div className="flex items-center gap-4 min-w-0">
                            {isStory ? (
                              <div className="h-16 w-12 rounded-xl bg-fuchsia-950/40 border border-fuchsia-500/30 flex flex-col items-center justify-center text-fuchsia-300 font-bold text-xs shrink-0">
                                <Sparkles size={18} />
                                <span className="text-[8px] uppercase mt-1">Story</span>
                              </div>
                            ) : book.cover?.url ? (
                              <img
                                src={book.cover.url.startsWith("http") ? book.cover.url : `${API_BASE.replace("/api", "")}${book.cover.url}`}
                                alt={book.title}
                                className="h-16 w-12 rounded-xl object-cover border border-white/10 shrink-0"
                              />
                            ) : (
                              <div className="h-16 w-12 rounded-xl bg-cyan-950/40 border border-cyan-500/20 flex items-center justify-center text-cyan-300 font-bold text-xs shrink-0">
                                BOOK
                              </div>
                            )}

                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span
                                  className={`rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider border ${
                                    isStory
                                      ? "bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/30"
                                      : purchase.format === "paperback"
                                      ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                                      : purchase.format === "hardcover"
                                      ? "bg-purple-500/10 text-purple-300 border-purple-500/30"
                                      : "bg-cyan-500/10 text-cyan-300 border-cyan-500/30"
                                  }`}
                                >
                                  {isStory ? "Short Story" : purchase.format || "ebook"}
                                </span>

                                <span
                                  className={`rounded-full border px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider flex items-center gap-1 ${
                                    purchase.status === "approved"
                                      ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                                      : purchase.status === "pending"
                                      ? "bg-amber-500/15 border-amber-500/30 text-amber-300"
                                      : purchase.status === "cancelled"
                                      ? "bg-zinc-800/80 border-zinc-700 text-zinc-400"
                                      : "bg-red-500/15 border-red-500/30 text-red-300"
                                  }`}
                                >
                                  {purchase.status === "cancelled" ? (
                                    <>
                                      <X size={11} className="text-zinc-400" /> Cancelled / Unpaid
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle2 size={11} /> {purchase.status || "approved"}
                                    </>
                                  )}
                                </span>
                              </div>

                              <h3 className="text-base font-bold text-white truncate">{book.title || "Item"}</h3>
                              <p className="text-xs text-white/50">by {book.author || "Lekhok Tripura"}</p>
                            </div>
                          </div>

                          {/* Reader Profile Info */}
                          <div className="flex flex-col gap-1 text-xs text-white/70 min-w-[200px]">
                            <div className="flex items-center gap-1.5 font-semibold text-white">
                              <User size={13} className="text-cyan-400" />
                              <span>{reader.name || "Reader"}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-white/60">
                              <Mail size={13} className="text-cyan-400" />
                              <span className="truncate max-w-[180px]">{reader.email}</span>
                            </div>
                            {reader.phone && (
                              <div className="flex items-center gap-1.5 text-white/60">
                                <Phone size={13} className="text-cyan-400" />
                                <span>{reader.phone}</span>
                              </div>
                            )}
                          </div>

                          {/* Razorpay Transaction Ref */}
                          <div className="flex flex-col gap-1 text-xs">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">Razorpay Payment Reference</span>
                            <div className="font-mono text-cyan-300 font-bold text-xs">
                              {purchase.razorpayPaymentId || purchase.transactionNumber || "pay_verified"}
                            </div>
                            {purchase.razorpayOrderId && (
                              <div className="font-mono text-white/40 text-[10px]">
                                Order: {purchase.razorpayOrderId}
                              </div>
                            )}
                            <div className="text-[10px] text-white/40 flex items-center gap-1 mt-0.5">
                              <Calendar size={11} />
                              {new Date(purchase.createdAt).toLocaleString("en-IN")}
                            </div>
                          </div>

                          {/* Amount Paid, Invoice, Edit & Delete */}
                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <div className="text-xl font-black text-emerald-400">
                              ₹{purchase.amount}
                            </div>

                            <div className="flex items-center gap-1.5">
                              {!isStory && (
                                <a
                                  href={`${API_BASE}/purchase/${purchase._id}/invoice`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/10 hover:text-white transition"
                                  title="View Invoice"
                                >
                                  <FileText size={13} className="text-cyan-400" /> Invoice
                                  <ExternalLink size={11} className="text-white/40" />
                                </a>
                              )}

                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(purchase)}
                                className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-500/30 transition"
                                title="Edit Transaction Details"
                              >
                                <Pencil size={13} /> Edit
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenRefundModal(purchase)}
                                disabled={purchase.status === "cancelled"}
                                className={`flex items-center gap-1 rounded-xl border px-2.5 py-1.5 text-xs font-semibold transition ${
                                  purchase.status === "cancelled"
                                    ? "border-zinc-800 bg-zinc-900/50 text-zinc-600 cursor-not-allowed"
                                    : "border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
                                }`}
                                title="Issue Razorpay Refund"
                              >
                                <RotateCcw size={13} /> {purchase.status === "cancelled" ? "Refunded" : "Refund"}
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteTransaction(purchase)}
                                className="flex items-center gap-1 rounded-xl border border-red-500/20 bg-red-500/10 px-2.5 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition"
                                title="Delete Transaction Record"
                              >
                                <Trash2 size={13} /> Delete
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Delivery Address & Shipment Controls for Physical Books */}
                        {isPhysical && (
                          <div className="mt-5 border-t border-white/10 pt-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white/[0.015] p-4 rounded-2xl">
                            <div className="text-xs text-white/70 space-y-1">
                              <p className="font-bold text-white flex items-center gap-1.5">
                                <MapPin size={14} className="text-fuchsia-400" /> Delivery Address:
                              </p>
                              <p className="text-white/60">
                                {addr.co ? `C/O ${addr.co}, ` : ""}
                                {addr.nearbyLocation ? `Landmark: ${addr.nearbyLocation}, ` : ""}
                                {addr.block ? `Block: ${addr.block}, ` : ""}
                                {addr.district ? `${addr.district}, ` : ""}
                                {addr.postOffice ? `PO: ${addr.postOffice}, ` : ""}
                                {addr.pin ? `PIN: ${addr.pin}` : ""}
                              </p>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              <span
                                className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider border ${
                                  purchase.shipmentStatus === "delivered"
                                    ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                                    : purchase.shipmentStatus === "shipped"
                                    ? "bg-cyan-500/10 text-cyan-300 border-cyan-500/30"
                                    : "bg-amber-500/10 text-amber-300 border-amber-500/30"
                                }`}
                              >
                                {purchase.shipmentStatus || "processing"}
                              </span>

                              <button
                                onClick={() => handleOpenShipmentModal(purchase)}
                                className="flex items-center gap-1.5 rounded-xl bg-fuchsia-500/20 border border-fuchsia-500/30 px-3.5 py-2 text-xs font-bold text-fuchsia-300 hover:bg-fuchsia-500/30 transition"
                              >
                                <Truck size={14} /> Update Tracking
                              </button>

                              {purchase.shiprocketOrderId ? (
                                <span className="flex items-center gap-1 rounded-xl bg-purple-500/20 border border-purple-500/30 px-3 py-1.5 text-xs font-bold text-purple-300">
                                  🚀 Shiprocket #{purchase.shiprocketOrderId}
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handlePushToShiprocket(purchase._id)}
                                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-3.5 py-2 text-xs font-black text-white hover:opacity-90 transition shadow-md"
                                >
                                  <Truck size={14} /> Push to Shiprocket
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* EDIT TRANSACTION MODAL */}
      {createPortal(
        <AnimatePresence>
          {editModalOpen && editingTransaction && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
              onClick={() => setEditModalOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="relative w-full max-w-lg rounded-3xl border border-cyan-500/30 bg-zinc-950 p-6 shadow-glow"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
                  <div className="flex items-center gap-2">
                    <Pencil size={20} className="text-cyan-400" />
                    <h3 className="text-lg font-bold text-white">Edit Transaction Record</h3>
                  </div>
                  <button
                    onClick={() => setEditModalOpen(false)}
                    className="rounded-full p-2 text-white/50 hover:bg-white/10 hover:text-white transition"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleSaveEditTransaction} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1.5">Amount Paid (₹) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={editForm.amount}
                      onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-cyan-400/40 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1.5">Access / Verification Status *</label>
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white focus:border-cyan-400/40 focus:outline-none"
                    >
                      <option value="approved" className="bg-zinc-900 text-white">Approved (Access Unlocked)</option>
                      <option value="pending" className="bg-zinc-900 text-white">Pending Review</option>
                      <option value="cancelled" className="bg-zinc-900 text-white">Cancelled (Payment Cancelled / Abandoned)</option>
                      <option value="rejected" className="bg-zinc-900 text-white">Rejected</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1.5">Razorpay Payment Ref ID / Transaction No.</label>
                    <input
                      type="text"
                      value={editForm.razorpayPaymentId}
                      onChange={(e) => setEditForm({ ...editForm, razorpayPaymentId: e.target.value })}
                      placeholder="pay_..."
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white font-mono placeholder-white/20 focus:border-cyan-400/40 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1.5">Admin Note</label>
                    <textarea
                      rows="2"
                      value={editForm.adminNote}
                      onChange={(e) => setEditForm({ ...editForm, adminNote: e.target.value })}
                      placeholder="Optional note..."
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white placeholder-white/20 focus:border-cyan-400/40 focus:outline-none resize-none"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setEditModalOpen(false)}
                      className="w-1/3 rounded-xl border border-white/10 bg-white/5 py-3 text-xs font-bold text-white/60 hover:bg-white/10 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updatingEdit}
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-cyan-400 py-3 text-xs font-bold text-black hover:bg-cyan-300 transition disabled:opacity-50"
                    >
                      {updatingEdit ? <Loader2 className="h-4 w-4 animate-spin text-black" /> : "Save Changes"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* SHIPMENT UPDATE MODAL */}
      {createPortal(
        <AnimatePresence>
          {shipmentModalOpen && selectedShipmentPurchase && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
              onClick={() => setShipmentModalOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-zinc-950 p-6 shadow-glow"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
                  <div className="flex items-center gap-2">
                    <Truck size={20} className="text-fuchsia-400" />
                    <h3 className="text-lg font-bold text-white">Update Physical Shipment Tracking</h3>
                  </div>
                  <button
                    onClick={() => setShipmentModalOpen(false)}
                    className="rounded-full p-2 text-white/50 hover:bg-white/10 hover:text-white transition"
                  >
                    <X size={18} />
                  </button>
                </div>

                {selectedShipmentPurchase?.shiprocketOrderId && (
                  <div className="mb-4 rounded-2xl border border-purple-500/30 bg-purple-500/10 p-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black text-purple-300">Shiprocket Order Linked</p>
                      <p className="text-[11px] text-white/60">ID: #{selectedShipmentPurchase.shiprocketOrderId}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAutoSyncTracking(selectedShipmentPurchase._id)}
                      className="flex items-center gap-1.5 rounded-xl bg-purple-500 px-3.5 py-1.5 text-xs font-black text-white hover:bg-purple-600 transition shadow-md"
                    >
                      <RefreshCw size={13} /> Auto-Fetch Live Tracking
                    </button>
                  </div>
                )}

                <form onSubmit={handleSaveShipment} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1.5">Shipment Status *</label>
                    <select
                      value={shipmentForm.shipmentStatus}
                      onChange={(e) => setShipmentForm({ ...shipmentForm, shipmentStatus: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white focus:border-cyan-400/40 focus:outline-none"
                    >
                      <option value="processing" className="bg-zinc-900 text-white">Processing (In Warehouse)</option>
                      <option value="shipped" className="bg-zinc-900 text-white">Shipped (Dispatched)</option>
                      <option value="delivered" className="bg-zinc-900 text-white">Delivered (Handed over)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1.5">Courier Partner</label>
                      <input
                        type="text"
                        value={shipmentForm.courierService}
                        onChange={(e) => setShipmentForm({ ...shipmentForm, courierService: e.target.value })}
                        placeholder="e.g. India Post / BlueDart"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white placeholder-white/20 focus:border-cyan-400/40 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1.5">Tracking Number / AWB</label>
                      <input
                        type="text"
                        value={shipmentForm.trackingNumber}
                        onChange={(e) => setShipmentForm({ ...shipmentForm, trackingNumber: e.target.value })}
                        placeholder="e.g. IN123456789"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white placeholder-white/20 focus:border-cyan-400/40 focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1.5">Tracking Link URL</label>
                    <input
                      type="url"
                      value={shipmentForm.trackingUrl}
                      onChange={(e) => setShipmentForm({ ...shipmentForm, trackingUrl: e.target.value })}
                      placeholder="https://www.indiapost.gov.in/..."
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white placeholder-white/20 focus:border-cyan-400/40 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1.5">Current Location</label>
                      <input
                        type="text"
                        value={shipmentForm.currentLocation}
                        onChange={(e) => setShipmentForm({ ...shipmentForm, currentLocation: e.target.value })}
                        placeholder="e.g. Agartala Hub"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white placeholder-white/20 focus:border-cyan-400/40 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1.5">Est. Delivery Date</label>
                      <input
                        type="date"
                        value={shipmentForm.estimatedDeliveryDate}
                        onChange={(e) => setShipmentForm({ ...shipmentForm, estimatedDeliveryDate: e.target.value })}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white focus:border-cyan-400/40 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShipmentModalOpen(false)}
                      className="w-1/3 rounded-xl border border-white/10 bg-white/5 py-3 text-xs font-bold text-white/60 hover:bg-white/10 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updatingShipment}
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-fuchsia-500 py-3 text-xs font-bold text-black hover:bg-fuchsia-400 transition disabled:opacity-50"
                    >
                      {updatingShipment ? <Loader2 className="h-4 w-4 animate-spin text-black" /> : "Save Tracking Details"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* REFUND CONFIRMATION MODAL */}
      {createPortal(
        <AnimatePresence>
          {refundModalOpen && selectedRefundPurchase && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
              onClick={() => setRefundModalOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-md rounded-3xl border border-amber-500/30 bg-zinc-950 p-6 shadow-2xl"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                  <div className="flex items-center gap-2 text-amber-400">
                    <RotateCcw size={18} />
                    <h3 className="text-lg font-black text-white">Process Refund</h3>
                  </div>
                  <button onClick={() => setRefundModalOpen(false)} className="text-white/40 hover:text-white">
                    <X size={18} />
                  </button>
                </div>

                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 mb-4 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-white/50">Item:</span>
                    <span className="font-bold text-white">{selectedRefundPurchase.bookId?.title || "Book Purchase"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Customer:</span>
                    <span className="font-bold text-white">{selectedRefundPurchase.userId?.name || selectedRefundPurchase.userId?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Payment Ref:</span>
                    <span className="font-mono text-cyan-300">{selectedRefundPurchase.razorpayPaymentId || selectedRefundPurchase.transactionNumber || "N/A"}</span>
                  </div>
                  <div className="flex justify-between text-sm border-t border-amber-500/20 pt-2 font-bold">
                    <span className="text-white">Refund Amount:</span>
                    <span className="text-emerald-400">₹{selectedRefundPurchase.amount}</span>
                  </div>
                </div>

                <form onSubmit={handleExecuteRefund} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-white/70 mb-1.5">Refund Reason / Admin Note (Optional)</label>
                    <textarea
                      rows={3}
                      value={refundReason}
                      onChange={(e) => setRefundReason(e.target.value)}
                      placeholder="e.g. Customer requested cancellation / Wrong payment..."
                      className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white placeholder-white/30 focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setRefundModalOpen(false)}
                      className="w-1/3 rounded-xl border border-white/10 bg-white/5 py-3 text-xs font-bold text-white/60 hover:bg-white/10"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={processingRefund}
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 text-xs font-black text-black hover:bg-amber-400 transition disabled:opacity-50"
                    >
                      {processingRefund ? <Loader2 className="h-4 w-4 animate-spin text-black" /> : `Confirm Refund (₹${selectedRefundPurchase.amount})`}
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
    </PageTransition>
  );
}
