import { useEffect, useState, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X, Sparkles, LogOut, Facebook, Instagram, Youtube } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import AuthModal from "./AuthModal.jsx";
import { API_BASE } from "../config.js";

const baseLinks = [
  { label: "Library", to: "/library" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [authUser, setAuthUser] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalTab, setAuthModalTab] = useState("login");
  const profileRef = useRef(null);
  const navigate = useNavigate();

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
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    checkSession();

    // Re-check session when the window regains focus (e.g. after OTP in another tab)
    const onFocus = () => checkSession();
    window.addEventListener("focus", onFocus);

    // Also listen for custom "user-logged-in" event dispatched by BookCard after OTP
    const onLogin = () => checkSession();
    window.addEventListener("lekhak:login", onLogin);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("lekhak:login", onLogin);
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
    navigate("/");
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
      <header className="fixed inset-x-0 top-3 z-50 px-3 sm:top-5 sm:px-5">
        <motion.nav
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto max-w-7xl rounded-[1.4rem] sm:rounded-full"
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
          <div className="relative z-10 flex items-center justify-between gap-3 px-4 py-3 sm:px-5 md:px-7 md:py-4">
            {/* Logo */}
            <Link to="/" className="group flex min-w-0 items-center gap-2.5 sm:gap-3">
              <img
                src="/logo.png"
                alt="Lekhak Logo"
                className="h-9 w-9 shrink-0 object-contain transition duration-500 group-hover:rotate-12 group-hover:scale-110 sm:h-11 sm:w-11"
              />
              <div className="min-w-0">
                <h3 className="truncate text-[11px] font-bold uppercase tracking-[0.22em] text-white sm:text-sm sm:tracking-[0.35em]">LEKHAK TRIPURA</h3>
                <p className="truncate text-[11px] text-white/45 sm:text-xs">Premium eBooks</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden items-center gap-2 lg:flex">
              {navLinks.map((link) => (
                <NavLink key={link.to} to={link.to}>
                  {({ isActive }) => (
                    <div
                      className={`relative rounded-full px-5 py-3 text-sm font-medium transition-all duration-300 ${
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
                    className={`flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-all duration-300 ${
                      isActive
                        ? "border-cyan-400/50 bg-cyan-400/10 text-cyan-300"
                        : "border-white/10 bg-white/5 text-white/80 hover:border-white/25 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    Join Our Club
                  </div>
                )}
              </NavLink>

              <NavLink to="/reader">
                {({ isActive }) => (
                  <div
                    className={`relative rounded-full px-5 py-3 text-sm font-medium transition-all duration-300 ${
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

              {/* Social Media Icons */}
              <div className="flex items-center gap-3 border-l border-white/10 pl-4 mr-2">
                <a
                  href="https://www.facebook.com/share/1DLfEnitkJ/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/65 hover:text-cyan-400 transition hover:scale-110"
                  title="Facebook"
                >
                  <Facebook size={16} />
                </a>
                <a
                  href="https://www.instagram.com/lekhok_tripura_publishers?igsh=MTJmMTZjcnVwM3NyeQ=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/65 hover:text-fuchsia-400 transition hover:scale-110"
                  title="Instagram"
                >
                  <Instagram size={16} />
                </a>
                <a
                  href="https://youtube.com/@lekhoktripura?si=1dc97jaclcr8Gzs2"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/65 hover:text-red-500 transition hover:scale-110"
                  title="YouTube"
                >
                  <Youtube size={16} />
                </a>
              </div>

              {/* Profile Avatar or Login/Register CTA */}
              {authUser ? (
                <div className="relative ml-4" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen((p) => !p)}
                    className="group flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-indigo-500 font-bold text-black text-lg shadow-lg hover:scale-110 transition-transform duration-200 select-none"
                    title={authUser.name || authUser.email}
                  >
                    {userInitial}
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-14 w-56 rounded-2xl border border-white/10 bg-black/90 backdrop-blur-xl p-3 shadow-2xl"
                      >
                        <div className="mb-3 border-b border-white/10 pb-3">
                          <p className="text-xs font-semibold text-white truncate">{authUser.name || "Reader"}</p>
                          <p className="text-[10px] text-white/45 truncate">{authUser.email}</p>
                        </div>
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
                    Sign In
                  </button>
                  <button
                    onClick={() => { setAuthModalTab("register"); setShowAuthModal(true); }}
                    className="group flex items-center gap-2 rounded-full bg-white px-5 py-2.5 font-semibold text-black text-sm transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/20"
                  >
                    <Sparkles size={14} /> Register
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
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
          >
            <div className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/[0.04] p-4">
              <div className="flex min-w-0 items-center gap-3">
                <img src="/logo.png" alt="Lekhak Logo" className="h-10 w-10 shrink-0 object-contain" />
                <span className="truncate text-sm font-bold tracking-[0.22em] text-white sm:tracking-[0.25em]">LEKHAK TRIPURA</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/10 text-white transition hover:bg-white/10"
                aria-label="Close navigation menu"
              >
                <X size={20} />
              </button>
            </div>

            <motion.div
              className="mx-auto mt-10 flex max-w-sm flex-col items-stretch gap-4 pb-10 sm:mt-16 sm:max-w-md"
              initial="hidden"
              animate="visible"
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }}
            >
              {[{ label: "Home", to: "/" }, ...navLinks, { label: "Join Our Club", to: "/club" }, { label: "Publish with us", to: "/reader" }].map((item) => (
                <motion.div
                  key={item.to}
                  variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
                >
                  <Link
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className="block rounded-2xl border border-white/10 bg-white/[0.035] px-5 py-4 text-center text-3xl font-black uppercase tracking-tight text-white transition hover:border-cyan-300/30 hover:bg-white/[0.07] hover:text-cyan-300 sm:text-5xl"
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}

              {authUser ? (
                <motion.div
                  variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
                  className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-5"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-indigo-500 text-2xl font-black text-black">
                    {userInitial}
                  </div>
                  <p className="text-white/60 text-sm">{authUser.name || authUser.email}</p>
                  <button
                    onClick={() => { handleLogout(); setOpen(false); }}
                    className="flex items-center gap-2 rounded-full border border-red-500/30 px-6 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 transition"
                  >
                    <LogOut size={15} /> Sign Out
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
                  className="mt-2 flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-5"
                >
                  <button
                    onClick={() => { setAuthModalTab("login"); setShowAuthModal(true); setOpen(false); }}
                    className="w-48 rounded-full border border-white/15 bg-white/5 py-3.5 text-base font-semibold text-white hover:bg-white/10 transition"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => { setAuthModalTab("register"); setShowAuthModal(true); setOpen(false); }}
                    className="w-48 rounded-full bg-white py-3.5 text-base font-semibold text-black transition hover:scale-105"
                  >
                    Register
                  </button>
                </motion.div>
              )}

              {/* Mobile Social Links */}
              <motion.div
                variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
                className="mt-4 flex items-center justify-center gap-6"
              >
                <a
                  href="https://www.facebook.com/share/1DLfEnitkJ/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/65 hover:text-cyan-400 transition hover:scale-110"
                  title="Facebook"
                >
                  <Facebook size={22} />
                </a>
                <a
                  href="https://www.instagram.com/lekhok_tripura_publishers?igsh=MTJmMTZjcnVwM3NyeQ=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/65 hover:text-fuchsia-400 transition hover:scale-110"
                  title="Instagram"
                >
                  <Instagram size={22} />
                </a>
                <a
                  href="https://youtube.com/@lekhoktripura?si=1dc97jaclcr8Gzs2"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/65 hover:text-red-500 transition hover:scale-110"
                  title="YouTube"
                >
                  <Youtube size={22} />
                </a>
              </motion.div>
            </motion.div>
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
    </>
  );
}



