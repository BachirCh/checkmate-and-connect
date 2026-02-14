import { z } from 'zod';

// Client-side validation schema (with File instanceof check)
export const memberSubmissionSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  jobTitle: z.string().min(2, 'Job title must be at least 2 characters').max(100, 'Job title must be less than 100 characters'),
  company: z.string().max(100, 'Company must be less than 100 characters').optional().or(z.literal('')),
  linkedIn: z
    .string()
    .url('LinkedIn URL must be a valid URL')
    .regex(/linkedin\.com/, 'LinkedIn URL must be from linkedin.com')
    .optional()
    .or(z.literal('')),
  photo: z
    .instanceof(File, { message: 'Photo is required' })
    .refine((file) => file.size <= 5 * 1024 * 1024, 'Photo must be less than 5MB')
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
      'Photo must be JPEG, PNG, or WebP'
    ),
  recaptchaToken: z.string().min(1, 'reCAPTCHA verification required'),
  _honey: z.string().optional(),
});

export type MemberSubmissionData = z.infer<typeof memberSubmissionSchema>;

// Server-side validation schema (photo will be validated manually from FormData)
export const serverMemberSubmissionSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  jobTitle: z.string().min(2, 'Job title must be at least 2 characters').max(100, 'Job title must be less than 100 characters'),
  company: z.string().max(100, 'Company must be less than 100 characters').optional().or(z.literal('')),
  linkedIn: z
    .string()
    .url('LinkedIn URL must be a valid URL')
    .regex(/linkedin\.com/, 'LinkedIn URL must be from linkedin.com')
    .optional()
    .or(z.literal('')),
  recaptchaToken: z.string().min(1, 'reCAPTCHA verification required'),
  _honey: z.string().optional(),
});
