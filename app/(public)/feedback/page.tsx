import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { currentSessionSlug } from '@/lib/event-date';

/**
 * /feedback with no date hands off to the session currently being collected —
 * the most recent Wednesday. So /feedback is a link that keeps working: it can
 * go on a slide, in a bio or on a sticker without being reprinted weekly.
 *
 * force-dynamic is load-bearing. The target changes every Wednesday, and this
 * page would otherwise be prerendered at build time and keep redirecting to
 * whichever session was current when it was last deployed.
 */
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  // Same reasoning as the dated form: one link, one evening, nothing for
  // search to do here.
  robots: { index: false, follow: false },
};

export default function FeedbackIndexPage() {
  redirect(`/feedback/${currentSessionSlug()}`);
}
