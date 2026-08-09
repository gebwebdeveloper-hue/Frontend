import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BookOpen, CreditCard, Newspaper, Users, UserCheck,
  BookMarked, LogOut, Menu, X, Feather, ChevronRight, ChevronLeft
} from "lucide-react";
import { API_BASE } from "../config.js";

export default function AdminNavbar({ activeTab, onSelectTab, onLogoutSuccess }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const desktopScrollRef = useRef(null);
  const mobileScrollRef = useRef(null);

  const [canScrollDesktopLeft, setCanScrollDesktopLeft] = useState(false);
  const [canScrollDesktopRight, setCanScrollDesktopRight] = useState(false);

  const checkDesktopScroll = () => {
    if (desktopScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = desktopScrollRef.current;
      setCanScrollDesktopLeft(scrollLeft > 5);
      setCanScrollDesktopRight(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    checkDesktopScroll();
    window.addEventListener("resize", checkDesktopScroll);
    return () => window.removeEventListener("resize", checkDesktopScroll);
  }, []);

  const scrollDesktop = (direction) => {
    if (desktopScrollRef.current) {
      const scrollAmount = direction === "left" ? -220 : 220;
      desktopScrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      setTimeout(checkDesktopScroll, 300);
    }
  };

  const handleLogout = async () => {
    if (!confirm("Are you sure you want to log out of Admin Dashboard?")) return;
    try {
      await fetch(`${API_BASE}/auth/logout`, { method: "POST", credentials: "include" });
      if (onLogoutSuccess) {
        onLogoutSuccess();
      } else {
        navigate("/");
      }
    } catch {
      navigate("/");
    }
  };

  const currentPath = location.pathname;

  const navItems = [
    {
      id: "books",
      label: "Manage Books",
      path: "/admin",
      icon: BookOpen,
      isTab: currentPath === "/admin",
    },
    {
      id: "purchases",
      label: "Razorpay Payments",
      path: "/admin/purchases",
      icon: CreditCard,
    },
    {
      id: "news",
      label: "News & Updates",
      path: "/admin/news",
      icon: Newspaper,
    },
    {
      id: "authors",
      label: "Authors",
      path: "/admin",
      icon: Feather,
      isTab: currentPath === "/admin",
    },
    {
      id: "stories",
      label: "Free Stories",
      path: "/admin/stories",
      icon: BookMarked,
    },
    {
      id: "users",
      label: "Manage Users",
      path: "/admin/users",
      icon: Users,
    },
    {
      id: "club",
      label: "Club Members",
      path: "/admin/club",
      icon: UserCheck,
    },
    {
      id: "rentals",
      label: "Book Rentals",
      path: "/admin/rentals",
      icon: BookMarked,
      isRental: true,
    },
    {
      id: "library_cards",
      label: "Library Cards",
      path: "/admin/library-cards",
      icon: CreditCard,
    },
  ];

  const isItemActive = (item) => {
    if (item.isTab && activeTab) {
      return activeTab === item.id;
    }
    return currentPath === item.path;
  };

  const handleItemClick = (item, e) => {
    if (item.isTab && onSelectTab && currentPath === "/admin") {
      e.preventDefault();
      onSelectTab(item.id);
    }
    setMobileMenuOpen(false);
  };

  return (
    <nav className="relative z-30 w-full mb-8">
      {/* DESKTOP & TABLET STRIP */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-white/10 pb-6">
        {/* Left Side Header */}
        <div className="flex items-center justify-between lg:justify-start w-full lg:w-auto">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center h-8 w-8 rounded-xl bg-cyan-400/10 text-cyan-300 font-bold text-xs border border-cyan-400/30">
              LT
            </span>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">ADMIN CONTROL PANEL</span>
              <h2 className="text-lg font-bold text-white leading-none">Navigation</h2>
            </div>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex items-center gap-2 lg:hidden rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-bold text-white hover:bg-white/10 transition cursor-pointer"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            <span>Menu</span>
          </button>
        </div>

        {/* Desktop Horizontal Scrollable Bar */}
        <div className="hidden lg:flex items-center gap-2 min-w-0 max-w-full overflow-hidden">
          {/* Left Arrow Button */}
          {canScrollDesktopLeft && (
            <button
              type="button"
              onClick={() => scrollDesktop("left")}
              className="grid h-8 w-8 place-items-center rounded-xl border border-white/20 bg-zinc-900/90 text-white/80 shadow-lg backdrop-blur hover:bg-white hover:text-black transition shrink-0 z-20 cursor-pointer"
              title="Scroll Left"
            >
              <ChevronLeft size={16} />
            </button>
          )}

          {/* Scrollable Container (Native Scrollbar Hidden) */}
          <div
            ref={desktopScrollRef}
            onScroll={checkDesktopScroll}
            onWheel={(e) => {
              if (e.deltaY !== 0 && desktopScrollRef.current) {
                desktopScrollRef.current.scrollLeft += e.deltaY;
                checkDesktopScroll();
              }
            }}
            className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/5 p-1.5 overflow-x-auto max-w-full shrink min-w-0 scrollbar-none [::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {navItems.map((item) => {
              const active = isItemActive(item);
              const Icon = item.icon;

              if (item.isTab && currentPath === "/admin" && onSelectTab) {
                return (
                  <button
                    key={item.id}
                    onClick={(e) => handleItemClick(item, e)}
                    className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition whitespace-nowrap shrink-0 cursor-pointer ${
                      active
                        ? "bg-white text-black shadow-md"
                        : "text-white/70 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <Icon size={14} className={active ? "text-black" : "text-white/60"} />
                    <span>{item.label}</span>
                  </button>
                );
              }

              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition whitespace-nowrap shrink-0 ${
                    active
                      ? "bg-white text-black shadow-md"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Icon size={14} className={active ? "text-black" : "text-white/60"} />
                  <span>{item.isRental ? "📖 " + item.label : item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Arrow Button */}
          {canScrollDesktopRight && (
            <button
              type="button"
              onClick={() => scrollDesktop("right")}
              className="grid h-8 w-8 place-items-center rounded-xl border border-white/20 bg-zinc-900/90 text-white/80 shadow-lg backdrop-blur hover:bg-white hover:text-black transition shrink-0 z-20 cursor-pointer"
              title="Scroll Right"
            >
              <ChevronRight size={16} />
            </button>
          )}

          {/* Logout Button */}
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-bold text-red-300 hover:bg-red-500/20 hover:border-red-500/50 transition shrink-0 cursor-pointer ml-1"
          >
            <LogOut size={14} />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* MOBILE SCROLLABLE TAB STRIP (< 1024px) */}
      <div className="flex lg:hidden items-center gap-2 overflow-x-auto py-2 scrollbar-none [::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] max-w-full">
        {navItems.map((item) => {
          const active = isItemActive(item);
          const Icon = item.icon;

          if (item.isTab && currentPath === "/admin" && onSelectTab) {
            return (
              <button
                key={item.id}
                onClick={(e) => handleItemClick(item, e)}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition whitespace-nowrap shrink-0 border cursor-pointer ${
                  active
                    ? "bg-white text-black border-white shadow-md font-black"
                    : "border-white/10 bg-white/5 text-white/70 hover:text-white"
                }`}
              >
                <Icon size={13} />
                <span>{item.label}</span>
              </button>
            );
          }

          return (
            <Link
              key={item.id}
              to={item.path}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition whitespace-nowrap shrink-0 border ${
                active
                  ? "bg-white text-black border-white shadow-md font-black"
                  : "border-white/10 bg-white/5 text-white/70 hover:text-white"
              }`}
            >
              <Icon size={13} />
              <span>{item.isRental ? "📖 " + item.label : item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* MOBILE DROPDOWN MENU PANEL */}
      {mobileMenuOpen && (
        <div className="mt-3 lg:hidden rounded-2xl border border-white/15 bg-zinc-950/95 p-4 backdrop-blur-2xl shadow-2xl space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="grid gap-1">
            {navItems.map((item) => {
              const active = isItemActive(item);
              const Icon = item.icon;

              if (item.isTab && currentPath === "/admin" && onSelectTab) {
                return (
                  <button
                    key={item.id}
                    onClick={(e) => handleItemClick(item, e)}
                    className={`flex items-center justify-between rounded-xl px-4 py-3 text-xs font-bold transition cursor-pointer ${
                      active
                        ? "bg-white text-black"
                        : "text-white/80 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon size={16} />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight size={14} className="opacity-50" />
                  </button>
                );
              }

              return (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between rounded-xl px-4 py-3 text-xs font-bold transition ${
                    active
                      ? "bg-white text-black"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={16} />
                    <span>{item.isRental ? "📖 " + item.label : item.label}</span>
                  </div>
                  <ChevronRight size={14} className="opacity-50" />
                </Link>
              );
            })}
          </div>

          <div className="pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs font-bold text-red-300 hover:bg-red-500/20 transition cursor-pointer"
            >
              <LogOut size={16} />
              <span>Log Out of Admin Panel</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
