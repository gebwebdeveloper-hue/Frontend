import { useEffect, useState } from "react";
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
    id: "Quiet Reading Nook",
    title: "Quiet Reading Nook",
    desc: "Plush leather armchair, ambient reading lamp, and noise-controlled reading corner.",
    icon: BookOpen,
    pricePerHour: 49,
    image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&auto=format&fit=crop&q=80",
    features: ["Noise-controlled Zone", "Ambient Reading Lamp", "Free High-Speed Wi-Fi", "Unlimited Book Access"],
  },
  {
    id: "Writer's Desk",
    title: "Writer's Desk",
    desc: "Ergonomic chair, spacious wooden desk, power outlets, and dedicated writer's quiet zone.",
    icon: Feather,
    pricePerHour: 75,
    image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&auto=format&fit=crop&q=80",
    features: ["Ergonomic Seating", "Power Outlets & USB", "High-Speed Wi-Fi", "Writing Notepad Included"],
  },
  {
    id: "Private Creative Pod",
    title: "Private Creative Pod",
    desc: "Sound-dampened acoustic booth designed for deep focus writing, drafting, and intense study.",
    icon: Laptop,
    pricePerHour: 99,
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop&q=80",
    features: ["Acoustic Isolation", "Private Desk Space", "Beverage Service", "Power & Fast Wi-Fi"],
  },
  {
    id: "Group Discussion Pod",
    title: "Group Discussion Pod",
    desc: "Collaborative table for readers club, writing circles, and group creative discussions.",
    icon: Users,
    pricePerHour: 149,
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=80",
    features: ["Seating for 4-6", "Sharing Screen Available", "Whiteboard", "Group Drinks Discount"],
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

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
                <div className="relative h-40 overflow-hidden">
                  <img src={space.image} alt={space.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#140803] via-transparent to-transparent" />
                  <span className="absolute left-3 top-3 rounded-full bg-[#D4A85A] px-3 py-1 text-[10px] font-black text-[#140803] shadow-md">
                    ₹{space.pricePerHour * 2} / 2 Hours
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
                Duration: <strong>2 Hours</strong> • Total Price: <strong className="text-[#D4A85A]">₹{selectedSpace.pricePerHour * 2}</strong>
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
