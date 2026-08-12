import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Feather, Clock, Calendar, Check, Sparkles,
  Wifi, Coffee, ShieldCheck, MapPin, ArrowRight, UserCheck,
  CheckCircle2, Loader2, AlertCircle, Users, Laptop, Heart, X,
} from "lucide-react";
import { API_BASE } from "../../config.js";

const SPACES = [
  {
    id: "Book Reader's Corner",
    title: "Book Reader's Corner",
    desc: "Plush leather armchair, ambient reading lamp, and noise-controlled corner. ₹200 non-refundable fee — 100% adjusted with your cafe food & snacks order!",
    icon: BookOpen,
    price: 200,
    badge: "Pre-Book the corner",
    image: "/ChatGPT Image Aug 10, 2026, 11_00_13 PM.png",
    features: [
      "100% Amount Adjusted with Food & Drinks",
      "No Hourly Time Limit (Stay & Read freely)",
      "Noise-Controlled Reading Zone",
      "Free High-Speed Wi-Fi & Power Outlets"
    ],
  },
  {
    id: "Book Writer's Corner",
    title: "Book Writer's Corner",
    desc: "Spacious wooden desk & ergonomic chair for focus writing and laptop drafting. ₹200 non-refundable fee — 100% adjusted with your cafe food & snacks order!",
    icon: Feather,
    price: 200,
    badge: "Pre-Book the corner",
    image: "/ChatGPT Image Aug 10, 2026, 11_02_34 PM.png",
    features: [
      "100% Amount Adjusted with Food & Drinks",
      "No Hourly Time Limit (Stay & Write freely)",
      "Ergonomic Seating & Writing Desk",
      "Free High-Speed Wi-Fi & Quiet Zone"
    ],
  },
];

const TIME_SLOTS = [
  "09:00 AM - 11:00 AM",
  "11:00 AM - 01:00 PM",
  "01:00 PM - 03:00 PM",
  "03:00 PM - 05:00 PM",
  "05:00 PM - 07:00 PM",
  "07:00 PM - 09:00 PM",
];

const PURPOSES = [
  "Reading & Studying",
  "Writing & Creative Work",
  "Laptop Work",
  "Group Discussion",
];

export default function CafeSpacePage() {
  const navigate = useNavigate();
  const [authUser, setAuthUser] = useState(null);

  const [selectedSpace, setSelectedSpace] = useState(SPACES[0]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedSlot, setSelectedSlot] = useState(TIME_SLOTS[0]);
  const [purpose, setPurpose] = useState(PURPOSES[0]);
  const [guestsCount, setGuestsCount] = useState(1);

  const [availability, setAvailability] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [myBookings, setMyBookings] = useState([]);
  const [showMyBookings, setShowMyBookings] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);

  /* ── Library Showcase State ── */
  const [books, setBooks] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [bookSearch, setBookSearch] = useState("");
  const [selectedBook, setSelectedBook] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/auth/me`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.success) setAuthUser(d.user);
      })
      .catch(() => {});
  }, []);

  /* Fetch Library Books for Showcase */
  useEffect(() => {
    async function fetchLibraryBooks() {
      setLoadingBooks(true);
      try {
        const res = await fetch(`${API_BASE}/books?limit=24`);
        const data = await res.json();
        if (data?.success && data?.data?.books) {
          setBooks(data.data.books);
        } else if (Array.isArray(data?.books)) {
          setBooks(data.books);
        }
      } catch {
        /* ignore */
      } finally {
        setLoadingBooks(false);
      }
    }
    fetchLibraryBooks();
  }, []);

  /* Lock body background scroll when any modal is open */
  useEffect(() => {
    const isModalOpen = Boolean(selectedBook || showComingSoon || bookingSuccess || showMyBookings);
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedBook, showComingSoon, bookingSuccess, showMyBookings]);

  /* Filter books by search query */
  const filteredBooks = useMemo(() => {
    if (!bookSearch.trim()) return books;
    const q = bookSearch.toLowerCase();
    return books.filter(
      (b) =>
        b.title?.toLowerCase().includes(q) ||
        b.author?.toLowerCase().includes(q) ||
        b.category?.toLowerCase().includes(q) ||
        b.description?.toLowerCase().includes(q)
    );
  }, [books, bookSearch]);

  useEffect(() => {
    async function fetchSlots() {
      setLoadingSlots(true);
      try {
        const res = await fetch(
          `${API_BASE}/cafe/space/availability?date=${selectedDate}&spaceType=${encodeURIComponent(
            selectedSpace.id
          )}`
        );
        const data = await res.json();
        if (data.success && data.slots) {
          setAvailability(data.slots);
          const currentSlotData = data.slots.find((s) => s.slot === selectedSlot);
          if (!currentSlotData?.available) {
            const firstAvail = data.slots.find((s) => s.available);
            if (firstAvail) setSelectedSlot(firstAvail.slot);
          }
        }
      } catch {
        // ignore
      } finally {
        setLoadingSlots(false);
      }
    }
    fetchSlots();
  }, [selectedDate, selectedSpace, selectedSlot]);

  const fetchMyBookings = async () => {
    try {
      const res = await fetch(`${API_BASE}/cafe/space/my-bookings`, { credentials: "include" });
      const data = await res.json();
      if (data.success && data.bookings) {
        setMyBookings(data.bookings);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (authUser) fetchMyBookings();
  }, [authUser]);

  const handleBooking = () => {
    setShowComingSoon(true);
  };

  return (
    <div className="min-h-screen pb-20 text-[#FAF5EB]" style={{ background: "#140803" }}>
      {/* ── HERO BANNER ───────────────────────────────────────────────────── */}
      <section
        className="relative min-h-[580px] overflow-hidden px-6 py-20 lg:py-24 text-left text-white flex items-center bg-cover bg-center"
        style={{ backgroundImage: "url('/cafe-space-hero-bg.png')" }}
      >
        {/* Dark left gradient overlay for high contrast and readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0D0502]/95 via-[#0D0502]/80 to-[#0D0502]/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#140803] via-transparent to-black/20" />

        <div className="relative z-10 mx-auto max-w-6xl w-full">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#D4A85A]/50 bg-[#140803]/80 backdrop-blur-md px-4 py-1.5 text-xs font-black uppercase tracking-[0.25em] text-[#D4A85A] shadow-xl">
              <Feather size={14} className="text-[#D4A85A]" /> READERS &amp; WRITERS SANCTUARY
            </span>

            <h1
              className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] text-[#FAF5EB] tracking-tight"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Reserve Your<br />
              Personal Space for<br />
              Reading &amp;<br />
              Creative Work
            </h1>

            <p className="mt-6 text-sm sm:text-base text-white/80 max-w-lg leading-relaxed font-medium">
              Enjoy quiet reading nooks, ergonomic writing workstations, power outlets, high-speed Wi-Fi, and a peaceful atmosphere designed for readers and writers in Tripura.
            </p>

            {/* Quick Perks Strip */}
            <div className="mt-8 flex flex-wrap items-center gap-3 text-xs font-bold text-[#D4A85A]">
              <span className="flex items-center gap-2 bg-[#140803]/80 backdrop-blur-md px-4 py-2 rounded-full border border-[#D4A85A]/30">
                <Wifi size={14} /> High-Speed Wi-Fi
              </span>
              <span className="flex items-center gap-2 bg-[#140803]/80 backdrop-blur-md px-4 py-2 rounded-full border border-[#D4A85A]/30">
                <Coffee size={14} /> 10% Off Cafe Beverages
              </span>
              <span className="flex items-center gap-2 bg-[#140803]/80 backdrop-blur-md px-4 py-2 rounded-full border border-[#D4A85A]/30">
                <BookOpen size={14} /> Unlimited Book Access
              </span>
              <span className="flex items-center gap-2 bg-[#140803]/80 backdrop-blur-md px-4 py-2 rounded-full border border-[#D4A85A]/30">
                <ShieldCheck size={14} /> Guaranteed Slot Reservation
              </span>
            </div>

            {authUser && myBookings.length > 0 && (
              <button
                onClick={() => setShowMyBookings(true)}
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#D4A85A] px-6 py-2.5 text-xs font-black text-[#140803] shadow-lg hover:bg-white transition"
              >
                <Calendar size={15} /> View My Booked Slots ({myBookings.length})
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── STEP 1: CHOOSE SPACE TYPE ─────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="mb-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-[#FAF5EB]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            1. Select Your Space Type
          </h2>
          <p className="text-xs sm:text-sm text-[#D4A85A]/80 mt-1">
            Choose the seating ambience that best fits your reading or writing session.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 max-w-4xl mx-auto">
          {SPACES.map((space) => {
            const isSelected = selectedSpace.id === space.id;
            const Icon = space.icon;
            return (
              <div
                key={space.id}
                onClick={() => setSelectedSpace(space)}
                className={`group cursor-pointer overflow-hidden rounded-3xl border-2 transition-all duration-300 ${
                  isSelected
                    ? "border-[#D4A85A] bg-[#23120A] shadow-2xl scale-[1.02]"
                    : "border-[#D4A85A]/20 bg-[#1E0E07] hover:border-[#D4A85A]/50"
                }`}
              >
                <div className="relative h-56 overflow-hidden">
                  <img src={space.image} alt={space.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#140803] via-transparent to-transparent" />
                  <span className="absolute left-3 top-3 rounded-full bg-[#D4A85A] px-3.5 py-1 text-[11px] font-black text-[#140803] shadow-md">
                    {space.badge}
                  </span>
                  {isSelected && (
                    <span className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-[#D4A85A] text-[#140803] shadow-md font-black">
                      <Check size={16} />
                    </span>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Icon size={18} className="text-[#D4A85A]" />
                    <h3 className="text-base font-black text-[#FAF5EB]">{space.title}</h3>
                  </div>
                  <p className="text-xs text-[#FAF5EB]/65 leading-relaxed mb-4">{space.desc}</p>

                  <div className="space-y-1.5 border-t border-[#D4A85A]/15 pt-3 text-[11px] font-semibold text-white/80">
                    {space.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <CheckCircle2 size={12} className="text-emerald-400" /> {feat}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── STEP 2 & 3: DATE, TIME SLOT & BOOKING CONFIRMATION ────────────── */}
      <section className="mx-auto max-w-4xl px-6 py-8">
        <div className="rounded-3xl border border-[#D4A85A]/30 bg-[#23120A] p-6 sm:p-10 shadow-2xl">
          <h2 className="text-2xl font-black text-[#FAF5EB] mb-6 text-center" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            2. Select Date &amp; Available Time Slot
          </h2>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Left: Date & Purpose Picker */}
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-[#D4A85A] mb-2">
                  Select Booking Date
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full rounded-2xl border border-[#D4A85A]/40 bg-[#140803] px-4 py-3 text-sm font-bold text-[#FAF5EB] outline-none focus:border-[#D4A85A]"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-[#D4A85A] mb-2">
                  Session Purpose
                </label>
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full rounded-2xl border border-[#D4A85A]/40 bg-[#140803] px-4 py-3 text-sm font-bold text-[#FAF5EB] outline-none focus:border-[#D4A85A]"
                >
                  {PURPOSES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-[#D4A85A] mb-2">
                  Guests / Seats Count
                </label>
                <select
                  value={guestsCount}
                  onChange={(e) => setGuestsCount(Number(e.target.value))}
                  className="w-full rounded-2xl border border-[#D4A85A]/40 bg-[#140803] px-4 py-3 text-sm font-bold text-[#FAF5EB] outline-none focus:border-[#D4A85A]"
                >
                  <option value={1}>1 Seat (Individual)</option>
                  <option value={2}>2 Seats (Pair)</option>
                  <option value={4}>4 Seats (Group)</option>
                </select>
              </div>
            </div>

            {/* Right: Time Slots Selector */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-[#D4A85A] mb-2">
                Available Time Slots ({selectedDate})
              </label>

              {loadingSlots ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 size={24} className="animate-spin text-[#D4A85A]" />
                </div>
              ) : (
                <div className="grid gap-2.5">
                  {availability.map((s) => {
                    const isSelected = selectedSlot === s.slot;
                    return (
                      <button
                        key={s.slot}
                        type="button"
                        disabled={!s.available}
                        onClick={() => setSelectedSlot(s.slot)}
                        className={`flex items-center justify-between rounded-2xl px-4 py-3 text-xs font-bold transition ${
                          !s.available
                            ? "bg-[#140803]/40 text-gray-500 border border-white/5 cursor-not-allowed"
                            : isSelected
                            ? "bg-[#D4A85A] text-[#140803] font-black shadow-lg border border-[#D4A85A]"
                            : "bg-[#140803] text-[#FAF5EB] border border-[#D4A85A]/30 hover:border-[#D4A85A]"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Clock size={14} /> {s.slot}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase ${
                            !s.available
                              ? "bg-red-900/40 text-red-400"
                              : isSelected
                              ? "bg-[#140803] text-[#D4A85A]"
                              : "bg-emerald-900/40 text-emerald-300"
                          }`}
                        >
                          {s.available ? "Available" : "Booked"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Booking Summary Box & Payment Action */}
          <div className="mt-8 rounded-2xl bg-[#140803] p-5 border border-[#D4A85A]/30 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs text-[#D4A85A] font-semibold uppercase tracking-wider">Selected Booking Details:</p>
              <p className="text-base font-black text-[#FAF5EB] mt-0.5">
                {selectedSpace.title} — <span className="text-[#D4A85A]">{selectedDate} ({selectedSlot})</span>
              </p>
              <p className="text-xs text-white/70 mt-1">
                Booking Fee: <strong className="text-[#D4A85A]">₹200 (Non-Refundable • 100% Adjusted against Cafe Order)</strong>
              </p>
            </div>

            <button
              onClick={handleBooking}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#D4A85A] to-[#A0522D] px-8 py-3.5 text-sm font-black text-[#140803] shadow-xl hover:scale-105 transition"
            >
              <ShieldCheck size={16} /> Pre-Book Space (Coming Soon)
            </button>
          </div>
        </div>
      </section>

      {/* ── LIBRARY BOOKS SHOWCASE SECTION ──────────────────────────────── */}
      <section className="border-t border-[#D4A85A]/25 bg-[#170A04] px-6 py-20">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#D4A85A]/50 bg-[#23120A] px-4 py-1.5 text-xs font-black uppercase tracking-[0.25em] text-[#D4A85A] shadow-lg mb-4">
              <BookOpen size={14} /> LEKHAK TRIPURA LIBRARY SHOWCASE
            </span>

            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-black uppercase text-[#FAF5EB] tracking-tight leading-tight animate-gold-shimmer drop-shadow-md"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Library Books Showcase
            </h2>

            <p className="mt-4 text-sm sm:text-base text-white/70 leading-relaxed">
              Explore our curated library collection available at the Readers &amp; Writers Space. Pick up and read any of these titles while enjoying your coffee during your cafe session.
            </p>

            {/* Search bar */}
            <div className="mt-8 relative max-w-md mx-auto">
              <BookOpen size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4A85A]" />
              <input
                type="text"
                placeholder="Search by title, author or category…"
                value={bookSearch}
                onChange={(e) => setBookSearch(e.target.value)}
                className="w-full rounded-2xl border-2 border-[#D4A85A]/40 bg-[#140803] py-3 pl-11 pr-4 text-xs font-bold text-[#FAF5EB] placeholder-white/40 outline-none focus:border-[#D4A85A] transition shadow-xl"
              />
              {bookSearch && (
                <button
                  onClick={() => setBookSearch("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#D4A85A] hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Book Showcase Grid */}
          {loadingBooks ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse rounded-3xl bg-[#D4A85A]/10 h-80" />
              ))}
            </div>
          ) : filteredBooks.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen size={48} className="mx-auto mb-3 text-[#D4A85A]/40" />
              <p className="text-base font-bold text-[#FAF5EB]/60">No books found</p>
              <p className="text-xs text-white/40 mt-1">Try clearing your search term.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredBooks.map((book) => {
                const coverUrl = book.cover?.url || "/placeholder-book.png";
                return (
                  <motion.div
                    key={book._id || book.slug}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => setSelectedBook(book)}
                    className="group relative flex flex-col overflow-hidden rounded-3xl border border-[#D4A85A]/25 bg-[#23120A] shadow-xl hover:border-[#D4A85A]/60 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl cursor-pointer"
                  >
                    {/* Cover Image Container */}
                    <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#140803] flex items-center justify-center">
                      {coverUrl ? (
                        <img
                          src={coverUrl}
                          alt={book.title}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <BookOpen size={48} className="text-[#D4A85A]/40" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#23120A] via-transparent to-transparent opacity-80" />

                      {/* Category Badge */}
                      {book.category && (
                        <span className="absolute top-3 left-3 rounded-full bg-[#D4A85A] px-3 py-1 text-[10px] font-black uppercase text-[#140803] shadow-md tracking-wider">
                          {book.category}
                        </span>
                      )}

                      {/* Library Available Tag */}
                      <span className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-black/75 backdrop-blur-md px-2.5 py-1 text-[9px] font-bold text-emerald-400 border border-emerald-500/30">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Available in Library
                      </span>
                    </div>

                    {/* Book Info */}
                    <div className="flex flex-1 flex-col p-5">
                      <h3
                        className="text-base font-black leading-snug text-[#FAF5EB] uppercase line-clamp-1 group-hover:text-[#D4A85A] transition"
                        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                      >
                        {book.title}
                      </h3>

                      <p className="mt-1 text-xs font-semibold text-[#D4A85A] flex items-center gap-1">
                        <Feather size={12} /> By {book.author}
                      </p>

                      {book.description && (
                        <p className="mt-2.5 text-xs text-white/60 line-clamp-3 leading-relaxed">
                          {book.description}
                        </p>
                      )}

                      {/* Card Footer */}
                      <div className="mt-auto pt-4 border-t border-[#D4A85A]/15 flex items-center justify-between text-[11px] font-bold text-white/50">
                        <span>{book.pages ? `${book.pages} Pages` : book.language || "English"}</span>
                        <span className="text-[#D4A85A] group-hover:underline flex items-center gap-1">
                          View Details <ArrowRight size={12} />
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── BOOK DETAILS MODAL ───────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedBook && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBook(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              data-lenis-prevent
              className="relative z-10 w-full max-w-2xl overflow-hidden rounded-3xl bg-[#23120A] p-6 shadow-2xl border border-[#D4A85A]/40 text-[#FAF5EB]"
            >
              <button
                onClick={() => setSelectedBook(null)}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition"
              >
                <X size={16} />
              </button>

              <div className="grid gap-6 sm:grid-cols-5">
                {/* Book Cover */}
                <div className="sm:col-span-2">
                  <div className="aspect-[3/4] w-full overflow-hidden rounded-2xl bg-[#140803] border border-[#D4A85A]/30 flex items-center justify-center">
                    {selectedBook.cover?.url ? (
                      <img
                        src={selectedBook.cover.url}
                        alt={selectedBook.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <BookOpen size={48} className="text-[#D4A85A]/40" />
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="sm:col-span-3 flex flex-col">
                  <span className="inline-block self-start rounded-full bg-[#D4A85A] px-3 py-0.5 text-[10px] font-black uppercase text-[#140803] mb-2">
                    {selectedBook.category || "Library Collection"}
                  </span>

                  <h3
                    className="text-2xl font-black text-[#FAF5EB] uppercase leading-tight"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    {selectedBook.title}
                  </h3>

                  <p className="mt-1 text-sm font-bold text-[#D4A85A]">
                    Author: {selectedBook.author}
                  </p>

                  <div className="mt-3 flex gap-3 text-xs text-white/60">
                    {selectedBook.pages > 0 && <span>📖 {selectedBook.pages} Pages</span>}
                    {selectedBook.language && <span>🌐 {selectedBook.language}</span>}
                  </div>

                  <div
                    data-lenis-prevent
                    onWheel={(e) => e.stopPropagation()}
                    className="mt-4 flex-1 overflow-y-auto max-h-56 pr-2.5 text-xs text-white/80 leading-relaxed border-t border-[#D4A85A]/20 pt-3 space-y-2 overscroll-contain"
                    style={{
                      scrollbarWidth: "thin",
                      scrollbarColor: "#D4A85A #140803",
                    }}
                  >
                    <p className="font-bold text-[#D4A85A]">Description:</p>
                    <p>{selectedBook.description}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#D4A85A]/20 flex items-center justify-between">
                    <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> Available in Cafe Library
                    </span>
                    <button
                      onClick={() => setSelectedBook(null)}
                      className="rounded-xl bg-[#D4A85A] px-5 py-2 text-xs font-black text-[#140803] hover:bg-white transition"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
                <Sparkles size={32} />
              </div>
              <h3 className="text-2xl font-black text-[#FAF5EB]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                Online Reservations Coming Soon! 🚀
              </h3>
              <p className="text-xs text-white/80 mt-2 leading-relaxed">
                Online payment &amp; slot pre-bookings for our Readers &amp; Writers Space will be launching very soon.
              </p>

              <div className="mt-4 rounded-2xl bg-[#140803] p-4 text-xs space-y-1.5 text-left border border-[#D4A85A]/25">
                <p className="font-bold text-[#D4A85A] mb-1">Your Selected Configuration:</p>
                <p><strong>Space:</strong> {selectedSpace.title}</p>
                <p><strong>Date:</strong> {selectedDate}</p>
                <p><strong>Time Slot:</strong> {selectedSlot}</p>
                <p><strong>Purpose:</strong> {purpose}</p>
                <p className="text-[#D4A85A] font-bold mt-2">Walk-ins are currently welcome at the cafe counter!</p>
              </div>

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

      {/* ── SUCCESS MODAL ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {bookingSuccess && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setBookingSuccess(null)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative z-10 w-full max-w-md rounded-3xl bg-[#23120A] p-6 text-center shadow-2xl border border-[#D4A85A]/40 text-white"
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-900/50 text-emerald-400 border border-emerald-500/40">
                <CheckCircle2 size={36} />
              </div>
              <h3 className="text-xl font-black text-[#FAF5EB]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                Slot Pre-Booked Successfully!
              </h3>
              <p className="text-xs text-white/70 mt-1 mb-4">
                Your Readers &amp; Writers Space slot has been reserved.
              </p>

              <div className="rounded-2xl bg-[#140803] p-4 text-xs space-y-2 text-left mb-6 border border-[#D4A85A]/25">
                <p className="font-bold text-[#D4A85A]">Booking Pass #{bookingSuccess.bookingNumber}</p>
                <p><strong>Space:</strong> {bookingSuccess.spaceType}</p>
                <p><strong>Date:</strong> {bookingSuccess.bookingDate}</p>
                <p><strong>Time Slot:</strong> {bookingSuccess.timeSlot}</p>
                <p><strong>Status:</strong> <span className="text-emerald-400 font-bold">Confirmed ✓</span></p>
              </div>

              <button
                onClick={() => setBookingSuccess(null)}
                className="w-full rounded-2xl bg-[#D4A85A] py-3 text-xs font-black text-[#140803] shadow-md hover:bg-white transition"
              >
                Close Pass
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
