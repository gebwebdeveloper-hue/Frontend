import SectionHeading from "../components/SectionHeading.jsx";
import { useGsapReveal } from "../hooks/useGsapReveal.js";

export default function ReadingDevicesSection() {
  const scope = useGsapReveal({ stagger: 0.08 });

  return (
    <section ref={scope} className="section-shell">
      <SectionHeading eyebrow="Reading devices" title="A focused PDF room on every screen." copy="Laptop, tablet, and phone layouts keep the book prominent and controls predictable." />
      <div className="relative mx-auto grid max-w-6xl items-end gap-6 lg:grid-cols-[1.2fr_0.8fr_0.55fr]">
        <Device className="aspect-[16/10]" label="Laptop" lines={12} />
        <Device className="aspect-[4/5]" label="Tablet" lines={9} />
        <Device className="aspect-[9/16]" label="Phone" lines={7} />
      </div>
    </section>
  );
}

function Device({ label, lines, className }) {
  return (
    <div data-reveal className={`device-frame ${className}`}>
      <div className="mb-4 flex items-center justify-between text-xs uppercase tracking-[0.22em] text-white/[0.45]">
        <span>{label}</span>
        <span>78%</span>
      </div>
      <div className="grid h-[calc(100%-2rem)] grid-cols-[0.7fr_1fr] gap-3 rounded-xl bg-[#f5efe2] p-4 text-black">
        <div className="rounded-lg bg-gradient-to-br from-slate-950 via-blue-700 to-cyan-300" />
        <div className="space-y-2">
          {Array.from({ length: lines }).map((_, index) => <span className="block h-2 rounded bg-black/[0.12]" key={index} />)}
        </div>
      </div>
    </div>
  );
}
