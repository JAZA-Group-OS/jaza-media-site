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
      <div className="mx-auto grid max-w-5xl grid-cols-1 items-end gap-6 px-4 pt-10 md:grid-cols-[auto_1fr] md:items-center md:gap-10 md:pt-12">
        <div className="relative aspect-square w-full max-w-[260px] border-[3px] border-brand-black">
          {portrait ? (
            <Image
              src={portrait}
              alt={altText}
              fill
              sizes="(min-width: 768px) 260px, 100vw"
              className={`object-contain ${member.mirror ? "-scale-x-100" : ""}`}
              priority
            />
          ) : (
            <span className="sr-only">{altText}</span>
          )}
        </div>
        <div className="pb-6 md:pb-0">
          <h1 className="font-heading text-4xl font-black uppercase leading-[0.95] tracking-tight text-brand-black md:text-5xl lg:text-6xl">
            {displayName}
          </h1>
          <p className="mt-3 font-heading text-sm font-bold uppercase tracking-wide text-brand-black md:text-base">
            {member.role}
          </p>
        </div>
      </div>
    </section>
  );
}
