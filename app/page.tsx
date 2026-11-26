import { AnnouncementBanner } from "@/components/announcement-banner";
import { CopyrightBar } from "@/components/copyright-bar";
import { Faqs } from "@/components/faqs";
import { Footer } from "@/components/footer";
import { Founders } from "@/components/founders";
import { FreeMarketingSection } from "@/components/free-marketing-section";
import { Hero } from "@/components/hero";
import { RecentWork } from "@/components/recent-work";
import { ValuedClients } from "@/components/valued-clients";
import { Navbar } from "@/components/navbar";

export default function Home() {
  return (
    <>
      <div className="sticky top-0 z-50">
        <AnnouncementBanner />
        <Navbar />
      </div>
      <main>
        <section data-dot-label="Home" className="home-slide flex flex-col md:min-h-[calc(100svh-114px)] md:justify-between">
          <Hero />
          <ValuedClients variant="light" />
        </section>
        <RecentWork />
        <FreeMarketingSection />
        <Founders />
        <Faqs />
      </main>
      <Footer />
      <CopyrightBar />
    </>
  );
}
