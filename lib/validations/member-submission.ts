import { z } from 'zod';
import { ROLE_VALUES } from '@/lib/content/roles';

// Client-side validation schema (with File instanceof check)
export const memberSubmissionSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  jobTitle: z.string().min(2, 'Job title must be at least 2 characters').max(100, 'Job title must be less than 100 characters'),
  role: z.enum(ROLE_VALUES, { message: 'Pick the role that fits you best' }),
  company: z.string().max(100, 'Company must be less than 100 characters').optional().or(z.literal('')),
  linkedIn: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine(
      (val) => !val || val === '' || (val.startsWith('http') && val.includes('linkedin.com')),
      'LinkedIn URL must be a valid URL from linkedin.com'
    ),
  _honey: z.string().optional(),
});

export type MemberSubmissionData = z.infer<typeof memberSubmissionSchema>;

// Server-side validation schema (photo will be validated manually from FormData)
export const serverMemberSubmissionSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  jobTitle: z.string().min(2, 'Job title must be at least 2 characters').max(100, 'Job title must be less than 100 characters'),
  role: z.enum(ROLE_VALUES, { message: 'Pick the role that fits you best' }),
  company: z.string().max(100, 'Company must be less than 100 characters').optional().or(z.literal('')),
  linkedIn: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine(
      (val) => !val || val === '' || (val.startsWith('http') && val.includes('linkedin.com')),
      'LinkedIn URL must be a valid URL from linkedin.com'
    ),
  _honey: z.string().optional(),
});
