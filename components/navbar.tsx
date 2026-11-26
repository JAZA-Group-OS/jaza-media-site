import Link from "next/link";

import { MobileMenu } from "@/components/mobile-menu";
import { NavLinks } from "@/components/nav-links";
import { NAV_LINKS } from "@/lib/site-nav";

export function Navbar() {
  const links = NAV_LINKS.filter((l) => l.href !== "/partner-with-us");
  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-white text-ink shadow-[0_1px_0_rgba(0,0,0,0.02)]">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-5 md:px-10">
        <Link href="/" aria-label="JAZA Media home" className="flex flex-col items-center leading-none">
          <span className="font-display text-[28px] tracking-[0.18em] text-ink">JAZA</span>
          <span className="mt-0.5 pl-[0.35em] text-[10px] font-semibold tracking-[0.35em] text-gold-deep">MEDIA</span>
        </Link>
        <nav className="hidden md:block" aria-label="Main">
          <NavLinks links={links} />
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/support"
            className="hidden rounded-full border border-ink px-5 py-2 text-sm font-medium text-ink shadow-[0_2px_6px_rgba(0,0,0,0.12)] transition hover:bg-ink hover:text-white md:inline-flex"
          >
            Book a call
          </Link>
          <Link
            href="/partner-with-us"
            className="hidden rounded-full bg-gold px-5 py-2 text-sm font-semibold text-ink shadow-[0_2px_8px_rgba(0,0,0,0.18)] transition hover:bg-ink hover:text-white md:inline-flex"
          >
            Partner With Us
          </Link>
          <MobileMenu className="md:hidden" />
        </div>
      </div>
    </header>
  );
}
