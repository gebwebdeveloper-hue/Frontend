import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard, Search, RefreshCw, Loader2, Download, FileText,
  User, CheckCircle2, AlertCircle, ShieldCheck, Ban, ShieldAlert
} from "lucide-react";
import { API_BASE, SERVER_URL } from "../config.js";

export default function AdminLibraryCardsSection() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchCards = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/library-card/admin/all`, { credentials: "include" });
      const data = await res.json();
      if (res.ok && data.success) {
        setCards(data.libraryCards || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const handleToggleCardStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "suspended" ? "active" : "suspended";
    const confirmMsg =
      newStatus === "suspended"
        ? "Are you sure you want to REVOKE / SUSPEND access for this Library Card? The member will not be able to rent books."
        : "Reactivate access for this Library Card?";
    if (!window.confirm(confirmMsg)) return;

    try {
      setUpdatingId(id);
      const res = await fetch(`${API_BASE}/library-card/admin/update-status/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCards((prev) =>
          prev.map((c) => (c._id === id ? { ...c, status: newStatus } : c))
        );
      } else {
        alert(data.message || "Failed to update card status.");
      }
    } catch {
      alert("Server connection error while updating card status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredCards = cards.filter((card) => {
    const matchesQuery =
      card.cardId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.userPhone.includes(searchQuery);

    const matchesStatus = statusFilter === "all" || card.status === statusFilter;

    return matchesQuery && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl border border-emerald-400/30 bg-gradient-to-r from-emerald-950/40 via-zinc-950 to-teal-950/40 p-6 backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-300 mb-2">
              <CreditCard size={12} /> LIBRARY CARDS DIRECTORY
            </div>
            <h2 className="text-2xl font-black text-white">Issued Library Membership Cards</h2>
            <p className="mt-1 text-xs text-white/60">
              Total Issued Memberships: <strong className="text-emerald-300 font-bold">{cards.length} Cards</strong>
            </p>
          </div>

          <button
            onClick={fetchCards}
            disabled={loading}
            className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-bold text-white hover:bg-white/10 transition cursor-pointer self-start md:self-auto"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh Records
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Card ID, Member Name, Email or Phone..."
            className="w-full rounded-2xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-xs text-white placeholder-white/30 outline-none focus:border-emerald-400"
          />
        </div>

        <div className="flex items-center gap-2">
          {["all", "active", "suspended", "expired"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold capitalize transition cursor-pointer ${
                statusFilter === st
                  ? "bg-emerald-400 text-black shadow-lg shadow-emerald-400/20"
                  : "border border-white/10 bg-white/5 text-white/60 hover:text-white"
              }`}
            >
              {st} Cards
            </button>
          ))}
        </div>
      </div>

      {/* Cards Table */}
      {loading ? (
        <div className="flex min-h-[250px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
        </div>
      ) : filteredCards.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center text-white/50">
          <CreditCard className="mx-auto mb-3 h-10 w-10 text-white/30" />
          <p className="text-sm font-semibold">No Library Cards match your filter criteria.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl">
          <table className="w-full text-left text-xs text-white">
            <thead className="border-b border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-wider text-white/60">
              <tr>
                <th className="px-5 py-4">Card ID</th>
                <th className="px-5 py-4">Member Info</th>
                <th className="px-5 py-4">Issued &amp; Expiry Date</th>
                <th className="px-5 py-4">Fee Paid</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-center">Admin Access Control</th>
                <th className="px-5 py-4 text-right">Card Document</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium">
              {filteredCards.map((card) => {
                const issuedDateStr = new Date(card.issuedAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                });
                const validUntilStr = new Date(card.validUntil).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                });
                const isSuspended = card.status === "suspended";

                return (
                  <tr key={card._id} className="hover:bg-white/[0.02] transition">
                    <td className="px-5 py-4 font-black text-emerald-300 tracking-wider">
                      {card.cardId}
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-extrabold text-white">{card.userName}</div>
                      {card.dob && <div className="text-[10px] text-white/60">DOB: {card.dob}</div>}
                      {card.fatherName && <div className="text-[10px] text-white/60">Father: {card.fatherName}</div>}
                      <div className="text-[11px] text-white/50">{card.userEmail}</div>
                      <div className="text-[11px] font-mono text-emerald-300">Ph: {card.userPhone}</div>
                      {card.emergencyContact && <div className="text-[10px] font-mono text-amber-300">Emerg: {card.emergencyContact}</div>}
                      <div className="text-[10px] text-white/40 mt-1">
                        {[card.villageTown, card.postOffice, card.policeStation, card.district, card.state, card.pinCode].filter(Boolean).join(", ")}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div>Issued: <strong className="text-white/90">{issuedDateStr}</strong></div>
                      <div className="text-white/60">Expires: <strong className="text-cyan-300">{validUntilStr}</strong></div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="font-bold text-amber-300">₹{card.totalAmount}</span>
                    </td>

                    <td className="px-5 py-4">
                      {isSuspended ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-500/20 border border-red-500/40 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-red-300">
                          <ShieldAlert size={11} /> Suspended
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/10 border border-emerald-400/30 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-300">
                          <CheckCircle2 size={11} /> {card.status}
                        </span>
                      )}
                    </td>

                    {/* ADMIN REVOKE / REACTIVATE BUTTON */}
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => handleToggleCardStatus(card._id, card.status)}
                        disabled={updatingId === card._id}
                        className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-extrabold transition cursor-pointer disabled:opacity-50 ${
                          isSuspended
                            ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/20"
                            : "border-red-400/40 bg-red-400/10 text-red-300 hover:bg-red-400/20"
                        }`}
                      >
                        {updatingId === card._id ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : isSuspended ? (
                          <>
                            <CheckCircle2 size={12} /> Reactivate Card
                          </>
                        ) : (
                          <>
                            <Ban size={12} /> Revoke Access
                          </>
                        )}
                      </button>
                    </td>

                    <td className="px-5 py-4 text-right">
                      {card.cardId ? (
                        <a
                          href={`${API_BASE}/library-card/download/${card.cardId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-400/40 bg-emerald-400/10 px-3 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-400/20 transition"
                        >
                          <FileText size={13} /> View Card PDF
                        </a>
                      ) : (
                        <span className="text-white/40">No PDF</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
