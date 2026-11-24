import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Reveal } from "@/components/reveal";

export function MarketingTemplatesCard() {
  return (
    <section className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <Reveal>
          <div className="relative grid items-center gap-10 overflow-hidden rounded-[36px] bg-ink p-8 text-white md:grid-cols-2 md:p-14">
            <div aria-hidden className="pointer-events-none absolute -left-24 -top-24 size-96 rounded-full bg-gold/20 blur-[120px]" />
            <div className="relative">
              <span className="rounded-full border border-gold/50 px-3 py-1 text-[11px] font-semibold tracking-[0.25em] text-gold">
                BRAND NEW
              </span>
              <h3 className="mt-6 font-serif text-5xl leading-[1.02] md:text-6xl">
                JAZA Media <em className="text-gold">Marketing Templates</em>
              </h3>
              <Link
                href="/courses/marketing-templates"
                className="group mt-10 inline-flex items-center gap-2 rounded-full bg-gold px-7 py-4 text-sm font-semibold text-ink transition hover:bg-white"
              >
                Download Now
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            <div className="relative overflow-hidden rounded-2xl ring-1 ring-white/10">
              <Image
                src="/about-the-form/Marketing Templates.png"
                alt="JAZA Media marketing templates preview"
                width={4000}
                height={2250}
                sizes="(min-width: 768px) 50vw, 100vw"
                className="h-auto w-full"
              />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
