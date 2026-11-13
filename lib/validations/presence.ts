import { z } from 'zod';

/**
 * Check-in at the door. Three short fields, filled in on a phone in a queue,
 * so the rules only stop empty or absurd answers.
 */
export const presenceSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Tell us your name.')
    .max(100, 'Please keep this under 100 characters.'),
  // Free text: "Founder", "PM", "Student" — whatever people call themselves.
  role: z
    .string()
    .trim()
    .min(2, 'Tell us your role.')
    .max(100, 'Please keep this under 100 characters.'),
  company: z
    .string()
    .trim()
    .min(1, 'Tell us where you work.')
    .max(100, 'Please keep this under 100 characters.'),
  // Must be ticked. Checked again on the server — the checkbox alone is only
  // a courtesy, a crafted request would skip it.
  agreedToTerms: z.boolean().refine((agreed) => agreed === true, {
    message: 'Please agree to the Terms & Conditions.',
  }),
  _honey: z.string().optional(),
});

export type PresenceData = z.infer<typeof presenceSchema>;
