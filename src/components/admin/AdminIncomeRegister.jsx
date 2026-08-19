import { useState } from "react";
import { Search, Plus, ExternalLink, Trash2, Edit3 } from "lucide-react";

export default function AdminIncomeRegister({
  incomeRecords,
  onDeleteIncome,
  onEditIncome,
  onViewPreview,
  onOpenGenerator,
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRecords = incomeRecords.filter((inc) => {
    const term = searchQuery.toLowerCase();
    return (
      inc.invoiceNo.toLowerCase().includes(term) ||
      inc.customerName.toLowerCase().includes(term) ||
      inc.description.toLowerCase().includes(term) ||
      inc.paymentMode.toLowerCase().includes(term)
    );
  });

  return (
    <div className="rounded-3xl border border-amber-900/15 bg-white p-6 text-stone-900 shadow-xl shadow-stone-200/50 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <h3 className="text-lg font-black tracking-wide text-amber-950 uppercase flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-700" />
            Income & Sales Register
          </h3>
          <p className="text-xs text-stone-600 font-medium">Auto-populated from every generated invoice</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex items-center">
            <Search className="absolute left-3 h-4 w-4 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Invoice No, Customer, Item..."
              className="rounded-xl border border-stone-300 bg-[#F7F3ED] pl-9 pr-4 py-2 text-xs text-stone-900 focus:border-amber-700 focus:outline-none transition w-64 font-medium"
            />
          </div>
          <button
            onClick={onOpenGenerator}
            className="flex items-center gap-2 rounded-xl bg-[#6B4226] px-4 py-2 text-xs font-bold text-white hover:bg-[#52331C] transition shadow-md"
          >
            <Plus className="h-4 w-4" /> Create Invoice
          </button>
        </div>
      </div>

      {/* Income Table */}
      <div className="overflow-x-auto rounded-2xl border border-amber-900/15 bg-white shadow-sm">
        <table className="w-full text-left text-xs text-stone-900">
          <thead>
            <tr className="border-b border-amber-950 bg-[#3B2314] text-[11px] font-bold uppercase tracking-wider text-amber-100">
              <th className="p-3">SL</th>
              <th className="p-3">DATE</th>
              <th className="p-3">INVOICE NO</th>
              <th className="p-3">MODE</th>
              <th className="p-3">CUSTOMER DETAILS</th>
              <th className="p-3">GOODS & SERVICES</th>
              <th className="p-3 text-right">RATE (₹)</th>
              <th className="p-3 text-right">GST (₹)</th>
              <th className="p-3 text-right">DELIVERY (₹)</th>
              <th className="p-3 text-right">TOTAL AMOUNT (₹)</th>
              <th className="p-3 text-center">SOFT BILL</th>
              <th className="p-3 text-center">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200">
            {filteredRecords.map((row, idx) => (
              <tr key={row.id || row._id || idx} className="hover:bg-amber-50/60 transition">
                <td className="p-3 font-bold text-stone-500">{idx + 1}</td>
                <td className="p-3 font-medium whitespace-nowrap">
                  <p className="font-bold text-stone-900">{row.date}</p>
                  <p className="text-[10px] text-stone-500">{row.month}, {row.year}</p>
                </td>
                <td className="p-3 font-mono font-black text-[#6B4226]">{row.invoiceNo}</td>
                <td className="p-3">
                  <span className="rounded-lg border border-amber-300 bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                    {row.paymentMode}
                  </span>
                </td>
                <td className="p-3">
                  <p className="font-bold text-stone-900">{row.customerName}</p>
                  <p className="text-[10px] text-stone-600">{row.customerPhone} | {row.customerEmail}</p>
                  <p className="text-[10px] text-stone-500 truncate max-w-xs">{row.customerAddress}</p>
                </td>
                <td className="p-3">
                  <p className="font-semibold text-stone-800">{row.description}</p>
                  <p className="text-[10px] text-stone-500">Qty: {row.qty || 1}</p>
                </td>
                <td className="p-3 text-right font-medium">₹{Number(row.actualRate || 0).toFixed(2)}</td>
                <td className="p-3 text-right text-amber-800 font-bold">₹{Number(row.gstAmount || 0).toFixed(2)}</td>
                <td className="p-3 text-right text-teal-800 font-bold">₹{Number(row.deliveryCharges || 0).toFixed(2)}</td>
                <td className="p-3 text-right font-black text-emerald-700 text-sm">₹{Number(row.totalAmount || 0).toFixed(2)}</td>
                <td className="p-3 text-center whitespace-nowrap">
                  <div className="inline-flex items-center gap-1.5">
                    <button
                      onClick={() => onViewPreview(row)}
                      className="inline-flex items-center gap-1 rounded-xl border border-stone-300 bg-[#F7F3ED] px-2.5 py-1 text-[11px] font-bold text-stone-800 hover:bg-stone-200 transition"
                      title="View / Print Printable Document"
                    >
                      <ExternalLink className="h-3 w-3" /> Soft Bill
                    </button>
                    {onEditIncome && (
                      <button
                        onClick={() => onEditIncome(row)}
                        className="inline-flex items-center gap-1 rounded-xl border border-amber-800/30 bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-900 hover:bg-[#6B4226] hover:text-white transition"
                        title="Edit Income Record"
                      >
                        <Edit3 className="h-3 w-3" /> Edit
                      </button>
                    )}
                  </div>
                </td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => onDeleteIncome(row.id || row._id)}
                    className="rounded-lg border border-stone-200 bg-white p-1.5 text-stone-500 hover:bg-rose-100 hover:text-rose-700 transition"
                    title="Delete Income Record"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
