import { client } from '@/lib/sanity/client';
import { upcomingEventsQuery, allEventsQuery } from '@/lib/sanity/queries';
import EventCard from '@/components/EventCard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Events | Checkmate & Connect',
  description: 'Upcoming and past events for the Checkmate & Connect community in Casablanca',
};

export default async function EventsPage() {
  // Fetch both queries in parallel
  const [upcomingEvents, allEvents] = await Promise.all([
    client.fetch(upcomingEventsQuery),
    client.fetch(allEventsQuery),
  ]);

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Upcoming Events Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Upcoming Events</h1>
          <p className="text-gray-400">
            Join us for upcoming chess and entrepreneurship events
          </p>
        </div>
        {upcomingEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((event: any) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No upcoming events scheduled. Check back soon!</p>
        )}
      </section>

      {/* All Events Section */}
      <section className="max-w-7xl mx-auto px-4 py-16 border-t border-gray-800">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">All Events</h2>
          <p className="text-gray-400">Browse our complete event history</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allEvents.map((event: any) => (
            <EventCard key={event._id} event={event} showStatus />
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="bg-gray-900 rounded-lg p-8 border border-gray-800 text-center">
          <h3 className="text-2xl font-bold mb-4">Want to organize an event?</h3>
          <p className="text-gray-400 mb-6">
            Submit your event idea and our team will review it for the community calendar
          </p>
          <a
            href="/events/submit"
            className="inline-block px-6 py-3 bg-white text-black rounded hover:bg-gray-200 transition-colors font-medium"
          >
            Submit an Event
          </a>
        </div>
      </section>
    </main>
  );
}
