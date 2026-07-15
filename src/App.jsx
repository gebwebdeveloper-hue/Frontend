import { Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import HomePage from "./pages/HomePage.jsx";
import ReaderPage from "./pages/ReaderPage.jsx";
import LibraryPage from "./pages/LibraryPage.jsx";
import AdminBooksPage from "./pages/AdminBooksPage.jsx";
import AdminDatabasePage from "./pages/AdminDatabasePage.jsx";
import AdminStoriesDatabasePage from "./pages/AdminStoriesDatabasePage.jsx";
import ClubPage from "./pages/ClubPage.jsx";
import PageLoader from "./components/PageLoader.jsx";
import ScrollProgress from "./components/ScrollProgress.jsx";
import BackToTop from "./components/BackToTop.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import { useLenis } from "./hooks/useLenis.js";
import Navbar from "./components/Navbar.jsx";
import NewsletterListingPage from "./pages/NewsletterListingPage.jsx";
import NewsletterReaderPage from "./pages/NewsletterReaderPage.jsx";


export default function App() {
  const location = useLocation();
  useLenis();

  return (
    <>
      <ScrollToTop />
      <PageLoader />
      <ScrollProgress />
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<HomePage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/reader" element={<ReaderPage />} />
          <Route path="/admin" element={<AdminBooksPage />} />
          <Route path="/admin/database" element={<AdminDatabasePage />} />
          <Route path="/admin/stories" element={<AdminStoriesDatabasePage />} />
          <Route path="/club" element={<ClubPage />} />
          <Route path="/free-stories" element={<NewsletterListingPage />} />
          <Route path="/free-stories/:slug" element={<NewsletterReaderPage />} />
        </Routes>

      </AnimatePresence>
      <BackToTop />
    </>
  );
}

