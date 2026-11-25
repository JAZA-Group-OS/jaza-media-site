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
      className={`overflow-hidden rounded-3xl bg-gradient-to-b from-gold/45 via-white/10 to-white/[0.03] p-px shadow-[0_50px_100px_-40px_rgba(0,0,0,0.95)] ${shakeKey > 0 ? 'animate-funnel-shake' : ''}`}
    >
      <div className="overflow-hidden rounded-[23px] bg-[linear-gradient(180deg,#1a1913_0%,#0f0f10_80%)]">
      <div className="px-6 py-8 md:px-12 md:py-10">
        <h2
          ref={titleRef}
          tabIndex={-1}
          className="text-center font-serif text-[28px] leading-tight text-white outline-none md:text-[34px]"
        >
          {title}
        </h2>
        {helper ? (
          <p className="mt-2 text-center text-base text-white/50 italic">
            ({helper})
          </p>
        ) : null}

        <div className="mt-6 md:mt-8">{body}</div>

        {error ? (
          <p
            role="alert"
            className="mt-4 text-center text-base font-semibold text-red-400"
          >
            {error}
          </p>
        ) : null}
      </div>

      <div className="flex items-center justify-between border-t border-white/10 px-6 py-4 md:px-10">
        {isFirst ? (
          <span aria-hidden />
        ) : (
          <button
            type="button"
            onClick={onPrev}
            aria-label="Previous step"
            className="inline-flex min-h-[44px] items-center gap-2 text-[12px] font-medium tracking-[0.14em] text-white/60 uppercase transition hover:text-white"
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
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-gold/50 px-5 text-[12px] font-medium tracking-[0.14em] text-white uppercase transition hover:bg-gold/10"
          >
            <ListChecks className="size-4 text-gold" strokeWidth={2} />
            <span className="hidden sm:inline">Review answers</span>
            <span className="sm:hidden">Review</span>
          </button>
        ) : null}
        <button
          type="submit"
          disabled={submitting}
          aria-busy={submitting || undefined}
          aria-label={isLast ? 'Submit application' : 'Next step'}
          className="careers-shine group inline-flex min-h-[44px] items-center gap-2 rounded-full bg-gold px-7 text-[12px] font-semibold tracking-[0.14em] text-ink uppercase transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
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
