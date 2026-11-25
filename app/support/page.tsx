import { AnnouncementBanner } from "@/components/announcement-banner";
import { CopyrightBar } from "@/components/copyright-bar";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { SupportContactCard } from "@/components/support-contact-card";
import { SupportFaqs } from "@/components/support-faqs";
import { SupportHero } from "@/components/support-hero";
import { SupportSlides } from "@/components/support-slides";

export const metadata = {
  title: "Support — JAZA Media",
  description:
    "Get help with your JAZA Media course, partnership inquiry, application, or billing. Browse FAQs or send us a message.",
};

// One screen, three slides (hero → FAQs → contact) that slide in from the right.
// The page itself doesn't scroll on tablet/desktop; the footer is phone-only.
export default function SupportPage() {
  return (
    <>
      <div className="flex h-svh flex-col overflow-hidden">
        <div className="relative z-50 shrink-0">
          <AnnouncementBanner />
          <Navbar />
        </div>
        <main className="relative min-h-0 flex-1">
          <SupportSlides>
            <SupportHero />
            <SupportFaqs />
            <SupportContactCard />
          </SupportSlides>
        </main>
      </div>
      <div className="md:hidden">
        <Footer />
        <CopyrightBar />
      </div>
    </>
  );
}
