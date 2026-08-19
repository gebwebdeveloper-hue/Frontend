import { useState, useMemo } from "react";
import {
  TrendingUp, ArrowDownLeft, ArrowUpRight, Calendar, Filter,
  FileSpreadsheet, Search, ExternalLink, ChevronDown, Receipt, Info,
  Edit3, Trash2
} from "lucide-react";
import * as XLSX from "xlsx";

const MONTH_NAMES = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
];

export default function AdminFinancialDashboard({
  incomeRecords = [],
  expenseRecords = [],
  onViewPreview,
  onOpenGenerator,
  onEditIncome,
  onDeleteIncome
}) {
  const currentYearStr = new Date().getFullYear().toString();

  // Filters State: Initially empty until user selects Year & Month
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  
  // Interactive Sales Details Visibility Toggle & Search State
  const [showSalesDetails, setShowSalesDetails] = useState(false);
  const [salesSearchQuery, setSalesSearchQuery] = useState("");

  // Extract all available years from records (fallback to current year)
  const availableYears = useMemo(() => {
    const yearsSet = new Set([currentYearStr]);
    incomeRecords.forEach((r) => r.year && yearsSet.add(r.year.toString()));
    expenseRecords.forEach((r) => r.year && yearsSet.add(r.year.toString()));
    return Array.from(yearsSet).sort((a, b) => Number(b) - Number(a));
  }, [incomeRecords, expenseRecords, currentYearStr]);

  // Check if both Year and Month are selected
  const isPeriodSelected = Boolean(selectedYear && selectedMonth);

  // Filter Income & Expenses by Selected Year & Month
  const filteredIncomeRecords = useMemo(() => {
    if (!isPeriodSelected) return [];
    return incomeRecords.filter((inc) => {
      const matchYear = selectedYear === "ALL" || inc.year === selectedYear;
      const matchMonth = selectedMonth === "ALL" || inc.month?.toUpperCase() === selectedMonth;
      return matchYear && matchMonth;
    });
  }, [incomeRecords, selectedYear, selectedMonth, isPeriodSelected]);

  const filteredExpenseRecords = useMemo(() => {
    if (!isPeriodSelected) return [];
    return expenseRecords.filter((exp) => {
      const matchYear = selectedYear === "ALL" || exp.year === selectedYear;
      const matchMonth = selectedMonth === "ALL" || exp.month?.toUpperCase() === selectedMonth;
      return matchYear && matchMonth;
    });
  }, [expenseRecords, selectedYear, selectedMonth, isPeriodSelected]);

  // Calculate Aggregates for Selected Filter
  const totalSaleReceived = useMemo(() => {
    return filteredIncomeRecords.reduce((sum, r) => sum + (Number(r.totalAmount) || 0), 0);
  }, [filteredIncomeRecords]);

  const totalSaleDeductions = useMemo(() => {
    return filteredIncomeRecords.reduce(
      (sum, r) =>
        sum +
        ((Number(r.gstAmount) || 0) +
          (Number(r.deliveryCharges) || 0) +
          (Number(r.discount) || 0)),
      0
    );
  }, [filteredIncomeRecords]);

  const netSaleIncome = totalSaleReceived - totalSaleDeductions;

  const totalExpensesPaid = useMemo(() => {
    return filteredExpenseRecords.reduce((sum, r) => sum + (Number(r.totalBillAmount) || 0), 0);
  }, [filteredExpenseRecords]);

  const netProfitLoss = netSaleIncome - totalExpensesPaid;

  // Search-filtered Sales Details Table Rows
  const searchedSalesRecords = useMemo(() => {
    if (!salesSearchQuery.trim()) return filteredIncomeRecords;
    const term = salesSearchQuery.toLowerCase();
    return filteredIncomeRecords.filter(
      (inc) =>
        (inc.invoiceNo && inc.invoiceNo.toLowerCase().includes(term)) ||
        (inc.customerName && inc.customerName.toLowerCase().includes(term)) ||
        (inc.description && inc.description.toLowerCase().includes(term)) ||
        (inc.paymentMode && inc.paymentMode.toLowerCase().includes(term)) ||
        (inc.customerPhone && inc.customerPhone.toLowerCase().includes(term))
    );
  }, [filteredIncomeRecords, salesSearchQuery]);

  // Export Sales Details to XLSX File
  const handleExportXLSX = () => {
    if (searchedSalesRecords.length === 0) {
      alert("No sales records available to export for the selected period.");
      return;
    }

    const excelData = searchedSalesRecords.map((r, index) => ({
      "SL No": index + 1,
      "Date": r.date || "",
      "Month": r.month || "",
      "Year": r.year || "",
      "Invoice No": r.invoiceNo || "",
      "Payment Mode": r.paymentMode || "",
      "Customer Name": r.customerName || "",
      "Customer Phone": r.customerPhone || "",
      "Customer Email": r.customerEmail || "",
      "Customer Address": r.customerAddress || "",
      "Goods & Services Description": r.description || "",
      "Qty": r.qty || 1,
      "Actual Rate (INR)": Number(r.actualRate || 0),
      "Taxable Payable (INR)": Number(r.taxablePayable || 0),
      "GST Amount (INR)": Number(r.gstAmount || 0),
      "Delivery Charges (INR)": Number(r.deliveryCharges || 0),
      "Discount (INR)": Number(r.discount || 0),
      "Total Amount (INR)": Number(r.totalAmount || 0)
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sales_Details");

    const monthLabel = selectedMonth === "ALL" ? "All_Months" : selectedMonth;
    const yearLabel = selectedYear === "ALL" ? "All_Years" : selectedYear;
    const fileName = `Lekhak_Tripura_Sales_${monthLabel}_${yearLabel}.xlsx`;

    XLSX.writeFile(workbook, fileName);
  };

  const handleYearChange = (e) => {
    const val = e.target.value;
    setSelectedYear(val);
    if (val && selectedMonth) {
      setShowSalesDetails(true);
    }
  };

  const handleMonthChange = (e) => {
    const val = e.target.value;
    setSelectedMonth(val);
    if (selectedYear && val) {
      setShowSalesDetails(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── FILTER HEADER BAR: SELECT YEAR & MONTH ── */}
      <div className="rounded-3xl border border-white/10 bg-zinc-900/90 p-6 text-white shadow-2xl backdrop-blur-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-xs uppercase tracking-widest">
            <Filter className="h-4 w-4" /> Financial Report Selector
          </div>
          <h2 className="text-xl font-black text-white tracking-wide mt-1">
            Select Year & Month to View Report
          </h2>
          <p className="text-xs text-white/50">
            First select year, then select month to view sales, expenses, net profit & sales details
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* STEP 1: YEAR SELECTOR */}
          <div className={`flex items-center gap-2 rounded-2xl border px-4 py-2.5 transition ${
            selectedYear ? "border-emerald-500/50 bg-emerald-500/10 text-white" : "border-white/10 bg-white/5 text-white/60"
          }`}>
            <Calendar className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-bold">1. Select Year:</span>
            <select
              value={selectedYear}
              onChange={handleYearChange}
              className="bg-transparent text-xs font-black text-white focus:outline-none cursor-pointer"
            >
              <option value="" className="bg-zinc-900 text-white/50">-- Select Year --</option>
              <option value="ALL" className="bg-zinc-900 text-white">ALL YEARS</option>
              {availableYears.map((yr) => (
                <option key={yr} value={yr} className="bg-zinc-900 text-white">
                  {yr}
                </option>
              ))}
            </select>
            <ChevronDown className="h-3.5 w-3.5 text-white/40" />
          </div>

          {/* STEP 2: MONTH SELECTOR */}
          <div className={`flex items-center gap-2 rounded-2xl border px-4 py-2.5 transition ${
            selectedMonth ? "border-cyan-500/50 bg-cyan-500/10 text-white" : "border-white/10 bg-white/5 text-white/60"
          }`}>
            <Calendar className="h-4 w-4 text-cyan-400" />
            <span className="text-xs font-bold">2. Select Month:</span>
            <select
              value={selectedMonth}
              onChange={handleMonthChange}
              className="bg-transparent text-xs font-black text-white focus:outline-none cursor-pointer"
            >
              <option value="" className="bg-zinc-900 text-white/50">-- Select Month --</option>
              <option value="ALL" className="bg-zinc-900 text-white">ALL MONTHS</option>
              {MONTH_NAMES.map((m) => (
                <option key={m} value={m} className="bg-zinc-900 text-white">
                  {m}
                </option>
              ))}
            </select>
            <ChevronDown className="h-3.5 w-3.5 text-white/40" />
          </div>
        </div>
      </div>

      {/* ── PROMPT BANNER WHEN YEAR OR MONTH IS NOT YET SELECTED ── */}
      {!isPeriodSelected && (
        <div className="rounded-3xl border border-dashed border-white/20 bg-zinc-900/50 p-12 text-center text-white space-y-3 backdrop-blur-xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Info className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-bold text-white">Please Select Year & Month</h3>
          <p className="text-xs text-white/50 max-w-md mx-auto">
            Choose a Year and Month using the dropdowns above to view the total sale, total expense, total profit, and detailed sales list for that period.
          </p>
        </div>
      )}

      {/* ── SUMMARY STAT CARDS & MONTH BREAKDOWN (ONLY VISIBLE WHEN BOTH YEAR & MONTH ARE SELECTED) ── */}
      {isPeriodSelected && (
        <>
          {/* 3 SUMMARY CARDS FOR SELECTED PERIOD */}
          <div className="grid gap-4 md:grid-cols-3 animate-in fade-in duration-300">
            {/* CARD 1: TOTAL SALE (CLICKABLE TO AUTO-SHOW SALES DETAILS) */}
            <button
              onClick={() => setShowSalesDetails((prev) => !prev)}
              className={`text-left rounded-3xl border transition-all duration-300 p-6 text-white shadow-xl group relative overflow-hidden ${
                showSalesDetails
                  ? "border-emerald-400/80 bg-gradient-to-br from-emerald-500/20 via-zinc-900 to-zinc-900 ring-2 ring-emerald-400/30"
                  : "border-white/10 bg-gradient-to-br from-emerald-500/10 via-zinc-900 to-zinc-900 hover:border-emerald-400/50"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <ArrowDownLeft className="h-4 w-4" /> TOTAL SALE
                </span>
                <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border transition ${
                  showSalesDetails
                    ? "bg-emerald-400 text-black border-emerald-400 font-bold"
                    : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 group-hover:bg-emerald-400 group-hover:text-black"
                }`}>
                  {showSalesDetails ? "DETAILS OPEN ▼" : "CLICK FOR DETAILS ➔"}
                </span>
              </div>

              <h3 className="text-3xl font-black tracking-tight text-white">
                ₹{totalSaleReceived.toFixed(2)}
              </h3>

              <div className="mt-3 flex items-center justify-between text-xs text-white/60">
                <span>{filteredIncomeRecords.length} Sales Invoices</span>
                <span className="text-emerald-300 font-semibold">Net: ₹{netSaleIncome.toFixed(2)}</span>
              </div>

              <p className="mt-2 text-[11px] text-emerald-400/90 font-semibold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Click sales card to view/hide sales details
              </p>
            </button>

            {/* CARD 2: TOTAL EXPENSE */}
            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-rose-500/10 via-zinc-900 to-zinc-900 p-6 text-white shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-extrabold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                  <ArrowUpRight className="h-4 w-4" /> TOTAL EXPENSE
                </span>
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400">
                  <Receipt className="h-4 w-4" />
                </div>
              </div>

              <h3 className="text-3xl font-black tracking-tight text-white">
                ₹{totalExpensesPaid.toFixed(2)}
              </h3>

              <div className="mt-3 flex items-center justify-between text-xs text-white/60">
                <span>{filteredExpenseRecords.length} Expense Bills Paid</span>
                <span className="text-rose-300 font-semibold">Period Expenses</span>
              </div>

              <p className="mt-2 text-[11px] text-white/40">
                Total operating & material expenses paid
              </p>
            </div>

            {/* CARD 3: TOTAL PROFIT / LOSS */}
            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-500/10 via-zinc-900 to-zinc-900 p-6 text-white shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-extrabold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4" /> TOTAL PROFIT
                </span>
                <span
                  className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full border ${
                    netProfitLoss >= 0
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      : "bg-rose-500/20 text-rose-300 border-rose-500/30"
                  }`}
                >
                  {netProfitLoss >= 0 ? "PROFIT" : "LOSS"}
                </span>
              </div>

              <h3
                className={`text-3xl font-black tracking-tight ${
                  netProfitLoss >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                ₹{netProfitLoss.toFixed(2)}
              </h3>

              <div className="mt-3 flex items-center justify-between text-xs text-white/60">
                <span>Calculation</span>
                <span className="font-semibold text-white/80">Net Selling Income − Expense</span>
              </div>

              <p className="mt-2 text-[11px] text-white/40">
                Period: {selectedMonth} {selectedYear}
              </p>
            </div>
          </div>

          {/* ── MONTH-WISE PROFIT & LOSS BREAKDOWN CARD (MATCHING USER SCREENSHOT DESIGN) ── */}
          <div className="rounded-3xl border border-white/10 bg-zinc-900/80 p-6 text-white shadow-2xl backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-black tracking-wide text-white uppercase flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  Month-Wise Profit & Loss Breakdown
                </h3>
                <p className="text-xs text-white/50">
                  Detailed selling income, deductions & expenses for {selectedMonth}, {selectedYear}
                </p>
              </div>
            </div>

            <div className="max-w-md">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4 hover:border-emerald-400/40 transition">
                {/* Month Tag Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-sm font-black tracking-wider text-white uppercase flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-emerald-400" />
                    {selectedMonth}, {selectedYear}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                      netProfitLoss >= 0
                        ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                        : "bg-rose-500/10 text-rose-300 border-rose-500/20"
                    }`}
                  >
                    {netProfitLoss >= 0 ? "PROFIT" : "LOSS"}
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
                      ₹{totalSaleReceived.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-white/60">Deductions (GST + Delivery)</span>
                    <span className="font-semibold text-amber-300">
                      ₹{totalSaleDeductions.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs border-t border-white/10 pt-1 font-bold">
                    <span className="text-white/80">Net Selling Income</span>
                    <span className="text-emerald-300">
                      ₹{netSaleIncome.toFixed(2)}
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
                      ₹{totalExpensesPaid.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Profit/Loss Bottom Bar */}
                <div className="rounded-xl border border-white/10 bg-black/40 p-3 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-white/70">
                    NET PROFIT / LOSS
                  </span>
                  <span
                    className={`text-sm font-black ${
                      netProfitLoss >= 0 ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    ₹{netProfitLoss.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── AUTOMATIC SALES DETAILS SECTION (VISIBLE WHEN SALES IS CLICKED) ── */}
          {showSalesDetails && (
            <div className="rounded-3xl border border-emerald-500/30 bg-zinc-900/90 p-6 text-white shadow-2xl backdrop-blur-xl space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-emerald-400 animate-ping" />
                    <h3 className="text-lg font-black tracking-wide text-white uppercase flex items-center gap-2">
                      Sales Details ({selectedMonth === "ALL" ? "All Months" : selectedMonth} {selectedYear === "ALL" ? "All Years" : selectedYear})
                    </h3>
                  </div>
                  <p className="text-xs text-white/50 mt-0.5">
                    Detailed transaction records for {selectedMonth}, {selectedYear} ({searchedSalesRecords.length} invoices logged)
                  </p>
                </div>

                {/* ACTION BUTTONS & SEARCH */}
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="relative flex items-center">
                    <Search className="absolute left-3 h-4 w-4 text-white/40" />
                    <input
                      type="text"
                      value={salesSearchQuery}
                      onChange={(e) => setSalesSearchQuery(e.target.value)}
                      placeholder="Search invoice, customer, item..."
                      className="rounded-xl border border-white/10 bg-white/5 pl-9 pr-4 py-2 text-xs text-white focus:border-emerald-400 focus:outline-none transition w-56 sm:w-64"
                    />
                  </div>

                  {/* DOWNLOAD XLSX BUTTON */}
                  <button
                    onClick={handleExportXLSX}
                    className="flex items-center gap-2 rounded-xl bg-emerald-400 px-4 py-2 text-xs font-black text-black hover:bg-emerald-300 transition shadow-lg hover:scale-105 active:scale-95"
                    title="Download Sales Details in Excel (.xlsx) Format"
                  >
                    <FileSpreadsheet className="h-4 w-4" /> Download XLSX
                  </button>
                </div>
              </div>

              {/* TABLE OF SALES DETAILS */}
              <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
                <table className="w-full text-left text-xs text-white">
                  <thead>
                    <tr className="border-b border-white/10 bg-zinc-950/90 text-[11px] font-bold uppercase tracking-wider text-emerald-400">
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
                      <th className="p-3 text-center">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {searchedSalesRecords.length > 0 ? (
                      searchedSalesRecords.map((row, idx) => (
                        <tr key={row.id || idx} className="hover:bg-white/5 transition">
                          <td className="p-3 font-bold text-white/40">{idx + 1}</td>
                          <td className="p-3 font-medium whitespace-nowrap">
                            <p className="font-semibold text-white">{row.date}</p>
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
                            <p className="text-[10px] text-white/50">Qty: {row.qty || 1}</p>
                          </td>
                          <td className="p-3 text-right font-medium">₹{Number(row.actualRate || 0).toFixed(2)}</td>
                          <td className="p-3 text-right text-amber-300 font-medium">₹{Number(row.gstAmount || 0).toFixed(2)}</td>
                          <td className="p-3 text-right text-cyan-300 font-medium">₹{Number(row.deliveryCharges || 0).toFixed(2)}</td>
                          <td className="p-3 text-right font-black text-emerald-400 text-sm">₹{Number(row.totalAmount || 0).toFixed(2)}</td>
                          <td className="p-3 text-center whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5">
                              {onViewPreview && (
                                <button
                                  onClick={() => onViewPreview(row)}
                                  className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-emerald-500/20 hover:text-emerald-300 transition"
                                  title="View / Print Printable Document"
                                >
                                  <ExternalLink className="h-3 w-3" /> Soft Bill
                                </button>
                              )}
                              {onEditIncome && (
                                <button
                                  onClick={() => onEditIncome(row)}
                                  className="inline-flex items-center gap-1 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-300 hover:bg-emerald-400 hover:text-black transition"
                                  title="Edit Sales Record"
                                >
                                  <Edit3 className="h-3 w-3" /> Edit
                                </button>
                              )}
                              {onDeleteIncome && (
                                <button
                                  onClick={() => onDeleteIncome(row.id)}
                                  className="rounded-xl border border-white/10 bg-white/5 p-1 text-white/40 hover:bg-rose-500/20 hover:text-rose-400 transition"
                                  title="Delete Income Record"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="11" className="p-8 text-center text-white/40">
                          No sales records found for {selectedMonth}, {selectedYear}.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
