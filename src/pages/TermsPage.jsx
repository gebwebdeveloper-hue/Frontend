import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, Scale, ArrowLeft, Shield, CheckCircle2, Globe, Lock, AlertTriangle, Building2, Gavel, HelpCircle } from "lucide-react";
import PageTransition from "../components/PageTransition.jsx";
import FooterSection from "../sections/FooterSection.jsx";

export default function TermsPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    {
      id: "overview",
      icon: Scale,
      title: "1. Overview & Agreement",
      text: `Welcome to Lekhok Tripura Publishers. These Terms & Conditions ("Terms") govern your access to and use of our website, publishing platform, products, and services. By accessing our website, submitting a manuscript, purchasing any service, placing an order, or otherwise engaging with Lekhok Tripura Publishers, you acknowledge that you have read, understood, and agreed to be legally bound by these Terms & Conditions. If you do not agree with any provision of these Terms, you must discontinue the use of our website and services immediately.`
    },
    {
      id: "services",
      icon: Building2,
      title: "2. Scope of Publishing Services",
      text: `Lekhok Tripura Publishers operates as an independent publishing company dedicated to providing professional publishing, editorial, design, printing, marketing, distribution, and author support services. All services are provided subject to the terms of the applicable publishing agreement, quotation, proposal, or service package accepted by the author or customer. Information displayed on this website is provided for general informational purposes only and does not constitute a legally binding commitment unless expressly confirmed in writing by the Company.`
    },
    {
      id: "warranties",
      icon: Shield,
      title: "3. Original Ownership & Author Warranties",
      text: `By submitting a manuscript or any creative work to Lekhok Tripura Publishers, you expressly represent and warrant that you are the original author, creator, or lawful copyright holder of the submitted material, or that you possess all necessary rights, permissions, licenses, and legal authority required to submit such content for publication. You further confirm that the submitted material does not infringe upon any copyright, trademark, patent, privacy right, publicity right, contractual obligation, or any other intellectual property or proprietary rights of any third party. The Company reserves the right to reject, suspend, or terminate any publishing project if it reasonably believes that the submitted material violates applicable laws or infringes upon the rights of others.`
    },
    {
      id: "copyright",
      icon: Lock,
      title: "4. Copyright Retention & License Rights",
      text: `Unless otherwise agreed through a separately executed written publishing agreement, the copyright and ownership of the manuscript shall remain exclusively with the author. Submission of a manuscript to Lekhok Tripura Publishers shall not be interpreted as an assignment or transfer of copyright ownership. Any publishing, printing, distribution, marketing, translation, adaptation, or reproduction rights granted to the Company shall be limited strictly to those expressly specified within the applicable agreement. Nothing contained in these Terms shall be construed as granting the Company ownership of the author's intellectual property beyond the scope of the agreed publishing services.`
    },
    {
      id: "editorial",
      icon: FileText,
      title: "5. Editorial & Production Process",
      text: `The author acknowledges that publishing is a collaborative process involving editorial review, formatting, cover design, proofreading, production, and quality control. While Lekhok Tripura Publishers strives to maintain the highest professional standards, editorial recommendations, formatting suggestions, design revisions, and production decisions may be made in consultation with the author to ensure technical compatibility, market suitability, and publication quality. Final approval responsibilities may vary depending upon the selected publishing package or contractual arrangement.`
    },
    {
      id: "payments",
      icon: CheckCircle2,
      title: "6. Service Fees, Charges & Payments",
      text: `All service charges, publishing fees, design costs, printing expenses, marketing fees, and any applicable taxes shall be payable in accordance with the quotation, invoice, or selected publishing plan. Unless otherwise agreed in writing, work on any project may commence only after receipt of the required advance payment. Failure to make timely payments may result in suspension, postponement, or cancellation of the publishing process. The Company reserves the right to withhold delivery of completed work, printed copies, digital files, ISBN allocation, or distribution services until all outstanding payments have been received in full.`
    },
    {
      id: "royalties",
      icon: Scale,
      title: "7. Royalties & Commercial Expectations",
      text: `Where royalties are applicable under a publishing agreement, royalty calculations shall be made strictly in accordance with the terms specified in the executed agreement. Royalty payments may vary depending on the sales channel, distribution partner, applicable taxes, marketplace commissions, printing costs, discounts, promotional offers, and other commercial deductions. The Company does not guarantee any minimum sales, financial returns, commercial success, bestseller status, literary awards, media coverage, or profitability arising from publication of any book.`
    },
    {
      id: "selfpublishing",
      icon: Building2,
      title: "8. Self-Publishing & Author Responsibilities",
      text: `Authors participating in self-publishing acknowledge that they retain greater creative control over their publication while assuming responsibility for the commercial viability and market performance of their work. Where the Company provides ISBN registration, printing, distribution, marketing, or digital publishing services, such services shall be governed by the scope of the selected publishing package and any additional written agreement executed between the parties.`
    },
    {
      id: "distribution",
      icon: Globe,
      title: "9. Distribution Channels & Third Parties",
      text: `The Company may distribute published works through various channels including its own website, online marketplaces, bookstores, distributors, eBook platforms, and other commercial partners. Availability on any particular marketplace shall depend upon the policies, approval processes, technical requirements, and operational decisions of the respective third-party platform. Lekhok Tripura Publishers shall not be held responsible for delays, temporary unavailability, removal of listings, pricing changes, policy modifications, or technical issues arising from third-party distribution platforms.`
    },
    {
      id: "prohibited",
      icon: AlertTriangle,
      title: "10. Prohibited Activities & Website Security",
      text: `Users of this website agree not to engage in any activity that may interfere with the security, integrity, availability, or proper functioning of the website. Unauthorized access, hacking, reverse engineering, automated data extraction, transmission of malicious software, impersonation, fraudulent activity, unlawful content submission, or any attempt to compromise the Company's systems is strictly prohibited and may result in immediate termination of access together with appropriate legal action.`
    },
    {
      id: "disclaimer",
      icon: Scale,
      title: "11. Disclaimer of Warranties",
      text: `While every reasonable effort is made to ensure that information published on this website is accurate, complete, and up to date, Lekhok Tripura Publishers makes no express or implied warranties regarding the accuracy, reliability, completeness, availability, or suitability of any content, service, or information presented on the website. All services are provided on an "as available" and "as is" basis unless otherwise expressly agreed in writing.`
    },
    {
      id: "limitation",
      icon: AlertTriangle,
      title: "12. Limitation of Liability",
      text: `To the fullest extent permitted by applicable law, Lekhok Tripura Publishers, its directors, employees, affiliates, consultants, contractors, and representatives shall not be liable for any indirect, incidental, consequential, special, exemplary, punitive, or business losses arising out of or related to the use of the website, publishing services, delay in production, marketplace policies, technical failures, loss of profits, data loss, interruption of business, or any circumstances beyond the reasonable control of the Company.`
    },
    {
      id: "jurisdiction",
      icon: Gavel,
      title: "13. Governing Law & Jurisdiction",
      text: `These Terms & Conditions shall be governed by and interpreted in accordance with the laws of the Republic of India. Any dispute, controversy, or legal proceeding arising from or relating to these Terms, the website, or any publishing services shall, subject to applicable law, fall within the exclusive jurisdiction of the competent courts located in Agartala, Tripura, India.`
    },
    {
      id: "amendments",
      icon: Shield,
      title: "14. Policy Amendments & Modifications",
      text: `Lekhok Tripura Publishers reserves the absolute right to modify, revise, suspend, discontinue, or replace these Terms & Conditions at any time without prior notice. Any revised version shall become effective immediately upon publication on this website. Continued use of the website or our services following the publication of revised Terms shall constitute acceptance of those revised Terms.`
    },
    {
      id: "severability",
      icon: FileText,
      title: "15. Severability",
      text: `If any provision of these Terms & Conditions is determined by a court or competent legal authority to be invalid, illegal, or unenforceable, the remaining provisions shall continue to remain in full force and effect without affecting the validity or enforceability of the remaining sections.`
    },
    {
      id: "contact",
      icon: HelpCircle,
      title: "16. Contact Information",
      text: `For any questions regarding these Terms & Conditions, publishing services, legal agreements, or your rights and obligations as an author or customer, you may contact Lekhok Tripura Publishers using the official contact details published on this website.`
    }
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-black pt-32 pb-24 text-white relative overflow-hidden">
        {/* Background Ambient Glows */}
        <div className="pointer-events-none absolute left-1/4 top-1/4 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[140px]" />
        <div className="pointer-events-none absolute right-1/4 bottom-1/4 -z-10 h-96 w-96 translate-x-1/2 rounded-full bg-indigo-500/10 blur-[140px]" />

        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {/* Back to Home Link */}
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
              <Scale size={14} className="animate-pulse text-cyan-400" />
              Legal Terms & Policies
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-6 text-4xl font-black tracking-tight sm:text-6xl bg-gradient-to-r from-cyan-400 via-indigo-300 to-fuchsia-400 bg-clip-text text-transparent"
            >
              Terms & Conditions
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

          {/* Intro Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="mb-12 rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/30 via-zinc-950/80 to-indigo-950/20 p-6 sm:p-8 backdrop-blur-xl shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-4 text-cyan-300 font-bold text-base">
              <Gavel className="h-5 w-5 text-cyan-400 shrink-0" />
              <span>Legal Jurisdiction & Jurisdiction Notice</span>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed text-white/80 font-normal">
              By accessing our website or engaging with <strong>Lekhok Tripura Publishers</strong> services, you agree to be legally bound by these Terms & Conditions under the jurisdiction of competent courts located in <strong>Agartala, Tripura, India</strong>.
            </p>
          </motion.div>

          {/* Terms Sections */}
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
            <h3 className="text-xl font-bold text-white mb-2">Need clarification on our Terms & Conditions?</h3>
            <p className="text-xs text-white/60 max-w-md mx-auto mb-6">
              Our support team is here to assist you with publishing agreements, rights, or service terms.
            </p>
            <Link
              to="/help"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-400 px-6 py-3 text-xs font-black text-black hover:opacity-90 transition uppercase tracking-wider shadow-lg shadow-cyan-400/20"
            >
              Contact Publishing Support
            </Link>
          </div>
        </div>
      </div>
      <FooterSection />
    </PageTransition>
  );
}
