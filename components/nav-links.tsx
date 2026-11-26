"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { isInternalRoute, type NavLink } from "@/lib/site-nav";

const BASE = "relative inline-block px-4 py-2 transition-colors hover:text-gold";

export function NavLinks({ links }: { links: NavLink[] }) {
  const pathname = usePathname();
  return (
    <ul className="flex items-center gap-2 text-[15px] text-white/75">
      {links.map((link) => {
        const active =
          isInternalRoute(link.href) && (pathname === link.href || pathname.startsWith(`${link.href}/`));
        const className = `${BASE} ${active ? "font-medium text-white" : ""}`;
        const content = (
          <>
            {link.label}
            {active && (
              <span
                aria-hidden
                className="absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-gold"
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
