import { Star } from "lucide-react";
import SectionHeading from "../components/SectionHeading.jsx";
import { testimonials } from "../data/books.js";

export default function TestimonialsSection() {
  return (
    <section className="section-shell overflow-hidden">
      <SectionHeading eyebrow="Testimonials" title="Readers return for the calm, not the clutter." />
      <div className="marquee flex gap-4">
        {[...testimonials, ...testimonials].map((item, index) => (
          <article className="w-[360px] shrink-0 rounded-lg border border-white/10 bg-white/[0.055] p-6 backdrop-blur-xl" key={`${item.name}-${index}`}>
            <div className="mb-6 flex text-amber-200">
              {Array.from({ length: 5 }).map((_, starIndex) => <Star fill="currentColor" key={starIndex} size={16} />)}
            </div>
            <p className="min-h-28 leading-7 text-white/[0.68]">"{item.quote}"</p>
            <div className="mt-7 flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-full bg-white font-semibold text-black">{item.name.slice(0, 1)}</div>
              <div>
                <h3 className="font-semibold text-white">{item.name}</h3>
                <p className="text-sm text-white/[0.45]">{item.role}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
