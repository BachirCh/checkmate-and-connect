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
    mapsUrl: 'https://maps.app.goo.gl/SY56R4Lpy5LTWxTZ7',
  },

  stats: {
    members: '400+',
    cadence: 'Weekly',
    price: 'Free',
    venue: 'Commons Zerktouni, Casa',
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

export type MeetupDateOption = {
  /** ISO calendar date, e.g. '2026-09-02'. What gets stored. */
  value: string;
  /** e.g. 'Wednesday 2 September'. What the visitor reads. */
  label: string;
};

/** 'Wednesday 2 September' — no leading zero, no year, no comma. */
export function formatMeetupDate(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  }).format(date);
}

/**
 * The next `count` Wednesdays, starting from the one people could still turn
 * up to — nextMeetupISO() rolls over once a Wednesday's 18:00 has passed, so
 * nobody is offered a date that has already happened.
 *
 * Recomputed on the server for every submission as well as for the form, so a
 * stale page cannot smuggle in an expired date.
 */
export function upcomingMeetupDates(
  count = 4,
  from: Date = new Date()
): MeetupDateOption[] {
  const first = new Date(nextMeetupISO(from));

  return Array.from({ length: count }, (_, i) => {
    const date = new Date(first);
    date.setUTCDate(first.getUTCDate() + i * 7);
    return {
      // nextMeetupISO() lands at 17:00 UTC, so the UTC day is still the
      // Wednesday itself and slicing the ISO string is safe.
      value: date.toISOString().slice(0, 10),
      label: formatMeetupDate(date),
    };
  });
}
