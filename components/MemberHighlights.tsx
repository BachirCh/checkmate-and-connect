import Link from 'next/link';
import { client } from '@/lib/sanity/client';
import { urlFor } from '@/lib/sanity/imageUrl';

type Member = {
  _id: string;
  name: string;
  slug: { current: string };
  photo: any;
  jobTitle: string;
};

export default async function MemberHighlights() {
  // Fetch recent approved members from Sanity
  // CRITICAL: Include status=="approved" filter for privacy compliance
  const query = `*[_type == "member" && status == "approved"] | order(approvedAt desc) [0...8] {
    _id,
    name,
    slug,
    photo,
    jobTitle
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
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">
            Meet Our Community
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            From chess enthusiasts to startup founders, our community brings together
            strategic minds from diverse backgrounds.
          </p>
        </div>

        {/* Member Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          {recentMembers.map((member) => {
            const imageUrl = member.photo
              ? urlFor(member.photo)
                  .width(400)
                  .height(400)
                  .fit('crop')
                  .auto('format')
                  .url()
              : null;

            return (
              <div
                key={member._id}
                className="group relative overflow-hidden rounded-xl aspect-square bg-gray-900 border border-gray-800 hover:border-gray-700 transition-all"
              >
                {imageUrl && (
                  <img
                    src={imageUrl}
                    alt={member.name}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-white font-semibold text-sm mb-1">
                      {member.name}
                    </p>
                    <p className="text-gray-300 text-xs">{member.jobTitle}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* See All Button */}
        <div className="text-center">
          <Link
            href="/members"
            className="inline-block bg-white text-black font-semibold px-8 py-3 rounded-lg hover:bg-gray-200 transition-colors"
          >
            See All Members
          </Link>
        </div>
      </div>
    </section>
  );
}
