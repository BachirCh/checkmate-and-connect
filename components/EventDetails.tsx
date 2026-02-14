export default function EventDetails() {
  return (
    <section id="event-details" className="w-full bg-black py-16 sm:py-24 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-white">
          Join Us
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* When Card */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 hover:border-gray-700 transition-colors">
            <div className="text-4xl mb-4">📅</div>
            <h3 className="text-xl font-semibold mb-2 text-white">When</h3>
            <p className="text-lg font-medium text-white">Every Wednesday</p>
            <p className="text-gray-400">6:00 PM</p>
          </div>

          {/* Where Card - with embedded Google Maps */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 hover:border-gray-700 transition-colors">
            <div className="text-4xl mb-4">📍</div>
            <h3 className="text-xl font-semibold mb-2 text-white">Where</h3>
            <p className="text-lg font-medium text-white mb-3">Commons</p>
            <a
              href="https://maps.app.goo.gl/K9id6TktfPycE6Bt8"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-white text-black text-sm font-medium rounded hover:bg-gray-200 transition-colors"
            >
              View on Google Maps
            </a>
          </div>

          {/* Who Card */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 hover:border-gray-700 transition-colors">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-semibold mb-2 text-white">Who</h3>
            <p className="text-lg font-medium text-white">200+ Members</p>
            <p className="text-gray-400">Chess players & entrepreneurs</p>
          </div>
        </div>
      </div>
    </section>
  );
}
