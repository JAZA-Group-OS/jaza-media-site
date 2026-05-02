import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { COURSE_SLUGS, getCourse } from '@/lib/courses/catalog';

type Params = Promise<{ slug: string }>;
type Search = Promise<{ e?: string }>;

export function generateStaticParams() {
  return COURSE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = getCourse(slug);
  return {
    title: course
      ? `Check your inbox — ${course.title} | JAZA Media`
      : 'Thank you — JAZA Media',
  };
}

export default async function CourseThankYouPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Search;
}) {
  const { slug } = await params;
  const { e: emailParam } = await searchParams;
  const course = getCourse(slug);
  if (!course) notFound();

  const maskedEmail = emailParam ? maskEmail(emailParam) : null;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16 text-center md:py-20">
      <div className="mx-auto inline-flex flex-col items-center leading-none">
        <span className="font-display text-5xl tracking-[0.15em] text-brand-black md:text-6xl">
          JAZA
        </span>
        <span className="mt-1 font-display text-xs tracking-[0.4em] text-brand-yellow">
          MEDIA
        </span>
      </div>

      <h1 className="mt-10 font-heading text-3xl font-black tracking-tight text-brand-black md:text-5xl">
        Check your <em className="font-black text-brand-yellow not-italic">inbox</em>
      </h1>

      <p className="mx-auto mt-6 max-w-xl text-base text-neutral-700 md:text-lg">
        Your free copy of <strong>{course.title}</strong> is on its way
        {maskedEmail ? (
          <>
            {' '}to <span className="font-semibold text-brand-black">{maskedEmail}</span>
          </>
        ) : null}
        .
      </p>

      <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-neutral-600 md:text-base">
        It usually arrives within a minute. If you don&rsquo;t see it, check your spam
        or promotions folder.
      </p>

      <Link
        href="/"
        className="mt-10 inline-flex items-center justify-center rounded-full border border-brand-black px-8 py-3 font-heading text-sm font-black tracking-wide text-brand-black uppercase transition-colors hover:bg-brand-black hover:text-white"
      >
        Back to home
      </Link>
    </div>
  );
}

// Show "j••••a@gmail.com" rather than the full address — the visitor knows
// the email they typed, the masked form just confirms it without exposing
// the full string in browser history / shoulder-surfing scenarios.
function maskEmail(email: string): string {
  const at = email.indexOf('@');
  if (at < 1) return email;
  const local = email.slice(0, at);
  const domain = email.slice(at);
  if (local.length <= 2) return local[0] + '••' + domain;
  return local[0] + '••••' + local[local.length - 1] + domain;
}
