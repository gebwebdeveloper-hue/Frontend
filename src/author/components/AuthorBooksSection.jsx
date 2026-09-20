import { useState } from "react";
import {
  Printer,
  BookOpen,
  Eye,
  X,
  DollarSign,
  FileText,
  Layers,
  ExternalLink,
  Truck
} from "lucide-react";

export default function AuthorBooksSection({ books = [], primaryBook, authInfo = {}, handleRequestReprint }) {
  const displayBooks = Array.isArray(books) && books.length > 0 ? books : [primaryBook];
  const [selectedBookForDetails, setSelectedBookForDetails] = useState(null);

  // Compute financial metrics for a specific book or fallback to author's account
  const getBookFinancials = (bk) => {
    const planAmount = bk?.planAmount !== undefined ? bk.planAmount : (authInfo.planAmount !== undefined ? authInfo.planAmount : 1212);
    const amountPaid = bk?.amountPaid !== undefined ? bk.amountPaid : (authInfo.amountPaid !== undefined ? authInfo.amountPaid : (authInfo.planPaid || 0));
    const pendingPayment = bk?.planPending !== undefined ? bk.planPending : Math.max(0, planAmount - amountPaid);
    const status = bk?.publishingPaymentStatus || authInfo.publishingPaymentStatus || "PAID";
    return { planAmount, amountPaid, pendingPayment, status };
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#0e0e14] border border-[#1f1f2e] rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex flex-wrap justify-between items-center gap-3">
          <div>
            <h3 className="font-serif text-xl font-extrabold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#f3c06b]" />
              <span>My Published Books & Inventory</span>
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Click on any book below to view its full details, pages, ISBN, stock, and payment breakdown.
            </p>
          </div>
          <span className="px-3.5 py-1 bg-[#181824] text-[#f3c06b] border border-[#2d2d3e] text-xs font-bold rounded-xl shadow">
            {displayBooks.length} {displayBooks.length === 1 ? "Book" : "Books"} Found
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#222232] text-gray-400 uppercase tracking-wider text-[11px]">
                <th className="pb-3 font-semibold">Book Title</th>
                <th className="pb-3 font-semibold">Price (₹)</th>
                <th className="pb-3 font-semibold">ISBN / Slug</th>
                <th className="pb-3 font-semibold">Printed</th>
                <th className="pb-3 font-semibold">Sold</th>
                <th className="pb-3 font-semibold">Current Stock</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#181824]">
              {displayBooks.map((bk, i) => (
                <tr
                  key={bk._id || i}
                  onClick={() => setSelectedBookForDetails(bk)}
                  className="hover:bg-[#151522] transition cursor-pointer group"
                  title="Click to view full book specifications, pages, and payment breakdown"
                >
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      {bk.coverUrl ? (
                        <img
                          src={bk.coverUrl}
                          alt={bk.title}
                          className="w-10 h-14 object-cover rounded-lg border border-[#2d2d3e] shadow group-hover:border-[#c8923a]/60 transition shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-14 bg-[#1c1c28] border border-[#2d2d3e] rounded-lg flex items-center justify-center text-[#f3c06b] shrink-0 group-hover:border-[#c8923a]/60 transition">
                          <BookOpen className="w-5 h-5 text-[#f3c06b]" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-bold text-white text-sm group-hover:text-[#f3c06b] transition truncate">
                          {bk.title}
                        </p>
                        <p className="text-[11px] text-gray-400">
                          {bk.publisher || "Lekhok Tripura Publication"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 font-bold text-[#f3c06b]">
                    {bk.price ? `₹${bk.price}` : (bk.paperbackPrice ? `₹${bk.paperbackPrice}` : "—")}
                  </td>
                  <td className="py-4 text-gray-400 font-mono text-[11px]">{bk.isbn || bk.slug || "—"}</td>
                  <td className="py-4 text-gray-300 font-medium">{bk.copiesPrinted || 50}</td>
                  <td className="py-4 text-gray-300 font-medium">{bk.copiesSold || 0}</td>
                  <td className="py-4 text-gray-300 font-medium">{bk.currentStock !== undefined ? bk.currentStock : 50}</td>
                  <td className="py-4">
                    <span className={`px-3 py-1 text-[10px] font-extrabold rounded-lg border ${
                      bk.stockStatus === "LOW STOCK"
                        ? "bg-amber-950/80 text-amber-400 border-amber-800"
                        : "bg-emerald-950/80 text-emerald-400 border-emerald-800"
                    }`}>
                      {bk.stockStatus || "IN STOCK"}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => setSelectedBookForDetails(bk)}
                        className="px-3 py-1.5 bg-[#14141e] border border-[#c8923a]/40 hover:border-[#f3c06b] text-[#f3c06b] hover:text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
                        title="View Book Specifications & Payment Breakdown"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Details</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRequestReprint(bk.title)}
                        className="px-3 py-1.5 bg-[#161622] border border-[#333348] hover:bg-[#202030] text-gray-200 text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
                        title="Request additional print copies"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Reprint</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─────────── ULTRA-LUXURY BOOK & FINANCIAL DETAILS MODAL ─────────── */}
      {selectedBookForDetails && (() => {
        const bk = selectedBookForDetails;
        const fin = getBookFinancials(bk);

        return (
          <div
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6"
            onClick={() => setSelectedBookForDetails(null)}
          >
            <div
              className="bg-[#0b0b10] border border-[#c8923a]/50 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedBookForDetails(null)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-[#181824]/90 backdrop-blur border border-white/10 hover:border-[#c8923a] text-gray-400 hover:text-white transition cursor-pointer shadow-md"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Scrollable Modal Content with min-h-0 */}
              <div
                className="p-6 md:p-8 space-y-6 overflow-y-auto flex-1 min-h-0 overscroll-contain"
                style={{ scrollbarWidth: "thin", scrollbarColor: "#c8923a #12121c" }}
              >

              {/* Book Header Overview */}
              <div className="flex gap-4 items-start pr-8">
                {bk.coverUrl ? (
                  <img
                    src={bk.coverUrl}
                    alt={bk.title}
                    className="w-20 h-28 object-cover rounded-xl border border-[#c8923a]/50 shadow-xl shrink-0"
                  />
                ) : (
                  <div className="w-20 h-28 rounded-xl bg-[#14141e] border border-[#c8923a]/40 flex items-center justify-center text-[#f3c06b] shrink-0 shadow-lg">
                    <BookOpen className="w-8 h-8" />
                  </div>
                )}
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 bg-[#181824] border border-[#c8923a]/40 text-[#f3c06b] text-[10px] font-extrabold uppercase rounded-md tracking-wider">
                      {bk.category || "Book Publication"}
                    </span>
                    <span className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-md border ${
                      bk.stockStatus === "LOW STOCK"
                        ? "bg-amber-950/80 text-amber-400 border-amber-800"
                        : "bg-emerald-950/80 text-emerald-400 border-emerald-800"
                    }`}>
                      {bk.stockStatus || "IN STOCK"}
                    </span>
                  </div>

                  <h3 className="font-serif text-xl md:text-2xl font-extrabold text-white leading-tight">
                    {bk.title}
                  </h3>

                  <p className="text-xs text-gray-400 font-medium">
                    Published by <strong className="text-gray-200">Lekhok Tripura Publication</strong> • Author: <strong className="text-[#f3c06b]">{authInfo.name || "Author"}</strong>
                  </p>
                </div>
              </div>

              {/* ─────────── FINANCIAL PAYMENT BREAKDOWN (Requested by User) ─────────── */}
              <div className="bg-gradient-to-b from-[#141420] to-[#0e0e16] border border-[#c8923a]/40 rounded-2xl p-5 space-y-3.5 shadow-inner">
                <div className="flex items-center justify-between border-b border-[#242436] pb-2.5">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-[#f3c06b]" />
                    <h4 className="font-serif text-sm font-extrabold text-white uppercase tracking-wider">
                      Publishing Plan & Payment Breakdown
                    </h4>
                  </div>
                  <span className={`px-2.5 py-0.5 text-[10px] font-black rounded-lg border ${
                    fin.status === "PAID" || fin.status === "Paid"
                      ? "bg-emerald-950/80 text-emerald-400 border-emerald-800"
                      : "bg-amber-950/80 text-amber-400 border-amber-800"
                  }`}>
                    {fin.status}
                  </span>
                </div>

                {/* 3 Prominent Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-[#08080c] border border-[#222232] p-3.5 rounded-xl text-center space-y-1">
                    <p className="text-[11px] text-gray-400 font-medium">Total Amount</p>
                    <p className="text-lg font-black text-white font-serif">₹{fin.planAmount}</p>
                    <p className="text-[10px] text-gray-500">Package Fee</p>
                  </div>

                  <div className="bg-[#08080c] border border-emerald-900/50 p-3.5 rounded-xl text-center space-y-1">
                    <p className="text-[11px] text-emerald-400 font-medium">Paid Till Now</p>
                    <p className="text-lg font-black text-emerald-400 font-serif">₹{fin.amountPaid}</p>
                    <p className="text-[10px] text-emerald-500/70">Payment Received</p>
                  </div>

                  <div className="bg-[#08080c] border border-amber-900/50 p-3.5 rounded-xl text-center space-y-1">
                    <p className="text-[11px] text-amber-400 font-medium">Pending Payment</p>
                    <p className="text-lg font-black text-amber-400 font-serif">₹{fin.pendingPayment}</p>
                    <p className="text-[10px] text-amber-500/70">Due Balance</p>
                  </div>
                </div>

                {(bk.paymentDate || authInfo.paymentDate || bk.invoiceUrl || authInfo.invoiceUrl) && (
                  <div className="pt-2 border-t border-[#1e1e2d] flex flex-wrap items-center justify-between gap-2 text-xs text-gray-400">
                    {(bk.paymentDate || authInfo.paymentDate) && (
                      <p>
                        Payment Date: <strong className="text-white">{bk.paymentDate || authInfo.paymentDate}</strong>
                      </p>
                    )}
                    {(bk.invoiceUrl || authInfo.invoiceUrl) && (
                      <a
                        href={bk.invoiceUrl || authInfo.invoiceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#f3c06b] hover:text-white font-bold flex items-center gap-1 transition underline"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Official Invoice</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* ─────────── SPECIFICATIONS & PAGE DETAILS (Requested by User) ─────────── */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#f3c06b]" />
                  <h4 className="font-serif text-sm font-extrabold text-white uppercase tracking-wider">
                    Book Specifications & Details
                  </h4>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-[#12121c] border border-[#222232] p-3 rounded-xl">
                    <p className="text-[11px] text-gray-400">ISBN / Book ID</p>
                    <p className="font-mono font-bold text-[#f3c06b] mt-0.5 truncate" title={bk.isbn || bk.slug || "—"}>
                      {bk.isbn || bk.slug || "—"}
                    </p>
                  </div>

                  <div className="bg-[#12121c] border border-[#222232] p-3 rounded-xl">
                    <p className="text-[11px] text-gray-400">Total Book Pages</p>
                    <p className="font-bold text-white mt-0.5 text-sm">
                      {bk.pages || authInfo.pageCount || 120} <span className="text-xs font-normal text-gray-400">Pages</span>
                    </p>
                  </div>

                  <div className="bg-[#12121c] border border-[#222232] p-3 rounded-xl">
                    <p className="text-[11px] text-gray-400">Price / Format</p>
                    <p className="font-bold text-[#f3c06b] mt-0.5">
                      ₹{bk.paperbackPrice || bk.price || 299} <span className="text-[10px] text-gray-400">(Paperback)</span>
                    </p>
                  </div>

                  <div className="bg-[#12121c] border border-[#222232] p-3 rounded-xl">
                    <p className="text-[11px] text-gray-400">Total Printed</p>
                    <p className="font-bold text-white mt-0.5 text-sm">
                      {bk.copiesPrinted || 50} <span className="text-xs font-normal text-gray-400">Copies</span>
                    </p>
                  </div>

                  <div className="bg-[#12121c] border border-[#222232] p-3 rounded-xl">
                    <p className="text-[11px] text-gray-400">Copies Sold</p>
                    <p className="font-bold text-emerald-400 mt-0.5 text-sm">
                      {bk.copiesSold || 0} <span className="text-xs font-normal text-gray-400">Copies</span>
                    </p>
                  </div>

                  <div className="bg-[#12121c] border border-[#222232] p-3 rounded-xl">
                    <p className="text-[11px] text-gray-400">Available Stock</p>
                    <p className="font-bold text-[#f3c06b] mt-0.5 text-sm">
                      {bk.currentStock !== undefined ? bk.currentStock : 50} <span className="text-xs font-normal text-gray-400">Copies</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Synopsis / Description */}
              {bk.description && (
                <div className="bg-[#101018] border border-[#1f1f2e] p-4 rounded-2xl space-y-1">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Book Synopsis</p>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    {bk.description}
                  </p>
                </div>
              )}

              {/* Delivery info if available */}
              {(bk.courierPartner || authInfo.courierPartner || bk.trackingNumber || authInfo.trackingNumber) && (
                <div className="bg-[#101018] border border-[#1f1f2e] p-3.5 rounded-2xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#f3c06b]" />
                    <div>
                      <p className="font-bold text-white">Delivery Courier</p>
                      <p className="text-[11px] text-gray-400">
                        {bk.courierPartner || authInfo.courierPartner || "Delhivery / DTDC"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right font-mono text-gray-300">
                    <p className="text-[10px] text-gray-500">Tracking No</p>
                    <p className="font-bold text-[#f3c06b]">{bk.trackingNumber || authInfo.trackingNumber || "—"}</p>
                  </div>
                </div>
              )}

              </div>

              {/* Sticky Modal Actions Footer */}
              <div className="flex justify-between items-center gap-3 p-4 sm:p-5 bg-[#0e0e16]/95 backdrop-blur border-t border-[#1f1f2e] shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    handleRequestReprint(bk.title);
                    setSelectedBookForDetails(null);
                  }}
                  className="px-5 py-2.5 bg-[#181826] hover:bg-[#222234] border border-[#c8923a]/50 text-[#f3c06b] hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Printer className="w-4 h-4" />
                  <span>Request Reprint</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedBookForDetails(null)}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#d99b38] to-[#f3c06b] hover:from-[#e5a845] hover:to-[#fbd080] text-black font-extrabold text-xs rounded-xl shadow-lg transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
