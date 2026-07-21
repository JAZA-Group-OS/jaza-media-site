import { z } from 'zod';

const SHIPPING_FIELD = (label: string) =>
  z.string().trim().min(1, `${label} is required`).max(200);

export const CourseRequestSchema = z.object({
  courseSlug: z.enum(['rule-of-10x', 'marketing-templates']),
  firstName: z.string().trim().min(1, 'First name is required').max(100),
  lastName: z.string().trim().min(1, 'Last name is required').max(100),
  email: z.string().trim().email('Invalid email').max(254),
  phone: z.string().trim().min(7, 'Phone is required').max(30),
  shippingStreet: SHIPPING_FIELD('Street address'),
  shippingCity: SHIPPING_FIELD('City'),
  shippingState: SHIPPING_FIELD('State / region'),
  shippingCountry: SHIPPING_FIELD('Country / region'),
  shippingPostal: SHIPPING_FIELD('ZIP / postal'),
  selectedAsset: z.enum([
    'rule_of_10x_marketing',
    'rule_of_10x_advertising',
    'sales_call_script',
    'ai_prompt',
  ]),
});

export type CourseRequestPayload = z.infer<typeof CourseRequestSchema>;
