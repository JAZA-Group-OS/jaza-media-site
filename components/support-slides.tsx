"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Children, useCallback, useEffect, useRef, useState, type ReactNode } from "react";

const LABELS = ["Support", "FAQs", "Contact"];
const IDS = ["top", "faqs", "contact"];
const COOLDOWN_MS = 900;

/**
 * Horizontal slide deck for /support: one screen at a time, no page scroll.
 * The next slide comes in from the right (previous from the left).
 * Navigate with the dot pager, the arrows, ←/→ keys, mouse wheel / trackpad,
 * swipe, or any in-page link to #top / #faqs / #contact.
 */
export function SupportSlides({ children }: { children: ReactNode }) {
  const slides = Children.toArray(children);
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const lock = useRef(0);
  const panes = useRef<(HTMLDivElement | null)[]>([]);
  const touch = useRef<{ x: number; y: number } | null>(null);

  const go = useCallback(
    (next: number) => {
      const n = Math.max(0, Math.min(slides.length - 1, next));
      setIndex((cur) => {
        if (n === cur) return cur;
        setDir(n > cur ? 1 : -1);
        lock.current = Date.now();
        return n;
      });
    },
    [slides.length],
  );

  // Open the slide named in the URL hash (e.g. /support#contact).
  useEffect(() => {
    const i = IDS.indexOf(window.location.hash.slice(1));
    if (i > 0) queueMicrotask(() => go(i));
  }, [go]);

  // Keyboard.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (e.key === "ArrowRight" || e.key === "PageDown") go(index + 1);
      else if (e.key === "ArrowLeft" || e.key === "PageUp") go(index - 1);
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, index]);

  // A slide whose own content still has room to scroll keeps the wheel/swipe.
  const canScrollInside = (delta: number) => {
    const el = panes.current[index];
    if (!el || el.scrollHeight <= el.clientHeight + 2) return false;
    return delta > 0 ? el.scrollTop + el.clientHeight < el.scrollHeight - 2 : el.scrollTop > 2;
  };

  function onWheel(e: React.WheelEvent) {
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(delta) < 25 || Date.now() - lock.current < COOLDOWN_MS) return;
    if (canScrollInside(delta)) return;
    go(index + (delta > 0 ? 1 : -1));
  }

  function onTouchEnd(e: React.TouchEvent) {
    const start = touch.current;
    touch.current = null;
    if (!start) return;
    const dx = e.changedTouches[0].clientX - start.x;
    const dy = e.changedTouches[0].clientY - start.y;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.3) go(index + (dx < 0 ? 1 : -1));
  }

  // In-page links (#top / #faqs / #contact) switch slides instead of scrolling.
  function onClick(e: React.MouseEvent) {
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
    if (!a) return;
    const i = IDS.indexOf(a.getAttribute("href")!.slice(1));
    if (i < 0) return;
    e.preventDefault();
    go(i);
  }

  return (
    <div
      className="relative h-full w-full overflow-hidden bg-[#0b0d0c]"
      onWheel={onWheel}
      onTouchStart={(e) => (touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY })}
      onTouchEnd={onTouchEnd}
      onClick={onClick}
      aria-roledescription="carousel"
    >
      {slides.map((slide, i) => {
        const offset = i === index ? "translate-x-0 opacity-100" : i < index ? "-translate-x-full opacity-0" : "translate-x-full opacity-0";
        return (
          <div
            key={i}
            ref={(el) => {
              panes.current[i] = el;
            }}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${slides.length}: ${LABELS[i] ?? ""}`}
            aria-hidden={i !== index}
            inert={i !== index}
            data-dir={dir}
            className={`absolute inset-0 overflow-x-hidden overflow-y-auto transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${offset}`}
          >
            {slide}
          </div>
        );
      })}

      {/* pager */}
      <nav
        aria-label="Support slides"
        className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-black/50 px-2 py-1.5 backdrop-blur md:bottom-7"
      >
        <button
          type="button"
          aria-label="Previous slide"
          disabled={index === 0}
          onClick={() => go(index - 1)}
          className="grid size-9 place-items-center rounded-full text-white/70 transition hover:text-gold disabled:opacity-25"
        >
          <ChevronLeft className="size-4" />
        </button>
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to ${LABELS[i] ?? `slide ${i + 1}`}`}
            aria-current={i === index ? "true" : undefined}
            onClick={() => go(i)}
            className="group grid h-9 place-items-center px-1.5"
          >
            <span
              className={`block h-2.5 rounded-full transition-all duration-500 ${
                i === index ? "w-8 bg-gold shadow-[0_0_14px_2px_rgba(234,179,8,0.5)]" : "w-2.5 bg-white/30 group-hover:bg-gold/70"
              }`}
            />
          </button>
        ))}
        <button
          type="button"
          aria-label="Next slide"
          disabled={index === slides.length - 1}
          onClick={() => go(index + 1)}
          className="grid size-9 place-items-center rounded-full text-white/70 transition hover:text-gold disabled:opacity-25"
        >
          <ChevronRight className="size-4" />
        </button>
      </nav>
    </div>
  );
}
