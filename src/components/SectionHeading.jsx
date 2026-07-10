export default function SectionHeading({ eyebrow, title, copy }) {
  return (
    <div className="mx-auto mb-14 max-w-3xl text-center">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-cyan-200/80">{eyebrow}</p>
      <h2 className="text-4xl font-semibold leading-tight text-white md:text-6xl">{title}</h2>
      {copy && <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/[0.58] md:text-lg">{copy}</p>}
    </div>
  );
}
