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
    <section className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-4xl px-4">
        <p className="text-center text-xs font-semibold tracking-[0.3em] text-gold-deep">FAQS</p>
        <h2 className="mt-4 text-center font-serif text-5xl text-ink md:text-6xl">
          Questions, <em>answered</em>
        </h2>

        <Accordion className="mt-12">
          {FAQS.map((item, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="!border-b !border-line"
            >
              <AccordionTrigger className="py-6 text-left font-serif text-2xl text-ink hover:no-underline md:text-[28px]">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="pb-6 text-base leading-relaxed text-neutral-600 md:text-lg">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
