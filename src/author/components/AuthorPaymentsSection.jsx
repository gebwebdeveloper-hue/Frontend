import { CreditCard } from "lucide-react";

export default function AuthorPaymentsSection({ authInfo }) {
  return (
    <div className="bg-[#0e0e14] border border-[#1f1f2e] rounded-3xl p-6 space-y-6 shadow-xl">
      <h3 className="font-serif text-xl font-extrabold text-white flex items-center gap-2">
        <CreditCard className="w-5 h-5 text-[#f3c06b]" />
        <span>Publishing Package & Payment Status</span>
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="bg-[#08080c] p-4 rounded-2xl border border-[#1a1a26]">
          <p className="text-gray-400 mb-1">Package Plan</p>
          <p className="font-bold text-white text-sm">{authInfo.selectedPlan || "Publication Author Plan"}</p>
        </div>
        <div className="bg-[#08080c] p-4 rounded-2xl border border-[#1a1a26]">
          <p className="text-gray-400 mb-1">Payment Method</p>
          <p className="font-bold text-white text-sm">{authInfo.paymentMethod || "UPI / Direct Transfer"}</p>
        </div>
        <div className="bg-[#08080c] p-4 rounded-2xl border border-[#1a1a26]">
          <p className="text-gray-400 mb-1">Status</p>
          <span className="px-3 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-extrabold rounded-lg">
            {authInfo.publishingPaymentStatus || "PAID"}
          </span>
        </div>
      </div>
    </div>
  );
}
