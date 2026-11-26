"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { NAV_LINKS } from "@/lib/site-nav";

export function MobileMenu({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  const close = useCallback(() => setOpen(false), []);
  const pathname = usePathname();

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
        className={`text-ink ${className}`}
      >
        <Menu className="size-9" strokeWidth={2.5} />
      </button>

      {/* Portal to <body>: the header pill uses backdrop-blur, which makes it the
          containing block for position:fixed children and squeezed the menu
          into the 56px pill. */}
      {open
        ? createPortal(
            <div
              ref={dialogRef}
              id={panelId}
              className="fixed inset-0 z-[100] flex flex-col overflow-hidden bg-[#0b0d0c] text-white md:hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Site navigation"
            >
              <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 size-[600px] -translate-x-1/2 rounded-full bg-gold/10 blur-[140px]" />
              <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:radial-gradient(white_1px,transparent_1px)] [background-size:4px_4px]" />
              <div className="relative flex items-center justify-between px-6 pt-6 pb-4">
                <Link href="/" onClick={close} aria-label="JAZA Media home" className="flex flex-col items-center leading-none">
                  <span className="font-display text-[28px] tracking-[0.18em]">JAZA</span>
                  <span className="mt-0.5 pl-[0.35em] text-[10px] font-semibold tracking-[0.35em] text-gold">MEDIA</span>
                </Link>
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close menu"
                  className="grid size-11 place-items-center rounded-full border border-white/15 text-white transition hover:border-gold/60"
                >
                  <X className="size-5" strokeWidth={2} />
                </button>
              </div>
              <nav className="relative flex-1 overflow-y-auto px-6 pt-6 pb-8" aria-label="Main">
                <ul>
                  {NAV_LINKS.map((link, i) => {
                    const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
                    return (
                      <li key={link.label} className="animate-about-fade-up" style={{ animationDelay: `${60 + i * 60}ms` }}>
                        <Link
                          href={link.href}
                          onClick={close}
                          className="group flex items-center justify-between border-b border-white/10 py-5"
                        >
                          <span className={`font-serif text-[34px] leading-none ${active ? "text-gold italic" : "text-white"}`}>{link.label}</span>
                          <span className="text-xs tracking-[0.2em] text-white/30">0{i + 1}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
              <div className="relative px-6 pb-8">
                <Link
                  href="/partner-with-us"
                  onClick={close}
                  className="flex w-full items-center justify-center rounded-full bg-gold py-4 text-[12px] font-semibold tracking-[0.16em] text-ink uppercase"
                >
                  Partner With Us
                </Link>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
