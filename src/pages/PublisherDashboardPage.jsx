import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  X,
  BookOpenCheck
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

  // Modals
  const [showAddSaleModal, setShowAddSaleModal] = useState(false);
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
      const res = await fetch(`${API_BASE}/publisher/overview`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setOverviewMetrics(data.metrics);
        setPaymentBreakdown(data.paymentBreakdown || []);
        setAuthorEarnings(data.authorEarnings || []);
        setRawAuthors(data.paymentBreakdown || []);
        setRecentSales(data.recentSales || []);
      }
    } catch (err) {
      console.error("Failed to fetch publisher overview:", err);
    } finally {
      setLoading(false);
    }
  };

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

  const handleAddSale = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/publisher/sales`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(saleForm)
      });
      const data = await res.json();
      if (data.success) {
        setShowAddSaleModal(false);
        fetchPublisherData();
        alert("Sale transaction recorded successfully!");
      } else {
        alert(data.message || "Failed to add sale");
      }
    } catch (err) {
      alert("Error logging sale.");
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

          <div className="mt-6 text-center text-xs text-gray-400 bg-[#14141c] p-3 rounded-xl border border-[#262636]">
            {loginTab === "publisher" ? (
              <span>Publisher access uses Admin credentials (`kiransamanta88@gmail.com`).</span>
            ) : (
              <span>Author login uses your email ID & password (e.g. <strong>RITTV3210</strong>).</span>
            )}
          </div>
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
            onClick={() => setShowAddSaleModal(true)}
            className="w-full py-2.5 bg-gradient-to-r from-[#d99b38] to-[#f3c06b] hover:from-[#e5a845] hover:to-[#fbd080] text-black text-xs font-extrabold rounded-xl shadow-lg shadow-[#c8923a]/20 transition flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Sale</span>
          </button>

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
                          <tr key={row.id} className="hover:bg-[#14141f] transition">
                            <td className="py-4">
                              <p className="font-bold text-white text-sm">{row.name}</p>
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
                          <tr key={row.id} className="hover:bg-[#14141f] transition">
                            <td className="py-4 font-bold text-white text-sm">{row.name}</td>
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
          {/* TAB 2: AUTHORS MANAGEMENT & WORKFLOW EDITOR */}
          {/* ------------------------------------------------------------- */}
          {activeTab === "authors" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-[#0e0e14] p-6 rounded-3xl border border-[#1f1f2e] shadow-xl">
                <div>
                  <h2 className="font-serif text-xl font-extrabold text-[#f3c06b]">Author Management & 9-Step Workflow</h2>
                  <p className="text-xs text-gray-400 mt-1">Manage publication authors, update workflow milestones, and configure stock.</p>
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
                    <div key={auth.id} className="bg-[#0e0e14] border border-[#1f1f2e] hover:border-[#c8923a]/40 rounded-3xl p-6 space-y-4 transition duration-300 shadow-xl">
                      <div className="flex flex-wrap justify-between items-center gap-3 border-b border-[#1c1c28] pb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2a2a3a] to-[#14141d] border border-[#c8923a]/40 flex items-center justify-center font-serif text-sm font-bold text-[#f3c06b] overflow-hidden shadow">
                            {auth.thumbnailUrl ? (
                              <img src={auth.thumbnailUrl} alt={auth.name} className="w-full h-full object-cover" />
                            ) : (
                              auth.name.charAt(0)
                            )}
                          </div>
                          <div>
                            <h3 className="font-serif text-lg font-bold text-white">{auth.name}</h3>
                            <p className="text-xs text-gray-400">{auth.email} • {auth.phone}</p>
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-3">
                          <span className="text-xs text-[#f3c06b] font-bold bg-[#181824] px-3 py-1 rounded-lg border border-[#2a2a3a]">
                            {auth.selectedPlan}
                          </span>
                          <span className={`px-3 py-1 rounded-lg text-[10px] font-extrabold ${
                            auth.status === "PAID" ? "bg-emerald-950 text-emerald-400 border border-emerald-800" : "bg-amber-950 text-amber-400 border border-amber-800"
                          }`}>
                            {auth.status}
                          </span>
                          <button
                            onClick={() => {
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
                            className="px-4 py-2 bg-[#161622] hover:bg-[#202030] border border-[#333348] text-xs text-[#f3c06b] rounded-xl font-bold transition shadow flex items-center gap-2"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit 9-Step Progress</span>
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
                  onClick={() => setShowAddSaleModal(true)}
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
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#181824]">
                      {recentSales.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="py-8 text-center text-gray-500">No book sales recorded yet. Click "+ Record Book Sale" to add one.</td>
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

      {/* MODAL: ADD SALE */}
      {showAddSaleModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0f0f16] border border-[#c8923a]/40 w-full max-w-md p-6 rounded-3xl space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="font-serif text-lg font-extrabold text-[#f3c06b]">Record New Book Sale</h3>
              <button onClick={() => setShowAddSaleModal(false)} className="text-gray-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddSale} className="space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1 font-medium">Author Email</label>
                <input
                  type="email"
                  required
                  value={saleForm.authorEmail}
                  onChange={(e) => setSaleForm({ ...saleForm, authorEmail: e.target.value })}
                  placeholder="author@example.com"
                  className="w-full bg-[#08080c] border border-[#242432] px-3.5 py-2.5 rounded-xl text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1 font-medium">Book Title</label>
                <input
                  type="text"
                  required
                  value={saleForm.bookTitle}
                  onChange={(e) => setSaleForm({ ...saleForm, bookTitle: e.target.value })}
                  placeholder="Book Name"
                  className="w-full bg-[#08080c] border border-[#242432] px-3.5 py-2.5 rounded-xl text-xs text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1 font-medium">Quantity</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={saleForm.quantity}
                    onChange={(e) => setSaleForm({ ...saleForm, quantity: Number(e.target.value) })}
                    className="w-full bg-[#08080c] border border-[#242432] px-3.5 py-2.5 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1 font-medium">Unit Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={saleForm.unitPrice}
                    onChange={(e) => setSaleForm({ ...saleForm, unitPrice: Number(e.target.value) })}
                    className="w-full bg-[#08080c] border border-[#242432] px-3.5 py-2.5 rounded-xl text-xs text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1 font-medium">Author Royalty Profit (₹)</label>
                <input
                  type="number"
                  required
                  value={saleForm.authorProfit}
                  onChange={(e) => setSaleForm({ ...saleForm, authorProfit: Number(e.target.value) })}
                  className="w-full bg-[#08080c] border border-[#242432] px-3.5 py-2.5 rounded-xl text-xs text-white"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddSaleModal(false)}
                  className="px-4 py-2 bg-gray-800 text-xs font-semibold rounded-xl text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-[#d99b38] to-[#f3c06b] text-xs font-extrabold rounded-xl text-black shadow"
                >
                  Save Sale
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
    </div>
  );
}
