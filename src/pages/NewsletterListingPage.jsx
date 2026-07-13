import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowRight, BookOpen, Loader2 } from "lucide-react";
import PageTransition from "../components/PageTransition.jsx";
import { API_BASE, SERVER_URL } from "../config.js";

export default function NewsletterListingPage() {
  const [newsletters, setNewsletters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, pages: 1 });
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/newsletter?page=${currentPage}&limit=12`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch newsletters.");
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          setNewsletters(data.newsletters || []);
          setPagination(data.pagination || { page: 1, limit: 12, total: 0, pages: 1 });
        } else {
          setError(data.message || "Something went wrong.");
        }
      })
      .catch((err) => {
        console.error(err);
        setError("Unable to load newsletters. Please try again later.");
      })
      .finally(() => setLoading(false));
  }, [currentPage]);

  // Format cover image URL
  const getCoverUrl = (cover) => {
    if (!cover || !cover.url) return "/book-placeholder.jpg";
    if (cover.url.startsWith("http")) return cover.url;
    return `${SERVER_URL}${cover.url}`;
  };

  // Format date to show Day, Month Date, Year (e.g. "Sunday, June 14, 2026")
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-black pt-32 pb-20 text-white">
        {/* Decorative background glows */}
        <div className="pointer-events-none absolute left-1/4 top-1/4 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="pointer-events-none absolute right-1/4 bottom-1/4 -z-10 h-96 w-96 translate-x-1/2 rounded-full bg-indigo-500/10 blur-[120px]" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-16 text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300 sm:text-sm"
            >
              <BookOpen size={14} className="animate-pulse" />
              Weekly Newsletter
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-6 text-4xl font-extrabold tracking-tight sm:text-6xl"
            >
              Stories & Updates
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mx-auto mt-4 max-w-2xl text-lg text-white/60"
            >
              Every Friday & Sunday, we publish stories, literary discussions, and behind-the-scenes insights directly from Lekhok Tripura.
            </motion.p>
          </div>

          {/* Loader */}
          {loading && (
            <div className="flex h-64 flex-col items-center justify-center gap-4 text-cyan-400">
              <Loader2 className="h-10 w-10 animate-spin" />
              <p className="text-sm font-medium text-white/55">Loading stories...</p>
            </div>
          )}

          {/* Error message */}
          {error && !loading && (
            <div className="mx-auto max-w-md rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center">
              <p className="text-red-400 font-medium">{error}</p>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && newsletters.length === 0 && (
            <div className="text-center py-20">
              <p className="text-white/45 text-lg">No stories have been posted yet. Check back soon!</p>
            </div>
          )}

          {/* Listing Grid */}
          {!loading && !error && newsletters.length > 0 && (
            <>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {newsletters.map((story, index) => (
                  <motion.article
                    key={story._id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/15 bg-white/[0.02] backdrop-blur-md transition-all duration-300 hover:border-cyan-400/30 hover:bg-white/[0.04] hover:shadow-2xl hover:shadow-cyan-500/5"
                  >
                    {/* Cover Image Container */}
                    <div className="aspect-[16/10] w-full overflow-hidden bg-white/5 relative">
                      <img
                        src={getCoverUrl(story.cover)}
                        alt={story.title}
                        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>

                    {/* Card Content */}
                    <div className="flex flex-1 flex-col p-6 sm:p-8">
                      {/* Meta information */}
                      <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-white/45">
                        <div className="flex items-center gap-1">
                          <Calendar size={13} />
                          <span>{formatDate(story.publishedAt)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={13} />
                          <span>{story.readingTime} min read</span>
                        </div>
                      </div>

                      {/* Title & Snippet */}
                      <h2 className="mb-3 text-xl font-bold tracking-tight text-white group-hover:text-cyan-300 transition-colors duration-300 line-clamp-2">
                        <Link to={`/newsletter/${story.slug}`}>{story.title}</Link>
                      </h2>
                      <p className="mb-6 text-sm leading-relaxed text-white/60 line-clamp-3">
                        {story.description}
                      </p>

                      {/* Read More button */}
                      <div className="mt-auto pt-4 border-t border-white/5">
                        <Link
                          to={`/newsletter/${story.slug}`}
                          className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-400 transition-colors duration-250 group-hover:text-cyan-300"
                        >
                          Read Full Story
                          <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
                        </Link>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="mt-16 flex justify-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium transition hover:bg-white/10 disabled:opacity-40"
                  >
                    Previous
                  </button>
                  {[...Array(pagination.pages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`h-10 w-10 rounded-xl text-sm font-medium transition ${
                        currentPage === i + 1
                          ? "bg-cyan-500 text-black font-semibold"
                          : "border border-white/10 bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    disabled={currentPage === pagination.pages}
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, pagination.pages))}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium transition hover:bg-white/10 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
