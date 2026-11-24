import type { Metadata } from "next";

import { AnnouncementBanner } from "@/components/announcement-banner";
import { BlogArticles } from "@/components/blog-articles";
import { BlogFeatured } from "@/components/blog-featured";
import { BlogHero } from "@/components/blog-hero";
import { CopyrightBar } from "@/components/copyright-bar";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: "Blog — JAZA Media",
  description:
    "The Art of Campaigns — a weekly article featuring real business stories, CEO insights, and proven scaling campaign strategies from JAZA Media.",
};

export default function BlogPage() {
  return (
    <>
      <div className="sticky top-0 z-50">
        <AnnouncementBanner />
        <Navbar />
      </div>
      <main>
        <BlogHero />
        <BlogArticles />
        <BlogFeatured />
      </main>
      <Footer />
      <CopyrightBar />
    </>
  );
}
