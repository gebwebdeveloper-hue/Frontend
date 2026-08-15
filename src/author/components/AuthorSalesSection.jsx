export default function AuthorSalesSection({ summaryMetrics, authorSales }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#0e0e14] border border-[#1f1f2e] p-5 rounded-2xl shadow-lg">
          <p className="text-xs text-gray-400 mb-1 font-medium">Total Copies Sold</p>
          <h3 className="text-3xl font-extrabold text-white">{summaryMetrics?.totalSales || 0}</h3>
        </div>
        <div className="bg-[#0e0e14] border border-[#1f1f2e] p-5 rounded-2xl shadow-lg">
          <p className="text-xs text-gray-400 mb-1 font-medium">Total Gross Revenue</p>
          <h3 className="text-3xl font-extrabold text-[#f3c06b]">₹{(summaryMetrics?.totalSalePrice || 0).toFixed(2)}</h3>
        </div>
        <div className="bg-[#0e0e14] border border-[#1f1f2e] p-5 rounded-2xl shadow-lg">
          <p className="text-xs text-gray-400 mb-1 font-medium">Author Profit Earned</p>
          <h3 className="text-3xl font-extrabold text-emerald-400">₹{(summaryMetrics?.totalProfit || 0).toFixed(2)}</h3>
        </div>
      </div>

      <div className="bg-[#0e0e14] border border-[#1f1f2e] rounded-3xl p-6 shadow-xl">
        <h3 className="font-serif text-xl font-extrabold text-white mb-4">Book Sales Transactions History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#222232] text-gray-400 uppercase tracking-wider text-[11px]">
                <th className="pb-3 font-semibold">Date</th>
                <th className="pb-3 font-semibold">Book Title</th>
                <th className="pb-3 font-semibold">Quantity</th>
                <th className="pb-3 font-semibold">Unit Price</th>
                <th className="pb-3 font-semibold">Gross Revenue</th>
                <th className="pb-3 font-semibold">My Profit (Royalty)</th>
                <th className="pb-3 font-semibold">Sales Channel</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#181824]">
              {authorSales.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-gray-500">No book sales recorded yet for your account.</td>
                </tr>
              ) : (
                authorSales.map((sale) => (
                  <tr key={sale._id || sale.id} className="hover:bg-[#14141f] transition">
                    <td className="py-4 text-gray-400">{new Date(sale.saleDate || sale.createdAt).toLocaleDateString("en-IN")}</td>
                    <td className="py-4 font-bold text-white">{sale.bookTitle}</td>
                    <td className="py-4 text-gray-300 font-medium">{sale.quantity}</td>
                    <td className="py-4 text-gray-300 font-medium">₹{sale.unitPrice}</td>
                    <td className="py-4 text-white font-extrabold">₹{sale.grossSales}</td>
                    <td className="py-4 text-emerald-400 font-extrabold">₹{sale.authorProfit}</td>
                    <td className="py-4 text-gray-400">{sale.channel || "Direct"}</td>
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
