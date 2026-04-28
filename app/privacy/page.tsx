import type { Metadata } from "next";

import { AnnouncementBanner } from "@/components/announcement-banner";
import { CopyrightBar } from "@/components/copyright-bar";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: "Privacy Policy — JAZA Media",
  description: "How JAZA Media collects, uses, and protects your information.",
};

export default function PrivacyPage() {
  return (
    <>
      <AnnouncementBanner />
      <Navbar />
      <main className="bg-white py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4">
          <h1 className="font-display text-3xl text-brand-black md:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-text-muted">Last updated: April 28, 2026</p>

          <div className="prose prose-neutral mt-8 max-w-none text-base leading-relaxed text-brand-black">
            {/* TODO: replace with the final privacy policy copy approved by legal */}
            <p>
              JAZA Media (&ldquo;we&rdquo;, &ldquo;us&rdquo;) respects your
              privacy. This page describes what information we collect when you
              use our website, how we use it, and the choices you have.
            </p>

            <h2>Information we collect</h2>
            <p>Placeholder — describe data collected (forms, cookies, analytics).</p>

            <h2>How we use information</h2>
            <p>Placeholder — describe purposes (service delivery, marketing, etc.).</p>

            <h2>Sharing</h2>
            <p>Placeholder — describe third parties (processors, service providers).</p>

            <h2>Your choices</h2>
            <p>Placeholder — describe access, deletion, opt-out rights.</p>

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
