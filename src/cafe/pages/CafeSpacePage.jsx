import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Feather, Clock, Calendar, Check, Sparkles,
  Wifi, Coffee, ShieldCheck, MapPin, ArrowRight, UserCheck,
  CheckCircle2, Loader2, AlertCircle, Users, Laptop, Heart, X, Palette,
} from "lucide-react";
import { API_BASE } from "../../config.js";

const SPACES = [
  {
    id: "Book Reader's Corner",
    title: "Book Reader's Corner",
    desc: "Plush leather armchair, ambient reading lamp, and noise-controlled corner. ₹200 fee — 100% adjusted with your cafe food & snacks order!",
    icon: BookOpen,
    price: 200,
    badge: "Reader Sanctuary",
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
    desc: "Spacious wooden desk & ergonomic chair for focus writing and laptop drafting. ₹200 fee — 100% adjusted with your cafe food & snacks order!",
    icon: Feather,
    price: 200,
    badge: "Writer Workstation",
    image: "/ChatGPT Image Aug 10, 2026, 11_02_34 PM.png",
    features: [
      "100% Amount Adjusted with Food & Drinks",
      "No Hourly Time Limit (Stay & Write freely)",
      "Ergonomic Seating & Writing Desk",
      "Free High-Speed Wi-Fi & Quiet Zone"
    ],
  },
  {
    id: "Artist Studio Corner",
    title: "Artist Studio Corner",
    desc: "Dedicated quiet creative studio workstation equipped for drawing, painting, sketching, and digital illustration. ₹200 fee — 100% adjusted with food order!",
    icon: Palette,
    price: 200,
    badge: "Artist Studio",
    image: "/ChatGPT Image Aug 10, 2026, 10_55_50 PM.png",
    features: [
      "100% Amount Adjusted with Food & Drinks",
      "Solid Wooden Easel & Canvas Holder",
      "Studio Lighting & Natural Sunlight Lamp",
      "Free High-Speed Wi-Fi & Power Outlets"
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
  "Painting & Drawing / Artwork",
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

  /* Lock body background scroll when any modal is open */
  useEffect(() => {
    const isModalOpen = Boolean(showComingSoon || bookingSuccess || showMyBookings);
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showComingSoon, bookingSuccess, showMyBookings]);



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

      {/* ── INTERACTIVE STUDIO SHOWCASE & RESERVATION ENGINE ───────────────── */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-10 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#D4A85A]/40 bg-[#23120A] px-4 py-1 text-xs font-black uppercase tracking-[0.25em] text-[#D4A85A] shadow-md mb-3">
            <Sparkles size={13} /> SELECT YOUR ATMOSPHERE
          </span>
          <h2
            className="text-3xl sm:text-4xl font-black text-[#FAF5EB]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Choose Your Creative Studio
          </h2>
          <p className="text-xs sm:text-sm text-[#D4A85A]/80 mt-1.5 max-w-lg mx-auto">
            Switch between our specialized sanctuaries. ₹200 fee — 100% adjusted with your cafe food &amp; drinks order.
          </p>
        </div>

        {/* Studio Tab Selectors */}
        <div className="grid gap-3 sm:grid-cols-3 max-w-4xl mx-auto mb-10">
          {SPACES.map((space) => {
            const isSelected = selectedSpace.id === space.id;
            const Icon = space.icon;
            return (
              <button
                key={space.id}
                onClick={() => setSelectedSpace(space)}
                className={`relative flex items-center gap-3.5 rounded-2xl p-4 text-left transition-all duration-300 ${
                  isSelected
                    ? "bg-gradient-to-r from-[#2A140B] to-[#1F0E07] border-2 border-[#D4A85A] shadow-xl shadow-[#D4A85A]/10 scale-[1.02]"
                    : "bg-[#170A04] border border-[#D4A85A]/20 hover:border-[#D4A85A]/50 text-white/70"
                }`}
              >
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
                    isSelected
                      ? "border-[#D4A85A] bg-[#D4A85A] text-[#140803] shadow-md"
                      : "border-[#D4A85A]/30 bg-[#23120A] text-[#D4A85A]"
                  }`}
                >
                  <Icon size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block text-xs font-black uppercase tracking-wider text-[#D4A85A]">
                    {space.badge}
                  </span>
                  <h3 className="text-sm font-black text-[#FAF5EB] truncate">
                    {space.title}
                  </h3>
                </div>
                {isSelected && (
                  <span className="h-2 w-2 rounded-full bg-[#D4A85A] animate-ping shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Studio Stage (AnimatePresence) */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedSpace.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden rounded-3xl border border-[#D4A85A]/35 bg-[#1F0E07] shadow-2xl"
          >
            <div className="grid gap-8 lg:grid-cols-12 p-6 sm:p-8 lg:p-10 items-center">
              {/* Studio Visual Showcase (Left 5 Cols) */}
              <div className="lg:col-span-5 relative group">
                <div className="relative aspect-[4/3] sm:aspect-[4/3] lg:aspect-[3/4] w-full overflow-hidden rounded-2xl border border-[#D4A85A]/40 bg-[#140803] shadow-2xl">
                  <img
                    src={selectedSpace.image}
                    alt={selectedSpace.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#140803] via-transparent to-transparent opacity-80" />

                  <span className="absolute top-4 left-4 rounded-full bg-[#D4A85A] px-3.5 py-1 text-[10px] font-black uppercase tracking-wider text-[#140803] shadow-lg">
                    {selectedSpace.badge}
                  </span>

                  <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-[#140803]/85 backdrop-blur-md p-3 border border-[#D4A85A]/30 text-xs">
                    <p className="font-bold text-[#D4A85A] flex items-center gap-1.5">
                      <Sparkles size={13} /> 100% Food Credit Adjusted
                    </p>
                    <p className="text-[11px] text-white/70 mt-0.5">
                      Your ₹200 slot fee is fully credited to your food &amp; drinks bill.
                    </p>
                  </div>
                </div>
              </div>

              {/* Studio Details & Slot Selector (Right 7 Cols) */}
              <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {selectedSpace.id === "Book Reader's Corner" && <BookOpen size={22} className="text-[#D4A85A]" />}
                    {selectedSpace.id === "Book Writer's Corner" && <Feather size={22} className="text-[#D4A85A]" />}
                    {selectedSpace.id === "Artist Studio Corner" && <Palette size={22} className="text-[#D4A85A]" />}
                    <h3
                      className="text-2xl sm:text-3xl font-black text-[#FAF5EB] uppercase tracking-tight"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                    >
                      {selectedSpace.title}
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm text-white/75 leading-relaxed">
                    {selectedSpace.desc}
                  </p>

                  {/* Feature Highlights Grid */}
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {selectedSpace.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2 rounded-xl bg-[#140803]/60 px-3 py-2 border border-[#D4A85A]/15 text-xs text-white/80">
                        <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                        <span className="truncate">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Integrated Reservation Configurator */}
                <div className="rounded-2xl bg-[#140803] p-5 border border-[#D4A85A]/30 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-3">
                    {/* Date */}
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-[#D4A85A] mb-1.5">
                        Date
                      </label>
                      <input
                        type="date"
                        min={new Date().toISOString().split("T")[0]}
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full rounded-xl border border-[#D4A85A]/40 bg-[#1E0E07] px-3 py-2 text-xs font-bold text-[#FAF5EB] outline-none focus:border-[#D4A85A]"
                      />
                    </div>

                    {/* Purpose */}
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-[#D4A85A] mb-1.5">
                        Purpose
                      </label>
                      <select
                        value={purpose}
                        onChange={(e) => setPurpose(e.target.value)}
                        className="w-full rounded-xl border border-[#D4A85A]/40 bg-[#1E0E07] px-3 py-2 text-xs font-bold text-[#FAF5EB] outline-none focus:border-[#D4A85A]"
                      >
                        {PURPOSES.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>

                    {/* Seats */}
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-[#D4A85A] mb-1.5">
                        Seats Count
                      </label>
                      <select
                        value={guestsCount}
                        onChange={(e) => setGuestsCount(Number(e.target.value))}
                        className="w-full rounded-xl border border-[#D4A85A]/40 bg-[#1E0E07] px-3 py-2 text-xs font-bold text-[#FAF5EB] outline-none focus:border-[#D4A85A]"
                      >
                        <option value={1}>1 Seat</option>
                        <option value={2}>2 Seats</option>
                        <option value={4}>4 Seats</option>
                      </select>
                    </div>
                  </div>

                  {/* Time Slots Pills */}
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-[#D4A85A] mb-2">
                      Available Time Slots ({selectedDate})
                    </label>

                    {loadingSlots ? (
                      <div className="flex items-center justify-center py-6">
                        <Loader2 size={20} className="animate-spin text-[#D4A85A]" />
                      </div>
                    ) : (
                      <div className="grid gap-2 sm:grid-cols-3">
                        {availability.map((s) => {
                          const isSelected = selectedSlot === s.slot;
                          return (
                            <button
                              key={s.slot}
                              type="button"
                              disabled={!s.available}
                              onClick={() => setSelectedSlot(s.slot)}
                              className={`flex items-center justify-between rounded-xl px-3 py-2 text-[11px] font-bold transition ${
                                !s.available
                                  ? "bg-[#140803]/40 text-gray-500 border border-white/5 cursor-not-allowed"
                                  : isSelected
                                  ? "bg-[#D4A85A] text-[#140803] font-black shadow-md border border-[#D4A85A]"
                                  : "bg-[#1E0E07] text-[#FAF5EB] border border-[#D4A85A]/30 hover:border-[#D4A85A]"
                              }`}
                            >
                              <span className="truncate">{s.slot}</span>
                              <span
                                className={`ml-1 rounded-full px-1.5 py-0.5 text-[8px] font-black uppercase ${
                                  !s.available
                                    ? "bg-red-900/40 text-red-400"
                                    : isSelected
                                    ? "bg-[#140803] text-[#D4A85A]"
                                    : "bg-emerald-900/40 text-emerald-300"
                                }`}
                              >
                                {s.available ? "Avail" : "Full"}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Action Bar */}
                  <div className="pt-2 border-t border-[#D4A85A]/20 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="text-[11px] text-white/70 block">Slot Fee: <strong className="text-[#D4A85A]">₹200</strong> (100% Adjusted against Food Order)</span>
                    </div>
                    <button
                      onClick={handleBooking}
                      className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#D4A85A] to-[#A0522D] px-6 py-2.5 text-xs font-black text-[#140803] shadow-lg hover:scale-105 transition"
                    >
                      <ShieldCheck size={15} /> Pre-Book Space
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
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
