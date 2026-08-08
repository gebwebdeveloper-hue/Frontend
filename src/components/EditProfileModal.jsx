import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Camera, User, Phone, Mail, MapPin, Loader2, CheckCircle2, AlertCircle, Award, Copy, ShieldCheck, BookOpen, PenLine } from "lucide-react";
import { API_BASE } from "../config.js";

export default function EditProfileModal({ user, onClose, onUpdated }) {
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [age, setAge] = useState(user?.age || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");
  const [co, setCo] = useState(user?.co || "");
  const [district, setDistrict] = useState(user?.district || "");
  const [pin, setPin] = useState(user?.pin || "");
  const [postOffice, setPostOffice] = useState(user?.postOffice || "");
  const [nearbyLocation, setNearbyLocation] = useState(user?.nearbyLocation || "");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

  // Club membership activation state
  const [memberIdInput, setMemberIdInput] = useState("");
  const [memberActivating, setMemberActivating] = useState(false);
  const [memberError, setMemberError] = useState("");
  const [memberSuccess, setMemberSuccess] = useState("");
  const [activeMemberId, setActiveMemberId] = useState(user?.memberId || "");
  const [copied, setCopied] = useState(false);

  // Lock body & Lenis scroll while modal is open
  useEffect(() => {
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    if (window.lenis) {
      window.lenis.stop();
    }

    return () => {
      document.body.style.overflow = originalBodyOverflow || "unset";
      document.documentElement.style.overflow = originalHtmlOverflow || "unset";
      if (window.lenis) {
        window.lenis.start();
      }
    };
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size exceeds 5MB limit. Please choose a smaller photo.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarUrl(reader.result);
      setError("");
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          age: age ? Number(age) : undefined,
          avatarUrl,
          co: co.trim(),
          district: district.trim(),
          pin: pin.trim(),
          postOffice: postOffice.trim(),
          nearbyLocation: nearbyLocation.trim()
        })
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        window.dispatchEvent(new Event("lekhak:login"));
        if (onUpdated) onUpdated(data.user);
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setError(data.message || "Failed to update profile details.");
      }
    } catch {
      setError("Network error connecting to server.");
    } finally {
      setLoading(false);
    }
  };

  const handleActivateMembership = async (e) => {
    e.preventDefault();
    if (!memberIdInput.trim()) return;
    setMemberActivating(true);
    setMemberError("");
    setMemberSuccess("");
    try {
      const res = await fetch(`${API_BASE}/profile/activate-membership`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ memberId: memberIdInput.trim().toUpperCase() }),
      });
      const data = await res.json();
      if (data.success) {
        setActiveMemberId(data.memberId);
        setMemberSuccess(data.message || "Club membership activated! Discounts are now active.");
        setMemberIdInput("");
        window.dispatchEvent(new Event("lekhak:login"));
        if (onUpdated) onUpdated(data.user);
      } else {
        setMemberError(data.message || "Activation failed.");
      }
    } catch {
      setMemberError("Network error. Please try again.");
    } finally {
      setMemberActivating(false);
    }
  };

  const handleCopyMemberId = () => {
    if (activeMemberId) {
      navigator.clipboard.writeText(activeMemberId).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const userInitial = name
    ? name.charAt(0).toUpperCase()
    : (user?.email || "U").charAt(0).toUpperCase();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onWheel={(e) => e.stopPropagation()}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md overflow-hidden"
      >
        <motion.div
          data-lenis-prevent
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-3xl border border-white/10 bg-[#0c0c0e] p-6 sm:p-8 text-white shadow-2xl custom-scrollbar my-auto"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition"
          >
            <X size={18} />
          </button>

          {/* Header */}
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">Update Account Profile</h2>
            <p className="text-xs text-white/50 mt-1">
              Add your contact phone number & photo for personalized updates.
            </p>
          </div>

          {success ? (
            <div className="py-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-lg font-bold text-white">Profile Updated Successfully!</h3>
              <p className="text-xs text-white/50 mt-1">Your details have been saved.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="flex items-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 p-3.5 text-xs text-red-300">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Avatar Upload Section */}
              <div className="flex flex-col items-center justify-center pb-2">
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <div className="h-24 w-24 overflow-hidden rounded-full border-2 border-cyan-400/40 bg-gradient-to-br from-cyan-500 to-indigo-600 grid place-items-center text-3xl font-black text-black shadow-lg">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                      userInitial
                    )}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera size={22} className="text-white" />
                  </div>
                  <button
                    type="button"
                    className="absolute bottom-0 right-0 grid h-8 w-8 place-items-center rounded-full bg-cyan-400 text-black shadow-md hover:bg-cyan-300 transition"
                  >
                    <Camera size={14} />
                  </button>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <p className="mt-2.5 text-[11px] font-semibold text-cyan-300/90 text-center">
                  Click circle to upload profile photo
                </p>
                <p className="text-[10px] text-white/40 text-center">
                  (Recommended: Square 200×200 px or 1:1 aspect ratio, Max 5MB)
                </p>
              </div>

              {/* Email (Readonly) */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1.5">
                  Email Address (Verified)
                </label>
                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/60">
                  <Mail size={14} className="text-white/40 shrink-0" />
                  <span className="truncate">{user?.email}</span>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1.5">
                  Full Name *
                </label>
                <div className="relative">
                  <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 pl-9 pr-4 py-3 text-xs text-white focus:border-cyan-400/50 focus:outline-none placeholder-white/20"
                  />
                </div>
              </div>

              {/* Phone & Age */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1.5 flex items-center justify-between">
                    <span>Phone Number *</span>
                    {!user?.phone && <span className="text-amber-400 lowercase font-normal">(required for SMS)</span>}
                  </label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="tel"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      placeholder="10-digit mobile number"
                      className="w-full rounded-2xl border border-white/10 bg-white/5 pl-9 pr-4 py-3 text-xs text-white focus:border-cyan-400/50 focus:outline-none font-mono placeholder-white/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1.5">
                    Age
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="e.g. 25"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white focus:border-cyan-400/50 focus:outline-none placeholder-white/20"
                  />
                </div>
              </div>

              {/* Optional Address Section */}
              <div className="pt-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 mb-3 flex items-center gap-1">
                  <MapPin size={12} /> Delivery & Address Details (Optional)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="District (e.g. West Tripura)"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-white focus:border-cyan-400/50 focus:outline-none placeholder-white/20"
                  />
                  <input
                    type="text"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="PIN Code (e.g. 799001)"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-white focus:border-cyan-400/50 focus:outline-none font-mono placeholder-white/20"
                  />
                </div>
              </div>

              {/* ── CLUB MEMBERSHIP ACTIVATION ── */}
              <div className="pt-2 border-t border-white/10">
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-300 mb-3 flex items-center gap-1.5">
                  <Award size={12} /> Club Membership
                </p>

                {activeMemberId ? (
                  /* Active membership badge */
                  <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/8 p-4">
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className="grid h-8 w-8 place-items-center rounded-full bg-emerald-500/15 border border-emerald-500/30">
                        <ShieldCheck size={16} className="text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-emerald-300">Club Membership Active ✓</p>
                        <p className="text-[10px] text-white/50">Discounts are applied automatically at checkout</p>
                      </div>
                    </div>
                    {/* Member ID display */}
                    <div className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-black/30 px-3.5 py-2.5 mb-3">
                      <span className="font-mono text-sm font-black text-white tracking-wider">{activeMemberId}</span>
                      <button
                        type="button"
                        onClick={handleCopyMemberId}
                        className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 hover:text-emerald-300 transition"
                      >
                        <Copy size={11} />
                        {copied ? "Copied!" : "Copy"}
                      </button>
                    </div>
                    {/* Discount benefits grid */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/8 px-3 py-2">
                        <BookOpen size={13} className="text-cyan-400 shrink-0" />
                        <div>
                          <p className="text-[10px] font-black text-cyan-300">5% OFF</p>
                          <p className="text-[9px] text-white/50">Book Purchases</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 rounded-xl border border-indigo-400/20 bg-indigo-400/8 px-3 py-2">
                        <PenLine size={13} className="text-indigo-400 shrink-0" />
                        <div>
                          <p className="text-[10px] font-black text-indigo-300">10% OFF</p>
                          <p className="text-[9px] text-white/50">Book Publishing</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Not yet activated — show input */
                  <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4 space-y-3">
                    <p className="text-xs text-white/70 leading-relaxed">
                      🎯 Paste the <strong className="text-amber-300">Member ID</strong> from your club confirmation email to unlock discounts.
                    </p>
                    {memberSuccess && (
                      <div className="flex items-start gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-300">
                        <CheckCircle2 size={14} className="shrink-0 mt-0.5" />
                        <span>{memberSuccess}</span>
                      </div>
                    )}
                    {memberError && (
                      <div className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-300">
                        <AlertCircle size={14} className="shrink-0 mt-0.5" />
                        <span>{memberError}</span>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={memberIdInput}
                        onChange={(e) => setMemberIdInput(e.target.value.toUpperCase())}
                        placeholder="e.g. LTCLUB-1234"
                        className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs text-white font-mono focus:border-amber-400/50 focus:outline-none placeholder-white/20 uppercase"
                        maxLength={12}
                      />
                      <button
                        type="button"
                        onClick={handleActivateMembership}
                        disabled={memberActivating || !memberIdInput.trim()}
                        className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 px-4 py-2.5 text-xs font-black text-black hover:opacity-90 transition disabled:opacity-50 whitespace-nowrap"
                      >
                        {memberActivating ? <Loader2 size={12} className="animate-spin" /> : <ShieldCheck size={12} />}
                        Activate
                      </button>
                    </div>
                    <p className="text-[9px] text-white/35 leading-relaxed">
                      Your Member ID is in the confirmation email sent after joining the club. It looks like <span className="font-mono text-white/50">LTCLUB-XXXX</span>.
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-semibold text-white/70 hover:bg-white/10 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-indigo-400 px-5 py-3 text-xs font-black text-black hover:opacity-90 transition shadow-lg shadow-cyan-400/20 disabled:opacity-50 uppercase tracking-wider"
                >
                  {loading ? (
                    <Loader2 size={16} className="animate-spin text-black" />
                  ) : (
                    "Save Profile Details"
                  )}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
