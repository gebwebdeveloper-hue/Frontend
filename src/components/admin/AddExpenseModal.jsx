import { useEffect, useRef } from "react";
import { Receipt, X } from "lucide-react";

export default function AddExpenseModal({
  isOpen,
  onClose,
  onSave,
  editingExpenseId,
  expenseForm,
  setExpenseForm,
}) {
  const modalBodyRef = useRef(null);

  // Smooth mouse wheel scrolling inside the modal card
  useEffect(() => {
    if (!isOpen) return;
    const modalEl = modalBodyRef.current;
    if (!modalEl) return;

    const handleWheel = (e) => {
      if (modalEl.scrollHeight > modalEl.clientHeight) {
        modalEl.scrollTop += e.deltaY;
      }
    };

    modalEl.addEventListener("wheel", handleWheel, { passive: true });
    return () => {
      modalEl.removeEventListener("wheel", handleWheel);
    };
  }, [isOpen]);

  // ESC key handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const calculatedTotal = (
    (Number(expenseForm.beforeTaxAmount) || 0) *
    (1 + (Number(expenseForm.gstRate) || 0) / 100)
  ).toFixed(2);

  return (
    <div
      onWheel={(e) => {
        if (e.target === e.currentTarget) {
          e.preventDefault();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md no-print animate-fade-in"
    >
      <div
        ref={modalBodyRef}
        className="w-full max-w-2xl rounded-3xl border border-white/15 bg-zinc-900 p-6 sm:p-8 text-white shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto overscroll-contain"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {editingExpenseId ? "Edit Expense Entry" : "Add New Expense Entry"}
              </h3>
              <p className="text-xs text-white/50">Log company purchases, printing & operational expenses</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl border border-white/10 p-2 text-white/60 hover:bg-white/10 hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSave} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/60">
                Invoice / Ref No
              </label>
              <input
                type="text"
                required
                value={expenseForm.invoiceNo}
                onChange={(e) => setExpenseForm({ ...expenseForm, invoiceNo: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-white focus:border-rose-400 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/60">
                GST Bill?
              </label>
              <select
                value={expenseForm.gstBill}
                onChange={(e) => setExpenseForm({ ...expenseForm, gstBill: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-2.5 text-xs text-white focus:border-rose-400 focus:outline-none transition"
              >
                <option value="YES">YES (Tax Invoice)</option>
                <option value="NO">NO (Non-GST Cash Memo)</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/60">
                Item Name *
              </label>
              <input
                type="text"
                required
                value={expenseForm.itemName}
                onChange={(e) => setExpenseForm({ ...expenseForm, itemName: e.target.value })}
                placeholder="e.g. Paper Roll 80GSM"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-white placeholder-white/20 focus:border-rose-400 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/60">
                Purpose / Category *
              </label>
              <input
                type="text"
                required
                value={expenseForm.purpose}
                onChange={(e) => setExpenseForm({ ...expenseForm, purpose: e.target.value })}
                placeholder="e.g. Publication Printing"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-white placeholder-white/20 focus:border-rose-400 focus:outline-none transition"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/60">
                Purchase Date
              </label>
              <input
                type="date"
                required
                value={expenseForm.date}
                onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-white focus:border-rose-400 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/60">
                Party / Vendor Name *
              </label>
              <input
                type="text"
                required
                value={expenseForm.partyName}
                onChange={(e) => setExpenseForm({ ...expenseForm, partyName: e.target.value })}
                placeholder="e.g. Agartala Print House"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-white placeholder-white/20 focus:border-rose-400 focus:outline-none transition"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/60">
                Party Phone
              </label>
              <input
                type="text"
                value={expenseForm.partyNumber}
                onChange={(e) => setExpenseForm({ ...expenseForm, partyNumber: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-white focus:border-rose-400 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/60">
                Party Email
              </label>
              <input
                type="email"
                value={expenseForm.partyEmail}
                onChange={(e) => setExpenseForm({ ...expenseForm, partyEmail: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-white focus:border-rose-400 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/60">
                Party Address
              </label>
              <input
                type="text"
                value={expenseForm.partyAddress}
                onChange={(e) => setExpenseForm({ ...expenseForm, partyAddress: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-white focus:border-rose-400 focus:outline-none transition"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/60">
                Before Tax Amount (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={expenseForm.beforeTaxAmount}
                onChange={(e) => setExpenseForm({ ...expenseForm, beforeTaxAmount: e.target.value })}
                placeholder="e.g. 2000"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-white focus:border-rose-400 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/60">
                GST Rate (%)
              </label>
              <select
                value={expenseForm.gstRate}
                onChange={(e) => setExpenseForm({ ...expenseForm, gstRate: Number(e.target.value) })}
                className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-2.5 text-xs text-white focus:border-rose-400 focus:outline-none transition"
              >
                <option value={18}>18% GST</option>
                <option value={5}>5% GST</option>
                <option value={12}>12% GST</option>
                <option value={0}>0% (No GST)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/60">
              Bill Soft Link / File URL
            </label>
            <input
              type="text"
              value={expenseForm.billLink}
              onChange={(e) => setExpenseForm({ ...expenseForm, billLink: e.target.value })}
              placeholder="e.g. https://drive.google.com/file/... or website link"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-white placeholder-white/20 focus:border-rose-400 focus:outline-none transition"
            />
          </div>

          {/* Total Summary box */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-3 flex items-center justify-between text-xs">
            <span>Calculated Total Bill (+GST):</span>
            <span className="font-black text-rose-400 text-sm">
              ₹{calculatedTotal}
            </span>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white/70 hover:bg-white/10 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-rose-500 px-6 py-2.5 text-xs font-bold text-white hover:bg-rose-400 transition shadow-lg"
            >
              {editingExpenseId ? "Update Expense" : "Save Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
