import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import SectionHeading from "../components/SectionHeading.jsx";
import { faqItems } from "../data/books.js";

export default function FaqSection() {
  const [active, setActive] = useState(0);

  return (
    <section className="section-shell">
      <SectionHeading eyebrow="FAQ" title="Built around purchase-to-read clarity." />
      <div className="mx-auto max-w-3xl divide-y divide-white/10 rounded-lg border border-white/10 bg-white/[0.045]">
        {faqItems.map((item, index) => (
          <div className="p-5" key={item.question}>
            <button className="flex w-full items-center justify-between gap-4 text-left text-xl font-semibold text-white" onClick={() => setActive(active === index ? -1 : index)}>
              {item.question}
              <ChevronDown className={`shrink-0 transition ${active === index ? "rotate-180" : ""}`} size={20} />
            </button>
            <AnimatePresence initial={false}>
              {active === index && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <p className="pt-4 leading-7 text-white/[0.58]">{item.answer}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
}
