import Image from "next/image";

import type { Member } from "@/lib/team";

export function TeamBioHero({ member }: { member: Member }) {
  const displayName = member.name ?? "NAME";
  const portrait = member.bioImage ?? member.image;
  const altText = member.name
    ? `${member.name} — ${member.role}`
    : "Team member placeholder";

  return (
    <section className="bg-brand-yellow py-10 md:py-12">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-4 md:flex-row md:items-center md:gap-10">
        <div className="relative h-[260px] w-[260px] shrink-0 border-[3px] border-brand-black">
          {portrait ? (
            <Image
              src={portrait}
              alt={altText}
              fill
              sizes="260px"
              className={`object-contain ${member.mirror ? "-scale-x-100" : ""}`}
              priority
            />
          ) : (
            <span className="sr-only">{altText}</span>
          )}
        </div>
        <div className="text-center md:text-left">
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
