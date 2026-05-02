// Course catalog — single source of truth for the two free courses offered
// from the home page's "FREE ADVANCE MARKETING" section. The asset URL is
// what gets emailed to the user after they fill the claim form. Keep these
// in sync with components/free-marketing-section.tsx and the CourseCard
// bookVariant choices in components/course-card.tsx.
//
// The asset URL falls back to a placeholder until the client provides the
// real PDF/landing-page link. Set COURSE_MARKETING_URL and
// COURSE_LEAD_GENERATION_URL in env to override.

export type CourseSlug = 'marketing' | 'lead-generation';

export type CourseDetails = {
  slug: CourseSlug;
  title: string;
  shortName: string;
  bookVariant: 'marketing' | 'advertising';
  defaultAssetUrl: string;
  envKey: 'COURSE_MARKETING_URL' | 'COURSE_LEAD_GENERATION_URL';
};

export const COURSE_CATALOG: Record<CourseSlug, CourseDetails> = {
  marketing: {
    slug: 'marketing',
    title: 'The 10K Rule of Marketing',
    shortName: 'Marketing Course',
    bookVariant: 'marketing',
    defaultAssetUrl: 'https://jaza-media.com/courses/placeholder-marketing',
    envKey: 'COURSE_MARKETING_URL',
  },
  'lead-generation': {
    slug: 'lead-generation',
    title: 'The 10K Rule of Advertising',
    shortName: 'Lead Generation Course',
    bookVariant: 'advertising',
    defaultAssetUrl: 'https://jaza-media.com/courses/placeholder-lead-generation',
    envKey: 'COURSE_LEAD_GENERATION_URL',
  },
};

export const COURSE_SLUGS: CourseSlug[] = ['marketing', 'lead-generation'];

export function isCourseSlug(value: string): value is CourseSlug {
  return value === 'marketing' || value === 'lead-generation';
}

export function getCourse(slug: string): CourseDetails | null {
  return isCourseSlug(slug) ? COURSE_CATALOG[slug] : null;
}

// Resolve the actual asset URL the user receives in the email. Reads the
// env override at call time so a deployment can swap in the real PDF link
// without code changes.
export function resolveCourseAssetUrl(slug: CourseSlug): string {
  const course = COURSE_CATALOG[slug];
  return process.env[course.envKey] ?? course.defaultAssetUrl;
}
