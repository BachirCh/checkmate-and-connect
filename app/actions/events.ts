'use server';

import 'server-only'; // CRITICAL: prevent client-side bundle inclusion
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { verifySession } from '@/lib/auth/dal';
import { writeClient } from '@/lib/sanity/write-client';
import { checkHoneypot, verifyRecaptcha, rateLimit } from '@/lib/spam-protection';

// Types for action results
type ActionResult = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

/**
 * Submit a new event for review.
 * Public endpoint with three-layer spam protection.
 * Creates event with status='pending' for admin review.
 */
export async function submitEventAction(prevState: any, formData: FormData) {
  try {
    // Extract fields from FormData
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const eventType = formData.get('eventType') as string;
    const eventDateTime = formData.get('eventDateTime') as string;
    const recurrencePattern = formData.get('recurrencePattern') as string;
    const author = formData.get('author') as string;
    const image = formData.get('image') as File | null;
    const recaptchaToken = formData.get('recaptchaToken') as string;
    const honey = formData.get('_honey') as string;

    // SPAM PROTECTION LAYER 1: Honeypot check
    const formDataObj = { _honey: honey };
    if (checkHoneypot(formDataObj)) {
      // Silent rejection for bots
      return { success: false, error: 'Submission failed' };
    }

    // SPAM PROTECTION LAYER 2: Rate limiting
    const rateLimitResult = rateLimit('event_submission', 5, 60000);
    if (!rateLimitResult.allowed) {
      return {
        success: false,
        error: 'Too many submissions. Please try again later.',
      };
    }

    // reCAPTCHA disabled for now
    // const recaptchaResult = await verifyRecaptcha(recaptchaToken, 'event_submission');
    // if (!recaptchaResult.success) {
    //   return {
    //     success: false,
    //     error: 'Verification failed. Please try again.',
    //   };
    // }

    // Validate required fields
    if (!title || title.length < 5 || title.length > 100) {
      return {
        success: false,
        error: 'Title must be 5-100 characters',
        fieldErrors: { title: 'Title must be 5-100 characters' },
      };
    }

    if (!description || description.length < 20 || description.length > 500) {
      return {
        success: false,
        error: 'Description must be 20-500 characters',
        fieldErrors: { description: 'Description must be 20-500 characters' },
      };
    }

    if (!author || author.length < 2) {
      return {
        success: false,
        error: 'Organizer name required',
        fieldErrors: { author: 'Organizer name required' },
      };
    }

    // Conditional validation for event type
    if (eventType === 'one-time' && !eventDateTime) {
      return {
        success: false,
        error: 'Date & time required for one-time events',
        fieldErrors: { eventDateTime: 'Date & time required for one-time events' },
      };
    }

    if (eventType === 'recurring' && !recurrencePattern) {
      return {
        success: false,
        error: 'Recurrence pattern required for recurring events',
        fieldErrors: { recurrencePattern: 'Recurrence pattern required for recurring events' },
      };
    }

    // Validate image if provided
    if (image && image.size > 0) {
      if (image.size > 5 * 1024 * 1024) {
        return {
          success: false,
          error: 'Image must be under 5MB',
          fieldErrors: { image: 'Image must be under 5MB' },
        };
      }
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(image.type)) {
        return {
          success: false,
          error: 'Image must be JPEG, PNG, or WebP',
          fieldErrors: { image: 'Image must be JPEG, PNG, or WebP' },
        };
      }
    }

    // Upload image if provided
    let imageAsset = null;
    if (image && image.size > 0) {
      const imageBuffer = await image.arrayBuffer();
      imageAsset = await writeClient.assets.upload('image', Buffer.from(imageBuffer), {
        filename: image.name,
        contentType: image.type,
      });
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Create event document
    await writeClient.create({
      _type: 'event',
      title,
      slug: { _type: 'slug', current: slug },
      description,
      eventType,
      ...(eventType === 'one-time' && { eventDateTime }),
      ...(eventType === 'recurring' && { recurrencePattern }),
      author,
      ...(imageAsset && {
        image: {
          _type: 'image',
          asset: { _type: 'reference', _ref: imageAsset._id },
        },
      }),
      status: 'pending',
      submittedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Event submission error:', error);
    return {
      success: false,
      error: 'Failed to submit event. Please try again.',
    };
  }

  // Redirect outside try/catch (Next.js redirect throws internally)
  redirect('/events/submit/confirmation');
}

/**
 * Approve a pending event submission.
 * Changes status to 'approved' and sets approvedAt timestamp.
 * Revalidates both admin and public paths for immediate visibility.
 */
export async function approveEvent(eventId: string): Promise<ActionResult> {
  try {
    // Verify admin authorization first
    await verifySession();

    // Update event status to approved
    await writeClient
      .patch(eventId)
      .set({
        status: 'approved',
        approvedAt: new Date().toISOString(),
      })
      .commit();

    // Revalidate admin path (updates admin table immediately)
    revalidatePath('/admin/events');

    // Revalidate public path (approved event appears in public listing immediately)
    revalidatePath('/events');

    return { success: true };
  } catch (error) {
    console.error('Failed to approve event:', error);
    return {
      success: false,
      error: 'Failed to approve event',
    };
  }
}

/**
 * Reject a pending event submission.
 * Changes status to 'rejected' and stores rejection reason.
 * Revalidates admin path only (rejected events never appear publicly).
 */
export async function rejectEvent(
  eventId: string,
  reason?: string
): Promise<ActionResult> {
  try {
    // Verify admin authorization first
    await verifySession();

    // Update event status to rejected with reason
    await writeClient
      .patch(eventId)
      .set({
        status: 'rejected',
        rejectedAt: new Date().toISOString(),
        rejectionReason: reason || 'Did not meet approval criteria',
      })
      .commit();

    // Only revalidate admin path (rejected events never appear publicly)
    revalidatePath('/admin/events');

    return { success: true };
  } catch (error) {
    console.error('Failed to reject event:', error);
    return {
      success: false,
      error: 'Failed to reject event',
    };
  }
}

/**
 * Permanently delete an event from the database.
 * Revalidates both paths in case event was approved.
 */
export async function deleteEvent(eventId: string): Promise<ActionResult> {
  try {
    // Verify admin authorization first
    await verifySession();

    // Permanently delete event document
    await writeClient.delete(eventId);

    // Revalidate admin path (removes from admin table)
    revalidatePath('/admin/events');

    // Revalidate public path (removes from public listing if was approved)
    revalidatePath('/events');

    return { success: true };
  } catch (error) {
    console.error('Failed to delete event:', error);
    return {
      success: false,
      error: 'Failed to delete event',
    };
  }
}
