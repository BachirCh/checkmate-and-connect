export default function EventDetails() {
  return (
    <section id="event-details" className="w-full bg-gray-50 py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-gray-900">
          Join Us
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* When Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="text-4xl mb-4">📅</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">When</h3>
            <p className="text-lg font-medium text-blue-600">Every Wednesday</p>
            <p className="text-gray-600">6:00 PM</p>
          </div>

          {/* Where Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="text-4xl mb-4">📍</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">Where</h3>
            <p className="text-lg font-medium text-blue-600">Commons</p>
            <p className="text-gray-600">Casablanca, Morocco</p>
          </div>

          {/* Who Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">Who</h3>
            <p className="text-lg font-medium text-blue-600">200+ Members</p>
            <p className="text-gray-600">Chess players & entrepreneurs</p>
          </div>
        </div>
      </div>
    </section>
  );
}
