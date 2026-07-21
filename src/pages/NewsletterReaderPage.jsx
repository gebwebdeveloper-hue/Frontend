import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowLeft, Loader2, Sparkles, User, Sun, Moon } from "lucide-react";
import PageTransition from "../components/PageTransition.jsx";
import { API_BASE, SERVER_URL } from "../config.js";

export default function NewsletterReaderPage() {
  const { slug } = useParams();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isLightMode, setIsLightMode] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/newsletter/${slug}`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 403) {
            throw new Error("This newsletter is currently a draft and can only be viewed by administrators.");
          }
          throw new Error("Story not found.");
        }
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          setStory(data.newsletter);
        } else {
          setError(data.message || "Failed to load the story.");
        }
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || "Something went wrong while fetching the story.");
      })
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    const clearSelection = () => {
      if (window.getSelection) {
        const selection = window.getSelection();
        if (selection && selection.toString().length > 0) {
          selection.removeAllRanges();
        }
      }
    };

    const handleCopy = (e) => {
      e.preventDefault();
    };

    document.addEventListener("selectionchange", clearSelection);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("cut", handleCopy);
    document.addEventListener("contextmenu", handleCopy);

    return () => {
      document.removeEventListener("selectionchange", clearSelection);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("cut", handleCopy);
      document.removeEventListener("contextmenu", handleCopy);
    };
  }, []);

  const getCoverUrl = (cover) => {
    if (!cover || !cover.url) return "";
    if (cover.url.startsWith("http")) return cover.url;
    return `${SERVER_URL}${cover.url}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <PageTransition>
      {/* Dynamic Scoped CSS for Rich-Text HTML formatting */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Merriweather:ital,wght@0,300;0,400;0,700;1,300;1,400&family=Outfit:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&display=swap');

        .newsletter-content,
        .newsletter-content * {
          font-family: '${story?.fontFamily || "Outfit"}', 'Outfit', 'Inter', serif, sans-serif;
          color: ${isLightMode ? "#1e293b" : "rgba(255, 255, 255, 0.85)"};
          transition: color 0.3s ease;
          -webkit-touch-callout: none !important;
          -webkit-user-select: none !important;
          -khtml-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
        }
        .newsletter-content {
          font-size: 1.125rem;
          line-height: 1.85;
        }
        .newsletter-content p {
          margin-bottom: 1.75rem;
        }
        .newsletter-content h1, 
        .newsletter-content h2, 
        .newsletter-content h3, 
        .newsletter-content h4 {
          color: ${isLightMode ? "#0f172a" : "#ffffff"};
          font-weight: 750;
          line-height: 1.3;
          margin-top: 2.5rem;
          margin-bottom: 1.25rem;
          transition: color 0.3s ease;
        }
        .newsletter-content h1 { font-size: 2.25rem; }
        .newsletter-content h2 { font-size: 1.875rem; }
        .newsletter-content h3 { font-size: 1.5rem; }
        .newsletter-content h4 { font-size: 1.25rem; }
        
        .newsletter-content img {
          max-width: 100%;
          height: auto;
          border-radius: 1.25rem;
          margin: 2.5rem auto;
          display: block;
          border: 1px solid ${isLightMode ? "rgba(0, 0, 0, 0.08)" : "rgba(255, 255, 255, 0.1)"};
          box-shadow: 0 20px 40px ${isLightMode ? "rgba(0, 0, 0, 0.1)" : "rgba(0, 0, 0, 0.4)"};
        }
        .newsletter-content blockquote {
          border-left: 4px solid #0891b2;
          background: ${isLightMode ? "rgba(8, 145, 178, 0.04)" : "rgba(34, 211, 238, 0.03)"};
          padding: 1.5rem 2rem;
          font-style: italic;
          color: ${isLightMode ? "#334155" : "#e2e8f0"};
          margin: 2rem 0;
          border-radius: 0 1rem 1rem 0;
          font-size: 1.25rem;
          transition: background 0.3s ease, color 0.3s ease;
        }
        .newsletter-content ul {
          list-style-type: disc;
          padding-left: 2rem;
          margin-bottom: 1.75rem;
        }
        .newsletter-content ol {
          list-style-type: decimal;
          padding-left: 2rem;
          margin-bottom: 1.75rem;
        }
        .newsletter-content li {
          margin-bottom: 0.625rem;
        }
        .newsletter-content strong {
          color: ${isLightMode ? "#0f172a" : "#ffffff"};
          font-weight: 700;
          transition: color 0.3s ease;
        }
        .newsletter-content a {
          color: #0891b2;
          text-decoration: underline;
          transition: color 0.2s;
        }
        .newsletter-content a:hover {
          color: #0e7490;
        }
        /* Custom image alignment classes matching standard Quill outputs */
        .newsletter-content .ql-align-center { text-align: center; }
        .newsletter-content .ql-align-right { text-align: right; }
        .newsletter-content .ql-align-left { text-align: left; }
      `}</style>

      <div className={`min-h-screen pt-32 pb-24 relative overflow-hidden transition-colors duration-350 ${isLightMode ? "bg-gradient-to-br from-zinc-50 via-slate-50 to-zinc-100 text-slate-900" : "bg-black text-white"}`}>
        {/* Glow Effects */}
        <div className={`pointer-events-none absolute left-[-250px] top-[10%] -z-10 h-[600px] w-[600px] rounded-full blur-[180px] opacity-70 transition-all duration-350 ${isLightMode ? "bg-cyan-200/20" : "bg-cyan-500/10"}`} />
        <div className={`pointer-events-none absolute right-[-250px] top-[35%] -z-10 h-[600px] w-[600px] rounded-full blur-[180px] opacity-70 transition-all duration-350 ${isLightMode ? "bg-fuchsia-200/15" : "bg-fuchsia-500/8"}`} />
        <div className={`pointer-events-none absolute left-[-200px] bottom-[15%] -z-10 h-[500px] w-[500px] rounded-full blur-[150px] opacity-50 transition-all duration-350 ${isLightMode ? "bg-cyan-100/15" : "bg-cyan-500/5"}`} />
        <div className={`pointer-events-none absolute right-[-200px] bottom-[5%] -z-10 h-[500px] w-[500px] rounded-full blur-[150px] opacity-50 transition-all duration-350 ${isLightMode ? "bg-blue-100/15" : "bg-blue-500/5"}`} />

        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          {/* Back button & Reader mode toggle */}
          <div className="mb-8 flex items-center justify-between gap-4">
            <Link
              to="/short-stories"
              className={`group inline-flex items-center gap-2 text-sm font-medium transition-colors ${isLightMode ? "text-slate-500 hover:text-cyan-600" : "text-white/55 hover:text-cyan-400"}`}
            >
              <ArrowLeft size={16} className="transition-transform duration-250 group-hover:-translate-x-1" />
              Back to Short Stories
            </Link>

            <button
              onClick={() => setIsLightMode(!isLightMode)}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                isLightMode 
                  ? "border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50" 
                  : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              {isLightMode ? (
                <>
                  <Moon size={13} className="text-indigo-500" />
                  <span>Dark Mode</span>
                </>
              ) : (
                <>
                  <Sun size={13} className="text-yellow-400 animate-spin-slow" />
                  <span>Light Mode</span>
                </>
              )}
            </button>
          </div>

          {/* Loader */}
          {loading && (
            <div className="flex h-96 flex-col items-center justify-center gap-4 text-cyan-400">
              <Loader2 className="h-10 w-10 animate-spin" />
              <p className="text-sm font-medium text-white/55">Opening story...</p>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className={`rounded-2xl border p-8 text-center ${isLightMode ? "border-slate-200 bg-white" : "border-red-500/20 bg-red-500/5"}`}>
              <h2 className="text-xl font-bold text-red-400 mb-2">Error</h2>
              <p className={`mb-6 ${isLightMode ? "text-slate-600" : "text-white/60"}`}>{error}</p>
              <Link
                to="/short-stories"
                className={`inline-flex items-center gap-2 rounded-full px-6 py-2.5 font-semibold transition hover:scale-105 ${
                  isLightMode ? "bg-slate-900 text-white hover:bg-slate-800" : "bg-white text-black hover:bg-cyan-50"
                }`}
              >
                Return to Listing
              </Link>
            </div>
          )}

          {/* Story Content */}
          {!loading && !error && story && (
            <article
              onCopy={(e) => e.preventDefault()}
              onCut={(e) => e.preventDefault()}
              onContextMenu={(e) => e.preventDefault()}
              onSelectStart={(e) => e.preventDefault()}
              className="select-none"
            >
              {/* Header */}
              <header className="mb-10">
                <div className={`mb-4 flex flex-wrap items-center gap-4 text-sm transition-colors ${isLightMode ? "text-slate-500" : "text-white/45"}`}>
                  <div className="flex items-center gap-1.5">
                    <User size={14} className={isLightMode ? "text-cyan-600" : "text-cyan-400"} />
                    <span className={`font-semibold transition-colors ${isLightMode ? "text-slate-700" : "text-white/80"}`}>{story.author}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} />
                    <span>{formatDate(story.publishedAt)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} />
                    <span>{story.readingTime} min read</span>
                  </div>
                  {story.status === "draft" && (
                    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                      isLightMode 
                        ? "bg-amber-100 border-amber-200 text-amber-800" 
                        : "bg-yellow-500/10 border-yellow-500/20 text-yellow-400"
                    }`}>
                      Draft Preview
                    </span>
                  )}
                </div>

                <h1 className={`text-3xl font-black tracking-tight sm:text-5xl sm:leading-[1.15] transition-colors ${isLightMode ? "text-slate-900" : "text-white"}`}>
                  {story.title}
                </h1>

                {story.description && (
                  <p className={`mt-6 text-lg sm:text-xl leading-relaxed border-l-2 pl-4 italic transition-colors ${
                    isLightMode 
                      ? "text-slate-600 border-cyan-500/60" 
                      : "text-white/50 border-cyan-400/35"
                  }`}>
                    {story.description}
                  </p>
                )}
              </header>

              {/* Cover Image */}
              {getCoverUrl(story.cover) && (
                <div className={`mb-12 max-w-2xl mx-auto overflow-hidden rounded-[1.5rem] border shadow-xl transition-all duration-300 ${
                  isLightMode ? "border-slate-200 bg-white" : "border-white/10 bg-white/5"
                }`}>
                  <img
                    src={getCoverUrl(story.cover)}
                    alt={story.title}
                    className="w-full h-auto max-h-[400px] object-contain block mx-auto"
                  />
                </div>
              )}

              {/* Story body */}
              <div
                className="newsletter-content"
                dangerouslySetInnerHTML={{ __html: story.content }}
              />

              {/* Newsletter footer CTA */}
              <div className={`mt-16 rounded-3xl border p-8 text-center sm:p-12 transition-all duration-300 ${
                isLightMode ? "border-slate-200 bg-white/80 shadow-md shadow-slate-100" : "border-white/10 bg-white/[0.02]"
              }`}>
                <Sparkles className={isLightMode ? "mx-auto mb-4 text-cyan-600" : "mx-auto mb-4 text-cyan-400"} size={32} />
                <h3 className={`text-2xl font-bold transition-colors ${isLightMode ? "text-slate-900" : "text-white"}`}>Love our stories?</h3>
                <p className={`mx-auto mt-2 max-w-md text-sm transition-colors ${isLightMode ? "text-slate-600" : "text-white/60"}`}>
                  Stay updated with our publications, reader discussions, and new book releases by subscribing to Lekhok Tripura.
                </p>
                <div className="mt-6 flex justify-center">
                  <Link
                    to="/club"
                    className={`rounded-full px-6 py-2.5 text-sm font-semibold transition hover:scale-105 ${
                      isLightMode 
                        ? "bg-slate-900 text-white hover:bg-slate-800" 
                        : "bg-cyan-400 text-black hover:bg-cyan-300"
                    }`}
                  >
                    Join the Club
                  </Link>
                </div>
              </div>
            </article>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
