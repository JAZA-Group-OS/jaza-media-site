import { MobileMenu } from "@/components/mobile-menu";

const FOOTER_LINKS = [
  { label: "About us", href: "#" },
  { label: "About the Firm", href: "#" },
  { label: "Partner With Us", href: "/partner-with-us" },
  { label: "Careers", href: "#" },
  { label: "Support", href: "#" },
];

function GmailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M22 4H2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h20a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 4.24-10 6.25L2 8.24V6l10 6.25L22 6v2.24Z" />
    </svg>
  );
}

function MessengerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C6.5 2 2 6.14 2 11.22c0 2.89 1.46 5.48 3.75 7.18V22l3.42-1.88c.91.25 1.87.39 2.83.39 5.5 0 10-4.14 10-9.28S17.5 2 12 2Zm1.03 12.52-2.56-2.73-4.99 2.73 5.49-5.83 2.6 2.73 4.94-2.73-5.48 5.83Z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.12 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.79-4.68 4.53-4.68 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.88v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07Z" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.1Z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85 0 3.2-.01 3.58-.07 4.85-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07-3.2 0-3.58-.01-4.85-.07-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.64-.07-4.85 0-3.2.01-3.58.07-4.85C2.38 3.92 3.9 2.39 7.15 2.23 8.42 2.18 8.8 2.16 12 2.16ZM12 0C8.74 0 8.33.01 7.05.07c-4.35.2-6.78 2.62-6.98 6.98C.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.62 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.2-4.35-2.62-6.78-6.98-6.98C15.67.01 15.26 0 12 0Zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.41-11.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88Z" />
    </svg>
  );
}

const SOCIALS = [
  { label: "Gmail", href: "#", Icon: GmailIcon },
  { label: "Messenger", href: "#", Icon: MessengerIcon },
  { label: "Facebook", href: "#", Icon: FacebookIcon },
  { label: "TikTok", href: "#", Icon: TikTokIcon },
  { label: "Instagram", href: "#", Icon: InstagramIcon },
];

export function Footer() {
  return (
    <footer className="bg-brand-black pt-12 pb-10 text-white">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between gap-6 md:flex-row">
          <a
            href="#"
            className="flex flex-col items-start leading-none"
            aria-label="JAZA Media home"
          >
            <span className="font-display text-3xl tracking-[0.15em] text-white md:text-4xl">
              JAZA
            </span>
            <span className="font-display text-xs tracking-[0.4em] text-white">
              MEDIA
            </span>
          </a>
          <nav className="hidden md:block">
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium">
              {FOOTER_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="transition-colors hover:text-brand-yellow"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
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
          <a
            href="#"
            className="inline-flex items-center rounded-full bg-brand-yellow px-6 py-2.5 text-sm font-bold text-brand-black transition-transform hover:scale-[1.02]"
          >
            Send Us Message
          </a>

          <div className="flex items-center gap-3">
            {SOCIALS.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
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
