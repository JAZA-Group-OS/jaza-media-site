"use client";

import Image from "next/image";

import { useInView } from "@/lib/use-in-view";

type ValueCard = {
  title: string;
  paragraphs: string[];
};

const VALUES: ValueCard[] = [
  {
    title: "You build with the long game in mind.",
    paragraphs: [
      "You're not here for shortcuts. You care about creating businesses that compound over years, not months.",
      "That means focusing on fundamentals, building systems that scale, and making decisions that stand the test of time.",
    ],
  },
  {
    title: "You hold a high standard.",
    paragraphs: [
      "Excellence isn't optional.",
      "You take ownership, sweat the details, and deliver work you're proud of.",
      "More than that, you raise the bar for the people around you, because you know high standards pull the whole team forward.",
    ],
  },
  {
    title: "You thrive in disciplined execution.",
    paragraphs: [
      "Big ideas matter, but execution wins. You bring focus, structure, and accountability to your work.",
      "You know consistency beats intensity, and disciplined execution is how great businesses are built.",
    ],
  },
  {
    title: "You win together.",
    paragraphs: [
      "You're competitive, but not at the expense of the team. You share credit, support others, and play to win as one.",
      "Because when the team succeeds, everyone does.",
    ],
  },
];

// Document order maps directly onto the 4×2 grid:
//   row 1: image, value[0]
//   row 2: value[1], image
//   row 3: image, value[2]
//   row 4: value[3], image
type Cell =
  | { kind: "image"; key: string; src?: string; alt?: string }
  | { kind: "text"; value: ValueCard };

const CELLS: Cell[] = [
  {
    kind: "image",
    key: "img-1",
    src: "/images/maju.png",
    alt: "JAZA Media team at work",
  },
  { kind: "text", value: VALUES[0] },
  { kind: "text", value: VALUES[1] },
  {
    kind: "image",
    key: "img-2",
    src: "/images/careers%203.png",
    alt: "JAZA Media teammates collaborating",
  },
  {
    kind: "image",
    key: "img-3",
    src: "/images/careers%204.png",
    alt: "JAZA Media teammates with certificates",
  },
  { kind: "text", value: VALUES[2] },
  { kind: "text", value: VALUES[3] },
  {
    kind: "image",
    key: "img-4",
    src: "/images/careers%202.png",
    alt: "JAZA Media team on set at VIRSPACE",
  },
];

function CellImagePlaceholder() {
  return (
    <div
      aria-hidden
      className="relative aspect-[572/377] w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-inner"
    >
      <div className="absolute inset-3 animate-about-shimmer rounded-sm opacity-60" />
    </div>
  );
}

function CellImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative aspect-[572/377] w-full overflow-hidden rounded-2xl ring-1 ring-gold/25">
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes="(min-width: 768px) 50vw, 100vw"
      />
    </div>
  );
}

function ValueTextCard({ value }: { value: ValueCard }) {
  return (
    <div className="flex h-full flex-col justify-center rounded-2xl border border-gold/25 bg-[linear-gradient(180deg,#1a1a17_0%,#101011_75%)] p-5 md:p-6 lg:p-8">
      <h3 className="font-serif text-[26px] leading-tight text-white md:text-[30px]">
        {value.title}
      </h3>
      <div className="mt-3 space-y-3 text-base font-light leading-relaxed text-white/65 md:text-lg">
        {value.paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </div>
  );
}

function GridCell({ cell, index }: { cell: Cell; index: number }) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      style={{ animationDelay: inView ? `${index * 60}ms` : undefined }}
      className={inView ? "animate-about-fade-up" : "opacity-0"}
    >
      {cell.kind === "image" ? (
        cell.src ? (
          <CellImage src={cell.src} alt={cell.alt ?? ""} />
        ) : (
          <CellImagePlaceholder />
        )
      ) : (
        <ValueTextCard value={cell.value} />
      )}
    </div>
  );
}

// On mobile we render each value as image-then-text so the flow stays
// consistent. The desktop 4×2 zigzag grid above keeps its current layout.
const MOBILE_PAIRS: { src?: string; alt?: string; value: ValueCard }[] = [
  {
    src: "/images/maju.png",
    alt: "JAZA Media team at work",
    value: VALUES[0],
  },
  {
    src: "/images/careers%203.png",
    alt: "JAZA Media teammates collaborating",
    value: VALUES[1],
  },
  {
    src: "/images/careers%204.png",
    alt: "JAZA Media teammates with certificates",
    value: VALUES[2],
  },
  {
    src: "/images/careers%202.png",
    alt: "JAZA Media team on set at VIRSPACE",
    value: VALUES[3],
  },
];

function MobilePair({
  pair,
  index,
}: {
  pair: (typeof MOBILE_PAIRS)[number];
  index: number;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      style={{ animationDelay: inView ? `${index * 80}ms` : undefined }}
      className={`flex flex-col gap-4 ${
        inView ? "animate-about-fade-up" : "opacity-0"
      }`}
    >
      {pair.src ? (
        <CellImage src={pair.src} alt={pair.alt ?? ""} />
      ) : (
        <CellImagePlaceholder />
      )}
      <ValueTextCard value={pair.value} />
    </div>
  );
}

export function CareersValues() {
  const { ref: headRef, inView: headIn } = useInView<HTMLDivElement>();
  const { ref: ctaRef, inView: ctaIn } = useInView<HTMLDivElement>();

  return (
    <section className="relative bg-ink py-16 text-white md:py-24">
      <div className="mx-auto max-w-5xl px-4 lg:max-w-[1200px]">
        <div
          ref={headRef}
          className={`mx-auto max-w-4xl text-center ${
            headIn ? "animate-about-fade-up" : "opacity-0"
          }`}
        >
<p className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-[10.5px] font-medium tracking-[0.32em] text-white/70 backdrop-blur">
            <span aria-hidden className="size-1.5 rounded-full bg-gold shadow-[0_0_10px_2px_rgba(234,179,8,0.6)]" />
            WHO WE HIRE
          </p>
          <h2 className="font-serif text-[36px] leading-[1.08] tracking-[-0.025em] text-white md:text-[44px] lg:text-[54px]">
            We want disciplined team players who trust and{" "}
            <em className="bg-gradient-to-br from-[#fbe7a1] via-gold to-[#a97a1f] bg-clip-text pr-1 text-transparent italic">
              win together.
            </em>
          </h2>
          <p className="mt-6 text-base leading-8 font-light text-white/60 md:text-lg">
            At JAZA Media you&apos;ll help entrepreneurs build real businesses
            with strong foundations, scalable systems, and lasting impact. Our
            mission is straightforward: make real world business scaling
            program accessible to everyone. We set a high bar, move with
            urgency, and measure ourselves by results. If you want to create —
            and work with a team that plays to win — you&apos;ll fit right in.
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-6 md:hidden">
          {MOBILE_PAIRS.map((pair, i) => (
            <MobilePair key={pair.value.title} pair={pair} index={i} />
          ))}
        </div>

        <div className="mt-10 hidden gap-4 md:grid md:grid-cols-2 md:gap-6">
          {CELLS.map((cell, i) => (
            <GridCell
              key={cell.kind === "image" ? cell.key : cell.value.title}
              cell={cell}
              index={i}
            />
          ))}
        </div>

        <div
          ref={ctaRef}
          className={`mt-10 text-center ${
            ctaIn ? "animate-about-fade-up" : "opacity-0"
          }`}
        >
          <a
            href="/careers/apply"
            className="inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3 text-[12px] font-semibold tracking-[0.14em] text-ink uppercase transition hover:bg-white"
          >
            View Job Openings
          </a>
        </div>
      </div>
    </section>
  );
}
