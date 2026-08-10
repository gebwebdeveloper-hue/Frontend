import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Coffee, Leaf, Clock, Search, Filter, ShoppingBag,
  Sparkles, UtensilsCrossed, Star, Check, Plus, RefreshCw,
  LayoutGrid, List, ChevronRight, Zap, Flame, Wind,
} from "lucide-react";
import { API_BASE } from "../../config.js";
import { addToCafeCart } from "../utils/cafeCart.js";

const CATEGORIES = [
  { id: "all", label: "All Items", icon: Coffee, color: "#D4A85A" },
  { id: "coffee", label: "Coffee", icon: Coffee, color: "#D4A85A" },
  { id: "tea", label: "Tea & Herbal", icon: Leaf, color: "#4A7C59" },
  { id: "cold-drinks", label: "Cold Drinks", icon: Wind, color: "#2A6B8B" },
  { id: "snacks", label: "Snacks", icon: UtensilsCrossed, color: "#C05621" },
  { id: "meals", label: "Meals", icon: UtensilsCrossed, color: "#8C2D19" },
  { id: "desserts", label: "Desserts", icon: Sparkles, color: "#D4A85A" },
];

const CAT_COLORS = {
  coffee: "#D4A85A",
  tea: "#4A7C59",
  "cold-drinks": "#2A6B8B",
  snacks: "#C05621",
  meals: "#8C2D19",
  desserts: "#D4A85A",
  others: "#5A6B7C",
};

export default function CafeMenuPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [addedItemName, setAddedItemName] = useState(null);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [selectedItemName, setSelectedItemName] = useState("");

  const fetchMenu = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/cafe/menu`);
      const data = await res.json();
      if (data.success && data.items) {
        setItems(data.items);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesCat = activeCategory === "all" || item.category === activeCategory;
      const matchesSearch =
        !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCat && matchesSearch;
    });
  }, [items, activeCategory, searchQuery]);

  const handleAddToCart = (item) => {
    setSelectedItemName(item.name);
    setShowComingSoon(true);
  };

  return (
    <div className="min-h-screen pb-24 text-[#FAF5EB]" style={{ background: "#140803" }}>
      {/* ── HERO BANNER ───────────────────────────────────────────────────── */}
      <section
        className="relative min-h-[520px] overflow-hidden px-6 py-20 lg:py-24 text-left text-white flex items-center bg-cover bg-center"
        style={{ backgroundImage: "url('/cafe-menu-hero-bg.png')" }}
      >
        {/* Dark left gradient overlay for high contrast and readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0D0502]/95 via-[#0D0502]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#140803] via-transparent to-black/20" />

        <div className="relative z-10 mx-auto max-w-6xl w-full">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#D4A85A]/60 bg-[#140803]/80 backdrop-blur-md px-4 py-1.5 text-xs font-black uppercase tracking-[0.25em] text-[#D4A85A] shadow-xl mb-4">
              <Coffee size={14} className="text-[#D4A85A]" /> FULL CAFE MENU
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] text-[#FAF5EB] tracking-tight" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Handcrafted Brews &amp;<br />
              Gourmet Delights
            </h1>

            <p className="mt-4 text-sm sm:text-base text-white/80 leading-relaxed font-medium">
              Explore our full selection of freshly brewed coffees, specialty teas, artisan snacks, wholesome meals, and handmade desserts.
            </p>

            {/* Search Bar */}
            <div className="mt-8 relative max-w-md">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4A85A]" />
              <input
                type="text"
                placeholder="Search for cold coffee, sandwiches, brownies…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border-2 border-[#D4A85A]/50 bg-[#140803]/90 backdrop-blur-md py-3.5 pl-11 pr-4 text-sm font-bold text-[#FAF5EB] placeholder-white/50 outline-none shadow-2xl focus:border-[#D4A85A] transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#D4A85A] hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── CATEGORY PILLS & CONTROLS ─────────────────────────────────────── */}
      <section className="sticky top-20 z-30 border-b border-[#D4A85A]/25 bg-[#1A0C06]/95 backdrop-blur-xl px-6 py-4 shadow-xl">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {CATEGORIES.map((c) => {
              const count = c.id === "all" ? items.length : items.filter((i) => i.category === c.id).length;
              const isSelected = activeCategory === c.id;
              const Icon = c.icon;
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveCategory(c.id)}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-black transition-all duration-300 ${
                    isSelected
                      ? "bg-[#D4A85A] text-[#140803] shadow-lg scale-105"
                      : "bg-[#23120A] text-[#FAF5EB] border border-[#D4A85A]/30 hover:border-[#D4A85A]"
                  }`}
                >
                  <Icon size={14} style={{ color: isSelected ? "#140803" : "#D4A85A" }} />
                  <span>{c.label}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                      isSelected ? "bg-[#140803]/20 text-[#140803]" : "bg-[#D4A85A]/20 text-[#D4A85A]"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 rounded-xl border border-[#D4A85A]/30 bg-[#23120A] p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition ${viewMode === "grid" ? "bg-[#D4A85A] text-[#140803]" : "text-white/60"}`}
              title="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg transition ${viewMode === "list" ? "bg-[#D4A85A] text-[#140803]" : "text-white/60"}`}
              title="List View"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* ── MENU ITEMS DISPLAY ────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-72 animate-pulse rounded-3xl bg-[#D4A85A]/10" />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Coffee size={56} className="mb-3 text-[#D4A85A]/40" />
            <h3 className="text-xl font-bold text-[#FAF5EB]/60">No items found</h3>
            <p className="text-xs text-white/40 mt-1">Try selecting another category or clear your search query.</p>
            <button
              onClick={() => { setActiveCategory("all"); setSearchQuery(""); }}
              className="mt-4 rounded-xl bg-[#D4A85A] px-5 py-2 text-xs font-black text-[#140803] hover:bg-white transition"
            >
              Reset Filters
            </button>
          </div>
        ) : viewMode === "grid" ? (
          /* GRID VIEW */
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredItems.map((item) => {
              const color = CAT_COLORS[item.category] || "#D4A85A";
              return (
                <motion.div
                  key={item._id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="group relative flex flex-col overflow-hidden rounded-3xl border border-[#D4A85A]/25 bg-[#23120A] shadow-lg transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-[#D4A85A]/10"
                >
                  {/* Image Container */}
                  <div
                    className="relative h-48 overflow-hidden"
                    style={{ background: `linear-gradient(135deg, ${color}20 0%, ${color}40 100%)` }}
                  >
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Coffee size={48} style={{ color: "#D4A85A", opacity: 0.3 }} />
                      </div>
                    )}
                    <span
                      className="absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase text-[#140803] shadow-md"
                      style={{ background: "#D4A85A" }}
                    >
                      {item.category}
                    </span>
                    {item.featured && (
                      <span className="absolute right-3 top-3 rounded-full bg-[#D4A85A] px-2.5 py-0.5 text-[10px] font-black uppercase text-[#140803] shadow-md">
                        ⭐ Bestseller
                      </span>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h3 className="text-base font-black leading-snug text-[#FAF5EB]">
                        {item.name}
                      </h3>
                      <span
                        className="shrink-0 rounded-full px-3 py-1 text-sm font-black text-[#D4A85A]"
                        style={{ background: "rgba(212,168,90,0.15)" }}
                      >
                        ₹{item.price}
                      </span>
                    </div>

                    {item.description && (
                      <p className="mb-4 text-xs leading-relaxed text-[#FAF5EB]/65 line-clamp-2">
                        {item.description}
                      </p>
                    )}

                    <div className="mt-auto flex items-center justify-between text-[11px] font-bold text-white/50 border-t border-[#D4A85A]/15 pt-3">
                      <span className="flex items-center gap-1 text-[#D4A85A]">
                        <Clock size={13} /> {item.preparationTime || 8} mins
                      </span>

                      <button
                        onClick={() => handleAddToCart(item)}
                        className="flex shrink-0 whitespace-nowrap items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-black text-[#140803] shadow-md transition hover:scale-105"
                        style={{ background: "linear-gradient(135deg, #D4A85A, #A0522D)" }}
                      >
                        <Sparkles size={14} /> Coming Soon
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          /* LIST VIEW */
          <div className="space-y-4">
            {filteredItems.map((item) => {
              return (
                <div
                  key={item._id}
                  className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl border border-[#D4A85A]/25 bg-[#23120A] p-4 shadow-md transition hover:border-[#D4A85A]/50"
                >
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-[#140803]">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Coffee size={24} className="text-[#D4A85A]" />
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#D4A85A]">
                        {item.category}
                      </span>
                      <h3 className="text-base font-black text-[#FAF5EB]">{item.name}</h3>
                      {item.description && (
                        <p className="text-xs text-[#FAF5EB]/65 line-clamp-1 max-w-lg">{item.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-[#D4A85A]/15 pt-2 sm:pt-0">
                    <span className="text-base font-black text-[#D4A85A]">₹{item.price}</span>
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="flex shrink-0 whitespace-nowrap items-center gap-1.5 rounded-xl bg-[#D4A85A] px-4 py-2 text-xs font-black text-[#140803] shadow-md hover:bg-white transition"
                    >
                      <Sparkles size={14} /> Coming Soon
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── COMING SOON MODAL ────────────────────────────────────────────── */}
      <AnimatePresence>
        {showComingSoon && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowComingSoon(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative z-10 w-full max-w-md rounded-3xl bg-[#23120A] p-6 text-center shadow-2xl border border-[#D4A85A]/40 text-white"
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#D4A85A]/20 text-[#D4A85A] border border-[#D4A85A]/40">
                <Coffee size={32} />
              </div>
              <h3 className="text-2xl font-black text-[#FAF5EB]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                Online Cart &amp; Ordering Coming Soon! 🚀
              </h3>
              <p className="text-xs text-white/80 mt-2 leading-relaxed">
                Online food &amp; beverage ordering for counter pickup is launching very soon at Lekhok Tripura Cafe.
              </p>

              {selectedItemName && (
                <div className="mt-4 rounded-2xl bg-[#140803] p-4 text-xs text-left border border-[#D4A85A]/25">
                  <p className="font-bold text-[#D4A85A]">Selected Item:</p>
                  <p className="text-sm font-black text-[#FAF5EB] mt-0.5">{selectedItemName}</p>
                  <p className="text-white/60 mt-1">Order directly at the cafe counter during your visit!</p>
                </div>
              )}

              <button
                onClick={() => setShowComingSoon(false)}
                className="mt-6 w-full rounded-2xl bg-[#D4A85A] py-3.5 text-xs font-black text-[#140803] shadow-lg hover:bg-white transition"
              >
                Got It
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
