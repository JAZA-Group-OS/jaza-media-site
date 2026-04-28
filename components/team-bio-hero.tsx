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
      <div className="mx-auto flex max-w-5xl flex-col-reverse items-center gap-6 px-4 pt-8 md:h-[315px] md:flex-row md:items-center md:gap-12 md:pt-0">
        <div className="relative h-[300px] w-[300px] shrink-0 md:self-end">
          {portrait ? (
            <Image
              src={portrait}
              alt={altText}
              fill
              sizes="240px"
              className={`object-contain object-bottom ${member.mirror ? "-scale-x-100" : ""}`}
              priority
            />
          ) : (
            <span className="sr-only">{altText}</span>
          )}
        </div>
        <div className="flex-1 text-center md:max-w-[280px] md:text-left">
          <h1 className="font-heading text-3xl font-black uppercase leading-[0.95] tracking-tight text-white">
            {displayName}
          </h1>
          <p className="mt-3 font-heading text-lg font-bold uppercase tracking-wide text-brand-black">
            {member.role.split(",").map((part, i, arr) => (
              <span key={i} className="block">
                {part.trim()}
                {i < arr.length - 1 ? "," : ""}
              </span>
            ))}
          </p>
        </div>
      </div>
    </section>
  );
}
