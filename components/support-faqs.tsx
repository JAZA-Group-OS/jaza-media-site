"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const SUPPORT_FAQS = [
  {
    q: "How do I access my course after I submitted the claim form?",
    a: "Once your claim is processed, our team sends the access details to the email you used on the form within 2 business days. If you haven't received anything by then, message us using the form below and include the email you signed up with.",
  },
  {
    q: "I haven't heard back about my partner inquiry — how long does review take?",
    a: "Partner inquiries are reviewed within 3–5 business days. If you submitted more than a week ago and still haven't received an update, send us a note here with the email and full name you used so we can locate your inquiry.",
  },
  {
    q: "I applied for a career role. When will I hear back?",
    a: "We review applications on a rolling basis and prioritize roles that are actively hiring. If you submitted within the last 2 weeks, please give us time to review. After 2 weeks, you're welcome to follow up here.",
  },
  {
    q: "There was a problem with my payment / charge / refund.",
    a: "Reach out using the form below and choose Billing / Payment as the topic. Include the email used at checkout and any reference number you received. We'll respond within 2 business days.",
  },
  {
    q: "Can I update the information I submitted on a form?",
    a: "Yes — send us a message with the original email you used and what you'd like changed. We'll update the record on our side and confirm back.",
  },
  {
    q: "How do I report a bug or issue with the site?",
    a: "Use the form below, choose Other as the topic, and describe what you were doing and what went wrong. A screenshot or screen recording link helps a lot.",
  },
];

export function SupportFaqs() {
  return (
    <section className="bg-surface-grey py-16 md:py-20">
      <div className="mx-auto max-w-4xl px-4">
        <h2 className="text-center font-heading text-2xl font-extrabold tracking-tight text-brand-black md:text-3xl">
          Help & FAQs
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center font-heading text-sm text-neutral-600 md:text-base">
          Quick answers to the questions our support team gets the most.
        </p>

        <Accordion className="mt-12">
          {SUPPORT_FAQS.map((item, i) => (
            <AccordionItem
              key={i}
              value={`support-faq-${i}`}
              className="!border-b-2 !border-dotted !border-neutral-500/70"
            >
              <AccordionTrigger className="py-4 text-left font-heading text-lg font-bold text-brand-black hover:no-underline md:text-[22px]">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="font-heading text-base text-neutral-700 md:text-lg">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
