import type { Metadata } from "next";
import { CalendarCheck, Clock, Video } from "lucide-react";

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


export default function BookACallPage() {
  return (
    <>
      <Navbar centered />
      <main className="bg-[#f8f6f1] text-ink">
        <section className="mx-auto w-full max-w-6xl px-4 pt-14 pb-12 text-center md:pt-20">
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

        <section id="calendar" className="mx-auto w-full max-w-5xl px-4 pb-20">
          <div className="booking-light">
            <BookingCalendar mode="book" />
          </div>
        </section>
      </main>
      <Footer />
      <CopyrightBar />
    </>
  );
}
