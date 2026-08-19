import { useState } from "react";
import { Search, Plus, ExternalLink, Edit, Trash2 } from "lucide-react";

export default function AdminExpenseRegister({
  expenseRecords,
  onAddExpense,
  onEditExpense,
  onDeleteExpense,
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRecords = expenseRecords.filter((exp) => {
    const term = searchQuery.toLowerCase();
    return (
      exp.invoiceNo.toLowerCase().includes(term) ||
      exp.itemName.toLowerCase().includes(term) ||
      exp.partyName.toLowerCase().includes(term) ||
      exp.purpose.toLowerCase().includes(term)
    );
  });

  return (
    <div className="rounded-3xl border border-amber-900/15 bg-white p-6 text-stone-900 shadow-xl shadow-stone-200/50 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <h3 className="text-lg font-black tracking-wide text-amber-950 uppercase flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-600" />
            Expense Register & Purchasing Log
          </h3>
          <p className="text-xs text-stone-600 font-medium">Manually updated expense sheet with bill soft links</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex items-center">
            <Search className="absolute left-3 h-4 w-4 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Purpose, Vendor, Item..."
              className="rounded-xl border border-stone-300 bg-[#F7F3ED] pl-9 pr-4 py-2 text-xs text-stone-900 focus:border-amber-700 focus:outline-none transition w-64 font-medium"
            />
          </div>
          <button
            onClick={onAddExpense}
            className="flex items-center gap-2 rounded-xl bg-rose-700 px-4 py-2 text-xs font-bold text-white hover:bg-rose-800 transition shadow-md"
          >
            <Plus className="h-4 w-4" /> Add New Expense
          </button>
        </div>
      </div>

      {/* Expense Table */}
      <div className="overflow-x-auto rounded-2xl border border-amber-900/15 bg-white shadow-sm">
        <table className="w-full text-left text-xs text-stone-900">
          <thead>
            <tr className="border-b border-amber-950 bg-[#3B2314] text-[11px] font-bold uppercase tracking-wider text-amber-100">
              <th className="p-3">REF NO</th>
              <th className="p-3">GST BILL</th>
              <th className="p-3">PURCHASE DATE</th>
              <th className="p-3">ITEM & PURPOSE</th>
              <th className="p-3">PARTY / VENDOR DETAILS</th>
              <th className="p-3 text-right">BEFORE TAX (₹)</th>
              <th className="p-3 text-right">GST (₹)</th>
              <th className="p-3 text-right">TOTAL BILL AMOUNT (₹)</th>
              <th className="p-3 text-center">BILL LINK</th>
              <th className="p-3 text-center">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200">
            {filteredRecords.map((row) => (
              <tr key={row.id || row._id} className="hover:bg-amber-50/60 transition">
                <td className="p-3 font-mono font-bold text-rose-800">{row.invoiceNo}</td>
                <td className="p-3">
                  <span
                    className={`rounded-lg border px-2 py-0.5 text-[10px] font-bold ${
                      row.gstBill === "YES"
                        ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                        : "bg-stone-100 text-stone-600 border-stone-300"
                    }`}
                  >
                    {row.gstBill}
                  </span>
                </td>
                <td className="p-3 font-medium whitespace-nowrap">
                  <p className="font-bold text-stone-900">{row.date}</p>
                  <p className="text-[10px] text-stone-500">{row.month}, {row.year}</p>
                </td>
                <td className="p-3">
                  <p className="font-bold text-stone-900">{row.itemName}</p>
                  <p className="text-[10px] text-rose-800 font-bold">{row.purpose}</p>
                </td>
                <td className="p-3">
                  <p className="font-bold text-stone-900">{row.partyName}</p>
                  <p className="text-[10px] text-stone-600">
                    {row.partyNumber} {row.partyEmail ? `| ${row.partyEmail}` : ""}
                  </p>
                  <p className="text-[10px] text-stone-500 truncate max-w-xs">{row.partyAddress}</p>
                </td>
                <td className="p-3 text-right font-medium">₹{Number(row.beforeTaxAmount).toFixed(2)}</td>
                <td className="p-3 text-right text-amber-800 font-bold">
                  ₹{Number(row.gstAmount).toFixed(2)} ({row.gstRate}%)
                </td>
                <td className="p-3 text-right font-black text-rose-700 text-sm">
                  ₹{Number(row.totalBillAmount).toFixed(2)}
                </td>
                <td className="p-3 text-center">
                  {row.billLink && row.billLink !== "#" ? (
                    <a
                      href={row.billLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-xl border border-stone-300 bg-[#F7F3ED] px-2.5 py-1 text-[11px] font-bold text-stone-800 hover:bg-stone-200 transition"
                    >
                      <ExternalLink className="h-3 w-3" /> Soft Link
                    </a>
                  ) : (
                    <span className="text-[10px] text-stone-400 font-medium">No Link</span>
                  )}
                </td>
                <td className="p-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => onEditExpense(row)}
                      className="rounded-lg border border-stone-200 bg-white p-1.5 text-stone-600 hover:bg-amber-100 hover:text-amber-900 transition"
                      title="Edit Expense"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteExpense(row.id || row._id)}
                      className="rounded-lg border border-stone-200 bg-white p-1.5 text-stone-500 hover:bg-rose-100 hover:text-rose-700 transition"
                      title="Delete Expense"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
