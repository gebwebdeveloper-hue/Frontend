import { useEffect } from "react";
import { Route, Routes, useLocation, useNavigate, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import HomePage from "./pages/HomePage.jsx";
import ReaderPage from "./pages/ReaderPage.jsx";
import LibraryPage from "./pages/LibraryPage.jsx";
import AdminBooksPage from "./pages/AdminBooksPage.jsx";
import AdminDatabasePage from "./pages/AdminDatabasePage.jsx";
import AdminStoriesDatabasePage from "./pages/AdminStoriesDatabasePage.jsx";
import AdminUsersPage from "./pages/AdminUsersPage.jsx";
import AdminPurchasesPage from "./pages/AdminPurchasesPage.jsx";
import ClubPage from "./pages/ClubPage.jsx";
import PageLoader from "./components/PageLoader.jsx";
import ScrollProgress from "./components/ScrollProgress.jsx";
import BackToTop from "./components/BackToTop.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import { useLenis } from "./hooks/useLenis.js";
import Navbar from "./components/Navbar.jsx";
import NewsletterListingPage from "./pages/NewsletterListingPage.jsx";
import NewsletterReaderPage from "./pages/NewsletterReaderPage.jsx";
import WhatsAppFloat from "./components/WhatsAppFloat.jsx";
import HelpPage from "./pages/HelpPage.jsx";
import NewsPage from "./pages/NewsPage.jsx";
import AdminNewsPage from "./pages/AdminNewsPage.jsx";

// Helper component to normalize URLs (strip trailing slashes, decode spaces/encoded URIs)
function RouteNormalizer() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const rawPath = location.pathname;
    let decodedPath = rawPath;
    try {
      decodedPath = decodeURIComponent(rawPath);
    } catch {
      // ignore decoding error
    }

    let normalized = decodedPath;

    // Remove trailing slash if present (except for root "/")
    if (normalized.length > 1 && normalized.endsWith("/")) {
      normalized = normalized.slice(0, -1);
    }

    // Trim extra spaces inside URL path
    normalized = normalized.trim().replace(/\s+/g, "-");

    if (normalized !== rawPath) {
      navigate(normalized + location.search + location.hash, { replace: true });
    }
  }, [location, navigate]);

  return null;
}

export default function App() {
  const location = useLocation();
  useLenis();

  return (
    <>
      <RouteNormalizer />
      <ScrollToTop />
      <PageLoader />
      <ScrollProgress />
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Main Pages */}
          <Route path="/" element={<HomePage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/reader" element={<ReaderPage />} />
          <Route path="/admin" element={<AdminBooksPage />} />
          <Route path="/admin/database" element={<AdminDatabasePage />} />
          <Route path="/admin/stories" element={<AdminStoriesDatabasePage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/purchases" element={<AdminPurchasesPage />} />
          <Route path="/admin/news" element={<AdminNewsPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/club" element={<ClubPage />} />
          <Route path="/short-stories" element={<NewsletterListingPage />} />
          <Route path="/short-stories/:slug" element={<NewsletterReaderPage />} />
          <Route path="/help" element={<HelpPage />} />

          {/* Sitelinks & Legacy URL Alias Redirects */}
          <Route path="/buy-books" element={<Navigate to="/library" replace />} />
          <Route path="/buy-book" element={<Navigate to="/library" replace />} />
          <Route path="/buy" element={<Navigate to="/library" replace />} />
          <Route path="/books" element={<Navigate to="/library" replace />} />
          <Route path="/my-books" element={<Navigate to="/library" replace />} />
          <Route path="/mybooks" element={<Navigate to="/library" replace />} />
          <Route path="/about-us" element={<Navigate to="/" replace />} />
          <Route path="/about" element={<Navigate to="/" replace />} />
          <Route path="/the-story-of-success" element={<Navigate to="/news" replace />} />
          <Route path="/story-of-success" element={<Navigate to="/news" replace />} />
          <Route path="/april-2022" element={<Navigate to="/news" replace />} />
          <Route path="/news-updates" element={<Navigate to="/news" replace />} />
          <Route path="/free-stories" element={<Navigate to="/short-stories" replace />} />

          {/* Catch-All Fallback Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
      <WhatsAppFloat />
      <BackToTop />
    </>
  );
}


