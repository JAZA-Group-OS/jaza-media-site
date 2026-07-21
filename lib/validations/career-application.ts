import { z } from 'zod';

const UploadedFileSchema = z.object({
  // Stores a Supabase Storage object key (e.g. "1715000000-resume.pdf"), not
  // an RFC URL — files are uploaded via a signed PUT and downloaded later by
  // path. Don't tighten this back to .url().
  url: z.string().trim().min(1, 'Missing file path').max(2048),
  filename: z.string().trim().min(1).max(256),
  size: z.number().int().nonnegative().max(100 * 1024 * 1024),
  type: z.string().trim().min(1).max(128),
});

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
  resume: UploadedFileSchema,
  portfolio: UploadedFileSchema,
});

export type CareerApplicationPayload = z.infer<typeof CareerApplicationSchema>;
