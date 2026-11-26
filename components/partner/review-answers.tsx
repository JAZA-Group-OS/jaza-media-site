'use client';

import { ArrowRight, Pencil, X } from 'lucide-react';
import { useEffect, useRef } from 'react';

import { QUESTIONS, type Answers } from '@/lib/partner/questions';

/** Human-readable value for one answer (option label for choices, raw text otherwise). */
function display(q: (typeof QUESTIONS)[number], answers: Answers): string {
  const v = answers[q.id];
  if (v === undefined || v === null || String(v).trim() === '') return '';
  if (q.type === 'radio') {
    const opt = (q.options as { value: string; label: string }[]).find((o) => o.value === v);
    return opt?.label ?? String(v);
  }
  return String(v);
}

export function ReviewAnswers({
  answers,
  submitting,
  onClose,
  onEdit,
  onSubmit,
}: {
  answers: Answers;
  submitting: boolean;
  onClose: () => void;
  onEdit: (step: number) => void;
  onSubmit: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const missing = QUESTIONS.filter((q) => !display(q, answers)).length;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="review-title">
      <button type="button" aria-label="Close review" onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-black/10 bg-white shadow-[0_40px_90px_-30px_rgba(0,0,0,0.45)]">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[23px] text-ink">
          <div className="flex items-start justify-between gap-4 border-b border-black/10 px-6 py-5 md:px-8">
            <div>
              <p className="text-[10.5px] tracking-[0.3em] text-gold-deep uppercase">Before you submit</p>
              <h2 id="review-title" className="mt-1.5 font-serif text-[28px] leading-tight font-semibold text-ink md:text-[32px]">
                Review your answers
              </h2>
              <p className="mt-1 text-sm text-ink/55">Check everything is correct. Tap Edit to change an answer.</p>
            </div>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="grid size-10 shrink-0 place-items-center rounded-full border border-black/15 text-ink/60 transition hover:border-black/30 hover:text-ink"
            >
              <X className="size-4" />
            </button>
          </div>

          <dl className="min-h-0 flex-1 divide-y divide-black/10 overflow-y-auto px-6 md:px-8">
            {QUESTIONS.map((q, i) => {
              const val = display(q, answers);
              return (
                <div key={q.id} className="flex items-start gap-4 py-4">
                  <span className="mt-0.5 w-6 shrink-0 font-serif text-lg text-gold-deep">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <dt className="text-[13px] text-ink/50">{q.label}</dt>
                    <dd className={`mt-1 break-words whitespace-pre-line ${val ? 'text-ink' : 'text-red-600 italic'}`}>
                      {val || 'Not answered yet'}
                    </dd>
                  </div>
                  <button
                    type="button"
                    onClick={() => onEdit(i + 1)}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-black/15 px-3 py-1.5 text-[11px] tracking-[0.12em] text-ink/70 uppercase transition hover:border-black/30 hover:text-ink"
                  >
                    <Pencil className="size-3" />
                    Edit
                  </button>
                </div>
              );
            })}
          </dl>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/10 px-6 py-4 md:px-8">
            <p className="text-[13px] text-ink/50">
              {missing ? `${missing} answer${missing > 1 ? 's' : ''} still missing` : 'All answers filled in'}
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="min-h-[44px] rounded-full px-4 text-[12px] tracking-[0.14em] text-ink/55 uppercase transition hover:text-ink"
              >
                Back
              </button>
              <button
                type="button"
                onClick={onSubmit}
                disabled={submitting}
                className="group inline-flex min-h-[44px] items-center gap-2 rounded-md bg-ink px-7 text-[12px] font-semibold tracking-[0.14em] text-white uppercase transition hover:bg-ink-soft disabled:opacity-50"
              >
                {submitting ? 'Submitting…' : 'Looks good — Submit'}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
