import { useState, useEffect } from "react";
import PageTransition from "../components/PageTransition.jsx";
import BookCard from "../components/BookCard.jsx";
import FooterSection from "../sections/FooterSection.jsx";
import { featuredBooks } from "../data/books.js";

import { API_BASE } from "../config.js";

export default function LibraryPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/books`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.books && data.books.length > 0) {
          setBooks(data.books);
        } else {
          setBooks([...featuredBooks, ...featuredBooks]);
        }
      })
      .catch(() => {
        setBooks([...featuredBooks, ...featuredBooks]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <PageTransition>
      <section className="min-h-screen px-5 pb-24 pt-36">
        <div className="mx-auto max-w-7xl">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.35em] text-cyan-200/80">Premium Library</p>
          <h1 className="max-w-4xl text-5xl font-semibold leading-tight text-white md:text-7xl">Choose an ebook and begin reading online.</h1>
          
          {loading ? (
            <div className="mt-20 flex justify-center text-white/50">
              Loading library books...
            </div>
          ) : books.filter(b => b._id).length === 0 ? (
            <div className="mt-20 text-center text-white/40">
              <p className="text-lg">No books in the library yet.</p>
              <p className="text-sm mt-2">Admin can upload books from the Admin panel.</p>
            </div>
          ) : (
            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {books.filter(b => b._id).map((book) => (
                <BookCard 
                  book={book} 
                  key={book._id} 
                />
              ))}
            </div>
          )}
        </div>
      </section>
      <FooterSection />
    </PageTransition>
  );
}
