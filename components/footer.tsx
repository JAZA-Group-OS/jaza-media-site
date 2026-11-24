import { ChevronDown } from "lucide-react";
import Link from "next/link";

import { NAV_LINKS, isInternalRoute } from "@/lib/site-nav";
import { PUBLISHED_SOCIAL_LINKS } from "@/components/social-icons";

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-ink text-white">
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 size-[640px] -translate-x-1/2 rounded-full bg-gold/10 blur-[140px]" />

      <div className="relative mx-auto max-w-[1600px] px-4 md:px-10">
        {/* brand + links + socials — one compact row */}
        <div className="flex flex-col items-center gap-6 py-8 text-center lg:flex-row lg:justify-between lg:gap-10 lg:text-left">
          <div className="flex flex-col items-center gap-4 lg:flex-row lg:gap-6">
            <Link href="/" aria-label="JAZA Media home" className="inline-flex flex-col items-center leading-none">
              <span className="font-display text-2xl tracking-[0.18em] text-white">JAZA</span>
              <span className="mt-1 pl-[0.35em] text-[9px] font-semibold tracking-[0.35em] text-gold">MEDIA</span>
            </Link>
            <span aria-hidden className="hidden h-8 w-px bg-white/10 lg:block" />
            <p className="max-w-xs text-[13px] leading-snug text-white/50">
              Marketing, advertising &amp; business scaling — built by operators, for operators.
            </p>
          </div>

          <nav aria-label="Footer">
            <ul className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-sm text-white/70">
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

          <div className="flex items-center gap-2">
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

        {/* legal disclaimer — kept in full, collapsed by default */}
        <details className="group border-t border-white/10 py-3 text-white/40">
          <summary className="flex cursor-pointer list-none items-center gap-2 text-xs tracking-wide transition hover:text-white/70 [&::-webkit-details-marker]:hidden">
            Earnings disclaimer
            <ChevronDown className="size-3.5 transition-transform group-open:rotate-180" />
          </summary>
          <p className="mt-3 text-[11px] leading-relaxed">
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
