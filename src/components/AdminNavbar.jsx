import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BookOpen, CreditCard, Newspaper, Users, UserCheck,
  BookMarked, LogOut, Menu, X, Feather, ChevronRight,
  PanelLeftClose, PanelLeft, Receipt
} from "lucide-react";
import { API_BASE } from "../config.js";

export default function AdminNavbar({ activeTab, onSelectTab, onLogoutSuccess }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem("admin_sidebar_collapsed") === "true";
  });
  const navRef = useRef(null);

  const currentPath = location.pathname;

  // Toggle collapse state & save preference
  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("admin_sidebar_collapsed", String(next));
      return next;
    });
  };

  // Dynamically pad parent container on desktop based on collapse state
  useEffect(() => {
    const parent = navRef.current?.parentElement;
    if (parent) {
      if (isCollapsed) {
        parent.classList.remove("lg:pl-72", "xl:pl-80");
        parent.classList.add("lg:pl-24", "transition-all", "duration-300");
      } else {
        parent.classList.remove("lg:pl-24");
        parent.classList.add("lg:pl-72", "xl:pl-80", "transition-all", "duration-300");
      }
    }
    return () => {
      if (parent) {
        parent.classList.remove("lg:pl-72", "xl:pl-80", "lg:pl-24");
      }
    };
  }, [isCollapsed]);

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
      id: "newsletter",
      label: "Free Stories",
      path: "/admin",
      icon: BookMarked,
      isTab: true,
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
    {
      id: "invoices",
      label: "Invoices",
      path: "/admin/invoices",
      icon: Receipt,
    },
  ];

  const isItemActive = (item) => {
    if (item.isTab) {
      return currentPath === "/admin" && activeTab === item.id;
    }
    return currentPath === item.path;
  };

  const handleItemClick = (item, e) => {
    if (item.isTab) {
      if (e) e.preventDefault();
      if (currentPath === "/admin" && onSelectTab) {
        onSelectTab(item.id);
      } else {
        navigate("/admin", { state: { tab: item.id } });
      }
    }
    setMobileMenuOpen(false);
  };

  return (
    <div ref={navRef} className="relative z-30">
      {/* ════════════ DESKTOP LEFT VERTICAL SIDEBAR (lg: and up) ════════════ */}
      <aside
        onWheel={(e) => e.stopPropagation()}
        className={`hidden lg:flex fixed top-24 xl:top-28 left-4 xl:left-8 z-30 flex-col bg-zinc-950/95 border border-white/10 rounded-3xl p-3.5 shadow-2xl backdrop-blur-2xl transition-all duration-300 ease-in-out overscroll-y-contain ${
          isCollapsed ? "w-20 max-h-[calc(100vh-7rem)]" : "w-64 xl:w-72 max-h-[calc(100vh-7rem)] xl:max-h-[calc(100vh-8.5rem)] p-4 xl:p-5"
        }`}
      >
        {/* Header & Collapse Toggle */}
        <div className="flex-1 flex flex-col min-h-0 min-w-0">
          <div className="border-b border-white/10 pb-3 mb-3 shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <span className="inline-flex items-center justify-center h-9 w-9 rounded-xl bg-gradient-to-br from-cyan-400/20 to-emerald-400/20 text-cyan-300 font-black text-xs border border-cyan-400/40 shadow-glow shrink-0">
                LT
              </span>
              {!isCollapsed && (
                <div className="overflow-hidden transition-all duration-300">
                  <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 block truncate">
                    ADMIN CONTROL
                  </span>
                  <h2 className="text-xs font-black text-white leading-none truncate">Navigation</h2>
                </div>
              )}
            </div>

            {/* Collapse / Expand Toggle Button */}
            <button
              type="button"
              onClick={toggleCollapse}
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              className="p-1.5 rounded-xl border border-white/10 bg-white/5 text-white/70 hover:text-white hover:bg-white/10 hover:border-white/20 transition cursor-pointer shrink-0 ml-1"
            >
              {isCollapsed ? <PanelLeft size={16} className="text-cyan-300" /> : <PanelLeftClose size={16} />}
            </button>
          </div>

          {/* Navigation Links - Scrollable Area */}
          <div className="space-y-1.5 flex-1 overflow-y-auto overscroll-y-contain pr-0.5 custom-scrollbar">
            {navItems.map((item) => {
              const active = isItemActive(item);
              const Icon = item.icon;

              if (isCollapsed) {
                // Icon-Only Collapsed View with Hover Tooltip
                const collapsedContent = (
                  <div className="group relative flex items-center justify-center">
                    <div
                      className={`grid h-10 w-10 place-items-center rounded-2xl transition-all ${
                        active
                          ? "bg-gradient-to-br from-emerald-400/30 to-teal-400/20 border border-emerald-400/60 text-emerald-300 shadow-md shadow-emerald-400/20 font-black"
                          : "border border-transparent text-white/60 hover:text-white hover:bg-white/10 hover:border-white/15"
                      }`}
                    >
                      <Icon size={18} />
                    </div>

                    {/* Floating Tooltip */}
                    <div className="pointer-events-none absolute left-full ml-3.5 hidden group-hover:flex items-center rounded-xl border border-emerald-400/40 bg-zinc-950 px-3 py-1.5 text-xs font-black text-white shadow-2xl z-50 whitespace-nowrap backdrop-blur-xl">
                      <span className="text-emerald-300 mr-1.5">●</span>
                      {item.label}
                    </div>
                  </div>
                );

                if (item.isTab && currentPath === "/admin" && onSelectTab) {
                  return (
                    <button
                      key={item.id}
                      onClick={(e) => handleItemClick(item, e)}
                      className="w-full flex items-center justify-center py-1 cursor-pointer"
                    >
                      {collapsedContent}
                    </button>
                  );
                }

                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center py-1"
                  >
                    {collapsedContent}
                  </Link>
                );
              }

              // Full Expanded View
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

        {/* Footer Logout Action */}
        <div className="pt-3 border-t border-white/10 mt-3 shrink-0">
          {isCollapsed ? (
            <button
              type="button"
              onClick={handleLogout}
              title="Log Out"
              className="group relative w-full flex items-center justify-center p-2 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20 hover:border-red-500/50 transition cursor-pointer shadow-lg"
            >
              <LogOut size={16} />
              <div className="pointer-events-none absolute left-full ml-3.5 hidden group-hover:flex items-center rounded-xl border border-red-500/40 bg-zinc-950 px-3 py-1.5 text-xs font-black text-red-300 shadow-2xl z-50 whitespace-nowrap">
                Log Out
              </div>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-xs font-black uppercase tracking-wider text-red-300 hover:bg-red-500/20 hover:border-red-500/50 transition cursor-pointer shadow-lg"
            >
              <LogOut size={14} />
              <span>Log Out</span>
            </button>
          )}
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

      {/* ════════════ MOBILE OVERLAY MENU DRAWER ════════════ */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col bg-zinc-950/95 backdrop-blur-2xl p-6 overflow-y-auto">
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center h-10 w-10 rounded-2xl bg-cyan-400/10 text-cyan-300 font-black text-sm border border-cyan-400/30">
                LT
              </span>
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-cyan-400 block">
                  ADMIN CONTROL PANEL
                </span>
                <h2 className="text-sm font-black text-white">Menu Navigation</h2>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl border border-white/15 bg-white/5 p-2 text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-2 flex-1">
            {navItems.map((item) => {
              const active = isItemActive(item);
              const Icon = item.icon;

              const content = (
                <>
                  <Icon size={18} className={active ? "text-cyan-300" : "text-white/60"} />
                  <span className="font-bold text-sm">{item.label}</span>
                  <ChevronRight size={16} className={`ml-auto ${active ? "text-cyan-400" : "text-white/20"}`} />
                </>
              );

              if (item.isTab && currentPath === "/admin" && onSelectTab) {
                return (
                  <button
                    key={item.id}
                    onClick={(e) => handleItemClick(item, e)}
                    className={`w-full flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition ${
                      active
                        ? "bg-cyan-400/15 border border-cyan-400/40 text-cyan-300 font-bold"
                        : "border border-transparent text-white/80 hover:bg-white/5"
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
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition ${
                    active
                      ? "bg-cyan-400/15 border border-cyan-400/40 text-cyan-300 font-bold"
                      : "border border-transparent text-white/80 hover:bg-white/5"
                  }`}
                >
                  {content}
                </Link>
              );
            })}
          </div>

          <div className="pt-6 border-t border-white/10 mt-6">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 py-3.5 text-sm font-bold text-red-300 hover:bg-red-500/20 transition cursor-pointer"
            >
              <LogOut size={16} />
              <span>Log Out of Admin Panel</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
