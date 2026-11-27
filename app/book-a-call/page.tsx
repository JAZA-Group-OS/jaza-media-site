import type { Metadata } from "next";
import { CalendarCheck, Clock, Video, Target, LineChart, Handshake } from "lucide-react";

import { CopyrightBar } from "@/components/copyright-bar";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { BookingCalendar } from "@/components/partner/booking-calendar";

export const metadata: Metadata = {
  title: "Book a Call — JAZA Media",
  description:
    "Book a free 30-minute strategy call with JAZA Media. Pick a time and the Google Meet link goes straight to your inbox.",
};

const PERKS = [
  { icon: Clock, text: "30 minutes" },
  { icon: Video, text: "Google Meet" },
  { icon: CalendarCheck, text: "Free strategy review" },
];

const STEPS = [
  { icon: Target, title: "Your goals", body: "Tell us where the business is today and where you want it to be." },
  { icon: LineChart, title: "Our read", body: "We look at your marketing and point out the biggest growth levers." },
  { icon: Handshake, title: "Next steps", body: "A clear plan you can act on — whether or not we work together." },
];

export default function BookACallPage() {
  return (
    <>
      <Navbar centered />
      <main className="bg-[#f8f6f1] text-ink">
        <section className="mx-auto w-full max-w-6xl px-4 pt-14 pb-10 text-center md:pt-20">
          <p className="flex items-center justify-center gap-3 text-[11px] font-medium tracking-[0.3em] text-gold-deep uppercase">
            <span aria-hidden className="h-px w-8 bg-gold-deep/60" />
            Book a call
            <span aria-hidden className="h-px w-8 bg-gold-deep/60" />
          </p>
          <h1 className="mx-auto mt-6 max-w-3xl font-display text-[40px] leading-[1.05] tracking-[-0.02em] md:text-[60px]">
            Let&apos;s talk about <span className="text-gold-deep">your growth.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-[16px] leading-[1.75] text-black/60 md:text-[17px]">
            Pick a time that works for you. We&apos;ll send the Google Meet link straight to your inbox.
          </p>
          <ul className="mt-7 flex flex-wrap justify-center gap-2.5">
            {PERKS.map(({ icon: Icon, text }) => (
              <li key={text} className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-[13px] text-black/70">
                <Icon className="size-4 text-gold-deep" strokeWidth={1.75} />
                {text}
              </li>
            ))}
          </ul>
        </section>

        <section className="mx-auto grid w-full max-w-6xl gap-4 px-4 pb-12 md:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, body }, i) => (
            <div key={title} className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-full bg-gold/15 text-gold-deep">
                  <Icon className="size-5" strokeWidth={1.75} />
                </span>
                <span className="text-[11px] tracking-[0.25em] text-black/40 uppercase">0{i + 1}</span>
              </div>
              <h2 className="mt-4 font-display text-xl">{title}</h2>
              <p className="mt-2 text-[15px] leading-relaxed text-black/60">{body}</p>
            </div>
          ))}
        </section>

        <section id="calendar" className="bg-[#0b0d0c] py-14 text-white md:py-20">
          <div className="mx-auto w-full max-w-5xl px-4">
            <h2 className="text-center font-display text-3xl md:text-4xl">Choose a time</h2>
            <div className="mt-8">
              <BookingCalendar mode="book" />
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <CopyrightBar />
    </>
  );
}
