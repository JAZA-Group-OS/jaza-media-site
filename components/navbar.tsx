import Link from "next/link";

import { MobileMenu } from "@/components/mobile-menu";
import { NAV_LINKS, isInternalRoute } from "@/lib/site-nav";

export function Navbar() {
  const links = NAV_LINKS.filter((l) => l.href !== "/partner-with-us");
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/85 text-white backdrop-blur-xl supports-[backdrop-filter]:bg-ink/70">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-6 px-4 md:px-6">
        <Link href="/" aria-label="JAZA Media home" className="flex items-baseline gap-2 leading-none">
          <span className="font-display text-[28px] tracking-[0.18em]">JAZA</span>
          <span className="text-[11px] font-semibold tracking-[0.35em] text-gold">MEDIA</span>
        </Link>
        <nav className="hidden md:block" aria-label="Main">
          <ul className="flex items-center gap-8 text-sm text-white/75">
            {links.map((link) => (
              <li key={link.label}>
                {isInternalRoute(link.href) ? (
                  <Link href={link.href} className="transition-colors hover:text-white">
                    {link.label}
                  </Link>
                ) : (
                  <a href={link.href} className="transition-colors hover:text-white">
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
            className="hidden rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-white md:inline-flex"
          >
            Partner With Us
          </Link>
          <MobileMenu className="md:hidden" />
        </div>
      </div>
    </header>
  );
}
