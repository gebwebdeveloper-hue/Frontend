import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X, Coffee, ShieldCheck, LogOut, User, Sparkles, ShoppingBag, Clock, Bell, BookOpen, Palette, ExternalLink } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { API_BASE } from "../config.js";
import { clearCart } from "../utils/cart.js";
import { getCafeCart } from "./utils/cafeCart.js";
import CafeCartModal from "./components/CafeCartModal.jsx";
import CafeOrderTrackerModal from "./components/CafeOrderTrackerModal.jsx";

const cafeLinks = [
  { label: "Menu", to: "/cafe/menu" },
  { label: "Reserve Creative Space", to: "/cafe/reserve" },
  { label: "Books in Cafe", to: "/cafe/books" },
  { label: "Updates 📢", to: "/cafe/updates" },
];

export default function CafeNavbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [authUser, setAuthUser] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [trackerOpen, setTrackerOpen] = useState(false);
  const [activeTrackerOrder, setActiveTrackerOrder] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  const profileRef = useRef(null);
  const navigate = useNavigate();

  const updateCartCount = () => {
    const items = getCafeCart();
    const count = items.reduce((sum, i) => sum + (i.quantity || 1), 0);
    setCartCount(count);
  };

  const checkSession = () => {
    fetch(`${API_BASE}/auth/me`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.success && d.user) setAuthUser(d.user);
        else setAuthUser(false);
      })
      .catch(() => setAuthUser(false));
  };

  useEffect(() => {
    checkSession();
    updateCartCount();

    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("lekhak:login", checkSession);
    window.addEventListener("lekhak:logout", checkSession);
    window.addEventListener("lekhak:cafe-cart-updated", updateCartCount);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("lekhak:login", checkSession);
      window.removeEventListener("lekhak:logout", checkSession);
      window.removeEventListener("lekhak:cafe-cart-updated", updateCartCount);
    };
  }, []);

  useEffect(() => {
    const onClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target))
        setProfileOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handleLogout = async () => {
    await fetch(`${API_BASE}/auth/logout`, { method: "POST", credentials: "include" }).catch(() => {});
    setAuthUser(false);
    setProfileOpen(false);
    clearCart();
    window.dispatchEvent(new Event("lekhak:logout"));
    navigate("/cafe");
  };

  const userInitial = authUser?.name
    ? authUser.name.trim().charAt(0).toUpperCase()
    : authUser?.email
    ? authUser.email.charAt(0).toUpperCase()
    : "";

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50">
        <motion.nav
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className={`w-full transition-all duration-500 ${
            scrolled
              ? "bg-[#1A0C06]/95 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.5)] border-b border-[#D4A85A]/25"
              : "bg-[#1A0C06]/80 backdrop-blur-md border-b border-white/5"
          }`}
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 md:px-10 md:py-4">

            {/* Logo */}
            <Link to="/cafe" className="group flex shrink-0 items-center gap-3">
              <img
                src="/Cafe_Logo.jpeg"
                alt="Lekhok Tripura Cafe Logo"
                className="h-10 w-10 sm:h-12 sm:w-12 shrink-0 rounded-xl object-contain bg-white p-1 shadow-lg border border-[#D4A85A]/50 transition-all duration-300 group-hover:scale-105 group-hover:shadow-[#D4A85A]/40"
              />
              <div className="shrink-0">
                <h1 className="whitespace-nowrap text-[11px] sm:text-sm font-black uppercase tracking-[0.18em] text-[#FAF5EB]">
                  Lekhok Tripura
                </h1>
                <p className="text-[10px] sm:text-xs font-semibold tracking-widest text-[#D4A85A]">
                  LIBRARY CAFÉ
                </p>
              </div>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden items-center gap-1 lg:flex">
              {/* Menu Link */}
              <NavLink to="/cafe/menu">
                {({ isActive }) => (
                  <div
                    className={`relative flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition-all duration-300 ${
                      isActive
                        ? "text-[#D4A85A]"
                        : "text-white/80 hover:text-[#D4A85A]"
                    }`}
                  >
                    <span>Menu</span>
                    <Coffee size={15} className="text-[#D4A85A]" />
                    {isActive && (
                      <motion.div
                        layoutId="cafe-nav-pill"
                        className="absolute inset-0 -z-10 rounded-full bg-[#D4A85A]/15 border border-[#D4A85A]/30"
                        transition={{ type: "spring", stiffness: 350, damping: 28 }}
                      />
                    )}
                  </div>
                )}
              </NavLink>

              {/* Reserve Creative Space Link */}
              <NavLink to="/cafe/reserve">
                {({ isActive }) => (
                  <div
                    className={`relative flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition-all duration-300 ${
                      isActive
                        ? "text-[#D4A85A]"
                        : "text-white/80 hover:text-[#D4A85A]"
                    }`}
                  >
                    <span>Reserve Creative Space</span>
                    <Sparkles size={15} className="text-[#D4A85A]" />
                    {isActive && (
                      <motion.div
                        layoutId="cafe-nav-pill"
                        className="absolute inset-0 -z-10 rounded-full bg-[#D4A85A]/15 border border-[#D4A85A]/30"
                        transition={{ type: "spring", stiffness: 350, damping: 28 }}
                      />
                    )}
                  </div>
                )}
              </NavLink>

              {/* Books in Cafe Link */}
              <NavLink to="/cafe/books">
                {({ isActive }) => (
                  <div
                    className={`relative flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition-all duration-300 ${
                      isActive
                        ? "text-[#D4A85A]"
                        : "text-white/80 hover:text-[#D4A85A]"
                    }`}
                  >
                    <span>Books in Cafe</span>
                    <BookOpen size={15} className="text-[#D4A85A]" />
                    {isActive && (
                      <motion.div
                        layoutId="cafe-nav-pill"
                        className="absolute inset-0 -z-10 rounded-full bg-[#D4A85A]/15 border border-[#D4A85A]/30"
                        transition={{ type: "spring", stiffness: 350, damping: 28 }}
                      />
                    )}
                  </div>
                )}
              </NavLink>

              {/* Updates Link */}
              <NavLink to="/cafe/updates">
                {({ isActive }) => (
                  <div
                    className={`relative flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition-all duration-300 ${
                      isActive
                        ? "text-[#D4A85A]"
                        : "text-white/80 hover:text-[#D4A85A]"
                    }`}
                  >
                    <span>Updates</span>
                    <Bell size={15} className="text-[#D4A85A]" />
                    {isActive && (
                      <motion.div
                        layoutId="cafe-nav-pill"
                        className="absolute inset-0 -z-10 rounded-full bg-[#D4A85A]/15 border border-[#D4A85A]/30"
                        transition={{ type: "spring", stiffness: 350, damping: 28 }}
                      />
                    )}
                  </div>
                )}
              </NavLink>

              {/* Cart Button */}
              <button
                onClick={() => setCartOpen(true)}
                className="group relative flex shrink-0 whitespace-nowrap items-center gap-2 rounded-full border border-[#D4A85A]/40 bg-[#23120A] px-5 py-2 text-xs font-black text-[#FAF5EB] shadow-md transition-all duration-300 hover:scale-105 hover:bg-[#D4A85A] hover:text-[#140803] hover:shadow-lg"
              >
                <ShoppingBag size={15} className="shrink-0 text-[#D4A85A] group-hover:text-[#140803] transition-colors" />
                <span>Cart</span>
                {cartCount > 0 && (
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#D4A85A] text-[10px] font-black text-[#140803] shadow-sm group-hover:bg-[#140803] group-hover:text-[#D4A85A]">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Separator */}
              <div className="mx-2 h-5 w-px bg-white/15" />

              {/* Back to Main Site */}
              <Link
                to="/"
                className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold text-white/80 hover:bg-white/10 hover:text-white transition-all duration-300"
              >
                ← Main Site
              </Link>

              {/* Auth */}
              {authUser ? (
                <div className="relative ml-2" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen((p) => !p)}
                    className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#D4A85A]/60 bg-gradient-to-br from-[#D4A85A] to-[#6B3F2A] font-bold text-white text-base shadow-md hover:scale-110 transition-transform duration-200 overflow-hidden select-none relative"
                    title={authUser.name || authUser.email}
                  >
                    {authUser.avatarUrl ? (
                      <img
                        src={authUser.avatarUrl}
                        alt={authUser.name || "User"}
                        className="absolute inset-0 h-full w-full rounded-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      userInitial
                    )}
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-13 mt-2 w-56 rounded-2xl border border-[#D4A85A]/30 bg-[#23120A] shadow-2xl p-3 text-[#FAF5EB]"
                      >
                        <div className="mb-3 border-b border-white/10 pb-3">
                          <p className="text-xs font-black text-[#FAF5EB] truncate">{authUser.name || "Guest"}</p>
                          <p className="text-[10px] text-[#D4A85A] truncate mt-0.5">{authUser.email}</p>
                        </div>
                        {/* My Orders Button */}
                        <button
                          onClick={async () => {
                            setProfileOpen(false);
                            try {
                              const res = await fetch(`${API_BASE}/cafe/orders/my-orders`, { credentials: "include" });
                              const data = await res.json();
                              if (data.success && data.orders?.length) {
                                setActiveTrackerOrder(data.orders[0]);
                                setTrackerOpen(true);
                              } else {
                                setCartOpen(true);
                              }
                            } catch {
                              setCartOpen(true);
                            }
                          }}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-[#FAF5EB] hover:text-[#D4A85A] hover:bg-white/10 transition mb-1"
                        >
                          <Clock size={14} className="text-[#D4A85A]" /> My Orders &amp; Live Status
                        </button>
                        {authUser.role === "admin" && (
                          <Link
                            to="/cafe/admin"
                            onClick={() => setProfileOpen(false)}
                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-[#FAF5EB] hover:text-[#D4A85A] hover:bg-white/10 transition mb-1"
                          >
                            <ShieldCheck size={14} className="text-[#D4A85A]" /> Cafe Admin Panel
                          </Link>
                        )}
                        {authUser.role === "admin" && (
                          <Link
                            to="/admin"
                            onClick={() => setProfileOpen(false)}
                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-[#FAF5EB] hover:text-[#D4A85A] hover:bg-white/10 transition mb-1"
                          >
                            <ShieldCheck size={14} className="text-[#D4A85A]" /> Admin Dashboard
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-bold text-red-400 hover:bg-red-900/30 hover:text-red-300 transition"
                        >
                          <LogOut size={14} /> Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="ml-3 flex items-center gap-2">
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="rounded-full border border-[#6B3F2A]/25 bg-transparent px-4 py-2 text-sm font-semibold text-[#6B3F2A] hover:bg-[#6B3F2A]/8 transition"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="flex items-center gap-1.5 rounded-full bg-[#6B3F2A] px-4 py-2 text-sm font-semibold text-[#FAF5EB] hover:bg-[#A0522D] transition hover:scale-105"
                  >
                    <Sparkles size={13} /> Sign Up
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setOpen(true)}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#D4A85A]/30 bg-white/5 text-[#FAF5EB] transition hover:bg-white/10 lg:hidden"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </motion.nav>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[100] overflow-y-auto bg-[#0D0502]/98 px-4 py-5 backdrop-blur-3xl text-[#FAF5EB] lg:hidden flex flex-col justify-between"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div>
              {/* Header Bar */}
              <div className="flex items-center justify-between rounded-3xl border border-[#D4A85A]/35 bg-[#1F0E07] p-3.5 shadow-2xl">
                <Link to="/cafe" onClick={() => setOpen(false)} className="flex items-center gap-3">
                  <img
                    src="/Cafe_Logo.jpeg"
                    alt="Lekhok Tripura Cafe Logo"
                    className="h-11 w-11 shrink-0 rounded-xl object-contain bg-white p-1 border border-[#D4A85A]/50 shadow-md"
                  />
                  <div>
                    <span className="block text-sm font-black tracking-widest uppercase text-[#FAF5EB] leading-none" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                      Lekhok Tripura
                    </span>
                    <span className="block text-[10px] font-black tracking-[0.25em] uppercase text-[#D4A85A] mt-1">
                      Library Cafe &amp; Studio
                    </span>
                  </div>
                </Link>
                <button
                  onClick={() => setOpen(false)}
                  className="grid h-10 w-10 place-items-center rounded-full border border-[#D4A85A]/30 bg-white/5 text-[#FAF5EB] hover:bg-[#D4A85A] hover:text-[#140803] transition duration-300"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Navigation Links */}
              <motion.div
                className="mt-6 flex flex-col gap-2.5"
                initial="hidden"
                animate="visible"
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}
              >
                {[
                  { label: "Home", to: "/cafe", icon: Coffee, subtitle: "Cafe Welcome Page" },
                  { label: "Full Cafe Menu", to: "/cafe/menu", icon: Sparkles, badge: "Order Online", subtitle: "Artisan Coffee & Gourmet Food" },
                  { label: "Reserve Creative Space", to: "/cafe/reserve", icon: BookOpen, subtitle: "Reader, Writer & Artist Corner" },
                  { label: "Books in Cafe", to: "/cafe/books", icon: BookOpen, subtitle: "In-House Library Collection" },
                  { label: "Updates & Spotlight", to: "/cafe/updates", icon: Bell, subtitle: "Daily Announcements & Events" },
                  { label: "Back to Main Site", to: "/", icon: ExternalLink, subtitle: "E-Books, Bookstore & Rentals" },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.to}
                      variants={{ hidden: { opacity: 0, x: -16 }, visible: { opacity: 1, x: 0 } }}
                    >
                      <NavLink
                        to={item.to}
                        end={item.to === "/cafe"}
                        onClick={() => setOpen(false)}
                        className={({ isActive }) =>
                          `group flex items-center justify-between rounded-2xl border px-4 py-3.5 transition-all duration-300 shadow-lg ${
                            isActive
                              ? "border-[#D4A85A] bg-gradient-to-r from-[#D4A85A]/25 via-[#23120A] to-[#1F0E07] text-[#FAF5EB]"
                              : "border-[#D4A85A]/20 bg-[#1F0E07] text-white/80 hover:border-[#D4A85A]/60 hover:bg-[#2A140B]"
                          }`
                        }
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[#D4A85A]/30 bg-[#140803] text-[#D4A85A]">
                            <Icon size={18} />
                          </div>
                          <div className="text-left">
                            <span className="block text-sm font-black tracking-wide text-[#FAF5EB]">
                              {item.label}
                            </span>
                            <span className="block text-[10px] font-medium text-white/50">
                              {item.subtitle}
                            </span>
                          </div>
                        </div>

                        {item.badge && (
                          <span className="rounded-full bg-[#D4A85A] px-2.5 py-0.5 text-[9px] font-black uppercase text-[#140803] tracking-wider shadow-sm">
                            {item.badge}
                          </span>
                        )}
                      </NavLink>
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* Mobile Cart & Order Quick Bar */}
              <div className="mt-5 grid grid-cols-2 gap-2.5 pt-4 border-t border-[#D4A85A]/20">
                <button
                  onClick={() => { setOpen(false); setCartOpen(true); }}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-[#D4A85A]/40 bg-[#1F0E07] py-3 text-xs font-black text-[#D4A85A] hover:bg-[#D4A85A] hover:text-[#140803] transition shadow-md"
                >
                  <ShoppingBag size={15} /> View Cart ({cartCount})
                </button>

                <button
                  onClick={() => {
                    setOpen(false);
                    const saved = localStorage.getItem("lekhok_cafe_active_order");
                    if (saved) {
                      try {
                        setActiveTrackerOrder(JSON.parse(saved));
                        setTrackerOpen(true);
                      } catch {
                        navigate("/cafe/menu");
                      }
                    } else {
                      navigate("/cafe/menu");
                    }
                  }}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-[#D4A85A]/40 bg-[#1F0E07] py-3 text-xs font-black text-[#FAF5EB] hover:bg-white/10 transition shadow-md"
                >
                  <Clock size={15} className="text-[#D4A85A]" /> Track Order
                </button>
              </div>
            </div>

            {/* User Profile / Auth Bottom Footer in Drawer */}
            <div className="mt-8 pt-4 border-t border-[#D4A85A]/20">
              {authUser ? (
                <div className="flex flex-col gap-3 rounded-2xl border border-[#D4A85A]/35 bg-[#1F0E07] p-4 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 overflow-hidden rounded-full border-2 border-[#D4A85A]/60 bg-gradient-to-br from-[#D4A85A] to-[#6B3F2A] flex items-center justify-center text-white font-bold text-base shrink-0 relative shadow-md">
                        {authUser.avatarUrl ? (
                          <img src={authUser.avatarUrl} alt={authUser.name || "User"} className="absolute inset-0 h-full w-full object-cover rounded-full" referrerPolicy="no-referrer" />
                        ) : userInitial}
                      </div>
                      <div>
                        <p className="text-sm font-black text-[#FAF5EB]">{authUser.name || "Guest User"}</p>
                        <p className="text-[10px] text-white/50 truncate max-w-[180px]">{authUser.email}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => { handleLogout(); setOpen(false); }}
                      className="grid h-9 w-9 place-items-center rounded-full border border-red-500/30 bg-red-950/40 text-red-300 hover:bg-red-900 transition"
                      title="Sign Out"
                    >
                      <LogOut size={16} />
                    </button>
                  </div>

                  {authUser.role === "admin" && (
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#D4A85A]/15">
                      <Link
                        to="/cafe/admin"
                        onClick={() => setOpen(false)}
                        className="flex items-center justify-center gap-1.5 rounded-xl border border-[#D4A85A]/30 bg-[#140803] py-2 text-[11px] font-bold text-[#D4A85A]"
                      >
                        <ShieldCheck size={13} /> Cafe Admin
                      </Link>
                      <Link
                        to="/admin"
                        onClick={() => setOpen(false)}
                        className="flex items-center justify-center gap-1.5 rounded-xl border border-white/20 bg-[#140803] py-2 text-[11px] font-bold text-white/80"
                      >
                        <ShieldCheck size={13} /> Main Admin
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={() => { setShowAuthModal(true); setOpen(false); }}
                    className="flex-1 rounded-2xl border border-[#D4A85A]/40 bg-[#1F0E07] py-3.5 text-xs font-black text-[#D4A85A] hover:bg-white/5 transition shadow-lg"
                  >
                    Login Account
                  </button>
                  <button
                    onClick={() => { setShowAuthModal(true); setOpen(false); }}
                    className="flex-1 rounded-2xl bg-gradient-to-r from-[#D4A85A] to-[#A0522D] py-3.5 text-xs font-black text-[#140803] hover:brightness-110 transition shadow-lg"
                  >
                    Sign Up Free
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth Modal (re-use main site's) */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="rounded-2xl bg-white p-6 shadow-2xl max-w-sm w-full text-center">
            <Coffee size={32} className="mx-auto mb-3 text-[#6B3F2A]" />
            <p className="font-bold text-[#2C1810] mb-1">Login / Register</p>
            <p className="text-xs text-[#2C1810]/60 mb-4">Use the same account as the main Lekhok Tripura site.</p>
            <button onClick={() => setShowAuthModal(false)} className="w-full rounded-xl bg-[#6B3F2A] py-2.5 text-sm font-semibold text-white hover:bg-[#A0522D] transition">Close</button>
          </div>
        </div>
      )}

      {/* Cafe Cart Modal */}
      <CafeCartModal
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        authUser={authUser}
        onOrderPlaced={(order) => {
          setActiveTrackerOrder(order);
          setTrackerOpen(true);
        }}
      />

      {/* Cafe Live Order Tracker Modal */}
      <CafeOrderTrackerModal
        isOpen={trackerOpen}
        onClose={() => setTrackerOpen(false)}
        order={activeTrackerOrder}
      />
    </>
  );
}
