import { useState, useEffect } from "react";
import {
  ArrowRight,
  Star,
  Users,
  BookOpen,
  Trophy,
} from "lucide-react";

import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { API_BASE } from "../config.js";

const mockBooks = [
  {
    rank: 1,
    title: "Applied AI Strategy",
    author: "John Carter",
    category: "Artificial Intelligence",
    price: 18,
    pages: 328,
    rating: "4.9",
    readers: "12.8k",
    gradient: "from-cyan-300 via-blue-500 to-violet-600",
  },
  {
    rank: 2,
    title: "Readable Finance",
    author: "Emma Wilson",
    category: "Finance",
    price: 15,
    pages: 276,
    rating: "4.8",
    readers: "9.4k",
    gradient: "from-emerald-300 via-cyan-500 to-blue-600",
  },
  {
    rank: 3,
    title: "The Founder Loop",
    author: "Ryan Brooks",
    category: "Business",
    price: 21,
    pages: 401,
    rating: "4.9",
    readers: "18.6k",
    gradient: "from-pink-300 via-rose-500 to-orange-500",
  },
];

const gradients = [
  "from-cyan-300 via-blue-500 to-violet-600",
  "from-emerald-300 via-cyan-500 to-blue-600",
  "from-pink-300 via-rose-500 to-orange-500",
  "from-amber-300 via-orange-500 to-red-600",
];

const mockReaderCounts = ["14.2k", "9.8k", "19.5k", "7.6k", "11.1k"];

export default function BestsellerShowcaseSection() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/books?trending=true`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.books && data.books.length > 0) {
          // Map database attributes to expected layout attributes (rank, gradient, mock readers)
          const mapped = data.books.map((book, idx) => ({
            ...book,
            rank: idx + 1,
            gradient: gradients[idx % gradients.length],
            readers: mockReaderCounts[idx % mockReaderCounts.length]
          }));
          setBooks(mapped);
        } else {
          setBooks(mockBooks);
        }
      })
      .catch(() => {
        setBooks(mockBooks);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const formatPrice = (price) => {
    if (typeof price === "number") return `₹${price}`;
    return String(price || "").replace("$", "₹");
  };

  return (
    <section className="relative overflow-hidden py-32">

      {/* Background Text */}

      <h1 className="pointer-events-none absolute left-1/2 top-8 -translate-x-1/2 whitespace-nowrap text-[16vw] font-black uppercase leading-none text-white/[0.03]">
        BESTSELLERS
      </h1>

      {/* Glow */}

      <div className="absolute left-0 top-32 h-80 w-80 rounded-full bg-cyan-500/10 blur-[150px]" />

      <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-violet-500/10 blur-[170px]" />

      <div className="section-shell">

        {/* Heading */}

        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

          <div>

            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300">
              Bestseller Collection
            </p>

            <h2 className="mt-5 max-w-4xl text-5xl font-black leading-tight text-white md:text-7xl">
              Books readers finish,
              <br />
              recommend and revisit.
            </h2>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/60">
              Explore the highest-rated books loved by thousands of readers.
            </p>

          </div>

          <Link
            to="/library"
            className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-white backdrop-blur-xl transition hover:bg-white/10"
          >
            View All

            <ArrowRight
              size={18}
              className="transition group-hover:translate-x-1"
            />

          </Link>

        </div>

        {/* Cards */}

        <div className="mt-20 grid gap-8 lg:grid-cols-3">

          {books.map((book) => (

            <motion.article
              key={book.title}
              whileHover={{
                y: -10,
                rotateX: 2,
              }}
              transition={{
                type: "spring",
                stiffness: 220,
              }}
              className="group relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl"
            >

              {/* Glow */}

              <div
                className={`absolute inset-0 bg-gradient-to-br ${book.gradient} opacity-0 blur-3xl transition duration-500 group-hover:opacity-20`}
              />

              {/* Rank */}

              <div className="mb-6 flex items-center justify-between">

                <div className="flex items-center gap-2 rounded-full border border-yellow-400/30 bg-yellow-400/10 px-4 py-2 text-yellow-300">

                  <Trophy size={16} />

                  #{book.rank}

                </div>

                <div className="rounded-full bg-white/5 px-4 py-2 text-sm text-white/60">
                  Bestseller
                </div>

              </div>

              {/* Cover */}
              <motion.div
                whileHover={{
                  rotateY: -8,
                }}
                className={`relative h-[340px] rounded-3xl overflow-hidden shadow-2xl ${
                  book.cover?.url ? "" : `bg-gradient-to-br ${book.gradient} p-8`
                }`}
              >
                {book.cover?.url ? (
                  <>
                    <img
                      src={book.cover.url.startsWith("http") ? book.cover.url : `http://localhost:5000${book.cover.url}`}
                      alt={book.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-8 flex flex-col justify-between">
                      <p className="text-xs uppercase tracking-[0.4em] text-white">
                        {book.category}
                      </p>
                      <h3 className="text-3xl font-black leading-none text-white mt-auto truncate">
                        {book.title}
                      </h3>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-xs uppercase tracking-[0.4em] text-white">
                      {book.category}
                    </p>
                    <h3 className="absolute bottom-8 left-8 right-8 text-4xl font-black leading-none text-white truncate">
                      {book.title}
                    </h3>
                  </>
                )}
              </motion.div>

              {/* Details */}

              <div className="mt-7">

                <p className="text-lg font-semibold text-white">
                  {book.author}
                </p>

                <div className="mt-6 flex items-center justify-between text-white/60">

                  <div className="flex items-center gap-2">
                    <Star
                      size={16}
                      className="fill-yellow-400 text-yellow-400"
                    />

                    {book.rating}
                  </div>

                  <div className="flex items-center gap-2">
                    <Users size={16} />
                    {book.readers}
                  </div>

                </div>

                <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-5">

                  <div>

                    <p className="text-3xl font-black text-white">
                      {formatPrice(book.price)}
                    </p>

                    <p className="text-sm text-white/50">
                      {book.pages} Pages
                    </p>

                  </div>

                  <Link
                    to="/library"
                    className="group flex items-center gap-2 rounded-full bg-white px-5 py-3 font-semibold text-black transition hover:scale-105"
                  >
                    View

                    <ArrowRight
                      size={16}
                      className="transition group-hover:translate-x-1"
                    />

                  </Link>

                </div>

              </div>

            </motion.article>

          ))}

        </div>

      </div>

    </section>
  );
}