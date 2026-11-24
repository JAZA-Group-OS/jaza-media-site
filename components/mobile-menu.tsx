"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import { NAV_LINKS } from "@/lib/site-nav";

export function MobileMenu({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  const close = useCallback(() => setOpen(false), []);

  // Auto-close when the viewport grows past the mobile breakpoint. The overlay
  // is hidden by `md:hidden` CSS only, so without this the menu state — and
  // the body scroll-lock below — would leak with no visible way to unlock.
  // (The menu can only be opened from the md:hidden trigger, so it's never
  // already open above the breakpoint; the resize `change` event is the only
  // path that matters here.)
  useEffect(() => {
    if (!open) return;
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) setOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [open]);

  // Lock body scroll while the menu is open so the page behind doesn't scroll.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Focus management: move focus into the dialog on open, trap Tab inside it,
  // close on Escape, and restore focus to the trigger on close.
  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    if (!dialog) return;

    const trigger = triggerRef.current;

    const getFocusable = () =>
      Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );

    // Move focus into the dialog so keyboard/screen-reader users start inside it.
    getFocusable()[0]?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        return;
      }
      if (e.key !== "Tab") return;
      const focusable = getFocusable();
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const activeEl = document.activeElement;
      if (e.shiftKey) {
        if (activeEl === first || !dialog.contains(activeEl)) {
          e.preventDefault();
          last.focus();
        }
      } else if (activeEl === last || !dialog.contains(activeEl)) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      // Restore focus to the trigger so keyboard users aren't dropped at the
      // top of the document.
      trigger?.focus();
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        className={`text-white ${className}`}
      >
        <Menu className="size-9" strokeWidth={2.5} />
      </button>

      {open ? (
        <div
          ref={dialogRef}
          id={panelId}
          className="fixed inset-0 z-50 flex flex-col bg-ink md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
        >
          <div className="flex items-center justify-between px-4 py-5">
            <Link
              href="/"
              onClick={close}
              className="font-display text-3xl tracking-[0.15em] text-white"
              aria-label="JAZA home"
            >
              JAZA
            </Link>
            <button
              type="button"
              onClick={close}
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
                    onClick={close}
                    className="block border-b border-white/10 py-5 font-serif text-3xl text-white"
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
