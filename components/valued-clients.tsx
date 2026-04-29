"use client";

import AutoScroll from "embla-carousel-auto-scroll";
import useEmblaCarousel from "embla-carousel-react";

import { useInView } from "@/lib/use-in-view";

type Client = {
  name: string;
  src?: string;
};

const CLIENTS: Client[] = [
  { name: "Client 1" },
  { name: "Client 2" },
  { name: "Client 3" },
  { name: "Client 4" },
  { name: "Client 5" },
  { name: "Client 6" },
];

// Duplicate the list so the marquee always has enough slides to span the
// viewport at any breakpoint — Embla's auto-scroll requires total slide width
// to exceed viewport width for a seamless loop.
const SLIDES: Client[] = [...CLIENTS, ...CLIENTS, ...CLIENTS];

function ClientLogoPlaceholder({ name }: { name: string }) {
  return (
    <div
      role="img"
      aria-label={`${name} logo`}
      className="size-20 shrink-0 rounded-full bg-neutral-100 shadow-sm ring-1 ring-neutral-200 md:size-24"
    />
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
          className={`text-center font-heading text-3xl font-black uppercase tracking-tight text-brand-black md:text-4xl lg:text-5xl ${
            headingIn ? "animate-about-fade-up" : "opacity-0"
          }`}
        >
          OUR VALUED CLIENTS
        </h2>
      </div>

      <div
        ref={stripRef}
        className={`mt-8 bg-neutral-200/70 py-6 md:py-8 ${
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
                <ClientLogoPlaceholder name={client.name} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
