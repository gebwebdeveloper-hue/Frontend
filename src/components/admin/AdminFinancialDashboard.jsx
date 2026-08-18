import {
  TrendingUp, ArrowDownLeft, ArrowUpRight, Receipt, Calendar
} from "lucide-react";

export default function AdminFinancialDashboard({ incomeRecords, expenseRecords }) {
  // Calculate Dashboard Aggregates grouped by Month + Year
  const getDashboardData = () => {
    const monthGroups = {};

    // Process Income
    incomeRecords.forEach((inc) => {
      const key = `${inc.month},${inc.year}`;
      if (!monthGroups[key]) {
        monthGroups[key] = {
          month: inc.month,
          year: inc.year,
          totalReceived: 0,
          totalDeductions: 0,
          netIncome: 0,
          totalExpense: 0,
          netProfitLoss: 0,
        };
      }
      const rec = Number(inc.totalAmount) || 0;
      const ded =
        (Number(inc.gstAmount) || 0) +
        (Number(inc.deliveryCharges) || 0) +
        (Number(inc.discount) || 0);
      monthGroups[key].totalReceived += rec;
      monthGroups[key].totalDeductions += ded;
      monthGroups[key].netIncome += rec - ded;
    });

    // Process Expenses
    expenseRecords.forEach((exp) => {
      const key = `${exp.month},${exp.year}`;
      if (!monthGroups[key]) {
        monthGroups[key] = {
          month: exp.month,
          year: exp.year,
          totalReceived: 0,
          totalDeductions: 0,
          netIncome: 0,
          totalExpense: 0,
          netProfitLoss: 0,
        };
      }
      const expAmt = Number(exp.totalBillAmount) || 0;
      monthGroups[key].totalExpense += expAmt;
    });

    // Compute Net Profit/Loss for each month
    Object.keys(monthGroups).forEach((k) => {
      const g = monthGroups[k];
      g.netProfitLoss = g.netIncome - g.totalExpense;
    });

    // Sort by Year desc, then Month order
    const monthOrder = [
      "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
      "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
    ];
    return Object.values(monthGroups).sort((a, b) => {
      if (a.year !== b.year) return Number(b.year) - Number(a.year);
      return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
    });
  };

  const dashboardCards = getDashboardData();
  const lifetimeReceived = incomeRecords.reduce((s, r) => s + (Number(r.totalAmount) || 0), 0);
  const lifetimeDeductions = incomeRecords.reduce(
    (s, r) =>
      s +
      ((Number(r.gstAmount) || 0) +
        (Number(r.deliveryCharges) || 0) +
        (Number(r.discount) || 0)),
    0
  );
  const lifetimeExpenses = expenseRecords.reduce((s, r) => s + (Number(r.totalBillAmount) || 0), 0);
  const lifetimeNetIncome = lifetimeReceived - lifetimeDeductions;
  const lifetimeNetProfit = lifetimeNetIncome - lifetimeExpenses;

  return (
    <div className="space-y-6">
      {/* Top Stat Cards Bar */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/10 via-zinc-900 to-zinc-900 p-5 text-white shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              Total Payment Received
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
              <ArrowDownLeft className="h-4 w-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black tracking-tight text-white">
            ₹{lifetimeReceived.toFixed(2)}
          </h3>
          <p className="text-[11px] text-white/40 mt-1">
            {incomeRecords.length} Sales Invoices Logged
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-amber-500/10 via-zinc-900 to-zinc-900 p-5 text-white shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
              Deductions (GST + Delivery)
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
              <Receipt className="h-4 w-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black tracking-tight text-white">
            ₹{lifetimeDeductions.toFixed(2)}
          </h3>
          <p className="text-[11px] text-white/40 mt-1">Taxes & Logistics Cost</p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-rose-500/10 via-zinc-900 to-zinc-900 p-5 text-white shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
              Total Expenses Paid
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black tracking-tight text-white">
            ₹{lifetimeExpenses.toFixed(2)}
          </h3>
          <p className="text-[11px] text-white/40 mt-1">
            {expenseRecords.length} Expense Bills Paid
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-500/10 via-zinc-900 to-zinc-900 p-5 text-white shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
              Net Business Profit / Loss
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <h3
            className={`text-2xl font-black tracking-tight ${
              lifetimeNetProfit >= 0 ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            ₹{lifetimeNetProfit.toFixed(2)}
          </h3>
          <p className="text-[11px] text-white/40 mt-1">Net Income − Expenses</p>
        </div>
      </div>

      {/* Month-Wise Profit & Loss Cards (Matching Screenshot 3 Layout) */}
      <div className="rounded-3xl border border-white/10 bg-zinc-900/80 p-6 text-white shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
          <div>
            <h3 className="text-lg font-black tracking-wide text-white uppercase flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              Month-Wise Profit & Loss Breakdown
            </h3>
            <p className="text-xs text-white/50">
              Selling Income, Deductions & Expenses grouped by month & year
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {dashboardCards.map((card, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4 hover:border-emerald-400/40 transition"
            >
              {/* Month Tag */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-sm font-black tracking-wider text-white uppercase flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-emerald-400" />
                  {card.month}, {card.year}
                </span>
                <span
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                    card.netProfitLoss >= 0
                      ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                      : "bg-rose-500/10 text-rose-300 border-rose-500/20"
                  }`}
                >
                  {card.netProfitLoss >= 0 ? "PROFIT" : "LOSS"}
                </span>
              </div>

              {/* Income Section */}
              <div className="space-y-2 border-l-2 border-emerald-500/50 pl-3">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">
                  INCOME
                </p>
                <div className="flex justify-between text-xs">
                  <span className="text-white/60">Total Received</span>
                  <span className="font-bold text-white">
                    ₹{card.totalReceived.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/60">Deductions (GST + Delivery)</span>
                  <span className="font-semibold text-amber-300">
                    ₹{card.totalDeductions.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-xs border-t border-white/10 pt-1 font-bold">
                  <span className="text-white/80">Net Selling Income</span>
                  <span className="text-emerald-300">
                    ₹{card.netIncome.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Expense Section */}
              <div className="space-y-2 border-l-2 border-rose-500/50 pl-3">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-rose-400">
                  EXPENSE
                </p>
                <div className="flex justify-between text-xs">
                  <span className="text-white/60">Total Expenses Paid</span>
                  <span className="font-bold text-rose-300">
                    ₹{card.totalExpense.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Profit/Loss Bottom Bar */}
              <div className="rounded-xl border border-white/10 bg-black/40 p-3 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-white/70">
                  PROFIT / LOSS
                </span>
                <span
                  className={`text-sm font-black ${
                    card.netProfitLoss >= 0 ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  ₹{card.netProfitLoss.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
