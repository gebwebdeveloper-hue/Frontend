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

  // Modal state for adding NEW Rental-Only Book
  const [showAddRentalModal, setShowAddRentalModal] = useState(false);
  const [newRentalBook, setNewRentalBook] = useState({
    title: "",
    author: "",
    category: "Novel",
    customCategory: "",
    description: "",
    rentalPrice: "50",
    rentalDurationDays: "15",
    finePerDay: "5",
    coverFile: null,
    coverPreview: null,
  });
  const [submittingNewRental, setSubmittingNewRental] = useState(false);

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

  // Lock background scroll & stop Lenis smooth scroll when any modal is open
  useEffect(() => {
    const isAnyModalOpen = Boolean(showAddRentalModal || editingBookSettings);
    if (isAnyModalOpen) {
      const prevBodyOverflow = document.body.style.overflow;
      const prevHtmlOverflow = document.documentElement.style.overflow;

      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      if (window.lenis) window.lenis.stop();

      return () => {
        document.body.style.overflow = prevBodyOverflow || "unset";
        document.documentElement.style.overflow = prevHtmlOverflow || "unset";
        if (window.lenis) window.lenis.start();
      };
    }
  }, [showAddRentalModal, editingBookSettings]);

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

  // Create New Rental-Only Book Handler
  const handleCreateRentalOnlyBook = async (e) => {
    e.preventDefault();
    if (!newRentalBook.title.trim() || !newRentalBook.author.trim()) {
      showNotification("error", "Book title and author are required.");
      return;
    }
    if (!newRentalBook.description.trim()) {
      showNotification("error", "Description is required.");
      return;
    }
    if (!newRentalBook.coverFile) {
      showNotification("error", "Please upload a book cover image.");
      return;
    }

    setSubmittingNewRental(true);
    try {
      const formData = new FormData();
      formData.append("title", newRentalBook.title.trim());
      formData.append("author", newRentalBook.author.trim());
      const finalCategory =
        newRentalBook.category === "Custom"
          ? newRentalBook.customCategory.trim()
          : newRentalBook.category;
      formData.append("category", finalCategory || "General");
      formData.append("description", newRentalBook.description.trim());
      formData.append("price", "0"); // 0 for purchase since it's physical rental only
      formData.append("isRentalAvailable", "true");
      formData.append("isRentalOnly", "true");
      formData.append("rentalPrice", newRentalBook.rentalPrice || "50");
      formData.append("rentalDurationDays", newRentalBook.rentalDurationDays || "15");
      formData.append("finePerDay", newRentalBook.finePerDay || "5");
      formData.append("cover", newRentalBook.coverFile);

      const res = await fetch(`${API_BASE}/books`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showNotification("success", `🎉 "${data.book.title}" added to Rental Books Catalog!`);
        setShowAddRentalModal(false);
        setNewRentalBook({
          title: "",
          author: "",
          category: "Novel",
          customCategory: "",
          description: "",
          rentalPrice: "50",
          rentalDurationDays: "15",
          finePerDay: "5",
          coverFile: null,
          coverPreview: null,
        });
        fetchBooksList();
        if (onCatalogUpdated) onCatalogUpdated();
      } else {
        showNotification("error", data.message || "Failed to create rental book.");
      }
    } catch {
      showNotification("error", "Server connection error creating rental book.");
    } finally {
      setSubmittingNewRental(false);
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
              Manage your physical rental book catalog or add new rental-only titles to feature on{" "}
              <strong className="text-emerald-300">Rent Books</strong> page.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
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

            {/* ADD NEW RENTAL-ONLY BOOK BUTTON */}
            <button
              onClick={() => setShowAddRentalModal(true)}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 px-5 py-3 text-xs font-black uppercase tracking-wider text-black shadow-lg shadow-emerald-400/20 hover:scale-105 transition cursor-pointer"
            >
              <PlusCircle size={16} /> Add Rental-Only Book
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
            className="rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-xs font-bold text-white outline-none focus:border-emerald-400 cursor-pointer"
          >
            {categoriesList.map((cat) => (
              <option key={cat} value={cat}>
                Category: {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Books Grid */}
      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center text-white/50">
          <BookOpen className="mx-auto mb-3 h-10 w-10 text-white/30" />
          <p className="text-sm font-semibold">No books match your criteria.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredBooks.map((book) => {
            const isListed = book.isRentalAvailable;
            const coverUrl = book.cover?.url
              ? book.cover.url.startsWith("http")
                ? book.cover.url
                : `${SERVER_URL}${book.cover.url}`
              : null;

            return (
              <div
                key={book._id}
                className={`relative flex flex-col justify-between rounded-3xl border p-4 transition-all duration-300 ${
                  isListed
                    ? "border-emerald-400/40 bg-emerald-950/20 shadow-lg shadow-emerald-400/10"
                    : "border-white/10 bg-white/[0.03] opacity-75 hover:opacity-100"
                }`}
              >
                {/* Book Header info */}
                <div>
                  <div className="flex items-start gap-3">
                    {coverUrl ? (
                      <img
                        src={coverUrl}
                        alt={book.title}
                        className="h-20 w-14 rounded-xl object-cover shadow-md shrink-0 border border-white/10"
                      />
                    ) : (
                      <div className="grid h-20 w-14 place-items-center rounded-xl bg-zinc-800 text-[10px] font-bold text-white/40 text-center shrink-0">
                        COVER
                      </div>
                    )}

                    <div className="overflow-hidden flex-1">
                      <span className="inline-block rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-bold text-white/70 mb-1">
                        {book.category || "General"}
                      </span>
                      <h4 className="font-extrabold text-white text-sm line-clamp-1">{book.title}</h4>
                      <p className="text-xs text-white/50 line-clamp-1">by {book.author}</p>
                      
                      {book.isRentalOnly && (
                        <span className="inline-block mt-1 rounded-full bg-cyan-400/20 border border-cyan-400/30 px-2 py-0.5 text-[9px] font-black text-cyan-300">
                          📘 Rental-Only Title
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Rental Pricing specs */}
                  <div className="mt-4 rounded-2xl border border-white/10 bg-black/40 p-3 space-y-1.5 text-xs">
                    <div className="flex justify-between text-white/70">
                      <span>Rental Fee:</span>
                      <strong className="text-emerald-300 font-extrabold">
                        ₹{book.rentalPrice || 50} / {book.rentalDurationDays || 15} Days
                      </strong>
                    </div>
                    <div className="flex justify-between text-white/50 text-[11px]">
                      <span>Late Fine:</span>
                      <span className="text-amber-300 font-bold">₹{book.finePerDay || 5}/day</span>
                    </div>
                  </div>
                </div>

                {/* Toggle & Settings buttons */}
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2">
                  <button
                    onClick={() => handleToggleRentalStatus(book)}
                    disabled={updatingId === book._id}
                    className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-xs font-black uppercase transition cursor-pointer ${
                      isListed
                        ? "bg-emerald-400 text-black hover:bg-emerald-300"
                        : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                    }`}
                  >
                    {updatingId === book._id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : isListed ? (
                      <>
                        <Check size={14} /> LISTED FOR RENT
                      </>
                    ) : (
                      <>
                        <PlusCircle size={14} /> ENABLE RENTAL
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleOpenSettings(book)}
                    className="p-2 rounded-xl border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition cursor-pointer"
                    title="Edit rental fee, period & fines"
                  >
                    <Settings size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Edit Settings for Existing Book */}
      <AnimatePresence>
        {editingBookSettings && (
          <div
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md rounded-3xl border border-emerald-400/30 bg-zinc-950 p-6 text-white shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="font-extrabold text-white text-base">
                  Rental Settings: {editingBookSettings.title}
                </h3>
                <button
                  onClick={() => setEditingBookSettings(null)}
                  className="rounded-full p-1 text-white/50 hover:bg-white/10 hover:text-white"
                >
                  <XCircle size={18} />
                </button>
              </div>

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

      {/* Modal: Add New Rental-Only Book */}
      <AnimatePresence>
        {showAddRentalModal && (
          <div
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-hidden"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-lg rounded-3xl border border-emerald-400/30 bg-zinc-950 p-6 text-white shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-500/30 scrollbar-track-transparent my-auto"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl border border-emerald-400/30 bg-emerald-400/10 text-emerald-400">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-white text-base">Add New Rental-Only Book</h3>
                    <p className="text-[11px] text-emerald-300/80 font-medium">
                      📘 Physical Rental Book (Not an Ebook / PDF)
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddRentalModal(false)}
                  className="rounded-full p-1.5 text-white/50 hover:bg-white/10 hover:text-white cursor-pointer"
                >
                  <XCircle size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateRentalOnlyBook} className="space-y-4 text-xs">
                {/* Book Title */}
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-white/80 mb-1">
                    Book Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newRentalBook.title}
                    onChange={(e) => setNewRentalBook({ ...newRentalBook, title: e.target.value })}
                    placeholder="e.g. Rajbarir Guptodhon"
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs text-white placeholder-white/30 focus:border-emerald-400 outline-none"
                  />
                </div>

                {/* Author & Category */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-white/80 mb-1">
                      Author Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newRentalBook.author}
                      onChange={(e) => setNewRentalBook({ ...newRentalBook, author: e.target.value })}
                      placeholder="Author name"
                      className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs text-white placeholder-white/30 focus:border-emerald-400 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-white/80 mb-1">
                      Category *
                    </label>
                    <select
                      value={newRentalBook.category}
                      onChange={(e) => setNewRentalBook({ ...newRentalBook, category: e.target.value })}
                      className="w-full rounded-xl border border-white/15 bg-zinc-900 px-3 py-2.5 text-xs text-white focus:border-emerald-400 outline-none cursor-pointer"
                    >
                      <option value="Novel">Novel</option>
                      <option value="Story">Story</option>
                      <option value="Poetry">Poetry</option>
                      <option value="Drama">Drama</option>
                      <option value="History">History</option>
                      <option value="Thriller">Thriller</option>
                      <option value="Custom">+ Custom Category</option>
                    </select>
                  </div>
                </div>

                {newRentalBook.category === "Custom" && (
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-white/80 mb-1">
                      Custom Category Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newRentalBook.customCategory}
                      onChange={(e) => setNewRentalBook({ ...newRentalBook, customCategory: e.target.value })}
                      placeholder="Enter custom category"
                      className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs text-white placeholder-white/30 focus:border-emerald-400 outline-none"
                    />
                  </div>
                )}

                {/* Cover Image Upload */}
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-white/80 mb-1">
                    Book Cover Image *
                  </label>
                  <p className="text-[10px] text-white/55 mb-2">
                    Best Fit: <strong className="text-emerald-300 font-bold">600 × 800 px (3:4 ratio)</strong> | Max Size: <strong className="text-amber-300 font-bold">5 MB</strong> | Formats: <strong className="text-cyan-300 font-mono">.JPG, .JPEG, .PNG, .WEBP</strong>
                  </p>

                  <div className="flex items-center gap-3">
                    {newRentalBook.coverPreview ? (
                      <img
                        src={newRentalBook.coverPreview}
                        alt="Cover Preview"
                        className="h-16 w-12 rounded-lg object-cover border border-emerald-400/40 shrink-0 shadow"
                      />
                    ) : (
                      <div className="grid h-16 w-12 place-items-center rounded-lg border border-dashed border-white/20 bg-white/5 text-[9px] font-bold text-white/40 text-center p-1 shrink-0">
                        COVER
                      </div>
                    )}

                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                      required
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 5 * 1024 * 1024) {
                            showNotification("error", "File size exceeds 5 MB limit. Please select a smaller image.");
                            e.target.value = "";
                            return;
                          }
                          setNewRentalBook({
                            ...newRentalBook,
                            coverFile: file,
                            coverPreview: URL.createObjectURL(file),
                          });
                        }
                      }}
                      className="text-xs text-white/70 file:mr-3 file:rounded-xl file:border-0 file:bg-emerald-400/20 file:px-3 file:py-2 file:text-xs file:font-bold file:text-emerald-300 hover:file:bg-emerald-400/30 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Rental Settings Grid */}
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-white/80 mb-1">
                      Rental Fee (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={newRentalBook.rentalPrice}
                      onChange={(e) => setNewRentalBook({ ...newRentalBook, rentalPrice: e.target.value })}
                      className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-white focus:border-emerald-400 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-white/80 mb-1">
                      Period (Days)
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={newRentalBook.rentalDurationDays}
                      onChange={(e) => setNewRentalBook({ ...newRentalBook, rentalDurationDays: e.target.value })}
                      className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-white focus:border-emerald-400 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-white/80 mb-1">
                      Fine / Day (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={newRentalBook.finePerDay}
                      onChange={(e) => setNewRentalBook({ ...newRentalBook, finePerDay: e.target.value })}
                      className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-white focus:border-emerald-400 outline-none"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-white/80 mb-1">
                    Book Synopsis / Description *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={newRentalBook.description}
                    onChange={(e) => setNewRentalBook({ ...newRentalBook, description: e.target.value })}
                    placeholder="Enter short description of the book..."
                    className="w-full rounded-xl border border-white/15 bg-white/5 p-3 text-xs text-white placeholder-white/30 focus:border-emerald-400 outline-none"
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddRentalModal(false)}
                    className="w-1/3 rounded-xl border border-white/10 bg-white/5 py-3 text-xs font-bold text-white hover:bg-white/10 transition cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submittingNewRental}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 py-3 text-xs font-black uppercase text-black shadow-lg shadow-emerald-400/20 hover:scale-[1.02] transition disabled:opacity-60 cursor-pointer"
                  >
                    {submittingNewRental ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> Adding Book...
                      </>
                    ) : (
                      <>
                        <PlusCircle size={16} /> Save Rental Book
                      </>
                    )}
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
