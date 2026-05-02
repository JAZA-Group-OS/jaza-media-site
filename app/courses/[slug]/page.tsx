import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CourseClaimForm } from '@/components/course/course-claim-form';
import { COURSE_SLUGS, getCourse } from '@/lib/courses/catalog';

type Params = Promise<{ slug: string }>;

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
  if (!course) {
    return { title: 'Course — JAZA Media' };
  }
  return {
    title: `${course.title} — Free Course | JAZA Media`,
    description: `Claim your free copy of ${course.title} from JAZA Media. Delivered to your inbox in under 30 seconds.`,
  };
}

export default async function CourseClaimPage({
  params,
}: {
  params: Params;
}) {
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course) notFound();
  return <CourseClaimForm course={course} />;
}
