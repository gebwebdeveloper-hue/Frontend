import React, { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Coffee, Plus, Pencil, Trash2, X, Check, AlertTriangle,
  LayoutGrid, Star, Eye, EyeOff, Search, Image, Tag, DollarSign,
  Clock, FileText, Loader2, UploadCloud, UtensilsCrossed, CheckCircle2,
  Crop as CropIcon,
} from "lucide-react";
import { API_BASE } from "../../config.js";

/* ── Constants ─────────────────────────────────────────────────── */
const CATEGORIES = [
  { id: "all", label: "All Items" },
  { id: "coffee", label: "Coffee" },
  { id: "tea", label: "Tea & Herbal" },
  { id: "cold-drinks", label: "Cold Drinks" },
  { id: "snacks", label: "Snacks" },
  { id: "meals", label: "Meals" },
  { id: "desserts", label: "Desserts" },
  { id: "others", label: "Others" },
];

const CAT_COLORS = {
  coffee: "#6B3F2A", tea: "#4A7C59", "cold-drinks": "#2A6B8B",
  snacks: "#8B6A2A", meals: "#7A3B4B", desserts: "#8B2A5E", others: "#555",
};

const EMPTY_FORM = {
  name: "", description: "", price: "", category: "coffee",
  imageUrl: "", available: true, featured: false, preparationTime: 10, tags: "",
  ingredients: [],
  howItLooks: "",
};

/* ── Small UI Helpers ───────────────────────────────────────────── */
function Badge({ children, color }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-white"
      style={{ background: color || "#6B3F2A" }}
    >
      {children}
    </span>
  );
}

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-[#D4A85A]/20 bg-white p-5 shadow-sm">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl" style={{ background: `${color}15` }}>
        <Icon size={22} style={{ color }} />
      </div>
      <div>
        <p className="text-2xl font-black" style={{ color: "#2C1810" }}>{value}</p>
        <p className="text-xs font-medium" style={{ color: "#2C1810", opacity: 0.5 }}>{label}</p>
      </div>
    </div>
  );
}

function FormField({ label, icon: Icon, children }) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide" style={{ color: "#6B3F2A" }}>
        {Icon && <Icon size={12} />}
        {label}
      </label>
      {children}
    </div>
  );
}

function Toggle({ label, value, onChange, activeColor }) {
  return (
    <div
      className="flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 transition hover:shadow-sm"
      style={{ borderColor: value ? `${activeColor}40` : "rgba(212,168,90,0.2)", background: value ? `${activeColor}08` : "white" }}
      onClick={() => onChange(!value)}
    >
      <span className="text-xs font-bold" style={{ color: value ? activeColor : "#2C1810", opacity: value ? 1 : 0.5 }}>{label}</span>
      <div
        className="relative h-5 w-9 rounded-full transition-all duration-300"
        style={{ background: value ? activeColor : "#ccc" }}
      >
        <div
          className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all duration-300"
          style={{ left: value ? "18px" : "2px" }}
        />
      </div>
    </div>
  );
}

/* ── CatHeadingCard ──────────────────────────────────────────────── */
export function CatHeadingCard({ cat, savingCatId, onSave }) {
  const [localTitle, setLocalTitle] = useState(cat.title);
  const [localSubtitle, setLocalSubtitle] = useState(cat.subtitle);
  const isSaving = savingCatId === cat.categoryId;
  return (
    <div className="rounded-2xl border border-[#D4A85A]/25 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <span className="rounded-full bg-[#6B3F2A] px-3 py-0.5 text-[10px] font-black uppercase text-white tracking-wide">
          {cat.categoryId}
        </span>
        {cat.title && (
          <span className="text-xs font-semibold text-[#2C1810]/60 italic">→ "{cat.title}"</span>
        )}
      </div>
      <div className="space-y-3">
        <div>
          <label className="block text-[11px] font-bold uppercase text-[#2C1810]/60 mb-1">Section Title</label>
          <input
            type="text"
            value={localTitle}
            onChange={(e) => setLocalTitle(e.target.value)}
            placeholder="e.g. COFFEE COLLECTION"
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-bold text-[#2C1810] focus:border-[#6B3F2A] outline-none transition"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold uppercase text-[#2C1810]/60 mb-1">Subtitle / Tagline</label>
          <input
            type="text"
            value={localSubtitle}
            onChange={(e) => setLocalSubtitle(e.target.value)}
            placeholder="e.g. RICH AROMA. PERFECT BREW. PURE INDULGENCE."
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-[#2C1810] focus:border-[#6B3F2A] outline-none transition"
          />
        </div>
        <button
          onClick={() => onSave(cat.categoryId, localTitle, localSubtitle)}
          disabled={isSaving}
          className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:scale-105 disabled:opacity-60"
          style={{ background: "linear-gradient(135deg, #6B3F2A, #A0522D)" }}
        >
          {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
          {isSaving ? "Saving…" : "Save Heading"}
        </button>
      </div>
    </div>
  );
}

/* ── HTML5 Canvas Auto-Resize Helper ──────────────────────────────── */
function resizeImageToTarget(file, targetWidth = 800, targetHeight = 600) {
  return new Promise((resolve, reject) => {
    const img = document.createElement("img");
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target.result;
    };

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext("2d");

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      const scale = Math.max(targetWidth / img.width, targetHeight / img.height);
      const x = (targetWidth - img.width * scale) / 2;
      const y = (targetHeight - img.height * scale) / 2;

      ctx.fillStyle = "#FAF5EB";
      ctx.fillRect(0, 0, targetWidth, targetHeight);
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error("Canvas blob creation failed"));
          const safeName = (file.name || "menu-item").replace(/\.[^/.]+$/, "").replace(/[^a-z0-9]+/gi, "-").toLowerCase();
          const resizedFile = new File([blob], `${safeName}-800x600.webp`, {
            type: "image/webp",
            lastModified: Date.now(),
          });
          resolve(resizedFile);
        },
        "image/webp",
        0.92
      );
    };

    img.onerror = () => reject(new Error("Failed to load image for resizing"));
    reader.readAsDataURL(file);
  });
}

/* ── Interactive Image Crop Modal Component ─────────────────────── */
export function InteractiveCropModal({
  imageSrc,
  initialTargetW = 800,
  initialTargetH = 600,
  onApplyCrop,
  onClose,
}) {
  const [targetRatio, setTargetRatio] = useState("menu");
  const targetW = targetRatio === "menu" ? 800 : 800;
  const targetH = targetRatio === "menu" ? 600 : 533;
  const aspect = targetW / targetH;

  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const [containerDim, setContainerDim] = useState({ w: 0, h: 0 });
  const [imgNaturalDim, setImgNaturalDim] = useState({ w: 1, h: 1 });
  const [imgDisplayedDim, setImgDisplayedDim] = useState({ w: 1, h: 1 });

  const [cropPos, setCropPos] = useState({ x: 0, y: 0, w: 200, h: 150 });
  const [zoomScale, setZoomScale] = useState(1.0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, cropX: 0, cropY: 0 });
  const [processing, setProcessing] = useState(false);

  // Safe DataURL state for canvas exports (prevents tainted canvas CORS error)
  const [safeImageSrc, setSafeImageSrc] = useState(imageSrc);

  useEffect(() => {
    let active = true;
    if (!imageSrc) return;

    if (imageSrc.startsWith("data:")) {
      setSafeImageSrc(imageSrc);
      return;
    }

    // Remote image URL: fetch as blob to avoid canvas tainting
    fetch(imageSrc, { mode: "cors" })
      .then((res) => res.blob())
      .then((blob) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (active) setSafeImageSrc(reader.result);
        };
        reader.readAsDataURL(blob);
      })
      .catch((err) => {
        console.warn("CORS fetch fallback to direct URL:", err);
        if (active) setSafeImageSrc(imageSrc);
      });

    return () => {
      active = false;
    };
  }, [imageSrc]);

  useEffect(() => {
    const prevBody = document.body.style.overflow;
    const prevDoc = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    if (window.lenis) window.lenis.stop();

    return () => {
      document.body.style.overflow = prevBody || "";
      document.documentElement.style.overflow = prevDoc || "";
      if (window.lenis) window.lenis.start();
    };
  }, []);

  const handleImageLoad = (e) => {
    const nw = e.target.naturalWidth;
    const nh = e.target.naturalHeight;
    setImgNaturalDim({ w: nw, h: nh });

    const cw = containerRef.current?.clientWidth || 500;
    const ch = containerRef.current?.clientHeight || 350;
    setContainerDim({ w: cw, h: ch });

    const imgAspect = nw / nh;
    let dw, dh;
    if (imgAspect > cw / ch) {
      dw = cw;
      dh = cw / imgAspect;
    } else {
      dh = ch;
      dw = ch * imgAspect;
    }
    setImgDisplayedDim({ w: dw, h: dh });

    let boxW, boxH;
    if (dw / dh > aspect) {
      boxH = dh * 0.85;
      boxW = boxH * aspect;
    } else {
      boxW = dw * 0.85;
      boxH = boxW / aspect;
    }

    const offsetX = (cw - dw) / 2 + (dw - boxW) / 2;
    const offsetY = (ch - dh) / 2 + (dh - boxH) / 2;
    setCropPos({ x: Math.max(0, offsetX), y: Math.max(0, offsetY), w: boxW, h: boxH });
  };

  useEffect(() => {
    if (imgDisplayedDim.w <= 1) return;
    const dw = imgDisplayedDim.w;
    const dh = imgDisplayedDim.h;
    const cw = containerDim.w || 500;
    const ch = containerDim.h || 350;

    let boxW, boxH;
    if (dw / dh > aspect) {
      boxH = Math.min(dh, dh * 0.85);
      boxW = boxH * aspect;
      if (boxW > dw) {
        boxW = dw;
        boxH = boxW / aspect;
      }
    } else {
      boxW = Math.min(dw, dw * 0.85);
      boxH = boxW / aspect;
      if (boxH > dh) {
        boxH = dh;
        boxW = boxH * aspect;
      }
    }

    const zoomedW = Math.max(60, boxW / zoomScale);
    const zoomedH = zoomedW / aspect;

    const imgLeft = (cw - dw) / 2;
    const imgTop = (ch - dh) / 2;
    const clampedX = Math.max(imgLeft, Math.min(cropPos.x, imgLeft + dw - zoomedW));
    const clampedY = Math.max(imgTop, Math.min(cropPos.y, imgTop + dh - zoomedH));

    setCropPos({ x: clampedX, y: clampedY, w: zoomedW, h: zoomedH });
  }, [targetRatio, zoomScale]);

  const handlePointerDown = (e) => {
    e.preventDefault();
    if (processing) return;
    setIsDragging(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      cropX: cropPos.x,
      cropY: cropPos.y,
    };
  };

  const handlePointerMove = (e) => {
    if (!isDragging || processing) return;
    const dx = e.clientX - dragStartRef.current.mouseX;
    const dy = e.clientY - dragStartRef.current.mouseY;

    const cw = containerDim.w;
    const ch = containerDim.h;
    const dw = imgDisplayedDim.w;
    const dh = imgDisplayedDim.h;
    const imgLeft = (cw - dw) / 2;
    const imgTop = (ch - dh) / 2;

    const newX = Math.max(imgLeft, Math.min(dragStartRef.current.cropX + dx, imgLeft + dw - cropPos.w));
    const newY = Math.max(imgTop, Math.min(dragStartRef.current.cropY + dy, imgTop + dh - cropPos.h));

    setCropPos((prev) => ({ ...prev, x: newX, y: newY }));
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const handleConfirmCrop = async () => {
    setProcessing(true);
    try {
      const img = imgRef.current;
      if (!img) return;

      const cw = containerDim.w;
      const ch = containerDim.h;
      const dw = imgDisplayedDim.w;
      const dh = imgDisplayedDim.h;
      const imgLeft = (cw - dw) / 2;
      const imgTop = (ch - dh) / 2;

      const relX = Math.max(0, (cropPos.x - imgLeft) / dw);
      const relY = Math.max(0, (cropPos.y - imgTop) / dh);
      const relW = Math.min(1, cropPos.w / dw);
      const relH = Math.min(1, cropPos.h / dh);

      const srcX = relX * imgNaturalDim.w;
      const srcY = relY * imgNaturalDim.h;
      const srcW = relW * imgNaturalDim.w;
      const srcH = relH * imgNaturalDim.h;

      const canvas = document.createElement("canvas");
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext("2d");

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      ctx.fillStyle = "#FAF5EB";
      ctx.fillRect(0, 0, targetW, targetH);
      ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, targetW, targetH);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setProcessing(false);
            return;
          }
          const croppedFile = new File([blob], `cropped-${targetRatio}-${targetW}x${targetH}.webp`, {
            type: "image/webp",
            lastModified: Date.now(),
          });
          onApplyCrop(croppedFile, targetW, targetH);
        },
        "image/webp",
        0.93
      );
    } catch (err) {
      console.error("Crop error:", err);
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[160] overflow-y-auto p-3 sm:p-6 flex min-h-full items-center justify-center" data-lenis-prevent="true">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => !processing && onClose()}
        className="fixed inset-0 bg-black/80 backdrop-blur-md"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        className="relative z-10 w-full max-w-2xl overflow-y-auto custom-scrollbar my-auto rounded-3xl bg-[#1E0E07] p-5 sm:p-6 shadow-2xl border border-[#D4A85A]/40 text-[#FAF5EB] flex flex-col max-h-[92vh]"
      >
        {/* Processing Animation Full Overlay */}
        <AnimatePresence>
          {processing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#1E0E07]/92 backdrop-blur-md rounded-3xl text-center p-6"
            >
              <div className="relative mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#D4A85A]/25 to-[#6B3F2A]/40 border border-[#D4A85A]/60 shadow-[0_0_35px_rgba(212,168,90,0.4)]">
                <Loader2 size={42} className="animate-spin text-[#D4A85A]" />
                <CropIcon size={20} className="absolute text-[#FAF5EB] animate-pulse" />
              </div>

              <h4 className="text-lg font-black text-[#FAF5EB] tracking-wide" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                Cropping &amp; Uploading Image…
              </h4>

              <p className="text-xs text-[#D4A85A] mt-1.5 font-bold">
                Exporting {targetW} × {targetH} px ({targetRatio === "menu" ? "4:3 Menu" : "3:2 Home"})
              </p>

              <div className="mt-4 flex items-center gap-2 rounded-full bg-[#140803] px-4 py-1.5 border border-[#D4A85A]/30 text-[11px] font-bold text-white/80 shadow-md">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                Saving high-quality WebP to Cloudinary…
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between border-b border-[#D4A85A]/20 pb-3.5 mb-3.5 shrink-0">
          <div>
            <h3 className="text-base font-black text-[#FAF5EB] uppercase tracking-wide flex items-center gap-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              <CropIcon size={18} className="text-[#D4A85A]" /> Adjust Image Crop &amp; Focal Area
            </h3>
            <p className="text-[11px] text-white/60 mt-0.5">
              Drag the golden frame over the subject you want to display on the card
            </p>
          </div>
          <button onClick={onClose} disabled={processing} className="rounded-full p-1.5 bg-white/10 hover:bg-white/20 text-white transition disabled:opacity-30">
            <X size={16} />
          </button>
        </div>

        <div className="mb-3 flex flex-wrap items-center justify-between gap-2.5 shrink-0 rounded-2xl bg-[#140803] p-3 border border-[#D4A85A]/25">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-black uppercase text-[#D4A85A] tracking-wider">Crop Preset:</span>
            <button
              type="button"
              disabled={processing}
              onClick={() => setTargetRatio("menu")}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                targetRatio === "menu"
                  ? "bg-[#D4A85A] text-[#140803] shadow-md font-black"
                  : "bg-[#23120A] text-white/70 hover:text-white border border-[#D4A85A]/20"
              }`}
            >
              Menu Card (800×600 • 4:3)
            </button>
            <button
              type="button"
              disabled={processing}
              onClick={() => setTargetRatio("home")}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                targetRatio === "home"
                  ? "bg-[#D4A85A] text-[#140803] shadow-md font-black"
                  : "bg-[#23120A] text-white/70 hover:text-white border border-[#D4A85A]/20"
              }`}
            >
              Home Showcase (800×533 • 3:2)
            </button>
          </div>

          <div className="flex items-center gap-2 min-w-[140px]">
            <span className="text-[10px] font-bold uppercase text-white/60">Frame Zoom:</span>
            <input
              type="range"
              min="1.0"
              max="2.5"
              step="0.05"
              disabled={processing}
              value={zoomScale}
              onChange={(e) => setZoomScale(parseFloat(e.target.value))}
              className="h-1.5 w-24 accent-[#D4A85A] cursor-pointer disabled:opacity-30"
            />
          </div>
        </div>

        <div
          ref={containerRef}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className="relative h-[250px] sm:h-[300px] md:h-[340px] w-full overflow-hidden rounded-2xl bg-[#0C0402] border border-[#D4A85A]/30 flex items-center justify-center select-none touch-none shrink-0"
        >
          <img
            ref={imgRef}
            src={safeImageSrc}
            crossOrigin="anonymous"
            alt="Original upload to crop"
            onLoad={handleImageLoad}
            className="max-h-full max-w-full object-contain pointer-events-none"
          />

          <div className="absolute inset-0 bg-black/60 pointer-events-none" />

          <div
            onPointerDown={handlePointerDown}
            style={{
              left: `${cropPos.x}px`,
              top: `${cropPos.y}px`,
              width: `${cropPos.w}px`,
              height: `${cropPos.h}px`,
            }}
            className={`absolute z-20 cursor-grab active:cursor-grabbing rounded-xl border-2 border-[#D4A85A] shadow-[0_0_25px_rgba(212,168,90,0.5)] bg-transparent overflow-hidden ${
              isDragging ? "scale-[1.01] border-amber-300" : ""
            }`}
          >
            <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 border border-white/20">
              <div className="border-r border-b border-white/20" />
              <div className="border-r border-b border-white/20" />
              <div className="border-b border-white/20" />
              <div className="border-r border-b border-white/20" />
              <div className="border-r border-b border-white/20" />
              <div className="border-b border-white/20" />
              <div className="border-r border-white/20" />
              <div className="border-r border-white/20" />
              <div />
            </div>

            <div className="absolute top-1 left-1 h-3 w-3 border-t-2 border-l-2 border-[#D4A85A]" />
            <div className="absolute top-1 right-1 h-3 w-3 border-t-2 border-r-2 border-[#D4A85A]" />
            <div className="absolute bottom-1 left-1 h-3 w-3 border-b-2 border-l-2 border-[#D4A85A]" />
            <div className="absolute bottom-1 right-1 h-3 w-3 border-b-2 border-r-2 border-[#D4A85A]" />

            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-[#140803]/90 backdrop-blur-md px-3 py-0.5 text-[9px] font-black uppercase text-[#D4A85A] border border-[#D4A85A]/40 shadow-lg pointer-events-none whitespace-nowrap">
              ✋ Drag Frame Across Image
            </span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-[#D4A85A]/20 flex items-center justify-between shrink-0 flex-wrap gap-2">
          <span className="text-xs text-white/60">
            Target Output: <strong className="text-[#D4A85A]">{targetW} × {targetH} px ({targetRatio === "menu" ? "4:3" : "3:2"})</strong>
          </span>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={processing}
              className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-xs font-bold text-white hover:bg-white/10 transition disabled:opacity-30"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmCrop}
              disabled={processing}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#D4A85A] to-[#A0522D] px-6 py-2 text-xs font-black text-[#140803] shadow-xl hover:scale-105 transition disabled:opacity-50"
            >
              {processing ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              {processing ? "Cropping & Uploading…" : "Apply Crop & Save"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ── Image Upload Component ─────────────────────────────────────── */
export function ImageUploadField({ imageUrl, onUploadSuccess, onRemove, setFormError }) {
  const [uploading, setUploading] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [useUrlFallback, setUseUrlFallback] = useState(false);
  const [imgDimensions, setImgDimensions] = useState(null);
  const fileInputRef = useRef(null);

  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState("");

  const handleFileSelect = (e) => {
    const rawFile = e.target.files?.[0];
    if (!rawFile) return;

    const allowed = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!allowed.includes(rawFile.type.toLowerCase())) {
      setFormError?.("Invalid format. Please upload a PNG, JPG, JPEG, or WEBP image.");
      return;
    }

    setFormError?.("");
    const reader = new FileReader();
    reader.onload = (evt) => {
      setCropImageSrc(evt.target.result);
      setCropModalOpen(true);
    };
    reader.readAsDataURL(rawFile);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleApplyCroppedFile = async (croppedFile) => {
    setCropModalOpen(false);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("cafeImage", croppedFile);

      const res = await fetch(`${API_BASE}/cafe/menu/upload-image`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();
      if (!data.success || !data.url) {
        throw new Error(data.message || "Failed to upload image to Cloudinary.");
      }

      onUploadSuccess(data.url);
    } catch (err) {
      setFormError?.(err.message || "Image upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const [targetSizeText, setTargetSizeText] = useState("800 × 600");

  const handleAutoResizeCurrentUrl = async (targetW = 800, targetH = 600) => {
    if (!imageUrl) return;
    setTargetSizeText(`${targetW} × ${targetH}`);
    setIsResizing(true);
    setUploading(true);
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const rawFile = new File([blob], "cafe-item.jpg", { type: blob.type || "image/jpeg" });
      const resizedFile = await resizeImageToTarget(rawFile, targetW, targetH);

      const formData = new FormData();
      formData.append("cafeImage", resizedFile);

      const res = await fetch(`${API_BASE}/cafe/menu/upload-image`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        onUploadSuccess(data.url);
      }
    } catch {
      setFormError?.("Auto resize failed.");
    } finally {
      setUploading(false);
      setIsResizing(false);
    }
  };

  const handleOpenCropperForExistingUrl = () => {
    if (!imageUrl) return;
    setCropImageSrc(imageUrl);
    setCropModalOpen(true);
  };

  const handleImageLoad = (e) => {
    const w = e.target.naturalWidth;
    const h = e.target.naturalHeight;
    const ratio = w / h;
    const isExceeded = w > 1000 || h > 800;
    const isOptimal = w <= 1000 && h <= 800 && ratio >= 0.95 && ratio <= 1.5;
    setImgDimensions({
      w,
      h,
      isExceeded,
      isOptimal,
      ratio,
    });
  };

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide" style={{ color: "#6B3F2A" }}>
          <Image size={12} /> Menu Item Image
        </label>
        <button
          type="button"
          onClick={() => setUseUrlFallback((prev) => !prev)}
          className="text-[10px] font-semibold underline text-[#6B3F2A]/60 hover:text-[#6B3F2A]"
        >
          {useUrlFallback ? "← Upload File" : "or enter URL directly"}
        </button>
      </div>

      {useUrlFallback ? (
        <input
          type="url"
          placeholder="https://..."
          value={imageUrl}
          onChange={(e) => onUploadSuccess(e.target.value)}
          className="field-input"
        />
      ) : imageUrl ? (
        <div className="relative overflow-hidden rounded-2xl border-2 border-[#D4A85A]/40 bg-white p-3 shadow-sm">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-[#FAF5EB] flex items-center justify-center">
            <img
              src={imageUrl}
              alt="Menu item preview"
              onLoad={handleImageLoad}
              className="h-full w-full object-cover"
            />
            {uploading && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-black/65 backdrop-blur-sm rounded-xl text-white">
                <Loader2 size={32} className="animate-spin text-[#D4A85A]" />
                <p className="text-xs font-black text-[#FAF5EB]">
                  {isResizing ? `Auto-Resizing to ${targetSizeText} px…` : "Uploading Image to Cloudinary…"}
                </p>
                <p className="text-[10px] text-white/60">
                  {isResizing ? "Cropping & optimizing image quality" : "Please wait a moment"}
                </p>
              </div>
            )}

            <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
              <span className="rounded-full bg-black/75 backdrop-blur-md px-2.5 py-0.5 text-[9px] font-bold text-white shadow-sm flex items-center gap-1">
                ☁️ Cloudinary Saved
              </span>
              {imgDimensions && (
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold text-white shadow-sm flex items-center gap-1 ${
                    imgDimensions.isOptimal
                      ? "bg-[#4A7C59]"
                      : imgDimensions.isExceeded
                      ? "bg-amber-600 font-black"
                      : "bg-orange-700"
                  }`}
                >
                  {imgDimensions.isExceeded ? "⚠️" : imgDimensions.isOptimal ? "✓" : "ℹ️"}{" "}
                  {imgDimensions.w} × {imgDimensions.h} px{" "}
                  {imgDimensions.isOptimal
                    ? "(Optimal Fit)"
                    : imgDimensions.isExceeded
                    ? "(Exceeds Recommended Size)"
                    : "(Non-Standard Ratio)"}
                </span>
              )}
            </div>
          </div>

          <div className="mt-2.5 flex items-center justify-between gap-2 flex-wrap rounded-xl border border-[#D4A85A]/30 bg-[#FAF5EB] p-2.5 text-[11px] font-semibold text-[#2C1810] shadow-sm">
            <button
              type="button"
              onClick={handleOpenCropperForExistingUrl}
              disabled={uploading}
              className="flex items-center gap-1.5 rounded-lg bg-[#6B3F2A] px-3 py-1.5 text-xs font-black text-white shadow hover:bg-[#523020] transition disabled:opacity-50"
              title="Move crop frame across image to select exact focal area"
            >
              <CropIcon size={14} className="text-[#D4A85A]" /> Crop &amp; Move Frame
            </button>

            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-[#6B3F2A] text-[10px] uppercase tracking-wider">Auto-Resize:</span>
              <button
                type="button"
                onClick={() => handleAutoResizeCurrentUrl(800, 600)}
                disabled={uploading}
                className="flex items-center gap-1 rounded-lg bg-[#D4A85A] px-2.5 py-1 text-[11px] font-black text-[#140803] shadow hover:bg-[#6B3F2A] hover:text-white disabled:opacity-50 transition"
              >
                Menu (800×600)
              </button>
              <button
                type="button"
                onClick={() => handleAutoResizeCurrentUrl(800, 533)}
                disabled={uploading}
                className="flex items-center gap-1 rounded-lg bg-[#2C1810] px-2.5 py-1 text-[11px] font-black text-white shadow hover:bg-[#A0522D] disabled:opacity-50 transition"
              >
                Home (800×533)
              </button>
            </div>
          </div>

          <div className="mt-2.5 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1.5 rounded-xl border border-[#6B3F2A]/30 bg-[#6B3F2A]/5 px-3 py-1.5 text-xs font-bold text-[#6B3F2A] hover:bg-[#6B3F2A]/10 transition"
            >
              <UploadCloud size={14} /> Change Photo
            </button>
            <button
              type="button"
              onClick={onRemove}
              className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-500 hover:bg-red-100 transition"
            >
              <Trash2 size={13} /> Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-5 text-center transition-all cursor-pointer ${
            uploading
              ? "border-[#6B3F2A] bg-[#6B3F2A]/5 cursor-wait"
              : "border-[#D4A85A]/50 bg-white hover:border-[#6B3F2A] hover:bg-[#6B3F2A]/5"
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2 py-3">
              <Loader2 size={26} className="animate-spin text-[#6B3F2A]" />
              <p className="text-xs font-bold text-[#6B3F2A]">Uploading image to Cloudinary…</p>
              <p className="text-[10px] text-[#2C1810]/50">Please wait a moment</p>
            </div>
          ) : (
            <>
              <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#6B3F2A]/10 text-[#6B3F2A] group-hover:scale-110 transition-transform">
                <UploadCloud size={22} />
              </div>
              <p className="text-xs font-bold text-[#2C1810]">
                Click to Upload &amp; Crop Item Photo
              </p>

              <div className="mt-3 w-full rounded-xl border border-[#D4A85A]/25 bg-[#FAF5EB]/80 p-2.5 text-left text-[10px] space-y-1 text-[#2C1810]/75">
                <div className="flex items-center justify-between font-semibold text-[#6B3F2A]">
                  <span>📐 Interactive Crop:</span>
                  <span className="font-bold text-[#2C1810]">Move crop frame across image</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>🎯 Preset Ratios:</span>
                  <span className="font-bold text-[#2C1810]">800 × 600 (Menu) / 800 × 533 (Home)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>🎨 Allowed Formats:</span>
                  <span className="font-bold text-[#2C1810]">PNG, JPG, JPEG, WEBP</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/jpg, image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      <AnimatePresence>
        {cropModalOpen && (
          <InteractiveCropModal
            imageSrc={cropImageSrc}
            onApplyCrop={handleApplyCroppedFile}
            onClose={() => setCropModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Main Menu Management Component ─────────────────────────────── */
export default function CafeAdminMenuManagement({ showToast }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Category headings management
  const [catHeadings, setCatHeadings] = useState([]);
  const [catHeadingsLoading, setCatHeadingsLoading] = useState(false);
  const [savingCatId, setSavingCatId] = useState(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/cafe/menu/all`, { credentials: "include" });
      const data = await res.json();
      if (data.success) setItems(data.items);
    } catch {
      showToast?.("Failed to fetch menu items", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const fetchCatHeadings = useCallback(async () => {
    setCatHeadingsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/cafe/categories`, { credentials: "include" });
      const data = await res.json();
      if (data.success) setCatHeadings(data.categories || data.headings || []);
    } catch {
      showToast?.("Failed to fetch category headings", "error");
    } finally {
      setCatHeadingsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchItems();
    fetchCatHeadings();
  }, [fetchItems, fetchCatHeadings]);

  useEffect(() => {
    if (modalOpen || deleteConfirm) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      if (window.lenis) window.lenis.stop();
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      if (window.lenis) window.lenis.start();
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      if (window.lenis) window.lenis.start();
    };
  }, [modalOpen, deleteConfirm]);

  const saveCatHeading = async (categoryId, title, subtitle) => {
    setSavingCatId(categoryId);
    try {
      const res = await fetch(`${API_BASE}/cafe/categories/${categoryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title, subtitle }),
      });
      const data = await res.json();
      if (data.success) {
        showToast?.(`Heading updated for "${categoryId}"`);
        fetchCatHeadings();
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      showToast?.(err.message || "Failed to save category heading", "error");
    } finally {
      setSavingCatId(null);
    }
  };

  const filtered = items.filter((item) => {
    const matchCat = activeCategory === "all" || item.category === activeCategory;
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const stats = {
    total: items.length,
    available: items.filter((i) => i.available).length,
    featured: items.filter((i) => i.featured).length,
    categories: [...new Set(items.map((i) => i.category))].length,
  };

  const openAdd = () => {
    setEditItem(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      name: item.name,
      description: item.description || "",
      price: String(item.price),
      category: item.category,
      imageUrl: item.imageUrl || "",
      available: item.available,
      featured: item.featured,
      preparationTime: item.preparationTime || 10,
      tags: (item.tags || []).join(", "),
      ingredients: item.ingredients?.length ? item.ingredients.map(i => ({ name: i.name, percent: i.percent })) : [],
      howItLooks: item.howItLooks || "",
    });
    setFormError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditItem(null);
    setFormError("");
  };

  const handleFormChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) return setFormError("Item name is required.");
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) < 0)
      return setFormError("Enter a valid price.");
    if (!form.category) return setFormError("Select a category.");

    setSaving(true);
    setFormError("");

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      category: form.category,
      imageUrl: form.imageUrl.trim(),
      available: form.available,
      featured: form.featured,
      preparationTime: Number(form.preparationTime) || 10,
      tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      ingredients: (form.ingredients || [])
        .filter((i) => i.name?.trim())
        .map((i) => {
          const p = (i.percent || "").trim();
          const formattedPercent = p ? (p.endsWith("%") || isNaN(p) ? p : `${p}%`) : "";
          return { name: i.name.trim(), percent: formattedPercent };
        }),
      howItLooks: form.howItLooks?.trim() || "",
    };

    try {
      const url = editItem
        ? `${API_BASE}/cafe/menu/${editItem._id}`
        : `${API_BASE}/cafe/menu`;
      const method = editItem ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed to save.");
      showToast?.(editItem ? "Item updated!" : "Item added to menu!");
      setModalOpen(false);
      fetchItems();
    } catch (err) {
      setFormError(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const quickToggle = async (item, field) => {
    try {
      const res = await fetch(`${API_BASE}/cafe/menu/${item._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ [field]: !item[field] }),
      });
      const data = await res.json();
      if (!data.success) throw new Error();
      setItems((prev) =>
        prev.map((i) => (i._id === item._id ? { ...i, [field]: !item[field] } : i))
      );
    } catch {
      showToast?.("Toggle failed", "error");
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await fetch(`${API_BASE}/cafe/menu/${deleteConfirm._id}`, {
        method: "DELETE",
        credentials: "include",
      });
      setItems((prev) => prev.filter((i) => i._id !== deleteConfirm._id));
      showToast?.("Item deleted.");
      setDeleteConfirm(null);
    } catch {
      showToast?.("Delete failed", "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex-1 px-8 py-7">
      {/* Action Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-[#2C1810]">Menu Items &amp; Categories</h2>
          <p className="text-xs text-[#2C1810]/50">Manage items, pricing, tags, ingredients &amp; crop photos</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:scale-105 hover:shadow-lg"
          style={{ background: "linear-gradient(135deg, #6B3F2A, #A0522D)" }}
        >
          <Plus size={16} /> Add Item
        </button>
      </div>

      {/* Stats */}
      <div className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Items" value={stats.total} icon={Coffee} color="#6B3F2A" />
        <StatCard label="Available" value={stats.available} icon={Eye} color="#4A7C59" />
        <StatCard label="Featured" value={stats.featured} icon={Star} color="#D4A85A" />
        <StatCard label="Categories Used" value={stats.categories} icon={LayoutGrid} color="#2A6B8B" />
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className="rounded-full px-3.5 py-1.5 text-xs font-bold transition-all duration-200"
              style={
                activeCategory === c.id
                  ? { background: "#6B3F2A", color: "#FAF5EB" }
                  : { background: "white", color: "#2C1810", border: "1px solid rgba(107,63,42,0.2)" }
              }
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#6B3F2A", opacity: 0.5 }} />
          <input
            type="text"
            placeholder="Search items…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl border border-[#D4A85A]/30 bg-white py-2 pl-8 pr-4 text-xs text-[#2C1810] outline-none focus:border-[#6B3F2A] transition w-52"
          />
        </div>
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-2xl bg-[#D4A85A]/10" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
          <Coffee size={48} style={{ color: "#D4A85A", opacity: 0.4 }} />
          <p className="font-bold text-lg" style={{ color: "#2C1810", opacity: 0.4 }}>No items found</p>
          <button onClick={openAdd} className="rounded-xl bg-[#6B3F2A] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#A0522D] transition">
            + Add First Item
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((item) => {
            const color = CAT_COLORS[item.category] || "#6B3F2A";
            return (
              <motion.div
                key={item._id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#D4A85A]/20 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-[#6B3F2A]/10"
              >
                <div
                  className="relative h-36 overflow-hidden"
                  style={{ background: `linear-gradient(135deg, ${color}15 0%, ${color}28 100%)` }}
                >
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Coffee size={36} style={{ color, opacity: 0.3 }} />
                    </div>
                  )}
                  <div className="absolute left-2 top-2 flex gap-1 flex-wrap">
                    <Badge color={color}>{item.category}</Badge>
                    {item.featured && <Badge color="#D4A85A">⭐ Featured</Badge>}
                    {!item.available && <Badge color="#999">Hidden</Badge>}
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-sm font-black leading-snug" style={{ color: "#2C1810" }}>{item.name}</h3>
                    <span className="shrink-0 text-sm font-black" style={{ color }}>₹{item.price}</span>
                  </div>
                  {item.description && (
                    <p className="mb-3 text-[11px] leading-relaxed line-clamp-2" style={{ color: "#2C1810", opacity: 0.5 }}>
                      {item.description}
                    </p>
                  )}
                  <p className="mb-3 text-[10px] font-medium" style={{ color: "#2C1810", opacity: 0.4 }}>
                    ⏱ {item.preparationTime} min
                  </p>

                  <div className="mt-auto flex items-center gap-1.5">
                    <button
                      onClick={() => quickToggle(item, "available")}
                      className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-bold transition hover:scale-105"
                      style={item.available
                        ? { background: "#4A7C5915", color: "#4A7C59" }
                        : { background: "#99999915", color: "#999" }}
                      title={item.available ? "Mark Hidden" : "Mark Available"}
                    >
                      {item.available ? <Eye size={12} /> : <EyeOff size={12} />}
                      {item.available ? "Live" : "Hidden"}
                    </button>

                    <button
                      onClick={() => quickToggle(item, "featured")}
                      className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-bold transition hover:scale-105"
                      style={item.featured
                        ? { background: "#D4A85A20", color: "#D4A85A" }
                        : { background: "#99999912", color: "#999" }}
                      title={item.featured ? "Remove Featured" : "Mark Featured"}
                    >
                      <Star size={12} fill={item.featured ? "#D4A85A" : "none"} />
                      {item.featured ? "Featured" : "Feature"}
                    </button>

                    <div className="ml-auto flex gap-1">
                      <button
                        onClick={() => openEdit(item)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#6B3F2A]/20 text-[#6B3F2A] hover:bg-[#6B3F2A] hover:text-white transition"
                        title="Edit"
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(item)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-red-200 text-red-400 hover:bg-red-500 hover:text-white transition"
                        title="Delete"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Drawer Modal */}
      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
            />
            <motion.div
              className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col h-full overflow-hidden shadow-2xl"
              style={{ background: "#FAF5EB" }}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
              data-lenis-prevent
            >
              <div
                className="shrink-0 flex items-center justify-between px-7 py-5 border-b border-[#D4A85A]/25"
                style={{ background: "linear-gradient(135deg, #2C1810, #6B3F2A)" }}
              >
                <div>
                  <h2 className="text-base font-black text-white">{editItem ? "Edit Menu Item" : "Add New Item"}</h2>
                  <p className="text-xs text-white/50">{editItem ? `Editing: ${editItem.name}` : "Fill in the details below"}</p>
                </div>
                <button onClick={closeModal} className="rounded-full p-2 text-white/60 hover:bg-white/15 transition">
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-7 py-6 space-y-5 custom-scrollbar" data-lenis-prevent>
                {formError && (
                  <div className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-600">
                    <AlertTriangle size={14} /> {formError}
                  </div>
                )}

                <FormField label="Item Name *" icon={Coffee}>
                  <input
                    type="text"
                    placeholder="e.g. Signature Espresso"
                    value={form.name}
                    onChange={(e) => handleFormChange("name", e.target.value)}
                    className="field-input"
                  />
                </FormField>

                <FormField label="Description" icon={FileText}>
                  <textarea
                    placeholder="Short description of the item…"
                    value={form.description}
                    onChange={(e) => handleFormChange("description", e.target.value)}
                    rows={3}
                    className="field-input resize-none"
                  />
                </FormField>

                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Price (₹) *" icon={DollarSign}>
                    <input
                      type="number"
                      min={0}
                      placeholder="e.g. 120"
                      value={form.price}
                      onChange={(e) => handleFormChange("price", e.target.value)}
                      className="field-input"
                    />
                  </FormField>
                  <FormField label="Category *" icon={Tag}>
                    <select
                      value={form.category}
                      onChange={(e) => handleFormChange("category", e.target.value)}
                      className="field-input"
                    >
                      {CATEGORIES.filter((c) => c.id !== "all").map((c) => (
                        <option key={c.id} value={c.id}>{c.label}</option>
                      ))}
                    </select>
                  </FormField>
                </div>

                <ImageUploadField
                  imageUrl={form.imageUrl}
                  onUploadSuccess={(url) => handleFormChange("imageUrl", url)}
                  onRemove={() => handleFormChange("imageUrl", "")}
                  setFormError={setFormError}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Prep Time (min)" icon={Clock}>
                    <input
                      type="number"
                      min={1}
                      value={form.preparationTime}
                      onChange={(e) => handleFormChange("preparationTime", e.target.value)}
                      className="field-input"
                    />
                  </FormField>
                  <FormField label="Tags (comma sep.)" icon={Tag}>
                    <input
                      type="text"
                      placeholder="hot, bestseller, vegan"
                      value={form.tags}
                      onChange={(e) => handleFormChange("tags", e.target.value)}
                      className="field-input"
                    />
                  </FormField>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide" style={{ color: "#6B3F2A" }}>
                      <UtensilsCrossed size={12} /> Ingredients (Approx.)
                    </label>
                    <button
                      type="button"
                      onClick={() => handleFormChange("ingredients", [...(form.ingredients || []), { name: "", percent: "" }])}
                      className="flex items-center gap-1 rounded-lg border border-[#6B3F2A]/30 px-2.5 py-1 text-[10px] font-bold text-[#6B3F2A] hover:bg-[#6B3F2A]/5 transition"
                    >
                      <Plus size={11} /> Add Row
                    </button>
                  </div>
                  <div className="space-y-2">
                    {(form.ingredients || []).map((ing, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="e.g. Coffee"
                          value={ing.name}
                          onChange={(e) => {
                            const updated = [...form.ingredients];
                            updated[idx] = { ...updated[idx], name: e.target.value };
                            handleFormChange("ingredients", updated);
                          }}
                          className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-[#2C1810] outline-none focus:border-[#6B3F2A] transition"
                        />
                        <input
                          type="text"
                          placeholder="100%"
                          value={ing.percent}
                          onChange={(e) => {
                            const updated = [...form.ingredients];
                            updated[idx] = { ...updated[idx], percent: e.target.value };
                            handleFormChange("ingredients", updated);
                          }}
                          className="w-20 rounded-xl border border-gray-200 px-3 py-2 text-xs font-bold text-[#2C1810] outline-none focus:border-[#6B3F2A] transition"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = form.ingredients.filter((_, i) => i !== idx);
                            handleFormChange("ingredients", updated);
                          }}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-red-200 text-red-400 hover:bg-red-50 transition"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    {(!form.ingredients || form.ingredients.length === 0) && (
                      <p className="text-[10px] text-[#2C1810]/40 italic">No ingredients added yet. Click "Add Row" to add one.</p>
                    )}
                  </div>
                </div>

                <FormField label="How It Looks" icon={Eye}>
                  <input
                    type="text"
                    placeholder="e.g. Dark brown with thick golden crema on top"
                    value={form.howItLooks || ""}
                    onChange={(e) => handleFormChange("howItLooks", e.target.value)}
                    className="field-input"
                  />
                </FormField>

                <div className="grid grid-cols-2 gap-4">
                  <Toggle
                    label="Available on Menu"
                    value={form.available}
                    onChange={(v) => handleFormChange("available", v)}
                    activeColor="#4A7C59"
                  />
                  <Toggle
                    label="Mark as Featured"
                    value={form.featured}
                    onChange={(v) => handleFormChange("featured", v)}
                    activeColor="#D4A85A"
                  />
                </div>
              </div>

              <div className="shrink-0 border-t border-[#D4A85A]/20 px-7 py-4 bg-[#FAF5EB] flex gap-3">
                <button
                  onClick={closeModal}
                  className="flex-1 rounded-xl border border-[#6B3F2A]/25 py-3 text-sm font-bold text-[#6B3F2A] hover:bg-[#6B3F2A]/5 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white shadow-md transition hover:scale-105 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ background: "linear-gradient(135deg, #6B3F2A, #A0522D)" }}
                >
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                  {saving ? "Saving…" : editItem ? "Update Item" : "Add to Menu"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <>
            <motion.div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !deleting && setDeleteConfirm(null)} />
            <motion.div
              className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-red-200 bg-white p-7 shadow-2xl"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
                <Trash2 size={24} className="text-red-500" />
              </div>
              <h3 className="mb-1 text-base font-black" style={{ color: "#2C1810" }}>Delete "{deleteConfirm.name}"?</h3>
              <p className="mb-6 text-xs" style={{ color: "#2C1810", opacity: 0.55 }}>This action cannot be undone. The item will be permanently removed from the menu.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} disabled={deleting} className="flex-1 rounded-xl border border-[#6B3F2A]/25 py-2.5 text-sm font-bold text-[#6B3F2A] hover:bg-[#6B3F2A]/5 transition">Cancel</button>
                <button onClick={handleDelete} disabled={deleting} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 py-2.5 text-sm font-bold text-white hover:bg-red-600 transition disabled:opacity-60">
                  {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  {deleting ? "Deleting…" : "Delete"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
