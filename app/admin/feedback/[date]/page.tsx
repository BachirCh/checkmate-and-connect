import Link from 'next/link';
import { notFound } from 'next/navigation';
import { verifySession } from '@/lib/auth/dal';
import { client } from '@/lib/sanity/client';
import { formatEventDate, parseEventSlug, toEventSlug } from '@/lib/event-date';
import CopyLink from '../CopyLink';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ date: string }> };

type Response = {
  _id: string;
  fullName?: string;
  liked: string;
  improve: string;
  submittedAt?: string;
};

export default async function FeedbackSessionPage({ params }: Props) {
  await verifySession();

  const { date } = await params;
  const isoDate = parseEventSlug(date);
  if (!isoDate) notFound();

  const responses = await client.fetch<Response[]>(
    `*[_type == "eventFeedback" && eventDate == $eventDate]
       | order(submittedAt desc)
       { _id, fullName, liked, improve, submittedAt }`,
    { eventDate: isoDate }
  );

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/feedback"
          className="text-sm text-[#9ca3af] transition-colors hover:text-white"
        >
          ← All sessions
        </Link>
        <h1 className="mb-2 mt-3 text-3xl font-bold">
          {formatEventDate(isoDate)}
        </h1>
        <p className="text-gray-400">
          {responses.length}{' '}
          {responses.length === 1 ? 'response' : 'responses'}
        </p>
      </div>

      <div className="rounded-lg border border-[#333333] bg-[#1a1a1a] p-6">
        <h2 className="mb-4 text-sm font-medium text-[#9ca3af]">
          Form link for this session
        </h2>
        <CopyLink path={`/feedback/${toEventSlug(isoDate)}`} />
      </div>

      {responses.length === 0 ? (
        <div className="rounded-lg border border-[#333333] bg-[#1a1a1a] p-8 text-center">
          <p className="text-gray-400">Nothing submitted for this date yet.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {responses.map((response) => (
            <li
              key={response._id}
              className="rounded-lg border border-[#333333] bg-[#1a1a1a] p-6"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-semibold">{response.fullName || 'Anonymous'}</h3>
                {response.submittedAt ? (
                  <time
                    dateTime={response.submittedAt}
                    className="text-xs text-gray-500"
                  >
                    {new Intl.DateTimeFormat('en-GB', {
                      hour: '2-digit',
                      minute: '2-digit',
                      day: 'numeric',
                      month: 'short',
                      timeZone: 'Africa/Casablanca',
                    }).format(new Date(response.submittedAt))}
                  </time>
                ) : null}
              </div>

              {/* Keep and change side by side: the point of reading these is
                  the contrast, not either column on its own. */}
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-md border border-[#4ade80]/25 bg-[#4ade80]/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#4ade80]">
                    ✓ Worked
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-gray-200">
                    {response.liked}
                  </p>
                </div>
                <div className="rounded-md border border-[#ff6b6b]/25 bg-[#ff6b6b]/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#ff6b6b]">
                    ✕ To improve
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-gray-200">
                    {response.improve}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
