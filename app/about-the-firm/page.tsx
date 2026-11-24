import type { Metadata } from "next";

import { AnnouncementBanner } from "@/components/announcement-banner";
import { CopyrightBar } from "@/components/copyright-bar";
import { ExplodeProfitCta } from "@/components/explode-profit-cta";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { TeamGrid } from "@/components/team-grid";

export const metadata: Metadata = {
  title: "About the Firm — JAZA Media",
  description: "Meet the leadership team behind JAZA Media.",
};

export default function AboutTheFirmPage() {
  return (
    <>
      <div className="sticky top-0 z-50">
        <AnnouncementBanner />
        <Navbar />
      </div>
      <main>
        <TeamGrid />
        <ExplodeProfitCta />
      </main>
      <Footer />
      <CopyrightBar />
    </>
  );
}
