import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X, Coffee, ShieldCheck, LogOut, User, Sparkles, ShoppingBag, Clock, Bell, BookOpen, Palette } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { API_BASE } from "../config.js";
import { clearCart } from "../utils/cart.js";
import { getCafeCart } from "./utils/cafeCart.js";
import CafeCartModal from "./components/CafeCartModal.jsx";
import CafeOrderTrackerModal from "./components/CafeOrderTrackerModal.jsx";

const cafeLinks = [
  { label: "Menu", to: "/cafe/menu" },
  { label: "Readers & Writers Space", to: "/cafe/reserve" },
  { label: "Artist Space", to: "/cafe/artist-space" },
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
                src="/Web.jpeg"
                alt="Lekhok Tripura Cafe Logo"
                className="h-10 w-10 sm:h-12 sm:w-12 shrink-0 rounded-full object-cover shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-[#D4A85A]/40"
              />
              <div className="shrink-0">
                <h1 className="whitespace-nowrap text-[11px] sm:text-sm font-black uppercase tracking-[0.18em] text-[#FAF5EB]">
                  Lekhok Tripura
                </h1>
                <p className="text-[10px] sm:text-xs font-semibold tracking-widest text-[#D4A85A]">
                  CAFE
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

              {/* Readers & Writers Space Link */}
              <NavLink to="/cafe/reserve">
                {({ isActive }) => (
                  <div
                    className={`relative flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition-all duration-300 ${
                      isActive
                        ? "text-[#D4A85A]"
                        : "text-white/80 hover:text-[#D4A85A]"
                    }`}
                  >
                    <span>Readers &amp; Writers Space</span>
                    <BookOpen size={16} className="text-[#D4A85A]" />
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

              {/* Artist Space Link */}
              <NavLink to="/cafe/artist-space">
                {({ isActive }) => (
                  <div
                    className={`relative flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition-all duration-300 ${
                      isActive
                        ? "text-[#D4A85A]"
                        : "text-white/80 hover:text-[#D4A85A]"
                    }`}
                  >
                    <span>Artist Space</span>
                    <Palette size={16} className="text-[#D4A85A]" />
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
            className="fixed inset-0 z-[100] overflow-y-auto bg-[#140803]/98 px-4 py-4 backdrop-blur-2xl text-[#FAF5EB] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex items-center justify-between rounded-2xl border border-[#D4A85A]/30 bg-[#23120A] p-4">
              <div className="flex items-center gap-3">
                <img
                  src="/Web.jpeg"
                  alt="Lekhok Tripura Cafe Logo"
                  className="h-10 w-10 shrink-0 rounded-full object-cover shadow-md"
                />
                <div>
                  <span className="text-sm font-black tracking-widest text-[#FAF5EB]">CAFE</span>
                  <p className="text-[10px] text-[#D4A85A] font-semibold tracking-wider">Lekhok Tripura</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-full border border-white/20 text-white hover:bg-white/10 transition"
              >
                <X size={20} />
              </button>
            </div>

            <motion.div
              className="mx-auto mt-6 flex max-w-sm flex-col gap-3 pb-10"
              initial="hidden"
              animate="visible"
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
            >
              {[{ label: "Home", to: "/cafe" }, { label: "Menu", to: "/cafe/menu" }, { label: "Readers & Writers Space 📚", to: "/cafe/reserve" }, { label: "← Back to Main Site", to: "/" }].map((item) => (
                <motion.div
                  key={item.to}
                  variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
                >
                  <Link
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className="block rounded-2xl border border-[#D4A85A]/25 bg-[#23120A] px-5 py-3.5 text-center text-xl font-black text-[#FAF5EB] transition hover:border-[#D4A85A] hover:bg-[#D4A85A] hover:text-[#140803]"
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}

              {/* Auth section in mobile */}
              {authUser ? (
                <motion.div
                  variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
                  className="flex flex-col gap-2.5 rounded-2xl border border-[#D4A85A]/30 bg-[#23120A] p-4 mt-2"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 overflow-hidden rounded-full border-2 border-[#D4A85A]/50 bg-gradient-to-br from-[#D4A85A] to-[#6B3F2A] flex items-center justify-center text-white font-bold text-base shrink-0 relative">
                      {authUser.avatarUrl ? (
                        <img src={authUser.avatarUrl} alt={authUser.name || "User"} className="absolute inset-0 h-full w-full object-cover rounded-full" referrerPolicy="no-referrer" />
                      ) : userInitial}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#FAF5EB]">{authUser.name || "Guest"}</p>
                      <p className="text-[10px] text-white/50 truncate">{authUser.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { handleLogout(); setOpen(false); }}
                    className="flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-900/40 px-4 py-2.5 text-xs font-semibold text-red-200 hover:bg-red-900/60 transition"
                  >
                    <LogOut size={14} /> Sign Out
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
                  className="flex gap-3 mt-2"
                >
                  <button
                    onClick={() => { setShowAuthModal(true); setOpen(false); }}
                    className="flex-1 rounded-xl border border-[#D4A85A]/30 bg-[#23120A] py-3 text-sm font-bold text-[#D4A85A] hover:bg-white/5 transition"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => { setShowAuthModal(true); setOpen(false); }}
                    className="flex-1 rounded-xl bg-[#D4A85A] py-3 text-sm font-black text-[#140803] hover:bg-white transition"
                  >
                    Sign Up
                  </button>
                </motion.div>
              )}
            </motion.div>
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
