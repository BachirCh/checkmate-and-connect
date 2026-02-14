'use client';

export default function MeetupWidget() {
  return (
    <section className="py-12 sm:py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">Upcoming Events</h2>

        {/* Replace URL with your Meetup group's embed URL from meetup.com/your-group */}
        <iframe
          src="https://meeter.com/checkmate-connect"
          loading="lazy"
          width="100%"
          height="400"
          title="Upcoming Checkmate & Connect Events"
          className="border-0 rounded-lg"
        />

        <div className="text-center mt-4">
          <a
            href="https://meeter.com/checkmate-connect"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            View all events on Meetup
          </a>
        </div>
      </div>
    </section>
  );
}
