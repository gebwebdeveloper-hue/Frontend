import { Mail, X, Check, Copy, ExternalLink } from "lucide-react";

export default function SendEmailModal({
  isOpen,
  onClose,
  invoiceNo,
  emailRecipient,
  setEmailRecipient,
  emailSubject,
  setEmailSubject,
  emailBody,
  setEmailBody,
  copiedEmailText,
  onCopyEmailText,
  onExecuteMailto,
  onOpenGmail,
  modalTextareaRef,
}) {
  if (!isOpen) return null;

  return (
    <div
      onWheel={(e) => {
        if (e.target === e.currentTarget) {
          e.preventDefault();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md no-print animate-fade-in overflow-y-auto overscroll-contain"
    >
      <div className="w-full max-w-2xl rounded-3xl border border-white/15 bg-zinc-900 p-6 sm:p-8 text-white shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto overscroll-contain">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Send Invoice via Email</h3>
              <p className="text-xs text-white/50">
                Compose or copy email details for Invoice {invoiceNo}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl border border-white/10 p-2 text-white/60 hover:bg-white/10 hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Email Form Fields */}
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/60">
              Recipient Email (To) <span className="text-emerald-400">*</span>
            </label>
            <input
              type="email"
              value={emailRecipient}
              onChange={(e) => setEmailRecipient(e.target.value)}
              placeholder="Enter customer email address (e.g. customer@gmail.com)"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-medium text-white placeholder-white/20 focus:border-blue-400/50 focus:bg-white/10 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/60">
              Email Subject
            </label>
            <input
              type="text"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-semibold text-white focus:border-blue-400/50 focus:bg-white/10 focus:outline-none transition"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-white/60">
                Email Message Content
              </label>
              <button
                type="button"
                onClick={onCopyEmailText}
                className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 transition"
              >
                {copiedEmailText ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                {copiedEmailText ? "Copied!" : "Copy Text"}
              </button>
            </div>
            <textarea
              ref={modalTextareaRef}
              rows={8}
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-xs font-medium text-white/90 leading-relaxed font-mono focus:border-blue-400/50 focus:bg-white/10 focus:outline-none transition overflow-y-auto overscroll-contain max-h-[280px] min-h-[160px] resize-y"
            />
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-white/10 pt-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white/70 hover:bg-white/10 hover:text-white transition"
          >
            Close
          </button>
          <button
            onClick={onCopyEmailText}
            className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition"
          >
            {copiedEmailText ? (
              <Check className="h-4 w-4 text-emerald-400" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            {copiedEmailText ? "Copied Text" : "Copy Email Text"}
          </button>
          <button
            onClick={onExecuteMailto}
            className="flex items-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-2.5 text-xs font-bold text-blue-300 hover:bg-blue-500/20 transition"
            title="Launch default desktop email application"
          >
            <ExternalLink className="h-4 w-4" /> Default Mail App
          </button>
          <button
            onClick={onOpenGmail}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-500 via-rose-500 to-amber-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg hover:from-red-400 hover:to-amber-400 transition"
            title="Open directly in Gmail Webmail"
          >
            <Mail className="h-4 w-4" /> Open in Gmail
          </button>
        </div>
      </div>
    </div>
  );
}
