import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  Coffee, Leaf, Clock, MapPin, Star, ChevronRight, Phone, Instagram,
  Facebook, ArrowRight, Sparkles, UtensilsCrossed, Wind, Music,
  BookOpen, Wifi, ShoppingBag,
} from "lucide-react";
import { API_BASE } from "../../config.js";
import { addToCafeCart } from "../utils/cafeCart.js";

/* ── Helpers ────────────────────────────────────────────────────── */
function FadeIn({ children, delay = 0, className = "", direction = "up" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const yMap = { up: 36, down: -36, left: 36, right: -36 };
  const xMap = { up: 0, down: 0, left: -36, right: 36 };
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: yMap[direction] || 0, x: xMap[direction] || 0 }}
      animate={inView ? { opacity: 1, y: 0, x: 0 } : {}}
      transition={{ duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── Static Data ────────────────────────────────────────────────── */
const categories = [
  { id: "all",         icon: Coffee,           label: "All Items",    color: "#6B3F2A" },
  { id: "coffee",      icon: Coffee,           label: "Coffee",       color: "#6B3F2A" },
  { id: "tea",         icon: Leaf,             label: "Tea & Herbal", color: "#4A7C59" },
  { id: "cold-drinks", icon: Wind,             label: "Cold Drinks",  color: "#2A6B8B" },
  { id: "snacks",      icon: UtensilsCrossed,  label: "Snacks",       color: "#8B6A2A" },
  { id: "meals",       icon: UtensilsCrossed,  label: "Meals",        color: "#7A3B4B" },
  { id: "desserts",    icon: Sparkles,         label: "Desserts",     color: "#8B2A5E" },
];

const highlights = [
  {
    icon: Coffee,
    title: "Freshly Brewed",
    desc: "Premium coffee & drinks",
    color: "#6B3F2A",
    glow: "rgba(107,63,42,0.18)",
  },
  {
    icon: BookOpen,
    title: "Reading Slots",
    desc: "Enjoy a quiet reading time",
    color: "#4A7C59",
    glow: "rgba(74,124,89,0.18)",
  },
  {
    icon: UtensilsCrossed,
    title: "Cozy Space",
    desc: "Work, read, or simply relax",
    color: "#8B6A2A",
    glow: "rgba(139,106,42,0.18)",
  },
  {
    icon: Wifi,
    title: "Free Wi-Fi",
    desc: "Stay connected",
    color: "#2A6B8B",
    glow: "rgba(42,107,139,0.18)",
  },
];

const testimonials = [
  {
    name: "Priya Deb",
    role: "Regular Visitor",
    text: "The best corner in Agartala to sit, read and sip a perfect coffee. Feels like home.",
    stars: 5,
  },
  {
    name: "Rahul Chakma",
    role: "Book Lover",
    text: "Love the ambience! The chai is exactly how I like it — warm, spiced, and just right.",
    stars: 5,
  },
  {
    name: "Ananya Roy",
    role: "Writer",
    text: "I write all my short stories here. The calm atmosphere is incredibly inspiring.",
    stars: 5,
  },
];

/* ── Fallback featured items (shown if API has no data yet) ──────── */
const FALLBACK_ITEMS = [
  { _id: "f1", name: "Signature Espresso", price: 80,  category: "coffee",   imageUrl: "", description: "Rich, bold, aromatic double espresso shot." },
  { _id: "f2", name: "Masala Chai",        price: 50,  category: "tea",      imageUrl: "", description: "Classic spiced Indian tea with ginger & cardamom." },
  { _id: "f3", name: "Mango Smoothie",     price: 120, category: "cold-drinks", imageUrl: "", description: "Fresh Alphonso mango blended with chilled yogurt." },
  { _id: "f4", name: "Veg Club Sandwich",  price: 150, category: "snacks",   imageUrl: "", description: "Triple-decker sandwich with fresh veggies & cheese." },
  { _id: "f5", name: "Cold Brew Coffee",   price: 130, category: "coffee",   imageUrl: "", description: "18-hour cold-steeped smooth and refreshing brew." },
  { _id: "f6", name: "Walnut Brownie",     price: 90,  category: "desserts", imageUrl: "", description: "Fudgy dark-chocolate brownie loaded with walnuts." },
];

const CATEGORY_COLORS = {
  coffee: "#6B3F2A",
  tea: "#4A7C59",
  "cold-drinks": "#2A6B8B",
  snacks: "#8B6A2A",
  meals: "#7A3B4B",
  desserts: "#8B2A5E",
  others: "#555",
};

/* ── Component ──────────────────────────────────────────────────── */
export default function CafeHomePage() {
  const [featuredItems, setFeaturedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [activeCat, setActiveCat] = useState("all");

  /* Auto-rotate testimonials */
  useEffect(() => {
    const t = setInterval(() => setActiveTestimonial((i) => (i + 1) % testimonials.length), 5000);
    return () => clearInterval(t);
  }, []);

  /* Fetch featured menu from API whenever category changes */
  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/cafe/menu/featured?category=${activeCat}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.items && d.items.length > 0) {
          setFeaturedItems(d.items);
        } else {
          if (activeCat === "all") {
            setFeaturedItems(FALLBACK_ITEMS);
          } else {
            const filteredFallback = FALLBACK_ITEMS.filter((i) => i.category === activeCat);
            setFeaturedItems(filteredFallback.length ? filteredFallback : FALLBACK_ITEMS);
          }
        }
      })
      .catch(() => setFeaturedItems(FALLBACK_ITEMS))
      .finally(() => setLoading(false));
  }, [activeCat]);

  return (
    <div className="overflow-x-hidden" style={{ fontFamily: "'Lato', 'Georgia', sans-serif", background: "#FAF5EB" }}>

      {/* ── HERO ────────────────────────────────────────────────── */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 text-center" style={{ background: "#1a0a00" }}>
        {/* ── Video Background ── */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
          style={{ zIndex: 0 }}
        >
          <source src="/Books_and_coffee_on_table_202608101927.mp4" type="video/mp4" />
        </video>

        {/* ── Warm dark overlay ── */}
        <div
          className="absolute inset-0"
          style={{ zIndex: 1, background: "linear-gradient(to bottom, rgba(20,8,0,0.55) 0%, rgba(20,8,0,0.65) 60%, rgba(20,8,0,0.80) 100%)" }}
        />

        {/* Decorative circles (above overlay, below content) */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ zIndex: 2 }}>
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full border"
              style={{
                borderColor: `rgba(212,168,90,${0.08 + i * 0.04})`,
                width: `${220 + i * 150}px`,
                height: `${220 + i * 150}px`,
                top: "50%",
                left: "50%",
                x: "-50%",
                y: "-50%",
              }}
              animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
              transition={{ duration: 30 + i * 10, repeat: Infinity, ease: "linear" }}
            />
          ))}
        </div>

        {/* Hero content */}
        <div className="relative flex flex-col items-center max-w-3xl" style={{ zIndex: 3 }}>
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mb-6 flex items-center gap-2.5 rounded-full border border-[#D4A85A]/60 bg-black/40 backdrop-blur-md px-5 py-2 shadow-lg"
          >
            <Coffee size={14} className="text-[#D4A85A]" />
            <span className="text-xs font-black uppercase tracking-[0.25em] text-[#FAF5EB]">
              Now Open in Tripura
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="mb-4 text-5xl sm:text-6xl md:text-7xl font-black leading-[1.1] tracking-tight drop-shadow-2xl"
            style={{ color: "#FAF5EB", fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Where Words Meet{" "}
            <span
              className="relative inline-block"
              style={{ color: "#D4A85A" }}
            >
              Coffee
              <svg
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 200 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <motion.path
                  d="M2 8 Q50 2 100 8 Q150 14 198 8"
                  stroke="#D4A85A"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.2, delay: 1.1, ease: "easeOut" }}
                />
              </svg>
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.55 }}
            className="mb-10 max-w-xl text-base sm:text-lg leading-relaxed drop-shadow-md"
            style={{ color: "#FAF5EB", opacity: 0.85 }}
          >
            A cozy café by Lekhok Tripura — where book lovers, writers, and dreamers gather over artisan brews and good conversation.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7 }}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            <Link
              to="/cafe/menu"
              className="group flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold text-[#FAF5EB] shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
              style={{ background: "linear-gradient(135deg, #6B3F2A 0%, #A0522D 100%)" }}
            >
              <Coffee size={16} />
              Explore Menu
              <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              to="/cafe/reserve"
              className="flex items-center gap-2 rounded-full border-2 border-[#6B3F2A]/25 bg-white/60 px-7 py-3.5 text-sm font-bold text-[#6B3F2A] backdrop-blur-sm transition-all duration-300 hover:border-[#6B3F2A]/50 hover:bg-white hover:scale-105"
            >
              <MapPin size={15} />
              Reserve a Table
            </Link>
          </motion.div>

          {/* Rating strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 1 }}
            className="mt-12 flex items-center gap-6 divide-x divide-[#6B3F2A]/15"
          >
            {[
              { label: "Happy Guests",  value: "2,400+" },
              { label: "Avg. Rating",   value: "4.9 ★" },
              { label: "Menu Items",    value: "60+"    },
            ].map((s) => (
              <div key={s.label} className="px-5 text-center first:pl-0 last:pr-0">
                <p className="text-2xl font-black" style={{ color: "#D4A85A" }}>{s.value}</p>
                <p className="text-[11px] font-medium tracking-wide" style={{ color: "#FAF5EB", opacity: 0.55 }}>
                  {s.label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll cue */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          style={{ zIndex: 3 }}
        >
          <div className="flex h-10 w-6 items-start justify-center rounded-full border-2 border-[#FAF5EB]/30 pt-1.5">
            <div className="h-2 w-1 rounded-full bg-[#FAF5EB]/50" />
          </div>
        </motion.div>
      </section>

      {/* ── HIGHLIGHTS ──────────────────────────────────────────── */}
      <section className="relative px-4 -mt-2" style={{ zIndex: 10 }}>
        {/* Wavy top edge matching reference */}
        <div className="relative" style={{ marginTop: "-1px" }}>
          <svg viewBox="0 0 1440 60" className="w-full" style={{ display: "block", marginBottom: "-2px" }} preserveAspectRatio="none">
            <path
              d="M0,40 C180,70 360,10 540,40 C720,70 900,10 1080,40 C1260,70 1380,20 1440,35 L1440,60 L0,60 Z"
              fill="#FFF8F0"
            />
          </svg>
        </div>

        <div
          className="relative overflow-hidden"
          style={{ background: "#FFF8F0", borderBottom: "1px solid rgba(212,168,90,0.15)" }}
        >
          {/* Decorative coffee beans (right side) */}
          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 opacity-[0.07] hidden lg:block">
            <svg width="110" height="110" viewBox="0 0 110 110" fill="none">
              <ellipse cx="38" cy="30" rx="18" ry="26" transform="rotate(-20 38 30)" fill="#6B3F2A" />
              <path d="M38 10 Q55 30 38 50" stroke="#FAF5EB" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
              <ellipse cx="72" cy="72" rx="15" ry="22" transform="rotate(25 72 72)" fill="#6B3F2A" />
              <path d="M72 54 Q86 72 72 90" stroke="#FAF5EB" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
            </svg>
          </div>

          <div className="mx-auto max-w-6xl">
            <div className="grid grid-cols-2 lg:grid-cols-4">
              {highlights.map((h, i) => (
                <FadeIn key={h.title} delay={i * 0.1}>
                  <div
                    className="group relative flex flex-col items-center gap-3 px-6 py-8 text-center transition-all duration-400"
                    style={{
                      borderRight: i < highlights.length - 1 ? "1px solid rgba(212,168,90,0.25)" : "none",
                    }}
                  >
                    {/* Hover background bloom */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ background: `radial-gradient(ellipse at center, ${h.glow} 0%, transparent 70%)` }}
                    />

                    {/* Icon badge */}
                    <div
                      className="relative flex h-14 w-14 items-center justify-center rounded-2xl shadow-md transition-all duration-400 group-hover:scale-110 group-hover:shadow-lg"
                      style={{
                        background: `linear-gradient(135deg, ${h.color}18 0%, ${h.color}30 100%)`,
                        boxShadow: `0 4px 18px ${h.glow}`,
                      }}
                    >
                      <h.icon
                        size={26}
                        style={{ color: h.color }}
                        strokeWidth={1.7}
                      />
                      {/* Subtle inner glow ring on hover */}
                      <div
                        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-400"
                        style={{ boxShadow: `inset 0 0 12px ${h.color}40` }}
                      />
                    </div>

                    {/* Text */}
                    <div className="relative">
                      <h3
                        className="text-sm font-black tracking-wide transition-colors duration-300 group-hover:text-[#6B3F2A]"
                        style={{ color: "#2C1810" }}
                      >
                        {h.title}
                      </h3>
                      <p
                        className="mt-1 text-xs leading-relaxed"
                        style={{ color: "#2C1810", opacity: 0.52 }}
                      >
                        {h.desc}
                      </p>
                    </div>

                    {/* Bottom accent line on hover */}
                    <div
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-0 rounded-full transition-all duration-500 group-hover:w-12"
                      style={{ background: `linear-gradient(90deg, transparent, ${h.color}, transparent)` }}
                    />
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURED MENU ───────────────────────────────────────── */}
      <section className="py-20 px-4" style={{ background: "linear-gradient(180deg, #FAF5EB 0%, #FFF1DC 100%)" }}>
        <div className="mx-auto max-w-6xl">
          <FadeIn className="mb-4 text-center">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-[#D4A85A]">Our Specialties</p>
            <h2
              className="text-3xl sm:text-4xl font-black"
              style={{ color: "#2C1810", fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Featured on the Menu
            </h2>
          </FadeIn>

          {/* Category pills */}
          <FadeIn delay={0.15} className="mb-10 flex flex-wrap justify-center gap-2">
            {categories.map((c) => {
              const isActive = activeCat === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveCat(c.id)}
                  className="flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-bold transition-all duration-300 hover:scale-105"
                  style={
                    isActive
                      ? { borderColor: c.color, color: "#FAF5EB", background: c.color, boxShadow: `0 4px 14px ${c.color}40` }
                      : { borderColor: `${c.color}30`, color: c.color, background: `${c.color}0A` }
                  }
                >
                  <c.icon size={12} />
                  {c.label}
                </button>
              );
            })}
          </FadeIn>

          {/* Menu grid */}
          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 animate-pulse rounded-3xl bg-[#D4A85A]/10" />
              ))}
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featuredItems.slice(0, 6).map((item, i) => {
                const color = CATEGORY_COLORS[item.category] || "#6B3F2A";
                return (
                  <FadeIn key={item._id} delay={i * 0.07}>
                    <div className="group relative overflow-hidden rounded-3xl border border-[#D4A85A]/20 bg-white shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#6B3F2A]/10">
                      {/* Image / placeholder */}
                      <div
                        className="relative h-44 overflow-hidden"
                        style={{ background: `linear-gradient(135deg, ${color}18 0%, ${color}30 100%)` }}
                      >
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Coffee size={48} style={{ color, opacity: 0.35 }} />
                          </div>
                        )}
                        {/* Category badge */}
                        <span
                          className="absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-white"
                          style={{ background: color }}
                        >
                          {item.category}
                        </span>
                      </div>

                      {/* Details */}
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-base font-black leading-snug" style={{ color: "#2C1810" }}>
                            {item.name}
                          </h3>
                          <span
                            className="shrink-0 rounded-full px-3 py-1 text-sm font-black"
                            style={{ background: `${color}15`, color }}
                          >
                            ₹{item.price}
                          </span>
                        </div>
                        {item.description && (
                          <p className="mt-1.5 mb-4 text-xs leading-relaxed line-clamp-2" style={{ color: "#2C1810", opacity: 0.55 }}>
                            {item.description}
                          </p>
                        )}

                        {/* Add to Cart CTA */}
                        <button
                          onClick={() => addToCafeCart(item)}
                          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold text-white shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-md"
                          style={{ background: `linear-gradient(135deg, ${color}, #2C1810)` }}
                        >
                          <ShoppingBag size={14} /> Add to Cart
                        </button>
                      </div>
                    </div>
                  </FadeIn>
                );
              })}
            </div>
          )}

          <FadeIn className="mt-10 text-center">
            <Link
              to="/cafe/menu"
              className="group inline-flex items-center gap-2 rounded-full border-2 border-[#6B3F2A]/25 bg-white px-8 py-3.5 text-sm font-bold text-[#6B3F2A] transition-all duration-300 hover:border-[#6B3F2A] hover:shadow-lg hover:scale-105"
            >
              View Full Menu
              <ChevronRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* ── WHY VISIT ────────────────────────────────────────────── */}
      <section className="py-20 px-4" style={{ background: "#FAF5EB" }}>
        <div className="mx-auto max-w-6xl">

          {/* Header */}
          <FadeIn className="mb-12 text-center">
            {/* Book icon */}
            <div className="mb-4 flex justify-center">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl shadow-md"
                style={{ background: "linear-gradient(135deg, #6B3F2A18, #D4A85A28)" }}
              >
                <BookOpen size={28} style={{ color: "#6B3F2A" }} strokeWidth={1.6} />
              </div>
            </div>
            <h2
              className="mb-2 text-3xl sm:text-4xl md:text-5xl font-black italic leading-snug"
              style={{ color: "#2C1810", fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Why Visit Lekhok Tripura Café&nbsp;?
            </h2>
            <p className="text-sm sm:text-base font-medium" style={{ color: "#6B3F2A", opacity: 0.75 }}>
              A Perfect Blend of Coffee, Books &amp; Community
            </p>
          </FadeIn>

          {/* 4 photo cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                img: "/cafe-serene-reading.jpg",
                label: "Serene Reading\nAmbience",
              },
              {
                img: "/cafe-readers-club.jpg",
                label: "Gathering Readers\n& Writers Club",
              },
              {
                img: "/cafe-peaceful-reading.jpg",
                label: "Soundproof & Peaceful\nEnvironment",
              },
              {
                img: "/cafe-allday-experience.jpg",
                label: "All Day Book & Café\nExperience",
              },
            ].map((card, i) => (
              <FadeIn key={card.label} delay={i * 0.1}>
                <div className="group relative overflow-hidden rounded-3xl shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#6B3F2A]/20" style={{ aspectRatio: "3/4" }}>
                  {/* Photo */}
                  <img
                    src={card.img}
                    alt={card.label.replace("\n", " ")}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-108"
                    style={{ transform: "scale(1)" }}
                    onMouseEnter={e => e.currentTarget.style.transform = "scale(1.08)"}
                    onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                  />

                  {/* Persistent gradient overlay — stronger at bottom */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: "linear-gradient(to bottom, rgba(20,8,0,0.05) 0%, rgba(20,8,0,0.10) 50%, rgba(20,8,0,0.72) 100%)",
                    }}
                  />

                  {/* Hover shimmer */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: "linear-gradient(135deg, rgba(212,168,90,0.12) 0%, transparent 60%)" }}
                  />

                  {/* Caption */}
                  <div className="absolute bottom-0 left-0 right-0 px-5 pb-5 pt-10">
                    {/* Gold accent line */}
                    <div
                      className="mb-2.5 h-[2px] w-8 rounded-full transition-all duration-500 group-hover:w-14"
                      style={{ background: "linear-gradient(90deg, #D4A85A, transparent)" }}
                    />
                    <p
                      className="text-sm font-bold leading-snug text-white drop-shadow-md whitespace-pre-line"
                      style={{ textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}
                    >
                      {card.label}
                    </p>
                  </div>

                  {/* Subtle border glow on hover */}
                  <div
                    className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ boxShadow: "inset 0 0 0 1.5px rgba(212,168,90,0.45)" }}
                  />
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── ATMOSPHERE STRIP ────────────────────────────────────── */}
      <section
        className="relative overflow-hidden py-24 px-4"
        style={{ background: "linear-gradient(135deg, #2C1810 0%, #6B3F2A 50%, #A0522D 100%)" }}
      >
        {/* Decorative blobs */}
        <div
          className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #D4A85A 0%, transparent 70%)" }}
        />
        <div
          className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #FAF5EB 0%, transparent 70%)" }}
        />

        <div className="relative mx-auto max-w-3xl text-center">
          <FadeIn>
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#D4A85A]/30 bg-[#D4A85A]/10">
                <Coffee size={28} className="text-[#D4A85A]" />
              </div>
            </div>
            <h2
              className="mb-5 text-3xl sm:text-4xl md:text-5xl font-black leading-tight text-[#FAF5EB]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              A Space Made for<br />
              <span className="text-[#D4A85A]">Book Lovers</span>
            </h2>
            <p className="mb-8 text-base leading-relaxed text-[#FAF5EB]/65">
              Every corner of Lekhok Tripura Cafe is designed to inspire — shelves of stories, warm lighting, the scent of freshly brewed coffee, and the quiet company of fellow readers.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/cafe/reserve"
                className="flex items-center gap-2 rounded-full bg-[#D4A85A] px-7 py-3.5 text-sm font-bold text-[#2C1810] transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-[#D4A85A]/30"
              >
                <MapPin size={15} /> Book a Table
              </Link>
              <Link
                to="/cafe/about"
                className="flex items-center gap-2 rounded-full border border-[#FAF5EB]/25 bg-transparent px-7 py-3.5 text-sm font-bold text-[#FAF5EB] transition-all duration-300 hover:bg-[#FAF5EB]/10 hover:border-[#FAF5EB]/50"
              >
                Learn More <ArrowRight size={14} />
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── TESTIMONIALS ────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-4xl">
          <FadeIn className="mb-14 text-center">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-[#D4A85A]">Guest Reviews</p>
            <h2
              className="text-3xl sm:text-4xl font-black"
              style={{ color: "#2C1810", fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Loved by Our Guests
            </h2>
          </FadeIn>

          <div className="relative overflow-hidden rounded-3xl border border-[#D4A85A]/20 bg-white/70 p-8 sm:p-12 shadow-sm">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="text-center"
              >
                {/* Stars */}
                <div className="mb-5 flex justify-center gap-1">
                  {[...Array(testimonials[activeTestimonial].stars)].map((_, i) => (
                    <Star key={i} size={18} fill="#D4A85A" className="text-[#D4A85A]" />
                  ))}
                </div>
                {/* Quote */}
                <blockquote
                  className="mb-7 text-xl sm:text-2xl font-semibold leading-relaxed italic"
                  style={{ color: "#2C1810", fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  "{testimonials[activeTestimonial].text}"
                </blockquote>
                {/* Author */}
                <div className="flex flex-col items-center gap-1">
                  <div
                    className="h-12 w-12 rounded-full flex items-center justify-center text-lg font-black text-white"
                    style={{ background: "linear-gradient(135deg, #6B3F2A, #D4A85A)" }}
                  >
                    {testimonials[activeTestimonial].name.charAt(0)}
                  </div>
                  <p className="mt-2 font-bold text-sm" style={{ color: "#2C1810" }}>
                    {testimonials[activeTestimonial].name}
                  </p>
                  <p className="text-xs" style={{ color: "#2C1810", opacity: 0.5 }}>
                    {testimonials[activeTestimonial].role}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Dots */}
            <div className="mt-8 flex justify-center gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className="h-2 rounded-full transition-all duration-300"
                  style={{
                    width: i === activeTestimonial ? "24px" : "8px",
                    background: i === activeTestimonial ? "#6B3F2A" : "#D4A85A40",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── VISIT INFO + MAP PLACEHOLDER ────────────────────────── */}
      <section
        className="py-20 px-4"
        style={{ background: "linear-gradient(180deg, #FFF1DC 0%, #FAF5EB 100%)" }}
      >
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-2 items-center">
            <FadeIn direction="left">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-[#D4A85A]">Find Us</p>
              <h2
                className="mb-6 text-3xl sm:text-4xl font-black leading-snug"
                style={{ color: "#2C1810", fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Visit Lekhok<br />Tripura Cafe
              </h2>

              <div className="flex flex-col gap-4">
                {[
                  { icon: MapPin, label: "Address",  value: "Lekhok Tripura, Agartala, Tripura, India" },
                  { icon: Clock,  label: "Hours",    value: "Monday – Sunday  |  8:00 AM – 9:00 PM" },
                  { icon: Phone,  label: "Phone",    value: "+91 XXXXX XXXXX" },
                ].map((info) => (
                  <div key={info.label} className="flex items-start gap-4">
                    <div
                      className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                      style={{ background: "#6B3F2A15" }}
                    >
                      <info.icon size={18} style={{ color: "#6B3F2A" }} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#D4A85A" }}>{info.label}</p>
                      <p className="text-sm font-medium" style={{ color: "#2C1810", opacity: 0.8 }}>{info.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Social */}
              <div className="mt-8 flex items-center gap-4">
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#2C1810", opacity: 0.4 }}>Follow</p>
                <a
                  href="https://www.instagram.com/lekhok_tripura_publishers"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[#6B3F2A]/20 text-[#6B3F2A] transition hover:bg-[#6B3F2A] hover:text-white hover:border-[#6B3F2A] hover:scale-110"
                >
                  <Instagram size={16} />
                </a>
                <a
                  href="https://www.facebook.com/share/1DLfEnitkJ/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[#6B3F2A]/20 text-[#6B3F2A] transition hover:bg-[#6B3F2A] hover:text-white hover:border-[#6B3F2A] hover:scale-110"
                >
                  <Facebook size={16} />
                </a>
              </div>
            </FadeIn>

            {/* Map card */}
            <FadeIn direction="right">
              <div
                className="relative overflow-hidden rounded-3xl border border-[#D4A85A]/25 shadow-xl"
                style={{ height: "360px", background: "linear-gradient(135deg, #6B3F2A10 0%, #D4A85A20 100%)" }}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center">
                  <div
                    className="flex h-16 w-16 items-center justify-center rounded-full shadow-lg"
                    style={{ background: "linear-gradient(135deg, #6B3F2A, #A0522D)" }}
                  >
                    <MapPin size={28} className="text-[#FAF5EB]" />
                  </div>
                  <div>
                    <p className="font-black text-lg" style={{ color: "#2C1810" }}>Lekhok Tripura Cafe</p>
                    <p className="text-sm mt-1" style={{ color: "#2C1810", opacity: 0.55 }}>Agartala, Tripura</p>
                  </div>
                  <a
                    href="https://maps.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold text-[#FAF5EB] transition hover:scale-105"
                    style={{ background: "linear-gradient(135deg, #6B3F2A, #A0522D)" }}
                  >
                    Open in Maps <ArrowRight size={14} />
                  </a>
                </div>
                {/* Grid overlay */}
                <svg className="absolute inset-0 h-full w-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                      <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#6B3F2A" strokeWidth="0.8" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────── */}
      <footer
        className="py-10 px-4 text-center border-t border-[#D4A85A]/20"
        style={{ background: "#FAF5EB" }}
      >
        <div className="mx-auto max-w-4xl">
          <div className="mb-4 flex items-center justify-center gap-2">
            <Coffee size={18} style={{ color: "#6B3F2A" }} />
            <span className="text-sm font-black uppercase tracking-widest" style={{ color: "#6B3F2A" }}>
              Lekhok Tripura Cafe
            </span>
          </div>
          <p className="mb-4 text-xs" style={{ color: "#2C1810", opacity: 0.4 }}>
            A space crafted with love for readers, writers, and dreamers.
          </p>
          <div className="flex items-center justify-center gap-6 text-xs font-medium" style={{ color: "#2C1810", opacity: 0.45 }}>
            <Link to="/cafe" className="hover:opacity-80 transition">Home</Link>
            <Link to="/cafe/menu" className="hover:opacity-80 transition">Menu</Link>
            <Link to="/cafe/reserve" className="hover:opacity-80 transition">Reservations</Link>
            <Link to="/" className="hover:opacity-80 transition">← Main Site</Link>
          </div>
          <p className="mt-6 text-[11px]" style={{ color: "#2C1810", opacity: 0.3 }}>
            © {new Date().getFullYear()} Lekhok Tripura. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
