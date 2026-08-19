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
      {/* ── FILTER HEADER BAR: SELECT YEAR & MONTH (WHITE CREME BROWN) ── */}
      <div className="rounded-3xl border border-amber-900/15 bg-white p-6 text-stone-900 shadow-xl shadow-stone-200/50 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#8B5E3C] font-extrabold text-xs uppercase tracking-widest">
            <Filter className="h-4 w-4" /> Financial Report Selector
          </div>
          <h2 className="text-xl font-black text-amber-950 tracking-wide mt-1">
            Select Year & Month to View Report
          </h2>
          <p className="text-xs text-stone-600 font-medium">
            First select year, then select month to view sales, expenses, net profit & sales details
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* STEP 1: YEAR SELECTOR */}
          <div className={`flex items-center gap-2 rounded-2xl border px-4 py-2.5 transition ${
            selectedYear ? "border-amber-700 bg-amber-100/50 text-amber-950" : "border-stone-300 bg-[#F7F3ED] text-stone-700"
          }`}>
            <Calendar className="h-4 w-4 text-[#8B5E3C]" />
            <span className="text-xs font-bold">1. Select Year:</span>
            <select
              value={selectedYear}
              onChange={handleYearChange}
              className="bg-transparent text-xs font-black text-amber-950 focus:outline-none cursor-pointer"
            >
              <option value="" className="bg-white text-stone-500">-- Select Year --</option>
              <option value="ALL" className="bg-white text-stone-900">ALL YEARS</option>
              {availableYears.map((yr) => (
                <option key={yr} value={yr} className="bg-white text-stone-900">
                  {yr}
                </option>
              ))}
            </select>
            <ChevronDown className="h-3.5 w-3.5 text-stone-500" />
          </div>

          {/* STEP 2: MONTH SELECTOR */}
          <div className={`flex items-center gap-2 rounded-2xl border px-4 py-2.5 transition ${
            selectedMonth ? "border-amber-700 bg-amber-100/50 text-amber-950" : "border-stone-300 bg-[#F7F3ED] text-stone-700"
          }`}>
            <Calendar className="h-4 w-4 text-[#8B5E3C]" />
            <span className="text-xs font-bold">2. Select Month:</span>
            <select
              value={selectedMonth}
              onChange={handleMonthChange}
              className="bg-transparent text-xs font-black text-amber-950 focus:outline-none cursor-pointer"
            >
              <option value="" className="bg-white text-stone-500">-- Select Month --</option>
              <option value="ALL" className="bg-white text-stone-900">ALL MONTHS</option>
              {MONTH_NAMES.map((m) => (
                <option key={m} value={m} className="bg-white text-stone-900">
                  {m}
                </option>
              ))}
            </select>
            <ChevronDown className="h-3.5 w-3.5 text-stone-500" />
          </div>
        </div>
      </div>

      {/* ── PROMPT BANNER WHEN YEAR OR MONTH IS NOT YET SELECTED ── */}
      {!isPeriodSelected && (
        <div className="rounded-3xl border border-dashed border-amber-900/20 bg-white/80 p-12 text-center text-stone-900 space-y-3 shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-900 border border-amber-200 shadow-inner">
            <Info className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-bold text-amber-950">Please Select Year & Month</h3>
          <p className="text-xs text-stone-600 max-w-md mx-auto font-medium">
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
              className={`text-left rounded-3xl border transition-all duration-300 p-6 text-stone-900 shadow-xl group relative overflow-hidden ${
                showSalesDetails
                  ? "border-amber-700 bg-gradient-to-br from-amber-100/80 via-white to-white ring-2 ring-amber-700/30"
                  : "border-amber-900/15 bg-gradient-to-br from-amber-50 via-white to-white hover:border-amber-700/50"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                  <ArrowDownLeft className="h-4 w-4" /> TOTAL SALE
                </span>
                <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border transition ${
                  showSalesDetails
                    ? "bg-[#6B4226] text-white border-[#6B4226] font-bold"
                    : "bg-amber-100 text-amber-900 border-amber-300 group-hover:bg-[#6B4226] group-hover:text-white"
                }`}>
                  {showSalesDetails ? "DETAILS OPEN ▼" : "CLICK FOR DETAILS ➔"}
                </span>
              </div>

              <h3 className="text-3xl font-black tracking-tight text-amber-950">
                ₹{totalSaleReceived.toFixed(2)}
              </h3>

              <div className="mt-3 flex items-center justify-between text-xs text-stone-600 font-medium">
                <span>{filteredIncomeRecords.length} Sales Invoices</span>
                <span className="text-emerald-700 font-bold">Net: ₹{netSaleIncome.toFixed(2)}</span>
              </div>

              <p className="mt-2 text-[11px] text-[#8B5E3C] font-bold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-700 animate-pulse" />
                Click sales card to view/hide sales details
              </p>
            </button>

            {/* CARD 2: TOTAL EXPENSE */}
            <div className="rounded-3xl border border-rose-900/15 bg-gradient-to-br from-rose-50 via-white to-white p-6 text-stone-900 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-extrabold uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                  <ArrowUpRight className="h-4 w-4" /> TOTAL EXPENSE
                </span>
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-rose-100 text-rose-700 border border-rose-200">
                  <Receipt className="h-4 w-4" />
                </div>
              </div>

              <h3 className="text-3xl font-black tracking-tight text-amber-950">
                ₹{totalExpensesPaid.toFixed(2)}
              </h3>

              <div className="mt-3 flex items-center justify-between text-xs text-stone-600 font-medium">
                <span>{filteredExpenseRecords.length} Expense Bills Paid</span>
                <span className="text-rose-700 font-bold">Period Expenses</span>
              </div>

              <p className="mt-2 text-[11px] text-stone-500 font-medium">
                Total operating & material expenses paid
              </p>
            </div>

            {/* CARD 3: TOTAL PROFIT / LOSS */}
            <div className="rounded-3xl border border-amber-900/15 bg-gradient-to-br from-amber-50 via-white to-white p-6 text-stone-900 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#8B5E3C] flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4" /> TOTAL PROFIT
                </span>
                <span
                  className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full border ${
                    netProfitLoss >= 0
                      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                      : "bg-rose-100 text-rose-800 border-rose-300"
                  }`}
                >
                  {netProfitLoss >= 0 ? "PROFIT" : "LOSS"}
                </span>
              </div>

              <h3
                className={`text-3xl font-black tracking-tight ${
                  netProfitLoss >= 0 ? "text-emerald-700" : "text-rose-700"
                }`}
              >
                ₹{netProfitLoss.toFixed(2)}
              </h3>

              <div className="mt-3 flex items-center justify-between text-xs text-stone-600 font-medium">
                <span>Calculation</span>
                <span className="font-semibold text-stone-900">Net Selling Income − Expense</span>
              </div>

              <p className="mt-2 text-[11px] text-stone-500 font-medium">
                Period: {selectedMonth} {selectedYear}
              </p>
            </div>
          </div>

          {/* ── MONTH-WISE PROFIT & LOSS BREAKDOWN CARD (WHITE CREME BROWN DESIGN) ── */}
          <div className="rounded-3xl border border-amber-900/15 bg-white p-6 text-stone-900 shadow-xl shadow-stone-200/50 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div>
                <h3 className="text-lg font-black tracking-wide text-amber-950 uppercase flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-700" />
                  Month-Wise Profit & Loss Breakdown
                </h3>
                <p className="text-xs text-stone-600 font-medium">
                  Detailed selling income, deductions & expenses for {selectedMonth}, {selectedYear}
                </p>
              </div>
            </div>

            <div className="max-w-md">
              <div className="rounded-2xl border border-amber-900/15 bg-[#FDFBF7] p-5 space-y-4 shadow-sm hover:border-amber-700/40 transition">
                {/* Month Tag Header */}
                <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                  <span className="text-sm font-black tracking-wider text-amber-950 uppercase flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#8B5E3C]" />
                    {selectedMonth}, {selectedYear}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                      netProfitLoss >= 0
                        ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                        : "bg-rose-100 text-rose-800 border-rose-300"
                    }`}
                  >
                    {netProfitLoss >= 0 ? "PROFIT" : "LOSS"}
                  </span>
                </div>

                {/* Income Section */}
                <div className="space-y-2 border-l-2 border-emerald-600 pl-3">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">
                    INCOME
                  </p>
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-stone-600">Total Received</span>
                    <span className="font-bold text-stone-900">
                      ₹{totalSaleReceived.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-stone-600">Deductions (GST + Delivery)</span>
                    <span className="font-semibold text-amber-800">
                      ₹{totalSaleDeductions.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs border-t border-stone-200 pt-1 font-bold">
                    <span className="text-stone-800">Net Selling Income</span>
                    <span className="text-emerald-700">
                      ₹{netSaleIncome.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Expense Section */}
                <div className="space-y-2 border-l-2 border-rose-600 pl-3">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-rose-700">
                    EXPENSE
                  </p>
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-stone-600">Total Expenses Paid</span>
                    <span className="font-bold text-rose-700">
                      ₹{totalExpensesPaid.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Profit/Loss Bottom Bar */}
                <div className="rounded-xl border border-amber-900/10 bg-[#F5F0EB] p-3 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-950">
                    NET PROFIT / LOSS
                  </span>
                  <span
                    className={`text-sm font-black ${
                      netProfitLoss >= 0 ? "text-emerald-700" : "text-rose-700"
                    }`}
                  >
                    ₹{netProfitLoss.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── AUTOMATIC SALES DETAILS SECTION (WHITE CREME BROWN DESIGN) ── */}
          {showSalesDetails && (
            <div className="rounded-3xl border border-amber-900/15 bg-white p-6 text-stone-900 shadow-xl shadow-stone-200/50 space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-amber-700 animate-ping" />
                    <h3 className="text-lg font-black tracking-wide text-amber-950 uppercase flex items-center gap-2">
                      Sales Details ({selectedMonth === "ALL" ? "All Months" : selectedMonth} {selectedYear === "ALL" ? "All Years" : selectedYear})
                    </h3>
                  </div>
                  <p className="text-xs text-stone-600 font-medium mt-0.5">
                    Detailed transaction records for {selectedMonth}, {selectedYear} ({searchedSalesRecords.length} invoices logged)
                  </p>
                </div>

                {/* ACTION BUTTONS & SEARCH */}
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="relative flex items-center">
                    <Search className="absolute left-3 h-4 w-4 text-stone-400" />
                    <input
                      type="text"
                      value={salesSearchQuery}
                      onChange={(e) => setSalesSearchQuery(e.target.value)}
                      placeholder="Search invoice, customer, item..."
                      className="rounded-xl border border-stone-300 bg-[#F7F3ED] pl-9 pr-4 py-2 text-xs text-stone-900 focus:border-amber-700 focus:outline-none transition w-56 sm:w-64 font-medium"
                    />
                  </div>

                  {/* DOWNLOAD XLSX BUTTON */}
                  <button
                    onClick={handleExportXLSX}
                    className="flex items-center gap-2 rounded-xl bg-[#6B4226] px-4 py-2 text-xs font-black text-white hover:bg-[#52331C] transition shadow-md hover:scale-105 active:scale-95"
                    title="Download Sales Details in Excel (.xlsx) Format"
                  >
                    <FileSpreadsheet className="h-4 w-4" /> Download XLSX
                  </button>
                </div>
              </div>

              {/* TABLE OF SALES DETAILS */}
              <div className="overflow-x-auto rounded-2xl border border-amber-900/15 bg-white shadow-sm">
                <table className="w-full text-left text-xs text-stone-900">
                  <thead>
                    <tr className="border-b border-amber-950 bg-[#3B2314] text-[11px] font-bold uppercase tracking-wider text-amber-100">
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
                  <tbody className="divide-y divide-stone-200">
                    {searchedSalesRecords.length > 0 ? (
                      searchedSalesRecords.map((row, idx) => (
                        <tr key={row.id || idx} className="hover:bg-amber-50/60 transition">
                          <td className="p-3 font-bold text-stone-500">{idx + 1}</td>
                          <td className="p-3 font-medium whitespace-nowrap">
                            <p className="font-bold text-stone-900">{row.date}</p>
                            <p className="text-[10px] text-stone-500">{row.month}, {row.year}</p>
                          </td>
                          <td className="p-3 font-mono font-black text-[#6B4226]">{row.invoiceNo}</td>
                          <td className="p-3">
                            <span className="rounded-lg border border-amber-300 bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                              {row.paymentMode}
                            </span>
                          </td>
                          <td className="p-3">
                            <p className="font-bold text-stone-900">{row.customerName}</p>
                            <p className="text-[10px] text-stone-600">{row.customerPhone} | {row.customerEmail}</p>
                            <p className="text-[10px] text-stone-500 truncate max-w-xs">{row.customerAddress}</p>
                          </td>
                          <td className="p-3">
                            <p className="font-semibold text-stone-800">{row.description}</p>
                            <p className="text-[10px] text-stone-500">Qty: {row.qty || 1}</p>
                          </td>
                          <td className="p-3 text-right font-medium">₹{Number(row.actualRate || 0).toFixed(2)}</td>
                          <td className="p-3 text-right text-amber-800 font-bold">₹{Number(row.gstAmount || 0).toFixed(2)}</td>
                          <td className="p-3 text-right text-teal-800 font-bold">₹{Number(row.deliveryCharges || 0).toFixed(2)}</td>
                          <td className="p-3 text-right font-black text-emerald-700 text-sm">₹{Number(row.totalAmount || 0).toFixed(2)}</td>
                          <td className="p-3 text-center whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5">
                              {onViewPreview && (
                                <button
                                  onClick={() => onViewPreview(row)}
                                  className="inline-flex items-center gap-1 rounded-xl border border-stone-300 bg-[#F7F3ED] px-2.5 py-1 text-[11px] font-bold text-stone-800 hover:bg-stone-200 transition"
                                  title="View / Print Printable Document"
                                >
                                  <ExternalLink className="h-3 w-3" /> Soft Bill
                                </button>
                              )}
                              {onEditIncome && (
                                <button
                                  onClick={() => onEditIncome(row)}
                                  className="inline-flex items-center gap-1 rounded-xl border border-amber-800/30 bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-900 hover:bg-[#6B4226] hover:text-white transition"
                                  title="Edit Sales Record"
                                >
                                  <Edit3 className="h-3 w-3" /> Edit
                                </button>
                              )}
                              {onDeleteIncome && (
                                <button
                                  onClick={() => onDeleteIncome(row.id)}
                                  className="rounded-xl border border-stone-300 bg-white p-1 text-stone-500 hover:bg-rose-100 hover:text-rose-700 transition"
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
                        <td colSpan="11" className="p-8 text-center text-stone-500 font-medium">
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
