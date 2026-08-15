import { Check, Clock, Award, ShieldCheck } from "lucide-react";

export default function AuthorOverviewSection({ authInfo, steps = [], summaryMetrics }) {
  const completedCount = steps.filter((s) => s.status === "COMPLETED").length;
  const progressPercent = Math.round((completedCount / (steps.length || 9)) * 100);

  return (
    <div className="space-y-8">
      {/* AUTHOR PROFILE CARD */}
      <div className="bg-gradient-to-b from-[#12121a] via-[#0e0e14] to-[#09090d] border border-[#c8923a]/30 hover:border-[#c8923a]/60 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl transition duration-500">
        <div className="flex flex-wrap justify-between items-center gap-4 border-b border-[#1f1f2e] pb-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2a2a3a] via-[#1a1a26] to-[#0d0d14] border border-[#c8923a]/50 p-0.5 flex items-center justify-center shadow-xl overflow-hidden">
              {authInfo.thumbnailUrl || authInfo.avatarUrl ? (
                <img
                  src={authInfo.thumbnailUrl || authInfo.avatarUrl}
                  alt={authInfo.name}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <span className="font-serif text-2xl font-extrabold text-[#f3c06b]">
                  {(authInfo.name || "A").charAt(0)}
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-2xl font-extrabold text-white">{authInfo.name || "Author"}</h3>
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-xs text-gray-400 mt-0.5">{authInfo.email} • {authInfo.phone || "9876543210"}</p>
            </div>
          </div>
          <span className="px-4 py-1.5 bg-[#181824] text-[#f3c06b] text-xs font-extrabold rounded-xl border border-[#333348] shadow">
            {authInfo.selectedPlan || "Publication Author Plan"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-[#08080c] p-4 rounded-2xl border border-[#1a1a26]">
            <p className="text-gray-400 mb-1 font-medium">Selected Publishing Plan</p>
            <p className="font-bold text-white text-sm">{authInfo.selectedPlan || "Publication Author Plan"}</p>
          </div>
          <div className="bg-[#08080c] p-4 rounded-2xl border border-[#1a1a26]">
            <p className="text-gray-400 mb-1 font-medium">Package Details</p>
            <p className="font-bold text-gray-200 text-xs">{authInfo.planDetails || "Official Publication Author"}</p>
          </div>
          <div className="bg-[#08080c] p-4 rounded-2xl border border-[#1a1a26]">
            <p className="text-gray-400 mb-1 font-medium">Publishing Plan Payment</p>
            <p className={`font-bold text-sm ${authInfo.publishingPaymentStatus === "PAID" ? "text-emerald-400" : "text-amber-400"}`}>
              {authInfo.publishingPaymentStatus || "PAID"}
            </p>
          </div>
        </div>
      </div>

      {/* ULTRA-PREMIUM 9-STEP PUBLISHING EXECUTION TRACKER */}
      <div className="bg-gradient-to-b from-[#11111a] via-[#0e0e14] to-[#09090d] border border-[#c8923a]/30 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        {/* Decorative Gold Radial Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#c8923a]/10 blur-[100px] pointer-events-none rounded-full"></div>

        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-xl font-extrabold text-white">Publishing Execution Progress</h3>
              <Award className="w-5 h-5 text-[#f3c06b]" />
            </div>
            <p className="text-xs text-gray-400 mt-1">9-step progress status maintained by Lekhok Tripura Publishers</p>
          </div>

          <div className="flex items-center gap-3 bg-[#14141e] px-4 py-2 rounded-2xl border border-[#2a2a3e] shadow">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-xs font-extrabold text-white">
              {completedCount} of {steps.length || 9} Steps Completed ({progressPercent}%)
            </span>
          </div>
        </div>

        {/* Timeline Track Container */}
        <div className="overflow-x-auto pt-4 pb-6 scrollbar-thin">
          <div className="min-w-[850px] relative px-4">
            {/* Glowing Golden Background Connecting Line */}
            <div className="absolute top-6 left-10 right-10 h-1 bg-[#1c1c2b] rounded-full -z-0">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-[#f3c06b] to-emerald-400 rounded-full transition-all duration-700 shadow-md shadow-[#c8923a]/30"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>

            {/* Step Nodes */}
            <div className="flex justify-between items-start relative z-10">
              {steps.map((st) => {
                const isDone = st.status === "COMPLETED";
                const isCurrent = st.status === "IN_PROGRESS";

                return (
                  <div
                    key={st.stepNumber}
                    className="flex flex-col items-center group cursor-pointer transition-transform duration-300 hover:-translate-y-1"
                  >
                    {/* Node Badge Circle */}
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center font-extrabold text-xs transition-all duration-300 shadow-xl ${
                        isDone
                          ? "bg-gradient-to-br from-emerald-400 to-emerald-600 text-black ring-4 ring-emerald-500/25 shadow-emerald-500/30"
                          : isCurrent
                          ? "bg-gradient-to-br from-[#f3c06b] to-[#c8923a] text-black ring-4 ring-[#c8923a]/40 shadow-[#c8923a]/40 animate-pulse"
                          : "bg-[#12121a] border-2 border-[#2d2d3e] text-gray-500"
                      }`}
                    >
                      {isDone ? (
                        <Check className="w-5 h-5 text-black stroke-[3]" />
                      ) : isCurrent ? (
                        <Clock className="w-5 h-5 text-black animate-spin" />
                      ) : (
                        <span>{st.stepNumber}</span>
                      )}
                    </div>

                    {/* Step Title Label */}
                    <p className={`text-xs font-bold text-center mt-3 max-w-[85px] leading-snug transition-colors ${
                      isDone ? "text-white" : isCurrent ? "text-[#f3c06b]" : "text-gray-400"
                    }`}>
                      {st.name}
                    </p>

                    {/* Status Pill Badge */}
                    <span
                      className={`mt-2 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider shadow ${
                        isDone
                          ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800"
                          : isCurrent
                          ? "bg-amber-950/80 text-amber-400 border border-amber-800"
                          : "bg-[#161622] text-gray-400 border border-[#2d2d3e]"
                      }`}
                    >
                      {st.status || "PENDING"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-b from-[#111118] to-[#09090d] border border-[#1f1f2e] hover:border-[#c8923a]/40 p-5 rounded-2xl transition duration-300 shadow-xl">
          <p className="text-xs text-gray-400 mb-1 font-medium">Total Published Books</p>
          <h3 className="text-3xl font-extrabold text-white">{summaryMetrics?.totalBooks || 1}</h3>
        </div>
        <div className="bg-gradient-to-b from-[#111118] to-[#09090d] border border-[#1f1f2e] hover:border-[#c8923a]/40 p-5 rounded-2xl transition duration-300 shadow-xl">
          <p className="text-xs text-gray-400 mb-1 font-medium">Total Copies Sold</p>
          <h3 className="text-3xl font-extrabold text-white">{summaryMetrics?.totalSales || 0}</h3>
        </div>
        <div className="bg-gradient-to-b from-[#111118] to-[#09090d] border border-[#1f1f2e] hover:border-[#c8923a]/40 p-5 rounded-2xl transition duration-300 shadow-xl">
          <p className="text-xs text-gray-400 mb-1 font-medium">Total Sale Price</p>
          <h3 className="text-3xl font-extrabold text-[#f3c06b]">₹{(summaryMetrics?.totalSalePrice || 0).toFixed(2)}</h3>
        </div>
        <div className="bg-gradient-to-b from-[#111118] to-[#09090d] border border-[#1f1f2e] hover:border-[#c8923a]/40 p-5 rounded-2xl transition duration-300 shadow-xl">
          <p className="text-xs text-gray-400 mb-1 font-medium">Total Royalty Profit</p>
          <h3 className="text-3xl font-extrabold text-emerald-400">₹{(summaryMetrics?.totalProfit || 0).toFixed(2)}</h3>
        </div>
      </div>
    </div>
  );
}
