import Link from "next/link";

import { MobileMenu } from "@/components/mobile-menu";
import { NAV_LINKS, isInternalRoute } from "@/lib/site-nav";
import { SOCIAL_LINKS } from '@/components/social-icons';

export function Footer() {
  return (
    <footer className="bg-brand-black pt-12 pb-10 text-white">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between gap-6 md:flex-row">
          <Link
            href="/"
            className="flex flex-col items-center leading-none"
            aria-label="JAZA Media home"
          >
            <span className="font-display text-3xl tracking-[0.15em] text-white md:text-4xl">
              JAZA
            </span>
            <span className="-mt-1 font-heading text-xs font-bold tracking-[0.2em] text-brand-yellow">
              MEDIA
            </span>
          </Link>
          <nav className="hidden md:block">
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium">
              {NAV_LINKS.map((link) =>
                isInternalRoute(link.href) ? (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="transition-colors hover:text-brand-yellow"
                    >
                      {link.label}
                    </Link>
                  </li>
                ) : (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="transition-colors hover:text-brand-yellow"
                    >
                      {link.label}
                    </a>
                  </li>
                ),
              )}
            </ul>
          </nav>
          <MobileMenu className="md:hidden" />
        </div>

        <p className="mt-8 text-[11px] leading-relaxed text-text-muted md:text-xs">
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

        <div className="mt-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/partner-with-us"
              className="inline-flex items-center justify-center rounded-full bg-brand-yellow px-6 py-2.5 font-heading text-sm font-bold text-brand-black transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-brand-black"
            >
              Partner With Us
            </Link>
            <Link
              href="/support"
              className="inline-flex items-center justify-center rounded-full border border-brand-yellow/60 px-6 py-2.5 font-heading text-sm font-bold text-brand-yellow transition-colors hover:bg-brand-yellow hover:text-brand-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-brand-black"
            >
              Contact Us
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {SOCIAL_LINKS.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white transition-colors hover:text-brand-yellow"
              >
                <Icon className="size-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
