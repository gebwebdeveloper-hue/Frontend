import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  TrendingUp,
  Megaphone,
  Palette,
  FileEdit,
  Calculator,
  Layers,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Send,
  Sparkles,
  Phone,
  Mail,
  Home,
  User,
  ExternalLink,
  ChevronDown,
  Building2,
  FileText,
  UploadCloud,
  X,
  Lock,
  LogIn,
  UserPlus,
  UserCheck,
} from "lucide-react";
import PageTransition from "../components/PageTransition.jsx";
import FooterSection from "../sections/FooterSection.jsx";
import AuthModal from "../components/AuthModal.jsx";
import { API_BASE } from "../config.js";
import { INDIA_STATES } from "../utils/indiaData.js";

const openRoles = [
  {
    id: "sales",
    title: "Sales",
    badge: "Growth & Partnerships",
    icon: TrendingUp,
    iconColor: "text-amber-400",
    iconBg: "bg-amber-400/10 border-amber-400/20",
    gradient: "from-amber-500/10 via-amber-500/5 to-transparent",
    border: "hover:border-amber-400/40",
    location: "Tripura / Hybrid",
    type: "Full-Time / Part-Time",
    summary:
      "Drive book distribution, school and library outreach, book fair networks, and strategic publishing sales across Northeast India and beyond.",
    responsibilities: [
      "Expand book distribution to bookstores, educational institutions, and libraries.",
      "Engage with authors and publishers for publishing packages and custom orders.",
      "Coordinate with logistics and inventory for timely book deliveries.",
      "Achieve monthly outreach and revenue goals.",
    ],
  },
  {
    id: "marketing",
    title: "Marketing",
    badge: "Digital & Campaigns",
    icon: Megaphone,
    iconColor: "text-cyan-400",
    iconBg: "bg-cyan-400/10 border-cyan-400/20",
    gradient: "from-cyan-500/10 via-cyan-500/5 to-transparent",
    border: "hover:border-cyan-400/40",
    location: "Tripura / Remote",
    type: "Full-Time / Remote",
    summary:
      "Spearhead creative promotional campaigns, author spotlight series, book launch trailers, and social media storytelling for our growing catalog.",
    responsibilities: [
      "Manage social media channels, book release campaigns, and press releases.",
      "Run targeted ad campaigns across Meta, Amazon, and regional literary communities.",
      "Collaborate with literary reviewers, influencers, and media houses.",
      "Craft engaging newsletters, trailers, and promotional copy.",
    ],
  },
  {
    id: "cover-artist",
    title: "Cover artist",
    badge: "Visual Art & Illustration",
    icon: Palette,
    iconColor: "text-fuchsia-400",
    iconBg: "bg-fuchsia-400/10 border-fuchsia-400/20",
    gradient: "from-fuchsia-500/10 via-fuchsia-500/5 to-transparent",
    border: "hover:border-fuchsia-400/40",
    location: "Remote / Hybrid",
    type: "Creative / Project-Based",
    summary:
      "Design visually stunning, emotionally resonant book covers across fiction, poetry, historical treatises, and regional regional literature.",
    responsibilities: [
      "Design front, spine, and back covers optimized for print and digital listings.",
      "Create original artwork, digital paintings, or typography-led cover concepts.",
      "Prepare CMYK print-ready files adhering to Amazon KDP, Ingram, and local press standards.",
      "Produce 3D promotional mockups for author marketing.",
    ],
  },
  {
    id: "book-editor",
    title: "Book editor",
    badge: "Editorial & Content",
    icon: FileEdit,
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-400/10 border-emerald-400/20",
    gradient: "from-emerald-500/10 via-emerald-500/5 to-transparent",
    border: "hover:border-emerald-400/40",
    location: "Tripura / Remote",
    type: "Full-Time / Contract",
    summary:
      "Review manuscripts in Bengali, English, Kokborok, or Hindi. Shape narrative coherence, grammar, pacing, and overall literary finesse.",
    responsibilities: [
      "Perform developmental editing, line editing, and rigorous proofreading.",
      "Provide constructive, respectful feedback to seasoned and debut authors.",
      "Ensure cultural sensitivity, linguistic accuracy, and typographical perfection.",
      "Oversee book blurb drafting and preliminary front/back matter.",
    ],
  },
  {
    id: "accountant",
    title: "Accountant",
    badge: "Finance & Compliance",
    icon: Calculator,
    iconColor: "text-violet-400",
    iconBg: "bg-violet-400/10 border-violet-400/20",
    gradient: "from-violet-500/10 via-violet-500/5 to-transparent",
    border: "hover:border-violet-400/40",
    location: "Agartala, Tripura",
    type: "Full-Time",
    summary:
      "Manage publishing ledgers, author royalty computations, billing, tax compliance (GST & TDS), and financial records of publishing operations.",
    responsibilities: [
      "Maintain day-to-day accounts, payment vouchers, and vendor balances.",
      "Calculate quarterly author royalties and issue royalty statements.",
      "Process invoices, GST filings, and reconcile bank / gateway statements.",
      "Assist management with budgeting, printing cost sheets, and audit reports.",
    ],
  },
  {
    id: "designer",
    title: "Designer role",
    badge: "Layout & Typesetting",
    icon: Layers,
    iconColor: "text-rose-400",
    iconBg: "bg-rose-400/10 border-rose-400/20",
    gradient: "from-rose-500/10 via-rose-500/5 to-transparent",
    border: "hover:border-rose-400/40",
    location: "Tripura / Remote",
    type: "Full-Time / Contract",
    summary:
      "Format book interiors (A5, Royal, Crown sizes), design elegant typography grids, chapter headers, bookmarks, certificates, and marketing banners.",
    responsibilities: [
      "Typeset complex multilingual manuscripts (Bengali, English, Hindi).",
      "Format interior pages conforming to international print and ePUB standards.",
      "Design banners, posters, brochures, author certificates, and merchandise.",
      "Ensure high quality control prior to sending to press.",
    ],
  },
  {
    id: "office-assistant",
    title: "Office assistant",
    badge: "Administration & Operations",
    icon: Building2,
    iconColor: "text-teal-400",
    iconBg: "bg-teal-400/10 border-teal-400/20",
    gradient: "from-teal-500/10 via-teal-500/5 to-transparent",
    border: "hover:border-teal-400/40",
    location: "Agartala, Tripura",
    type: "Full-Time",
    summary:
      "Manage front-office operations, handle book inventory, coordinate shipments & logistics, and provide administrative support to the publishing team.",
    responsibilities: [
      "Coordinate packaging, dispatch, and tracking of author copies and book orders.",
      "Maintain physical stock, sample copies, stationery, and office documentation.",
      "Handle front-desk inquiries, phone calls, and visitor assistance warmly.",
      "Assist editorial, marketing, and sales departments with day-to-day administrative tasks.",
    ],
  },
];

const roleOptions = [
  "Sales",
  "Marketing",
  "Cover artist",
  "Book editor",
  "Accountant",
  "Designer role",
  "Office assistant",
];

export default function CareersPage() {
  const formRef = useRef(null);
  const fileInputRef = useRef(null);

  const getStoredUser = () => {
    try {
      const saved = localStorage.getItem("lekhok_auth_user") || localStorage.getItem("story_reader_info");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  };

  const initialUser = getStoredUser();
  const [currentUser, setCurrentUser] = useState(initialUser);
  const [authChecking, setAuthChecking] = useState(!initialUser);
  const [authModal, setAuthModal] = useState({ isOpen: false, tab: "login" });

  const [formData, setFormData] = useState({
    name: initialUser?.name || "",
    number: initialUser?.phone || initialUser?.number || "",
    email: initialUser?.email || "",
    state: "",
    hometown: "",
    pin: "",
    address: "",
    role: "Sales",
    experience: "",
    portfolioUrl: "",
  });

  const [resumeFile, setResumeFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: "", message: "" });

  const checkAuth = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, { credentials: "include" });
      const data = await res.json();
      if (res.ok && data.success && data.user) {
        setCurrentUser(data.user);
        try {
          localStorage.setItem("lekhok_auth_user", JSON.stringify(data.user));
        } catch {}
        setFormData((prev) => ({
          ...prev,
          name: prev.name || data.user.name || "",
          email: prev.email || data.user.email || "",
          number: prev.number || (data.user.phone || data.user.number || ""),
        }));
      } else {
        if (res.status === 401) {
          setCurrentUser(null);
          try {
            localStorage.removeItem("lekhok_auth_user");
          } catch {}
        }
      }
    } catch {
      const savedUser = getStoredUser();
      if (savedUser) {
        setCurrentUser(savedUser);
        setFormData((prev) => ({
          ...prev,
          name: prev.name || savedUser.name || "",
          email: prev.email || savedUser.email || "",
          number: prev.number || (savedUser.phone || savedUser.number || ""),
        }));
      }
    } finally {
      setAuthChecking(false);
    }
  };

  useEffect(() => {
    checkAuth();

    const handleAuthEvent = (e) => {
      if (e?.detail) {
        setCurrentUser(e.detail);
        setFormData((prev) => ({
          ...prev,
          name: prev.name || e.detail.name || "",
          email: prev.email || e.detail.email || "",
          number: prev.number || (e.detail.phone || e.detail.number || ""),
        }));
        setAuthChecking(false);
      } else {
        checkAuth();
      }
    };

    const handleLogoutEvent = () => {
      setCurrentUser(null);
      setAuthChecking(false);
    };

    window.addEventListener("lekhak:auth-user", handleAuthEvent);
    window.addEventListener("lekhok:login", handleAuthEvent);
    window.addEventListener("lekhak:login", handleAuthEvent);
    window.addEventListener("lekhak:logout", handleLogoutEvent);
    window.addEventListener("focus", checkAuth);

    return () => {
      window.removeEventListener("lekhak:auth-user", handleAuthEvent);
      window.removeEventListener("lekhok:login", handleAuthEvent);
      window.removeEventListener("lekhak:login", handleAuthEvent);
      window.removeEventListener("lekhak:logout", handleLogoutEvent);
      window.removeEventListener("focus", checkAuth);
    };
  }, []);

  const handleSelectRole = (roleTitle) => {
    setFormData((prev) => ({ ...prev, role: roleTitle }));
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    if (!currentUser && !authChecking) {
      setAuthModal({ isOpen: true, tab: "login" });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "number") {
      const cleanVal = value.replace(/\D/g, "").slice(0, 10);
      setFormData((prev) => ({ ...prev, number: cleanVal }));
    } else if (name === "pin") {
      const cleanVal = value.replace(/\D/g, "").slice(0, 6);
      setFormData((prev) => ({ ...prev, pin: cleanVal }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setFileError("");
    if (!file) return;

    const isPdf =
      file.name.toLowerCase().endsWith(".pdf") ||
      file.type === "application/pdf" ||
      file.type === "application/x-pdf";

    if (!isPdf) {
      setFileError("Only PDF files (.pdf) are allowed.");
      e.target.value = "";
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setFileError("PDF file size must be less than 15MB.");
      e.target.value = "";
      return;
    }

    setResumeFile(file);
  };

  const handleRemoveFile = () => {
    setResumeFile(null);
    setFileError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus({ type: "", message: "" });
    setFileError("");

    if (!currentUser) {
      setAuthModal({ isOpen: true, tab: "login" });
      setSubmitStatus({
        type: "error",
        message: "Please sign in or register your account to submit this application.",
      });
      return;
    }

    // Validations
    if (!formData.name.trim()) {
      setSubmitStatus({ type: "error", message: "Please enter your Name." });
      return;
    }
    if (formData.number.length < 10) {
      setSubmitStatus({
        type: "error",
        message: "Please enter a valid 10-digit mobile number.",
      });
      return;
    }
    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email)) {
      setSubmitStatus({
        type: "error",
        message: "Please enter a valid Mail ID.",
      });
      return;
    }
    if (!formData.state.trim()) {
      setSubmitStatus({ type: "error", message: "Please enter your State." });
      return;
    }
    if (!formData.hometown.trim()) {
      setSubmitStatus({ type: "error", message: "Please enter your Hometown." });
      return;
    }
    if (formData.pin.length !== 6) {
      setSubmitStatus({
        type: "error",
        message: "Please enter a valid 6-digit Pin code.",
      });
      return;
    }
    if (!formData.address.trim()) {
      setSubmitStatus({ type: "error", message: "Please enter your Address." });
      return;
    }
    if (!formData.role) {
      setSubmitStatus({
        type: "error",
        message: "Please select the role you wish to join as.",
      });
      return;
    }
    if (!resumeFile) {
      setFileError("Please upload your Resume in PDF format.");
      setSubmitStatus({
        type: "error",
        message: "Resume PDF upload is mandatory. Please attach your resume.",
      });
      return;
    }
    if (!formData.experience.trim()) {
      setSubmitStatus({
        type: "error",
        message: "Please fill in your Experience / Why you want to join.",
      });
      return;
    }

    setLoading(true);

    try {
      const payload = new FormData();
      payload.append("name", formData.name.trim());
      payload.append("number", formData.number.trim());
      payload.append("email", formData.email.trim().toLowerCase());
      payload.append("state", formData.state.trim());
      payload.append("hometown", formData.hometown.trim());
      payload.append("pin", formData.pin.trim());
      payload.append("address", formData.address.trim());
      payload.append("role", formData.role);
      payload.append("experience", formData.experience.trim());
      if (formData.portfolioUrl.trim()) {
        payload.append("portfolioUrl", formData.portfolioUrl.trim());
      }
      if (resumeFile) {
        payload.append("resume", resumeFile);
      }

      const res = await fetch(`${API_BASE}/careers/apply`, {
        method: "POST",
        body: payload,
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSubmitStatus({
          type: "success",
          message:
            "Thank you! Your application and resume have been submitted successfully. Our team will review your profile and contact you soon.",
        });
        setFormData({
          name: currentUser?.name || "",
          number: currentUser?.phone || currentUser?.number || "",
          email: currentUser?.email || "",
          state: "",
          hometown: "",
          pin: "",
          address: "",
          role: "Sales",
          experience: "",
          portfolioUrl: "",
        });
        handleRemoveFile();
      } else {
        if (res.status === 401) {
          setCurrentUser(null);
          setAuthModal({ isOpen: true, tab: "login" });
        }
        setSubmitStatus({
          type: "error",
          message: data.message || "Failed to submit application. Please try again.",
        });
      }
    } catch (err) {
      setSubmitStatus({
        type: "error",
        message: "Network error occurred. Please check your connection and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#06080d] text-white pt-36 sm:pt-40 lg:pt-44 pb-20 selection:bg-cyan-500/30">
        {/* Background glow effects */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-cyan-500/10 via-violet-500/10 to-transparent blur-[140px] rounded-full" />
          <div className="absolute bottom-1/3 right-10 w-[500px] h-[400px] bg-emerald-500/10 blur-[130px] rounded-full" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Header */}
          <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs sm:text-sm font-medium mb-6 backdrop-blur-md"
            >
              <Sparkles size={15} className="text-cyan-400" />
              <span>Join Team Lekhok Tripura</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6"
            >
              Shape the Future of{" "}
              <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                Publishing & Literature
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base sm:text-lg text-slate-300 leading-relaxed"
            >
              We are expanding our vibrant family of storytellers, creative artists,
              editorial perfectionists, and strategic operators. Explore our open
              positions below and send us your application!
            </motion.p>
          </div>

          {/* Open Roles Section */}
          <div className="mb-20">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-white/10">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
                  <Briefcase className="text-cyan-400" size={28} />
                  Open Positions
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Click &ldquo;Apply Now&rdquo; on any role to pre-select it in the application form.
                </p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 mt-3 sm:mt-0 self-start sm:self-auto">
                {openRoles.length} Open Roles
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {openRoles.map((role, idx) => {
                const IconComponent = role.icon;
                return (
                  <motion.div
                    key={role.id}
                    initial={{ opacity: 0, y: 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.08 }}
                    className={`group relative rounded-2xl bg-gradient-to-b ${role.gradient} bg-[#0c121e]/80 border border-white/10 ${role.border} p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/10 hover:-translate-y-1 backdrop-blur-sm`}
                  >
                    <div>
                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center border ${role.iconBg}`}
                        >
                          <IconComponent className={role.iconColor} size={24} />
                        </div>
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-white/5 text-slate-300 border border-white/10">
                          {role.badge}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                        {role.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-400 mb-4">
                        <span className="flex items-center gap-1">
                          <MapPin size={13} className="text-slate-500" />
                          {role.location}
                        </span>
                        <span>•</span>
                        <span>{role.type}</span>
                      </div>

                      <p className="text-sm text-slate-300 leading-relaxed mb-5">
                        {role.summary}
                      </p>

                      {/* Key highlights */}
                      <div className="space-y-2 mb-6 pt-3 border-t border-white/5">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                          Key Focus Areas:
                        </p>
                        {role.responsibilities.slice(0, 3).map((resp, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-2 text-xs text-slate-300"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0" />
                            <span>{resp}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSelectRole(role.title)}
                      className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-cyan-500 text-white hover:text-black font-semibold text-sm border border-white/10 hover:border-cyan-400 transition-all duration-200 group-hover:shadow-lg group-hover:shadow-cyan-500/20"
                    >
                      <span>Apply for {role.title}</span>
                      <ArrowRight size={15} />
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Application Form Section */}
          <div ref={formRef} className="max-w-3xl mx-auto pt-6 scroll-mt-28">
            {authChecking ? (
              <div className="rounded-3xl bg-[#0e1626]/80 border border-cyan-500/20 p-12 text-center backdrop-blur-xl">
                <Loader2 className="mx-auto mb-3 animate-spin text-cyan-400" size={36} />
                <p className="text-sm text-slate-400">Verifying authentication status...</p>
              </div>
            ) : !currentUser ? (
              <div className="relative rounded-3xl bg-gradient-to-b from-[#0e1626] to-[#0a0f1a] border border-cyan-500/30 p-8 sm:p-12 shadow-2xl shadow-cyan-950/40 backdrop-blur-xl text-center">
                <div className="mx-auto mb-5 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-teal-500/20 border border-cyan-400/40 text-cyan-400 shadow-lg shadow-cyan-500/20">
                  <Lock size={30} />
                </div>

                <span className="inline-block text-[11px] font-bold tracking-widest uppercase px-3.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 mb-3">
                  Authentication Required
                </span>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
                  Sign In to Submit Your Application
                </h2>

                <p className="text-sm text-slate-300 max-w-lg mx-auto mb-8 leading-relaxed">
                  To apply for open positions at Lekhok Tripura and securely upload your resume PDF, please sign in or register your account first.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
                  <button
                    type="button"
                    onClick={() => setAuthModal({ isOpen: true, tab: "login" })}
                    className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-black font-bold text-sm shadow-lg shadow-cyan-500/25 transition-all duration-200 cursor-pointer"
                  >
                    <LogIn size={17} />
                    <span>Login to Apply</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAuthModal({ isOpen: true, tab: "register" })}
                    className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm border border-white/15 hover:border-white/30 transition-all duration-200 cursor-pointer"
                  >
                    <UserPlus size={17} />
                    <span>Create Account</span>
                  </button>
                </div>

                <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-center gap-2 text-xs text-slate-400">
                  <Sparkles size={14} className="text-cyan-400" />
                  <span>Target Role Selected: <strong className="text-white">{formData.role}</strong></span>
                </div>
              </div>
            ) : (
              <div className="relative rounded-3xl bg-gradient-to-b from-[#0e1626] to-[#0a0f1a] border border-cyan-500/20 p-6 sm:p-10 shadow-2xl shadow-cyan-950/40 backdrop-blur-xl">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 mb-3">
                    <Send size={22} />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                    Submit Your Application
                  </h2>
                  <p className="text-sm text-slate-300 mt-2 max-w-md mx-auto">
                    Fill in your details below. Our recruitment team reviews every application
                    and responds promptly.
                  </p>
                </div>

                {/* Status Alert */}
                {submitStatus.message && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mb-6 p-4 rounded-xl flex items-start gap-3 border ${
                      submitStatus.type === "success"
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                        : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                    }`}
                  >
                    {submitStatus.type === "success" ? (
                      <CheckCircle2 size={20} className="flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                    )}
                    <div className="text-sm leading-relaxed">
                      {submitStatus.message}
                    </div>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                {/* 1. Name */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                    Name <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <User
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. Debashis Roy"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-white placeholder-slate-500 text-sm outline-none transition"
                    />
                  </div>
                </div>

                {/* 2 & 3. Number & Mail id */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                      Number <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <Phone
                        size={18}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type="tel"
                        name="number"
                        value={formData.number}
                        onChange={handleInputChange}
                        required
                        maxLength={10}
                        placeholder="10-digit mobile number"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-white placeholder-slate-500 text-sm outline-none transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                      Mail id <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <Mail
                        size={18}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="yourname@gmail.com"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-white placeholder-slate-500 text-sm outline-none transition"
                      />
                    </div>
                  </div>
                </div>

                {/* 4, 5, 6. State, Hometown, Pin */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                      State <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <select
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-white text-sm outline-none transition appearance-none cursor-pointer pr-10 font-medium"
                      >
                        <option value="" disabled className="bg-slate-900 text-slate-500">
                          Select State / UT
                        </option>
                        {INDIA_STATES.map((st) => (
                          <option key={st} value={st} className="bg-slate-900 text-white">
                            {st}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={16}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                      Hometown <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="hometown"
                      value={formData.hometown}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. Agartala"
                      className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-white placeholder-slate-500 text-sm outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                      Pin <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="pin"
                      value={formData.pin}
                      onChange={handleInputChange}
                      required
                      maxLength={6}
                      placeholder="6-digit PIN"
                      className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-white placeholder-slate-500 text-sm outline-none transition"
                    />
                  </div>
                </div>

                {/* 7. Address */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                    Address <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Home
                      size={18}
                      className="absolute left-3.5 top-3.5 text-slate-400"
                    />
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      rows={2}
                      placeholder="Street, locality, landmark, house number..."
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-white placeholder-slate-500 text-sm outline-none transition resize-none"
                    />
                  </div>
                </div>

                {/* 8. I want to join as */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-cyan-300 mb-2">
                    I want to join as <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-cyan-500/40 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 text-white text-sm outline-none transition appearance-none cursor-pointer font-medium"
                    >
                      {roleOptions.map((opt) => (
                        <option key={opt} value={opt} className="bg-slate-900 text-white">
                          {opt}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={18}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-cyan-400 pointer-events-none"
                    />
                  </div>
                </div>

                {/* 9. Resume PDF Upload (Mandatory) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Upload Resume (PDF) <span className="text-rose-400">*</span>
                    </label>
                    <span className="text-[11px] font-medium text-slate-400">PDF only, max 15MB</span>
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf,application/pdf"
                    className="hidden"
                    id="resume-pdf-upload"
                  />

                  {!resumeFile ? (
                    <label
                      htmlFor="resume-pdf-upload"
                      className={`group flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 ${
                        fileError
                          ? "border-rose-500/60 bg-rose-500/5"
                          : "border-slate-700/80 hover:border-cyan-400/80 bg-slate-900/60 hover:bg-slate-900/90"
                      }`}
                    >
                      <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                        <UploadCloud size={24} />
                      </div>
                      <p className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">
                        Click to upload your Resume PDF
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Supports .pdf format up to 15MB
                      </p>
                    </label>
                  ) : (
                    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/90 border border-cyan-500/40 text-sm">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center flex-shrink-0">
                          <FileText size={20} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-white truncate text-xs sm:text-sm">
                            {resumeFile.name}
                          </p>
                          <p className="text-[11px] text-emerald-400 flex items-center gap-1 mt-0.5">
                            <CheckCircle2 size={12} />
                            <span>{(resumeFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to upload</span>
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="p-2 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-white/10 transition-colors ml-3 flex-shrink-0"
                        title="Remove file"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}

                  {fileError && (
                    <p className="text-xs text-rose-400 mt-1.5 flex items-center gap-1">
                      <AlertCircle size={13} /> {fileError}
                    </p>
                  )}
                </div>

                {/* 10. Optional Portfolio / Behance / LinkedIn */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                    Portfolio / Behance / LinkedIn / Website{" "}
                    <span className="text-slate-500 lowercase font-normal">(optional)</span>
                  </label>
                  <div className="relative">
                    <ExternalLink
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="url"
                      name="portfolioUrl"
                      value={formData.portfolioUrl}
                      onChange={handleInputChange}
                      placeholder="https://behance.net/yourprofile or LinkedIn profile"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-white placeholder-slate-500 text-sm outline-none transition"
                    />
                  </div>
                </div>

                {/* 11. Mandatory Experience / Bio */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                    Brief Experience / Why you want to join{" "}
                    <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    placeholder="Tell us about your previous experience, software skills, or projects..."
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-white placeholder-slate-500 text-sm outline-none transition resize-none"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-black font-bold text-base shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      <span>Submitting Application...</span>
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      <span>Submit Application</span>
                    </>
                  )}
                </button>
              </form>
            </div>
            )}
          </div>
        </div>
      </div>

      {authModal.isOpen && (
        <AuthModal
          initialTab={authModal.tab}
          onClose={(user) => {
            setAuthModal({ isOpen: false, tab: "login" });
            if (user) {
              setCurrentUser(user);
              setFormData((prev) => ({
                ...prev,
                name: prev.name || user.name || "",
                email: prev.email || user.email || "",
                number: prev.number || (user.phone || user.number || ""),
              }));
            } else {
              checkAuth();
            }
          }}
        />
      )}

      <FooterSection />
    </PageTransition>
  );
}
