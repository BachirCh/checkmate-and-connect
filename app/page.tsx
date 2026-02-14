import Hero from '@/components/Hero';
import EventDetails from '@/components/EventDetails';
import CommunityStats from '@/components/CommunityStats';
import Footer from '@/components/Footer';

// Calculate next Wednesday at 6pm Casablanca time (UTC+1)
function getNextWednesdayAt6PM(): string {
  const now = new Date();
  const casablancaOffset = 1; // UTC+1

  // Get current day (0 = Sunday, 3 = Wednesday)
  const currentDay = now.getUTCDay();
  const currentHour = now.getUTCHours() + casablancaOffset;

  // Calculate days until next Wednesday
  let daysUntilWednesday = (3 - currentDay + 7) % 7;

  // If today is Wednesday and it's before 6pm Casablanca time, use today
  if (currentDay === 3 && currentHour < 18) {
    daysUntilWednesday = 0;
  }
  // If we calculated 0 but it's past 6pm, move to next week
  else if (daysUntilWednesday === 0) {
    daysUntilWednesday = 7;
  }

  const nextWednesday = new Date(now);
  nextWednesday.setUTCDate(now.getUTCDate() + daysUntilWednesday);
  nextWednesday.setUTCHours(17, 0, 0, 0); // 6pm Casablanca = 17:00 UTC

  return nextWednesday.toISOString();
}

export default function Home() {
  const eventSchema = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: 'Checkmate & Connect Weekly Meetup',
    description: 'Join 200+ members for chess and entrepreneurship networking',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    location: {
      '@type': 'Place',
      name: 'Commons',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Casablanca',
        addressCountry: 'MA',
      },
    },
    startDate: getNextWednesdayAt6PM(),
    organizer: {
      '@type': 'Organization',
      name: 'Checkmate & Connect',
      url: 'https://checkmateconnect.com',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }}
      />
      <Hero />
      <EventDetails />
      <CommunityStats />
      <Footer />
    </>
  );
}
