'use client';

import type { ReactNode } from 'react';
import { RadioGroup } from '@base-ui/react/radio-group';
import { Radio } from '@base-ui/react/radio';
import { cn } from '@/lib/utils';

type Option = { value: string; label: string };

type Props = {
  name: string;
  ariaLabel: string;
  value: string | undefined;
  onChange: (value: string) => void;
  options: Option[];
  layout: 'card-grid' | 'row-stack' | 'flag-card';
  cols: 1 | 2 | 3;
};

const COL_CLASS: Record<1 | 2 | 3, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-3',
};

// Flag-card layout is fixed at 2 cols on mobile, 3 on desktop to match the
// reference where 3 country options sit two-up on phones (3rd wraps) and
// three-across on desktop.
const FLAG_GRID_CLASS = 'grid-cols-2 md:grid-cols-3';

export function RadioOptions({
  name,
  ariaLabel,
  value,
  onChange,
  options,
  layout,
  cols,
}: Props) {
  const gridClass =
    layout === 'card-grid'
      ? COL_CLASS[cols]
      : layout === 'flag-card'
        ? FLAG_GRID_CLASS
        : 'grid-cols-1';

  return (
    <RadioGroup
      name={name}
      aria-label={ariaLabel}
      value={value ?? ''}
      onValueChange={(v) => onChange(v as string)}
      className={cn('grid gap-3', gridClass)}
    >
      {options.map((opt) => {
        if (layout === 'flag-card') {
          return <FlagCardOption key={opt.value} option={opt} />;
        }
        if (layout === 'card-grid') {
          return <CardOption key={opt.value} option={opt} />;
        }
        return <RowOption key={opt.value} option={opt} />;
      })}
    </RadioGroup>
  );
}

function CardOption({ option }: { option: Option }) {
  return (
    <label
      className={cn(
        'group flex min-h-[44px] cursor-pointer items-center gap-3 rounded-md border border-neutral-300 bg-white px-4 py-3.5 transition-colors',
        'hover:border-neutral-500',
        'has-data-[checked]:border-brand-black has-data-[checked]:ring-2 has-data-[checked]:ring-brand-black/20',
      )}
    >
      <Radio.Root
        value={option.value}
        className={cn(
          'grid size-4 place-items-center rounded-full border border-neutral-400 bg-white',
          'data-[checked]:border-brand-black',
        )}
      >
        <Radio.Indicator className="size-2 rounded-full bg-brand-black opacity-0 data-[checked]:opacity-100" />
      </Radio.Root>
      <span className="text-sm font-medium text-brand-black">
        {option.label}
      </span>
    </label>
  );
}

function RowOption({ option }: { option: Option }) {
  return (
    <label
      className={cn(
        'group flex min-h-[44px] cursor-pointer items-center gap-3 rounded-md border border-neutral-300 bg-white px-4 py-3.5 transition-colors',
        'hover:border-neutral-500',
        'has-data-[checked]:border-brand-black has-data-[checked]:ring-2 has-data-[checked]:ring-brand-black/20',
      )}
    >
      <Radio.Root
        value={option.value}
        className={cn(
          'grid size-4 place-items-center rounded-full border border-neutral-400 bg-white',
          'data-[checked]:border-brand-black',
        )}
      >
        <Radio.Indicator className="size-2 rounded-full bg-brand-black opacity-0 data-[checked]:opacity-100" />
      </Radio.Root>
      <span className="text-sm font-medium text-brand-black">
        {option.label}
      </span>
    </label>
  );
}

const FLAGS: Record<string, ReactNode> = {
  philippines: <PhilippinesFlag />,
  australia: <AustraliaFlag />,
  others: <OthersFlag />,
};

function FlagCardOption({ option }: { option: Option }) {
  return (
    <label
      className={cn(
        'group relative flex min-h-[140px] cursor-pointer flex-col items-center justify-end gap-3 rounded-md border border-neutral-300 bg-white p-4 pt-8 transition-colors',
        'hover:border-neutral-500',
        'has-data-[checked]:border-brand-black has-data-[checked]:bg-brand-yellow/15',
      )}
    >
      <Radio.Root
        value={option.value}
        className={cn(
          'absolute top-3 left-3 grid size-4 place-items-center rounded-full border border-neutral-400 bg-white',
          'data-[checked]:border-brand-black',
        )}
      >
        <Radio.Indicator className="size-2 rounded-full bg-brand-black opacity-0 data-[checked]:opacity-100" />
      </Radio.Root>
      <span className="flex flex-1 items-center justify-center">
        {FLAGS[option.value]}
      </span>
      <span className="text-xs font-bold tracking-wider text-brand-black uppercase">
        {option.label}
      </span>
    </label>
  );
}

// Inline SVG flags — kept minimal to render crisply at any size and avoid an
// extra network round-trip for tiny assets. Flag-on-pole silhouette mirrors
// the reference design.
function FlagFrame({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className="size-14 md:size-16"
      aria-hidden
    >
      {/* pole */}
      <rect x="10" y="6" width="2" height="52" fill="#181818" />
      <circle cx="11" cy="6" r="2" fill="#181818" />
      {children}
    </svg>
  );
}

function PhilippinesFlag() {
  return (
    <FlagFrame>
      {/* blue band (top), red band (bottom) */}
      <rect x="12" y="8" width="40" height="11" fill="#0038A8" />
      <rect x="12" y="19" width="40" height="11" fill="#CE1126" />
      {/* white triangle on hoist */}
      <polygon points="12,8 26,19 12,30" fill="#ffffff" />
      {/* sun */}
      <circle cx="17" cy="19" r="2" fill="#FCD116" />
    </FlagFrame>
  );
}

function AustraliaFlag() {
  return (
    <FlagFrame>
      {/* navy field */}
      <rect x="12" y="8" width="40" height="22" fill="#012169" />
      {/* simplified union jack quadrant */}
      <line x1="12" y1="8" x2="26" y2="19" stroke="#ffffff" strokeWidth="1.5" />
      <line x1="26" y1="8" x2="12" y2="19" stroke="#ffffff" strokeWidth="1.5" />
      <line x1="19" y1="8" x2="19" y2="19" stroke="#ffffff" strokeWidth="1.5" />
      <line x1="12" y1="13.5" x2="26" y2="13.5" stroke="#ffffff" strokeWidth="1.5" />
      {/* commonwealth/southern-cross stars */}
      <circle cx="19" cy="25" r="1.4" fill="#ffffff" />
      <circle cx="40" cy="13" r="1" fill="#ffffff" />
      <circle cx="44" cy="18" r="1" fill="#ffffff" />
      <circle cx="37" cy="22" r="1" fill="#ffffff" />
      <circle cx="42" cy="25" r="1" fill="#ffffff" />
    </FlagFrame>
  );
}

function OthersFlag() {
  return (
    <FlagFrame>
      <rect
        x="12"
        y="8"
        width="40"
        height="22"
        fill="#e5e7eb"
        stroke="#181818"
        strokeWidth="0.6"
      />
      <text
        x="32"
        y="25"
        textAnchor="middle"
        fontSize="16"
        fontWeight="900"
        fill="#181818"
        fontFamily="system-ui, sans-serif"
      >
        ?
      </text>
    </FlagFrame>
  );
}
