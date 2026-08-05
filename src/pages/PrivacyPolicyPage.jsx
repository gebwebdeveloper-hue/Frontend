import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Lock, ArrowLeft, FileText, CheckCircle2, Globe, Eye, Server, Cookie, HelpCircle } from "lucide-react";
import PageTransition from "../components/PageTransition.jsx";
import FooterSection from "../sections/FooterSection.jsx";

export default function PrivacyPolicyPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    {
      id: "overview",
      icon: Shield,
      title: "1. Overview & Scope",
      text: `At Lekhok Tripura Publishers, safeguarding the privacy, confidentiality, and security of our authors, readers, and website visitors is one of our highest priorities. We recognize the importance of protecting personal information and are committed to handling all data responsibly, ethically, and in accordance with applicable laws and industry standards. This Privacy Policy outlines how we collect, use, process, store, disclose, and protect the information you provide while accessing our website, submitting manuscripts, purchasing our services, or communicating with our team. By using our website or engaging with our publishing services, you acknowledge that you have carefully read, understood, and agreed to the practices described in this Privacy Policy.`
    },
    {
      id: "collection",
      icon: FileText,
      title: "2. Information We Collect",
      text: `When you visit our website or interact with our services, we may collect personal information including, but not limited to, your name, email address, mobile number, postal address, billing details, manuscript files, book proposals, author biography, payment-related information, and any other details voluntarily provided through contact forms, manuscript submission forms, emails, or other communication channels. In addition, our website may automatically collect technical information such as your IP address, browser type, operating system, device information, referral source, browsing behavior, pages visited, session duration, and other analytical data to improve website performance, security, and user experience.`
    },
    {
      id: "use",
      icon: CheckCircle2,
      title: "3. How We Use Your Information",
      text: `The information collected is used solely for legitimate business purposes, including evaluating manuscript submissions, providing publishing services, processing payments, fulfilling contractual obligations, communicating with authors and customers, responding to inquiries, delivering products and services, improving our website, maintaining internal business records, complying with legal obligations, preventing fraudulent activities, and enhancing the overall quality of our publishing operations. Where applicable, we may also use your contact information to provide updates regarding our services, new publications, promotional campaigns, literary events, or other announcements. You may opt out of promotional communications at any time.`
    },
    {
      id: "confidentiality",
      icon: Lock,
      title: "4. Manuscript Confidentiality",
      text: `We understand that every manuscript submitted to Lekhok Tripura Publishers represents valuable intellectual property and the creative effort of its author. Accordingly, we treat all submitted manuscripts and related materials with the highest level of confidentiality. Unless expressly authorized by the author or required under a legally binding publishing agreement, we do not publish, reproduce, distribute, disclose, or share any manuscript or confidential material with unauthorized third parties. Access to submitted content is strictly limited to personnel directly involved in manuscript evaluation, editorial review, production, or publishing activities.`
    },
    {
      id: "copyright",
      icon: Eye,
      title: "5. Intellectual Property & Copyright",
      text: `Submission of a manuscript to Lekhok Tripura Publishers does not transfer ownership of copyright or any intellectual property rights to the Company. Unless otherwise agreed through a written publishing contract, all copyrights remain exclusively with the author. Any rights granted to Lekhok Tripura Publishers shall be limited to those specifically defined within the applicable publishing agreement. We respect the intellectual property rights of every author and maintain strict internal procedures to protect submitted creative works against unauthorized use or disclosure.`
    },
    {
      id: "thirdparty",
      icon: Globe,
      title: "6. Third-Party Service Providers",
      text: `To facilitate secure transactions and efficient service delivery, we may engage reputable third-party service providers, including payment gateway operators, printing partners, courier services, technology providers, hosting platforms, analytics providers, and online distribution partners. Such third parties receive only the information reasonably necessary to perform their respective services and are expected to maintain appropriate standards of confidentiality and data protection. We neither sell, rent, trade, nor commercially exploit your personal information under any circumstances.`
    },
    {
      id: "cookies",
      icon: Cookie,
      title: "7. Cookies & Tracking Technologies",
      text: `Our website may utilize cookies and similar technologies to enhance user experience, analyze website traffic, remember user preferences, improve website functionality, strengthen security measures, and optimize system performance. These technologies do not ordinarily identify individuals personally but assist us in understanding visitor behavior and improving our digital services. Users may modify their browser settings to decline cookies; however, certain features of the website may become unavailable or function less effectively as a result.`
    },
    {
      id: "security",
      icon: Server,
      title: "8. Data Security Safeguards",
      text: `Lekhok Tripura Publishers implements reasonable administrative, technical, and organizational safeguards to protect personal information against unauthorized access, alteration, disclosure, misuse, loss, or destruction. Our security measures may include encrypted connections, secure hosting infrastructure, restricted administrative access, authentication mechanisms, periodic software updates, backup procedures, and other industry-accepted security practices. Nevertheless, while we make every reasonable effort to protect your information, no method of electronic transmission or internet-based storage can be guaranteed to be completely secure, and users acknowledge the inherent risks associated with digital communication.`
    },
    {
      id: "links",
      icon: Globe,
      title: "9. External Links & Third-Party Platforms",
      text: `Our website may contain links to external websites, online bookstores, social media platforms, payment gateways, or third-party services for the convenience of users. Once you leave our website and access any external platform, the privacy practices of those websites are governed by their respective policies. Lekhok Tripura Publishers assumes no responsibility or liability for the privacy practices, security standards, or content of third-party websites beyond our control.`
    },
    {
      id: "retention",
      icon: FileText,
      title: "10. Data Retention",
      text: `We retain personal information only for as long as reasonably necessary to provide requested services, fulfill contractual and legal obligations, resolve disputes, maintain business records, protect legitimate business interests, or comply with applicable laws. When information is no longer required, we take reasonable measures to securely delete, anonymize, or otherwise dispose of such information in accordance with accepted data management practices.`
    },
    {
      id: "rights",
      icon: CheckCircle2,
      title: "11. Your Rights & Choices",
      text: `Subject to applicable law, you may have the right to request access to your personal information, seek correction of inaccurate or incomplete data, request deletion of information where legally permissible, withdraw previously granted consent, or inquire about the manner in which your information is processed. Requests relating to privacy or personal information may be submitted through the contact details provided on our website, and we will make reasonable efforts to respond within an appropriate timeframe.`
    },
    {
      id: "updates",
      icon: Shield,
      title: "12. Policy Amendments",
      text: `Lekhok Tripura Publishers reserves the right to amend, modify, or update this Privacy Policy at any time without prior notice whenever necessary to reflect changes in our services, business operations, legal requirements, or regulatory obligations. Any revised version shall become effective immediately upon publication on this website, and continued use of our website or services after such publication shall constitute acceptance of the updated Privacy Policy.`
    },
    {
      id: "contact",
      icon: HelpCircle,
      title: "13. Contact Us",
      text: `If you have any questions, concerns, or requests regarding this Privacy Policy or the manner in which your personal information is collected, processed, stored, or protected, you may contact Lekhok Tripura Publishers through the official contact information published on our website. We remain committed to maintaining the trust of our authors, readers, and visitors by ensuring transparency, accountability, and the highest standards of privacy protection across all aspects of our publishing services.`
    }
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-black pt-32 pb-24 text-white relative overflow-hidden">
        {/* Background Ambient Glows */}
        <div className="pointer-events-none absolute left-1/4 top-1/4 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[140px]" />
        <div className="pointer-events-none absolute right-1/4 bottom-1/4 -z-10 h-96 w-96 translate-x-1/2 rounded-full bg-indigo-500/10 blur-[140px]" />

        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {/* Top Navigation Back Button */}
          <div className="mb-8">
            <Link
              to="/"
              className="group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/50 hover:text-cyan-300 transition-colors"
            >
              <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
              Back to Home
            </Link>
          </div>

          {/* Header */}
          <div className="mb-14 text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300"
            >
              <Shield size={14} className="animate-pulse text-cyan-400" />
              Legal & Privacy
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-6 text-4xl font-black tracking-tight sm:text-6xl bg-gradient-to-r from-cyan-400 via-indigo-300 to-fuchsia-400 bg-clip-text text-transparent"
            >
              Privacy Policy
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-4 text-sm font-semibold uppercase tracking-widest text-cyan-400/80"
            >
              Effective Date: 05 August 2026
            </motion.p>
          </div>

          {/* Summary Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="mb-12 rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/30 via-zinc-950/80 to-indigo-950/20 p-6 sm:p-8 backdrop-blur-xl shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-4 text-cyan-300 font-bold text-base">
              <Lock className="h-5 w-5 text-cyan-400 shrink-0" />
              <span>Lekhok Tripura Publishers Commitment</span>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed text-white/80 font-normal">
              At <strong>Lekhok Tripura Publishers</strong>, safeguarding the privacy, confidentiality, and security of our authors, readers, and website visitors is one of our highest priorities. We treat every manuscript, order, and communication with strict confidentiality and industry-standard security.
            </p>
          </motion.div>

          {/* Detailed Policy Sections */}
          <div className="space-y-8">
            {sections.map((section, idx) => {
              const IconComponent = section.icon;
              return (
                <motion.section
                  key={section.id}
                  id={section.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.4, delay: idx * 0.03 }}
                  className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-8 backdrop-blur-md transition-all duration-300 hover:border-cyan-500/30 hover:bg-white/[0.04]"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                      <IconComponent size={20} />
                    </div>
                    <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                      {section.title}
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm leading-relaxed text-white/75 font-normal text-justify sm:text-left">
                    {section.text}
                  </p>
                </motion.section>
              );
            })}
          </div>

          {/* Footer Contact Banner */}
          <div className="mt-16 rounded-3xl border border-white/10 bg-gradient-to-r from-zinc-950 via-cyan-950/20 to-zinc-950 p-8 text-center backdrop-blur-md">
            <h3 className="text-xl font-bold text-white mb-2">Have questions about our Privacy Policy?</h3>
            <p className="text-xs text-white/60 max-w-md mx-auto mb-6">
              Our team is dedicated to addressing any privacy concerns or data requests. Contact us anytime for assistance.
            </p>
            <Link
              to="/help"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-400 px-6 py-3 text-xs font-black text-black hover:opacity-90 transition uppercase tracking-wider shadow-lg shadow-cyan-400/20"
            >
              Contact Support & Help Center
            </Link>
          </div>
        </div>
      </div>
      <FooterSection />
    </PageTransition>
  );
}
