import { useEffect, useRef } from "react";
import { ArrowDownLeft, X, Edit3 } from "lucide-react";

export default function EditIncomeModal({
  isOpen,
  onClose,
  onSave,
  incomeForm,
  setIncomeForm,
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

  if (!isOpen || !incomeForm) return null;

  // Auto-calculated Subtotal & Total
  const qty = Number(incomeForm.qty) || 1;
  const rate = Number(incomeForm.actualRate) || 0;
  const taxable = incomeForm.taxablePayable !== undefined && incomeForm.taxablePayable !== "" 
    ? Number(incomeForm.taxablePayable) 
    : qty * rate;
  const gst = Number(incomeForm.gstAmount) || 0;
  const delivery = Number(incomeForm.deliveryCharges) || 0;
  const discount = Number(incomeForm.discount) || 0;
  const calculatedTotal = (taxable + gst + delivery - discount).toFixed(2);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Determine year & month from date string or date picker
    let yearStr = incomeForm.year;
    let monthStr = incomeForm.month;
    let formattedDate = incomeForm.date;

    if (incomeForm.rawDate) {
      const d = new Date(incomeForm.rawDate);
      if (!isNaN(d.getTime())) {
        yearStr = d.getFullYear().toString();
        monthStr = d.toLocaleString("en-US", { month: "short" }).toUpperCase();
        const day = String(d.getDate()).padStart(2, "0");
        formattedDate = `${day} ${d.toLocaleString("en-US", { month: "short" })} ${yearStr}`;
      }
    }

    const updatedRecord = {
      ...incomeForm,
      year: yearStr || new Date().getFullYear().toString(),
      month: monthStr || new Date().toLocaleString("en-US", { month: "short" }).toUpperCase(),
      date: formattedDate || incomeForm.date,
      qty: qty,
      actualRate: rate,
      taxablePayable: taxable,
      gstAmount: gst,
      deliveryCharges: delivery,
      discount: discount,
      totalAmount: Number(calculatedTotal)
    };

    onSave(updatedRecord);
  };

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
        className="w-full max-w-3xl rounded-3xl border border-white/15 bg-zinc-900 p-6 sm:p-8 text-white shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto overscroll-contain"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Edit3 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                Edit Sales / Income Record
              </h3>
              <p className="text-xs text-white/50">Modify invoice details, customer information & financial amounts</p>
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/60">
                Invoice No *
              </label>
              <input
                type="text"
                required
                value={incomeForm.invoiceNo || ""}
                onChange={(e) => setIncomeForm({ ...incomeForm, invoiceNo: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-emerald-300 font-mono font-bold focus:border-emerald-400 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/60">
                Billing Date
              </label>
              <input
                type="date"
                value={incomeForm.rawDate || ""}
                onChange={(e) => setIncomeForm({ ...incomeForm, rawDate: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-white focus:border-emerald-400 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/60">
                Payment Mode
              </label>
              <select
                value={incomeForm.paymentMode || "Google Pay"}
                onChange={(e) => setIncomeForm({ ...incomeForm, paymentMode: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-2.5 text-xs text-white focus:border-emerald-400 focus:outline-none transition"
              >
                <option value="Google Pay">Google Pay</option>
                <option value="PhonePe">PhonePe</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="UPI">UPI</option>
                <option value="Cash">Cash</option>
                <option value="Paytm">Paytm</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Customer Info */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              Customer Details
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-[11px] text-white/60">Customer Name *</label>
                <input
                  type="text"
                  required
                  value={incomeForm.customerName || ""}
                  onChange={(e) => setIncomeForm({ ...incomeForm, customerName: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-emerald-400 focus:outline-none transition"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] text-white/60">Phone Number</label>
                <input
                  type="text"
                  value={incomeForm.customerPhone || ""}
                  onChange={(e) => setIncomeForm({ ...incomeForm, customerPhone: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-emerald-400 focus:outline-none transition"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] text-white/60">Email Address</label>
                <input
                  type="email"
                  value={incomeForm.customerEmail || ""}
                  onChange={(e) => setIncomeForm({ ...incomeForm, customerEmail: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-emerald-400 focus:outline-none transition"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-[11px] text-white/60">Address</label>
              <input
                type="text"
                value={incomeForm.customerAddress || ""}
                onChange={(e) => setIncomeForm({ ...incomeForm, customerAddress: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-emerald-400 focus:outline-none transition"
              />
            </div>
          </div>

          {/* Goods & Services Details */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              Goods & Services / Financial Breakdown
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-[11px] text-white/60">Description *</label>
                <input
                  type="text"
                  required
                  value={incomeForm.description || ""}
                  onChange={(e) => setIncomeForm({ ...incomeForm, description: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-emerald-400 focus:outline-none transition"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] text-white/60">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={incomeForm.qty || 1}
                  onChange={(e) => setIncomeForm({ ...incomeForm, qty: Number(e.target.value) })}
                  className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-emerald-400 focus:outline-none transition"
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-4">
              <div>
                <label className="mb-1 block text-[11px] text-white/60">Unit Rate (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={incomeForm.actualRate || 0}
                  onChange={(e) => setIncomeForm({ ...incomeForm, actualRate: Number(e.target.value) })}
                  className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-xs font-bold text-white focus:border-emerald-400 focus:outline-none transition"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] text-white/60">GST Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={incomeForm.gstAmount || 0}
                  onChange={(e) => setIncomeForm({ ...incomeForm, gstAmount: Number(e.target.value) })}
                  className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-xs text-amber-300 font-bold focus:border-emerald-400 focus:outline-none transition"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] text-white/60">Delivery Charge (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={incomeForm.deliveryCharges || 0}
                  onChange={(e) => setIncomeForm({ ...incomeForm, deliveryCharges: Number(e.target.value) })}
                  className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-xs text-cyan-300 font-bold focus:border-emerald-400 focus:outline-none transition"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] text-white/60">Discount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={incomeForm.discount || 0}
                  onChange={(e) => setIncomeForm({ ...incomeForm, discount: Number(e.target.value) })}
                  className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-xs text-rose-300 font-bold focus:border-emerald-400 focus:outline-none transition"
                />
              </div>
            </div>
          </div>

          {/* Total Summary box */}
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 flex items-center justify-between text-xs">
            <span className="font-semibold text-white/80">Calculated Total Amount:</span>
            <span className="font-black text-emerald-400 text-base">
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
              className="rounded-xl bg-emerald-400 px-6 py-2.5 text-xs font-extrabold text-black hover:bg-emerald-300 transition shadow-lg"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
