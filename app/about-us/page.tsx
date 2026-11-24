import type { Metadata } from "next";

import { AboutHero } from "@/components/about-hero";
import { AnnouncementBanner } from "@/components/announcement-banner";
import { CopyrightBar } from "@/components/copyright-bar";
import { FeaturedYellowCard } from "@/components/featured-yellow-card";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { ValuedClients } from "@/components/valued-clients";

export const metadata: Metadata = {
  title: "About Us — JAZA Media",
  description:
    "JAZA Media — the country's first fully integrated Marketing Agency that has an app.",
};

export default function AboutUsPage() {
  return (
    <>
      <div className="sticky top-0 z-50">
        <AnnouncementBanner />
        <Navbar />
      </div>
      <main>
        <AboutHero />
        <ValuedClients />
        <FeaturedYellowCard />
      </main>
      <Footer />
      <CopyrightBar />
    </>
  );
}
