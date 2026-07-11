import { useState, useEffect } from "react";
import { ArrowRight, BookOpen, Users, LibraryBig } from "lucide-react";
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

  useEffect(() => {
    fetch(`${API_BASE}/books?ourPublication=true`)
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

        {/* Books Carousel Row */}
        <div className="mb-14">
          {loading ? (
            <div className="flex gap-7 overflow-x-auto pb-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-[380px] w-[210px] shrink-0 animate-pulse rounded-2xl bg-white/5 sm:w-[245px]" />
              ))}
            </div>
          ) : books.length === 0 ? (
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-6 py-12 text-center">
              <BookOpen size={32} className="mx-auto mb-4 text-white/20" />
              <p className="text-base font-semibold text-white/60">No publications added yet</p>
              <p className="mt-1 text-sm text-white/35">Featured books uploaded by admin will appear here.</p>
            </div>
          ) : (
            <div className="flex gap-7 overflow-x-auto pb-4 custom-scrollbar">
              {books.map((book) => (
                <motion.div
                  key={book._id || book.title}
                  data-reveal
                  whileHover={{
                    y: -8,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 220,
                  }}
                  className="w-[210px] shrink-0 sm:w-[245px]"
                >
                  <BookCard book={book} />
                </motion.div>
              ))}
            </div>
          )}
        </div>

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
