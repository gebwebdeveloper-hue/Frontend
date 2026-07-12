import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Loader2, Search, Trash2, Pencil, ArrowLeft,
  Filter, X, ChevronDown, BadgeCheck, Clock, Flame, Star
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import PageTransition from "../components/PageTransition.jsx";
import { API_BASE, SERVER_URL } from "../config.js";

const CATEGORIES = [
  "All", "Story", "Poem", "Folklore", "Novel", "Drama",
  "Biography", "Essay", "Children Literature", "Other"
];

export default function AdminDatabasePage() {
  const navigate = useNavigate();

  // Auth
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);

  // Books
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [authorFilter, setAuthorFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [flagFilter, setFlagFilter] = useState("All"); // All | trending | ourPublication | featured | comingSoon
  const [showFilters, setShowFilters] = useState(false);

  // Auth check
  useEffect(() => {
    fetch(`${API_BASE}/auth/me`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.user?.role === "admin") {
          setAuthed(true);
        } else {
          navigate("/admin");
        }
      })
      .catch(() => navigate("/admin"))
      .finally(() => setChecking(false));
  }, [navigate]);

  // Fetch books
  const fetchBooks = () => {
    setLoading(true);
    fetch(`${API_BASE}/books?limit=100`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => { if (d.success) setBooks(d.books || []); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (authed) fetchBooks();
  }, [authed]);

  // Delete
  const handleDelete = (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    fetch(`${API_BASE}/books/${id}`, { method: "DELETE", credentials: "include" })
      .then((r) => r.json())
      .then((d) => { if (d.success) setBooks((prev) => prev.filter((b) => b._id !== id)); })
      .catch(() => alert("Failed to delete book."));
  };

  // Unique authors list for datalist
  const authorsList = useMemo(() => [...new Set(books.map((b) => b.author))].sort(), [books]);

  // Filtered books
  const filtered = useMemo(() => {
    return books.filter((b) => {
      const q = search.toLowerCase();
      const matchSearch = !q || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q);
      const matchAuthor = !authorFilter || b.author.toLowerCase().includes(authorFilter.toLowerCase());
      const matchCategory = categoryFilter === "All" || b.category === categoryFilter;
      const matchFlag =
        flagFilter === "All" ? true :
        flagFilter === "trending" ? b.trending :
        flagFilter === "ourPublication" ? b.ourPublication :
        flagFilter === "featured" ? b.featured :
        flagFilter === "comingSoon" ? b.comingSoon : true;
      return matchSearch && matchAuthor && matchCategory && matchFlag;
    });
  }, [books, search, authorFilter, categoryFilter, flagFilter]);

  if (checking) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-zinc-950 text-white pt-20 md:pt-28">
        {/* Header */}
        <div className="sticky top-[76px] md:top-[92px] z-30 border-b border-white/8 bg-zinc-950/90 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-6 py-4 flex items-center gap-4">
            <Link
              to="/admin"
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white transition"
            >
              <ArrowLeft size={15} /> Back to Admin
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-white">eBook Database</h1>
              <p className="text-xs text-white/40">{filtered.length} of {books.length} books</p>
            </div>
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm transition ${showFilters ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-300" : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"}`}
            >
              <Filter size={14} /> Filters
              {(authorFilter || categoryFilter !== "All" || flagFilter !== "All") && (
                <span className="ml-1 h-2 w-2 rounded-full bg-cyan-400 inline-block" />
              )}
            </button>
          </div>

          {/* Search bar */}
          <div className="mx-auto max-w-7xl px-6 pb-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title or author..."
                className="w-full rounded-xl border border-white/10 bg-white/5 pl-11 pr-4 py-3 text-sm text-white placeholder-white/25 focus:border-cyan-400/40 focus:bg-white/8 focus:outline-none"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition">
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Expanded filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden border-t border-white/8"
              >
                <div className="mx-auto max-w-7xl px-6 py-4 grid gap-4 md:grid-cols-3">
                  {/* Author filter */}
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-white/40 mb-2">Filter by Author</label>
                    <div className="relative">
                      <input
                        type="text"
                        list="authors-list"
                        value={authorFilter}
                        onChange={(e) => setAuthorFilter(e.target.value)}
                        placeholder="Type an author name..."
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/25 focus:border-cyan-400/40 focus:outline-none"
                      />
                      <datalist id="authors-list">
                        {authorsList.map((a) => <option key={a} value={a} />)}
                      </datalist>
                      {authorFilter && (
                        <button onClick={() => setAuthorFilter("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition">
                          <X size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Category filter */}
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-white/40 mb-2">Filter by Category</label>
                    <div className="relative">
                      <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-cyan-400/40 focus:outline-none"
                        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23ffffff66' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center" }}
                      >
                        {CATEGORIES.map((c) => <option key={c} value={c} style={{ background: "#0a0a0a" }}>{c}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Flag filter */}
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-white/40 mb-2">Filter by Status</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { key: "All", label: "All" },
                        { key: "trending", label: "Trending", icon: <Flame size={11} /> },
                        { key: "featured", label: "Bestselling", icon: <Star size={11} /> },
                        { key: "ourPublication", label: "Our Publication", icon: <BadgeCheck size={11} /> },
                        { key: "comingSoon", label: "Coming Soon", icon: <Clock size={11} /> },
                      ].map(({ key, label, icon }) => (
                        <button
                          key={key}
                          onClick={() => setFlagFilter(key)}
                          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                            flagFilter === key
                              ? "bg-cyan-400 text-black"
                              : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10"
                          }`}
                        >
                          {icon}{label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Active filters summary + clear */}
                {(authorFilter || categoryFilter !== "All" || flagFilter !== "All") && (
                  <div className="mx-auto max-w-7xl px-6 pb-4 flex items-center gap-3">
                    <span className="text-xs text-white/40">Active filters:</span>
                    {authorFilter && (
                      <span className="flex items-center gap-1.5 rounded-full bg-indigo-400/10 border border-indigo-400/20 px-3 py-1 text-xs text-indigo-300">
                        Author: {authorFilter}
                        <button onClick={() => setAuthorFilter("")}><X size={11} /></button>
                      </span>
                    )}
                    {categoryFilter !== "All" && (
                      <span className="flex items-center gap-1.5 rounded-full bg-fuchsia-400/10 border border-fuchsia-400/20 px-3 py-1 text-xs text-fuchsia-300">
                        {categoryFilter}
                        <button onClick={() => setCategoryFilter("All")}><X size={11} /></button>
                      </span>
                    )}
                    {flagFilter !== "All" && (
                      <span className="flex items-center gap-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 px-3 py-1 text-xs text-amber-300">
                        {flagFilter}
                        <button onClick={() => setFlagFilter("All")}><X size={11} /></button>
                      </span>
                    )}
                    <button
                      onClick={() => { setAuthorFilter(""); setCategoryFilter("All"); setFlagFilter("All"); }}
                      className="ml-auto text-xs text-white/30 hover:text-white/70 transition"
                    >
                      Clear all
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

        {/* Book Grid */}
        <div className="mx-auto max-w-7xl px-6 py-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Loader2 className="h-10 w-10 animate-spin text-cyan-400 mb-4" />
              <p className="text-sm text-white/40">Loading books...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center text-white/30">
              <BookOpen size={56} className="mb-4 opacity-20" />
              <p className="text-lg font-semibold">No books found</p>
              <p className="text-sm mt-1 text-white/20">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              <AnimatePresence>
                {filtered.map((book, i) => (
                  <motion.div
                    key={book._id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.03 }}
                    className="group relative flex flex-col rounded-2xl border border-white/8 bg-white/[0.03] hover:bg-white/[0.06] overflow-hidden transition"
                  >
                    {/* Cover */}
                    <div className="relative aspect-[3/4] w-full bg-zinc-900 overflow-hidden">
                      {book.cover?.url ? (
                        <img
                          src={book.cover.url.startsWith("http") ? book.cover.url : `${SERVER_URL}${book.cover.url}`}
                          alt={book.title}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-cyan-800 to-indigo-900 flex items-end p-4">
                          <p className="text-sm font-bold text-white leading-tight">{book.title}</p>
                        </div>
                      )}

                      {/* Flags */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {book.comingSoon && (
                          <span className="rounded-full bg-amber-400/90 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-widest text-black">Coming Soon</span>
                        )}
                        {book.trending && (
                          <span className="rounded-full bg-orange-500/90 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-widest text-white">Trending</span>
                        )}
                        {book.featured && (
                          <span className="rounded-full bg-yellow-400/90 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-widest text-black">Bestselling</span>
                        )}
                        {book.ourPublication && (
                          <span className="rounded-full bg-cyan-400/90 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-widest text-black">Our Publication</span>
                        )}
                      </div>

                      {/* Action overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
                        <Link
                          to="/admin"
                          state={{ editBookId: book._id }}
                          className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-400 text-black hover:bg-cyan-300 transition shadow-lg"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(book._id, book.title)}
                          className="grid h-10 w-10 place-items-center rounded-xl bg-red-500 text-white hover:bg-red-400 transition shadow-lg"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4 flex flex-col gap-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400/70">{book.category}</span>
                      <h3 className="font-bold text-white leading-snug line-clamp-2">{book.title}</h3>
                      <p className="text-xs text-white/45">by {book.author}</p>
                      <div className="mt-2 flex items-center justify-between text-xs text-white/35">
                        <span>{book.language || "English"}</span>
                        <span>{book.comingSoon ? "—" : `₹${book.price}`}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
