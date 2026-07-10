import PageTransition from "../components/PageTransition.jsx";
import FooterSection from "../sections/FooterSection.jsx";

export default function ReaderPage() {
  return (
    <PageTransition>
      <section className="min-h-screen px-5 pb-24 pt-32">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="rounded-lg border border-white/10 bg-white/[0.055] p-5 text-white backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/80">Reading</p>
            <h1 className="mt-4 text-3xl font-semibold">Systems of Thought</h1>
            <div className="mt-8 h-2 rounded-full bg-white/10"><div className="h-full w-[68%] rounded-full bg-white" /></div>
            <p className="mt-3 text-sm text-white/[0.48]">68% complete</p>
            <div className="mt-8 space-y-3 text-sm text-white/[0.62]">
              <button className="w-full rounded-full bg-white px-4 py-3 font-semibold text-black">Resume page 214</button>
              <button className="w-full rounded-full border border-white/10 px-4 py-3">Bookmarks</button>
              <button className="w-full rounded-full border border-white/10 px-4 py-3">Reader settings</button>
            </div>
          </aside>
          <article className="rounded-lg border border-white/10 bg-white/[0.055] p-4 shadow-glow backdrop-blur-xl">
            <div className="rounded-md bg-[#f4eddf] p-8 text-black md:p-12">
              <div className="mx-auto max-w-3xl">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-black/[0.45]">Chapter 08</p>
                <h2 className="mt-5 text-4xl font-black leading-tight">Designing systems that help readers stay immersed</h2>
                <div className="mt-8 space-y-4 text-lg leading-9 text-black/[0.72]">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <p key={index}>The best ebook interfaces reduce friction after purchase. They keep the page legible, the controls quiet, and the reader's progress always close at hand.</p>
                  ))}
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>
      <FooterSection />
    </PageTransition>
  );
}
