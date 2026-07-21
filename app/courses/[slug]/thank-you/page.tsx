import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  COURSE_SLUGS,
  findAssetOption,
  getCourse,
} from '@/lib/courses/catalog';

type Params = Promise<{ slug: string }>;
// `a` = selected asset; `es` = email status ("pending" when the delivery
// email could not be sent, so the copy shouldn't promise an inbox).
type Search = Promise<{ a?: string; es?: string }>;

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
    robots: { index: false, follow: false },
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
  const { a: assetParam, es } = await searchParams;
  const course = getCourse(slug);
  if (!course) notFound();

  // What asset they actually picked at step 5; falls back to the funnel
  // shortName if missing so the copy still reads sensibly.
  const asset = assetParam ? findAssetOption(assetParam) : null;
  const assetLabel = asset?.label ?? course.shortName;
  const isTemplates = course.slug === 'marketing-templates';
  const emailPending = es === 'pending';

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-16 text-center md:py-20">
      <div className="mx-auto inline-flex flex-col items-center leading-none">
        <span className="font-display text-5xl tracking-[0.15em] text-brand-black md:text-6xl">
          JAZA
        </span>
        <span className="mt-1 font-display text-xs tracking-[0.4em] text-brand-yellow">
          MEDIA
        </span>
      </div>

      <h1 className="mt-10 font-heading text-3xl font-black leading-tight tracking-tight text-brand-black md:text-4xl">
        {emailPending ? (
          <>
            Your{' '}
            <em className="font-black text-brand-yellow not-italic">
              FREE {isTemplates ? 'Template' : 'Course'}
            </em>{' '}
            Request Is Confirmed!
          </>
        ) : (
          <>
            Check Your Email for Your{' '}
            <em className="font-black text-brand-yellow not-italic">
              FREE {isTemplates ? 'Template' : 'Course'}!
            </em>
          </>
        )}
      </h1>

      <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-neutral-700 md:text-base">
        Thank you for your interest in studying{' '}
        <strong>{assetLabel}</strong> by JAZA Media.
      </p>

      {emailPending ? (
        <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-neutral-700 md:text-base">
          We&rsquo;re preparing your delivery email. If it doesn&rsquo;t reach
          your inbox (or spam folder) within a few minutes, please reach out
          via our{' '}
          <Link href="/support" className="font-semibold underline">
            support page
          </Link>{' '}
          and we&rsquo;ll send it to you directly.
        </p>
      ) : null}

      <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-neutral-700 md:text-base">
        We truly appreciate your enthusiasm and commitment to growth, and we
        encourage you to continue strengthening your business foundation. As
        part of this journey, you may also explore JAZA Media&rsquo;s other
        free resources&mdash;designed to help you stay aligned with current
        market trends while providing practical, actionable guidance to support
        your business growth.
      </p>

      <div className="mt-10 flex justify-center">
        <Image
          src="/images/2 books.png"
          alt="JAZA Media — The 10K Rule of Marketing & Advertising"
          width={1200}
          height={900}
          sizes="(min-width: 768px) 360px, 70vw"
          className="block h-auto w-[260px] md:w-[340px]"
        />
      </div>

      <Link
        href="/#free-advance-marketing"
        className="mt-8 inline-flex items-center justify-center rounded-full bg-brand-yellow px-8 py-3 font-heading text-sm font-black tracking-wide text-brand-black transition-transform hover:scale-[1.02]"
      >
        Take Another Course
      </Link>

      <p className="mx-auto mt-10 max-w-xl text-sm leading-relaxed text-neutral-700 md:text-base">
        We look forward to the possibility of working with you in the future
        and learning more about your business. Our team is excited to explore
        how we can support you in reaching your next level of growth and
        success. Thank you again, and we hope to connect with you soon.
      </p>
    </div>
  );
}
