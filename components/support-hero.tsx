import { PUBLISHED_SOCIAL_LINKS } from '@/components/social-icons';

const SUPPORT_EMAIL = 'admin@jazamedia.com';

export function SupportHero() {
  return (
    <section className="bg-neutral-800 pt-12 pb-16 md:pt-20 md:pb-24">
      <div className="mx-auto max-w-4xl px-4 text-center">
        <h1 className="font-heading text-3xl font-extrabold leading-tight text-white md:text-5xl">
          How can we help?
        </h1>
        <p className="mx-auto mt-5 max-w-2xl font-heading text-base leading-relaxed text-white/70 md:text-lg">
          Browse common answers below, or send us a message and our team will get
          back to you within 2 business days.
        </p>

        <div className="mx-auto mt-10 flex max-w-xl flex-col items-center gap-5">
          <span className="inline-flex items-center rounded-full border border-brand-yellow/40 px-5 py-2 font-heading text-sm font-semibold text-brand-yellow">
            {SUPPORT_EMAIL}
          </span>

          <ul className="flex items-center gap-3">
            {PUBLISHED_SOCIAL_LINKS.map(({ label, href, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center p-1.5 text-white/70 transition-colors hover:text-brand-yellow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-800 rounded-full"
                >
                  <Icon className="size-5" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
