import type { Metadata } from "next";

import { AnnouncementBanner } from "@/components/announcement-banner";
import { CareersPremium } from "@/components/careers-premium";
import { CopyrightBar } from "@/components/copyright-bar";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: "Careers — JAZA Media",
  description:
    "Join a world-record breaking team. JAZA Media is hiring disciplined teammates who lead with trust and play to win.",
};

export default function CareersPage() {
  return (
    <>
      <div className="sticky top-0 z-50">
        <AnnouncementBanner />
        <Navbar />
      </div>
      <main>
        <CareersPremium />
      </main>
      <Footer />
      <CopyrightBar />
    </>
  );
}
