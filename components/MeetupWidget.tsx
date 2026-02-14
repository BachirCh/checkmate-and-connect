'use client';

export default function MeetupWidget() {
  return (
    <section className="py-12 sm:py-16 px-4 bg-black border-b border-gray-800">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center text-white">Upcoming Events</h2>

        <iframe
          src="https://www.meetup.com/checkmate-connect-club-casablanca-chapter/"
          loading="lazy"
          width="100%"
          height="400"
          title="Upcoming Checkmate & Connect Events"
          className="border-0 rounded-lg bg-white"
        />

        <div className="text-center mt-4">
          <a
            href="https://www.meetup.com/checkmate-connect-club-casablanca-chapter/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors"
          >
            View all events on Meetup
          </a>
        </div>
      </div>
    </section>
  );
}
