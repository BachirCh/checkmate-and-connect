import { verifySession } from '@/lib/auth/dal';
import { client } from '@/lib/sanity/client';
import Link from 'next/link';

export default async function AdminDashboard() {
  // Verify admin session (redirects if not authenticated/authorized)
  const session = await verifySession();

  // Fetch real member statistics in parallel
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const [pendingCount, approvedCount, recentCount] = await Promise.all([
    client.fetch<number>(`count(*[_type == "member" && status == "pending"])`),
    client.fetch<number>(`count(*[_type == "member" && status == "approved"])`),
    client.fetch<number>(`count(*[_type == "member" && approvedAt > $weekAgo])`, {
      weekAgo,
    }),
  ]);

  return (
    <div className="space-y-8">
      {/* Welcome message */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-400">Welcome, {session.email}</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Pending Members */}
        <Link href="/admin/members?status=pending">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors cursor-pointer">
            <h2 className="text-sm font-medium text-gray-400 mb-2">Pending Members</h2>
            <p className="text-3xl font-bold">{pendingCount}</p>
            <p className="text-xs text-gray-500 mt-2">Awaiting approval</p>
          </div>
        </Link>

        {/* Total Members */}
        <Link href="/admin/members?status=approved">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors cursor-pointer">
            <h2 className="text-sm font-medium text-gray-400 mb-2">Total Members</h2>
            <p className="text-3xl font-bold">{approvedCount}</p>
            <p className="text-xs text-gray-500 mt-2">All approved members</p>
          </div>
        </Link>

        {/* Recent Activity */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 className="text-sm font-medium text-gray-400 mb-2">Recent Activity</h2>
          <p className="text-3xl font-bold">{recentCount}</p>
          <p className="text-xs text-gray-500 mt-2">Last 7 days</p>
        </div>
      </div>

      {/* Quick Actions - Pending Review */}
      {pendingCount > 0 && (
        <div className="bg-gray-900 border border-blue-600 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-2">Pending Review</h2>
          <p className="text-gray-400 text-sm mb-4">
            {pendingCount} {pendingCount === 1 ? 'member' : 'members'} waiting for approval
          </p>
          <Link
            href="/admin/members?status=pending"
            className="inline-block px-4 py-2 bg-white text-black font-medium rounded hover:bg-gray-200 transition-colors"
          >
            Review Submissions
          </Link>
        </div>
      )}
    </div>
  );
}
