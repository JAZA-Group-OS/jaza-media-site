import type { Metadata } from "next";

import { AnnouncementBanner } from "@/components/announcement-banner";
import { CopyrightBar } from "@/components/copyright-bar";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: "Privacy Policy — JAZA Media",
  description:
    "How JAZA Media collects, uses, shares, and protects your personal information when you visit our website or use our services.",
};

const LAST_UPDATED = "May 3, 2026";
const EFFECTIVE_DATE = "May 3, 2026";
const CONTACT_EMAIL = "admin@jazamedia.com";

export default function PrivacyPage() {
  return (
    <>
      <AnnouncementBanner />
      <Navbar />
      <main className="bg-white py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 font-heading">
          <h1 className="font-display text-3xl text-brand-black md:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-text-muted">
            Last updated: {LAST_UPDATED} &middot; Effective date: {EFFECTIVE_DATE}
          </p>

          {/*
            TODO (legal): the substantive policy below mirrors industry-standard
            language. Have counsel confirm jurisdiction, governing-law venue,
            data-retention specifics, and any state/region-specific rights
            language (CCPA/CPRA, Colorado, EU/UK, etc.) before launch.
          */}
          <div className="prose prose-neutral mt-8 max-w-none text-base leading-relaxed text-brand-black">
            <p>
              JAZA Media (&ldquo;JAZA Media&rdquo;, &ldquo;we&rdquo;,
              &ldquo;us&rdquo;, or &ldquo;our&rdquo;) maintains this Privacy
              Policy to inform visitors of our data collection practices. This
              policy explains what personal information we collect, how we use
              it, who receives it, and the protective measures we employ.
            </p>
            <p>
              You are not obligated to provide personal information. By using
              our website or purchasing our products or services, you agree to
              the terms outlined in this policy.
            </p>

            <h2>Sources and collection of personal information</h2>

            <h3>Definition</h3>
            <p>
              &ldquo;Personal information&rdquo; refers to data that identifies
              you or could reasonably be linked to you, such as your name,
              address, phone number, email, or date of birth.
            </p>

            <h3>Information you voluntarily submit</h3>
            <p>We collect:</p>
            <ul>
              <li>Identifiers and contact details (name, email, address, phone number)</li>
              <li>Account credentials (username, password)</li>
              <li>Demographic information (such as birth month/day)</li>
              <li>Applicant information (employment or education history) when you apply for a role</li>
              <li>Financial information (such as payment-card or bank-account details) when you purchase from us</li>
              <li>Transactional information (product details, purchase price, transaction location)</li>
              <li>Multimedia content (images, videos, voice recordings) you choose to share with us</li>
              <li>Any other information you choose to provide</li>
            </ul>
            <p>
              Providing this information is optional. Withholding it may limit
              certain features but will not prevent access to publicly available
              content.
            </p>

            <h3>Information collected automatically</h3>
            <p>
              We and our service providers collect activity data through
              tracking technologies including cookies, pixels, tags, and web
              beacons. This may include:
            </p>
            <ul>
              <li>Domain name and IP address</li>
              <li>Browser type and operating system</li>
              <li>Visit date, time, and duration</li>
              <li>Pages visited and documents downloaded</li>
              <li>Links accessed to and from other sites</li>
              <li>Mobile device identifiers and approximate geolocation (if you have enabled it)</li>
            </ul>
            <p>This data lets us:</p>
            <ul>
              <li>Provide a smoother user experience</li>
              <li>Deliver relevant content and advertising</li>
              <li>Monitor and optimize site performance</li>
              <li>Analyze traffic patterns</li>
            </ul>

            <h2>How we use your personal information</h2>
            <p>We use your personal information to:</p>
            <ul>
              <li>
                <strong>Respond to inquiries:</strong> reply to email and
                online-form requests
              </li>
              <li>
                <strong>Manage accounts:</strong> create and maintain your user
                account
              </li>
              <li>
                <strong>Process registrations:</strong> handle course, webinar,
                and event sign-ups
              </li>
              <li>
                <strong>Deliver services:</strong> fulfill our contractual
                obligations to you
              </li>
              <li>
                <strong>Manage community spaces:</strong> moderate user-posted
                content where applicable
              </li>
              <li>
                <strong>Billing and compliance:</strong> handle invoicing,
                collections, and legal obligations
              </li>
              <li>
                <strong>Improve products:</strong> enhance our services and
                customer experience
              </li>
              <li>
                <strong>Process applications:</strong> evaluate job and
                partnership applications
              </li>
              <li>
                <strong>Send communications:</strong> notify you of changes to
                products, services, or policies
              </li>
              <li>
                <strong>Run internal operations:</strong> system administration,
                troubleshooting, and research
              </li>
              <li>
                <strong>Enable interactive features:</strong> let you
                participate in features that need personal information
              </li>
              <li>
                <strong>Protect security:</strong> guard against fraud and
                unlawful activity
              </li>
              <li>
                <strong>Measure advertising:</strong> evaluate effectiveness and
                deliver relevant content
              </li>
              <li>
                <strong>Make recommendations:</strong> suggest products or
                services based on your profile
              </li>
              <li>
                <strong>Run analytics:</strong> perform analytics and
                benchmarking
              </li>
              <li>
                <strong>Support corporate transactions:</strong> mergers,
                acquisitions, or reorganizations
              </li>
              <li>
                <strong>Meet legal obligations:</strong> comply with applicable
                law and respond to lawful requests
              </li>
              <li>
                <strong>Defend legal rights:</strong> exercise or defend our
                legal interests
              </li>
            </ul>

            <h2>Legal basis for collecting and using personal information</h2>
            <p>Our collection and use rely on:</p>
            <ul>
              <li>Service provision and completion of the transaction you requested</li>
              <li>Your consent (for direct marketing and certain digital activities)</li>
              <li>Our legitimate business interests (such as maintaining security and operations)</li>
              <li>Compliance with our legal obligations</li>
            </ul>

            <h2>How we disclose your personal information</h2>
            <p>We may share information with:</p>
            <ul>
              <li>
                <strong>Affiliates:</strong> entities within the JAZA Media
                family, who use the information consistent with this policy
              </li>
              <li>
                <strong>Government authorities:</strong> when legally compelled
                to do so
              </li>
              <li>
                <strong>To prevent harm:</strong> when disclosure protects
                rights, property, or users
              </li>
              <li>
                <strong>Business transfers:</strong> during acquisitions,
                mergers, sales, or reorganizations
              </li>
              <li>
                <strong>Service providers:</strong> third parties that perform
                services for us under contractual obligations
              </li>
            </ul>
            <p>
              Payment processors receive financial information directly and
              follow PCI-DSS standards. Their use of your information is
              governed by their own privacy policies.
            </p>

            <h2>Data retention</h2>
            <p>
              We retain personal information as long as reasonably necessary to
              maintain our relationship with you, deliver services, comply with
              legal obligations, and protect against disputes, consistent with
              our internal data-retention practices.
            </p>

            <h2>Your choices</h2>
            <p>
              Depending on where you live, you may have rights regarding your
              personal information, including:
            </p>
            <ul>
              <li>
                <strong>Right to know / data portability:</strong> request
                information about what we collect, and receive your data in a
                machine-readable format
              </li>
              <li>
                <strong>Right to delete:</strong> request deletion of personal
                information we hold about you, subject to legal exceptions
              </li>
              <li>
                <strong>Right to correct:</strong> request correction of
                inaccurate information
              </li>
              <li>
                <strong>Right to restrict processing:</strong> request limits on
                how we process your information in certain conditions
              </li>
              <li>
                <strong>Right to object:</strong> object to processing,
                particularly automated decision-making
              </li>
              <li>
                <strong>Right to withdraw consent:</strong> withdraw consent
                that you previously gave
              </li>
              <li>
                <strong>Marketing opt-out:</strong> unsubscribe at any time by
                emailing{" "}
                <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> or
                following the unsubscribe link in any promotional message
              </li>
              <li>
                <strong>Non-discrimination:</strong> we will not deny equal
                pricing or service because you exercised your rights
              </li>
            </ul>
            <p>
              Requests must include enough information for us to verify your
              identity. Authorized representatives may submit requests with
              proper verification.
            </p>

            <h2>Children&rsquo;s privacy</h2>
            <p>
              Our website is not intended for users under 18. If we learn that a
              minor has submitted personal information, we will delete that
              data. We encourage parents and guardians to discuss internet
              safety with their children.
            </p>

            <h2>How we protect your personal information</h2>
            <p>
              We implement reasonable technical, organizational, and
              administrative security measures consistent with industry
              standards. No system, however, can guarantee absolute security
              against unauthorized access, loss, misuse, destruction, or
              alteration during transmission or storage.
            </p>

            <h2>Tracking technologies</h2>

            <h3>Cookie types</h3>
            <p>
              <strong>Essential cookies</strong> enable site functionality such
              as sign-in detection, session management, and security.
            </p>
            <p>
              <strong>Analytics cookies</strong> track how visitors navigate the
              site, measure traffic, and count page views. We use Google
              Analytics; see{" "}
              <a
                href="https://www.google.com/policies/privacy/partners/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google&rsquo;s partner-privacy page
              </a>{" "}
              for details.
            </p>
            <p>
              <strong>Advertising cookies</strong> are placed by us or our
              partners to recognize you across ad networks and serve relevant
              advertising based on your browsing history.
            </p>

            <h3>Do Not Track</h3>
            <p>
              Our website does not currently respond to &ldquo;Do Not
              Track&rdquo; signals; collection continues as described above. We
              do recognize universal opt-out signals such as Global Privacy
              Control where required by law.
            </p>

            <h2>Changes to this Privacy Policy</h2>
            <p>
              We may update this policy from time to time and will provide
              notice as required by law. The &ldquo;last updated&rdquo; date at
              the top of this page reflects the most recent changes. Please
              check back periodically.
            </p>

            <h2>Third-party links and websites</h2>
            <p>
              This Privacy Policy does not apply to third-party sites, services,
              or applications that are not operated by us. Review their privacy
              practices before using them.
            </p>

            <h2>Contacting us</h2>
            <p>
              For privacy questions or to exercise any of the rights above,
              email{" "}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
            </p>

            <hr />
            <p className="text-sm text-text-muted">
              <strong>Disclaimer.</strong> Jaza and Bela&rsquo;s results are not
              typical and are not a guarantee of your success. Results vary
              based on education, effort, application, experience, and
              background. We do not provide investment, tax, or other
              professional advice. Specific transactions and experiences are
              mentioned for informational purposes only.
            </p>
          </div>
        </div>
      </main>
      <Footer />
      <CopyrightBar />
    </>
  );
}
