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
import AdminBlogPage from "./pages/AdminBlogPage.jsx";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage.jsx";
import TermsPage from "./pages/TermsPage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import AdminClubPage from "./pages/AdminClubPage.jsx";
import AdminRentalsPage from "./pages/AdminRentalsPage.jsx";
import AdminLibraryCardsPage from "./pages/AdminLibraryCardsPage.jsx";
import AdminClubTransactionsPage from "./pages/AdminClubTransactionsPage.jsx";
import AdminInvoicePage from "./pages/AdminInvoicePage.jsx";
import AdminCrmPage from "./pages/AdminCrmPage.jsx";
import BookRentPage from "./pages/BookRentPage.jsx";
import CafeLayout from "./cafe/CafeLayout.jsx";
import CafeHomePage from "./cafe/pages/CafeHomePage.jsx";
import CafeAdminPage from "./cafe/pages/CafeAdminPage.jsx";
import CafeSpacePage from "./cafe/pages/CafeSpacePage.jsx";
import CafeMenuPage from "./cafe/pages/CafeMenuPage.jsx";
import CafeBooksPage from "./cafe/pages/CafeBooksPage.jsx";
import CafeUpdatesPage from "./cafe/pages/CafeUpdatesPage.jsx";
import PublisherDashboardPage from "./pages/PublisherDashboardPage.jsx";
import AuthorDashboardPage from "./pages/AuthorDashboardPage.jsx";


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

  // Hide global Navbar on /cafe/* and dashboard pages
  const hideNavbar = location.pathname.startsWith("/cafe") || location.pathname.includes("dashboard");

  return (
    <>
      <RouteNormalizer />
      <ScrollToTop />
      <PageLoader />
      <ScrollProgress />
      {!hideNavbar && <Navbar />}
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
          {/* <Route path="/admin/blogs" element={<AdminBlogPage />} /> */}
          <Route path="/admin/club" element={<AdminClubPage />} />
          <Route path="/admin/club/transactions" element={<AdminClubTransactionsPage />} />
          <Route path="/admin/rentals" element={<AdminRentalsPage />} />
          <Route path="/admin/library-cards" element={<AdminLibraryCardsPage />} />
          <Route path="/admin/invoices" element={<AdminInvoicePage />} />
          <Route path="/admin/invoice" element={<Navigate to="/admin/invoices" replace />} />
          <Route path="/admin/crm" element={<AdminCrmPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/news/:slug" element={<NewsPage />} />
          {/* <Route path="/blogs" element={<NewsPage defaultTab="blogs" />} /> */}
          {/* <Route path="/blog" element={<NewsPage defaultTab="blogs" />} /> */}
          <Route path="/rentals" element={<BookRentPage />} />
          <Route path="/rentals/:slug" element={<BookRentPage />} />
          <Route path="/rent/:slug" element={<BookRentPage />} />
          <Route path="/book-rent" element={<Navigate to="/rentals" replace />} />
          <Route path="/rent" element={<Navigate to="/rentals" replace />} />
          <Route path="/club" element={<ClubPage />} />
          <Route path="/short-stories" element={<NewsletterListingPage />} />
          <Route path="/short-stories/:slug" element={<NewsletterReaderPage />} />
          <Route path="/story/:slug" element={<NewsletterReaderPage />} />
          {/* Publisher & Author Dashboard */}
          <Route path="/publisher_dashboard" element={<PublisherDashboardPage />} />
          <Route path="/publisher-dashboard" element={<PublisherDashboardPage />} />
          <Route path="/author_dashboard" element={<AuthorDashboardPage />} />
          <Route path="/author-dashboard" element={<AuthorDashboardPage />} />

          <Route path="/help" element={<HelpPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/privacy-policy" element={<Navigate to="/privacy" replace />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/terms-and-conditions" element={<Navigate to="/terms" replace />} />

          {/* Sitelinks & Legacy URL Alias Redirects */}
          <Route path="/book/:id" element={<LibraryPage />} />
          <Route path="/books" element={<LibraryPage />} />
          <Route path="/buy-books" element={<Navigate to="/library" replace />} />
          <Route path="/buy-book" element={<Navigate to="/library" replace />} />
          <Route path="/buy" element={<Navigate to="/library" replace />} />
          <Route path="/my-books" element={<Navigate to="/library" replace />} />
          <Route path="/mybooks" element={<Navigate to="/library" replace />} />
          <Route path="/about-us" element={<AboutPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/publish-with-us" element={<AboutPage />} />
          <Route path="/publish" element={<AboutPage />} />
          <Route path="/the-story-of-success" element={<Navigate to="/news" replace />} />
          <Route path="/story-of-success" element={<Navigate to="/news" replace />} />
          <Route path="/april-2022" element={<Navigate to="/news" replace />} />
          <Route path="/news-updates" element={<Navigate to="/news" replace />} />
          <Route path="/free-stories" element={<Navigate to="/short-stories" replace />} />

          {/* ── CAFE SECTION ── */}
          <Route path="/cafe/admin" element={<CafeAdminPage />} />
          <Route path="/cafe" element={<CafeLayout />}>
            <Route index element={<CafeHomePage />} />
            <Route path="menu" element={<CafeMenuPage />} />
            <Route path="reserve" element={<CafeSpacePage />} />
            <Route path="space" element={<CafeSpacePage />} />
            <Route path="creative-space" element={<CafeSpacePage />} />
            <Route path="artist-space" element={<Navigate to="/cafe/reserve" replace />} />
            <Route path="artist" element={<Navigate to="/cafe/reserve" replace />} />
            <Route path="books" element={<CafeBooksPage />} />
            <Route path="updates" element={<CafeUpdatesPage />} />
          </Route>

          {/* Catch-All Fallback Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
      <WhatsAppFloat />
      <BackToTop />
    </>
  );
}


