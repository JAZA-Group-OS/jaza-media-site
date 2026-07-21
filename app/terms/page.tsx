import type { Metadata } from "next";

import { AnnouncementBanner } from "@/components/announcement-banner";
import { CopyrightBar } from "@/components/copyright-bar";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: "Terms & Conditions — JAZA Media",
  description:
    "The terms that govern your access to and use of the JAZA Media website, content, and services.",
};

const LAST_UPDATED = "May 3, 2026";
const EFFECTIVE_DATE = "May 3, 2026";
const CONTACT_EMAIL = "admin@jazamedia.com";

export default function TermsPage() {
  return (
    <>
      <AnnouncementBanner />
      <Navbar />
      <main className="bg-white py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 font-heading">
          <h1 className="font-display text-3xl text-brand-black md:text-4xl">
            Terms &amp; Conditions
          </h1>
          <p className="mt-2 text-sm text-text-muted">
            Last updated: {LAST_UPDATED} &middot; Effective date: {EFFECTIVE_DATE}
          </p>

          {/*
            TODO (legal): the substantive terms below mirror industry-standard
            language. Have counsel confirm governing-law jurisdiction,
            arbitration venue, statute-of-limitations period, and any
            region-specific clauses before launch. Replace any
            "[Governing jurisdiction]" placeholders with the chosen venue.
          */}
          <div className="prose prose-neutral mt-8 max-w-none text-base leading-relaxed text-brand-black">
            <p>
              These Terms &amp; Conditions (the &ldquo;Agreement&rdquo;) govern
              your access to and use of the JAZA Media website, content, and
              services (collectively, the &ldquo;Site&rdquo;). By using the
              Site, you agree to this Agreement. If you do not agree, please do
              not use the Site.
            </p>

            <h2>1. Scope</h2>
            <p>
              This Agreement governs your access to and use of the Site and
              represents the complete and exclusive understanding and agreement
              between you and JAZA Media (&ldquo;JAZA Media&rdquo;,
              &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;)
              regarding Site access and use. It supersedes all prior
              communications on the subject.
            </p>

            <h2>2. You</h2>
            <p>
              If you are entering this Agreement on your own behalf, you
              represent yourself. If you are entering on behalf of an
              organization, you warrant that you have authority to bind that
              entity. In either case, you confirm you have the legal capacity
              to enter binding agreements.
            </p>

            <h2>3. Modifications to this Agreement</h2>
            <p>
              We may modify this Agreement at our discretion with commercially
              reasonable notice. Material modifications take effect five (5)
              days after posting unless made for legal or administrative
              reasons. Continued use of the Site constitutes acceptance of the
              modified Agreement. This Agreement may otherwise be amended only
              by a writing signed by both parties.
            </p>

            <h2>4. Right to modify or discontinue the Site</h2>
            <p>
              We reserve the right to modify, suspend, or discontinue the Site,
              its content, or any offerings at any time without notice. We bear
              no liability for such modifications or discontinuances.
            </p>

            <h2>5. Definitions</h2>
            <p>
              Capitalized terms have the meanings given herein or, where not
              defined, their plain English meaning as commonly interpreted.
            </p>

            <h2>6. Eligibility</h2>
            <p>
              The Site is restricted to individuals 18 years of age or older.
              By using the Site, you confirm you meet this requirement and have
              the legal capacity to enter binding agreements.
            </p>

            <h2>7. Term</h2>
            <p>
              This Agreement becomes effective on your first acceptance and
              continues until terminated as described below.
            </p>

            <h2>8. Additional agreements</h2>
            <p>
              You may have additional agreements with us regarding specific
              services. Those remain separate, but unless explicitly stated
              otherwise, the terms of this Agreement control regarding Site
              access and use.
            </p>

            <h2>9. Third-party offerings</h2>
            <p>
              The Site may provide access to third-party offerings that we do
              not operate or endorse. You assume sole responsibility for any
              third-party offerings and their associated terms. Third-party
              terms control only as to your use of the third-party offering;
              this Agreement controls all other Site aspects.
            </p>

            <h2>10. Your account</h2>
            <p>
              Accounts are issued at our sole discretion. They are personal and
              non-transferable. You are solely responsible for your account and
              all use of the Site through it. You must keep your credentials
              confidential and secure.
            </p>

            <h2>11. Truthful information</h2>
            <p>
              You agree that any information you submit will be true, accurate,
              current, and complete, and you will keep it updated. You grant
              us the rights necessary to use that information consistent with
              this Agreement.
            </p>

            <h2>12. Access to the Site</h2>
            <p>
              Subject to your compliance with this Agreement, we grant you
              access to the Site for personal or business use only. You may not
              distribute, sell, resell, license, sublicense, transfer, or make
              the Site available to third parties.
            </p>

            <h2>13. User content</h2>
            <p>
              You are solely responsible for all content you upload, provide,
              or make available through the Site. You must obtain all rights
              and permissions necessary to share that content. We bear no
              responsibility for the accuracy, completeness, deletion, or loss
              of user content.
            </p>

            <h2>14. Site content</h2>
            <p>
              Site content is provided for informational purposes only. We are
              not responsible for interruptions, delays, errors, or omissions.
              You are responsible for verifying the accuracy and completeness
              of all Site content.
            </p>

            <h2>15. Restrictions</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Access the Site without authorization</li>
              <li>Copy content outside the Site for unauthorized purposes</li>
              <li>Transfer your access rights to a third party</li>
              <li>Modify, reverse-engineer, or decompile any offerings</li>
              <li>Circumvent any security or technical protections</li>
              <li>Use the Site for any unlawful purpose</li>
              <li>Promote illegal activity</li>
              <li>Challenge our ownership of the Site</li>
              <li>Infringe the rights of others</li>
              <li>Use automated scripts to access or scrape the Site</li>
              <li>Remove or alter any notices on the Site</li>
              <li>Disrupt the Site or other users&rsquo; enjoyment of it</li>
            </ul>

            <h2>16. Ownership</h2>
            <p>
              We retain all rights, title, and interest in the Site, its
              content, offerings, and underlying technology. You receive no
              ownership interest. The JAZA Media name, logo, and all product
              and service names associated with the Site are trademarks of JAZA
              Media; no right or license to use them is granted to you.
            </p>

            <h2>17. Feedback</h2>
            <p>
              Any feedback you choose to provide is voluntary. We are free to
              use feedback as we see fit, for any purpose, without notice,
              payment, or other obligation to you.
            </p>

            <h2>18. Fees</h2>
            <p>
              General Site access is free. Certain offerings or content may
              require payment, in which case you must pay applicable fees when
              due in U.S. dollars unless otherwise stated. All fees are
              non-refundable once paid. Unpaid amounts may accrue monthly
              charges of 1.5% or the applicable legal maximum. You are
              responsible for all related taxes.
            </p>

            <h2>19. Termination</h2>
            <p>
              Either party may terminate this Agreement at any time at its sole
              discretion with notice. Termination ends all rights,
              subscriptions, and access. You must cease use of the Site
              immediately and destroy any confidential information. Provisions
              that by their nature should survive termination will do so.
            </p>

            <h2>20. Suspension</h2>
            <p>
              We may suspend your access without notice for any actual,
              threatened, or suspected breach of this Agreement, violation of
              applicable law, or conduct we deem inappropriate or detrimental.
            </p>

            <h2>21. Links to other sites</h2>
            <p>
              The Site may link to third-party sites we do not control.{" "}
              <strong>
                YOUR USE OF ANY THIRD-PARTY SITES OR SERVICES IS AT YOUR OWN
                RISK.
              </strong>{" "}
              Third-party terms apply to those sites.
            </p>

            <h2>22. Representations and warranties</h2>
            <p>
              You represent and warrant that you have the legal authority to
              enter this Agreement, that this Agreement forms a binding
              obligation on you, that you can perform your obligations, and
              that your use of the Site will comply with applicable laws and
              will not cause us to violate any law.
            </p>

            <h2>23. Disclaimer of results</h2>
            <p>
              We make no promises regarding any specific level of success,
              income, sales, or results. Individual results vary.{" "}
              <strong>
                YOUR BUSINESS&rsquo;S RESULTS WILL VARY DEPENDING ON A VARIETY
                OF FACTORS UNIQUE TO YOUR BUSINESS, INCLUDING BUT NOT LIMITED
                TO YOUR LOCATION, BUSINESS MODEL, STAFF, AND SERVICE AND
                PRODUCT OFFERINGS.
              </strong>
            </p>

            <h2>24. No professional advice</h2>
            <p>
              <strong>
                NEITHER JAZA MEDIA NOR THE SITE PROVIDES INVESTMENT, TAX,
                LEGAL, OR OTHER PROFESSIONAL ADVICE.
              </strong>{" "}
              Content is educational and informational only and is not a
              substitute for professional advice. Consult a licensed
              professional regarding your individual situation and legal
              compliance.
            </p>

            <h2>25. No additional warranties</h2>
            <p>
              <strong>
                THE SITE AND ALL CONTENT AND OFFERINGS ARE PROVIDED &ldquo;AS
                IS&rdquo; AND ON AN &ldquo;AS AVAILABLE&rdquo; BASIS.
              </strong>{" "}
              We make no warranties of accuracy, completeness, or
              functionality, and disclaim all representations and warranties,
              express or implied, to the maximum extent permitted by law. To
              the extent any warranty cannot be disclaimed, our total liability
              is capped at the greater of US$100 or amounts you paid us in the
              six (6) months preceding the claim.
            </p>

            <h2>26. Indemnity</h2>
            <p>
              You agree to indemnify and defend JAZA Media and its affiliates
              from any claims arising out of your access to or use of the Site,
              your user content, or your breach of this Agreement. We retain
              the right to participate in our defense.
            </p>

            <h2>27. Limitations of liability</h2>
            <p>
              <strong>
                UNDER NO CIRCUMSTANCES WILL JAZA MEDIA BE LIABLE TO YOU FOR ANY
                INDIRECT, SPECIAL, CONSEQUENTIAL, INCIDENTAL, EXEMPLARY, OR
                PUNITIVE DAMAGES.
              </strong>{" "}
              Our aggregate liability is capped at the greater of US$100 or
              amounts you paid us in the month preceding the claim.
            </p>

            <h2>28. Dispute resolution</h2>
            <p>
              The parties will first attempt to resolve any dispute informally
              within fifteen (15) days. Unresolved disputes will be submitted
              to binding arbitration before a sole arbitrator under the rules
              of a recognized arbitral body, conducted in English. The
              arbitrator&rsquo;s award will be the exclusive remedy. The
              non-prevailing party will pay the prevailing party&rsquo;s
              reasonable costs.
            </p>

            <h2>29. Choice of law, jurisdiction, and venue</h2>
            <p>
              This Agreement is governed by and construed in accordance with
              the laws of <strong>[Governing jurisdiction]</strong>, without
              regard to conflict-of-laws principles. Legal actions will proceed
              in the state or federal courts located in{" "}
              <strong>[Governing jurisdiction]</strong>, and you and we
              irrevocably consent to the jurisdiction and venue of such courts.
            </p>

            <h2>30. Waiver of class action and jury trial</h2>
            <p>
              You agree to pursue claims individually and not as part of any
              class or representative action.{" "}
              <strong>
                THE PARTIES HEREBY WAIVE TRIAL BY JURY OF ANY DISPUTE.
              </strong>
            </p>

            <h2>31. Statute of limitations</h2>
            <p>
              To the extent permitted by applicable law, any claim arising out
              of or relating to this Agreement must be filed within one (1)
              year after the claim arises or be forever barred.
            </p>

            <h2>32. Force majeure</h2>
            <p>
              We bear no responsibility for performance failures due to events
              beyond our reasonable control, including acts of governmental
              authority, war, terrorism, strikes, pandemics, loss of facilities,
              or accidents. We will provide commercially reasonable notice of
              such events.
            </p>

            <h2>33. Privacy Policy</h2>
            <p>
              While our{" "}
              <a href="/privacy">Privacy Policy</a>{" "}
              is not part of this Agreement, you consent to our use and
              disclosure of your information as described there.
            </p>

            <h2>34. Claims of infringement</h2>
            <p>
              If you believe content on the Site infringes your copyright,
              please notify us at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. Your
              notice should include: identification of the work claimed to be
              infringed; identification of the allegedly infringing material;
              your name, address, phone, and email; a good-faith statement that
              the use is not authorized; a statement made under penalty of
              perjury that the information is accurate and that you are
              authorized to act; and your physical or electronic signature.
            </p>

            <h2>35. General</h2>
            <p>
              Undefined terms have their plain English meaning.
              &ldquo;Including&rdquo; means &ldquo;including, but not limited
              to.&rdquo; Headings are for reference only. Failure to enforce a
              provision is not a waiver. All waivers must be in writing. If any
              provision is unenforceable, it will be severed and the remainder
              will continue. The parties are independent entities and neither
              has authority to bind the other. You may not assign your rights
              without our prior written consent; any unauthorized assignment is
              void. We may freely assign. There are no third-party beneficiary
              rights. All remedies are cumulative.
            </p>

            <h2>36. Notices</h2>
            <p>
              You may send notices to us by email at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. We may
              send notices to you by email at the address associated with your
              account or by posting on the Site. Notices are effective
              twenty-four (24) hours after posting on the Site or upon delivery
              of email.
            </p>

            <h2>37. Contact us</h2>
            <p>
              For general inquiries, non-compliance notices, or complaints,
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
