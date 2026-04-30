import { z } from 'zod';

/**
 * Server-side schema for the marketing site's 12-question funnel submission.
 * Mirrors the Answers type in lib/partner/questions.ts but with explicit
 * required/optional fields and length caps for safety against bad input.
 */
export const PartnerInquirySchema = z.object({
  location: z.enum(['philippines', 'australia', 'others']).optional(),
  fullName: z.string().trim().min(1, 'Full name is required').max(100),
  businessType: z
    .enum(['service', 'brick_and_mortar', 'ecommerce', 'software', 'e_learning', 'other'])
    .optional(),
  description: z.string().trim().max(1000).optional(),
  helpType: z
    .enum(['advertising', 'media_content', 'marketing_mgmt', 'branding', 'web_dev', 'audit_growth'])
    .optional(),
  monthlyRevenue: z
    .enum(['0', '10k_50k', '50k_150k', '150k_500k', '500k_1m', '1m_3m'])
    .optional(),
  willingToInvest: z.enum(['yes', 'if_proven', 'no']).optional(),
  budget: z
    .enum(['30k_50k', '50k_80k', '80k_150k', '150k_200k', '200k_500k', '500k_plus'])
    .optional(),
  challenge: z.string().trim().max(2000).optional(),
  timeline: z.enum(['asap', 'next_month', 'just_exploring']).optional(),
  phone: z.string().trim().min(1, 'Phone is required').max(30),
  email: z.string().trim().email('Invalid email').max(254),
});

export type PartnerInquiryPayload = z.infer<typeof PartnerInquirySchema>;
