import { z } from 'zod';

// Client-side validation schema (with File instanceof check)
export const eventSubmissionSchema = z
  .object({
    title: z
      .string()
      .min(5, 'Title must be at least 5 characters')
      .max(100, 'Title must be less than 100 characters'),
    description: z
      .string()
      .min(20, 'Description must be at least 20 characters')
      .max(500, 'Description must be less than 500 characters'),
    eventType: z.enum(['one-time', 'recurring'], 'Please select an event type'),
    eventDateTime: z.string().optional(),
    recurrencePattern: z.string().optional(),
    author: z
      .string()
      .min(2, 'Organizer name must be at least 2 characters')
      .max(100, 'Organizer name must be less than 100 characters'),
    image: z
      .instanceof(File)
      .refine((file) => file.size === 0 || file.size <= 5 * 1024 * 1024, 'Image must be less than 5MB')
      .refine(
        (file) => file.size === 0 || ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
        'Image must be JPEG, PNG, or WebP'
      )
      .optional(),
    recaptchaToken: z.string().optional(),
    _honey: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.eventType === 'one-time') {
        return !!data.eventDateTime && data.eventDateTime.trim().length > 0;
      }
      return true;
    },
    {
      message: 'Date & time is required for one-time events',
      path: ['eventDateTime'],
    }
  )
  .refine(
    (data) => {
      if (data.eventType === 'recurring') {
        return !!data.recurrencePattern && data.recurrencePattern.trim().length > 0;
      }
      return true;
    },
    {
      message: 'Recurrence pattern is required for recurring events',
      path: ['recurrencePattern'],
    }
  );

export type EventSubmissionData = z.infer<typeof eventSubmissionSchema>;

// Server-side validation schema (image will be validated manually from FormData)
export const serverEventSubmissionSchema = z
  .object({
    title: z
      .string()
      .min(5, 'Title must be at least 5 characters')
      .max(100, 'Title must be less than 100 characters'),
    description: z
      .string()
      .min(20, 'Description must be at least 20 characters')
      .max(500, 'Description must be less than 500 characters'),
    eventType: z.enum(['one-time', 'recurring'], 'Please select an event type'),
    eventDateTime: z.string().optional(),
    recurrencePattern: z.string().optional(),
    author: z
      .string()
      .min(2, 'Organizer name must be at least 2 characters')
      .max(100, 'Organizer name must be less than 100 characters'),
    recaptchaToken: z.string().min(1, 'reCAPTCHA verification required'),
    _honey: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.eventType === 'one-time') {
        return !!data.eventDateTime && data.eventDateTime.trim().length > 0;
      }
      return true;
    },
    {
      message: 'Date & time is required for one-time events',
      path: ['eventDateTime'],
    }
  )
  .refine(
    (data) => {
      if (data.eventType === 'recurring') {
        return !!data.recurrencePattern && data.recurrencePattern.trim().length > 0;
      }
      return true;
    },
    {
      message: 'Recurrence pattern is required for recurring events',
      path: ['recurrencePattern'],
    }
  );
