import { verifySession } from '@/lib/auth/dal';
import { client } from '@/lib/sanity/client';
import FilterTabs from './components/FilterTabs';
import EventTable from './components/EventTable';

type SearchParams = {
  status?: 'all' | 'pending' | 'approved' | 'rejected';
};

type Props = {
  searchParams: Promise<SearchParams>;
};

export default async function EventManagementPage({ searchParams }: Props) {
  // Verify admin session (redirects if not authenticated/authorized)
  await verifySession();

  // Get filter parameters from URL (await in Next.js 16)
  const params = await searchParams;
  const status = params.status || 'all';

  // Build GROQ query with dynamic status filter
  let query: string;
  let queryParams: any = {};

  if (status === 'all') {
    query = `*[_type == "event"] | order(submittedAt desc) {
      _id,
      title,
      slug,
      image,
      description,
      eventType,
      eventDateTime,
      recurrencePattern,
      author,
      status,
      submittedAt
    }`;
  } else {
    query = `*[_type == "event" && status == $status] | order(submittedAt desc) {
      _id,
      title,
      slug,
      image,
      description,
      eventType,
      eventDateTime,
      recurrencePattern,
      author,
      status,
      submittedAt
    }`;
    queryParams = { status };
  }

  const events = await client.fetch(query, queryParams);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Event Management</h1>
          <p className="text-gray-400">
            {events.length} {status !== 'all' ? status : ''} {events.length === 1 ? 'event' : 'events'}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <FilterTabs />

      {/* Event Table */}
      <EventTable events={events} status={status} />
    </div>
  );
}
