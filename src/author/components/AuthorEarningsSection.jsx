import { DollarSign, FileText } from "lucide-react";

export default function AuthorEarningsSection({ authInfo, summaryMetrics }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-[#0e0e14] border border-[#1f1f2e] rounded-3xl p-6 space-y-4 shadow-xl">
        <h3 className="font-serif text-xl font-extrabold text-white flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-[#f3c06b]" />
          <span>Earnings Breakdown</span>
        </h3>
        <div className="space-y-4 text-xs pt-2">
          <div className="flex justify-between py-3 border-b border-[#1c1c28]">
            <span className="text-gray-400">Total Net Royalty Profit</span>
            <span className="font-extrabold text-white text-sm">₹{(authInfo.netAuthorProfit || summaryMetrics?.totalProfit || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-[#1c1c28]">
            <span className="text-gray-400">Royalty Amount Paid</span>
            <span className="font-extrabold text-emerald-400 text-sm">₹{(authInfo.paidAmount || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-[#1c1c28]">
            <span className="text-gray-400">Royalty Pending Payout</span>
            <span className="font-extrabold text-amber-400 text-sm">₹{(authInfo.pendingAmount || 0).toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="bg-[#0e0e14] border border-[#1f1f2e] rounded-3xl p-6 space-y-4 shadow-xl">
        <h3 className="font-serif text-xl font-extrabold text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#f3c06b]" />
          <span>Royalty Policy & Deductions</span>
        </h3>
        <div className="space-y-3 text-xs text-gray-300 leading-relaxed pt-2">
          <p>• Author Royalty is calculated on agreed percentage (standard 70% share of gross sales).</p>
          <p>• Payouts are transferred automatically upon reaching minimum threshold limit.</p>
          <p>• Printing costs and publishing plan fees are tracked separately.</p>
        </div>
      </div>
    </div>
  );
}
