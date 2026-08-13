import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Coffee, Plus, Pencil, Trash2, X, Check, AlertTriangle,
  LayoutGrid, ChevronDown, Star, Eye, EyeOff, LogOut,
  ArrowLeft, Search, Filter, Image, Tag, DollarSign,
  Clock, FileText, ToggleLeft, ToggleRight, Loader2, ShieldAlert,
  UploadCloud, ShoppingBag, Bell, UtensilsCrossed, CheckCircle2,
  UserCheck, RefreshCw, Phone, Mail, Crown, Crop as CropIcon,
} from "lucide-react";
import { API_BASE } from "../../config.js";
import CafeAdminMenuManagement, { CatHeadingCard, ImageUploadField } from "../components/CafeAdminMenuManagement.jsx";

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
  ingredients: [], // [{ name: "", percent: "" }]
  howItLooks: "",
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

  const [adminTables, setAdminTables] = useState([]);
  const [tablesLoading, setTablesLoading] = useState(false);
  const [spaceSubTab, setSpaceSubTab] = useState("tables"); // "tables" | "bookings"
  const [tableModalOpen, setTableModalOpen] = useState(false);
  const [newTableForm, setNewTableForm] = useState({
    tableNumber: "",
    spaceType: "Book Reader's Corner",
    capacity: 2,
    notes: ""
  });

  const [adminUpdates, setAdminUpdates] = useState([]);
  const [updatesLoading, setUpdatesLoading] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [showUpdatePreview, setShowUpdatePreview] = useState(false);
  const [editUpdateItem, setEditUpdateItem] = useState(null);
  const [updateForm, setUpdateForm] = useState({
    title: "",
    content: "",
    category: "Announcement",
    imageUrl: "",
    isPinned: false,
    isPublished: true
  });
  const [savingUpdate, setSavingUpdate] = useState(false);
  const [spotlightForm, setSpotlightForm] = useState({
    month: new Date().toISOString().slice(0, 7),
    memberName: "",
    visitCount: 12,
    customBadge: "Visitor of the Month",
    message: ""
  });

  const [deleteConfirm, setDeleteConfirm] = useState(null); // item to delete
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);

  // Category headings management
  const [catHeadings, setCatHeadings] = useState([]); // [{categoryId, title, subtitle, sortOrder}]
  const [catHeadingsLoading, setCatHeadingsLoading] = useState(false);
  const [savingCatId, setSavingCatId] = useState(null); // categoryId currently saving

  /* ── Lock body & Lenis scroll when modal or delete confirm is open ── */
  useEffect(() => {
    if (modalOpen || deleteConfirm || updateModalOpen || tableModalOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      if (window.lenis) window.lenis.stop();
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      if (window.lenis) window.lenis.start();
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      if (window.lenis) window.lenis.start();
    };
  }, [modalOpen, deleteConfirm, updateModalOpen, tableModalOpen]);

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
    fetchCatHeadings();
  }, [fetchItems]);

  /* ── Fetch category headings ─────────────────────────────────── */
  const fetchCatHeadings = async () => {
    setCatHeadingsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/cafe/categories`);
      const data = await res.json();
      if (data.success) setCatHeadings(data.categories);
    } catch { /* ignore */ } finally {
      setCatHeadingsLoading(false);
    }
  };

  const saveCatHeading = async (categoryId, title, subtitle) => {
    setSavingCatId(categoryId);
    try {
      const res = await fetch(`${API_BASE}/cafe/categories/${categoryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title, subtitle }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Category heading updated!`);
        fetchCatHeadings();
      } else {
        showToast(data.message || "Failed to update heading", "error");
      }
    } catch {
      showToast("Failed to update heading", "error");
    } finally {
      setSavingCatId(null);
    }
  };

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

  /* ── Fetch Admin Tables ─────────────────────────────────────── */
  const fetchAdminTables = useCallback(async () => {
    setTablesLoading(true);
    try {
      const res = await fetch(`${API_BASE}/cafe/space/admin/tables`, { credentials: "include" });
      const data = await res.json();
      if (data.success) setAdminTables(data.tables || []);
    } catch {
      showToast("Failed to fetch cafe tables", "error");
    } finally {
      setTablesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (mainTab === "space") {
      fetchAdminTables();
      fetchAdminSpaceBookings();
    }
  }, [mainTab, fetchAdminTables, fetchAdminSpaceBookings]);

  const handleUpdateTableStatus = async (tableId, newStatus) => {
    try {
      const res = await fetch(`${API_BASE}/cafe/space/admin/tables/${tableId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message);
        fetchAdminTables();
      }
    } catch {
      showToast("Failed to update table status", "error");
    }
  };

  const handleCreateTable = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/cafe/space/admin/tables`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newTableForm),
      });
      const data = await res.json();
      if (data.success) {
        showToast("New table added to layout!");
        setTableModalOpen(false);
        setNewTableForm({ tableNumber: "", spaceType: "Book Reader's Corner", capacity: 2, notes: "" });
        fetchAdminTables();
      } else {
        showToast(data.message || "Failed to create table", "error");
      }
    } catch {
      showToast("Failed to create table", "error");
    }
  };

  const handleDeleteTable = async (tableId) => {
    if (!window.confirm("Are you sure you want to remove this table?")) return;
    try {
      const res = await fetch(`${API_BASE}/cafe/space/admin/tables/${tableId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        showToast("Table removed.");
        fetchAdminTables();
      }
    } catch {
      showToast("Failed to remove table", "error");
    }
  };

  const fetchAdminUpdates = useCallback(async () => {
    setUpdatesLoading(true);
    try {
      const res = await fetch(`${API_BASE}/cafe/updates/admin`, { credentials: "include" });
      const data = await res.json();
      if (data.success) setAdminUpdates(data.updates);
    } catch {
      showToast("Failed to fetch updates", "error");
    } finally {
      setUpdatesLoading(false);
    }
  }, []);

  const openAddUpdate = () => {
    setEditUpdateItem(null);
    setUpdateForm({
      title: "",
      content: "",
      category: "Announcement",
      imageUrl: "",
      isPinned: false,
      isPublished: true
    });
    setShowUpdatePreview(false);
    setUpdateModalOpen(true);
  };

  const openEditUpdate = (item) => {
    setEditUpdateItem(item);
    setUpdateForm({
      title: item.title,
      content: item.content,
      category: item.category || "Announcement",
      imageUrl: item.imageUrl || "",
      isPinned: item.isPinned,
      isPublished: item.isPublished
    });
    setShowUpdatePreview(false);
    setUpdateModalOpen(true);
  };

  const handleSaveUpdate = async (e) => {
    e.preventDefault();
    setSavingUpdate(true);
    try {
      const url = editUpdateItem
        ? `${API_BASE}/cafe/updates/${editUpdateItem._id}`
        : `${API_BASE}/cafe/updates`;
      const method = editUpdateItem ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updateForm)
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      showToast(editUpdateItem ? "Update edited!" : "New update published!");
      setUpdateModalOpen(false);
      fetchAdminUpdates();
    } catch (err) {
      showToast(err.message || "Failed to save update", "error");
    } finally {
      setSavingUpdate(false);
    }
  };

  const handleDeleteUpdatePost = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/cafe/updates/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      const data = await res.json();
      if (data.success) {
        showToast("Update post deleted");
        fetchAdminUpdates();
      }
    } catch {
      showToast("Failed to delete update", "error");
    }
  };

  const handleSaveSpotlight = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/cafe/updates/visitor-of-month`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(spotlightForm)
      });
      const data = await res.json();
      if (data.success) showToast("Visitor of the Month spotlight updated!");
    } catch {
      showToast("Failed to update spotlight", "error");
    }
  };

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
      ingredients: item.ingredients?.length ? item.ingredients.map(i => ({ name: i.name, percent: i.percent })) : [],
      howItLooks: item.howItLooks || "",
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
      ingredients: (form.ingredients || [])
        .filter((i) => i.name?.trim())
        .map((i) => {
          const p = (i.percent || "").trim();
          const formattedPercent = p ? (p.endsWith("%") || isNaN(p) ? p : `${p}%`) : "";
          return { name: i.name.trim(), percent: formattedPercent };
        }),
      howItLooks: form.howItLooks?.trim() || "",
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

          <button
            onClick={() => { setMainTab("updates"); fetchAdminUpdates(); }}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold transition w-full text-left ${
              mainTab === "updates"
                ? "bg-[#D4A85A]/15 text-[#D4A85A]"
                : "text-white/50 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Bell size={16} />
            <span>Updates &amp; Spotlight</span>
          </button>

          <button
            onClick={() => { setMainTab("cat-headings"); }}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold transition w-full text-left ${
              mainTab === "cat-headings"
                ? "bg-[#D4A85A]/15 text-[#D4A85A]"
                : "text-white/50 hover:bg-white/5 hover:text-white"
            }`}
          >
            <LayoutGrid size={16} />
            <span>Category Headings</span>
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
                : mainTab === "updates"
                ? "Updates & Visitor Spotlight Management"
                : mainTab === "cat-headings"
                ? "Category Headings & Subtitles"
                : "Readers & Writers Space Reservations"}
            </h1>
            <p className="text-xs" style={{ color: "#2C1810", opacity: 0.45 }}>
              {mainTab === "menu"
                ? "Add, edit, and manage all café menu items"
                : mainTab === "orders"
                ? "Real-time order lifecycle & customer counter pickup management"
                : mainTab === "updates"
                ? "Publish cafe announcements, offers & set Visitor of the Month"
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
          ) : mainTab === "updates" ? (
            <button
              onClick={openAddUpdate}
              className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:scale-105 hover:shadow-lg"
              style={{ background: "linear-gradient(135deg, #6B3F2A, #A0522D)" }}
            >
              <Plus size={16} /> Post New Update
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

        {mainTab === "cat-headings" ? (
          /* ── CATEGORY HEADINGS TAB ──────────────────────────────────────── */
          <div className="flex-1 px-8 py-7">
            <p className="text-xs text-[#2C1810]/60 mb-6 max-w-2xl">
              Set the heading title and subtitle shown at the top of each category section on the public menu page. These appear in the <strong>"Coffee Collection"</strong>-style banner above each item grid.
            </p>
            {catHeadingsLoading ? (
              <div className="flex items-center gap-2 py-10 text-[#6B3F2A]"><Loader2 size={22} className="animate-spin" /> Loading…</div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2">
                {catHeadings.map((cat) => (
                  <CatHeadingCard
                    key={cat.categoryId}
                    cat={cat}
                    savingCatId={savingCatId}
                    onSave={saveCatHeading}
                  />
                ))}
              </div>
            )}
          </div>
        ) : mainTab === "updates" ? (
          /* ── UPDATES & SPOTLIGHT TAB ──────────────────────────────────── */
          <div className="flex-1 px-8 py-7 space-y-8">
            {/* Spotlight Override Section */}
            <div className="rounded-3xl border border-[#D4A85A]/30 bg-white p-6 shadow-sm">
              <h2 className="text-base font-black text-[#2C1810] mb-1 flex items-center gap-2">
                <Crown size={18} className="text-[#D4A85A]" /> Set Manual "Visitor of the Month" Spotlight
              </h2>
              <p className="text-xs text-[#2C1810]/60 mb-5">
                Highlight a specific member or override the auto-calculated monthly visitor leaderboard.
              </p>

              <form onSubmit={handleSaveSpotlight} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#2C1810]/70 mb-1">Month (YYYY-MM)</label>
                  <input
                    type="month"
                    value={spotlightForm.month}
                    onChange={(e) => setSpotlightForm({ ...spotlightForm, month: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 p-2.5 text-xs font-bold text-[#2C1810]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#2C1810]/70 mb-1">Member / Visitor Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Kiran Samanta"
                    value={spotlightForm.memberName}
                    onChange={(e) => setSpotlightForm({ ...spotlightForm, memberName: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 p-2.5 text-xs font-bold text-[#2C1810]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#2C1810]/70 mb-1">Monthly Visit / Order Count</label>
                  <input
                    type="number"
                    placeholder="e.g. 14"
                    value={spotlightForm.visitCount}
                    onChange={(e) => setSpotlightForm({ ...spotlightForm, visitCount: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 p-2.5 text-xs font-bold text-[#2C1810]"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-[#6B3F2A] py-2.5 text-xs font-bold text-white hover:bg-[#523020] transition shadow"
                  >
                    Save Spotlight Recognition
                  </button>
                </div>
              </form>
            </div>

            {/* Updates Posts List */}
            <div className="rounded-3xl border border-[#D4A85A]/30 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-base font-black text-[#2C1810]">Published Updates &amp; Notices ({adminUpdates.length})</h2>
                  <p className="text-xs text-[#2C1810]/50">Official announcements visible on the updates page.</p>
                </div>
                <button
                  onClick={openAddUpdate}
                  className="flex items-center gap-2 rounded-xl bg-[#6B3F2A] px-4 py-2 text-xs font-bold text-white hover:bg-[#523020] transition"
                >
                  <Plus size={14} /> Add Post
                </button>
              </div>

              {updatesLoading ? (
                <div className="py-12 text-center text-xs text-gray-400">Loading updates...</div>
              ) : adminUpdates.length === 0 ? (
                <div className="py-12 text-center text-xs text-gray-400">No updates published yet. Click "Add Post" to create your first announcement!</div>
              ) : (
                <div className="space-y-3">
                  {adminUpdates.map((post) => (
                    <div key={post._id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="rounded-full bg-[#6B3F2A]/10 px-2.5 py-0.5 text-[10px] font-black text-[#6B3F2A]">
                            {post.category}
                          </span>
                          {post.isPinned && (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-800">
                              Pinned
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-[#2C1810]">{post.title}</h4>
                        <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{post.content}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditUpdate(post)}
                          className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-200 transition"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteUpdatePost(post._id)}
                          className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50 transition"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : mainTab === "space" ? (
          /* ── SPACE RESERVATIONS & TABLES TAB ──────────────────────────────────── */
          <div className="flex-1 px-8 py-7">
            {/* Top Sub-tabs & Actions */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSpaceSubTab("tables")}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition ${
                    spaceSubTab === "tables"
                      ? "bg-[#6B3F2A] text-white shadow-md"
                      : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span>🪑 Available Tables &amp; Seating Layout ({adminTables.length})</span>
                </button>
                <button
                  onClick={() => setSpaceSubTab("bookings")}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition ${
                    spaceSubTab === "bookings"
                      ? "bg-[#6B3F2A] text-white shadow-md"
                      : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span>📑 Pre-Bookings &amp; Reservations ({spaceBookings.length})</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                {spaceSubTab === "tables" ? (
                  <>
                    <button
                      onClick={fetchAdminTables}
                      disabled={tablesLoading}
                      className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
                    >
                      <RefreshCw size={14} className={tablesLoading ? "animate-spin" : ""} /> Refresh Layout
                    </button>
                    <button
                      onClick={() => setTableModalOpen(true)}
                      className="flex items-center gap-1.5 rounded-xl bg-[#6B3F2A] px-4 py-2 text-xs font-black text-white hover:bg-[#523020] transition shadow-md"
                    >
                      <Plus size={16} /> Add New Table
                    </button>
                  </>
                ) : (
                  <button
                    onClick={fetchAdminSpaceBookings}
                    disabled={spaceLoading}
                    className="flex items-center gap-2 rounded-xl border border-[#6B3F2A]/30 bg-white px-4 py-2 text-xs font-bold text-[#6B3F2A] hover:bg-[#6B3F2A]/5 transition"
                  >
                    <RefreshCw size={14} className={spaceLoading ? "animate-spin" : ""} /> Refresh Bookings
                  </button>
                )}
              </div>
            </div>

            {/* ── SUB-TAB 1: TABLES SEATING LAYOUT ────────────────────────────────────────── */}
            {spaceSubTab === "tables" && (
              <div>
                {/* Metric Summary Cards */}
                <div className="grid gap-4 sm:grid-cols-4 mb-6">
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
                    <p className="text-[10px] font-black uppercase text-emerald-800 tracking-wider">Available Tables</p>
                    <p className="text-2xl font-black text-emerald-900 mt-1">
                      {adminTables.filter((t) => t.status === "Available").length}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-red-200 bg-red-50/50 p-4">
                    <p className="text-[10px] font-black uppercase text-red-800 tracking-wider">Occupied / Reserved</p>
                    <p className="text-2xl font-black text-red-900 mt-1">
                      {adminTables.filter((t) => t.status === "Reserved" || t.status === "Occupied").length}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4">
                    <p className="text-[10px] font-black uppercase text-amber-800 tracking-wider">Maintenance</p>
                    <p className="text-2xl font-black text-amber-900 mt-1">
                      {adminTables.filter((t) => t.status === "Maintenance").length}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[#D4A85A]/30 bg-[#1E0E07] p-4 text-[#FAF5EB]">
                    <p className="text-[10px] font-black uppercase text-[#D4A85A] tracking-wider">Total Seating Seats</p>
                    <p className="text-2xl font-black text-[#FAF5EB] mt-1">
                      {adminTables.reduce((acc, t) => acc + (t.capacity || 1), 0)} Seats
                    </p>
                  </div>
                </div>

                {tablesLoading && adminTables.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 size={32} className="animate-spin text-[#6B3F2A]" />
                  </div>
                ) : adminTables.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-8">
                    <Coffee size={40} className="mb-2 text-[#D4A85A]/40" />
                    <p className="text-sm font-bold text-gray-500">No seating tables found.</p>
                    <button
                      onClick={() => setTableModalOpen(true)}
                      className="mt-3 rounded-xl bg-[#6B3F2A] px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-[#523020]"
                    >
                      + Add First Cafe Table
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {adminTables.map((table) => {
                      const isAvail = table.status === "Available";
                      const isOccupied = table.status === "Occupied" || table.status === "Reserved";

                      return (
                        <div
                          key={table._id}
                          className={`relative rounded-2xl border p-5 shadow-sm transition-all hover:shadow-md ${
                            isAvail
                              ? "border-emerald-200 bg-white"
                              : isOccupied
                              ? "border-red-200 bg-red-50/20"
                              : "border-amber-200 bg-amber-50/20"
                          }`}
                        >
                          <div className="flex items-start justify-between border-b border-gray-100 pb-3 mb-3">
                            <div>
                              <span className="rounded-full bg-[#6B3F2A]/10 px-2.5 py-0.5 text-[10px] font-black text-[#6B3F2A] uppercase">
                                {table.spaceType}
                              </span>
                              <h3 className="text-base font-black text-[#2C1810] mt-1">{table.tableNumber}</h3>
                            </div>
                            <span
                              className={`rounded-full px-3 py-1 text-[11px] font-black uppercase ${
                                isAvail
                                  ? "bg-emerald-100 text-emerald-800"
                                  : isOccupied
                                  ? "bg-red-100 text-red-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {table.status}
                            </span>
                          </div>

                          <div className="space-y-1.5 text-xs mb-4">
                            <p className="text-gray-600 font-medium">
                              <strong>Capacity:</strong> 👥 {table.capacity} {table.capacity === 1 ? "Person / Desk" : "Seats"}
                            </p>
                            {table.notes && (
                              <p className="text-gray-500 text-[11px] italic">
                                📌 {table.notes}
                              </p>
                            )}
                          </div>

                          {/* Quick Status Toggle Buttons */}
                          <div className="border-t border-gray-100 pt-3">
                            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Change Reservation Status:</p>
                            <div className="grid grid-cols-2 gap-1.5">
                              {["Available", "Reserved", "Occupied", "Maintenance"].map((st) => (
                                <button
                                  key={st}
                                  onClick={() => handleUpdateTableStatus(table._id, st)}
                                  className={`rounded-lg py-1 px-2 text-[10px] font-bold transition ${
                                    table.status === st
                                      ? "bg-[#2C1810] text-white shadow-sm ring-1 ring-[#2C1810]"
                                      : "border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100"
                                  }`}
                                >
                                  {st}
                                </button>
                              ))}
                            </div>
                          </div>

                          <button
                            onClick={() => handleDeleteTable(table._id)}
                            className="absolute top-4 right-4 text-gray-300 hover:text-red-600 transition p-1"
                            title="Remove Table"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── SUB-TAB 2: PRE-BOOKINGS LIST ────────────────────────────────────────── */}
            {spaceSubTab === "bookings" && (
              <div>
                {spaceLoading && spaceBookings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24">
                    <Loader2 size={32} className="animate-spin text-[#6B3F2A]" />
                  </div>
                ) : spaceBookings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 text-center">
                    <Tag size={48} className="mb-3 text-[#D4A85A]/40" />
                    <p className="text-base font-bold text-[#2C1810]/50">No customer pre-bookings found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {spaceBookings.map((b) => (
                      <div key={b._id} className="rounded-2xl border border-[#D4A85A]/25 bg-white p-5 shadow-sm">
                        <div className="flex justify-between items-center border-b border-[#D4A85A]/15 pb-3 mb-3">
                          <div>
                            <span className="text-sm font-black text-[#6B3F2A]">#{b.bookingNumber}</span>
                            <span className="ml-3 text-xs font-semibold text-[#2C1810]/60">
                              {b.customerName} ({b.customerEmail || b.customerPhone || "Guest"})
                            </span>
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
          <CafeAdminMenuManagement showToast={showToast} />
        )}
      </main>

      {/* ── UPDATE POST MODAL ───────────────────────────────────── */}
      <AnimatePresence>
        {updateModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto" data-lenis-prevent="true">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setUpdateModalOpen(false)}
              className="fixed inset-0 bg-[#2C1810]/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="relative z-10 w-full max-w-xl rounded-3xl bg-white p-7 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4 shrink-0">
                <div>
                  <h3 className="text-base font-black text-[#2C1810]">
                    {editUpdateItem ? "Edit Update Post" : "Post New Cafe Update"}
                  </h3>
                  <p className="text-[11px] text-gray-400">Upload banner image &amp; preview live card layout</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowUpdatePreview(!showUpdatePreview)}
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                      showUpdatePreview
                        ? "bg-[#6B3F2A] text-[#FAF5EB] shadow-sm"
                        : "border border-[#6B3F2A]/30 text-[#6B3F2A] hover:bg-[#6B3F2A]/10"
                    }`}
                  >
                    <Eye size={14} /> {showUpdatePreview ? "Hide Preview" : "Live Preview"}
                  </button>
                  <button onClick={() => setUpdateModalOpen(false)} className="rounded-full p-1 hover:bg-gray-100">
                    <X size={18} className="text-gray-500" />
                  </button>
                </div>
              </div>

              {/* ── LIVE PREVIEW BOX ────────────────────────────────────────── */}
              {showUpdatePreview && (
                <div className="mb-4 rounded-2xl border border-[#D4A85A]/40 bg-[#1E0E07] p-4 text-[#FAF5EB] shadow-lg shrink-0">
                  <p className="text-[10px] font-black uppercase text-[#D4A85A] tracking-wider mb-2 flex items-center gap-1">
                    <Eye size={12} /> Live Card Preview (How it will look on /cafe/updates)
                  </p>
                  {updateForm.imageUrl && (
                    <div className="relative h-36 w-full overflow-hidden rounded-xl mb-3">
                      <img src={updateForm.imageUrl} alt="Preview" className="h-full w-full object-cover" />
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="rounded-full bg-[#D4A85A] px-2.5 py-0.5 text-[10px] font-black text-[#140803] uppercase">
                      {updateForm.category}
                    </span>
                    {updateForm.isPinned && (
                      <span className="rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 text-[10px] font-black uppercase">
                        Pinned
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-black text-[#FAF5EB] leading-tight">
                    {updateForm.title || "Announcement Title..."}
                  </h4>
                  <p className="text-xs text-[#FAF5EB]/70 mt-1 line-clamp-2">
                    {updateForm.content || "Post content details will render here..."}
                  </p>
                </div>
              )}

              <form onSubmit={handleSaveUpdate} className="space-y-4 overflow-y-auto pr-1.5 custom-scrollbar flex-1 min-h-0" data-lenis-prevent="true">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-500 mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="Update Title..."
                    value={updateForm.title}
                    onChange={(e) => setUpdateForm({ ...updateForm, title: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 p-2.5 text-xs font-bold text-[#2C1810]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-500 mb-1">Category</label>
                  <select
                    value={updateForm.category}
                    onChange={(e) => setUpdateForm({ ...updateForm, category: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 p-2.5 text-xs font-bold text-[#2C1810]"
                  >
                    <option value="Announcement">Announcement</option>
                    <option value="Special Offer">Special Offer</option>
                    <option value="New Arrival">New Arrival</option>
                    <option value="Event">Event</option>
                    <option value="Notice">Notice</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-500 mb-1">Upload Featured Image (PNG, JPG, WEBP &lt; 2MB)</label>
                  <ImageUploadField
                    imageUrl={updateForm.imageUrl}
                    onUploadSuccess={(url) => setUpdateForm({ ...updateForm, imageUrl: url })}
                    onRemove={() => setUpdateForm({ ...updateForm, imageUrl: "" })}
                    setFormError={() => {}}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-500 mb-1">Content *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Write announcement details..."
                    value={updateForm.content}
                    onChange={(e) => setUpdateForm({ ...updateForm, content: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 p-2.5 text-xs font-semibold text-[#2C1810]"
                  />
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-[#2C1810] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={updateForm.isPinned}
                      onChange={(e) => setUpdateForm({ ...updateForm, isPinned: e.target.checked })}
                      className="h-4 w-4 rounded accent-[#6B3F2A]"
                    />
                    Pin Announcement
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-[#2C1810] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={updateForm.isPublished}
                      onChange={(e) => setUpdateForm({ ...updateForm, isPublished: e.target.checked })}
                      className="h-4 w-4 rounded accent-[#6B3F2A]"
                    />
                    Publish Immediately
                  </label>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setUpdateModalOpen(false)}
                    className="flex-1 rounded-xl border border-gray-200 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingUpdate}
                    className="flex-1 rounded-xl bg-[#6B3F2A] py-2.5 text-xs font-bold text-white hover:bg-[#523020] transition disabled:opacity-50"
                  >
                    {savingUpdate ? "Saving Post..." : editUpdateItem ? "Update Post" : "Publish Update"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── ADD NEW CAFE TABLE MODAL ────────────────────────────── */}
      <AnimatePresence>
        {tableModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto" data-lenis-prevent="true">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setTableModalOpen(false)}
              className="fixed inset-0 bg-[#2C1810]/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="relative z-10 w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4 shrink-0">
                <div>
                  <h3 className="text-base font-black text-[#2C1810]">Add New Cafe Table</h3>
                  <p className="text-[11px] text-gray-400">Configure seating capacity &amp; space type</p>
                </div>
                <button onClick={() => setTableModalOpen(false)} className="rounded-full p-1 hover:bg-gray-100">
                  <X size={18} className="text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleCreateTable} className="space-y-4 overflow-y-auto pr-1 custom-scrollbar">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-500 mb-1">Table Number / Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Table R-03, Desk W-03..."
                    value={newTableForm.tableNumber}
                    onChange={(e) => setNewTableForm({ ...newTableForm, tableNumber: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 p-2.5 text-xs font-bold text-[#2C1810]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-500 mb-1">Space Corner Type</label>
                  <select
                    value={newTableForm.spaceType}
                    onChange={(e) => setNewTableForm({ ...newTableForm, spaceType: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 p-2.5 text-xs font-bold text-[#2C1810]"
                  >
                    <option value="Book Reader's Corner">Book Reader's Corner</option>
                    <option value="Book Writer's Corner">Book Writer's Corner</option>
                    <option value="Artist Corner">Artist Corner</option>
                    <option value="Group Discussion Pod">Group Discussion Pod</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-500 mb-1">Capacity (Number of Seats / Desks)</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    required
                    value={newTableForm.capacity}
                    onChange={(e) => setNewTableForm({ ...newTableForm, capacity: Number(e.target.value) })}
                    className="w-full rounded-xl border border-gray-200 p-2.5 text-xs font-bold text-[#2C1810]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-500 mb-1">Notes / Equipment (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Near window, Power Socket, Leather Recliner..."
                    value={newTableForm.notes}
                    onChange={(e) => setNewTableForm({ ...newTableForm, notes: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 p-2.5 text-xs font-semibold text-[#2C1810]"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setTableModalOpen(false)}
                    className="flex-1 rounded-xl border border-gray-200 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-[#6B3F2A] py-2.5 text-xs font-bold text-white hover:bg-[#523020] transition"
                  >
                    Add Table
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
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


