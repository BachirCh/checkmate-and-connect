/**
 * Single source of truth for facts that appear in copy, metadata and JSON-LD.
 *
 * Every value here is verifiable: the community, the venue, the schedule.
 * Nothing aspirational. If a number changes (member count especially), change
 * it here and it updates the page, the structured data and the AI-readable
 * summary at once.
 */
export const site = {
  name: 'Checkmate & Connect',
  shortName: 'C&C',
  tagline: 'Where innovation meets opportunity',
  url: 'https://checkmate.ma',
  locale: 'en_US',

  description:
    "Checkmate & Connect brings founders, investors and builders together in the same room, every week, in Casablanca. Free to attend, open to anyone.",

  // Weekly meetup facts, used in copy and in Event structured data
  event: {
    weekday: 3, // Wednesday
    startHour: 18, // 18:00 Casablanca (UTC+1)
    venueName: 'Commons Zerktouni',
    addressLocality: 'Casablanca',
    addressCountry: 'MA',
    mapsUrl: 'https://maps.app.goo.gl/K9id6TktfPycE6Bt8',
  },

  stats: {
    members: '400+',
    cadence: 'Weekly',
    price: 'Free',
    venue: 'Commons Zerktouni',
  },

  social: {
    linkedin: 'https://www.linkedin.com/company/checkmate-connect-club/',
    instagram: 'https://www.instagram.com/checkmateandconnect',
  },

  // The two ways to reach an organiser. LinkedIn is the primary channel;
  // WhatsApp is the fallback for people who want a direct line.
  contact: {
    linkedinMessage: 'https://www.linkedin.com/company/checkmate-connect-club/',
    whatsappNumber: '+212 653-652574',
    whatsappUrl: 'https://wa.me/212653652574',
    responseTime: 'We usually reply within a few hours, same day.',
  },
} as const;

/**
 * Next Wednesday at 18:00 Casablanca time, as an ISO string.
 *
 * Casablanca is UTC+1 year-round (Morocco suspended DST changes for the
 * standard case), so 18:00 local is 17:00 UTC.
 */
export function nextMeetupISO(from: Date = new Date()): string {
  const CASABLANCA_OFFSET_HOURS = 1;
  const localHour = from.getUTCHours() + CASABLANCA_OFFSET_HOURS;
  const currentDay = from.getUTCDay();

  let daysAhead = (site.event.weekday - currentDay + 7) % 7;
  if (daysAhead === 0 && localHour >= site.event.startHour) {
    daysAhead = 7;
  }

  const next = new Date(from);
  next.setUTCDate(from.getUTCDate() + daysAhead);
  next.setUTCHours(site.event.startHour - CASABLANCA_OFFSET_HOURS, 0, 0, 0);
  return next.toISOString();
}
