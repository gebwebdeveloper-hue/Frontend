import { useState, useEffect, useMemo } from "react";
import { ArrowRight, Star, X } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import BookCard from "../components/BookCard.jsx";
import { useGsapReveal } from "../hooks/useGsapReveal.js";
import { API_BASE } from "../config.js";

export default function BestsellingBooksSection() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAuthor, setSelectedAuthor] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/books?trending=true`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.books) {
          setBooks(data.books);
          // Find first available author
          const firstAuthor = data.books.find((b) => b.author)?.author;
          if (firstAuthor) {
            setSelectedAuthor(firstAuthor);
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const authors = useMemo(() => {
    const authorMap = new Map();
    books.forEach((book) => {
      if (!book.author) return;
      const current = authorMap.get(book.author) || 0;
      authorMap.set(book.author, current + 1);
    });
    return Array.from(authorMap, ([name, count]) => ({ name, count }));
  }, [books]);

  const displayedBooks = useMemo(() => {
    if (!selectedAuthor) return [];
    return books.filter((book) => book.author === selectedAuthor);
  }, [books, selectedAuthor]);

  const handleAuthorClick = (author) => {
    setSelectedAuthor(author);
  };

  const scope = useGsapReveal({
    stagger: 0.08,
  });

  return (
    <section
      ref={scope}
      className="relative w-full overflow-hidden border-t border-white/5 py-24"
    >
      {/* Background Glow */}
      <div className="pointer-events-none absolute left-0 top-24 h-72 w-72 rounded-full bg-indigo-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute right-0 bottom-0 h-80 w-80 rounded-full bg-cyan-500/10 blur-[140px]" />

      <div className="section-shell relative">
        {/* Top Header */}
        <div className="mb-16 flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-indigo-300"
            >
              BESTSELLING COLLECTION
            </motion.div>

            <h2 className="text-4xl font-extrabold leading-tight md:text-5xl max-w-2xl bg-gradient-to-r from-indigo-400 via-cyan-400 to-fuchsia-500 bg-clip-text text-transparent animate-text-gradient select-none">
              Best Selling Books
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-white/50 md:text-base">
              Explore the top-rated books currently trending and loved by thousands of readers across the platform.
            </p>
          </div>

          <div className="flex flex-col items-start gap-6 lg:items-end">
            <Link
              to="/library"
              className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 font-medium text-white transition hover:border-indigo-400/30 hover:bg-white/10"
            >
              Explore All Books
              <ArrowRight
                size={18}
                className="transition group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>

        {/* Authors Selector */}
        <div className="mb-12">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-200/75">Select Author</p>
              <h3 className="mt-2 text-2xl font-bold text-white md:text-3xl">Choose an author to view bestselling books</h3>
            </div>
            {selectedAuthor && (
              <button
                type="button"
                onClick={() => setSelectedAuthor(null)}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-cyan-300/30 hover:bg-white/15"
              >
                <X size={15} /> Clear selection
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-4">
            {loading && (
              <div className="rounded-full border border-white/10 bg-white/[0.055] px-6 py-3 text-sm font-semibold text-white/50">
                Loading authors...
              </div>
            )}

            {!loading && authors.length === 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.045] px-5 py-4 text-sm text-white/55">
                No bestselling books available yet.
              </div>
            )}

            {!loading &&
              authors.map((author) => {
                const isActive = selectedAuthor === author.name;

                return (
                  <motion.button
                    key={author.name}
                    type="button"
                    whileHover={{ y: -5, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAuthorClick(author.name)}
                    className={`group relative overflow-hidden rounded-full border px-6 py-3 text-left text-base font-bold transition md:text-lg ${
                      isActive
                        ? "border-cyan-300/45 bg-cyan-300/15 text-cyan-100 shadow-[0_0_34px_rgba(34,211,238,0.22)]"
                        : "border-indigo-300/20 bg-white/[0.055] text-indigo-100 hover:border-indigo-200/45 hover:bg-indigo-300/10 hover:shadow-[0_0_30px_rgba(99,102,241,0.18)]"
                    }`}
                  >
                    <span className="relative z-10">{author.name}</span>
                    <span className="relative z-10 ml-3 align-middle text-xs font-semibold text-white/45">
                      {author.count} {author.count === 1 ? "book" : "books"}
                    </span>
                    <span className="absolute inset-x-4 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-200/80 to-transparent opacity-0 transition group-hover:opacity-100" />
                  </motion.button>
                );
              })}
          </div>
        </div>

        {/* Books List for Selected Author */}
        {selectedAuthor && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.06] px-5 py-4 backdrop-blur-xl">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/75">Bestselling Author</p>
                <h3 className="mt-1 text-2xl font-bold text-white">
                  <span className="text-cyan-200 drop-shadow-[0_0_16px_rgba(34,211,238,0.48)]">{selectedAuthor}</span>
                </h3>
              </div>
              <span className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm font-semibold text-white/60">
                {displayedBooks.length} {displayedBooks.length === 1 ? "title" : "titles"}
              </span>
            </div>

            <div className="flex gap-7 overflow-x-auto pb-4 custom-scrollbar">
              {displayedBooks.map((book) => (
                <motion.div
                  key={book._id || book.title}
                  whileHover={{ y: -10 }}
                  transition={{ type: "spring", stiffness: 220 }}
                  className="w-[210px] shrink-0 sm:w-[245px]"
                >
                  <BookCard
                    book={book}
                    onAuthorClick={handleAuthorClick}
                    isAuthorActive={selectedAuthor === book.author}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
