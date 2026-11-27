import type { Metadata } from "next";

import { BookACallFlow } from "@/components/book-a-call/book-a-call-flow";
import { CopyrightBar } from "@/components/copyright-bar";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: "Book a Call — JAZA Media",
  description:
    "Answer five quick questions and book a call with the right person at JAZA Media.",
};

// Website → booking form (5 questions) → auto lead score → CEO call, sales call, or auto-nurture.
export default function BookACallPage() {
  return (
    <div className="flex min-h-svh flex-col">
      <Navbar centered />
      <main className="flex-1 bg-[#f8f6f1] px-4 py-8 text-ink md:py-10">
        <div className="mx-auto max-w-5xl">
          <BookACallFlow />
        </div>
      </main>
      <Footer />
      <CopyrightBar />
    </div>
  );
}
