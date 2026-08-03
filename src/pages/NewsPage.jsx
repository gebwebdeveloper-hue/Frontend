import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Newspaper,
  Pin,
  Calendar,
  User,
  Search,
  Tag,
  ArrowRight,
  Sparkles,
  Loader2,
  X,
  ExternalLink,
  BellRing,
  Share2
} from "lucide-react";
import PageTransition from "../components/PageTransition.jsx";
import Navbar from "../components/Navbar.jsx";
import FooterSection from "../sections/FooterSection.jsx";
import { API_BASE, SERVER_URL } from "../config.js";

const CATEGORY_MAP = {
  all: { label: "All Updates", color: "cyan" },
  platform_update: { label: "Platform Update", color: "indigo" },
  new_release: { label: "New Release", color: "emerald" },
  announcement: { label: "Announcement", color: "fuchsia" },
  general: { label: "General News", color: "amber" }
};

export default function NewsPage() {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All Updates");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArticle, setSelectedArticle] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/news`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.news)) {
          setNewsList(d.news);
        }
      })
      .catch((err) => console.error("Error fetching news & updates:", err))
      .finally(() => setLoading(false));
  }, []);

  const categoriesList = useMemo(() => {
    const set = new Set(["All Updates"]);
    newsList.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return Array.from(set);
  }, [newsList]);

  const pinnedArticles = useMemo(() => {
    return newsList.filter((item) => item.isPinned);
  }, [newsList]);

  const filteredArticles = useMemo(() => {
    return newsList.filter((item) => {
      if (activeCategory !== "All Updates" && item.category !== activeCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = (item.title || "").toLowerCase().includes(q);
        const summaryMatch = (item.summary || "").toLowerCase().includes(q);
        const contentMatch = (item.content || "").toLowerCase().includes(q);
        return titleMatch || summaryMatch || contentMatch;
      }
      return true;
    });
  }, [newsList, activeCategory, searchQuery]);

  return (
    <PageTransition>
      <div className="min-h-screen bg-black text-white relative overflow-hidden flex flex-col justify-between">
        {/* Background glow effects */}
        <div className="absolute inset-0 animated-gradient opacity-60" />
        <div className="noise" />
        <div className="absolute left-1/4 top-0 h-[600px] w-[600px] rounded-full bg-cyan-500/10 blur-[180px] pointer-events-none" />
        <div className="absolute right-1/4 bottom-1/3 h-[500px] w-[500px] rounded-full bg-fuchsia-500/10 blur-[180px] pointer-events-none" />

        <div>
          <Navbar />

          <main className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 pt-32 pb-24">
            {/* Page Header */}
            <div className="text-center max-w-3xl mx-auto mb-14">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-bold text-cyan-300 uppercase tracking-widest mb-4">
                <BellRing size={14} className="animate-pulse" /> Official Platform Bulletins
              </div>

              <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
                News &amp; <span className="animated-text-gradient">Updates</span>
              </h1>

              <p className="mt-4 text-base sm:text-lg text-white/60 leading-relaxed">
                Stay informed with the latest feature releases, platform announcements, author spotlights, and official updates from Lekhok Tripura.
              </p>
            </div>

            {/* Pinned Announcement Showcase */}
            {!loading && pinnedArticles.length > 0 && (
              <div className="mb-14">
                <div className="flex items-center gap-2 mb-4">
                  <Pin size={16} className="text-amber-400 rotate-45" />
                  <h2 className="text-xs font-extrabold uppercase tracking-wider text-amber-300">Pinned Announcement</h2>
                </div>

                <div className="grid gap-6 md:grid-cols-1">
                  {pinnedArticles.map((article) => (
                    <div
                      key={article._id}
                      onClick={() => setSelectedArticle(article)}
                      className="group cursor-pointer rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-white/[0.03] to-white/[0.02] p-6 sm:p-8 backdrop-blur-xl hover:border-amber-400/50 transition-all shadow-glow flex flex-col md:flex-row gap-6 items-center"
                    >
                      {article.coverImage?.url && (
                        <div className="h-48 w-full md:w-72 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
                          <img
                            src={article.coverImage.url.startsWith("http") ? article.coverImage.url : `${SERVER_URL}${article.coverImage.url}`}
                            alt={article.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                      )}

                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="rounded-full bg-amber-400/20 border border-amber-400/30 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-300 flex items-center gap-1">
                            <Sparkles size={11} /> Featured Update
                          </span>

                          <span className="text-xs text-white/40 flex items-center gap-1">
                            <Calendar size={12} /> {new Date(article.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        </div>

                        <h3 className="text-2xl sm:text-3xl font-extrabold text-white group-hover:text-cyan-300 transition">
                          {article.title}
                        </h3>

                        <p className="text-sm text-white/70 line-clamp-2 leading-relaxed">
                          {article.summary}
                        </p>

                        <div className="pt-2 flex items-center gap-2 text-xs font-bold text-amber-300 group-hover:translate-x-1 transition-transform">
                          <span>Read Full Announcement</span>
                          <ArrowRight size={14} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Toolbar: Category Filter Tabs & Search Bar */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 sm:p-5 backdrop-blur-xl mb-10 flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Category Filters */}
              <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto scrollbar-none">
                {categoriesList.map((catName) => {
                  const isActive = activeCategory === catName;
                  return (
                    <button
                      key={catName}
                      onClick={() => setActiveCategory(catName)}
                      className={`rounded-full px-4 py-2 text-xs font-bold transition shrink-0 ${
                        isActive
                          ? "bg-white text-black shadow-glow"
                          : "bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {catName}
                    </button>
                  );
                })}
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 h-4 w-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search announcements..."
                  className="w-full rounded-2xl border border-white/10 bg-white/5 pl-11 pr-4 py-2.5 text-xs text-white placeholder-white/30 focus:border-cyan-400/50 focus:outline-none"
                />
              </div>
            </div>

            {/* News Articles Grid */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3 text-white/50">
                <Loader2 size={40} className="animate-spin text-cyan-400" />
                <p className="text-sm font-semibold">Loading news &amp; announcements...</p>
              </div>
            ) : filteredArticles.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-16 text-center">
                <Newspaper size={48} className="mx-auto mb-4 text-white/30" />
                <h3 className="text-lg font-bold text-white">No News Updates Found</h3>
                <p className="text-xs text-white/50 mt-1">
                  {searchQuery ? `No updates matching "${searchQuery}"` : "Check back later for new platform announcements."}
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredArticles.map((article) => {
                  const catInfo = CATEGORY_MAP[article.category] || CATEGORY_MAP.general;
                  return (
                    <motion.div
                      key={article._id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => setSelectedArticle(article)}
                      className="group cursor-pointer rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl hover:border-cyan-500/40 hover:bg-white/[0.05] transition-all flex flex-col justify-between shadow-xl"
                    >
                      <div className="space-y-4">
                        {/* Cover Image */}
                        {article.coverImage?.url ? (
                          <div className="h-44 w-full overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
                            <img
                              src={article.coverImage.url.startsWith("http") ? article.coverImage.url : `${SERVER_URL}${article.coverImage.url}`}
                              alt={article.title}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          </div>
                        ) : (
                          <div className="h-32 w-full rounded-2xl bg-gradient-to-br from-cyan-950/40 via-indigo-950/30 to-fuchsia-950/40 border border-white/10 flex items-center justify-center text-cyan-300">
                            <Newspaper size={32} className="opacity-50" />
                          </div>
                        )}

                        {/* Article Header */}
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="rounded-full bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5 text-[9px] font-extrabold uppercase text-cyan-300">
                              {article.category || "General News"}
                            </span>
                            <span className="text-[10px] text-white/40 flex items-center gap-1">
                              <Calendar size={10} />
                              {new Date(article.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            </span>
                          </div>

                          <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition line-clamp-2">
                            {article.title}
                          </h3>
                        </div>

                        <p className="text-xs text-white/60 line-clamp-3 leading-relaxed">
                          {article.summary}
                        </p>
                      </div>

                      <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-xs text-white/40">
                        <span className="flex items-center gap-1 text-[10px]">
                          <User size={10} /> {article.author || "Lekhok Tripura Team"}
                        </span>
                        <span className="font-bold text-cyan-400 group-hover:translate-x-1 transition-transform flex items-center gap-1 text-xs">
                          Read More <ArrowRight size={12} />
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </main>
        </div>

        {/* FULL ANNOUNCEMENT MODAL */}
        {createPortal(
          <AnimatePresence>
            {selectedArticle && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md overflow-y-auto"
                onClick={() => setSelectedArticle(null)}
                data-lenis-prevent
              >
                <motion.div
                  initial={{ scale: 0.95, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.95, y: 20 }}
                  className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-3xl border border-white/10 bg-zinc-950 p-6 sm:p-8 shadow-glow my-auto scrollbar-thin scrollbar-thumb-white/20"
                  onClick={(e) => e.stopPropagation()}
                  data-lenis-prevent
                >
                  {/* Close button */}
                  <button
                    onClick={() => setSelectedArticle(null)}
                    className="absolute right-5 top-5 rounded-full p-2 text-white/50 hover:bg-white/10 hover:text-white transition z-10"
                  >
                    <X size={20} />
                  </button>

                  <div className="space-y-6">
                    {/* Header info */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="rounded-full bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 text-xs font-bold text-cyan-300 uppercase">
                          {selectedArticle.category || "General News"}
                        </span>
                        <span className="text-xs text-white/40 flex items-center gap-1">
                          <Calendar size={12} /> {new Date(selectedArticle.createdAt).toLocaleString("en-IN")}
                        </span>
                      </div>

                      <h2 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
                        {selectedArticle.title}
                      </h2>

                      <p className="text-xs text-white/50 flex items-center gap-1">
                        <User size={12} /> Published by <strong>{selectedArticle.author || "Lekhok Tripura Team"}</strong>
                      </p>
                    </div>

                    {/* Cover image if available */}
                    {selectedArticle.coverImage?.url && (
                      <div className="overflow-hidden rounded-2xl border border-white/10 max-h-[350px]">
                        <img
                          src={selectedArticle.coverImage.url.startsWith("http") ? selectedArticle.coverImage.url : `${SERVER_URL}${selectedArticle.coverImage.url}`}
                          alt={selectedArticle.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Article Content */}
                    <div className="border-t border-white/10 pt-6">
                      <div className="prose prose-invert max-w-none text-sm text-white/80 leading-relaxed whitespace-pre-line">
                        {selectedArticle.content}
                      </div>
                    </div>

                    {/* Footer buttons */}
                    <div className="border-t border-white/10 pt-4 flex items-center justify-between">
                      <button
                        onClick={() => {
                          if (navigator.share) {
                            navigator.share({
                              title: selectedArticle.title,
                              url: window.location.href
                            }).catch(() => {});
                          } else {
                            navigator.clipboard.writeText(window.location.href);
                            alert("Link copied to clipboard!");
                          }
                        }}
                        className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/70 hover:bg-white/10 hover:text-white transition"
                      >
                        <Share2 size={13} /> Share Announcement
                      </button>

                      <button
                        onClick={() => setSelectedArticle(null)}
                        className="rounded-xl bg-white px-5 py-2 text-xs font-bold text-black hover:bg-cyan-300 transition"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}

        <FooterSection />
      </div>
    </PageTransition>
  );
}
