import Link from "next/link";

import { MobileMenu } from "@/components/mobile-menu";

const NAV_LINKS = [
  { label: "About us", href: "#" },
  { label: "About the Firm", href: "/about-the-firm" },
  { label: "Partner With Us", href: "/partner-with-us" },
  { label: "Careers", href: "#" },
  { label: "Support", href: "#" },
];

function isInternalRoute(href: string): boolean {
  return href.startsWith("/");
}

export function Navbar() {
  return (
    <header className="w-full bg-brand-black">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 md:py-6">
        <Link
          href="/"
          className="flex flex-col items-center leading-none"
          aria-label="JAZA Media home"
        >
          <span className="font-display text-3xl tracking-[0.15em] text-white md:text-4xl">
            JAZA
          </span>
          <span className="font-montserrat mt-0.5 text-xs font-bold tracking-[0.2em] text-brand-yellow">
            MEDIA
          </span>
        </Link>
        <nav className="hidden md:block">
          <ul className="flex items-center gap-x-8 text-sm font-medium text-white">
            {NAV_LINKS.map((link) =>
              isInternalRoute(link.href) ? (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="transition-colors hover:text-brand-yellow"
                  >
                    {link.label}
                  </Link>
                </li>
              ) : (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="transition-colors hover:text-brand-yellow"
                  >
                    {link.label}
                  </a>
                </li>
              )
            )}
          </ul>
        </nav>
        <MobileMenu className="md:hidden" />
      </div>
    </header>
  );
}
