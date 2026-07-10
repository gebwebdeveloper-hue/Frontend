import { useState, useEffect, useMemo } from "react";
import { ArrowRight, BookOpen, Users, LibraryBig, X } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import BookCard from "../components/BookCard.jsx";
import { useGsapReveal } from "../hooks/useGsapReveal.js";
import { API_BASE } from "../config.js";

const stats = [
  {
    icon: BookOpen,
    value: "250+",
    label: "Premium Books",
  },
  {
    icon: LibraryBig,
    value: "45+",
    label: "Categories",
  },
  {
    icon: Users,
    value: "10K+",
    label: "Readers",
  },
];

export default function FeaturedBooksSection() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAuthor, setSelectedAuthor] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/books?featured=true`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.books) {
          setBooks(data.books);
        } else {
          setBooks([]);
        }
      })
      .catch(() => {
        setBooks([]);
      })
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
      className="relative w-full overflow-hidden"
    >
      {/* Background Video */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none select-none">
        <video
          src="/Animation_of_turning_books_202607101857.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover opacity-[0.14]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#030303] via-transparent to-[#030303]" />
      </div>

      {/* Background Glow */}
      <div className="pointer-events-none absolute left-0 top-24 h-72 w-72 rounded-full bg-cyan-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute right-0 bottom-0 h-80 w-80 rounded-full bg-fuchsia-500/10 blur-[140px]" />

      <div className="section-shell">

      {/* Top */}

      <div className="mb-16 flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">

        <div>

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
            }}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300"
          >
            FEATURED COLLECTION
          </motion.div>

           <h2 className="text-4xl font-extrabold leading-tight md:text-5xl max-w-2xl bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-indigo-500 bg-clip-text text-transparent animate-text-gradient select-none">
            Our Publications
          </h2>
          <h3 className="mt-3.5 text-lg font-semibold text-white/90 md:text-xl">
            Curated ebooks built for deep reading.
          </h3>
          <p className="mt-4 max-w-xl text-sm leading-6 text-white/50 md:text-base">
            Explore thoughtfully selected books crafted for developers, designers, entrepreneurs and lifelong learners.
          </p>
        </div>

        <div className="flex flex-col items-start gap-6 lg:items-end">

          <Link
            to="/library"
            className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 font-medium text-white transition hover:border-cyan-400/30 hover:bg-white/10"
          >
            View Entire Library

            <ArrowRight
              size={18}
              className="transition group-hover:translate-x-1"
            />
          </Link>

          <div className="flex flex-wrap gap-4">
            {stats.map((item) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.label}
                  whileHover={{
                    y: -6,
                  }}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 backdrop-blur-xl"
                >
                  <div className="mb-3 flex items-center gap-3">

                    <div className="rounded-xl bg-cyan-400/10 p-2 text-cyan-300">
                      <Icon size={18} />
                    </div>

                    <div className="text-2xl font-bold text-white">
                      {item.value}
                    </div>

                  </div>

                  <div className="text-sm text-white/55">
                    {item.label}
                  </div>
                </motion.div>
              );
            })}
          </div>

        </div>

      </div>

      <div className="mb-8">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/75">Select Author</p>
            <h3 className="mt-2 text-2xl font-bold text-white md:text-3xl">Choose an author to view books</h3>
          </div>
          {selectedAuthor && (
            <button
              type="button"
              onClick={() => setSelectedAuthor(null)}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-fuchsia-300/30 hover:bg-white/15"
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
              No featured authors available yet.
            </div>
          )}

          {!loading && authors.map((author) => {
            const isActive = selectedAuthor === author.name;

            return (
              <motion.button
                key={author.name}
                type="button"
                data-reveal
                whileHover={{ y: -5, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleAuthorClick(author.name)}
                className={`group relative overflow-hidden rounded-full border px-6 py-3 text-left text-base font-bold transition md:text-lg ${
                  isActive
                    ? "border-fuchsia-300/45 bg-fuchsia-300/15 text-fuchsia-100 shadow-[0_0_34px_rgba(217,70,239,0.22)]"
                    : "border-cyan-300/20 bg-white/[0.055] text-cyan-100 hover:border-cyan-200/45 hover:bg-cyan-300/10 hover:shadow-[0_0_30px_rgba(34,211,238,0.18)]"
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

      {selectedAuthor && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.06] px-5 py-4 backdrop-blur-xl">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/75">Showing Books</p>
              <h3 className="mt-1 text-2xl font-bold text-white">
                <span className="text-fuchsia-200 drop-shadow-[0_0_16px_rgba(217,70,239,0.48)]">{selectedAuthor}</span>
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
                data-reveal
                whileHover={{
                  y: -10,
                }}
                transition={{
                  type: "spring",
                  stiffness: 220,
                }}
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

      {/* Bottom CTA */}

      <motion.div
        initial={{
          opacity: 0,
          y: 40,
        }}
        whileInView={{
          opacity: 1,
          y: 0,
        }}
        viewport={{
          once: true,
        }}
        className="mt-20 flex flex-col items-center justify-between gap-8 rounded-3xl border border-white/10 bg-gradient-to-r from-white/[0.04] to-white/[0.02] p-10 backdrop-blur-xl lg:flex-row"
      >
        <div>

          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">
            Start Reading Today
          </p>

          <h3 className="mt-3 text-3xl font-bold text-white">
            Thousands of pages. One beautiful reading experience.
          </h3>

          <p className="mt-3 max-w-xl text-white/60">
            Purchase once, unlock forever, and enjoy a distraction-free
            premium reading interface across all your devices.
          </p>

        </div>

        <Link
          to="/library"
          className="group flex items-center gap-3 rounded-full bg-white px-8 py-4 font-semibold text-black transition hover:scale-105"
        >
          Browse All Books

          <ArrowRight
            size={18}
            className="transition group-hover:translate-x-1"
          />
        </Link>

      </motion.div>
      </div>
    </section>
  );
}






