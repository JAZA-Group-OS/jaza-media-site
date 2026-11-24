import { ChevronDown } from "lucide-react";
import Link from "next/link";

import { NAV_LINKS, isInternalRoute } from "@/lib/site-nav";
import { PUBLISHED_SOCIAL_LINKS } from "@/components/social-icons";

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-ink text-white">
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 size-[640px] -translate-x-1/2 rounded-full bg-gold/10 blur-[140px]" />

      <div className="relative mx-auto max-w-7xl px-4 md:px-6">
        {/* brand + links */}
        <div className="flex flex-col justify-between gap-10 py-14 md:flex-row md:items-start">
          <div className="max-w-xs">
            <Link href="/" aria-label="JAZA Media home" className="inline-flex flex-col items-center leading-none">
              <span className="font-display text-3xl tracking-[0.18em] text-white">JAZA</span>
              <span className="mt-1 pl-[0.35em] text-[10px] font-semibold tracking-[0.35em] text-gold">MEDIA</span>
            </Link>
            <p className="mt-5 text-sm leading-relaxed text-white/50">
              Marketing, advertising &amp; business scaling — built by operators, for operators.
            </p>
            <div className="mt-6 flex items-center gap-2">
              {PUBLISHED_SOCIAL_LINKS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid size-9 place-items-center rounded-full border border-white/10 text-white/70 transition hover:border-gold/60 hover:text-gold"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          <nav aria-label="Footer">
            <p className="text-[10.5px] font-medium tracking-[0.28em] text-white/40">EXPLORE</p>
            <ul className="mt-4 grid grid-cols-2 gap-x-12 gap-y-3 text-sm text-white/70">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  {isInternalRoute(link.href) ? (
                    <Link href={link.href} className="transition-colors hover:text-gold">{link.label}</Link>
                  ) : (
                    <a href={link.href} className="transition-colors hover:text-gold">{link.label}</a>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* legal disclaimer — kept in full, collapsed by default */}
        <details className="group border-t border-white/10 py-5 text-white/40">
          <summary className="flex cursor-pointer list-none items-center gap-2 text-xs tracking-wide transition hover:text-white/70 [&::-webkit-details-marker]:hidden">
            Earnings disclaimer
            <ChevronDown className="size-3.5 transition-transform group-open:rotate-180" />
          </summary>
          <p className="mt-3 max-w-4xl text-[11px] leading-relaxed">
          Jaza and Bela&apos;s results are not typical and are not a guarantee of your
          success. Jaza and Bela are experienced business owners and investors, and
          your results will vary depending on education, effort, application,
          experience, and background. Jaza and Bela do not personally invest in every
          business they work with through JAZA Media. Due to the sensitivity of
          financial information, we do not know or track the typical results of our
          students. We cannot guarantee that you will make money or that you will be
          successful if you employ their business strategies specifically or
          generally. Consequently, your results may significantly vary from theirs.
          We do not give investment, tax, or other professional advice. Specific
          transactions and experiences are mentioned for informational purposes only.
          The information contained within this website is the property of JAZA
          Media. Any use of the images, content, or ideas expressed herein without
          the express written consent of JAZA Media is prohibited.
        </p>
        </details>
      </div>
    </footer>
  );
}
