import React from "react";
import { CreditCard, PlusCircle, Edit3, Trash2 } from "lucide-react";

export default function PublisherSalesTab({
  recentSales = [],
  onOpenAddSale,
  onOpenEditSale,
  onDeleteSale
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4 bg-[#0e0e14] p-6 rounded-3xl border border-[#1f1f2e] shadow-xl">
        <div>
          <h2 className="font-serif text-xl font-extrabold text-[#f3c06b]">Sales & Royalty Payments Ledger</h2>
          <p className="text-xs text-gray-400 mt-1">Record sales transactions and view recent book sales history.</p>
        </div>
        <button
          onClick={onOpenAddSale}
          className="px-4 py-2.5 bg-gradient-to-r from-[#d99b38] to-[#f3c06b] text-black font-extrabold text-xs rounded-xl shadow flex items-center gap-2 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Record Book Sale</span>
        </button>
      </div>

      <div className="bg-[#0e0e14] border border-[#1f1f2e] rounded-3xl p-6 shadow-xl">
        <h3 className="font-serif text-xl font-extrabold text-white mb-4">Recent Book Sales History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#222232] text-gray-400 uppercase tracking-wider text-[11px]">
                <th className="pb-3 font-semibold">Date</th>
                <th className="pb-3 font-semibold">Author Email</th>
                <th className="pb-3 font-semibold">Book Title</th>
                <th className="pb-3 font-semibold">Qty</th>
                <th className="pb-3 font-semibold">Unit Price</th>
                <th className="pb-3 font-semibold">Gross Sales</th>
                <th className="pb-3 font-semibold">Author Royalty</th>
                <th className="pb-3 font-semibold">Channel</th>
                <th className="pb-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#181824]">
              {recentSales.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-gray-500">
                    No book sales recorded yet. Click "+ Record Book Sale" to add one.
                  </td>
                </tr>
              ) : (
                recentSales.map((sale) => (
                  <tr key={sale._id || sale.id} className="hover:bg-[#14141f] transition">
                    <td className="py-4 text-gray-400">
                      {new Date(sale.saleDate || sale.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td className="py-4 font-bold text-white">{sale.authorEmail}</td>
                    <td className="py-4 text-gray-200">{sale.bookTitle}</td>
                    <td className="py-4 text-gray-300 font-medium">{sale.quantity}</td>
                    <td className="py-4 text-gray-300 font-medium">₹{Number(sale.unitPrice || 0).toFixed(2)}</td>
                    <td className="py-4 text-white font-extrabold">₹{Number(sale.grossSales || 0).toFixed(2)}</td>
                    <td className="py-4 text-emerald-400 font-extrabold">
                      ₹{Number(sale.authorProfit || 0).toFixed(2)}
                    </td>
                    <td className="py-4 text-gray-400">{sale.channel || "Direct"}</td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onOpenEditSale && onOpenEditSale(sale)}
                          className="p-1.5 text-gray-400 hover:text-[#f3c06b] hover:bg-[#1e1e2c] border border-transparent hover:border-[#c8923a]/40 rounded-lg transition cursor-pointer"
                          title="Edit Sale"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteSale && onDeleteSale(sale._id || sale.id)}
                          className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/30 rounded-lg transition cursor-pointer"
                          title="Delete Sale"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
