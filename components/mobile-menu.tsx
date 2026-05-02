"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { NAV_LINKS } from "@/lib/site-nav";

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
          className="fixed inset-0 z-50 flex flex-col bg-brand-black md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
        >
          <div className="flex items-center justify-between px-4 py-5">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="font-display text-3xl tracking-[0.15em] text-white"
              aria-label="JAZA home"
            >
              JAZA
            </Link>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="text-white"
            >
              <X className="size-9" strokeWidth={2.5} />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto px-4 pb-8">
            <ul className="space-y-3">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block bg-brand-yellow px-[15px] py-5 font-heading text-base font-medium text-brand-black"
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
