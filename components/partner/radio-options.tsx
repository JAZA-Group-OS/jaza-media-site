'use client';

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
  layout: 'card-grid' | 'row-stack';
  cols: 1 | 2 | 3;
};

const COL_CLASS: Record<1 | 2 | 3, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-3',
};

export function RadioOptions({
  name,
  ariaLabel,
  value,
  onChange,
  options,
  layout,
  cols,
}: Props) {
  return (
    <RadioGroup
      name={name}
      aria-label={ariaLabel}
      value={value ?? ''}
      onValueChange={(v) => onChange(v as string)}
      className={cn(
        'grid gap-3',
        layout === 'card-grid' ? COL_CLASS[cols] : 'grid-cols-1',
      )}
    >
      {options.map((opt) =>
        layout === 'card-grid' ? (
          <CardOption key={opt.value} option={opt} />
        ) : (
          <RowOption key={opt.value} option={opt} />
        ),
      )}
    </RadioGroup>
  );
}

function CardOption({ option }: { option: Option }) {
  return (
    <label
      className={cn(
        'group relative flex min-h-[88px] cursor-pointer flex-col items-center justify-center rounded-md border border-neutral-300 bg-white px-4 py-6 text-center transition-colors md:aspect-[5/3] md:min-h-0',
        'hover:border-neutral-500',
        'has-data-[checked]:border-brand-black has-data-[checked]:ring-2 has-data-[checked]:ring-brand-black/20',
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
      <span className="mt-1 text-sm font-medium text-brand-black md:text-base">
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
