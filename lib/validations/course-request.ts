import { z } from 'zod';

export const CourseRequestSchema = z.object({
  courseSlug: z.enum(['marketing', 'lead-generation', 'marketing-templates']),
  firstName: z.string().trim().min(1, 'First name is required').max(100),
  lastName: z.string().trim().min(1, 'Last name is required').max(100),
  email: z.string().trim().email('Invalid email').max(254),
  phone: z.string().trim().min(7, 'Phone is required').max(30),
});

export type CourseRequestPayload = z.infer<typeof CourseRequestSchema>;
