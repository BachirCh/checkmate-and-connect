'use server';

import 'server-only'; // CRITICAL: prevent client-side bundle inclusion
import { revalidatePath } from 'next/cache';
import { verifySession } from '@/lib/auth/dal';
import { writeClient } from '@/lib/sanity/write-client';

// Types for action results
type ActionResult = {
  success: boolean;
  error?: string;
};

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
