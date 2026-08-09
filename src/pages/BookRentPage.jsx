import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Clock, AlertTriangle, ShieldCheck, Search, Filter, CheckCircle2, ArrowRight, Sparkles, CreditCard, FileText, Eye } from "lucide-react";
import PageTransition from "../components/PageTransition.jsx";
import FooterSection from "../sections/FooterSection.jsx";
import RentalCheckoutModal from "../components/RentalCheckoutModal.jsx";
import AuthModal from "../components/AuthModal.jsx";
import { API_BASE, SERVER_URL } from "../config.js";

export default function BookRentPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedBookForRent, setSelectedBookForRent] = useState(null);
  const [directCardMode, setDirectCardMode] = useState(false);
  const [userLibraryCard, setUserLibraryCard] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState(null);
  const [notification, setNotification] = useState("");

  const fetchRentalCatalog = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/rentals/catalog`);
      const data = await res.json();
      if (data.success) {
        setBooks(data.books || []);
      }
    } catch {
      console.error("Failed to load rental catalog.");
    } finally {
      setLoading(false);
    }
  };

  const checkUserSession = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, { credentials: "include" });
      const data = await res.json();
      if (data?.success && data.user) {
        setUser(data.user);
        return data.user;
      } else {
        setUser(null);
        return null;
      }
    } catch {
      setUser(null);
      return null;
    }
  };

  const checkUserLibraryCard = async () => {
    try {
      const res = await fetch(`${API_BASE}/library-card/my-card`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        if (data?.success && data.hasCard && data.libraryCard && !data.isSuspended) {
          setUserLibraryCard(data.libraryCard);
          return data.libraryCard;
        }
      }
      setUserLibraryCard(null);
      return null;
    } catch {
      setUserLibraryCard(null);
      return null;
    }
  };

  useEffect(() => {
    fetchRentalCatalog();
    checkUserSession();
    checkUserLibraryCard();
  }, []);

  const handleOpenRental = async (book) => {
    const currentUser = await checkUserSession();
    await checkUserLibraryCard();
    setSelectedBookForRent(book);
    setDirectCardMode(false);

    if (currentUser) {
      setIsModalOpen(true);
    } else {
      setShowAuthModal(true);
    }
  };

  const handleBuyCardDirectly = async () => {
    const currentUser = await checkUserSession();
    await checkUserLibraryCard();
    setSelectedBookForRent(null);
    setDirectCardMode(true);

    if (currentUser) {
      setIsModalOpen(true);
    } else {
      setShowAuthModal(true);
    }
  };

  const handleAuthClose = (loggedInUser) => {
    setShowAuthModal(false);
    if (loggedInUser) {
      setUser(loggedInUser);
      checkUserLibraryCard();
      setIsModalOpen(true);
    }
  };

  const handleRentalSuccess = (result) => {
    setNotification(result.message || "🎉 Book rented successfully!");
    fetchRentalCatalog();
    checkUserLibraryCard();
    setTimeout(() => setNotification(""), 6000);
  };

  // Filter books
  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ["All", ...new Set(books.map((b) => b.category).filter(Boolean))];

  return (
    <PageTransition>
      <main className="relative min-h-screen overflow-hidden pt-28 pb-16">
        {/* Background Ambient Glows */}
        <div className="pointer-events-none absolute left-[-10%] top-16 h-[34rem] w-[34rem] rounded-full bg-emerald-500/10 blur-[180px]" />
        <div className="pointer-events-none absolute right-[-10%] top-96 h-[32rem] w-[32rem] rounded-full bg-cyan-500/10 blur-[180px]" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Notification Toast */}
          <AnimatePresence>
            {notification && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-8 rounded-2xl border border-emerald-400/40 bg-emerald-950/80 p-4 text-center text-sm font-bold text-emerald-300 shadow-xl backdrop-blur-md"
              >
                {notification}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ════════════ HERO HEADER (MATCHING LIBRARY STYLING) ════════════ */}
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center py-6">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-7 space-y-5"
            >
              <div className="inline-flex items-center gap-2.5 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-4 py-1.5 backdrop-blur-md shadow-glow">
                <Sparkles size={14} className="text-emerald-400" />
                <span className="text-[11px] font-black uppercase tracking-[0.35em] text-emerald-300">
                  PREMIUM BOOK RENTALS
                </span>
              </div>

              <h1 className="text-4xl font-black uppercase leading-[1.08] text-white sm:text-6xl md:text-7xl">
                RENT BOOKS<br />
                <span className="bg-gradient-to-r from-emerald-300 via-teal-200 via-cyan-300 via-emerald-400 to-emerald-300 bg-clip-text text-transparent drop-shadow-lg animate-text-gradient">
                  Read More. Spend Less.
                </span>
              </h1>

              <p className="max-w-xl text-sm leading-relaxed text-white/75 sm:text-base md:text-lg">
                Access selected physical and digital titles for 15 days at nominal costs. Enjoy affordable reading delivered straight to your doorstep across Tripura with zero security deposit.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a
                  href="#rental-catalog"
                  className="rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 px-7 py-3.5 text-xs font-black uppercase tracking-wider text-black shadow-lg shadow-emerald-400/25 transition hover:scale-105"
                >
                  Explore Rental Books
                </a>
              </div>
            </motion.div>

            {/* Stats Grid Right Side */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-5 grid grid-cols-2 gap-4"
            >
              <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-black/40 p-5 text-left backdrop-blur-xl shadow-xl">
                <BookOpen className="h-6 w-6 text-emerald-400 mb-2" />
                <div className="text-2xl sm:text-3xl font-black text-white">₹50</div>
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-white/50">Rental Fee / Book</div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-black/40 p-5 text-left backdrop-blur-xl shadow-xl">
                <Clock className="h-6 w-6 text-cyan-400 mb-2" />
                <div className="text-2xl sm:text-3xl font-black text-white">15 Days</div>
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-white/50">Rental Period</div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-black/40 p-5 text-left backdrop-blur-xl shadow-xl">
                <AlertTriangle className="h-6 w-6 text-amber-400 mb-2" />
                <div className="text-2xl sm:text-3xl font-black text-white">₹5/day</div>
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-white/50">Late Fine</div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-black/40 p-5 text-left backdrop-blur-xl shadow-xl">
                <ShieldCheck className="h-6 w-6 text-emerald-400 mb-2" />
                <div className="text-2xl sm:text-3xl font-black text-white">₹0</div>
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-white/50">Security Deposit</div>
              </div>
            </motion.div>
          </div>

          {/* ════════════ HERO DIGITAL LIBRARY CARD CTA ════════════ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6 rounded-3xl border border-emerald-400/40 bg-gradient-to-r from-emerald-950/80 via-zinc-950 to-teal-950/80 p-6 shadow-2xl backdrop-blur-xl md:p-7"
          >
            {userLibraryCard ? (
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3.5 py-1 text-[11px] font-black uppercase tracking-wider text-emerald-300">
                    <CheckCircle2 size={14} className="text-emerald-400" /> ACTIVE DIGITAL LIBRARY CARD
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white">
                    Membership Active: <span className="text-emerald-300 tracking-wider">{userLibraryCard.cardId}</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-white/75 max-w-2xl leading-relaxed">
                    Your digital library card is active and verified. You can rent any available book from the catalog below with 15-day rental windows.
                  </p>
                </div>

                <a
                  href={`${API_BASE}/library-card/download/${userLibraryCard.cardId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 rounded-2xl border border-emerald-400/40 bg-emerald-400/10 px-6 py-3.5 text-xs font-black uppercase tracking-wider text-emerald-300 shadow-lg shadow-emerald-400/10 transition hover:bg-emerald-400/20 hover:scale-105 flex items-center gap-2"
                >
                  <FileText size={16} /> View Card PDF
                </a>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3.5 py-1 text-[11px] font-black uppercase tracking-wider text-emerald-300">
                    <CreditCard size={14} /> DIGITAL LIBRARY CARD REQUIRED FOR RENTALS
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white">
                    Buy Digital Library Card for <span className="text-amber-300">₹1</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-white/75 max-w-2xl leading-relaxed">
                    A valid Digital Library Card is required to rent books. Get instant lifetime valid digital membership card with unique Card ID &amp; scannable QR code.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <a
                    href={`${API_BASE}/library-card/download/demo`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-2xl border border-emerald-400/40 bg-emerald-400/10 px-5 py-4 text-xs font-black uppercase tracking-wider text-emerald-300 shadow-lg shadow-emerald-400/10 transition hover:bg-emerald-400/20 hover:scale-105 flex items-center gap-2"
                  >
                    <Eye size={16} /> View Demo Card
                  </a>

                  <button
                    type="button"
                    onClick={handleBuyCardDirectly}
                    className="rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 px-7 py-4 text-xs font-black uppercase tracking-wider text-black shadow-xl shadow-emerald-400/25 transition hover:scale-105 cursor-pointer flex items-center gap-2"
                  >
                    <CreditCard size={16} /> Buy Library Card Now (₹1)
                  </button>
                </div>
              </div>
            )}
          </motion.div>

          {/* ════════════ RENTAL RULES BANNER ════════════ */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-10 rounded-3xl border border-emerald-400/30 bg-gradient-to-br from-emerald-950/60 via-zinc-950 to-cyan-950/60 p-6 shadow-2xl backdrop-blur-xl md:p-8"
          >
            <h2 className="mb-5 text-xs font-black uppercase tracking-[0.35em] text-emerald-400 text-center sm:text-left flex items-center gap-2">
              <ShieldCheck size={16} /> Rental Rules &amp; Policies
            </h2>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-start gap-3.5 rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-emerald-400/30">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-emerald-400/30 bg-emerald-400/15 text-emerald-300 font-extrabold text-sm">
                  ₹50
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-white">Rental Fee</h3>
                  <p className="text-[11px] text-white/60 mt-0.5 leading-relaxed">₹50 per book for full 15-day rental period</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-cyan-400/30">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-cyan-400/30 bg-cyan-400/15 text-cyan-300 font-extrabold text-sm">
                  15D
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-white">Rental Duration</h3>
                  <p className="text-[11px] text-white/60 mt-0.5 leading-relaxed">15 days maximum reading window</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-amber-400/30">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-amber-400/30 bg-amber-400/15 text-amber-300 font-extrabold text-sm">
                  15D
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-white">Return Deadline</h3>
                  <p className="text-[11px] text-white/60 mt-0.5 leading-relaxed">Submit return request within 15 days</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-red-400/30">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-red-400/30 bg-red-400/15 text-red-300 font-extrabold text-sm">
                  ₹5/d
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-white">Late Fine</h3>
                  <p className="text-[11px] text-white/60 mt-0.5 leading-relaxed">₹5 / day late fine after 15-day return deadline</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ════════════ SEARCH & FILTER CONTROLS ════════════ */}
          <div id="rental-catalog" className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search rental books by title or author..."
                className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-xs text-white placeholder-white/30 outline-none transition focus:border-emerald-400 focus:bg-white/10"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
              <Filter size={16} className="text-white/40 shrink-0" />
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-xl px-3.5 py-2 text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-emerald-400 text-black shadow-lg shadow-emerald-400/20"
                      : "border border-white/10 bg-white/5 text-white/65 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* ════════════ RENTAL CATALOG GRID ════════════ */}
          <div className="mt-8">
            {loading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-96 animate-pulse rounded-3xl border border-white/10 bg-white/5" />
                ))}
              </div>
            ) : filteredBooks.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center">
                <BookOpen size={48} className="mx-auto text-white/20 mb-4" />
                <h3 className="text-lg font-bold text-white">No Rental Books Found</h3>
                <p className="text-xs text-white/50 mt-1">
                  {searchQuery ? "Try refining your search terms." : "No books listed for rent under this category yet."}
                </p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredBooks.map((book) => {
                  const isAvailable = book.rentalStatus === "available";
                  const isOnRent = book.rentalStatus === "on_rent";
                  const isReturnPending = book.rentalStatus === "return_requested";

                  // Days remaining until return calculation
                  let daysRemaining = null;
                  let expectedReturnFormatted = null;
                  if (book.expectedReturnDate) {
                    const returnDate = new Date(book.expectedReturnDate);
                    const now = new Date();
                    const diffTime = returnDate - now;
                    daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
                    expectedReturnFormatted = returnDate.toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    });
                  }

                  return (
                    <motion.div
                      key={book._id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ y: -6 }}
                      className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-zinc-950 p-5 shadow-xl backdrop-blur-md transition hover:border-emerald-400/40"
                    >
                      {/* STATUS BADGE AT TOP */}
                      <div className="mb-4 flex items-center justify-between">
                        {isAvailable ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-400/15 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-300">
                            <CheckCircle2 size={12} /> AVAILABLE FOR RENT
                          </span>
                        ) : isOnRent ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-red-400/40 bg-red-400/15 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-red-300">
                            🔴 ON RENT
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-400/15 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-300">
                            🟡 RETURN PENDING
                          </span>
                        )}

                        <span className="text-[11px] font-bold text-white/50">{book.category}</span>
                      </div>

                      {/* COVER & TITLE SECTION */}
                      <div className="flex gap-4">
                        {book.cover?.url ? (
                          <img
                            src={book.cover.url.startsWith("http") ? book.cover.url : `${SERVER_URL}${book.cover.url}`}
                            alt={book.title}
                            className="h-32 w-24 rounded-xl object-cover shadow-lg shrink-0 transition group-hover:scale-105"
                          />
                        ) : (
                          <div className="grid h-32 w-24 place-items-center rounded-xl bg-zinc-800 text-xs font-bold text-white/40 shrink-0">
                            BOOK
                          </div>
                        )}

                        <div className="flex flex-col justify-between overflow-hidden">
                          <div>
                            <h3 className="font-black text-white text-base leading-snug line-clamp-2">{book.title}</h3>
                            <p className="mt-1 text-xs text-white/60 line-clamp-1">by {book.author}</p>
                          </div>

                          <div className="mt-3">
                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                              Rent Fee
                            </p>
                            <p className="text-xl font-black text-white">
                              ₹{book.rentalPrice || 50} <span className="text-xs font-normal text-white/50">/ 15 Days</span>
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* RENTAL DETAILS / STATUS SUMMARY */}
                      <div className="mt-5 border-t border-white/10 pt-4">
                        {isAvailable ? (
                          <button
                            type="button"
                            onClick={() => handleOpenRental(book)}
                            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-400 py-3 text-xs font-black uppercase tracking-wider text-black shadow-lg shadow-emerald-400/20 transition hover:bg-emerald-300 cursor-pointer"
                          >
                            Rent This Book <ArrowRight size={14} />
                          </button>
                        ) : isOnRent ? (
                          <div className="rounded-2xl border border-red-500/20 bg-red-950/20 p-3 text-xs space-y-1">
                            <div className="flex items-center justify-between text-red-300 font-extrabold">
                              <span>Available within:</span>
                              <span>{daysRemaining !== null ? `${daysRemaining} Days` : "15 Days"}</span>
                            </div>
                            {expectedReturnFormatted && (
                              <p className="text-[11px] text-white/60">
                                Expected Return: <span className="text-white font-medium">{expectedReturnFormatted}</span>
                              </p>
                            )}
                            <button
                              disabled
                              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 py-2 text-[11px] font-bold text-white/40 cursor-not-allowed"
                            >
                              Currently Unavailable
                            </button>
                          </div>
                        ) : (
                          <div className="rounded-2xl border border-amber-500/20 bg-amber-950/20 p-3 text-xs space-y-1">
                            <p className="font-extrabold text-amber-300">Return Verification Pending</p>
                            <p className="text-[11px] text-white/60">Being inspected by admin for re-listing.</p>
                            <button
                              disabled
                              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 py-2 text-[11px] font-bold text-white/40 cursor-not-allowed"
                            >
                              Return Pending
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RENTAL CHECKOUT MODAL */}
        <RentalCheckoutModal
          book={selectedBookForRent}
          directCardMode={directCardMode}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedBookForRent(null);
            setDirectCardMode(false);
          }}
          onSuccess={handleRentalSuccess}
        />

        {/* AUTHENTICATION MODAL */}
        {showAuthModal && (
          <AuthModal onClose={handleAuthClose} initialTab="login" />
        )}
      </main>

      <FooterSection />
    </PageTransition>
  );
}
