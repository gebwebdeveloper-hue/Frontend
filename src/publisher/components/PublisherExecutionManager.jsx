import { useState, useEffect, useRef } from "react";
import { API_BASE } from "../../config.js";
import {
  BookOpenCheck,
  Save,
  PlusCircle,
  FileText,
  AlertTriangle,
  CheckCircle,
  Truck,
  DollarSign,
  ShieldCheck,
  ChevronDown,
  Search,
  Check,
  User
} from "lucide-react";

export default function PublisherExecutionManager({ authors = [], token, onRefresh }) {
  const [selectedAuthorId, setSelectedAuthorId] = useState("");
  const [currentAuthor, setCurrentAuthor] = useState(null);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  // Custom Dropdown Open State & Search Query
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);

  // Execution Form Fields
  const [form, setForm] = useState({
    pageCount: 120,
    isbnNo: "",
    totalCopiesPrinted: 50,
    damagedCopies: 0,
    complimentaryCopies: 5,
    authorCopies: 10,
    bookCoverStatus: "Pending",
    bookFormattingStatus: "Pending",
    bookReadyToPrintStatus: "Pending",
    printingStatus: "Pending",
    deliveryStatus: "Pending",
    planAmount: 1212,
    amountPaid: 1212,
    invoiceUrl: "",
    paymentDate: "",
    coverApproval: "Pending",
    formattingApproval: "Pending",
    finalProofApproval: "Pending",
    courierPartner: "",
    trackingNumber: "",
    dispatchDate: "",
    expectedDeliveryDate: "",
    workflowSteps: [
      { stepNumber: 1, name: "Payment", status: "Pending", value: "" },
      { stepNumber: 2, name: "ISBN Generated", status: "Pending", value: "" },
      { stepNumber: 3, name: "Book Page", status: "Pending", value: "120" },
      { stepNumber: 4, name: "Book Cover", status: "Pending", value: "" },
      { stepNumber: 5, name: "Formatting", status: "Pending", value: "" },
      { stepNumber: 6, name: "Author Approval", status: "Pending", value: "" },
      { stepNumber: 7, name: "Ready to Print", status: "Pending", value: "" },
      { stepNumber: 8, name: "Printing", status: "Pending", value: "" },
      { stepNumber: 9, name: "Stock Ready", status: "Pending", value: "" },
      { stepNumber: 10, name: "Delivery", status: "Pending", value: "" },
      { stepNumber: 11, name: "Published", status: "Pending", value: "" }
    ],
    documents: [],
    addOnServices: []
  });

  useEffect(() => {
    if (authors.length > 0 && !selectedAuthorId) {
      setSelectedAuthorId(authors[0].id || authors[0]._id);
    }
  }, [authors]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (selectedAuthorId) {
      const target = authors.find((a) => (a.id || a._id) === selectedAuthorId);
      if (target) {
        setCurrentAuthor(target);
        setForm({
          pageCount: target.pageCount || 120,
          isbnNo: target.isbnNo || "",
          totalCopiesPrinted: target.totalCopiesPrinted || target.planPaid || 50,
          damagedCopies: target.damagedCopies || 0,
          complimentaryCopies: target.complimentaryCopies || 5,
          authorCopies: target.authorCopies || 10,
          bookCoverStatus: target.bookCoverStatus || "Pending",
          bookFormattingStatus: target.bookFormattingStatus || "Pending",
          bookReadyToPrintStatus: target.bookReadyToPrintStatus || "Pending",
          printingStatus: target.printingStatus || "Pending",
          deliveryStatus: target.deliveryStatus || "Pending",
          planAmount: target.planAmount || 1212,
          amountPaid: target.planPaid || target.amountPaid || 0,
          invoiceUrl: target.invoiceUrl || "",
          paymentDate: target.paymentDate || "",
          coverApproval: target.coverApproval || "Pending",
          formattingApproval: target.formattingApproval || "Pending",
          finalProofApproval: target.finalProofApproval || "Pending",
          courierPartner: target.courierPartner || "",
          trackingNumber: target.trackingNumber || "",
          dispatchDate: target.dispatchDate || "",
          expectedDeliveryDate: target.expectedDeliveryDate || "",
          workflowSteps: target.workflowSteps?.length >= 9 ? target.workflowSteps : [
            { stepNumber: 1, name: "Payment", status: target.status === "PAID" ? "Completed" : "Pending", value: "" },
            { stepNumber: 2, name: "ISBN Generated", status: "Pending", value: target.isbnNo || "" },
            { stepNumber: 3, name: "Book Page", status: "Pending", value: "120" },
            { stepNumber: 4, name: "Book Cover", status: "Pending", value: "" },
            { stepNumber: 5, name: "Formatting", status: "Pending", value: "" },
            { stepNumber: 6, name: "Author Approval", status: "Pending", value: "" },
            { stepNumber: 7, name: "Ready to Print", status: "Pending", value: "" },
            { stepNumber: 8, name: "Printing", status: "Pending", value: "" },
            { stepNumber: 9, name: "Stock Ready", status: "Pending", value: "" },
            { stepNumber: 10, name: "Delivery", status: "Pending", value: "" },
            { stepNumber: 11, name: "Published", status: "Pending", value: "" }
          ],
          documents: target.documents || [],
          addOnServices: target.addOnServices || []
        });
      }
    }
  }, [selectedAuthorId, authors]);

  const handleSaveAll = async () => {
    if (!selectedAuthorId) return;
    try {
      setSaving(true);
      setStatusMsg("");
      const res = await fetch(`${API_BASE}/publisher/authors/${selectedAuthorId}/full-workflow`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg("All book execution details updated successfully!");
        if (onRefresh) onRefresh();
        setTimeout(() => setStatusMsg(""), 4000);
      } else {
        alert(data.message || "Failed to update book execution details.");
      }
    } catch (err) {
      alert("Error connecting to server.");
    } finally {
      setSaving(false);
    }
  };

  const handleStepStatusChange = (index, newStatus) => {
    const updatedSteps = [...form.workflowSteps];
    updatedSteps[index].status = newStatus;
    setForm({ ...form, workflowSteps: updatedSteps });
  };

  const handleStepValueChange = (index, val) => {
    const updatedSteps = [...form.workflowSteps];
    updatedSteps[index].value = val;
    setForm({ ...form, workflowSteps: updatedSteps });
  };

  const availableCopies = Math.max(
    0,
    (form.totalCopiesPrinted || 0) - (form.damagedCopies || 0) - (form.complimentaryCopies || 0) - (form.authorCopies || 0)
  );

  const filteredAuthors = authors.filter(
    (a) =>
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedAuthorObj = authors.find((a) => (a.id || a._id) === selectedAuthorId) || currentAuthor;

  return (
    <div className="space-y-8 text-gray-100">
      {/* Top Banner & Ultra-Premium Author Selector */}
      <div className="bg-gradient-to-b from-[#11111a] via-[#0e0e14] to-[#08080c] border border-[#c8923a]/30 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h2 className="font-serif text-2xl font-extrabold text-white flex items-center gap-2">
              <BookOpenCheck className="w-6 h-6 text-[#f3c06b]" />
              <span>Book Publishing Execution Manager</span>
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Select an author to manage their 11-step roadmap, print counts, payment status, and delivery tracking.
            </p>
          </div>

          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="px-6 py-3 bg-gradient-to-r from-[#d99b38] to-[#f3c06b] hover:from-[#e5a845] hover:to-[#fbd080] text-black font-extrabold text-xs rounded-xl shadow-lg shadow-[#c8923a]/20 transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving..." : "Save All Changes"}</span>
          </button>
        </div>

        {statusMsg && (
          <div className="p-3 bg-emerald-950/90 border border-emerald-700 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{statusMsg}</span>
          </div>
        )}

        {/* ULTRA-PREMIUM CUSTOM DROPDOWN SELECTOR */}
        <div className="relative" ref={dropdownRef}>
          <label className="block text-xs font-extrabold text-[#f3c06b] mb-2 uppercase tracking-wider">
            Select Publication Author
          </label>

          {/* Trigger Button */}
          <div
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full bg-[#09090d] border border-[#c8923a]/40 hover:border-[#f3c06b] rounded-2xl p-4 flex items-center justify-between cursor-pointer shadow-xl transition-all duration-300 group"
          >
            {selectedAuthorObj ? (
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2a2a3a] to-[#14141d] border border-[#c8923a]/50 p-0.5 flex items-center justify-center font-serif text-sm font-bold text-[#f3c06b] overflow-hidden shadow">
                  {selectedAuthorObj.thumbnailUrl ? (
                    <img src={selectedAuthorObj.thumbnailUrl} alt={selectedAuthorObj.name} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <span>{selectedAuthorObj.name.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <h4 className="font-serif text-sm font-extrabold text-white group-hover:text-[#f3c06b] transition">
                    {selectedAuthorObj.name}
                  </h4>
                  <p className="text-xs text-gray-400 font-mono">{selectedAuthorObj.email}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-gray-400 text-xs font-semibold">
                <User className="w-4 h-4 text-[#f3c06b]" />
                <span>Choose an Author from the list...</span>
              </div>
            )}

            <ChevronDown className={`w-5 h-5 text-[#f3c06b] transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`} />
          </div>

          {/* Floating Dropdown List Panel */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#0d0d14]/98 backdrop-blur-2xl border border-[#c8923a]/40 rounded-2xl p-3 shadow-2xl space-y-3 z-50 max-h-80 overflow-y-auto">
              {/* Search Box inside dropdown */}
              <div className="relative sticky top-0 bg-[#0d0d14] pt-1 pb-2 z-10 border-b border-[#1f1f2e]">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  placeholder="Search author by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-[#050508] border border-[#262638] rounded-xl text-xs text-white focus:outline-none focus:border-[#c8923a]"
                />
              </div>

              <div className="space-y-1">
                {filteredAuthors.length === 0 ? (
                  <div className="p-4 text-center text-xs text-gray-500">No authors found matching "{searchQuery}"</div>
                ) : (
                  filteredAuthors.map((auth) => {
                    const isSelected = (auth.id || auth._id) === selectedAuthorId;
                    return (
                      <div
                        key={auth.id || auth._id}
                        onClick={() => {
                          setSelectedAuthorId(auth.id || auth._id);
                          setIsDropdownOpen(false);
                        }}
                        className={`p-3 rounded-xl cursor-pointer flex items-center justify-between transition duration-200 border ${
                          isSelected
                            ? "bg-gradient-to-r from-[#c8923a]/20 to-[#1c1c2b] border-[#c8923a]"
                            : "hover:bg-[#141420] border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#181824] border border-[#c8923a]/30 flex items-center justify-center font-serif text-xs font-bold text-[#f3c06b] overflow-hidden">
                            {auth.thumbnailUrl ? (
                              <img src={auth.thumbnailUrl} alt={auth.name} className="w-full h-full object-cover" />
                            ) : (
                              auth.name.charAt(0)
                            )}
                          </div>
                          <div>
                            <p className="font-serif text-xs font-bold text-white">{auth.name}</p>
                            <p className="text-[11px] text-gray-400 font-mono">{auth.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 text-[9px] font-extrabold rounded-md border ${
                            auth.status === "PAID" ? "bg-emerald-950/80 text-emerald-400 border-emerald-800" : "bg-amber-950/80 text-amber-400 border-amber-800"
                          }`}>
                            {auth.status || "PAID"}
                          </span>
                          {isSelected && <Check className="w-4 h-4 text-[#f3c06b]" />}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {currentAuthor && (
        <div className="space-y-8">
          {/* AUTHOR SUMMARY BAR */}
          <div className="bg-[#0e0e14] border border-[#1f1f2e] rounded-3xl p-6 flex flex-wrap justify-between items-center gap-4 shadow-xl">
            <div>
              <h3 className="font-serif text-2xl font-extrabold text-white">{currentAuthor.name}</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Book page: <span className="text-white font-bold">{form.pageCount || "—"}</span> | ISBN: <span className="text-white font-bold">{form.isbnNo || "—"}</span>
              </p>
            </div>

            <span className={`px-4 py-1.5 rounded-xl text-xs font-extrabold border ${
              form.publishingPaymentStatus === "PAID" || form.publishingPaymentStatus === "Paid"
                ? "bg-emerald-950 text-emerald-400 border-emerald-800"
                : "bg-amber-950 text-amber-400 border-amber-800"
            }`}>
              {form.publishingPaymentStatus || "Pending"}
            </span>
          </div>

          {/* 11-STEP PUBLISHING ROADMAP — PUBLISHER UPDATE CARD */}
          <div className="bg-[#0e0e14] border border-[#1f1f2e] rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
            <div>
              <h3 className="font-serif text-xl font-extrabold text-white">Publishing Roadmap — Publisher Update</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Update every milestone here; Author Dashboard will reflect the changes automatically.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
              {form.workflowSteps.map((st, idx) => (
                <div key={st.stepNumber} className="bg-[#08080c] border border-[#1c1c28] p-3.5 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#1c1c28] border border-[#333348] flex items-center justify-center font-bold text-[10px] text-[#f3c06b]">
                      {st.stepNumber}
                    </span>
                    <p className="font-bold text-gray-200 truncate">{st.name}</p>
                  </div>

                  {st.stepNumber === 2 ? (
                    <input
                      type="text"
                      placeholder="Enter ISBN"
                      value={st.value || form.isbnNo}
                      onChange={(e) => {
                        handleStepValueChange(idx, e.target.value);
                        setForm({ ...form, isbnNo: e.target.value });
                      }}
                      className="w-full bg-[#12121c] border border-[#262636] px-2 py-1.5 rounded-xl text-white text-[11px]"
                    />
                  ) : st.stepNumber === 3 ? (
                    <input
                      type="number"
                      placeholder="Page count"
                      value={st.value || form.pageCount}
                      onChange={(e) => {
                        handleStepValueChange(idx, e.target.value);
                        setForm({ ...form, pageCount: Number(e.target.value) });
                      }}
                      className="w-full bg-[#12121c] border border-[#262636] px-2 py-1.5 rounded-xl text-white text-[11px]"
                    />
                  ) : st.stepNumber === 9 ? (
                    <div className="space-y-1">
                      <select
                        value={st.status}
                        onChange={(e) => handleStepStatusChange(idx, e.target.value)}
                        className="w-full bg-[#12121c] border border-[#262636] px-2 py-1 rounded-xl text-white text-[11px]"
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                      <p className="text-[11px] text-gray-300 font-medium">
                        <strong className="text-[#f3c06b]">{availableCopies}</strong> copies available
                      </p>
                    </div>
                  ) : (
                    <select
                      value={st.status}
                      onChange={(e) => handleStepStatusChange(idx, e.target.value)}
                      className="w-full bg-[#12121c] border border-[#262636] px-2 py-1.5 rounded-xl text-white text-[11px]"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* SPECIFICATIONS & INVENTORY FORM */}
          <div className="bg-[#0e0e14] border border-[#1f1f2e] rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
            <h4 className="font-serif text-lg font-extrabold text-[#f3c06b]">Book Specifications & Print Quantities</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Book Page</label>
                <input
                  type="number"
                  placeholder="e.g. 120"
                  value={form.pageCount}
                  onChange={(e) => setForm({ ...form, pageCount: Number(e.target.value) })}
                  className="w-full bg-[#08080c] border border-[#262636] px-4 py-3 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1 font-semibold">ISBN No.</label>
                <input
                  type="text"
                  placeholder="e.g. 978-81-98765-43-2"
                  value={form.isbnNo}
                  onChange={(e) => setForm({ ...form, isbnNo: e.target.value })}
                  className="w-full bg-[#08080c] border border-[#262636] px-4 py-3 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Total Copies Printed</label>
                <input
                  type="number"
                  value={form.totalCopiesPrinted}
                  onChange={(e) => setForm({ ...form, totalCopiesPrinted: Number(e.target.value) })}
                  className="w-full bg-[#08080c] border border-[#262636] px-4 py-3 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Damaged Copies</label>
                <input
                  type="number"
                  value={form.damagedCopies}
                  onChange={(e) => setForm({ ...form, damagedCopies: Number(e.target.value) })}
                  className="w-full bg-[#08080c] border border-[#262636] px-4 py-3 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Complimentary Copies</label>
                <input
                  type="number"
                  value={form.complimentaryCopies}
                  onChange={(e) => setForm({ ...form, complimentaryCopies: Number(e.target.value) })}
                  className="w-full bg-[#08080c] border border-[#262636] px-4 py-3 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Author Copies</label>
                <input
                  type="number"
                  value={form.authorCopies}
                  onChange={(e) => setForm({ ...form, authorCopies: Number(e.target.value) })}
                  className="w-full bg-[#08080c] border border-[#262636] px-4 py-3 rounded-xl text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs pt-2">
              <div>
                <label className="block text-gray-400 mb-1 font-medium">Book Cover Status</label>
                <select
                  value={form.bookCoverStatus}
                  onChange={(e) => setForm({ ...form, bookCoverStatus: e.target.value })}
                  className="w-full bg-[#08080c] border border-[#262636] px-3 py-2.5 rounded-xl text-white"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-400 mb-1 font-medium">Book Formatting</label>
                <select
                  value={form.bookFormattingStatus}
                  onChange={(e) => setForm({ ...form, bookFormattingStatus: e.target.value })}
                  className="w-full bg-[#08080c] border border-[#262636] px-3 py-2.5 rounded-xl text-white"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-400 mb-1 font-medium">Book Ready to Print</label>
                <select
                  value={form.bookReadyToPrintStatus}
                  onChange={(e) => setForm({ ...form, bookReadyToPrintStatus: e.target.value })}
                  className="w-full bg-[#08080c] border border-[#262636] px-3 py-2.5 rounded-xl text-white"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-400 mb-1 font-medium">Printing Status</label>
                <select
                  value={form.printingStatus}
                  onChange={(e) => setForm({ ...form, printingStatus: e.target.value })}
                  className="w-full bg-[#08080c] border border-[#262636] px-3 py-2.5 rounded-xl text-white"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-400 mb-1 font-medium">Delivery Status</label>
                <select
                  value={form.deliveryStatus}
                  onChange={(e) => setForm({ ...form, deliveryStatus: e.target.value })}
                  className="w-full bg-[#08080c] border border-[#262636] px-3 py-2.5 rounded-xl text-white"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            {/* STOCK ALERT CARD */}
            <div className="p-4 bg-amber-950/40 border border-amber-700/60 text-amber-300 rounded-2xl text-xs flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
              <span>
                <strong>BOOK STOCK NOTICE:</strong> Only {availableCopies} copies available for {currentAuthor.name}. Kindly order to reprint.
              </span>
            </div>
          </div>

          {/* PAYMENT DETAILS CARD */}
          <div className="bg-[#0e0e14] border border-[#1f1f2e] rounded-3xl p-6 md:p-8 space-y-4 shadow-xl">
            <h4 className="font-serif text-lg font-extrabold text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-[#f3c06b]" />
              <span>Payment Details</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Plan Amount (₹)</label>
                <input
                  type="number"
                  value={form.planAmount}
                  onChange={(e) => setForm({ ...form, planAmount: Number(e.target.value) })}
                  className="w-full bg-[#08080c] border border-[#262636] px-4 py-3 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Amount Paid (₹)</label>
                <input
                  type="number"
                  value={form.amountPaid}
                  onChange={(e) => setForm({ ...form, amountPaid: Number(e.target.value) })}
                  className="w-full bg-[#08080c] border border-[#262636] px-4 py-3 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Invoice Link</label>
                <input
                  type="text"
                  placeholder="Invoice URL"
                  value={form.invoiceUrl}
                  onChange={(e) => setForm({ ...form, invoiceUrl: e.target.value })}
                  className="w-full bg-[#08080c] border border-[#262636] px-4 py-3 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Payment Date</label>
                <input
                  type="date"
                  value={form.paymentDate}
                  onChange={(e) => setForm({ ...form, paymentDate: e.target.value })}
                  className="w-full bg-[#08080c] border border-[#262636] px-4 py-3 rounded-xl text-white"
                />
              </div>
            </div>
          </div>

          {/* AUTHOR APPROVAL DETAILS CARD */}
          <div className="bg-[#0e0e14] border border-[#1f1f2e] rounded-3xl p-6 md:p-8 space-y-4 shadow-xl">
            <h4 className="font-serif text-lg font-extrabold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>Author Approval Details</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Cover Approval</label>
                <select
                  value={form.coverApproval}
                  onChange={(e) => setForm({ ...form, coverApproval: e.target.value })}
                  className="w-full bg-[#08080c] border border-[#262636] px-4 py-3 rounded-xl text-white"
                >
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Formatting Approval</label>
                <select
                  value={form.formattingApproval}
                  onChange={(e) => setForm({ ...form, formattingApproval: e.target.value })}
                  className="w-full bg-[#08080c] border border-[#262636] px-4 py-3 rounded-xl text-white"
                >
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Final Proof Approval</label>
                <select
                  value={form.finalProofApproval}
                  onChange={(e) => setForm({ ...form, finalProofApproval: e.target.value })}
                  className="w-full bg-[#08080c] border border-[#262636] px-4 py-3 rounded-xl text-white"
                >
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                </select>
              </div>
            </div>
          </div>

          {/* DELIVERY TRACKING CARD */}
          <div className="bg-[#0e0e14] border border-[#1f1f2e] rounded-3xl p-6 md:p-8 space-y-4 shadow-xl">
            <h4 className="font-serif text-lg font-extrabold text-white flex items-center gap-2">
              <Truck className="w-5 h-5 text-[#f3c06b]" />
              <span>Delivery Tracking</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Courier / Delivery Partner</label>
                <input
                  type="text"
                  placeholder="e.g. Delhivery / DTDC"
                  value={form.courierPartner}
                  onChange={(e) => setForm({ ...form, courierPartner: e.target.value })}
                  className="w-full bg-[#08080c] border border-[#262636] px-4 py-3 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Tracking Number</label>
                <input
                  type="text"
                  placeholder="e.g. TRK987654321"
                  value={form.trackingNumber}
                  onChange={(e) => setForm({ ...form, trackingNumber: e.target.value })}
                  className="w-full bg-[#08080c] border border-[#262636] px-4 py-3 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Dispatch Date</label>
                <input
                  type="date"
                  value={form.dispatchDate}
                  onChange={(e) => setForm({ ...form, dispatchDate: e.target.value })}
                  className="w-full bg-[#08080c] border border-[#262636] px-4 py-3 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Expected Delivery</label>
                <input
                  type="date"
                  value={form.expectedDeliveryDate}
                  onChange={(e) => setForm({ ...form, expectedDeliveryDate: e.target.value })}
                  className="w-full bg-[#08080c] border border-[#262636] px-4 py-3 rounded-xl text-white"
                />
              </div>
            </div>
          </div>

          {/* BOTTOM SAVE BUTTON */}
          <div className="flex justify-end pt-4 pb-12">
            <button
              onClick={handleSaveAll}
              disabled={saving}
              className="px-8 py-3.5 bg-gradient-to-r from-[#d99b38] to-[#f3c06b] hover:from-[#e5a845] hover:to-[#fbd080] text-black font-extrabold text-sm rounded-2xl shadow-xl shadow-[#c8923a]/20 transition flex items-center gap-2"
            >
              <Save className="w-5 h-5" />
              <span>{saving ? "Saving All Changes..." : "Save All Book Execution Changes"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
