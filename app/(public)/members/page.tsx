import { client } from '@/lib/sanity/client';
import TeamSection from '@/components/TeamSection';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Member Directory | Checkmate & Connect',
  description: 'Browse our community of entrepreneurs, chess enthusiasts, and strategic thinkers in Casablanca.',
};

type Member = {
  _id: string;
  name: string;
  slug: { current: string };
  photo: any;
  jobTitle: string;
  company?: string;
  linkedIn?: string;
  approvedAt: string;
};

export default async function MembersPage() {
  // Fetch approved members from Sanity - CRITICAL: status filter for privacy compliance
  const query = `*[_type == "member" && status == "approved"] | order(approvedAt desc) {
    _id,
    name,
    slug,
    photo,
    jobTitle,
    company,
    linkedIn,
    approvedAt
  }`;

  const members: Member[] = await client.fetch(query);

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Member Directory
          </h1>
          <p className="text-[#9ca3af] text-lg">
            {members.length > 0
              ? `Showing ${members.length} member${members.length === 1 ? '' : 's'}`
              : 'No approved members yet. Check back soon!'}
          </p>
        </div>

        {/* Member Grid */}
        {members.length > 0 ? (
          <TeamSection members={members} />
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">
              No approved members yet. Check back soon!
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
