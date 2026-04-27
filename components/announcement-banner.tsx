import { ArrowRight } from "lucide-react";

export function AnnouncementBanner() {
  return (
    <div className="w-full bg-brand-yellow">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-4 text-sm font-medium text-brand-black md:py-5 md:text-base">
        <span className="inline-flex items-center rounded-full bg-brand-black px-3 py-1 text-[11px] font-black tracking-widest text-brand-yellow md:text-xs">
          NEW
        </span>
        <p className="text-center">
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
