"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
  {
    q: "What is the JAZA Media Business Scalling?",
    a: "Answer coming soon.",
  },
  {
    q: "How to book a call?",
    a: "Answer coming soon.",
  },
  {
    q: "Who is the right fit for the business scallig?",
    a: "Answer coming soon.",
  },
  {
    q: "Do you have free trial?",
    a: "Answer coming soon.",
  },
];

export function Faqs() {
  return (
    <section className="bg-surface-grey py-16 md:py-20">
      <div className="mx-auto max-w-3xl px-4">
        <h2 className="text-center font-heading text-3xl font-black tracking-tight text-brand-black md:text-5xl">
          FAQs
        </h2>

        <Accordion className="mt-10">
          {FAQS.map((item, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="!border-b-2 !border-dotted !border-neutral-500/70 py-1"
            >
              <AccordionTrigger className="py-4 text-left font-heading text-base font-bold text-brand-black hover:no-underline md:text-lg">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-neutral-700 md:text-base">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
