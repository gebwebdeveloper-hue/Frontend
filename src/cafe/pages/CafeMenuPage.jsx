import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Coffee, Leaf, Search, ShoppingBag,
  Sparkles, UtensilsCrossed, Wind, Plus, Flame,
} from "lucide-react";
import { API_BASE } from "../../config.js";
import { addToCafeCart } from "../utils/cafeCart.js";

/* ── Category metadata ─────────────────────────────────────────── */
const CAT_META = {
  coffee:        { icon: Coffee,           color: "#D4A85A", emoji: "☕" },
  tea:           { icon: Leaf,             color: "#4A7C59", emoji: "🍃" },
  "cold-drinks": { icon: Wind,             color: "#2A6B8B", emoji: "🧊" },
  snacks:        { icon: UtensilsCrossed,  color: "#C05621", emoji: "🥪" },
  meals:         { icon: UtensilsCrossed,  color: "#8C2D19", emoji: "🍽️" },
  desserts:      { icon: Sparkles,         color: "#D4A85A", emoji: "🍰" },
  others:        { icon: Flame,            color: "#5A6B7C", emoji: "✨" },
};

const CATEGORY_IDS = ["coffee", "tea", "cold-drinks", "snacks", "meals", "desserts", "others"];

/* ── Category Section Banner ───────────────────────────────────── */
function CategoryBanner({ catId, heading }) {
  const meta = CAT_META[catId] || CAT_META.others;
  const Icon = meta.icon;
  const title    = heading?.title    || `${catId.replace("-", " ").toUpperCase()} COLLECTION`;
  const subtitle = heading?.subtitle || "";
  return (
    <div
      className="relative overflow-hidden rounded-3xl px-8 py-10 text-center mb-8 border border-[#D4A85A]/25 shadow-2xl"
      style={{
        background: "linear-gradient(135deg, #1A0C06 0%, #23120A 50%, #1A0C06 100%)",
      }}
    >
      {/* Decorative gold dots */}
      <div className="absolute left-4 top-4 text-[#D4A85A]/30 text-2xl select-none">✦ ✦ ✦</div>
      <div className="absolute right-4 top-4 text-[#D4A85A]/30 text-2xl select-none">✦ ✦ ✦</div>
      <div className="absolute bottom-4 left-4 text-[#D4A85A]/20 text-base select-none">❋ ❋</div>
      <div className="absolute bottom-4 right-4 text-[#D4A85A]/20 text-base select-none">❋ ❋</div>

      {/* Category Icon Badge */}
      <div className="mb-4 flex justify-center">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#D4A85A]/40 shadow-lg"
          style={{ background: "linear-gradient(135deg, rgba(212,168,90,0.15), rgba(160,82,45,0.25))" }}
        >
          <Icon size={24} style={{ color: "#D4A85A" }} strokeWidth={1.8} />
        </div>
      </div>

      <h2
        className="text-3xl sm:text-4xl md:text-5xl font-black tracking-[0.14em] uppercase leading-tight animate-gold-shimmer drop-shadow-md"
        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
      >
        {title}
      </h2>
      {subtitle && (
        <p className="mt-2 text-xs font-bold tracking-[0.22em] uppercase text-[#D4A85A]/80">
          {subtitle}
        </p>
      )}
      <div className="mt-4 mx-auto w-24 h-px bg-gradient-to-r from-transparent via-[#D4A85A] to-transparent" />
    </div>
  );
}

/* ── Single Menu Item Card ─────────────────────────────────────── */
function MenuItemCard({ item, number, onAddToCart }) {
  const [added, setAdded] = useState(false);
  const meta = CAT_META[item.category] || CAT_META.others;

  const handleAdd = () => {
    onAddToCart(item);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-[#D4A85A]/20 bg-[#1E0E07] shadow-lg hover:border-[#D4A85A]/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#D4A85A]/10"
    >
      {/* ── Image ── */}
      <div className="relative aspect-square overflow-hidden bg-[#23120A]">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-108"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Coffee size={40} style={{ color: meta.color, opacity: 0.3 }} />
          </div>
        )}
        {/* dark overlay at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1E0E07]/90 via-transparent to-transparent" />

        {/* Number badge */}
        <span className="absolute left-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-[#D4A85A] text-[11px] font-black text-[#140803] shadow-lg">
          {number}
        </span>

        {item.featured && (
          <span className="absolute right-3 top-3 rounded-full bg-gradient-to-r from-[#D4A85A] to-[#A0522D] px-2.5 py-0.5 text-[9px] font-black uppercase text-[#140803] shadow-lg tracking-wide">
            ⭐ Bestseller
          </span>
        )}
      </div>

      {/* ── Content ── */}
      <div className="flex flex-1 flex-col p-4 gap-3">

        {/* Name + price */}
        <div className="flex items-start justify-between gap-2">
          <h3
            className="text-sm font-black leading-snug text-[#FAF5EB] uppercase tracking-wide"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {item.name}
          </h3>
          <span className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-black text-[#D4A85A] bg-[#D4A85A]/10">
            ₹{item.price}
          </span>
        </div>

        {/* Description */}
        {item.description && (
          <p className="text-[11px] leading-relaxed text-[#FAF5EB]/60 line-clamp-3">
            {item.description}
          </p>
        )}

        {/* Ingredients */}
        {item.ingredients && item.ingredients.length > 0 && (
          <div className="rounded-xl border border-[#D4A85A]/15 bg-[#140803]/60 p-3">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#D4A85A] mb-2">
              Ingredients (Approx.)
            </p>
            <div className="space-y-1">
              {item.ingredients.map((ing, i) => {
                const raw = (ing.percent || "").trim();
                const formattedPercent = raw ? (raw.endsWith("%") || isNaN(raw) ? raw : `${raw}%`) : "";
                return (
                  <div key={i} className="flex items-center justify-between text-[10px]">
                    <span className="flex items-center gap-1.5 text-[#FAF5EB]/75 font-semibold">
                      <span className="h-1 w-1 rounded-full bg-[#D4A85A] inline-block" />
                      {ing.name}
                    </span>
                    <span className="font-black text-[#D4A85A]/80">{formattedPercent}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* How it looks */}
        {item.howItLooks && (
          <p className="text-[10px] font-semibold italic text-[#FAF5EB]/50 leading-relaxed border-l-2 border-[#D4A85A]/30 pl-2.5">
            <span className="text-[#D4A85A] not-italic font-black">HOW IT LOOKS: </span>
            {item.howItLooks}
          </p>
        )}

        {/* Add to cart button */}
        <div className="mt-auto pt-2 border-t border-[#D4A85A]/10">
          <button
            onClick={handleAdd}
            className={`w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-black transition-all duration-300 ${
              added
                ? "bg-[#4A7C59] text-white scale-95"
                : "bg-gradient-to-r from-[#D4A85A] to-[#A0522D] text-[#140803] hover:scale-105 hover:shadow-lg hover:shadow-[#D4A85A]/20"
            }`}
          >
            {added ? (
              <>✓ Added to Cart</>
            ) : (
              <><Plus size={14} /> Add to Cart</>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Main Menu Page ────────────────────────────────────────────── */
export default function CafeMenuPage() {
  const [items, setItems]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [activeCategory, setActiveCategory] = useState("coffee");
  const [searchQuery, setSearchQuery]   = useState("");
  const [catHeadings, setCatHeadings]   = useState({});
  const [cartNotif, setCartNotif]       = useState(null);

  const fetchMenu = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/cafe/menu`);
      const data = await res.json();
      if (data.success && data.items) {
        setItems(data.items);
        // If current activeCategory has no items, pick first available category
        const availableCats = CATEGORY_IDS.filter((id) => data.items.some((i) => i.category === id));
        if (availableCats.length > 0 && !data.items.some((i) => i.category === "coffee")) {
          setActiveCategory(availableCats[0]);
        }
      }
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  };

  const fetchHeadings = async () => {
    try {
      const res  = await fetch(`${API_BASE}/cafe/categories`);
      const data = await res.json();
      if (data.success) {
        const map = {};
        data.categories.forEach((c) => { map[c.categoryId] = c; });
        setCatHeadings(map);
      }
    } catch { /* ignore */ }
  };

  useEffect(() => {
    fetchMenu();
    fetchHeadings();
  }, []);

  /* Filter to just the active category */
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchCat    = item.category === activeCategory;
      const matchSearch = !searchQuery
        || item.name.toLowerCase().includes(searchQuery.toLowerCase())
        || (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [items, activeCategory, searchQuery]);

  /* Determine which categories to show */
  const categoriesToShow = useMemo(() => {
    return [activeCategory];
  }, [activeCategory]);

  const handleAddToCart = (item) => {
    addToCafeCart(item);
    setCartNotif(item.name);
    setTimeout(() => setCartNotif(null), 2200);
  };

  /* Count per category for pills */
  const countByCat = useMemo(() => {
    const map = { all: items.length };
    CATEGORY_IDS.forEach((id) => { map[id] = items.filter((i) => i.category === id).length; });
    return map;
  }, [items]);

  return (
    <div className="min-h-screen pb-28 text-[#FAF5EB]" style={{ background: "#140803" }}>

      {/* ── HERO BANNER ────────────────────────────────────────────────── */}
      <section
        className="relative min-h-[480px] overflow-hidden px-6 py-20 lg:py-24 flex items-center bg-cover bg-center"
        style={{ backgroundImage: "url('/cafe-menu-hero-bg.png')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#0D0502]/95 via-[#0D0502]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#140803] via-transparent to-black/20" />

        <div className="relative z-10 mx-auto max-w-6xl w-full">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#D4A85A]/60 bg-[#140803]/80 backdrop-blur-md px-4 py-1.5 text-xs font-black uppercase tracking-[0.25em] text-[#D4A85A] shadow-xl mb-4">
              <Coffee size={14} /> FULL CAFE MENU
            </span>

            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] text-[#FAF5EB] tracking-tight"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Handcrafted Brews &<br />Gourmet Delights
            </h1>

            <p className="mt-4 text-sm sm:text-base text-white/80 leading-relaxed font-medium">
              Explore our full selection of freshly brewed coffees, specialty teas, artisan snacks, wholesome meals, and handmade desserts.
            </p>

            {/* Search */}
            <div className="mt-8 relative max-w-md">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4A85A]" />
              <input
                type="text"
                placeholder="Search coffees, snacks, desserts…"
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

      {/* ── CATEGORY PILLS ─────────────────────────────────────────────── */}
      <section className="sticky top-20 z-30 border-b border-[#D4A85A]/25 bg-[#1A0C06]/95 backdrop-blur-xl px-6 py-4 shadow-xl">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center gap-2 overflow-x-auto no-scrollbar">
          {CATEGORY_IDS.filter((id) => countByCat[id] > 0).map((catId) => {
            const meta     = CAT_META[catId] || CAT_META.others;
            const Icon     = meta.icon;
            const isActive = activeCategory === catId;
            const heading  = catHeadings[catId];
            const label    = heading?.title
              ? heading.title.replace(/ COLLECTION$/, "").replace(/ & .*/i, "").trim()
              : catId.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase());
            return (
              <button
                key={catId}
                onClick={() => setActiveCategory(catId)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-black transition-all duration-300 ${
                  isActive
                    ? "bg-[#D4A85A] text-[#140803] shadow-lg scale-105"
                    : "bg-[#23120A] text-[#FAF5EB] border border-[#D4A85A]/30 hover:border-[#D4A85A]"
                }`}
              >
                <Icon size={13} style={{ color: isActive ? "#140803" : meta.color }} />
                {label}
                <span className={`rounded-full px-1.5 text-[10px] ${isActive ? "bg-[#140803]/20 text-[#140803]" : "bg-[#D4A85A]/20 text-[#D4A85A]"}`}>
                  {countByCat[catId]}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── MENU ITEMS DISPLAY ─────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-10 space-y-16">

        {loading ? (
          /* Skeleton loading */
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl bg-[#D4A85A]/10 h-96" />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Coffee size={56} className="mb-3 text-[#D4A85A]/40" />
            <h3 className="text-xl font-bold text-[#FAF5EB]/60">No items found</h3>
            <p className="text-xs text-white/40 mt-1">Try selecting another category or clear your search.</p>
            <button
              onClick={() => { setActiveCategory("all"); setSearchQuery(""); }}
              className="mt-4 rounded-xl bg-[#D4A85A] px-5 py-2 text-xs font-black text-[#140803] hover:bg-white transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          /* Render one section per category */
          categoriesToShow.map((catId) => {
            const catItems = filteredItems
              .filter((i) => i.category === catId);
            if (catItems.length === 0) return null;

            return (
              <div key={catId} id={`cat-${catId}`}>
                {/* Category Banner Heading */}
                <CategoryBanner catId={catId} heading={catHeadings[catId]} />

                {/* 4-column item grid */}
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {catItems.map((item, idx) => (
                    <MenuItemCard
                      key={item._id}
                      item={item}
                      number={idx + 1}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </section>

      {/* ── CART NOTIFICATION TOAST ────────────────────────────────────── */}
      <AnimatePresence>
        {cartNotif && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed bottom-6 right-6 z-[200] flex items-center gap-3 rounded-2xl border border-[#D4A85A]/40 bg-[#23120A] px-5 py-3.5 shadow-2xl"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#4A7C59]">
              <ShoppingBag size={16} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-black text-[#FAF5EB]">Added to Cart!</p>
              <p className="text-[10px] text-[#FAF5EB]/60 max-w-[180px] truncate">{cartNotif}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
