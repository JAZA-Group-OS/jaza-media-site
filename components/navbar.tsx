import Link from "next/link";

import { MobileMenu } from "@/components/mobile-menu";
import { NAV_LINKS, isInternalRoute } from "@/lib/site-nav";

export function Navbar() {
  const links = NAV_LINKS.filter((l) => l.href !== "/partner-with-us");
  return (
    <header className="sticky top-0 z-40 bg-ink px-3 py-3 text-white md:px-6">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 rounded-full border border-white/10 bg-white/[0.04] pl-6 pr-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-xl md:pl-8">
        <Link href="/" aria-label="JAZA Media home" className="flex items-baseline gap-2 leading-none">
          <span className="font-display text-[28px] tracking-[0.18em]">JAZA</span>
          <span className="text-[11px] font-semibold tracking-[0.35em] text-gold">MEDIA</span>
        </Link>
        <nav className="hidden md:block" aria-label="Main">
          <ul className="flex items-center gap-1 text-sm text-white/80">
            {links.map((link) => (
              <li key={link.label}>
                {isInternalRoute(link.href) ? (
                  <Link href={link.href} className="rounded-full px-4 py-2 transition-colors hover:bg-white/[0.06] hover:text-white">
                    {link.label}
                  </Link>
                ) : (
                  <a href={link.href} className="rounded-full px-4 py-2 transition-colors hover:bg-white/[0.06] hover:text-white">
                    {link.label}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/partner-with-us"
            className="hidden rounded-full bg-gold/15 px-5 py-2.5 text-sm font-medium text-gold transition hover:bg-gold hover:text-ink md:inline-flex"
          >
            Partner With Us
          </Link>
          <MobileMenu className="md:hidden" />
        </div>
      </div>
    </header>
  );
}
