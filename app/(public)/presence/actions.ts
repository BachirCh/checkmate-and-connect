'use server';

import { writeClient } from '@/lib/sanity/write-client';
import { presenceSchema } from '@/lib/validations/presence';
import { checkHoneypot, rateLimit } from '@/lib/spam-protection';
import { todaysSessionISO } from '@/lib/event-date';

export type PresenceState =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string> }
  | null;

export async function submitPresenceAction(
  _prevState: PresenceState,
  formData: FormData
): Promise<PresenceState> {
  try {
    const fullName = ((formData.get('fullName') as string) ?? '').trim();
    const role = ((formData.get('role') as string) ?? '').trim();
    const company = ((formData.get('company') as string) ?? '').trim();
    const _honey = (formData.get('_honey') as string) ?? '';

    if (checkHoneypot({ _honey })) {
      return { ok: false, error: 'Could not check in. Please try again.' };
    }

    // The date is decided here, not by the page: a form left open from
    // Wednesday night must not file a check-in on Thursday.
    const eventDate = todaysSessionISO();
    if (!eventDate) {
      return { ok: false, error: 'Check-in is only open on Wednesdays.' };
    }

    // Loose: the whole room checks in at the door within a few minutes.
    const { allowed } = rateLimit('presence', 120, 60000);
    if (!allowed) {
      return { ok: false, error: 'Too busy right now. Please try again in a minute.' };
    }

    const result = presenceSchema.safeParse({ fullName, role, company, _honey });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (typeof field === 'string' && !fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      });
      return { ok: false, error: 'Please fill in all three fields.', fieldErrors };
    }

    await writeClient.create({
      _type: 'presence',
      fullName: result.data.fullName,
      role: result.data.role,
      company: result.data.company,
      eventDate,
      submittedAt: new Date().toISOString(),
    });

    return { ok: true };
  } catch (error) {
    console.error('Presence submission error:', error);
    return { ok: false, error: 'Could not check in. Please try again.' };
  }
}
