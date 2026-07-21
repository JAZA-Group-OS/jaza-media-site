import type { ComponentType, SVGProps } from 'react';

type IconProps = { className?: string };

export function GmailIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M22 4H2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h20a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 4.24-10 6.25L2 8.24V6l10 6.25L22 6v2.24Z" />
    </svg>
  );
}

export function MessengerIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C6.5 2 2 6.14 2 11.22c0 2.89 1.46 5.48 3.75 7.18V22l3.42-1.88c.91.25 1.87.39 2.83.39 5.5 0 10-4.14 10-9.28S17.5 2 12 2Zm1.03 12.52-2.56-2.73-4.99 2.73 5.49-5.83 2.6 2.73 4.94-2.73-5.48 5.83Z" />
    </svg>
  );
}

export function FacebookIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.12 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.79-4.68 4.53-4.68 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.88v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07Z" />
    </svg>
  );
}

export function TikTokIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.1Z" />
    </svg>
  );
}

export function InstagramIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85 0 3.2-.01 3.58-.07 4.85-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07-3.2 0-3.58-.01-4.85-.07-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.64-.07-4.85 0-3.2.01-3.58.07-4.85C2.38 3.92 3.9 2.39 7.15 2.23 8.42 2.18 8.8 2.16 12 2.16ZM12 0C8.74 0 8.33.01 7.05.07c-4.35.2-6.78 2.62-6.98 6.98C.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.62 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.2-4.35-2.62-6.78-6.98-6.98C15.67.01 15.26 0 12 0Zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.41-11.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88Z" />
    </svg>
  );
}

export type SocialLink = {
  label: string;
  /** Real channel URL, or null while the channel isn't published yet —
   *  consumers hide null entries so users are never sent to a bare
   *  platform homepage (gmail.com, facebook.com, …). */
  href: string | null;
  Icon: ComponentType<IconProps>;
};

// Fill in JAZA's actual channel URLs (e.g. https://facebook.com/<page>) as
// they go live; each icon reappears in the footer/support hero automatically.
export const SOCIAL_LINKS: SocialLink[] = [
  { label: 'Gmail', href: null, Icon: GmailIcon },
  { label: 'Messenger', href: null, Icon: MessengerIcon },
  { label: 'Facebook', href: null, Icon: FacebookIcon },
  { label: 'TikTok', href: null, Icon: TikTokIcon },
  { label: 'Instagram', href: null, Icon: InstagramIcon },
];

/** Only the links that have a real destination. */
export const PUBLISHED_SOCIAL_LINKS: (SocialLink & { href: string })[] =
  SOCIAL_LINKS.filter((l): l is SocialLink & { href: string } => l.href !== null);

export type { IconProps as SocialIconProps, SVGProps };
