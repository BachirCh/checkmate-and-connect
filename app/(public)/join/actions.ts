'use server';

import { redirect } from 'next/navigation';
import { writeClient } from '@/lib/sanity/write-client';
import { serverMemberSubmissionSchema } from '@/lib/validations/member-submission';
import { checkHoneypot, rateLimit, verifyRecaptcha } from '@/lib/spam-protection';

export async function submitMemberAction(prevState: any, formData: FormData) {
  try {
    // Extract fields from FormData
    const name = formData.get('name') as string;
    const jobTitle = formData.get('jobTitle') as string;
    const company = formData.get('company') as string;
    const linkedIn = formData.get('linkedIn') as string;
    const photo = formData.get('photo') as File;
    const recaptchaToken = formData.get('recaptchaToken') as string;
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

    // SPAM PROTECTION LAYER 3: reCAPTCHA verification (TEMPORARILY DISABLED)
    // TODO: Re-enable after configuring reCAPTCHA properly
    // const recaptchaResult = await verifyRecaptcha(recaptchaToken, 'member_submission');
    // if (!recaptchaResult.success || recaptchaResult.score < 0.5) {
    //   return {
    //     success: false,
    //     error: 'reCAPTCHA verification failed. Please try again.',
    //   };
    // }

    // Validate text fields with Zod
    const validationResult = serverMemberSubmissionSchema.safeParse({
      name,
      jobTitle,
      company,
      linkedIn,
      recaptchaToken,
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

    // Validate photo separately (File validation)
    if (!photo || !(photo instanceof File) || photo.size === 0) {
      return {
        success: false,
        error: 'Photo is required.',
        fieldErrors: { photo: 'Photo is required' },
      };
    }

    if (photo.size > 5 * 1024 * 1024) {
      return {
        success: false,
        error: 'Photo must be less than 5MB.',
        fieldErrors: { photo: 'Photo must be less than 5MB' },
      };
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(photo.type)) {
      return {
        success: false,
        error: 'Photo must be JPEG, PNG, or WebP.',
        fieldErrors: { photo: 'Photo must be JPEG, PNG, or WebP' },
      };
    }

    // Upload photo to Sanity CDN
    const imageAsset = await writeClient.assets.upload('image', photo, {
      filename: photo.name,
      contentType: photo.type,
    });

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
      company: company || undefined,
      linkedIn: linkedIn || undefined,
      photo: {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: imageAsset._id,
        },
      },
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
