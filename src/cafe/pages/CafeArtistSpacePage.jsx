import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Palette, Brush, Clock, Calendar, Check, Sparkles,
  Coffee, ShieldCheck, MapPin, ArrowRight, CheckCircle2,
  Loader2, Feather, Image as ImageIcon, Sun, Layers,
} from "lucide-react";
import { API_BASE } from "../../config.js";

const ART_SPACES = [
  {
    id: "Artist Corner",
    title: "Artist Corner",
    desc: "Dedicated quiet creative studio workstation equipped for drawing, painting, sketching, digital illustration, and sculpting.",
    icon: Palette,
    pricePackage: 200,
    durationHours: 4,
    pricePerHour: 50,
    image: "/ChatGPT Image Aug 10, 2026, 10_55_50 PM.png",
    features: [
      "Solid Wooden Easel & Canvas Holder",
      "Studio Lighting & Natural Sunlight Lamp",
      "Free High-Speed Wi-Fi & Power Outlets",
      "10% Discount on Cafe Beverages & Snacks"
    ],
  },
];

const TIME_SLOTS = [
  "09:00 AM - 01:00 PM (Morning Session)",
  "01:00 PM - 05:00 PM (Afternoon Session)",
  "05:00 PM - 09:00 PM (Evening Session)"
];

const ART_MEDIUMS = [
  "Drawing & Sketching",
  "Acrylic / Oil Painting",
  "Watercolor Illustration",
  "Digital Art & Graphic Design",
  "Crafts & Sculpting",
];

export default function CafeArtistSpacePage() {
  const [authUser, setAuthUser] = useState(null);

  const [selectedSpace, setSelectedSpace] = useState(ART_SPACES[0]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedSlot, setSelectedSlot] = useState(TIME_SLOTS[0]);
  const [artMedium, setArtMedium] = useState(ART_MEDIUMS[0]);
  const [guestsCount, setGuestsCount] = useState(1);

  const [availability, setAvailability] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/auth/me`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.success) setAuthUser(d.user);
      })
      .catch(() => {});
  }, []);

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

  return (
    <div className="min-h-screen pb-24 text-[#FAF5EB]" style={{ background: "#140803" }}>
      {/* ── HERO BANNER ───────────────────────────────────────────────────── */}
      <section
        className="relative min-h-[560px] overflow-hidden px-6 py-20 lg:py-24 text-left text-white flex items-center bg-cover bg-center"
        style={{ backgroundImage: "url('/cafe-artist-space-hero.jpg')" }}
      >
        {/* Dark left gradient overlay for maximum legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0D0502]/95 via-[#0D0502]/85 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#140803] via-transparent to-black/20" />

        <div className="relative z-10 mx-auto max-w-6xl w-full">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#D4A85A]/60 bg-[#140803]/80 backdrop-blur-md px-4 py-1.5 text-xs font-black uppercase tracking-[0.25em] text-[#D4A85A] shadow-xl mb-4">
              <Palette size={14} className="text-[#D4A85A]" /> DEDICATED ARTIST STUDIO
            </span>

            <h1
              className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] text-[#FAF5EB] tracking-tight"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Reserve Your Personal Space for<br />
              Drawing, Painting &amp;<br />
              Creative Artwork
            </h1>

            <p className="mt-5 text-sm sm:text-base text-white/80 max-w-xl leading-relaxed font-medium">
              Enjoy professional wooden easels, digital illustration desks, watercolor stations, studio lighting, and a tranquil inspiring environment at Lekhok Tripura Cafe.
            </p>

            {/* Quick Perks Strip */}
            <div className="mt-8 flex flex-wrap items-center gap-3 text-xs font-bold text-[#D4A85A]">
              <span className="flex items-center gap-2 bg-[#140803]/80 backdrop-blur-md px-4 py-2 rounded-full border border-[#D4A85A]/30">
                <Palette size={14} /> Professional Wooden Easels
              </span>
              <span className="flex items-center gap-2 bg-[#140803]/80 backdrop-blur-md px-4 py-2 rounded-full border border-[#D4A85A]/30">
                <Brush size={14} /> Painting &amp; Sketching Trays
              </span>
              <span className="flex items-center gap-2 bg-[#140803]/80 backdrop-blur-md px-4 py-2 rounded-full border border-[#D4A85A]/30">
                <Coffee size={14} /> 10% Off Cafe Beverages
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── STEP 1: CHOOSE WORKSTATION TYPE ───────────────────────────────── */}
      <section className="mx-auto max-w-4xl px-6 py-14">
        <div className="mb-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-[#FAF5EB]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            1. Select Your Artist Workstation
          </h2>
          <p className="text-xs sm:text-sm text-[#D4A85A] mt-1">
            Book your dedicated studio space for artwork, drawing, and painting.
          </p>
        </div>

        <div className="max-w-xl mx-auto">
          {ART_SPACES.map((space) => {
            const isSelected = selectedSpace.id === space.id;
            const Icon = space.icon;
            return (
              <div
                key={space.id}
                onClick={() => setSelectedSpace(space)}
                className={`group cursor-pointer overflow-hidden rounded-3xl border-2 transition-all duration-300 ${
                  isSelected
                    ? "border-[#D4A85A] bg-[#23120A] shadow-2xl scale-[1.01]"
                    : "border-[#D4A85A]/20 bg-[#1E0E07] hover:border-[#D4A85A]/50"
                }`}
              >
                <div className="relative h-64 sm:h-72 overflow-hidden">
                  <img src={space.image} alt={space.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#140803] via-transparent to-transparent" />
                  <span className="absolute left-4 top-4 rounded-full bg-[#D4A85A] px-4 py-1.5 text-xs font-black text-[#140803] shadow-xl">
                    ₹200 / 4 Hours
                  </span>
                  {isSelected && (
                    <span className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-[#D4A85A] text-[#140803] shadow-xl font-black">
                      <Check size={18} />
                    </span>
                  )}
                </div>

                <div className="p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-2">
                    <Icon size={24} className="text-[#D4A85A]" />
                    <h3 className="text-xl font-black text-[#FAF5EB]">{space.title}</h3>
                  </div>
                  <p className="text-sm text-[#FAF5EB]/75 leading-relaxed mb-6">{space.desc}</p>

                  <div className="grid gap-2.5 sm:grid-cols-2 border-t border-[#D4A85A]/20 pt-4 text-xs font-semibold text-white/90">
                    {space.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-emerald-400 shrink-0" /> {feat}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── STEP 2: SELECT DATE & TIME SLOT ───────────────────────────────── */}
      <section className="mx-auto max-w-4xl px-6 py-4">
        <div className="rounded-3xl border border-[#D4A85A]/30 bg-[#23120A] p-6 sm:p-10 shadow-2xl">
          <h2 className="text-2xl font-black text-[#FAF5EB] mb-6 text-center" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            2. Select Date &amp; Available Time Slot
          </h2>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Left Column: Date & Art Medium */}
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
                  Art Medium / Purpose
                </label>
                <select
                  value={artMedium}
                  onChange={(e) => setArtMedium(e.target.value)}
                  className="w-full rounded-2xl border border-[#D4A85A]/40 bg-[#140803] px-4 py-3 text-sm font-bold text-[#FAF5EB] outline-none focus:border-[#D4A85A]"
                >
                  {ART_MEDIUMS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-[#D4A85A] mb-2">
                  Artists / Seats Count
                </label>
                <select
                  value={guestsCount}
                  onChange={(e) => setGuestsCount(Number(e.target.value))}
                  className="w-full rounded-2xl border border-[#D4A85A]/40 bg-[#140803] px-4 py-3 text-sm font-bold text-[#FAF5EB] outline-none focus:border-[#D4A85A]"
                >
                  <option value={1}>1 Artist (Solo Station)</option>
                  <option value={2}>2 Artists (Pair Easels)</option>
                  <option value={4}>4 Artists (Group Table)</option>
                </select>
              </div>
            </div>

            {/* Right Column: Time Slots */}
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

          {/* Booking Summary Box */}
          <div className="mt-8 rounded-2xl bg-[#140803] p-5 border border-[#D4A85A]/30 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs text-[#D4A85A] font-semibold uppercase tracking-wider">Selected Artist Station Details:</p>
              <p className="text-base font-black text-[#FAF5EB] mt-0.5">
                {selectedSpace.title} — <span className="text-[#D4A85A]">{selectedDate} ({selectedSlot})</span>
              </p>
              <p className="text-xs text-white/70 mt-1">
                Medium: <strong>{artMedium}</strong> • Duration: <strong>4 Hours</strong> • Package Price: <strong className="text-[#D4A85A]">₹200</strong>
              </p>
            </div>

            <button
              onClick={() => setShowComingSoon(true)}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#D4A85A] to-[#A0522D] px-8 py-3.5 text-sm font-black text-[#140803] shadow-xl hover:scale-105 transition"
            >
              <Palette size={16} /> Pre-Book Artist Space (Coming Soon)
            </button>
          </div>
        </div>
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
                <Palette size={32} />
              </div>
              <h3 className="text-2xl font-black text-[#FAF5EB]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                Artist Space Online Booking Coming Soon! 🎨
              </h3>
              <p className="text-xs text-white/80 mt-2 leading-relaxed">
                Online payment &amp; pre-booking for our Artist Space studio stations will be launching very soon.
              </p>

              <div className="mt-4 rounded-2xl bg-[#140803] p-4 text-xs space-y-1.5 text-left border border-[#D4A85A]/25">
                <p className="font-bold text-[#D4A85A] mb-1">Your Selected Workstation Configuration:</p>
                <p><strong>Station:</strong> {selectedSpace.title}</p>
                <p><strong>Date:</strong> {selectedDate}</p>
                <p><strong>Time Slot:</strong> {selectedSlot}</p>
                <p><strong>Art Medium:</strong> {artMedium}</p>
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
    </div>
  );
}
