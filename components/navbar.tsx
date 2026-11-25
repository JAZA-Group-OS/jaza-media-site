import Link from "next/link";

import { MobileMenu } from "@/components/mobile-menu";
import { NavLinks } from "@/components/nav-links";
import { NAV_LINKS } from "@/lib/site-nav";

export function Navbar() {
  const links = NAV_LINKS.filter((l) => l.href !== "/partner-with-us");
  return (
    <header className="sticky top-0 z-40 bg-ink px-3 py-3 text-white md:px-6">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between gap-4 rounded-full md:w-fit md:gap-8 border border-white/10 bg-white/[0.04] pl-6 pr-2 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-xl md:pl-7">
        <Link href="/" aria-label="JAZA Media home" className="flex flex-col items-center leading-none">
          <span className="font-display text-[28px] tracking-[0.18em]">JAZA</span>
          <span className="mt-0.5 pl-[0.35em] text-[10px] font-semibold tracking-[0.35em] text-gold">MEDIA</span>
        </Link>
        <nav className="hidden md:block" aria-label="Main">
          <NavLinks links={links} />
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/partner-with-us"
            className="cta-breathe hidden rounded-full bg-gold/15 px-4 py-2 text-sm font-medium text-gold transition hover:bg-gold hover:text-ink md:inline-flex"
          >
            Partner With Us
          </Link>
          <MobileMenu className="md:hidden" />
        </div>
      </div>
    </header>
  );
}
