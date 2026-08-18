import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck, Loader2, Plus, Trash2, Printer, Download,
  RefreshCw, Mail, MessageSquare, Check, Sparkles, Building,
  CreditCard, FileText, ArrowLeft, Eye, Edit3, CheckCircle2,
  Copy, X, ExternalLink
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import PageTransition from "../components/PageTransition.jsx";
import AdminNavbar from "../components/AdminNavbar.jsx";
import { API_BASE } from "../config.js";

// Helper: Convert numbers to words in Rupees
function convertNumberToWords(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return "";
  const num = Math.round(amount * 100) / 100;
  const integerPart = Math.floor(Math.abs(num));
  const decimalPart = Math.round((Math.abs(num) - integerPart) * 100);

  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 
             'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function inWords(n) {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
    if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + inWords(n % 100) : '');
    if (n < 100000) return inWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + inWords(n % 1000) : '');
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 !== 0 ? ' ' + inWords(n % 100000) : '');
    return inWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 !== 0 ? ' ' + inWords(n % 10000000) : '');
  }

  let result = integerPart === 0 ? 'Zero' : inWords(integerPart);
  result += ' Rupees';

  if (decimalPart > 0) {
    result += ' and ' + inWords(decimalPart) + ' Paise';
  }

  result += ' Only';
  return result;
}

// Helper: Get Financial Year string (e.g., "26-27")
function getFinancialYear(dateObj = new Date()) {
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth(); // 0 = Jan, 2 = Mar, 3 = Apr
  let startYear = year;
  if (month < 3) {
    startYear = year - 1;
  }
  const endYear = startYear + 1;
  const startStr = String(startYear).slice(-2);
  const endStr = String(endYear).slice(-2);
  return `${startStr}-${endStr}`;
}

// Helper: Get initial sequence invoice number
function getInitialInvoiceNo() {
  const fy = getFinancialYear();
  let counter = parseInt(localStorage.getItem("lekhok_invoice_counter") || "3", 10);
  if (isNaN(counter)) counter = 3;
  const paddedSeq = String(counter).padStart(4, "0");
  return `LT/TR/${fy}/${paddedSeq}`;
}

export default function AdminInvoicePage() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [authError, setAuthError] = useState("");
  const [submittingAuth, setSubmittingAuth] = useState(false);
  const [loginStep, setLoginStep] = useState("email");
  const [activeTab, setActiveTab] = useState("generator"); // 'generator' | 'preview'
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailRecipient, setEmailRecipient] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [copiedEmailText, setCopiedEmailText] = useState(false);
  const printRef = useRef(null);
  const termsTextareaRef = useRef(null);
  const modalTextareaRef = useRef(null);

  // Lock background body & html scroll when Email Modal is open
  useEffect(() => {
    if (showEmailModal) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      document.body.style.touchAction = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [showEmailModal]);

  // Ensure mouse wheel scrolling inside Email Modal textarea always works seamlessly
  useEffect(() => {
    if (!showEmailModal) return;
    const textareaEl = modalTextareaRef.current;
    if (!textareaEl) return;

    const handleWheel = (e) => {
      if (textareaEl.scrollHeight > textareaEl.clientHeight) {
        textareaEl.scrollTop += e.deltaY;
      }
    };

    textareaEl.addEventListener("wheel", handleWheel, { passive: true });
    return () => {
      textareaEl.removeEventListener("wheel", handleWheel);
    };
  }, [showEmailModal]);

  // Form State
  const initialForm = {
    billInfo: {
      generatedBy: "Admin",
      invoiceNo: getInitialInvoiceNo(),
      billingDate: new Date().toISOString().split("T")[0],
      paymentMode: "Google Pay",
    },
    billTo: {
      name: "",
      address: "",
      state: "Tripura",
      gstNo: "NA",
      phoneNo: "",
      email: "",
    },
    shipTo: {
      sameAsBillTo: true,
      name: "",
      address: "",
      state: "Tripura",
      gstNo: "NA",
    },
    deliveryDetails: {
      deliveryCharges: 0,
      courierName: "NA",
      courierId: "NA",
    },
    items: [
      {
        id: 1,
        description: "",
        hsn: "998313",
        qty: 1,
        rate: 0,
        amount: 0,
      },
    ],
    extraCharges: {
      packagingCharge: 0,
      courierCharge: 0,
      platformCharge: 0,
      discountAmount: 0,
    },
    taxConfig: {
      cgstRate: 9,
      sgstRate: 9,
    },
    bankDetails: {
      accountName: "LEKHOK TRIPURA PUBLISHERS",
      accountNo: "216120210000870",
      ifscCode: "PUNB0216120",
      branchCode: "AKHAURA BRANCH",
      cif: "C02744863",
      micr: "799024013",
      upiId: "LEKHOKTRIPURA@OKHDFCBANK",
    },
    terms: `1. All goods/services mentioned in this invoice are supplied as per the details and specifications agreed with the customer.
2. Delivery, courier, packaging, and other additional charges, if applicable, will be charged as mentioned in the invoice.
3. Refunds, where applicable, will be processed according to the applicable refund/return policy.
4. Customers should retain this invoice as proof of purchase/payment.
5. Service Charge, Delivery Charge, Packaging Charge is not refundable.`,
    signatoryName: "Lekhok Tripura Publishers",
    signatureImage: "/ChatGPT Image Aug 18, 2026, 11_22_16 PM.png",
    customAmountInWords: "",
  };

  const [form, setForm] = useState(initialForm);

  // Check auth
  useEffect(() => {
    fetch(`${API_BASE}/auth/me`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success && data.user && data.user.role === "admin") {
          setAuthed(true);
        } else {
          setAuthed(false);
        }
      })
      .catch(() => setAuthed(false))
      .finally(() => setChecking(false));
  }, []);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email) return;
    setSubmittingAuth(true);
    setAuthError("");
    try {
      const res = await fetch(`${API_BASE}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setLoginStep("otp");
      } else {
        setAuthError(data.message || "Failed to send code.");
      }
    } catch {
      setAuthError("Server unreachable.");
    } finally {
      setSubmittingAuth(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) return;
    setSubmittingAuth(true);
    setAuthError("");
    try {
      const res = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
        credentials: "include",
      });
      const data = await res.json();
      if (data.success && data.user?.role === "admin") {
        setAuthed(true);
      } else {
        setAuthError(data.message || "Invalid OTP / permissions.");
      }
    } catch {
      setAuthError("Verification failed.");
    } finally {
      setSubmittingAuth(false);
    }
  };

  // Prevent wheel scroll chaining on Terms & Conditions textarea without locking body overflow
  useEffect(() => {
    const el = termsTextareaRef.current;
    if (!el) return;

    const handleWheel = (e) => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const isScrollingDown = e.deltaY > 0;
      const isScrollingUp = e.deltaY < 0;

      // Prevent scroll from propagating to background page when reaching top/bottom limits
      if (
        (isScrollingDown && scrollTop + clientHeight >= scrollHeight - 2) ||
        (isScrollingUp && scrollTop <= 0)
      ) {
        e.preventDefault();
      }
      e.stopPropagation();
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", handleWheel);
    };
  }, [authed, activeTab]);

  // Sync Ship To with Bill To if sameAsBillTo is checked
  useEffect(() => {
    if (form.shipTo.sameAsBillTo) {
      setForm((prev) => ({
        ...prev,
        shipTo: {
          ...prev.shipTo,
          name: prev.billTo.name,
          address: prev.billTo.address,
          state: prev.billTo.state,
          gstNo: prev.billTo.gstNo,
        },
      }));
    }
  }, [form.billTo, form.shipTo.sameAsBillTo]);

  // Handle Item Changes
  const updateItem = (id, field, value) => {
    setForm((prev) => {
      const updatedItems = prev.items.map((item) => {
        if (item.id === id) {
          const newItem = { ...item, [field]: value };
          if (field === "qty" || field === "rate") {
            newItem.amount = (Number(newItem.qty) || 0) * (Number(newItem.rate) || 0);
          }
          return newItem;
        }
        return item;
      });
      return { ...prev, items: updatedItems };
    });
  };

  const addItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: Date.now(),
          description: "",
          hsn: "998313",
          qty: 1,
          rate: 0,
          amount: 0,
        },
      ],
    }));
  };

  const removeItem = (id) => {
    if (form.items.length <= 1) return;
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));
  };

  // Calculations
  const subTotal = form.items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const taxableAmount = subTotal;
  const cgstAmount = taxableAmount * (Number(form.taxConfig.cgstRate) / 100);
  const sgstAmount = taxableAmount * (Number(form.taxConfig.sgstRate) / 100);
  const totalTax = cgstAmount + sgstAmount;
  const deliveryChg = Number(form.deliveryDetails.deliveryCharges) || 0;
  const packagingChg = Number(form.extraCharges.packagingCharge) || 0;
  const courierChg = Number(form.extraCharges.courierCharge) || 0;
  const platformChg = Number(form.extraCharges.platformCharge) || 0;
  const discount = Number(form.extraCharges.discountAmount) || 0;

  const totalPayable = taxableAmount + totalTax + deliveryChg + packagingChg + courierChg + platformChg - discount;

  const computedAmountInWords = form.customAmountInWords || convertNumberToWords(totalPayable);

  // Formatting date
  const formatDateDisplay = (dStr) => {
    if (!dStr) return "";
    const parts = dStr.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dStr;
  };

  // Printable Action Handlers
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  const handleSendWhatsApp = () => {
    const text = `*LEKHOK TRIPURA PUBLISHERS - INVOICE*
Invoice No: ${form.billInfo.invoiceNo}
Date: ${formatDateDisplay(form.billInfo.billingDate)}
Customer Name: ${form.billTo.name}
Total Amount: ₹${totalPayable.toFixed(2)}
Payment Mode: ${form.billInfo.paymentMode}

Thank you for doing business with Lekhok Tripura Publishers!`;

    const phone = form.billTo.phoneNo.replace(/[^0-9]/g, "");
    const url = phone
      ? `https://api.whatsapp.com/send?phone=91${phone}&text=${encodeURIComponent(text)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;

    window.open(url, "_blank");
  };

  const handleSendEmail = () => {
    const defaultRecipient = form.billTo.email || "";
    const defaultSubject = `Invoice ${form.billInfo.invoiceNo} - Lekhok Tripura Publishers`;
    
    let itemsSummaryText = form.items && form.items.length > 0
      ? form.items.map((item, idx) => `  ${idx + 1}. ${item.description || 'Item'} (Qty: ${item.qty}, Rate: ₹${item.rate}) - ₹${Number(item.amount).toFixed(2)}`).join("\n")
      : "  No items specified.";

    const defaultBody = `Dear ${form.billTo.name || "Customer"},

Thank you for doing business with Lekhok Tripura Publishers! Please find your invoice breakdown below:

------------------------------------------------
INVOICE NUMBER: ${form.billInfo.invoiceNo}
BILLING DATE: ${formatDateDisplay(form.billInfo.billingDate)}
PAYMENT MODE: ${form.billInfo.paymentMode}
------------------------------------------------

ITEM DETAILS:
${itemsSummaryText}

TOTAL PAYABLE AMOUNT: ₹${totalPayable.toFixed(2)}
AMOUNT IN WORDS: ${computedAmountInWords}

------------------------------------------------
BANK PAYMENT DETAILS:
Bank Name: Punjab National Bank
Account Name: ${form.bankDetails.accountName}
Account No: ${form.bankDetails.accountNo}
IFSC Code: ${form.bankDetails.ifscCode}
UPI ID: ${form.bankDetails.upiId}

Official Website: https://www.lekhoktripura.in/
Support Email: lekhok.tripura@gmail.com | Phone: 6033350539

Warm regards,
Lekhok Tripura Publishers`;

    setEmailRecipient(defaultRecipient);
    setEmailSubject(defaultSubject);
    setEmailBody(defaultBody);
    setCopiedEmailText(false);
    setShowEmailModal(true);
  };

  const handleExecuteMailto = () => {
    const mailtoUrl = `mailto:${encodeURIComponent(emailRecipient)}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    // Use invisible anchor element click to trigger OS mail app without opening an empty blank tab in Chrome
    const link = document.createElement("a");
    link.href = mailtoUrl;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
    }, 500);
  };

  const handleOpenGmail = () => {
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(emailRecipient)}&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.open(gmailUrl, "_blank");
  };

  const handleCopyEmailText = () => {
    const fullText = `Subject: ${emailSubject}\n\n${emailBody}`;
    navigator.clipboard.writeText(fullText);
    setCopiedEmailText(true);
    setTimeout(() => setCopiedEmailText(false), 3000);
  };

  // Auto Generate Next Unique Invoice Number
  const generateNewUniqueInvoice = (increment = true) => {
    let counter = parseInt(localStorage.getItem("lekhok_invoice_counter") || "3", 10);
    if (isNaN(counter)) counter = 3;
    const targetNum = increment ? counter + 1 : counter;
    if (increment) {
      localStorage.setItem("lekhok_invoice_counter", String(targetNum));
    }
    const dObj = form.billInfo.billingDate ? new Date(form.billInfo.billingDate) : new Date();
    const fy = getFinancialYear(dObj);
    const paddedSeq = String(targetNum).padStart(4, "0");
    const newInvoiceNo = `LT/TR/${fy}/${paddedSeq}`;

    setForm((prev) => ({
      ...prev,
      billInfo: { ...prev.billInfo, invoiceNo: newInvoiceNo }
    }));
    return newInvoiceNo;
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to reset all invoice fields to default?")) {
      let counter = parseInt(localStorage.getItem("lekhok_invoice_counter") || "3", 10) + 1;
      localStorage.setItem("lekhok_invoice_counter", String(counter));
      const fy = getFinancialYear();
      const freshInvoiceNo = `LT/TR/${fy}/${String(counter).padStart(4, "0")}`;
      setForm({
        ...initialForm,
        billInfo: {
          ...initialForm.billInfo,
          invoiceNo: freshInvoiceNo
        }
      });
    }
  };

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4 text-white">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-zinc-900/90 p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <h1 className="text-xl font-bold">Admin Portal Access</h1>
            <p className="mt-1 text-xs text-white/50">Verify your admin credentials to open Invoice Generator</p>
          </div>

          {authError && (
            <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-center text-xs text-red-300">
              {authError}
            </div>
          )}

          {loginStep === "email" ? (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-white/40">Admin Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@lekhoktripura.in"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-emerald-400 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={submittingAuth}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 py-3 text-sm font-bold text-black transition hover:bg-emerald-300 disabled:opacity-50"
              >
                {submittingAuth ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Authorization OTP"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-white/40">Enter 6-Digit OTP</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="••••••"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-lg font-bold tracking-widest text-white focus:border-emerald-400 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={submittingAuth}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 py-3 text-sm font-bold text-black transition hover:bg-emerald-300 disabled:opacity-50"
              >
                {submittingAuth ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify & Access Invoice Admin"}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      {/* ── PRINT & INPUT STYLES FOR INVOICE GENERATOR ── */}
      <style>{`
        /* Remove top/bottom arrow spinners from number inputs */
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button {
          -webkit-appearance: none !important;
          margin: 0 !important;
        }
        input[type="number"] {
          -moz-appearance: textfield !important;
          appearance: textfield !important;
        }

        @media print {
          body * {
            visibility: hidden;
          }
          #printable-invoice-container, #printable-invoice-container * {
            visibility: visible;
          }
          #printable-invoice-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0.5in !important;
            background: #ffffff !important;
            color: #000000 !important;
            font-size: 11px !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="min-h-screen bg-zinc-950 text-zinc-100 antialiased pb-20">
        <AdminNavbar activeTab="invoices" />

        <main className="container mx-auto px-4 pt-24 lg:pt-28 max-w-7xl">
          {/* Header Bar */}
          <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/10 bg-zinc-900/80 p-6 backdrop-blur-xl shadow-2xl">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">Invoice Generator</h1>
                  <p className="text-xs text-white/50">Create, customize, print & download GST compliant invoices</p>
                </div>
              </div>
            </div>

            {/* Mode Switcher & Quick Actions */}
            <div className="flex items-center gap-3">
              <div className="flex rounded-2xl bg-white/5 p-1 border border-white/10">
                <button
                  onClick={() => setActiveTab("generator")}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                    activeTab === "generator" ? "bg-emerald-400 text-black shadow-lg" : "text-white/60 hover:text-white"
                  }`}
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  Generator Form
                </button>
                <button
                  onClick={() => setActiveTab("preview")}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                    activeTab === "preview" ? "bg-emerald-400 text-black shadow-lg" : "text-white/60 hover:text-white"
                  }`}
                >
                  <Eye className="h-3.5 w-3.5" />
                  Print / Download PDF Preview
                </button>
              </div>
            </div>
          </div>

          <div className={activeTab === "generator" ? "no-print space-y-6" : "hidden no-print"}>
            {/* Top Title Card */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/10 bg-gradient-to-r from-zinc-900/90 via-zinc-900/70 to-zinc-900/90 p-6 text-white shadow-2xl backdrop-blur-xl">
              <div className="flex items-center gap-3.5">
                <img src="/logo.png" alt="Lekhok" className="h-11 w-11 object-contain" />
                <div>
                  <h2 className="text-lg font-black tracking-wider uppercase text-white">LEKHOK TRIPURA PUBLISHERS</h2>
                  <p className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">INVOICE GENERATOR</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 hover:bg-white/10 hover:border-white/20 hover:text-white transition"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Reset Form
                </button>
              </div>
            </div>

            {/* SECTION 1: BILL INFORMATION */}
            <div className="rounded-3xl border border-white/10 bg-zinc-900/80 p-6 text-white shadow-xl backdrop-blur-xl">
              <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-emerald-400 border-b border-white/10 pb-3 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" /> 1. BILL INFORMATION
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="mb-1.5 block text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-white/50">Bill Generated By</label>
                  <input
                    type="text"
                    value={form.billInfo.generatedBy}
                    onChange={(e) => setForm({ ...form, billInfo: { ...form.billInfo, generatedBy: e.target.value } })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs font-medium text-white placeholder-white/20 focus:border-emerald-400/50 focus:bg-white/10 focus:outline-none transition"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-white/50">Invoice No. *</label>
                    <button
                      type="button"
                      onClick={() => generateNewUniqueInvoice(true)}
                      title="Generate Next Unique Invoice No."
                      className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 hover:text-emerald-300 transition"
                    >
                      <Sparkles className="h-3 w-3" /> Auto-Generate
                    </button>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={form.billInfo.invoiceNo}
                      onChange={(e) => setForm({ ...form, billInfo: { ...form.billInfo, invoiceNo: e.target.value } })}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs font-bold text-white tracking-wider focus:border-emerald-400/50 focus:bg-white/10 focus:outline-none transition pr-9"
                    />
                    <button
                      type="button"
                      onClick={() => generateNewUniqueInvoice(true)}
                      className="absolute right-2.5 text-white/40 hover:text-emerald-400 p-1 rounded-lg transition"
                      title="Click to generate next unique sequence"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-white/50">Billing Date</label>
                  <input
                    type="date"
                    value={form.billInfo.billingDate}
                    onChange={(e) => setForm({ ...form, billInfo: { ...form.billInfo, billingDate: e.target.value } })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs font-medium text-white focus:border-emerald-400/50 focus:bg-white/10 focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-white/50">Payment Mode</label>
                  <select
                    value={form.billInfo.paymentMode}
                    onChange={(e) => setForm({ ...form, billInfo: { ...form.billInfo, paymentMode: e.target.value } })}
                    className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3.5 py-2.5 text-xs font-medium text-white focus:border-emerald-400/50 focus:outline-none transition"
                  >
                    <option className="bg-zinc-900 text-white" value="Google Pay">Google Pay</option>
                    <option className="bg-zinc-900 text-white" value="PhonePe">PhonePe</option>
                    <option className="bg-zinc-900 text-white" value="Paytm">Paytm</option>
                    <option className="bg-zinc-900 text-white" value="UPI">UPI</option>
                    <option className="bg-zinc-900 text-white" value="Bank Transfer">Bank Transfer</option>
                    <option className="bg-zinc-900 text-white" value="Cash">Cash</option>
                    <option className="bg-zinc-900 text-white" value="Razorpay">Razorpay</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SECTIONS 2, 3, 4: BILL TO, SHIP TO, DELIVERY DETAILS */}
              <div className="grid gap-6 lg:grid-cols-3">
                {/* 2. BILL TO */}
                <div className="rounded-3xl border border-white/10 bg-zinc-900/80 p-6 text-white shadow-xl backdrop-blur-xl">
                  <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-emerald-400 border-b border-white/10 pb-3 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" /> 2. BILL TO
                  </h3>
                  <div className="space-y-3.5">
                    <div>
                      <label className="mb-1.5 block text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-white/50">Name *</label>
                      <input
                        type="text"
                        value={form.billTo.name}
                        onChange={(e) => setForm({ ...form, billTo: { ...form.billTo, name: e.target.value } })}
                        placeholder="Enter customer full name"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs font-medium text-white placeholder-white/20 focus:border-emerald-400/50 focus:bg-white/10 focus:outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-white/50">Address *</label>
                      <textarea
                        rows={2}
                        value={form.billTo.address}
                        onChange={(e) => setForm({ ...form, billTo: { ...form.billTo, address: e.target.value } })}
                        placeholder="Enter street, city, pincode"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs font-medium text-white placeholder-white/20 focus:border-emerald-400/50 focus:bg-white/10 focus:outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-white/50">State</label>
                      <input
                        type="text"
                        value={form.billTo.state}
                        onChange={(e) => setForm({ ...form, billTo: { ...form.billTo, state: e.target.value } })}
                        placeholder="Tripura"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs font-medium text-white placeholder-white/20 focus:border-emerald-400/50 focus:bg-white/10 focus:outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-white/50">GST No.</label>
                      <input
                        type="text"
                        value={form.billTo.gstNo}
                        onChange={(e) => setForm({ ...form, billTo: { ...form.billTo, gstNo: e.target.value } })}
                        placeholder="NA or GST Number"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs font-medium text-white placeholder-white/20 focus:border-emerald-400/50 focus:bg-white/10 focus:outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-white/50">Phone No.</label>
                      <input
                        type="text"
                        value={form.billTo.phoneNo}
                        onChange={(e) => setForm({ ...form, billTo: { ...form.billTo, phoneNo: e.target.value } })}
                        placeholder="9876543210"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs font-medium text-white placeholder-white/20 focus:border-emerald-400/50 focus:bg-white/10 focus:outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-white/50">Mail ID</label>
                      <input
                        type="email"
                        value={form.billTo.email}
                        onChange={(e) => setForm({ ...form, billTo: { ...form.billTo, email: e.target.value } })}
                        placeholder="customer@example.com"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs font-medium text-white placeholder-white/20 focus:border-emerald-400/50 focus:bg-white/10 focus:outline-none transition"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. SHIP TO */}
                <div className="rounded-3xl border border-white/10 bg-zinc-900/80 p-6 text-white shadow-xl backdrop-blur-xl">
                  <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" /> 3. SHIP TO
                    </h3>
                    <label className="flex items-center gap-1.5 text-xs text-white/70 font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.shipTo.sameAsBillTo}
                        onChange={(e) => setForm({ ...form, shipTo: { ...form.shipTo, sameAsBillTo: e.target.checked } })}
                        className="rounded border-white/20 bg-white/10 text-emerald-400 focus:ring-0"
                      />
                      Same as Bill To
                    </label>
                  </div>
                  <div className="space-y-3.5">
                    <div>
                      <label className="mb-1.5 block text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-white/50">Name</label>
                      <input
                        type="text"
                        disabled={form.shipTo.sameAsBillTo}
                        value={form.shipTo.name}
                        onChange={(e) => setForm({ ...form, shipTo: { ...form.shipTo, name: e.target.value } })}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs font-medium text-white disabled:opacity-40 disabled:bg-white/[0.02] focus:border-emerald-400/50 focus:bg-white/10 focus:outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-white/50">Address</label>
                      <textarea
                        rows={2}
                        disabled={form.shipTo.sameAsBillTo}
                        value={form.shipTo.address}
                        onChange={(e) => setForm({ ...form, shipTo: { ...form.shipTo, address: e.target.value } })}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs font-medium text-white disabled:opacity-40 disabled:bg-white/[0.02] focus:border-emerald-400/50 focus:bg-white/10 focus:outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-white/50">State</label>
                      <input
                        type="text"
                        disabled={form.shipTo.sameAsBillTo}
                        value={form.shipTo.state}
                        onChange={(e) => setForm({ ...form, shipTo: { ...form.shipTo, state: e.target.value } })}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs font-medium text-white disabled:opacity-40 disabled:bg-white/[0.02] focus:border-emerald-400/50 focus:bg-white/10 focus:outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-white/50">GST No.</label>
                      <input
                        type="text"
                        disabled={form.shipTo.sameAsBillTo}
                        value={form.shipTo.gstNo}
                        onChange={(e) => setForm({ ...form, shipTo: { ...form.shipTo, gstNo: e.target.value } })}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs font-medium text-white disabled:opacity-40 disabled:bg-white/[0.02] focus:border-emerald-400/50 focus:bg-white/10 focus:outline-none transition"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. DELIVERY DETAILS */}
                <div className="rounded-3xl border border-white/10 bg-zinc-900/80 p-6 text-white shadow-xl backdrop-blur-xl">
                  <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-emerald-400 border-b border-white/10 pb-3 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" /> 4. DELIVERY DETAILS
                  </h3>
                  <div className="space-y-3.5">
                    <div>
                      <label className="mb-1.5 block text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-white/50">Delivery Charges (₹)</label>
                      <input
                        type="number"
                        value={form.deliveryDetails.deliveryCharges}
                        onChange={(e) => setForm({ ...form, deliveryDetails: { ...form.deliveryDetails, deliveryCharges: Number(e.target.value) || 0 } })}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs font-medium text-white focus:border-emerald-400/50 focus:bg-white/10 focus:outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-white/50">Courier Name</label>
                      <input
                        type="text"
                        value={form.deliveryDetails.courierName}
                        onChange={(e) => setForm({ ...form, deliveryDetails: { ...form.deliveryDetails, courierName: e.target.value } })}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs font-medium text-white focus:border-emerald-400/50 focus:bg-white/10 focus:outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-white/50">Courier ID / AWB</label>
                      <input
                        type="text"
                        value={form.deliveryDetails.courierId}
                        onChange={(e) => setForm({ ...form, deliveryDetails: { ...form.deliveryDetails, courierId: e.target.value } })}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs font-medium text-white focus:border-emerald-400/50 focus:bg-white/10 focus:outline-none transition"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 5: ITEM DETAILS */}
              <div className="rounded-3xl border border-white/10 bg-zinc-900/80 p-6 text-white shadow-xl backdrop-blur-xl">
                <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" /> 5. ITEM DETAILS
                  </h3>
                  <button
                    onClick={addItem}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-400 px-4 py-2 text-xs font-bold text-black hover:bg-emerald-300 transition shadow-md"
                  >
                    <Plus className="h-4 w-4" /> Add Item
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-xs">
                    <thead>
                      <tr className="bg-white/5 text-white/70 text-left font-bold uppercase text-[10px] border-b border-white/10">
                        <th className="p-3 w-12 text-center">#</th>
                        <th className="p-3">DESCRIPTION</th>
                        <th className="p-3 w-32">HSN/SAC</th>
                        <th className="p-3 w-24 text-center">QTY</th>
                        <th className="p-3 w-32 text-right">RATE (₹)</th>
                        <th className="p-3 w-36 text-right">AMOUNT (₹)</th>
                        <th className="p-3 w-12 text-center"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.items.map((item, index) => (
                        <tr key={item.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                          <td className="p-3 text-center font-bold text-white/60">{index + 1}</td>
                          <td className="p-3">
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => updateItem(item.id, "description", e.target.value)}
                              placeholder="e.g. Publishing Services"
                              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white placeholder-white/20 focus:border-emerald-400/50 focus:bg-white/10 focus:outline-none transition"
                            />
                          </td>
                          <td className="p-3">
                            <input
                              type="text"
                              value={item.hsn}
                              onChange={(e) => updateItem(item.id, "hsn", e.target.value)}
                              placeholder="998313"
                              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white placeholder-white/20 focus:border-emerald-400/50 focus:bg-white/10 focus:outline-none transition"
                            />
                          </td>
                          <td className="p-3 text-center">
                            <input
                              type="number"
                              min={1}
                              value={item.qty}
                              onChange={(e) => updateItem(item.id, "qty", Number(e.target.value) || 0)}
                              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center text-xs font-medium text-white focus:border-emerald-400/50 focus:bg-white/10 focus:outline-none transition"
                            />
                          </td>
                          <td className="p-3 text-right">
                            <input
                              type="number"
                              step="0.01"
                              value={item.rate || ""}
                              onChange={(e) => updateItem(item.id, "rate", Number(e.target.value) || 0)}
                              placeholder="0.00"
                              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-right text-xs font-medium text-white placeholder-white/20 focus:border-emerald-400/50 focus:bg-white/10 focus:outline-none transition"
                            />
                          </td>
                          <td className="p-3 text-right font-bold text-emerald-400 text-sm">
                            ₹{item.amount.toFixed(2)}
                          </td>
                          <td className="p-3 text-center">
                            {form.items.length > 1 && (
                              <button
                                onClick={() => removeItem(item.id)}
                                className="text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-red-500/10 transition"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Amount in words */}
                <div className="mt-5 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-white/50">
                      Amount in Words
                    </label>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                      Auto-Typed from Total Payable (₹{totalPayable.toFixed(2)})
                    </span>
                  </div>
                  <input
                    type="text"
                    value={computedAmountInWords}
                    onChange={(e) => setForm({ ...form, customAmountInWords: e.target.value })}
                    placeholder="Amount in words will be automatically typed based on total payable amount..."
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-bold text-emerald-300 placeholder-white/20 focus:border-emerald-400/50 focus:bg-white/10 focus:outline-none transition"
                  />
                  {totalTax > 0 ? (
                    <p className="mt-1.5 text-[10px] text-white/50 font-medium flex items-center gap-1.5">
                      <span>💡</span> Includes ₹{subTotal.toFixed(2)} Subtotal + ₹{totalTax.toFixed(2)} GST ({form.taxConfig.cgstRate + form.taxConfig.sgstRate}%) = ₹{totalPayable.toFixed(2)} Total Payable
                    </p>
                  ) : (
                    <p className="mt-1.5 text-[10px] text-white/50 font-medium">
                      💡 Total Payable: ₹{totalPayable.toFixed(2)} (No tax added)
                    </p>
                  )}
                </div>
              </div>

              {/* SECTIONS 6 & 7: BANK DETAILS & TAX SUMMARY */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* 6. BANK DETAILS */}
                <div className="rounded-3xl border border-white/10 bg-zinc-900/80 p-6 text-white shadow-xl backdrop-blur-xl">
                  <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-emerald-400 border-b border-white/10 pb-3 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" /> 6. BANK DETAILS
                  </h3>
                  <div className="grid gap-3.5 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-white/50">Account Name</label>
                      <input
                        type="text"
                        value={form.bankDetails.accountName}
                        onChange={(e) => setForm({ ...form, bankDetails: { ...form.bankDetails, accountName: e.target.value.toUpperCase() } })}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs font-medium uppercase text-white focus:border-emerald-400/50 focus:bg-white/10 focus:outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-white/50">Account No.</label>
                      <input
                        type="text"
                        value={form.bankDetails.accountNo}
                        onChange={(e) => setForm({ ...form, bankDetails: { ...form.bankDetails, accountNo: e.target.value.toUpperCase() } })}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs font-medium uppercase text-white focus:border-emerald-400/50 focus:bg-white/10 focus:outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-white/50">IFSC Code</label>
                      <input
                        type="text"
                        value={form.bankDetails.ifscCode}
                        onChange={(e) => setForm({ ...form, bankDetails: { ...form.bankDetails, ifscCode: e.target.value.toUpperCase() } })}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs font-medium uppercase text-white focus:border-emerald-400/50 focus:bg-white/10 focus:outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-white/50">Branch Code</label>
                      <input
                        type="text"
                        value={form.bankDetails.branchCode}
                        onChange={(e) => setForm({ ...form, bankDetails: { ...form.bankDetails, branchCode: e.target.value.toUpperCase() } })}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs font-medium uppercase text-white focus:border-emerald-400/50 focus:bg-white/10 focus:outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-white/50">CIF</label>
                      <input
                        type="text"
                        value={form.bankDetails.cif}
                        onChange={(e) => setForm({ ...form, bankDetails: { ...form.bankDetails, cif: e.target.value.toUpperCase() } })}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs font-medium uppercase text-white focus:border-emerald-400/50 focus:bg-white/10 focus:outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-white/50">MICR</label>
                      <input
                        type="text"
                        value={form.bankDetails.micr}
                        onChange={(e) => setForm({ ...form, bankDetails: { ...form.bankDetails, micr: e.target.value.toUpperCase() } })}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs font-medium uppercase text-white focus:border-emerald-400/50 focus:bg-white/10 focus:outline-none transition"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-1.5 block text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-white/50">UPI ID</label>
                      <input
                        type="text"
                        value={form.bankDetails.upiId}
                        onChange={(e) => setForm({ ...form, bankDetails: { ...form.bankDetails, upiId: e.target.value.toUpperCase() } })}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs font-medium uppercase text-white focus:border-emerald-400/50 focus:bg-white/10 focus:outline-none transition"
                      />
                    </div>
                  </div>
                </div>

                {/* 7. TAX SUMMARY */}
                <div className="rounded-3xl border border-white/10 bg-zinc-900/80 p-6 text-white shadow-xl backdrop-blur-xl">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" /> 7. TAX SUMMARY
                    </h3>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, taxConfig: { cgstRate: 9, sgstRate: 9 } })}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition ${
                          form.taxConfig.cgstRate === 9 && form.taxConfig.sgstRate === 9
                            ? "bg-emerald-400 text-black border-emerald-400"
                            : "bg-white/5 border-white/10 text-white/70 hover:text-white"
                        }`}
                      >
                        18% GST (9%+9%)
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, taxConfig: { cgstRate: 2.5, sgstRate: 2.5 } })}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition ${
                          form.taxConfig.cgstRate === 2.5 && form.taxConfig.sgstRate === 2.5
                            ? "bg-emerald-400 text-black border-emerald-400"
                            : "bg-white/5 border-white/10 text-white/70 hover:text-white"
                        }`}
                      >
                        5% GST (2.5%+2.5%)
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, taxConfig: { cgstRate: 0, sgstRate: 0 } })}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition ${
                          form.taxConfig.cgstRate === 0 && form.taxConfig.sgstRate === 0
                            ? "bg-emerald-400 text-black border-emerald-400"
                            : "bg-white/5 border-white/10 text-white/70 hover:text-white"
                        }`}
                      >
                        0% (No Tax)
                      </button>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 overflow-hidden mb-4">
                    <table className="w-full border-collapse text-xs">
                      <thead>
                        <tr className="bg-white/5 text-white/70 uppercase text-[10px] text-left border-b border-white/10">
                          <th className="p-3 border-r border-white/10">TAX TYPE</th>
                          <th className="p-3 border-r border-white/10 text-center">RATE (%)</th>
                          <th className="p-3 border-r border-white/10 text-right">TAXABLE AMOUNT (₹)</th>
                          <th className="p-3 text-right">TAX AMOUNT (₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-white/5">
                          <td className="p-3 border-r border-white/10 font-bold">CGST</td>
                          <td className="p-3 border-r border-white/10 text-center">
                            <input
                              type="number"
                              value={form.taxConfig.cgstRate}
                              onChange={(e) => setForm({ ...form, taxConfig: { ...form.taxConfig, cgstRate: Number(e.target.value) || 0 } })}
                              className="w-16 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-center text-xs text-white"
                            />
                          </td>
                          <td className="p-3 border-r border-white/10 text-right">₹{taxableAmount.toFixed(2)}</td>
                          <td className="p-3 text-right font-semibold text-emerald-300">₹{cgstAmount.toFixed(2)}</td>
                        </tr>
                        <tr className="border-b border-white/5">
                          <td className="p-3 border-r border-white/10 font-bold">SGST</td>
                          <td className="p-3 border-r border-white/10 text-center">
                            <input
                              type="number"
                              value={form.taxConfig.sgstRate}
                              onChange={(e) => setForm({ ...form, taxConfig: { ...form.taxConfig, sgstRate: Number(e.target.value) || 0 } })}
                              className="w-16 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-center text-xs text-white"
                            />
                          </td>
                          <td className="p-3 border-r border-white/10 text-right">₹{taxableAmount.toFixed(2)}</td>
                          <td className="p-3 text-right font-semibold text-emerald-300">₹{sgstAmount.toFixed(2)}</td>
                        </tr>
                        <tr className="font-bold bg-white/5">
                          <td className="p-3 border-r border-white/10">TOTAL</td>
                          <td className="p-3 border-r border-white/10 text-center">{form.taxConfig.cgstRate + form.taxConfig.sgstRate}%</td>
                          <td className="p-3 border-r border-white/10 text-right">₹{taxableAmount.toFixed(2)}</td>
                          <td className="p-3 text-right text-emerald-400">₹{totalTax.toFixed(2)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 flex justify-between items-center text-sm font-black">
                    <span className="text-white/80">TOTAL PAYABLE AMOUNT:</span>
                    <span className="text-xl text-emerald-400 font-black">₹{totalPayable.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* SECTIONS 8 & 9: TERMS & AUTHORISED SIGNATORY */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* 8. TERMS & CONDITIONS */}
                <div className="rounded-3xl border border-white/10 bg-zinc-900/80 p-6 text-white shadow-xl backdrop-blur-xl">
                  <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-emerald-400 border-b border-white/10 pb-3 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" /> 8. TERMS & CONDITIONS
                  </h3>
                  <textarea
                    ref={termsTextareaRef}
                    rows={6}
                    value={form.terms}
                    onChange={(e) => setForm({ ...form, terms: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-xs font-medium text-white leading-relaxed overflow-y-auto overscroll-contain focus:border-emerald-400/50 focus:bg-white/10 focus:outline-none transition"
                  />
                </div>

                {/* 9. AUTHORISED SIGNATORY */}
                <div className="rounded-3xl border border-white/10 bg-zinc-900/80 p-6 text-white shadow-xl backdrop-blur-xl">
                  <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-emerald-400 border-b border-white/10 pb-3 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" /> 9. AUTHORISED SIGNATORY
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="mb-1.5 block text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-white/50">Signature Title</label>
                      <input
                        type="text"
                        value={form.signatoryName}
                        onChange={(e) => setForm({ ...form, signatoryName: e.target.value })}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs font-medium text-white focus:border-emerald-400/50 focus:bg-white/10 focus:outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-white/50">Authorised Authority Logo / Stamp</label>
                      <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                        <img
                          src={form.signatureImage}
                          alt="Authorised Signatory"
                          className="h-16 w-32 object-contain rounded-xl border border-white/10 bg-white p-1.5 shadow-md"
                        />
                        <div className="text-xs text-white/60">
                          <p className="font-bold text-white">Authorised Seal & Signature</p>
                          <p className="text-[11px] mt-0.5 text-white/40">Preset file: ChatGPT Image Aug 18, 2026, 11_22_16 PM.png</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-white/50">Website Redirection QR Code</label>
                      <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                        <img
                          src="/lekhoktripura_qr.png"
                          alt="Website QR Code"
                          className="h-16 w-16 object-contain rounded-xl border border-white/10 bg-white p-1.5 shadow-md shrink-0"
                        />
                        <div className="text-xs text-white/60">
                          <p className="font-bold text-white flex items-center gap-1.5">
                            <span>Scan to Visit Website</span>
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">Scannable</span>
                          </p>
                          <a href="https://www.lekhoktripura.in/" target="_blank" rel="noreferrer" className="text-emerald-400 font-semibold hover:underline mt-0.5 block">
                            https://www.lekhoktripura.in/
                          </a>
                          <p className="text-[10px] text-white/40 mt-1">Printed on header of each generated invoice for easy mobile scanning.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTON BAR (Matching Website Theme) */}
              <div className="flex flex-wrap items-center justify-center gap-3.5 rounded-3xl border border-white/10 bg-zinc-900/90 p-6 shadow-2xl backdrop-blur-xl">
                <button
                  onClick={() => setActiveTab("preview")}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 px-6 py-3.5 text-xs font-bold text-black hover:from-emerald-400 hover:to-teal-300 transition shadow-xl uppercase tracking-wider"
                >
                  <Eye className="h-4 w-4" /> Generate Invoice
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-5 py-3.5 text-xs font-bold text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400 transition uppercase tracking-wider shadow-lg"
                >
                  <Download className="h-4 w-4" /> Save / Download PDF
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-5 py-3.5 text-xs font-bold text-white hover:bg-white/20 transition uppercase tracking-wider shadow"
                >
                  <Printer className="h-4 w-4" /> Print
                </button>
                <button
                  onClick={handleSendEmail}
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3.5 text-xs font-bold text-white/80 hover:bg-white/10 hover:text-white transition uppercase tracking-wider"
                >
                  <Mail className="h-4 w-4" /> Send Email
                </button>
                <button
                  onClick={handleSendWhatsApp}
                  className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-3.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/20 transition uppercase tracking-wider"
                >
                  <MessageSquare className="h-4 w-4" /> Send WhatsApp
                </button>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3.5 text-xs font-bold text-red-300 hover:bg-red-500/20 transition uppercase tracking-wider"
                >
                  <RefreshCw className="h-4 w-4" /> Reset
                </button>
              </div>

              <p className="text-center text-[11px] text-white/30 font-medium">
                Click SAVE / DOWNLOAD PDF — choose Save to PDF in the browser print window. | GSTIN: 16BMLPC9718D1Z2
              </p>
            </div>

            {/* ════════════════════════════════════════════════════════════════
               2. LIVE INVOICE PREVIEW / PRINTABLE DOCUMENT (Pure White A4 Document)
               ════════════════════════════════════════════════════════════════ */}
            <div className={activeTab === "preview" ? "block" : "hidden print:block"}>
              {/* Action bar for Preview mode */}
              <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/10 bg-zinc-900/90 p-5 shadow-2xl backdrop-blur-xl">
                <button
                  onClick={() => setActiveTab("generator")}
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/10 transition"
                >
                  <ArrowLeft className="h-4 w-4" /> Edit Details in Generator
                </button>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleDownloadPDF}
                    className="flex items-center gap-2 rounded-xl bg-emerald-400 px-5 py-2.5 text-xs font-bold text-black hover:bg-emerald-300 transition shadow"
                  >
                    <Download className="h-4 w-4" /> Save / Download PDF
                  </button>
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-5 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition"
                  >
                    <Printer className="h-4 w-4" /> Print Document
                  </button>
                  <button
                    onClick={handleSendEmail}
                    className="flex items-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-2.5 text-xs font-semibold text-blue-300 hover:bg-blue-500/20 transition"
                  >
                    <Mail className="h-4 w-4" /> Send Email
                  </button>
                  <button
                    onClick={handleSendWhatsApp}
                    className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 transition"
                  >
                    <MessageSquare className="h-4 w-4" /> WhatsApp
                  </button>
                </div>
              </div>

              {/* ── PRINTABLE INVOICE SHEET (Pure White Paper PDF Layout) ── */}
              <div className="flex justify-center">
                <div
                  id="printable-invoice-container"
                  ref={printRef}
                  className="relative w-full max-w-[800px] bg-white text-black p-6 sm:p-8 rounded-lg shadow-2xl border border-zinc-300 text-[11px] leading-snug overflow-hidden"
                >
                  {/* WATERMARK BACKGROUND EMBLEM */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                    <img src="/Web.jpeg" alt="Watermark Emblem" className="w-[340px] h-[340px] object-contain opacity-[0.06] select-none" />
                  </div>

                  {/* HEADER SECTION */}
                  <div className="relative z-10 flex items-start justify-between gap-4 pb-4 border-b-2 border-black">
                    <div className="flex items-start gap-3">
                      <img src="/Web.jpeg" alt="Lekhok Tripura Logo" className="h-16 w-16 object-contain shrink-0 mt-0.5" />
                      <div>
                        <h1 className="text-xl font-black tracking-tight text-black uppercase">LEKHOK TRIPURA PUBLISHERS</h1>
                        <p className="text-[11px] text-zinc-700 font-medium">Madhuban, Agartala, West Tripura - 799003</p>
                        <p className="text-[11px] text-zinc-700 font-medium">
                          lekhok.tripura@gmail.com &nbsp;|&nbsp; 6033350539
                        </p>
                        <p className="text-[11px] font-bold text-black">
                          GST No. : 16BMLPC9718D1Z2
                        </p>
                      </div>
                    </div>

                    {/* QR CODE */}
                    <div className="text-center shrink-0">
                      <div className="h-16 w-16 bg-white border border-zinc-300 rounded p-1 mx-auto flex items-center justify-center shadow-sm">
                        <img src="/lekhoktripura_qr.png" alt="Scan QR Code" className="h-full w-full object-contain" />
                      </div>
                      <p className="text-[9px] font-bold text-zinc-800 mt-1">Scan to Visit<br />lekhoktripura.in</p>
                    </div>
                  </div>

                  <div className="relative z-10">
                    {/* INVOICE BANNER */}
                    <div className="flex items-center justify-between pt-3 pb-2">
                      <div>
                        <h2 className="text-2xl font-black tracking-wider text-black">INVOICE</h2>
                        <p className="text-[10px] text-zinc-600 font-bold uppercase mt-0.5">
                          Bill Generated By : <span className="text-black">{form.billInfo.generatedBy}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black uppercase text-black">
                          INVOICE NO. : <span className="font-extrabold">{form.billInfo.invoiceNo}</span>
                        </p>
                        <p className="text-xs font-bold text-black mt-0.5">
                          DATE : <span>{formatDateDisplay(form.billInfo.billingDate)}</span>
                        </p>
                      </div>
                    </div>

                    {/* ROW 1: BILL TO, SHIP TO, INVOICE DETAILS */}
                    <div className="grid grid-cols-12 gap-0 border border-black mb-3 bg-white/90">
                      {/* BILL TO */}
                      <div className="col-span-4 border-r border-black">
                        <div className="bg-black text-white font-bold text-[10px] px-2 py-1 uppercase flex items-center gap-1">
                          <span>■</span> BILL TO
                        </div>
                        <div className="p-2 space-y-1 text-[10px]">
                          <p><strong className="inline-block w-16">Name</strong>: {form.billTo.name}</p>
                          <p><strong className="inline-block w-16">Address</strong>: {form.billTo.address}</p>
                          <p><strong className="inline-block w-16">State</strong>: {form.billTo.state}</p>
                          <p><strong className="inline-block w-16">GST No.</strong>: {form.billTo.gstNo}</p>
                          <p><strong className="inline-block w-16">Phone No.</strong>: {form.billTo.phoneNo}</p>
                          <p><strong className="inline-block w-16">Mail ID</strong>: {form.billTo.email}</p>
                        </div>
                      </div>

                      {/* SHIP TO */}
                      <div className="col-span-4 border-r border-black">
                        <div className="bg-black text-white font-bold text-[10px] px-2 py-1 uppercase flex items-center gap-1">
                          <span>■</span> SHIP TO
                        </div>
                        <div className="p-2 space-y-1 text-[10px]">
                          <p><strong className="inline-block w-16">Name</strong>: {form.shipTo.name}</p>
                          <p><strong className="inline-block w-16">Address</strong>: {form.shipTo.address}</p>
                          <p><strong className="inline-block w-16">State</strong>: {form.shipTo.state}</p>
                          <p><strong className="inline-block w-16">GST No.</strong>: {form.shipTo.gstNo}</p>
                        </div>
                      </div>

                      {/* INVOICE DETAILS */}
                      <div className="col-span-4">
                        <div className="bg-black text-white font-bold text-[10px] px-2 py-1 uppercase flex items-center gap-1">
                          <span>■</span> INVOICE DETAILS
                        </div>
                        <div className="p-2 space-y-1 text-[10px]">
                          <p><strong className="inline-block w-24">Bill No.</strong>: {form.billInfo.invoiceNo}</p>
                          <p><strong className="inline-block w-24">Billing Date</strong>: {formatDateDisplay(form.billInfo.billingDate)}</p>
                          <p><strong className="inline-block w-24">Payment Mode</strong>: {form.billInfo.paymentMode}</p>
                          <p><strong className="inline-block w-24">Generated By</strong>: {form.billInfo.generatedBy}</p>
                        </div>
                      </div>
                    </div>

                    {/* ROW 2: DELIVERY DETAILS */}
                    <div className="border border-black mb-3 bg-white/90">
                      <div className="bg-black text-white font-bold text-[10px] px-2 py-1 uppercase flex items-center gap-1">
                        <span>■</span> DELIVERY DETAILS
                      </div>
                      <div className="p-2 grid grid-cols-3 text-[10px]">
                        <p><strong>Delivery</strong>: ₹{deliveryChg.toFixed(2)}</p>
                        <p><strong>Courier</strong>: {form.deliveryDetails.courierName}</p>
                        <p><strong>Courier ID</strong>: {form.deliveryDetails.courierId}</p>
                      </div>
                    </div>

                    {/* ROW 3: ITEMS TABLE & SUMMARY */}
                    <div className="border border-black mb-3 bg-white/90">
                      <table className="w-full border-collapse text-[10px]">
                        <thead>
                          <tr className="bg-black text-white font-bold text-[10px] uppercase border-b border-black">
                            <th className="p-1.5 border-r border-white/20 w-8 text-center">SL.</th>
                            <th className="p-1.5 border-r border-white/20 text-left">DESCRIPTION</th>
                            <th className="p-1.5 border-r border-white/20 w-24 text-center">HSN/SAC</th>
                            <th className="p-1.5 border-r border-white/20 w-12 text-center">QTY.</th>
                            <th className="p-1.5 border-r border-white/20 w-24 text-right">RATE (₹)</th>
                            <th className="p-1.5 w-28 text-right">AMOUNT (₹)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {form.items.map((item, idx) => (
                            <tr key={item.id} className="border-b border-zinc-300">
                              <td className="p-2 border-r border-zinc-300 text-center font-bold">{idx + 1}</td>
                              <td className="p-2 border-r border-zinc-300 font-medium">{item.description}</td>
                              <td className="p-2 border-r border-zinc-300 text-center">{item.hsn}</td>
                              <td className="p-2 border-r border-zinc-300 text-center">{item.qty}</td>
                              <td className="p-2 border-r border-zinc-300 text-right font-medium">₹{Number(item.rate).toFixed(2)}</td>
                              <td className="p-2 text-right font-bold">₹{Number(item.amount).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {/* Split Table Bottom: Amount in Words (Left) | Detailed Breakdown (Right) */}
                      <div className="grid grid-cols-12 border-t border-black">
                        {/* Left: AMOUNT IN WORDS */}
                        <div className="col-span-6 border-r border-black p-2 flex flex-col justify-between">
                          <div>
                            <p className="font-bold text-[10px] text-black uppercase">AMOUNT IN WORDS</p>
                            <p className="text-[11px] font-semibold text-zinc-900 mt-1 leading-snug">{computedAmountInWords}</p>
                          </div>
                        </div>

                        {/* Right: SUMMARY TABLE */}
                        <div className="col-span-6 text-[10px]">
                          <div className="flex justify-between p-1.5 border-b border-zinc-200">
                            <span>Sub Total</span>
                            <span className="font-semibold">₹{subTotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between p-1.5 border-b border-zinc-200">
                            <span>Total Taxable Amount</span>
                            <span className="font-semibold">₹{taxableAmount.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between p-1.5 border-b border-zinc-200">
                            <span>CGST @ {form.taxConfig.cgstRate}%</span>
                            <span className="font-semibold">₹{cgstAmount.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between p-1.5 border-b border-zinc-200">
                            <span>SGST @ {form.taxConfig.sgstRate}%</span>
                            <span className="font-semibold">₹{sgstAmount.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between p-1.5 border-b border-zinc-200">
                            <span>Price without tax</span>
                            <span className="font-semibold">₹{taxableAmount.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between p-1.5 border-b border-zinc-200">
                            <span>Packaging Charge</span>
                            <span className="font-semibold">₹{packagingChg.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between p-1.5 border-b border-zinc-200">
                            <span>Courier Charge</span>
                            <span className="font-semibold">₹{courierChg.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between p-1.5 border-b border-zinc-200">
                            <span>Platform Charge</span>
                            <span className="font-semibold">₹{platformChg.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between p-1.5 border-b border-zinc-200">
                            <span>Discount Amount</span>
                            <span className="font-semibold">₹{discount.toFixed(2)}</span>
                          </div>

                          {/* TOTAL PAYABLE AMOUNT */}
                          <div className="flex justify-between p-2 bg-black text-white font-black text-xs uppercase">
                            <span>TOTAL PAYABLE AMOUNT</span>
                            <span>₹{totalPayable.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ROW 4: BANK DETAILS & TAX SUMMARY */}
                    <div className="grid grid-cols-12 gap-3 mb-3">
                      {/* BANK DETAILS */}
                      <div className="col-span-6 border border-black bg-white/90">
                        <div className="bg-black text-white font-bold text-[10px] px-2 py-1 uppercase flex items-center gap-1">
                          <span>■</span> BANK DETAILS
                        </div>
                        <div className="p-2 space-y-1 text-[10px]">
                          <p><strong className="inline-block w-24">Account Name</strong>: {form.bankDetails.accountName}</p>
                          <p><strong className="inline-block w-24">Account No.</strong>: {form.bankDetails.accountNo}</p>
                          <p><strong className="inline-block w-24">IFSC Code</strong>: {form.bankDetails.ifscCode}</p>
                          <p><strong className="inline-block w-24">Branch Code</strong>: {form.bankDetails.branchCode}</p>
                          <p><strong className="inline-block w-24">CIF</strong>: {form.bankDetails.cif}</p>
                          <p><strong className="inline-block w-24">MICR</strong>: {form.bankDetails.micr}</p>
                          <p><strong className="inline-block w-24">UPI ID</strong>: {form.bankDetails.upiId}</p>
                        </div>
                      </div>

                      {/* TAX SUMMARY */}
                      <div className="col-span-6 border border-black bg-white/90">
                        <div className="bg-black text-white font-bold text-[10px] px-2 py-1 uppercase flex items-center gap-1">
                          <span>TAX SUMMARY</span>
                        </div>
                        <div className="p-1">
                          <table className="w-full border-collapse text-[10px]">
                            <thead>
                              <tr className="border-b border-black text-left font-bold text-[9px] uppercase">
                                <th className="p-1">TAX TYPE</th>
                                <th className="p-1 text-center">RATE</th>
                                <th className="p-1 text-right">TAXABLE AMOUNT (₹)</th>
                                <th className="p-1 text-right">TAX AMOUNT (₹)</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="border-b border-zinc-200">
                                <td className="p-1 font-semibold">CGST</td>
                                <td className="p-1 text-center">{form.taxConfig.cgstRate}%</td>
                                <td className="p-1 text-right">₹{taxableAmount.toFixed(2)}</td>
                                <td className="p-1 text-right font-semibold">₹{cgstAmount.toFixed(2)}</td>
                              </tr>
                              <tr className="border-b border-zinc-200">
                                <td className="p-1 font-semibold">SGST</td>
                                <td className="p-1 text-center">{form.taxConfig.sgstRate}%</td>
                                <td className="p-1 text-right">₹{taxableAmount.toFixed(2)}</td>
                                <td className="p-1 text-right font-semibold">₹{sgstAmount.toFixed(2)}</td>
                              </tr>
                              <tr className="font-bold">
                                <td className="p-1">TOTAL</td>
                                <td className="p-1 text-center">{form.taxConfig.cgstRate + form.taxConfig.sgstRate}%</td>
                                <td className="p-1 text-right">₹{taxableAmount.toFixed(2)}</td>
                                <td className="p-1 text-right">₹{totalTax.toFixed(2)}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    {/* ROW 5: TERMS & CONDITIONS & AUTHORISED SIGNATORY */}
                    <div className="grid grid-cols-12 gap-3 mb-4">
                      {/* TERMS & CONDITIONS */}
                      <div className="col-span-7 border border-black bg-white/90">
                        <div className="bg-black text-white font-bold text-[10px] px-2 py-1 uppercase flex items-center gap-1">
                          <span>■</span> TERMS & CONDITIONS
                        </div>
                        <div className="p-2 text-[9.5px] leading-normal text-zinc-800 font-medium whitespace-pre-line">
                          {form.terms}
                        </div>
                      </div>

                      {/* AUTHORISED SIGNATORY */}
                      <div className="col-span-5 border border-black flex flex-col justify-between bg-white/90">
                        <div className="bg-black text-white font-bold text-[10px] px-2 py-1 uppercase text-center">
                          AUTHORISED SIGNATORY
                        </div>
                        <div className="p-3 text-center flex-1 flex flex-col items-center justify-end">
                          {/* Authorised Seal & Signature Image */}
                          <div className="mb-2">
                            <img
                              src={form.signatureImage}
                              alt="Authorised Signatory"
                              className="h-16 max-w-full object-contain mx-auto"
                            />
                          </div>
                          <div className="w-full border-t border-black pt-1">
                            <p className="font-bold text-[10px] text-black">{form.signatoryName}</p>
                            <p className="text-[9px] font-semibold text-zinc-600">Authorised Signatory</p>
                            <p className="text-[9px] font-semibold text-zinc-600">Lekhok Tripura Publishers</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* FOOTER THANK YOU MESSAGE */}
                    <div className="pt-2 border-t border-black text-center">
                      <p className="text-[10px] font-black tracking-widest text-black uppercase">
                        THANK YOU FOR YOUR BUSINESS!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>

      {/* ── EMAIL COMPOSITION & SEND MODAL ── */}
      {showEmailModal && (
        <div
          onWheel={(e) => {
            if (e.target === e.currentTarget) {
              e.preventDefault();
            }
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md no-print animate-fade-in overflow-y-auto overscroll-contain"
        >
          <div className="w-full max-w-2xl rounded-3xl border border-white/15 bg-zinc-900 p-6 sm:p-8 text-white shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto overscroll-contain">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Send Invoice via Email</h3>
                  <p className="text-xs text-white/50">Compose or copy email details for Invoice {form.billInfo.invoiceNo}</p>
                </div>
              </div>
              <button
                onClick={() => setShowEmailModal(false)}
                className="rounded-xl border border-white/10 p-2 text-white/60 hover:bg-white/10 hover:text-white transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Email Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/60">
                  Recipient Email (To) <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="email"
                  value={emailRecipient}
                  onChange={(e) => setEmailRecipient(e.target.value)}
                  placeholder="Enter customer email address (e.g. customer@gmail.com)"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-medium text-white placeholder-white/20 focus:border-blue-400/50 focus:bg-white/10 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/60">
                  Email Subject
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-semibold text-white focus:border-blue-400/50 focus:bg-white/10 focus:outline-none transition"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-white/60">
                    Email Message Content
                  </label>
                  <button
                    type="button"
                    onClick={handleCopyEmailText}
                    className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 transition"
                  >
                    {copiedEmailText ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedEmailText ? "Copied!" : "Copy Text"}
                  </button>
                </div>
                <textarea
                  ref={modalTextareaRef}
                  rows={8}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-xs font-medium text-white/90 leading-relaxed font-mono focus:border-blue-400/50 focus:bg-white/10 focus:outline-none transition overflow-y-auto overscroll-contain max-h-[280px] min-h-[160px] resize-y"
                />
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-end gap-3 border-t border-white/10 pt-4">
              <button
                onClick={() => setShowEmailModal(false)}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white/70 hover:bg-white/10 hover:text-white transition"
              >
                Close
              </button>
              <button
                onClick={handleCopyEmailText}
                className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition"
              >
                {copiedEmailText ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                {copiedEmailText ? "Copied Text" : "Copy Email Text"}
              </button>
              <button
                onClick={handleExecuteMailto}
                className="flex items-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-2.5 text-xs font-bold text-blue-300 hover:bg-blue-500/20 transition"
                title="Launch default desktop email application"
              >
                <ExternalLink className="h-4 w-4" /> Default Mail App
              </button>
              <button
                onClick={handleOpenGmail}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-500 via-rose-500 to-amber-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg hover:from-red-400 hover:to-amber-400 transition"
                title="Open directly in Gmail Webmail"
              >
                <Mail className="h-4 w-4" /> Open in Gmail
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </PageTransition>
  );
}
