import { ArrowUpRight, UserRound } from "lucide-react";
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

function titleCase(s: string) {
  return s
    .toLowerCase()
    .replace(/\b([a-z])/g, (c) => c.toUpperCase())
    .replace(/\bJm\b/, "JM");
}

export function TeamCard({ member }: { member: Member }) {
  const altText = member.name ? `${member.name} — ${member.role}` : "Team member placeholder";
  const roles = member.role.split(",").map((r) => r.trim());

  if (!member.image && member.name) {
    const initials = member.name
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("");
    return (
      <article className="h-full rounded-[28px] bg-gradient-to-b from-gold/35 via-white/10 to-white/[0.03] p-px">
        <div className="relative flex aspect-[4/5] h-full flex-col justify-end overflow-hidden rounded-[27px] bg-[radial-gradient(120%_90%_at_50%_0%,#2a2210_0%,#141414_55%,#0e0e0f_100%)] p-6 md:p-7">
          <span
            aria-hidden
            className="absolute top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-[#fbe7a1] via-gold to-[#a97a1f] bg-clip-text font-serif text-[120px] leading-none tracking-[-0.04em] text-transparent italic opacity-80"
          >
            {initials}
          </span>
          <p className="relative text-[10px] font-medium tracking-[0.28em] text-gold/90 uppercase">{roles[0]}</p>
          <h2 className="relative mt-2 font-serif text-[30px] leading-tight tracking-[-0.02em] text-white">{titleCase(member.name)}</h2>
          <p className="relative mt-1 text-xs tracking-[0.12em] text-white/50">JAZA MEDIA</p>
        </div>
      </article>
    );
  }

  if (!member.image || !member.name) {
    return (
      <article className="h-full rounded-[28px] bg-gradient-to-b from-white/[0.12] to-white/[0.02] p-px">
        <div className="relative flex aspect-[4/5] h-full flex-col items-center justify-center overflow-hidden rounded-[27px] bg-[linear-gradient(160deg,#161616_0%,#0e0e0f_100%)] p-8 text-center">
          <span className="sr-only">{altText}</span>
          <span className="grid size-16 place-items-center rounded-full bg-white/[0.04] text-white/25 ring-1 ring-white/10">
            <UserRound className="size-7" />
          </span>
          <p className="mt-6 text-[10.5px] font-medium tracking-[0.32em] text-gold/80">ANNOUNCING SOON</p>
          <h2 className="mt-3 text-lg font-semibold text-white/90">{titleCase(roles[roles.length - 1])}</h2>
          <p className="mt-1 text-sm text-white/40">{titleCase(roles.slice(0, -1).join(", "))}</p>
        </div>
      </article>
    );
  }

  return (
    <Link
      href={`/team/${member.slug}`}
      className="group block h-full rounded-[28px] bg-gradient-to-b from-gold/45 via-white/10 to-white/[0.03] p-px shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)] transition duration-500 hover:from-gold hover:via-gold/30"
    >
      <article className="relative aspect-[4/5] overflow-hidden rounded-[27px] bg-[#0e0e0f]">
        {/* source PNGs carry a baked black frame + yellow corner bars — scale from the bottom to crop them out */}
        <div className="absolute inset-0 origin-bottom scale-[1.07] transition duration-700 group-hover:scale-[1.11]">
          <Image
            src={member.image}
            alt={altText}
            fill
            sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
            className="object-cover object-top grayscale transition duration-700 group-hover:grayscale-0"
          />
        </div>
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 p-6 md:p-7">
          <p className="text-[10px] font-medium tracking-[0.28em] text-gold/90 uppercase">{roles[0]}</p>
          <h2 className="mt-2 font-serif text-[30px] leading-tight tracking-[-0.02em] text-white">{titleCase(member.name)}</h2>
          <div className="mt-1 flex items-end justify-between gap-4">
            <p className="text-xs tracking-[0.12em] text-white/60">{roles.slice(1).join(", ")}</p>
            <span className="grid size-10 shrink-0 place-items-center rounded-full border border-white/20 bg-black/30 text-white/80 backdrop-blur transition duration-500 group-hover:rotate-45 group-hover:border-gold group-hover:bg-gold group-hover:text-ink">
              <ArrowUpRight className="size-4" />
              <span className="sr-only">About {firstName(member)}</span>
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
