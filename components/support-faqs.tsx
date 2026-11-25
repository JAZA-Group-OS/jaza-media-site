"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Eyebrow, Gold, H2, SLIDE } from "@/components/support-ui";

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
  const [open, setOpen] = useState(0);
  return (
    <section id="faqs" className={`${SLIDE} border-t border-white/5 bg-[#0e0e0f]`}>
      <div className="mx-auto grid w-full max-w-[1160px] items-center gap-8 px-4 md:px-8 lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-16">
        <div className="flex flex-col items-start gap-4 lg:gap-5">
          <Eyebrow>Help &amp; FAQs</Eyebrow>
          <h2 className={H2}>
            Quick answers, <Gold>fast.</Gold>
          </h2>
          <p className="text-[16px] leading-[1.7] font-light text-white/60 md:text-[17px]">
            The questions our support team gets the most.
          </p>
          <a href="#contact" className="mt-1 hidden text-[12px] tracking-[0.14em] text-gold uppercase hover:text-white lg:inline">
            Still stuck? Message us →
          </a>
        </div>

        <ul className="flex flex-col">
          {SUPPORT_FAQS.map((item, i) => {
            const isOpen = open === i;
            return (
              <li
                key={item.q}
                className={`rounded-[20px] border transition-colors duration-300 ${
                  isOpen
                    ? "my-1 border-gold/30 bg-[linear-gradient(180deg,#1a1a17_0%,#101011_75%)]"
                    : "border-transparent border-b-white/[0.08]"
                }`}
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${i}`}
                  id={`faq-trigger-${i}`}
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="flex w-full items-center gap-4 px-4 py-3.5 text-left focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none md:gap-5 md:px-6 md:py-4"
                >
                  <span className={`font-serif text-[22px] italic md:text-[26px] ${isOpen ? "text-gold" : "text-gold/55"}`}>
                    0{i + 1}
                  </span>
                  <span className={`flex-1 font-serif text-[18px] leading-tight md:text-[22px] ${isOpen ? "text-white" : "text-white/85"}`}>
                    {item.q}
                  </span>
                  <Plus
                    aria-hidden
                    className={`size-5 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-45 text-gold" : "text-white/50"}`}
                  />
                </button>
                <div
                  id={`faq-panel-${i}`}
                  role="region"
                  aria-labelledby={`faq-trigger-${i}`}
                  className={`grid transition-[grid-template-rows] duration-300 ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                >
                  <p className="overflow-hidden px-4 pl-[52px] text-[15px] leading-[1.7] font-light text-white/65 md:pr-6 md:pl-[70px]">
                    <span className="block pb-5">{item.a}</span>
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
