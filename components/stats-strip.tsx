import { Reveal } from "@/components/reveal";

const STATS = [
  { value: "₱150M+", label: "Annual portfolio revenue" },
  { value: "66,000+", label: "Business-owner community" },
  { value: "1,000+", label: "Bestselling ebooks sold" },
  { value: "3 years", label: "To build it all" },
];

export function StatsStrip() {
  return (
    <section className="border-y border-line bg-ivory">
      <div className="mx-auto grid max-w-7xl grid-cols-2 px-4 md:grid-cols-4 md:px-6">
        {STATS.map((s, i) => (
          <Reveal
            key={s.label}
            delay={i * 0.06}
            className={`py-10 md:py-14 ${i % 2 === 1 ? "pl-6" : ""} ${i > 0 ? "md:border-l md:border-line md:pl-8" : ""} ${i % 2 === 1 ? "border-l border-line" : ""}`}
          >
            <div className="font-serif text-4xl text-ink md:text-6xl">{s.value}</div>
            <div className="mt-2 text-sm text-neutral-600">{s.label}</div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
