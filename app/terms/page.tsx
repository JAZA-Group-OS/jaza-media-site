import type { Metadata } from "next";

import { AnnouncementBanner } from "@/components/announcement-banner";
import { CopyrightBar } from "@/components/copyright-bar";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: "Terms & Conditions — JAZA Media",
  description: "The terms that govern your use of the JAZA Media website and services.",
};

export default function TermsPage() {
  return (
    <>
      <AnnouncementBanner />
      <Navbar />
      <main className="bg-white py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4">
          <h1 className="font-display text-3xl text-brand-black md:text-4xl">
            Terms &amp; Conditions
          </h1>
          <p className="mt-2 text-sm text-text-muted">Last updated: April 28, 2026</p>

          <div className="prose prose-neutral mt-8 max-w-none text-base leading-relaxed text-brand-black">
            {/* TODO: replace with the final terms copy approved by legal */}
            <p>
              These Terms &amp; Conditions govern your access to and use of the
              JAZA Media website and services. By using the site, you agree to
              these terms.
            </p>

            <h2>Use of the site</h2>
            <p>Placeholder — acceptable use, account responsibilities.</p>

            <h2>Intellectual property</h2>
            <p>Placeholder — ownership of content, trademarks, restrictions.</p>

            <h2>Disclaimers</h2>
            <p>Placeholder — no guarantee of results, informational use only.</p>

            <h2>Limitation of liability</h2>
            <p>Placeholder — limits on damages and remedies.</p>

            <h2>Changes to these terms</h2>
            <p>Placeholder — how and when we update these terms.</p>

            <h2>Contact</h2>
            <p>
              Questions? Reach us at{" "}
              <a href="mailto:hello@jazamedia.com">hello@jazamedia.com</a>.
            </p>
          </div>
        </div>
      </main>
      <Footer />
      <CopyrightBar />
    </>
  );
}
