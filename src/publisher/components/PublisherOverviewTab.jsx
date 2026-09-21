import React from "react";
import {
  BookOpen,
  DollarSign,
  Briefcase,
  Clock,
  ExternalLink
} from "lucide-react";

export default function PublisherOverviewTab({
  overviewMetrics,
  paymentBreakdown = [],
  authorEarnings = [],
  rawAuthors = [],
  onOpenAuthorBooks
}) {
  return (
    <div className="space-y-8">
      {/* Metrics Row 1 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-b from-[#111118] to-[#0a0a0f] border border-[#222232] hover:border-[#c8923a]/40 p-5 rounded-2xl transition duration-300 shadow-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-400 font-medium">Total Books Sold</span>
            <div className="p-2 bg-[#1c1c28] rounded-xl text-[#c8923a]">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-white">{overviewMetrics?.totalBooksSold || 0}</h2>
        </div>

        <div className="bg-gradient-to-b from-[#111118] to-[#0a0a0f] border border-[#222232] hover:border-[#c8923a]/40 p-5 rounded-2xl transition duration-300 shadow-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-400 font-medium">Gross Sales</span>
            <div className="p-2 bg-[#1c1c28] rounded-xl text-[#c8923a]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-[#f3c06b]">
            ₹{(overviewMetrics?.grossSales || 0).toLocaleString("en-IN")}
          </h2>
        </div>

        <div className="bg-gradient-to-b from-[#111118] to-[#0a0a0f] border border-[#222232] hover:border-[#c8923a]/40 p-5 rounded-2xl transition duration-300 shadow-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-400 font-medium">Author Profit</span>
            <div className="p-2 bg-[#1c1c28] rounded-xl text-[#c8923a]">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-[#f3c06b]">
            ₹{(overviewMetrics?.totalAuthorProfit || 0).toLocaleString("en-IN")}
          </h2>
        </div>

        <div className="bg-gradient-to-b from-[#111118] to-[#0a0a0f] border border-[#222232] hover:border-[#c8923a]/40 p-5 rounded-2xl transition duration-300 shadow-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-400 font-medium">Total Pending</span>
            <div className="p-2 bg-amber-950/60 text-amber-400 rounded-xl">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-amber-500">
            ₹{(overviewMetrics?.totalPendingFees || 0).toLocaleString("en-IN")}
          </h2>
        </div>
      </div>

      {/* Metrics Row 2 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#0f0f15] border border-[#1e1e2d] p-5 rounded-2xl">
          <p className="text-xs text-gray-400 mb-1 font-medium">Publishing Fees Due</p>
          <h3 className="text-xl font-bold text-white">
            ₹{(overviewMetrics?.publishingFeesDue || 0).toLocaleString("en-IN")}
          </h3>
        </div>
        <div className="bg-[#0f0f15] border border-[#1e1e2d] p-5 rounded-2xl">
          <p className="text-xs text-gray-400 mb-1 font-medium">Publishing Fees Received</p>
          <h3 className="text-xl font-bold text-emerald-400">
            ₹{(overviewMetrics?.publishingFeesReceived || 0).toLocaleString("en-IN")}
          </h3>
        </div>
        <div className="bg-[#0f0f15] border border-[#1e1e2d] p-5 rounded-2xl">
          <p className="text-xs text-gray-400 mb-1 font-medium">Royalty Paid</p>
          <h3 className="text-xl font-bold text-emerald-400">
            ₹{(overviewMetrics?.royaltyPaid || 0).toLocaleString("en-IN")}
          </h3>
        </div>
        <div className="bg-[#0f0f15] border border-[#1e1e2d] p-5 rounded-2xl">
          <p className="text-xs text-gray-400 mb-1 font-medium">Royalty Pending</p>
          <h3 className="text-xl font-bold text-amber-400">
            ₹{(overviewMetrics?.royaltyPending || 0).toLocaleString("en-IN")}
          </h3>
        </div>
      </div>

      {/* Payment Breakdown Table */}
      <div className="bg-[#0e0e14] border border-[#1f1f2e] rounded-3xl p-6 shadow-xl">
        <h3 className="font-serif text-xl font-extrabold text-[#f3c06b] mb-1">Payment Breakdown</h3>
        <p className="text-xs text-gray-400 mb-5">Publishing plan payment status and royalty breakdown per author</p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#222232] text-gray-400 uppercase tracking-wider text-[11px]">
                <th className="pb-3 font-semibold">Author</th>
                <th className="pb-3 font-semibold">Plan Amount</th>
                <th className="pb-3 font-semibold">Plan Paid</th>
                <th className="pb-3 font-semibold">Plan Pending</th>
                <th className="pb-3 font-semibold">Royalty Earned</th>
                <th className="pb-3 font-semibold">Royalty Paid</th>
                <th className="pb-3 font-semibold">Royalty Pending</th>
                <th className="pb-3 font-semibold">Total Pending</th>
                <th className="pb-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#181824]">
              {paymentBreakdown.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-gray-500">
                    No registered authors found. Click "+ Add Author" to add one.
                  </td>
                </tr>
              ) : (
                paymentBreakdown.map((row) => (
                  <tr
                    key={row.id || row._id || row.email}
                    onClick={() => onOpenAuthorBooks && onOpenAuthorBooks(row)}
                    className="hover:bg-[#181826] transition cursor-pointer group"
                    title={`Click to view all books for ${row.name}`}
                  >
                    <td className="py-4">
                      <p className="font-bold text-white text-sm group-hover:text-[#f3c06b] transition flex items-center gap-1.5">
                        <span>{row.name}</span>
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 text-[#f3c06b] transition" />
                      </p>
                      <p className="text-[11px] text-gray-400">{row.email}</p>
                    </td>
                    <td className="py-4 text-gray-300 font-medium">₹{Number(row.planAmount || 0).toFixed(2)}</td>
                    <td className="py-4 text-gray-300 font-medium">₹{Number(row.planPaid || 0).toFixed(2)}</td>
                    <td className="py-4 text-gray-300 font-medium">₹{Number(row.planPending || 0).toFixed(2)}</td>
                    <td className="py-4 text-gray-300 font-medium">₹{Number(row.royaltyEarned || 0).toFixed(2)}</td>
                    <td className="py-4 text-gray-300 font-medium">₹{Number(row.royaltyPaid || 0).toFixed(2)}</td>
                    <td className="py-4 text-gray-300 font-medium">₹{Number(row.royaltyPending || 0).toFixed(2)}</td>
                    <td className="py-4 font-extrabold text-[#f3c06b]">₹{Number(row.totalPending || 0).toFixed(2)}</td>
                    <td className="py-4">
                      <span
                        className={`px-3 py-1 rounded-lg text-[10px] font-extrabold ${
                          row.status === "PAID"
                            ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800"
                            : "bg-amber-950/80 text-amber-400 border border-amber-800"
                        }`}
                      >
                        {row.status || "PENDING"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Author Earnings Table */}
      <div className="bg-[#0e0e14] border border-[#1f1f2e] rounded-3xl p-6 shadow-xl">
        <h3 className="font-serif text-xl font-extrabold text-white mb-4">Author Earnings Overview</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#222232] text-gray-400 uppercase tracking-wider text-[11px]">
                <th className="pb-3 font-semibold">Author</th>
                <th className="pb-3 font-semibold">Books Sold</th>
                <th className="pb-3 font-semibold">Gross Sales</th>
                <th className="pb-3 font-semibold">Author Profit</th>
                <th className="pb-3 font-semibold">Royalty Paid</th>
                <th className="pb-3 font-semibold">Royalty Pending</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#181824]">
              {authorEarnings.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500">
                    No author earnings recorded yet.
                  </td>
                </tr>
              ) : (
                authorEarnings.map((row) => (
                  <tr
                    key={row.id || row._id || row.email}
                    onClick={() => {
                      const target = rawAuthors.find((a) => a.email === row.email) || row;
                      if (onOpenAuthorBooks) onOpenAuthorBooks(target);
                    }}
                    className="hover:bg-[#181826] transition cursor-pointer group"
                    title={`Click to view all books for ${row.name}`}
                  >
                    <td className="py-4 font-bold text-white text-sm group-hover:text-[#f3c06b] transition flex items-center gap-1.5">
                      <span>{row.name}</span>
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 text-[#f3c06b] transition" />
                    </td>
                    <td className="py-4 text-gray-300 font-medium">{row.booksSold}</td>
                    <td className="py-4 text-gray-300 font-medium">₹{Number(row.gross || 0).toFixed(2)}</td>
                    <td className="py-4 text-gray-300 font-medium">₹{Number(row.profit || 0).toFixed(2)}</td>
                    <td className="py-4 text-emerald-400 font-bold">₹{Number(row.paid || 0).toFixed(2)}</td>
                    <td className="py-4 text-amber-400 font-extrabold">₹{Number(row.pending || 0).toFixed(2)}</td>
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
