export default function Hero() {
  return (
    <section className="w-full bg-gradient-to-br from-gray-900 to-blue-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:py-24 lg:py-32 text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
          Checkmate & Connect
        </h1>
        <p className="text-xl sm:text-2xl lg:text-3xl text-gray-200 mb-6">
          Chess & Entrepreneurship Community
        </p>
        <p className="text-lg sm:text-xl text-gray-300 mb-8">
          Join 200+ members every Wednesday in Casablanca
        </p>
        <a
          href="#event-details"
          className="inline-block bg-white text-blue-900 font-semibold px-8 py-4 rounded-lg text-lg hover:bg-gray-100 transition-colors shadow-lg"
        >
          Join Our Next Meetup
        </a>
      </div>
    </section>
  );
}
