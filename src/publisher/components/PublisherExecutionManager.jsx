import { useState, useEffect, useRef } from "react";
import { API_BASE } from "../../config.js";
import {
  BookOpenCheck,
  BookOpen,
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
  User,
  Book,
  CreditCard,
  Receipt,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

function getAuthorBooks(author, allCatalogBooks = []) {
  if (!author) return [];
  const authorName = (author.name || "").trim().toLowerCase();
  const found = [];

  if (author.books && Array.isArray(author.books) && author.books.length > 0) {
    for (const b of author.books) {
      if (b.title && !found.some((f) => f.title?.toLowerCase() === b.title?.toLowerCase())) {
        found.push(b);
      }
    }
  }

  if (authorName && allCatalogBooks.length > 0) {
    const catalogMatches = allCatalogBooks.filter((b) => {
      if (!b.author) return false;
      const bkAuth = b.author.trim().toLowerCase();
      return bkAuth.includes(authorName) || authorName.includes(bkAuth);
    });

    for (const cb of catalogMatches) {
      if (!found.some((f) => f.title?.toLowerCase() === cb.title?.toLowerCase())) {
        found.push({
          title: cb.title,
          isbn: cb.slug || cb.isbn || "—",
          coverUrl: cb.cover?.url || cb.coverUrl || "",
          copiesPrinted: cb.copiesPrinted || 100,
          price: cb.price || cb.paperbackPrice || 299
        });
      }
    }
  }

  return found;
}

function extractBookFormState(author, bookTitle, allCatalogBooks = []) {
  if (!author) return null;
  const authorBooks = getAuthorBooks(author, allCatalogBooks);
  const matchedBook = authorBooks.find(
    (b) => b.title && b.title.trim().toLowerCase() === (bookTitle || "").trim().toLowerCase()
  ) || authorBooks[0] || {};

  const portalBook = (author.books || []).find(
    (b) => b.title && b.title.trim().toLowerCase() === (matchedBook.title || "").trim().toLowerCase()
  );

  const finalBookTitle = matchedBook.title || portalBook?.title || "";
  const finalIsbn = (portalBook?.isbn && portalBook.isbn !== "—")
    ? portalBook.isbn
    : ((matchedBook.isbn && matchedBook.isbn !== "—") ? matchedBook.isbn : (author.isbnNo || ""));

  const planAmount = portalBook?.planAmount !== undefined ? portalBook.planAmount : (author.planAmount !== undefined ? author.planAmount : 1212);
  const amountPaid = portalBook?.amountPaid !== undefined ? portalBook.amountPaid : (author.amountPaid !== undefined ? author.amountPaid : (author.planPaid || 0));

  let publishingPaymentStatus = portalBook?.publishingPaymentStatus || author.publishingPaymentStatus;
  if (!publishingPaymentStatus) {
    if (amountPaid >= planAmount && planAmount > 0) {
      publishingPaymentStatus = "PAID";
    } else if (amountPaid > 0) {
      publishingPaymentStatus = "PARTIAL";
    } else {
      publishingPaymentStatus = author.status === "PAID" ? "PAID" : "PENDING";
    }
  }

  const pageCount = portalBook?.pageCount || matchedBook.pages || author.pageCount || 120;
  const totalCopiesPrinted = portalBook?.copiesPrinted || author.totalCopiesPrinted || author.planPaid || 50;
  const damagedCopies = portalBook?.damagedCopies !== undefined ? portalBook.damagedCopies : (author.damagedCopies || 0);
  const complimentaryCopies = portalBook?.complimentaryCopies !== undefined ? portalBook.complimentaryCopies : (author.complimentaryCopies || 5);
  const authorCopies = portalBook?.authorCopies !== undefined ? portalBook.authorCopies : (author.authorCopies || 10);
  const bookCoverStatus = portalBook?.bookCoverStatus || author.bookCoverStatus || "Pending";
  const bookFormattingStatus = portalBook?.bookFormattingStatus || author.bookFormattingStatus || "Pending";
  const bookReadyToPrintStatus = portalBook?.bookReadyToPrintStatus || author.bookReadyToPrintStatus || "Pending";
  const printingStatus = portalBook?.printingStatus || author.printingStatus || "Pending";
  const deliveryStatus = portalBook?.deliveryStatus || author.deliveryStatus || "Pending";
  const coverApproval = portalBook?.coverApproval || author.coverApproval || "Pending";
  const formattingApproval = portalBook?.formattingApproval || author.formattingApproval || "Pending";
  const finalProofApproval = portalBook?.finalProofApproval || author.finalProofApproval || "Pending";
  const courierPartner = portalBook?.courierPartner || author.courierPartner || "";
  const trackingNumber = portalBook?.trackingNumber || author.trackingNumber || "";
  const dispatchDate = portalBook?.dispatchDate || author.dispatchDate || "";
  const expectedDeliveryDate = portalBook?.expectedDeliveryDate || author.expectedDeliveryDate || "";
  const paymentMethod = portalBook?.paymentMethod || author.paymentMethod || "UPI";
  const paymentDate = portalBook?.paymentDate || author.paymentDate || "";
  const transactionId = portalBook?.transactionId || author.transactionId || "";
  const invoiceUrl = portalBook?.invoiceUrl || author.invoiceUrl || "";
  const paymentNotes = portalBook?.paymentNotes || author.paymentNotes || "";

  const defaultWorkflowSteps = [
    { stepNumber: 1, name: "Payment", status: (publishingPaymentStatus === "PAID" || author.status === "PAID") ? "Completed" : "Pending", value: "" },
    { stepNumber: 2, name: "ISBN Generated", status: "Pending", value: finalIsbn },
    { stepNumber: 3, name: "Book Page", status: "Pending", value: String(pageCount) },
    { stepNumber: 4, name: "Book Cover", status: "Pending", value: "" },
    { stepNumber: 5, name: "Formatting", status: "Pending", value: "" },
    { stepNumber: 6, name: "Author Approval", status: "Pending", value: "" },
    { stepNumber: 7, name: "Ready to Print", status: "Pending", value: "" },
    { stepNumber: 8, name: "Printing", status: "Pending", value: "" },
    { stepNumber: 9, name: "Stock Ready", status: "Pending", value: "" },
    { stepNumber: 10, name: "Delivery", status: "Pending", value: "" },
    { stepNumber: 11, name: "Published", status: "Pending", value: "" }
  ];

  const workflowSteps = (portalBook?.workflowSteps?.length >= 9)
    ? portalBook.workflowSteps
    : (author.workflowSteps?.length >= 9 ? author.workflowSteps : defaultWorkflowSteps);

  return {
    bookTitle: finalBookTitle,
    formData: {
      pageCount,
      isbnNo: finalIsbn,
      totalCopiesPrinted,
      damagedCopies,
      complimentaryCopies,
      authorCopies,
      bookCoverStatus,
      bookFormattingStatus,
      bookReadyToPrintStatus,
      printingStatus,
      deliveryStatus,
      planAmount,
      amountPaid,
      publishingPaymentStatus,
      paymentMethod,
      transactionId,
      invoiceUrl,
      paymentDate,
      paymentNotes,
      coverApproval,
      formattingApproval,
      finalProofApproval,
      courierPartner,
      trackingNumber,
      dispatchDate,
      expectedDeliveryDate,
      workflowSteps,
      documents: author.documents || [],
      addOnServices: author.addOnServices || []
    }
  };
}

export default function PublisherExecutionManager({ authors = [], token, onRefresh, allCatalogBooks = [] }) {
  const [selectedAuthorId, setSelectedAuthorId] = useState("");
  const [selectedBookTitle, setSelectedBookTitle] = useState("");
  const [currentAuthor, setCurrentAuthor] = useState(null);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  // Search & Dropdown states
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Book Selection Dropdown
  const [bookSearchQuery, setBookSearchQuery] = useState("");
  const [isBookDropdownOpen, setIsBookDropdownOpen] = useState(false);
  const bookDropdownRef = useRef(null);

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
    publishingPaymentStatus: "PAID",
    paymentMethod: "UPI",
    transactionId: "",
    invoiceUrl: "",
    paymentDate: "",
    paymentNotes: "",
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

  // Click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (bookDropdownRef.current && !bookDropdownRef.current.contains(event.target)) {
        setIsBookDropdownOpen(false);
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
        const extracted = extractBookFormState(target, selectedBookTitle, allCatalogBooks);
        if (extracted) {
          setSelectedBookTitle(extracted.bookTitle);
          setForm(extracted.formData);
        }
      }
    }
  }, [selectedAuthorId, authors, allCatalogBooks]);

  const handleSelectBook = (book) => {
    setSelectedBookTitle(book.title);
    if (currentAuthor) {
      const extracted = extractBookFormState(currentAuthor, book.title, allCatalogBooks);
      if (extracted) {
        setForm(extracted.formData);
      }
    }
  };

  const handleSaveAll = async () => {
    if (!selectedAuthorId) return;
    try {
      setSaving(true);
      setStatusMsg("");
      const payload = {
        ...form,
        bookTitle: selectedBookTitle,
        planAmount: form.planAmount === "" ? 0 : Number(form.planAmount),
        amountPaid: form.amountPaid === "" ? 0 : Number(form.amountPaid),
        pageCount: form.pageCount === "" ? 0 : Number(form.pageCount),
        totalCopiesPrinted: form.totalCopiesPrinted === "" ? 0 : Number(form.totalCopiesPrinted),
        damagedCopies: form.damagedCopies === "" ? 0 : Number(form.damagedCopies),
        complimentaryCopies: form.complimentaryCopies === "" ? 0 : Number(form.complimentaryCopies),
        authorCopies: form.authorCopies === "" ? 0 : Number(form.authorCopies)
      };
      const res = await fetch(`${API_BASE}/publisher/authors/${selectedAuthorId}/full-workflow`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg(`Details for “${selectedBookTitle || 'Book'}” updated successfully!`);
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

  const filteredAuthors = (authors || []).filter((a) => {
    const q = (searchQuery || "").toLowerCase();
    const nameMatch = (a?.name || "").toLowerCase().includes(q);
    const emailMatch = (a?.email || "").toLowerCase().includes(q);
    const books = getAuthorBooks(a, allCatalogBooks);
    const bookMatch = books.some((b) => (b?.title || "").toLowerCase().includes(q));
    return nameMatch || emailMatch || bookMatch;
  });

  const selectedAuthorObj = (authors || []).find((a) => (a.id || a._id) === selectedAuthorId) || currentAuthor;

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
            Select Author
          </label>

          {/* Trigger Button */}
          <div
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full bg-[#09090d] border border-[#c8923a]/40 hover:border-[#f3c06b] rounded-2xl p-4 flex items-center justify-between cursor-pointer shadow-xl transition-all duration-300 group"
          >
            {selectedAuthorObj ? (
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2a2a3a] to-[#14141d] border border-[#c8923a]/50 p-0.5 flex items-center justify-center font-serif text-sm font-bold text-[#f3c06b] overflow-hidden shadow shrink-0">
                  {selectedAuthorObj.thumbnailUrl ? (
                    <img src={selectedAuthorObj.thumbnailUrl} alt={selectedAuthorObj.name} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <span>{selectedAuthorObj.name?.charAt(0) || "A"}</span>
                  )}
                </div>
                <div className="truncate">
                  <h4 className="font-serif text-sm font-extrabold text-white group-hover:text-[#f3c06b] transition truncate">
                    {selectedAuthorObj.name}
                  </h4>
                  {getAuthorBooks(selectedAuthorObj, allCatalogBooks).length > 0 ? (
                    <p className="text-xs text-[#f3c06b] font-medium truncate flex items-center gap-1.5 mt-0.5">
                      <BookOpen className="w-3.5 h-3.5 shrink-0 text-[#f3c06b]" />
                      <span className="truncate">
                        Book: <strong className="text-white font-bold">“{getAuthorBooks(selectedAuthorObj, allCatalogBooks).map((b) => b.title).join(", ")}”</strong>
                      </span>
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400 font-mono truncate">{selectedAuthorObj.email}</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-gray-400 text-xs font-semibold">
                <User className="w-4 h-4 text-[#f3c06b]" />
                <span>Choose an Author from the list...</span>
              </div>
            )}

            <ChevronDown className={`w-5 h-5 text-[#f3c06b] transition-transform duration-300 shrink-0 ${isDropdownOpen ? "rotate-180" : ""}`} />
          </div>

          {/* Floating Dropdown List Panel */}
          {isDropdownOpen && (
            <div
              data-lenis-prevent="true"
              className="absolute top-full left-0 right-0 mt-2 bg-[#0d0d14]/98 backdrop-blur-2xl border border-[#c8923a]/40 rounded-2xl p-3 shadow-2xl z-50 flex flex-col max-h-80"
              style={{ overscrollBehavior: "contain" }}
            >
              {/* Search Box inside dropdown */}
              <div className="relative pb-2 border-b border-[#1f1f2e] shrink-0">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search author by name, email, or book title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-[#050508] border border-[#262638] rounded-xl text-xs text-white focus:outline-none focus:border-[#c8923a]"
                />
              </div>

              {/* Scrollable list items */}
              <div
                data-lenis-prevent="true"
                className="space-y-1 mt-2 overflow-y-auto max-h-60 flex-1 custom-scrollbar pr-1"
                style={{ overscrollBehavior: "contain", touchAction: "pan-y" }}
              >
                {filteredAuthors.length === 0 ? (
                  <div className="p-4 text-center text-xs text-gray-500">No authors found matching "{searchQuery}"</div>
                ) : (
                  filteredAuthors.map((auth) => {
                    const isSelected = (auth.id || auth._id) === selectedAuthorId;
                    const authBooks = getAuthorBooks(auth, allCatalogBooks);
                    return (
                      <div
                        key={auth.id || auth._id || auth.email}
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
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-[#181824] border border-[#c8923a]/30 flex items-center justify-center font-serif text-xs font-bold text-[#f3c06b] overflow-hidden shrink-0">
                            {auth.thumbnailUrl ? (
                              <img src={auth.thumbnailUrl} alt={auth.name} className="w-full h-full object-cover" />
                            ) : (
                              auth.name?.charAt(0) || "A"
                            )}
                          </div>
                          <div className="truncate">
                            <p className="font-serif text-xs font-bold text-white truncate">{auth.name}</p>
                            {authBooks.length > 0 ? (
                              <p className="text-[11px] text-[#f3c06b] font-medium truncate flex items-center gap-1 mt-0.5">
                                <BookOpen className="w-3 h-3 shrink-0 text-[#f3c06b]" />
                                <span className="truncate">“{authBooks.map((b) => b.title).join(", ")}”</span>
                              </p>
                            ) : (
                              <p className="text-[11px] text-gray-400 font-mono truncate">{auth.email}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 ml-2">
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

      {currentAuthor && (() => {
        const currentAuthorBooks = getAuthorBooks(currentAuthor, allCatalogBooks);
        return (
          <div className="space-y-8">
            {/* AUTHOR SUMMARY BAR WITH ASSOCIATED BOOKS */}
            <div className="bg-[#0e0e14] border border-[#1f1f2e] rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-serif text-2xl font-extrabold text-white">{currentAuthor.name}</h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#181824] border border-[#c8923a]/40 text-[#f3c06b] text-[11px] font-bold">
                      {currentAuthorBooks.length} Associated Book{currentAuthorBooks.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    <span className="font-mono text-gray-300">{currentAuthor.email}</span> • Book Page: <span className="text-white font-bold">{form.pageCount || "—"}</span> • ISBN: <span className="text-white font-bold">{form.isbnNo || "—"}</span>
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

              {/* ASSOCIATED BOOKS LISTING & INTERACTIVE SWITCHER */}
              <div className="pt-3 border-t border-[#1c1c28] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-[#f3c06b] flex items-center gap-1.5 shrink-0">
                    <BookOpen className="w-4 h-4 text-[#f3c06b]" />
                    <span>Associated Book Under Execution:</span>
                  </span>
                  {currentAuthorBooks.length > 0 ? (
                    <span className="text-xs text-white font-bold bg-[#14141e] px-3.5 py-1.5 rounded-xl border border-[#c8923a]/40 shadow-sm flex items-center gap-2">
                      <span className="text-[#f3c06b]">“{selectedBookTitle || currentAuthorBooks[0]?.title}”</span>
                      {(() => {
                        const activeBk = currentAuthorBooks.find(
                          (b) => b.title?.toLowerCase() === (selectedBookTitle || "").toLowerCase()
                        ) || currentAuthorBooks[0];
                        return activeBk?.isbn && activeBk.isbn !== "—" ? (
                          <span className="text-[10px] text-gray-400 font-mono">ISBN: {activeBk.isbn}</span>
                        ) : null;
                      })()}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400 italic">No specific book titles registered yet</span>
                  )}
                </div>

                {currentAuthorBooks.length > 1 && (
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-gray-400 font-medium">Switch Book:</span>
                    <div className="relative min-w-[220px] max-w-xs">
                      <select
                        value={selectedBookTitle || currentAuthorBooks[0]?.title}
                        onChange={(e) => {
                          const chosen = currentAuthorBooks.find((b) => b.title === e.target.value);
                          if (chosen) handleSelectBook(chosen);
                        }}
                        className="w-full bg-[#09090d] border border-[#c8923a]/40 hover:border-[#f3c06b] text-white text-xs font-bold rounded-xl px-3.5 py-2 pr-9 outline-none cursor-pointer appearance-none shadow-md"
                      >
                        {currentAuthorBooks.map((bk, idx) => (
                          <option key={idx} value={bk.title} className="bg-[#0f0f17] text-white py-1">
                            {bk.title} {bk.isbn && bk.isbn !== "—" ? `(ISBN: ${bk.isbn})` : ""}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-[#f3c06b] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 11-STEP PUBLISHING ROADMAP — PUBLISHER UPDATE CARD */}
            <div className="bg-[#0e0e14] border border-[#1f1f2e] rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-serif text-xl font-extrabold text-white flex items-center gap-2 flex-wrap">
                    <span>Publishing Roadmap</span>
                    {selectedBookTitle ? (
                      <span className="text-xs font-bold text-[#f3c06b] bg-[#1a1a28] px-3 py-1 rounded-lg border border-[#c8923a]/40">
                        Target Book: <strong className="font-bold text-white">“{selectedBookTitle}”</strong>
                      </span>
                    ) : currentAuthorBooks.length > 0 ? (
                      <span className="text-sm font-normal text-[#f3c06b]">
                        — “{currentAuthorBooks.map((b) => b.title).join(", ")}”
                      </span>
                    ) : null}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Update every milestone here; Author Dashboard will reflect the changes automatically for the selected book.
                  </p>
                </div>
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
              {/* BOOK IN EXECUTION HIGHLIGHT BANNER */}
              <div className="bg-gradient-to-r from-[#171724] via-[#12121a] to-[#171724] border-2 border-[#c8923a]/50 p-5 rounded-2xl shadow-xl space-y-3.5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#2a2a3a] to-[#12121c] border border-[#f3c06b] flex items-center justify-center text-[#f3c06b] shadow-md shrink-0">
                      <BookOpenCheck className="w-6 h-6 text-[#f3c06b]" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#f3c06b] flex items-center gap-2">
                        <span>Book Under Execution</span>
                        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      </p>
                      <h4 className="text-base md:text-lg font-black text-white">
                        {selectedBookTitle ? `“${selectedBookTitle}”` : `${currentAuthor.name}'s Book`}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 font-medium">Author:</span>
                    <span className="px-3 py-1 rounded-xl bg-[#09090d] border border-[#2b2b3d] text-xs font-bold text-white">
                      {currentAuthor.name}
                    </span>
                  </div>
                </div>

                {/* Custom Book Dropdown Selector with Lucide SVG Icons */}
                {currentAuthorBooks.length > 1 && (
                  <div className="pt-3 border-t border-[#262638] flex flex-col sm:flex-row sm:items-center gap-3 relative" ref={bookDropdownRef}>
                    <label className="text-xs font-bold text-[#f3c06b] flex items-center gap-1.5 shrink-0">
                      <BookOpen className="w-4 h-4 text-[#f3c06b]" />
                      <span>Choose Book to Update:</span>
                    </label>

                    <div className="relative flex-1 max-w-xl">
                      {/* Custom Trigger Button */}
                      <div
                        onClick={() => setIsBookDropdownOpen(!isBookDropdownOpen)}
                        className="w-full bg-[#08080d] border border-[#c8923a]/50 hover:border-[#f3c06b] rounded-xl px-4 py-2.5 flex items-center justify-between cursor-pointer shadow-lg transition duration-200 group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <BookOpen className="w-4 h-4 text-[#f3c06b] shrink-0" />
                          <span className="text-xs font-bold text-white truncate">
                            {selectedBookTitle || currentAuthorBooks[0]?.title}
                          </span>
                          {(() => {
                            const activeBk = currentAuthorBooks.find(
                              (b) => b.title?.toLowerCase() === (selectedBookTitle || "").toLowerCase()
                            ) || currentAuthorBooks[0];
                            return activeBk?.isbn && activeBk.isbn !== "—" ? (
                              <span className="text-[10px] text-gray-400 font-mono shrink-0 hidden md:inline">
                                (ISBN: {activeBk.isbn})
                              </span>
                            ) : null;
                          })()}
                        </div>

                        <ChevronDown className={`w-4 h-4 text-[#f3c06b] transition-transform duration-200 shrink-0 ${isBookDropdownOpen ? "rotate-180" : ""}`} />
                      </div>

                      {/* Dropdown Options List with Lucide Icons */}
                      {isBookDropdownOpen && (
                        <div
                          data-lenis-prevent="true"
                          className="absolute top-full left-0 right-0 mt-1.5 bg-[#0d0d14]/98 backdrop-blur-xl border border-[#c8923a]/50 rounded-xl p-1.5 shadow-2xl z-50 max-h-60 overflow-y-auto space-y-1"
                          style={{ overscrollBehavior: "contain" }}
                        >
                          {currentAuthorBooks.map((bk, idx) => {
                            const isSelected = (selectedBookTitle || currentAuthorBooks[0]?.title)?.toLowerCase() === bk.title?.toLowerCase();
                            return (
                              <div
                                key={idx}
                                onClick={() => {
                                  handleSelectBook(bk);
                                  setIsBookDropdownOpen(false);
                                }}
                                className={`p-2.5 rounded-lg cursor-pointer flex items-center justify-between transition duration-150 border ${
                                  isSelected
                                    ? "bg-[#c8923a]/20 border-[#c8923a] text-white"
                                    : "hover:bg-[#151522] border-transparent text-gray-300 hover:text-white"
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <BookOpen className={`w-4 h-4 shrink-0 ${isSelected ? "text-[#f3c06b]" : "text-gray-400"}`} />
                                  <div className="truncate">
                                    <p className={`text-xs font-bold truncate ${isSelected ? "text-[#f3c06b]" : "text-white"}`}>
                                      {bk.title}
                                    </p>
                                    {bk.isbn && bk.isbn !== "—" && (
                                      <p className="text-[10px] text-gray-400 font-mono mt-0.5">ISBN: {bk.isbn}</p>
                                    )}
                                  </div>
                                </div>

                                {isSelected && (
                                  <Check className="w-4 h-4 text-[#f3c06b] shrink-0 ml-2" />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <h4 className="font-serif text-lg font-extrabold text-[#f3c06b]">Book Specifications & Print Quantities</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-gray-400 mb-1 font-semibold">Book Pages</label>
                  <input
                    type="number"
                    value={form.pageCount ?? ""}
                    onChange={(e) => setForm({ ...form, pageCount: e.target.value === "" ? "" : Number(e.target.value) })}
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
                    value={form.totalCopiesPrinted ?? ""}
                    onChange={(e) => setForm({ ...form, totalCopiesPrinted: e.target.value === "" ? "" : Number(e.target.value) })}
                    className="w-full bg-[#08080c] border border-[#262636] px-4 py-3 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1 font-semibold">Damaged Copies</label>
                  <input
                    type="number"
                    value={form.damagedCopies ?? ""}
                    onChange={(e) => setForm({ ...form, damagedCopies: e.target.value === "" ? "" : Number(e.target.value) })}
                    className="w-full bg-[#08080c] border border-[#262636] px-4 py-3 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1 font-semibold">Complimentary Copies</label>
                  <input
                    type="number"
                    value={form.complimentaryCopies ?? ""}
                    onChange={(e) => setForm({ ...form, complimentaryCopies: e.target.value === "" ? "" : Number(e.target.value) })}
                    className="w-full bg-[#08080c] border border-[#262636] px-4 py-3 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1 font-semibold">Author Copies</label>
                  <input
                    type="number"
                    value={form.authorCopies ?? ""}
                    onChange={(e) => setForm({ ...form, authorCopies: e.target.value === "" ? "" : Number(e.target.value) })}
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
                  <strong>BOOK STOCK NOTICE:</strong> Only {availableCopies} copies available for{" "}
                  <strong className="text-white">
                    {selectedBookTitle ? `“${selectedBookTitle}”` : (currentAuthorBooks[0]?.title ? `“${currentAuthorBooks[0].title}”` : currentAuthor.name)} ({currentAuthor.name})
                  </strong>. Kindly order to reprint.
                </span>
              </div>
            </div>

          {/* PAYMENT DETAILS CARD */}
          {(() => {
            const planTotal = Number(form.planAmount) || 0;
            const paidTotal = Number(form.amountPaid) || 0;
            const pendingDue = Math.max(0, planTotal - paidTotal);
            const currentStatus = (form.publishingPaymentStatus || "PENDING").toUpperCase();

            const handleSetFullPaid = () => {
              setForm((prev) => ({
                ...prev,
                amountPaid: planTotal,
                publishingPaymentStatus: "PAID",
                workflowSteps: prev.workflowSteps.map((st) =>
                  st.stepNumber === 1 ? { ...st, status: "Completed" } : st
                )
              }));
            };

            const handleSetClearPaid = () => {
              setForm((prev) => ({
                ...prev,
                amountPaid: 0,
                publishingPaymentStatus: "PENDING",
                workflowSteps: prev.workflowSteps.map((st) =>
                  st.stepNumber === 1 ? { ...st, status: "Pending" } : st
                )
              }));
            };

            const handleAmountPaidInputChange = (val) => {
              if (val === "") {
                setForm((prev) => ({
                  ...prev,
                  amountPaid: "",
                  publishingPaymentStatus: "PENDING"
                }));
                return;
              }
              const num = Number(val);
              let newStatus = form.publishingPaymentStatus;
              if (num >= planTotal && planTotal > 0) {
                newStatus = "PAID";
              } else if (num > 0) {
                newStatus = "PARTIAL";
              } else {
                newStatus = "PENDING";
              }
              setForm((prev) => ({
                ...prev,
                amountPaid: num,
                publishingPaymentStatus: newStatus,
                workflowSteps: prev.workflowSteps.map((st) =>
                  st.stepNumber === 1 ? { ...st, status: newStatus === "PAID" ? "Completed" : "Pending" } : st
                )
              }));
            };

            return (
              <div className="bg-[#0e0e14] border border-[#1f1f2e] rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1f1f2e] pb-4">
                  <h4 className="font-serif text-lg font-extrabold text-white flex items-center gap-2 flex-wrap">
                    <DollarSign className="w-5 h-5 text-[#f3c06b]" />
                    <span>Payment & Financial Details</span>
                    {selectedBookTitle && (
                      <span className="text-xs font-sans font-semibold text-[#f3c06b] bg-[#f3c06b]/10 border border-[#f3c06b]/30 px-2.5 py-0.5 rounded-lg">
                        for “{selectedBookTitle}”
                      </span>
                    )}
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-gray-400">Current Status:</span>
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                        currentStatus === "PAID"
                          ? "bg-emerald-500/15 border border-emerald-500/40 text-emerald-300"
                          : currentStatus === "PARTIAL"
                          ? "bg-amber-500/15 border border-amber-500/40 text-amber-300"
                          : "bg-rose-500/15 border border-rose-500/40 text-rose-300"
                      }`}
                    >
                      {currentStatus === "PAID" ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : currentStatus === "PARTIAL" ? (
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                      )}
                      {currentStatus}
                    </span>
                  </div>
                </div>

                {/* 3 LIVE FINANCIAL SUMMARY CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-2xl bg-[#141420] border border-[#262638] flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
                      <Receipt className="w-5 h-5 text-amber-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Total Plan Amount</div>
                      <div className="text-lg font-black text-[#f3c06b] truncate">₹{planTotal.toLocaleString("en-IN")}</div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#141420] border border-[#262638] flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Paid Till Now</div>
                      <div className="text-lg font-black text-emerald-400 truncate">₹{paidTotal.toLocaleString("en-IN")}</div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#141420] border border-[#262638] flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${pendingDue > 0 ? "bg-rose-500/10 border-rose-500/30" : "bg-emerald-500/10 border-emerald-500/30"} border flex items-center justify-center shrink-0`}>
                      {pendingDue > 0 ? (
                        <Clock className="w-5 h-5 text-rose-400" />
                      ) : (
                        <Check className="w-5 h-5 text-emerald-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Pending Due Balance</div>
                      <div className={`text-lg font-black truncate ${pendingDue > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                        ₹{pendingDue.toLocaleString("en-IN")}
                      </div>
                    </div>
                  </div>
                </div>

                {/* FORM INPUTS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block text-gray-400 mb-1.5 font-semibold">Total Plan Amount (₹)</label>
                    <input
                      type="number"
                      value={form.planAmount ?? ""}
                      onChange={(e) => setForm({ ...form, planAmount: e.target.value === "" ? "" : Number(e.target.value) })}
                      className="w-full bg-[#08080c] border border-[#262636] focus:border-[#f3c06b] px-4 py-3 rounded-xl text-white font-mono focus:outline-none transition-colors"
                      placeholder="e.g. 5000"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-gray-400 font-semibold">Amount Paid (₹)</label>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={handleSetFullPaid}
                          className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 underline bg-emerald-500/10 px-1.5 py-0.5 rounded cursor-pointer"
                        >
                          Mark Full Paid
                        </button>
                        <button
                          type="button"
                          onClick={handleSetClearPaid}
                          className="text-[10px] font-bold text-gray-400 hover:text-gray-300 underline bg-gray-700/30 px-1.5 py-0.5 rounded cursor-pointer"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                    <input
                      type="number"
                      value={form.amountPaid ?? ""}
                      onChange={(e) => handleAmountPaidInputChange(e.target.value)}
                      className="w-full bg-[#08080c] border border-[#262636] focus:border-emerald-500 px-4 py-3 rounded-xl text-emerald-300 font-mono font-bold focus:outline-none transition-colors"
                      placeholder="e.g. 2500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-1.5 font-semibold flex items-center justify-between">
                      <span>Pending Due Amount (₹)</span>
                      <span className="text-[10px] text-gray-400 font-normal">Auto-calculated</span>
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={`₹${pendingDue.toLocaleString("en-IN")}`}
                      className={`w-full bg-[#08080c] border border-[#262636] px-4 py-3 rounded-xl font-mono font-bold cursor-not-allowed ${
                        pendingDue > 0 ? "text-rose-400 bg-rose-950/10" : "text-emerald-400 bg-emerald-950/10"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-1.5 font-semibold">Payment Status</label>
                    <select
                      value={form.publishingPaymentStatus}
                      onChange={(e) => {
                        const nextStatus = e.target.value;
                        setForm({
                          ...form,
                          publishingPaymentStatus: nextStatus,
                          workflowSteps: form.workflowSteps.map((st) =>
                            st.stepNumber === 1
                              ? { ...st, status: nextStatus === "PAID" ? "Completed" : "Pending" }
                              : st
                          )
                        });
                      }}
                      className="w-full bg-[#08080c] border border-[#262636] focus:border-[#f3c06b] px-4 py-3 rounded-xl text-white font-medium focus:outline-none transition-colors"
                    >
                      <option value="PAID">PAID (Full Amount Received)</option>
                      <option value="PARTIAL">PARTIAL (Partial Amount Paid)</option>
                      <option value="PENDING">PENDING (Payment Awaited)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-1.5 font-semibold">Payment Method / Mode</label>
                    <select
                      value={form.paymentMethod || "UPI"}
                      onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                      className="w-full bg-[#08080c] border border-[#262636] focus:border-[#f3c06b] px-4 py-3 rounded-xl text-white font-medium focus:outline-none transition-colors"
                    >
                      <option value="UPI">UPI (Google Pay, PhonePe, Paytm)</option>
                      <option value="Bank Transfer">Bank Transfer / NEFT / RTGS</option>
                      <option value="Net Banking">Net Banking</option>
                      <option value="Card">Debit / Credit Card</option>
                      <option value="Cash">Cash Deposit</option>
                      <option value="Cheque">Cheque</option>
                      <option value="Other">Other Mode</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-1.5 font-semibold">Transaction ID / UTR No.</label>
                    <input
                      type="text"
                      placeholder="e.g. UPI/1234567890/REF"
                      value={form.transactionId || ""}
                      onChange={(e) => setForm({ ...form, transactionId: e.target.value })}
                      className="w-full bg-[#08080c] border border-[#262636] focus:border-[#f3c06b] px-4 py-3 rounded-xl text-white font-mono focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-1.5 font-semibold">Payment Date</label>
                    <input
                      type="date"
                      value={form.paymentDate || ""}
                      onChange={(e) => setForm({ ...form, paymentDate: e.target.value })}
                      className="w-full bg-[#08080c] border border-[#262636] focus:border-[#f3c06b] px-4 py-3 rounded-xl text-white focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-gray-400 mb-1.5 font-semibold">Invoice Link / Receipt URL</label>
                    <input
                      type="text"
                      placeholder="https://... or Invoice Document Link"
                      value={form.invoiceUrl || ""}
                      onChange={(e) => setForm({ ...form, invoiceUrl: e.target.value })}
                      className="w-full bg-[#08080c] border border-[#262636] focus:border-[#f3c06b] px-4 py-3 rounded-xl text-white focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-gray-400 mb-1.5 font-semibold">Payment Notes / Remarks</label>
                    <input
                      type="text"
                      placeholder="e.g. 50% advance received, balance payable before final printing delivery"
                      value={form.paymentNotes || ""}
                      onChange={(e) => setForm({ ...form, paymentNotes: e.target.value })}
                      className="w-full bg-[#08080c] border border-[#262636] focus:border-[#f3c06b] px-4 py-3 rounded-xl text-white focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>
            );
          })()}

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
              className="px-8 py-3.5 bg-gradient-to-r from-[#d99b38] to-[#f3c06b] hover:from-[#e5a845] hover:to-[#fbd080] text-black font-extrabold text-sm rounded-2xl shadow-xl shadow-[#c8923a]/20 transition flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-5 h-5" />
              <span>{saving ? "Saving All Changes..." : "Save All Book Execution Changes"}</span>
            </button>
          </div>
        </div>
        );
      })()}
    </div>
  );
}
