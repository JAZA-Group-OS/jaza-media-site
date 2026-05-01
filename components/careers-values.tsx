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
  { kind: "image", key: "img-1" },
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
      className="relative aspect-[572/377] w-full overflow-hidden rounded-md border-4 border-white bg-white/90 shadow-inner"
    >
      <div className="absolute inset-3 animate-about-shimmer rounded-sm opacity-60" />
    </div>
  );
}

function CellImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative aspect-[572/377] w-full overflow-hidden rounded-md">
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
    <div className="flex h-full flex-col justify-center rounded-md bg-white p-5 shadow-sm md:p-6">
      <h3 className="font-heading text-xl font-bold text-brand-black md:text-2xl">
        {value.title}
      </h3>
      <div className="mt-3 space-y-3 font-heading text-base leading-relaxed text-brand-black/90 md:text-lg">
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

export function CareersValues() {
  const { ref: headRef, inView: headIn } = useInView<HTMLDivElement>();
  const { ref: ctaRef, inView: ctaIn } = useInView<HTMLDivElement>();

  return (
    <section className="bg-neutral-100 py-12 md:py-16">
      <div className="mx-auto max-w-5xl px-4">
        <div
          ref={headRef}
          className={`mx-auto max-w-4xl text-center ${
            headIn ? "animate-about-fade-up" : "opacity-0"
          }`}
        >
          <h2 className="font-heading text-3xl font-bold leading-[1.15] text-brand-black md:text-4xl lg:text-[48px]">
            We want disciplined team players who trust and{" "}
            <span className="underline decoration-[3px] underline-offset-[6px] md:decoration-4 md:underline-offset-8">
              win together.
            </span>
          </h2>
          <p className="mt-6 font-heading text-lg leading-[1.5] text-brand-black/90 md:text-xl lg:text-2xl">
            At JAZA Media you&apos;ll help entrepreneurs build real businesses
            with strong foundations, scalable systems, and lasting impact. Our
            mission is straightforward: make real world business scaling
            program accessible to everyone. We set a high bar, move with
            urgency, and measure ourselves by results. If you want to create —
            and work with a team that plays to win — you&apos;ll fit right in.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 md:gap-6">
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
            href="#openings"
            className="inline-block rounded-full bg-brand-yellow px-6 py-3 font-heading text-base font-bold text-brand-black shadow-sm transition-colors hover:bg-yellow-400 md:text-lg"
          >
            View Job Openings
          </a>
        </div>
      </div>
    </section>
  );
}
