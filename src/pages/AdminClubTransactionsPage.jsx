import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Loader2, Search, RefreshCw, AlertCircle,
  Receipt, CreditCard, Clock, MessageSquare,
  ExternalLink, Copy, Check, ChevronDown, ChevronUp,
  Filter, X, IndianRupee, ShieldCheck, RotateCcw, Users,
  FileText, CheckCircle2
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import PageTransition from "../components/PageTransition.jsx";
import AdminNavbar from "../components/AdminNavbar.jsx";
import { API_BASE } from "../config.js";

/* ─── Badge ───────────────────────────────────────────────── */
const PAY_CFG = {
  paid:     { label: "Paid",     cls: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300", icon: CheckCircle2 },
  pending:  { label: "Pending",  cls: "border-amber-500/30  bg-amber-500/10  text-amber-300",   icon: Clock        },
  refunded: { label: "Refunded", cls: "border-purple-500/30 bg-purple-500/10 text-purple-300",  icon: RotateCcw    },
  free:     { label: "Free",     cls: "border-cyan-500/30   bg-cyan-500/10   text-cyan-300",    icon: ShieldCheck  },
};
const MEM_CFG = {
  active:    { label: "Active",    cls: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" },
  pending:   { label: "Pending",   cls: "border-amber-500/30  bg-amber-500/10  text-amber-300"   },
  cancelled: { label: "Cancelled", cls: "border-red-500/30    bg-red-500/10    text-red-300"     },
};

function PayBadge({ status }) {
  const cfg = PAY_CFG[status] || { label: status, cls: "border-zinc-500/30 bg-zinc-500/10 text-zinc-300", icon: null };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${cfg.cls}`}>
      {Icon && <Icon size={9} />}{cfg.label}
    </span>
  );
}
function MemBadge({ status }) {
  const cfg = MEM_CFG[status] || { label: status, cls: "border-zinc-500/30 bg-zinc-500/10 text-zinc-300" };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

/* ─── Copy Button ──────────────────────────────────────────── */
function CopyBtn({ value }) {
  const [ok, setOk] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value || "").then(() => { setOk(true); setTimeout(() => setOk(false), 1600); }).catch(() => {});
  };
  return (
    <button type="button" onClick={copy} className="ml-1 text-white/30 hover:text-cyan-300 transition" title="Copy">
      {ok ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
    </button>
  );
}

/* ─── Info Row ─────────────────────────────────────────────── */
function InfoRow({ label, value, copy = false, mono = false }) {
  return (
    <div>
      <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-0.5">{label}</span>
      <div className={`flex items-start gap-1 text-white/80 ${mono ? "font-mono text-[10px]" : "text-xs"}`}>
        {typeof value === "string" ? <span className="break-all leading-relaxed">{value}</span> : value}
        {copy && typeof value === "string" && <CopyBtn value={value} />}
      </div>
    </div>
  );
}

/* ─── Stat Card ────────────────────────────────────────────── */
function StatCard({ label, value, icon, cls, valCls }) {
  return (
    <div className={`rounded-2xl border p-5 backdrop-blur-md ${cls}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">{label}</span>
        {icon}
      </div>
      <div className={`text-2xl font-black ${valCls}`}>{value}</div>
    </div>
  );
}

/* ─── Transaction Row ──────────────────────────────────────── */
function TransactionRow({ member, idx }) {
  const [expanded, setExpanded] = useState(false);
  const dateStr = member.createdAt
    ? new Date(member.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "—";
  const amtStr = member.amountPaid != null
    ? `₹${Number(member.amountPaid).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
    : "—";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.025, duration: 0.25 }}
      className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden backdrop-blur-md hover:border-white/20 transition-colors"
    >
      {/* ── Summary Row ── */}
      <div
        className="flex flex-wrap items-center gap-3 px-5 py-4 cursor-pointer"
        onClick={() => setExpanded(v => !v)}
      >
        <span className="text-[10px] font-black text-white/25 w-6 shrink-0 text-center">#{idx + 1}</span>

        {/* Member ID */}
        <div className="min-w-[110px]">
          <p className="text-[9px] font-bold uppercase tracking-wider text-white/35 mb-0.5">Member ID</p>
          <div className="flex items-center gap-1">
            <span className="font-mono text-[11px] font-black text-amber-300 tracking-wider">{member.memberId || "—"}</span>
            {member.memberId && <CopyBtn value={member.memberId} />}
          </div>
        </div>

        {/* Applicant */}
        <div className="flex-1 min-w-[130px]">
          <p className="text-[9px] font-bold uppercase tracking-wider text-white/35 mb-0.5">Applicant</p>
          <p className="text-xs font-bold text-white truncate">{member.fullName}</p>
          <p className="text-[10px] text-white/50 truncate">{member.email}</p>
        </div>

        {/* Amount */}
        <div className="min-w-[90px]">
          <p className="text-[9px] font-bold uppercase tracking-wider text-white/35 mb-0.5">Amount</p>
          <p className="text-sm font-black text-emerald-300">{amtStr}</p>
        </div>

        {/* Payment Badge */}
        <div className="min-w-[78px]">
          <p className="text-[9px] font-bold uppercase tracking-wider text-white/35 mb-1">Payment</p>
          <PayBadge status={member.paymentStatus || "pending"} />
        </div>

        {/* Member Status */}
        <div className="min-w-[70px]">
          <p className="text-[9px] font-bold uppercase tracking-wider text-white/35 mb-1">Status</p>
          <MemBadge status={member.status || "pending"} />
        </div>

        {/* Date */}
        <div className="min-w-[90px] hidden sm:block">
          <p className="text-[9px] font-bold uppercase tracking-wider text-white/35 mb-0.5">Submitted</p>
          <p className="text-[11px] text-white/70 font-semibold">{dateStr}</p>
        </div>

        <div className="ml-auto text-white/30 hover:text-white transition shrink-0">
          {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </div>
      </div>

      {/* ── Expanded Details ── */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            key="expand"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/10 px-5 py-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

              {/* Transaction Details */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-cyan-400 flex items-center gap-1.5 pb-2 border-b border-white/10">
                  <CreditCard size={11} /> Transaction Details
                </h4>
                <InfoRow label="Payment ID"     value={member.paymentId  || "—"} copy={!!member.paymentId}  mono />
                <InfoRow label="Order ID"       value={member.orderId    || "—"} copy={!!member.orderId}    mono />
                <InfoRow label="Amount Paid"    value={amtStr} />
                <InfoRow label="Payment Status" value={<PayBadge status={member.paymentStatus || "pending"} />} />
                <InfoRow label="Member Status"  value={<MemBadge status={member.status        || "pending"} />} />
                {member.actionText && <InfoRow label="Action Note" value={member.actionText} />}
              </div>

              {/* Form Submitted Details */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 flex items-center gap-1.5 pb-2 border-b border-white/10">
                  <FileText size={11} /> Form Details
                </h4>
                <InfoRow label="Full Name"  value={member.fullName || "—"} />
                <InfoRow label="Email"      value={member.email    || "—"} copy={!!member.email} />
                <InfoRow label="Phone"      value={member.phone    || "—"} copy={!!member.phone} />
                {member.whatsapp && member.whatsapp !== member.phone && (
                  <InfoRow label="WhatsApp" value={member.whatsapp} copy />
                )}
                <InfoRow label="Role Applied" value={member.role || "Member"} />
                {member.dateOfBirth && <InfoRow label="Date of Birth" value={member.dateOfBirth} />}
                {member.portfolioUrl && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-0.5">Portfolio / Website</span>
                    <a
                      href={member.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-cyan-300 hover:text-cyan-200 flex items-center gap-1 break-all"
                    >
                      {member.portfolioUrl.slice(0, 40)}{member.portfolioUrl.length > 40 ? "…" : ""}
                      <ExternalLink size={10} />
                    </a>
                  </div>
                )}
              </div>

              {/* Application Note & Timestamps */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-1.5 pb-2 border-b border-white/10">
                  <MessageSquare size={11} /> Application Info
                </h4>
                {member.address && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-0.5">Address</span>
                    <p className="text-xs text-white/75 leading-relaxed">{member.address}</p>
                  </div>
                )}
                {member.reason && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-0.5">Why join the Club?</span>
                    <blockquote className="border-l-2 border-amber-400/50 pl-3 text-xs italic text-white/70 leading-relaxed">
                      &ldquo;{member.reason}&rdquo;
                    </blockquote>
                  </div>
                )}
                <InfoRow
                  label="Submitted On"
                  value={member.createdAt
                    ? new Date(member.createdAt).toLocaleString("en-IN", {
                        day: "2-digit", month: "short", year: "numeric",
                        hour: "2-digit", minute: "2-digit"
                      })
                    : "—"}
                />
                {member.updatedAt && member.updatedAt !== member.createdAt && (
                  <InfoRow
                    label="Last Updated"
                    value={new Date(member.updatedAt).toLocaleString("en-IN", {
                      day: "2-digit", month: "short", year: "numeric",
                      hour: "2-digit", minute: "2-digit"
                    })}
                  />
                )}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Main Page ────────────────────────────────────────────── */
export default function AdminClubTransactionsPage() {
  const navigate = useNavigate();

  const [authed,   setAuthed]   = useState(false);
  const [checking, setChecking] = useState(true);
  const [members,  setMembers]  = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [search,       setSearch]       = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [statusFilter,  setStatusFilter]  = useState("all");
  const [sortBy,        setSortBy]        = useState("newest");

  useEffect(() => {
    fetch(`${API_BASE}/auth/me`, { credentials: "include" })
      .then(r => r.json())
      .then(d => {
        if (d.success && d.user?.role === "admin") setAuthed(true);
        else navigate("/admin");
      })
      .catch(() => navigate("/admin"))
      .finally(() => setChecking(false));
  }, [navigate]);

  const fetchData = async () => {
    setLoading(true); setError("");
    try {
      const res  = await fetch(`${API_BASE}/club/admin/members`, { credentials: "include" });
      const data = await res.json();
      if (data.success) setMembers(data.members || []);
      else setError(data.message || "Failed to fetch.");
    } catch { setError("Network error."); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (authed) fetchData(); }, [authed]);

  const filtered = useMemo(() => {
    let list = members.filter(m => {
      const q = search.toLowerCase();
      const hit = !q ||
        m.fullName?.toLowerCase().includes(q)  ||
        m.email?.toLowerCase().includes(q)     ||
        m.phone?.includes(q)                   ||
        m.memberId?.toLowerCase().includes(q)  ||
        m.paymentId?.toLowerCase().includes(q) ||
        m.orderId?.toLowerCase().includes(q);
      const okPay = paymentFilter === "all" || m.paymentStatus === paymentFilter;
      const okSt  = statusFilter  === "all" || m.status         === statusFilter;
      return hit && okPay && okSt;
    });
    if (sortBy === "newest")    list = [...list].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sortBy === "oldest")    list = [...list].sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt));
    if (sortBy === "amount_hi") list = [...list].sort((a,b) => (b.amountPaid||0) - (a.amountPaid||0));
    if (sortBy === "amount_lo") list = [...list].sort((a,b) => (a.amountPaid||0) - (b.amountPaid||0));
    return list;
  }, [members, search, paymentFilter, statusFilter, sortBy]);

  const totalRev  = members.filter(m => m.paymentStatus === "paid").reduce((s,m) => s + (m.amountPaid||0), 0);
  const refundAmt = members.filter(m => m.paymentStatus === "refunded").reduce((s,m) => s + (m.amountPaid||0), 0);
  const paidCnt   = members.filter(m => m.paymentStatus === "paid").length;
  const refCnt    = members.filter(m => m.paymentStatus === "refunded").length;
  const pendCnt   = members.filter(m => m.paymentStatus === "pending").length;

  if (checking) return (
    <div className="min-h-screen grid place-items-center bg-zinc-950 text-cyan-400">
      <Loader2 className="h-10 w-10 animate-spin" />
    </div>
  );
  if (!authed) return null;

  return (
    <PageTransition>
      <main className="min-h-screen bg-zinc-950 pt-32 sm:pt-36 md:pt-40 pb-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <AdminNavbar />

          {/* ── Header ── */}
          <div className="mb-8 flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-6">
            <div className="flex items-start gap-3">
              <Link
                to="/admin/club"
                className="mt-1 inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[11px] font-bold text-white/70 hover:bg-white/10 hover:text-white transition"
              >
                <ArrowLeft size={13} /> Back
              </Link>
              <div>
                <h1 className="text-3xl font-black uppercase tracking-wider text-white sm:text-4xl">
                  Club Transactions &amp; Forms
                </h1>
                <p className="mt-1 text-xs text-white/55">
                  All club membership payment transactions and joining form submission details.
                </p>
              </div>
            </div>
            <button
              onClick={fetchData}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-bold text-white hover:bg-white/10 transition cursor-pointer"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
            </button>
          </div>

          {/* ── Stat Cards ── */}
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total Submissions" value={members.length}
              icon={<Users size={18} className="text-cyan-400" />}
              cls="border-white/10 bg-white/[0.03]" valCls="text-white"
            />
            <StatCard
              label="Total Revenue"
              value={`₹${totalRev.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
              icon={<IndianRupee size={18} className="text-emerald-400" />}
              cls="border-emerald-500/20 bg-emerald-500/5" valCls="text-emerald-300"
            />
            <StatCard
              label="Refunded Amount"
              value={`₹${refundAmt.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
              icon={<RotateCcw size={18} className="text-purple-400" />}
              cls="border-purple-500/20 bg-purple-500/5" valCls="text-purple-300"
            />
            <StatCard
              label="Pending Payments" value={pendCnt}
              icon={<Clock size={18} className="text-amber-400" />}
              cls="border-amber-500/20 bg-amber-500/5" valCls="text-amber-300"
            />
          </div>

          {/* ── Quick Pills ── */}
          <div className="mb-6 flex flex-wrap gap-2">
            {[
              { label: `${paidCnt} Paid`,    cls: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" },
              { label: `${refCnt} Refunded`, cls: "border-purple-500/30 bg-purple-500/10 text-purple-300" },
              { label: `${pendCnt} Pending`, cls: "border-amber-500/30  bg-amber-500/10  text-amber-300"  },
              { label: `${members.filter(m=>m.status==="active").length} Active Members`, cls: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300" },
            ].map(p => (
              <span key={p.label} className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-bold ${p.cls}`}>
                {p.label}
              </span>
            ))}
          </div>

          {/* ── Filters ── */}
          <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.02] p-4 backdrop-blur-md">
            <div className="flex flex-wrap gap-3 items-center">
              {/* Search */}
              <div className="relative min-w-[220px] flex-1">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                <input
                  type="text" value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search name, email, phone, payment ID, order ID…"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-9 text-xs text-white placeholder-white/30 outline-none focus:border-cyan-400/50 focus:bg-white/10 transition"
                />
                {search && (
                  <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white">
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Payment Filter */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-bold uppercase text-white/35 flex items-center gap-1">
                  <Filter size={10} /> Pay:
                </span>
                {["all","paid","pending","refunded","free"].map(f => (
                  <button
                    key={f} onClick={() => setPaymentFilter(f)}
                    className={`rounded-xl px-3 py-1.5 text-[11px] font-bold capitalize transition cursor-pointer ${
                      paymentFilter === f ? "bg-cyan-400 text-black" : "border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {f === "all" ? "All" : f[0].toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase text-white/35">Sort:</span>
                <select
                  value={sortBy} onChange={e => setSortBy(e.target.value)}
                  className="rounded-xl border border-white/10 bg-zinc-900 px-3 py-1.5 text-[11px] text-white outline-none focus:border-cyan-400/50 cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="amount_hi">Amount ↓ High</option>
                  <option value="amount_lo">Amount ↑ Low</option>
                </select>
              </div>
            </div>

            <p className="mt-3 text-[11px] text-white/40">
              Showing <span className="text-white font-bold">{filtered.length}</span> of{" "}
              <span className="text-white font-bold">{members.length}</span> records
            </p>
          </div>

          {/* ── Error ── */}
          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-xs font-semibold text-red-300">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* ── List ── */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="h-9 w-9 animate-spin text-cyan-400 mb-3" />
              <p className="text-xs text-white/50">Loading transactions…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-16 text-center">
              <Receipt className="mx-auto h-14 w-14 text-white/15 mb-4" />
              <h3 className="text-lg font-extrabold text-white">No Records Found</h3>
              <p className="mt-1 text-xs text-white/50">
                {search ? "No transaction matches your search." : "No club transactions yet."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((member, idx) => (
                <TransactionRow key={member._id} member={member} idx={idx} />
              ))}
            </div>
          )}

        </div>
      </main>
    </PageTransition>
  );
}
