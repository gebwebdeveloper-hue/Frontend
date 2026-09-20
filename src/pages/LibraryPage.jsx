import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useParams } from "react-router-dom";
import {
  BookOpen,
  Users,
  Download,
  Star,
  ShoppingCart,
  Search,
  X,
  Filter,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from "lucide-react";
import PageTransition from "../components/PageTransition.jsx";
import FooterSection from "../sections/FooterSection.jsx";
import ContinueReadingSection from "../sections/ContinueReadingSection.jsx";
import PopularAuthorsSection from "../sections/PopularAuthorsSection.jsx";
import PublicationsAuthorsSection from "../sections/PublicationsAuthorsSection.jsx";
import LibraryFeaturedSection from "../sections/LibraryFeaturedSection.jsx";
import BookCard from "../components/BookCard.jsx";
import CartModal from "../components/CartModal.jsx";
import MyOrdersModal from "../components/MyOrdersModal.jsx";
import { getCart } from "../utils/cart.js";
import { API_BASE } from "../config.js";

const STAT_ICONS = [BookOpen, Users, Download, Star];
const STAT_LABELS = ["eBooks", "Authors", "Downloads", "Average Rating"];
const STAT_SUFFIXES = ["+", "+", "+", "★"];
const STAT_KEYS = ["books", "authors", "approvedPurchases", "rating"];

function StatCard({ icon: Icon, value, label, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.08 }}
      className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.04] px-5 py-3.5 backdrop-blur-sm"
    >
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/5">
        <Icon size={16} className="text-cyan-300" />
      </div>
      <div>
        <p className="text-base font-extrabold leading-none text-white">{value}</p>
        <p className="mt-0.5 text-[10px] font-medium text-white/45">{label}</p>
      </div>
    </motion.div>
  );
}

export default function LibraryPage() {
  const [searchParams] = useSearchParams();
  const { id: routeBookId } = useParams();
  const targetBookParam = searchParams.get("book") || routeBookId;
  const [sharedBook, setSharedBook] = useState(null);
  const [authUser, setAuthUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [stats, setStats] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [ordersOpen, setOrdersOpen] = useState(false);

  // Search & Catalog Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [allBooks, setAllBooks] = useState([]);
  const [loadingAllBooks, setLoadingAllBooks] = useState(false);
  const [categoriesList, setCategoriesList] = useState(["All"]);

  // Category scroll navigation state
  const categoryScrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkCategoryScroll = () => {
    if (!categoryScrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = categoryScrollRef.current;
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 6);
  };

  useEffect(() => {
    checkCategoryScroll();
    window.addEventListener("resize", checkCategoryScroll);
    return () => window.removeEventListener("resize", checkCategoryScroll);
  }, [categoriesList]);

  const scrollCategories = (direction) => {
    if (!categoryScrollRef.current) return;
    const offset = direction === "left" ? -240 : 240;
    categoryScrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    setTimeout(checkCategoryScroll, 300);
  };

  useEffect(() => {
    if (!targetBookParam) {
      setSharedBook(null);
      return;
    }

    let isMounted = true;
    fetch(`${API_BASE}/books/${encodeURIComponent(targetBookParam)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.success && data.book) {
          setSharedBook(data.book);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch shared book:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [targetBookParam]);

  const updateCartCount = () => {
    setCartCount(getCart().length);
  };

  useEffect(() => {
    updateCartCount();
    window.addEventListener("lekhak:cart-updated", updateCartCount);
    return () => window.removeEventListener("lekhak:cart-updated", updateCartCount);
  }, []);

  // Auth check
  useEffect(() => {
    fetch(`${API_BASE}/auth/me`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.user) setAuthUser(d.user);
      })
      .catch(() => {})
      .finally(() => setCheckingAuth(false));
  }, []);

  // Fetch analytics stats & full books catalog
  useEffect(() => {
    setLoadingAllBooks(true);
    Promise.all([
      fetch(`${API_BASE}/books?limit=1000`).then((r) => r.json()),
      fetch(`${API_BASE}/authors`).then((r) => r.json()).catch(() => ({ authors: [] })),
      fetch(`${API_BASE}/categories`).then((r) => r.json()).catch(() => ({ categories: [] }))
    ])
      .then(([booksData, authorsData, catsData]) => {
        const books = booksData.success ? booksData.books || [] : [];
        setAllBooks(books);

        setStats({
          books: booksData.pagination?.total ?? books.length ?? 0,
          authors: authorsData.authors?.length ?? 0,
          approvedPurchases: null,
          rating: "4.8",
        });

        const fetchedCats = catsData.success && Array.isArray(catsData.categories)
          ? catsData.categories.map((c) => (typeof c === "string" ? c : c?.name)).filter(Boolean)
          : [];

        const bookCats = [...new Set(books.map((b) => b.category).filter(Boolean))];
        const combinedCats = ["All", ...new Set([...fetchedCats, ...bookCats])];
        setCategoriesList(combinedCats);
      })
      .catch((err) => {
        console.error("Failed to fetch library catalog:", err);
      })
      .finally(() => {
        setLoadingAllBooks(false);
      });
  }, []);

  const statItems = [
    {
      label: "eBooks",
      value: stats ? `${stats.books}` : "—",
      suffix: "+",
      Icon: BookOpen,
    },
    {
      label: "Authors",
      value: stats ? `${stats.authors}` : "—",
      suffix: "+",
      Icon: Users,
    },
    {
      label: "Downloads",
      value: "25K",
      suffix: "+",
      Icon: Download,
    },
    {
      label: "Average Rating",
      value: "4.8",
      suffix: "★",
      Icon: Star,
    },
  ];

  // Filtering logic
  const filteredBooks = allBooks.filter((b) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      (b.title && b.title.toLowerCase().includes(q)) ||
      (b.author && b.author.toLowerCase().includes(q)) ||
      (b.category && b.category.toLowerCase().includes(q)) ||
      (b.description && b.description.toLowerCase().includes(q)) ||
      (b.slug && b.slug.toLowerCase().includes(q));

    const matchesCategory =
      selectedCategory === "All" ||
      (b.category && b.category.toLowerCase() === selectedCategory.toLowerCase());

    return matchesQuery && matchesCategory;
  });

  const isFiltering = searchQuery.trim().length > 0 || selectedCategory !== "All";

  return (
    <PageTransition>
      <div className="relative min-h-screen overflow-hidden">
        {/* Background glows */}
        <div className="pointer-events-none absolute left-0 top-0 h-[600px] w-[600px] rounded-full bg-cyan-500/8 blur-[180px]" />
        <div className="pointer-events-none absolute right-0 top-40 h-[400px] w-[400px] rounded-full bg-indigo-500/8 blur-[150px]" />

        <div className="mx-auto max-w-7xl px-5 pb-24 pt-32">

          {/* ─────────── HERO BANNER ─────────── */}
          <div className="mb-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex-1"
            >
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.35em] text-cyan-300/80">
                Premium Library
              </p>
              <h1 className="text-4xl font-black leading-[1.1] text-white md:text-6xl lg:text-7xl">
                BUY BOOKS<br />
                <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-fuchsia-500 bg-clip-text text-transparent animate-text-gradient text-3xl sm:text-5xl md:text-5xl lg:text-6xl">
                  E-Book - Paperback - Hardcover
                </span>
              </h1>
              <p className="mt-4 max-w-lg text-sm leading-6 text-white/50">
                Discover thousands of premium ebooks, track your reading journey, and explore your favourite authors — all in one place.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setCartOpen(true)}
                  className="group flex items-center gap-2.5 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500 px-6 py-3 text-xs font-extrabold uppercase tracking-wider text-black shadow-lg shadow-cyan-500/20 hover:scale-105 transition"
                >
                  <ShoppingCart size={18} />
                  My Cart
                  {cartCount > 0 && (
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-black text-[10px] font-black text-cyan-300">
                      {cartCount}
                    </span>
                  )}
                </button>
              </div>

              {/* ─────────── SEARCH BAR IN HERO ─────────── */}
              <div className="mt-8 relative max-w-xl">
                <div className="relative flex items-center">
                  <Search className="absolute left-4 w-4 h-4 text-cyan-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search books by title, author, category, or keywords..."
                    className="w-full rounded-2xl border border-white/15 bg-[#0e0e16]/90 backdrop-blur-xl py-3.5 pl-11 pr-11 text-xs sm:text-sm text-white placeholder:text-white/35 focus:border-cyan-400 focus:bg-[#12121e] focus:outline-none shadow-2xl transition duration-300"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3.5 text-white/40 hover:text-white p-1 rounded-lg transition cursor-pointer"
                      title="Clear search"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                {/* Responsive & Attractive Category Filter Navigation */}
                {categoriesList.length > 1 && (
                  <div className="mt-4 relative group/cats">
                    <div className="flex items-center gap-1.5">
                      {/* Left Scroll Arrow */}
                      {canScrollLeft && (
                        <button
                          type="button"
                          onClick={() => scrollCategories("left")}
                          className="absolute -left-3 z-10 grid h-7 w-7 place-items-center rounded-full bg-[#0e0e18]/95 border border-cyan-400/40 text-cyan-300 shadow-xl backdrop-blur-md hover:bg-cyan-400 hover:text-black transition cursor-pointer"
                          title="Scroll Left"
                        >
                          <ChevronLeft size={14} />
                        </button>
                      )}

                      {/* Scrollable Category Pills */}
                      <div
                        ref={categoryScrollRef}
                        onScroll={checkCategoryScroll}
                        className="flex items-center gap-2 overflow-x-auto py-1.5 scrollbar-none no-scrollbar scroll-smooth w-full px-0.5"
                        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                      >
                        <div className="flex items-center gap-2 pl-0.5 pr-0.5">
                          {categoriesList.map((cat) => {
                            const isSelected = selectedCategory === cat;
                            return (
                              <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all duration-300 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                                  isSelected
                                    ? "bg-gradient-to-r from-cyan-400 via-indigo-400 to-fuchsia-500 text-black shadow-lg shadow-cyan-500/25 font-extrabold scale-105"
                                    : "border border-white/10 bg-white/[0.05] text-white/70 hover:border-white/25 hover:bg-white/[0.1] hover:text-white backdrop-blur-md"
                                }`}
                              >
                                <span>{cat}</span>
                                {cat === "All" && (
                                  <span
                                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                                      isSelected ? "bg-black/20 text-black" : "bg-white/10 text-white/60"
                                    }`}
                                  >
                                    {allBooks.length}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Right Scroll Arrow */}
                      {canScrollRight && (
                        <button
                          type="button"
                          onClick={() => scrollCategories("right")}
                          className="absolute -right-3 z-10 grid h-7 w-7 place-items-center rounded-full bg-[#0e0e18]/95 border border-cyan-400/40 text-cyan-300 shadow-xl backdrop-blur-md hover:bg-cyan-400 hover:text-black transition cursor-pointer"
                          title="Scroll Right"
                        >
                          <ChevronRight size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Stats grid */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="grid grid-cols-2 gap-3 lg:grid-cols-2 xl:grid-cols-2 shrink-0"
            >
              {statItems.map((s, i) => (
                <StatCard
                  key={s.label}
                  icon={s.Icon}
                  value={`${s.value}${s.suffix}`}
                  label={s.label}
                  index={i}
                />
              ))}
            </motion.div>
          </div>

          {/* ─────────── LIVE SEARCH RESULTS VIEW OR CURATED SECTIONS ─────────── */}
          {isFiltering ? (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-16 space-y-6 pt-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300/80">Search Results</p>
                  <h2 className="mt-1 text-2xl font-bold text-white">
                    {searchQuery ? `Results for "${searchQuery}"` : `Category: ${selectedCategory}`}
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-white/50 font-medium">
                    Found <span className="text-cyan-300 font-bold">{filteredBooks.length}</span> book{filteredBooks.length === 1 ? "" : "s"}
                  </span>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("All");
                    }}
                    className="text-xs font-bold text-cyan-400 hover:text-cyan-300 underline transition cursor-pointer"
                  >
                    Reset Filter
                  </button>
                </div>
              </div>

              {loadingAllBooks ? (
                <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-96 animate-pulse rounded-3xl border border-white/10 bg-white/5" />
                  ))}
                </div>
              ) : filteredBooks.length === 0 ? (
                <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-12 text-center backdrop-blur-sm">
                  <BookOpen size={48} className="mx-auto text-white/20 mb-4" />
                  <h3 className="text-lg font-bold text-white">No Books Found</h3>
                  <p className="text-xs text-white/50 mt-1 max-w-sm mx-auto">
                    We couldn't find any books matching your search. Try different keywords or reset your category filter.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("All");
                    }}
                    className="mt-5 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition cursor-pointer"
                  >
                    Show All Books
                  </button>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {filteredBooks.map((book) => (
                    <motion.div
                      key={book._id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <BookCard book={book} />
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <>
              {/* ─────────── CONTINUE READING ─────────── */}
              {!checkingAuth && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <ContinueReadingSection authUser={authUser} />
                </motion.div>
              )}

              {/* ─────────── POPULAR AUTHORS ─────────── */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <PopularAuthorsSection />
              </motion.div>

              {/* ─────────── PUBLICATIONS AUTHORS ─────────── */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <PublicationsAuthorsSection />
              </motion.div>

              {/* ─────────── FEATURED EBOOKS ─────────── */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <LibraryFeaturedSection />
              </motion.div>

              {/* ─────────── ALL BOOKS CATALOG ─────────── */}
              {allBooks.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="mt-14"
                >
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300/80">Explore Catalog</p>
                      <h2 className="mt-1 text-2xl font-bold text-white">All Books</h2>
                    </div>
                    <span className="text-xs text-white/40">{allBooks.length} titles</span>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {allBooks.map((book) => (
                      <motion.div
                        key={book._id}
                        whileHover={{ y: -4 }}
                        transition={{ duration: 0.2 }}
                      >
                        <BookCard book={book} />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </>
          )}

        </div>
      </div>
      {/* Shared Book Deep Link Modal Portal */}
      {sharedBook && (
        <div className="hidden" aria-hidden="true">
          <BookCard book={sharedBook} autoOpen={true} />
        </div>
      )}

      <CartModal isOpen={cartOpen} onClose={() => setCartOpen(false)} onOpenOrders={() => setOrdersOpen(true)} />
      <MyOrdersModal isOpen={ordersOpen} onClose={() => setOrdersOpen(false)} />
      <FooterSection />
    </PageTransition>
  );
}
