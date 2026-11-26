"use client";

import { ArrowRight, Check, ChevronDown, MousePointer2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";


const PERKS = ["Sales Call Script", "AI Prompt Template", "Sent to your inbox in under 30 seconds"];


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
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="home-slide relative overflow-hidden bg-[#FAF8F3] py-16 text-ink md:flex md:min-h-[calc(100svh-114px)] md:flex-col md:justify-center md:py-12">
      <div aria-hidden className="pointer-events-none absolute -right-48 -bottom-48 h-[380px] w-[620px] -rotate-[25deg] rounded-[50%] bg-gradient-to-tl from-[#FFC400] to-[#FFE07A] opacity-90" />
      <div aria-hidden className="pointer-events-none absolute -right-40 -bottom-64 h-[380px] w-[620px] -rotate-[25deg] rounded-[50%] bg-[#FFD84D]/60" />
      <div className="relative mx-auto grid w-full max-w-[1320px] gap-10 px-4 md:px-8 lg:grid-cols-[1.25fr_1fr] lg:items-center lg:gap-12">
        {/* FAQs */}
        <div>
          <p className="flex items-center gap-3 text-[12px] font-bold tracking-[0.3em] text-ink">
            FAQS <span className="h-0.5 w-12 rounded bg-[#FFC400]" />
          </p>
          <h2 className="mt-3 font-serif text-5xl font-bold leading-[1.05] tracking-[-0.03em] md:text-[64px]">
            Questions,{" "}
            <span className="relative inline-block px-2">
              <span aria-hidden className="absolute inset-x-0 top-[12%] bottom-[2%] -skew-x-3 bg-[#FFC400]" />
              <span className="relative">answered.</span>
            </span>
          </h2>
          <div className="mt-8 space-y-3">
            {FAQS.map((item, i) => {
              const isOpen = open === i;
              return (
                <article
                  key={i}
                  className={`rounded-2xl border bg-white transition-all duration-300 ${
                    isOpen
                      ? "border-[#FFC400]/70 shadow-[0_20px_45px_-28px_rgba(0,0,0,0.4)]"
                      : "border-black/10 shadow-[0_8px_24px_-20px_rgba(0,0,0,0.3)] hover:border-black/20"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center gap-4 px-5 py-4 text-left md:px-6"
                  >
                    <span className="grid h-8 w-11 shrink-0 place-items-center rounded-md bg-[#FFC400] text-sm font-bold text-ink">
                      0{i + 1}
                    </span>
                    <span aria-hidden className="h-7 w-px shrink-0 bg-[#FFC400]/70" />
                    <h3 className="flex-1 font-serif text-[17px] font-bold leading-snug md:text-[19px]">{item.q}</h3>
                    <ChevronDown
                      className={`size-5 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  <div
                    className={`grid transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p
                        className={`pr-6 pb-5 pl-5 text-[14.5px] leading-6 text-ink/75 transition-transform duration-500 md:pl-[100px] ${
                          isOpen ? "translate-y-0" : "-translate-y-2"
                        }`}
                      >
                        {item.a}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {/* Free templates promo */}
        <div className="relative rounded-[28px] border-[1.5px] border-[#FFC400]/70 bg-[#FFFCF2] p-6 shadow-[0_30px_70px_-40px_rgba(0,0,0,0.35)] md:p-9">
          <div className="overflow-hidden rounded-2xl shadow-[0_20px_45px_-25px_rgba(0,0,0,0.5)]">
            <Image
              src="/about-the-form/Marketing Templates.png"
              alt="JAZA Media marketing templates preview"
              width={4000}
              height={2250}
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="h-auto w-full"
            />
          </div>
          <p className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-[#F3EEE2] px-4 py-1.5 text-[11px] font-bold tracking-[0.18em] text-ink">
            <span aria-hidden className="size-2 rounded-full bg-[#FFC400]" />
            BRAND NEW · FREE
          </p>
          <h3 className="mt-4 font-serif text-4xl font-bold leading-[1.02] tracking-[-0.03em] md:text-[48px]">
            JAZA Media <span className="block text-[#FFC400]">Marketing Templates</span>
          </h3>
          <ul className="mt-5 space-y-2.5">
            {PERKS.map((p) => (
              <li key={p} className="flex items-center gap-3 text-[15px] text-ink/85">
                <span className="grid size-5 place-items-center rounded-full bg-[#FFC400] text-ink">
                  <Check className="size-3" strokeWidth={3} />
                </span>
                {p}
              </li>
            ))}
          </ul>
          <div className="relative mt-7 w-fit">
          <Link
            href="/courses/marketing-templates"
            className="group anim-cta-press inline-flex w-fit items-center gap-2.5 rounded-md bg-[#FFC400] px-8 py-3.5 text-[15px] font-bold text-ink shadow-[0_10px_30px_-10px_rgba(255,196,0,0.7)] transition hover:bg-[#FFD23F]"
          >
            Get Free Templates
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
          {/* animated cursor tapping the button */}
          <span aria-hidden className="anim-cta-cursor pointer-events-none absolute -right-7 -bottom-6">
            <MousePointer2 className="size-8 -rotate-12 fill-ink text-white drop-shadow-[0_4px_6px_rgba(0,0,0,0.35)]" strokeWidth={1.5} />
          </span>
          </div>
        </div>
      </div>
    </section>
  );
}
