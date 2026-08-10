import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Coffee, Plus, Pencil, Trash2, X, Check, AlertTriangle,
  LayoutGrid, ChevronDown, Star, Eye, EyeOff, LogOut,
  ArrowLeft, Search, Filter, Image, Tag, DollarSign,
  Clock, FileText, ToggleLeft, ToggleRight, Loader2, ShieldAlert,
  UploadCloud, ShoppingBag, Bell, UtensilsCrossed, CheckCircle2,
  UserCheck, RefreshCw, Phone, Mail,
} from "lucide-react";
import { API_BASE } from "../../config.js";

/* ── Constants ─────────────────────────────────────────────────── */
const CATEGORIES = [
  { id: "all",         label: "All Items" },
  { id: "coffee",      label: "Coffee"      },
  { id: "tea",         label: "Tea & Herbal" },
  { id: "cold-drinks", label: "Cold Drinks"  },
  { id: "snacks",      label: "Snacks"       },
  { id: "meals",       label: "Meals"        },
  { id: "desserts",    label: "Desserts"     },
  { id: "others",      label: "Others"       },
];

const CAT_COLORS = {
  coffee: "#6B3F2A", tea: "#4A7C59", "cold-drinks": "#2A6B8B",
  snacks: "#8B6A2A", meals: "#7A3B4B", desserts: "#8B2A5E", others: "#555",
};

const EMPTY_FORM = {
  name: "", description: "", price: "", category: "coffee",
  imageUrl: "", available: true, featured: false, preparationTime: 10, tags: "",
};

/* ── Small helpers ─────────────────────────────────────────────── */
function Badge({ children, color }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-white"
      style={{ background: color || "#6B3F2A" }}
    >
      {children}
    </span>
  );
}

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-[#D4A85A]/20 bg-white p-5 shadow-sm">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl" style={{ background: `${color}15` }}>
        <Icon size={22} style={{ color }} />
      </div>
      <div>
        <p className="text-2xl font-black" style={{ color: "#2C1810" }}>{value}</p>
        <p className="text-xs font-medium" style={{ color: "#2C1810", opacity: 0.5 }}>{label}</p>
      </div>
    </div>
  );
}

/* ── Main Component ─────────────────────────────────────────────── */
export default function CafeAdminPage() {
  const navigate = useNavigate();
  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null); // null = adding new
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [mainTab, setMainTab] = useState("menu"); // "menu" | "orders" | "space"
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const [spaceBookings, setSpaceBookings] = useState([]);
  const [spaceLoading, setSpaceLoading] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState(null); // item to delete
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);

  /* ── Lock body & Lenis scroll when modal or delete confirm is open ── */
  useEffect(() => {
    if (modalOpen || deleteConfirm) {
      document.body.style.overflow = "hidden";
      if (window.lenis) window.lenis.stop();
    } else {
      document.body.style.overflow = "";
      if (window.lenis) window.lenis.start();
    }
    return () => {
      document.body.style.overflow = "";
      if (window.lenis) window.lenis.start();
    };
  }, [modalOpen, deleteConfirm]);

  /* ── Auth check ─────────────────────────────────────────────── */
  useEffect(() => {
    fetch(`${API_BASE}/auth/me`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.success && d.user?.role === "admin") {
          setAuthUser(d.user);
        } else {
          setAuthUser(false);
        }
      })
      .catch(() => setAuthUser(false))
      .finally(() => setAuthLoading(false));
  }, []);

  /* ── Fetch all menu items (admin view) ──────────────────────── */
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/cafe/menu/all`, { credentials: "include" });
      const data = await res.json();
      if (data.success && data.items) {
        setItems(data.items);
      } else {
        const fallbackRes = await fetch(`${API_BASE}/cafe/menu`);
        const fallbackData = await fallbackRes.json();
        if (fallbackData.success) setItems(fallbackData.items);
      }
    } catch {
      try {
        const fallbackRes = await fetch(`${API_BASE}/cafe/menu`);
        const fallbackData = await fallbackRes.json();
        if (fallbackData.success) setItems(fallbackData.items);
      } catch {
        showToast("Failed to fetch menu items", "error");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  /* ── Fetch orders ───────────────────────────────────────────── */
  const fetchAdminOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const res = await fetch(`${API_BASE}/cafe/orders/admin/all`, { credentials: "include" });
      const data = await res.json();
      if (data.success) setOrders(data.orders);
    } catch {
      showToast("Failed to fetch orders", "error");
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    if (mainTab === "orders") {
      fetchAdminOrders();
      const interval = setInterval(fetchAdminOrders, 5000);
      return () => clearInterval(interval);
    }
  }, [mainTab, fetchAdminOrders]);

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    try {
      const res = await fetch(`${API_BASE}/cafe/orders/admin/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      showToast(data.message);
      fetchAdminOrders();
    } catch (err) {
      showToast(err.message || "Failed to update order status", "error");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  /* ── Fetch space bookings ───────────────────────────────────── */
  const fetchAdminSpaceBookings = useCallback(async () => {
    setSpaceLoading(true);
    try {
      const res = await fetch(`${API_BASE}/cafe/space/admin/all`, { credentials: "include" });
      const data = await res.json();
      if (data.success) setSpaceBookings(data.bookings);
    } catch {
      showToast("Failed to fetch space bookings", "error");
    } finally {
      setSpaceLoading(false);
    }
  }, []);

  /* ── Toast ──────────────────────────────────────────────────── */
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── Derived data ───────────────────────────────────────────── */
  const filtered = items.filter((item) => {
    const matchCat = activeCategory === "all" || item.category === activeCategory;
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const stats = {
    total: items.length,
    available: items.filter((i) => i.available).length,
    featured: items.filter((i) => i.featured).length,
    categories: [...new Set(items.map((i) => i.category))].length,
  };

  /* ── Modal helpers ──────────────────────────────────────────── */
  const openAdd = () => {
    setEditItem(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      name: item.name,
      description: item.description || "",
      price: String(item.price),
      category: item.category,
      imageUrl: item.imageUrl || "",
      available: item.available,
      featured: item.featured,
      preparationTime: item.preparationTime || 10,
      tags: (item.tags || []).join(", "),
    });
    setFormError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditItem(null);
    setFormError("");
  };

  const handleFormChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  /* ── Save (add / edit) ──────────────────────────────────────── */
  const handleSave = async () => {
    if (!form.name.trim()) return setFormError("Item name is required.");
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) < 0)
      return setFormError("Enter a valid price.");
    if (!form.category) return setFormError("Select a category.");

    setSaving(true);
    setFormError("");

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      category: form.category,
      imageUrl: form.imageUrl.trim(),
      available: form.available,
      featured: form.featured,
      preparationTime: Number(form.preparationTime) || 10,
      tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
    };

    try {
      const url = editItem
        ? `${API_BASE}/cafe/menu/${editItem._id}`
        : `${API_BASE}/cafe/menu`;
      const method = editItem ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed to save.");
      showToast(editItem ? "Item updated!" : "Item added to menu!");
      setModalOpen(false);
      fetchItems();
    } catch (err) {
      setFormError(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  /* ── Quick toggle (available / featured) ────────────────────── */
  const quickToggle = async (item, field) => {
    try {
      const res = await fetch(`${API_BASE}/cafe/menu/${item._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ [field]: !item[field] }),
      });
      const data = await res.json();
      if (!data.success) throw new Error();
      setItems((prev) =>
        prev.map((i) => (i._id === item._id ? { ...i, [field]: !item[field] } : i))
      );
    } catch {
      showToast("Toggle failed", "error");
    }
  };

  /* ── Delete ─────────────────────────────────────────────────── */
  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await fetch(`${API_BASE}/cafe/menu/${deleteConfirm._id}`, {
        method: "DELETE",
        credentials: "include",
      });
      setItems((prev) => prev.filter((i) => i._id !== deleteConfirm._id));
      showToast("Item deleted.");
      setDeleteConfirm(null);
    } catch {
      showToast("Delete failed", "error");
    } finally {
      setDeleting(false);
    }
  };

  /* ── Logout ─────────────────────────────────────────────────── */
  const handleLogout = async () => {
    await fetch(`${API_BASE}/auth/logout`, { method: "POST", credentials: "include" }).catch(() => {});
    navigate("/cafe");
  };

  /* ── Loading / Unauthorised screens ────────────────────────── */
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: "#FAF5EB" }}>
        <Loader2 size={32} className="animate-spin" style={{ color: "#6B3F2A" }} />
      </div>
    );
  }

  if (authUser === false) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center" style={{ background: "#FAF5EB" }}>
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl shadow-xl" style={{ background: "linear-gradient(135deg, #6B3F2A, #A0522D)" }}>
          <ShieldAlert size={36} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black" style={{ color: "#2C1810", fontFamily: "'Playfair Display', Georgia, serif" }}>
            Admin Access Only
          </h1>
          <p className="mt-2 text-sm" style={{ color: "#2C1810", opacity: 0.55 }}>
            You must be logged in as an admin to access this page.
          </p>
        </div>
        <Link
          to="/cafe"
          className="flex items-center gap-2 rounded-full bg-[#6B3F2A] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#A0522D] transition"
        >
          <ArrowLeft size={15} /> Back to Cafe
        </Link>
      </div>
    );
  }

  /* ── Main render ────────────────────────────────────────────── */
  return (
    <div className="flex min-h-screen" style={{ background: "#F5EFE6" }}>

      {/* ── SIDEBAR ──────────────────────────────────────────── */}
      <aside
        className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-[#D4A85A]/15 shadow-xl"
        style={{ background: "linear-gradient(180deg, #2C1810 0%, #1a0a00 100%)" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 border-b border-white/10 px-6 py-5">
          <img src="/Web.jpeg" alt="Cafe Logo" className="h-10 w-10 rounded-full object-cover shadow-md" />
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-[#FAF5EB]">Cafe Admin</p>
            <p className="text-[10px] text-[#D4A85A] font-semibold tracking-wide">Lekhok Tripura</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 px-3 pt-6">
          <button
            onClick={() => setMainTab("menu")}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold transition w-full text-left ${
              mainTab === "menu"
                ? "bg-[#D4A85A]/15 text-[#D4A85A]"
                : "text-white/50 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Coffee size={16} />
            <span>Menu Management</span>
          </button>

          <button
            onClick={() => { setMainTab("orders"); fetchAdminOrders(); }}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold transition w-full text-left ${
              mainTab === "orders"
                ? "bg-[#D4A85A]/15 text-[#D4A85A]"
                : "text-white/50 hover:bg-white/5 hover:text-white"
            }`}
          >
            <ShoppingBag size={16} />
            <span>Orders</span>
            {orders.filter((o) => o.status === "New Order").length > 0 && (
              <span className="ml-auto rounded-full bg-[#D4A85A] px-2 py-0.5 text-[9px] font-black text-[#2C1810]">
                {orders.filter((o) => o.status === "New Order").length} NEW
              </span>
            )}
          </button>

          <button
            onClick={() => { setMainTab("space"); fetchAdminSpaceBookings(); }}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold transition w-full text-left ${
              mainTab === "space"
                ? "bg-[#D4A85A]/15 text-[#D4A85A]"
                : "text-white/50 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Tag size={16} />
            <span>Space Reservations</span>
          </button>
        </nav>

        {/* Bottom user strip */}
        <div className="mt-auto border-t border-white/10 px-4 py-4">
          <div className="mb-3 flex items-center gap-2.5 rounded-xl bg-white/5 px-3 py-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#D4A85A] to-[#6B3F2A] text-xs font-black text-white">
              {authUser?.name?.charAt(0) || "A"}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-[#FAF5EB]">{authUser?.name || "Admin"}</p>
              <p className="truncate text-[10px] text-white/40">{authUser?.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              to="/cafe"
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/10 py-2 text-[10px] font-semibold text-white/60 hover:bg-white/10 hover:text-white transition"
            >
              <ArrowLeft size={12} /> Cafe
            </Link>
            <button
              onClick={handleLogout}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-500/20 py-2 text-[10px] font-semibold text-red-400 hover:bg-red-500/10 transition"
            >
              <LogOut size={12} /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ─────────────────────────────────────── */}
      <main className="ml-64 flex-1 flex flex-col min-h-screen">

        {/* Top bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[#D4A85A]/20 bg-white/90 backdrop-blur-md px-8 py-4 shadow-sm">
          <div>
            <h1 className="text-lg font-black" style={{ color: "#2C1810" }}>
              {mainTab === "menu"
                ? "Menu Management"
                : mainTab === "orders"
                ? "Orders & Status Management"
                : "Readers & Writers Space Reservations"}
            </h1>
            <p className="text-xs" style={{ color: "#2C1810", opacity: 0.45 }}>
              {mainTab === "menu"
                ? "Add, edit, and manage all café menu items"
                : mainTab === "orders"
                ? "Real-time order lifecycle & customer counter pickup management"
                : "Manage reserved reader seating & writer desk slots"}
            </p>
          </div>
          {mainTab === "menu" ? (
            <button
              onClick={openAdd}
              className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:scale-105 hover:shadow-lg"
              style={{ background: "linear-gradient(135deg, #6B3F2A, #A0522D)" }}
            >
              <Plus size={16} /> Add Item
            </button>
          ) : mainTab === "orders" ? (
            <button
              onClick={fetchAdminOrders}
              disabled={ordersLoading}
              className="flex items-center gap-2 rounded-xl border border-[#6B3F2A]/30 bg-white px-4 py-2.5 text-xs font-bold text-[#6B3F2A] shadow-sm hover:bg-[#6B3F2A]/5 transition"
            >
              <RefreshCw size={14} className={ordersLoading ? "animate-spin" : ""} /> Refresh Orders
            </button>
          ) : (
            <button
              onClick={fetchAdminSpaceBookings}
              disabled={spaceLoading}
              className="flex items-center gap-2 rounded-xl border border-[#6B3F2A]/30 bg-white px-4 py-2.5 text-xs font-bold text-[#6B3F2A] shadow-sm hover:bg-[#6B3F2A]/5 transition"
            >
              <RefreshCw size={14} className={spaceLoading ? "animate-spin" : ""} /> Refresh Bookings
            </button>
          )}
        </header>

        {mainTab === "space" ? (
          /* ── SPACE RESERVATIONS TAB ──────────────────────────────────── */
          <div className="flex-1 px-8 py-7">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-base font-black text-[#2C1810]">All Space Bookings ({spaceBookings.length})</h2>
              <button
                onClick={fetchAdminSpaceBookings}
                disabled={spaceLoading}
                className="flex items-center gap-2 rounded-xl border border-[#6B3F2A]/30 bg-white px-4 py-2 text-xs font-bold text-[#6B3F2A] hover:bg-[#6B3F2A]/5 transition"
              >
                <RefreshCw size={14} className={spaceLoading ? "animate-spin" : ""} /> Refresh Bookings
              </button>
            </div>

            {spaceLoading && spaceBookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24">
                <Loader2 size={32} className="animate-spin text-[#6B3F2A]" />
              </div>
            ) : spaceBookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <Tag size={48} className="mb-3 text-[#D4A85A]/40" />
                <p className="text-base font-bold text-[#2C1810]/50">No space bookings found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {spaceBookings.map((b) => (
                  <div key={b._id} className="rounded-2xl border border-[#D4A85A]/25 bg-white p-5 shadow-sm">
                    <div className="flex justify-between items-center border-b border-[#D4A85A]/15 pb-3 mb-3">
                      <div>
                        <span className="text-sm font-black text-[#6B3F2A]">#{b.bookingNumber}</span>
                        <span className="ml-3 text-xs font-semibold text-[#2C1810]/60">{b.customerName} ({b.customerEmail || b.customerPhone || "Guest"})</span>
                      </div>
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800">
                        {b.status} (Paid ₹{b.totalAmount})
                      </span>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3 text-xs">
                      <div>
                        <p className="text-[#2C1810]/50 font-semibold uppercase text-[10px]">Space Type:</p>
                        <p className="font-bold text-[#2C1810] text-sm mt-0.5">{b.spaceType}</p>
                      </div>
                      <div>
                        <p className="text-[#2C1810]/50 font-semibold uppercase text-[10px]">Date &amp; Time Slot:</p>
                        <p className="font-bold text-[#6B3F2A] mt-0.5">{b.bookingDate} ({b.timeSlot})</p>
                      </div>
                      <div>
                        <p className="text-[#2C1810]/50 font-semibold uppercase text-[10px]">Purpose &amp; Guests:</p>
                        <p className="font-bold text-[#2C1810] mt-0.5">{b.purpose} ({b.guestsCount} Guests)</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : mainTab === "orders" ? (
          /* ── ORDERS TAB CONTENT ────────────────────────────────────────── */
          <div className="flex-1 px-8 py-7">
            {/* Order Status Filters */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {[
                  "all",
                  "New Order",
                  "Accepted",
                  "Confirmed",
                  "Preparing",
                  "Ready",
                  "Collected",
                ].map((st) => {
                  const count = st === "all" ? orders.length : orders.filter((o) => o.status === st).length;
                  return (
                    <button
                      key={st}
                      onClick={() => setOrderStatusFilter(st)}
                      className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all"
                      style={
                        orderStatusFilter === st
                          ? { background: "#6B3F2A", color: "#FAF5EB" }
                          : { background: "white", color: "#2C1810", border: "1px solid rgba(107,63,42,0.2)" }
                      }
                    >
                      <span>{st === "all" ? "All Orders" : st}</span>
                      <span className="rounded-full bg-[#FAF5EB]/20 px-1.5 py-0.2 text-[10px] font-black">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Orders List */}
            {ordersLoading && orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24">
                <Loader2 size={32} className="animate-spin text-[#6B3F2A]" />
                <p className="mt-2 text-xs font-semibold text-[#2C1810]/50">Loading Orders…</p>
              </div>
            ) : orders.filter((o) => orderStatusFilter === "all" || o.status === orderStatusFilter).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <ShoppingBag size={48} className="mb-3 text-[#D4A85A]/40" />
                <p className="text-base font-bold text-[#2C1810]/50">No orders found for "{orderStatusFilter}"</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders
                  .filter((o) => orderStatusFilter === "all" || o.status === orderStatusFilter)
                  .map((order) => {
                    const isUpdating = updatingOrderId === order._id;
                    return (
                      <div
                        key={order._id}
                        className="overflow-hidden rounded-2xl border border-[#D4A85A]/25 bg-white p-5 shadow-sm transition hover:shadow-md"
                      >
                        {/* Order Header */}
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D4A85A]/15 pb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-black text-[#6B3F2A]">#{order.orderNumber}</span>
                            <span className="text-xs font-semibold text-[#2C1810]/40">
                              {new Date(order.createdAt).toLocaleString("en-IN", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Payment status badge */}
                            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-black uppercase text-emerald-800">
                              ✓ Paid (₹{order.totalAmount})
                            </span>
                            {/* Current Status Badge */}
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-black text-white ${
                                order.status === "New Order"
                                  ? "bg-amber-600 animate-pulse"
                                  : order.status === "Accepted"
                                  ? "bg-blue-600"
                                  : order.status === "Confirmed"
                                  ? "bg-indigo-600"
                                  : order.status === "Preparing"
                                  ? "bg-purple-600"
                                  : order.status === "Ready"
                                  ? "bg-emerald-600"
                                  : "bg-gray-500"
                              }`}
                            >
                              {order.status}
                            </span>
                          </div>
                        </div>

                        {/* Customer & Items Details Grid */}
                        <div className="grid gap-4 py-3 sm:grid-cols-2">
                          {/* Customer Info */}
                          <div className="text-xs space-y-1 text-[#2C1810]/80">
                            <p className="font-bold text-[#2C1810] text-sm">{order.customerName}</p>
                            {order.customerEmail && <p className="flex items-center gap-1.5"><Mail size={12} className="text-[#6B3F2A]" /> {order.customerEmail}</p>}
                            {order.customerPhone && <p className="flex items-center gap-1.5"><Phone size={12} className="text-[#6B3F2A]" /> {order.customerPhone}</p>}
                          </div>

                          {/* Items List */}
                          <div className="rounded-xl bg-[#FAF5EB] p-3 text-xs space-y-1.5">
                            <p className="font-bold text-[10px] uppercase text-[#6B3F2A] tracking-wider mb-1">Items Ordered:</p>
                            {order.items.map((it, idx) => (
                              <div key={idx} className="flex justify-between items-center text-xs">
                                <span className="font-semibold text-[#2C1810]">{it.name} <strong className="text-[#6B3F2A]">x{it.quantity}</strong></span>
                                <span className="font-bold text-[#6B3F2A]">₹{it.price * it.quantity}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Lifecycle Status Action Buttons */}
                        <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-[#D4A85A]/15 pt-3">
                          <span className="text-xs font-bold text-[#2C1810]/50 mr-2">Update Status:</span>

                          {/* 1. Accept Order */}
                          <button
                            onClick={() => handleUpdateOrderStatus(order._id, "Accepted")}
                            disabled={isUpdating || order.status === "Accepted" || order.status === "Confirmed" || order.status === "Preparing" || order.status === "Ready" || order.status === "Collected"}
                            className="flex items-center gap-1.5 rounded-xl border border-blue-300 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-600 hover:text-white transition disabled:opacity-30 disabled:hover:bg-blue-50 disabled:hover:text-blue-700"
                          >
                            <Check size={13} /> Accept Order
                          </button>

                          {/* 2. Confirm Order */}
                          <button
                            onClick={() => handleUpdateOrderStatus(order._id, "Confirmed")}
                            disabled={isUpdating || order.status === "Confirmed" || order.status === "Preparing" || order.status === "Ready" || order.status === "Collected"}
                            className="flex items-center gap-1.5 rounded-xl border border-indigo-300 bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-600 hover:text-white transition disabled:opacity-30 disabled:hover:bg-indigo-50 disabled:hover:text-indigo-700"
                          >
                            <CheckCircle2 size={13} /> Confirm Order
                          </button>

                          {/* 3. Preparing Status */}
                          <button
                            onClick={() => handleUpdateOrderStatus(order._id, "Preparing")}
                            disabled={isUpdating || order.status === "Preparing" || order.status === "Ready" || order.status === "Collected"}
                            className="flex items-center gap-1.5 rounded-xl border border-purple-300 bg-purple-50 px-3 py-1.5 text-xs font-bold text-purple-700 hover:bg-purple-600 hover:text-white transition disabled:opacity-30 disabled:hover:bg-purple-50 disabled:hover:text-purple-700"
                          >
                            <UtensilsCrossed size={13} /> Start Preparing
                          </button>

                          {/* 4. Ready Status + Customer Counter Pickup Notification */}
                          <button
                            onClick={() => handleUpdateOrderStatus(order._id, "Ready")}
                            disabled={isUpdating || order.status === "Ready" || order.status === "Collected"}
                            className="flex items-center gap-1.5 rounded-xl border-2 border-emerald-500 bg-emerald-500 px-3.5 py-1.5 text-xs font-black text-white shadow-md hover:bg-emerald-600 transition disabled:opacity-30"
                          >
                            <Bell size={14} className="animate-bounce" /> Mark as Ready 🔔
                          </button>

                          {/* 5. Collected */}
                          <button
                            onClick={() => handleUpdateOrderStatus(order._id, "Collected")}
                            disabled={isUpdating || order.status === "Collected"}
                            className="flex items-center gap-1.5 rounded-xl border border-gray-300 bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-800 hover:text-white transition disabled:opacity-30 disabled:hover:bg-gray-100 disabled:hover:text-gray-700"
                          >
                            <ShoppingBag size={13} /> Mark as Collected
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        ) : (
          /* ── MENU TAB CONTENT ─────────────────────────────────────────── */
          <div className="flex-1 px-8 py-7">

            {/* Stats */}
            <div className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Total Items"      value={stats.total}      icon={Coffee}      color="#6B3F2A" />
              <StatCard label="Available"         value={stats.available}  icon={Eye}         color="#4A7C59" />
              <StatCard label="Featured"          value={stats.featured}   icon={Star}        color="#D4A85A" />
              <StatCard label="Categories Used"   value={stats.categories} icon={LayoutGrid}  color="#2A6B8B" />
            </div>

          {/* Filters */}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            {/* Category tabs */}
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveCategory(c.id)}
                  className="rounded-full px-3.5 py-1.5 text-xs font-bold transition-all duration-200"
                  style={
                    activeCategory === c.id
                      ? { background: "#6B3F2A", color: "#FAF5EB" }
                      : { background: "white", color: "#2C1810", border: "1px solid rgba(107,63,42,0.2)" }
                  }
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#6B3F2A", opacity: 0.5 }} />
              <input
                type="text"
                placeholder="Search items…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-xl border border-[#D4A85A]/30 bg-white py-2 pl-8 pr-4 text-xs text-[#2C1810] outline-none focus:border-[#6B3F2A] transition w-52"
              />
            </div>
          </div>

          {/* Items grid */}
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-64 animate-pulse rounded-2xl bg-[#D4A85A]/10" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
              <Coffee size={48} style={{ color: "#D4A85A", opacity: 0.4 }} />
              <p className="font-bold text-lg" style={{ color: "#2C1810", opacity: 0.4 }}>No items found</p>
              <button onClick={openAdd} className="rounded-xl bg-[#6B3F2A] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#A0522D] transition">
                + Add First Item
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((item) => {
                const color = CAT_COLORS[item.category] || "#6B3F2A";
                return (
                  <motion.div
                    key={item._id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#D4A85A]/20 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-[#6B3F2A]/10"
                  >
                    {/* Image / placeholder */}
                    <div
                      className="relative h-36 overflow-hidden"
                      style={{ background: `linear-gradient(135deg, ${color}15 0%, ${color}28 100%)` }}
                    >
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Coffee size={36} style={{ color, opacity: 0.3 }} />
                        </div>
                      )}
                      {/* Badges */}
                      <div className="absolute left-2 top-2 flex gap-1 flex-wrap">
                        <Badge color={color}>{item.category}</Badge>
                        {item.featured && <Badge color="#D4A85A">⭐ Featured</Badge>}
                        {!item.available && <Badge color="#999">Hidden</Badge>}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex flex-1 flex-col p-4">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="text-sm font-black leading-snug" style={{ color: "#2C1810" }}>{item.name}</h3>
                        <span className="shrink-0 text-sm font-black" style={{ color }}>₹{item.price}</span>
                      </div>
                      {item.description && (
                        <p className="mb-3 text-[11px] leading-relaxed line-clamp-2" style={{ color: "#2C1810", opacity: 0.5 }}>
                          {item.description}
                        </p>
                      )}
                      <p className="mb-3 text-[10px] font-medium" style={{ color: "#2C1810", opacity: 0.4 }}>
                        ⏱ {item.preparationTime} min
                      </p>

                      {/* Actions */}
                      <div className="mt-auto flex items-center gap-1.5">
                        {/* Available toggle */}
                        <button
                          onClick={() => quickToggle(item, "available")}
                          className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-bold transition hover:scale-105"
                          style={item.available
                            ? { background: "#4A7C5915", color: "#4A7C59" }
                            : { background: "#99999915", color: "#999" }}
                          title={item.available ? "Mark Hidden" : "Mark Available"}
                        >
                          {item.available ? <Eye size={12} /> : <EyeOff size={12} />}
                          {item.available ? "Live" : "Hidden"}
                        </button>

                        {/* Featured toggle */}
                        <button
                          onClick={() => quickToggle(item, "featured")}
                          className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-bold transition hover:scale-105"
                          style={item.featured
                            ? { background: "#D4A85A20", color: "#D4A85A" }
                            : { background: "#99999912", color: "#999" }}
                          title={item.featured ? "Remove Featured" : "Mark Featured"}
                        >
                          <Star size={12} fill={item.featured ? "#D4A85A" : "none"} />
                          {item.featured ? "Featured" : "Feature"}
                        </button>

                        <div className="ml-auto flex gap-1">
                          <button
                            onClick={() => openEdit(item)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#6B3F2A]/20 text-[#6B3F2A] hover:bg-[#6B3F2A] hover:text-white transition"
                            title="Edit"
                          >
                            <Pencil size={12} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(item)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-red-200 text-red-400 hover:bg-red-500 hover:text-white transition"
                            title="Delete"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </main>

      {/* ── ADD / EDIT MODAL ─────────────────────────────────── */}
      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
            />
            <motion.div
              className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col h-full overflow-hidden shadow-2xl"
              style={{ background: "#FAF5EB" }}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
              data-lenis-prevent
            >
              {/* Modal header */}
              <div
                className="shrink-0 flex items-center justify-between px-7 py-5 border-b border-[#D4A85A]/25"
                style={{ background: "linear-gradient(135deg, #2C1810, #6B3F2A)" }}
              >
                <div>
                  <h2 className="text-base font-black text-white">{editItem ? "Edit Menu Item" : "Add New Item"}</h2>
                  <p className="text-xs text-white/50">{editItem ? `Editing: ${editItem.name}` : "Fill in the details below"}</p>
                </div>
                <button onClick={closeModal} className="rounded-full p-2 text-white/60 hover:bg-white/15 transition">
                  <X size={18} />
                </button>
              </div>

              {/* Form Body - Scrollable */}
              <div
                className="flex-1 overflow-y-auto px-7 py-6 space-y-5 custom-scrollbar"
                data-lenis-prevent
              >
                {formError && (
                  <div className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-600">
                    <AlertTriangle size={14} /> {formError}
                  </div>
                )}

                {/* Name */}
                <FormField label="Item Name *" icon={Coffee}>
                  <input
                    type="text"
                    placeholder="e.g. Signature Espresso"
                    value={form.name}
                    onChange={(e) => handleFormChange("name", e.target.value)}
                    className="field-input"
                  />
                </FormField>

                {/* Description */}
                <FormField label="Description" icon={FileText}>
                  <textarea
                    placeholder="Short description of the item…"
                    value={form.description}
                    onChange={(e) => handleFormChange("description", e.target.value)}
                    rows={3}
                    className="field-input resize-none"
                  />
                </FormField>

                {/* Price + Category row */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Price (₹) *" icon={DollarSign}>
                    <input
                      type="number"
                      min={0}
                      placeholder="e.g. 120"
                      value={form.price}
                      onChange={(e) => handleFormChange("price", e.target.value)}
                      className="field-input"
                    />
                  </FormField>
                  <FormField label="Category *" icon={Tag}>
                    <select
                      value={form.category}
                      onChange={(e) => handleFormChange("category", e.target.value)}
                      className="field-input"
                    >
                      {CATEGORIES.filter((c) => c.id !== "all").map((c) => (
                        <option key={c.id} value={c.id}>{c.label}</option>
                      ))}
                    </select>
                  </FormField>
                </div>

                {/* Image Upload */}
                <ImageUploadField
                  imageUrl={form.imageUrl}
                  onUploadSuccess={(url) => handleFormChange("imageUrl", url)}
                  onRemove={() => handleFormChange("imageUrl", "")}
                  formError={formError}
                  setFormError={setFormError}
                />

                {/* Prep time + Tags */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Prep Time (min)" icon={Clock}>
                    <input
                      type="number"
                      min={1}
                      value={form.preparationTime}
                      onChange={(e) => handleFormChange("preparationTime", e.target.value)}
                      className="field-input"
                    />
                  </FormField>
                  <FormField label="Tags (comma sep.)" icon={Tag}>
                    <input
                      type="text"
                      placeholder="hot, bestseller, vegan"
                      value={form.tags}
                      onChange={(e) => handleFormChange("tags", e.target.value)}
                      className="field-input"
                    />
                  </FormField>
                </div>

                {/* Toggles */}
                <div className="grid grid-cols-2 gap-4">
                  <Toggle
                    label="Available on Menu"
                    value={form.available}
                    onChange={(v) => handleFormChange("available", v)}
                    activeColor="#4A7C59"
                  />
                  <Toggle
                    label="Mark as Featured"
                    value={form.featured}
                    onChange={(v) => handleFormChange("featured", v)}
                    activeColor="#D4A85A"
                  />
                </div>
              </div>

              {/* Footer - Fixed at bottom */}
              <div className="shrink-0 border-t border-[#D4A85A]/20 px-7 py-4 bg-[#FAF5EB] flex gap-3">
                <button
                  onClick={closeModal}
                  className="flex-1 rounded-xl border border-[#6B3F2A]/25 py-3 text-sm font-bold text-[#6B3F2A] hover:bg-[#6B3F2A]/5 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white shadow-md transition hover:scale-105 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ background: "linear-gradient(135deg, #6B3F2A, #A0522D)" }}
                >
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                  {saving ? "Saving…" : editItem ? "Update Item" : "Add to Menu"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── DELETE CONFIRM MODAL ─────────────────────────────── */}
      <AnimatePresence>
        {deleteConfirm && (
          <>
            <motion.div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !deleting && setDeleteConfirm(null)} />
            <motion.div
              className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-red-200 bg-white p-7 shadow-2xl"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
                <Trash2 size={24} className="text-red-500" />
              </div>
              <h3 className="mb-1 text-base font-black" style={{ color: "#2C1810" }}>Delete "{deleteConfirm.name}"?</h3>
              <p className="mb-6 text-xs" style={{ color: "#2C1810", opacity: 0.55 }}>This action cannot be undone. The item will be permanently removed from the menu.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} disabled={deleting} className="flex-1 rounded-xl border border-[#6B3F2A]/25 py-2.5 text-sm font-bold text-[#6B3F2A] hover:bg-[#6B3F2A]/5 transition">Cancel</button>
                <button onClick={handleDelete} disabled={deleting} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 py-2.5 text-sm font-bold text-white hover:bg-red-600 transition disabled:opacity-60">
                  {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  {deleting ? "Deleting…" : "Delete"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── TOAST ────────────────────────────────────────────── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className="fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 flex items-center gap-2.5 rounded-2xl px-5 py-3 text-sm font-bold text-white shadow-2xl"
            style={{ background: toast.type === "error" ? "#ef4444" : "linear-gradient(135deg, #6B3F2A, #A0522D)" }}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
          >
            {toast.type === "error" ? <AlertTriangle size={15} /> : <Check size={15} />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Tailwind & Custom Scrollbar helper styles ────────── */}
      <style>{`
        .field-input {
          width: 100%;
          border-radius: 12px;
          border: 1.5px solid rgba(212,168,90,0.3);
          background: white;
          padding: 10px 14px;
          font-size: 13px;
          color: #2C1810;
          outline: none;
          transition: border-color 0.2s;
        }
        .field-input:focus {
          border-color: #6B3F2A;
        }
        .field-input::placeholder { color: rgba(44,24,16,0.35); }

        /* Custom Scrollbar */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(212, 168, 90, 0.1);
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(107, 63, 42, 0.4);
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(107, 63, 42, 0.7);
        }
      `}</style>
    </div>
  );
}

/* ── Sidebar Item ───────────────────────────────────────────────── */
function SidebarItem({ icon: Icon, label, active, disabled }) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold transition ${
        active
          ? "bg-[#D4A85A]/15 text-[#D4A85A]"
          : disabled
          ? "text-white/20 cursor-not-allowed"
          : "text-white/50 hover:bg-white/5 hover:text-white"
      }`}
    >
      <Icon size={16} />
      {label}
      {disabled && <span className="ml-auto rounded-full bg-white/10 px-1.5 py-0.5 text-[9px] font-black text-white/30">SOON</span>}
    </div>
  );
}

/* ── Form Field wrapper ─────────────────────────────────────────── */
function FormField({ label, icon: Icon, children }) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide" style={{ color: "#6B3F2A" }}>
        {Icon && <Icon size={12} />}
        {label}
      </label>
      {children}
    </div>
  );
}

/* ── Toggle ─────────────────────────────────────────────────────── */
function Toggle({ label, value, onChange, activeColor }) {
  return (
    <div
      className="flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 transition hover:shadow-sm"
      style={{ borderColor: value ? `${activeColor}40` : "rgba(212,168,90,0.2)", background: value ? `${activeColor}08` : "white" }}
      onClick={() => onChange(!value)}
    >
      <span className="text-xs font-bold" style={{ color: value ? activeColor : "#2C1810", opacity: value ? 1 : 0.5 }}>{label}</span>
      <div
        className="relative h-5 w-9 rounded-full transition-all duration-300"
        style={{ background: value ? activeColor : "#ccc" }}
      >
        <div
          className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all duration-300"
          style={{ left: value ? "18px" : "2px" }}
        />
      </div>
    </div>
  );
}

/* ── Image Upload Component ─────────────────────────────────────── */
function ImageUploadField({ imageUrl, onUploadSuccess, onRemove, setFormError }) {
  const [uploading, setUploading] = useState(false);
  const [useUrlFallback, setUseUrlFallback] = useState(false);
  const [imgDimensions, setImgDimensions] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size <= 2MB (2 * 1024 * 1024 bytes)
    if (file.size > 2 * 1024 * 1024) {
      setFormError?.("File size exceeds 2MB limit. Please select a smaller image.");
      return;
    }

    // Validate type (PNG, JPG, JPEG, WEBP)
    const allowed = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!allowed.includes(file.type.toLowerCase())) {
      setFormError?.("Invalid format. Please upload a PNG, JPG, JPEG, or WEBP image.");
      return;
    }

    setFormError?.("");
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("cafeImage", file);

      const res = await fetch(`${API_BASE}/cafe/menu/upload-image`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();
      if (!data.success || !data.url) {
        throw new Error(data.message || "Failed to upload image to Cloudinary.");
      }

      onUploadSuccess(data.url);
    } catch (err) {
      setFormError?.(err.message || "Image upload failed.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleImageLoad = (e) => {
    const w = e.target.naturalWidth;
    const h = e.target.naturalHeight;
    setImgDimensions({
      w,
      h,
      isOptimalRatio: w / h >= 1.2 && w / h <= 1.5,
    });
  };

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide" style={{ color: "#6B3F2A" }}>
          <Image size={12} /> Menu Item Image
        </label>
        <button
          type="button"
          onClick={() => setUseUrlFallback((prev) => !prev)}
          className="text-[10px] font-semibold underline text-[#6B3F2A]/60 hover:text-[#6B3F2A]"
        >
          {useUrlFallback ? "← Upload File" : "or enter URL directly"}
        </button>
      </div>

      {useUrlFallback ? (
        <input
          type="url"
          placeholder="https://..."
          value={imageUrl}
          onChange={(e) => onUploadSuccess(e.target.value)}
          className="field-input"
        />
      ) : imageUrl ? (
        /* Image Preview Box */
        <div className="relative overflow-hidden rounded-2xl border-2 border-[#D4A85A]/40 bg-white p-3 shadow-sm">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-[#FAF5EB] flex items-center justify-center">
            <img
              src={imageUrl}
              alt="Menu item preview"
              onLoad={handleImageLoad}
              className="h-full w-full object-cover"
            />
            <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
              <span className="rounded-full bg-black/75 backdrop-blur-md px-2.5 py-0.5 text-[9px] font-bold text-white shadow-sm flex items-center gap-1">
                ☁️ Cloudinary Saved
              </span>
              {imgDimensions && (
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold text-white shadow-sm ${
                    imgDimensions.isOptimalRatio ? "bg-[#4A7C59]" : "bg-[#6B3F2A]"
                  }`}
                >
                  {imgDimensions.w} × {imgDimensions.h} px {imgDimensions.isOptimalRatio ? "✓ Perfect Fit" : ""}
                </span>
              )}
            </div>
          </div>

          <div className="mt-2.5 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1.5 rounded-xl border border-[#6B3F2A]/30 bg-[#6B3F2A]/5 px-3 py-1.5 text-xs font-bold text-[#6B3F2A] hover:bg-[#6B3F2A]/10 transition"
            >
              <UploadCloud size={14} /> Change Photo
            </button>
            <button
              type="button"
              onClick={onRemove}
              className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-500 hover:bg-red-100 transition"
            >
              <Trash2 size={13} /> Remove
            </button>
          </div>
        </div>
      ) : (
        /* Dropzone Upload Area */
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-5 text-center transition-all cursor-pointer ${
            uploading
              ? "border-[#6B3F2A] bg-[#6B3F2A]/5 cursor-wait"
              : "border-[#D4A85A]/50 bg-white hover:border-[#6B3F2A] hover:bg-[#6B3F2A]/5"
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2 py-3">
              <Loader2 size={26} className="animate-spin text-[#6B3F2A]" />
              <p className="text-xs font-bold text-[#6B3F2A]">Uploading image to Cloudinary…</p>
              <p className="text-[10px] text-[#2C1810]/50">Please wait a moment</p>
            </div>
          ) : (
            <>
              <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#6B3F2A]/10 text-[#6B3F2A] group-hover:scale-110 transition-transform">
                <UploadCloud size={22} />
              </div>
              <p className="text-xs font-bold text-[#2C1810]">
                Click to Upload Item Photo
              </p>

              {/* Guidelines box */}
              <div className="mt-3 w-full rounded-xl border border-[#D4A85A]/25 bg-[#FAF5EB]/80 p-2.5 text-left text-[10px] space-y-1 text-[#2C1810]/75">
                <div className="flex items-center justify-between font-semibold text-[#6B3F2A]">
                  <span>📐 Recommended Dimensions:</span>
                  <span className="font-bold text-[#2C1810]">800 × 600 px (4:3 ratio)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>📁 Max File Size:</span>
                  <span className="font-bold text-[#2C1810]">Max 2 MB</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>🎨 Allowed Formats:</span>
                  <span className="font-bold text-[#2C1810]">PNG, JPG, JPEG, WEBP</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/jpg, image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
