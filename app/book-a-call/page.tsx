import type { Metadata } from "next";

import { CopyrightBar } from "@/components/copyright-bar";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: "Book a Call — JAZA Media",
  description: "Book a call with JAZA Media.",
};

// Left empty on purpose — content to be added.
export default function BookACallPage() {
  return (
    <>
      <Navbar centered />
      <main className="min-h-[60svh] bg-[#f8f6f1]" />
      <Footer />
      <CopyrightBar />
    </>
  );
}
