'use server';

import { redirect } from 'next/navigation';
import { writeClient } from '@/lib/sanity/write-client';
import { talkProposalSchema } from '@/lib/validations/talk-proposal';
import { normaliseLinkedIn } from '@/lib/linkedin';
import { checkHoneypot, rateLimit } from '@/lib/spam-protection';
import { upcomingMeetupDates } from '@/lib/site';

export type TalkProposalState = {
  success: false;
  error: string;
  fieldErrors?: Record<string, string>;
} | null;

export async function submitTalkProposalAction(
  _prevState: TalkProposalState,
  formData: FormData
): Promise<TalkProposalState> {
  try {
    const fullName = ((formData.get('fullName') as string) ?? '').trim();
    const linkedIn = ((formData.get('linkedIn') as string) ?? '').trim();
    const subjectTitle = ((formData.get('subjectTitle') as string) ?? '').trim();
    const subjectDescription = (
      (formData.get('subjectDescription') as string) ?? ''
    ).trim();
    const preferredDate = ((formData.get('preferredDate') as string) ?? '').trim();
    const _honey = (formData.get('_honey') as string) ?? '';

    // Silent-ish fail for bots: never explain which check they tripped.
    if (checkHoneypot({ _honey })) {
      return { success: false, error: 'Submission failed. Please try again.' };
    }

    const rateLimitResult = rateLimit('talk_proposal', 10, 60000);
    if (!rateLimitResult.allowed) {
      return {
        success: false,
        error: 'Too many submissions. Please wait a moment and try again.',
      };
    }

    const validationResult = talkProposalSchema.safeParse({
      fullName,
      linkedIn,
      subjectTitle,
      subjectDescription,
      preferredDate,
      _honey,
    });

    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {};
      validationResult.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (typeof field === 'string' && !fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      });
      return {
        success: false,
        error: 'Please fix the errors in the form.',
        fieldErrors,
      };
    }

    // Re-derive the offered Wednesdays rather than trusting the posted value:
    // the page is cached, so a tab left open overnight can post a date that is
    // no longer on the list.
    const allowedDates = upcomingMeetupDates().map((option) => option.value);
    if (!allowedDates.includes(preferredDate)) {
      return {
        success: false,
        error: 'That date is no longer available. Please pick another one.',
        fieldErrors: { preferredDate: 'Please pick one of the dates listed.' },
      };
    }

    await writeClient.create({
      _type: 'talkProposal',
      fullName,
      linkedIn: normaliseLinkedIn(linkedIn) || undefined,
      subjectTitle,
      subjectDescription,
      preferredDate,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Talk proposal submission error:', error);
    return {
      success: false,
      error: 'Failed to send. Please try again.',
    };
  }

  // Outside the try/catch — redirect() works by throwing.
  redirect('/speak/confirmation');
}
