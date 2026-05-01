"use client";

import Image from "next/image";
import AutoScroll from "embla-carousel-auto-scroll";
import useEmblaCarousel from "embla-carousel-react";

import { useInView } from "@/lib/use-in-view";

type Client = {
  name: string;
  src: string;
  boost?: boolean;
};

const LOGO_DIR = "/images/client-logo/Clients%20Logo";

// Wordmark-style logos (Chinkee Tan, Alveo, MKCL, One Click Away, DermaBALM,
// MARA, neat & social, Infinite Incense, Beef Tallow, Virspacio) are square
// PNGs with heavy internal whitespace, so they need an extra visual scale to
// render at a legible size alongside the others. Logos with a substantial
// graphic component (e.g. Dragon Shield) are excluded — the scale makes their
// graphic overflow the strip vertically.
const BOOSTED_LOGOS = new Set([2, 4, 12, 14, 16, 18, 22, 24, 26]);

const CLIENTS: Client[] = [
  ...Array.from({ length: 27 }, (_, i) => {
    const num = i + 1;
    return {
      name: `Client ${num}`,
      src: `${LOGO_DIR}/${num}.png`,
      boost: BOOSTED_LOGOS.has(num),
    };
  }),
  {
    name: "Client 28",
    src: `${LOGO_DIR}/Client%20Logo%20(30).png`,
    boost: true,
  },
];

// Duplicate the list so the marquee always has enough slides to span the
// viewport at any breakpoint — Embla's auto-scroll requires total slide width
// to exceed viewport width for a seamless loop.
const SLIDES: Client[] = [...CLIENTS, ...CLIENTS];

function ClientLogo({ name, src, boost }: Client) {
  return (
    <div className="relative h-20 w-40 shrink-0 md:h-24 md:w-48">
      <Image
        src={src}
        alt={`${name} logo`}
        fill
        sizes="(min-width: 768px) 192px, 160px"
        className={`object-contain ${boost ? "scale-[2.1]" : ""}`}
      />
    </div>
  );
}

export function ValuedClients() {
  const [emblaRef] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      dragFree: true,
      containScroll: false,
    },
    [
      AutoScroll({
        playOnInit: true,
        speed: 1,
        startDelay: 0,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
        stopOnFocusIn: true,
      }),
    ],
  );

  const { ref: headingRef, inView: headingIn } =
    useInView<HTMLHeadingElement>();
  const { ref: stripRef, inView: stripIn } = useInView<HTMLDivElement>();

  return (
    <section className="bg-white pb-10">
      <div className="mx-auto max-w-6xl px-4">
        <h2
          ref={headingRef}
          className={`text-center font-heading text-3xl font-black uppercase tracking-tight text-brand-black md:text-4xl ${
            headingIn ? "animate-about-fade-up" : "opacity-0"
          }`}
        >
          OUR VALUED CLIENTS
        </h2>
      </div>

      <div
        ref={stripRef}
        className={`mt-8 bg-neutral-200/70 py-4 md:py-6 ${
          stripIn ? "animate-about-fade-in" : "opacity-0"
        }`}
      >
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex items-center">
            {SLIDES.map((client, index) => (
              <div
                key={`${client.name}-${index}`}
                className="shrink-0 pl-6 md:pl-10"
              >
                <ClientLogo {...client} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
