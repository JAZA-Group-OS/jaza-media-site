import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AnnouncementBanner } from "@/components/announcement-banner";
import { CopyrightBar } from "@/components/copyright-bar";
import { ExplodeProfitCta } from "@/components/explode-profit-cta";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { TeamBioHero } from "@/components/team-bio-hero";
import { TeamBioStory } from "@/components/team-bio-story";
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


  return (
    <>
      <div className="sticky top-0 z-50">
        <AnnouncementBanner />
        <Navbar />
      </div>
      <main>
        <TeamBioHero member={member} />
        <TeamBioStory member={member} />
        <ExplodeProfitCta />
      </main>
      <Footer />
      <CopyrightBar />
    </>
  );
}
