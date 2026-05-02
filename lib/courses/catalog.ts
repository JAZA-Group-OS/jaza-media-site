// Lead-magnet catalog — single source of truth for the free assets the site
// hands out (the two free courses + the marketing templates pack).
//
// Despite the file/table name "course_requests", the slug 'marketing-templates'
// is also stored here. Keeping them in one catalog/table avoids a near-clone
// of the API route, validation, email helper, and admin manager. The form
// copy adapts per slug via the fields below.
//
// Asset URLs fall back to placeholders until the client provides the real
// download links. Set the corresponding env keys in production to override.

export type CourseSlug = 'marketing' | 'lead-generation' | 'marketing-templates';

export type CourseDetails = {
  slug: CourseSlug;
  // The full title shown on cards / metadata / admin tab — e.g.
  // "The 10K Rule of Marketing", "Marketing Templates".
  title: string;
  // Short label for the admin sidebar tab.
  shortName: string;
  // Visual hero image rendered above the form. Keep dimensions matching
  // the source asset so Next/Image can size it without CLS.
  heroImage: { src: string; alt: string; width: number; height: number };
  // The yellow-highlighted phrase inside the form H1:
  //   "Get instant access to your FREE [HIGHLIGHT][formHighlightSuffix] in under 30 seconds!"
  // Courses set HIGHLIGHT=`"The 10K Rule of Marketing"` and suffix=` course`.
  // Templates set HIGHLIGHT=`Marketing Templates` and suffix=`` (no extra word).
  formHighlight: string;
  formHighlightSuffix: string;
  // Email copy. Stored verbatim so we can pluralize ("are" vs "is") without
  // string-template logic in the email helper.
  emailSubject: string;
  emailHeading: string; // shown as <h1> in the email body
  emailButtonLabel: string;
  emailIntro: string; // sentence: "Thanks for claiming X. You can ... using the button below."
  // Two-line subcopy below the submit button. Plural noun differs (Course
  // vs Templates) and the social-proof number can vary per magnet.
  subCopyLine1: string;
  subCopyLine2: string;
  // Asset link the email points to.
  defaultAssetUrl: string;
  envKey:
    | 'COURSE_MARKETING_URL'
    | 'COURSE_LEAD_GENERATION_URL'
    | 'COURSE_MARKETING_TEMPLATES_URL';
};

const TWO_BOOKS_HERO = {
  src: '/images/2 books.png',
  alt: 'The 10K Rule of Marketing and The 10K Rule of Advertising',
  width: 1200,
  height: 900,
};

export const COURSE_CATALOG: Record<CourseSlug, CourseDetails> = {
  marketing: {
    slug: 'marketing',
    title: 'The 10K Rule of Marketing',
    shortName: 'Marketing Course',
    heroImage: TWO_BOOKS_HERO,
    formHighlight: '“The 10K Rule of Marketing”',
    formHighlightSuffix: ' course',
    emailSubject: 'Your free The 10K Rule of Marketing is here',
    emailHeading: 'Your free course is ready',
    emailButtonLabel: 'Open my course',
    emailIntro:
      'Thanks for claiming The 10K Rule of Marketing. You can open your course using the button below.',
    subCopyLine1: 'Get Your FREE Course in Less than 30 Seconds.',
    subCopyLine2: 'Requested by over 2,000 Business Owners.',
    defaultAssetUrl: 'https://jaza-media.com/courses/placeholder-marketing',
    envKey: 'COURSE_MARKETING_URL',
  },
  'lead-generation': {
    slug: 'lead-generation',
    title: 'The 10K Rule of Advertising',
    shortName: 'Lead Generation Course',
    heroImage: TWO_BOOKS_HERO,
    formHighlight: '“The 10K Rule of Advertising”',
    formHighlightSuffix: ' course',
    emailSubject: 'Your free The 10K Rule of Advertising is here',
    emailHeading: 'Your free course is ready',
    emailButtonLabel: 'Open my course',
    emailIntro:
      'Thanks for claiming The 10K Rule of Advertising. You can open your course using the button below.',
    subCopyLine1: 'Get Your FREE Course in Less than 30 Seconds.',
    subCopyLine2: 'Requested by over 2,000 Business Owners.',
    defaultAssetUrl:
      'https://jaza-media.com/courses/placeholder-lead-generation',
    envKey: 'COURSE_LEAD_GENERATION_URL',
  },
  'marketing-templates': {
    slug: 'marketing-templates',
    title: 'Marketing Templates',
    shortName: 'Marketing Templates',
    heroImage: {
      src: '/about-the-form/Marketing Templates.png',
      alt: 'JAZA Media marketing templates — How Gen Z Scale Business',
      width: 4000,
      height: 2250,
    },
    formHighlight: 'Marketing Templates',
    formHighlightSuffix: '',
    emailSubject: 'Your free Marketing Templates are here',
    emailHeading: 'Your free templates are ready',
    emailButtonLabel: 'Open my templates',
    emailIntro:
      'Thanks for claiming the JAZA Media Marketing Templates. You can open your templates using the button below.',
    subCopyLine1: 'Get Your FREE Templates in Less than 30 Seconds.',
    subCopyLine2: 'Requested by over 1,800 Business Owners.',
    defaultAssetUrl:
      'https://jaza-media.com/templates/placeholder-marketing-templates',
    envKey: 'COURSE_MARKETING_TEMPLATES_URL',
  },
};

export const COURSE_SLUGS: CourseSlug[] = [
  'marketing',
  'lead-generation',
  'marketing-templates',
];

export function isCourseSlug(value: string): value is CourseSlug {
  return (
    value === 'marketing' ||
    value === 'lead-generation' ||
    value === 'marketing-templates'
  );
}

export function getCourse(slug: string): CourseDetails | null {
  return isCourseSlug(slug) ? COURSE_CATALOG[slug] : null;
}

// Resolve the actual asset URL the user receives in the email. Reads the
// env override at call time so a deployment can swap in the real link
// without code changes.
export function resolveCourseAssetUrl(slug: CourseSlug): string {
  const course = COURSE_CATALOG[slug];
  return process.env[course.envKey] ?? course.defaultAssetUrl;
}
