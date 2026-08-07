import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Newspaper,
  Pin,
  Calendar,
  User,
  Search,
  ArrowRight,
  Sparkles,
  Loader2,
  X,
  Share2,
  Radio,
  Flame,
  CheckCircle2,
  Megaphone,
  Mail,
  Layers,
  BookOpen
} from "lucide-react";
import PageTransition from "../components/PageTransition.jsx";
import Navbar from "../components/Navbar.jsx";
import FooterSection from "../sections/FooterSection.jsx";
import { API_BASE, SERVER_URL } from "../config.js";

const CATEGORY_STYLES = {
  "Platform Update": "bg-cyan-500/10 text-cyan-300 border-cyan-500/30",
  "New Release": "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  "Announcement": "bg-amber-500/10 text-amber-300 border-amber-500/30",
  "Author Spotlight": "bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/30",
  "General News": "bg-indigo-500/10 text-indigo-300 border-indigo-500/30",
};

export default function NewsPage() {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

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
    const set = new Set(["All"]);
    newsList.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return Array.from(set);
  }, [newsList]);

  const pinnedArticle = useMemo(() => {
    return newsList.find((item) => item.isPinned) || null;
  }, [newsList]);

  const regularArticles = useMemo(() => {
    return newsList.filter((item) => {
      if (pinnedArticle && item._id === pinnedArticle._id) {
        return false;
      }
      if (activeCategory !== "All" && item.category !== activeCategory) {
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
  }, [newsList, pinnedArticle, activeCategory, searchQuery]);

  const getCoverUrl = (coverImage) => {
    if (!coverImage?.url) return null;
    if (coverImage.url.startsWith("http")) return coverImage.url;
    return `${SERVER_URL}${coverImage.url}`;
  };

  const handleShare = (article, e) => {
    if (e) e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.summary,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#050507] text-white relative overflow-hidden flex flex-col justify-between">
        {/* Background glow effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-black to-black pointer-events-none" />
        <div className="absolute left-1/3 top-20 h-96 w-96 rounded-full bg-cyan-500/10 blur-[150px] pointer-events-none" />
        <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-amber-500/10 blur-[150px] pointer-events-none" />

        <div>
          <main className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-32 pb-24">
            
            {/* Page Header Banner */}
            <div className="mb-12 border-b border-white/10 pb-10">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1.5 text-xs font-bold text-cyan-300 uppercase tracking-widest mb-3">
                    <Megaphone size={14} className="text-cyan-400" /> Lekhok Tripura Press &amp; Newsroom
                  </div>
                  <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white font-serif-display">
                    News &amp; <span className="gradient-text-animated">Updates</span>
                  </h1>
                  <p className="mt-3 text-base text-white/60 max-w-2xl leading-relaxed">
                    Official bulletins, publishing releases, platform milestones, and author announcements directly from Lekhok Tripura Publishers.
                  </p>
                </div>
              </div>
            </div>

            {/* Featured / Pinned Banner */}
            {!loading && pinnedArticle && (
              <div className="mb-14">
                <div className="flex items-center gap-2 mb-3">
                  <Flame size={18} className="text-amber-400" />
                  <h2 className="text-xs font-black uppercase tracking-widest text-amber-300">Featured Spotlight</h2>
                </div>

                <div
                  onClick={() => setSelectedArticle(pinnedArticle)}
                  className="group cursor-pointer rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-white/[0.03] to-white/[0.01] p-6 sm:p-8 backdrop-blur-2xl hover:border-amber-400/60 transition-all duration-300 shadow-2xl flex flex-col lg:flex-row gap-8 items-center"
                >
                  {getCoverUrl(pinnedArticle.coverImage) && (
                    <div className="h-56 sm:h-64 w-full lg:w-96 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-black relative">
                      <img
                        src={getCoverUrl(pinnedArticle.coverImage)}
                        alt={pinnedArticle.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                    </div>
                  )}

                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="rounded-full bg-amber-400 text-black px-3 py-1 text-[10px] font-black uppercase tracking-wider shadow-md">
                        ★ TOP BULLETIN
                      </span>
                      <span className="rounded-full bg-white/10 border border-white/15 px-3 py-1 text-[10px] font-bold text-white/80">
                        {pinnedArticle.category || "Announcement"}
                      </span>
                      <span className="text-xs text-white/40 flex items-center gap-1">
                        <Calendar size={13} />
                        {new Date(pinnedArticle.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </div>

                    <h2 className="text-2xl sm:text-4xl font-extrabold text-white group-hover:text-amber-300 transition-colors leading-tight">
                      {pinnedArticle.title}
                    </h2>

                    <p className="text-sm text-white/70 line-clamp-3 leading-relaxed font-light">
                      {pinnedArticle.summary}
                    </p>

                    <div className="pt-2 flex items-center gap-4">
                      <button
                        type="button"
                        className="flex items-center gap-2 rounded-full bg-white px-6 py-3 text-xs font-extrabold text-black group-hover:bg-amber-300 transition shadow-lg"
                      >
                        <span>Read Full Release</span>
                        <ArrowRight size={14} />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleShare(pinnedArticle, e)}
                        className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 py-3 text-xs font-semibold text-white/70 hover:bg-white/10 transition"
                      >
                        <Share2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Filter & Search Bar */}
            <div className="mb-10 rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Categories */}
              <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto scrollbar-none pb-1 md:pb-0">
                {categoriesList.map((cat) => {
                  const isActive = activeCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`rounded-full px-4 py-2 text-xs font-bold transition shrink-0 ${
                        isActive
                          ? "bg-white text-black shadow-glow"
                          : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>

              {/* Search */}
              <div className="relative w-full md:w-72">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search press releases..."
                  className="w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-4 py-2 text-xs text-white placeholder-white/30 focus:border-cyan-400/50 focus:outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            </div>

            {/* Main Newsroom Grid with Sidebar */}
            <div className="grid gap-10 lg:grid-cols-[1fr_300px]">
              
              {/* Left Column: Articles */}
              <div>
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-24 gap-3 text-white/50">
                    <Loader2 size={36} className="animate-spin text-cyan-400" />
                    <p className="text-sm font-semibold">Loading press bulletins...</p>
                  </div>
                ) : regularArticles.length === 0 ? (
                  <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-16 text-center">
                    <Newspaper size={48} className="mx-auto mb-4 text-white/30" />
                    <h3 className="text-lg font-bold text-white">No News Bulletins Found</h3>
                    <p className="text-xs text-white/50 mt-1">
                      {searchQuery ? `No updates matching "${searchQuery}"` : "Check back later for new announcements."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {regularArticles.map((article) => {
                      const badgeStyle = CATEGORY_STYLES[article.category] || "bg-white/10 text-white/80 border-white/20";
                      const cover = getCoverUrl(article.coverImage);

                      return (
                        <motion.div
                          key={article._id}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          onClick={() => setSelectedArticle(article)}
                          className="group cursor-pointer rounded-2xl border border-white/10 bg-white/[0.025] p-5 sm:p-6 backdrop-blur-xl hover:border-cyan-400/40 hover:bg-white/[0.05] transition-all flex flex-col sm:flex-row gap-5 items-start justify-between shadow-lg"
                        >
                          {cover && (
                            <div className="h-40 w-full sm:w-48 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black">
                              <img
                                src={cover}
                                alt={article.title}
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                            </div>
                          )}

                          <div className="flex-1 space-y-2.5">
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <span className={`rounded-full border px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider ${badgeStyle}`}>
                                {article.category || "General News"}
                              </span>
                              <span className="text-[11px] text-white/40 flex items-center gap-1">
                                <Calendar size={11} />
                                {new Date(article.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                              </span>
                            </div>

                            <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2">
                              {article.title}
                            </h3>

                            <p className="text-xs text-white/60 line-clamp-2 leading-relaxed">
                              {article.summary}
                            </p>

                            <div className="pt-2 flex items-center justify-between text-xs text-white/40">
                              <span className="flex items-center gap-1 text-[10px]">
                                <User size={10} className="text-cyan-400" /> {article.author || "Lekhok Tripura Team"}
                              </span>
                              <span className="font-bold text-cyan-400 group-hover:translate-x-1 transition-transform flex items-center gap-1 text-xs">
                                Read Announcement <ArrowRight size={13} />
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right Column: Pressroom Sidebar */}
              <aside className="space-y-6">
                
                {/* Author Publishing CTA Card */}
                <div className="rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 via-white/[0.02] to-indigo-950/20 p-6 backdrop-blur-xl space-y-4 shadow-xl">
                  <div className="flex items-center gap-2.5 text-cyan-300">
                    <BookOpen size={20} className="text-cyan-400" />
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-white">Publish Your Book</h3>
                  </div>
                  
                  <p className="text-xs text-white/70 leading-relaxed font-light">
                    Transform your manuscript into a professionally published book with full distribution, ISBN support, and expert publishing guidance.
                  </p>

                  <div className="pt-1 space-y-2">
                    <Link
                      to="/reader"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 py-3 text-xs font-black text-black hover:bg-cyan-300 transition shadow-glow"
                    >
                      <span>Publish with us</span>
                      <ArrowRight size={14} />
                    </Link>

                    <Link
                      to="/club"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-bold text-white/80 hover:bg-white/10 hover:text-white transition"
                    >
                      <Sparkles size={14} className="text-amber-400" /> Join Authors Club
                    </Link>
                  </div>
                </div>

                {/* Bulletin Categories Breakdown */}
                <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-xl space-y-4">
                  <div className="flex items-center gap-2 text-white/80 border-b border-white/10 pb-3">
                    <Layers size={16} className="text-cyan-400" />
                    <h3 className="text-xs font-extrabold uppercase tracking-wider">Categories</h3>
                  </div>
                  <div className="space-y-2">
                    {categoriesList.filter((c) => c !== "All").map((cat) => {
                      const count = newsList.filter((n) => n.category === cat).length;
                      return (
                        <button
                          key={cat}
                          onClick={() => setActiveCategory(cat)}
                          className={`w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs transition ${
                            activeCategory === cat
                              ? "bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-bold"
                              : "bg-white/5 border border-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          <span>{cat}</span>
                          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-mono font-bold text-white/60">
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </aside>
            </div>
          </main>
        </div>

        {/* FULL ARTICLE MODAL */}
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
                  className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-3xl border border-white/10 bg-[#0b0b0e] p-6 sm:p-8 shadow-2xl my-auto scrollbar-thin scrollbar-thumb-white/20"
                  onClick={(e) => e.stopPropagation()}
                  data-lenis-prevent
                >
                  <button
                    onClick={() => setSelectedArticle(null)}
                    className="absolute right-5 top-5 rounded-full p-2 text-white/50 hover:bg-white/10 hover:text-white transition z-10"
                  >
                    <X size={20} />
                  </button>

                  <div className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="rounded-full bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 text-xs font-bold text-cyan-300 uppercase">
                          {selectedArticle.category || "General News"}
                        </span>
                        <span className="text-xs text-white/40 flex items-center gap-1">
                          <Calendar size={12} /> {new Date(selectedArticle.createdAt).toLocaleString("en-IN")}
                        </span>
                      </div>

                      <h2 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight font-serif-display">
                        {selectedArticle.title}
                      </h2>

                      <p className="text-xs text-white/50 flex items-center gap-1">
                        <User size={12} /> Official Bulletin by <strong>{selectedArticle.author || "Lekhok Tripura Team"}</strong>
                      </p>
                    </div>

                    {getCoverUrl(selectedArticle.coverImage) && (
                      <div className="overflow-hidden rounded-2xl border border-white/10 max-h-[350px]">
                        <img
                          src={getCoverUrl(selectedArticle.coverImage)}
                          alt={selectedArticle.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="border-t border-white/10 pt-6">
                      <div className="prose prose-invert max-w-none text-sm text-white/80 leading-relaxed whitespace-pre-line font-light">
                        {selectedArticle.content}
                      </div>
                    </div>

                    <div className="border-t border-white/10 pt-4 flex items-center justify-between">
                      <button
                        onClick={(e) => handleShare(selectedArticle, e)}
                        className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/70 hover:bg-white/10 hover:text-white transition"
                      >
                        {copiedLink ? <CheckCircle2 size={13} className="text-emerald-400" /> : <Share2 size={13} />}
                        <span>{copiedLink ? "Link Copied!" : "Share Bulletin"}</span>
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
