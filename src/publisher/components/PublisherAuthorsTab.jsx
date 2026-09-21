import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  UserPlus,
  BookOpen,
  Edit3,
  Trash2,
  PlusCircle,
  ExternalLink,
  ArrowLeft,
  Search,
  Eye,
  ChevronDown,
  Link2,
  PackageCheck,
  Layers
} from "lucide-react";

export default function PublisherAuthorsTab({
  rawAuthors = [],
  viewingAuthor,
  setViewingAuthor,
  authorBooksList = [],
  loadingAuthorBooks,
  authorBooksSearch,
  setAuthorBooksSearch,
  recentSales = [],
  onOpenAddAuthor,
  onOpenEditAuthor,
  onOpenWorkflowModal,
  onDeleteAuthor,
  onOpenAuthorBooks,
  onOpenAddSaleForAuthor,
  onOpenEditSale,
  onDeleteSale,
  onOpenLinksModal,
  onQuickSaleForBook,
  getAuthorWorkflowSteps
}) {
  const [activePreviewMenuId, setActivePreviewMenuId] = useState(null);

  // IF VIEWING A SPECIFIC AUTHOR'S BOOKS
  if (viewingAuthor) {
    const authorWorkflowSteps = getAuthorWorkflowSteps ? getAuthorWorkflowSteps(viewingAuthor) : [];

    return (
      <div className="space-y-6">
        {/* Top Navigation & Action Banner */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0e0e14] p-6 rounded-3xl border border-[#c8923a]/30 shadow-xl">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setViewingAuthor(null)}
              className="p-2.5 bg-[#161622] hover:bg-[#202030] border border-white/10 hover:border-[#c8923a]/40 text-[#f3c06b] rounded-xl font-bold transition flex items-center gap-2 text-xs cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to All Authors</span>
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-2xl font-extrabold text-white">{viewingAuthor.name}</h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                    viewingAuthor.status === "PAID"
                      ? "bg-emerald-950/80 text-emerald-400 border-emerald-800"
                      : "bg-amber-950/80 text-amber-400 border-amber-800"
                  }`}
                >
                  {viewingAuthor.status || "PENDING"}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5 font-mono">
                {viewingAuthor.email} • {viewingAuthor.phone || "No phone"} • {viewingAuthor.selectedPlan || "Standard Plan"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to={`/author/${encodeURIComponent(viewingAuthor.name)}`}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 bg-[#161622] hover:bg-[#202030] border border-[#c8923a]/40 text-xs font-bold text-[#f3c06b] rounded-xl transition flex items-center gap-1.5 shadow"
            >
              <span>Public Storefront</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <button
              type="button"
              onClick={() => onOpenEditAuthor && onOpenEditAuthor(viewingAuthor)}
              className="px-3.5 py-2 bg-[#161622] hover:bg-[#202030] border border-[#c8923a]/50 text-xs font-bold text-[#f3c06b] hover:text-white rounded-xl transition flex items-center gap-1.5 shadow cursor-pointer"
              title="Edit Author Name, Email, Phone, Plan & Password"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#f3c06b]" />
              <span>Edit Author Details</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenWorkflowModal && onOpenWorkflowModal(viewingAuthor)}
              className="px-3.5 py-2 bg-[#161622] hover:bg-[#202030] border border-[#333348] text-xs text-gray-200 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#f3c06b]" />
              <span>Edit 9-Step Progress</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenAddSaleForAuthor && onOpenAddSaleForAuthor(viewingAuthor)}
              className="px-3.5 py-2 bg-gradient-to-r from-[#d99b38] to-[#f3c06b] hover:from-[#e5a845] hover:to-[#fbd080] text-black text-xs font-extrabold rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Record Sale</span>
            </button>
          </div>
        </div>

        {/* Financial & Publication Metrics Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#0e0e14] border border-[#1f1f2e] p-4 rounded-2xl">
            <p className="text-gray-400 text-xs font-medium mb-1">Total Books Associated</p>
            <h4 className="text-2xl font-extrabold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#f3c06b]" />
              <span>{authorBooksList.length}</span>
            </h4>
          </div>

          <div className="bg-[#0e0e14] border border-[#1f1f2e] p-4 rounded-2xl">
            <p className="text-gray-400 text-xs font-medium mb-1">Plan Fee (₹)</p>
            <h4 className="text-2xl font-extrabold text-[#f3c06b]">
              ₹{Number(viewingAuthor.planAmount || 0).toFixed(2)}
            </h4>
            <p className="text-[11px] text-emerald-400 mt-0.5">
              Paid: ₹{Number(viewingAuthor.planPaid || 0).toFixed(2)}
            </p>
          </div>

          <div className="bg-[#0e0e14] border border-[#1f1f2e] p-4 rounded-2xl">
            <p className="text-gray-400 text-xs font-medium mb-1">Royalty Earned</p>
            <h4 className="text-2xl font-extrabold text-emerald-400">
              ₹{Number(viewingAuthor.royaltyEarned || 0).toFixed(2)}
            </h4>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Paid: ₹{Number(viewingAuthor.royaltyPaid || 0).toFixed(2)}
            </p>
          </div>

          <div className="bg-[#0e0e14] border border-[#1f1f2e] p-4 rounded-2xl">
            <p className="text-gray-400 text-xs font-medium mb-1">Total Outstanding Pending</p>
            <h4 className="text-2xl font-extrabold text-amber-400">
              ₹{Number(viewingAuthor.totalPending || 0).toFixed(2)}
            </h4>
            <p className="text-[11px] text-amber-500/80 mt-0.5">Due to/from author</p>
          </div>
        </div>

        {/* 9-Step Publishing Workflow Progress Banner */}
        <div className="bg-[#0e0e14] border border-[#1f1f2e] rounded-3xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-[#1c1c28] pb-3">
            <div className="flex items-center gap-2">
              <PackageCheck className="w-4 h-4 text-[#f3c06b]" />
              <h4 className="font-serif text-sm font-bold text-white uppercase tracking-wider">
                9-Step Publishing Workflow Progress
              </h4>
            </div>
            <button
              type="button"
              onClick={() => onOpenWorkflowModal && onOpenWorkflowModal(viewingAuthor)}
              className="text-xs font-bold text-[#f3c06b] hover:text-white flex items-center gap-1 transition cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Update Progress</span>
            </button>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2 pt-1">
            {authorWorkflowSteps.map((step) => {
              const isCompleted = step.status === "COMPLETED";
              const isInProgress = step.status === "IN_PROGRESS";
              return (
                <div
                  key={step.stepNumber}
                  className={`p-2.5 rounded-xl border text-center transition ${
                    isCompleted
                      ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-300"
                      : isInProgress
                      ? "bg-cyan-950/30 border-cyan-500/40 text-cyan-300 animate-pulse"
                      : "bg-[#08080c] border-[#1e1e2d] text-gray-400"
                  }`}
                >
                  <p className="text-[10px] font-bold opacity-75">{step.stepNumber}.</p>
                  <p className="text-[11px] font-extrabold truncate mt-0.5" title={step.name}>
                    {step.name}
                  </p>
                  <span
                    className={`inline-block mt-1 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                      isCompleted
                        ? "bg-emerald-500/20 text-emerald-300"
                        : isInProgress
                        ? "bg-cyan-500/20 text-cyan-300"
                        : "bg-gray-800 text-gray-400"
                    }`}
                  >
                    {step.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Books Catalog for this Author */}
        <div className="bg-[#0e0e14] border border-[#1f1f2e] rounded-3xl p-6 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1c1c28] pb-4">
            <div>
              <h3 className="font-serif text-xl font-extrabold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#f3c06b]" />
                <span>Books by {viewingAuthor.name}</span>
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                List of all eBook, Paperback, and published titles in catalog for this author.
              </p>
            </div>

            {/* Search Filter */}
            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={authorBooksSearch}
                onChange={(e) => setAuthorBooksSearch(e.target.value)}
                placeholder="Search this author's books..."
                className="w-full bg-[#08080c] border border-[#242432] focus:border-[#c8923a] pl-8 pr-3 py-2 rounded-xl text-xs text-white placeholder:text-gray-500 outline-none"
              />
            </div>
          </div>

          {loadingAuthorBooks ? (
            <div className="py-12 text-center text-gray-400 text-xs animate-pulse">
              Loading books for {viewingAuthor.name}...
            </div>
          ) : authorBooksList.length === 0 ? (
            <div className="p-10 text-center bg-[#09090e] border border-[#181824] rounded-2xl space-y-3">
              <BookOpen className="w-10 h-10 text-gray-600 mx-auto" />
              <div>
                <p className="text-sm font-bold text-gray-300">No Published Books Found Yet</p>
                <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                  No active catalog titles matched "{viewingAuthor.name}". You can record sales transactions or create new book titles in the Admin Books Manager.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {authorBooksList
                .filter((b) =>
                  !authorBooksSearch.trim() ||
                  b.title?.toLowerCase().includes(authorBooksSearch.toLowerCase()) ||
                  b.category?.toLowerCase().includes(authorBooksSearch.toLowerCase())
                )
                .map((bk, i) => (
                  <div
                    key={bk._id || i}
                    className="bg-[#08080d] border border-[#1e1e2d] hover:border-[#c8923a]/40 rounded-2xl p-4 flex flex-col justify-between space-y-3 transition duration-200 shadow-md group"
                  >
                    <div className="flex gap-3.5 items-start">
                      {bk.cover?.url || bk.coverUrl ? (
                        <img
                          src={bk.cover?.url || bk.coverUrl}
                          alt={bk.title}
                          className="w-16 h-22 object-cover rounded-xl border border-[#2a2a3a] shrink-0 shadow"
                        />
                      ) : (
                        <div className="w-16 h-22 rounded-xl bg-gradient-to-br from-[#1a1a26] to-[#0e0e14] border border-[#2a2a3a] flex flex-col items-center justify-center text-center p-1.5 shrink-0 text-[#f3c06b]">
                          <BookOpen className="w-6 h-6 mb-1 opacity-70" />
                          <span className="text-[8px] font-bold uppercase leading-tight line-clamp-2">
                            {bk.title}
                          </span>
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {bk.category && (
                            <span className="px-2 py-0.5 bg-[#14141f] text-[#f3c06b] border border-[#262638] text-[9px] font-bold rounded-md uppercase">
                              {bk.category}
                            </span>
                          )}
                          {bk.featured && (
                            <span className="px-1.5 py-0.5 bg-cyan-950/80 text-cyan-300 text-[9px] font-bold rounded-md">
                              Featured
                            </span>
                          )}
                        </div>

                        <h4 className="font-bold text-white text-sm mt-1.5 line-clamp-2 group-hover:text-[#f3c06b] transition">
                          {bk.title}
                        </h4>

                        <p className="text-[11px] text-gray-400 mt-0.5 font-mono">
                          Slug: {bk.slug || bk.isbn || "—"}
                        </p>

                        <div className="mt-2 flex items-baseline gap-2">
                          <span className="text-sm font-extrabold text-[#f3c06b]">
                            ₹{bk.paperbackPrice || bk.price || 299}
                          </span>
                          {Boolean(bk.paperbackPrice && bk.price && bk.paperbackPrice !== bk.price) && (
                            <span className="text-[10px] text-gray-400 font-medium">
                              (eBook: ₹{bk.price})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#181824] flex items-center justify-between gap-2 text-xs relative">
                      {/* Preview Button: Opens Buy Books Modal */}
                      <Link
                        to={`/library?book=${encodeURIComponent(bk.slug || bk._id)}`}
                        target="_blank"
                        className="text-gray-400 hover:text-[#f3c06b] text-[11px] font-semibold flex items-center gap-1.5 transition px-2.5 py-1.5 rounded-lg hover:bg-[#161622] border border-transparent hover:border-[#c8923a]/40"
                        title="Open Book Preview Modal in Store"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#f3c06b]" />
                        <span>Preview</span>
                      </Link>

                      <div className="flex items-center gap-1.5">
                        {/* Manage Links Button */}
                        <button
                          type="button"
                          onClick={() => onOpenLinksModal && onOpenLinksModal(bk)}
                          className="px-2.5 py-1.5 text-gray-400 hover:text-[#f3c06b] hover:bg-[#181826] border border-[#222232] hover:border-[#c8923a]/40 rounded-lg text-[11px] font-semibold transition flex items-center gap-1 shadow-sm cursor-pointer"
                          title="Add or Edit Preview Links (Amazon, Kindle, Flipkart, etc.)"
                        >
                          <Link2 className="w-3.5 h-3.5 text-[#f3c06b]" />
                          <span>
                            Links {bk.previewLinks && bk.previewLinks.length > 0 ? `(${bk.previewLinks.length})` : ""}
                          </span>
                        </button>

                        {/* Record Sale */}
                        <button
                          type="button"
                          onClick={() =>
                            onQuickSaleForBook &&
                            onQuickSaleForBook(viewingAuthor, bk.title, bk.paperbackPrice || bk.price || 299)
                          }
                          className="px-3 py-1.5 bg-[#161622] hover:bg-[#202032] border border-[#c8923a]/40 text-[#f3c06b] hover:text-white rounded-lg text-[11px] font-bold transition flex items-center gap-1 shadow-sm cursor-pointer"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>Record Sale</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Author Sales History */}
        <div className="bg-[#0e0e14] border border-[#1f1f2e] rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex flex-wrap justify-between items-center gap-3">
            <h3 className="font-serif text-xl font-extrabold text-white">
              Sales Ledger for {viewingAuthor.name}
            </h3>
            <button
              type="button"
              onClick={() => onOpenAddSaleForAuthor && onOpenAddSaleForAuthor(viewingAuthor)}
              className="px-3.5 py-1.5 bg-[#161622] hover:bg-[#202032] border border-[#c8923a]/40 text-[#f3c06b] hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Record Sale</span>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#222232] text-gray-400 uppercase tracking-wider text-[11px]">
                  <th className="pb-3 font-semibold">Date</th>
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
                {recentSales.filter((s) => s.authorEmail === viewingAuthor.email).length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-6 text-center text-gray-500">
                      No sales recorded yet for this author.
                    </td>
                  </tr>
                ) : (
                  recentSales
                    .filter((s) => s.authorEmail === viewingAuthor.email)
                    .map((sale) => (
                      <tr key={sale._id || sale.id} className="hover:bg-[#14141f] transition">
                        <td className="py-3.5 text-gray-400">
                          {new Date(sale.saleDate || sale.createdAt).toLocaleDateString("en-IN")}
                        </td>
                        <td className="py-3.5 font-bold text-white">{sale.bookTitle}</td>
                        <td className="py-3.5 text-gray-300 font-medium">{sale.quantity}</td>
                        <td className="py-3.5 text-gray-300 font-medium">₹{sale.unitPrice}</td>
                        <td className="py-3.5 text-white font-extrabold">₹{sale.grossSales}</td>
                        <td className="py-3.5 text-emerald-400 font-extrabold">₹{sale.authorProfit}</td>
                        <td className="py-3.5 text-gray-400">{sale.channel || "Direct"}</td>
                        <td className="py-3.5 text-right">
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

  // MAIN AUTHORS LIST VIEW
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4 bg-[#0e0e14] p-6 rounded-3xl border border-[#1f1f2e] shadow-xl">
        <div>
          <h2 className="font-serif text-xl font-extrabold text-[#f3c06b]">Author Management & Directory</h2>
          <p className="text-xs text-gray-400 mt-1">
            Click on any author to view their published books, royalties, stock inventory, and sales.
          </p>
        </div>
        <button
          onClick={onOpenAddAuthor}
          className="px-4 py-2.5 bg-gradient-to-r from-[#d99b38] to-[#f3c06b] text-black font-extrabold text-xs rounded-xl shadow flex items-center gap-2 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register New Author</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {rawAuthors.length === 0 ? (
          <div className="bg-[#0e0e14] p-10 rounded-3xl border border-[#1f1f2e] text-center text-gray-500 text-sm">
            No authors registered yet. Click "+ Register New Author" above to add your first author.
          </div>
        ) : (
          rawAuthors.map((auth) => (
            <div
              key={auth.id || auth._id || auth.email}
              onClick={() => onOpenAuthorBooks && onOpenAuthorBooks(auth)}
              className="bg-[#0e0e14] border border-[#1f1f2e] hover:border-[#c8923a]/60 hover:bg-[#11111a] rounded-3xl p-6 space-y-4 transition-all duration-300 shadow-xl cursor-pointer group relative"
            >
              <div className="flex flex-wrap justify-between items-center gap-3 border-b border-[#1c1c28] pb-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2a2a3a] to-[#14141d] border border-[#c8923a]/50 flex items-center justify-center font-serif text-base font-bold text-[#f3c06b] overflow-hidden shadow-lg group-hover:scale-105 transition">
                    {auth.thumbnailUrl ? (
                      <img src={auth.thumbnailUrl} alt={auth.name} className="w-full h-full object-cover" />
                    ) : (
                      auth.name?.charAt(0) || "A"
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif text-lg font-bold text-white group-hover:text-[#f3c06b] transition">
                        {auth.name}
                      </h3>
                      <span className="text-[10px] text-gray-400 bg-[#161622] border border-[#2a2a3a] px-2 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition hidden sm:inline">
                        Click to view books →
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {auth.email} • {auth.phone || "No phone"}
                    </p>
                  </div>
                </div>

                <div className="text-right flex items-center gap-2.5">
                  <span className="text-xs text-[#f3c06b] font-bold bg-[#181824] px-3 py-1 rounded-lg border border-[#2a2a3a]">
                    {auth.selectedPlan || "Standard Plan"}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-lg text-[10px] font-extrabold ${
                      auth.status === "PAID"
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                        : "bg-amber-950 text-amber-400 border border-amber-800"
                    }`}
                  >
                    {auth.status || "PENDING"}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onOpenAuthorBooks) onOpenAuthorBooks(auth);
                    }}
                    className="px-3.5 py-2 bg-gradient-to-r from-[#d99b38] to-[#f3c06b] hover:from-[#e5a845] hover:to-[#fbd080] text-black text-xs font-extrabold rounded-xl transition shadow flex items-center gap-1.5 cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>View Books</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onOpenEditAuthor) onOpenEditAuthor(auth);
                    }}
                    className="px-3 py-2 bg-[#161622] hover:bg-[#202030] border border-[#333348] hover:border-[#c8923a]/50 text-xs text-gray-300 hover:text-[#f3c06b] rounded-xl font-bold transition shadow flex items-center gap-1.5 cursor-pointer"
                    title="Edit Author Details (Name, Email, Phone, Plan)"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#f3c06b]" />
                    <span className="hidden sm:inline">Edit Details</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onOpenWorkflowModal) onOpenWorkflowModal(auth);
                    }}
                    className="px-3.5 py-2 bg-[#161622] hover:bg-[#202030] border border-[#333348] text-xs text-gray-300 hover:text-white rounded-xl font-bold transition shadow flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#f3c06b]" />
                    <span className="hidden sm:inline">Edit 9-Step Progress</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onDeleteAuthor) onDeleteAuthor(e, auth);
                    }}
                    title="Delete author from publisher directory"
                    className="p-2 bg-[#1c1214] hover:bg-red-950/60 border border-red-900/40 hover:border-red-600/60 text-red-400 hover:text-red-300 rounded-xl transition shadow flex items-center justify-center cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div className="bg-[#08080c] p-3.5 rounded-xl border border-[#181824]">
                  <p className="text-gray-500 font-medium mb-0.5">Plan Amount</p>
                  <p className="font-bold text-white">₹{Number(auth.planAmount || 0).toFixed(2)}</p>
                </div>
                <div className="bg-[#08080c] p-3.5 rounded-xl border border-[#181824]">
                  <p className="text-gray-500 font-medium mb-0.5">Plan Paid</p>
                  <p className="font-bold text-emerald-400">₹{Number(auth.planPaid || 0).toFixed(2)}</p>
                </div>
                <div className="bg-[#08080c] p-3.5 rounded-xl border border-[#181824]">
                  <p className="text-gray-500 font-medium mb-0.5">Royalty Earned</p>
                  <p className="font-bold text-white">₹{Number(auth.royaltyEarned || 0).toFixed(2)}</p>
                </div>
                <div className="bg-[#08080c] p-3.5 rounded-xl border border-[#181824]">
                  <p className="text-gray-500 font-medium mb-0.5">Total Pending</p>
                  <p className="font-bold text-amber-400">₹{Number(auth.totalPending || 0).toFixed(2)}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
