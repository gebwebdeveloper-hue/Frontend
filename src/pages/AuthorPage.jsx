import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User,
  BookOpen,
  ArrowLeft,
  Search,
  SlidersHorizontal,
  Sparkles,
  Share2,
  Check,
  ShieldCheck,
  Layers,
  ChevronRight
} from "lucide-react";
import PageTransition from "../components/PageTransition.jsx";
import BookCard from "../components/BookCard.jsx";
import FooterSection from "../sections/FooterSection.jsx";
import CartModal from "../components/CartModal.jsx";
import MyOrdersModal from "../components/MyOrdersModal.jsx";
import { getCart } from "../utils/cart.js";
import { API_BASE, SERVER_URL } from "../config.js";

export default function AuthorPage() {
  const { name: paramName, id: paramId } = useParams();
  const navigate = useNavigate();
  const rawIdentifier = paramName || paramId || "";

  const [author, setAuthor] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest"); // "newest", "price-low", "price-high", "title"
  const [copiedLink, setCopiedLink] = useState(false);

  // Cart & Orders Modal support
  const [cartOpen, setCartOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [ordersOpen, setOrdersOpen] = useState(false);

  const updateCartCount = () => {
    setCartCount(getCart().length);
  };

  useEffect(() => {
    updateCartCount();
    window.addEventListener("lekhak:cart-updated", updateCartCount);
    return () => window.removeEventListener("lekhak:cart-updated", updateCartCount);
  }, []);

  useEffect(() => {
    if (!rawIdentifier) {
      setError("No author specified.");
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError("");

    const fetchAuthorAndBooks = async () => {
      try {
        const identifier = encodeURIComponent(rawIdentifier);
        // 1. Fetch Author Profile from API
        const profileRes = await fetch(`${API_BASE}/authors/profile/${identifier}`);
        const profileData = await profileRes.json();

        if (profileData.success && profileData.author) {
          if (!isMounted) return;
          setAuthor(profileData.author);
          setBooks(profileData.author.books || []);
        } else {
          // Fallback: Fetch books directly with author filter
          const booksRes = await fetch(`${API_BASE}/books?author=${identifier}&limit=50`);
          const booksData = await booksRes.json();

          if (!isMounted) return;
          const fallbackName = decodeURIComponent(rawIdentifier).replace(/[-_]/g, " ");
          setAuthor({
            name: fallbackName,
            bio: "Author at Lekhok Tripura Publishers.",
            thumbnail: null,
            bookCount: booksData.books?.length || 0,
            ourPublicationAuthor: true
          });
          setBooks(booksData.books || []);
        }
      } catch (err) {
        console.error("Error loading author page:", err);
        if (isMounted) {
          setError("Unable to load author books. Please check your connection.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAuthorAndBooks();

    return () => {
      isMounted = false;
    };
  }, [rawIdentifier]);

  const handleShare = () => {
    const shareUrl = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const filteredBooks = useMemo(() => {
    let result = [...books];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (b) =>
          b.title?.toLowerCase().includes(q) ||
          b.category?.toLowerCase().includes(q) ||
          b.description?.toLowerCase().includes(q)
      );
    }

    if (sortBy === "newest") {
      result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } else if (sortBy === "price-low") {
      result.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === "price-high") {
      result.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortBy === "title") {
      result.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    }

    return result;
  }, [books, searchQuery, sortBy]);

  const authorThumb = author?.thumbnail?.url
    ? author.thumbnail.url.startsWith("/uploads")
      ? `${SERVER_URL}${author.thumbnail.url}`
      : author.thumbnail.url
    : null;

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#060608] text-gray-100 font-sans selection:bg-[#c8923a]/30 selection:text-[#f3c06b]">
        {/* TOP GLOW BACKGROUND */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-[#c8923a]/15 via-indigo-600/5 to-transparent blur-[140px] pointer-events-none -z-10" />

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Top Breadcrumb & Navigation */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => {
                if (window.history.length > 1) {
                  navigate(-1);
                } else {
                  navigate("/library");
                }
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 backdrop-blur-md transition hover:border-[#c8923a]/40 hover:bg-[#c8923a]/10 hover:text-white"
            >
              <ArrowLeft size={14} className="text-[#f3c06b]" />
              <span>Back</span>
            </button>

            <div className="flex items-center gap-2 text-xs text-white/40 font-medium">
              <Link to="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={12} />
              <Link to="/library" className="hover:text-white transition">Library</Link>
              <ChevronRight size={12} />
              <span className="text-[#f3c06b] font-semibold">{author?.name || "Author"}</span>
            </div>
          </div>

          {/* Loading Skeleton */}
          {loading && (
            <div className="space-y-8 animate-pulse">
              <div className="h-56 rounded-3xl bg-white/[0.04] border border-white/10 p-8" />
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-80 rounded-2xl bg-white/[0.04] border border-white/10" />
                ))}
              </div>
            </div>
          )}

          {/* Error Message */}
          {!loading && error && (
            <div className="my-12 text-center bg-red-950/40 border border-red-800/60 rounded-3xl p-10 max-w-lg mx-auto">
              <p className="text-red-300 text-sm font-semibold">{error}</p>
              <button
                type="button"
                onClick={() => navigate("/library")}
                className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-[#14141f] border border-[#c8923a]/40 rounded-xl text-xs font-bold text-[#f3c06b] hover:bg-[#1f1f2e] transition"
              >
                Return to Library
              </button>
            </div>
          )}

          {/* AUTHOR PROFILE HERO BANNER */}
          {!loading && author && (
            <>
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="relative overflow-hidden rounded-3xl border border-[#c8923a]/30 bg-gradient-to-br from-[#12121c] via-[#0b0b10] to-[#07070b] p-6 md:p-10 shadow-2xl mb-10"
              >
                {/* Decorative background glow */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#c8923a]/10 blur-[100px] rounded-full pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10">
                  {/* Author Thumbnail / Avatar */}
                  <div className="relative shrink-0">
                    <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden border-2 border-[#c8923a]/50 p-1 bg-[#161622] shadow-[0_0_30px_rgba(200,146,58,0.2)]">
                      {authorThumb ? (
                        <img
                          src={authorThumb}
                          alt={author.name}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#2a2a3a] to-[#12121a] rounded-xl text-[#f3c06b]">
                          <User size={48} className="text-[#f3c06b]/70" />
                          <span className="text-xs font-bold mt-1 uppercase tracking-wider">Author</span>
                        </div>
                      )}
                    </div>

                    {/* Verified Badge */}
                    <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-[#d99b38] to-[#f3c06b] text-black text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow flex items-center gap-1 border border-black/40">
                      <ShieldCheck size={12} className="text-black" />
                      <span>Verified</span>
                    </div>
                  </div>

                  {/* Author Info */}
                  <div className="flex-1 text-center md:text-left space-y-3">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                      <span className="px-3 py-1 bg-[#c8923a]/15 border border-[#c8923a]/40 text-[#f3c06b] text-[10px] font-extrabold uppercase tracking-wider rounded-lg">
                        Lekhok Tripura Publication
                      </span>
                      {author.featured && (
                        <span className="px-3 py-1 bg-cyan-950/80 border border-cyan-800 text-cyan-300 text-[10px] font-extrabold uppercase tracking-wider rounded-lg flex items-center gap-1">
                          <Sparkles size={11} /> Featured Author
                        </span>
                      )}
                    </div>

                    <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-white via-[#f5d796] to-[#c8923a] bg-clip-text text-transparent">
                      {author.name}
                    </h1>

                    <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-3xl">
                      {author.bio ||
                        `Explore all published titles, eBooks, and paperbacks by ${author.name} published under Lekhok Tripura Publishers.`}
                    </p>

                    {/* Author Stats bar */}
                    <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs">
                      <div className="flex items-center gap-2 bg-[#09090e] border border-[#1e1e2d] px-4 py-2 rounded-xl">
                        <BookOpen size={16} className="text-[#f3c06b]" />
                        <span className="text-white font-bold">{books.length}</span>
                        <span className="text-gray-400">{books.length === 1 ? "Book" : "Books"} Published</span>
                      </div>

                      <button
                        type="button"
                        onClick={handleShare}
                        className="flex items-center gap-1.5 bg-[#09090e] hover:bg-[#14141e] border border-white/10 hover:border-[#c8923a]/40 px-4 py-2 rounded-xl text-gray-300 hover:text-white transition"
                      >
                        {copiedLink ? (
                          <>
                            <Check size={14} className="text-emerald-400" />
                            <span className="text-emerald-400 font-semibold">Link Copied!</span>
                          </>
                        ) : (
                          <>
                            <Share2 size={14} className="text-[#f3c06b]" />
                            <span>Share Profile</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* BOOKS CATALOG SECTION HEADER & CONTROLS */}
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1c1c28] pb-4">
                  <div>
                    <h2 className="font-serif text-2xl font-extrabold text-white flex items-center gap-2.5">
                      <Layers size={22} className="text-[#f3c06b]" />
                      <span>Books by {author.name}</span>
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Showing {filteredBooks.length} of {books.length} {books.length === 1 ? "title" : "titles"}
                    </p>
                  </div>

                  {/* Search and Sort controls */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative min-w-[200px] flex-1 sm:flex-initial">
                      <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search books by title..."
                        className="w-full pl-9 pr-4 py-2 bg-[#0d0d14] border border-[#222232] focus:border-[#c8923a] rounded-xl text-xs text-white placeholder:text-gray-500 outline-none transition"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <SlidersHorizontal size={14} className="text-gray-400 hidden sm:inline" />
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-[#0d0d14] border border-[#222232] text-xs text-gray-300 font-medium px-3 py-2 rounded-xl outline-none cursor-pointer focus:border-[#c8923a]"
                      >
                        <option value="newest">Newest Releases</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="title">Title (A - Z)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* BOOKS GRID */}
                {filteredBooks.length === 0 ? (
                  <div className="bg-[#0e0e14] border border-[#1f1f2e] rounded-3xl p-12 text-center space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-[#161622] border border-[#2d2d3e] flex items-center justify-center text-[#f3c06b]">
                      <BookOpen size={28} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">No Books Found</h3>
                      <p className="text-xs text-gray-400 mt-1">
                        {searchQuery
                          ? `No books matching "${searchQuery}" for this author.`
                          : `No published titles currently available for ${author.name}. Check back soon!`}
                      </p>
                    </div>
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="px-4 py-2 bg-[#181826] border border-[#2d2d3e] rounded-xl text-xs font-semibold text-white hover:border-[#c8923a]/50 transition"
                      >
                        Clear Search Filter
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5">
                    {filteredBooks.map((book) => (
                      <BookCard key={book._id || book.slug} book={book} />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Global Cart & Orders Modals */}
        <CartModal
          isOpen={cartOpen}
          onClose={() => setCartOpen(false)}
          onOrdersClick={() => setOrdersOpen(true)}
        />
        <MyOrdersModal isOpen={ordersOpen} onClose={() => setOrdersOpen(false)} />

        <FooterSection />
      </div>
    </PageTransition>
  );
}
