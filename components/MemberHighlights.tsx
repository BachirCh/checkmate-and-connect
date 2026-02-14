import Link from 'next/link';

export default function MemberHighlights() {
  // Placeholder member data - in production this would come from Sanity
  const recentMembers = [
    {
      id: 1,
      name: 'Sarah Martinez',
      role: 'Tech Entrepreneur',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    },
    {
      id: 2,
      name: 'Ahmed El Fassi',
      role: 'Chess Master',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    },
    {
      id: 3,
      name: 'Fatima Zahra',
      role: 'Startup Founder',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop',
    },
    {
      id: 4,
      name: 'Omar Bennis',
      role: 'Angel Investor',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    },
  ];

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
          {recentMembers.map((member) => (
            <div
              key={member.id}
              className="group relative overflow-hidden rounded-xl aspect-square bg-gray-900 border border-gray-800 hover:border-gray-700 transition-all"
            >
              <img
                src={member.image}
                alt={member.name}
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white font-semibold text-sm mb-1">{member.name}</p>
                  <p className="text-gray-300 text-xs">{member.role}</p>
                </div>
              </div>
            </div>
          ))}
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
