import type { ReactNode, Ref } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

// FunnelStepCard expects to live inside a <form>. The submit button advances
// the funnel via the form's onSubmit handler — no onNext prop needed, which
// also avoids the double-fire bug where onClick + form submit both fire.
type Props = {
  title: string;
  helper?: string;
  body: ReactNode;
  error?: string;
  onPrev?: () => void;
  isFirst: boolean;
  isLast: boolean;
  /** Heading ref so the parent can move focus on step change (a11y). */
  titleRef?: Ref<HTMLHeadingElement>;
};

export function FunnelStepCard({
  title,
  helper,
  body,
  error,
  onPrev,
  isFirst,
  isLast,
  titleRef,
}: Props) {
  return (
    <div className="overflow-hidden rounded-xl border-[3px] border-brand-black bg-surface-grey shadow-[0_8px_32px_-8px_rgba(0,0,0,0.25)]">
      <div className="px-6 py-8 md:px-12 md:py-10">
        <h2
          ref={titleRef}
          tabIndex={-1}
          className="text-center font-heading text-xl font-black text-brand-black outline-none md:text-2xl"
        >
          {title}
        </h2>
        {helper ? (
          <p className="mt-2 text-center text-sm text-neutral-500 italic">
            ({helper})
          </p>
        ) : null}

        <div className="mt-6 md:mt-8">{body}</div>

        {error ? (
          <p
            role="alert"
            className="mt-4 text-center text-sm font-semibold text-tag-red"
          >
            {error}
          </p>
        ) : null}
      </div>

      <div className="flex items-center justify-between bg-brand-yellow px-6 py-3 md:px-10">
        {isFirst ? (
          <span aria-hidden />
        ) : (
          <button
            type="button"
            onClick={onPrev}
            aria-label="Previous step"
            className="inline-flex min-h-[44px] items-center gap-2 text-sm font-bold tracking-wider text-brand-black uppercase transition-opacity hover:opacity-70"
          >
            <ArrowLeft className="size-4" strokeWidth={2.5} />
            Previous
          </button>
        )}

        <button
          type="submit"
          aria-label={isLast ? 'Submit application' : 'Next step'}
          className="inline-flex min-h-[44px] items-center gap-2 text-sm font-bold tracking-wider text-brand-black uppercase transition-opacity hover:opacity-70"
        >
          {isLast ? 'Submit' : 'Next'}
          <ArrowRight className="size-4" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
