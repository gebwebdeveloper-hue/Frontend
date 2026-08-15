import { Printer, BookOpen } from "lucide-react";

export default function AuthorBooksSection({ books = [], primaryBook, handleRequestReprint }) {
  const displayBooks = Array.isArray(books) && books.length > 0 ? books : [primaryBook];

  return (
    <div className="space-y-6">
      <div className="bg-[#0e0e14] border border-[#1f1f2e] rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-serif text-xl font-extrabold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#f3c06b]" />
              <span>My Published Books & Inventory</span>
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              All published titles associated with your author profile in Lekhok Tripura.
            </p>
          </div>
          <span className="px-3 py-1 bg-[#181824] text-[#f3c06b] border border-[#2d2d3e] text-xs font-bold rounded-xl">
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
                <th className="pb-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#181824]">
              {displayBooks.map((bk, i) => (
                <tr key={bk._id || i} className="hover:bg-[#14141f] transition">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      {bk.coverUrl ? (
                        <img
                          src={bk.coverUrl}
                          alt={bk.title}
                          className="w-9 h-12 object-cover rounded-md border border-[#2d2d3e] shadow-sm"
                        />
                      ) : (
                        <div className="w-9 h-12 bg-[#1c1c28] border border-[#2d2d3e] rounded-md flex items-center justify-center text-[#f3c06b] font-serif text-xs font-bold">
                          📖
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-white text-sm">{bk.title}</p>
                        <p className="text-[11px] text-gray-400">Lekhok Tripura Publication</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 font-bold text-[#f3c06b]">
                    {bk.price ? `₹${bk.price}` : "—"}
                  </td>
                  <td className="py-4 text-gray-400 font-mono text-[11px]">{bk.isbn || "—"}</td>
                  <td className="py-4 text-gray-300 font-medium">{bk.copiesPrinted || 50}</td>
                  <td className="py-4 text-gray-300 font-medium">{bk.copiesSold || 0}</td>
                  <td className="py-4 text-gray-300 font-medium">{bk.currentStock || 50}</td>
                  <td className="py-4">
                    <span className={`px-3 py-1 text-[10px] font-extrabold rounded-lg border ${
                      bk.stockStatus === "LOW STOCK"
                        ? "bg-amber-950/80 text-amber-400 border-amber-800"
                        : "bg-emerald-950/80 text-emerald-400 border-emerald-800"
                    }`}>
                      {bk.stockStatus || "IN STOCK"}
                    </span>
                  </td>
                  <td className="py-4">
                    <button
                      onClick={() => handleRequestReprint(bk.title)}
                      className="px-3.5 py-2 bg-[#161622] border border-[#333348] hover:bg-[#202030] text-gray-200 text-xs font-bold rounded-xl transition flex items-center gap-2"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Request Reprint</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
