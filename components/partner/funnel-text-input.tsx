'use client';

import { cn } from '@/lib/utils';

type Props = {
  multiline?: boolean;
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  placeholder?: string;
  inputMode?: 'text' | 'tel' | 'email';
  type?: 'text' | 'tel' | 'email';
  autoComplete?: string;
  maxLength?: number;
};

export function FunnelTextInput({
  multiline = false,
  value,
  onChange,
  ariaLabel,
  placeholder,
  inputMode,
  type = 'text',
  autoComplete,
  maxLength,
}: Props) {
  const baseClass = cn(
    'w-full rounded-xl border border-black/15 bg-white px-4 py-3.5 text-base text-ink outline-none transition',
    'placeholder:text-ink/35',
    'focus:border-gold-deep focus:ring-2 focus:ring-gold/25',
  );

  if (multiline) {
    return (
      <textarea
        aria-label={ariaLabel}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        // On iOS Safari the virtual keyboard can hide the yellow nav bar.
        // Scroll the field (and the NEXT button) into view on focus.
        onFocus={(e) =>
          e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        }
        placeholder={placeholder}
        rows={4}
        maxLength={maxLength}
        className={cn(baseClass, 'resize-y')}
      />
    );
  }

  return (
    <input
      aria-label={ariaLabel}
      type={type}
      inputMode={inputMode}
      autoComplete={autoComplete}
      maxLength={maxLength}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={baseClass}
    />
  );
}
