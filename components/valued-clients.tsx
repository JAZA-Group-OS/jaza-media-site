"use client";

import { useEffect, useState } from "react";
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

// Mostly-transparent wordmarks (dark text) — rendered white on the dark strip.
// Badge logos keep their own colors since they carry their own backdrop.
const WORDMARK_NUMS = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26];
const WORDMARKS = new Set([
  ...WORDMARK_NUMS.map((n) => `${LOGO_DIR}/${n}.png`),
  `${LOGO_DIR}/Client%20Logo%20(30).png`,
]);

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

function ClientLogo({ name, src, boost, dark }: Client & { dark?: boolean }) {
  return (
    <div className={`relative shrink-0 ${dark ? "group/logo h-24 w-44 md:h-28 md:w-56" : "h-24 w-40 md:h-32 md:w-56"}`}>
      <Image
        src={src}
        alt={`${name} logo`}
        fill
        sizes="(min-width: 768px) 224px, 160px"
        className={`object-contain ${boost ? "scale-[2.1]" : "scale-[1.1]"} ${dark ? (WORDMARKS.has(src) ? "grayscale invert brightness-125 opacity-85 transition duration-500 group-hover/logo:opacity-100" : "opacity-90 transition duration-500 group-hover/logo:opacity-100") : ""}`}
      />
    </div>
  );
}

export function ValuedClients({ variant = "light" }: { variant?: "light" | "dark" }) {
  const dark = variant === "dark";
  // Respect prefers-reduced-motion: the auto-scroll is a JS-driven transform,
  // so the global CSS reduced-motion overrides don't cover it. Lazy-init reads
  // the media query on the client without a synchronous setState in an effect;
  // the listener below keeps it live if the OS setting changes.
  const [reducedMotion, setReducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const [emblaRef] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      dragFree: true,
      containScroll: false,
    },
    reducedMotion
      ? []
      : [
          AutoScroll({
            playOnInit: true,
            speed: dark ? 0.5 : 2.2,
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

  if (dark) {
    return (
      <section className="relative -mt-px bg-ink pt-6 pb-14 md:pt-8 md:pb-20" aria-label="Our clients">
        <div className="mx-auto flex max-w-3xl items-center justify-center gap-5 px-4">
          <span aria-hidden className="h-px flex-1 bg-gradient-to-r from-transparent to-gold/50" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-gold">
            Trusted by {CLIENTS.length}+ brands
          </p>
          <span aria-hidden className="h-px flex-1 bg-gradient-to-l from-transparent to-gold/50" />
        </div>
        <div className="group mt-10 overflow-hidden py-2 [mask-image:linear-gradient(to_right,transparent,black_30%,black_70%,transparent)]">
          {/* Pure-CSS marquee: two identical halves, translate -50% on a loop.
              GPU-composited, so it stays smooth at slow speeds where the JS
              auto-scroll stuttered. */}
          <div className="flex w-max animate-[clients-marquee_140s_linear_infinite] will-change-transform group-hover:[animation-play-state:paused] motion-reduce:animate-none">
            {SLIDES.map((client, index) => (
              <div key={`${client.name}-${index}`} className="shrink-0 px-3 md:px-4" aria-hidden={index >= CLIENTS.length}>
                <ClientLogo {...client} dark />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

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
        className={`mt-8 bg-neutral-200/70 py-2 ${
          stripIn ? "animate-about-fade-in" : "opacity-0"
        }`}
      >
        <div className="overflow-x-clip" ref={emblaRef}>
          <div className="flex items-center">
            {SLIDES.map((client, index) => (
              <div
                key={`${client.name}-${index}`}
                className="shrink-0 pl-0.5 md:pl-1"
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
