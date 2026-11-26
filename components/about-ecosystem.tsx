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

/** "One platform" panel: the services JAZA Media runs under one roof, and the in-house team. */
export function AboutEcosystem() {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-[0_24px_60px_-40px_rgba(0,0,0,0.35)] md:p-8">
      <div className="flex items-center justify-between border-b border-black/10 pb-4">
        <span className="font-display text-xl tracking-[0.16em] text-ink">
          JAZA <span className="text-[11px] font-semibold tracking-[0.3em] text-gold-deep">MEDIA</span>
        </span>
        <span className="text-[11px] font-semibold tracking-[0.2em] text-ink/50">ONE PLATFORM</span>
      </div>

      <ul className="mt-2 grid grid-cols-2 sm:grid-cols-3">
        {SERVICES.map(({ label, Icon }) => (
          <li key={label} className="flex items-center gap-3 px-1 py-4">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#FFF6D9] text-gold-deep">
              <Icon className="size-4" />
            </span>
            <span className="text-[14px] font-medium text-ink/85">{label}</span>
          </li>
        ))}
      </ul>

      <div className="mt-2 flex items-center gap-4 rounded-xl bg-[#FAF9F6] p-4">
        <div className="flex shrink-0 -space-x-2.5">
          {TEAM.map((n) => (
            <span key={n} className="relative size-9 overflow-hidden rounded-full bg-[#EDEAE3] ring-2 ring-white">
              <Image src={`/about-the-form/${n}.png`} alt="" fill sizes="36px" className="object-cover object-top" />
            </span>
          ))}
        </div>
        <p className="text-[13px] leading-snug text-ink/65">
          Run by an in-house team of operators — strategy to execution under one roof.
        </p>
      </div>
    </div>
  );
}
