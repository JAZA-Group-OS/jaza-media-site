import type { Metadata } from "next";

import { AnnouncementBanner } from "@/components/announcement-banner";
import { CareersHero } from "@/components/careers-hero";
import { CareersTogether } from "@/components/careers-together";
import { CareersValues } from "@/components/careers-values";
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
      <AnnouncementBanner />
      <Navbar />
      <main>
        <CareersHero />
        <CareersValues />
        <CareersTogether />
      </main>
      <Footer />
      <CopyrightBar />
    </>
  );
}
