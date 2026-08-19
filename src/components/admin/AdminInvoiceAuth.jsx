import { ShieldCheck, Loader2 } from "lucide-react";

export default function AdminInvoiceAuth({
  checking,
  authed,
  loginStep,
  email,
  setEmail,
  otp,
  setOtp,
  authError,
  submittingAuth,
  onRequestOtp,
  onVerifyOtp,
  children,
}) {
  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4 text-white">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-zinc-900/90 p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <h1 className="text-xl font-bold">Admin Portal Access</h1>
            <p className="mt-1 text-xs text-white/50">
              Verify your admin credentials to open Invoice Generator
            </p>
          </div>

          {authError && (
            <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-center text-xs text-red-300">
              {authError}
            </div>
          )}

          {loginStep === "email" ? (
            <form onSubmit={onRequestOtp} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-white/40">
                  Admin Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@lekhoktripura.in"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-emerald-400 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={submittingAuth}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 py-3 text-sm font-bold text-black transition hover:bg-emerald-300 disabled:opacity-50"
              >
                {submittingAuth ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Send Authorization OTP"
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={onVerifyOtp} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-white/40">
                  Enter 6-Digit OTP sent to {email}
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="••••••"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-lg font-bold tracking-widest text-white focus:border-emerald-400 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={submittingAuth}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 py-3 text-sm font-bold text-black transition hover:bg-emerald-300 disabled:opacity-50"
              >
                {submittingAuth ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Verify & Access Invoice Admin"
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
