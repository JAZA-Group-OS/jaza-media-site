import { ArrowRight } from "lucide-react";

import { SOCIAL_LINKS } from "@/components/social-icons";
import { Eyebrow, Gold, SLIDE } from "@/components/support-ui";

const SUPPORT_EMAIL = "admin@jazamedia.com";
const CARD = "rounded-[20px] border border-gold/25 bg-[linear-gradient(180deg,#1a1a17_0%,#101011_75%)] p-6";
const LABEL = "text-[10.5px] font-medium tracking-[0.3em] text-gold/85 uppercase";

export function SupportHero() {
  return (
    <section id="top" className={`${SLIDE} bg-[#0b0d0c]`}>
      <div aria-hidden className="pointer-events-none absolute -top-56 left-1/2 size-[900px] -translate-x-1/2 rounded-full bg-gold/10 blur-[160px]" />
      <div className="relative mx-auto flex w-full max-w-[1100px] flex-col items-center gap-10 px-4 text-center md:gap-14 md:px-8">
        <div className="flex flex-col items-center gap-5 md:gap-6">
          <Eyebrow>Support centre</Eyebrow>
          <h1 className="font-serif text-[52px] leading-[1] tracking-[-0.03em] md:text-[72px] lg:text-[84px]">
            How can we <Gold>help?</Gold>
          </h1>
          <p className="max-w-[560px] text-[16px] leading-[1.7] font-light text-white/65 md:text-lg">
            Browse common answers below, or send us a message and our team will get back to you within 2 business days.
          </p>
          <div className="flex flex-wrap justify-center gap-3.5">
            <a
              href="#contact"
              className="careers-shine group inline-flex items-center gap-2.5 rounded-full bg-gold px-7 py-3.5 text-[12px] font-semibold tracking-[0.14em] text-ink uppercase transition hover:bg-white"
            >
              Send a message
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href="#faqs"
              className="inline-flex items-center rounded-full border border-gold/50 px-7 py-3.5 text-[12px] font-medium tracking-[0.14em] text-white uppercase transition hover:bg-gold/10"
            >
              Browse FAQs
            </a>
          </div>
        </div>

        <div className="grid w-full gap-4 text-left sm:grid-cols-3 md:gap-5">
          <div className={CARD}>
            <p className={LABEL}>Email us</p>
            <a href={`mailto:${SUPPORT_EMAIL}`} className="mt-3 block font-serif text-[24px] break-all text-white hover:text-gold md:text-[26px]">
              {SUPPORT_EMAIL}
            </a>
            <p className="mt-1.5 hidden text-sm text-white/60 md:block">Best for account &amp; billing questions.</p>
          </div>
          <div className={CARD}>
            <p className={LABEL}>Response time</p>
            <p className="mt-3 font-serif text-[24px] md:text-[26px]">Within 2 business days</p>
            <p className="mt-1.5 hidden text-sm text-white/60 md:block">Partner inquiries: 3–5 business days.</p>
          </div>
          <div className={`${CARD} hidden sm:block`}>
            <p className={LABEL}>Follow along</p>
            <ul className="mt-3.5 flex flex-wrap gap-2.5">
              {SOCIAL_LINKS.map(({ label, href, Icon }) => (
                <li key={label}>
                  {href ? (
                    <a
                      href={href}
                      aria-label={label}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="grid size-11 place-items-center rounded-full border border-white/15 text-white/75 transition hover:border-gold/60 hover:text-gold focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
                    >
                      <Icon className="size-[18px]" />
                    </a>
                  ) : (
                    <span
                      title={`${label} — coming soon`}
                      aria-label={`${label} (coming soon)`}
                      className="grid size-11 place-items-center rounded-full border border-white/15 text-white/75 transition hover:border-gold/60 hover:text-gold"
                    >
                      <Icon className="size-[18px]" />
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
