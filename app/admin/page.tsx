import { verifySession } from '@/lib/auth/dal';

export default async function AdminDashboard() {
  // Verify admin session (redirects if not authenticated/authorized)
  const session = await verifySession();

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
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 className="text-sm font-medium text-gray-400 mb-2">Pending Members</h2>
          <p className="text-3xl font-bold">-</p>
          <p className="text-xs text-gray-500 mt-2">Awaiting approval</p>
        </div>

        {/* Total Members */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 className="text-sm font-medium text-gray-400 mb-2">Total Members</h2>
          <p className="text-3xl font-bold">-</p>
          <p className="text-xs text-gray-500 mt-2">All approved members</p>
        </div>

        {/* Recent Activity (placeholder) */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 className="text-sm font-medium text-gray-400 mb-2">Recent Activity</h2>
          <p className="text-3xl font-bold">-</p>
          <p className="text-xs text-gray-500 mt-2">Last 7 days</p>
        </div>
      </div>

      {/* Placeholder content */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <p className="text-gray-400 text-sm">
          Member management features will be available in Phase 5.
        </p>
      </div>
    </div>
  );
}
