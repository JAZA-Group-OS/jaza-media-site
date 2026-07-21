import { z } from 'zod';

// Object keys minted by /api/career-upload-url look like
// `${Date.now()}-${sanitized}` where sanitized is the original filename
// reduced to [A-Za-z0-9._-] and capped at 128 chars. Submissions must
// reference exactly that shape — free-form strings and external URLs are
// rejected so the admin dashboard only ever links files our own mint route
// could have produced.
const OBJECT_KEY_RE = /^\d{10,16}-[A-Za-z0-9._-]{1,128}$/;

// MIME allowlists must stay in sync with ALLOWED_MIME in
// app/api/career-upload-url/route.ts (and the storage bucket config).
export const RESUME_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const;

export const PORTFOLIO_MIME_TYPES = [
  'application/pdf',
  'application/zip',
  'application/x-zip-compressed',
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

function uploadedFileSchema(allowedTypes: readonly string[]) {
  return z.object({
    // A Supabase Storage object key (e.g. "1715000000000-resume.pdf"), not an
    // RFC URL — files are uploaded via a signed PUT and downloaded later by
    // path, so don't tighten this to .url(). The regex pin is load-bearing;
    // see OBJECT_KEY_RE above.
    url: z.string().trim().regex(OBJECT_KEY_RE, 'Invalid file path'),
    filename: z.string().trim().min(1).max(256),
    size: z
      .number()
      .int()
      .positive('File is empty')
      .max(100 * 1024 * 1024),
    type: z
      .string()
      .trim()
      .refine((v) => allowedTypes.includes(v), 'Unsupported file type'),
  });
}

export const CareerApplicationSchema = z.object({
  location: z.enum(['luzon', 'visayas', 'mindanao']),
  fullName: z.string().trim().min(2, 'Please enter your full name').max(100),
  email: z.string().trim().email('Invalid email').max(254),
  phone: z.string().trim().min(7, 'Phone is required').max(30),
  facebook: z
    .string()
    .trim()
    .min(4, 'Please provide your Facebook profile')
    .max(512),
  position: z.enum([
    'advertiser',
    'sales_closer',
    'social_media_manager',
    'graphic_artist',
    'video_editor',
    'other',
  ]),
  description: z
    .string()
    .trim()
    .min(10, 'Please write at least one short sentence')
    .max(1000),
  resume: uploadedFileSchema(RESUME_MIME_TYPES),
  portfolio: uploadedFileSchema(PORTFOLIO_MIME_TYPES),
});

export type CareerApplicationPayload = z.infer<typeof CareerApplicationSchema>;
