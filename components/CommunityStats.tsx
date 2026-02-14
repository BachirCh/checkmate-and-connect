export default function CommunityStats() {
  return (
    <section className="w-full bg-black py-16 sm:py-24 border-b border-gray-800">
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8 text-white">
          What is Checkmate & Connect?
        </h2>
        <div className="space-y-6 text-lg text-gray-300 leading-relaxed">
          <p>
            Checkmate & Connect is where chess meets business networking. Every Wednesday evening,
            chess enthusiasts and entrepreneurs gather at Commons in Casablanca to play chess,
            share ideas, and build meaningful connections.
          </p>
          <p>
            With over 2 years of consistent weekly meetups, we've grown into a vibrant community
            of 200+ members. Whether you're a chess grandmaster or just learning the game, a
            seasoned entrepreneur or an aspiring founder, you'll find your place here.
          </p>
          <p>
            Our community thrives on the intersection of strategic thinking and entrepreneurial
            spirit. Come for the chess, stay for the conversations, connections, and community.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-6 mt-12 text-center">
          <div>
            <div className="text-4xl sm:text-5xl font-bold text-white mb-2">2+</div>
            <div className="text-sm sm:text-base text-gray-500 uppercase tracking-wide">Years Running</div>
          </div>
          <div>
            <div className="text-4xl sm:text-5xl font-bold text-white mb-2">200+</div>
            <div className="text-sm sm:text-base text-gray-500 uppercase tracking-wide">Members</div>
          </div>
          <div>
            <div className="text-4xl sm:text-5xl font-bold text-white mb-2">Weekly</div>
            <div className="text-sm sm:text-base text-gray-500 uppercase tracking-wide">Meetups</div>
          </div>
        </div>
      </div>
    </section>
  );
}
