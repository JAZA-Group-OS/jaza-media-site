"use client";

import { useInView } from "@/lib/use-in-view";

type HireCard = {
  title: string;
  body: string;
};

const CARDS: HireCard[] = [
  {
    title: "Your goals and experience",
    body: "what you've done and what you're looking for.",
  },
  {
    title: "Technical depth",
    body: "how you solve problems and drive real results.",
  },
  {
    title: "Culture and values",
    body: "how you collaborate, make decisions, and align with our principles",
  },
];

function Card({ card, delay }: { card: HireCard; delay: number }) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      style={{ animationDelay: inView ? `${delay}ms` : undefined }}
      className={`flex flex-col items-center rounded-2xl border border-gold/30 bg-[linear-gradient(180deg,#1a1a17_0%,#101011_75%)] px-6 py-8 text-center shadow-[0_30px_60px_-30px_rgba(0,0,0,0.9)] md:px-7 md:py-10 ${
        inView ? "animate-about-fade-up" : "opacity-0"
      }`}
    >
      <h3 className="font-serif text-[24px] text-white md:text-xl">
        {card.title}
      </h3>
      <p className="mt-5 text-base font-light leading-relaxed text-white/65 md:text-lg">
        {card.body}
      </p>
    </div>
  );
}

export function CareersHire() {
  const { ref: headRef, inView: headIn } = useInView<HTMLDivElement>();
  const { ref: introRef, inView: introIn } = useInView<HTMLDivElement>();
  const { ref: outroRef, inView: outroIn } = useInView<HTMLParagraphElement>();

  return (
    <section className="relative bg-ink py-16 text-white md:py-24">
      <div className="mx-auto max-w-5xl px-4">
        <h2
          ref={headRef}
          className={`text-center font-serif text-[30px] font-normal leading-[1.08] tracking-[-0.025em] text-white md:text-[42px] lg:text-[54px] xl:text-[64px] ${
            headIn ? "animate-about-fade-up" : "opacity-0"
          }`}
        >
          How we <em className="bg-gradient-to-br from-[#fbe7a1] via-gold to-[#a97a1f] bg-clip-text pr-1 text-transparent italic">hire</em>
        </h2>

        <div
          ref={introRef}
          style={{ animationDelay: introIn ? "100ms" : undefined }}
          className={`mx-auto mt-8 max-w-3xl text-center text-base font-light leading-relaxed text-white/65 md:text-lg ${
            introIn ? "animate-about-fade-up" : "opacity-0"
          }`}
        >
          <p>
            We believe great companies are built by disciplined people who trust
            and win together. Our hiring process reflects those values —
            structured, straightforward, and designed to give you a clear sense
            of what it&apos;s like to work here.
          </p>
          <p className="mt-6">
            When you&apos;re in the process, you can expect conversations
            dedicated to:
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3 md:gap-8">
          {CARDS.map((card, i) => (
            <Card key={card.title} card={card} delay={i * 100} />
          ))}
        </div>

        <p
          ref={outroRef}
          className={`mx-auto mt-10 max-w-3xl text-center text-base font-light leading-relaxed text-white/65 md:text-lg ${
            outroIn ? "animate-about-fade-up" : "opacity-0"
          }`}
        >
          While every role is a little different, you can always count on
          transparency, respect for your time, and clear communication at every
          step.
        </p>
      </div>
    </section>
  );
}
