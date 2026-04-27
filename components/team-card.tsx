import Image from "next/image";
import Link from "next/link";

import type { Member } from "@/lib/team";

const ACCENT_BORDER: Record<NonNullable<Member["accent"]>, string> = {
  purple: "border-purple-500",
};

function firstName(member: Member): string {
  if (!member.name) return "Name";
  const trimmed = member.name.trim();
  const space = trimmed.indexOf(" ");
  const first = space === -1 ? trimmed : trimmed.slice(0, space);
  if (first.length <= 2) return first;
  return first.charAt(0) + first.slice(1).toLowerCase();
}

export function TeamCard({ member }: { member: Member }) {
  const borderClass = member.accent
    ? ACCENT_BORDER[member.accent]
    : "border-brand-black";
  const displayName = member.name ?? "NAME";
  const altText = member.name
    ? `${member.name} — ${member.role}`
    : "Team member placeholder";

  return (
    <article className="flex flex-col items-center text-center">
      <div
        className={`relative aspect-square w-full overflow-hidden border-[3px] ${borderClass} bg-neutral-200`}
      >
        {member.image ? (
          <Image
            src={member.image}
            alt={altText}
            fill
            sizes="(min-width: 1024px) 320px, (min-width: 640px) 50vw, 100vw"
            className={`object-cover object-top grayscale ${member.mirror ? "-scale-x-100" : ""}`}
          />
        ) : (
          <span className="sr-only">{altText}</span>
        )}
      </div>
      <div className="h-3 w-full bg-brand-yellow" aria-hidden />

      <h3 className="mt-5 font-heading text-lg font-black uppercase tracking-wide text-brand-yellow md:text-xl">
        {displayName}
      </h3>
      <p className="mt-1 max-w-[20ch] text-xs font-bold uppercase tracking-wide text-brand-black md:text-sm">
        {member.role}
      </p>
      <Link
        href={`/team/${member.slug}`}
        className="mt-4 inline-flex items-center rounded-full bg-brand-yellow px-5 py-2 text-xs font-bold text-brand-black transition-transform hover:scale-[1.02] md:text-sm"
      >
        About {firstName(member)}
      </Link>
    </article>
  );
}
