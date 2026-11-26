import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function AnnouncementBanner() {
  return (
    <div className="border-b border-black/10 bg-brand-yellow text-ink">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-2.5 text-center text-xs md:text-sm">
        <span className="rounded-full border border-ink/60 px-2.5 py-0.5 text-[10px] font-semibold tracking-[0.2em] text-ink">
          NEW
        </span>
        <p className="text-ink/80">
          <span className="font-medium text-ink">2026 Scaling Workshop Dates Announced:</span>{" "}
          <Link
            href="/partner-with-us"
            className="group inline-flex items-center gap-1 font-semibold text-ink underline-offset-4 hover:underline"
          >
            Find out if you are a fit
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={2.5} />
          </Link>
        </p>
      </div>
    </div>
  );
}
