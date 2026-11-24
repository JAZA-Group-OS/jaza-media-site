import { Clapperboard, Compass, GraduationCap, Handshake, LineChart, Megaphone } from "lucide-react";
import Image from "next/image";

const SERVICES = [
  { label: "Strategy", Icon: Compass },
  { label: "Paid Ads", Icon: Megaphone },
  { label: "Content & Video", Icon: Clapperboard },
  { label: "Sales Systems", Icon: Handshake },
  { label: "Analytics", Icon: LineChart },
  { label: "Training", Icon: GraduationCap },
];

const TEAM = ["Jaza-Sarmiento", "Bela-Capistrano", "Crisia-Manzanilla", "Franco-Villamor", "Sofhia-Caballero"];

function ServiceTile({ label, Icon }: { label: string; Icon: typeof Compass }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-2 py-4 text-center backdrop-blur transition hover:border-gold/40">
      <span className="grid size-9 place-items-center rounded-full bg-gold/15 text-gold ring-1 ring-gold/30">
        <Icon className="size-4" />
      </span>
      <span className="text-[12px] font-medium text-white/85 md:text-[13px]">{label}</span>
    </div>
  );
}

/** "One platform" visual: JAZA at the hub, services around it, the in-house team below. */
export function AboutEcosystem() {
  return (
    <div className="rounded-[32px] bg-gradient-to-br from-gold/50 via-white/10 to-white/[0.04] p-px shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)]">
      <div className="relative overflow-hidden rounded-[31px] bg-[radial-gradient(120%_120%_at_50%_0%,#2a2210_0%,#121212_50%,#0c0c0d_100%)] p-6 md:p-8">
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 size-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/15 blur-[100px]" />
        <div className="relative flex items-center justify-between">
          <span className="text-[10.5px] font-medium tracking-[0.32em] text-white/50">ONE PLATFORM</span>
          <span className="inline-flex items-center gap-2 text-[10.5px] font-medium tracking-[0.2em] text-gold">
            <span aria-hidden className="size-1.5 animate-pulse rounded-full bg-gold" />
            FULLY INTEGRATED
          </span>
        </div>

        <div className="relative mt-6 grid grid-cols-3 gap-3 md:gap-4">
          {SERVICES.slice(0, 3).map((s) => (
            <ServiceTile key={s.label} {...s} />
          ))}
          <div className="col-span-3 flex justify-center py-3">
            <div className="relative grid size-28 place-items-center rounded-full border border-gold/50 bg-ink shadow-[0_0_60px_-10px_rgba(234,179,8,0.6)] md:size-32">
              <span aria-hidden className="absolute -inset-2.5 rounded-full border border-dashed border-gold/25" />
              <span className="flex flex-col items-center leading-none">
                <span className="font-display text-2xl tracking-[0.18em] text-white">JAZA</span>
                <span className="mt-1 pl-[0.35em] text-[9px] font-semibold tracking-[0.35em] text-gold">MEDIA</span>
              </span>
            </div>
          </div>
          {SERVICES.slice(3).map((s) => (
            <ServiceTile key={s.label} {...s} />
          ))}
        </div>

        <div className="relative mt-6 flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex shrink-0 -space-x-3">
            {TEAM.map((n) => (
              <span key={n} className="relative size-9 overflow-hidden rounded-full bg-ink-soft ring-2 ring-ink">
                <Image src={`/about-the-form/${n}.png`} alt="" fill sizes="36px" className="object-cover object-top" />
              </span>
            ))}
          </div>
          <p className="text-[13px] leading-snug text-white/70">
            Run by an in-house team of <span className="text-white">operators</span> — strategy to execution under one roof.
          </p>
        </div>
      </div>
    </div>
  );
}
