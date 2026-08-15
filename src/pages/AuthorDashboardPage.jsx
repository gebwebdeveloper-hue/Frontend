import { useState, useEffect } from "react";
import { API_BASE } from "../config.js";
import {
  LayoutDashboard,
  TrendingUp,
  BookOpen,
  DollarSign,
  CreditCard,
  LogOut,
  CheckCircle
} from "lucide-react";

import AuthorOverviewSection from "../author/components/AuthorOverviewSection.jsx";
import AuthorSalesSection from "../author/components/AuthorSalesSection.jsx";
import AuthorBooksSection from "../author/components/AuthorBooksSection.jsx";
import AuthorEarningsSection from "../author/components/AuthorEarningsSection.jsx";
import AuthorPaymentsSection from "../author/components/AuthorPaymentsSection.jsx";

export default function AuthorDashboardPage() {
  const [token, setToken] = useState(() => localStorage.getItem("lekhok_publisher_token") || "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);

  // Sidebar Tab: "dashboard" | "sales" | "books" | "earnings" | "payments"
  const [authorSidebarTab, setAuthorSidebarTab] = useState("dashboard");

  const [authorData, setAuthorData] = useState(null);
  const [authorSales, setAuthorSales] = useState([]);
  const [summaryMetrics, setSummaryMetrics] = useState(null);
  const [reprintNotice, setReprintNotice] = useState("");

  useEffect(() => {
    if (token) {
      fetchAuthorData();
    }
  }, [token]);

  const fetchAuthorData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/publisher/author/my-stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setAuthorData(data.author);
        setAuthorSales(data.sales || []);
        setSummaryMetrics(data.summaryMetrics || null);
      }
    } catch (err) {
      console.error("Failed to fetch author stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/publisher/author-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        setToken(data.token);
        localStorage.setItem("lekhok_publisher_token", data.token);
        localStorage.setItem("lekhok_publisher_role", "author");
      } else {
        setLoginError(data.message || "Invalid author credentials.");
      }
    } catch (err) {
      setLoginError("Failed to connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setToken("");
    localStorage.removeItem("lekhok_publisher_token");
    localStorage.removeItem("lekhok_publisher_role");
  };

  const handleRequestReprint = async (bookTitle) => {
    try {
      const res = await fetch(`${API_BASE}/publisher/author/reprint`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ bookTitle })
      });
      const data = await res.json();
      if (data.success) {
        setReprintNotice(`Reprint request submitted for "${bookTitle}"!`);
        setTimeout(() => setReprintNotice(""), 4000);
      }
    } catch (err) {
      alert("Error submitting reprint request.");
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-[#060608] text-white flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#c8923a]/10 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="w-full max-w-md bg-[#0f0f14]/90 backdrop-blur-xl border border-[#c8923a]/30 rounded-3xl p-8 shadow-2xl relative z-10">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 p-1.5 rounded-2xl bg-gradient-to-b from-[#1c1c28] to-[#0e0e14] border border-[#c8923a]/40 shadow-xl flex items-center justify-center">
              <img src="/logo.png" alt="Lekhok Tripura Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="font-serif text-2xl font-extrabold bg-gradient-to-r from-[#f5d796] via-[#c8923a] to-[#e6b35c] bg-clip-text text-transparent tracking-wide">
              Lekhok Tripura Publishers
            </h1>
            <p className="text-xs text-gray-400 mt-1 font-medium">Author Royalties Dashboard</p>
          </div>

          {loginError && (
            <div className="mb-4 p-3 bg-red-950/80 border border-red-700/80 rounded-xl text-red-300 text-xs">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 font-medium">Author Registered Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="author@email.com"
                className="w-full px-4 py-3 bg-[#08080b] border border-[#242432] rounded-xl text-sm focus:outline-none focus:border-[#c8923a] text-white"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1.5 font-medium">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="e.g. RITTV3210"
                className="w-full px-4 py-3 bg-[#08080b] border border-[#242432] rounded-xl text-sm focus:outline-none focus:border-[#c8923a] text-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-[#d99b38] to-[#f3c06b] hover:from-[#e5a845] hover:to-[#fbd080] text-black font-extrabold rounded-xl transition-all shadow-lg shadow-[#c8923a]/20 text-sm mt-2 flex items-center justify-center gap-2"
            >
              {loading ? "Authenticating..." : "Login to Author Portal"}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-gray-400 bg-[#14141c] p-3.5 rounded-xl border border-[#262636]">
            Author login uses your registered email ID & password (e.g. <strong>RITTV3210</strong>).
          </div>
        </div>
      </div>
    );
  }

  const authInfo = authorData || {};
  const steps = authInfo.workflowSteps || [
    { stepNumber: 1, name: "Payment", status: "COMPLETED" },
    { stepNumber: 2, name: "ISBN Generated", status: "COMPLETED" },
    { stepNumber: 3, name: "Book Page", status: "COMPLETED" },
    { stepNumber: 4, name: "Book Cover", status: "COMPLETED" },
    { stepNumber: 5, name: "Formatting", status: "COMPLETED" },
    { stepNumber: 6, name: "Author Approval", status: "COMPLETED" },
    { stepNumber: 7, name: "Ready to Print", status: "COMPLETED" },
    { stepNumber: 8, name: "Printing", status: "COMPLETED" },
    { stepNumber: 9, name: "Stock Ready", status: "COMPLETED" }
  ];

  const primaryBook = authInfo.books?.[0] || {
    title: authInfo.selectedPlan || "Book Submission",
    isbn: "—",
    copiesPrinted: 50,
    copiesSold: 0,
    currentStock: 50,
    stockStatus: "IN STOCK"
  };

  return (
    <div className="min-h-screen bg-[#050507] text-gray-100 font-sans pl-0 md:pl-64">
      {/* LEFT NAVIGATION SIDEBAR (FIXED POSITION) */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[#09090d] border-r border-[#1a1a26] p-6 flex flex-col justify-between hidden md:flex z-40 overflow-y-auto">
        <div className="space-y-6">
          <div className="text-center pb-5 border-b border-[#1c1c28]">
            <div className="w-16 h-16 mx-auto rounded-2xl border border-[#c8923a]/40 p-1.5 bg-[#12121c] shadow-lg flex items-center justify-center">
              <img src="/logo.png" alt="Lekhok Tripura Logo" className="w-full h-full object-contain" />
            </div>
            <h2 className="font-serif text-sm font-bold text-white mt-3">Lekhok Tripura Publishers</h2>
            <p className="text-[10px] text-gray-400 font-medium mt-0.5">Author's Royalties Dashboard</p>
          </div>

          <nav className="space-y-1.5 text-xs">
            <button
              onClick={() => setAuthorSidebarTab("dashboard")}
              className={`w-full text-left px-4 py-3 rounded-xl font-bold transition flex items-center gap-3 ${
                authorSidebarTab === "dashboard"
                  ? "bg-[#c8923a]/15 border border-[#c8923a]/50 text-[#f3c06b] shadow-sm"
                  : "text-gray-400 hover:text-white hover:bg-[#14141f]"
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-[#f3c06b]" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setAuthorSidebarTab("sales")}
              className={`w-full text-left px-4 py-3 rounded-xl font-bold transition flex items-center gap-3 ${
                authorSidebarTab === "sales"
                  ? "bg-[#c8923a]/15 border border-[#c8923a]/50 text-[#f3c06b] shadow-sm"
                  : "text-gray-400 hover:text-white hover:bg-[#14141f]"
              }`}
            >
              <TrendingUp className="w-4 h-4 text-[#f3c06b]" />
              <span>Sales Summary</span>
            </button>

            <button
              onClick={() => setAuthorSidebarTab("books")}
              className={`w-full text-left px-4 py-3 rounded-xl font-bold transition flex items-center gap-3 ${
                authorSidebarTab === "books"
                  ? "bg-[#c8923a]/15 border border-[#c8923a]/50 text-[#f3c06b] shadow-sm"
                  : "text-gray-400 hover:text-white hover:bg-[#14141f]"
              }`}
            >
              <BookOpen className="w-4 h-4 text-[#f3c06b]" />
              <span>My Books</span>
            </button>

            <button
              onClick={() => setAuthorSidebarTab("earnings")}
              className={`w-full text-left px-4 py-3 rounded-xl font-bold transition flex items-center gap-3 ${
                authorSidebarTab === "earnings"
                  ? "bg-[#c8923a]/15 border border-[#c8923a]/50 text-[#f3c06b] shadow-sm"
                  : "text-gray-400 hover:text-white hover:bg-[#14141f]"
              }`}
            >
              <DollarSign className="w-4 h-4 text-[#f3c06b]" />
              <span>Earnings</span>
            </button>

            <button
              onClick={() => setAuthorSidebarTab("payments")}
              className={`w-full text-left px-4 py-3 rounded-xl font-bold transition flex items-center gap-3 ${
                authorSidebarTab === "payments"
                  ? "bg-[#c8923a]/15 border border-[#c8923a]/50 text-[#f3c06b] shadow-sm"
                  : "text-gray-400 hover:text-white hover:bg-[#14141f]"
              }`}
            >
              <CreditCard className="w-4 h-4 text-[#f3c06b]" />
              <span>Payments</span>
            </button>
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="w-full text-left px-4 py-3 rounded-xl font-bold text-xs text-gray-400 hover:text-red-400 transition flex items-center gap-3"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="min-h-screen flex flex-col">
        <header className="border-b border-[#1c1c28] bg-[#09090d] px-6 py-3.5 flex justify-between items-center sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#14141d] border border-[#c8923a]/40 p-1 flex items-center justify-center md:hidden">
              <img src="/logo.png" alt="Lekhok Tripura Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="font-serif text-lg font-extrabold text-white tracking-wide">LEKHOK TRIPURA</h1>
              <p className="text-xs text-gray-400">Author Portal</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-1.5 border border-[#2d2d3a] hover:bg-[#1a1a24] text-xs font-bold rounded-xl text-gray-300 transition flex items-center gap-2"
          >
            <LogOut className="w-3.5 h-3.5 text-gray-400" />
            <span>Logout</span>
          </button>
        </header>

        <main className="p-6 md:p-8 space-y-8 flex-1">
          {reprintNotice && (
            <div className="p-4 bg-emerald-950/80 border border-emerald-700 text-emerald-300 rounded-2xl text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>{reprintNotice}</span>
            </div>
          )}

          {/* Header Banner */}
          <div className="flex justify-between items-end border-b border-[#1c1c28] pb-6">
            <div>
              <p className="text-[11px] text-[#f3c06b] font-bold tracking-wider uppercase">LEKHOK TRIPURA PUBLISHERS</p>
              <h2 className="font-serif text-2xl font-extrabold text-white mt-1">
                {authorSidebarTab === "dashboard" && "Author's Royalties Dashboard"}
                {authorSidebarTab === "sales" && "Sales Summary & Analytics"}
                {authorSidebarTab === "books" && "My Published Books & Stock"}
                {authorSidebarTab === "earnings" && "Royalty Earnings & Deductions"}
                {authorSidebarTab === "payments" && "Publishing Plan & Payment Status"}
              </h2>
              <p className="text-xs text-gray-400">
                {authorSidebarTab === "dashboard" && "Sales, deductions & royalty overview"}
                {authorSidebarTab === "sales" && "Complete log of sales transactions for your books"}
                {authorSidebarTab === "books" && "Manage inventory stock, print copies, and reprint requests"}
                {authorSidebarTab === "earnings" && "Detailed net royalty calculations and payouts"}
                {authorSidebarTab === "payments" && "Publishing package plan amount, invoice & payment records"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-gray-400">Logged in as,</p>
              <p className="text-xs font-bold text-[#f3c06b]">{authInfo.name || "Author"} • {authInfo.email}</p>
            </div>
          </div>

          {/* RENDER DEDICATED SIDEBAR SUB-COMPONENTS */}
          {authorSidebarTab === "dashboard" && (
            <AuthorOverviewSection authInfo={authInfo} steps={steps} summaryMetrics={summaryMetrics} />
          )}

          {authorSidebarTab === "sales" && (
            <AuthorSalesSection summaryMetrics={summaryMetrics} authorSales={authorSales} />
          )}

          {authorSidebarTab === "books" && (
            <AuthorBooksSection books={authInfo.books} primaryBook={primaryBook} handleRequestReprint={handleRequestReprint} />
          )}

          {authorSidebarTab === "earnings" && (
            <AuthorEarningsSection authInfo={authInfo} summaryMetrics={summaryMetrics} />
          )}

          {authorSidebarTab === "payments" && (
            <AuthorPaymentsSection authInfo={authInfo} />
          )}
        </main>
      </div>
    </div>
  );
}
