"use client";

import Image from "next/image";
import AutoScroll from "embla-carousel-auto-scroll";
import useEmblaCarousel from "embla-carousel-react";

import { useInView } from "@/lib/use-in-view";

type Client = {
  name: string;
  src: string;
};

const LOGO_DIR = "/images/client-logo/Clients%20Logo";

const CLIENTS: Client[] = [
  ...Array.from({ length: 27 }, (_, i) => ({
    name: `Client ${i + 1}`,
    src: `${LOGO_DIR}/${i + 1}.png`,
  })),
  { name: "Client 28", src: `${LOGO_DIR}/Client%20Logo%20(30).png` },
];

// Duplicate the list so the marquee always has enough slides to span the
// viewport at any breakpoint — Embla's auto-scroll requires total slide width
// to exceed viewport width for a seamless loop.
const SLIDES: Client[] = [...CLIENTS, ...CLIENTS];

function ClientLogo({ name, src }: Client) {
  return (
    <div className="relative h-16 w-32 shrink-0 md:h-20 md:w-40">
      <Image
        src={src}
        alt={`${name} logo`}
        fill
        sizes="(min-width: 768px) 160px, 128px"
        className="object-contain"
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
                <ClientLogo name={client.name} src={client.src} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
