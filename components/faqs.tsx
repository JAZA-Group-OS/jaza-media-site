"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
  {
    q: "What is JAZA Media Business Scaling?",
    a: "JAZA Media Business Scaling is a hands-on growth partner for businesses ready to scale through proven systems and real execution. We work directly with companies to strengthen marketing, sales, team structure, and profitability using strategies actively implemented inside JAZA Media and our client portfolio. This is not coaching or motivation — it's practical business scaling guided by operators who build and grow brands daily.",
  },
  {
    q: "How do I book a call?",
    a: "Start by clicking Book a Call and completing our short application form. Our team reviews each submission to ensure alignment before inviting qualified businesses to a Discovery and Strategy Call. We limit partnerships to maintain focus, quality, and measurable results.",
  },
  {
    q: "Who is the right fit for JAZA Media Business Scaling?",
    a: "We work with business owners who are already operating, generating revenue, and ready to scale with structure and strategy. Our best partners value execution, accountability, and long-term growth. Because we work closely with each company, we selectively accept businesses where we know we can create real impact.",
  },
  {
    q: "Who are the main speakers?",
    a: "You'll work directly with JAZA Media's leadership and growth operators — the same team responsible for scaling active brands and client portfolios. Sessions are led by specialists in marketing, sales, operations, and business strategy, ensuring practical insights, clear direction, and actionable outcomes.",
  },
];

export function Faqs() {
  return (
    <section className="relative overflow-hidden bg-ink py-24 text-white md:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 size-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/10 blur-[140px]"
      />
      <div className="relative mx-auto max-w-4xl px-4">
        <div className="flex justify-center">
          <p className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-[10.5px] font-medium tracking-[0.32em] text-white/70 backdrop-blur">
            <span aria-hidden className="size-1.5 rounded-full bg-gold shadow-[0_0_10px_2px_rgba(234,179,8,0.6)]" />
            FAQS
          </p>
        </div>
        <h2 className="mt-7 text-center font-serif text-5xl leading-[1.02] tracking-[-0.03em] md:text-[68px]">
          <span className="bg-gradient-to-b from-white via-white to-white/60 bg-clip-text text-transparent">Questions,</span>{" "}
          <em className="bg-gradient-to-br from-[#fbe7a1] via-gold to-[#a97a1f] bg-clip-text pr-2 text-transparent">answered</em>
        </h2>
        <p className="mx-auto mt-5 max-w-md text-center text-[15px] font-light leading-7 tracking-wide text-white/55 md:text-[17px]">
          Everything you need to know before partnering with us.
        </p>

        <Accordion className="mt-14 space-y-3">
          {FAQS.map((item, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="!rounded-2xl !border !border-white/10 bg-white/[0.03] px-6 backdrop-blur transition-colors hover:!border-gold/30 data-[open]:!border-gold/40 data-[open]:bg-white/[0.05] md:px-8"
            >
              <AccordionTrigger className="items-center gap-5 py-6 text-left font-sans text-[17px] font-medium tracking-[-0.01em] text-white hover:no-underline md:text-xl **:data-[slot=accordion-trigger-icon]:text-gold">
                <span className="flex items-baseline gap-5">
                  <span className="font-serif text-lg italic text-gold/80 md:text-xl">0{i + 1}</span>
                  <span>{item.q}</span>
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-7 pl-0 text-[15px] font-light leading-7 tracking-wide text-white/60 md:pl-11 md:text-base md:leading-8">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
