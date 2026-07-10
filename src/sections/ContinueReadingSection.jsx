import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, ChevronRight, X, BookMarked, Loader2, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { API_BASE, SERVER_URL } from "../config.js";

/* ─────────────────────────────────────────────
   PDF Canvas Page-by-Page Renderer (for Mobile & Desktop)
───────────────────────────────────────────── */
function PdfCanvasViewer({ pdfUrl, pageNumber, onLoaded }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [pdfDoc, setPdfDoc] = useState(null);
  const renderTaskRef = useRef(null);

  // Dynamic script loader for PDF.js
  useEffect(() => {
    let active = true;
    const loadPdf = async () => {
      if (!window.pdfjsLib) {
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js";
        script.async = true;
        document.body.appendChild(script);
        await new Promise((resolve) => {
          script.onload = resolve;
        });
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";
      }

      if (!active) return;
      const loadingTask = window.pdfjsLib.getDocument(pdfUrl);
      const pdf = await loadingTask.promise;
      
      if (!active) return;
      setPdfDoc(pdf);
      onLoaded?.();
    };

    loadPdf().catch((err) => console.error("PDFJS Loading error:", err));

    return () => {
      active = false;
    };
  }, [pdfUrl, onLoaded]);

  // Render current page when pageNumber or pdfDoc changes
  useEffect(() => {
    if (!pdfDoc) return;
    let active = true;

    const renderPage = async () => {
      setPageLoading(true);
      try {
        const page = await pdfDoc.getPage(pageNumber);
        if (!active) return;

        // Cancel previous render if any
        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
        }

        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext("2d");

        // Responsive scaling - calculate viewport size to match container width
        const containerWidth = containerRef.current?.clientWidth || window.innerWidth || 360;
        const unscaledViewport = page.getViewport({ scale: 1.0 });
        // Account for paddings/margins in container
        const padWidth = Math.max(containerWidth - 24, 280);
        const scale = padWidth / unscaledViewport.width;
        const viewport = page.getViewport({ scale: Math.min(scale, 1.8) });

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;
        await renderTask.promise;
        
        if (active) setPageLoading(false);
      } catch (err) {
        if (err.name !== "RenderingCancelledException") {
          console.error("PDF Page Render Error:", err);
        }
      }
    };

    renderPage();

    // Listen to resize events to make page responsive
    const handleResize = () => {
      renderPage();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      active = false;
      window.removeEventListener("resize", handleResize);
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [pdfDoc, pageNumber]);

  return (
    <div
      ref={containerRef}
      className="relative flex h-full w-full flex-col items-center justify-start overflow-y-auto bg-zinc-900/60 p-4"
      data-lenis-prevent
    >
      {pageLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-[10] backdrop-blur-sm">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="mx-auto rounded-lg shadow-2xl bg-white max-w-full select-none"
        onContextMenu={(e) => e.preventDefault()}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────
   PDF Reader Modal
───────────────────────────────────────────── */
function PdfReaderModal({ bookId, bookTitle, totalPages, initialProgress, onClose, onProgressUpdate }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pdfUrl, setPdfUrl] = useState(null);
  const [currentPage, setCurrentPage] = useState(initialProgress?.currentPage ?? 1);
  const [progress, setProgress] = useState(initialProgress?.progress ?? 0);
  const saveTimerRef = useRef(null);

  // Fetch reader access token + pdf stream URL
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    let localBlobUrl = null;

    fetch(`${API_BASE}/reader/${bookId}`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (!active) return;
        if (data.success) {
          // Restore saved progress
          if (data.progress) {
            setCurrentPage(data.progress.currentPage ?? 1);
            setProgress(data.progress.progress ?? 0);
          }

          // Fetch the stream as a blob
          return fetch(`${API_BASE}/reader/${bookId}/stream`, { credentials: "include" });
        } else {
          throw new Error(data.message || "Could not load this book.");
        }
      })
      .then((res) => {
        if (!res) return;
        if (!res.ok) throw new Error("Failed to stream PDF from server.");
        return res.blob();
      })
      .then((blob) => {
        if (!active || !blob) return;
        localBlobUrl = URL.createObjectURL(blob);
        setPdfUrl(localBlobUrl);
      })
      .catch((err) => {
        if (active) setError(err.message || "Failed to load PDF file.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      if (localBlobUrl) {
        URL.revokeObjectURL(localBlobUrl);
      }
    };
  }, [bookId]);

  // Save progress to server (debounced 3 s)
  const saveProgress = useCallback(
    (page, pct) => {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        fetch(`${API_BASE}/reader/${bookId}/progress`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ currentPage: page, progress: pct }),
        })
          .then((r) => r.json())
          .then((d) => {
            if (d.success) onProgressUpdate?.(pct);
          })
          .catch(() => {});
      }, 3000);
    },
    [bookId, onProgressUpdate]
  );

  // Handle page navigation from buttons
  const handlePageChange = useCallback(
    (newPage) => {
      if (!totalPages || newPage < 1 || newPage > totalPages) return;
      setCurrentPage(newPage);
      const pct = Math.round((newPage / totalPages) * 100);
      setProgress(pct);
      saveProgress(newPage, pct);
    },
    [totalPages, saveProgress]
  );

  // Listen for messages from the iframe (if it posts page events)
  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === "pdfPageChange" && e.data.page) {
        handlePageChange(e.data.page);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [handlePageChange]);

  // Save on close
  const handleClose = () => {
    clearTimeout(saveTimerRef.current);
    if (totalPages && currentPage) {
      const pct = Math.round((currentPage / totalPages) * 100);
      fetch(`${API_BASE}/reader/${bookId}/progress`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPage, progress: pct }),
      })
        .then((r) => r.json())
        .then((d) => { if (d.success) onProgressUpdate?.(pct); })
        .catch(() => {});
    }
    onClose();
  };

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="reader-modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex flex-col bg-black/95 backdrop-blur-2xl"
        style={{ fontFamily: "Inter, sans-serif" }}
        data-lenis-prevent
      >
        {/* Header bar */}
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 bg-black/60 px-5 py-3.5 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <BookMarked size={18} className="text-cyan-300" />
            <div>
              <p className="text-xs font-semibold text-white line-clamp-1">{bookTitle}</p>
              <p className="text-[10px] text-white/40">
                Page {currentPage}{totalPages ? ` of ${totalPages}` : ""} · {progress}% complete
              </p>
            </div>
          </div>

          {/* Progress bar (header) */}
          <div className="mx-6 hidden flex-1 max-w-xs md:block">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <motion.div
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500"
              />
            </div>
            <p className="mt-1 text-center text-[10px] text-white/35">{progress}% read</p>
          </div>

          {/* Page navigation */}
          {totalPages > 1 && (
            <div className="mr-3 hidden items-center gap-2 md:flex">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/5 text-white/60 transition hover:bg-white/10 disabled:opacity-30"
              >
                ‹
              </button>
              <span className="min-w-[60px] text-center text-xs text-white/50">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/5 text-white/60 transition hover:bg-white/10 disabled:opacity-30"
              >
                ›
              </button>
            </div>
          )}

          <button
            onClick={handleClose}
            className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-300"
            title="Close reader"
          >
            <X size={16} />
          </button>
        </div>

        {/* PDF iframe area */}
        <div className="relative flex-1 overflow-hidden">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/50">
              <Loader2 size={36} className="animate-spin text-cyan-400" />
              <p className="text-sm">Loading book…</p>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
              <AlertCircle size={40} className="text-red-400" />
              <p className="text-sm font-semibold text-white">{error}</p>
              <p className="text-xs text-white/40">Make sure your purchase was approved and the PDF is attached.</p>
              <button
                onClick={handleClose}
                className="mt-2 rounded-full border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Close
              </button>
            </div>
          )}

          {pdfUrl && !error && (
            <PdfCanvasViewer
              pdfUrl={pdfUrl}
              pageNumber={currentPage}
              onLoaded={() => setLoading(false)}
            />
          )}
        </div>

        {/* Mobile page nav bar */}
        {totalPages > 1 && pdfUrl && (
          <div className="flex shrink-0 items-center justify-between border-t border-white/10 bg-black/60 px-5 py-3 backdrop-blur-xl md:hidden">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-xs font-semibold text-white/70 transition hover:bg-white/10 disabled:opacity-30"
            >
              ← Prev
            </button>
            <div className="flex flex-col items-center gap-1">
              <div className="h-1 w-28 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  animate={{ width: `${progress}%` }}
                  className="h-full rounded-full bg-cyan-400"
                />
              </div>
              <span className="text-[10px] text-white/40">{currentPage} / {totalPages} · {progress}%</span>
            </div>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-xs font-semibold text-white/70 transition hover:bg-white/10 disabled:opacity-30"
            >
              Next →
            </button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

/* ─────────────────────────────────────────────
   Individual reading card
───────────────────────────────────────────── */
function ContinueReadingCard({ purchase, initialProgress, onOpen }) {
  const book = purchase.bookId;
  if (!book) return null;

  const [liveProgress, setLiveProgress] = useState(initialProgress?.progress ?? 0);

  // Sync if parent updates
  useEffect(() => {
    setLiveProgress(initialProgress?.progress ?? 0);
  }, [initialProgress]);

  const coverUrl = book.cover?.url
    ? book.cover.url.startsWith("/uploads")
      ? `${SERVER_URL}${book.cover.url}`
      : book.cover.url
    : null;

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 240, damping: 22 }}
      className="group relative flex w-[200px] shrink-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl sm:w-[220px]"
    >
      {/* Cover */}
      <div className="relative h-[190px] w-full overflow-hidden bg-white/5">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={book.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <BookOpen size={36} className="text-white/20" />
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold text-cyan-300 backdrop-blur-sm">
          {liveProgress}%
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col justify-between p-3">
        <div>
          <h3 className="line-clamp-2 text-xs font-semibold leading-snug text-white">{book.title}</h3>
          <p className="mt-0.5 text-[10px] text-white/50">{book.author}</p>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[10px] text-white/40">Progress</span>
            <span className="text-[10px] font-semibold text-cyan-300">{liveProgress}% Complete</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <motion.div
              animate={{ width: `${liveProgress}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500"
            />
          </div>
        </div>

        {/* Continue button → opens modal */}
        <button
          type="button"
          onClick={() => onOpen(book, initialProgress)}
          className="mt-3 flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-2 text-[11px] font-semibold text-white transition hover:border-cyan-400/30 hover:bg-cyan-400/10"
        >
          Continue <ChevronRight size={12} />
        </button>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   Section wrapper
───────────────────────────────────────────── */
export default function ContinueReadingSection({ authUser }) {
  const [purchases, setPurchases] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(true);

  // Reader modal state
  const [readerBook, setReaderBook] = useState(null);   // book object being read
  const [readerProgress, setReaderProgress] = useState(null);

  useEffect(() => {
    if (!authUser) { setLoading(false); return; }

    fetch(`${API_BASE}/profile`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          const approved = (data.purchases || []).filter(
            (p) => p.status === "approved" && p.format === "ebook" && p.bookId
          );
          setPurchases(approved);
          const pMap = {};
          (data.readingHistory || []).forEach((rh) => {
            if (rh.bookId) pMap[rh.bookId._id || rh.bookId] = rh;
          });
          setProgressMap(pMap);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [authUser]);

  const handleOpen = (book, progress) => {
    setReaderBook(book);
    setReaderProgress(progress);
  };

  const handleClose = () => {
    setReaderBook(null);
    setReaderProgress(null);
  };

  // Called when reader saves progress → update card live
  const handleProgressUpdate = (bookId, newPct) => {
    setProgressMap((prev) => ({
      ...prev,
      [bookId]: { ...(prev[bookId] || {}), progress: newPct },
    }));
  };

  // ── Render states ──
  if (!authUser) {
    return (
      <div className="mb-12 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-8 text-center backdrop-blur-xl">
        <BookOpen size={32} className="mx-auto mb-3 text-white/30" />
        <p className="text-sm font-semibold text-white/60">Sign in to see your reading progress</p>
        <p className="mt-1 text-xs text-white/35">Books you purchase will appear here with your progress.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mb-12 flex gap-5 overflow-x-auto pb-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-[310px] w-[200px] shrink-0 animate-pulse rounded-2xl bg-white/5 sm:w-[220px]" />
        ))}
      </div>
    );
  }

  if (purchases.length === 0) {
    return (
      <div className="mb-12 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-8 text-center backdrop-blur-xl">
        <BookOpen size={32} className="mx-auto mb-3 text-white/30" />
        <p className="text-sm font-semibold text-white/60">No purchases yet</p>
        <p className="mt-1 text-xs text-white/35">Books you purchase will show up here with your reading progress.</p>
      </div>
    );
  }

  return (
    <>
      {/* Reader modal (portal) */}
      {readerBook && (
        <PdfReaderModal
          bookId={readerBook._id}
          bookTitle={readerBook.title}
          totalPages={readerBook.pages}
          initialProgress={readerProgress}
          onClose={handleClose}
          onProgressUpdate={(pct) => handleProgressUpdate(readerBook._id, pct)}
        />
      )}

      <div className="mb-14">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300/80">My Library</p>
            <h2 className="mt-1 text-xl font-bold text-white">Continue Reading</h2>
          </div>
          <Link
            to="/library"
            className="flex items-center gap-1.5 text-xs font-semibold text-white/50 transition hover:text-cyan-300"
          >
            See All <ChevronRight size={14} />
          </Link>
        </div>

        <div className="flex gap-5 overflow-x-auto pb-3 custom-scrollbar">
          {purchases.map((p) => {
            const bookId = p.bookId?._id || p.bookId;
            return (
              <ContinueReadingCard
                key={p._id}
                purchase={p}
                initialProgress={progressMap[bookId]}
                onOpen={handleOpen}
              />
            );
          })}

          {/* See All tile */}
          <Link
            to="/library"
            className="group flex h-[310px] w-[200px] shrink-0 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] transition hover:border-cyan-400/30 hover:bg-white/5 sm:w-[220px]"
          >
            <div className="grid h-12 w-12 place-items-center rounded-full border border-white/15 bg-white/5 transition group-hover:border-cyan-400/30 group-hover:bg-cyan-400/10">
              <ChevronRight size={20} className="text-white/40 group-hover:text-cyan-300" />
            </div>
            <p className="text-xs font-semibold text-white/40 group-hover:text-white/70">See All Books</p>
          </Link>
        </div>
      </div>
    </>
  );
}
