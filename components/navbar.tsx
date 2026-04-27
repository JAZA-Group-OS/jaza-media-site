const NAV_LINKS = [
  { label: "About us", href: "#" },
  { label: "About the Firm", href: "#" },
  { label: "Partner With Us", href: "#" },
  { label: "Careers", href: "#" },
  { label: "Support", href: "#" },
];

export function Navbar() {
  return (
    <header className="w-full bg-brand-black">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 md:py-6">
        <a
          href="#"
          className="font-display text-3xl tracking-[0.15em] text-white md:text-4xl"
          aria-label="JAZA home"
        >
          JAZA
        </a>
        <nav className="hidden md:block">
          <ul className="flex items-center gap-x-8 text-sm font-medium text-white">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="transition-colors hover:text-brand-yellow"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
