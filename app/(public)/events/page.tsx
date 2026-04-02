import { client } from '@/lib/sanity/client';
import { upcomingEventsQuery, allEventsQuery } from '@/lib/sanity/queries';
import EventCard from '@/components/EventCard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Events | Checkmate & Connect',
  description: 'Upcoming and past events for the Checkmate & Connect community in Casablanca',
};

export default async function EventsPage() {
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
          <p className="text-[#9ca3af]">
            Join us for upcoming chess and entrepreneurship events
          </p>
        </div>
        {upcomingEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {upcomingEvents.map((event: any) => (
              <EventCard key={event._id} event={event} variant="featured" />
            ))}
          </div>
        ) : (
          <p className="text-[#9ca3af]">No upcoming events scheduled. Check back soon!</p>
        )}
      </section>

      {/* All Events Section */}
      <section className="max-w-7xl mx-auto px-4 py-16 border-t border-[#333333]">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">All Events</h2>
          <p className="text-[#9ca3af]">Browse our complete event history</p>
        </div>
        <div className="space-y-3">
          {allEvents.map((event: any) => (
            <EventCard key={event._id} event={event} showStatus variant="compact" />
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="bg-[#1a1a1a] rounded-lg p-8 border border-[#333333] text-center">
          <h3 className="text-2xl font-bold mb-4">Want to organize an event?</h3>
          <p className="text-[#9ca3af] mb-6">
            Submit your event idea and our team will review it for the community calendar
          </p>
          <a
            href="/events/submit"
            className="inline-block px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-semibold"
          >
            Submit an Event
          </a>
        </div>
      </section>
    </main>
  );
}
