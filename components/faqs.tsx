import { ArrowRight, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";


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
  return (
    <section className="relative overflow-hidden bg-ink py-20 text-white md:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 size-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/10 blur-[140px]"
      />
      <div className="relative mx-auto grid max-w-[1560px] gap-10 px-4 md:px-8 lg:grid-cols-[1.3fr_1fr] lg:gap-14 xl:px-12">
        {/* FAQs */}
        <div>
          <p className="inline-flex w-fit items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-[10.5px] font-medium tracking-[0.32em] text-white/70 backdrop-blur">
            <span aria-hidden className="size-1.5 rounded-full bg-gold shadow-[0_0_10px_2px_rgba(234,179,8,0.6)]" />
            FAQS
          </p>
          <h2 className="mt-6 font-serif text-5xl leading-[1.02] tracking-[-0.03em] md:text-[60px]">
            <span className="bg-gradient-to-b from-white via-white to-white/60 bg-clip-text text-transparent">Questions,</span>{" "}
            <em className="bg-gradient-to-br from-[#fbe7a1] via-gold to-[#a97a1f] bg-clip-text pr-2 text-transparent">answered</em>
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {FAQS.map((item, i) => (
              <article
                key={i}
                className="flex flex-col rounded-3xl border border-white/10 bg-white/[0.03] p-7 transition duration-300 hover:-translate-y-0.5 hover:border-gold/40 hover:bg-white/[0.05]"
              >
                <div className="flex items-center justify-between">
                  <span className="font-serif text-2xl italic text-gold">0{i + 1}</span>
                  <span aria-hidden className="h-px w-12 bg-gradient-to-r from-gold/60 to-transparent" />
                </div>
                <h3 className="mt-4 font-sans text-[17px] font-semibold leading-snug tracking-[-0.01em] text-white">{item.q}</h3>
                <p className="mt-3 text-[14px] font-light leading-6 tracking-wide text-white/55">{item.a}</p>
              </article>
            ))}
          </div>
        </div>

        {/* Free templates promo */}
        <div className="flex rounded-[32px] lg:mt-[118px] bg-gradient-to-br from-gold/50 via-white/10 to-white/[0.04] p-px shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)]">
          <div className="relative flex w-full flex-col justify-center overflow-hidden rounded-[31px] bg-[radial-gradient(120%_120%_at_0%_0%,#2a2210_0%,#121212_45%,#0c0c0d_100%)] p-7 md:p-10 xl:p-12">
            <div aria-hidden className="pointer-events-none absolute -top-32 -left-32 size-[380px] rounded-full bg-gold/20 blur-[120px]" />
            <div className="relative overflow-hidden rounded-2xl ring-1 ring-white/15 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.95)]">
              <Image
                src="/about-the-form/Marketing Templates.png"
                alt="JAZA Media marketing templates preview"
                width={4000}
                height={2250}
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="h-auto w-full"
              />
            </div>
            <p className="relative mt-7 inline-flex w-fit items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-[10.5px] font-medium tracking-[0.32em] text-white/70">
              <span aria-hidden className="size-1.5 rounded-full bg-gold shadow-[0_0_10px_2px_rgba(234,179,8,0.6)]" />
              BRAND NEW · FREE
            </p>
            <h3 className="relative mt-6 font-serif text-4xl leading-[1.04] tracking-[-0.03em] md:text-[52px]">
              <span className="bg-gradient-to-b from-white via-white to-white/60 bg-clip-text text-transparent">JAZA Media</span>{" "}
              <em className="bg-gradient-to-br from-[#fbe7a1] via-gold to-[#a97a1f] bg-clip-text pr-1 text-transparent">Marketing Templates</em>
            </h3>
            <ul className="relative mt-6 space-y-3">
              {PERKS.map((p) => (
                <li key={p} className="flex items-center gap-3 text-[15px] text-white/75">
                  <span className="grid size-5 place-items-center rounded-full bg-gold/15 text-gold ring-1 ring-gold/30">
                    <Check className="size-3" />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
            <Link
              href="/courses/marketing-templates"
              className="group relative mt-8 inline-flex w-fit items-center gap-2.5 rounded-full bg-gold px-7 py-3.5 text-[13px] font-semibold tracking-[0.12em] text-ink shadow-[0_10px_40px_-10px_rgba(234,179,8,0.55)] transition hover:bg-white"
            >
              DOWNLOAD NOW
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
