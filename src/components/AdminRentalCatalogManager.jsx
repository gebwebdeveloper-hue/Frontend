import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Search, CheckCircle2, XCircle, Settings,
  Loader2, Filter, Sparkles, RefreshCw, AlertCircle, PlusCircle, Check
} from "lucide-react";
import { API_BASE, SERVER_URL } from "../config.js";

export default function AdminRentalCatalogManager({ onCatalogUpdated }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterRentalState, setFilterRentalState] = useState("all"); // 'all' | 'rentable' | 'non_rentable'
  const [updatingId, setUpdatingId] = useState(null);
  const [notification, setNotification] = useState({ type: "", text: "" });

  // Modal state for editing rental params (Price, Duration, Fine)
  const [editingBookSettings, setEditingBookSettings] = useState(null);
  const [settingsForm, setSettingsForm] = useState({
    rentalPrice: "50",
    rentalDurationDays: "15",
    finePerDay: "5",
  });
  const [submittingSettings, setSubmittingSettings] = useState(false);

  const fetchBooksList = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/books?limit=2000`, { credentials: "include" });
      const data = await res.json();
      if (res.ok && data.success) {
        setBooks(data.books || []);
      } else {
        showNotification("error", data.message || "Failed to fetch books list.");
      }
    } catch {
      showNotification("error", "Error connecting to server to load books.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooksList();
  }, []);

  const showNotification = (type, text) => {
    setNotification({ type, text });
    setTimeout(() => setNotification({ type: "", text: "" }), 4000);
  };

  // Quick 1-click toggle for rental status
  const handleToggleRentalStatus = async (book) => {
    const newStatus = !book.isRentalAvailable;
    setUpdatingId(book._id);

    try {
      const res = await fetch(`${API_BASE}/rentals/admin/book/${book._id}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          isRentalAvailable: newStatus,
          rentalPrice: book.rentalPrice || 50,
          rentalDurationDays: book.rentalDurationDays || 15,
          finePerDay: book.finePerDay || 5,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setBooks((prev) =>
          prev.map((b) => (b._id === book._id ? { ...b, isRentalAvailable: newStatus } : b))
        );
        showNotification(
          "success",
          newStatus
            ? `"${book.title}" is now LISTED IN BOOK RENTAL SYSTEM!`
            : `"${book.title}" removed from Rental System.`
        );
        if (onCatalogUpdated) onCatalogUpdated();
      } else {
        showNotification("error", data.message || "Failed to update rental status.");
      }
    } catch {
      showNotification("error", "Server connection error while updating rental status.");
    } finally {
      setUpdatingId(null);
    }
  };

  // Open settings modal to tweak fee/duration/fine
  const handleOpenSettings = (book) => {
    setEditingBookSettings(book);
    setSettingsForm({
      rentalPrice: String(book.rentalPrice || 50),
      rentalDurationDays: String(book.rentalDurationDays || 15),
      finePerDay: String(book.finePerDay || 5),
    });
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    if (!editingBookSettings) return;

    setSubmittingSettings(true);
    try {
      const res = await fetch(`${API_BASE}/rentals/admin/book/${editingBookSettings._id}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          isRentalAvailable: editingBookSettings.isRentalAvailable,
          rentalPrice: Number(settingsForm.rentalPrice),
          rentalDurationDays: Number(settingsForm.rentalDurationDays),
          finePerDay: Number(settingsForm.finePerDay),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setBooks((prev) =>
          prev.map((b) =>
            b._id === editingBookSettings._id
              ? {
                  ...b,
                  rentalPrice: Number(settingsForm.rentalPrice),
                  rentalDurationDays: Number(settingsForm.rentalDurationDays),
                  finePerDay: Number(settingsForm.finePerDay),
                }
              : b
          )
        );
        showNotification("success", `Updated rental rules for "${editingBookSettings.title}".`);
        setEditingBookSettings(null);
        if (onCatalogUpdated) onCatalogUpdated();
      } else {
        showNotification("error", data.message || "Failed to save settings.");
      }
    } catch {
      showNotification("error", "Error saving rental settings.");
    } finally {
      setSubmittingSettings(false);
    }
  };

  // Categories list
  const categoriesList = ["All", ...new Set(books.map((b) => b.category).filter(Boolean))];

  // Filtering
  const filteredBooks = books.filter((book) => {
    const matchesQuery =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = filterCategory === "All" || book.category === filterCategory;

    const matchesRentalState =
      filterRentalState === "all" ||
      (filterRentalState === "rentable" && book.isRentalAvailable) ||
      (filterRentalState === "non_rentable" && !book.isRentalAvailable);

    return matchesQuery && matchesCategory && matchesRentalState;
  });

  const totalRentableCount = books.filter((b) => b.isRentalAvailable).length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {notification.text && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`rounded-2xl border p-4 text-xs font-bold shadow-xl backdrop-blur-md flex items-center justify-between ${
              notification.type === "success"
                ? "border-emerald-400/40 bg-emerald-950/80 text-emerald-300"
                : "border-red-400/40 bg-red-950/80 text-red-300"
            }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{notification.text}</span>
            </div>
            <button
              onClick={() => setNotification({ type: "", text: "" })}
              className="text-white/50 hover:text-white"
            >
              <XCircle size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner & Stats */}
      <div className="rounded-3xl border border-emerald-400/30 bg-gradient-to-r from-emerald-950/40 via-zinc-950 to-teal-950/40 p-6 backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-300 mb-2">
              <Sparkles size={12} /> RENTAL CATALOG MANAGER
            </div>
            <h2 className="text-2xl font-black text-white">Book Rental System Manager</h2>
            <p className="mt-1 text-xs text-white/60">
              Toggle any book in your database to immediately feature it on the public{" "}
              <strong className="text-emerald-300">Rent Books</strong> page.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-5 py-3 text-center">
              <span className="block text-[10px] font-black uppercase tracking-wider text-emerald-300">
                Listed Rentals
              </span>
              <span className="text-2xl font-black text-white">{totalRentableCount} / {books.length}</span>
            </div>

            <button
              onClick={fetchBooksList}
              disabled={loading}
              className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-bold text-white hover:bg-white/10 transition cursor-pointer"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh List
            </button>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search book title or author..."
            className="w-full rounded-2xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-xs text-white placeholder-white/30 outline-none focus:border-emerald-400"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Rental state pills */}
          {[
            { key: "all", label: `All Books (${books.length})` },
            { key: "rentable", label: `Listed for Rent (${totalRentableCount})` },
            { key: "non_rentable", label: `Not Listed (${books.length - totalRentableCount})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterRentalState(tab.key)}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold transition cursor-pointer ${
                filterRentalState === tab.key
                  ? "bg-emerald-400 text-black shadow-lg shadow-emerald-400/20"
                  : "border border-white/10 bg-white/5 text-white/60 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}

          {/* Category Dropdown */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white outline-none focus:border-emerald-400 appearance-none cursor-pointer"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23ffffff66' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 10px center",
              paddingRight: "28px",
            }}
          >
            {categoriesList.map((cat) => (
              <option key={cat} value={cat} style={{ background: "#0a0a0a" }}>
                Category: {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Catalog Books List Grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-44 animate-pulse rounded-2xl border border-white/10 bg-white/5" />
          ))}
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center">
          <BookOpen size={40} className="mx-auto text-white/20 mb-3" />
          <h3 className="text-base font-bold text-white">No Books Match Criteria</h3>
          <p className="text-xs text-white/50 mt-1">Try adjusting search or category filter settings.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredBooks.map((book) => {
            const isRentable = book.isRentalAvailable;
            const isUpdating = updatingId === book._id;

            return (
              <div
                key={book._id}
                className={`group relative flex flex-col justify-between rounded-2xl border p-4 transition shadow-lg backdrop-blur-md ${
                  isRentable
                    ? "border-emerald-400/40 bg-gradient-to-b from-emerald-950/30 to-zinc-950"
                    : "border-white/10 bg-gradient-to-b from-white/[0.04] to-zinc-950 hover:border-white/20"
                }`}
              >
                {/* Top Bar: Category & Badge */}
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-white/50">
                    {book.category}
                  </span>

                  {isRentable ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-400/15 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-emerald-300">
                      <CheckCircle2 size={10} /> RENTAL ENABLED
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white/40">
                      RENTAL DISABLED
                    </span>
                  )}
                </div>

                {/* Main Details */}
                <div className="flex gap-3">
                  {book.cover?.url ? (
                    <img
                      src={
                        book.cover.url.startsWith("http")
                          ? book.cover.url
                          : `${SERVER_URL}${book.cover.url}`
                      }
                      alt={book.title}
                      className="h-24 w-16 rounded-xl object-cover shadow-md shrink-0"
                    />
                  ) : (
                    <div className="grid h-24 w-16 place-items-center rounded-xl bg-zinc-800 text-[10px] font-bold text-white/40 shrink-0">
                      COVER
                    </div>
                  )}

                  <div className="flex flex-col justify-between overflow-hidden">
                    <div>
                      <h4 className="font-bold text-white text-sm leading-tight line-clamp-2">
                        {book.title}
                      </h4>
                      <p className="mt-0.5 text-xs text-white/60 line-clamp-1">by {book.author}</p>
                    </div>

                    <div className="mt-2 text-[11px] text-white/70 space-y-0.5">
                      <p>
                        Fee: <strong className="text-emerald-300">₹{book.rentalPrice || 50}</strong> / {book.rentalDurationDays || 15} Days
                      </p>
                      <p>
                        Fine: <strong className="text-amber-300">₹{book.finePerDay || 5}/day</strong>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Footer */}
                <div className="mt-4 flex items-center gap-2 border-t border-white/10 pt-3">
                  {/* 1-Click Toggle Button */}
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => handleToggleRentalStatus(book)}
                    className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-black uppercase tracking-wider transition cursor-pointer ${
                      isRentable
                        ? "border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500 hover:text-white"
                        : "bg-emerald-400 text-black hover:bg-emerald-300 shadow-md shadow-emerald-400/20"
                    }`}
                  >
                    {isUpdating ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : isRentable ? (
                      <>
                        <XCircle size={14} /> Remove From Rental
                      </>
                    ) : (
                      <>
                        <PlusCircle size={14} /> Mark As Rental
                      </>
                    )}
                  </button>

                  {/* Settings Button */}
                  <button
                    type="button"
                    onClick={() => handleOpenSettings(book)}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition cursor-pointer"
                    title="Configure Rental Fee & Rules"
                  >
                    <Settings size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* RENTAL SETTINGS EDIT MODAL */}
      <AnimatePresence>
        {editingBookSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md rounded-3xl border border-emerald-400/30 bg-zinc-950 p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                  <Settings size={16} /> Configure Rental Rules
                </div>
                <button
                  onClick={() => setEditingBookSettings(null)}
                  className="text-white/40 hover:text-white"
                >
                  <XCircle size={18} />
                </button>
              </div>

              <h3 className="text-base font-black text-white line-clamp-1">
                {editingBookSettings.title}
              </h3>
              <p className="text-xs text-white/50 mb-4">by {editingBookSettings.author}</p>

              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-1">
                    Rental Fee (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={settingsForm.rentalPrice}
                    onChange={(e) => setSettingsForm({ ...settingsForm, rentalPrice: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-emerald-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-1">
                    Rental Period (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={settingsForm.rentalDurationDays}
                    onChange={(e) => setSettingsForm({ ...settingsForm, rentalDurationDays: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-emerald-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-1">
                    Late Fine Per Day (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={settingsForm.finePerDay}
                    onChange={(e) => setSettingsForm({ ...settingsForm, finePerDay: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-emerald-400 outline-none"
                  />
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setEditingBookSettings(null)}
                    className="w-1/3 rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-bold text-white hover:bg-white/10 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingSettings}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-400 py-2.5 text-xs font-black uppercase text-black hover:bg-emerald-300 transition"
                  >
                    {submittingSettings ? <Loader2 size={16} className="animate-spin" /> : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
