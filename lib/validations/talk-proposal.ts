import { z } from 'zod';

/**
 * Shared by the client form and the server action, so a visitor never sees a
 * rule on submit that the field did not already enforce on blur.
 *
 * `preferredDate` is only shape-checked here — the list of Wednesdays it has
 * to be one of moves every week, so the server re-derives it at submit time.
 */
export const talkProposalSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Please enter your full name.')
    .max(100, 'Please keep this under 100 characters.'),
  linkedIn: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine(
      (val) => !val || (val.startsWith('http') && val.includes('linkedin.com')),
      'Please paste a linkedin.com link, starting with https://'
    ),
  subjectTitle: z
    .string()
    .min(4, 'Please give your talk a title.')
    .max(120, 'Please keep the title under 120 characters.'),
  subjectDescription: z
    .string()
    .min(30, 'Please write at least a couple of sentences.')
    .max(1000, 'Please keep this under 1000 characters.'),
  preferredDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Please pick a date.'),
  _honey: z.string().optional(),
});

export type TalkProposalData = z.infer<typeof talkProposalSchema>;
