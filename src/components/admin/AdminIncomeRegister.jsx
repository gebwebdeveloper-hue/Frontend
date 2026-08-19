import { useState } from "react";
import { Search, Plus, ExternalLink, Trash2 } from "lucide-react";

export default function AdminIncomeRegister({
  incomeRecords,
  onDeleteIncome,
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
    <div className="rounded-3xl border border-white/10 bg-zinc-900/80 p-6 text-white shadow-2xl backdrop-blur-xl space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-lg font-black tracking-wide text-white uppercase flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            Income & Sales Register
          </h3>
          <p className="text-xs text-white/50">Auto-populated from every generated invoice</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex items-center">
            <Search className="absolute left-3 h-4 w-4 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Invoice No, Customer, Item..."
              className="rounded-xl border border-white/10 bg-white/5 pl-9 pr-4 py-2 text-xs text-white focus:border-emerald-400 focus:outline-none transition w-64"
            />
          </div>
          <button
            onClick={onOpenGenerator}
            className="flex items-center gap-2 rounded-xl bg-emerald-400 px-4 py-2 text-xs font-bold text-black hover:bg-emerald-300 transition shadow"
          >
            <Plus className="h-4 w-4" /> Create Invoice
          </button>
        </div>
      </div>

      {/* Income Table */}
      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
        <table className="w-full text-left text-xs text-white">
          <thead>
            <tr className="border-b border-white/10 bg-zinc-950/80 text-[11px] font-bold uppercase tracking-wider text-emerald-400">
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
          <tbody className="divide-y divide-white/5">
            {filteredRecords.map((row, idx) => (
              <tr key={row.id} className="hover:bg-white/5 transition">
                <td className="p-3 font-bold text-white/50">{idx + 1}</td>
                <td className="p-3 font-medium whitespace-nowrap">
                  <p>{row.date}</p>
                  <p className="text-[10px] text-white/40">{row.month}, {row.year}</p>
                </td>
                <td className="p-3 font-mono font-bold text-emerald-300">{row.invoiceNo}</td>
                <td className="p-3">
                  <span className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                    {row.paymentMode}
                  </span>
                </td>
                <td className="p-3">
                  <p className="font-bold text-white">{row.customerName}</p>
                  <p className="text-[10px] text-white/50">{row.customerPhone} | {row.customerEmail}</p>
                  <p className="text-[10px] text-white/40 truncate max-w-xs">{row.customerAddress}</p>
                </td>
                <td className="p-3">
                  <p className="font-semibold text-white/90">{row.description}</p>
                  <p className="text-[10px] text-white/50">Qty: {row.qty}</p>
                </td>
                <td className="p-3 text-right font-medium">₹{Number(row.actualRate).toFixed(2)}</td>
                <td className="p-3 text-right text-amber-300 font-medium">₹{Number(row.gstAmount).toFixed(2)}</td>
                <td className="p-3 text-right text-cyan-300 font-medium">₹{Number(row.deliveryCharges).toFixed(2)}</td>
                <td className="p-3 text-right font-black text-emerald-400 text-sm">₹{Number(row.totalAmount).toFixed(2)}</td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => onViewPreview(row)}
                    className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-emerald-500/20 hover:text-emerald-300 transition"
                    title="View / Print Printable Document"
                  >
                    <ExternalLink className="h-3 w-3" /> Soft Bill
                  </button>
                </td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => onDeleteIncome(row.id)}
                    className="rounded-lg p-1.5 text-white/40 hover:bg-rose-500/20 hover:text-rose-400 transition"
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
