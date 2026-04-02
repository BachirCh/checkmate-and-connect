import { verifySession } from '@/lib/auth/dal';
import { client } from '@/lib/sanity/client';
import Link from 'next/link';

export default async function AdminDashboard() {
  const session = await verifySession();

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const [memberStats, eventStats, pendingMembers, recentEventsList] = await Promise.all([
    Promise.all([
      client.fetch<number>(`count(*[_type == "member" && status == "pending"])`),
      client.fetch<number>(`count(*[_type == "member" && status == "approved"])`),
      client.fetch<number>(`count(*[_type == "member" && approvedAt > $weekAgo])`, { weekAgo }),
    ]),
    Promise.all([
      client.fetch<number>(`count(*[_type == "event" && status == "pending"])`),
      client.fetch<number>(`count(*[_type == "event" && status == "approved"])`),
      client.fetch<number>(
        `count(*[_type == "event" && defined(submittedAt) && submittedAt > $weekAgo])`,
        { weekAgo }
      ),
    ]),
    client.fetch<{ _id: string; name: string; jobTitle: string; _createdAt: string }[]>(
      `*[_type == "member" && status == "pending"] | order(_createdAt desc) [0...4] { _id, name, jobTitle, _createdAt }`
    ),
    client.fetch<{ _id: string; title: string; author: string; _createdAt: string }[]>(
      `*[_type == "event"] | order(_createdAt desc) [0...4] { _id, title, author, _createdAt }`
    ),
  ]);

  const [pendingCount, approvedCount, recentCount] = memberStats;
  const [pendingEvents, approvedEvents, recentEvents] = eventStats;

  return (
    <div className="space-y-8">
      {/* Welcome message */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-[#9ca3af]">Welcome, {session.email}</p>
      </div>

      {/* Member Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/admin/members?status=pending">
          <div className="bg-[#1a1a1a] border border-[#333333] rounded-lg p-6 hover:border-white/30 transition-colors cursor-pointer">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">⏳</span>
              <h2 className="text-sm font-medium text-[#9ca3af]">Pending Members</h2>
            </div>
            <p className="text-4xl font-bold">{pendingCount}</p>
            <p className="text-xs text-gray-500 mt-2">Awaiting approval</p>
          </div>
        </Link>

        <Link href="/admin/members?status=approved">
          <div className="bg-[#1a1a1a] border border-[#333333] rounded-lg p-6 hover:border-white/30 transition-colors cursor-pointer">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">👥</span>
              <h2 className="text-sm font-medium text-[#9ca3af]">Total Members</h2>
            </div>
            <p className="text-4xl font-bold">{approvedCount}</p>
            <p className="text-xs text-gray-500 mt-2">All approved members</p>
          </div>
        </Link>

        <div className="bg-[#1a1a1a] border border-[#333333] rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">📈</span>
            <h2 className="text-sm font-medium text-[#9ca3af]">Recent Activity</h2>
          </div>
          <p className="text-4xl font-bold">{recentCount}</p>
          <p className="text-xs text-gray-500 mt-2">Last 7 days</p>
        </div>
      </div>

      {/* Pending Members Preview */}
      {pendingMembers.length > 0 && (
        <div className="bg-[#1a1a1a] border border-[#333333] rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Pending Review</h2>
            <Link
              href="/admin/members?status=pending"
              className="text-sm text-[#9ca3af] hover:text-white transition-colors"
            >
              View all →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#333333]">
                  <th className="text-left py-2 text-[#9ca3af] font-medium">Name</th>
                  <th className="text-left py-2 text-[#9ca3af] font-medium">Role</th>
                  <th className="text-left py-2 text-[#9ca3af] font-medium">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {pendingMembers.map((member) => (
                  <tr key={member._id} className="border-b border-[#333333]/50 last:border-0">
                    <td className="py-3 text-white">{member.name}</td>
                    <td className="py-3 text-gray-400">{member.jobTitle}</td>
                    <td className="py-3 text-gray-500">
                      {new Date(member._createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Events Section */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Events</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-[#1a1a1a] p-6 rounded-lg border border-[#333333]">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">📋</span>
              <p className="text-[#9ca3af] text-sm">Pending Review</p>
            </div>
            <p className="text-4xl font-bold">{pendingEvents}</p>
          </div>
          <div className="bg-[#1a1a1a] p-6 rounded-lg border border-[#333333]">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">✅</span>
              <p className="text-[#9ca3af] text-sm">Approved</p>
            </div>
            <p className="text-4xl font-bold">{approvedEvents}</p>
          </div>
          <div className="bg-[#1a1a1a] p-6 rounded-lg border border-[#333333]">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">🆕</span>
              <p className="text-[#9ca3af] text-sm">Recent Submissions</p>
            </div>
            <p className="text-4xl font-bold">{recentEvents}</p>
            <p className="text-gray-500 text-xs mt-1">Last 7 days</p>
          </div>
        </div>
        {pendingEvents > 0 && (
          <Link
            href="/admin/events?status=pending"
            className="inline-block px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Review {pendingEvents} Pending {pendingEvents === 1 ? 'Event' : 'Events'}
          </Link>
        )}
      </section>

      {/* Recent Events Preview */}
      {recentEventsList.length > 0 && (
        <div className="bg-[#1a1a1a] border border-[#333333] rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Events</h2>
            <Link
              href="/admin/events"
              className="text-sm text-[#9ca3af] hover:text-white transition-colors"
            >
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {recentEventsList.map((event) => (
              <div key={event._id} className="flex items-center justify-between py-2 border-b border-[#333333]/50 last:border-0">
                <div>
                  <p className="text-white text-sm font-medium">{event.title}</p>
                  <p className="text-gray-500 text-xs">by {event.author}</p>
                </div>
                <p className="text-gray-500 text-xs">
                  {new Date(event._createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
