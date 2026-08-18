import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Mail, Lock, Eye, EyeOff, User, Phone,
  KeyRound, CheckCircle2, AlertCircle, Loader2, ArrowLeft,
  Building2, Feather
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
function LoginForm({ onSuccess, onForgot, onRegister, onPublisherAuthorLogin }) {
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
        {loading ? <Loader2 size={16} className="animate-spin" /> : "Login"}
      </button>
      <p className="text-center text-xs text-white/40">
        Don't have an account?{" "}
        <button type="button" onClick={onRegister} className="text-cyan-400 hover:text-cyan-300 transition font-medium">
          Sign in here
        </button>
      </p>

      {/* Publisher & Author Login Section */}
      <div className="pt-4 border-t border-white/10 mt-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40 mb-2.5 text-center">
          Publisher & Author Portal
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onPublisherAuthorLogin("publisher")}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-2.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400/50 transition shadow-sm"
          >
            <Building2 size={14} className="shrink-0 text-cyan-400" />
            <span>Login as Publisher</span>
          </button>
          <button
            type="button"
            onClick={() => onPublisherAuthorLogin("author")}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-2.5 py-2.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 hover:border-amber-400/50 transition shadow-sm"
          >
            <Feather size={14} className="shrink-0 text-amber-400" />
            <span>Login as Author</span>
          </button>
        </div>
      </div>
    </form>
  );
}

// ── PUBLISHER & AUTHOR LOGIN FORM ─────────────────────────────────────────────
function PublisherAuthorLoginForm({ initialRole = "publisher", onSuccess, onBack }) {
  const navigate = useNavigate();
  const [roleTab, setRoleTab] = useState(initialRole); // 'publisher' | 'author'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const endpoint = roleTab === "author"
      ? `${API_BASE}/publisher/author-login`
      : `${API_BASE}/publisher/login`;

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("lekhok_publisher_token", data.token);
        localStorage.setItem("lekhok_publisher_role", roleTab);
        onSuccess({ name: roleTab === "author" ? "Author" : "Publisher", role: roleTab });
        setTimeout(() => {
          navigate(roleTab === "author" ? "/author_dashboard" : "/publisher_dashboard");
        }, 1200);
      } else {
        setError(data.message || `Invalid ${roleTab} credentials.`);
      }
    } catch {
      setError("Could not connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition mb-2"
      >
        <ArrowLeft size={13} /> Back to Reader Login
      </button>

      {/* Role Switcher */}
      <div className="flex gap-1.5 rounded-xl bg-white/5 p-1 border border-white/10 mb-3">
        <button
          type="button"
          onClick={() => { setRoleTab("publisher"); setError(""); }}
          className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition ${
            roleTab === "publisher"
              ? "bg-cyan-500/20 border border-cyan-400/40 text-cyan-300"
              : "text-white/50 hover:text-white"
          }`}
        >
          <Building2 size={14} /> Publisher Portal
        </button>
        <button
          type="button"
          onClick={() => { setRoleTab("author"); setError(""); }}
          className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition ${
            roleTab === "author"
              ? "bg-amber-500/20 border border-amber-400/40 text-amber-300"
              : "text-white/50 hover:text-white"
          }`}
        >
          <Feather size={14} /> Author Portal
        </button>
      </div>

      <Alert type="error" msg={error} />

      <InputField
        label={`${roleTab === "publisher" ? "Publisher" : "Author"} Email`}
        id="portal-email"
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="you@example.com"
        required
        icon={Mail}
        autoComplete="email"
      />

      <PasswordField
        label="Password"
        id="portal-password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        autoComplete="current-password"
      />

      <button
        type="submit"
        disabled={loading}
        className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-black transition disabled:opacity-50 ${
          roleTab === "publisher"
            ? "bg-cyan-400 hover:bg-cyan-300"
            : "bg-amber-400 hover:bg-amber-300"
        }`}
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : `Login as ${roleTab === "publisher" ? "Publisher" : "Author"}`}
      </button>

      <div className="pt-2 text-center">
        <a
          href={roleTab === "publisher" ? "/publisher_dashboard" : "/author_dashboard"}
          className="text-[11px] text-white/40 hover:text-white/70 transition underline"
        >
          Go directly to {roleTab === "publisher" ? "Publisher Portal" : "Author Portal"} →
        </a>
      </div>
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
    name: "", email: "", phone: "", age: "",
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
          name: form.name, phone: form.phone, age: form.age
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

      <div className="grid gap-3 sm:grid-cols-2">
        <InputField label="Full Name *" id="reg-name" value={form.name} onChange={set("name")} placeholder="Kiran Samanta" required icon={User} />
        <InputField label="Email Address *" id="reg-email" type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" required icon={Mail} autoComplete="email" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <InputField label="Phone Number *" id="reg-phone" type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value.replace(/[^0-9]/g, "") }))} placeholder="9876543210" required icon={Phone} />
        <InputField label="Age *" id="reg-age" type="number" value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value.replace(/[^0-9]/g, "") }))} placeholder="25" required icon={User} />
      </div>

      <div className="grid gap-3 border-t border-white/5 pt-4 sm:grid-cols-2">
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
          Login here
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

// ── GOOGLE AUTH BUTTON ────────────────────────────────────────────────────────
function GoogleAuthButton({ mode = "login", onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleClick = () => {
    setLoading(true);
    setError("");

    if (!window.google) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.onload = () => initGoogleSignIn();
      script.onerror = () => {
        setLoading(false);
        setError("Failed to load Google Auth SDK.");
      };
      document.body.appendChild(script);
    } else {
      initGoogleSignIn();
    }
  };

  const initGoogleSignIn = () => {
    try {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (!clientId || clientId.includes("placeholder")) {
        setLoading(false);
        setError("Google OAuth Client ID is missing. Please add VITE_GOOGLE_CLIENT_ID to your Client/.env file, or log in with email.");
        return;
      }
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            if (response.credential) {
              await verifyGoogleToken(response.credential);
            } else {
              setLoading(false);
            }
          }
        });
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            setLoading(false);
          }
        });
      } else {
        setLoading(false);
      }
    } catch {
      setLoading(false);
      setError("Could not initialize Google Sign-In.");
    }
  };

  const verifyGoogleToken = async (credential) => {
    try {
      const res = await fetch(`${API_BASE}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ credential, mode })
      });
      const data = await res.json();
      if (data.success) {
        window.dispatchEvent(new Event("lekhak:login"));
        onSuccess(data.user);
      } else {
        setError(data.message || "Google auth failed.");
      }
    } catch {
      setError("Network error connecting to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-5 space-y-3">
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-300">
          <AlertCircle size={14} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}
      <button
        type="button"
        onClick={handleGoogleClick}
        disabled={loading}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15 hover:border-white/30 disabled:opacity-50 shadow-md"
      >
        {loading ? (
          <Loader2 size={18} className="animate-spin text-cyan-400" />
        ) : (
          <>
            <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.24v3.15C3.26 21.39 7.34 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.24C.45 8.18 0 10.03 0 12s.45 3.82 1.24 5.39l4.04-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.61 1.24 6.61l4.04 3.15c.95-2.85 3.6-4.96 6.72-4.96z"
              />
            </svg>
            <span>{mode === "register" ? "Sign Up with Google" : "Login with Google"}</span>
          </>
        )}
      </button>

      <div className="relative flex items-center justify-center my-4">
        <div className="w-full border-t border-white/10" />
        <span className="absolute bg-[#0e0e0e] px-3 text-[10px] uppercase font-bold tracking-wider text-white/35">
          or email
        </span>
      </div>
    </div>
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
        className="fixed inset-0 z-[200] flex items-start justify-center pt-20 sm:pt-24 md:pt-28 p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(null); }}
      >
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.97 }}
          transition={{ type: "spring", stiffness: 300, damping: 26 }}
          className="relative w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-3xl border border-white/10 bg-[#0e0e0e] p-7 shadow-2xl custom-scrollbar mb-10"
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
              {tab === "publisher" && "Publisher Portal Login"}
              {tab === "author" && "Author Portal Login"}
            </h2>
            <p className="text-xs text-white/40 mt-1">
              {tab === "login" && "Login to access your purchased ebooks"}
              {tab === "register" && "Sign In to purchase and read ebooks"}
              {tab === "forgot" && "We'll help you get back into your account"}
              {tab === "publisher" && "Sign in to access your publisher management dashboard"}
              {tab === "author" && "Sign in to access your author stats and royalties"}
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
                Welcome, {successUser.name || successUser.email?.split("@")[0] || "User"}!
              </p>
              <p className="text-xs text-white/40 mt-2">You are now signed in.</p>
            </motion.div>
          ) : (
            <>
              {/* Tab switcher (login/register only) */}
              {tab !== "forgot" && tab !== "publisher" && tab !== "author" && (
                <>
                  <div className="flex gap-1 rounded-full bg-white/5 p-1 border border-white/10 mb-6">
                    {tabBtn("login", "Login")}
                    {tabBtn("register", "Sign In")}
                  </div>
                  <GoogleAuthButton mode={tab} onSuccess={handleSuccess} />
                </>
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
                      onPublisherAuthorLogin={(role) => setTab(role)}
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
                  {(tab === "publisher" || tab === "author") && (
                    <PublisherAuthorLoginForm
                      initialRole={tab}
                      onSuccess={handleSuccess}
                      onBack={() => setTab("login")}
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




