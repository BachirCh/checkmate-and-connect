import { verifySession } from '@/lib/auth/dal';
import { client } from '@/lib/sanity/client';
import FilterTabs from './components/FilterTabs';
import MemberTable from './components/MemberTable';

type SearchParams = {
  status?: 'pending' | 'approved' | 'rejected';
  sort?: 'newest' | 'oldest' | 'name';
};

type Props = {
  searchParams: Promise<SearchParams>;
};

export default async function MemberManagementPage({ searchParams }: Props) {
  // Verify admin session (redirects if not authenticated/authorized)
  await verifySession();

  // Get filter parameters from URL (await in Next.js 16)
  const params = await searchParams;
  const status = params.status || 'pending';
  const sort = params.sort || 'newest';

  // Build GROQ query with dynamic status filter and sort order
  const sortOrder =
    sort === 'name'
      ? 'order(name asc)'
      : sort === 'oldest'
        ? 'order(submittedAt asc)'
        : 'order(submittedAt desc)';

  const query = `*[_type == "member" && status == $status] | ${sortOrder} {
    _id,
    name,
    slug,
    photo,
    jobTitle,
    company,
    linkedIn,
    status,
    submittedAt,
    approvedAt
  }`;

  const members = await client.fetch(query, { status });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Member Management</h1>
          <p className="text-gray-400">
            {members.length} {status} {members.length === 1 ? 'member' : 'members'}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <FilterTabs />

      {/* Member Table */}
      <MemberTable members={members} status={status} />
    </div>
  );
}
