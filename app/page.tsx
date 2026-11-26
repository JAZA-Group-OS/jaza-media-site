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
        <Hero />
        <ValuedClients variant="dark" />
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
