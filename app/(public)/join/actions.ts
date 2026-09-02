'use server';

import { redirect } from 'next/navigation';
import { writeClient } from '@/lib/sanity/write-client';
import { serverMemberSubmissionSchema } from '@/lib/validations/member-submission';
import { checkHoneypot, rateLimit } from '@/lib/spam-protection';

export async function submitMemberAction(prevState: any, formData: FormData) {
  try {
    // Extract fields from FormData
    const name = formData.get('name') as string;
    const jobTitle = formData.get('jobTitle') as string;
    const role = formData.get('role') as string;
    const company = formData.get('company') as string;
    const linkedIn = formData.get('linkedIn') as string;
    const _honey = formData.get('_honey') as string;

    // SPAM PROTECTION LAYER 1: Honeypot check
    if (checkHoneypot({ _honey })) {
      // Silent fail for bots (don't reveal honeypot logic)
      return { success: false, error: 'Submission failed. Please try again.' };
    }

    // SPAM PROTECTION LAYER 2: Rate limiting
    const rateLimitResult = rateLimit('member_submission', 10, 60000);
    if (!rateLimitResult.allowed) {
      return {
        success: false,
        error: 'Too many submissions. Please wait a moment before trying again.',
      };
    }

    // Validate text fields with Zod
    const validationResult = serverMemberSubmissionSchema.safeParse({
      name,
      jobTitle,
      role,
      company,
      linkedIn,
      _honey,
    });

    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {};
      validationResult.error.issues.forEach((err: any) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      return {
        success: false,
        error: 'Please fix the errors in the form.',
        fieldErrors,
      };
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    // Create member document with status: pending
    await writeClient.create({
      _type: 'member',
      name,
      slug: {
        _type: 'slug',
        current: slug,
      },
      jobTitle,
      role: validationResult.data.role,
      company: company || undefined,
      linkedIn: linkedIn || undefined,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    });

    // Success - redirect handled outside try/catch
  } catch (error) {
    console.error('Member submission error:', error);
    return {
      success: false,
      error: 'Failed to submit. Please try again.',
    };
  }

  // Redirect outside try/catch (Next.js redirect throws internally)
  redirect('/join/confirmation');
}
