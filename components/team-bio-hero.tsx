import Image from "next/image";

import type { Member } from "@/lib/team";

export function TeamBioHero({ member }: { member: Member }) {
  const displayName = member.name ?? "NAME";
  const portrait = member.bioImage ?? member.image;
  const altText = member.name
    ? `${member.name} — ${member.role}`
    : "Team member placeholder";

  return (
    <section className="bg-brand-yellow">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 px-4 py-12 md:grid-cols-[1fr_1.4fr] md:gap-12 md:py-20">
        <div className="relative aspect-[4/5] w-full max-w-sm overflow-hidden border-[3px] border-brand-black bg-neutral-200">
          {portrait ? (
            <Image
              src={portrait}
              alt={altText}
              fill
              sizes="(min-width: 768px) 384px, 100vw"
              className={`object-cover ${member.mirror ? "-scale-x-100" : ""}`}
              priority
            />
          ) : (
            <span className="sr-only">{altText}</span>
          )}
        </div>
        <div>
          <h1 className="font-heading text-4xl font-black uppercase leading-[1.05] tracking-tight text-brand-black md:text-6xl">
            {displayName}
          </h1>
          <p className="mt-3 font-heading text-base font-bold uppercase tracking-wide text-brand-black md:text-lg">
            {member.role}
          </p>
        </div>
      </div>
    </section>
  );
}
