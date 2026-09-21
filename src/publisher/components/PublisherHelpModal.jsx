import React, { useState } from "react";
import {
  HelpCircle,
  X,
  LayoutDashboard,
  BookOpenCheck,
  Users,
  CreditCard,
  BookOpen,
  DollarSign,
  Briefcase,
  Layers,
  Sparkles,
  Link2,
  CheckCircle2,
  PackageCheck,
  ChevronRight,
  TrendingUp,
  Truck,
  Edit3,
  Zap,
  Globe,
  UserPlus,
  PlusCircle
} from "lucide-react";

export default function PublisherHelpModal({ isOpen, onClose, onSelectTab }) {
  const [activeGuideSection, setActiveGuideSection] = useState("overview");

  if (!isOpen) return null;

  const sections = [
    {
      id: "overview",
      label: "Overview Tab",
      icon: LayoutDashboard,
      badge: "Analytics & Finance",
      color: "from-amber-500/20 to-amber-500/5",
      borderColor: "border-amber-500/40",
      textColor: "text-[#f3c06b]"
    },
    {
      id: "execution",
      label: "Execution Manager",
      icon: BookOpenCheck,
      badge: "Roadmap & Inventory",
      color: "from-blue-500/20 to-blue-500/5",
      borderColor: "border-blue-500/40",
      textColor: "text-blue-400"
    },
    {
      id: "authors",
      label: "Authors Directory",
      icon: Users,
      badge: "Author & Books",
      color: "from-purple-500/20 to-purple-500/5",
      borderColor: "border-purple-500/40",
      textColor: "text-purple-400"
    },
    {
      id: "sales",
      label: "Sales & Payments",
      icon: CreditCard,
      badge: "Ledger & Royalties",
      color: "from-emerald-500/20 to-emerald-500/5",
      borderColor: "border-emerald-500/40",
      textColor: "text-emerald-400"
    },
    {
      id: "workflows",
      label: "Key Workflows",
      icon: Sparkles,
      badge: "Quick How-To",
      color: "from-rose-500/20 to-rose-500/5",
      borderColor: "border-rose-500/40",
      textColor: "text-rose-400"
    }
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      data-lenis-prevent="true"
      onClick={onClose}
    >
      <div
        className="bg-[#0e0e16] border border-[#c8923a]/50 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]"
        data-lenis-prevent="true"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-[#222234] bg-[#0a0a10] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#2a2a3a] to-[#14141e] border border-[#c8923a]/50 flex items-center justify-center text-[#f3c06b] shadow-md">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-extrabold text-white flex items-center gap-2">
                <span>Publisher & Admin Portal Guide</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-[#f3c06b] border border-amber-500/30">
                  Help Center
                </span>
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Learn what each dashboard page does and how to manage book publishing execution.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-xl hover:bg-white/5 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body with Sidebar + Content */}
        <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-hidden">
          {/* Guide Navigation Sidebar */}
          <div className="w-full md:w-60 bg-[#08080c] border-b md:border-b-0 md:border-r border-[#1c1c28] p-3 space-y-1.5 shrink-0 overflow-x-auto md:overflow-y-auto flex md:flex-col custom-scrollbar gold-scrollbar">
            {sections.map((sec) => {
              const IconComponent = sec.icon;
              const isActive = activeGuideSection === sec.id;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setActiveGuideSection(sec.id)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-between gap-2 transition cursor-pointer shrink-0 ${
                    isActive
                      ? `bg-gradient-to-r ${sec.color} ${sec.textColor} border ${sec.borderColor}`
                      : "text-gray-400 hover:text-white hover:bg-[#12121c]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <IconComponent className="w-4 h-4 shrink-0" />
                    <span>{sec.label}</span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 opacity-0 md:opacity-100 ${isActive ? "opacity-100" : "text-gray-600"}`} />
                </button>
              );
            })}
          </div>

          {/* Guide Content Display */}
          <div
            className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-5 custom-scrollbar gold-scrollbar"
            data-lenis-prevent="true"
            style={{ overscrollBehavior: "contain" }}
          >
            {/* OVERVIEW TAB GUIDE */}
            {activeGuideSection === "overview" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#222232] pb-3">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#f3c06b] flex items-center gap-2">
                      <LayoutDashboard className="w-5 h-5" />
                      <span>Overview Tab — Executive Summary</span>
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                      Aggregated revenue, royalties, fees, and author payment status across the entire publishing house.
                    </p>
                  </div>
                  {onSelectTab && (
                    <button
                      type="button"
                      onClick={() => {
                        onSelectTab("overview");
                        onClose();
                      }}
                      className="px-3 py-1.5 bg-[#161622] hover:bg-[#202030] text-[#f3c06b] border border-[#c8923a]/40 text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      Open Overview →
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-[#12121c] border border-[#222232] p-3.5 rounded-2xl space-y-1.5">
                    <div className="flex items-center gap-2 text-white font-bold">
                      <DollarSign className="w-4 h-4 text-[#f3c06b]" />
                      <span>Financial Metric Cards</span>
                    </div>
                    <p className="text-gray-400 leading-relaxed">
                      Displays <strong>Total Books Sold</strong>, <strong>Gross Sales</strong>, <strong>Author Royalty Profits</strong>, and <strong>Total Pending Fees</strong>. Below that, tracks Publishing Fees Due vs. Received.
                    </p>
                  </div>

                  <div className="bg-[#12121c] border border-[#222232] p-3.5 rounded-2xl space-y-1.5">
                    <div className="flex items-center gap-2 text-white font-bold">
                      <Users className="w-4 h-4 text-emerald-400" />
                      <span>Payment Breakdown Table</span>
                    </div>
                    <p className="text-gray-400 leading-relaxed">
                      Detailed breakdown of each author's plan fees (Plan Amount, Plan Paid, Plan Pending) and royalties (Earned, Paid, Pending). Clicking any author opens their catalog.
                    </p>
                  </div>
                </div>

                <div className="bg-[#12121c] border border-[#222232] p-4 rounded-2xl space-y-2 text-xs">
                  <h4 className="font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#f3c06b]" />
                    <span>What can you do here?</span>
                  </h4>
                  <ul className="list-disc list-inside text-gray-300 space-y-1.5 pl-1 leading-relaxed">
                    <li>Monitor global publisher earnings and author royalty liabilities in real-time.</li>
                    <li>Click on any author in the payment breakdown to quickly view all books associated with them.</li>
                    <li>Identify authors with pending publishing fees or unpaid royalty balances.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* EXECUTION MANAGER TAB GUIDE */}
            {activeGuideSection === "execution" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#222232] pb-3">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-blue-400 flex items-center gap-2">
                      <BookOpenCheck className="w-5 h-5" />
                      <span>Execution Manager — Detailed Book Operations</span>
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                      The core operational hub for managing 11-step publishing roadmaps, ISBN, page counts, inventory, and delivery.
                    </p>
                  </div>
                  {onSelectTab && (
                    <button
                      type="button"
                      onClick={() => {
                        onSelectTab("execution");
                        onClose();
                      }}
                      className="px-3 py-1.5 bg-[#161622] hover:bg-[#202030] text-blue-400 border border-blue-500/40 text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      Open Execution →
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-[#12121c] border border-[#222232] p-3.5 rounded-2xl space-y-1.5">
                    <div className="flex items-center gap-2 text-white font-bold">
                      <PackageCheck className="w-4 h-4 text-blue-400" />
                      <span>11-Step Publishing Roadmap</span>
                    </div>
                    <p className="text-gray-400 leading-relaxed">
                      Update milestones from <em>Payment</em>, <em>ISBN Generated</em>, <em>Book Page</em> to <em>Formatting</em>, <em>Ready to Print</em>, <em>Stock Ready</em>, and <em>Published</em>. Changes reflect automatically on the Author Portal.
                    </p>
                  </div>

                  <div className="bg-[#12121c] border border-[#222232] p-3.5 rounded-2xl space-y-1.5">
                    <div className="flex items-center gap-2 text-white font-bold">
                      <Layers className="w-4 h-4 text-[#f3c06b]" />
                      <span>Book Print & Inventory Quantities</span>
                    </div>
                    <p className="text-gray-400 leading-relaxed">
                      Configure <strong>Total Copies Printed</strong>, <strong>Author Copies</strong>, <strong>Damaged Copies</strong>, and <strong>Complimentary Copies</strong>. Available stock is calculated automatically.
                    </p>
                  </div>
                </div>

                <div className="bg-[#12121c] border border-[#222232] p-4 rounded-2xl space-y-2 text-xs">
                  <h4 className="font-bold text-white flex items-center gap-2">
                    <Truck className="w-4 h-4 text-emerald-400" />
                    <span>Delivery Tracking & Courier Info</span>
                  </h4>
                  <p className="text-gray-300 leading-relaxed">
                    Enter the courier partner (e.g. DTDC, BlueDart, India Post), tracking number, dispatch date, and expected delivery date so the author can track printed copy delivery in their portal.
                  </p>
                </div>
              </div>
            )}

            {/* AUTHORS DIRECTORY TAB GUIDE */}
            {activeGuideSection === "authors" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#222232] pb-3">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-purple-400 flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      <span>Authors Tab — Directory & Catalog Management</span>
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                      Directory of all registered authors, contact info, publishing plans, and catalog of associated books.
                    </p>
                  </div>
                  {onSelectTab && (
                    <button
                      type="button"
                      onClick={() => {
                        onSelectTab("authors");
                        onClose();
                      }}
                      className="px-3 py-1.5 bg-[#161622] hover:bg-[#202030] text-purple-400 border border-purple-500/40 text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      Open Authors →
                    </button>
                  )}
                </div>

                <div className="space-y-3 text-xs">
                  <div className="bg-[#12121c] border border-[#222232] p-3.5 rounded-2xl space-y-2">
                    <h4 className="font-bold text-white flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-[#f3c06b]" />
                      <span>Key Actions Available per Author:</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-gray-300">
                      <div className="p-3 bg-[#09090f] rounded-xl border border-[#1e1e2d] space-y-1">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-3.5 h-3.5 text-[#f3c06b]" />
                          <strong className="text-white">View Books:</strong>
                        </div>
                        <p className="text-gray-400 text-[11px] leading-relaxed">
                          Opens the author's complete catalog. Add new books, delete old ones, or edit store links.
                        </p>
                      </div>

                      <div className="p-3 bg-[#09090f] rounded-xl border border-[#1e1e2d] space-y-1">
                        <div className="flex items-center gap-2">
                          <Edit3 className="w-3.5 h-3.5 text-[#f3c06b]" />
                          <strong className="text-white">Edit Details:</strong>
                        </div>
                        <p className="text-gray-400 text-[11px] leading-relaxed">
                          Update author name, email, phone, selected plan, and reset portal passwords.
                        </p>
                      </div>

                      <div className="p-3 bg-[#09090f] rounded-xl border border-[#1e1e2d] space-y-1">
                        <div className="flex items-center gap-2">
                          <Zap className="w-3.5 h-3.5 text-amber-400" />
                          <strong className="text-white">Edit 9-Step Progress:</strong>
                        </div>
                        <p className="text-gray-400 text-[11px] leading-relaxed">
                          Quick popup workflow editor with book switching dropdown &amp; live financial breakdown.
                        </p>
                      </div>

                      <div className="p-3 bg-[#09090f] rounded-xl border border-[#1e1e2d] space-y-1">
                        <div className="flex items-center gap-2">
                          <Link2 className="w-3.5 h-3.5 text-cyan-400" />
                          <strong className="text-white">Store Links:</strong>
                        </div>
                        <p className="text-gray-400 text-[11px] leading-relaxed">
                          Add Amazon, Kindle, Flipkart, and Web Reader preview URLs for each book.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SALES & PAYMENTS TAB GUIDE */}
            {activeGuideSection === "sales" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#222232] pb-3">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-emerald-400 flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      <span>Sales & Payments Tab — Sales Ledger & Royalties</span>
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                      Record book sales transactions, calculate author profit royalties, and maintain sales history.
                    </p>
                  </div>
                  {onSelectTab && (
                    <button
                      type="button"
                      onClick={() => {
                        onSelectTab("sales");
                        onClose();
                      }}
                      className="px-3 py-1.5 bg-[#161622] hover:bg-[#202030] text-emerald-400 border border-emerald-500/40 text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      Open Sales →
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-[#12121c] border border-[#222232] p-3.5 rounded-2xl space-y-1.5">
                    <div className="flex items-center gap-2 text-white font-bold">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      <span>Record New Book Sale</span>
                    </div>
                    <p className="text-gray-400 leading-relaxed">
                      Select an author and their registered book, enter quantity and unit price. The 70% author royalty profit is auto-calculated and added to author earnings.
                    </p>
                  </div>

                  <div className="bg-[#12121c] border border-[#222232] p-3.5 rounded-2xl space-y-1.5">
                    <div className="flex items-center gap-2 text-white font-bold">
                      <CreditCard className="w-4 h-4 text-[#f3c06b]" />
                      <span>Sales History & Ledger</span>
                    </div>
                    <p className="text-gray-400 leading-relaxed">
                      Full historical ledger with date, author, book title, units, gross revenue, author profit, and distribution channel (Direct, Amazon, Flipkart, Event).
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* KEY WORKFLOWS GUIDE */}
            {activeGuideSection === "workflows" && (
              <div className="space-y-4">
                <div className="border-b border-[#222232] pb-3">
                  <h3 className="font-serif text-lg font-bold text-rose-400 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    <span>Quick How-To & Best Practices</span>
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Step-by-step instructions for common publishing management tasks.
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="bg-[#12121c] border border-[#222232] p-3.5 rounded-2xl space-y-1.5">
                    <div className="flex items-center gap-2">
                      <UserPlus className="w-4 h-4 text-[#f3c06b]" />
                      <strong className="text-[#f3c06b] font-bold">1. How to Register a New Author:</strong>
                    </div>
                    <p className="text-gray-300 leading-relaxed">
                      Click <strong>"+ Add Author"</strong> at the top bar or sidebar. Enter author full name, email ID, phone, and publishing plan. Login credentials will be generated and emailed automatically.
                    </p>
                  </div>

                  <div className="bg-[#12121c] border border-[#222232] p-3.5 rounded-2xl space-y-1.5">
                    <div className="flex items-center gap-2">
                      <BookOpenCheck className="w-4 h-4 text-blue-400" />
                      <strong className="text-blue-400 font-bold">2. How to Update Workflow for Multiple Books:</strong>
                    </div>
                    <p className="text-gray-300 leading-relaxed">
                      In the <strong>Edit 9-Step Progress</strong> modal or <strong>Execution Manager</strong>, select the target book from the dropdown. Set ISBN, page count, payment status, and milestones. Each book maintains independent status.
                    </p>
                  </div>

                  <div className="bg-[#12121c] border border-[#222232] p-3.5 rounded-2xl space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-emerald-400" />
                      <strong className="text-emerald-400 font-bold">3. How to Add Marketplace Links:</strong>
                    </div>
                    <p className="text-gray-300 leading-relaxed">
                      Under <strong>Authors &rarr; View Books</strong>, click <strong>"Marketplace Links"</strong> on any book card. Use preset buttons to add Amazon, Kindle, Flipkart, or Web Reader links for readers.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 sm:p-5 border-t border-[#222234] bg-[#0a0a10] shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-gradient-to-r from-[#d99b38] to-[#f3c06b] hover:from-[#e5a845] hover:to-[#fbd080] text-black text-xs font-extrabold rounded-xl shadow transition cursor-pointer"
          >
            Got It! Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}
