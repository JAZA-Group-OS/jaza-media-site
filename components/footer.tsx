import { ArrowRight, ChevronDown } from "lucide-react";
import Link from "next/link";

import { NAV_LINKS, isInternalRoute } from "@/lib/site-nav";
import { PUBLISHED_SOCIAL_LINKS } from "@/components/social-icons";

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-ink text-white">
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 size-[640px] -translate-x-1/2 rounded-full bg-gold/10 blur-[140px]" />

      <div className="relative mx-auto max-w-7xl px-4 md:px-6">
        {/* closing CTA */}
        <div className="flex flex-col items-start justify-between gap-8 border-b border-white/10 py-16 md:flex-row md:items-end md:py-20">
          <div>
            <p className="text-[10.5px] font-medium tracking-[0.32em] text-gold/90">READY WHEN YOU ARE</p>
            <h2 className="mt-4 max-w-xl font-serif text-4xl leading-[1.05] tracking-[-0.02em] md:text-[56px]">
              Let&apos;s <em className="bg-gradient-to-br from-[#fbe7a1] via-gold to-[#a97a1f] bg-clip-text pr-1 text-transparent">scale</em>{" "}what you&apos;ve built.
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/partner-with-us"
              className="group inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3.5 text-[13px] font-semibold tracking-[0.1em] text-ink shadow-[0_10px_40px_-10px_rgba(234,179,8,0.55)] transition hover:bg-white"
            >
              PARTNER WITH US
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/support"
              className="inline-flex items-center rounded-full border border-white/15 bg-white/[0.03] px-7 py-3.5 text-[13px] font-medium tracking-[0.1em] text-white/85 transition hover:border-white/40 hover:text-white"
            >
              CONTACT US
            </Link>
          </div>
        </div>

        {/* brand + links */}
        <div className="flex flex-col justify-between gap-10 py-12 md:flex-row md:items-start">
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
