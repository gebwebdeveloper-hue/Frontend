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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md no-print animate-fade-in"
    >
      <div
        ref={modalBodyRef}
        className="w-full max-w-2xl rounded-3xl border border-amber-900/15 bg-white p-6 sm:p-8 text-stone-900 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto overscroll-contain"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-stone-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-100 text-rose-700 border border-rose-200">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-amber-950">
                {editingExpenseId ? "Edit Expense Entry" : "Add New Expense Entry"}
              </h3>
              <p className="text-xs text-stone-600 font-medium">Log company purchases, printing & operational expenses</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl border border-stone-300 bg-[#F7F3ED] p-2 text-stone-600 hover:bg-stone-200 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSave} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-600">
                Invoice / Ref No
              </label>
              <input
                type="text"
                required
                value={expenseForm.invoiceNo}
                onChange={(e) => setExpenseForm({ ...expenseForm, invoiceNo: e.target.value })}
                className="w-full rounded-xl border border-stone-300 bg-[#F7F3ED] px-4 py-2.5 text-xs font-mono font-bold text-rose-800 focus:border-amber-700 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-600">
                GST Bill?
              </label>
              <select
                value={expenseForm.gstBill}
                onChange={(e) => setExpenseForm({ ...expenseForm, gstBill: e.target.value })}
                className="w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-xs text-stone-900 focus:border-amber-700 focus:outline-none transition"
              >
                <option value="YES">YES (Tax Invoice)</option>
                <option value="NO">NO (Non-GST Cash Memo)</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-600">
                Item Name *
              </label>
              <input
                type="text"
                required
                value={expenseForm.itemName}
                onChange={(e) => setExpenseForm({ ...expenseForm, itemName: e.target.value })}
                placeholder="e.g. Paper Roll 80GSM"
                className="w-full rounded-xl border border-stone-300 bg-[#F7F3ED] px-4 py-2.5 text-xs text-stone-900 focus:border-amber-700 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-600">
                Purpose / Category *
              </label>
              <input
                type="text"
                required
                value={expenseForm.purpose}
                onChange={(e) => setExpenseForm({ ...expenseForm, purpose: e.target.value })}
                placeholder="e.g. Publication Printing"
                className="w-full rounded-xl border border-stone-300 bg-[#F7F3ED] px-4 py-2.5 text-xs text-stone-900 focus:border-amber-700 focus:outline-none transition"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-600">
                Purchase Date
              </label>
              <input
                type="date"
                required
                value={expenseForm.date}
                onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                className="w-full rounded-xl border border-stone-300 bg-[#F7F3ED] px-4 py-2.5 text-xs text-stone-900 focus:border-amber-700 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-600">
                Party / Vendor Name *
              </label>
              <input
                type="text"
                required
                value={expenseForm.partyName}
                onChange={(e) => setExpenseForm({ ...expenseForm, partyName: e.target.value })}
                placeholder="e.g. Agartala Print House"
                className="w-full rounded-xl border border-stone-300 bg-[#F7F3ED] px-4 py-2.5 text-xs text-stone-900 focus:border-amber-700 focus:outline-none transition"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-600">
                Party Phone (10 Digits)
              </label>
              <input
                type="tel"
                maxLength={10}
                value={expenseForm.partyNumber}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/[^0-9]/g, "").slice(0, 10);
                  setExpenseForm({ ...expenseForm, partyNumber: cleaned });
                }}
                placeholder="10-digit phone"
                className="w-full rounded-xl border border-stone-300 bg-[#F7F3ED] px-4 py-2.5 text-xs text-stone-900 focus:border-amber-700 focus:outline-none transition font-mono"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-600">
                Party Email
              </label>
              <input
                type="email"
                value={expenseForm.partyEmail}
                onChange={(e) => setExpenseForm({ ...expenseForm, partyEmail: e.target.value })}
                className="w-full rounded-xl border border-stone-300 bg-[#F7F3ED] px-4 py-2.5 text-xs text-stone-900 focus:border-amber-700 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-600">
                Party Address
              </label>
              <input
                type="text"
                value={expenseForm.partyAddress}
                onChange={(e) => setExpenseForm({ ...expenseForm, partyAddress: e.target.value })}
                className="w-full rounded-xl border border-stone-300 bg-[#F7F3ED] px-4 py-2.5 text-xs text-stone-900 focus:border-amber-700 focus:outline-none transition"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-600">
                Before Tax Amount (₹) *
              </label>
              <input
                type="text"
                inputMode="decimal"
                required
                value={expenseForm.beforeTaxAmount === 0 || expenseForm.beforeTaxAmount === "0" ? "" : expenseForm.beforeTaxAmount}
                onFocus={(e) => e.target.select()}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/[^0-9.]/g, "");
                  setExpenseForm({ ...expenseForm, beforeTaxAmount: cleaned });
                }}
                placeholder="e.g. 2000"
                className="w-full rounded-xl border border-stone-300 bg-[#F7F3ED] px-4 py-2.5 text-xs font-bold text-stone-900 focus:border-amber-700 focus:outline-none transition font-mono"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-600">
                GST Rate (%)
              </label>
              <select
                value={expenseForm.gstRate}
                onChange={(e) => setExpenseForm({ ...expenseForm, gstRate: Number(e.target.value) })}
                className="w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-xs text-stone-900 focus:border-amber-700 focus:outline-none transition"
              >
                <option value={18}>18% GST</option>
                <option value={5}>5% GST</option>
                <option value={12}>12% GST</option>
                <option value={0}>0% (No GST)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-600">
              Bill Soft Link / File URL
            </label>
            <input
              type="text"
              value={expenseForm.billLink}
              onChange={(e) => setExpenseForm({ ...expenseForm, billLink: e.target.value })}
              placeholder="e.g. https://drive.google.com/file/... or website link"
              className="w-full rounded-xl border border-stone-300 bg-[#F7F3ED] px-4 py-2.5 text-xs text-stone-900 focus:border-amber-700 focus:outline-none transition"
            />
          </div>

          {/* Total Summary box */}
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 flex items-center justify-between text-xs font-semibold text-stone-800">
            <span>Calculated Total Bill (+GST):</span>
            <span className="font-black text-rose-700 text-sm">
              ₹{calculatedTotal}
            </span>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-stone-300 bg-[#F7F3ED] px-4 py-2.5 text-xs font-bold text-stone-700 hover:bg-stone-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-rose-700 px-6 py-2.5 text-xs font-bold text-white hover:bg-rose-800 transition shadow-md"
            >
              {editingExpenseId ? "Update Expense" : "Save Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
