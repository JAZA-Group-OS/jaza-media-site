'use client';

import { useId, type CSSProperties, type ReactNode } from 'react';
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
        'group flex min-h-[44px] cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5 transition',
        'hover:border-gold/40 hover:bg-white/[0.05]',
        'has-data-[checked]:border-gold has-data-[checked]:bg-gold/10 has-data-[checked]:shadow-[0_0_24px_-6px_rgba(234,179,8,0.5)]',
      )}
    >
      <Radio.Root
        value={option.value}
        className={cn(
          'grid size-4 shrink-0 place-items-center rounded-full border border-white/30 bg-transparent',
          'data-[checked]:border-gold',
        )}
      >
        <Radio.Indicator className="size-2 rounded-full bg-gold opacity-0 data-[checked]:opacity-100" />
      </Radio.Root>
      <span className="text-base text-white/85">
        {option.label}
      </span>
    </label>
  );
}

function RowOption({ option }: { option: Option }) {
  return (
    <label
      className={cn(
        'group flex min-h-[44px] cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5 transition',
        'hover:border-gold/40 hover:bg-white/[0.05]',
        'has-data-[checked]:border-gold has-data-[checked]:bg-gold/10 has-data-[checked]:shadow-[0_0_24px_-6px_rgba(234,179,8,0.5)]',
      )}
    >
      <Radio.Root
        value={option.value}
        className={cn(
          'grid size-4 shrink-0 place-items-center rounded-full border border-white/30 bg-transparent',
          'data-[checked]:border-gold',
        )}
      >
        <Radio.Indicator className="size-2 rounded-full bg-gold opacity-0 data-[checked]:opacity-100" />
      </Radio.Root>
      <span className="text-base text-white/85">
        {option.label}
      </span>
    </label>
  );
}

const FLAGS: Record<string, ReactNode> = {
  philippines: <PhilippinesFlag />,
  canada: <CanadaFlag />,
  others: <OthersFlag />,
};

function FlagCardOption({ option }: { option: Option }) {
  return (
    <label
      className={cn(
        'group relative flex min-h-[150px] cursor-pointer flex-col items-center justify-end gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 pt-8 transition duration-300 hover:-translate-y-1',
        'hover:border-gold/40 hover:bg-white/[0.05]',
        'has-data-[checked]:border-gold has-data-[checked]:bg-gold/10 has-data-[checked]:shadow-[0_0_30px_-6px_rgba(234,179,8,0.55)]',
      )}
    >
      <Radio.Root
        value={option.value}
        className={cn(
          'absolute top-3 left-3 grid size-4 place-items-center rounded-full border border-white/30 bg-transparent',
          'data-[checked]:border-gold',
        )}
      >
        <Radio.Indicator className="size-2 rounded-full bg-gold opacity-0 data-[checked]:opacity-100" />
      </Radio.Root>
      <span className="flex flex-1 items-center justify-center">
        {FLAGS[option.value]}
      </span>
      <span className="text-[11px] font-medium tracking-[0.24em] text-white/80 uppercase">
        {option.label}
      </span>
    </label>
  );
}

// Inline SVG flags on a metal pole. The cloth is cut into thin vertical
// slices that bob out of phase (CSS `flag-wave`), with a moving light/shadow
// band on each slice, so the flag ripples like fabric. Amplitude grows away
// from the pole. Motion stops under prefers-reduced-motion.
const SLICES = 20;
const FLAG_X = 12;
const FLAG_W = 40;

function FlagFrame({ children }: { children: ReactNode }) {
  const id = useId().replace(/:/g, '');
  const sw = FLAG_W / SLICES;
  return (
    <svg viewBox="0 0 64 64" className="size-16 overflow-visible md:size-[72px]" aria-hidden>
      <defs>
        <linearGradient id={`${id}-pole`} x1="0" x2="1">
          <stop offset="0" stopColor="#8a6a1c" />
          <stop offset="0.45" stopColor="#f3d27a" />
          <stop offset="1" stopColor="#7a5c14" />
        </linearGradient>
        <radialGradient id={`${id}-knob`} cx="0.35" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#fff3c4" />
          <stop offset="0.5" stopColor="#d4a72c" />
          <stop offset="1" stopColor="#6b4f10" />
        </radialGradient>
        <linearGradient id={`${id}-cloth`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.18" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.18" />
        </linearGradient>
        <g id={`${id}-art`}>
          {children}
          <rect x={FLAG_X} y="8" width={FLAG_W} height="22" fill={`url(#${id}-cloth)`} />
        </g>
        {Array.from({ length: SLICES }, (_, i) => (
          <clipPath key={i} id={`${id}-c${i}`}>
            <rect x={FLAG_X + i * sw - 0.05} y="0" width={sw + 0.1} height="64" />
          </clipPath>
        ))}
      </defs>

      {/* soft ground shadow */}
      <ellipse cx="11" cy="58.5" rx="5" ry="1" fill="#000" opacity="0.35" />
      {/* cloth */}
      {Array.from({ length: SLICES }, (_, i) => {
        const t = (i + 0.5) / SLICES;
        const style = {
          '--amp': `${(0.4 + t * 2.4).toFixed(2)}px`,
          animationDelay: `${(-i * 0.14).toFixed(2)}s`,
        } as CSSProperties;
        return (
          <g key={i} clipPath={`url(#${id}-c${i})`}>
            <g className="flag-wave" style={style}>
              <use href={`#${id}-art`} />
              <rect
                className="flag-shade"
                style={{ animationDelay: style.animationDelay }}
                x={FLAG_X}
                y="6"
                width={FLAG_W}
                height="26"
                fill="#000"
              />
            </g>
          </g>
        );
      })}
      {/* pole + finial */}
      <rect x="9.6" y="6" width="2.4" height="53" rx="1" fill={`url(#${id}-pole)`} />
      <circle cx="10.8" cy="5" r="2.2" fill={`url(#${id}-knob)`} />
    </svg>
  );
}

function Star({ x, y, r }: { x: number; y: number; r: number }) {
  const pts = Array.from({ length: 10 }, (_, k) => {
    const a = -Math.PI / 2 + (k * Math.PI) / 5;
    const rr = k % 2 ? r * 0.42 : r;
    return `${(x + rr * Math.cos(a)).toFixed(2)},${(y + rr * Math.sin(a)).toFixed(2)}`;
  }).join(' ');
  return <polygon points={pts} fill="#FCD116" />;
}

function PhilippinesFlag() {
  const rays = Array.from({ length: 8 }, (_, k) => {
    const a = (k * Math.PI) / 4;
    return (
      <line
        key={k}
        x1={18.2 + 2.2 * Math.cos(a)}
        y1={19 + 2.2 * Math.sin(a)}
        x2={18.2 + 3.6 * Math.cos(a)}
        y2={19 + 3.6 * Math.sin(a)}
        stroke="#FCD116"
        strokeWidth="0.7"
        strokeLinecap="round"
      />
    );
  });
  return (
    <FlagFrame>
      <rect x="12" y="8" width="40" height="11" fill="#0038A8" />
      <rect x="12" y="19" width="40" height="11" fill="#CE1126" />
      <polygon points="12,8 31,19 12,30" fill="#ffffff" />
      <circle cx="18.2" cy="19" r="1.8" fill="#FCD116" />
      {rays}
      <Star x={13.8} y={10.4} r={1.1} />
      <Star x={13.8} y={27.6} r={1.1} />
      <Star x={27.6} y={19} r={1.1} />
    </FlagFrame>
  );
}

function CanadaFlag() {
  return (
    <FlagFrame>
      {/* 1:2:1 vertical bands — red, white, red */}
      <rect x="12" y="8" width="10" height="22" fill="#D52B1E" />
      <rect x="22" y="8" width="20" height="22" fill="#ffffff" />
      <rect x="42" y="8" width="10" height="22" fill="#D52B1E" />
      {/* 11-point maple leaf */}
      <path
        transform="translate(32 18.6)"
        d="M0,-6.5 L1.2,-4.2 L2.6,-4.8 L2.1,-1.6 L3.9,-3.4 L4.3,-2.5 L6,-2.9 L5.4,-1 L6.2,-0.6 L3.4,1.7 L3.8,2.8 L0.4,2.4 L0.5,5.5 L-0.5,5.5 L-0.4,2.4 L-3.8,2.8 L-3.4,1.7 L-6.2,-0.6 L-5.4,-1 L-6,-2.9 L-4.3,-2.5 L-3.9,-3.4 L-2.1,-1.6 L-2.6,-4.8 L-1.2,-4.2 Z"
        fill="#D52B1E"
      />
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
        fill="#1f1d17"
        stroke="#d4a72c"
        strokeWidth="0.6"
      />
      <text
        x="32"
        y="25"
        textAnchor="middle"
        fontSize="16"
        fontWeight="900"
        fill="#d4a72c"
        fontFamily="system-ui, sans-serif"
      >
        ?
      </text>
    </FlagFrame>
  );
}
