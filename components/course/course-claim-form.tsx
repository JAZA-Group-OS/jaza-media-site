'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import type { CourseDetails } from '@/lib/courses/catalog';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Permissive phone format — accept +, digits, spaces, parens, dashes; require
// at least 7 input characters so we don't accept obvious junk like "1".
const PHONE_RE = /^[+\d][\d\s()-]{6,}$/;

const DISCLAIMER =
  'By providing your information you consent to JAZA Media contacting you by phone, text, or email using automated telephone dialing systems and AI to the information provided, even if the phone number is present on a state or national Do Not Call List. We do not sell your personal information. By providing this information you agree to our Privacy Policy and Terms of Service.';

interface CourseClaimFormProps {
  course: CourseDetails;
}

export function CourseClaimForm({ course }: CourseClaimFormProps) {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;

    const fn = firstName.trim();
    const ln = lastName.trim();
    const em = email.trim();
    const ph = phone.trim();

    if (fn.length < 1) {
      setError('Please enter your first name.');
      return;
    }
    if (ln.length < 1) {
      setError('Please enter your last name.');
      return;
    }
    if (!EMAIL_RE.test(em)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!PHONE_RE.test(ph)) {
      setError('Please enter a valid contact number.');
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/course-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseSlug: course.slug,
          firstName: fn,
          lastName: ln,
          email: em,
          phone: ph,
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(body.error ?? 'Failed to submit request');
      }
      router.push(`/courses/${course.slug}/thank-you?e=${encodeURIComponent(em)}`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to submit request';
      setError(message);
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12 md:py-16">
      <div className="text-center">
        <h1 className="font-heading text-2xl leading-tight font-black tracking-tight text-brand-black md:text-[34px]">
          Get instant access to your FREE{' '}
          <span className="rounded-md bg-brand-yellow px-2">
            {course.formHighlight}
          </span>
          {course.formHighlightSuffix} in under 30 seconds!
        </h1>

        <div className="mt-8 flex justify-center">
          <Image
            src={course.heroImage.src}
            alt={course.heroImage.alt}
            width={course.heroImage.width}
            height={course.heroImage.height}
            priority
            sizes="(min-width: 768px) 480px, 80vw"
            className="block h-auto w-[320px] md:w-[420px] lg:w-[480px]"
          />
        </div>

        <h2 className="mt-10 font-heading text-2xl font-black tracking-tight text-brand-black md:text-3xl">
          What&rsquo;s your <span className="text-brand-yellow">name?</span>
        </h2>
      </div>

      <form className="mx-auto mt-6 w-full max-w-md" onSubmit={onSubmit} noValidate>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="sr-only">First name</span>
            <input
              type="text"
              autoComplete="given-name"
              placeholder="FIRST NAME"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              maxLength={100}
              className="block w-full rounded-md border border-neutral-300 bg-white px-4 py-3 font-heading text-sm tracking-wide text-brand-black placeholder:text-neutral-400 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/30"
            />
          </label>
          <label className="block">
            <span className="sr-only">Last name</span>
            <input
              type="text"
              autoComplete="family-name"
              placeholder="LAST NAME"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              maxLength={100}
              className="block w-full rounded-md border border-neutral-300 bg-white px-4 py-3 font-heading text-sm tracking-wide text-brand-black placeholder:text-neutral-400 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/30"
            />
          </label>
        </div>

        <label className="mt-3 block">
          <span className="sr-only">Email address</span>
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="EMAIL ADDRESS"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={254}
            className="block w-full rounded-md border border-neutral-300 bg-white px-4 py-3 font-heading text-sm tracking-wide text-brand-black placeholder:text-neutral-400 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/30"
          />
        </label>

        <label className="mt-3 block">
          <span className="sr-only">Contact number</span>
          <input
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="CONTACT NUMBER"
            value={phone}
            onChange={(e) =>
              // Keep digits + the common separators users type (+, space,
              // hyphen, parens); drop letters and stray punctuation. The
              // hard 18-char cap matches the funnel forms across the site.
              setPhone(e.target.value.replace(/[^\d+()\-\s]/g, '').slice(0, 18))
            }
            maxLength={18}
            className="block w-full rounded-md border border-neutral-300 bg-white px-4 py-3 font-heading text-sm tracking-wide text-brand-black placeholder:text-neutral-400 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/30"
          />
        </label>

        {error ? (
          <p
            role="alert"
            className="mt-3 text-center text-sm font-semibold text-red-600"
          >
            {error}
          </p>
        ) : null}

        <div className="mt-5 flex justify-center">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center rounded-full bg-brand-yellow px-10 py-3 font-heading text-base font-black tracking-wide text-brand-black uppercase transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Sending…' : "Let's Start"}
          </button>
        </div>

        <p className="mt-6 text-center font-heading text-sm font-bold text-brand-black">
          {course.subCopyLine1}
        </p>
        <p className="text-center font-heading text-sm font-bold text-brand-black">
          {course.subCopyLine2}
        </p>
      </form>

      <p className="mx-auto mt-8 max-w-xl text-center text-[11px] leading-relaxed text-text-muted">
        {DISCLAIMER}
      </p>
    </div>
  );
}
