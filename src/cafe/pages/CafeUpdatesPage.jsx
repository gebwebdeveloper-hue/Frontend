import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, Award, Crown, Trophy, Sparkles, Calendar, Tag, User,
  Eye, Pin, ChevronRight, X, Megaphone, Flame, Gift, Star, Clock, Filter
} from "lucide-react";
import { API_BASE } from "../../config.js";

const CATEGORY_TAGS = [
  { id: "all", label: "All Updates", icon: Bell },
  { id: "Announcement", label: "Announcements", icon: Megaphone },
  { id: "Special Offer", label: "Special Offers", icon: Gift },
  { id: "New Arrival", label: "New Arrivals", icon: Sparkles },
  { id: "Event", label: "Events", icon: Calendar },
  { id: "Notice", label: "Notices", icon: Pin },
];

export default function CafeUpdatesPage() {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedUpdate, setSelectedUpdate] = useState(null);

  // Leaderboard / Visitor of the Month state
  const [spotlightData, setSpotlightData] = useState(null);
  const [loadingSpotlight, setLoadingSpotlight] = useState(true);

  useEffect(() => {
    // Fetch Updates
    setLoading(true);
    fetch(`${API_BASE}/cafe/updates?category=${activeCategory}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.success && d.updates) setUpdates(d.updates);
        else setUpdates([]);
      })
      .catch(() => setUpdates([]))
      .finally(() => setLoading(false));
  }, [activeCategory]);

  useEffect(() => {
    // Fetch Visitor of the Month & Frequency Leaderboard
    setLoadingSpotlight(true);
    fetch(`${API_BASE}/cafe/updates/visitor-of-month`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.success) setSpotlightData(d);
      })
      .catch(() => {})
      .finally(() => setLoadingSpotlight(false));
  }, []);

  const pinnedUpdates = updates.filter((u) => u.isPinned);
  const regularUpdates = updates.filter((u) => !u.isPinned);

  return (
    <div className="min-h-screen bg-[#140803] text-[#FAF5EB] pt-8 pb-20 px-4 sm:px-6 lg:px-8">
      {/* ── HERO BANNER ───────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl text-center py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 rounded-full border border-[#D4A85A]/40 bg-[#23120A] px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-[#D4A85A] shadow-xl mb-4"
        >
          <Megaphone size={14} className="text-[#D4A85A]" /> Official Announcements &amp; Community Highlights
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#FAF5EB] tracking-tight"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Cafe Updates &amp; Visitor Spotlight
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-4 text-sm sm:text-base text-white/75 max-w-2xl mx-auto leading-relaxed"
        >
          Stay up to date with new menu arrivals, exclusive cafe events, offers, and celebrate our monthly top visitors!
        </motion.p>
      </section>

      {/* ── VISITOR OF THE MONTH & LEADERBOARD SECTION ─────────────────────── */}
      <section className="mx-auto max-w-6xl mb-16">
        <div className="rounded-3xl border border-[#D4A85A]/30 bg-gradient-to-br from-[#23120A] via-[#1E0E07] to-[#140803] p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4A85A]/10 blur-3xl rounded-full pointer-events-none" />

          <div className="flex flex-wrap items-center justify-between gap-4 mb-8 border-b border-[#D4A85A]/20 pb-5">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#D4A85A]">
                <Trophy size={16} className="text-[#D4A85A]" /> Monthly Recognition
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#FAF5EB] mt-1" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                Most Visited Person of the Month
              </h2>
            </div>
            {spotlightData?.monthName && (
              <span className="rounded-2xl border border-[#D4A85A]/40 bg-[#140803] px-4 py-2 text-xs font-bold text-[#D4A85A] shadow-md flex items-center gap-2">
                <Calendar size={14} /> {spotlightData.monthName}
              </span>
            )}
          </div>

          <div className="grid gap-8 lg:grid-cols-12 items-stretch">
            {/* Left: Spotlight Card */}
            <div className="lg:col-span-5 rounded-2xl border-2 border-[#D4A85A] bg-gradient-to-b from-[#2E180E] to-[#1A0A04] p-6 text-center shadow-xl relative flex flex-col justify-between">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#D4A85A] px-4 py-1 text-[11px] font-black uppercase tracking-wider text-[#140803] shadow-md flex items-center gap-1">
                <Crown size={13} /> {spotlightData?.topVisitor?.customBadge || "Visitor of the Month"}
              </div>

              <div className="pt-4">
                <div className="mx-auto mb-4 grid h-24 w-24 place-items-center rounded-full bg-gradient-to-tr from-[#D4A85A] to-[#F5D796] text-[#140803] shadow-2xl border-4 border-[#140803] font-black text-3xl">
                  {spotlightData?.topVisitor?.memberName?.charAt(0).toUpperCase() || "🏆"}
                </div>

                <h3 className="text-2xl font-black text-[#FAF5EB]">
                  {spotlightData?.topVisitor?.memberName || "Top Visitor"}
                </h3>

                <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-[#D4A85A]/15 px-3.5 py-1 text-xs font-bold text-[#D4A85A] border border-[#D4A85A]/30">
                  <Flame size={14} className="text-amber-400" />
                  <span>{spotlightData?.topVisitor?.visitCount || 1} Orders / Visits This Month</span>
                </div>

                <p className="mt-4 text-xs text-white/80 leading-relaxed italic bg-[#140803]/60 p-3.5 rounded-xl border border-white/5">
                  "{spotlightData?.topVisitor?.message || "Awarded for exceptional community participation & frequent cafe visits this month!"}"
                </p>
              </div>

              <div className="mt-6 border-t border-[#D4A85A]/20 pt-4 flex items-center justify-between text-[11px] text-white/60">
                <span>Verified Activity</span>
                <span className="font-bold text-[#D4A85A] flex items-center gap-1">
                  <Award size={13} /> Ranked #1 Overall
                </span>
              </div>
            </div>

            {/* Right: Frequency Leaderboard Table */}
            <div className="lg:col-span-7 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-[#D4A85A] mb-3 flex items-center gap-2">
                  <Star size={14} /> Top 5 Visitor Frequency Leaderboard
                </h3>

                {loadingSpotlight ? (
                  <div className="py-12 text-center text-xs text-white/50">Loading leaderboard stats...</div>
                ) : (
                  <div className="space-y-2.5">
                    {(spotlightData?.leaderboard || []).map((user, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center justify-between rounded-2xl px-4 py-3 border transition ${
                          idx === 0
                            ? "bg-[#D4A85A]/20 border-[#D4A85A] text-[#FAF5EB]"
                            : "bg-[#140803]/80 border-[#D4A85A]/15 text-white/90 hover:border-[#D4A85A]/40"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`grid h-7 w-7 place-items-center rounded-full text-xs font-black ${
                              idx === 0
                                ? "bg-[#D4A85A] text-[#140803]"
                                : idx === 1
                                ? "bg-slate-300 text-slate-900"
                                : idx === 2
                                ? "bg-amber-700 text-amber-100"
                                : "bg-white/10 text-white/70"
                            }`}
                          >
                            {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}
                          </span>
                          <div>
                            <span className="text-sm font-bold block leading-tight">{user.name}</span>
                            <span className="text-[10px] text-white/50">{user.badge}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-sm font-black text-[#D4A85A] block leading-tight">
                            {user.visitCount} Visits
                          </span>
                          <span className="text-[10px] text-white/40">Frequent Orderer</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <p className="mt-4 text-[11px] text-white/50 text-center sm:text-left italic">
                * Leaderboard automatically updates based on monthly order frequency &amp; verified cafe visits.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── UPDATES & ANNOUNCEMENTS FEED SECTION ──────────────────────────── */}
      <section className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#FAF5EB]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Latest Cafe Updates &amp; Notices
            </h2>
            <p className="text-xs sm:text-sm text-[#D4A85A]/80 mt-1">
              Browse official news, announcements, and special promotional offers.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {CATEGORY_TAGS.map((cat) => {
              const IconComp = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                    isActive
                      ? "bg-[#D4A85A] text-[#140803] font-black shadow-lg"
                      : "bg-[#23120A] text-white/80 border border-[#D4A85A]/20 hover:border-[#D4A85A]/50"
                  }`}
                >
                  <IconComp size={12} /> {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-sm text-[#D4A85A]">Loading updates feed...</div>
        ) : updates.length === 0 ? (
          <div className="rounded-3xl border border-[#D4A85A]/20 bg-[#23120A] p-12 text-center text-white/70">
            <Megaphone size={40} className="mx-auto mb-3 text-[#D4A85A]/50" />
            <h3 className="text-lg font-bold text-[#FAF5EB]">No Updates Published Yet</h3>
            <p className="text-xs text-white/50 mt-1">Check back soon for new announcements from our team!</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Pinned Updates Grid */}
            {pinnedUpdates.length > 0 && (
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-amber-400 mb-4 flex items-center gap-1.5">
                  <Flame size={14} className="text-amber-400" /> Pinned Announcements
                </span>
                <div className="grid gap-6 md:grid-cols-2">
                  {pinnedUpdates.map((item) => (
                    <UpdateCard key={item._id} item={item} onSelect={setSelectedUpdate} isPinned />
                  ))}
                </div>
              </div>
            )}

            {/* Regular Updates Grid */}
            {regularUpdates.length > 0 && (
              <div>
                {pinnedUpdates.length > 0 && (
                  <span className="text-xs font-black uppercase tracking-wider text-[#D4A85A] mb-4 block">
                    All Updates ({regularUpdates.length})
                  </span>
                )}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {regularUpdates.map((item) => (
                    <UpdateCard key={item._id} item={item} onSelect={setSelectedUpdate} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ── UPDATE DETAIL MODAL ────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedUpdate && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUpdate(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative z-10 w-full max-w-2xl rounded-3xl bg-[#23120A] border border-[#D4A85A]/40 text-[#FAF5EB] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedUpdate(null)}
                className="absolute top-4 right-4 z-20 grid h-8 w-8 place-items-center rounded-full bg-black/60 text-white hover:bg-black transition"
              >
                <X size={16} />
              </button>

              {/* Image banner if present */}
              {selectedUpdate.imageUrl && (
                <div className="relative h-64 w-full overflow-hidden shrink-0">
                  <img src={selectedUpdate.imageUrl} alt={selectedUpdate.title} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#23120A] via-transparent to-transparent" />
                </div>
              )}

              <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="rounded-full bg-[#D4A85A] px-3 py-0.5 text-[10px] font-black text-[#140803] uppercase">
                    {selectedUpdate.category}
                  </span>
                  {selectedUpdate.isPinned && (
                    <span className="rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-0.5 text-[10px] font-black uppercase flex items-center gap-1">
                      <Flame size={10} /> Pinned
                    </span>
                  )}
                  <span className="text-xs text-white/50 ml-auto flex items-center gap-1">
                    <Clock size={12} /> {new Date(selectedUpdate.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-[#FAF5EB] leading-snug mb-4" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  {selectedUpdate.title}
                </h2>

                <div className="prose prose-invert max-w-none text-sm text-white/85 leading-relaxed whitespace-pre-line border-t border-[#D4A85A]/15 pt-4">
                  {selectedUpdate.content}
                </div>

                <div className="mt-8 border-t border-[#D4A85A]/15 pt-4 flex items-center justify-between text-xs text-white/50">
                  <span>Published by <strong>{selectedUpdate.authorName}</strong></span>
                  <button
                    onClick={() => setSelectedUpdate(null)}
                    className="rounded-xl bg-[#D4A85A] px-4 py-2 text-xs font-bold text-[#140803] hover:bg-[#b88f44] transition"
                  >
                    Close Update
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function UpdateCard({ item, onSelect, isPinned }) {
  return (
    <div
      onClick={() => onSelect(item)}
      className={`group cursor-pointer overflow-hidden rounded-3xl border-2 transition-all duration-300 flex flex-col justify-between ${
        isPinned
          ? "border-[#D4A85A] bg-[#23120A] shadow-2xl scale-[1.01]"
          : "border-[#D4A85A]/20 bg-[#1E0E07] hover:border-[#D4A85A]/50"
      }`}
    >
      <div>
        {item.imageUrl && (
          <div className="relative h-48 overflow-hidden">
            <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1E0E07] via-transparent to-transparent" />
          </div>
        )}

        <div className="p-5">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="rounded-full bg-[#D4A85A] px-3 py-0.5 text-[10px] font-black text-[#140803] uppercase">
              {item.category}
            </span>
            <span className="text-[10px] text-white/50">
              {new Date(item.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
            </span>
          </div>

          <h3 className="text-lg font-black text-[#FAF5EB] group-hover:text-[#D4A85A] transition line-clamp-2">
            {item.title}
          </h3>

          <p className="text-xs text-[#FAF5EB]/70 leading-relaxed mt-2 line-clamp-3">
            {item.content}
          </p>
        </div>
      </div>

      <div className="px-5 pb-5 pt-2 border-t border-[#D4A85A]/10 flex items-center justify-between text-xs text-[#D4A85A] font-bold">
        <span>Read Full Post</span>
        <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
      </div>
    </div>
  );
}
