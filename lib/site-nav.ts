// Single source of truth for the primary site navigation. Header, mobile
// menu, and footer all consume this list — adding a top-level page only
// requires editing here.

export type NavLink = {
  label: string;
  href: string;
};

export const NAV_LINKS: NavLink[] = [
  { label: "About us", href: "/about-us" },
  { label: "About the Firm", href: "/about-the-firm" },
  { label: "Partner With Us", href: "/partner-with-us" },
  { label: "Careers", href: "/careers" },
  { label: "Support", href: "#" },
];

export function isInternalRoute(href: string): boolean {
  return href.startsWith("/");
}
