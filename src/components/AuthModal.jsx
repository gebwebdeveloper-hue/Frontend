import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Mail, Lock, Eye, EyeOff, User, Phone, MapPin,
  KeyRound, CheckCircle2, AlertCircle, Loader2, ArrowLeft
} from "lucide-react";

import { API_BASE } from "../config.js";

// ── Tiny helpers ──────────────────────────────────────────────────────────────
function InputField({ label, id, type = "text", value, onChange, placeholder, required, icon: Icon, rightEl, autoComplete }) {
  return (
    <div>
      {label && <label htmlFor={id} className="block text-[10px] font-semibold uppercase tracking-wider text-white/40 mb-1.5">{label}</label>}
      <div className="relative">
        {Icon && <Icon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />}
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          className={`w-full rounded-xl border border-white/10 bg-white/5 py-3 text-sm text-white placeholder-white/20 focus:border-cyan-400/40 focus:bg-white/10 focus:outline-none transition ${Icon ? "pl-9 pr-4" : "px-4"}`}
        />
        {rightEl && <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightEl}</div>}
      </div>
    </div>
  );
}

function PasswordField({ label, id, value, onChange, placeholder, autoComplete }) {
  const [show, setShow] = useState(false);
  return (
    <InputField
      label={label}
      id={id}
      type={show ? "text" : "password"}
      value={value}
      onChange={onChange}
      placeholder={placeholder || "••••••••"}
      icon={Lock}
      autoComplete={autoComplete}
      rightEl={
        <button type="button" onClick={() => setShow(s => !s)} className="text-white/30 hover:text-white/70 transition">
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      }
    />
  );
}

function Alert({ type, msg }) {
  if (!msg) return null;
  const styles = type === "error"
    ? "border-red-500/20 bg-red-500/5 text-red-300"
    : "border-emerald-500/20 bg-emerald-500/5 text-emerald-300";
  const Icon = type === "error" ? AlertCircle : CheckCircle2;
  return (
    <div className={`flex items-start gap-2.5 rounded-xl border p-3.5 text-xs ${styles}`}>
      <Icon size={15} className="shrink-0 mt-0.5" />
      <span>{msg}</span>
    </div>
  );
}

// ── LOGIN ─────────────────────────────────────────────────────────────────────
function LoginForm({ onSuccess, onForgot, onRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include"
      });
      const data = await res.json();
      if (data.success) {
        window.dispatchEvent(new Event("lekhak:login"));
        onSuccess(data.user);
      } else {
        setError(data.message || "Login failed.");
      }
    } catch { setError("Could not connect to server."); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Alert type="error" msg={error} />
      <InputField label="Email Address" id="login-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required icon={Mail} autoComplete="email" />
      <PasswordField label="Password" id="login-password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" />
      <div className="flex justify-end">
        <button type="button" onClick={onForgot} className="text-[11px] text-cyan-400 hover:text-cyan-300 transition">
          Forgot password?
        </button>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3.5 text-sm font-bold text-black hover:bg-cyan-50 transition disabled:opacity-50"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : "Sign In"}
      </button>
      <p className="text-center text-xs text-white/40">
        Don't have an account?{" "}
        <button type="button" onClick={onRegister} className="text-cyan-400 hover:text-cyan-300 transition font-medium">
          Register here
        </button>
      </p>
    </form>
  );
}

// ── REGISTER (2 steps) ────────────────────────────────────────────────────────
function RegisterForm({ onSuccess, onLogin }) {
  const [step, setStep] = useState("details"); // 'details' | 'otp'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const [form, setForm] = useState({
    name: "", email: "", phone: "", co: "", country: "India",
    district: "", block: "", pin: "", postOffice: "", nearbyLocation: "",
    password: "", confirmPassword: ""
  });
  const [otp, setOtp] = useState("");

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match."); return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters."); return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
        credentials: "include"
      });
      const data = await res.json();
      if (data.success) { setOtpSent(true); setStep("otp"); }
      else setError(data.message || "Failed to send OTP.");
    } catch { setError("Could not connect to server."); }
    finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email, password: form.password, otp,
          name: form.name, co: form.co, phone: form.phone,
          country: form.country, district: form.district,
          block: form.block, pin: form.pin,
          postOffice: form.postOffice, nearbyLocation: form.nearbyLocation
        }),
        credentials: "include"
      });
      const data = await res.json();
      if (data.success) {
        window.dispatchEvent(new Event("lekhak:login"));
        onSuccess(data.user);
      } else {
        setError(data.message || "Registration failed.");
      }
    } catch { setError("Could not connect to server."); }
    finally { setLoading(false); }
  };

  if (step === "otp") {
    return (
      <form onSubmit={handleRegister} className="space-y-4">
        <button type="button" onClick={() => setStep("details")} className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition mb-2">
          <ArrowLeft size={13} /> Back to details
        </button>
        <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4 text-center">
          <Mail size={28} className="mx-auto mb-2 text-cyan-400" />
          <p className="text-sm font-semibold text-white">Check your inbox</p>
          <p className="text-xs text-white/40 mt-1">We sent a 6-digit OTP to <span className="text-cyan-300">{form.email}</span></p>
        </div>
        <Alert type="error" msg={error} />
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-white/40 mb-1.5">Verification OTP</label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            required
            value={otp}
            onChange={e => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="• • • • • •"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-center text-xl font-bold tracking-[0.5em] text-white placeholder-white/15 focus:border-cyan-400/40 focus:bg-white/10 focus:outline-none transition"
          />
        </div>
        <button
          type="submit"
          disabled={loading || otp.length < 6}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3.5 text-sm font-bold text-black hover:bg-cyan-50 transition disabled:opacity-50"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : "Verify & Create Account"}
        </button>
        <p className="text-center text-xs text-white/30">
          Didn't receive it?{" "}
          <button type="button" onClick={handleSendOtp} disabled={loading} className="text-cyan-400 hover:text-cyan-300 transition">
            Resend OTP
          </button>
        </p>
      </form>
    );
  }

  return (
    <form onSubmit={handleSendOtp} className="space-y-4">
      <Alert type="error" msg={error} />

      {/* Name + Email */}
      <div className="grid grid-cols-2 gap-3">
        <InputField label="Full Name *" id="reg-name" value={form.name} onChange={set("name")} placeholder="Kiran Samanta" required icon={User} />
        <InputField label="Email Address *" id="reg-email" type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" required icon={Mail} autoComplete="email" />
      </div>

      {/* Phone + C/O */}
      <div className="grid grid-cols-2 gap-3">
        <InputField label="Phone Number *" id="reg-phone" type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value.replace(/[^0-9]/g, "") }))} placeholder="9876543210" required icon={Phone} />
        <InputField label="C/O (Care Of)" id="reg-co" value={form.co} onChange={set("co")} placeholder="S/O Mr. Smith" />
      </div>

      {/* District + Block */}
      <div className="grid grid-cols-2 gap-3">
        <InputField label="District" id="reg-district" value={form.district} onChange={set("district")} placeholder="West Tripura" icon={MapPin} />
        <InputField label="Block" id="reg-block" value={form.block} onChange={set("block")} placeholder="Jirania" />
      </div>

      {/* PIN + Post Office */}
      <div className="grid grid-cols-2 gap-3">
        <InputField label="PIN Code" id="reg-pin" value={form.pin} onChange={e => setForm(f => ({ ...f, pin: e.target.value.replace(/[^0-9]/g, "") }))} placeholder="799001" />
        <InputField label="Post Office" id="reg-po" value={form.postOffice} onChange={set("postOffice")} placeholder="Jirania P.O." />
      </div>

      {/* Nearby Location */}
      <InputField label="Nearby Location (school / bank / temple)" id="reg-nearby" value={form.nearbyLocation} onChange={set("nearbyLocation")} placeholder="Near SBI Bank, Jirania" />

      {/* Password */}
      <div className="grid grid-cols-2 gap-3 border-t border-white/5 pt-4">
        <PasswordField label="Create Password *" id="reg-pwd" value={form.password} onChange={set("password")} placeholder="Min 8 characters" autoComplete="new-password" />
        <PasswordField label="Confirm Password *" id="reg-confirm" value={form.confirmPassword} onChange={set("confirmPassword")} placeholder="Re-enter password" autoComplete="new-password" />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3.5 text-sm font-bold text-black hover:bg-cyan-50 transition disabled:opacity-50"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : "Send Verification OTP"}
      </button>
      <p className="text-center text-xs text-white/40">
        Already have an account?{" "}
        <button type="button" onClick={onLogin} className="text-cyan-400 hover:text-cyan-300 transition font-medium">
          Sign in
        </button>
      </p>
    </form>
  );
}

// ── FORGOT PASSWORD (2 steps) ─────────────────────────────────────────────────
function ForgotPasswordForm({ onBack, onSuccess }) {
  const [step, setStep] = useState("email"); // 'email' | 'reset'
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        credentials: "include"
      });
      const data = await res.json();
      if (data.success) { setStep("reset"); }
      else setError(data.message || "Failed to send OTP.");
    } catch { setError("Could not connect to server."); }
    finally { setLoading(false); }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) { setError("Passwords do not match."); return; }
    if (newPassword.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
        credentials: "include"
      });
      const data = await res.json();
      if (data.success) {
        window.dispatchEvent(new Event("lekhak:login"));
        onSuccess(data.user);
      } else {
        setError(data.message || "Password reset failed.");
      }
    } catch { setError("Could not connect to server."); }
    finally { setLoading(false); }
  };

  if (step === "reset") {
    return (
      <form onSubmit={handleReset} className="space-y-4">
        <button type="button" onClick={() => setStep("email")} className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition mb-2">
          <ArrowLeft size={13} /> Back
        </button>
        <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4 text-center">
          <KeyRound size={28} className="mx-auto mb-2 text-cyan-400" />
          <p className="text-sm font-semibold text-white">Reset your password</p>
          <p className="text-xs text-white/40 mt-1">OTP sent to <span className="text-cyan-300">{email}</span></p>
        </div>
        <Alert type="error" msg={error} />
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-white/40 mb-1.5">OTP Code</label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            required
            value={otp}
            onChange={e => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="• • • • • •"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-center text-xl font-bold tracking-[0.5em] text-white placeholder-white/15 focus:border-cyan-400/40 focus:bg-white/10 focus:outline-none transition"
          />
        </div>
        <PasswordField label="New Password *" id="fp-newpwd" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min 8 characters" autoComplete="new-password" />
        <PasswordField label="Confirm New Password *" id="fp-confirm" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Re-enter new password" autoComplete="new-password" />
        <button
          type="submit"
          disabled={loading || otp.length < 6}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3.5 text-sm font-bold text-black hover:bg-cyan-50 transition disabled:opacity-50"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : "Reset Password & Sign In"}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSendOtp} className="space-y-4">
      <button type="button" onClick={onBack} className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition mb-2">
        <ArrowLeft size={13} /> Back to Sign In
      </button>
      <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5 text-center">
        <KeyRound size={32} className="mx-auto mb-3 text-cyan-400" />
        <p className="text-sm font-semibold text-white">Forgot your password?</p>
        <p className="text-xs text-white/40 mt-1.5 leading-relaxed">Enter your registered email and we'll send you a one-time password reset code.</p>
      </div>
      <Alert type="error" msg={error} />
      <InputField label="Registered Email Address" id="fp-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required icon={Mail} autoComplete="email" />
      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3.5 text-sm font-bold text-black hover:bg-cyan-50 transition disabled:opacity-50"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : "Send Reset OTP"}
      </button>
    </form>
  );
}

// ── MAIN AUTH MODAL ───────────────────────────────────────────────────────────
export default function AuthModal({ onClose, initialTab = "login" }) {
  const [tab, setTab] = useState(initialTab); // 'login' | 'register' | 'forgot'
  const [successUser, setSuccessUser] = useState(null);

  // Lock background scroll while modal is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  const handleSuccess = (user) => {
    setSuccessUser(user);
    setTimeout(() => { onClose(user); }, 1800);
  };

  const tabBtn = (id, label) => (
    <button
      onClick={() => setTab(id)}
      className={`flex-1 rounded-full py-2 text-sm font-semibold transition ${
        tab === id ? "bg-white text-black" : "text-white/50 hover:text-white"
      }`}
    >
      {label}
    </button>
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(null); }}
      >
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.97 }}
          transition={{ type: "spring", stiffness: 300, damping: 26 }}
          className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-3xl border border-white/10 bg-[#0e0e0e] p-7 shadow-2xl custom-scrollbar"
          onClick={(e) => e.stopPropagation()}
          data-lenis-prevent
        >
          {/* Close */}
          <button
            onClick={() => onClose(null)}
            className="absolute right-5 top-5 grid h-8 w-8 place-items-center rounded-full border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition"
          >
            <X size={16} />
          </button>

          {/* Logo + Title */}
          <div className="mb-6 text-center">
            <img src="/logo.png" alt="Lekhak" className="mx-auto h-12 w-12 object-contain mb-3" />
            <h2 className="text-xl font-bold text-white">
              {tab === "login" && "Welcome Back"}
              {tab === "register" && "Create Your Account"}
              {tab === "forgot" && "Password Recovery"}
            </h2>
            <p className="text-xs text-white/40 mt-1">
              {tab === "login" && "Sign in to access your purchased ebooks"}
              {tab === "register" && "Register to purchase and read ebooks"}
              {tab === "forgot" && "We'll help you get back into your account"}
            </p>
          </div>

          {/* Success screen */}
          {successUser ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-10 text-center"
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 size={32} />
              </div>
              <p className="text-lg font-bold text-white">
                Welcome, {successUser.name || successUser.email.split("@")[0]}!
              </p>
              <p className="text-xs text-white/40 mt-2">You are now signed in.</p>
            </motion.div>
          ) : (
            <>
              {/* Tab switcher (login/register only) */}
              {tab !== "forgot" && (
                <div className="flex gap-1 rounded-full bg-white/5 p-1 border border-white/10 mb-6">
                  {tabBtn("login", "Sign In")}
                  {tabBtn("register", "Register")}
                </div>
              )}

              <AnimatePresence mode="wait">
                <motion.div
                  key={tab}
                  initial={{ opacity: 0, x: tab === "register" ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: tab === "register" ? -20 : 20 }}
                  transition={{ duration: 0.2 }}
                >
                  {tab === "login" && (
                    <LoginForm
                      onSuccess={handleSuccess}
                      onForgot={() => setTab("forgot")}
                      onRegister={() => setTab("register")}
                    />
                  )}
                  {tab === "register" && (
                    <RegisterForm
                      onSuccess={handleSuccess}
                      onLogin={() => setTab("login")}
                    />
                  )}
                  {tab === "forgot" && (
                    <ForgotPasswordForm
                      onBack={() => setTab("login")}
                      onSuccess={handleSuccess}
                    />
                  )}
                 </motion.div>
               </AnimatePresence>
             </>
           )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
