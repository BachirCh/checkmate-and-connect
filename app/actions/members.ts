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
 * Approve a pending member submission.
 * Changes status to 'approved' and sets approvedAt timestamp.
 * Revalidates both admin and public paths for immediate visibility.
 */
export async function approveMember(memberId: string): Promise<ActionResult> {
  try {
    // Verify admin authorization first
    await verifySession();

    // Update member status to approved
    await writeClient
      .patch(memberId)
      .set({
        status: 'approved',
        approvedAt: new Date().toISOString(),
      })
      .commit();

    // Revalidate admin path (updates admin table immediately)
    revalidatePath('/admin/members');

    // Revalidate public path (approved member appears in directory immediately)
    revalidatePath('/members');

    return { success: true };
  } catch (error) {
    console.error('Failed to approve member:', error);
    return {
      success: false,
      error: 'Failed to approve member',
    };
  }
}

/**
 * Reject a pending member submission.
 * Changes status to 'rejected' and stores rejection reason.
 * Revalidates admin path only (rejected members never appear publicly).
 */
export async function rejectMember(
  memberId: string,
  reason?: string
): Promise<ActionResult> {
  try {
    // Verify admin authorization first
    await verifySession();

    // Update member status to rejected with reason
    await writeClient
      .patch(memberId)
      .set({
        status: 'rejected',
        rejectedAt: new Date().toISOString(),
        rejectionReason: reason || 'Did not meet approval criteria',
      })
      .commit();

    // Only revalidate admin path (rejected members never appear publicly)
    revalidatePath('/admin/members');

    return { success: true };
  } catch (error) {
    console.error('Failed to reject member:', error);
    return {
      success: false,
      error: 'Failed to reject member',
    };
  }
}

/**
 * Permanently delete a member from the database.
 * Revalidates both paths in case member was approved.
 */
export async function deleteMember(memberId: string): Promise<ActionResult> {
  try {
    // Verify admin authorization first
    await verifySession();

    // Permanently delete member document
    await writeClient.delete(memberId);

    // Revalidate admin path (removes from admin table)
    revalidatePath('/admin/members');

    // Revalidate public path (removes from public directory if was approved)
    revalidatePath('/members');

    return { success: true };
  } catch (error) {
    console.error('Failed to delete member:', error);
    return {
      success: false,
      error: 'Failed to delete member',
    };
  }
}

/**
 * Edit member text fields.
 * Accepts partial updates for name, jobTitle, company, linkedIn.
 * Revalidates both paths to reflect changes in public directory.
 */
export async function editMember(
  memberId: string,
  updates: {
    name?: string;
    jobTitle?: string;
    company?: string;
    linkedIn?: string;
  }
): Promise<ActionResult> {
  try {
    // Verify admin authorization first
    await verifySession();

    // Apply partial updates
    await writeClient.patch(memberId).set(updates).commit();

    // Revalidate admin path (updates admin table)
    revalidatePath('/admin/members');

    // Revalidate public path (changes reflect in public directory)
    revalidatePath('/members');

    return { success: true };
  } catch (error) {
    console.error('Failed to edit member:', error);
    return {
      success: false,
      error: 'Failed to edit member',
    };
  }
}
