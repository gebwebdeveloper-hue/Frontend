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
    <div className="rounded-3xl border border-white/10 bg-zinc-900/80 p-6 text-white shadow-2xl backdrop-blur-xl space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-lg font-black tracking-wide text-white uppercase flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
            Expense Register & Purchasing Log
          </h3>
          <p className="text-xs text-white/50">Manually updated expense sheet with bill soft links</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex items-center">
            <Search className="absolute left-3 h-4 w-4 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Purpose, Vendor, Item..."
              className="rounded-xl border border-white/10 bg-white/5 pl-9 pr-4 py-2 text-xs text-white focus:border-rose-400 focus:outline-none transition w-64"
            />
          </div>
          <button
            onClick={onAddExpense}
            className="flex items-center gap-2 rounded-xl bg-rose-500 px-4 py-2 text-xs font-bold text-white hover:bg-rose-400 transition shadow"
          >
            <Plus className="h-4 w-4" /> Add New Expense
          </button>
        </div>
      </div>

      {/* Expense Table */}
      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
        <table className="w-full text-left text-xs text-white">
          <thead>
            <tr className="border-b border-white/10 bg-zinc-950/80 text-[11px] font-bold uppercase tracking-wider text-rose-400">
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
          <tbody className="divide-y divide-white/5">
            {filteredRecords.map((row) => (
              <tr key={row.id} className="hover:bg-white/5 transition">
                <td className="p-3 font-mono font-bold text-rose-300">{row.invoiceNo}</td>
                <td className="p-3">
                  <span
                    className={`rounded-lg border px-2 py-0.5 text-[10px] font-bold ${
                      row.gstBill === "YES"
                        ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                        : "bg-zinc-800 text-white/50 border-white/10"
                    }`}
                  >
                    {row.gstBill}
                  </span>
                </td>
                <td className="p-3 font-medium whitespace-nowrap">
                  <p>{row.date}</p>
                  <p className="text-[10px] text-white/40">{row.month}, {row.year}</p>
                </td>
                <td className="p-3">
                  <p className="font-bold text-white">{row.itemName}</p>
                  <p className="text-[10px] text-rose-300/80 font-semibold">{row.purpose}</p>
                </td>
                <td className="p-3">
                  <p className="font-bold text-white">{row.partyName}</p>
                  <p className="text-[10px] text-white/50">
                    {row.partyNumber} {row.partyEmail ? `| ${row.partyEmail}` : ""}
                  </p>
                  <p className="text-[10px] text-white/40 truncate max-w-xs">{row.partyAddress}</p>
                </td>
                <td className="p-3 text-right font-medium">₹{Number(row.beforeTaxAmount).toFixed(2)}</td>
                <td className="p-3 text-right text-amber-300 font-medium">
                  ₹{Number(row.gstAmount).toFixed(2)} ({row.gstRate}%)
                </td>
                <td className="p-3 text-right font-black text-rose-400 text-sm">
                  ₹{Number(row.totalBillAmount).toFixed(2)}
                </td>
                <td className="p-3 text-center">
                  {row.billLink && row.billLink !== "#" ? (
                    <a
                      href={row.billLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-rose-300 hover:bg-rose-500/20 transition"
                    >
                      <ExternalLink className="h-3 w-3" /> Soft Link
                    </a>
                  ) : (
                    <span className="text-[10px] text-white/30">No Link</span>
                  )}
                </td>
                <td className="p-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => onEditExpense(row)}
                      className="rounded-lg p-1.5 text-white/40 hover:bg-white/10 hover:text-white transition"
                      title="Edit Expense"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteExpense(row.id)}
                      className="rounded-lg p-1.5 text-white/40 hover:bg-rose-500/20 hover:text-rose-400 transition"
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
