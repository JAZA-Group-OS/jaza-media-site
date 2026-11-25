"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

// Site-wide dot scroll indicator that replaces the browser scrollbar.
// Sections are discovered automatically: every top-level <section> on the page.
// Label = data-dot-label, aria-label, or the section's first heading.

type Dot = { el: HTMLElement; label: string };

function discover(): Dot[] {
  const root = document.querySelector("main") ?? document.body;
  return Array.from(root.querySelectorAll<HTMLElement>("section"))
    .filter((s) => !s.parentElement?.closest("section") && s.offsetHeight > 160)
    .map((el) => {
      const h = el.querySelector("h1, h2");
      const raw = el.dataset.dotLabel ?? el.getAttribute("aria-label") ?? h?.textContent ?? "";
      const label = raw.replace(/\s+/g, " ").trim();
      return { el, label: label.length > 28 ? `${label.slice(0, 26)}…` : label };
    });
}

export function SiteScrollDots() {
  const pathname = usePathname();
  const [dots, setDots] = useState<Dot[]>([]);
  const [active, setActive] = useState(0);
  // /support has its own slide pager (components/support-slides.tsx).
  const hidden = pathname.startsWith("/admin") || pathname === "/support";
  // Support page: dots sit as a horizontal pager in the empty space at the bottom of the screen.
  const row = pathname === "/support";

  useEffect(() => {
    if (hidden) return;
    const html = document.documentElement;
    html.classList.add("dots-scroll");
    let list: Dot[] = [];
    const scan = () => {
      list = discover();
      setDots(list);
      onScroll();
    };
    const onScroll = () => {
      const mid = window.innerHeight * 0.45;
      let a = 0;
      list.forEach((d, i) => {
        if (d.el.getBoundingClientRect().top <= mid) a = i;
      });
      setActive(a);
    };
    scan();
    const late = setTimeout(scan, 800); // content that renders after mount
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", scan);
    return () => {
      clearTimeout(late);
      html.classList.remove("dots-scroll");
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", scan);
    };
  }, [pathname, hidden]);

  if (hidden || dots.length < 2) return null;

  return (
    <nav
      aria-label="Page sections"
      className={
        row
          ? "fixed bottom-8 left-1/2 z-40 hidden -translate-x-1/2 flex-row items-center gap-5 rounded-full border border-white/10 bg-black/40 px-5 py-3 backdrop-blur md:flex"
          : "fixed top-1/2 right-3 z-40 hidden -translate-y-1/2 flex-col items-end gap-4 md:flex lg:right-6"
      }
    >
      {dots.map((d, i) => (
        <button
          key={i}
          type="button"
          onClick={() => d.el.scrollIntoView({ behavior: "smooth", block: "start" })}
          aria-label={d.label || `Section ${i + 1}`}
          aria-current={i === active ? "true" : undefined}
          className={`group relative flex items-center gap-3 py-0.5 ${row ? "flex-col" : ""}`}
        >
          {d.label && (
            <span className={`pointer-events-none ${row ? "absolute bottom-full mb-3 whitespace-nowrap" : ""} rounded-full border border-white/10 bg-black/70 px-2.5 py-1 text-[10px] tracking-[0.2em] text-white/80 uppercase opacity-0 backdrop-blur transition group-hover:opacity-100`}>
              {d.label}
            </span>
          )}
          <span
            className={`block rounded-full ring-1 ring-black/30 transition-all duration-500 ${
              i === active
                ? "size-3.5 bg-gold shadow-[0_0_14px_3px_rgba(234,179,8,0.55)]"
                : "size-2.5 bg-neutral-400/50 group-hover:bg-gold/70"
            }`}
          />
        </button>
      ))}
    </nav>
  );
}
