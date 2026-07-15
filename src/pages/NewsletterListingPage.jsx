import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowRight, BookOpen, Loader2 } from "lucide-react";
import PageTransition from "../components/PageTransition.jsx";
import FooterSection from "../sections/FooterSection.jsx";
import { API_BASE, SERVER_URL } from "../config.js";

function StoryCard({ story, index, getCoverUrl, formatDate }) {
  const [showAllTags, setShowAllTags] = useState(false);

  const categories = story.categories || [];
  const firstCategory = categories[0];
  const remainingCount = categories.length - 1;

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/15 bg-white/[0.02] backdrop-blur-md transition-all duration-300 hover:border-cyan-400/30 hover:bg-white/[0.04] hover:shadow-2xl hover:shadow-cyan-500/5"
    >
      {/* Cover Image Container */}
      <div className="aspect-[16/9] w-full overflow-hidden bg-white/5 relative">
        <img
          src={getCoverUrl(story.cover)}
          alt={story.title}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Categories badge Overlay */}
        {categories.length > 0 && (
          <div 
            className="absolute left-4 top-4 flex flex-wrap gap-1.5 max-w-[85%] z-20 cursor-pointer"
            onMouseEnter={() => setShowAllTags(true)}
            onMouseLeave={() => setShowAllTags(false)}
            onClick={(e) => {
              e.stopPropagation();
              setShowAllTags(!showAllTags);
            }}
          >
            {showAllTags ? (
              categories.map((cat) => (
                <span
                  key={cat._id}
                  className="rounded-full bg-cyan-500 text-black border border-cyan-400 px-2.5 py-0.5 text-[10px] font-bold backdrop-blur-sm shadow-glow shadow-cyan-500/20 transition-all duration-200"
                >
                  {cat.name}
                </span>
              ))
            ) : (
              <>
                <span className="rounded-full bg-black/75 border border-white/15 px-2.5 py-0.5 text-[10px] font-medium text-cyan-300 backdrop-blur-sm truncate max-w-full">
                  {firstCategory.name}
                </span>
                {remainingCount > 0 && (
                  <span className="rounded-full bg-cyan-400 border border-cyan-300 px-2 py-0.5 text-[10px] font-extrabold text-black backdrop-blur-sm cursor-pointer select-none">
                    +{remainingCount}
                  </span>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        {/* Meta information */}
        <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-white/45">
          <div className="flex items-center gap-1">
            <Calendar size={12} />
            <span>{formatDate(story.publishedAt)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <span>{story.readingTime} min read</span>
          </div>
        </div>

        {/* Title & Snippet */}
        <h2 className="mb-2 text-lg font-bold tracking-tight text-white group-hover:text-cyan-300 transition-colors duration-300 line-clamp-2">
          <Link to={`/free-stories/${story.slug}`}>{story.title}</Link>
        </h2>
        <p className="mb-4 text-xs leading-relaxed text-white/60 line-clamp-3">
          {story.description}
        </p>

        {/* Read More button */}
        <div className="mt-auto pt-4 border-t border-white/5">
          <Link
            to={`/free-stories/${story.slug}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-400 transition-colors duration-250 group-hover:text-cyan-300"
          >
            Read Full Story
            <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

export default function NewsletterListingPage() {
  const [newsletters, setNewsletters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, pages: 1 });
  const [currentPage, setCurrentPage] = useState(1);

  // Category filter state
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);

  useEffect(() => {
    setLoadingCategories(true);
    fetch(`${API_BASE}/categories`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch categories.");
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          setCategories(data.categories || []);
        }
      })
      .catch((err) => console.error("Error fetching categories:", err))
      .finally(() => setLoadingCategories(false));
  }, []);

  useEffect(() => {
    setLoading(true);
    let url = `${API_BASE}/newsletter?page=${currentPage}&limit=12`;
    if (selectedCategories.length > 0) {
      url += `&categories=${selectedCategories.join(",")}`;
    }
    fetch(url)
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
  }, [currentPage, selectedCategories]);

  const toggleCategory = (categoryId) => {
    setCurrentPage(1);
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const clearCategories = () => {
    setCurrentPage(1);
    setSelectedCategories([]);
  };

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
              Free Stories
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-6 text-4xl font-black tracking-tight sm:text-6xl bg-gradient-to-r from-cyan-400 via-indigo-400 to-fuchsia-500 bg-clip-text text-transparent animate-text-gradient"
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

          {/* Category Selector for Mobile / Tablet (hidden on desktop) */}
          <div className="mb-10 lg:hidden overflow-hidden">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/45">
              Filter by Category
            </h3>
            {loadingCategories ? (
              <div className="flex gap-2 animate-pulse">
                <div className="h-8 w-20 rounded-full bg-white/5" />
                <div className="h-8 w-24 rounded-full bg-white/5" />
                <div className="h-8 w-16 rounded-full bg-white/5" />
              </div>
            ) : categories.length === 0 ? (
              <p className="text-xs text-white/35 italic">No categories available</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={clearCategories}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold border transition ${
                    selectedCategories.length === 0
                      ? "bg-cyan-500 border-cyan-500 text-black shadow-glow shadow-cyan-500/20"
                      : "bg-white/5 border-white/10 text-white/70 hover:border-white/20"
                  }`}
                >
                  All Stories
                </button>
                {categories.map((cat) => {
                  const isSelected = selectedCategories.includes(cat._id);
                  return (
                    <button
                      key={cat._id}
                      onClick={() => toggleCategory(cat._id)}
                      className={`rounded-full px-4 py-1.5 text-xs font-semibold border transition ${
                        isSelected
                          ? "bg-cyan-500 border-cyan-500 text-black shadow-glow shadow-cyan-500/20"
                          : "bg-white/5 border-white/10 text-white/70 hover:border-white/20"
                      }`}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="grid gap-10 lg:grid-cols-[1fr_280px]">
            {/* LEFT COLUMN: LISTING */}
            <div className="space-y-12">
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
                <div className="text-center py-20 bg-white/[0.01] border border-white/5 rounded-3xl">
                  <BookOpen className="mx-auto mb-4 h-12 w-12 text-white/25" />
                  <p className="text-white/45 text-lg">No stories found under the selected filters.</p>
                  {selectedCategories.length > 0 && (
                    <button
                      onClick={clearCategories}
                      className="mt-4 rounded-xl border border-cyan-500/30 bg-cyan-500/5 px-4 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-500 hover:text-black transition"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              )}

              {/* Grid List */}
              {!loading && !error && newsletters.length > 0 && (
                <>
                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {newsletters.map((story, index) => (
                      <StoryCard
                        key={story._id}
                        story={story}
                        index={index}
                        getCoverUrl={getCoverUrl}
                        formatDate={formatDate}
                      />
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

            {/* RIGHT COLUMN: DESKTOP SIDEBAR */}
            <aside className="hidden lg:block h-fit sticky top-36">
              <div className="rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-md p-6">
                <div className="mb-6 flex items-center justify-between border-b border-white/5 pb-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-white/80">
                    Categories
                  </h3>
                  {selectedCategories.length > 0 && (
                    <button
                      onClick={clearCategories}
                      className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {loadingCategories ? (
                  <div className="space-y-3">
                    <div className="h-6 w-full rounded bg-white/5 animate-pulse" />
                    <div className="h-6 w-5/6 rounded bg-white/5 animate-pulse" />
                    <div className="h-6 w-4/5 rounded bg-white/5 animate-pulse" />
                  </div>
                ) : categories.length === 0 ? (
                  <p className="text-xs text-white/40 italic">No categories created yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {categories.map((cat) => {
                      const isSelected = selectedCategories.includes(cat._id);
                      return (
                        <li key={cat._id}>
                          <button
                            onClick={() => toggleCategory(cat._id)}
                            className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-xs font-semibold transition-all duration-200 ${
                              isSelected
                                ? "border-cyan-400/40 bg-cyan-400/5 text-cyan-300 shadow-sm"
                                : "border-white/5 bg-white/[0.01] hover:border-white/15 text-white/60 hover:text-white"
                            }`}
                          >
                            <span className="truncate max-w-[85%]">{cat.name}</span>
                            <span
                              className={`h-2.5 w-2.5 rounded-full border transition-all shrink-0 ${
                                isSelected
                                  ? "bg-cyan-400 border-cyan-400 scale-110 shadow-glow shadow-cyan-400/50"
                                  : "border-white/20"
                              }`}
                            />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </aside>
          </div>
        </div>
      </div>
      <FooterSection />
    </PageTransition>
  );
}
