"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const NAV_LINKS = [
  { label: "About us", href: "/about-us" },
  { label: "About the Firm", href: "/about-the-firm" },
  { label: "Partner With Us", href: "/partner-with-us" },
  { label: "Careers", href: "/careers" },
  { label: "Support", href: "#" },
];

export function MobileMenu({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState(false);

  // Lock body scroll while the menu is open so the page behind doesn't scroll
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className={`text-white ${className}`}
      >
        <Menu className="size-9" strokeWidth={2.5} />
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-brand-black xl:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
        >
          <div className="flex items-center justify-end px-4 py-5">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="text-white"
            >
              <X className="size-9" strokeWidth={2.5} />
            </button>
          </div>
          <nav className="flex-1 overflow-x-hidden overflow-y-auto px-3 pb-8">
            <ul className="w-full space-y-3">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block bg-brand-yellow px-4 py-5 font-heading text-base font-medium text-brand-black"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      ) : null}
    </>
  );
}
