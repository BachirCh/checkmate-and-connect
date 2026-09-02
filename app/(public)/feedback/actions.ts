'use server';

import { writeClient } from '@/lib/sanity/write-client';
import { eventFeedbackSchema } from '@/lib/validations/event-feedback';
import { checkHoneypot, rateLimit } from '@/lib/spam-protection';

export type FeedbackState =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string> }
  | null;

/** Roughly a year either side of today — enough to catch a typo'd URL, loose
 *  enough that a make-up session or a late entry still goes through. */
const WINDOW_DAYS = 365;

export async function submitFeedbackAction(
  _prevState: FeedbackState,
  formData: FormData
): Promise<FeedbackState> {
  try {
    const fullName = ((formData.get('fullName') as string) ?? '').trim();
    const liked = ((formData.get('liked') as string) ?? '').trim();
    const improve = ((formData.get('improve') as string) ?? '').trim();
    const eventDate = ((formData.get('eventDate') as string) ?? '').trim();
    const _honey = (formData.get('_honey') as string) ?? '';

    if (checkHoneypot({ _honey })) {
      return { ok: false, error: 'Could not send. Please try again.' };
    }

    // Looser than the other forms: a whole room fills this in at once.
    const { allowed } = rateLimit('event_feedback', 60, 60000);
    if (!allowed) {
      return { ok: false, error: 'Too busy right now. Please try again in a minute.' };
    }

    const result = eventFeedbackSchema.safeParse({
      fullName,
      liked,
      improve,
      eventDate,
      _honey,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (typeof field === 'string' && !fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      });
      return { ok: false, error: 'Please fill in both answers.', fieldErrors };
    }

    // eventDate arrives from the URL via a hidden field, so it is user input:
    // keep it near today rather than letting anyone open a session in 1970.
    const days = Math.abs(
      (new Date(`${eventDate}T12:00:00Z`).getTime() - Date.now()) / 86_400_000
    );
    if (!Number.isFinite(days) || days > WINDOW_DAYS) {
      return { ok: false, error: 'This form link is not valid.' };
    }

    await writeClient.create({
      _type: 'eventFeedback',
      // Omit rather than store '' — the Studio preview and the admin list both
      // fall back to "Anonymous" on a missing name, not on an empty one.
      fullName: fullName || undefined,
      liked,
      improve,
      eventDate,
      submittedAt: new Date().toISOString(),
    });

    return { ok: true };
  } catch (error) {
    console.error('Event feedback submission error:', error);
    return { ok: false, error: 'Could not send. Please try again.' };
  }
}
