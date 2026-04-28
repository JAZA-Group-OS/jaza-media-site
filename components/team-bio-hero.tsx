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
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-end gap-8 px-4 pt-12 md:grid-cols-[1fr_1.3fr] md:items-center md:gap-12 md:pt-20">
        <div className="relative aspect-square w-full max-w-md">
          {portrait ? (
            <Image
              src={portrait}
              alt={altText}
              fill
              sizes="(min-width: 768px) 480px, 100vw"
              className={`object-contain ${member.mirror ? "-scale-x-100" : ""}`}
              priority
            />
          ) : (
            <span className="sr-only">{altText}</span>
          )}
        </div>
        <div className="pb-8 md:pb-0">
          <h1 className="font-heading text-5xl font-black uppercase leading-[0.95] tracking-tight text-brand-black md:text-7xl lg:text-8xl">
            {displayName}
          </h1>
          <p className="mt-4 font-heading text-base font-bold uppercase tracking-wide text-brand-black md:text-xl">
            {member.role}
          </p>
        </div>
      </div>
    </section>
  );
}
