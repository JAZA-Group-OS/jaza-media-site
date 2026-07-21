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
  /** Increments on each validation failure to retrigger the shake animation. */
  shakeKey?: number;
  /** Disables the submit button while the final step is being persisted. */
  submitting?: boolean;
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
  shakeKey = 0,
  submitting = false,
}: Props) {
  return (
    <div
      key={shakeKey}
      className={`overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_2px_4px_rgba(0,0,0,0.04),0_18px_36px_-12px_rgba(0,0,0,0.18)] ${shakeKey > 0 ? 'animate-funnel-shake' : ''}`}
    >
      <div className="px-6 py-8 md:px-12 md:py-10">
        <h2
          ref={titleRef}
          tabIndex={-1}
          className="text-center font-heading text-lg font-semibold text-brand-black outline-none md:text-xl"
        >
          {title}
        </h2>
        {helper ? (
          <p className="mt-2 text-center text-base text-neutral-500 italic">
            ({helper})
          </p>
        ) : null}

        <div className="mt-6 md:mt-8">{body}</div>

        {error ? (
          <p
            role="alert"
            className="mt-4 text-center text-base font-semibold text-tag-red"
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
            className="inline-flex min-h-[44px] items-center gap-2 text-base font-bold tracking-wider text-brand-black uppercase transition-opacity hover:opacity-70"
          >
            <ArrowLeft className="size-4" strokeWidth={2.5} />
            Previous
          </button>
        )}

        <button
          type="submit"
          disabled={submitting}
          aria-busy={submitting || undefined}
          aria-label={isLast ? 'Submit application' : 'Next step'}
          className="inline-flex min-h-[44px] items-center gap-2 text-sm font-bold tracking-wider text-brand-black uppercase transition-opacity hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLast ? (submitting ? 'Submitting…' : 'Submit') : 'Next'}
          <ArrowRight className="size-4" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
