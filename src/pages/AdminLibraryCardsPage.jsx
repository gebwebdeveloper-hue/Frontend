import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Loader2, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import PageTransition from "../components/PageTransition.jsx";
import AdminNavbar from "../components/AdminNavbar.jsx";
import AdminLibraryCardsSection from "../components/AdminLibraryCardsSection.jsx";
import { API_BASE } from "../config.js";

export default function AdminLibraryCardsPage() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [authError, setAuthError] = useState("");
  const [submittingAuth, setSubmittingAuth] = useState(false);
  const [loginStep, setLoginStep] = useState("email");

  useEffect(() => {
    fetch(`${API_BASE}/auth/me`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success && data.user && data.user.role === "admin") {
          setAuthed(true);
        } else {
          setAuthed(false);
        }
      })
      .catch(() => setAuthed(false))
      .finally(() => setChecking(false));
  }, []);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email) return;
    setSubmittingAuth(true);
    setAuthError("");
    try {
      const res = await fetch(`${API_BASE}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setLoginStep("otp");
      } else {
        setAuthError(data.message || "Failed to send code.");
      }
    } catch {
      setAuthError("Server unreachable.");
    } finally {
      setSubmittingAuth(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) return;
    setSubmittingAuth(true);
    setAuthError("");
    try {
      const res = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
        credentials: "include",
      });
      const data = await res.json();
      if (data.success && data.user?.role === "admin") {
        setAuthed(true);
      } else {
        setAuthError(data.message || "Invalid OTP / permissions.");
      }
    } catch {
      setAuthError("Verification failed.");
    } finally {
      setSubmittingAuth(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, { method: "POST", credentials: "include" });
    } catch {}
    setAuthed(false);
    navigate("/admin");
  };

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  if (!authed) {
    return (
      <PageTransition>
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-zinc-950 p-8 shadow-2xl backdrop-blur-xl">
            <div className="mb-6 flex flex-col items-center text-center">
              <div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-emerald-400/10 text-emerald-400">
                <ShieldCheck size={24} />
              </div>
              <h1 className="text-xl font-bold text-white">Admin Authentication</h1>
              <p className="mt-1 text-xs text-white/50">Log in to access Library Cards Directory</p>
            </div>

            {authError && (
              <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-300">
                {authError}
              </div>
            )}

            {loginStep === "email" ? (
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wider">Admin Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@lekhoktripura.in"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white placeholder-white/30 focus:border-emerald-400 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submittingAuth}
                  className="w-full rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 py-3 text-xs font-bold text-black hover:opacity-95 transition disabled:opacity-50"
                >
                  {submittingAuth ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Request Access Code"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wider">Access Code / Password</label>
                  <input
                    type="text"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter OTP code"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-mono text-white placeholder-white/30 focus:border-emerald-400 focus:outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setLoginStep("email")}
                    className="w-1/3 rounded-xl border border-white/10 bg-white/5 py-3 text-xs font-semibold text-white"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={submittingAuth}
                    className="flex-1 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 py-3 text-xs font-bold text-black hover:opacity-95 transition disabled:opacity-50"
                  >
                    {submittingAuth ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Verify & Enter"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <main className="min-h-screen pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        <AdminNavbar onLogoutSuccess={handleLogout} />

        <div className="flex items-center gap-3 pb-2">
          <Link to="/admin" className="rounded-full p-2 bg-white/5 border border-white/10 text-white/60 hover:text-white transition cursor-pointer">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-white">Library Cards Admin</h1>
            <p className="mt-0.5 text-xs text-white/55">Manage issued membership cards, search member details, and control access permissions.</p>
          </div>
        </div>

        <AdminLibraryCardsSection />
      </main>
    </PageTransition>
  );
}
