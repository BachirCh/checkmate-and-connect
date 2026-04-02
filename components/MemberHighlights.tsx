import { client } from '@/lib/sanity/client';
import TeamSection from '@/components/TeamSection';

type Member = {
  _id: string;
  name: string;
  slug: { current: string };
  photo: any;
  jobTitle: string;
  company?: string;
  linkedIn?: string;
};

export default async function MemberHighlights() {
  // Fetch recent approved members from Sanity
  // CRITICAL: Include status=="approved" filter for privacy compliance
  const query = `*[_type == "member" && status == "approved"] | order(approvedAt desc) [0...8] {
    _id,
    name,
    slug,
    photo,
    jobTitle,
    company,
    linkedIn
  }`;

  const recentMembers: Member[] = await client.fetch(query);

  // Handle empty state if no approved members exist
  if (recentMembers.length === 0) {
    return (
      <section className="w-full bg-black py-16 sm:py-24 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">
              Meet Our Community
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Our member directory will launch soon!
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full bg-black py-16 sm:py-24 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4">
        <TeamSection
          members={recentMembers}
          title="Meet Our Community"
          description="From chess enthusiasts to startup founders, our community brings together strategic minds from diverse backgrounds."
          showSeeAllButton={true}
        />
      </div>
    </section>
  );
}
