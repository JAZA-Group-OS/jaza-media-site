import { AnnouncementBanner } from "@/components/announcement-banner";
import { CopyrightBar } from "@/components/copyright-bar";
import { Faqs } from "@/components/faqs";
import { Footer } from "@/components/footer";
import { Founders } from "@/components/founders";
import { FreeMarketingSection } from "@/components/free-marketing-section";
import { Hero } from "@/components/hero";
import { MarketingTemplatesCard } from "@/components/marketing-templates-card";
import { Navbar } from "@/components/navbar";

export default function Home() {
  return (
    <>
      <AnnouncementBanner />
      <Navbar />
      <main>
        <Hero />
        <FreeMarketingSection />
        <Faqs />
        <Founders />
        <MarketingTemplatesCard />
      </main>
      <Footer />
      <CopyrightBar />
    </>
  );
}
