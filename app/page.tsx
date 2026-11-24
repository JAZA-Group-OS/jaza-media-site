import { AnnouncementBanner } from "@/components/announcement-banner";
import { CopyrightBar } from "@/components/copyright-bar";
import { Faqs } from "@/components/faqs";
import { Footer } from "@/components/footer";
import { Founders } from "@/components/founders";
import { FreeMarketingSection } from "@/components/free-marketing-section";
import { Hero } from "@/components/hero";
import { ValuedClients } from "@/components/valued-clients";
import { StatsStrip } from "@/components/stats-strip";
import { MarketingTemplatesCard } from "@/components/marketing-templates-card";
import { Navbar } from "@/components/navbar";

export default function Home() {
  return (
    <>
      <AnnouncementBanner />
      <Navbar />
      <main>
        <Hero />
        <ValuedClients variant="dark" />
        <StatsStrip />
        <FreeMarketingSection />
        <Founders />
        <Faqs />
        <MarketingTemplatesCard />
      </main>
      <Footer />
      <CopyrightBar />
    </>
  );
}
