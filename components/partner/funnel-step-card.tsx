import type { ReactNode, Ref } from 'react';
import { ArrowLeft, ArrowRight, ListChecks } from 'lucide-react';

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
  /** Last step only: opens the "review your answers" summary. */
  onReview?: () => void;
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
  onReview,
}: Props) {
  return (
    <div
      key={shakeKey}
      className={`overflow-hidden rounded-3xl border border-black/10 bg-white shadow-[0_30px_70px_-45px_rgba(0,0,0,0.4)] ${shakeKey > 0 ? 'animate-funnel-shake' : ''}`}
    >
      <div className="overflow-hidden rounded-[23px]">
      <div className="px-6 py-8 md:px-12 md:py-10">
        <h2
          ref={titleRef}
          tabIndex={-1}
          className="text-center font-serif text-[28px] leading-tight font-semibold text-ink outline-none md:text-[34px]"
        >
          {title}
        </h2>
        {helper ? (
          <p className="mt-2 text-center text-base text-ink/55">
            ({helper})
          </p>
        ) : null}

        <div className="mt-6 md:mt-8">{body}</div>

        {error ? (
          <p
            role="alert"
            className="mt-4 text-center text-base font-semibold text-red-600"
          >
            {error}
          </p>
        ) : null}
      </div>

      <div className="flex items-center justify-between border-t border-black/10 px-6 py-4 md:px-10">
        {isFirst ? (
          <span aria-hidden />
        ) : (
          <button
            type="button"
            onClick={onPrev}
            aria-label="Previous step"
            className="inline-flex min-h-[44px] items-center gap-2 text-[12px] font-medium tracking-[0.14em] text-ink/55 uppercase transition hover:text-ink"
          >
            <ArrowLeft className="size-4" strokeWidth={2.5} />
            Previous
          </button>
        )}

        <div className="flex items-center gap-3">
        {isLast && onReview ? (
          <button
            type="button"
            onClick={onReview}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-md border border-black/15 px-5 text-[12px] font-medium tracking-[0.14em] text-ink uppercase transition hover:border-black/30"
          >
            <ListChecks className="size-4 text-gold-deep" strokeWidth={2} />
            <span className="hidden sm:inline">Review answers</span>
            <span className="sm:hidden">Review</span>
          </button>
        ) : null}
        <button
          type="submit"
          disabled={submitting}
          aria-busy={submitting || undefined}
          aria-label={isLast ? 'Submit application' : 'Next step'}
          className="group inline-flex min-h-[44px] items-center gap-2 rounded-md bg-ink px-7 text-[12px] font-semibold tracking-[0.14em] text-white uppercase transition hover:bg-ink-soft disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLast ? (submitting ? 'Submitting…' : 'Submit') : 'Next'}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" strokeWidth={2.5} />
        </button>
        </div>
      </div>
      </div>
    </div>
  );
}
