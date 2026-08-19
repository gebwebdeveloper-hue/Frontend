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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md no-print animate-fade-in overflow-y-auto overscroll-contain"
    >
      <div className="w-full max-w-2xl rounded-3xl border border-amber-900/15 bg-white p-6 sm:p-8 text-stone-900 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto overscroll-contain">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-stone-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-100 text-blue-800 border border-blue-200">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-amber-950">Send Invoice via Email</h3>
              <p className="text-xs text-stone-600 font-medium">
                Compose or copy email details for Invoice {invoiceNo}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl border border-stone-300 bg-[#F7F3ED] p-2 text-stone-600 hover:bg-stone-200 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Email Form Fields */}
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-600">
              Recipient Email (To) <span className="text-amber-800">*</span>
            </label>
            <input
              type="email"
              value={emailRecipient}
              onChange={(e) => setEmailRecipient(e.target.value)}
              placeholder="Enter customer email address (e.g. customer@gmail.com)"
              className="w-full rounded-xl border border-stone-300 bg-[#F7F3ED] px-4 py-3 text-xs font-medium text-stone-900 focus:border-amber-700 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-600">
              Email Subject
            </label>
            <input
              type="text"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              className="w-full rounded-xl border border-stone-300 bg-[#F7F3ED] px-4 py-3 text-xs font-bold text-stone-900 focus:border-amber-700 focus:outline-none transition"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-600">
                Email Message Content
              </label>
              <button
                type="button"
                onClick={onCopyEmailText}
                className="flex items-center gap-1 text-[11px] font-bold text-[#6B4226] hover:text-amber-900 transition"
              >
                {copiedEmailText ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
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
              className="w-full rounded-xl border border-stone-300 bg-[#F7F3ED] p-4 text-xs font-medium text-stone-900 leading-relaxed font-mono focus:border-amber-700 focus:outline-none transition overflow-y-auto overscroll-contain max-h-[280px] min-h-[160px] resize-y"
            />
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-stone-200 pt-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-stone-300 bg-[#F7F3ED] px-4 py-2.5 text-xs font-bold text-stone-700 hover:bg-stone-200 transition"
          >
            Close
          </button>
          <button
            onClick={onCopyEmailText}
            className="flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-xs font-bold text-stone-800 hover:bg-stone-100 transition shadow-sm"
          >
            {copiedEmailText ? (
              <Check className="h-4 w-4 text-emerald-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            {copiedEmailText ? "Copied Text" : "Copy Email Text"}
          </button>
          <button
            onClick={onExecuteMailto}
            className="flex items-center gap-2 rounded-xl border border-blue-300 bg-blue-50 px-4 py-2.5 text-xs font-bold text-blue-900 hover:bg-blue-100 transition"
            title="Launch default desktop email application"
          >
            <ExternalLink className="h-4 w-4" /> Default Mail App
          </button>
          <button
            onClick={onOpenGmail}
            className="flex items-center gap-2 rounded-xl bg-rose-700 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-rose-800 transition"
            title="Open directly in Gmail Webmail"
          >
            <Mail className="h-4 w-4" /> Open in Gmail
          </button>
        </div>
      </div>
    </div>
  );
}
