import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AnnouncementBanner } from "@/components/announcement-banner";
import { CopyrightBar } from "@/components/copyright-bar";
import { ExplodeProfitCta } from "@/components/explode-profit-cta";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { TeamBioHero } from "@/components/team-bio-hero";
import { getAllSlugs, getMember } from "@/lib/team";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const member = getMember(slug);
  const name = member?.name ?? "Team Member";
  return {
    title: `${name} — JAZA Media`,
    description: member ? `${member.role}, JAZA Media` : "JAZA Media team member.",
  };
}

export default async function TeamMemberPage({ params }: { params: Params }) {
  const { slug } = await params;
  const member = getMember(slug);
  if (!member) notFound();

  const paragraphs = member.bio ?? [];

  return (
    <>
      <AnnouncementBanner />
      <Navbar />
      <main>
        <TeamBioHero member={member} />
        <section className="bg-white py-12 md:py-16">
          <div className="mx-auto max-w-3xl space-y-6 px-4 text-center text-sm leading-relaxed text-brand-black md:text-base">
            {paragraphs.length > 0 ? (
              paragraphs.map((paragraph, i) => <p key={i}>{paragraph}</p>)
            ) : (
              <p className="text-text-muted">Bio coming soon.</p>
            )}
          </div>
        </section>
        <ExplodeProfitCta />
      </main>
      <Footer />
      <CopyrightBar />
    </>
  );
}
