import Link from "next/link";

import { MobileMenu } from "@/components/mobile-menu";
import { NavLinks } from "@/components/nav-links";
import { NAV_LINKS } from "@/lib/site-nav";

export function Navbar({ centered = false }: { centered?: boolean }) {
  const links = NAV_LINKS.filter((l) => l.href !== "/partner-with-us");
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink text-white">
      <div className="relative flex h-[72px] w-full items-center justify-between gap-4 px-5 md:px-10">
        <Link
          href="/"
          aria-label="JAZA Media home"
          className="ml-2 flex flex-col items-center leading-none md:ml-8"
        >
          <span className="font-display text-[28px] tracking-[0.18em] text-white">
            JAZA
          </span>
          <span className="mt-0.5 pl-[0.35em] text-[10px] font-semibold tracking-[0.35em] text-gold">
            MEDIA
          </span>
        </Link>
        {centered ? (
          <div className="absolute left-1/2 hidden -translate-x-1/2 md:block">
            <Link
              href="/book-a-call"
              className="inline-flex rounded-full border border-white/70 px-5 py-2 text-sm font-medium text-white transition hover:bg-white hover:text-ink"
            >
              Book a call
            </Link>
          </div>
        ) : (
          <nav className="hidden md:block" aria-label="Main">
            <NavLinks links={links} />
          </nav>
        )}
        <div className="flex items-center gap-3">
          {!centered ? (
            <Link
              href="/book-a-call"
              className="hidden rounded-full border border-white/70 px-5 py-2 text-sm font-medium text-white transition hover:bg-white hover:text-ink md:inline-flex"
            >
              Book a call
            </Link>
          ) : null}
          <Link
            href="/partner-with-us"
            className="hidden rounded-full bg-gold px-5 py-2 text-sm font-semibold text-ink transition hover:bg-white hover:text-ink md:inline-flex"
          >
            Partner With Us
          </Link>
          <MobileMenu className="md:hidden" />
        </div>
      </div>
    </header>
  );
}
