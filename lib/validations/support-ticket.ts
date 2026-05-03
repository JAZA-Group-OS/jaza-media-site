import { z } from 'zod';

/**
 * Server-side schema for /support form submissions.
 * Mirrors the shape of lib/validations/partner-inquiry.ts.
 *
 * `_hp` is the honeypot. The schema accepts any value (including non-empty);
 * the API route handler enforces the policy by silently 200ing without writing
 * when `_hp` is non-empty. Keep the schema policy-free so that test assertions
 * stay clean.
 */
const PHONE_REGEX = /^\+?[\d\s\-().]{7,20}$/;

export const SupportTicketSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Full name is required')
    .max(80, 'Full name is too long'),
  email: z
    .string()
    .trim()
    .email('Invalid email')
    .max(254),
  phone: z
    .string()
    .trim()
    .regex(PHONE_REGEX, 'Invalid phone number')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  topic: z.enum([
    'general',
    'course_rule_of_10x',
    'course_marketing_templates',
    'career_application_status',
    'partnership_followup',
    'billing',
    'other',
  ]),
  subject: z
    .string()
    .trim()
    .min(4, 'Subject is too short')
    .max(120, 'Subject is too long'),
  message: z
    .string()
    .trim()
    .min(10, 'Message is too short')
    .max(2000, 'Message is too long'),
  _hp: z.string().optional(),
});

export type SupportTicketPayload = z.infer<typeof SupportTicketSchema>;
