import { ArrowRight } from "lucide-react";

export function AnnouncementBanner() {
  return (
    <div className="w-full bg-brand-yellow">
      <div className="mx-auto flex max-w-7xl items-start gap-x-3 px-4 py-4 text-sm font-medium text-brand-black md:items-center md:py-5 md:text-base">
        <span className="inline-flex shrink-0 items-center rounded-full bg-brand-black px-3 py-1 text-[11px] font-black tracking-widest text-brand-yellow md:text-xs">
          NEW
        </span>
        <p>
          <span className="font-bold">2026 Scaling Workshop dates Announced:</span>{" "}
          <a
            href="#"
            className="inline-flex items-center gap-1.5 font-semibold underline-offset-2 hover:underline"
          >
            Find out if you are a fit
            <ArrowRight className="size-4" strokeWidth={2.5} />
          </a>
        </p>
      </div>
    </div>
  );
}
