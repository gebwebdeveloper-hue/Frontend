import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Loader2, Search, Trash2, Pencil, ArrowLeft,
  Filter, X, ChevronDown, Calendar, Clock, Sparkles
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import PageTransition from "../components/PageTransition.jsx";
import { API_BASE, SERVER_URL } from "../config.js";

export default function AdminStoriesDatabasePage() {
  const navigate = useNavigate();

  // Auth
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);

  // Stories & Categories
  const [stories, setStories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All"); // All | published | draft | scheduled
  const [showFilters, setShowFilters] = useState(false);

  // Auth check
  useEffect(() => {
    fetch(`${API_BASE}/auth/me`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.user?.role === "admin") {
          setAuthed(true);
        } else {
          navigate("/admin");
        }
      })
      .catch(() => navigate("/admin"))
      .finally(() => setChecking(false));
  }, [navigate]);

  // Fetch stories & categories
  const fetchData = async () => {
    setLoading(true);
    try {
      const [storiesRes, catsRes] = await Promise.all([
        fetch(`${API_BASE}/newsletter?all=true`, { credentials: "include" }).then((r) => r.json()),
        fetch(`${API_BASE}/categories`, { credentials: "include" }).then((r) => r.json())
      ]);

      if (storiesRes.success) setStories(storiesRes.newsletters || []);
      if (catsRes.success) setCategories(catsRes.categories || []);
    } catch (err) {
      console.error("Error loading admin database data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authed) fetchData();
  }, [authed]);

  // Delete story
  const handleDelete = (id, title) => {
    if (!window.confirm(`Delete story "${title}"? This cannot be undone.`)) return;
    fetch(`${API_BASE}/newsletter/${id}`, { method: "DELETE", credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setStories((prev) => prev.filter((s) => s._id !== id));
        } else {
          alert(d.message || "Failed to delete story.");
        }
      })
      .catch(() => alert("Error communicating with server."));
  };

  // Filtered stories
  const filtered = useMemo(() => {
    const now = new Date();
    return stories.filter((s) => {
      // Search filter
      const q = search.toLowerCase();
      const matchSearch = !q || s.title.toLowerCase().includes(q) || s.author.toLowerCase().includes(q) || s.description.toLowerCase().includes(q);

      // Category filter
      let matchCategory = true;
      if (categoryFilter !== "All") {
        matchCategory = s.categories && s.categories.some((cat) => (cat._id === categoryFilter || cat.slug === categoryFilter));
      }

      // Status filter
      let matchStatus = true;
      if (statusFilter !== "All") {
        const isFuture = s.publishedAt && new Date(s.publishedAt) > now;
        if (statusFilter === "draft") {
          matchStatus = s.status === "draft";
        } else if (statusFilter === "published") {
          matchStatus = s.status === "published" && !isFuture;
        } else if (statusFilter === "scheduled") {
          matchStatus = s.status === "published" && isFuture;
        }
      }

      return matchSearch && matchCategory && matchStatus;
    });
  }, [stories, search, categoryFilter, statusFilter]);

  if (checking) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-zinc-950 text-white pt-20 md:pt-28">
        {/* Header */}
        <div className="sticky top-[76px] md:top-[92px] z-30 border-b border-white/8 bg-zinc-950/90 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center justify-between sm:justify-start gap-4 w-full sm:w-auto">
              <Link
                to="/admin"
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white transition shrink-0"
              >
                <ArrowLeft size={15} /> Back to Admin
              </Link>
              
              <button
                onClick={() => setShowFilters((v) => !v)}
                className={`sm:hidden flex items-center gap-2 rounded-xl border px-4 py-2 text-sm transition shrink-0 ${
                  showFilters
                    ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-300"
                    : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                }`}
              >
                <Filter size={14} /> Filters
                {(categoryFilter !== "All" || statusFilter !== "All") && (
                  <span className="ml-1 h-2 w-2 rounded-full bg-cyan-400 inline-block" />
                )}
              </button>
            </div>

            <div className="flex-1">
              <h1 className="text-xl font-bold text-white">Stories Database</h1>
              <p className="text-xs text-white/40">{filtered.length} of {stories.length} stories</p>
            </div>

            <button
              onClick={() => setShowFilters((v) => !v)}
              className={`hidden sm:flex items-center gap-2 rounded-xl border px-4 py-2 text-sm transition ${
                showFilters
                  ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-300"
                  : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
              }`}
            >
              <Filter size={14} /> Filters
              {(categoryFilter !== "All" || statusFilter !== "All") && (
                <span className="ml-1 h-2 w-2 rounded-full bg-cyan-400 inline-block" />
              )}
            </button>
          </div>

          {/* Search bar */}
          <div className="mx-auto max-w-7xl px-6 pb-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, description, or author..."
                className="w-full rounded-xl border border-white/10 bg-white/5 pl-11 pr-4 py-3 text-sm text-white placeholder-white/25 focus:border-cyan-400/40 focus:bg-white/8 focus:outline-none"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition">
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Expanded filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-white/8 bg-zinc-950"
            >
              <div className="mx-auto max-w-7xl px-6 py-4 grid gap-4 md:grid-cols-2">
                {/* Category filter */}
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-white/40 mb-2">Filter by Category</label>
                  <div className="relative">
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-cyan-400/40 focus:outline-none"
                      style={{
                        backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23ffffff66' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "right 14px center"
                      }}
                    >
                      <option value="All" style={{ background: "#0a0a0a" }}>All Categories</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id} style={{ background: "#0a0a0a" }}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Status filter */}
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-white/40 mb-2">Filter by Status</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { key: "All", label: "All" },
                      { key: "published", label: "Published" },
                      { key: "draft", label: "Draft" },
                      { key: "scheduled", label: "Scheduled" }
                    ].map(({ key, label }) => (
                      <button
                        key={key}
                        onClick={() => setStatusFilter(key)}
                        className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                          statusFilter === key
                            ? "bg-cyan-400 text-black font-bold"
                            : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Active filters summary */}
              {(categoryFilter !== "All" || statusFilter !== "All") && (
                <div className="mx-auto max-w-7xl px-6 pb-4 flex items-center gap-3">
                  <span className="text-xs text-white/40">Active filters:</span>
                  {categoryFilter !== "All" && (
                    <span className="flex items-center gap-1.5 rounded-full bg-fuchsia-400/10 border border-fuchsia-400/20 px-3 py-1 text-xs text-fuchsia-300">
                      Category: {categories.find((c) => c._id === categoryFilter)?.name || categoryFilter}
                      <button onClick={() => setCategoryFilter("All")}><X size={11} /></button>
                    </span>
                  )}
                  {statusFilter !== "All" && (
                    <span className="flex items-center gap-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 px-3 py-1 text-xs text-amber-300">
                      Status: {statusFilter.toUpperCase()}
                      <button onClick={() => setStatusFilter("All")}><X size={11} /></button>
                    </span>
                  )}
                  <button
                    onClick={() => { setCategoryFilter("All"); setStatusFilter("All"); }}
                    className="ml-auto text-xs text-white/30 hover:text-white/70 transition"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stories Grid */}
        <div className="mx-auto max-w-7xl px-6 py-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Loader2 className="h-10 w-10 animate-spin text-cyan-400 mb-4" />
              <p className="text-sm text-white/40">Loading stories...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center text-white/30">
              <BookOpen size={56} className="mb-4 opacity-20" />
              <p className="text-lg font-semibold">No stories found</p>
              <p className="text-sm mt-1 text-white/20">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              <AnimatePresence>
                {filtered.map((story, i) => {
                  const coverUrl = story.cover?.url
                    ? story.cover.url.startsWith("http")
                      ? story.cover.url
                      : `${SERVER_URL}${story.cover.url}`
                    : null;
                  
                  const isFuture = story.publishedAt && new Date(story.publishedAt) > new Date();
                  const displayStatus = story.status === "published" && isFuture ? "scheduled" : story.status;

                  return (
                    <motion.div
                      key={story._id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: i * 0.03 }}
                      className="group relative flex flex-col rounded-2xl border border-white/8 bg-white/[0.03] hover:bg-white/[0.06] overflow-hidden transition"
                    >
                      {/* Cover */}
                      <div className="relative aspect-[16/9] w-full bg-zinc-900 overflow-hidden">
                        {coverUrl ? (
                          <img
                            src={coverUrl}
                            alt={story.title}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="h-full w-full bg-gradient-to-br from-cyan-900 to-zinc-900 flex items-end p-4">
                            <p className="text-sm font-bold text-white leading-tight">{story.title}</p>
                          </div>
                        )}

                        {/* Status overlays */}
                        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                          {displayStatus === "published" && (
                            <span className="rounded-full bg-emerald-500/90 px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-white">Published</span>
                          )}
                          {displayStatus === "draft" && (
                            <span className="rounded-full bg-yellow-400/95 px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-black">Draft</span>
                          )}
                          {displayStatus === "scheduled" && (
                            <span className="rounded-full bg-cyan-400/95 px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-black flex items-center gap-1">
                              <Clock size={9} /> Scheduled
                            </span>
                          )}
                        </div>

                        {/* Action overlay */}
                        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
                          <Link
                            to="/admin"
                            state={{ editNewsletterId: story._id }}
                            className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-400 text-black hover:bg-cyan-300 transition shadow-lg"
                            title="Edit"
                          >
                            <Pencil size={16} />
                          </Link>
                          <button
                            onClick={() => handleDelete(story._id, story.title)}
                            className="grid h-10 w-10 place-items-center rounded-xl bg-red-500 text-white hover:bg-red-400 transition shadow-lg"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-4 flex flex-col gap-1 flex-1">
                        {story.categories && story.categories.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-1">
                            {story.categories.map((c) => (
                              <span key={c._id} className="text-[9px] bg-cyan-500/10 text-cyan-300 px-2 py-0.5 rounded font-medium">
                                {c.name}
                              </span>
                            ))}
                          </div>
                        )}
                        <h3 className="font-bold text-white leading-snug line-clamp-2 text-sm">{story.title}</h3>
                        <p className="text-xs text-white/45">by {story.author}</p>
                        
                        <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-white/35">
                          <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(story.publishedAt).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1"><Clock size={10} /> {story.readingTime}m read</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
