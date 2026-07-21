import Image from "next/image";
import Link from "next/link";

import type { Member } from "@/lib/team";

function firstName(member: Member): string {
  if (!member.name) return "Name";
  const trimmed = member.name.trim();
  const space = trimmed.indexOf(" ");
  const first = space === -1 ? trimmed : trimmed.slice(0, space);
  if (first.length <= 2) return first;
  return first.charAt(0) + first.slice(1).toLowerCase();
}

export function TeamCard({ member }: { member: Member }) {
  const displayName = member.name ?? "NAME";
  const altText = member.name
    ? `${member.name} — ${member.role}`
    : "Team member placeholder";

  return (
    <article className="flex flex-col items-center text-center">
      {member.image ? (
        <div className="relative aspect-square w-full max-w-[250px] md:max-w-none">
          <Image
            src={member.image}
            alt={altText}
            fill
            sizes="(min-width: 1024px) 320px, (min-width: 640px) 50vw, 250px"
            className="object-contain"
          />
        </div>
      ) : (
        <div className="relative flex aspect-square w-full max-w-[250px] flex-col border-x-[10px] border-t-[10px] border-brand-black md:max-w-none">
          <span className="sr-only">{altText}</span>
          <div className="flex-1 bg-neutral-200" aria-hidden />
          <div className="h-[40px] w-full bg-brand-yellow" aria-hidden />
        </div>
      )}

      {/* h2: member cards sit directly under the TeamGrid h1, so h3 skipped a
          level. Each card is a top-level subsection of the leadership grid. */}
      <h2 className="mt-5 font-heading text-xl font-black uppercase tracking-wide text-brand-yellow md:text-2xl">
        {displayName}
      </h2>
      <p className="mt-1 text-base font-bold uppercase tracking-wide text-brand-black md:text-lg">
        {member.role.split(",").map((part, i, arr) => (
          <span key={i} className="block">
            {part.trim()}
            {i < arr.length - 1 ? "," : ""}
          </span>
        ))}
      </p>
      <Link
        href={`/team/${member.slug}`}
        className="mt-4 inline-flex items-center rounded-full bg-brand-yellow px-5 py-2 text-sm font-bold text-brand-black transition-transform hover:scale-[1.02] md:text-base"
      >
        About {firstName(member)}
      </Link>
    </article>
  );
}
