import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import BookCard from "../components/BookCard.jsx";
import { API_BASE } from "../config.js";

export default function LibraryFeaturedSection() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/books?trending=true&limit=20`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setBooks(data.books || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mb-14">
        <div className="mb-5 h-6 w-56 animate-pulse rounded-lg bg-white/5" />
        <div className="flex gap-5 overflow-x-auto pb-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-[340px] w-[210px] shrink-0 animate-pulse rounded-2xl bg-white/5 sm:w-[245px]" />
          ))}
        </div>
      </div>
    );
  }

  if (!books.length) return null;

  return (
    <div className="mb-10">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-fuchsia-300/80">Trending Now</p>
          <h2 className="mt-1 text-xl font-bold text-white">Trending eBooks</h2>
        </div>
      </div>

      <div className="flex gap-5 overflow-x-auto pb-4 custom-scrollbar">
        {books.map((book, i) => (
          <motion.div
            key={book._id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04 }}
            whileHover={{ y: -8 }}
            className="w-[210px] shrink-0 sm:w-[245px]"
          >
            <BookCard book={book} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
