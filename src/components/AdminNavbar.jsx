import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BookOpen, CreditCard, Newspaper, Users, UserCheck,
  BookMarked, LogOut, Menu, X, Feather, ChevronRight
} from "lucide-react";
import { API_BASE } from "../config.js";

export default function AdminNavbar({ activeTab, onSelectTab, onLogoutSuccess }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navRef = useRef(null);

  const currentPath = location.pathname;

  // Dynamically pad parent container on desktop so page content flows beside left sidebar
  useEffect(() => {
    const parent = navRef.current?.parentElement;
    if (parent) {
      parent.classList.add("lg:pl-72", "xl:pl-80", "transition-all");
    }
    return () => {
      if (parent) {
        parent.classList.remove("lg:pl-72", "xl:pl-80");
      }
    };
  }, []);

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
    <div ref={navRef} className="relative z-30">
      {/* ════════════ DESKTOP LEFT VERTICAL SIDEBAR (lg: and up) ════════════ */}
      <aside className="hidden lg:flex fixed top-24 xl:top-28 left-4 xl:left-8 w-64 xl:w-72 max-h-[calc(100vh-7rem)] xl:max-h-[calc(100vh-8.5rem)] z-30 flex-col bg-zinc-950/95 border border-white/10 rounded-3xl p-4 xl:p-5 shadow-2xl backdrop-blur-2xl">
        {/* Header & Nav Items Container */}
        <div className="flex-1 flex flex-col min-h-0 min-w-0">
          {/* Header Brand */}
          <div className="border-b border-white/10 pb-3 mb-3 shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center justify-center h-8 w-8 rounded-xl bg-gradient-to-br from-cyan-400/20 to-emerald-400/20 text-cyan-300 font-black text-xs border border-cyan-400/40 shadow-glow shrink-0">
                LT
              </span>
              <div className="overflow-hidden">
                <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 block truncate">
                  ADMIN CONTROL PANEL
                </span>
                <h2 className="text-xs font-black text-white leading-none">Navigation</h2>
              </div>
            </div>
          </div>

          {/* Navigation Links - Scrollable Area */}
          <div className="space-y-1 flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/20 hover:scrollbar-thumb-emerald-400/40 scrollbar-track-transparent">
            {navItems.map((item) => {
              const active = isItemActive(item);
              const Icon = item.icon;

              const content = (
                <>
                  <Icon size={15} className={active ? "text-emerald-300 shrink-0" : "text-white/60 shrink-0"} />
                  <span className="font-extrabold text-[11px] tracking-wide truncate">{item.label}</span>
                  <ChevronRight size={13} className={`ml-auto transition-transform shrink-0 ${active ? "text-emerald-400 translate-x-0.5" : "text-white/20"}`} />
                </>
              );

              if (item.isTab && currentPath === "/admin" && onSelectTab) {
                return (
                  <button
                    key={item.id}
                    onClick={(e) => handleItemClick(item, e)}
                    className={`w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs transition-all cursor-pointer ${
                      active
                        ? "bg-gradient-to-r from-emerald-400/20 via-teal-400/10 to-transparent border border-emerald-400/40 text-emerald-300 shadow-md shadow-emerald-400/10 font-black"
                        : "border border-transparent text-white/75 hover:text-white hover:bg-white/5 hover:border-white/10"
                    }`}
                  >
                    {content}
                  </button>
                );
              }

              return (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs transition-all ${
                    active
                      ? "bg-gradient-to-r from-emerald-400/20 via-teal-400/10 to-transparent border border-emerald-400/40 text-emerald-300 shadow-md shadow-emerald-400/10 font-black"
                      : "border border-transparent text-white/75 hover:text-white hover:bg-white/5 hover:border-white/10"
                  }`}
                >
                  {content}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Footer Logout Action - Always Pinned & Visible at Bottom */}
        <div className="pt-3 border-t border-white/10 mt-3 shrink-0">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-xs font-black uppercase tracking-wider text-red-300 hover:bg-red-500/20 hover:border-red-500/50 transition cursor-pointer shadow-lg"
          >
            <LogOut size={14} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* ════════════ MOBILE & TABLET COMPACT TOP BAR (< lg) ════════════ */}
      <div className="flex lg:hidden items-center justify-between rounded-2xl border border-white/10 bg-zinc-950/80 p-3.5 backdrop-blur-xl mb-6 shadow-xl">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center justify-center h-8 w-8 rounded-xl bg-cyan-400/10 text-cyan-300 font-bold text-xs border border-cyan-400/30">
            LT
          </span>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 block">ADMIN CONTROL</span>
            <h2 className="text-xs font-black text-white leading-none">Navigation</h2>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-bold text-white hover:bg-white/10 transition cursor-pointer"
        >
          {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          <span>Menu</span>
        </button>
      </div>

      {/* ════════════ MOBILE SLIDE-OVER LEFT DRAWER ════════════ */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Overlay Backdrop */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Slide-over Drawer Panel */}
          <aside className="fixed top-0 left-0 bottom-0 w-72 max-w-[85vw] bg-zinc-950 border-r border-white/10 p-6 z-50 overflow-y-auto flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-300">
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex items-center justify-center h-9 w-9 rounded-xl bg-cyan-400/10 text-cyan-300 font-bold text-xs border border-cyan-400/30">
                    LT
                  </span>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 block">ADMIN CONTROL</span>
                    <h2 className="text-sm font-black text-white leading-none">Navigation</h2>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white/70 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-1.5">
                {navItems.map((item) => {
                  const active = isItemActive(item);
                  const Icon = item.icon;

                  const content = (
                    <>
                      <Icon size={16} className={active ? "text-emerald-300" : "text-white/60"} />
                      <span className="font-extrabold text-xs">{item.label}</span>
                      <ChevronRight size={14} className="ml-auto opacity-50" />
                    </>
                  );

                  if (item.isTab && currentPath === "/admin" && onSelectTab) {
                    return (
                      <button
                        key={item.id}
                        onClick={(e) => handleItemClick(item, e)}
                        className={`w-full flex items-center gap-3 rounded-2xl px-4 py-3 text-xs transition-all cursor-pointer ${
                          active
                            ? "bg-emerald-400/20 border border-emerald-400/40 text-emerald-300 font-black"
                            : "text-white/75 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {content}
                      </button>
                    );
                  }

                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-xs transition-all ${
                        active
                          ? "bg-emerald-400/20 border border-emerald-400/40 text-emerald-300 font-black"
                          : "text-white/75 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {content}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 mt-6">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs font-black uppercase tracking-wider text-red-300 hover:bg-red-500/20 transition cursor-pointer"
              >
                <LogOut size={16} />
                <span>Log Out</span>
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
