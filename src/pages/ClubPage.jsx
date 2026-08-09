import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Loader2, CheckCircle2, AlertCircle,
  Users, PenLine, CalendarDays, BookOpen,
  Sparkles, IdCard, BookMarked, Network,
  Mic2, FileText, Eye, Trophy, MessageCircle,
  ShieldCheck, CreditCard, Award, ArrowRight,
  Mail, Phone, Copy
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { API_BASE } from "../config.js";
import { useGsapReveal } from "../hooks/useGsapReveal.js";
import FooterSection from "../sections/FooterSection.jsx";

const stats = [
  { icon: Users,        value: "5",  label: "Members"  },
  { icon: PenLine,      value: "7",  label: "Writers"  },
  { icon: CalendarDays, value: "2",  label: "Events"   },
  { icon: BookOpen,     value: "5",  label: "Books"    },
];

const members = [
  { name: "Ritvik Chakraborty", role: "Founder",        action: "Know More" },
  { name: "Vacant",             role: "Secretary"                           },
  { name: "Vacant",             role: "Vice-Secretary"                      },
  { name: "Vacant",             role: "Admin"                               },
  { name: "Vacant",             role: "Member"                              },
];

const events = [
  "Monthly Book Discussion",
  "Poetry Evening",
  "Creative Writing Workshop",
];

const memberBenefits = [
  { icon: BookOpen,     label: "Access to Hardcopy & Paperback Books", sub: "Available in store." },
  { icon: IdCard,       label: "20 Visiting Cards",                    sub: "Premium quality."    },
  { icon: Trophy,       label: "1 Batch (Badge)",                      sub: "Official club badge." },
  { icon: IdCard,       label: "1 Membership Card",                    sub: "Personalized card."   },
  { icon: CheckCircle2, label: "Lifetime 10% Discount",                sub: "On publishing books." },
];

const activities = [
  { icon: IdCard,         label: "Author Visiting Card"        },
  { icon: Network,        label: "Book Promotion Strategy"     },
  { icon: Mic2,           label: "Discussion Forum"            },
  { icon: FileText,       label: "Literary Review & Critiques" },
  { icon: Eye,            label: "Reading Sessions"            },
];

const benefits = [
  { icon: BookOpen,     label: "Full access to our hardcopy and paperback library" },
  { icon: Trophy,       label: "Exclusive official club badge & custom membership card" },
  { icon: IdCard,       label: "20 personalized author visiting cards upon joining" },
  { icon: CheckCircle2, label: "Lifetime 10% discount on all book publishing packages" },
  { icon: Network,      label: "Priority author branding & social media promotions" },
  { icon: Mic2,         label: "Invitation to monthly literary discussions & workshops" },
  { icon: MessageCircle,label: "Collaborative writer network across Tripura and India" },
  { icon: Sparkles,     label: "Direct publishing guidance from experienced editors" },
];

const initialForm = {
  fullName: "",
  email: "",
  phone: "",
  whatsapp: "",
  dateOfBirth: "",
  address: "",
  reason: "",
};

// Helper function to dynamically load Razorpay Checkout Script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function ClubPage() {
  const scope = useGsapReveal({ stagger: 0.06, y: 24 });
  const [showMembers, setShowMembers] = useState(false);
  const [form, setForm]               = useState(initialForm);
  const [loading, setLoading]         = useState(false);
  const [message, setMessage]         = useState({ type: "", text: "" });
  const [membersList, setMembersList] = useState(members);

  // Active membership state (if user already paid)
  const [activeMembership, setActiveMembership] = useState(null);
  const [copiedMemberId, setCopiedMemberId] = useState(false);

  // Receipt card modal state (shown ONLY right after payment)
  const [showReceiptCard, setShowReceiptCard] = useState(false);
  const [justPaid, setJustPaid] = useState(false);
  const [countdown, setCountdown] = useState(8);
  const countdownRef = useRef(null);
  const navigate = useNavigate();

  // Verify active membership strictly via authenticated session
  useEffect(() => {
    fetch(`${API_BASE}/auth/me`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.user?.email) {
          fetch(`${API_BASE}/club/check-status?email=${encodeURIComponent(d.user.email)}`)
            .then((r) => r.json())
            .then((statusData) => {
              if (statusData.isMember && statusData.member) {
                setActiveMembership(statusData.member);
                localStorage.setItem("lekhok_club_member", JSON.stringify(statusData.member));
              } else {
                setActiveMembership(null);
                localStorage.removeItem("lekhok_club_member");
              }
            })
            .catch(() => {
              setActiveMembership(null);
              localStorage.removeItem("lekhok_club_member");
            });
        } else {
          setActiveMembership(null);
          localStorage.removeItem("lekhok_club_member");
        }
      })
      .catch(() => {
        setActiveMembership(null);
        localStorage.removeItem("lekhok_club_member");
      });
  }, []);

  // Auto-dismiss countdown after fresh payment
  useEffect(() => {
    if (!justPaid) return;
    clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(countdownRef.current);
          setJustPaid(false);
          setShowReceiptCard(false);
          navigate("/");
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(countdownRef.current);
  }, [justPaid, navigate]);

  // Fetch active members list
  useEffect(() => {
    fetch(`${API_BASE}/club/members`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.members && data.members.length > 0) {
          const mapped = data.members.map((m) => ({
            name: m.fullName,
            role: m.role || "Member",
            email: m.email,
            phone: m.phone,
            portfolioUrl: (m.portfolioUrl || "").trim(),
          }));
          setMembersList(mapped);
        }
      })
      .catch((err) => console.error("Error loading club members:", err));
  }, []);

  const setField = (key) => (e) => {
    const value = ["phone", "whatsapp"].includes(key)
      ? e.target.value.replace(/[^0-9]/g, "").slice(0, 10)
      : e.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // Submit Join Application with Razorpay Payment (₹999 + 18% GST = ₹1178.82)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      // 1. Check if Razorpay script is ready
      const resendScriptLoaded = await loadRazorpayScript();

      // 2. Create Razorpay order on backend
      const orderRes = await fetch(`${API_BASE}/club/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const orderData = await orderRes.json();

      if (!orderData.success) {
        if (orderData.alreadyMember) {
          setMessage({ type: "error", text: orderData.message });
          return;
        }
        throw new Error(orderData.message || "Could not create payment order.");
      }

      // 3. Fallback direct submission mode if keys not set on server
      if (orderData.directSubmission) {
        await completeVerification(form, {});
        return;
      }

      // 4. Open Razorpay Checkout Popup
      if (resendScriptLoaded && window.Razorpay && orderData.orderId && orderData.keyId) {
        const options = {
          key: orderData.keyId,
          amount: Math.round(1178.82 * 100),
          currency: "INR",
          name: "Lekhok Tripura Publishers",
          description: "Club Membership Fee (₹999 + 18% GST)",
          order_id: orderData.orderId,
          prefill: {
            name: form.fullName,
            email: form.email,
            contact: form.phone,
          },
          theme: {
            color: "#06b6d4",
          },
          handler: async function (response) {
            await completeVerification(form, response);
          },
          modal: {
            onDismiss: function () {
              setLoading(false);
              setMessage({ type: "error", text: "Payment was cancelled. Please complete payment to submit your membership application." });
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Direct verification fallback
        await completeVerification(form, {});
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message || "An error occurred during payment processing." });
      setLoading(false);
    }
  };

  // Complete Payment Verification on Backend
  const completeVerification = async (formData, paymentResponse) => {
    try {
      const verifyRes = await fetch(`${API_BASE}/club/verify-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          razorpay_payment_id: paymentResponse.razorpay_payment_id,
          razorpay_order_id: paymentResponse.razorpay_order_id,
          razorpay_signature: paymentResponse.razorpay_signature,
        }),
      });

      const verifyData = await verifyRes.json();

      if (verifyData.success) {
        const memberInfo = verifyData.member;
        localStorage.setItem("lekhok_club_member", JSON.stringify(memberInfo));
        setActiveMembership(memberInfo);
        setShowReceiptCard(true);
        setJustPaid(true);
        setCountdown(8);
        setForm(initialForm);
        setMessage({
          type: "success",
          text: "Welcome to Lekhok Tripura Club! Your membership is active. A confirmation email with your Member ID has been sent to your inbox.",
        });
      } else {
        setMessage({ type: "error", text: verifyData.message || "Payment verification failed." });
      }
    } catch {
      setMessage({ type: "error", text: "Server error during payment verification." });
    } finally {
      setLoading(false);
    }
  };

  const scrollToJoin = (e) => {
    if (e) e.preventDefault();
    const el = document.getElementById("join-club");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => {
        const input = el.querySelector("input");
        if (input) input.focus();
      }, 500);
    }
  };

  const scrollToMembers = (e) => {
    if (e) e.preventDefault();
    setShowMembers(true);
    const el = document.getElementById("our-members");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main ref={scope} className="relative overflow-hidden pt-28">
      {/* ══════════════ HERO SECTION ══════════════ */}
      <section className="relative z-10 min-h-[85vh] w-full overflow-hidden flex flex-col justify-between py-12 md:py-20 text-left">
        {/* Full-width responsive background image */}
        <div
          className="absolute inset-0 bg-cover bg-no-repeat bg-[center_top] md:bg-[82%_center]"
          style={{ backgroundImage: "url('/club-hero-bg.png')" }}
        />
        
        {/* Responsive Overlay Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-zinc-950/80 md:bg-gradient-to-r md:from-zinc-950/95 md:via-zinc-950/70 md:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/80 via-transparent to-zinc-950" />

        {/* Hero Content Container */}
        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <motion.div data-reveal>
              {/* Eyebrow badge */}
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-zinc-950/80 px-4 py-1.5 backdrop-blur-md shadow-lg">
                <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                <span className="text-[11px] font-black uppercase tracking-[0.4em] text-cyan-300">
                  Readers &amp; Writers Club &nbsp;·&nbsp; Est. 2025
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl font-black uppercase leading-[1.06] text-white sm:text-5xl md:text-6xl lg:text-[5rem]">
                Join<br />
                <span className="bg-gradient-to-r from-cyan-300 via-teal-200 to-fuchsia-300 bg-clip-text text-transparent drop-shadow">
                  Lekhok
                </span><br />
                Tripura Club
              </h1>

              {/* Subtitle */}
              <p className="mt-3.5 max-w-xl text-sm leading-relaxed text-white/85 drop-shadow sm:text-base md:text-lg">
                A community of writers, by writers, for literature.
                Be a part of a growing literary movement in Tripura.
              </p>

              {/* Price & Membership tag / Active Member Badge */}
              <div className="mt-7 flex flex-wrap items-center gap-4">
                {activeMembership ? (
                  <div className="inline-flex items-center gap-3.5 rounded-2xl border border-emerald-400/50 bg-emerald-950/85 px-5 py-3 backdrop-blur-md shadow-xl shadow-emerald-950/40">
                    <span className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-300">
                      <ShieldCheck size={16} /> Active Digital Club Member
                    </span>
                    {activeMembership.memberId && (
                      <span className="font-mono text-xs font-bold text-amber-300 bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/30">
                        {activeMembership.memberId}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-3.5 rounded-2xl border border-emerald-400/40 bg-zinc-950/85 px-5 py-3 backdrop-blur-md shadow-xl shadow-black/40">
                    <span className="text-[11px] font-black uppercase tracking-widest text-emerald-300">
                      Lifetime Membership
                    </span>
                    <div className="h-4 w-px bg-white/20" />
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl sm:text-3xl font-black text-white">₹1</span>
                      <span className="text-[10px] font-bold text-emerald-300">(Test Fee)</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-3.5">
                {activeMembership ? (
                  <>
                    <a
                      href={`${API_BASE}/club/download/card?memberId=${encodeURIComponent(activeMembership?.memberId || "")}&email=${encodeURIComponent(activeMembership?.email || "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 px-8 py-4 text-xs sm:text-sm font-black uppercase tracking-wider text-black shadow-[0_0_40px_rgba(16,185,129,0.45)] transition hover:scale-105 hover:shadow-[0_0_55px_rgba(16,185,129,0.6)] active:scale-100 cursor-pointer"
                    >
                      <Eye size={16} />
                      <span>View My Membership Card</span>
                    </a>
                    <button
                      type="button"
                      onClick={scrollToMembers}
                      className="rounded-2xl border border-white/25 bg-zinc-950/75 px-6 py-4 text-xs sm:text-sm font-bold text-white backdrop-blur-md shadow-lg transition hover:bg-white/20 hover:border-white/40 cursor-pointer"
                    >
                      Check Our Members
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={scrollToJoin}
                      className="rounded-2xl bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 px-8 py-4 text-xs sm:text-sm font-black uppercase tracking-wider text-black shadow-[0_0_40px_rgba(6,182,212,0.45)] transition hover:scale-105 hover:shadow-[0_0_55px_rgba(6,182,212,0.6)] active:scale-100 cursor-pointer"
                    >
                      Become a Member
                    </button>
                    <button
                      type="button"
                      onClick={scrollToMembers}
                      className="rounded-2xl border border-white/25 bg-zinc-950/75 px-6 py-4 text-xs sm:text-sm font-bold text-white backdrop-blur-md shadow-lg transition hover:bg-white/20 hover:border-white/40 cursor-pointer"
                    >
                      Check Our Members
                    </button>
                    <a
                      href={`${API_BASE}/club/download/demo`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-2xl border border-emerald-400/40 bg-emerald-950/60 px-6 py-4 text-xs sm:text-sm font-bold text-emerald-300 backdrop-blur-md shadow-lg transition hover:bg-emerald-900/80 hover:border-emerald-400/60 cursor-pointer"
                    >
                      <Eye size={16} />
                      <span>View Demo Card</span>
                    </a>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── Stats Row Below Hero ── */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(({ icon: Icon, value, label }) => (
            <motion.div
              key={label}
              data-reveal
              whileHover={{ y: -4 }}
              className="group rounded-2xl border border-white/10 bg-zinc-950/70 p-6 text-center shadow-card backdrop-blur-xl transition-all hover:border-cyan-400/30 hover:bg-zinc-900/80"
            >
              <Icon className="mx-auto mb-2.5 h-6 w-6 text-cyan-400 transition group-hover:scale-110" />
              <div className="text-3xl font-black text-white">{value}</div>
              <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-white/50">{label}</div>
            </motion.div>
          ))}
        </div>

        {/* ── Member Benefits Strip ── */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6">
          <div className="rounded-3xl border border-white/10 bg-zinc-950/70 p-6 sm:p-8 backdrop-blur-md shadow-2xl">
            <p className="mb-5 text-center text-[11px] font-black uppercase tracking-[0.45em] text-white/40">
              Member Will Get
            </p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {memberBenefits.map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex flex-col items-center gap-2 text-center">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
                    <Icon className="h-5 w-5 text-cyan-400" />
                  </div>
                  <p className="text-xs font-bold leading-snug text-white/80">{label}</p>
                  <p className="text-[10px] text-white/40">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Club Activities Row ── */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-4">
          <div className="rounded-2xl border border-white/10 bg-zinc-950/70 p-4 sm:p-5 backdrop-blur-md shadow-xl">
            <p className="mb-3.5 text-center text-[11px] font-black uppercase tracking-[0.45em] text-white/40">
              Club Activities
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              {activities.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-white/70 transition hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-white"
                >
                  <Icon className="h-3.5 w-3.5 text-cyan-400" />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ ABOUT US ══════════════ */}
      <section id="about-us" className="section-shell relative z-10 py-16">
        <h2 data-reveal className="text-center text-4xl font-black text-white md:text-5xl">About Us</h2>
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <article data-reveal className="rounded-lg border border-white/10 bg-white/[0.055] p-7 text-left text-base leading-8 text-white/70 shadow-card backdrop-blur-xl md:p-9 md:text-lg">
            <p>Lekhok Tripura Club is a community dedicated to writers, readers, and literature enthusiasts across Tripura. Founded with a vision to promote reading and creative writing, the club serves as a platform where literary minds can connect, share ideas, and grow together.</p>
            <p className="mt-4">Our objective is to support emerging writers, preserve local culture, and encourage critical thinking through books, workshops, and literary discussions. Whether you are an aspiring author or an avid reader, Lekhok Tripura Club welcomes you to be part of this literary journey.</p>
          </article>

          <article data-reveal className="rounded-lg border border-white/10 bg-white/[0.055] p-7 text-left shadow-card backdrop-blur-xl md:p-9">
            <h3 className="text-2xl font-black text-cyan-300">Key Focus Areas</h3>
            <ul className="mt-6 space-y-4 text-base text-white/75 md:text-lg">
              <li className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-cyan-300" />
                Encouraging young &amp; emerging writers
              </li>
              <li className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-cyan-300" />
                Organizing book readings &amp; discussions
              </li>
              <li className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-cyan-300" />
                Publishing guidance &amp; editorial support
              </li>
              <li className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-cyan-300" />
                Building a vibrant reader network in Tripura
              </li>
            </ul>
          </article>
        </div>
      </section>

      {/* ══════════════ EVENTS ══════════════ */}
      <section className="section-shell relative z-10 py-16">
        <h2 data-reveal className="text-center text-4xl font-black text-white md:text-5xl">Events</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <motion.div
              key={event}
              data-reveal
              whileHover={{ y: -5 }}
              className="rounded-lg border border-white/10 bg-white/[0.055] p-8 text-center shadow-card backdrop-blur-xl"
            >
              <CalendarDays className="mx-auto mb-4 h-8 w-8 text-cyan-300" />
              <h3 className="text-xl font-bold text-white">{event}</h3>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════════ OUR MEMBERS ══════════════ */}
      <section id="our-members" className="section-shell relative z-10 py-16 text-center">
        <h2 data-reveal className="text-4xl font-black text-white md:text-5xl">Our Members</h2>
        <button
          data-reveal
          onClick={() => setShowMembers((v) => !v)}
          className="mt-10 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-8 py-4 text-base font-bold text-cyan-100 transition hover:border-cyan-300/45 hover:bg-cyan-300/15 cursor-pointer"
        >
          {showMembers ? "Hide Members" : "Check Our Members"}
        </button>

        <AnimatePresence>
          {showMembers && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mx-auto mt-10 max-w-5xl rounded-lg border border-white/10 bg-white/[0.055] p-5 text-left shadow-card backdrop-blur-xl md:p-8">
                <div className="space-y-4">
                  {membersList.map((member, i) => (
                    <div
                      key={`${member.name}-${member.role}-${i}`}
                      className="group grid gap-4 rounded-lg border border-white/10 bg-black/25 p-5 transition hover:border-cyan-300/25 hover:bg-cyan-300/10 sm:grid-cols-[4rem_1fr_auto] sm:items-center"
                    >
                      <div className="text-lg font-black text-cyan-300/85">{String(i + 1).padStart(2, "0")}.</div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-xl font-black text-white">{member.name}</h3>
                          <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-0.5 text-xs font-bold text-cyan-300">
                            {member.role || "Member"}
                          </span>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-white/65">
                          {member.email && (
                            <div className="flex items-center gap-1.5">
                              <Mail className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                              <a href={`mailto:${member.email}`} className="hover:text-cyan-300 transition">
                                {member.email}
                              </a>
                            </div>
                          )}
                          {member.phone && (
                            <div className="flex items-center gap-1.5">
                              <Phone className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                              <a href={`tel:${member.phone}`} className="hover:text-emerald-300 transition">
                                {member.phone}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                      {member.portfolioUrl ? (
                        <a
                          href={member.portfolioUrl.startsWith("http") ? member.portfolioUrl : `https://${member.portfolioUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-bold text-cyan-200 underline decoration-cyan-300/30 underline-offset-4 transition group-hover:text-white cursor-pointer"
                        >
                          Know More →
                        </a>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ══════════════ FULL BENEFITS ══════════════ */}
      <section className="section-shell relative z-10 py-16">
        <h2 data-reveal className="text-center text-4xl font-black text-white md:text-5xl">Club Activities &amp; Benefits</h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map(({ icon: Icon, label }) => (
            <motion.div
              key={label}
              data-reveal
              whileHover={{ y: -5 }}
              className="rounded-lg border border-white/10 bg-white/[0.055] p-6 shadow-card backdrop-blur-xl"
            >
              <Icon className="mb-5 h-6 w-6 text-cyan-300" />
              <p className="text-base font-semibold leading-7 text-white/82">{label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════════ JOIN FORM OR ACTIVE MEMBERSHIP CARD ══════════════ */}
      <section id="join-club" className="section-shell relative z-10 py-16">
        <div className="mx-auto max-w-5xl">

          {/* IF FRESH PAYMENT: SHOW CONFIRMATION RECEIPT CARD */}
          {showReceiptCard && activeMembership ? (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="rounded-3xl border border-cyan-400/40 bg-gradient-to-br from-cyan-950/60 via-zinc-950 to-indigo-950/60 p-8 text-center shadow-2xl backdrop-blur-xl md:p-12"
            >
              <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-3xl border border-emerald-400/40 bg-emerald-400/15 text-emerald-300 shadow-glow">
                <ShieldCheck size={36} />
              </div>

              {/* Auto-dismiss countdown bar */}
              {justPaid && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-semibold text-white/50">
                      Redirecting to home in <strong className="text-cyan-300">{countdown}s</strong>…
                    </span>
                    <button
                      type="button"
                      onClick={() => { clearInterval(countdownRef.current); setJustPaid(false); }}
                      className="text-[10px] text-white/30 hover:text-white/70 transition underline"
                    >
                      Stay on page
                    </button>
                  </div>
                  <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-indigo-400 transition-all duration-1000 ease-linear"
                      style={{ width: `${(countdown / 8) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-emerald-300">
                <CheckCircle2 size={14} /> Official Lifetime Member
              </div>

              <h2 className="text-3xl font-black text-white sm:text-4xl md:text-5xl">
                Welcome to Lekhok Tripura Club!
              </h2>

              <p className="mx-auto mt-4 max-w-xl text-sm sm:text-base leading-relaxed text-white/75">
                Thank you <strong className="text-cyan-300">{activeMembership.fullName}</strong>! Your membership application and payment of <strong className="text-emerald-300">₹1,178.82</strong> have been successfully processed.
              </p>

              {/* Digital Receipt Box */}
              <div className="mx-auto mt-8 max-w-lg rounded-2xl border border-white/10 bg-black/40 p-6 text-left text-xs space-y-3">
                <div className="flex justify-between border-b border-white/10 pb-2.5">
                  <span className="text-white/50 font-semibold">Member Name:</span>
                  <span className="font-extrabold text-white">{activeMembership.fullName}</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2.5">
                  <span className="text-white/50 font-semibold">Registered Email:</span>
                  <span className="font-extrabold text-white">{activeMembership.email}</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2.5">
                  <span className="text-white/50 font-semibold">Phone Number:</span>
                  <span className="font-extrabold text-white">{activeMembership.phone}</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2.5">
                  <span className="text-white/50 font-semibold">Base Fee + 18% GST:</span>
                  <span className="font-extrabold text-emerald-300">₹999.00 + ₹179.82 = ₹1,178.82</span>
                </div>
                {activeMembership.paymentId && (
                  <div className="flex justify-between">
                    <span className="text-white/50 font-semibold">Payment Txn ID:</span>
                    <span className="font-mono font-bold text-cyan-300">{activeMembership.paymentId}</span>
                  </div>
                )}
              </div>

              {/* Action Links */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => {
                    clearInterval(countdownRef.current);
                    setJustPaid(false);
                    setShowReceiptCard(false);
                    navigate("/");
                  }}
                  className="rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-8 py-3.5 text-sm font-black uppercase tracking-wider text-black shadow-lg hover:opacity-90 transition"
                >
                  ✓ OK
                </button>
                <Link
                  to="/library"
                  className="rounded-2xl bg-white/10 border border-white/20 px-6 py-3.5 text-xs font-black uppercase text-white hover:bg-white/20"
                >
                  Explore Books
                </Link>
                <Link
                  to="/short-stories"
                  className="rounded-2xl border border-white/20 bg-white/10 px-6 py-3.5 text-xs font-bold text-white hover:bg-white/20"
                >
                  Read Short Stories
                </Link>
              </div>

              {/* Member ID display */}
              {activeMembership.memberId && (
                <div className="mx-auto mt-6 max-w-lg">
                  <p className="text-[10px] font-black uppercase tracking-[0.35em] text-amber-300 mb-3 text-center">Your Member ID</p>
                  <div className="relative flex items-center justify-between rounded-2xl border-2 border-amber-400/40 bg-gradient-to-r from-amber-950/60 to-zinc-950 px-6 py-4 shadow-xl">
                    <span className="font-mono text-2xl font-black text-white tracking-widest">{activeMembership.memberId}</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(activeMembership.memberId).catch(() => {});
                        setCopiedMemberId(true);
                        setTimeout(() => setCopiedMemberId(false), 2500);
                      }}
                      className="flex items-center gap-1.5 rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-400/20 transition cursor-pointer"
                    >
                      <Copy size={13} />
                      {copiedMemberId ? "Copied!" : "Copy ID"}
                    </button>
                  </div>

                  {/* Activation instructions */}
                  <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-950/30 p-4 text-left space-y-2">
                    <p className="text-xs font-black text-emerald-300 flex items-center gap-1.5">
                      <ShieldCheck size={13} /> How to Activate Your Discounts
                    </p>
                    <ol className="text-xs text-white/65 space-y-1 list-decimal list-inside leading-relaxed">
                      <li>Click your <strong className="text-white">Profile icon</strong> (top-right corner)</li>
                      <li>Select <strong className="text-white">"Edit Profile"</strong> from the dropdown</li>
                      <li>Scroll to the <strong className="text-cyan-300">"Club Membership"</strong> section</li>
                      <li>Paste your Member ID: <span className="font-mono text-amber-300">{activeMembership.memberId}</span></li>
                      <li>Click <strong className="text-white">"Activate Membership"</strong> — done!</li>
                    </ol>
                    <div className="mt-3 grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-cyan-300">
                        <BookOpen size={11} className="shrink-0" /> 5% OFF Books
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-300">
                        <PenLine size={11} className="shrink-0" /> 10% OFF Publishing
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ) : activeMembership ? (
            /* PERMANENT ACTIVE MEMBER DASHBOARD FOR MEMBERS (NO BANNER, NO FORM) */
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="rounded-3xl border border-cyan-400/40 bg-gradient-to-br from-cyan-950/60 via-zinc-950 to-indigo-950/60 p-8 text-center shadow-2xl backdrop-blur-xl md:p-12"
            >
              <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-3xl border border-emerald-400/40 bg-emerald-400/15 text-emerald-300 shadow-glow">
                <ShieldCheck size={36} />
              </div>

              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-emerald-300">
                <CheckCircle2 size={14} /> Official Lifetime Member
              </div>

              <h2 className="text-3xl font-black text-white sm:text-4xl md:text-5xl">
                Welcome back, {activeMembership.fullName}! 🎉
              </h2>

              <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/70">
                Your club membership is active. Enjoy <strong className="text-cyan-300">5% OFF</strong> on all book purchases and <strong className="text-indigo-300">10% OFF</strong> on your next book publishing.
              </p>

              {/* Member ID Display */}
              {activeMembership.memberId && (
                <div className="mx-auto mt-6 max-w-lg">
                  <p className="text-[10px] font-black uppercase tracking-[0.35em] text-amber-300 mb-2.5 text-center">Your Exclusive Member ID</p>
                  <div className="relative flex items-center justify-between rounded-2xl border-2 border-amber-400/40 bg-gradient-to-r from-amber-950/60 to-zinc-950 px-6 py-4 shadow-xl">
                    <span className="font-mono text-2xl font-black text-white tracking-widest">{activeMembership.memberId}</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(activeMembership.memberId).catch(() => {});
                        setCopiedMemberId(true);
                        setTimeout(() => setCopiedMemberId(false), 2500);
                      }}
                      className="flex items-center gap-1.5 rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-400/20 transition cursor-pointer"
                    >
                      <Copy size={13} />
                      {copiedMemberId ? "Copied!" : "Copy ID"}
                    </button>
                  </div>

                  {/* Activation instructions */}
                  <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-950/30 p-4 text-left space-y-2">
                    <p className="text-xs font-black text-emerald-300 flex items-center gap-1.5">
                      <ShieldCheck size={13} /> How to Activate Discounts on Your Profile
                    </p>
                    <ol className="text-xs text-white/65 space-y-1 list-decimal list-inside leading-relaxed">
                      <li>Click your <strong className="text-white">Profile icon</strong> (top-right corner)</li>
                      <li>Select <strong className="text-white">"Edit Profile"</strong> from the menu</li>
                      <li>Scroll down to <strong className="text-cyan-300">"Club Membership"</strong></li>
                      <li>Paste your Member ID: <span className="font-mono text-amber-300">{activeMembership.memberId}</span> and click <strong className="text-white">Activate</strong></li>
                    </ol>
                  </div>
                </div>
              )}

              {/* Benefits summary cards */}
              <div className="mx-auto mt-6 grid max-w-lg grid-cols-2 gap-3">
                <div className="flex items-center gap-2.5 rounded-2xl border border-cyan-400/20 bg-cyan-400/8 p-3.5 text-left">
                  <BookOpen size={18} className="text-cyan-400 shrink-0" />
                  <div>
                    <p className="text-xs font-black text-cyan-300">5% OFF</p>
                    <p className="text-[10px] text-white/50">Book Purchases</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 rounded-2xl border border-indigo-400/20 bg-indigo-400/8 p-3.5 text-left">
                  <PenLine size={18} className="text-indigo-400 shrink-0" />
                  <div>
                    <p className="text-xs font-black text-indigo-300">10% OFF</p>
                    <p className="text-[10px] text-white/50">Book Publishing</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link
                  to="/library"
                  className="rounded-2xl bg-cyan-400 px-6 py-3 text-xs font-black uppercase text-black hover:bg-cyan-300 transition shadow-lg shadow-cyan-400/20"
                >
                  Explore Library
                </Link>
                <Link
                  to="/short-stories"
                  className="rounded-2xl border border-white/20 bg-white/10 px-6 py-3 text-xs font-bold text-white hover:bg-white/20 transition"
                >
                  Read Short Stories
                </Link>
              </div>
            </motion.div>
          ) : (
            /* IF NOT YET PAID: RENDER APPLICATION FORM & GST FEE SUMMARY */
            <>
              {/* ── BANNER ── placed above the form heading */}
              <div className="mb-8 overflow-hidden rounded-3xl shadow-2xl shadow-cyan-400/10">
                <img
                  src="/ChatGPT Image Aug 8, 2026, 07_32_01 PM.png"
                  alt="Lekhok Tripura Club Member Benefits — 5% Off Books, 10% Off Publishing"
                  className="w-full object-cover"
                  loading="lazy"
                />
              </div>

              <h2 data-reveal className="text-center text-4xl font-black text-white md:text-5xl">Join Our Club</h2>
              <p data-reveal className="mt-2 text-center text-xs sm:text-sm text-white/60">
                Complete your details and proceed to payment to activate your lifetime club membership.
              </p>


              <form
                onSubmit={handleSubmit}
                data-reveal
                className="mt-8 rounded-2xl border border-white/10 bg-white/[0.055] p-6 shadow-card backdrop-blur-xl md:p-8"
              >
                {/* GST Pricing Summary Card */}
                <div className="mb-8 overflow-hidden rounded-2xl border border-emerald-400/30 bg-gradient-to-r from-emerald-950/60 via-zinc-950 to-teal-950/60 p-5 shadow-xl">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4 mb-4">
                    <div>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-emerald-300">
                        <Award size={12} /> Lifetime Club Membership Fee
                      </span>
                      <p className="mt-1 text-xs text-white/65">
                        Includes author visiting cards, official club badge, membership card &amp; 10% discount on publishing.
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-black text-emerald-300">₹1</div>
                      <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Test Purchase Fee</div>
                    </div>
                  </div>

                  <div className="grid gap-2 text-xs text-white/70 sm:grid-cols-3">
                    <div className="flex items-center justify-between sm:justify-start sm:gap-2">
                      <span>Base Membership:</span>
                      <strong className="text-white">₹1.00</strong>
                    </div>
                    <div className="flex items-center justify-between sm:justify-start sm:gap-2">
                      <span>GST (0% Test):</span>
                      <strong className="text-white">₹0.00</strong>
                    </div>
                    <div className="flex items-center justify-between sm:justify-start sm:gap-2">
                      <span className="text-cyan-300 font-bold">Total Payable:</span>
                      <strong className="text-emerald-300 font-black text-sm">₹1.00</strong>
                    </div>
                  </div>
                </div>

                {message.text && (
                  <div
                    className={`mb-6 flex items-start gap-3 rounded-xl border p-4 text-xs font-semibold ${
                      message.type === "success"
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                        : "border-red-500/30 bg-red-500/10 text-red-300"
                    }`}
                  >
                    {message.type === "success"
                      ? <CheckCircle2 className="h-5 w-5 shrink-0" />
                      : <AlertCircle className="h-5 w-5 shrink-0" />}
                    <span>{message.text}</span>
                  </div>
                )}

                <div className="grid gap-4 text-left md:grid-cols-2">
                  <Field label="Full Name">
                    <input required value={form.fullName} onChange={setField("fullName")} placeholder="Enter your full name" className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-3 text-sm text-white placeholder-white/25 outline-none transition focus:border-cyan-400/40 focus:bg-white/10" />
                  </Field>
                  <Field label="Mail ID">
                    <input required type="email" value={form.email} onChange={setField("email")} placeholder="example@mail.com" className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-3 text-sm text-white placeholder-white/25 outline-none transition focus:border-cyan-400/40 focus:bg-white/10" />
                  </Field>
                  <Field label="Phone Number">
                    <input required value={form.phone} onChange={setField("phone")} placeholder="10-digit mobile number" className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-3 text-sm text-white placeholder-white/25 outline-none transition focus:border-cyan-400/40 focus:bg-white/10" />
                  </Field>
                  <Field label="WhatsApp Number">
                    <input required value={form.whatsapp} onChange={setField("whatsapp")} placeholder="10-digit WhatsApp number" className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-3 text-sm text-white placeholder-white/25 outline-none transition focus:border-cyan-400/40 focus:bg-white/10" />
                  </Field>
                  <Field label="Date of Birth">
                    <input required type="date" value={form.dateOfBirth} onChange={setField("dateOfBirth")} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40 focus:bg-white/10" />
                  </Field>
                  <div />
                  <label className="block text-sm font-bold text-white/75 md:col-span-2">
                    Address
                    <textarea required value={form.address} onChange={setField("address")} placeholder="Enter your complete address" rows={3} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-3 text-sm text-white placeholder-white/25 outline-none transition focus:border-cyan-400/40 focus:bg-white/10" />
                  </label>
                  <label className="block text-sm font-bold text-white/75 md:col-span-2">
                    Why you want to join our team?
                    <textarea required value={form.reason} onChange={setField("reason")} placeholder="Share your reasons for joining the club..." rows={4} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-3 text-sm text-white placeholder-white/25 outline-none transition focus:border-cyan-400/40 focus:bg-white/10" />
                  </label>
                </div>

                <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row">
                  <div className="flex items-center gap-2 text-xs font-semibold text-white/60">
                    <CreditCard className="h-4 w-4 text-cyan-400 shrink-0" />
                    <span>Secure 256-bit Encrypted Payment via Razorpay</span>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 px-8 py-3.5 text-xs font-black uppercase tracking-wider text-black shadow-[0_0_30px_rgba(6,182,212,0.4)] transition hover:scale-105 disabled:opacity-60 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Processing Payment...
                      </>
                    ) : (
                      <>
                        Proceed to Pay ₹1,178.82 <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}

        </div>
      </section>

      <FooterSection />
    </main>
  );
}

function Field({ label, children }) {
  return (
    <label className="block text-sm font-bold text-white/75">
      {label}
      {children}
    </label>
  );
}
