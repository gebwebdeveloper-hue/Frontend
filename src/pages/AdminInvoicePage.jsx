import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  TrendingUp, ArrowDownLeft, ArrowUpRight, Edit3, Eye, FileText
} from "lucide-react";
import PageTransition from "../components/PageTransition.jsx";
import AdminNavbar from "../components/AdminNavbar.jsx";
import { API_BASE } from "../config.js";

// Modular Admin Sub-Components
import AdminFinancialDashboard from "../components/admin/AdminFinancialDashboard.jsx";
import AdminIncomeRegister from "../components/admin/AdminIncomeRegister.jsx";
import AdminExpenseRegister from "../components/admin/AdminExpenseRegister.jsx";
import AddExpenseModal from "../components/admin/AddExpenseModal.jsx";
import EditIncomeModal from "../components/admin/EditIncomeModal.jsx";
import SendEmailModal from "../components/admin/SendEmailModal.jsx";
import AdminInvoiceAuth from "../components/admin/AdminInvoiceAuth.jsx";
import AdminInvoicePreview from "../components/admin/AdminInvoicePreview.jsx";
import AdminInvoiceForm from "../components/admin/AdminInvoiceForm.jsx";

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

  let words = integerPart === 0 ? 'Zero Rupees' : inWords(integerPart) + ' Rupees';
  if (decimalPart > 0) {
    words += ' and ' + inWords(decimalPart) + ' Paise';
  }
  return words + ' Only';
}

function formatDateDisplay(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const month = d.toLocaleString("en-US", { month: "short" });
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

function getFinancialYear(d = new Date()) {
  const year = d.getFullYear();
  const month = d.getMonth(); // 0-indexed, 3 = April
  let startYear, endYear;
  if (month >= 3) {
    startYear = year % 100;
    endYear = (year + 1) % 100;
  } else {
    startYear = (year - 1) % 100;
    endYear = year % 100;
  }
  return `${String(startYear).padStart(2, '0')}-${String(endYear).padStart(2, '0')}`;
}

function getInitialInvoiceNo() {
  const counter = parseInt(localStorage.getItem("lekhok_invoice_counter") || "3", 10);
  const fy = getFinancialYear();
  const paddedSeq = String(counter).padStart(4, "0");
  return `LT/TR/${fy}/${paddedSeq}`;
}

// Initial Mock Income Records
const INITIAL_INCOME_RECORDS = [
  {
    id: "inc-1",
    slNo: 1,
    year: "2026",
    month: "AUG",
    invoiceNo: "LT/TR/26-27/0001",
    date: "12 Aug 2026",
    paymentMode: "Google Pay",
    customerName: "Dr. Anirban Das",
    customerPhone: "9436123456",
    customerEmail: "anirban.das@gmail.com",
    customerAddress: "Battala, Agartala, West Tripura",
    description: "Publishing & Book Printing Services",
    qty: 50,
    actualRate: 150,
    taxablePayable: 7500,
    gstAmount: 1350,
    deliveryCharges: 250,
    courierName: "SpeedPost",
    discount: 0,
    totalAmount: 9100,
    billLink: "https://www.lekhoktripura.in/"
  },
  {
    id: "inc-2",
    slNo: 2,
    year: "2026",
    month: "AUG",
    invoiceNo: "LT/TR/26-27/0002",
    date: "14 Aug 2026",
    paymentMode: "PhonePe",
    customerName: "Smt. Ratna Roy",
    customerPhone: "9862987654",
    customerEmail: "ratna.roy@yahoo.com",
    customerAddress: "Dharmanagar, North Tripura",
    description: "Editorial & Layout Design",
    qty: 1,
    actualRate: 3000,
    taxablePayable: 3000,
    gstAmount: 540,
    deliveryCharges: 0,
    courierName: "Email Delivery",
    discount: 200,
    totalAmount: 3340,
    billLink: "https://www.lekhoktripura.in/"
  },
  {
    id: "inc-3",
    slNo: 3,
    year: "2026",
    month: "AUG",
    invoiceNo: "LT/TR/26-27/0003",
    date: "15 Aug 2026",
    paymentMode: "Bank Transfer",
    customerName: "Tripura Sahitya Parisad",
    customerPhone: "03812345678",
    customerEmail: "contact@tripurasahitya.org",
    customerAddress: "Agartala Club Road, Agartala",
    description: "Souvenir Journal Publication",
    qty: 100,
    actualRate: 120,
    taxablePayable: 12000,
    gstAmount: 2160,
    deliveryCharges: 500,
    courierName: "Local Van",
    discount: 500,
    totalAmount: 14160,
    billLink: "https://www.lekhoktripura.in/"
  },
  {
    id: "inc-4",
    slNo: 4,
    year: "2026",
    month: "AUG",
    invoiceNo: "LT/TR/26-27/0004",
    date: "17 Aug 2026",
    paymentMode: "UPI",
    customerName: "Priya Deb",
    customerPhone: "7005123456",
    customerEmail: "priya@example.com",
    customerAddress: "Kailashahar, Unakoti",
    description: "Tripura Poetry Anthology",
    qty: 3,
    actualRate: 250,
    taxablePayable: 750,
    gstAmount: 135,
    deliveryCharges: 50,
    courierName: "BlueDart",
    discount: 0,
    totalAmount: 935,
    billLink: "https://www.lekhoktripura.in/"
  },
  {
    id: "inc-5",
    slNo: 5,
    year: "2026",
    month: "AUG",
    invoiceNo: "LT/TR/26-27/0005",
    date: "18 Aug 2026",
    paymentMode: "Google Pay",
    customerName: "Kiran Samanta",
    customerPhone: "8794123456",
    customerEmail: "kiransamanta88@gmail.com",
    customerAddress: "Madhuban, Agartala",
    description: "Publishing & Printing Services",
    qty: 1,
    actualRate: 400,
    taxablePayable: 400,
    gstAmount: 72,
    deliveryCharges: 40,
    courierName: "Local Delivery",
    discount: 0,
    totalAmount: 512,
    billLink: "https://www.lekhoktripura.in/"
  }
];

// Initial Mock Expense Records
const INITIAL_EXPENSE_RECORDS = [
  {
    id: "exp-1",
    invoiceNo: "EXP/2026/001",
    gstBill: "YES",
    itemName: "Book Printing Paper Roll 80GSM",
    purpose: "Publication Printing",
    year: "2026",
    month: "AUG",
    date: "10 Aug 2026",
    partyName: "Agartala Print House",
    partyNumber: "9862000000",
    partyEmail: "print@agartala.com",
    partyAddress: "Battala, Agartala",
    gstRate: 18,
    gstAmount: 360,
    beforeTaxAmount: 2000,
    totalBillAmount: 2360,
    billLink: "https://www.lekhoktripura.in/"
  },
  {
    id: "exp-2",
    invoiceNo: "EXP/2026/002",
    gstBill: "NO",
    itemName: "Office Tea & Snacks",
    purpose: "Office Maintenance",
    year: "2026",
    month: "AUG",
    date: "12 Aug 2026",
    partyName: "Local Market Store",
    partyNumber: "9436000000",
    partyEmail: "",
    partyAddress: "Madhuban Bazaar",
    gstRate: 0,
    gstAmount: 0,
    beforeTaxAmount: 450,
    totalBillAmount: 450,
    billLink: "#"
  }
];

export default function AdminInvoicePage() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(true);
  const [checking, setChecking] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [authError, setAuthError] = useState("");
  const [submittingAuth, setSubmittingAuth] = useState(false);
  const [loginStep, setLoginStep] = useState("email");
  const [activeTab, setActiveTab] = useState("dashboard"); // 'dashboard' | 'income' | 'expense' | 'generator' | 'preview'
  
  // Financial Records Stores (Local Storage & MongoDB API Persisted)
  const [incomeRecords, setIncomeRecords] = useState(() => {
    const saved = localStorage.getItem("lekhok_income_records");
    return saved ? JSON.parse(saved) : INITIAL_INCOME_RECORDS;
  });
  const [expenseRecords, setExpenseRecords] = useState(() => {
    const saved = localStorage.getItem("lekhok_expense_records");
    return saved ? JSON.parse(saved) : INITIAL_EXPENSE_RECORDS;
  });

  // Fetch real-time Financial Records from MongoDB Database on mount
  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        const [incRes, expRes] = await Promise.all([
          fetch(`${API_BASE}/financial/invoices`).then((r) => r.json()).catch(() => null),
          fetch(`${API_BASE}/financial/expenses`).then((r) => r.json()).catch(() => null),
        ]);

        if (incRes && incRes.success && Array.isArray(incRes.data) && incRes.data.length > 0) {
          setIncomeRecords(incRes.data);
        }
        if (expRes && expRes.success && Array.isArray(expRes.data) && expRes.data.length > 0) {
          setExpenseRecords(expRes.data);
        }
      } catch (err) {
        console.error("Failed to load financial records from database API:", err);
      }
    };
    fetchFinancialData();
  }, []);

  // Persist financial records to local storage whenever updated
  useEffect(() => {
    localStorage.setItem("lekhok_income_records", JSON.stringify(incomeRecords));
  }, [incomeRecords]);

  useEffect(() => {
    localStorage.setItem("lekhok_expense_records", JSON.stringify(expenseRecords));
  }, [expenseRecords]);

  // Expense Modal State
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [expenseForm, setExpenseForm] = useState({
    invoiceNo: "",
    gstBill: "YES",
    itemName: "",
    purpose: "",
    year: new Date().getFullYear().toString(),
    month: new Date().toLocaleString("en-US", { month: "short" }).toUpperCase(),
    date: new Date().toISOString().split("T")[0],
    partyName: "",
    partyNumber: "",
    partyEmail: "",
    partyAddress: "",
    gstRate: 18,
    beforeTaxAmount: "",
    billLink: ""
  });

  // Edit Income Record Modal State
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [editingIncomeForm, setEditingIncomeForm] = useState(null);

  const handleEditIncome = (record) => {
    setEditingIncomeForm({
      ...record,
      rawDate: record.date ? record.date.split(" ").reverse().join("-") : new Date().toISOString().split("T")[0]
    });
    setShowIncomeModal(true);
  };

  const handleSaveIncomeRecord = async (updatedRecord) => {
    setIncomeRecords((prev) =>
      prev.map((r) => (r.id === updatedRecord.id || r._id === updatedRecord.id ? updatedRecord : r))
    );
    setShowIncomeModal(false);
    setEditingIncomeForm(null);

    try {
      const recordId = updatedRecord.id || updatedRecord._id;
      await fetch(`${API_BASE}/financial/invoices/${recordId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedRecord),
      });
    } catch (err) {
      console.error("Failed to update invoice in database:", err);
    }
  };

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailRecipient, setEmailRecipient] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [copiedEmailText, setCopiedEmailText] = useState(false);
  const printRef = useRef(null);
  const termsTextareaRef = useRef(null);
  const modalTextareaRef = useRef(null);

  // Lock background body & html scroll when Modal is open
  useEffect(() => {
    if (showEmailModal || showExpenseModal || showIncomeModal) {
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
  }, [showEmailModal, showExpenseModal, showIncomeModal]);

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
    signatureImage: "/authorised_signatory.png",
    customAmountInWords: "",
  };

  const [form, setForm] = useState(initialForm);

  // Keep invoice admin directly accessible for logged in admins
  useEffect(() => {
    setAuthed(true);
    setChecking(false);
  }, []);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setSubmittingAuth(true);
    setAuthError("");
    try {
      const res = await fetch(`${API_BASE}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setLoginStep("otp");
      } else {
        setAuthError(data.message || "Failed to send OTP.");
      }
    } catch {
      setAuthError("Server error requesting OTP.");
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

  // Financial Calculations
  const subTotal = form.items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const deliveryChg = Number(form.deliveryDetails.deliveryCharges) || 0;
  const packagingChg = Number(form.extraCharges.packagingCharge) || 0;
  const courierChg = Number(form.extraCharges.courierCharge) || 0;
  const platformChg = Number(form.extraCharges.platformCharge) || 0;
  const discount = Number(form.extraCharges.discountAmount) || 0;

  const taxableAmount = subTotal + packagingChg + courierChg + platformChg - discount;
  const cgstAmount = (taxableAmount * (Number(form.taxConfig.cgstRate) || 0)) / 100;
  const sgstAmount = (taxableAmount * (Number(form.taxConfig.sgstRate) || 0)) / 100;
  const totalTax = cgstAmount + sgstAmount;
  const totalPayable = taxableAmount + totalTax + deliveryChg;

  const autoWords = convertNumberToWords(totalPayable);
  const computedAmountInWords = form.customAmountInWords || autoWords;

  // Automatically save / sync generated invoice to Income & Sales Register and MongoDB Database
  const handleAutoSaveIncome = async (targetForm = form) => {
    if (!targetForm.billInfo || !targetForm.billInfo.invoiceNo) return;

    const sub = targetForm.items ? targetForm.items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0) : 0;
    const del = Number(targetForm.deliveryDetails?.deliveryCharges) || 0;
    const pack = Number(targetForm.extraCharges?.packagingCharge) || 0;
    const cour = Number(targetForm.extraCharges?.courierCharge) || 0;
    const plat = Number(targetForm.extraCharges?.platformCharge) || 0;
    const disc = Number(targetForm.extraCharges?.discountAmount) || 0;
    const taxBase = sub + pack + cour + plat - disc;
    const cgstR = Number(targetForm.taxConfig?.cgstRate) || 0;
    const sgstR = Number(targetForm.taxConfig?.sgstRate) || 0;
    const taxAmt = (taxBase * (cgstR + sgstR)) / 100;
    const totPayable = taxBase + taxAmt + del;

    const billingDateObj = targetForm.billInfo.billingDate ? new Date(targetForm.billInfo.billingDate) : new Date();
    const formattedDateStr = formatDateDisplay(targetForm.billInfo.billingDate);
    const monthStr = billingDateObj.toLocaleString("en-US", { month: "short" }).toUpperCase();
    const yearStr = billingDateObj.getFullYear().toString();

    const firstItem = targetForm.items && targetForm.items.length > 0 ? targetForm.items[0] : {};
    const itemDesc = targetForm.items && targetForm.items.length > 1 
      ? `${firstItem.description || 'Item'} + ${targetForm.items.length - 1} more`
      : (firstItem.description || 'Goods & Services');

    const totalQty = targetForm.items ? targetForm.items.reduce((acc, i) => acc + Number(i.qty || 0), 0) : 1;

    const existingIdx = incomeRecords.findIndex((r) => r.invoiceNo === targetForm.billInfo.invoiceNo);
    const record = {
      id: existingIdx >= 0 ? incomeRecords[existingIdx].id || incomeRecords[existingIdx]._id : `inc-${Date.now()}`,
      slNo: existingIdx >= 0 ? incomeRecords[existingIdx].slNo : incomeRecords.length + 1,
      year: yearStr,
      month: monthStr,
      invoiceNo: targetForm.billInfo.invoiceNo,
      date: formattedDateStr,
      paymentMode: targetForm.billInfo.paymentMode,
      customerName: targetForm.billTo?.name || "Customer",
      customerPhone: targetForm.billTo?.phoneNo || "N/A",
      customerEmail: targetForm.billTo?.email || "N/A",
      customerAddress: targetForm.billTo?.address || "N/A",
      description: itemDesc,
      qty: totalQty,
      actualRate: Number(firstItem.rate || 0),
      taxablePayable: taxBase,
      gstAmount: taxAmt,
      deliveryCharges: del,
      courierName: targetForm.deliveryDetails?.courierName || "Courier",
      discount: disc,
      totalAmount: totPayable,
      billLink: `/admin/invoices`,
      fullForm: targetForm
    };

    setIncomeRecords((prev) => {
      const idx = prev.findIndex((r) => r.invoiceNo === targetForm.billInfo.invoiceNo);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = record;
        return copy;
      }
      return [record, ...prev];
    });

    try {
      await fetch(`${API_BASE}/financial/invoices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record),
      });
    } catch (err) {
      console.error("Failed to save invoice to MongoDB API:", err);
    }
  };

  const handleViewSoftBill = (record) => {
    if (!record) return;

    if (record.fullForm && record.fullForm.billInfo) {
      setForm(record.fullForm);
    } else {
      // Reconstruct complete GST invoice form structure from record fields
      const qtyNum = Number(record.qty) || 1;
      const rateNum = Number(record.actualRate) || 0;
      const amountNum = qtyNum * rateNum;

      const reconstructedForm = {
        billInfo: {
          generatedBy: "Admin",
          invoiceNo: record.invoiceNo || getInitialInvoiceNo(),
          billingDate: record.date || new Date().toISOString().split("T")[0],
          paymentMode: record.paymentMode || "Google Pay",
        },
        billTo: {
          name: record.customerName || "Customer",
          address: record.customerAddress || "N/A",
          state: "Tripura",
          gstNo: "NA",
          phoneNo: record.customerPhone || "N/A",
          email: record.customerEmail || "N/A",
        },
        shipTo: {
          sameAsBillTo: true,
          name: record.customerName || "Customer",
          address: record.customerAddress || "N/A",
          state: "Tripura",
          gstNo: "NA",
        },
        deliveryDetails: {
          deliveryCharges: Number(record.deliveryCharges) || 0,
          courierName: record.courierName || "Local Delivery",
          courierId: "NA",
        },
        items: [
          {
            id: 1,
            description: record.description || "Goods & Services",
            hsn: "998313",
            qty: qtyNum,
            rate: rateNum,
            amount: amountNum,
          },
        ],
        extraCharges: {
          packagingCharge: 0,
          courierCharge: 0,
          platformCharge: 0,
          discountAmount: Number(record.discount) || 0,
        },
        taxConfig: {
          cgstRate: 9,
          sgstRate: 9,
        },
        bankDetails: initialForm.bankDetails,
        terms: initialForm.terms,
        signatoryName: "Lekhok Tripura Publishers",
        signatureImage: "/authorised_signatory.png",
        customAmountInWords: convertNumberToWords(record.totalAmount),
      };
      setForm(reconstructedForm);
    }
    setActiveTab("preview");
  };

  // Save Expense Handler (Saves to MongoDB)
  const handleSaveExpense = async (e) => {
    e.preventDefault();
    const bTax = Number(expenseForm.beforeTaxAmount) || 0;
    const gRate = Number(expenseForm.gstRate) || 0;
    const gAmt = bTax * (gRate / 100);
    const totBill = bTax + gAmt;

    const dateObj = expenseForm.date ? new Date(expenseForm.date) : new Date();
    const monthStr = dateObj.toLocaleString("en-US", { month: "short" }).toUpperCase();
    const yearStr = dateObj.getFullYear().toString();
    const formattedDateStr = formatDateDisplay(expenseForm.date);

    let expenseRecord = {
      id: editingExpenseId || `exp-${Date.now()}`,
      invoiceNo: expenseForm.invoiceNo || `EXP/${yearStr}/${String(expenseRecords.length + 1).padStart(3, '0')}`,
      gstBill: expenseForm.gstBill,
      itemName: expenseForm.itemName,
      purpose: expenseForm.purpose,
      year: yearStr,
      month: monthStr,
      date: formattedDateStr,
      partyName: expenseForm.partyName,
      partyNumber: expenseForm.partyNumber || "N/A",
      partyEmail: expenseForm.partyEmail || "N/A",
      partyAddress: expenseForm.partyAddress || "N/A",
      gstRate: gRate,
      gstAmount: gAmt,
      beforeTaxAmount: bTax,
      totalBillAmount: totBill,
      billLink: expenseForm.billLink || "#"
    };

    if (editingExpenseId) {
      setExpenseRecords((prev) => prev.map((item) => (item.id === editingExpenseId || item._id === editingExpenseId ? expenseRecord : item)));
    } else {
      setExpenseRecords((prev) => [expenseRecord, ...prev]);
    }

    try {
      const res = await fetch(`${API_BASE}/financial/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(expenseRecord),
      });
      const data = await res.json();
      if (data.success && data.data) {
        expenseRecord = data.data;
      }
    } catch (err) {
      console.error("Failed to save expense to MongoDB API:", err);
    }

    setShowExpenseModal(false);
    setEditingExpenseId(null);
    setExpenseForm({
      invoiceNo: "",
      gstBill: "YES",
      itemName: "",
      purpose: "",
      year: new Date().getFullYear().toString(),
      month: new Date().toLocaleString("en-US", { month: "short" }).toUpperCase(),
      date: new Date().toISOString().split("T")[0],
      partyName: "",
      partyNumber: "",
      partyEmail: "",
      partyAddress: "",
      gstRate: 18,
      beforeTaxAmount: "",
      billLink: ""
    });
  };

  const handleDeleteExpense = async (id) => {
    setExpenseRecords((prev) => prev.filter((r) => r.id !== id && r._id !== id));
    try {
      await fetch(`${API_BASE}/financial/expenses/${id}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("Failed to delete expense from database:", err);
    }
  };

  const handleDeleteIncome = async (id) => {
    setIncomeRecords((prev) => prev.filter((r) => r.id !== id && r._id !== id));
    try {
      await fetch(`${API_BASE}/financial/invoices/${id}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("Failed to delete invoice from database:", err);
    }
  };

  const handleEditExpense = (record) => {
    setEditingExpenseId(record.id);
    setExpenseForm({
      invoiceNo: record.invoiceNo,
      gstBill: record.gstBill,
      itemName: record.itemName,
      purpose: record.purpose,
      year: record.year,
      month: record.month,
      date: record.date ? record.date.split("/").reverse().join("-") : new Date().toISOString().split("T")[0],
      partyName: record.partyName,
      partyNumber: record.partyNumber,
      partyEmail: record.partyEmail,
      partyAddress: record.partyAddress,
      gstRate: record.gstRate,
      beforeTaxAmount: record.beforeTaxAmount,
      billLink: record.billLink
    });
    setShowExpenseModal(true);
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

    const encodedText = encodeURIComponent(text);
    const phone = form.billTo.phoneNo ? form.billTo.phoneNo.replace(/[^0-9]/g, "") : "";
    const waUrl = phone ? `https://wa.me/91${phone}?text=${encodedText}` : `https://wa.me/?text=${encodedText}`;
    window.open(waUrl, "_blank");
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

  return (
    <AdminInvoiceAuth
      checking={checking}
      authed={authed}
      loginStep={loginStep}
      email={email}
      setEmail={setEmail}
      otp={otp}
      setOtp={setOtp}
      authError={authError}
      submittingAuth={submittingAuth}
      onRequestOtp={handleRequestOtp}
      onVerifyOtp={handleVerifyOtp}
    >
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
            @page {
              size: A4 portrait;
              margin: 4mm 6mm;
            }
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              background: #ffffff !important;
            }
            body * {
              visibility: hidden;
            }
            #printable-invoice-container, #printable-invoice-container * {
              visibility: visible;
            }
            #printable-invoice-container {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              max-width: 100% !important;
              margin: 0 !important;
              padding: 4mm 6mm !important;
              background: #ffffff !important;
              color: #000000 !important;
              font-size: 10px !important;
              line-height: 1.25 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              box-shadow: none !important;
              border: none !important;
              border-radius: 0 !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            .no-print {
              display: none !important;
            }
          }
        `}</style>

        <div className="min-h-screen bg-[#FDFBF7] text-stone-900 antialiased pb-20">
          <AdminNavbar activeTab="invoices" />

          <main className="container mx-auto px-4 pt-24 lg:pt-28 max-w-7xl">
            {/* Header Bar */}
            <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-amber-900/15 bg-white p-6 shadow-xl shadow-stone-200/50">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-900 border border-amber-200 shadow-inner">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black text-amber-950 tracking-wide">
                      Invoice Generator
                    </h1>
                    <p className="text-xs text-amber-900/70 font-medium">
                      Create, customize, print & download GST compliant invoices
                    </p>
                  </div>
                </div>
              </div>

              {/* Multi-Tab Financial & Invoice Navigation Bar */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                <div className="flex rounded-2xl bg-[#F5F0EB] p-1 border border-amber-900/10 flex-wrap sm:flex-nowrap gap-1">
                  <button
                    onClick={() => setActiveTab("dashboard")}
                    className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                      activeTab === "dashboard"
                        ? "bg-[#6B4226] text-white shadow-md"
                        : "text-amber-950/70 hover:text-amber-950 hover:bg-white/60"
                    }`}
                  >
                    <TrendingUp className="h-3.5 w-3.5" />
                    DASHBOARD
                  </button>
                  <button
                    onClick={() => {
                      handleAutoSaveIncome();
                      setActiveTab("income");
                    }}
                    className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                      activeTab === "income"
                        ? "bg-[#6B4226] text-white shadow-md"
                        : "text-amber-950/70 hover:text-amber-950 hover:bg-white/60"
                    }`}
                  >
                    <ArrowDownLeft className="h-3.5 w-3.5 text-emerald-600" />
                    INCOME ({incomeRecords.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("expense")}
                    className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                      activeTab === "expense"
                        ? "bg-[#6B4226] text-white shadow-md"
                        : "text-amber-950/70 hover:text-amber-950 hover:bg-white/60"
                    }`}
                  >
                    <ArrowUpRight className="h-3.5 w-3.5 text-rose-600" />
                    EXPENSE ({expenseRecords.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("generator")}
                    className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                      activeTab === "generator"
                        ? "bg-[#6B4226] text-white shadow-md"
                        : "text-amber-950/70 hover:text-amber-950 hover:bg-white/60"
                    }`}
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    INVOICE GENERATOR
                  </button>
                  <button
                    onClick={() => {
                      handleAutoSaveIncome();
                      setActiveTab("preview");
                    }}
                    className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                      activeTab === "preview"
                        ? "bg-[#6B4226] text-white shadow-md"
                        : "text-amber-950/70 hover:text-amber-950 hover:bg-white/60"
                    }`}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    PREVIEW / PRINT
                  </button>
                </div>
              </div>
            </div>

            {/* 1. EXECUTIVE DASHBOARD */}
            <div className={activeTab === "dashboard" ? "no-print space-y-6" : "hidden no-print"}>
              <AdminFinancialDashboard
                incomeRecords={incomeRecords}
                expenseRecords={expenseRecords}
                onViewPreview={handleViewSoftBill}
                onOpenGenerator={() => setActiveTab("generator")}
                onEditIncome={handleEditIncome}
                onDeleteIncome={handleDeleteIncome}
              />
            </div>

            {/* 2. INCOME REGISTER */}
            <div className={activeTab === "income" ? "no-print space-y-6" : "hidden no-print"}>
              <AdminIncomeRegister
                incomeRecords={incomeRecords}
                onDeleteIncome={handleDeleteIncome}
                onEditIncome={handleEditIncome}
                onViewPreview={handleViewSoftBill}
                onOpenGenerator={() => setActiveTab("generator")}
              />
            </div>

            {/* 3. EXPENSE REGISTER */}
            <div className={activeTab === "expense" ? "no-print space-y-6" : "hidden no-print"}>
              <AdminExpenseRegister
                expenseRecords={expenseRecords}
                onAddExpense={() => {
                  setEditingExpenseId(null);
                  setExpenseForm({
                    invoiceNo: `EXP/2026/${String(expenseRecords.length + 1).padStart(3, "0")}`,
                    gstBill: "YES",
                    itemName: "",
                    purpose: "",
                    year: new Date().getFullYear().toString(),
                    month: new Date().toLocaleString("en-US", { month: "short" }).toUpperCase(),
                    date: new Date().toISOString().split("T")[0],
                    partyName: "",
                    partyNumber: "",
                    partyEmail: "",
                    partyAddress: "",
                    gstRate: 18,
                    beforeTaxAmount: "",
                    billLink: ""
                  });
                  setShowExpenseModal(true);
                }}
                onEditExpense={handleEditExpense}
                onDeleteExpense={handleDeleteExpense}
              />
            </div>

            {/* 4. INVOICE GENERATOR INPUT FORM */}
            <AdminInvoiceForm
              activeTab={activeTab}
              form={form}
              setForm={setForm}
              generateNewUniqueInvoice={generateNewUniqueInvoice}
              updateItem={updateItem}
              addItem={addItem}
              removeItem={removeItem}
              computedAmountInWords={computedAmountInWords}
              subTotal={subTotal}
              totalTax={totalTax}
              totalPayable={totalPayable}
              termsTextareaRef={termsTextareaRef}
              onGenerate={() => {
                handleAutoSaveIncome();
                setActiveTab("preview");
              }}
              onDownloadPDF={() => {
                handleAutoSaveIncome();
                handleDownloadPDF();
              }}
              onPrint={() => {
                handleAutoSaveIncome();
                handlePrint();
              }}
              onSendEmail={() => {
                handleAutoSaveIncome();
                handleSendEmail();
              }}
              onSendWhatsApp={() => {
                handleAutoSaveIncome();
                handleSendWhatsApp();
              }}
              onReset={handleReset}
            />

            {/* 5. LIVE INVOICE PREVIEW / PRINTABLE DOCUMENT SHEET */}
            <AdminInvoicePreview
              activeTab={activeTab}
              form={form}
              computedAmountInWords={computedAmountInWords}
              subTotal={subTotal}
              totalTax={totalTax}
              deliveryChg={deliveryChg}
              packagingChg={packagingChg}
              courierChg={courierChg}
              platformChg={platformChg}
              discount={discount}
              taxableAmount={taxableAmount}
              cgstAmount={cgstAmount}
              sgstAmount={sgstAmount}
              totalPayable={totalPayable}
              formatDateDisplay={formatDateDisplay}
              printRef={printRef}
              onEditGenerator={() => setActiveTab("generator")}
              onDownloadPDF={() => {
                handleAutoSaveIncome();
                handleDownloadPDF();
              }}
              onPrint={() => {
                handleAutoSaveIncome();
                handlePrint();
              }}
              onSendEmail={() => {
                handleAutoSaveIncome();
                handleSendEmail();
              }}
              onSendWhatsApp={() => {
                handleAutoSaveIncome();
                handleSendWhatsApp();
              }}
            />
          </main>
        </div>

        {/* ── EMAIL COMPOSITION & SEND MODAL ── */}
        <SendEmailModal
          isOpen={showEmailModal}
          onClose={() => setShowEmailModal(false)}
          invoiceNo={form.billInfo.invoiceNo}
          emailRecipient={emailRecipient}
          setEmailRecipient={setEmailRecipient}
          emailSubject={emailSubject}
          setEmailSubject={setEmailSubject}
          emailBody={emailBody}
          setEmailBody={setEmailBody}
          copiedEmailText={copiedEmailText}
          onCopyEmailText={handleCopyEmailText}
          onExecuteMailto={handleExecuteMailto}
          onOpenGmail={handleOpenGmail}
          modalTextareaRef={modalTextareaRef}
        />

        {/* ── ADD / EDIT EXPENSE MODAL ── */}
        <AddExpenseModal
          isOpen={showExpenseModal}
          onClose={() => setShowExpenseModal(false)}
          onSave={handleSaveExpense}
          editingExpenseId={editingExpenseId}
          expenseForm={expenseForm}
          setExpenseForm={setExpenseForm}
        />

        {/* ── EDIT INCOME / SALES RECORD MODAL ── */}
        <EditIncomeModal
          isOpen={showIncomeModal}
          onClose={() => {
            setShowIncomeModal(false);
            setEditingIncomeForm(null);
          }}
          onSave={handleSaveIncomeRecord}
          incomeForm={editingIncomeForm}
          setIncomeForm={setEditingIncomeForm}
        />
      </PageTransition>
    </AdminInvoiceAuth>
  );
}
