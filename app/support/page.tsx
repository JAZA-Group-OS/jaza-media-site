import { AnnouncementBanner } from "@/components/announcement-banner";
import { CopyrightBar } from "@/components/copyright-bar";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { SupportContactCard } from "@/components/support-contact-card";
import { SupportFaqs } from "@/components/support-faqs";
import { SupportHero } from "@/components/support-hero";

export const metadata = {
  title: "Support — JAZA Media",
  description:
    "Get help with your JAZA Media course, partnership inquiry, application, or billing. Browse FAQs or send us a message.",
};

export default function SupportPage() {
  return (
    <>
      <AnnouncementBanner />
      <Navbar />
      <main>
        <SupportHero />
        <SupportFaqs />
        <SupportContactCard />
      </main>
      <Footer />
      <CopyrightBar />
    </>
  );
}
