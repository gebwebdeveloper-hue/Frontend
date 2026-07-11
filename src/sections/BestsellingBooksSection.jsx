import { useState, useEffect } from "react";
import { ArrowRight, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import BookCard from "../components/BookCard.jsx";
import { useGsapReveal } from "../hooks/useGsapReveal.js";
import { API_BASE } from "../config.js";

export default function BestsellingBooksSection() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/books?featured=true`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.books) {
          setBooks(data.books);
        }
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const scope = useGsapReveal({
    stagger: 0.08,
  });

  return (
    <section
      ref={scope}
      className="relative w-full overflow-hidden border-t border-white/5 py-0"
    >
      {/* Background Glow */}
      <div className="pointer-events-none absolute left-0 top-24 h-72 w-72 rounded-full bg-indigo-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute right-0 bottom-0 h-80 w-80 rounded-full bg-cyan-500/10 blur-[140px]" />

      <div className="section-shell relative !pt-8 md:!pt-12">
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

        {/* Books Carousel Row */}
        <div className="relative rounded-[2.5rem] border border-white/5 bg-white/[0.015] p-8 md:p-10 backdrop-blur-3xl overflow-hidden shadow-2xl">
          {/* Subtle Grid Pattern Overlay */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.03] mix-blend-overlay bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:24px_24px]" />
          
          {/* Glowing Gradient blob behind books */}
          <div className="pointer-events-none absolute -inset-10 bg-[radial-gradient(circle_at_50%_110%,rgba(99,102,241,0.12),rgba(6,182,212,0.08)_40%,transparent_70%)] opacity-90 blur-3xl" />
          
          <div className="relative z-10">
            {loading ? (
              <div className="flex gap-7 overflow-x-auto pb-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-[380px] w-[210px] shrink-0 animate-pulse rounded-2xl bg-white/5 sm:w-[245px]" />
                ))}
              </div>
            ) : books.length === 0 ? (
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-6 py-12 text-center">
                <BookOpen size={32} className="mx-auto mb-4 text-white/20" />
                <p className="text-base font-semibold text-white/60">No bestselling books added yet</p>
                <p className="mt-1 text-sm text-white/35">Trending books uploaded by admin will appear here.</p>
              </div>
            ) : (
              <div className="flex gap-7 overflow-x-auto pb-4 custom-scrollbar">
                {books.map((book) => (
                  <motion.div
                    key={book._id || book.title}
                    whileHover={{ y: -10 }}
                    transition={{ type: "spring", stiffness: 220 }}
                    className="w-[210px] shrink-0 sm:w-[245px]"
                  >
                    <BookCard book={book} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
