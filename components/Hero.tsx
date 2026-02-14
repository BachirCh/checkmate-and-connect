export default function Hero() {
  return (
    <section className="w-full bg-black text-white border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:py-24 lg:py-32 text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
          Checkmate & Connect
          <span className="block text-3xl sm:text-4xl lg:text-5xl mt-2 text-gray-400">
            Every Wednesday
          </span>
        </h1>
        <p className="text-xl sm:text-2xl text-gray-300 mb-8">
          Chess & Entrepreneurship Community
        </p>
        <a
          href="#event-details"
          className="inline-block bg-white text-black font-semibold px-8 py-4 rounded-lg text-lg hover:bg-gray-200 transition-colors shadow-lg"
        >
          Join Our Next Meetup
        </a>
      </div>
    </section>
  );
}
