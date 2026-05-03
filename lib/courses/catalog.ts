import { toAbsoluteUrl } from '@/lib/site-url';

// Lead-magnet catalog — single source of truth for the two free funnels:
//
//   "rule-of-10x"          — entered from either course card on the home
//                            page (Marketing Course / Lead Generation
//                            Course). The user picks Marketing or Advertising
//                            on step 5 of the funnel.
//   "marketing-templates"  — entered from the Marketing Templates card.
//                            User picks one of four templates on step 5.
//
// Both flows share the same 5-step REQUEST FORM (Name → Email → Phone →
// Shipping → Selection). The funnel reads its copy + selection options from
// here.
//
// Asset URLs are per-selected-asset (the thing they actually chose at step 5),
// not per-funnel-slug. Set the corresponding env keys in production to
// override the placeholder defaults.
//
// `defaultAssetUrl` may be either:
//   - an absolute URL (https://example.com/asset.pdf) for off-site links
//   - a path-relative URL (/ebooks/foo.pdf) for self-hosted assets in /public;
//     `resolveAssetUrl` expands these with the current deployment's base URL,
//     so they work in local dev, Vercel previews, and production without
//     hardcoding a domain.

export type CourseSlug = 'rule-of-10x' | 'marketing-templates';

// What the user picks on step 5. The values are stored in
// course_requests.selected_asset.
export type SelectedAsset =
  | 'rule_of_10x_marketing'
  | 'rule_of_10x_advertising'
  | 'sales_call_script'
  | 'ai_prompt'
  | 'content_calendar'
  | 'text';

export type AssetOption = {
  value: SelectedAsset;
  label: string; // shown next to the radio button
  envKey: string; // env var that overrides defaultAssetUrl
  defaultAssetUrl: string; // placeholder until the client provides the real link
};

export type CourseDetails = {
  slug: CourseSlug;
  // Tab title in admin + page title.
  title: string;
  shortName: string;
  // Hero image rendered above the funnel intro.
  heroImage: { src: string; alt: string; width: number; height: number };
  // Yellow-highlighted phrase in the intro H1:
  //   "Get instant access to your FREE [HIGHLIGHT][SUFFIX] in under 30 seconds!"
  formHighlight: string;
  formHighlightSuffix: string;
  // Two-line subcopy under the intro CTA.
  subCopyLine1: string;
  subCopyLine2: string;
  // Step 5 — the asset selection question.
  selectionQuestion: string; // "Which course would you like to access?" / "Which template..."
  selectionCtaLabel: string; // "GET MY COURSE" / "GET MY TEMPLATE"
  selectionLayoutCols: 2 | 1; // 2 cols for both flows; 4 templates wraps via grid
  assetOptions: AssetOption[];
};

const TWO_BOOKS_HERO = {
  src: '/images/2 books.png',
  alt: 'The 10K Rule of Marketing and The 10K Rule of Advertising',
  width: 1200,
  height: 900,
};

export const COURSE_CATALOG: Record<CourseSlug, CourseDetails> = {
  'rule-of-10x': {
    slug: 'rule-of-10x',
    title: 'The Rule of 10X',
    shortName: 'Rule of 10X',
    heroImage: TWO_BOOKS_HERO,
    formHighlight: '“The Rule of 10X”',
    formHighlightSuffix: ' course',
    subCopyLine1: 'Get Your FREE Course in Less than 30 Seconds.',
    subCopyLine2: 'Requested by over 2,000 Business Owners.',
    selectionQuestion: 'Which course would you like to access?',
    selectionCtaLabel: 'Get My Course',
    selectionLayoutCols: 2,
    assetOptions: [
      {
        value: 'rule_of_10x_marketing',
        label: 'The Rule of 10X Marketing',
        envKey: 'COURSE_RULE_OF_10X_MARKETING_URL',
        defaultAssetUrl: '/ebooks/the-rule-of-10x-marketing.pdf',
      },
      {
        value: 'rule_of_10x_advertising',
        label: 'The Rule of 10X Advertising',
        envKey: 'COURSE_RULE_OF_10X_ADVERTISING_URL',
        defaultAssetUrl:
          'https://jaza-media.com/courses/placeholder-rule-of-10x-advertising',
      },
    ],
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
    subCopyLine1: 'Get Your FREE Templates in Less than 30 Seconds.',
    subCopyLine2: 'Requested by over 1,800 Business Owners.',
    selectionQuestion: 'Which template would you like to access?',
    selectionCtaLabel: 'Get My Template',
    selectionLayoutCols: 2,
    assetOptions: [
      {
        value: 'sales_call_script',
        label: 'Sales Call Script',
        envKey: 'TEMPLATE_SALES_CALL_SCRIPT_URL',
        defaultAssetUrl:
          'https://jaza-media.com/templates/placeholder-sales-call-script',
      },
      {
        value: 'ai_prompt',
        label: 'AI Prompt',
        envKey: 'TEMPLATE_AI_PROMPT_URL',
        defaultAssetUrl: 'https://jaza-media.com/templates/placeholder-ai-prompt',
      },
      {
        value: 'content_calendar',
        label: 'Content Calendar',
        envKey: 'TEMPLATE_CONTENT_CALENDAR_URL',
        defaultAssetUrl:
          'https://jaza-media.com/templates/placeholder-content-calendar',
      },
      {
        value: 'text',
        label: 'Text',
        envKey: 'TEMPLATE_TEXT_URL',
        defaultAssetUrl: 'https://jaza-media.com/templates/placeholder-text',
      },
    ],
  },
};

export const COURSE_SLUGS: CourseSlug[] = ['rule-of-10x', 'marketing-templates'];

export function isCourseSlug(value: string): value is CourseSlug {
  return value === 'rule-of-10x' || value === 'marketing-templates';
}

export function getCourse(slug: string): CourseDetails | null {
  return isCourseSlug(slug) ? COURSE_CATALOG[slug] : null;
}

// Map a selected-asset value back to its catalog entry across all funnels.
// Used by the email helper to resolve the right URL + label without coupling
// to a particular slug.
export function findAssetOption(value: string): AssetOption | null {
  for (const slug of COURSE_SLUGS) {
    const found = COURSE_CATALOG[slug].assetOptions.find(
      (a) => a.value === value,
    );
    if (found) return found;
  }
  return null;
}

// Resolve the asset URL the user receives in the email. Reads the env override
// at call time so a deployment can swap in real PDF/landing links without
// code changes. Path-relative defaults (e.g. "/ebooks/foo.pdf") are expanded
// to absolute URLs against the current deployment's base URL.
export function resolveAssetUrl(value: string): string | null {
  const opt = findAssetOption(value);
  if (!opt) return null;
  const raw = process.env[opt.envKey] ?? opt.defaultAssetUrl;
  return toAbsoluteUrl(raw);
}
