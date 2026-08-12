import { useEffect, useState, useRef } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, Sparkles, LogOut, Facebook, Instagram, Youtube, ShieldCheck, ShoppingCart, PackageCheck, User, Coffee, BookOpen, ShoppingBag, Feather, Bell, Users, PenTool } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import AuthModal from "./AuthModal.jsx";
import CartModal from "./CartModal.jsx";
import MyOrdersModal from "./MyOrdersModal.jsx";
import EditProfileModal from "./EditProfileModal.jsx";
import { getCart, clearCart } from "../utils/cart.js";
import { API_BASE } from "../config.js";

const baseLinks = [
  { label: "Buy Books", to: "/library" },
  { label: "Book Rent", to: "/rentals" },
  { label: "Read Stories", to: "/short-stories" },
  { label: "News & Updates", to: "/news" },
  { label: "About Us", to: "/about-us" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [authUser, setAuthUser] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalTab, setAuthModalTab] = useState("login");
  const [cartOpen, setCartOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const profileRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const updateCartCount = () => {
    setCartCount(getCart().length);
  };

  useEffect(() => {
    updateCartCount();
    const handleOpenCart = () => {
      if (authUser) {
        setCartOpen(true);
      } else {
        setAuthModalTab("login");
        setShowAuthModal(true);
      }
    };
    window.addEventListener("lekhak:cart-updated", updateCartCount);
    window.addEventListener("lekhak:open-cart", handleOpenCart);
    return () => {
      window.removeEventListener("lekhak:cart-updated", updateCartCount);
      window.removeEventListener("lekhak:open-cart", handleOpenCart);
    };
  }, [authUser]);

  const checkSession = () => {
    fetch(`${API_BASE}/auth/me`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success && data.user) {
          setAuthUser(data.user);
        } else {
          setAuthUser(false);
        }
      })
      .catch(() => setAuthUser(false));
  };

  useEffect(() => {
    checkSession();
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    checkSession();

    // Re-check session when the window regains focus
    const onFocus = () => checkSession();
    window.addEventListener("focus", onFocus);

    // Listen for custom login/logout events
    const onLogin = () => checkSession();
    window.addEventListener("lekhak:login", onLogin);
    window.addEventListener("lekhak:logout", onLogin);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("lekhak:login", onLogin);
      window.removeEventListener("lekhak:logout", onLogin);
    };
  }, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const onClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const handleLogout = async () => {
    await fetch(`${API_BASE}/auth/logout`, { method: "POST", credentials: "include" }).catch(() => {});
    setAuthUser(false);
    setProfileOpen(false);
    clearCart();
    window.dispatchEvent(new Event("lekhak:logout"));
    navigate("/");
  };

  const handleLogoClick = (e) => {
    if (window.location.pathname === "/") {
      e.preventDefault();
      if (window.lenis) {
        window.lenis.scrollTo(0);
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const navLinks = authUser?.role === "admin"
    ? [...baseLinks, { label: "Admin", to: "/admin" }]
    : baseLinks;

  const userInitial = authUser?.name
    ? authUser.name.trim().charAt(0).toUpperCase()
    : authUser?.email
    ? authUser.email.charAt(0).toUpperCase()
    : "";

  return (
    <>
      <header className="fixed inset-x-0 top-3 z-50 px-2 sm:top-5 sm:px-6">
        <motion.nav
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto max-w-[96rem] rounded-[1.4rem] sm:rounded-full"
        >
          {/* Animated Border */}
          <div className="animated-nav-border absolute inset-0 rounded-[inherit]" />

          {/* Glass Background */}
          <div
            className={`absolute inset-[1.2px] rounded-[inherit] transition-all duration-500 ${
              scrolled ? "bg-black/70 backdrop-blur-2xl" : "bg-black/35 backdrop-blur-xl"
            }`}
          />

          {/* Navbar Content */}
          <div className="relative z-10 flex items-center justify-between gap-3 px-4 py-3 sm:px-6 md:px-8 md:py-4">
            {/* Logo */}
            <Link to="/" onClick={handleLogoClick} className="group flex shrink-0 items-center gap-2.5 sm:gap-3">
              <img
                src="/logo.png"
                alt="Lekhok Logo"
                className="h-9 w-9 shrink-0 object-contain transition duration-500 group-hover:rotate-12 group-hover:scale-110 sm:h-11 sm:w-11"
              />
              <div className="shrink-0">
                <h3 className="whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.15em] text-white sm:text-sm sm:tracking-[0.25em]">LEKHOK TRIPURA</h3>
                <p className="truncate text-[10px] text-cyan-300/80 font-medium tracking-wide sm:text-xs">Publish Books & Read Unlimited Books</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden items-center gap-1.5 xl:gap-2.5 lg:flex">
              {navLinks.map((link) => (
                <NavLink key={link.to} to={link.to}>
                  {({ isActive }) => (
                    <div
                      className={`relative rounded-full px-3.5 py-2.5 text-xs xl:text-sm font-medium transition-all duration-300 ${
                        isActive ? "text-white" : "text-white/65 hover:text-white"
                      }`}
                    >
                      {link.label}
                      {isActive && (
                        <motion.div
                          layoutId="nav-pill"
                          className="absolute inset-0 -z-10 rounded-full bg-white/10"
                          transition={{ type: "spring", stiffness: 350, damping: 28 }}
                        />
                      )}
                    </div>
                  )}
                </NavLink>
              ))}

              <NavLink to="/club">
                {({ isActive }) => (
                  <div
                    className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs xl:text-sm font-semibold transition-all duration-300 ${
                      isActive
                        ? "border-cyan-400/50 bg-cyan-400/10 text-cyan-300"
                        : "border-white/10 bg-white/5 text-white/80 hover:border-white/25 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    Join Club
                  </div>
                )}
              </NavLink>

              <NavLink to="/reader">
                {({ isActive }) => (
                  <div
                    className={`relative rounded-full px-3.5 py-2.5 text-xs xl:text-sm font-medium transition-all duration-300 ${
                      isActive ? "text-white" : "text-white/65 hover:text-white"
                    }`}
                  >
                    Publish with us
                    {isActive && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute inset-0 -z-10 rounded-full bg-white/10"
                        transition={{ type: "spring", stiffness: 350, damping: 28 }}
                      />
                    )}
                  </div>
                )}
              </NavLink>

              <NavLink to="/cafe">
                {({ isActive }) => (
                  <div
                    className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs xl:text-sm font-semibold transition-all duration-300 ${
                      isActive
                        ? "border-amber-400/50 bg-amber-400/10 text-amber-300"
                        : "border-amber-500/25 bg-amber-500/10 text-amber-200 hover:border-amber-400/40 hover:bg-amber-500/20"
                    }`}
                  >
                    <Coffee size={14} className="text-amber-400" />
                    <span>Cafe</span>
                  </div>
                )}
              </NavLink>

              {/* Shopping Cart Button (Only for logged in users) */}
              {authUser && (
                <button
                  type="button"
                  onClick={() => setCartOpen(true)}
                  className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 transition hover:bg-white/10 hover:text-cyan-300 ml-2 shrink-0"
                  title="My Shopping Cart"
                >
                  <ShoppingCart size={18} />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-cyan-400 font-extrabold text-[10px] text-black shadow-glow">
                      {cartCount}
                    </span>
                  )}
                </button>
              )}

              {/* Profile Avatar or Login/Register CTA */}
              {authUser ? (
                <div className="relative ml-4" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen((p) => !p)}
                    className="group relative flex h-11 w-11 items-center justify-center rounded-full border border-cyan-400/40 bg-gradient-to-br from-cyan-400 to-indigo-500 font-bold text-black text-lg shadow-lg hover:scale-110 transition-transform duration-200 overflow-hidden select-none"
                    title={authUser.name || authUser.email}
                  >
                    {authUser.avatarUrl ? (
                      <img
                        src={authUser.avatarUrl}
                        alt={authUser.name || "User Avatar"}
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
                        className="absolute right-0 top-14 w-60 rounded-2xl border border-white/10 bg-black/90 backdrop-blur-xl p-3 shadow-2xl"
                      >
                        <div className="mb-3 border-b border-white/10 pb-3">
                          <div className="flex items-center justify-between gap-1">
                            <p className="text-xs font-semibold text-white truncate">{authUser.name || "Reader"}</p>
                            {authUser.role === "admin" && (
                              <span className="rounded bg-cyan-400/20 px-1.5 py-0.5 text-[9px] font-black uppercase text-cyan-300 border border-cyan-400/30 shrink-0">
                                Admin
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-white/45 truncate mt-0.5">{authUser.email}</p>
                        </div>

                        {authUser.role === "admin" && (
                          <Link
                            to="/admin"
                            onClick={() => setProfileOpen(false)}
                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/10 transition mb-1"
                          >
                            <ShieldCheck size={14} />
                            Admin Dashboard
                          </Link>
                        )}

                        <button
                          onClick={() => {
                            setProfileOpen(false);
                            setShowEditProfile(true);
                          }}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-medium text-white/80 hover:bg-white/10 hover:text-white transition mb-1"
                        >
                          <User size={14} className="text-cyan-400" />
                          <span>Edit Profile & Photo</span>
                          {!authUser.phone && (
                            <span className="ml-auto rounded-full bg-amber-400/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-300 border border-amber-400/30">
                              No phone
                            </span>
                          )}
                        </button>

                        <button
                          onClick={() => {
                            setProfileOpen(false);
                            setOrdersOpen(true);
                          }}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-medium text-white/80 hover:bg-white/10 hover:text-white transition mb-1"
                        >
                          <PackageCheck size={14} className="text-cyan-400" />
                          My Orders & Status
                        </button>

                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-medium text-red-400 hover:bg-red-500/10 transition"
                        >
                          <LogOut size={14} />
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="ml-4 flex items-center gap-2">
                  <button
                    onClick={() => { setAuthModalTab("login"); setShowAuthModal(true); }}
                    className="rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => { setAuthModalTab("register"); setShowAuthModal(true); }}
                    className="group flex items-center gap-2 rounded-full bg-white px-5 py-2.5 font-semibold text-black text-sm transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/20"
                  >
                    <Sparkles size={14} /> Sign In
                  </button>
                </div>
              )}
            </div>            {/* Mobile Menu Button */}
            <button
              onClick={() => setOpen(true)}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/10 sm:h-11 sm:w-11 lg:hidden"
              aria-label="Open navigation menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </motion.nav>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[100] overflow-y-auto bg-black/95 px-4 py-4 backdrop-blur-2xl lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/[0.04] p-4">
              <div className="flex min-w-0 items-center gap-3">
                <img src="/logo.png" alt="Lekhok Logo" className="h-10 w-10 shrink-0 object-contain" />
                <span className="truncate text-sm font-bold tracking-[0.22em] text-white sm:tracking-[0.25em]">LEKHOK TRIPURA</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/10 text-white transition hover:bg-white/10"
                aria-label="Close navigation menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Mobile Drawer Body */}
            <div className="flex-1 overflow-y-auto pt-4 pb-8">
              <motion.div
                className="mx-auto flex max-w-sm flex-col gap-2.5"
                initial="hidden"
                animate="visible"
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}
              >
                {[
                  { label: "Home", to: "/", icon: BookOpen, subtitle: "E-Books & Literature Hub" },
                  { label: "Buy Books", to: "/library", icon: ShoppingBag, subtitle: "Digital & Physical Book Store" },
                  { label: "Book Rental Club", to: "/rentals", icon: Sparkles, subtitle: "Unlimited Reading Memberships" },
                  { label: "Read Stories", to: "/short-stories", icon: Feather, subtitle: "Free Short Stories & Articles" },
                  { label: "News & Updates", to: "/news", icon: Bell, subtitle: "Literary News & Announcements" },
                  { label: "Join VIP Club", to: "/club", icon: Users, subtitle: "Exclusive Membership Perks" },
                  { label: "Publish With Us", to: "/reader", icon: PenTool, subtitle: "Author Portal & Book Publishing" },
                  {
                    label: "Lekhok Tripura Cafe",
                    to: "/cafe",
                    icon: Coffee,
                    badge: "Literary Cafe",
                    isCafe: true,
                    subtitle: "Artisan Coffee, Food & Space Booking",
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.to}
                      variants={{ hidden: { opacity: 0, x: -16 }, visible: { opacity: 1, x: 0 } }}
                    >
                      <NavLink
                        to={item.to}
                        end={item.to === "/"}
                        onClick={() => setOpen(false)}
                        className={({ isActive }) =>
                          `group flex items-center justify-between rounded-2xl border px-4 py-3.5 transition-all duration-300 shadow-lg ${
                            item.isCafe
                              ? "border-[#D4A85A]/60 bg-gradient-to-r from-[#D4A85A]/20 via-[#23120A] to-[#1A0C06] text-[#FAF5EB] hover:border-[#D4A85A]"
                              : isActive
                              ? "border-cyan-400/50 bg-gradient-to-r from-cyan-500/20 via-zinc-900 to-zinc-950 text-white"
                              : "border-white/10 bg-white/[0.03] text-white/80 hover:border-cyan-400/40 hover:bg-white/[0.07] hover:text-white"
                          }`
                        }
                      >
                        <div className="flex items-center gap-3.5">
                          <div
                            className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border ${
                              item.isCafe
                                ? "border-[#D4A85A]/40 bg-[#140803] text-[#D4A85A]"
                                : "border-cyan-400/30 bg-cyan-500/10 text-cyan-300"
                            }`}
                          >
                            <Icon size={18} />
                          </div>
                          <div className="text-left">
                            <span className="block text-sm font-black tracking-wide text-white">
                              {item.label}
                            </span>
                            <span className="block text-[10px] font-medium text-white/50">
                              {item.subtitle}
                            </span>
                          </div>
                        </div>

                        {item.badge && (
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider shadow-sm ${
                              item.isCafe
                                ? "bg-[#D4A85A] text-[#140803]"
                                : "bg-cyan-400 text-black"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </NavLink>
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* Cart & Orders Quick Action */}
              <div className="mt-5 mx-auto max-w-sm grid grid-cols-2 gap-2.5 pt-4 border-t border-white/10">
                <button
                  onClick={() => { setOpen(false); setCartOpen(true); }}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-cyan-400/30 bg-cyan-500/10 py-3 text-xs font-black text-cyan-300 hover:bg-cyan-400/20 transition shadow-md"
                >
                  <ShoppingCart size={15} /> Cart ({cartCount})
                </button>

                <button
                  onClick={() => {
                    setOpen(false);
                    if (authUser) {
                      setOrdersOpen(true);
                    } else {
                      setAuthModalTab("login");
                      setShowAuthModal(true);
                    }
                  }}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 py-3 text-xs font-black text-white hover:bg-white/10 transition shadow-md"
                >
                  <PackageCheck size={15} className="text-cyan-400" /> My Orders
                </button>
              </div>

              {/* User Account / Auth Section */}
              <div className="mt-6 mx-auto max-w-sm pt-4 border-t border-white/10">
                {authUser ? (
                  <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 overflow-hidden rounded-full border-2 border-cyan-400/40 bg-gradient-to-br from-cyan-400 to-indigo-500 flex items-center justify-center text-black font-black text-base shrink-0 relative shadow-md">
                          {authUser.avatarUrl ? (
                            <img src={authUser.avatarUrl} alt={authUser.name || "User"} className="absolute inset-0 h-full w-full object-cover rounded-full" referrerPolicy="no-referrer" />
                          ) : userInitial}
                        </div>
                        <div>
                          <p className="text-sm font-black text-white">{authUser.name || "Reader"}</p>
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

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                      <button
                        onClick={() => { setOpen(false); setShowEditProfile(true); }}
                        className="flex items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/5 py-2 text-[11px] font-bold text-white/80 hover:bg-white/10"
                      >
                        <User size={13} className="text-cyan-400" /> Edit Profile
                      </button>
                      {authUser.role === "admin" && (
                        <Link
                          to="/admin"
                          onClick={() => setOpen(false)}
                          className="flex items-center justify-center gap-1.5 rounded-xl border border-cyan-400/30 bg-cyan-400/10 py-2 text-[11px] font-bold text-cyan-300"
                        >
                          <ShieldCheck size={13} /> Admin Panel
                        </Link>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={() => { setAuthModalTab("login"); setShowAuthModal(true); setOpen(false); }}
                      className="flex-1 rounded-2xl border border-white/15 bg-white/5 py-3.5 text-xs font-black text-white hover:bg-white/10 transition shadow-lg"
                    >
                      Login Account
                    </button>
                    <button
                      onClick={() => { setAuthModalTab("register"); setShowAuthModal(true); setOpen(false); }}
                      className="flex-1 rounded-2xl bg-white py-3.5 text-xs font-black text-black hover:bg-white/90 transition shadow-lg"
                    >
                      Sign In Free
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          initialTab={authModalTab}
          onClose={(user) => {
            setShowAuthModal(false);
            if (user) checkSession();
          }}
        />
      )}

      {/* Cart Modal */}
      <CartModal isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      {/* My Orders / Approval Status Modal */}
      <MyOrdersModal isOpen={ordersOpen} onClose={() => setOrdersOpen(false)} />

      {/* Edit Profile & Photo Modal */}
      {showEditProfile && authUser && (
        <EditProfileModal
          user={authUser}
          onClose={() => setShowEditProfile(false)}
          onUpdated={() => checkSession()}
        />
      )}
    </>
  );
}



