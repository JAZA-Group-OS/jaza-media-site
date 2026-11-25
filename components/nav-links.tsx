"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { isInternalRoute, type NavLink } from "@/lib/site-nav";

const BASE = "relative rounded-full px-3.5 py-1.5 transition-colors hover:bg-white/[0.06] hover:text-white";

export function NavLinks({ links }: { links: NavLink[] }) {
  const pathname = usePathname();
  return (
    <ul className="flex items-center gap-1 text-sm text-white/80">
      {links.map((link) => {
        const active =
          isInternalRoute(link.href) && (pathname === link.href || pathname.startsWith(`${link.href}/`));
        const className = `${BASE} ${active ? "text-white" : ""}`;
        const content = (
          <>
            {link.label}
            {active && (
              <span
                aria-hidden
                className="absolute -bottom-1 left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-gold shadow-[0_0_8px_2px_rgba(255,202,38,0.55)]"
              />
            )}
          </>
        );
        return (
          <li key={link.label}>
            {isInternalRoute(link.href) ? (
              <Link href={link.href} className={className} aria-current={active ? "page" : undefined}>
                {content}
              </Link>
            ) : (
              <a href={link.href} className={className}>
                {content}
              </a>
            )}
          </li>
        );
      })}
    </ul>
  );
}
