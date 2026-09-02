import { z } from 'zod';

/**
 * Minimums are deliberately tiny. This gets filled in on a phone, standing up,
 * at the end of the evening — "the coffee" is a legitimate answer and the form
 * should not argue with it.
 */
export const eventFeedbackSchema = z.object({
  // Optional: plenty of people would rather say the honest thing unsigned,
  // and a name is not what makes the answer useful.
  fullName: z
    .string()
    .max(100, 'Please keep this under 100 characters.')
    .optional(),
  liked: z
    .string()
    .min(3, 'Tell us one thing.')
    .max(500, 'Please keep this under 500 characters.'),
  improve: z
    .string()
    .min(3, 'Tell us one thing.')
    .max(500, 'Please keep this under 500 characters.'),
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Missing session date.'),
  _honey: z.string().optional(),
});

export type EventFeedbackData = z.infer<typeof eventFeedbackSchema>;
