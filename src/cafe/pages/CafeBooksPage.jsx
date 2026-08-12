import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Feather, ArrowRight, X, Sparkles, Search } from "lucide-react";
import { API_BASE } from "../../config.js";

export default function CafeBooksPage() {
  const [books, setBooks] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [bookSearch, setBookSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedBook, setSelectedBook] = useState(null);

  useEffect(() => {
    async function fetchLibraryBooks() {
      setLoadingBooks(true);
      try {
        const res = await fetch(`${API_BASE}/books?limit=40`);
        const data = await res.json();
        if (data?.success && data?.data?.books) {
          setBooks(data.data.books);
        } else if (Array.isArray(data?.books)) {
          setBooks(data.books);
        }
      } catch {
        /* ignore */
      } finally {
        setLoadingBooks(false);
      }
    }
    fetchLibraryBooks();
  }, []);

  /* Lock body background scroll when modal is open */
  useEffect(() => {
    if (selectedBook) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedBook]);

  /* Extract unique categories */
  const categories = useMemo(() => {
    const set = new Set(["All"]);
    books.forEach((b) => {
      if (b.category) set.add(b.category);
    });
    return Array.from(set);
  }, [books]);

  /* Filter books */
  const filteredBooks = useMemo(() => {
    return books.filter((b) => {
      const matchesCategory =
        selectedCategory === "All" ||
        b.category?.toLowerCase() === selectedCategory.toLowerCase();
      const q = bookSearch.trim().toLowerCase();
      const matchesSearch =
        !q ||
        b.title?.toLowerCase().includes(q) ||
        b.author?.toLowerCase().includes(q) ||
        b.description?.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [books, selectedCategory, bookSearch]);

  return (
    <div className="min-h-screen text-[#FAF5EB] pb-24" style={{ background: "#140803" }}>
      {/* Hero Banner */}
      <section className="relative overflow-hidden border-b border-[#D4A85A]/20 bg-[#170A04] px-6 py-20 lg:py-24 text-center">
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-[#D4A85A]/10 blur-[120px]" />
        
        <div className="relative z-10 mx-auto max-w-4xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#D4A85A]/40 bg-[#23120A] px-4.5 py-1.5 text-xs font-black uppercase tracking-[0.25em] text-[#D4A85A] shadow-lg mb-6">
            <BookOpen size={14} /> LEKHOK TRIPURA CAFE LIBRARY
          </span>

          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-black uppercase text-[#FAF5EB] tracking-tight leading-tight animate-gold-shimmer drop-shadow-md"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Books in Cafe
          </h1>

          <p className="mt-4 text-base sm:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
            Browse our in-house cafe library collection. Pick up any book, enjoy a hot coffee, and read freely at our Readers &amp; Writers Corner.
          </p>

          {/* Search bar */}
          <div className="mt-8 relative max-w-lg mx-auto">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4A85A]" />
            <input
              type="text"
              placeholder="Search by book title, author, or keywords…"
              value={bookSearch}
              onChange={(e) => setBookSearch(e.target.value)}
              className="w-full rounded-2xl border-2 border-[#D4A85A]/40 bg-[#140803] py-3.5 pl-12 pr-4 text-xs font-bold text-[#FAF5EB] placeholder-white/40 outline-none focus:border-[#D4A85A] transition shadow-xl"
            />
            {bookSearch && (
              <button
                onClick={() => setBookSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#D4A85A] hover:underline"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          {categories.length > 1 && (
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full px-4 py-1.5 text-xs font-bold transition duration-300 ${
                    selectedCategory === cat
                      ? "bg-[#D4A85A] text-[#140803] shadow-md"
                      : "border border-[#D4A85A]/30 bg-[#23120A] text-white/70 hover:border-[#D4A85A] hover:text-[#FAF5EB]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Main Grid */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        {loadingBooks ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse rounded-3xl bg-[#D4A85A]/10 h-80" />
            ))}
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen size={56} className="mx-auto mb-4 text-[#D4A85A]/30" />
            <p className="text-lg font-bold text-[#FAF5EB]/60">No books match your criteria</p>
            <p className="text-xs text-white/40 mt-1">Try clearing your search query or selecting another category.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredBooks.map((book) => {
              const coverUrl = book.cover?.url || "/placeholder-book.png";
              return (
                <motion.div
                  key={book._id || book.slug}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setSelectedBook(book)}
                  className="group relative flex flex-col overflow-hidden rounded-3xl border border-[#D4A85A]/25 bg-[#23120A] shadow-xl hover:border-[#D4A85A]/60 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl cursor-pointer"
                >
                  {/* Cover Image Container */}
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#140803] flex items-center justify-center">
                    {coverUrl ? (
                      <img
                        src={coverUrl}
                        alt={book.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <BookOpen size={48} className="text-[#D4A85A]/40" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#23120A] via-transparent to-transparent opacity-80" />

                    {/* Category Badge */}
                    {book.category && (
                      <span className="absolute top-3 left-3 rounded-full bg-[#D4A85A] px-3 py-1 text-[10px] font-black uppercase text-[#140803] shadow-md tracking-wider">
                        {book.category}
                      </span>
                    )}

                    {/* Library Available Tag */}
                    <span className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-black/80 backdrop-blur-md px-2.5 py-1 text-[9px] font-bold text-emerald-400 border border-emerald-500/30">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Available in Cafe
                    </span>
                  </div>

                  {/* Book Info */}
                  <div className="flex flex-1 flex-col p-5">
                    <h3
                      className="text-base font-black leading-snug text-[#FAF5EB] uppercase line-clamp-1 group-hover:text-[#D4A85A] transition"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                    >
                      {book.title}
                    </h3>

                    <p className="mt-1 text-xs font-semibold text-[#D4A85A] flex items-center gap-1">
                      <Feather size={12} /> By {book.author}
                    </p>

                    {book.description && (
                      <p className="mt-2.5 text-xs text-white/60 line-clamp-3 leading-relaxed">
                        {book.description}
                      </p>
                    )}

                    {/* Card Footer */}
                    <div className="mt-auto pt-4 border-t border-[#D4A85A]/15 flex items-center justify-between text-[11px] font-bold text-white/50">
                      <span>{book.pages ? `${book.pages} Pages` : book.language || "English"}</span>
                      <span className="text-[#D4A85A] group-hover:underline flex items-center gap-1">
                        View Details <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* Book Details Modal */}
      <AnimatePresence>
        {selectedBook && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBook(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              data-lenis-prevent
              className="relative z-10 w-full max-w-2xl overflow-hidden rounded-3xl bg-[#23120A] p-6 shadow-2xl border border-[#D4A85A]/40 text-[#FAF5EB]"
            >
              <button
                onClick={() => setSelectedBook(null)}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition"
              >
                <X size={16} />
              </button>

              <div className="grid gap-6 sm:grid-cols-5">
                {/* Book Cover */}
                <div className="sm:col-span-2">
                  <div className="aspect-[3/4] w-full overflow-hidden rounded-2xl bg-[#140803] border border-[#D4A85A]/30 flex items-center justify-center">
                    {selectedBook.cover?.url ? (
                      <img
                        src={selectedBook.cover.url}
                        alt={selectedBook.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <BookOpen size={48} className="text-[#D4A85A]/40" />
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="sm:col-span-3 flex flex-col">
                  <span className="inline-block self-start rounded-full bg-[#D4A85A] px-3 py-0.5 text-[10px] font-black uppercase text-[#140803] mb-2">
                    {selectedBook.category || "Library Collection"}
                  </span>

                  <h3
                    className="text-2xl font-black text-[#FAF5EB] uppercase leading-tight"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    {selectedBook.title}
                  </h3>

                  <p className="mt-1 text-sm font-bold text-[#D4A85A]">
                    Author: {selectedBook.author}
                  </p>

                  <div className="mt-3 flex gap-3 text-xs text-white/60">
                    {selectedBook.pages > 0 && <span>📖 {selectedBook.pages} Pages</span>}
                    {selectedBook.language && <span>🌐 {selectedBook.language}</span>}
                  </div>

                  <div
                    data-lenis-prevent
                    onWheel={(e) => e.stopPropagation()}
                    className="mt-4 flex-1 overflow-y-auto max-h-56 pr-2.5 text-xs text-white/80 leading-relaxed border-t border-[#D4A85A]/20 pt-3 space-y-2 overscroll-contain"
                    style={{
                      scrollbarWidth: "thin",
                      scrollbarColor: "#D4A85A #140803",
                    }}
                  >
                    <p className="font-bold text-[#D4A85A]">Description:</p>
                    <p>{selectedBook.description}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#D4A85A]/20 flex items-center justify-between">
                    <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> Available in Cafe Library
                    </span>
                    <button
                      onClick={() => setSelectedBook(null)}
                      className="rounded-xl bg-[#D4A85A] px-5 py-2 text-xs font-black text-[#140803] hover:bg-white transition"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
