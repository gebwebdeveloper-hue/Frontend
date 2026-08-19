import { useEffect, useRef } from "react";
import { X, Edit3 } from "lucide-react";

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md no-print animate-fade-in"
    >
      <div
        ref={modalBodyRef}
        className="w-full max-w-3xl rounded-3xl border border-amber-900/15 bg-white p-6 sm:p-8 text-stone-900 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto overscroll-contain"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-stone-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-900 border border-amber-200 shadow-inner">
              <Edit3 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-amber-950">
                Edit Sales / Income Record
              </h3>
              <p className="text-xs text-stone-600 font-medium">Modify invoice details, customer information & financial amounts</p>
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-600">
                Invoice No *
              </label>
              <input
                type="text"
                required
                value={incomeForm.invoiceNo || ""}
                onChange={(e) => setIncomeForm({ ...incomeForm, invoiceNo: e.target.value })}
                className="w-full rounded-xl border border-stone-300 bg-[#F7F3ED] px-4 py-2.5 text-xs text-[#6B4226] font-mono font-bold focus:border-amber-700 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-600">
                Billing Date
              </label>
              <input
                type="date"
                value={incomeForm.rawDate || ""}
                onChange={(e) => setIncomeForm({ ...incomeForm, rawDate: e.target.value })}
                className="w-full rounded-xl border border-stone-300 bg-[#F7F3ED] px-4 py-2.5 text-xs text-stone-900 focus:border-amber-700 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-600">
                Payment Mode
              </label>
              <select
                value={incomeForm.paymentMode || "Google Pay"}
                onChange={(e) => setIncomeForm({ ...incomeForm, paymentMode: e.target.value })}
                className="w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-xs text-stone-900 focus:border-amber-700 focus:outline-none transition"
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
          <div className="rounded-2xl border border-stone-200 bg-[#FDFBF7] p-4 space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-amber-900">
              Customer Details
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-[11px] text-stone-600 font-medium">Customer Name *</label>
                <input
                  type="text"
                  required
                  value={incomeForm.customerName || ""}
                  onChange={(e) => setIncomeForm({ ...incomeForm, customerName: e.target.value })}
                  className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs text-stone-900 focus:border-amber-700 focus:outline-none transition"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] text-stone-600 font-medium">Phone Number</label>
                <input
                  type="text"
                  value={incomeForm.customerPhone || ""}
                  onChange={(e) => setIncomeForm({ ...incomeForm, customerPhone: e.target.value })}
                  className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs text-stone-900 focus:border-amber-700 focus:outline-none transition"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] text-stone-600 font-medium">Email Address</label>
                <input
                  type="email"
                  value={incomeForm.customerEmail || ""}
                  onChange={(e) => setIncomeForm({ ...incomeForm, customerEmail: e.target.value })}
                  className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs text-stone-900 focus:border-amber-700 focus:outline-none transition"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-[11px] text-stone-600 font-medium">Address</label>
              <input
                type="text"
                value={incomeForm.customerAddress || ""}
                onChange={(e) => setIncomeForm({ ...incomeForm, customerAddress: e.target.value })}
                className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs text-stone-900 focus:border-amber-700 focus:outline-none transition"
              />
            </div>
          </div>

          {/* Goods & Services Details */}
          <div className="rounded-2xl border border-stone-200 bg-[#FDFBF7] p-4 space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-amber-900">
              Goods & Services / Financial Breakdown
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-[11px] text-stone-600 font-medium">Description *</label>
                <input
                  type="text"
                  required
                  value={incomeForm.description || ""}
                  onChange={(e) => setIncomeForm({ ...incomeForm, description: e.target.value })}
                  className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs text-stone-900 focus:border-amber-700 focus:outline-none transition"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] text-stone-600 font-medium">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={incomeForm.qty || 1}
                  onChange={(e) => setIncomeForm({ ...incomeForm, qty: Number(e.target.value) })}
                  className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs text-stone-900 focus:border-amber-700 focus:outline-none transition"
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-4">
              <div>
                <label className="mb-1 block text-[11px] text-stone-600 font-medium">Unit Rate (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={incomeForm.actualRate || 0}
                  onChange={(e) => setIncomeForm({ ...incomeForm, actualRate: Number(e.target.value) })}
                  className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs font-bold text-stone-900 focus:border-amber-700 focus:outline-none transition"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] text-stone-600 font-medium">GST Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={incomeForm.gstAmount || 0}
                  onChange={(e) => setIncomeForm({ ...incomeForm, gstAmount: Number(e.target.value) })}
                  className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs text-amber-800 font-bold focus:border-amber-700 focus:outline-none transition"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] text-stone-600 font-medium">Delivery Charge (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={incomeForm.deliveryCharges || 0}
                  onChange={(e) => setIncomeForm({ ...incomeForm, deliveryCharges: Number(e.target.value) })}
                  className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs text-teal-800 font-bold focus:border-amber-700 focus:outline-none transition"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] text-stone-600 font-medium">Discount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={incomeForm.discount || 0}
                  onChange={(e) => setIncomeForm({ ...incomeForm, discount: Number(e.target.value) })}
                  className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs text-rose-700 font-bold focus:border-amber-700 focus:outline-none transition"
                />
              </div>
            </div>
          </div>

          {/* Total Summary box */}
          <div className="rounded-xl border border-amber-300 bg-amber-100/60 p-3 flex items-center justify-between text-xs">
            <span className="font-bold text-stone-800">Calculated Total Amount:</span>
            <span className="font-black text-emerald-800 text-base">
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
              className="rounded-xl bg-[#6B4226] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#52331C] transition shadow-md"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
