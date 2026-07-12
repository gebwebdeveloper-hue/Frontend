import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, Users, Download, Star } from "lucide-react";
import PageTransition from "../components/PageTransition.jsx";
import FooterSection from "../sections/FooterSection.jsx";
import ContinueReadingSection from "../sections/ContinueReadingSection.jsx";
import PopularAuthorsSection from "../sections/PopularAuthorsSection.jsx";
import PublicationsAuthorsSection from "../sections/PublicationsAuthorsSection.jsx";
import LibraryFeaturedSection from "../sections/LibraryFeaturedSection.jsx";
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
  const [authUser, setAuthUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [stats, setStats] = useState(null);

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

  // Fetch analytics stats
  useEffect(() => {
    // Book count (public)
    Promise.all([
      fetch(`${API_BASE}/books?limit=1`).then((r) => r.json()),
      fetch(`${API_BASE}/authors`).then((r) => r.json()),
    ])
      .then(([booksData, authorsData]) => {
        setStats({
          books: booksData.pagination?.total ?? booksData.books?.length ?? 0,
          authors: authorsData.authors?.length ?? 0,
          approvedPurchases: null, // admin only, skip
          rating: "4.8",
        });
      })
      .catch(() => {});
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

  return (
    <PageTransition>
      <div className="relative min-h-screen overflow-hidden">
        {/* Background glows */}
        <div className="pointer-events-none absolute left-0 top-0 h-[600px] w-[600px] rounded-full bg-cyan-500/8 blur-[180px]" />
        <div className="pointer-events-none absolute right-0 top-40 h-[400px] w-[400px] rounded-full bg-indigo-500/8 blur-[150px]" />

        <div className="mx-auto max-w-7xl px-5 pb-24 pt-32">

          {/* ─────────── HERO BANNER ─────────── */}
          <div className="mb-14 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.35em] text-cyan-300/80">
                Premium Library
              </p>
              <h1 className="text-4xl font-black leading-[1.1] text-white md:text-6xl lg:text-7xl">
                Welcome to<br />
                <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-fuchsia-500 bg-clip-text text-transparent animate-text-gradient">
                  Lekhok Library
                </span>
              </h1>
              <p className="mt-4 max-w-lg text-sm leading-6 text-white/50">
                Discover thousands of premium ebooks, track your reading journey, and explore your favourite authors — all in one place.
              </p>
            </motion.div>

            {/* Stats grid */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="grid grid-cols-2 gap-3 lg:grid-cols-2 xl:grid-cols-2"
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

        </div>
      </div>
      <FooterSection />
    </PageTransition>
  );
}
