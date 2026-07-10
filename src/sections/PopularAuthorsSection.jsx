import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, BookOpen, ChevronRight, X } from "lucide-react";
import BookCard from "../components/BookCard.jsx";
import { API_BASE, SERVER_URL } from "../config.js";

function AuthorCard({ author, isSelected, onViewBooks }) {
  const thumbUrl = author.thumbnail?.url
    ? author.thumbnail.url.startsWith("/uploads")
      ? `${SERVER_URL}${author.thumbnail.url}`
      : author.thumbnail.url
    : null;

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 240, damping: 22 }}
      className={`group relative flex w-[160px] shrink-0 flex-col items-center overflow-hidden rounded-2xl border p-4 pb-4 text-center transition sm:w-[185px] ${
        isSelected
          ? "border-cyan-300/50 bg-cyan-300/10 shadow-[0_0_40px_rgba(34,211,238,0.2)]"
          : "border-white/10 bg-white/[0.04] hover:border-indigo-300/30 hover:bg-indigo-300/5"
      }`}
    >
      {/* Thumbnail */}
      <div
        className={`relative mb-3 h-20 w-20 overflow-hidden rounded-full border-2 transition ${
          isSelected ? "border-cyan-400/60" : "border-white/15 group-hover:border-indigo-300/40"
        }`}
      >
        {thumbUrl ? (
          <img
            src={thumbUrl}
            alt={author.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500/30 to-fuchsia-500/20">
            <User size={28} className="text-white/50" />
          </div>
        )}
      </div>

      <h3 className="line-clamp-2 text-xs font-bold leading-snug text-white">{author.name}</h3>
      <p className="mt-1 text-[10px] text-white/45">
        {author.bookCount ?? 0} {author.bookCount === 1 ? "book" : "books"}
      </p>

      {/* View Books button */}
      <button
        type="button"
        onClick={() => onViewBooks(author)}
        className={`mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border py-2 text-[11px] font-semibold transition ${
          isSelected
            ? "border-cyan-400/40 bg-cyan-400/15 text-cyan-200 hover:bg-cyan-400/25"
            : "border-white/10 bg-white/5 text-white/70 hover:border-indigo-300/35 hover:bg-indigo-300/10 hover:text-white"
        }`}
      >
        View Books <ChevronRight size={11} />
      </button>

      {/* Bottom active indicator */}
      {isSelected && (
        <motion.div
          layoutId="author-indicator"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 via-indigo-400 to-fuchsia-400"
        />
      )}
    </motion.div>
  );
}

export default function PopularAuthorsSection() {
  const [authors, setAuthors] = useState([]);
  const [selectedAuthor, setSelectedAuthor] = useState(null);
  const [authorBooks, setAuthorBooks] = useState([]);
  const [loadingAuthors, setLoadingAuthors] = useState(true);
  const [loadingBooks, setLoadingBooks] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/authors`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.authors?.length) {
          setAuthors(data.authors);
          // No auto-select — wait for "View Books" click
        }
      })
      .catch(() => {})
      .finally(() => setLoadingAuthors(false));
  }, []);

  const handleViewBooks = (author) => {
    // Toggle off if same author clicked again
    if (selectedAuthor?._id === author._id) {
      setSelectedAuthor(null);
      setAuthorBooks([]);
      return;
    }
    setSelectedAuthor(author);
    setLoadingBooks(true);
    fetch(`${API_BASE}/books?author=${encodeURIComponent(author.name)}&limit=20`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setAuthorBooks(data.books || []);
      })
      .catch(() => setAuthorBooks([]))
      .finally(() => setLoadingBooks(false));
  };

  if (loadingAuthors) {
    return (
      <div className="mb-14">
        <div className="mb-5 h-6 w-48 animate-pulse rounded-lg bg-white/5" />
        <div className="flex gap-4 overflow-x-auto pb-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-[220px] w-[160px] shrink-0 animate-pulse rounded-2xl bg-white/5 sm:w-[185px]" />
          ))}
        </div>
      </div>
    );
  }

  if (!authors.length) return null;

  return (
    <div className="mb-14">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-300/80">Explore Authors</p>
          <h2 className="mt-1 text-xl font-bold text-white">Popular Authors</h2>
        </div>
        {selectedAuthor && (
          <button
            type="button"
            onClick={() => { setSelectedAuthor(null); setAuthorBooks([]); }}
            className="flex items-center gap-1.5 text-xs font-semibold text-white/40 transition hover:text-white/70"
          >
            <X size={13} /> Close
          </button>
        )}
      </div>

      {/* Author cards horizontal scroll */}
      <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
        {authors.map((author) => (
          <AuthorCard
            key={author._id}
            author={author}
            isSelected={selectedAuthor?._id === author._id}
            onViewBooks={handleViewBooks}
          />
        ))}
      </div>

      {/* Books for selected author — only shown after clicking View Books */}
      <AnimatePresence mode="wait">
        {selectedAuthor && (
          <motion.div
            key={selectedAuthor._id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28 }}
            className="mt-8"
          >
            {/* Author label bar */}
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-indigo-300/15 bg-indigo-300/[0.05] px-5 py-3.5 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-white">
                  Books by{" "}
                  <span className="bg-gradient-to-r from-indigo-300 to-cyan-300 bg-clip-text text-transparent">
                    {selectedAuthor.name}
                  </span>
                </span>
              </div>
              <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-semibold text-white/50">
                {authorBooks.length} {authorBooks.length === 1 ? "title" : "titles"}
              </span>
            </div>

            {loadingBooks ? (
              <div className="flex gap-5 overflow-x-auto pb-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-[340px] w-[210px] shrink-0 animate-pulse rounded-2xl bg-white/5 sm:w-[245px]" />
                ))}
              </div>
            ) : authorBooks.length === 0 ? (
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-6 py-10 text-center">
                <BookOpen size={28} className="mx-auto mb-3 text-white/20" />
                <p className="text-sm text-white/40">No books found for this author yet.</p>
              </div>
            ) : (
              <div className="flex gap-5 overflow-x-auto pb-4 custom-scrollbar">
                {authorBooks.map((book) => (
                  <motion.div
                    key={book._id}
                    whileHover={{ y: -8 }}
                    transition={{ type: "spring", stiffness: 220 }}
                    className="w-[210px] shrink-0 sm:w-[245px]"
                  >
                    <BookCard book={book} />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
