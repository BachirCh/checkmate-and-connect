import Link from 'next/link';
import { verifySession } from '@/lib/auth/dal';
import { client } from '@/lib/sanity/client';
import { formatEventDate, toEventSlug } from '@/lib/event-date';
import { upcomingMeetupDates } from '@/lib/site';
import CopyLink from './CopyLink';

// Feedback arrives while the page is being looked at, so never serve a cache.
export const dynamic = 'force-dynamic';

type Row = { eventDate: string };

export default async function FeedbackSessionsPage() {
  await verifySession();

  const rows = await client.fetch<Row[]>(
    `*[_type == "eventFeedback" && defined(eventDate)]{ eventDate }`
  );

  // Grouping in JS rather than GROQ: the response count is in the low
  // thousands at most, and GROQ has no group-by worth the contortion.
  const counts = new Map<string, number>();
  for (const row of rows) {
    counts.set(row.eventDate, (counts.get(row.eventDate) ?? 0) + 1);
  }
  const sessions = [...counts.entries()]
    .map(([eventDate, count]) => ({ eventDate, count }))
    .sort((a, b) => b.eventDate.localeCompare(a.eventDate));

  const total = rows.length;
  const nextWednesday = upcomingMeetupDates(1)[0];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-2 text-3xl font-bold">Feedback</h1>
        <p className="text-gray-400">
          {total} {total === 1 ? 'response' : 'responses'} across{' '}
          {sessions.length} {sessions.length === 1 ? 'session' : 'sessions'}
        </p>
      </div>

      {/* Share link for the next Wednesday */}
      <div className="rounded-lg border border-[#333333] bg-[#1a1a1a] p-6">
        <h2 className="text-sm font-medium text-[#9ca3af]">
          Share this with participants
        </h2>
        <p className="mb-4 mt-1 text-lg font-semibold">
          {nextWednesday.label}
        </p>
        <CopyLink path={`/feedback/${toEventSlug(nextWednesday.value)}`} />
        <p className="mt-3 text-xs text-gray-500">
          Any date works — swap the six digits for DDMMYY of the session you want.
        </p>
      </div>

      {/* Sessions */}
      {sessions.length === 0 ? (
        <div className="rounded-lg border border-[#333333] bg-[#1a1a1a] p-8 text-center">
          <p className="text-gray-400">
            No feedback yet. Share the link above on Wednesday.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {sessions.map((session) => (
            <li key={session.eventDate}>
              <Link
                href={`/admin/feedback/${toEventSlug(session.eventDate)}`}
                className="flex items-center justify-between rounded-lg border border-[#333333] bg-[#1a1a1a] p-5 transition-colors hover:border-white/30"
              >
                <span>
                  <span className="block font-semibold">
                    {formatEventDate(session.eventDate)}
                  </span>
                  <span className="mt-1 block text-xs text-gray-500">
                    {session.eventDate}
                  </span>
                </span>
                <span className="text-sm text-[#9ca3af]">
                  {session.count} {session.count === 1 ? 'response' : 'responses'}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
