'use client';

import { useState, type FormEvent, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import type { CourseDetails, SelectedAsset } from '@/lib/courses/catalog';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const DISCLAIMER =
  'By providing your information you consent to JAZA Media contacting you by phone, text, or email using automated telephone dialing systems and AI to the information provided, even if the phone number is present on a state or national Do Not Call List. We do not sell your personal information. By providing this information you agree to our Privacy Policy and Terms of Service.';

// Tiny country picker — covers the markets JAZA Media actually serves;
// users in unsupported regions can still pick a generic dial-code if needed
// (extend this list when the audience grows). `digits` is the exact local-
// number length we expect for that country (mobile-first); the input cap and
// validator both key off it so callers can't over-type or under-fill.
const COUNTRY_OPTIONS = [
  { code: '+63', flag: '🇵🇭', name: 'Philippines', digits: 10 },
  { code: '+1', flag: '🇺🇸', name: 'United States', digits: 10 },
  { code: '+61', flag: '🇦🇺', name: 'Australia', digits: 9 },
  { code: '+44', flag: '🇬🇧', name: 'United Kingdom', digits: 10 },
  { code: '+65', flag: '🇸🇬', name: 'Singapore', digits: 8 },
];

function getCountry(code: string) {
  return COUNTRY_OPTIONS.find((c) => c.code === code) ?? COUNTRY_OPTIONS[0];
}

type FunnelData = {
  firstName: string;
  lastName: string;
  email: string;
  phoneCountry: string;
  phoneLocal: string;
  shippingStreet: string;
  shippingCity: string;
  shippingState: string;
  shippingCountry: string;
  shippingPostal: string;
  selectedAsset: SelectedAsset | '';
};

const INITIAL_DATA: FunnelData = {
  firstName: '',
  lastName: '',
  email: '',
  phoneCountry: '+63',
  phoneLocal: '',
  shippingStreet: '',
  shippingCity: '',
  shippingState: '',
  shippingCountry: '',
  shippingPostal: '',
  selectedAsset: '',
};

const TOTAL_STEPS = 5;

interface CourseFunnelProps {
  course: CourseDetails;
}

export function CourseFunnel({ course }: CourseFunnelProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<FunnelData>(INITIAL_DATA);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const set = <K extends keyof FunnelData>(key: K, value: FunnelData[K]) =>
    setData((prev) => ({ ...prev, [key]: value }));

  const validateStep = (s: number): string | null => {
    switch (s) {
      case 1:
        if (!data.firstName.trim()) return 'Please enter your first name.';
        if (!data.lastName.trim()) return 'Please enter your last name.';
        return null;
      case 2:
        if (!EMAIL_RE.test(data.email.trim()))
          return 'Please enter a valid email address.';
        return null;
      case 3: {
        const country = getCountry(data.phoneCountry);
        if (data.phoneLocal.length !== country.digits)
          return `Please enter a ${country.digits}-digit ${country.name} phone number.`;
        return null;
      }
      case 4:
        if (!data.shippingStreet.trim()) return 'Please enter your street address.';
        if (!data.shippingCity.trim()) return 'Please enter your city.';
        if (!data.shippingState.trim()) return 'Please enter your state or region.';
        if (!data.shippingCountry.trim())
          return 'Please enter your country or region.';
        if (!data.shippingPostal.trim())
          return 'Please enter your ZIP / postal code.';
        return null;
      case 5:
        if (!data.selectedAsset)
          return `Please pick an option to receive.`;
        return null;
      default:
        return null;
    }
  };

  const onNext = () => {
    const err = validateStep(step);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
      return;
    }
    void submit();
  };

  const onPrev = () => {
    setError(null);
    setStep((s) => Math.max(1, s - 1));
  };

  const submit = async () => {
    if (submitting) return;
    const err = validateStep(5);
    if (err) {
      setError(err);
      return;
    }
    setSubmitting(true);
    try {
      const phone = `${data.phoneCountry} ${data.phoneLocal.trim()}`;
      const res = await fetch('/api/course-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseSlug: course.slug,
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          email: data.email.trim(),
          phone,
          shippingStreet: data.shippingStreet.trim(),
          shippingCity: data.shippingCity.trim(),
          shippingState: data.shippingState.trim(),
          shippingCountry: data.shippingCountry.trim(),
          shippingPostal: data.shippingPostal.trim(),
          selectedAsset: data.selectedAsset,
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(body.error ?? 'Failed to submit request');
      }
      // The API reports whether the delivery email actually went out; the
      // thank-you page softens its "check your inbox" copy when it didn't.
      const body = (await res.json().catch(() => ({}))) as {
        emailStatus?: string;
      };
      const emailPending = body.emailStatus && body.emailStatus !== 'sent';
      router.push(
        `/courses/${course.slug}/thank-you?a=${encodeURIComponent(data.selectedAsset)}${emailPending ? '&es=pending' : ''}`,
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to submit request';
      setError(message);
      setSubmitting(false);
    }
  };

  const onSubmitForm = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onNext();
  };

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-12 md:py-16">
      {/* Step 1 keeps the marketing hero (headline + book illustration) so
          the entry feels like a landing page, not a bare form. From step 2
          onward we switch to the slimmer "Request Form" chrome. */}
      {step === 1 ? (
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
              className="block h-auto w-[280px] md:w-[400px] lg:w-[460px]"
            />
          </div>
        </div>
      ) : (
        <h1 className="text-center font-heading text-xl font-black tracking-[0.18em] text-brand-black uppercase md:text-2xl">
          Request Form
        </h1>
      )}

      <form className="mx-auto mt-10 w-full max-w-md" onSubmit={onSubmitForm} noValidate>
        {step === 1 && (
          <Step
            heading={
              <>
                What&rsquo;s your <Highlight>name?</Highlight>
              </>
            }
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FunnelInput
                ariaLabel="First name"
                placeholder="FIRST NAME"
                autoComplete="given-name"
                value={data.firstName}
                onChange={(v) => set('firstName', v)}
              />
              <FunnelInput
                ariaLabel="Last name"
                placeholder="LAST NAME"
                autoComplete="family-name"
                value={data.lastName}
                onChange={(v) => set('lastName', v)}
              />
            </div>
          </Step>
        )}

        {step === 2 && (
          <Step
            heading={
              <>
                Where should I <Highlight>email</Highlight> it to?
              </>
            }
          >
            <FunnelInput
              ariaLabel="Business email address"
              placeholder="BUSINESS EMAIL ADDRESS"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={data.email}
              onChange={(v) => set('email', v)}
            />
          </Step>
        )}

        {step === 3 && (
          <Step
            heading={
              <>
                What is your <Highlight>phone number?</Highlight>
              </>
            }
          >
            {(() => {
              const country = getCountry(data.phoneCountry);
              return (
                <div className="flex items-stretch gap-2 rounded-md border border-neutral-300 bg-white focus-within:border-brand-yellow focus-within:ring-2 focus-within:ring-brand-yellow/30">
                  <label className="flex items-center pl-3 pr-1 border-r border-neutral-300">
                    <span className="sr-only">Country code</span>
                    <select
                      className="bg-transparent py-3 pr-2 font-heading text-sm font-bold tracking-wide text-brand-black focus:outline-none"
                      value={data.phoneCountry}
                      onChange={(e) => {
                        const next = getCountry(e.target.value);
                        // Switching country can shorten the allowed length;
                        // clamp the existing input so we never carry over a
                        // value longer than the new country's max.
                        setData((prev) => ({
                          ...prev,
                          phoneCountry: e.target.value,
                          phoneLocal: prev.phoneLocal.slice(0, next.digits),
                        }));
                      }}
                    >
                      {COUNTRY_OPTIONS.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.code} ({c.name})
                        </option>
                      ))}
                    </select>
                  </label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    aria-label="Phone number"
                    placeholder={'9'.repeat(country.digits)}
                    value={data.phoneLocal}
                    onChange={(e) =>
                      // Strip everything that isn't a digit, then cap at the
                      // selected country's length so the user literally can't
                      // over-type. `inputMode="numeric"` already discourages
                      // letters on mobile keyboards, but desktop paste needs
                      // this filter as a backstop.
                      set(
                        'phoneLocal',
                        e.target.value.replace(/\D/g, '').slice(0, country.digits),
                      )
                    }
                    maxLength={country.digits}
                    className="block w-full bg-transparent px-3 py-3 font-heading text-sm tracking-wide text-brand-black placeholder:text-neutral-400 focus:outline-none"
                  />
                </div>
              );
            })()}
          </Step>
        )}

        {step === 4 && (
          <Step
            heading={
              <>
                What&rsquo;s your <Highlight>shipping address?</Highlight>
              </>
            }
          >
            <div className="space-y-3">
              <FunnelInput
                ariaLabel="Street address"
                placeholder="STREET ADDRESS"
                autoComplete="street-address"
                value={data.shippingStreet}
                onChange={(v) => set('shippingStreet', v)}
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <FunnelInput
                  ariaLabel="City"
                  placeholder="CITY"
                  autoComplete="address-level2"
                  value={data.shippingCity}
                  onChange={(v) => set('shippingCity', v)}
                />
                <FunnelInput
                  ariaLabel="State or region"
                  placeholder="STATE / REGION"
                  autoComplete="address-level1"
                  value={data.shippingState}
                  onChange={(v) => set('shippingState', v)}
                />
                <FunnelInput
                  ariaLabel="Country or region"
                  placeholder="COUNTRY / REGION"
                  autoComplete="country-name"
                  value={data.shippingCountry}
                  onChange={(v) => set('shippingCountry', v)}
                />
                <FunnelInput
                  ariaLabel="ZIP or postal code"
                  placeholder="ZIP CODE / POSTAL"
                  autoComplete="postal-code"
                  value={data.shippingPostal}
                  onChange={(v) => set('shippingPostal', v)}
                />
              </div>
            </div>
          </Step>
        )}

        {step === 5 && (
          <Step
            heading={
              <>
                {course.selectionQuestion.replace(/access\?$/, '').trim()}{' '}
                <Highlight>access?</Highlight>
              </>
            }
          >
            <div
              className={`grid gap-2 ${
                course.assetOptions.length > 2
                  ? 'grid-cols-1 sm:grid-cols-2'
                  : 'grid-cols-1 sm:grid-cols-2'
              }`}
            >
              {course.assetOptions.map((opt) => {
                const active = data.selectedAsset === opt.value;
                return (
                  <label
                    key={opt.value}
                    className={`flex cursor-pointer items-center gap-2 rounded-md border bg-white px-3 py-3 font-heading text-sm font-medium text-brand-black transition-colors ${
                      active
                        ? 'border-brand-yellow ring-2 ring-brand-yellow/30'
                        : 'border-neutral-300 hover:border-neutral-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="selected-asset"
                      value={opt.value}
                      checked={active}
                      onChange={() => set('selectedAsset', opt.value)}
                      className="h-4 w-4 accent-brand-yellow"
                    />
                    <span className="leading-tight">{opt.label}</span>
                  </label>
                );
              })}
            </div>
          </Step>
        )}

        {error ? (
          <p
            role="alert"
            className="mt-4 text-center text-sm font-semibold text-red-600"
          >
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex flex-col items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center rounded-full bg-brand-yellow px-10 py-3 font-heading text-base font-black tracking-wide text-brand-black uppercase transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting
              ? 'Sending…'
              : step === 1
                ? "Let's Start"
                : step === TOTAL_STEPS
                  ? course.selectionCtaLabel
                  : 'Continue'}
          </button>

          {step > 1 ? (
            <button
              type="button"
              onClick={onPrev}
              className="inline-flex items-center gap-2 font-heading text-sm font-bold text-brand-black hover:text-neutral-600 transition-colors"
            >
              <span aria-hidden>←</span> Previous
            </button>
          ) : null}
        </div>

        {step === 1 ? (
          <div className="mt-8 text-center">
            <p className="font-heading text-sm font-bold text-brand-black">
              {course.subCopyLine1}
            </p>
            <p className="font-heading text-sm font-bold text-brand-black">
              {course.subCopyLine2}
            </p>
          </div>
        ) : null}

        {/* Lightweight progress dots so the user knows how far they are
            without a heavy progress bar. Hidden on step 1 to keep the
            landing-page feel clean. */}
        {step > 1 ? (
          <div className="mt-6 flex justify-center gap-1.5">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <span
                key={i}
                className={`block h-1.5 w-6 rounded-full transition-colors ${
                  i + 1 <= step ? 'bg-brand-yellow' : 'bg-neutral-200'
                }`}
              />
            ))}
          </div>
        ) : null}
      </form>

      <p className="mx-auto mt-8 max-w-xl text-center text-[11px] leading-relaxed text-text-muted">
        {DISCLAIMER}
      </p>
    </div>
  );
}

function Highlight({ children }: { children: ReactNode }) {
  return <span className="text-brand-yellow">{children}</span>;
}

function Step({
  heading,
  children,
}: {
  heading: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      <h2 className="text-center font-heading text-2xl font-black tracking-tight text-brand-black md:text-3xl">
        {heading}
      </h2>
      <div className="mt-6">{children}</div>
    </div>
  );
}

function FunnelInput({
  ariaLabel,
  placeholder,
  type = 'text',
  inputMode,
  autoComplete,
  value,
  onChange,
}: {
  ariaLabel: string;
  placeholder: string;
  type?: 'text' | 'email' | 'tel';
  inputMode?: 'text' | 'email' | 'tel' | 'numeric';
  autoComplete?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="sr-only">{ariaLabel}</span>
      <input
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={254}
        className="block w-full rounded-md border border-neutral-300 bg-white px-4 py-3 font-heading text-sm tracking-wide text-brand-black placeholder:text-neutral-400 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/30"
      />
    </label>
  );
}
