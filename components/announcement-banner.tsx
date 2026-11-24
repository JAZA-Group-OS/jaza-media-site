import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function AnnouncementBanner() {
  return (
    <div className="border-b border-white/10 bg-ink text-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-2.5 text-center text-xs md:text-sm">
        <span className="rounded-full border border-gold/50 px-2.5 py-0.5 text-[10px] font-semibold tracking-[0.2em] text-gold">
          NEW
        </span>
        <p className="text-white/80">
          <span className="font-medium text-white">2026 Scaling Workshop Dates Announced:</span>{" "}
          <Link
            href="/partner-with-us"
            className="group inline-flex items-center gap-1 text-gold underline-offset-4 hover:underline"
          >
            Find out if you are a fit
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={2.5} />
          </Link>
        </p>
      </div>
    </div>
  );
}
